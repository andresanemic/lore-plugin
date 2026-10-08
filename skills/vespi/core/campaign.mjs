// Evidence is derived from persisted operations. Native entry needs an external witness.
import { createHash } from 'node:crypto';
import { readFile, lstat } from 'node:fs/promises';
import { readFileSync, realpathSync, lstatSync } from 'node:fs';
import { isDeepStrictEqual } from 'node:util';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { applyCriterionDecision, evaluateCriterionReturn, validateRelationalTrace } from './coordinator.mjs';
import { loadOperationState } from './operation-state.mjs';
import { CARD_RULE, cardEligibility } from './cards.mjs';

const digest = value => createHash('sha256').update(value).digest('hex');
const text = value => typeof value === 'string' && value.trim().length > 0;
const row = (passed, event, artifact, assertion, limit) => ({ passed, event, artifact, assertion, limit });
const time = value => Number.isFinite(Date.parse(value)) ? Date.parse(value) : NaN;

export function linkConsultationToDecision(artifact, { criterionId, excerpt } = {}) {
  const criterion = artifact.resolved_criteria?.find(item => item.id === criterionId);
  const decision = artifact.decisions?.find(item => item.criterionId === criterionId);
  const consultation = artifact.loaded?.find(item => item.status === 'consulted' && item.transport === 'local'
    && criterion?.producerTask?.sources?.includes(item.requested_source) && item.decision?.before === decision?.input && item.decision?.after === decision?.output);
  if (consultation && criterion && realpathSync(consultation.source) === realpathSync(criterion.source))
    throw new Error('primary source cannot be criterion delivery: self citation');
  const primary = consultation ? readFileSync(consultation.source, 'utf8') : '';
  const delivery = criterion ? readFileSync(criterion.source, 'utf8') : '';
  if (!criterion || !decision || !consultation || !text(excerpt) || !primary.includes(excerpt)
    || !criterion.producerTask?.sources?.includes(consultation.requested_source)
    || digest(primary) !== consultation.digest || digest(delivery) !== criterion.sourceDigest
    || decision.influenceEvidence?.criterionOutput !== decision.output
    || decision.influenceEvidence?.baselineOutput === decision.output) throw new Error('consultation cannot link to resolved criterion and decision');
  const link = { criterionId, digest: criterion.digest, sourceRef: consultation.requested_source,
    source: consultation.source, sourceDigest: consultation.digest, excerpt,
    producerSource: criterion.source, producerSourceDigest: criterion.sourceDigest,
    decisionInput: decision.input, decisionOutput: decision.output, influenceEvidence: structuredClone(decision.influenceEvidence),
    at: new Date().toISOString() };
  return { ...artifact, consultation_links: [...(artifact.consultation_links ?? []), link] };
}

export function applyCardCriterionDecision(artifact, { criterionId, input, cardId, alternativeId, decide } = {}) {
  const card = artifact.perturbations?.find(item => item.id === cardId);
  const options = card?.eligibility?.options;
  if (!card || card.response_status === 'offered' || !Array.isArray(options)
    || !cardEligibility(artifact, { dimension: card.eligibility?.dimension, options })
    || !options.some(option => option.id === card.decision_before && option.viable)
    || !options.some(option => option.id === alternativeId && option.viable)
    || card.decision_before === alternativeId || !(time(card.offered_at) <= time(card.response_at)))
    throw new Error('card decision needs an eligible offer and recorded response before execution');
  return applyCriterionDecision(artifact, { criterionId, input, decide,
    card: { id: cardId, options, beforeId: card.decision_before, afterId: alternativeId } });
}

const inside = (root, path) => {
  const rel = relative(resolve(root), resolve(path));
  return !rel || (!rel.startsWith('..') && !isAbsolute(rel));
};

// Inspect original path components before realpath; a resolved link would hide its alias.
function hasPathAlias(path) {
  let current = resolve(path);
  for (;;) {
    if (lstatSync(current).isSymbolicLink()) return true;
    const parent = dirname(current);
    if (parent === current) return false;
    current = parent;
  }
}

