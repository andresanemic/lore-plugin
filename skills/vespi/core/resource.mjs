// resource — minimum resource/attention semantics. No quota manager,
// no model router, no billing. Finite declared candidates only.
export const STATES = ["AVAILABLE", "NEAR_MARGIN", "BLOCKED", "UNKNOWN"];

// decideSwitch({ from, to, preauthorized, materialChange }):
// - BLOCKED with nothing sufficient -> wait (resumable, not failure).
// - preauthorized + no material change -> switch silently, same operation.
// - material change (cost/privacy/authority) -> requires_gate, never silent.
// - UNKNOWN source state -> requires_gate; never invent quota.
export function decideSwitch({ from, to, preauthorized, materialChange }) {
  if (from === "UNKNOWN") return "requires_gate";
  if (!to) return "wait";
  if (materialChange) return "requires_gate";
  if (preauthorized) return "switch";
  return "requires_gate";
}
