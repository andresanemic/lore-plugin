import { tirarCarta } from "./card-deck.mjs";
import { attemptWall } from "./operation-state.mjs";

const nonempty = value => typeof value === "string" && value.trim().length > 0;
const dimensions = new Set(["scope", "sequence", "authority", "artifact", "reversibility", "commitment"]);
export const CARD_RULE = "owner-approved-2026-10-08";

export function cardEligibility(operation, decisionPoint = null) {
  if (!operation?.id || ["closed", "cancelled"].includes(operation.state)) return null;
  const wall = attemptWall(operation);
  if (wall.stop && (operation.retry_searches ?? []).some(search => search.signature === wall.signature)) return { kind: "failure-wall", signature: wall.signature, attempts: wall.attempts };
  const options = decisionPoint?.options;
  if (!dimensions.has(decisionPoint?.dimension) || decisionPoint.mechanical || decisionPoint.repetitive || !Array.isArray(options) || options.length < 2) return null;
  if (options.some(option => option.viable !== true || !nonempty(option.id) || !nonempty(option.consequence))) return null;
  if (new Set(options.map(option => option.id)).size !== options.length || new Set(options.map(option => option.consequence.trim())).size < 2) return null;
  return { kind: "material-decision", dimension: decisionPoint.dimension, options: structuredClone(options) };
}

export function offerOperationCard(operation, input = {}) {
  if ((operation.perturbations ?? []).length && !input.request) throw new Error("a card was already offered; no unsolicited repetition");
  if (input.request && (!nonempty(input.request.by) || !nonempty(input.request.words))) throw new Error("another card requires a recorded human request");
  const eligibility = cardEligibility(operation, input.decisionPoint);
  if (!eligibility) throw new Error("card requires an eligible wall with lookup or material decision");
  if (!nonempty(input.decisionBefore)) throw new Error("card requires decision before offer");
  const card = tirarCarta({ semilla: input.semilla, fuente: input.fuente });
  const perturbation = { id: `${operation.id}-card-${(operation.perturbations ?? []).length + 1}`, card, offered_at: new Date().toISOString(), eligibility,
    decision_before: input.decisionBefore, response_status: "offered", response_at: null, decision_after: null, classification_status: "pending", classification: null, evidence: null,
    ...(input.request ? { request: structuredClone(input.request), request_source: "coordinator-attestation" } : {}) };
  return { ...operation, perturbations: [...(operation.perturbations ?? []), perturbation] };
}

function update(operation, id, change) {
  const card = operation.perturbations?.find(item => item.id === id);
  if (!card) throw new Error("unknown card offer");
  if (["closed", "cancelled"].includes(operation.state)) throw new Error("card update needs active operation");
  return { ...operation, perturbations: operation.perturbations.map(item => item.id === id ? change(item) : item) };
}

export function answerOperationCard(operation, { id, response } = {}) {
  if (!["accepted", "declined", "ignored"].includes(response)) throw new Error("card response must be accepted, declined or ignored");
  return update(operation, id, card => {
    if (card.response_status !== "offered") throw new Error("card response already recorded");
    return { ...card, response_status: response, response_at: new Date().toISOString() };
  });
}

export function arbitrateOperationCard(operation, { id, evidence = null } = {}) {
  return update(operation, id, card => {
    let classification = null;
    const valid = evidence && card.response_status !== "offered" && evidence.cardId === card.id && evidence.decisionBefore === card.decision_before
      && nonempty(evidence.source) && nonempty(evidence.by) && nonempty(evidence.description) && nonempty(evidence.decisionAfter)
      && Number.isFinite(Date.parse(evidence.at)) && Date.parse(evidence.at) >= Date.parse(card.response_at) && Date.parse(evidence.at) <= Date.now()
      && evidence.contradictory !== true;
    if (valid) {
      if (evidence.kind === "opening" && nonempty(evidence.distinction) && evidence.decisionAfter !== card.decision_before) classification = "germen";
      if (evidence.kind === "friction" && nonempty(evidence.reversalReason) && ["reverted", "discarded"].includes(evidence.disposition)
        && (evidence.disposition !== "reverted" || evidence.decisionAfter === card.decision_before)) classification = "ruido";
      if (evidence.kind === "evaluation" && evidence.decisionAfter === card.decision_before) classification = "neutral";
    }
    const observation = evidence ? structuredClone(evidence) : null;
    return { ...card, classification_status: classification ? "classified" : "pending", classification,
      decision_after: valid ? evidence.decisionAfter : null, evidence: observation, rule: CARD_RULE, evidence_source: "coordinator-attestation",
      arbitration_history: [...(card.arbitration_history ?? []), { at: new Date().toISOString(), classification, evidence: observation }] };
  });
}
