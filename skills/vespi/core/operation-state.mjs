// operation-state — minimum durable operation artifact. Project-owned,
// inspectable, sparse. No transcript dump, no event log, no ledger.
export const ARTIFACT_SCHEMA_VERSION = "1.0.0";

// Where an operation's own state lives: ONE block per operation inside the project's FASES.md, at
// the root the caller passes (Spec 014: a single checkpoint, no operations/<id>/estado.md copy, no
// queue, no second view of the same progress). The root stays the caller's: where a project keeps
// its folders is the user's policy and the host's permission to decide, and this module only names
// a file inside the root it is handed.
export const FASES_FILE = "FASES.md";
export const OPERATIONS_HEADING = "## Operaciones";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { createHash } from "node:crypto";

let seq = 0;

function validateCoordination(coordinacion) {
  if (coordinacion === null || coordinacion === undefined) return null;
  if (!coordinacion || typeof coordinacion !== "object" || Array.isArray(coordinacion)) {
    throw new Error("coordinacion debe contener modalidad y decisiones de skills");
  }
  if (typeof coordinacion.modalidad !== "string" || !coordinacion.modalidad.trim()) {
    throw new Error("coordinacion.modalidad no puede estar vacía");
  }
  if (coordinacion.huellaContexto !== undefined
      && (typeof coordinacion.huellaContexto !== "string" || !/^[0-9a-f]{64}$/.test(coordinacion.huellaContexto))) {
    throw new Error("coordinacion.huellaContexto debe ser una huella SHA-256 hexadecimal");
  }
  if (!Array.isArray(coordinacion.skills)) throw new Error("coordinacion.skills debe ser una lista");
  const decisiones = new Set(["accepted", "corrected", "declined"]);
  const skills = coordinacion.skills.map((skill, index) => {
    if (!skill || typeof skill.sugerida !== "string" || !skill.sugerida.trim()) {
      throw new Error(`coordinacion.skills[${index}].sugerida no puede estar vacía`);
    }
    if (!decisiones.has(skill.decision)) throw new Error(`coordinacion.skills[${index}].decision no es válida`);
    if (skill.decision === "accepted" && skill.elegida?.trim() !== skill.sugerida.trim()) {
      throw new Error(`coordinacion.skills[${index}] debe conservar la skill aceptada`);
    }
    if (skill.decision === "corrected" && (typeof skill.elegida !== "string" || !skill.elegida.trim() || skill.elegida.trim() === skill.sugerida.trim())) {
      throw new Error(`coordinacion.skills[${index}] debe nombrar la skill corregida`);
    }
    if (skill.decision === "declined" && skill.elegida !== null) {
      throw new Error(`coordinacion.skills[${index}] declinada debe tener elegida null`);
    }
    return { sugerida: skill.sugerida.trim(), decision: skill.decision, elegida: typeof skill.elegida === "string" ? skill.elegida.trim() : skill.elegida };
  });
  return { modalidad: coordinacion.modalidad.trim(), ...(coordinacion.huellaContexto ? { huellaContexto: coordinacion.huellaContexto } : {}), skills };
}

const GATE_B_FIELDS = [
  ["intent", "intent"], ["owner", "owner"], ["authority", "authority"], ["scope", "scope"],
  ["expected_effect", "expected_effect"], ["done", "done"], ["roles", "tasks/roles"],
  ["verifier", "verifier"], ["receipt", "receipt"], ["state", "state"], ["next_action", "next_action"],
];

// La forma completa acredita estructura, no ejecución ni cierre.
export function validateGateBContract(contract) {
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    throw new Error("Gate B contract must be an object");
  }
  const missing = [];
  for (const [field, label] of GATE_B_FIELDS) {
    const value = field === "next_action" ? (contract.next_action ?? contract.next_legitimate_action) : contract[field];
    const text = typeof value === "string" && value.trim().length > 0;
    const object = value !== null && typeof value === "object" && !Array.isArray(value);
    const roles = field === "roles" && Array.isArray(value) && value.length > 0
      && value.every((role) => (typeof role === "string" && role.trim()) || (role && typeof role.role === "string" && role.role.trim()));
    if (!(text || object || roles)) missing.push(label);
  }
  if (missing.length > 0) throw new Error(`Gate B missing required fields: ${missing.join(", ")}`);
  return { valid: true, missing: [] };
}

export function createArtifact({
  goal, intent = goal, owner, authority = { spend: [] }, coordinacion = null,
  scope = null, expected_effect = null, done = null, roles = [], verifier = null, receipt = { status: "pending" },
}) {
  const coordinacionValidada = validateCoordination(coordinacion);
  const now = new Date().toISOString();
  return {
    artifact_schema_version: ARTIFACT_SCHEMA_VERSION,
    created_by_vespi_version: "2.4.9-rc.3",
    id: `op-${Date.now().toString(36)}-${seq++}`,
    working_goal: goal ?? "",
    intent: intent ?? "",
    owner: owner ?? "",
    state: "prepared",
    authority,
    scope,
    expected_effect,
    done,
    roles: Array.isArray(roles) ? structuredClone(roles) : roles,
    verifier,
    receipt: receipt && typeof receipt === "object" ? structuredClone(receipt) : receipt,
    interaction_trace: [],
    self_report: null,
    external_effect_requests: [],
    external_effect_approvals: [],
    ...(coordinacionValidada ? { coordinacion: coordinacionValidada } : {}),
    loaded: [],
    latest_authorized_delta: null,
    effects: [],
    verification: null,
    freshness: [],
    validity: {},
    uncertainty: [],
    next_legitimate_action: "authorize",
    provenance: {},
    checkpoints: [{ id: "R1-genesis", at: now, note: "R1-genesis", validity: {} }],
  };
}

