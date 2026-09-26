// vespi core facade — RC3 experimental.
// Ported kernel (operation/authority/receipt .cjs: a 3-line provenance header,
// then the exact bytes of Vespi SOURCE BASE 85c6f3f — see
// bot-lus-lore/specs/011-.../source-audit-RC3.md)
// plus RC3 truthfulness wrappers. No scheduler, no router, no managers.
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const kernel = require("./kernel/operation.js");
require("./kernel/authority.js");
require("./kernel/receipt.js");

export const { createOperation, runOperation, STATES } = kernel;

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
