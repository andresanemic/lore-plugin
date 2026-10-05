import { readFile } from "node:fs/promises";
import {
  closeOperation,
  calibrateEstimates,
  dispatchTask,
  holdOperation,
  integrateTask,
  observeTask,
  operationEntry,
  planTask,
  readOperation,
  receiveTask,
  resumeOperation,
  reviewTask,
  taskSummary,
  verifyTask,
} from "../skills/vespi/core/vespi.mjs";
import { attemptWall, operationStatePath, saveOperationState, transitionArtifact } from "../skills/vespi/core/operation-state.mjs";
import { readCalibrationSeed } from "../skills/vespi/core/calibration-seed.mjs";

const COMMANDS = [
  "entry",
  "hold",
  "authorize",
  "pause",
  "plan",
  "dispatch",
  "observe",
  "receive",
  "review",
  "verify",
  "integrate",
  "close",
  "status",
  "resume",
];

// El codigo con el que la puerta dice que hay algo abierto. No es 1 (un fallo) ni 2 (no entiendo el
// comando): es una respuesta, y tiene que poder distinguirse de las dos para que quien la invoca no
// la confunda con que la CLI se rompio.
const PUERTA_CERRADA = 3;

const FLAGS = new Set(["root", "id", "task", "tools", "json", "file"]);

function usage() {
  return [
    "operation <sub> --root <dir> [--id <op>] [--task <t>] [--tools <a,b>] [--json '<obj>' | --file <ruta>]",
    "  entry                              que operacion hay abierta y cual es el primer paso",
    "  hold       {goal, owner, authority}  deja la operacion preparada en FASES.md",
    "  authorize  {by, words}               las palabras citadas, o no hay autorizacion",
    "  pause      {note}                    deja el checkpoint durable en pausa",
    "  plan       <spec de tarea>           agrega la tarea con su encargo completo",
    "  dispatch   --task <t> --tools <a,b>  lanza por una ruta que el host expuso",
    "  observe    {text, alive, at}         deja escrito que se vio",
    "  receive    {path}                    lee el archivo que el ejecutor dejo",
    "  review     {reviewer, checked, notes}",
    "  verify     {verifier, observed, evidence}",
    "  integrate  {destination}",
    "  close      {verification}",
    "  status                              una linea por tarea",
    "  resume                              veredicto del kernel sobre lo guardado",
  ].join("\n");
}

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function message(error) {
  if (typeof error?.message === "string" && error.message.length > 0) return error.message;
  return String(error);
}

function emit(stdout, value) {
  stdout.write(`${JSON.stringify(value)}\n`);
  return 0;
}

function fail(stdout, error, stderr) {
  emit(stdout, { ok: false, error: message(error) });
  stderr?.write(`${message(error)}\n`);
  return 1;
}

function parseFlags(tokens) {
  const flags = {};
  for (let index = 0; index < tokens.length; index++) {
    const token = String(tokens[index]);
    if (!token.startsWith("--")) throw new Error(`unexpected argument: ${token}`);
    const equals = token.indexOf("=");
    const name = equals === -1 ? token.slice(2) : token.slice(2, equals);
    if (!FLAGS.has(name)) throw new Error(`unknown flag: --${name}`);
    if (equals !== -1) {
      flags[name] = token.slice(equals + 1);
      continue;
    }
    const value = tokens[index + 1];
    if (value === undefined) throw new Error(`--${name} needs a value`);
    flags[name] = value;
    index++;
  }
  return flags;
}

