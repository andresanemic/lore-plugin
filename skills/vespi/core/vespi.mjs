// vespi core facade — RC3 experimental.
// Ported kernel (operation/authority/receipt/continuity/delegation/time: a 3-line provenance header,
// then exact bytes from the pinned Vespi kernel 0.1.4, commit 221bfa02fe277281d50b6141ec10299eea3426f3,
// branch release/0.1.4-prep, canonical source founder/proyectos/vespi/kernel/src/ —
// digests in ./kernel/SOURCE.md; pinned snapshot, never edited in place)
// plus RC3 truthfulness wrappers. No scheduler, no router, no managers.
import { createRequire } from "node:module";

// The durable operation state, imported and re-exported whole rather than half: an agent is told to
// import one module, and a surface split across two files is a surface it will not find. Nothing
// here re-decides it - these are the same functions operation-state.mjs exposes, and the graph of
// legal transitions still lives there.
import {
  ARTIFACT_SCHEMA_VERSION,
  FASES_FILE,
  OPERATIONS_HEADING,
  appendCheckpoint,
  certify,
  createArtifact,
  governable,
  listOperationIds,
  loadOperationState,
  operationEntry,
  operationStatePath,
  reconcileForeign,
  resumeAllowed,
  resumeArtifact,
  saveOperationState,
  statePath,
  successor,
  transitionArtifact,
  viableWithOpen,
} from "./operation-state.mjs";

export {
  ARTIFACT_SCHEMA_VERSION,
  FASES_FILE,
  OPERATIONS_HEADING,
  appendCheckpoint,
  certify,
  createArtifact,
  governable,
  listOperationIds,
  loadOperationState,
  operationEntry,
  operationStatePath,
  reconcileForeign,
  resumeAllowed,
  resumeArtifact,
  saveOperationState,
  statePath,
  successor,
  transitionArtifact,
  viableWithOpen,
};

// El coordinador vive en su propio modulo y entra por la fachada como el resto: un llamador importa
// una sola ruta. Lo que el coordinador decide sobre una tarea (quien la ejecuta, si queda bloqueada,
// cuando se observa) se apoya en el grafo de estados de operation-state y en routeOperation de aqui.
import {
  closeOperation,
  calibrateEstimates,
  declareEffect,
  dispatchTask,
  integrateTask,
  observeTask,
  planTask,
  receiveTask,
  reviewTask,
  taskSummary,
  verifyTask,
} from "./coordinator.mjs";

export {
  closeOperation,
  calibrateEstimates,
  declareEffect,
  dispatchTask,
  integrateTask,
  observeTask,
  planTask,
  receiveTask,
  reviewTask,
  taskSummary,
  verifyTask,
};

const require = createRequire(import.meta.url);
const kernel = require("./kernel/operation.js");
require("./kernel/authority.js");
require("./kernel/receipt.js");
require("./kernel/continuity.js");
const delegationKernel = require("./kernel/delegation.js");

export const { createOperation, runOperation, STATES } = kernel;