// Internal witness boundary, exported for direct tests; no host activation claim by itself.
export async function nativeObserved(native, producer, operationRoot) {
  if (!native?.witnessPath || !producer?.id) return false;
  try {
    if (hasPathAlias(native.witnessPath) || hasPathAlias(operationRoot)) return false;
    const witnessFile = realpathSync(native.witnessPath);
    const actualRoot = realpathSync(operationRoot);
    const witness = JSON.parse(await readFile(witnessFile, 'utf8'));
    const observedAt = time(witness.observedAt), startedAt = time(producer.checkpoints?.[0]?.at);
    if (witness.operationId !== producer.id || witness.entrySurface !== 'create-project'
      || witness.instructionDigest !== digest(producer.intent) || !text(witness.observedBy)
      || !Number.isFinite(observedAt) || !Number.isFinite(startedAt)
      || observedAt < startedAt || observedAt > Date.now()) return false;
    if (hasPathAlias(witness.areaRoot) || hasPathAlias(witness.projectRoot)) return false;
    const area = realpathSync(witness.areaRoot);
    const project = realpathSync(witness.projectRoot);
    const projectOwnsOperation = relative(actualRoot, project) === '';
    if (inside(actualRoot, witnessFile) || inside(actualRoot, area)
      || (inside(actualRoot, project) && !projectOwnsOperation)) return false;
    const rel = relative(area, project);
    if (!rel || rel.startsWith('..') || resolve(area, rel) !== project
      || (await lstat(area)).isSymbolicLink() || (await lstat(project)).isSymbolicLink()) return false;
    const required = ['AGENTS.md', 'FASES.md', 'SPEC.md', 'PLAN.md', 'lore/identidad.md', 'lore/principios.md', 'lore/index.md'];
    if (!required.every(name => /^[a-f0-9]{64}$/.test(witness.files?.[name]))) return false;
    for (const name of required) {
      const path = resolve(project, name);
      if (relative(project, path).startsWith('..') || hasPathAlias(path) || !inside(project, realpathSync(path))
        || digest(await readFile(path, 'utf8')) !== witness.files[name]) return false;
    }
    const registration = await readFile(resolve(area, 'FASES.md'), 'utf8');
    if (digest(registration) !== witness.registrationDigest || !registration.includes(rel.replaceAll('\\', '/'))) return false;
    const phase = await readFile(resolve(project, 'FASES.md'), 'utf8');
    return phase.includes('## Operaciones') && phase.includes('Siguiente decisión');
  } catch { return false; }
}