let externalEffectSeq = 0;
function effectTime(value, label) {
  const parsed = typeof value === "number" ? value : Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error(label + " must be a valid timestamp");
  return parsed;
}
function effectText(value, label) {
  if (typeof value !== "string" || !value.trim()) throw new Error(label + " is required");
  return value.trim();
}

// A generic operation GREEN never authorizes an external effect. The approval is bound to a
// request id, one action, one destination and a validity window; this module never runs the effect.
export function requestExternalEffect(artifact, { action, destination, at = new Date().toISOString() } = {}) {
  const requested = {
    id: "fx-" + Date.now().toString(36) + "-" + externalEffectSeq++,
    action: effectText(action, "external effect action"),
    destination: effectText(destination, "external effect destination"),
    requested_at: new Date(effectTime(at, "external effect request at")).toISOString(),
  };
  return { ...artifact, external_effect_requests: [...(artifact.external_effect_requests ?? []), requested] };
}

export function approveExternalEffect(artifact, { requestId, action, destination, by, words, approvedAt = new Date().toISOString(), expiresAt } = {}) {
  const request = (artifact.external_effect_requests ?? []).find((item) => item.id === requestId);
  if (!request) throw new Error("external effect request does not exist");
  const approval = {
    id: "approval-" + Date.now().toString(36) + "-" + externalEffectSeq++,
    request_id: requestId,
    action: effectText(action, "approval action"),
    destination: effectText(destination, "approval destination"),
    by: effectText(by, "approval authority"),
    words: effectText(words, "approval words"),
    approved_at: new Date(effectTime(approvedAt, "approval time")).toISOString(),
    expires_at: new Date(effectTime(expiresAt, "approval expiry")).toISOString(),
    revoked_at: null,
  };
  if (approval.action !== request.action || approval.destination !== request.destination) throw new Error("approval must name the exact requested action and destination");
  if (Date.parse(approval.approved_at) < Date.parse(request.requested_at)) throw new Error("approval predates the current external effect request");
  if (Date.parse(approval.expires_at) <= Date.parse(approval.approved_at)) throw new Error("approval expiry must follow its issue time");
  return { ...artifact, external_effect_approvals: [...(artifact.external_effect_approvals ?? []), approval] };
}

export function revokeExternalEffectApproval(artifact, { approvalId, at = new Date().toISOString() } = {}) {
  const approvals = artifact.external_effect_approvals ?? [];
  const approval = approvals.find((item) => item.id === approvalId);
  if (!approval) throw new Error("external effect approval does not exist");
  if (approval.revoked_at) throw new Error("external effect approval is already revoked");
  const revokedAt = new Date(effectTime(at, "revocation time")).toISOString();
  return { ...artifact, external_effect_approvals: approvals.map((item) => item.id === approvalId ? { ...item, revoked_at: revokedAt } : item) };
}

export function authorizeExternalEffect(artifact, { requestId, action, destination, requestedAt = null, now = new Date().toISOString() } = {}) {
  const request = (artifact.external_effect_requests ?? []).find((item) => item.id === requestId);
  const exactAction = effectText(action, "external effect action");
  const exactDestination = effectText(destination, "external effect destination");
  const time = effectTime(now, "effect execution time");
  const denied = (reason) => ({ allowed: false, reason, adapterInput: null });
  if (!request || request.action !== exactAction || request.destination !== exactDestination) return denied("no exact current request");
  const currentRequestAt = requestedAt === null ? Date.parse(request.requested_at) : effectTime(requestedAt, "current request time");
  const approval = (artifact.external_effect_approvals ?? []).find((item) => item.request_id === requestId && item.action === exactAction && item.destination === exactDestination);
  if (!approval) return denied("no specific approval");
  if (Date.parse(approval.approved_at) < currentRequestAt) return denied("approval predates current request");
  if (Date.parse(approval.approved_at) > time || Date.parse(approval.expires_at) < time) return denied("approval is not currently valid");
  if (approval.revoked_at && Date.parse(approval.revoked_at) <= time) return denied("approval was revoked");
  return { allowed: true, approvalId: approval.id, adapterInput: Object.freeze({ action: exactAction, destination: exactDestination }) };
}

export function appendCheckpoint(artifact, { note, validity = {}, delta = null }) {
  const cp = {
    id: `R${artifact.checkpoints.length + 1}`,
    at: new Date().toISOString(),
    note: note ?? "",
    validity,
    delta,
  };
  return { ...artifact, checkpoints: [...artifact.checkpoints, cp] };
}

