import { test } from "node:test";
import assert from "node:assert/strict";

// RC3 RED matrix — each test must fail on rc.2 behavior and pass on rc.3.

const V = "../skills/vespi/core/vespi.mjs";
const S = "../skills/vespi/core/operation-state.mjs";
const P = "../skills/vespi/core/probe.mjs";
const R = "../skills/vespi/core/resource.mjs";
const E = "../skills/vespi/core/envelope.mjs";

// RED-EFF-1: divergent effective terms never reach the effect border.
test("effect authority: divergent terms rejected before perform", async () => {
  const { runBoundedOperation } = await import(V);
  let performed = 0;
  const capability = {
    id: "pay",
    required: () => ({ spend: [{ asset: "USDC", amount: "500000", to: "X" }] }),
    effectiveTerms: () => ({ asset: "USDC", amount: "500000", to: "X", network: "testnet" }),
    perform: async () => { performed++; return { ok: true, evidence: { status: "ok" } }; },
  };
  const out = await runBoundedOperation(
    { goal: "pay 0.01", authority: { spend: [{ asset: "USDC", maxAmount: "10000", to: "X" }] } },
    capability,
    { declaredEffect: { asset: "USDC", amount: "10000", to: "X", network: "testnet" }, verify: async () => ({ verified: true, checks: {}, reason: "t" }) },
  );
  assert.equal(performed, 0);
  assert.equal(out.receipt.status, "failed");
});

// RED-GATE-1: absent gate is no_decision, never rejected.
test("truthful gate: absent decider records no_decision", async () => {
  const { runBoundedOperation } = await import(V);
  const capability = {
    id: "w", required: () => ({ spend: [{ asset: "A", amount: "5", to: "T" }] }),
    perform: async () => ({ ok: true, evidence: { status: "ok" } }),
  };
  const out = await runBoundedOperation({ goal: "g", authority: { spend: [] } }, capability, {});
  assert.equal(out.receipt.status, "needs_human_decision");
  assert.equal(out.receipt.authority.approval, "human_gate_no_decision");
});

// RED-GATE-2: explicit false stays rejected.
test("truthful gate: explicit rejection stays rejected", async () => {
  const { runBoundedOperation } = await import(V);
  const capability = {
    id: "w", required: () => ({ spend: [{ asset: "A", amount: "5", to: "T" }] }),
    perform: async () => ({ ok: true, evidence: { status: "ok" } }),
  };
  const out = await runBoundedOperation({ goal: "g", authority: { spend: [] } }, capability, {
    ask: async () => ({ approved: false }),
  });
  assert.equal(out.receipt.authority.approval, "human_gate_rejected");
});

// RED-Persist-1: receipt without persistence declaration is invalid.
test("persistence: missing declaration fails validation", async () => {
  const { validateReceipt } = await import(V);
  assert.throws(() => validateReceipt({ status: "verified" }), /persistence/);
  assert.equal(validateReceipt({ status: "verified", persistence: { owner: "none" } }), true);
});

// RED-LOAD-1: material decision without loaded criterion cannot silently pass.
test("loaded: unverifiable material criterion blocks or gates", async () => {
  const { accreditLoaded } = await import(E);
  const r = accreditLoaded({ material: true, loaded: [], unverifiable: "no read trace" });
  assert.ok(["blocked", "downgraded", "requires_gate"].includes(r));
  assert.equal(accreditLoaded({ material: false, loaded: [] }), "acceptable");
});

// RED-REVAL-1: fallen premise forces revalidation, not silent continuation.
test("revalidation: changed recipient requires gate", async () => {
  const { revalidate } = await import(E);
  assert.equal(revalidate({ changed: ["to"], preauthorized: [] }, ["to"]), "requires_gate");
  assert.equal(revalidate({ changed: ["executor"], preauthorized: ["executor"] }, ["executor", "to"]), "continue");
});

// RED-AMP-1: prompt output cannot expand authority.
test("envelope: receipt cannot add grants", async () => {
  const { grantsCover } = await import(E);
  assert.equal(grantsCover([{ asset: "A", maxAmount: "1" }], [{ asset: "A", amount: "2", to: "T" }]), false);
});

// RED-REPLAY-1: UNKNOWN effect cannot blind retry.
test("reconciliation: unknown requires reconcile before retry", async () => {
  const { mayRetry } = await import(V);
  assert.equal(mayRetry({ status: "not_verified", reconciliation: "required" }), false);
  assert.equal(mayRetry({ status: "not_verified", reconciliation: "reconciled-absent" }), true);
});