function parsePayload(text, origin) {
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new Error(`${origin} is not valid JSON: ${message(error)}`);
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${origin} must be a JSON object`);
  }
  return value;
}

async function readPayload(flags) {
  const fromText = present(flags.json);
  const fromFile = present(flags.file);
  if (fromText && fromFile) throw new Error("the payload arrives once: --json or --file, not both");
  if (fromFile) {
    let text;
    try {
      text = await readFile(flags.file, "utf8");
    } catch (error) {
      throw new Error(`--file could not be read: ${flags.file} (${error?.code ?? "unreadable"})`);
    }
    return parsePayload(text, `--file ${flags.file}`);
  }
  if (fromText) return parsePayload(flags.json, "--json");
  return {};
}

function requiredRoot(flags) {
  if (!present(flags.root)) throw new Error(`operation root is missing (root: <missing>; id: ${flags.id ?? "<missing>"}). Next step: pass --root <ruta> and retry the operation command`);
  return flags.root;
}

function requiredId(flags, sub) {
  if (!present(flags.id)) throw new Error(`operation id is missing (root: ${flags.root}; id: <missing>). Next step: list operations in ${flags.root}/FASES.md and retry with --id <id>`);
  return flags.id;
}

function requiredTask(flags) {
  if (!present(flags.task)) throw new Error("operation needs --task <t>: which task");
  return flags.task;
}

function observedHost(names) {
  if (!present(names)) return {};
  const host = {};
  for (const name of String(names).split(",").map((each) => each.trim()).filter((each) => each.length > 0)) {
    host[name] = function observedHostTool() {
      throw new Error(`the tool ${name} was declared as observed and this CLI never runs it: --tools declares what the operator saw, not a simulation`);
    };
  }
  return host;
}

async function load(sub, flags) {
  const root = requiredRoot(flags);
  const id = requiredId(flags, sub);
  let artifact;
  try {
    artifact = await readOperation({ root, id });
  } catch (error) {
    if (/not found|does not exist|no existe/i.test(message(error))) {
      throw new Error(`operation ${id} was not found under root ${root} (FASES.md). Next step: list operations in ${root}/FASES.md, then run lore-plugin operation status --root <ruta> --id <id>`);
    }
    throw error;
  }
  return { root, id, artifact, directory: operationStatePath(root, id).directory };
}

async function persist(context, artifact) {
  await saveOperationState(context.directory, artifact);
  return artifact;
}

function recordOf(artifact, taskId) {
  const found = (artifact?.tasks ?? []).find((task) => task.id === taskId);
  if (!found) throw new Error(`unknown task: ${String(taskId)}`);
  return found;
}

async function execute(sub, flags, stdout) {
  const payload = await readPayload(flags);

  // `entry` es la unica puerta y por eso va antes de `load`: no pide un id, porque lo que responde
  // es si hay algo abierto. Sin `--root` sigue fallando con el mismo mensaje que el resto.
  if (sub === "entry") {
    const root = requiredRoot(flags);
    const entrada = operationEntry({ root });
    if (!entrada.open) {
      return emit(stdout, { ok: true, gate: "operation_entry", ...entrada });
    }
    const instruction = `operation entry: hay una operacion abierta y su entrada sigue sin leerse. `
      + `Abre ${entrada.file} (${entrada.file_to_open}) antes de coordinar nada; siguiente: ${entrada.next_step}.`
      + (entrada.also_open.length > 0 ? ` Tambien abiertas: ${entrada.also_open.join(", ")}.` : "");
    emit(stdout, { ok: false, gate: "operation_entry", ...entrada, instruction });
    process.stderr.write(`${instruction}\n`);
    return PUERTA_CERRADA;
  }

  if (sub === "hold") {
    const root = requiredRoot(flags);
    const { artifact, file } = await holdOperation({
      root,
      goal: payload.goal,
      owner: payload.owner,
      authority: payload.authority,
    });
    return emit(stdout, { ok: true, id: artifact.id, state: artifact.state, file });
  }

  const context = await load(sub, flags);

  if (sub === "authorize") {
    if (!present(payload.by) || !present(payload.words)) {
      throw new Error("an authorization needs who authorized and the words said: by and words cannot be empty");
    }
    const artifact = transitionArtifact(context.artifact, {
      state: "authorized",
      note: `autorizacion de ${payload.by}: "${payload.words}"`,
    });
    await persist(context, artifact);
    return emit(stdout, { ok: true, id: context.id, state: artifact.state });
  }

  if (sub === "pause") {
    const artifact = transitionArtifact(context.artifact, {
      state: "paused",
      note: present(payload.note) ? `pausa: ${payload.note}` : "operacion pausada",
    });
    await persist(context, artifact);
    return emit(stdout, { ok: true, id: context.id, state: artifact.state });
  }

  if (sub === "plan") {
    const { artifact, task } = planTask(context.artifact, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, task: task.id, taskRecord: task });
  }

  if (sub === "dispatch") {
    const taskId = requiredTask(flags);
    const artifact = dispatchTask(context.artifact, taskId, {
      host: observedHost(flags.tools),
      hostName: payload.hostName,
      model: payload.model,
      effort: payload.effort,
      process: payload.process,
      now: payload.now,
    });
    await persist(context, artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId) });
  }

  if (sub === "observe") {
    const taskId = requiredTask(flags);
    const artifact = observeTask(context.artifact, taskId, payload);
    await persist(context, artifact);
    const wall = attemptWall(artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId), ...(wall.stop ? { wall: wallReceipt(wall) } : {}) });
  }

  if (sub === "receive") {
    const taskId = requiredTask(flags);
    const artifact = await receiveTask(context.artifact, taskId, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId) });
  }

  if (sub === "review") {
    const taskId = requiredTask(flags);
    const artifact = reviewTask(context.artifact, taskId, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId) });
  }

  if (sub === "verify") {
    const taskId = requiredTask(flags);
    const artifact = verifyTask(context.artifact, taskId, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId) });
  }

  if (sub === "integrate") {
    const taskId = requiredTask(flags);
    const artifact = integrateTask(context.artifact, taskId, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId) });
  }

  if (sub === "close") {
    const artifact = closeOperation(context.artifact, { verification: payload.verification });
    await persist(context, artifact);
    return emit(stdout, { ok: true, id: context.id, state: artifact.state });
  }

  if (sub === "status") {
    const overdue = new Map((context.artifact.tasks ?? []).map((task) => [task.id, task.overdue === true]));
    const tasks = taskSummary(context.artifact).map((task) => ({ ...task, overdue: overdue.get(task.id) === true }));
    const wall = attemptWall(context.artifact);
    const calibration = calibrateEstimates(context.artifact.tasks ?? []);
    const measured = Object.fromEntries(Object.entries(calibration).filter(([, value]) => value.measured !== false));
    const suggestions = Object.fromEntries(Object.entries(measured).map(([key, value]) => [key,
      `sugerencia, no regla: el tiempo suele ser ${value.medianRatio} de lo estimado (${value.samples} muestras)`,
    ]));
    const seed = await readCalibrationSeed();
    const seedByKind = new Map((seed?.entries ?? []).map((entry) => [entry.kind, entry]));
    const measuredKeys = new Set(Object.entries(calibration).filter(([, value]) => value.measured !== false).map(([key]) => key));
    const calibrationLines = [];
    for (const task of context.artifact.tasks ?? []) {
      const key = `${task.role ?? "unknown"}|host=${task.executor?.host ?? "unspecified"}|model=${task.executor?.model ?? "unspecified"}`;
      if (measuredKeys.has(key)) continue;
      const entry = typeof task.kind === "string" ? seedByKind.get(task.kind) : null;
      const line = entry
        ? `referencia inicial (no medida en tu máquina): suele tardar del orden de ${entry.medianMinutes} min, hasta unos ${entry.p80Minutes} min; viene de ${entry.samples} trabajos de una sesión del ${seed.header.observedOn}; tu propia medición la reemplaza con 3 muestras`
        : "sin referencia";
      calibrationLines.push({ task: task.id, line });
    }
    return emit(stdout, {
      ok: true,
      id: context.id,
      state: context.artifact.state,
      tasks,
      calibrationLines,
      ...(Object.keys(measured).length > 0
        ? { calibration, suggestions }
        : { calibrationNote: "calibración no medida: se requieren al menos 3 muestras por clave" }),
      ...(wall.stop ? { wall: wallReceipt(wall) } : {}),
    });
  }

  const verdict = await resumeOperation({ root: context.root, id: context.id });
  if (verdict.allowed && verdict.artifact.state === "paused") {
    const artifact = transitionArtifact(verdict.artifact, { state: "running", note: "operacion reanudada desde FASES.md" });
    await persist(context, artifact);
    return emit(stdout, {
      ok: true,
      id: context.id,
      allowed: verdict.allowed,
      reason: verdict.reason,
      state: artifact.state,
    });
  }
  return emit(stdout, {
    ok: true,
    id: context.id,
    allowed: verdict.allowed,
    reason: verdict.reason,
    state: verdict.artifact.state,
  });
}

function wallReceipt(wall) {
  return {
    ...wall,
    instruction: "stop_and_search",
    attempted: wall.attempts.map((attempt) => attempt.text),
  };
}

export async function runOperationCli(argv = [], { stdout = process.stdout, stderr = process.stderr } = {}) {
  const list = Array.isArray(argv) ? argv.map((token) => String(token)) : [];
  const sub = list.length > 0 && !list[0].startsWith("--") ? list[0] : null;
  if (sub === null || !COMMANDS.includes(sub)) {
    stderr.write(`${sub === null ? "operation needs a subcommand" : `unknown operation subcommand: ${sub}`}\n`);
    stderr.write(`${usage()}\n`);
    return 2;
  }
  try {
    const flags = parseFlags(list.slice(1));
    return await execute(sub, flags, stdout);
  } catch (error) {
    return fail(stdout, error, stderr);
  }
}