// --- Capacidades opcionales del kernel ------------------------------------------------------------
//
// Estas cuatro capacidades no son conducta del kit: son superficies que el kernel ofrece y que el
// acuerdo tiene que nombrar para que se usen. Se reexportan enteras, con el nombre que el kernel les
// da y el mismo objeto, sin redecidir permiso, permiso de uso, liquidacion, verificacion ni recibo.
//
// PRESENTES es lo unico que decide si algo se expone: se lee el directorio vendorizado, no una lista
// escrita a mano. Un modulo que no esta en la copia no se inventa, no se rellena con un stub y no se
// simula: el nombre queda con valor undefined y OPTIONAL_CAPABILITIES lo dice. Cuando el coordinador
// vendorice el corte final, lo que llegue queda expuesto sin editar una sola lista.
//
// Lo que NO se expone, y por que:
// - zk-bn254-reference.js: la referencia declara en su propia documentacion que es experimental y no
//   auditada. Su presencia fisica en la copia es parte del conjunto vendorizado; no es un backend del
//   kit y ninguna ruta de aqui la activa.
// - authority-narrowing.js: cubre solo {spend}, rechaza multifirma y pausers, y comparar dos
//   instantaneas sin reservar saldo podria borrar restricciones que el kit si conserva. No hay
//   consumidor demostrado que lo necesite.
// - COVERED_CHECKS, FP_MODULUS, SCALAR_MODULUS de zk.js: un Set mutable y aritmetica de campos. La
//   fachada no necesita abrirlos para usar el puerto.
const OPTIONAL_SURFACE = {
  emergency: {
    module: "emergency",
    names: [
      "createEmergencyPermission",
      "createEmergencyLedger",
      "exerciseEmergency",
      "reviewEmergencyUse",
      "pauseEmergencyPermission",
      "resumeEmergencyPermission",
      "revokeEmergencyPermission",
      "getEmergencyState",
      "renewEmergencyPermission",
    ],
  },
  provenance: {
    module: "skill-provenance",
    names: [
      "registerSkillProvenance",
      "verifySkillProvenance",
      "authorizeSkill",
      "loadSkill",
      "buildSkillReceipt",
      "listSkillProvenance",
      "SKILL_PROVENANCE_STATUSES",
    ],
  },
  x402: {
    module: "x402",
    names: ["createX402Payment", "selectX402Terms", "createMemoryPaymentClaims"],
  },
  zk: {
    module: "zk",
    // LIMIT_CHECKS, VK_SCHEMA y EVIDENCE_SCHEMA salen con prefijo ZK_: son nombres NUEVOS del kit, con
    // alias explicito, porque una fachada que reexporta cuatro	Check_keys y cuatro LIMIT_CHECKS de dos
    // capacidades distintas se lee como una sola.
    names: [
      "createZkVerifier",
      "digestZkVerificationKey",
      "readZkEvidence",
      "readZkClaim",
      "reconcileZk",
      "claimsZk",
      "ZK_CHECK_KEYS",
      "LIMIT_CHECKS:ZK_LIMIT_CHECKS",
      "VK_SCHEMA:ZK_VK_SCHEMA",
      "EVIDENCE_SCHEMA:ZK_EVIDENCE_SCHEMA",
    ],
  },
};

// Un modulo ausente no es un error: es el estado normal de una copia que todavia no lo trae.
function optionalKernelModule(name) {
  try {
    const loaded = require(`./kernel/${name}.js`);
    return typeof loaded === "object" && loaded !== null ? loaded : null;
  } catch (err) {
    if (err?.code === "MODULE_NOT_FOUND" && String(err.message).includes(`${name}.js`)) return null;
    throw err;
  }
}

const OPTIONAL_LOADED = {};
const OPTIONAL_STATE = {};
for (const [capability, spec] of Object.entries(OPTIONAL_SURFACE)) {
  const loaded = optionalKernelModule(spec.module);
  const exposed = {};
  const missing = [];
  for (const entry of spec.names) {
    const [from, to = from] = entry.split(":");
    // Si el modulo no trae el nombre, tampoco se inventa: se dice cual falta y se sigue.
    if (loaded !== null && loaded[from] !== undefined) exposed[to] = loaded[from];
    else missing.push(from);
  }
  OPTIONAL_LOADED[capability] = exposed;
  OPTIONAL_STATE[capability] = Object.freeze({
    present: loaded !== null,
    module: loaded === null ? null : `./kernel/${spec.module}.js`,
    exposed: Object.freeze(Object.keys(exposed)),
    missing: Object.freeze(missing),
  });
}

// Que capacidades trajo la copia vendorizada y cuales no. Se lee antes de usar ninguna, y es lo que
// permite a un consumidor decir "no tengo ZK" sin adivinarlo por un error de importacion.
export const OPTIONAL_CAPABILITIES = Object.freeze(OPTIONAL_STATE);