const TRANSITIONS = {
  prepared: new Set(["authorized", "blocked", "waiting", "requires_decision", "cancelled"]),
  authorized: new Set(["queued", "running", "blocked", "waiting", "requires_decision", "paused", "cancelled"]),
  queued: new Set(["running", "blocked", "waiting", "requires_decision", "paused", "cancelled"]),
  running: new Set(["received", "blocked", "waiting", "unknown", "requires_decision", "paused", "cancelled"]),
  received: new Set(["reviewed", "blocked", "waiting", "requires_decision", "paused"]),
  reviewed: new Set(["verified", "blocked", "waiting", "requires_decision", "paused"]),
  verified: new Set(["integrated", "closed", "blocked", "requires_decision"]),
  integrated: new Set(["closed", "blocked", "requires_decision"]),
  blocked: new Set(["authorized", "queued", "running", "received", "reviewed", "verified", "integrated", "waiting", "deferred", "unknown", "requires_decision", "paused", "cancelled"]),
  waiting: new Set(["authorized", "queued", "running", "blocked", "deferred", "unknown", "requires_decision", "paused", "cancelled"]),
  deferred: new Set(["authorized", "queued", "blocked", "waiting", "requires_decision", "paused", "cancelled"]),
  unknown: new Set(["blocked", "waiting", "requires_decision", "paused"]),
  requires_decision: new Set(["authorized", "queued", "running", "blocked", "waiting", "paused", "cancelled"]),
  paused: new Set(["authorized", "queued", "running", "blocked", "waiting", "deferred", "requires_decision", "cancelled"]),
  cancelled: new Set(),
  closed: new Set(),
};