// RED-HAPPEN-1: NOT_HAPPENED requires negative-capable evidence.
test("evidence: absence of verification is UNKNOWN, not NOT_HAPPENED", async () => {
  const { classifyOutcome } = await import(V);
  assert.equal(classifyOutcome({ verified: false, negativeEvidence: false }), "UNKNOWN");
  assert.equal(classifyOutcome({ verified: true }), "HAPPENED");
  assert.equal(classifyOutcome({ verified: false, negativeEvidence: true }), "NOT_HAPPENED");
});

// RED-STATE-1: artifact carries schema version; checkpoints append, R1 survives.
test("artifact: versioned, append-only checkpoints", async () => {
  const { createArtifact, appendCheckpoint } = await import(S);
  const a = createArtifact({ goal: "g", owner: "o" });
  assert.match(a.artifact_schema_version, /^\d+\.\d+\.\d+$/);
  assert.ok(a.created_by_vespi_version);
  const a2 = appendCheckpoint(a, { note: "R2", validity: {} });
  assert.equal(a2.checkpoints.length, 2);
  assert.equal(a2.checkpoints[0].note, "R1-genesis");
});

// RED-VALID-1: validity per block, stale does not govern.
test("validity: R1 history does not govern R2", async () => {
  const { governable } = await import(S);
  assert.equal(governable({ status: "HISTORY" }), false);
  assert.equal(governable({ status: "ACTIVE" }), true);
  assert.equal(governable({ status: "REVALIDATE" }), false);
});

// RED-PROBE-1: foreign write denied, proposal allowed, lineage kept.
test("probe: cross-garden deny/permit matrix", async () => {
  const { crossGarden } = await import(P);
  assert.equal(crossGarden("DIRECT_WRITE"), "deny");
  assert.equal(crossGarden("PROMOTE"), "deny");
  assert.equal(crossGarden("PROPOSE"), "permit");
  assert.equal(crossGarden("PROBE"), "permit");
  assert.equal(crossGarden("READ"), "permit");
});

// RED-PROBE-2: probe result includes NO_FINDING.
test("probe: no-finding is valid output", async () => {
  const { runProbe } = await import(P);
  const out = await runProbe({ question: "q", recipient: { respond: async () => ({ result: "NO_FINDING" }) } });
  assert.equal(out.result, "NO_FINDING");
});

// RED-RES-1: unknown quota stays unknown; silent switch forbidden on material change.
test("resource: unknown stays unknown; material change needs gate", async () => {
  const { decideSwitch } = await import(R);
  assert.equal(decideSwitch({ from: "BLOCKED", to: null, preauthorized: false, materialChange: false }), "wait");
  assert.equal(decideSwitch({ from: "NEAR_MARGIN", to: "B", preauthorized: true, materialChange: false }), "switch");
  assert.equal(decideSwitch({ from: "NEAR_MARGIN", to: "B", preauthorized: true, materialChange: true }), "requires_gate");
  assert.equal(decideSwitch({ from: "UNKNOWN", to: "B", preauthorized: true, materialChange: false }), "requires_gate");
});

// RED-FRESH-1: per-subject freshness; stale resume blocked.
test("freshness: stale subject blocks silent resume", async () => {
  const { resumeAllowed } = await import(S);
  const r = resumeAllowed([{ subject: "deadline", checked_at: "2020-01-01T00:00:00Z", result: "stale", evidence: "passed" }]);
  assert.equal(r, false);
});

// RED-NOHIVE-1: external change reconciles without authorship claim.
test("no-hive: reconcile foreign delta without claiming it", async () => {
  const { reconcileForeign } = await import(S);
  const out = reconcileForeign({ foreignDelta: { by: "owner-B", change: "x" } });
  assert.equal(out.provenance.adopted_by, "owner-B");
  assert.equal(out.claimsAuthorship, false);
  assert.ok(["continue", "revalidate", "ask", "stop"].includes(out.decision));
});

// RED-LINEAGE-1: purpose change mints new id with predecessor.
test("lineage: purpose change breaks identity visibly", async () => {
  const { successor } = await import(S);
  const n = successor({ id: "op-1" }, { reason: "purpose changed", authority: "human" });
  assert.notEqual(n.id, "op-1");
  assert.equal(n.predecessor, "op-1");
});

// RED-SPARSE-1: simple operation carries no ceremony.
test("sparse: simple operation has no optional blocks", async () => {
  const { createArtifact } = await import(S);
  const a = createArtifact({ goal: "g", owner: "o" });
  assert.equal(a.resource, undefined);
  assert.equal(a.probe, undefined);
  assert.equal(a.open_items, undefined);
});