// Identidad con el modulo, no copia: lo que el kernel liga con WeakMap (el grantor de una emergencia,
// el registro de procedencia) tiene que seguir siendo el del MISMO objeto de este require.
export const createEmergencyPermission = OPTIONAL_LOADED.emergency.createEmergencyPermission;
export const createEmergencyLedger = OPTIONAL_LOADED.emergency.createEmergencyLedger;
export const exerciseEmergency = OPTIONAL_LOADED.emergency.exerciseEmergency;
export const reviewEmergencyUse = OPTIONAL_LOADED.emergency.reviewEmergencyUse;
export const pauseEmergencyPermission = OPTIONAL_LOADED.emergency.pauseEmergencyPermission;
export const resumeEmergencyPermission = OPTIONAL_LOADED.emergency.resumeEmergencyPermission;
export const revokeEmergencyPermission = OPTIONAL_LOADED.emergency.revokeEmergencyPermission;
export const getEmergencyState = OPTIONAL_LOADED.emergency.getEmergencyState;
export const renewEmergencyPermission = OPTIONAL_LOADED.emergency.renewEmergencyPermission;

export const registerSkillProvenance = OPTIONAL_LOADED.provenance.registerSkillProvenance;
export const verifySkillProvenance = OPTIONAL_LOADED.provenance.verifySkillProvenance;
export const authorizeSkill = OPTIONAL_LOADED.provenance.authorizeSkill;
export const loadSkill = OPTIONAL_LOADED.provenance.loadSkill;
export const buildSkillReceipt = OPTIONAL_LOADED.provenance.buildSkillReceipt;
export const listSkillProvenance = OPTIONAL_LOADED.provenance.listSkillProvenance;
export const SKILL_PROVENANCE_STATUSES = OPTIONAL_LOADED.provenance.SKILL_PROVENANCE_STATUSES;

export const createX402Payment = OPTIONAL_LOADED.x402.createX402Payment;
export const selectX402Terms = OPTIONAL_LOADED.x402.selectX402Terms;
export const createMemoryPaymentClaims = OPTIONAL_LOADED.x402.createMemoryPaymentClaims;

export const createZkVerifier = OPTIONAL_LOADED.zk.createZkVerifier;
export const digestZkVerificationKey = OPTIONAL_LOADED.zk.digestZkVerificationKey;
export const readZkEvidence = OPTIONAL_LOADED.zk.readZkEvidence;
export const readZkClaim = OPTIONAL_LOADED.zk.readZkClaim;
export const reconcileZk = OPTIONAL_LOADED.zk.reconcileZk;
export const claimsZk = OPTIONAL_LOADED.zk.claimsZk;
export const ZK_CHECK_KEYS = OPTIONAL_LOADED.zk.ZK_CHECK_KEYS;
export const ZK_LIMIT_CHECKS = OPTIONAL_LOADED.zk.ZK_LIMIT_CHECKS;
export const ZK_VK_SCHEMA = OPTIONAL_LOADED.zk.ZK_VK_SCHEMA;
export const ZK_EVIDENCE_SCHEMA = OPTIONAL_LOADED.zk.ZK_EVIDENCE_SCHEMA;

// K7 re-exported whole: the orchestrator's review gate lives in the kernel and this facade does
// not re-decide it. What the host hands back from a delegated run is a message, not a result, so
// the orchestrator fills these in from what it observed itself — nothing here infers a delegate's
// touched files, verified anything, or failed to start.
//
// The receipt comes back sealed and untouched. The kernel's `delegationReceipt` seals the digest
// over every field it builds, so stamping a persistence owner on it afterwards would break the
// seal the same `verifyReceipt` in this kit is there to check; where a delegation receipt lives is
// the caller's to say out loud, as the kernel says itself: the receipt is not durable by itself.
export const {
  createDelegation,
  recordStart,
  recordResult,
  reviewDelegation,
  recordCard,
  delegationReceipt,
  integrateDelegation,
  personView,
} = delegationKernel;

function sameTerms(declared, effective) {
  if (!declared || !effective) return false;
  for (const k of ["asset", "amount", "to", "network", "contract", "scheme"]) {
    if (declared[k] !== undefined && effective[k] !== undefined && declared[k] !== effective[k]) return false;
  }
  return true;
}

