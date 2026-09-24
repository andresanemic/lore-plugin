// operation-state — minimum durable operation artifact. Project-owned,
// inspectable, sparse. No transcript dump, no event log, no ledger.
export const ARTIFACT_SCHEMA_VERSION = "1.0.0";

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