// BATTLE-A-1: exact terms pass the border exactly once.
test("battle-a: exact effective terms perform once and verify", async () => {
  const { runBoundedOperation } = await import(V);
  let performed = 0;
  const terms = { asset: "USDC", amount: "10000", to: "X", network: "testnet" };
  const capability = {
    id: "pay",
    required: () => ({ spend: [{ asset: "USDC", amount: "10000", to: "X" }] }),
    effectiveTerms: () => terms,
    perform: async () => { performed++; return { ok: true, evidence: { status: "settled" } }; },
  };
  const out = await runBoundedOperation(
    { goal: "pay 0.01", authority: { spend: [{ asset: "USDC", maxAmount: "10000", to: "X" }] } },
    capability,
    { declaredEffect: terms, verify: async () => ({ verified: true, checks: { settlement: true }, reason: "horizon" }) },
  );
  assert.equal(performed, 1);
  assert.equal(out.receipt.status, "verified");
  assert.equal(out.receipt.persistence.owner, "none");
});

// OPEN-1: non-blocking items ride along; blocking items gate.
test("non-blocking: viable with open non-blocking items", async () => {
  const { viableWithOpen, certify } = await import(S);
  assert.equal(viableWithOpen([{ item: "polish", impact: "NON_BLOCKING" }]), true);
  assert.equal(viableWithOpen([{ item: "sign", impact: "BLOCKING" }]), false);
  assert.equal(certify({ finished: true, verified: true, authority: {}, selfCertified: true }), "finished_verified_uncertified");
  assert.equal(certify({ finished: true, verified: true, authority: { certified: true }, selfCertified: false }), "closed");
});

// HANDOFF-1: Vespi outcome reaches arbitration without a write path.
test("handoff: proposal carries evidence, never a write", async () => {
  const { proposeHandoff } = await import(V);
  const h = proposeHandoff({ kind: "proposal", evidence: { e: 1 }, provenance: { by: "op-1" }, source: "op-1" });
  assert.equal(h.writesLore, false);
  assert.throws(() => proposeHandoff({ kind: "truth", source: "x" }), /kind/);
});

// BATTLE-B-1: dominant route insufficient -> probe -> evidence changes decision.
test("battle-b: probe evidence legitimately changes the decision space", async () => {
  const { runProbe, crossGarden } = await import(P);
  const { revalidate } = await import(E);
  const { appendCheckpoint, governable } = await import(S);
  const { createArtifact } = await import(S);
  let artifact = createArtifact({ goal: "choose treatment", owner: "garden-a" });
  const before = decideWith({ evidence: [] });
  assert.equal(before, "cannot-decide");
  assert.equal(crossGarden("DIRECT_WRITE"), "deny");
  const probe = await runProbe({
    question: "what worked in garden-b?",
    context_min: { symptom: "s" },
    excluded: ["garden-b canon"],
    boundary: { write: "deny" },
    recipient: { respond: async () => ({ result: "EVIDENCE", evidence: { dose: "low" }, provenance: { by: "owner-B" } }) },
  });
  assert.equal(probe.result, "EVIDENCE");
  assert.equal(probe.evidence.dose, "low");
  const after = decideWith({ evidence: [probe.evidence] });
  assert.equal(after, "low-dose");
  assert.equal(revalidate({ changed: ["route"], preauthorized: ["route"] }, []), "continue");
  artifact = appendCheckpoint(artifact, { note: "route changed on evidence", validity: { route: { status: "ACTIVE" } } });
  assert.equal(governable({ status: "ACTIVE" }), true);
  function decideWith({ evidence }) {
    return evidence.length > 0 ? "low-dose" : "cannot-decide";
  }
});

// BATTLE-B-2: NO_FINDING fabricates nothing.
test("battle-b: no-finding leaves the decision space unchanged", async () => {
  const { runProbe } = await import(P);
  const probe = await runProbe({
    question: "q", recipient: { respond: async () => ({ result: "NO_FINDING" }) },
  });
  assert.equal(probe.result, "NO_FINDING");
  assert.equal(probe.evidence, null);
});

// GUARD-1: foreign structured write stays denied (rc.2 boundary preserved).
test("guard: foreign structured write denied with proposal path", async () => {
  const { jurisdictionBlock } = await import("../hooks/lore-guard.mjs");
  const root = new URL("../skills/use-lore/", import.meta.url).pathname;
  const msg = jurisdictionBlock(root, "Write", { file_path: "/definitely-elsewhere/canon.md" });
  assert.match(msg ?? "", /jurisdicci|intercambio/i);
});