// runBoundedOperation: effect-level authority before the side-effect border.
// capability may expose effectiveTerms() describing the REAL effect about to
// occur. If it diverges from declaredEffect, perform is never called.
export async function runBoundedOperation(opSpec, capability, io = {}) {
  const op = kernel.createOperation({ goal: opSpec.goal, authority: opSpec.authority });
  const declared = io.declaredEffect ?? null;
  if (declared && typeof capability.effectiveTerms === "function") {
    let effective;
    try {
      effective = await capability.effectiveTerms();
    } catch (err) {
      return failReceipt(op, capability, `effective terms unreadable: ${msg(err)}`);
    }
    if (!sameTerms(declared, effective)) {
      return failReceipt(op, capability, `effective terms diverge from declared effect`);
    }
  }
  const out = await kernel.runOperation(op, capability, io);
  out.receipt.persistence = io.persistence ?? { owner: "none" };
  return out;
}

function failReceipt(op, capability, detail) {
  const receipt = {
    status: "failed",
    operation: { id: op.id, goal: op.goal },
    capability: capability?.id ?? "unknown",
    authority: { grants: [], exercised: [] },
    outcome: "failed",
    evidence: null,
    verification: null,
    detail,
    persistence: { owner: "none" },
    at: new Date().toISOString(),
  };
  return { status: "failed", receipt, output: undefined };
}

function msg(e) {
  try {
    return e?.message ?? String(e);
  } catch {
    return "unknown error";
  }
}

// validateReceipt: persistence declaration is mandatory. Truthful and
// ephemeral is valid; persistent and false is a defect, not a shape error.
export function validateReceipt(receipt) {
  const p = receipt?.persistence;
  if (!p || typeof p.owner !== "string" || p.owner.length === 0) {
    throw new Error("receipt missing persistence declaration (owner or explicit none)");
  }
  return true;
}

// mayRetry: UNKNOWN effects reconcile first — never blind retry.
export function mayRetry(receipt) {
  if (receipt?.status === "not_verified" && receipt?.reconciliation === "required") return false;
  if (receipt?.status === "not_verified" && receipt?.reconciliation === "reconciled-absent") return true;
  return receipt?.status === "verified";
}

// classifyOutcome: HAPPENED needs positive evidence; NOT_HAPPENED needs
// negative-capable evidence; otherwise UNKNOWN.
export function classifyOutcome({ verified, negativeEvidence }) {
  if (verified === true) return "HAPPENED";
  if (negativeEvidence === true) return "NOT_HAPPENED";
  return "UNKNOWN";
}

// proposeHandoff: anything worth keeping leaves as evidence / proposal /
// question with source and provenance for save-to-lore arbitration.
// It carries no write instruction: Vespi never writes Lore directly.
export function proposeHandoff({ kind, evidence, provenance, source }) {
  if (!["evidence", "proposal", "question", "refusal"].includes(kind)) {
    throw new Error("handoff kind must be evidence, proposal, question, or refusal");
  }
  if (!source) throw new Error("handoff requires a source");
  return { kind, evidence: evidence ?? null, provenance: provenance ?? {}, source, writesLore: false };
}
const HOST_ROUTES = {
  direct: { tool: null, label: "this process" },
  delegation: { tool: "delegate", label: "a subagent the host offers" },
  advisor: { tool: "decide", label: "a decision model that advises" },
  daimon: { tool: "execute", label: "the host-side executor" },
};

export function routeOperation({ intent = "direct", host = {} } = {}) {
  if (!Object.prototype.hasOwnProperty.call(HOST_ROUTES, intent)) {
    return {
      intent,
      route: null,
      tool: null,
      available: false,
      blocked: true,
      reason: `unknown execution route: ${String(intent)}`,
    };
  }
  const { tool, label } = HOST_ROUTES[intent];
  if (tool === null) {
    return { intent, route: intent, tool: null, available: true, blocked: false, reason: label };
  }
  const exposed = typeof host?.[tool] === "function";
  return {
    intent,
    route: exposed ? intent : null,
    tool,
    available: exposed,
    blocked: !exposed,
    reason: exposed
      ? `the host exposes ${tool} (${label})`
      : `the host does not expose ${tool} (${label})`,
  };
}

function blockedCapability(route) {
  return {
    id: `blocked:${route.intent}`,
    required: () => ({ impossible: true, reason: route.reason }),
    perform: () => {
      throw new Error("unreachable: a route the host does not expose never performs");
    },
  };
}

