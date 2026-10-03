import { readFile } from "node:fs/promises";
import {
  closeOperation,
  dispatchTask,
  holdOperation,
  integrateTask,
  observeTask,
  planTask,
  readOperation,
  receiveTask,
  resumeOperation,
  reviewTask,
  taskSummary,
  verifyTask,
} from "../skills/vespi/core/vespi.mjs";
import { attemptWall, operationStatePath, saveOperationState, transitionArtifact } from "../skills/vespi/core/operation-state.mjs";

const COMMANDS = [
  "hold",
  "authorize",
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

const FLAGS = new Set(["root", "id", "task", "tools", "json", "file"]);

function usage() {
  return [
    "operation <sub> --root <dir> [--id <op>] [--task <t>] [--tools <a,b>] [--json '<obj>' | --file <ruta>]",
    "  hold       {goal, owner, authority}  deja la operacion preparada en FASES.md",
    "  authorize  {by, words}               las palabras citadas, o no hay autorizacion",
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
    return emit(stdout, { ok: true, id: context.id, state: context.artifact.state, tasks, ...(wall.stop ? { wall: wallReceipt(wall) } : {}) });
  }

  const verdict = await resumeOperation({ root: context.root, id: context.id });
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
