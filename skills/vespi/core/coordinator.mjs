// coordinator — el flujo por rol de una operacion: cada tarea se planifica con su encargo completo,
// se lanza solo por una ruta que el host expone de verdad, y avanza recibida -> revisada -> verificada
// -> integrada como hechos distintos que no se infieren uno del otro. Todo es puro sobre el artefacto:
// cada funcion devuelve uno nuevo y el recibido no se toca. La unica excepcion es receiveTask, que lee
// el archivo que el ejecutor dejo de verdad: recibida es un hecho del disco, no una declaracion.
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { classifyDelegateOutput } from "./host-resources.mjs";
import { appendCheckpoint, statePath, transitionArtifact } from "./operation-state.mjs";
import { routeOperation } from "./vespi.mjs";

// La ruta no se decide aqui: sale de lo que el host expone (routeOperation). Cada rol pide la suya, y
// una herramienta ausente es un bloqueo con nombre, nunca una invocacion simulada.
const INTENT_BY_ROLE = { daimon: "daimon", advisor: "advisor", worker: "delegation" };

// Estados desde los que una operacion puede correr. "prepared" no esta: nadie autorizo a correr.
const DISPATCHABLE = new Set(["authorized", "queued", "running", "paused", "waiting"]);

const REQUIRED_BY_ROLE = {
  daimon: ["question", "sources", "output"],
  advisor: ["question", "context", "output"],
  worker: ["question", "scope", "done_criterion", "proof", "output"],
};

// Solo Daimon tiene una declaracion propia que dejar escrita en el encargo. Advisor y trabajador no
// reciben una aqui porque el kit no les declaro ninguna: inventar una seria una obligacion falsa.
const MUST_DECLARE_BY_ROLE = { daimon: ["evidence", "limits"] };

const REVIEW_CHECKS = ["scope", "sources", "risks"];

// Cierre: la escalera explicita. statePath("running", "closed") pasa por blocked, y un checkpoint que
// dice "bloqueada" en el tramo final de una operacion verificada seria un checkpoint que miente.
const CLOSURE_LADDER = ["received", "reviewed", "verified", "closed"];

// Lo que si justifica ir en cadena: algo entre partes que no se conocen entre si (Spec 015). Lo demas
// —estado de sesion, lore, borradores, el propio pulso del kit— es coordinacion interna y no lo
// justifica, asi que declararlo en cadena no es un error: es un defecto que queda anotado.
const CHAIN_CLASSES = new Set([
  "money_moved",
  "anchor_for_third_parties",
  "credentials_between_counterparties",
  "bilateral_agreements",
]);

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

function taskById(artifact, taskId) {
  const found = (artifact?.tasks ?? []).find((task) => task.id === taskId);
  if (!found) throw new Error(`unknown task: ${String(taskId)}`);
  return found;
}

function replaceTask(artifact, task) {
  return { ...artifact, tasks: (artifact?.tasks ?? []).map((each) => (each.id === task.id ? task : each)) };
}

function clockIso(value) {
  const time = value === null || value === undefined ? Date.now() : value;
  const timestamp = typeof time === "number" && Number.isInteger(time) ? time : Date.parse(time);
  if (!Number.isFinite(timestamp)) throw new Error("task clock must be a valid ISO date or integer millisecond timestamp");
  return new Date(timestamp).toISOString();
}

// El camino legal y nada mas: una tarea lanzada deja la operacion corriendo porque alguien la lanzo,
// y el recorrido lo decide el grafo de states, no esta funcion.
function advanceTo(artifact, target, note) {
  if (artifact.state === target) return { ...appendCheckpoint(artifact, { note }), state: target };
  const path = statePath(artifact.state, target);
  if (path === null) {
    return {
      ...appendCheckpoint(artifact, { note: `${note} (state ${artifact.state} cannot reach ${target})` }),
      uncertainty: [...(artifact.uncertainty ?? []), `no legal transition from ${artifact.state} to ${target}`],
    };
  }
  return path.reduce(
    (current, state, index) => transitionArtifact(current, { state, note: index === path.length - 1 ? note : null }),
    artifact,
  );
}