function effectiveCapability({ capability, route, host, assignment }) {
  if (route.blocked) return blockedCapability(route);
  if (typeof capability?.required !== "function" || typeof capability?.perform !== "function") {
    throw new Error("runDurableOperation needs a capability with required() and perform()");
  }
  if (route.intent === "delegation" && typeof host?.delegate === "function") {
    // Internal adapter contract: the outer host adapter supplies delegate(request). This is not an
    // OpenCode/Claude/Codex native signature. Keep authorization in the kernel, then route the
    // already-authorized effect through the adapter instead of silently running local capability.
    return {
      id: capability.id ?? `host:${route.tool}`,
      required: (...args) => capability.required.apply(capability, args),
      // A declared effect must be checked against the adapter's actual remote effect. If the
      // adapter cannot report it, return null so runBoundedOperation fails closed.
      effectiveTerms: async () => {
        if (typeof host.delegate.effectiveTerms !== "function") return null;
        return host.delegate.effectiveTerms({ assignment });
      },
      perform: ({ operation, authority, signal }) => host.delegate({ operation, assignment, authority, signal }),
    };
  }
  return capability;
}

function wiredIo({ io, route, host }) {
  const merged = { ...io };
  if (route.intent === "advisor" && typeof merged.decide !== "function" && typeof host?.decide === "function") {
    merged.decide = host.decide;
  }
  return merged;
}

const STATE_BY_RECEIPT = {
  verified: "verified",
  not_verified: "unknown",
  blocked: "blocked",
  failed: "blocked",
  needs_human_decision: "requires_decision",
  paused: "paused",
};

const NEXT_ACTION_BY_RECEIPT = {
  verified: "certify",
  not_verified: "reconcile",
  blocked: "decide",
  failed: "decide",
  needs_human_decision: "decide",
  paused: "resume",
};

function receiptNote(receipt) {
  const status = receipt?.status ?? "failed";
  const detail = typeof receipt?.detail === "string" && receipt.detail.length > 0 ? `: ${receipt.detail}` : "";
  return `receipt ${status}${detail}`;
}

function advanceTo(artifact, target, note) {
  if (artifact.state === target) {
    return { ...appendCheckpoint(artifact, { note }), state: target };
  }
  const path = statePath(artifact.state, target);
  if (path === null) {
    return {
      ...appendCheckpoint(artifact, { note: `${note} (state ${artifact.state} cannot reach ${target})` }),
      uncertainty: [...(artifact.uncertainty ?? []), `no legal transition from ${artifact.state} to ${target}`],
    };
  }
  let next = artifact;
  path.forEach((state, index) => {
    next = transitionArtifact(next, { state, note: index === path.length - 1 ? note : null });
  });
  return next;
}

// stampDeclaration: la economia y la cadena viajan en el recibo igual que el dueno de persistencia.
// El kernel sella el recibo sobre lo que el construye, asi que esto es una estampa posterior y no un
// campo del kernel: lo que se agrega queda dicho, y lo que no se declaro no aparece.
function stampDeclaration(receipt, declared) {
  if (!receipt || !declared) return receipt;
  receipt.economy = declared.economy ?? null;
  receipt.chain = declared.chain ?? null;
  return receipt;
}

export async function holdOperation({ root, goal, owner, authority }) {
  if (typeof root !== "string" || root.length === 0) {
    throw new Error("holdOperation needs a root: state written nowhere is not durable");
  }
  const artifact = createArtifact({ goal, owner, authority });
  const { directory, file, relative } = operationStatePath(root, artifact.id);
  await saveOperationState(directory, artifact);
  return { artifact, file, persistence: { owner: relative } };
}

// readOperation: read one operation back by project root, with no verdict attached.
//
// loadOperationState is re-exported as it is and takes the OPERATIONS directory, while this
// module's own functions take the project root. A caller mixing the two gets a clean ENOENT
// on a file that exists, which is the kind of confusion that sends someone looking for a bug
// in the wrong place. This is the reader a caller should reach for.
export async function readOperation({ root, id } = {}) {
  return loadOperationState(operationStatePath(root, id).directory, id);
}

