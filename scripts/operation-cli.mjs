import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  closeOperation,
  calibrateEstimates,
  blockReviewTask,
  delegationStatus,
  dispatchTask,
  holdOperation,
  integrateTask,
  observeTask,
  recordRetrySearch,
  consultCriterion,
  operationEntry,
  planTask,
  readOperation,
  receiveTask,
  resumeOperation,
  reviewTask,
  taskSummary,
  verifyTask,
} from "../skills/vespi/core/vespi.mjs";
import { approveExternalEffect, attemptWall, authorizeExternalEffect, operationStatePath, requestExternalEffect, revokeExternalEffectApproval, saveOperationState, transitionArtifact } from "../skills/vespi/core/operation-state.mjs";
import { assertExecuted, executeVerification } from "../skills/vespi/core/verification-execution.mjs";
import { readCalibrationSeed } from "../skills/vespi/core/calibration-seed.mjs";
import { recordInteractionTrace, recordSelfReport, compareTechnology, describeOperationCapability, operationTrust } from "../skills/vespi/core/coordinator.mjs";
import { offerOperationCard, answerOperationCard, arbitrateOperationCard } from "../skills/vespi/core/cards.mjs";
import { ofrecerFormaTrabajo } from "../skills/vespi/ofrece-formas-trabajo.mjs";