// La economia de una operacion y lo que va en cadena se declaran antes de correr (criterios 10 y 11):
// un efecto externo sin costo, grant y settlement no se puede poner a andar, y lo que se pone en
// cadena sin desconfianza entre las partes queda anotado como defecto, no como error.
export function declareEffect(artifact, { effect, economy = null, chain = null } = {}) {
  if (effect !== "none" && effect !== "external") {
    throw new Error(`effect must be none or external: ${String(effect)}`);
  }
  if (effect === "external") {
    if (!economy) throw new Error("an external effect declares its economy: cost, grant and settlement");
    if (!present(economy.cost?.amount) || !present(economy.cost?.asset)) {
      throw new Error("economy cost needs an amount and an asset");
    }
    if (!present(economy.grant)) throw new Error("economy needs a grant: what the spend buys");
    if (!present(economy.settlement)) throw new Error("economy needs a settlement: how it is paid and closed");
    if (!chain) throw new Error("an external effect declares what goes on chain: placement, class and reason");
  }
  const defects = [];
  if (chain) {
    if (chain.placement !== "on" && chain.placement !== "off") {
      throw new Error(`chain placement must be on or off: ${String(chain.placement)}`);
    }
    if (!present(chain.class)) throw new Error("chain needs a class");
    if (!present(chain.reason)) throw new Error("chain needs a reason");
    if (chain.placement === "on" && !CHAIN_CLASSES.has(chain.class)) {
      defects.push({ code: "chain_without_distrust", class: chain.class, reason: chain.reason });
    }
  }
  return { ...artifact, effect, economy: economy ?? null, chain: chain ?? null, defects };
}

// planTask: la tarea nace con su encargo completo o no nace. Un encargo al que le falta el alcance,
// el criterio de terminado o la prueba es un encargo que vuelve como opinion.
export function planTask(artifact, spec = {}) {
  const role = spec.role;
  const required = Object.prototype.hasOwnProperty.call(REQUIRED_BY_ROLE, role) ? REQUIRED_BY_ROLE[role] : null;
  if (required === null) throw new Error(`unknown task role: ${String(role)} (daimon, advisor or worker)`);
  if (!present(spec.question)) throw new Error(`${role} needs a question`);
  if (role === "daimon" && (!Array.isArray(spec.sources) || spec.sources.length === 0)) {
    throw new Error("daimon needs sources: what it will read");
  }
  for (const field of required) {
    if (field === "output" || field === "sources") continue;
    if (!present(spec[field])) throw new Error(`${role} needs ${field}`);
  }
  if (!present(spec.output?.path)) throw new Error(`${role} needs an output.path`);
  if (!(Number(spec.timeoutMs) > 0)) throw new Error(`${role} needs a timeoutMs greater than zero`);
  if (spec.kind !== undefined && (typeof spec.kind !== "string" || !["review", "build", "fix", "write"].includes(spec.kind))) {
    throw new Error(`${role} kind must be one of review, build, fix, write`);
  }
  if (spec.estimateMs !== undefined && (!Number.isInteger(spec.estimateMs) || spec.estimateMs <= 0)) {
    throw new Error(`${role} estimateMs must be a positive integer`);
  }
  if (!present(spec.nextCheckAt) || Number.isNaN(Date.parse(spec.nextCheckAt))) {
    throw new Error(`${role} needs a nextCheckAt (ISO date): when it is observed again`);
  }
  const tasks = artifact?.tasks ?? [];
  const task = {
    id: `t${tasks.length + 1}`,
    role,
    state: "proposed",
    by: null,
    question: spec.question,
    ...(spec.kind !== undefined ? { kind: spec.kind } : {}),
    output: { path: spec.output.path },
    timeoutMs: spec.timeoutMs,
    ...(spec.estimateMs !== undefined ? { estimateMs: spec.estimateMs } : {}),
    nextCheckAt: spec.nextCheckAt,
    deadline: null,
    executor: null,
    observations: [],
    overdue: false,
    received: null,
    review: null,
    verification: null,
    integration: null,
    blocked: null,
    planned_at: new Date().toISOString(),
    ...(Array.isArray(spec.sources) ? { sources: [...spec.sources] } : {}),
    ...(spec.context ? { context: spec.context } : {}),
    ...(spec.scope ? { scope: spec.scope } : {}),
    ...(spec.done_criterion ? { done_criterion: spec.done_criterion } : {}),
    ...(spec.proof ? { proof: spec.proof } : {}),
    ...(MUST_DECLARE_BY_ROLE[role] ? { must_declare: [...MUST_DECLARE_BY_ROLE[role]] } : {}),
  };
  return { artifact: { ...artifact, tasks: [...tasks, task] }, task };
}