export async function resumeOperation({ root, id, freshness = null }) {
  const { directory, file, relative } = operationStatePath(root, id);
  const artifact = await loadOperationState(directory, id);
  const observed = Array.isArray(freshness) ? freshness.map((entry) => ({ ...entry })) : null;
  const verdict = resumeArtifact(observed ? { ...artifact, freshness: observed } : artifact);
  return {
    ...verdict,
    artifact,
    file,
    persistence: { owner: relative },
    freshness: observed ?? artifact.freshness ?? [],
  };
}

export async function runDurableOperation({
  root = null,
  goal = "",
  owner = "",
  authority = null,
  capability = null,
  io = {},
  declaredEffect = null,
  intent = "direct",
  host = {},
  assignment = null,
  id = null,
  freshness = null,
  note = null,
  effect = null,
  economy = null,
  chain = null,
} = {}) {
  // Primero la declaracion: un efecto externo sin economia declarada, o sin decir que va en cadena,
  // no llega a pedir capacidad ni a escribir un byte. Se declara sobre un artefacto vacio porque aqui
  // todavia no existe el suyo, y lo que importa es que falle antes de correr.
  const declared = effect === null ? null : declareEffect({}, { effect, economy, chain });
  const route = routeOperation({ intent, host });
  const durable = typeof root === "string" && root.length > 0;

  if (!durable) {
    if (id !== null) {
      throw new Error("resuming needs a root: there is no state to resume from");
    }
    const out = await runBoundedOperation(
      { goal, authority: authority ?? { spend: [] } },
      effectiveCapability({ capability, route, host, assignment }),
      { ...wiredIo({ io, route, host }), declaredEffect, persistence: { owner: "none" } },
    );
    stampDeclaration(out.receipt, declared);
    return { ...out, route, artifact: null, file: null, resumed: false };
  }

  const runner = effectiveCapability({ capability, route, host, assignment });
  let artifact = null;
  let resumed = false;
  if (id === null) {
    artifact = (await holdOperation({ root, goal, owner, authority: authority ?? undefined })).artifact;
  } else {
    const vista = await resumeOperation({ root, id, freshness });
    if (!vista.allowed) {
      return {
        status: "not_resumed",
        resumed: false,
        allowed: false,
        reason: vista.reason,
        receipt: null,
        output: undefined,
        route,
        artifact: vista.artifact,
        file: vista.file,
      };
    }
    artifact = vista.artifact;
    resumed = true;
  }
  // El artefacto que se escribe lleva la declaracion dentro, no solo el recibo: es la misma verdad
  // en los dos sitios y uno de los dos se puede perder con el archivo.
  if (declared) artifact = declareEffect(artifact, { effect: declared.effect, economy: declared.economy, chain: declared.chain });

  const { directory, relative } = operationStatePath(root, artifact.id);
  const out = await runBoundedOperation(
    { goal: goal || artifact.working_goal, authority: authority ?? artifact.authority ?? { spend: [] } },
    runner,
    { ...wiredIo({ io, route, host }), declaredEffect, persistence: { owner: relative } },
  );
  stampDeclaration(out.receipt, declared);

  const receipt = out.receipt;
  const status = receipt?.status ?? "failed";
  const exercised = receipt?.authority?.exercised ?? [];
  const updated = {
    ...artifact,
    verification: receipt?.verification ?? artifact.verification ?? null,
    last_receipt: {
      status,
      digest: receipt?.digest ?? null,
      operation_id: receipt?.operation?.id ?? null,
      approval: receipt?.authority?.approval ?? null,
      decided_by: receipt?.decidedBy ?? null,
      at: receipt?.at ?? null,
    },
    next_legitimate_action: NEXT_ACTION_BY_RECEIPT[status] ?? "decide",
    provenance: {
      ...artifact.provenance,
      route: route.intent,
      ...(route.blocked ? { route_blocked_by: route.reason } : {}),
    },
  };
  if (exercised.length > 0) {
    updated.effects = [...(artifact.effects ?? []), { at: updated.last_receipt.at, status, exercised }];
  }
  if (Array.isArray(freshness)) updated.freshness = freshness.map((entry) => ({ ...entry }));

  const next = advanceTo(updated, STATE_BY_RECEIPT[status] ?? "blocked", note ?? receiptNote(receipt));
  const file = await saveOperationState(directory, next);
  return { ...out, route, artifact: next, file, resumed };
}
