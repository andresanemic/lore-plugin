// probe — bounded lateral movement over EXISTING routing. No router,
// no PollenManager. Moves minimum context, returns with evidence.
const PERMIT = new Set(["READ", "REFERENCE", "CITE", "CHALLENGE", "PROBE", "PROPOSE"]);
const DENY = new Set(["DIRECT_WRITE", "PROMOTE", "ADOPT", "CHANGE_OWNER", "EXPAND_AUTHORITY"]);

export function crossGarden(action) {
  if (DENY.has(action)) return "deny";
  if (PERMIT.has(action)) return "permit";
  return "deny";
}

export async function runProbe({ question, context_min = null, excluded = [], boundary = null, recipient }) {
  if (typeof recipient?.respond !== "function") {
    return { question, result: "INSUFFICIENT_CONTEXT", evidence: null, provenance: {} };
  }
  const answer = await recipient.respond({ question, context_min, excluded, boundary });
  const valid = ["EVIDENCE", "NO_FINDING", "INSUFFICIENT_CONTEXT", "REFUSE"].includes(answer?.result)
    ? answer.result
    : "INSUFFICIENT_CONTEXT";
  return {
    question,
    result: valid,
    evidence: answer?.evidence ?? null,
    provenance: answer?.provenance ?? {},
    excluded,
  };
}