// dispatchTask: o corre por una ruta que el host expone, o queda bloqueada con la razon de la
// herramienta que falta. Nunca inventan un ejecutor para que la tarea parezca viva.
export function dispatchTask(artifact, taskId, { host = {}, hostName = null, model = null, effort = null, process = null, now = null } = {}) {
  if (!DISPATCHABLE.has(artifact?.state)) {
    throw new Error(`dispatch needs an authorized operation: state ${String(artifact?.state)} authorizes nobody to run`);
  }
  const task = taskById(artifact, taskId);
  const route = routeOperation({ intent: INTENT_BY_ROLE[task.role], host });
  if (!route.available) {
    return replaceTask(artifact, {
      ...task,
      state: "blocked",
      by: "coordinador",
      executor: null,
      blocked: {
        cause: route.reason,
        next_action: `esperar a que el host exponga ${route.tool} y lanzar ${taskId}; sin esa herramienta no se ejecuta ni se simula`,
        owner: "coordinador",
      },
    });
  }
  const startedAt = clockIso(now);
  const executor = {
    by: `${hostName ?? "unknown"}/${model ?? "unknown"}`,
    host: hostName ?? "unknown",
    model: model ?? "unknown",
    effort: effort ?? "unknown",
    process: process ?? null,
    startedAt,
  };
  const running = replaceTask(artifact, {
    ...task,
    state: "running",
    by: executor.by,
    blocked: null,
    executor,
    deadline: new Date(Date.parse(startedAt) + Number(task.timeoutMs)).toISOString(),
  });
  return advanceTo(running, "running", `tarea ${taskId} lanzada por ${executor.by}`);
}

// observeTask: deja escrito que se vio, cuando, y si seguia viva. Una hora posterior al deadline
// con esa observacion nueva deja la tarea vencida: no se marca viva por no mirar.
export function observeTask(artifact, taskId, { text = null, alive = null, at, signature = null, outcome = null } = {}) {
  const task = taskById(artifact, taskId);
  if (task.state !== "running") throw new Error(`observeTask needs a running task: ${taskId} is ${task.state}`);
  if (signature !== null && signature !== undefined && typeof signature !== "string") {
    throw new Error("observe signature must be a string");
  }
  if (at !== undefined && !validObservationTime(at)) {
    throw new Error("observe at must be ISO 8601 with an explicit time zone or a representable integer millisecond timestamp");
  }
  const when = at === undefined ? new Date().toISOString() : at;
  const observedAt = typeof when === "number" ? when : Date.parse(when);
  const overdue = present(task.deadline) ? observedAt > Date.parse(task.deadline) : task.overdue === true;
  return replaceTask(artifact, {
    ...task,
    observations: [...task.observations, {
      at: when,
      text: text ?? "",
      alive: alive ?? null,
      ...(signature ? { signature: signature.slice(0, 500), outcome: outcome ?? "failure" } : {}),
      ...(outcome === "success" ? { outcome } : {}),
    }],
    overdue,
  });
}

function validObservationTime(at) {
  if (typeof at === "number") return Number.isInteger(at) && Number.isFinite(at) && Number.isFinite(new Date(at).getTime());
  if (typeof at !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(at)) return false;
  const timestamp = Date.parse(at);
  if (!Number.isFinite(timestamp)) return false;
  const [, year, month, day] = at.match(/^(\d{4})-(\d{2})-(\d{2})T/);
  return Number(month) >= 1 && Number(month) <= 12
    && Number(day) >= 1 && Number(day) <= new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
}