export async function evaluateCampaignEvidence({ root, producer, second, trace, native } = {}) {
  const events = Array.isArray(trace) ? trace : [];
  const production = events.find(event => event?.type === 'criterion.distilled');
  const resolution = events.find(event => event?.type === 'criterion.resolved');
  const decision = events.find(event => event?.type === 'decision.recorded');
  const task = producer?.tasks?.find(item => item.id === production?.criterion?.producerTaskId);
  const savedProducer = root && producer?.id ? await loadOperationState(root, producer.id).catch(() => null) : null;
  const savedSecond = root && second?.id ? await loadOperationState(root, second.id).catch(() => null) : null;
  const same = Boolean(production && resolution && decision
    && production.criterionId === resolution.criterionId && resolution.criterionId === decision.criterionId
    && production.digest === resolution.digest && resolution.digest === decision.digest
    && production.producerOperationId === producer?.id && resolution.secondOperationId === second?.id
    && decision.secondOperationId === second?.id);
  const returned = await evaluateCriterionReturn(events, { root });
  const returnedHere = same && returned.passed;
  const producerReal = savedProducer && isDeepStrictEqual(savedProducer, producer);
  const secondReal = savedSecond && isDeepStrictEqual(savedSecond.criterion_events, second?.criterion_events);
  const operationObserved = Boolean(producerReal && secondReal && task?.received?.path && task?.verification?.evidence
    && ['verified', 'integrated'].includes(task.state) && second?.decisions?.some(item =>
      item.criterionId === decision.criterionId && item.input === decision.input && item.output === decision.output)
    && second?.receipt && text(second?.next_legitimate_action));
  const instructionObserved = text(producer?.intent) && producer.intent === savedProducer?.intent
    && producer.intent.trim().split(/\s+/).length <= 12;
  const result = row(Boolean(instructionObserved && operationObserved && returnedHere), production?.type ?? null,
    task?.received?.path ?? null, 'persisted short intent → verified delivery → resolved criterion → second decision',
    'local mechanism; no human experience inferred');

  const consultation = second?.loaded?.find(item => item.status === 'consulted' && item.transport === 'local'
    && production?.criterion?.producerTask?.sources?.includes(item.requested_source) && item.decision?.before === decision?.input && item.decision?.after === decision?.output);
  const link = second?.consultation_links?.find(item => item.criterionId === production?.criterionId
    && item.digest === production?.digest && item.sourceRef === consultation?.requested_source
    && item.source === consultation?.source && item.sourceDigest === consultation?.digest
    && item.producerSource === production?.criterion?.source
    && item.producerSourceDigest === production?.criterion?.sourceDigest
    && item.decisionInput === decision?.input && item.decisionOutput === decision?.output
    && isDeepStrictEqual(item.influenceEvidence, decision?.influenceEvidence));
  let sourceReal = false;
  try {
    const primary = await readFile(consultation.source, 'utf8');
    const delivery = await readFile(production.criterion.source, 'utf8');
    sourceReal = realpathSync(consultation.source) !== realpathSync(production.criterion.source) && digest(primary) === consultation.digest && text(link?.excerpt) && primary.includes(link.excerpt)
      && digest(delivery) === production.criterion.sourceDigest
      && production.criterion.producerTask?.sources?.includes(consultation.requested_source);
  } catch { /* red */ }
  const convergence = row(Boolean(returnedHere && sourceReal && consultation && link && text(consultation.interpretation)
    && text(consultation.decision.reason) && isDeepStrictEqual(savedSecond?.loaded, second?.loaded)
    && isDeepStrictEqual(savedSecond?.consultation_links, second?.consultation_links)),
    consultation?.status ?? null, consultation?.source ?? null,
    'consulted primary source and verified producer delivery match their own digests; link names criterion ID and decision influence',
    'source-root authority and interpretation are coordinator attestations');

  let relationValid = false;
  try { relationValid = validateRelationalTrace(second?.interaction_trace).valid; } catch { /* red */ }
  const relational = second?.interaction_trace ?? [];
  const applied = relational.find(item => item.type === 'decision.applied');
  const genesis = time(second?.checkpoints?.[0]?.at);
  const bounds = relational.length === 6 && relational.slice(0, 5).every(item => time(item.at) >= genesis && time(item.at) <= time(decision?.at))
    && time(applied?.at) >= time(decision?.at) && time(applied?.at) <= Date.now();
  const relationLinked = relationValid && bounds && applied?.operationId === second?.id
    && applied?.criterionId === decision?.criterionId && applied?.input === decision?.input
    && applied?.output === decision?.output && applied?.evidence === JSON.stringify(decision?.influenceEvidence)
    && isDeepStrictEqual(savedSecond?.interaction_trace, relational);
  const relationship = row(Boolean(returnedHere && relationLinked), relationLinked ? 'decision.applied' : null,
    second?.id ?? null, 'six linked events after operation genesis and before decision',
    'synthetic participants; no yo–tú or fertility report inferred');

  const concrete = row(Boolean(result.passed && await nativeObserved(native, producer, root)),
    native?.witnessPath ?? null, native?.witnessPath ?? null,
    'external native witness links intent and operation to seven files, digests and area registration',
    'API fixture alone leaves this row red; witness remains an external attestation');

  const card = second?.perturbations?.find(item => item.rule === CARD_RULE && item.classification_status === 'classified'
    && item.classification === 'germen' && item.eligibility?.kind === 'material-decision');
  const options = card?.eligibility?.options ?? [];
  const cardEffect = decision?.influenceEvidence?.card;
  const cardLink = decision?.cardId === card?.id && cardEffect?.cardId === card?.id
    && cardEffect?.beforeId === card?.decision_before && cardEffect?.afterId === card?.decision_after
    && cardEffect?.optionsDigest === digest(JSON.stringify(options))
    && cardEffect?.method === 'executed-local-two-factor'
    && cardEffect?.matrix?.criterionAfter === decision?.output
    && cardEffect?.matrix?.noCriterionAfter === decision?.influenceEvidence?.baselineOutput
    && cardEffect?.criterionContrast?.without === cardEffect?.matrix?.noCriterionAfter
    && cardEffect?.criterionContrast?.with === decision?.output && cardEffect?.criterionContrast?.changed === true
    && cardEffect?.cardContrast?.without === cardEffect?.matrix?.criterionBefore
    && cardEffect?.cardContrast?.with === decision?.output && cardEffect?.cardContrast?.changed === true;
  const eligibility = card && cardEligibility({ ...second, perturbations: [] }, { dimension: card.eligibility.dimension, options });
  const history = card?.arbitration_history?.at(-1);
  const cardReal = card && eligibility?.kind === 'material-decision'
    && options.some(option => option.id === card.decision_before && option.viable)
    && options.some(option => option.id === card.decision_after && option.viable)
    && card.decision_after !== card.decision_before
    && card.evidence?.cardId === card.id && card.evidence?.kind === 'opening'
    && card.evidence?.decisionBefore === card.decision_before && card.evidence?.decisionAfter === card.decision_after
    && text(card.evidence?.distinction) && text(card.evidence?.source) && text(card.evidence?.by)
    && history?.classification === card.classification && isDeepStrictEqual(history?.evidence, card.evidence)
    && time(card.offered_at) >= genesis && time(card.offered_at) <= time(card.response_at)
    && time(card.response_at) <= time(decision?.at) && time(decision?.at) <= time(card.evidence.at)
    && time(card.evidence.at) <= time(history?.at);
  const instigation = row(Boolean(result.passed && cardReal && cardLink
    && isDeepStrictEqual(savedSecond?.perturbations, second?.perturbations)),
    cardReal ? 'card.arbitrated' : null, card?.id ?? null,
    'eligible offer and response precede linked decision; arbitration follows changed alternative',
    'classification is coordinator observation, not psychological causation');

  const verbEvidence = { resultado_teatro: result, converger_transducir: convergence,
    termino_relacion: relationship, abstracto_concreto: concrete, dato_instigacion: instigation };
  return { passed: Object.values(verbEvidence).every(value => value.passed), verbEvidence,
    criterionReturn: returned, limit: 'native entry needs external witness; experience needs explicit human report' };
}
