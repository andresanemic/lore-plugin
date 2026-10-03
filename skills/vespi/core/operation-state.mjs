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
import { dirname, join, resolve } from "node:path";

let seq = 0;

export function createArtifact({ goal, owner, authority = { spend: [] } }) {
  const now = new Date().toISOString();
  return {
    artifact_schema_version: ARTIFACT_SCHEMA_VERSION,
    created_by_vespi_version: "2.4.9-rc.3",
    id: `op-${Date.now().toString(36)}-${seq++}`,
    working_goal: goal ?? "",
    owner: owner ?? "",
    state: "prepared",
    authority,
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
const OPERATION_ID = /^op-[a-z0-9]+(?:-[a-z0-9]+)*$/;

function assertOperationId(id) {
  if (typeof id !== "string" || !OPERATION_ID.test(id)) {
    throw new Error("invalid operation id");
  }
}

// Transition evidence is appended rather than replacing the preceding state.
// A terminal success requires an explicit observed verification record.
export function transitionArtifact(artifact, { state, note, validity = {}, delta = null }) {
  if (!VALID_STATES.has(state)) throw new Error(`invalid operation state: ${state}`);
  if (!TRANSITIONS[artifact.state]?.has(state)) {
    const reason = state === "closed" ? "verified state required" : `transition ${artifact.state} -> ${state} not allowed`;
    throw new Error(reason);
  }
  if (state === "closed" && (artifact.state !== "verified" || artifact.verification?.verified !== true)) {
    throw new Error("verified state required before closure");
  }
  const next = appendCheckpoint(artifact, { note, validity, delta });
  return { ...next, state };
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
  const directory = resolve(root);
  return {
    directory,
    file: join(directory, FASES_FILE),
    // POSIX separators on purpose: this string travels in a receipt, and a Windows path is not what
    // the person who reads it can click.
    relative: `${FASES_FILE}#${id}`,
  };
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
    state: artifact.state,
    closed_at: artifact.checkpoints?.at(-1)?.at ?? null,
    verification: artifact.verification ?? null,
    last_receipt: artifact.last_receipt ?? null,
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
        `- Verificación: ${artifact.verification?.verified === true ? "observada" : "no registrada"}${artifact.last_receipt?.digest ? ` · recibo ${String(artifact.last_receipt.digest).slice(0, 12)}…` : ""}`,
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

export async function loadOperationState(root, id) {
  const { file } = operationStatePath(root, id);
  let text = "";
  try { text = await readFile(file, "utf8"); } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
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