// receiveTask: recibida significa que el archivo existe de verdad, con su huella real. Sin archivo,
// la tarea sigue corriendo y el llamador se lleva el motivo.
export async function receiveTask(artifact, taskId, { path = null, exitCode = null, text = "", now = null } = {}) {
  const task = taskById(artifact, taskId);
  const file = path ?? task.output?.path ?? null;
  if (!present(file)) throw new Error(`receiveTask needs a path for ${taskId}`);
  if (task.state !== "running" && !(task.state === "blocked" && present(task.blocked?.cause))) {
    throw new Error(`receiveTask needs a running task: ${taskId} is ${task.state}`);
  }
  let bytes;
  try {
    bytes = await readFile(file);
  } catch (error) {
    if (error?.code === "ENOENT") throw new Error(`the declared output does not exist: ${file}`);
    throw new Error(`the declared output could not be read: ${file} (${error?.code ?? "unreadable"})`);
  }
  const delivery = classifyDelegateOutput({
    exitCode,
    text,
    expectedArtifacts: [task.output?.path ?? file],
    artifactsPresent: [file],
  });
  if (!delivery.delivered) {
    return replaceTask(artifact, {
      ...task,
      state: "blocked",
      blocked: { cause: delivery.cause, next_action: delivery.nextStep, owner: "coordinador" },
    });
  }
  const finishedAt = clockIso(now);
  const startedAt = task.executor?.startedAt;
  const actualMs = Number.isFinite(Date.parse(finishedAt)) && Number.isFinite(Date.parse(startedAt))
    ? Date.parse(finishedAt) - Date.parse(startedAt)
    : null;
  return replaceTask(artifact, {
    ...task,
    state: "received",
    by: task.executor?.by ?? task.by ?? "coordinador",
    blocked: null,
    finishedAt,
    ...(actualMs !== null ? { actualMs } : {}),
    received: {
      path: file,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
      at: finishedAt,
    },
  });
}

// Calibration is intentionally descriptive: each exact role/host/model key stands on its own.
// Percentiles use nearest rank, and fewer than three valid durations never produce a ratio.
export function calibrateEstimates(tasks = []) {
  const groups = new Map();
  for (const task of Array.isArray(tasks) ? tasks : []) {
    if (!Number.isInteger(task?.estimateMs) || task.estimateMs <= 0) continue;
    const host = task.executor?.host ?? null;
    const model = task.executor?.model ?? null;
    const key = `${task.role ?? "unknown"}|host=${host ?? "unspecified"}|model=${model ?? "unspecified"}`;
    if (!groups.has(key)) groups.set(key, { ratios: [], ignoredNonPositive: 0 });
    const group = groups.get(key);
    const start = Date.parse(task.executor?.startedAt);
    const finish = Date.parse(task.finishedAt);
    if (!Number.isFinite(start) || !Number.isFinite(finish)) continue;
    const actualMs = finish - start;
    if (actualMs <= 0) {
      group.ignoredNonPositive += 1;
      continue;
    }
    group.ratios.push(actualMs / task.estimateMs);
  }
  return Object.fromEntries([...groups].map(([key, group]) => {
    const ratios = group.ratios.sort((a, b) => a - b);
    if (ratios.length < 3) return [key, { samples: ratios.length, measured: false, ignoredNonPositive: group.ignoredNonPositive }];
    const middle = Math.floor(ratios.length / 2);
    const medianRatio = ratios.length % 2 ? ratios[middle] : (ratios[middle - 1] + ratios[middle]) / 2;
    const p80Ratio = ratios[Math.ceil(ratios.length * 0.8) - 1];
    return [key, { samples: ratios.length, medianRatio, p80Ratio, basis: "actualMs / estimateMs", ignoredNonPositive: group.ignoredNonPositive }];
  }));
}

// reviewTask: revisada es un hecho del revisor, con lo que cotejo dicho. Cotejar es revisar; sin las
// tres cotejadas no hay revision.
export function reviewTask(artifact, taskId, { reviewer, checked = [], notes = "" } = {}) {
  const task = taskById(artifact, taskId);
  if (task.state !== "received") throw new Error(`reviewTask needs a received task: ${taskId} is ${task.state}`);
  if (!present(reviewer)) throw new Error("review needs a reviewer");
  const missing = REVIEW_CHECKS.filter((check) => !checked.includes(check));
  if (missing.length > 0) {
    throw new Error(`review must check scope, sources and risks; missing: ${missing.join(", ")}`);
  }
  return replaceTask(artifact, {
    ...task,
    state: "reviewed",
    by: reviewer,
    review: { by: reviewer, checked: [...checked], notes: notes ?? "", at: new Date().toISOString() },
  });
}