const VALID_STATES = new Set(Object.keys(TRANSITIONS));
const ADVANCING_STATES = new Set(["authorized", "queued", "running", "received", "reviewed", "verified", "integrated", "closed"]);
const OPERATION_ID = /^op-[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizedFailureSignature(signature) {
  if (typeof signature !== "string") return null;
  const statusCodes = [];
  const errorCodes = [];
  let normalized = signature.slice(0, 500).toLowerCase()
    .replace(/\b(http|https|status|code|error|exit|errno)\s*[:=]?\s*(\d{3})\b/gi, (_match, label, code) => {
      const marker = `\u0000status${statusCodes.length}x\u0000`;
      statusCodes.push(`${label} ${code}`);
      return marker;
    })
    .replace(/\bhttp\/\d(?:\.\d)?\s+\d{3}\b/gi, (match) => {
      const marker = `\u0000status${statusCodes.length}x\u0000`;
      statusCodes.push(match);
      return marker;
    })
    .replace(/\b[a-z]:[\\/][^\r\n'"<>]*/gi, (path) => {
      const extensions = [...path.matchAll(/[\\/][^\\/\s'"<>]*\.[a-z0-9]{1,10}(?=$|[\s,;)]|[\\/])/gi)];
      const fileEnd = extensions.at(-1)?.index + extensions.at(-1)?.[0].length;
      const end = Number.isFinite(fileEnd) ? fileEnd : (path.search(/[\s'"<>]/) < 0 ? path.length : path.search(/[\s'"<>]/));
      return `<path>${path.slice(end)}`;
    })
    .replace(/(^|\s)(?:\.\/|\.\.\/|~\/|\/)(?:[^\s/]+\/)*[^\s/]+/g, "$1<path>")
    .replace(/\b([a-z]+-\d+)\b/gi, (match) => {
      const marker = `\u0000error${errorCodes.length}x\u0000`;
      errorCodes.push(match);
      return marker;
    })
    .replace(/\b[0-9a-f]{32,}\b|\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/gi, "<id>")
    .replace(/\b\d+\b/g, "#")
    .replace(/\b\d{1,2}:\d{1,2}(?::\d{1,2})?(?:\.\d+)?\b/g, "<time>")
    .replace(/\b\d+(?:\.\d+)?\s*(?:ms|msec|milliseconds?|s|sec|seconds?|minutes?|mins?)\b/gi, "<duration>")
    .replace(/\b\d+:\d+\b/g, "<line:column>")
    .replace(/\s+/g, " ")
    .trim();
  normalized = normalized.replace(/\u0000status(\d+)x\u0000/g, (_match, index) => statusCodes[Number(index)] ?? "");
  normalized = normalized.replace(/\u0000error(\d+)x\u0000/g, (_match, index) => errorCodes[Number(index)] ?? "");
  return normalized;
}

// A repeated identical failure is a wall, not a retry invitation. A success starts a new streak.
export function attemptWall(artifact, { threshold = 3 } = {}) {
  const limit = Math.max(1, Math.floor(Number(threshold) || 3));
  const orderedObservations = [
    ...(Array.isArray(artifact?.observations) ? artifact.observations.map((observation) => ({ observation, taskIndex: "artifact" })) : []),
    ...(Array.isArray(artifact?.tasks) ? artifact.tasks.flatMap((task, taskIndex) => Array.isArray(task?.observations)
      ? task.observations.map((observation) => ({ observation, taskIndex })) : []) : []),
  ].map(({ observation, taskIndex }, insertion) => ({ observation, taskIndex, insertion, at: sortableTime(observation?.at) }));
  const allTimesKnown = orderedObservations.every((item) => Number.isFinite(item.at));
  const sortable = allTimesKnown
    ? [...orderedObservations].sort((a, b) => a.at - b.at || a.insertion - b.insertion)
    : orderedObservations;
  const observations = sortable.map((item) => item.observation);
  const streak = [];
  let signature = null;
  for (const observation of observations) {
    if (observation?.outcome === "success" || observation?.success === true) {
      streak.length = 0;
      signature = null;
      continue;
    }
    if (typeof observation?.signature !== "string" || !observation.signature) continue;
    const current = normalizedFailureSignature(observation.signature);
    if (signature !== current) streak.length = 0;
    signature = current;
    streak.push({ signature: current, text: observation.text ?? "", at: observation.at ?? null });
  }
  const stop = streak.length >= limit;
  const taskIndexes = new Set(orderedObservations.map((item) => item.taskIndex));
  const tiedAcrossTasks = new Map();
  for (const item of orderedObservations) {
    if (!Number.isFinite(item.at)) continue;
    if (!tiedAcrossTasks.has(item.at)) tiedAcrossTasks.set(item.at, new Set());
    tiedAcrossTasks.get(item.at).add(item.taskIndex);
  }
  const ambiguousCrossTaskOrder = (taskIndexes.size > 1 && !allTimesKnown)
    || [...tiedAcrossTasks.values()].some((tasks) => tasks.size > 1);
  const conservativeStop = stop && !ambiguousCrossTaskOrder;
  return {
    stop: conservativeStop,
    signature: conservativeStop ? signature : null,
    attempts: conservativeStop ? streak : [],
    reason: conservativeStop
      ? `same failure repeated ${streak.length} consecutive times; stop and search before retrying`
      : ambiguousCrossTaskOrder
        ? "consecutive order is not verifiable: observations across tasks include missing or invalid times"
      : `no same-signature failure streak reached threshold ${limit}`,
  };
}

// A resolved lookup covers only the exact recorded failure stretch, never later failures.
export function retryGate(artifact) {
  const wall = attemptWall(artifact);
  const current = wall.stop ? { signature: wall.signature, attempts: wall.attempts,
    digest: createHash("sha256").update(JSON.stringify({ signature: wall.signature, attempts: wall.attempts })).digest("hex") } : null;
  const saved = artifact?.retry_stop;
  if (["requires_search", "requires_arbitration"].includes(saved?.status)) return { blocked: true, stop: current ? { ...saved, ...current } : saved };
  if (current && !(saved?.status === "resolved" && saved.digest === current.digest)) return { blocked: true, stop: { ...current, status: "requires_search", reason: wall.reason } };
  return { blocked: false, stop: saved ?? null };
}

function sortableTime(at) {
  if (typeof at === "number" && Number.isInteger(at) && Number.isFinite(at) && Number.isFinite(new Date(at).getTime())) return at;
  if (typeof at === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(at)) {
    const parsed = Date.parse(at);
    const [, year, month, day] = at.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (Number.isFinite(parsed) && Number(month) >= 1 && Number(month) <= 12
      && Number(day) >= 1 && Number(day) <= new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate()) return parsed;
  }
  return Number.NaN;
}

function assertOperationId(id) {
  if (typeof id !== "string" || !OPERATION_ID.test(id)) {
    throw new Error("invalid operation id");
  }
}

// Transition evidence is appended rather than replacing the preceding state.
// A terminal success requires an explicit observed verification record.
export function transitionArtifact(artifact, { state, note, validity = {}, delta = null }) {
  if (["running", "finished", "verified", "certified", "closed"].includes(state) && retryGate(artifact).blocked) throw new Error("stop_and_search: pending retry gate prevents advancement");
  if (!VALID_STATES.has(state)) throw new Error(`invalid operation state: ${state}`);
  if (!VALID_STATES.has(artifact?.state)) throw new Error("Gate B missing required field: state");
  if (!TRANSITIONS[artifact.state]?.has(state)) {
    const reason = state === "closed" ? "verified state required" : `transition ${artifact.state} -> ${state} not allowed`;
    throw new Error(reason);
  }
  if (ADVANCING_STATES.has(state)) validateGateBContract(artifact);
  if (state === "closed" && !(artifact?.tasks ?? []).some((task) => task.state === "integrated")) {
    throw new Error("closed operation requires at least one integrated task with independent verification");
  }
  const recordedPartial = artifact.verification?.completion === "partial"
    && artifact.verification?.observed === true
    && Array.isArray(artifact.verification?.notCovered) && artifact.verification.notCovered.length > 0
    && (artifact.tasks ?? []).every(task => task.state === "integrated" || (task.state === "blocked" && typeof task.blocked?.cause === "string" && task.blocked.cause.trim()));
  if (state === "closed" && (artifact.state !== "verified" || (artifact.verification?.verified !== true && !recordedPartial))) {
    throw new Error("verified state required before closure");
  }
  const next = appendCheckpoint(artifact, { note, validity, delta });
  const transitioned = { ...next, state };
  return { ...transitioned, next_legitimate_action: nextLegitimateAction(transitioned) };
}

export function resumeArtifact(artifact) {
  if (!artifact || !VALID_STATES.has(artifact.state)) {
    return { allowed: false, reason: "invalid_state" };
  }
  if (["closed", "cancelled"].includes(artifact.state)) {
    return { allowed: false, reason: "terminal_state" };
  }
  if (!resumeAllowed(artifact.freshness)) {
    return { allowed: false, reason: "stale_premise" };
  }
  if (artifact.authority?.valid === false || artifact.authority?.revoked === true) {
    return { allowed: false, reason: "authority_invalid" };
  }
  return { allowed: true, reason: "fresh" };
}

// operationStatePath: both spellings of one place, so a receipt (which travels, and therefore
// carries a path relative to the root) and the writer (which needs an absolute one) cannot drift
// into naming two different directories. It delegates the id check to operationFile rather than
// repeating it: the id is interpolated into a path, and that is the only reason it is constrained.
export function operationStatePath(root, id) {
  // `root` is the project root and it is also what saveOperationState and loadOperationState take,
  // so a receipt naming FASES.md#<id> and the writer writing somewhere else is not a shape this
  // module can produce. The id is checked because it is interpolated into a marker.
  assertOperationId(id);
  return {
    directory: resolve(root),
    file: fasesFileOf(root),
    // POSIX separators on purpose: this string travels in a receipt, and a Windows path is not what
    // the person who reads it can click.
    relative: `${FASES_FILE}#${id}`,
  };
}

// El archivo del proyecto, sin id: el unico que decide donde esta el estado de todas las
// operaciones a la vez. Vive aqui para que la puerta no tenga que componer una ruta propia y acabe
// nombrando otro lugar que el de los recibos.
export function fasesFileOf(root) {
  return join(resolve(root), FASES_FILE);
}

// statePath: the shortest legal walk from one state to another, or null when there is none.
// TRANSITIONS is the only authority on what may follow what; this only reports a route inside it,
// which is why a run can record what happened without this module second-guessing the graph.
// Terminal states have no outgoing edge, so a closed or cancelled operation cannot be re-entered.
export function statePath(from, to) {
  if (!VALID_STATES.has(to)) throw new Error(`invalid operation state: ${to}`);
  if (!VALID_STATES.has(from)) throw new Error(`invalid operation state: ${from}`);
  if (from === to) return [];
  const queue = [[from]];
  const seen = new Set([from]);
  while (queue.length > 0) {
    const route = queue.shift();
    const head = route[route.length - 1];
    for (const next of TRANSITIONS[head]) {
      if (seen.has(next)) continue;
      const extended = [...route, next];
      if (next === to) return extended.slice(1);
      seen.add(next);
      queue.push(extended);
    }
  }
  return null;
}

const openMarker = (id) => `<!-- vespi:operacion ${id} -->`;
const closeMarker = (id) => `<!-- /vespi:operacion ${id} -->`;

// What survives a closure: who, what, how it ended and which receipt. Not the checkpoints, not the
// tasks, not the freshness: once verified and closed, a second copy of the progress is exactly the
// duplicate the single checkpoint exists to avoid.
function closureOf(artifact) {
  return {
    artifact_schema_version: artifact.artifact_schema_version,
    id: artifact.id,
    working_goal: artifact.working_goal,
    owner: artifact.owner,
    intent: artifact.intent,
    authority: artifact.authority,
    scope: artifact.scope,
    expected_effect: artifact.expected_effect,
    effect: artifact.effect ?? null,
    economy: artifact.economy ?? null,
    chain: artifact.chain ?? null,
    declared_effect: artifact.declared_effect ?? null,
    retry_stop: artifact.retry_stop ?? null,
    retry_searches: artifact.retry_searches ?? [],
    loaded: artifact.loaded ?? [],
    provenance: artifact.provenance ?? {},
    perturbations: artifact.perturbations ?? [],
    technology_choices: artifact.technology_choices ?? [],
    distilled_criteria: artifact.distilled_criteria ?? [],
    resolved_criteria: artifact.resolved_criteria ?? [],
    criterion_events: artifact.criterion_events ?? [],
    decisions: artifact.decisions ?? [],
    done: artifact.done,
    roles: artifact.roles,
    verifier: artifact.verifier,
    receipt: artifact.receipt,
    uncertainty: artifact.uncertainty ?? [],
    next_legitimate_action: artifact.next_legitimate_action,
    interaction_trace: artifact.interaction_trace ?? [],
    self_report: artifact.self_report ?? null,
    external_effect_requests: artifact.external_effect_requests ?? [],
    external_effect_approvals: artifact.external_effect_approvals ?? [],
    ...(artifact.coordinacion ? { coordinacion: artifact.coordinacion } : {}),
    state: artifact.state,
    closed_at: artifact.checkpoints?.at(-1)?.at ?? null,
    verification: artifact.verification ?? null,
    last_receipt: artifact.last_receipt ?? null,
    task_reviews: (artifact.tasks ?? []).map(task => ({
      task_id: task.id,
      received: task.received ?? null,
      review: task.review ?? null,
      review_history: task.review_history ?? [],
    })),
  };
}

// Texto libre dentro de una linea de titulo: una sola linea, sin marcadores de bloque ni vallas de codigo. El dato original
// vive intacto en el JSON embebido; esto es solo lo que se ve.
function inline(value) {
  return String(value ?? "")
    .replace(/[\r\n\u2028\u2029]+/g, " ")
    .replace(/</g, "&lt;")
    .replace(/`/g, "'")
    .trim();
}

// El JSON embebido nunca lleva «<» ni la valla de codigo en crudo: ningun marcador ni cierre de bloque puede aparecer dentro
// de un dato, y JSON.parse devuelve el texto tal como se guardo.
function embeddedJson(payload) {
  return JSON.stringify(payload, null, 2).replace(/</g, "\\u003c").replace(/`/g, "\\u0060");
}

function renderBlock(artifact, eol) {
  const terminal = ["closed", "cancelled"].includes(artifact.state);
  const payload = terminal ? closureOf(artifact) : artifact;
  const lines = terminal
    ? [
        `### Operación ${artifact.id} — ${artifact.state === "closed" ? "cerrada" : "cancelada"}`,
        "",
        `- Objetivo: ${inline(artifact.working_goal) || "(sin especificar)"}`,
        `- Responsable: ${inline(artifact.owner) || "(sin asignar)"}`,
        `- Verificación: ${artifact.verification?.verified === true ? "observada" : artifact.verification?.completion === "partial" && artifact.verification?.observed === true ? "parcial observada" : "no registrada"}${artifact.last_receipt?.digest ? ` · recibo ${String(artifact.last_receipt.digest).slice(0, 12)}…` : ""}`,
      ]
    : [
        `### Operación ${artifact.id} — ${inline(artifact.working_goal) || "(sin objetivo)"}`,
        "",
        `- Estado: ${artifact.state} · Responsable: ${inline(artifact.owner) || "(sin asignar)"}`,
        `- Próxima acción legítima: ${inline(artifact.next_legitimate_action) || "(sin definir)"}`,
        `- Último checkpoint: ${inline(artifact.checkpoints?.at(-1)?.at) || "desconocido"}`,
      ];
  return [
    openMarker(artifact.id),
    ...lines,
    "",
    "```json",
    embeddedJson(payload).replace(/\n/g, eol),
    "```",
    closeMarker(artifact.id),
  ].join(eol);
}

// Un marcador cuenta solo al comienzo de una linea, y cada uno aparece una vez: un marcador repetido es un archivo que alguien
// edito o falsifico, y no se adivina cual es el verdadero.
function positionsOf(text, marker) {
  const found = [];
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  for (const match of text.matchAll(new RegExp("^" + escaped + "[ \\t]*$", "gm"))) {
    found.push({ start: match.index, end: match.index + marker.length });
  }
  return found;
}

function locateBlock(text, id) {
  const opens = positionsOf(text, openMarker(id));
  const closes = positionsOf(text, closeMarker(id));
  if (opens.length === 0 && closes.length === 0) return null;
  if (opens.length > 1 || closes.length > 1) {
    throw new Error("operation block duplicated in FASES.md: " + id + " has " + opens.length + " openings and " + closes.length + " closings");
  }
  if (opens.length === 0) throw new Error("operation block damaged in FASES.md: " + id + " closes and never opens");
  if (closes.length === 0 || closes[0].start < opens[0].start) throw new Error("operation block damaged in FASES.md: " + id + " opens and never closes");
  return { start: opens[0].start, end: closes[0].end };
}

export async function saveOperationState(root, artifact) {
  const { file } = operationStatePath(root, artifact?.id);
  let text = "";
  try { text = await readFile(file, "utf8"); } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const block = renderBlock(artifact, eol);
  const found = locateBlock(text, artifact.id);
  let next;
  if (found) {
    next = text.slice(0, found.start) + block + text.slice(found.end);
  } else if (text.length === 0) {
    next = `# FASES${eol}${eol}${OPERATIONS_HEADING}${eol}${eol}${block}${eol}`;
  } else if (text.includes(`${eol}${OPERATIONS_HEADING}${eol}`) || text.startsWith(`${OPERATIONS_HEADING}${eol}`)) {
    const at = text.indexOf(OPERATIONS_HEADING) + OPERATIONS_HEADING.length;
    next = text.slice(0, at) + eol + eol + block + text.slice(at);
  } else {
    next = text.replace(/\s*$/, "") + `${eol}${eol}${OPERATIONS_HEADING}${eol}${eol}${block}${eol}`;
  }
  await mkdir(dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(temporary, next, { encoding: "utf8", flag: "wx" });
    await rename(temporary, file);
  } catch (error) {
    // A failed atomic replacement must not leave a misleading temporary file next to FASES.md.
    const { rm } = await import("node:fs/promises");
    await rm(temporary, { force: true }).catch(() => {});
    throw error;
  }
  return file;
}

// El parseo de un bloque, y solo este: decide que es una operacion y que su estado es valido. Un
// lector que prometiera y otro que no, cada uno con su copia, serian dos verdades sobre el mismo
// archivo; por eso los dos caminos de abajo —el que promete y el que ya tiene el archivo en la
// mano— pasan por aqui y no por codigo parecido.
function parseBlock(text, id) {
  // El id se valida aqui y no en quien compone la ruta: es lo unico que se interpola en un marcador
  // y en un nombre de archivo, y un lector que se saltara la comprobacion abriria la puerta a un
  // id que sale del directorio. Los dos caminos de lectura pasan por esta misma linea.
  assertOperationId(id);
  const found = locateBlock(text, id);
  if (!found) throw new Error(`operation not found in FASES.md: ${id}`);
  const block = text.slice(found.start, found.end);
  const match = block.match(/```json\s*([\s\S]*?)\s*```/);
  if (!match) throw new Error(`operation state missing embedded JSON: ${id}`);
  const artifact = JSON.parse(match[1]);
  if (artifact.id !== id || !VALID_STATES.has(artifact.state)) {
    throw new Error(`invalid persisted operation state: ${id}`);
  }
  return artifact;
}

// Un FASES.md que no esta todavia no es un error de lectura: es un proyecto donde nadie abrio una
// operacion. Un error de verdad si se propaga, porque un disco que no responde no se lee como
// «no hay nada». Ojo: esto tiene que ser `async` — un `try` alrededor de una promesa rechazada no la
// alcanza, y el ENOENT se escaparia como error de lectura de un archivo que si existe en el proyecto.
async function readFases(file) {
  try {
    return await readFile(file, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return "";
  }
}

function readFasesNow(file) {
  try {
    return readFileSync(file, "utf8");
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return "";
  }
}

export async function loadOperationState(root, id) {
  return parseBlock(await readFases(fasesFileOf(root)), id);
}

// El mismo lector, sin promesa. El hook que abre la sesion vive dentro de una funcion sincrona y
// no puede esperar una sin reescribir el adaptador entero que lo invoca; este es el unico modo de
// que el recordatorio de la apertura pueda devolver el veredicto y no el lugar donde vive.
export function loadOperationStateSync(root, id) {
  return parseBlock(readFasesNow(fasesFileOf(root)), id);
}

// Las operaciones que FASES.md declara, en el orden en que estan. El marcador cuenta con la misma
// regla que en el resto del modulo —al comienzo de una linea— y un id repetido se cuenta una vez:
// duplicar el nombre no crea dos operaciones, y adivinar cual de los dos bloques es el bueno ya lo
// rechaza `locateBlock` al leer ese id.
const OPERATION_MARKER = /^<!-- vespi:operacion ([a-z0-9]+(?:-[a-z0-9]+)*) -->[ \t]*$/gm;

export function listOperationIds(root) {
  const text = readFasesNow(fasesFileOf(root));
  return [...new Set([...text.matchAll(OPERATION_MARKER)].map((match) => match[1]))];
}

// --- la puerta de entrada ------------------------------------------------------
//
// `resumeOperation` responde a la pregunta de quien YA sabe que hay una operacion. Esta responde a la
// anterior —si hay algo abierto, y cual es el primer paso— y por eso no recibe un id: lee FASES.md.
//
// No reimplementa el veredicto. El que devuelve es `resumeArtifact`, la misma funcion que
// `resumeOperation` pide, sobre el mismo artefacto que el lector de arriba lee. Lo que anade es una
// sola cosa, y es la que faltaba: el archivo exacto donde esa operacion esta escrita, porque un
// veredicto que no nombra donde esta no se puede usar. Una puerta sin el archivo es el puntero que
// ya existia, con otro nombre.

// Cerrada o cancelada no es «abierta», y quien lo decide es el grafo: `resumeArtifact` ya separa los
// estados sin arista de salida y los llama `terminal_state`. La puerta no escribe una lista terminal
// propia —una segunda lista seria una segunda verdad sobre el mismo grafo—: usa el veredicto que ya
// hace falta pedir, y solo lo usa para nombrar cual es la abierta.
function esTerminal(verdict) {
  return verdict.allowed === false && verdict.reason === "terminal_state";
}

// El comando que desbloquea una tarea en cada estado en que puede quedarse. Cada entrada nombra un
// subcomando que la CLI ya expone para exactamente ese estado: no es una politica nueva, es el
// nombre de la puerta que ya existe. Un estado que no este en la tabla no se adivina: es `decide`.
const NEXT_FOR_TASK = {
  proposed: "dispatch",
  running: "receive",
  blocked: "resolve",
  received: "review",
  reviewed: "verify",
  verified: "integrate",
};

// Esta proyecta `artifact.tasks` y no llama a `taskSummary` del coordinador: este modulo no importa
// el coordinador —no puede, porque el coordinador tira del kernel— y una vista de tareas escrita
// dos veces seria dos verdades sobre el mismo arreglo. Los campos que salen son los de la puerta:
// quien tiene pendiente cada cosa, en que estado, y el archivo que esa tarea tiene que dejar.
//
// `due_at` viaja porque es el dato del reloj, y aqui no se puede consultar: este modulo no importa
// el kernel y su cierre de imports esta congelado. Consultarlo es de quien puede—the CLI—, asi que
// lo que sale de la puerta es la fecha y la decision de vencido se toma una sola vez, en el kernel.
function pendingByRole(artifact) {
  const porRol = new Map();
  for (const task of artifact?.tasks ?? []) {
    if (task.state === "integrated") continue;
    const role = task.role ?? "unknown";
    if (!porRol.has(role)) porRol.set(role, []);
    porRol.get(role).push({
      id: task.id,
      state: task.state,
      output: task.output?.path ?? null,
      due_at: task.due_at ?? null,
    });
  }
  return [...porRol.entries()].map(([role, tasks]) => ({ role, tasks }));
}

function nextStep(artifact, pending) {
  // Nadie autorizo a correr: lo primero sigue siendo la autorizacion, y ningun comando de tarea
  // puede adelantarla (la misma razon por la que `prepared` no es despachable en el coordinador).
  if (artifact.state === "prepared") return "authorize";
  const first = pending[0]?.tasks?.[0];
  if (first) return `${NEXT_FOR_TASK[first.state] ?? "decide"} ${first.id}`;
  // Nada pendiente y tampoco nada que cerrar: la operacion esta esperando una decision de quien
  // coordina, y nombrarla asi es mas honesto que inventar un paso.
  return (artifact.tasks ?? []).length > 0 ? "close" : "decide";
}

// La próxima acción durable se deriva del mismo arreglo que alimenta operationEntry.
export function nextLegitimateAction(artifact) {
  if (["closed", "cancelled"].includes(artifact?.state)) return "none";
  if (artifact?.state === "prepared") return "authorize";
  const retry = retryGate(artifact);
  if (retry.blocked) return retry.stop.status === "requires_arbitration" ? "arbitrate_retry_search" : "stop_and_search";
  const pending = pendingByRole(artifact);
  const first = pending[0]?.tasks?.[0];
  if (first?.blocked?.cause === "retry-ready" && artifact.retry_stop?.status === "resolved") return `dispatch ${first.id}`;
  if (first) return `${NEXT_FOR_TASK[first.state] ?? "decide"} ${first.id}`;
  if (artifact?.state === "unknown") return "reconcile";
  if (artifact?.state === "blocked") return "decide";
  return (artifact?.tasks ?? []).length > 0 ? "close" : "plan";
}

// Lo que hay abierto bajo `root`, o que no hay nada. Nunca lanza por no encontrar una operacion:
// eso es la respuesta normal de la puerta. Si FASES.md esta danado, el error sube: una puerta que
// adivina cual de los dos bloques repetidos era el bueno no es una puerta.
export function operationEntry({ root } = {}) {
  const abiertas = [];
  const cerradas = [];
  for (const id of listOperationIds(root)) {
    const artifact = loadOperationStateSync(root, id);
    const verdict = resumeArtifact(artifact);
    if (esTerminal(verdict)) cerradas.push(id);
    else abiertas.push({ artifact, verdict });
  }
  if (abiertas.length === 0) {
    return { open: false, state: "none", file: FASES_FILE, file_to_open: fasesFileOf(root), closed: cerradas.length };
  }
  const [{ artifact, verdict }] = abiertas;
  const { file, relative } = operationStatePath(root, artifact.id);
  const pending = pendingByRole(artifact);
  return {
    open: true,
    id: artifact.id,
    state: artifact.state,
    allowed: verdict.allowed,
    reason: verdict.reason,
    next_step: nextStep(artifact, pending),
    // Lo que el artefacto DECLARA como siguiente accion, tal cual. Viaja aparte de `next_step`
    // porque los dos no son lo mismo: esta se escribe sola al nacer la operacion y el camino por
    // comandos nunca la actualiza, asi que repetirla como si un recibo la hubiera puesto seria
    // hacer decir a la puerta algo que el kernel no dijo.
    declared_next_action: artifact.next_legitimate_action ?? null,
    pending_by_role: pending,
    file: relative,
    file_to_open: file,
    // Si hubiera mas de una abierta, la puerta no elige una y esconde la otra: nombra las demas.
    also_open: abiertas.slice(1).map(({ artifact: each }) => each.id),
    closed: cerradas.length,
  };
}

// governable: only ACTIVE blocks govern the present. HISTORY is true without
// governing; REVALIDATE waits for revalidation.
export function governable(block) {
  return block?.status === "ACTIVE";
}

// resumeAllowed: every stale subject with material currentness blocks silent
// resume. RESUME is not a re-interview: fresh subjects pass silently.
export function resumeAllowed(freshness) {
  if (!Array.isArray(freshness) || freshness.length === 0) return true;
  return !freshness.some((f) => f?.result === "stale");
}

// open items: BLOCKING resolves before the border; NON_BLOCKING and
// DEFERRED_WATCH ride along. VIABLE_WITH_OPEN_ITEMS is a valid state;
// a positive signal is not a closed state.
export function viableWithOpen(openItems) {
  if (!Array.isArray(openItems) || openItems.length === 0) return true;
  return !openItems.some((i) => i?.impact === "BLOCKING");
}

// certify: FINISHED (executor done) != VERIFIED (facts checked) !=
// CERTIFIED (enabled authority decides under its responsibility) != CLOSED.
// Closure may be delegated; self-certification must be explicitly earned.
export function certify({ finished, verified, authority, selfCertified }) {
  if (!finished) return "open";
  if (!verified) return "finished_unverified";
  if (selfCertified === true && authority?.maySelfCertify !== true) return "finished_verified_uncertified";
  if (authority?.certified === true) return "closed";
  return "finished_verified_uncertified";
}

// reconcileForeign: Vespi was absent; a foreign owner changed its own state.
// Detect, preserve provenance, claim nothing. Never requires the change to
// have passed through Vespi.
export function reconcileForeign({ foreignDelta }) {
  const by = foreignDelta?.by ?? "unknown";
  return {
    provenance: { adopted_by: by, proposal_source: by },
    claimsAuthorship: false,
    claimsAuthority: false,
    delta: foreignDelta ?? null,
    decision: "revalidate",
  };
}

// successor: purpose truly changed — new identity with visible lineage.
// No graph; one predecessor link, reason, and transition authority.
export function successor(artifact, { reason, authority }) {
  const now = new Date().toISOString();
  return {
    artifact_schema_version: ARTIFACT_SCHEMA_VERSION,
    created_by_vespi_version: "2.4.9-rc.3",
    id: `${artifact.id}-s${now.replace(/[^0-9]/g, "").slice(-6)}`,
    predecessor: artifact.id,
    succession_reason: reason ?? "",
    succession_authority: authority ?? "",
    working_goal: artifact.working_goal,
    owner: artifact.owner,
    state: "prepared",
    authority: artifact.authority,
    loaded: [],
    checkpoints: [{ id: "R1-genesis", at: now, note: "R1-genesis", validity: {} }],
  };
}