const COMMANDS = [
  "entry",
  "recommend",
  "hold",
  "authorize",
  "pause",
  "plan",
  "dispatch",
  "observe",
  "retry-search",
  "consult",
  "card",
  "compare",
  "capability",
  "trust",
  "receive",
  "request-effect",
  "approve-effect",
  "revoke-effect",
  "effect-permission",
  "trace",
  "self-report",
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
    "  recommend  <oferta>                recomienda una modalidad y espera elección",
    "  hold       {goal, owner, authority}  deja la operacion preparada en FASES.md",
    "  authorize  {by, words}               las palabras citadas, o no hay autorizacion",
    "  pause      {note}                    deja el checkpoint durable en pausa",
    "  plan       <spec de tarea>           agrega la tarea con su encargo completo",
    "  dispatch   --task <t> --tools <a,b>  declara la ruta observada; este proceso no ejecuta",
    "  observe    {text, alive, at}         deja escrito que se vio",
    "  retry-search <recibo>                registra búsqueda del host o su ausencia; no busca",
    "  consult    <fuente/decisión>         lee criterio situado; MCP solo mediante host real",
    "  card offer|answer|arbitrate          ofrece y registra perturbación con efecto posterior",
    "  compare <alternativas>               conserva comparación; no ejecuta efectos",
    "  capability <id/limites>              informa presencia; CLI no configura puertos",
    "  trust                               cobertura situada, sin puntuación universal",
    "  receive    {path}                    lee, dentro de root, el archivo que el ejecutor dejo",
    "  request-effect {action, destination} registra una solicitud; no ejecuta el efecto",
    "  approve-effect {requestId, action, destination, by, words, expiresAt} autoriza ese efecto exacto",
    "  revoke-effect {approvalId} revoca un permiso",
    "  effect-permission {requestId, action, destination} comprueba vigencia; no ejecuta el efecto",
    "  trace      {events}                  guarda la traza relacional validada por separado",
    "  self-report {report|null}            registra solo declaracion explicita del usuario",
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

// `--tools` declara lo que el operador OBSERVO en el host. Antes esta funcion fabricaba una por
// cada nombre —una que solo lanzaba al ser llamada— para que `routeOperation` la diera por expuesta:
// con eso la tarea pasaba a `running` con un ejecutor que este proceso no tiene, y el FASES.md
// guardaba un trabajo que nadie iba a hacer. Ahora no se fabrica nada: los nombres se pasan como
// declaracion, `host` queda vacio y la ruta se bloquea en la entrada con su motivo.
function declaredTools(names) {
  if (!present(names)) return [];
  return String(names).split(",").map((each) => each.trim()).filter((each) => each.length > 0);
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

// El reloj, CONSULTADO. El kernel trae `due_at` por tarea y `delegationStatus`, y su propia
// declaracion —RELEASE_0.1.4_KERNEL.md— dice que los plazos informan el estado solo cuando los
// consultas y nunca programan ni ejecutan trabajo. Eso es exactamente lo que hay aqui: nadie
// programo nada y nadie ejecuto nada; solo se pregunta, y la respuesta es un muro con su edad.
//
// Por eso NO hay rechazo en `integrate`. Ejecutar juicio con el reloj es otra cosa —es decidir que
// una tarea vencida no se integra— y esa consecuencia la decide el host, no el kernel. El kernel
// declara; este archivo enseña lo que declara. Un muro dicho es capacidad prometida; un muro que
// ademas frena trabajo es una politica que nadie acudo.
//
// Un solo reloj para las dos superficies: `status` y `entry` se llaman por separado y cada una mide
// su propio `ahora`, asi que un `Date.now()` por tarea haria que dos tareas del mismo informe
// tuvieran edades incompatibles si el segundo cae entre medias.
function murosDeVencimiento(tareas, ahora = Date.now()) {
  const muros = [];
  for (const tarea of tareas ?? []) {
    const { overdue, dueAt } = delegationStatus({ dueAt: Date.parse(tarea?.due_at), state: tarea?.state }, ahora);
    if (!overdue) continue;
    muros.push({
      task: tarea.id,
      state: tarea.state,
      role: tarea.role ?? null,
      due_at: new Date(dueAt).toISOString(),
      age_ms: ahora - dueAt,
      age_human: edadLegible(ahora - dueAt),
    });
  }
  return muros;
}

// La edad en palabras, porque `age_ms` no lo lee nadie. Redondeo hacia abajo y sin decimales: una
// edad que dice 3 min cuando son 3 min y 59 s no esta mintiendo todavia, y una que dijera "hace un
// rato" no diria nada.
function edadLegible(ms) {
  if (!Number.isFinite(ms) || ms < 0) return null;
  const segundos = Math.floor(ms / 1000);
  if (segundos < 60) return `${segundos} s`;
  const minutos = Math.floor(segundos / 60);
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `${horas} h ${minutos % 60} min`;
  return `${Math.floor(horas / 24)} d ${horas % 24} h`;
}

function fraseDelMuro(muros) {
  if (muros.length === 0) return "";
  const lista = muros.map((m) => `${m.task} (${m.role ?? "sin rol"}, ${m.state}) vencida hace ${m.age_human}`).join(", ");
  return ` Tarea vencida, sin verificar: ${lista}. El plazo informa, no bloquea: la consecuencia la decide quien coordina.`;
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
    // El muro se consulta tambien en la puerta, y no solo en `status`: son las dos superficies por
    // las que se pregunta, y una que supiera y la otra no seria una consulta sino dos. Lo que
    // llega aqui es `pending_by_role`, que ya trae `due_at` porque operation-state no puede
    // importar el kernel.
    const muros = murosDeVencimiento((entrada.pending_by_role ?? []).flatMap(({ tasks }) => tasks ?? []));
    const instruction = `operation entry: hay una operacion abierta y su entrada sigue sin leerse. `
      + `Abre ${entrada.file} (${entrada.file_to_open}) antes de coordinar nada; siguiente: ${entrada.next_step}.`
      + (entrada.also_open.length > 0 ? ` Tambien abiertas: ${entrada.also_open.join(", ")}.` : "")
      + fraseDelMuro(muros);
    emit(stdout, { ok: false, gate: "operation_entry", ...entrada, ...(muros.length > 0 ? { muro: muros } : {}), instruction });
    process.stderr.write(`${instruction}\n`);
    return PUERTA_CERRADA;
  }

  if (sub === "recommend") {
    const root = requiredRoot(flags);
    if (!payload.contexto) throw new Error("recommend requiere contexto verificable de tarea, Pistas y skills del host");
    let offer = ofrecerFormaTrabajo(payload);
    if (flags.id) {
      const prior = await readOperation({ root, id: flags.id });
      if (["closed", "cancelled"].includes(prior.state)) {
        throw new Error("recommend no retoma preferencias de una operación terminal");
      }
      if (prior.coordinacion) {
        const savedFingerprint = prior.coordinacion.huellaContexto;
        const currentFingerprint = offer.fundamento?.huellaContexto;
        offer = ofrecerFormaTrabajo({
          ...payload,
          preferencia: {
            modalidad: prior.coordinacion.modalidad,
            skills: prior.coordinacion.skills,
            mismaOperacion: true,
            contextoCambioMaterial: !savedFingerprint || savedFingerprint !== currentFingerprint,
          },
        });
      }
    }
    return emit(stdout, { ok: true, offer });
  }
  if (sub === "hold") {
    const root = requiredRoot(flags);
    if (Array.isArray(payload.authority?.spend) && payload.authority.spend.length > 0) {
      return emit(stdout, { ok: false, error: "hold no acepta authority.spend: el gasto real pide credencial externa y se declara en otra ruta" });
    }
    const { artifact, file } = await holdOperation({
      root,
      goal: payload.goal,
      intent: payload.intent ?? payload.goal,
      owner: payload.owner,
      authority: payload.authority,
      coordinacion: payload.coordinacion ?? null,
      scope: payload.scope,
      expected_effect: payload.expected_effect,
      done: payload.done,
      roles: payload.roles,
      verifier: payload.verifier,
      receipt: payload.receipt,
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
    // Sin `host`: este proceso no expone ninguna herramienta del host y no va a fingir que si. Lo
    // que `--tools` trae es la declaracion de quien opera, que queda escrita como tal.
    const artifact = dispatchTask(context.artifact, taskId, {
      host: {},
      declaredTools: declaredTools(flags.tools),
      hostName: payload.hostName,
      model: payload.model,
      effort: payload.effort,
      process: payload.process,
      retryChange: payload.retryChange,
      now: payload.now,
    });
    await persist(context, artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId) });
  }

  if (sub === "retry-search") {
    const artifact = recordRetrySearch(context.artifact, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, artifact });
  }

  if (sub === "consult") {
    const artifact = await consultCriterion(context.artifact, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, consultation: artifact.loaded.at(-1) });
  }

  if (sub === "card") {
    const handler = { offer: offerOperationCard, answer: answerOperationCard, arbitrate: arbitrateOperationCard }[flags.cardAction];
    const artifact = handler(context.artifact, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, card: flags.cardAction === "offer" ? artifact.perturbations.at(-1) : artifact.perturbations.find(card => card.id === payload.id) });
  }

  if (sub === "compare") {
    const artifact = compareTechnology(context.artifact, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, choice: artifact.technology_choices.at(-1) });
  }
  if (sub === "capability") return emit(stdout, { ok: true, capability: describeOperationCapability(context.artifact, payload) });
  if (sub === "trust") return emit(stdout, { ok: true, trust: operationTrust(context.artifact) });

  if (sub === "observe") {
    const taskId = requiredTask(flags);
    const artifact = observeTask(context.artifact, taskId, payload);
    await persist(context, artifact);
    const wall = attemptWall(artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId), ...(wall.stop ? { wall: wallReceipt(wall) } : {}) });
  }

  if (sub === "receive") {
    const taskId = requiredTask(flags);
    // `root` viaja porque sin el no hay contra que comparar: la huella que se sella en FASES.md tiene
    // que ser la de un archivo de este proyecto, y una ruta de fuera no se lee.
    const artifact = await receiveTask(context.artifact, taskId, { ...payload, root: context.root });
    await persist(context, artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId) });
  }

  if (sub === "request-effect") {
    const artifact = requestExternalEffect(context.artifact, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, id: context.id, request: artifact.external_effect_requests.at(-1) });
  }

  if (sub === "approve-effect") {
    const artifact = approveExternalEffect(context.artifact, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, id: context.id, approval: artifact.external_effect_approvals.at(-1) });
  }

  if (sub === "revoke-effect") {
    const artifact = revokeExternalEffectApproval(context.artifact, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, id: context.id, approval: artifact.external_effect_approvals.find((item) => item.id === payload.approvalId) });
  }

  if (sub === "effect-permission") {
    const permission = authorizeExternalEffect(context.artifact, payload);
    return emit(stdout, { ok: true, id: context.id, ...permission });
  }

  if (sub === "trace") {
    const artifact = recordInteractionTrace(context.artifact, payload.events);
    await persist(context, artifact);
    return emit(stdout, { ok: true, id: context.id, state: artifact.state, interaction_events: artifact.interaction_trace.length });
  }

  if (sub === "self-report") {
    if (!Object.hasOwn(payload, "report")) throw new Error("self-report needs an explicit report field; leave it absent when the user has not declared one");
    const artifact = recordSelfReport(context.artifact, payload.report);
    await persist(context, artifact);
    return emit(stdout, { ok: true, id: context.id, state: artifact.state, self_report: artifact.self_report });
  }

  if (sub === "review") {
    const taskId = requiredTask(flags);
    if (payload.advisorRoute?.available !== true || payload.advisorRoute?.tool !== "decide" || !present(payload.advisorRoute?.observedBy)) {
      const blocked = blockReviewTask(context.artifact, taskId);
      await persist(context, blocked);
      throw new Error(`review blocked: coordinator has not observed the host Advisor tool decide; task ${taskId} is durably blocked, then receive ${taskId} again after the tool is observed`);
    }
    const artifact = reviewTask(context.artifact, taskId, payload);
    await persist(context, artifact);
    return emit(stdout, { ok: true, task: recordOf(artifact, taskId) });
  }

  if (sub === "verify") {
    const taskId = requiredTask(flags);
    const task = recordOf(context.artifact, taskId);
    if (task.state !== "reviewed") throw new Error("verify needs a reviewed task before executing any check");
    const executor = task.executor?.by ?? task.declared_route?.by ?? "";
    if (!payload.verifier || String(payload.verifier).trim().toLowerCase() === String(executor).trim().toLowerCase()) throw new Error("verification must be independent");
    const evidence = payload.evidence?.execution_receipt
      ? payload.evidence
      : await executeVerification(context.artifact, taskId, { root: context.root });
    const execution = assertExecuted(context.artifact, task, evidence, { requirePass: false });
    if (execution.passed !== true) {
      const rejectedTask = { ...task, state: "reviewed", verification: {
        by: payload.verifier, executed: true, observed: true, passed: false, evidence,
        execution, independence: "labels_only", at: new Date().toISOString(),
      } };
      await persist(context, { ...context.artifact, tasks: context.artifact.tasks.map(item => item.id === taskId ? rejectedTask : item) });
      emit(stdout, { ok: false, task: rejectedTask, next_action: "correct the result, receive it again, review it, then run verify", reason: "executed verification rejected the result" });
      return 1;
    }
    const artifact = verifyTask(context.artifact, taskId, { verifier: payload.verifier, observed: true, evidence });
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
    const ahora = Date.now();
    const muros = murosDeVencimiento(context.artifact.tasks ?? [], ahora);
    const vencido = new Set(muros.map((m) => m.task));
    // El `overdue` que se escribe al observar no se tira: es la vencida que alguien YA vio y nadie
    // consulto despues. El reloj no lo reemplaza, lo confirma —son la misma pregunta hecha por dos
    // caminos— y por eso la linea dice vencido con cualquiera de los dos.
    const observado = new Map((context.artifact.tasks ?? []).map((task) => [task.id, task.overdue === true]));
    const tasks = taskSummary(context.artifact).map((task) => ({ ...task, overdue: vencido.has(task.id) || observado.get(task.id) === true }));
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
      // Misma clave que la calibracion: ejecutor cuando lo hay, declaracion cuando no. Preguntar por
      // una clave distinta daria la referencia inicial a una tarea que ya tiene su propia medicion.
      const loHizo = task.executor ?? task.declared_route ?? null;
      const key = `${task.role ?? "unknown"}|host=${loHizo?.host ?? "unspecified"}|model=${loHizo?.model ?? "unspecified"}`;
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
      ...(muros.length > 0 ? { muro: muros } : {}),
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
    if (sub === "card" && !["offer", "answer", "arbitrate"].includes(list[1])) throw new Error("card needs offer, answer or arbitrate");
    const flags = parseFlags(list.slice(sub === "card" ? 2 : 1));
    if (sub === "card") flags.cardAction = list[1];
    return await execute(sub, flags, stdout);
  } catch (error) {
    return fail(stdout, error, stderr);
  }
}

// Este archivo es dos cosas a la vez, y solo una de ellas se ejecutaba. Lo exportado lo consume
// la facade —`lore-plugin.mjs operation`, que es la via publicada— y lo importado lo consumen las
// pruebas. Pero el `usage()` de arriba anuncia la forma "operation <sub> --root <dir>", que es este
// archivo como proceso, y por ahi no pasaba nada: sin salida y con codigo 0. Un ok vacio es lo peor
// que puede responder una puerta, porque quien pregunto se va con la certeza de haber preguntado.
//
// La comparacion es de rutas resueltas, no de cadenas: por symlink o por `\` de Windows el mismo
// archivo llega con dos formas distintas, y una guarda que no reconoce su propia ruta volveria a
// fallar en silencio en el host que mas la usa. Importado, esto no corre.
const invocadoComoProceso = process.argv[1] !== undefined
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invocadoComoProceso) {
  process.exitCode = await runOperationCli(process.argv.slice(2), {
    stdout: process.stdout,
    stderr: process.stderr,
  });
}