// verifyTask: verificada exige que quien verifica no sea quien ejecuto, que haya observado el criterio
// y que diga con que evidencia. Las tres cosas o ninguna.
export function verifyTask(artifact, taskId, { verifier, observed, evidence } = {}) {
  const task = taskById(artifact, taskId);
  if (task.state !== "reviewed") throw new Error(`verifyTask needs a reviewed task: ${taskId} is ${task.state}`);
  const executorBy = task.executor?.by ?? "its own executor";
  if (!present(verifier) || verifier === task.executor?.by) {
    throw new Error(`verification must be independent: ${String(verifier) ?? "nobody"} cannot verify a task executed by ${executorBy}`);
  }
  if (observed !== true) throw new Error("verification requires observed: true, the criterion checked with one's own eyes");
  if (!present(evidence)) throw new Error("verification requires evidence: what was opened, read and compared");
  return replaceTask(artifact, {
    ...task,
    state: "verified",
    by: verifier,
    verification: { by: verifier, observed: true, evidence, at: new Date().toISOString() },
  });
}

// integrateTask: integrada nombra donde queda el resultado verificado. Sin destino, no hay integracion.
export function integrateTask(artifact, taskId, { destination } = {}) {
  const task = taskById(artifact, taskId);
  if (task.state !== "verified") throw new Error(`integrateTask needs a verified task: ${taskId} is ${task.state}`);
  if (!present(destination)) throw new Error("integration needs a destination: where the verified output lands");
  return replaceTask(artifact, {
    ...task,
    state: "integrated",
    by: task.verification?.by ?? "coordinador",
    integration: { destination, at: new Date().toISOString() },
  });
}

// closeOperation: no se cierra con una tarea abierta. Una tarea bloqueada con su razon si puede: su
// bloqueo ya dice que falta y quien lo resuelve.
export function closeOperation(artifact, { verification } = {}) {
  const abiertas = (artifact?.tasks ?? []).filter(
    (task) => task.state !== "integrated" && !(task.state === "blocked" && present(task.blocked?.cause)),
  );
  if (abiertas.length > 0) {
    throw new Error(
      `closeOperation needs every task integrated or blocked with a reason: ${abiertas.map((task) => `${task.id} (${task.state})`).join(", ")}`,
    );
  }
  if (verification?.verified !== true) throw new Error("closure requires a verified observation: verification.verified must be true");
  if (verification?.observed !== true) throw new Error("closure requires a verification observed by whoever certifies");
  if (!present(verification?.by)) throw new Error("closure requires a verification by a named certifier");
  let next = { ...artifact, verification: { ...verification } };
  const already = CLOSURE_LADDER.indexOf(next.state);
  for (const state of already === -1 ? CLOSURE_LADDER : CLOSURE_LADDER.slice(already + 1)) {
    next = transitionArtifact(next, { state, note: `cierre: ${state}` });
  }
  return next;
}

// taskSummary: la vista corta. Cinco campos por tarea y nada mas: el detalle vive en el artefacto.
export function taskSummary(artifact) {
  return (artifact?.tasks ?? []).map((task) => ({
    id: task.id,
    role: task.role,
    state: task.state,
    by: task.by ?? null,
    nextCheckAt: task.nextCheckAt ?? null,
  }));
}

// --- la puerta de entrada vive en operation-state.mjs ------------------------
//
// `operationEntry` lee FASES.md y pregunta al grafo si hay algo abierto. Vive ahi, y no aqui, por
// una razon que no es de estilo: el modulo del estado no importa NADA del kit —solo `node:fs` y
// `node:path`—, y por eso puede viajar en la cadena de la entrada local que los tres hosts
// instalan, que es el cierre transitivo de imports de `lore-cli.mjs` y esta congelado. El
// coordinador, en cambio, tira de `routeOperation` y de la copia vendorizada del kernel entero: una
// puerta que el hook de la apertura no puede alcanzar sin dragar el kernel a una entrada que es de
// solo lectura no es una puerta, es una promesa. Se reexporta desde la fachada para que quien
// importa un solo modulo la encuentre igual.
