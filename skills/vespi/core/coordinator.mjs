// coordinator — el flujo por rol de una operacion: cada tarea se planifica con su encargo completo,
// se lanza solo por una ruta que el host expone de verdad, y avanza recibida -> revisada -> verificada
// -> integrada como hechos distintos que no se infieren uno del otro. Todo es puro sobre el artefacto:
// cada funcion devuelve uno nuevo y el recibido no se toca. Recepcion, integracion y cierre leen
// los archivos reales: sus huellas son hechos del disco, no declaraciones.
import { createHash } from "node:crypto";
import { existsSync, realpathSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import { assertExecuted } from "./verification-execution.mjs";
import { classifyDelegateOutput } from "./host-resources.mjs";
import { appendCheckpoint, nextLegitimateAction, retryGate, statePath, transitionArtifact, validateGateBContract, saveOperationState, loadOperationState } from "./operation-state.mjs";
import { routeOperation, OPTIONAL_CAPABILITIES } from "./vespi.mjs";
import { buildTaskMethod, kitWorkerAgentType, loadShippedMethod, packageDigest, renderCommission, renderTaskPrompt } from "./task-method.mjs";
import { renderTaskCard } from "./cards.mjs";

// La ruta no se decide aqui: sale de lo que el host expone (routeOperation). Cada rol pide la suya, y
// una herramienta ausente es un bloqueo con nombre, nunca una invocacion simulada.
const INTENT_BY_ROLE = { daimon: "daimon", advisor: "advisor", worker: "delegation" };

// Estados desde los que una operacion puede correr. "prepared" no esta: nadie autorizo a correr.
const DISPATCHABLE = new Set(["authorized", "queued", "running", "paused", "waiting"]);

const REQUIRED_BY_ROLE = {
  daimon: ["question", "sources", "output"],
  advisor: ["question", "context", "output"],
  worker: ["question", "scope", "done_criterion", "proof", "output"],
};

// Solo Daimon tiene una declaracion propia que dejar escrita en el encargo. Advisor y trabajador no
// reciben una aqui porque el kit no les declaro ninguna: inventar una seria una obligacion falsa.
const MUST_DECLARE_BY_ROLE = { daimon: ["evidence", "limits"] };

const REVIEW_CHECKS = ["scope", "sources", "risks"];

// Cierre: la escalera explicita. statePath("running", "closed") pasa por blocked, y un checkpoint que
// dice "bloqueada" en el tramo final de una operacion verificada seria un checkpoint que miente.
const CLOSURE_LADDER = ["received", "reviewed", "verified", "closed"];

// Lo que si justifica ir en cadena: algo entre partes que no se conocen entre si (Spec 015). Lo demas
// —estado de sesion, lore, borradores, el propio pulso del kit— es coordinacion interna y no lo
// justifica, asi que declararlo en cadena no es un error: es un defecto que queda anotado.
const CHAIN_CLASSES = new Set([
  "money_moved",
  "anchor_for_third_parties",
  "credentials_between_counterparties",
  "bilateral_agreements",
]);

function present(value) {
  return value !== undefined && value !== null && value !== "";
}

const criterionDigest = content => createHash('sha256').update(content).digest('hex');
const criterionText = (value, field) => {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`criterion needs ${field}`);
  return value.trim();
};
const criterionEvent = (artifact, event) => ({ ...artifact,
  criterion_events: [...(artifact.criterion_events ?? []), { ...event, at: new Date().toISOString() }] });

// Product criterion is accepted explicitly from an observed, locally verified delivery.
// Acceptance and interpretation are coordinator attestations; this is not scientific promotion.
export async function distillCriterion(artifact, { root, taskId, content, acceptedBy, words, limit } = {}) {
  if (['closed', 'cancelled'].includes(artifact.state)) throw new Error('distill needs active producer');
  const task = taskById(artifact, taskId);
  if (!['verified', 'integrated'].includes(task.state)) throw new Error('distill needs verified producer delivery');
  const execution = assertExecuted(artifact, task, task.verification?.evidence);
  content = criterionText(content, 'content');
  const digest = criterionDigest(content);
  const criterion = { id: `${artifact.id}-criterion-${(artifact.distilled_criteria ?? []).length + 1}`,
    content, digest, source: task.received.path, sourceDigest: task.received.sha256,
    producerOperationId: artifact.id, producerTaskId: taskId, producerTask: structuredClone(task), execution: structuredClone(execution),
    acceptance: { by: criterionText(acceptedBy, 'acceptedBy'), words: criterionText(words, 'words'), source: 'coordinator-attestation' },
    limit: criterionText(limit, 'limit'), status: 'accepted' };
  let next = { ...artifact, distilled_criteria: [...(artifact.distilled_criteria ?? []), criterion] };
  next = criterionEvent(next, { type: 'criterion.distilled', producerOperationId: artifact.id,
    criterionId: criterion.id, digest, source: criterion.source, criterion: structuredClone(criterion) });
  await saveOperationState(root, next);
  return next;
}

export async function resolveDistilledCriterion(artifact, { root, producerOperationId, criterionId, digest } = {}) {
  if (['closed', 'cancelled'].includes(artifact.state)) throw new Error('resolve needs active consumer');
  if (artifact.id === producerOperationId) throw new Error('return requires a second operation');
  const producer = await loadOperationState(root, producerOperationId);
  const criterion = producer?.distilled_criteria?.find(item => item.id === criterionId);
  if (!criterion || criterion.producerOperationId !== producerOperationId || criterion.status !== 'accepted'
    || criterion.digest !== digest || criterionDigest(criterion.content) !== digest) throw new Error('criterion resolver cannot match accepted ID/digest');
  const event = producer.criterion_events?.find(item => item.type === 'criterion.distilled' && item.criterionId === criterionId);
  if (!event || event.digest !== digest || event.source !== criterion.source) throw new Error('criterion has no matching production event');
  const producerTask = producer.tasks?.find(item => item.id === criterion.producerTaskId) ?? criterion.producerTask;
  assertExecuted(producer, producerTask, producerTask?.verification?.evidence);
  let next = { ...artifact, resolved_criteria: [...(artifact.resolved_criteria ?? []), structuredClone(criterion)] };
  next = criterionEvent(next, { type: 'criterion.resolved', secondOperationId: artifact.id,
    producerOperationId, criterionId, digest, source: criterion.source });
  await saveOperationState(root, next);
  return next;
}

// Executes a local decision function twice, with/without the resolved criterion. It causes no I/O.
// The callback's domain judgment remains the caller's responsibility; trace is not authentication.
export function applyCriterionDecision(artifact, { criterionId, input, decide, card = null } = {}) {
  if (['closed', 'cancelled'].includes(artifact.state)) throw new Error('decision needs active consumer');
  input = criterionText(input, 'decision input');
  if (typeof decide !== 'function') throw new Error('decision needs executable local evaluator');
  const criterion = artifact.resolved_criteria?.find(item => item.id === criterionId);
  if (!criterion || criterionDigest(criterion.content) !== criterion.digest) throw new Error('decision needs resolved criterion');
  if (!artifact.criterion_events?.some(event => event.type === 'criterion.resolved' && event.secondOperationId === artifact.id
    && event.criterionId === criterionId && event.digest === criterion.digest && event.producerOperationId === criterion.producerOperationId))
    throw new Error('decision needs matching resolver event');
  let baseline, evaluated, cardEvidence = null;
  if (card) {
    if (!card.id || !Array.isArray(card.options) || card.options.length < 2 || !card.beforeId || !card.afterId
      || card.beforeId === card.afterId) throw new Error('card decision needs distinct recorded options');
    const before = card.options.find(option => option.id === card.beforeId && option.viable === true);
    const after = card.options.find(option => option.id === card.afterId && option.viable === true);
    if (!before || !after) throw new Error('card decision needs viable options');
    const noCriterionBefore = decide(input, null, structuredClone(before));
    const criterionBefore = decide(input, structuredClone(criterion), structuredClone(before));
    baseline = decide(input, null, structuredClone(after));
    evaluated = decide(input, structuredClone(criterion), structuredClone(after));
    const originalOutput = criterionText(noCriterionBefore?.output, 'original option output');
    const criterionBeforeOutput = criterionText(criterionBefore?.output, 'criterion original option output');
    const baselineAfterOutput = criterionText(baseline?.output, 'alternative baseline output');
    const finalOutput = criterionText(evaluated?.output, 'decision output');
    cardEvidence = { cardId: card.id, beforeId: card.beforeId, afterId: card.afterId,
      optionsDigest: criterionDigest(JSON.stringify(card.options)),
      matrix: { noCriterionBefore: originalOutput, criterionBefore: criterionBeforeOutput,
        noCriterionAfter: baselineAfterOutput, criterionAfter: finalOutput },
      criterionContrast: { without: baselineAfterOutput, with: finalOutput, changed: baselineAfterOutput !== finalOutput },
      cardContrast: { without: criterionBeforeOutput, with: finalOutput, changed: criterionBeforeOutput !== finalOutput },
      method: 'executed-local-two-factor',
      limit: 'same callback contrasts outcomes; semantic correctness and causation remain coordinator attestations' };
  } else { baseline = decide(input, null); evaluated = decide(input, structuredClone(criterion)); }
  const output = criterionText(evaluated?.output, 'decision output');
  const baselineOutput = criterionText(baseline?.output, 'baseline output');
  if (!['used', 'discarded'].includes(evaluated?.disposition)) throw new Error('decision needs used/discarded disposition');
  const decision = { type: 'decision.recorded', secondOperationId: artifact.id, criterionId, digest: criterion.digest,
    input, output, disposition: evaluated.disposition, reason: criterionText(evaluated.reason, 'decision reason'),
    influenceEvidence: { baselineOutput, criterionOutput: output, changed: baselineOutput !== output,
      method: 'executed-local-counterfactual', limit: 'callback contrast does not certify semantic correctness or causation',
      ...(cardEvidence ? { card: cardEvidence, criterionContrast: cardEvidence.criterionContrast,
        cardContrast: cardEvidence.cardContrast } : {}) }, ...(cardEvidence ? { cardId: card.id } : {}) };
  return criterionEvent({ ...artifact, decisions: [...(artifact.decisions ?? []), structuredClone(decision)] }, decision);
}

export async function evaluateCriterionReturn(trace, { root } = {}) {
  const fail = reason => ({ passed: false, reason });
  if (!Array.isArray(trace) || !root) return fail('return needs trace and persisted operation root');
  try {
  for (const [index, produced] of trace.entries()) {
    if (produced?.type !== 'criterion.distilled') continue;
    const criterion = produced.criterion;
    if (!criterion || criterion.status !== 'accepted' || !criterion.acceptance?.words || !criterion.execution?.completed
      || criterion.producerOperationId !== produced.producerOperationId || criterion.id !== produced.criterionId
      || criterionDigest(criterion.content) !== produced.digest || criterion.digest !== produced.digest || criterion.source !== produced.source) continue;
    const producer = await loadOperationState(root, produced.producerOperationId);
    const persisted = producer?.distilled_criteria?.find(item => item.id === produced.criterionId);
    if (JSON.stringify(persisted) !== JSON.stringify(criterion)
      || !producer?.criterion_events?.some(item => JSON.stringify(item) === JSON.stringify(produced))) continue;
    const producerTask = producer.tasks?.find(item => item.id === criterion.producerTaskId) ?? criterion.producerTask;
    assertExecuted(producer, producerTask, producerTask?.verification?.evidence);
    const resolvedIndex = trace.findIndex((item, n) => n > index && item?.type === 'criterion.resolved'
      && item.criterionId === produced.criterionId && item.digest === produced.digest
      && item.producerOperationId === produced.producerOperationId && item.secondOperationId !== produced.producerOperationId);
    if (resolvedIndex < 0) continue;
    const resolved = trace[resolvedIndex];
    const consumer = await loadOperationState(root, resolved.secondOperationId);
    if (!consumer?.criterion_events?.some(item => JSON.stringify(item) === JSON.stringify(resolved))) continue;
    const decision = trace.find((item, n) => n > resolvedIndex && item?.type === 'decision.recorded'
      && item.secondOperationId === resolved.secondOperationId && item.criterionId === resolved.criterionId && item.digest === resolved.digest);
    const evidence = decision?.influenceEvidence;
    if (decision && consumer?.criterion_events?.some(item => JSON.stringify(item) === JSON.stringify(decision))
      && ['used', 'discarded'].includes(decision.disposition) && decision.reason?.trim() && decision.input?.trim()
      && decision.output?.trim() && evidence?.method === 'executed-local-counterfactual'
      && evidence.baselineOutput !== decision.output && evidence.criterionOutput === decision.output)
      return { passed: true, criterionId: criterion.id, digest: criterion.digest,
        limit: 'local mechanism and recorded contrast; not experiential evidence or authenticated participants' };
  }
  } catch (error) { return fail(`return evidence unavailable or invalid: ${error.message}`); }
  return fail('missing production, resolution or observable decision influence');
}

// Situated read only consultation. Interpretations/decision influence remain coordinator claims.
export async function consultCriterion(artifact, input = {}, host = {}) {
  const textField = (value, name) => {
    if (typeof value !== "string" || !value.trim()) throw new Error(`consult needs ${name}`);
    return value.trim();
  };
  if (["closed", "cancelled"].includes(artifact?.state)) throw new Error("consult needs an active operation");
  const source = textField(input.source, "source");
  const reference = textField(input.reference, "reference");
  const limit = textField(input.limit, "limit");
  if (typeof input.pertinent !== "boolean") throw new Error("consult needs explicit pertinence");
  const entry = { source, requested_source: source, reference, limit, at: new Date().toISOString(), digest: null, interpretation_source: "coordinator-attestation", boundary: "scientific source read only; product interpretation by coordinator", transport: null };
  if (!input.pertinent) {
    entry.status = "discarded";
    entry.discard_reason = textField(input.discardReason, "discard reason");
  } else {
    entry.interpretation = textField(input.interpretation, "interpretation");
    entry.decision = Object.fromEntries(["id", "before", "after", "reason"].map(key => [key, textField(input.decision?.[key], `decision.${key}`)]));
    let content = null;
    if (input.mcpConfigured === true && typeof host.readMcp === "function") {
      try {
        const result = await host.readMcp(source);
        if (typeof result?.text !== "string" || result.source !== source) throw new Error("MCP returned absent or mismatched source");
        content = result.text;
        entry.transport = "mcp";
        entry.transport_limit = "host MCP reader provenance is an adapter claim";
      } catch (error) { entry.transport_limit = `MCP unavailable: ${error.message}; local fallback required`; }
    } else entry.transport_limit = input.mcpConfigured ? "MCP unavailable in this process; explicit local fallback" : "MCP not configured; local read only";
    if (content === null) {
      if (typeof input.sourceRoot !== "string" || !input.sourceRoot.trim()) {
        entry.status = "unavailable";
        entry.unavailable_reason = "no configured local source root or usable MCP reader";
      } else {
        const observer = textField(input.sourceRootObservedBy, "source root observer");
        entry.source_root = { root: rutaFisica(input.sourceRoot), observed_by: observer, source: "coordinator-attestation", limit: "configured root and its authority are not authenticated by this API" };
        const path = resolve(input.sourceRoot, source);
        if (fueraDe(input.sourceRoot, path) || !contiene(rutaFisica(input.sourceRoot), rutaFisica(path))) throw new Error("consult source is outside configured root");
        try { content = await readFile(path, "utf8"); entry.transport = "local"; entry.source = rutaFisica(path); }
        catch (error) { entry.status = "unavailable"; entry.unavailable_reason = `local source unavailable: ${error.code ?? "read error"}`; }
      }
    }
    if (content !== null) {
      if (!content.trim()) { entry.status = "unavailable"; entry.unavailable_reason = "source contains no criterion"; }
      else { entry.status = "consulted"; entry.digest = createHash("sha256").update(content).digest("hex"); }
    }
    if (entry.status === "unavailable") { delete entry.interpretation; delete entry.decision; }
  }
  return { ...artifact, loaded: [...(artifact.loaded ?? []), entry], provenance: { ...(artifact.provenance ?? {}), consultations: [...(artifact.provenance?.consultations ?? []), structuredClone(entry)] } };
}

export function compareTechnology(artifact, input = {}) {
  if (["closed", "cancelled"].includes(artifact.state)) throw new Error("comparison needs an active operation");
  const fields = ["id", "technology", "benefit", "cost", "authority", "privacy", "reversibility", "expected_effect", "source", "limit"];
  const text = value => typeof value === "string" && value.trim().length > 0;
  if (!Array.isArray(input.options) || input.options.length < 2) throw new Error("comparison requires two alternatives");
  for (const option of input.options) for (const field of fields) if (!text(option[field])) throw new Error(`comparison option needs ${field}`);
  if (new Set(input.options.map(option => option.id)).size !== input.options.length) throw new Error("comparison option IDs must be distinct");
  if (!input.options.some(option => option.id === input.selected) || !text(input.reason) || !text(input.limit)) throw new Error("comparison needs selected alternative, reason and limit");
  if (!["simulation", "observed"].includes(input.mode)) throw new Error("comparison needs simulation or observed mode");
  if (!Array.isArray(input.observations) || !input.observations.length || input.observations.some(item => !text(item.id) || !text(item.source) || !text(item.result))) throw new Error("comparison requires sourced observations");
  const choice = { ...structuredClone(input), at: new Date().toISOString(), source: "coordinator-attestation", executed: false,
    operation_id: artifact.id, boundary: "comparison changes no authority or effect; simulated ledger does not establish real blockchain utility" };
  return { ...artifact, technology_choices: [...(artifact.technology_choices ?? []), choice] };
}

export function describeOperationCapability(artifact, input = {}, host = {}) {
  for (const key of ["id", "observedBy", "privacy", "limit"]) if (typeof input[key] !== "string" || !input[key].trim()) throw new Error(`capability description needs ${key}`);
  const module = Object.hasOwn(OPTIONAL_CAPABILITIES, input.id) ? OPTIONAL_CAPABILITIES[input.id] : null;
  const configured = module?.present === true && typeof host.capabilities?.[input.id] === "function";
  return { id: input.id, operation_id: artifact.id, module_present: module?.present === true, configured, executed: false,
    status: configured ? "configured-not-executed" : "not-integrated", privacy: input.privacy, limit: input.limit, observed_by: input.observedBy,
    configuration_source: "host-object-observation", boundary: "callable presence is not authenticated configuration, safety or interoperability" };
}

export function operationTrust(artifact) {
  const coverage = [], observations = [], notCovered = [];
  for (const task of artifact.tasks ?? []) {
    if (!task.verification?.executed) { notCovered.push(`${task.id}: no executed domain verification`); continue; }
    try {
      const execution = assertExecuted(artifact, task, task.verification.evidence);
      if (task.state === 'integrated') verifyIntegration(task);
      for (const check of task.verification.evidence.checks ?? []) {
        coverage.push({ task: task.id, observation: check.observation, source: check.evidence, passed: check.passed === true });
      }
      observations.push({ task: task.id, execution: structuredClone(execution) });
    } catch (error) { notCovered.push(`${task.id}: ${error.message}`); }
  }
  if (!coverage.length) notCovered.push("no executed domain verification");
  notCovered.push("human experience not inferred", "external effects not independently authenticated", "role identities are labels");
  return { operation_id: artifact.id, authority: structuredClone(artifact.authority), state: artifact.state,
    provenance: structuredClone(artifact.provenance ?? {}), coverage, observations, notCovered,
    receipt: structuredClone(artifact.receipt ?? null), boundary: "situated evidence, not a universal trust score or certification" };
}

function taskById(artifact, taskId) {
  const found = (artifact?.tasks ?? []).find((task) => task.id === taskId);
  if (!found) throw new Error(`unknown task: ${String(taskId)}`);
  return found;
}

function replaceTask(artifact, task) {
  if (artifact?.state !== "prepared" && artifact?.state !== "cancelled") validateGateBContract({ ...artifact, next_action: artifact?.next_legitimate_action });
  const replaced = { ...artifact, tasks: (artifact?.tasks ?? []).map((each) => (each.id === task.id ? task : each)) };
  return { ...replaced, next_legitimate_action: nextLegitimateAction(replaced) };
}

function clockIso(value) {
  const time = value === null || value === undefined ? Date.now() : value;
  const timestamp = typeof time === "number" && Number.isInteger(time) ? time : Date.parse(time);
  if (!Number.isFinite(timestamp)) throw new Error("task clock must be a valid ISO date or integer millisecond timestamp");
  return new Date(timestamp).toISOString();
}

// El camino legal y nada mas: una tarea lanzada deja la operacion corriendo porque alguien la lanzo,
// y el recorrido lo decide el grafo de states, no esta funcion.
function advanceTo(artifact, target, note) {
  if (artifact.state === target) return { ...appendCheckpoint(artifact, { note }), state: target };
  const path = statePath(artifact.state, target);
  if (path === null) {
    return {
      ...appendCheckpoint(artifact, { note: `${note} (state ${artifact.state} cannot reach ${target})` }),
      uncertainty: [...(artifact.uncertainty ?? []), `no legal transition from ${artifact.state} to ${target}`],
    };
  }
  return path.reduce(
    (current, state, index) => transitionArtifact(current, { state, note: index === path.length - 1 ? note : null }),
    artifact,
  );
}

// La economia de una operacion y lo que va en cadena se declaran antes de correr (criterios 10 y 11):
// un efecto externo sin costo, grant y settlement no se puede poner a andar, y lo que se pone en
// cadena sin desconfianza entre las partes queda anotado como defecto, no como error.
export function declareEffect(artifact, { effect, economy = null, chain = null } = {}) {
  if (effect !== "none" && effect !== "external") {
    throw new Error(`effect must be none or external: ${String(effect)}`);
  }
  if (effect === "external") {
    if (!economy) throw new Error("an external effect declares its economy: cost, grant and settlement");
    if (!present(economy.cost?.amount) || !present(economy.cost?.asset)) {
      throw new Error("economy cost needs an amount and an asset");
    }
    if (!present(economy.grant)) throw new Error("economy needs a grant: what the spend buys");
    if (!present(economy.settlement)) throw new Error("economy needs a settlement: how it is paid and closed");
    if (!chain) throw new Error("an external effect declares what goes on chain: placement, class and reason");
  }
  const defects = [];
  if (chain) {
    if (chain.placement !== "on" && chain.placement !== "off") {
      throw new Error(`chain placement must be on or off: ${String(chain.placement)}`);
    }
    if (!present(chain.class)) throw new Error("chain needs a class");
    if (!present(chain.reason)) throw new Error("chain needs a reason");
    if (chain.placement === "on" && !CHAIN_CLASSES.has(chain.class)) {
      defects.push({ code: "chain_without_distrust", class: chain.class, reason: chain.reason });
    }
  }
  return { ...artifact, effect, economy: economy ?? null, chain: chain ?? null, defects };
}

// Una tarea solo se planifica para una obligacion ya declarada: si no, nunca podria servir de evidencia y
// el error se descubriria tarde, al cumplirla.
function declaredObligationId(artifact, obligation, role) {
  if (typeof obligation !== "string" || !obligation.trim()) throw new Error(`${role} obligation must be a non-empty obligation id`);
  if (!(artifact?.obligations ?? []).some((item) => item.id === obligation)) throw new Error(`${role} cannot be planned for obligation ${obligation}: declare it first`);
  return obligation;
}

// planTask: la tarea nace con su encargo completo o no nace. Un encargo al que le falta el alcance,
// el criterio de terminado o la prueba es un encargo que vuelve como opinion.
export function planTask(artifact, spec = {}) {
  if (artifact?.state !== "prepared" && artifact?.state !== "cancelled") validateGateBContract({ ...artifact, next_action: artifact?.next_legitimate_action });
  const role = spec.role;
  const required = Object.prototype.hasOwnProperty.call(REQUIRED_BY_ROLE, role) ? REQUIRED_BY_ROLE[role] : null;
  if (required === null) throw new Error(`unknown task role: ${String(role)} (daimon, advisor or worker)`);
  if (!present(spec.question)) throw new Error(`${role} needs a question`);
  if (role === "daimon" && (!Array.isArray(spec.sources) || spec.sources.length === 0)) {
    throw new Error("daimon needs sources: what it will read");
  }
  for (const field of required) {
    if (field === "output" || field === "sources") continue;
    if (!present(spec[field])) throw new Error(`${role} needs ${field}`);
  }
  if (!present(spec.output?.path)) throw new Error(`${role} needs an output.path`);
  if (!(Number(spec.timeoutMs) > 0)) throw new Error(`${role} needs a timeoutMs greater than zero`);
  if (spec.kind !== undefined && (typeof spec.kind !== "string" || !["review", "build", "fix", "write"].includes(spec.kind))) {
    throw new Error(`${role} kind must be one of review, build, fix, write`);
  }
  if (spec.estimateMs !== undefined && (!Number.isInteger(spec.estimateMs) || spec.estimateMs <= 0)) {
    throw new Error(`${role} estimateMs must be a positive integer`);
  }
  // `deadlineMs` es una DURACION, con la misma forma y la misma regla que en el kernel: un entero
  // positivo de milisegundos contados desde que la tarea se planifico. No es un instante —el
  // instante es `due_at`— y no es `timeoutMs`: `timeoutMs` es el presupuesto de ejecucion y lo
  // cuenta `dispatch` desde el arranque; este se cuenta desde el plan y es del ciclo completo.
  if (spec.deadlineMs !== undefined && (!Number.isInteger(spec.deadlineMs) || spec.deadlineMs <= 0)) {
    throw new Error(`${role} deadlineMs must be a positive integer`);
  }
  if (!present(spec.nextCheckAt) || Number.isNaN(Date.parse(spec.nextCheckAt))) {
    throw new Error(`${role} needs a nextCheckAt (ISO date): when it is observed again`);
  }
  // Un final declarado se planifica con su propio encargo o no se planifica: mismo destino, mismo
  // criterio y las fuentes declaradas, para que el juez juzgue contra lo que el encargo pedia.
  const finalOutput = spec.final_output === undefined ? null : declaredFinalOutput(artifact, spec.final_output, spec);
  // Cada salida declarada tiene exactamente una tarea viva (decision §1.2): una segunda tarea para el
  // mismo final dejaria dos composiciones y el cierre elegiria una sin decirlo.
  if (finalOutput && (artifact?.tasks ?? []).some((task) => task.final_output === finalOutput && task.state !== "cancelled")) {
    throw new Error(`final output ${finalOutput} already has a task; an output admits exactly one live task`);
  }
  // El plazo se CONGELA aqui, al nace la tarea, y no se recalcula al consultarlo: es lo que hace el
  // kernel con su `dueAt`, y con el mismo motivo —guardar un reloj de creación obliga a que quien
  // consulta lo vuelva a saber— mas uno propio de este archivo: `planned_at` es un texto que se
  // puede editar a mano en FASES.md, y un plazo que dependiera de el moveria solo al mirarlo.
  const plannedAt = new Date().toISOString();
  const tasks = artifact?.tasks ?? [];
  const task = {
    id: `t${tasks.length + 1}`,
    role,
    state: "proposed",
    by: null,
    question: spec.question,
    ...(spec.kind !== undefined ? { kind: spec.kind } : {}),
    output: { path: spec.output.path },
    timeoutMs: spec.timeoutMs,
    ...(spec.estimateMs !== undefined ? { estimateMs: spec.estimateMs } : {}),
    ...(spec.deadlineMs !== undefined
      ? { deadlineMs: spec.deadlineMs, due_at: new Date(Date.parse(plannedAt) + spec.deadlineMs).toISOString() }
      : {}),
    nextCheckAt: spec.nextCheckAt,
    deadline: null,
    executor: null,
    observations: [],
    overdue: false,
    received: null,
    review: null,
    verification: null,
    ...(spec.proof_runner ? { proof_runner: structuredClone(spec.proof_runner) } : {}),
    integration: null,
    blocked: null,
    planned_at: plannedAt,
    ...(Array.isArray(spec.sources) ? { sources: [...spec.sources] } : {}),
    ...(spec.context ? { context: spec.context } : {}),
    ...(spec.scope ? { scope: spec.scope } : {}),
    ...(spec.done_criterion ? { done_criterion: spec.done_criterion } : {}),
    // La obligacion del encargo que esta tarea cumple: solo asi su verificacion cuenta como evidencia de
    // esa obligacion al cerrar (R2 de la revision de L1).
    ...(spec.obligation !== undefined ? { obligation: declaredObligationId(artifact, spec.obligation, role) } : {}),
    ...(finalOutput ? { final_output: finalOutput } : {}),
    ...(spec.proof ? { proof: spec.proof } : {}),
    ...(MUST_DECLARE_BY_ROLE[role] ? { must_declare: [...MUST_DECLARE_BY_ROLE[role]] } : {}),
  };
  // El metodo se fija en la operacion al planificar la primera tarea y no cambia despues: coordinador y
  // trabajadores trabajan con el mismo texto, y uno distinto a mitad de operacion se rechaza al entregar.
  const { sha256: methodSha } = artifact?.method ?? loadShippedMethod();
  const planned = { ...artifact, method: { sha256: methodSha, path: "skills/vespi/method.md" }, tasks: [...tasks, task] };
  planned.next_legitimate_action = nextLegitimateAction(planned);
  return { artifact: planned, task };
}

// Una declaracion no es una ejecucion. Quien llama desde otro proceso —la CLI— no puede llamar la
// herramienta del host aunque la declare: fabricar la funcion para que `routeOperation` la diera
// por expuesta es la mentira de mas peso, porque deja una tarea `running` con un ejecutor que no
// existe, esperando un archivo que nadie va a escribir. Asi que la declaracion se guarda como
// declaracion y la tarea queda marcada como NO ejecutada —sin ejecutor, sin plazo de ejecucion y sin
// estado `running`— esperando a que la ruta corra donde de verdad hay una herramienta.
function declaredRouteOf({ declaredTools = [], hostName = null, model = null, effort = null, now = null } = {}) {
  const tools = (Array.isArray(declaredTools) ? declaredTools : [])
    .map((name) => String(name ?? "").trim())
    .filter((name) => name.length > 0);
  if (tools.length === 0) return null;
  return {
    tools,
    by: `${hostName ?? "unknown"}/${model ?? "unknown"}`,
    host: hostName ?? "unknown",
    model: model ?? "unknown",
    effort: effort ?? "unknown",
    at: clockIso(now),
    executed: false,
  };
}

// Las condiciones para lanzar, separadas del lanzamiento: deliverTask las comprueba antes de llamar al
// host y dispatchTask las vuelve a comprobar al registrar. Devuelve la tarea efectiva, con la instruccion
// de reintento ya aplicada, o el artefacto detenido para buscar.
function dispatchGate(artifact, taskId, retryChange) {
  const retry = retryGate(artifact);
  if (retry.blocked) return { stopped: stopForSearch(artifact, taskId, retry.stop) };
  if (!DISPATCHABLE.has(artifact?.state) && !(artifact.state === "blocked" && artifact.retry_stop?.status === "resolved")) {
    throw new Error(`dispatch needs an authorized operation: state ${String(artifact?.state)} authorizes nobody to run`);
  }
  let task = taskById(artifact, taskId);
  if (task.state === "running") throw new Error(`task ${taskId} is already running; observe and receive its outcome before another dispatch`);
  if (!["proposed", "blocked"].includes(task.state) && !(task.state === "reviewed" && task.verification?.executed === true && task.verification?.passed === false)) throw new Error(`dispatch cannot reopen completed task state ${task.state}; commission a new task`);
  let retryExecution = null;
  if (artifact.retry_stop?.status === "resolved" && (task.blocked?.cause === "retry-ready" || artifact.state === "blocked")) {
    if (taskId !== artifact.retry_stop.task_id) throw new Error("retry must dispatch the stopped task");
    const lookup = artifact.retry_searches?.at(-1);
    if (!present(retryChange) || retryChange !== lookup?.change) throw new Error("retry change must match the recorded lookup and be applied to this commission");
    const before = task.question;
    const after = `${before}\nRetry instruction: ${retryChange}`;
    retryExecution = { change: retryChange, search_digest: artifact.retry_stop.digest, source: "coordinator-attestation",
      commission_before_sha256: createHash("sha256").update(before).digest("hex"), commission_after_sha256: createHash("sha256").update(after).digest("hex") };
    task = { ...task, question: after };
  }
  if (task.received && !task.review) {
    throw new Error(`dispatch blocked: ${taskId} has a delivery pending review; resolve that delivery before commissioning another execution`);
  }
  return { task, retryExecution };
}

// dispatchTask: o corre por una ruta que el host expone, o queda bloqueada con la razon de la
// herramienta que falta. Nunca inventan un ejecutor para que la tarea parezca viva. La entrega de un
// trabajador no entra por aqui: una `delivery` en las opciones publicas se ignora, porque la escribiria el
// mismo llamador que quiere saltarse al host. Solo deliverTask la pasa, por la funcion interna.
export function dispatchTask(artifact, taskId, { delivery: _ignorada, ...options } = {}) {
  return launchTask(artifact, taskId, options, null);
}

function launchTask(artifact, taskId, { host = {}, hostName = null, model = null, effort = null, process = null, now = null, declaredTools = [], retryChange = null } = {}, delivery) {
  const gate = dispatchGate(artifact, taskId, retryChange);
  if (gate.stopped) return gate.stopped;
  const { task, retryExecution } = gate;
  const route = routeOperation({ intent: INTENT_BY_ROLE[task.role], host });
  const declared = declaredRouteOf({ declaredTools, hostName, model, effort, now });
  if (!route.available) {
    const declaradaAqui = declared !== null && declared.tools.includes(route.tool);
    const bloqueada = replaceTask(artifact, {
      ...task,
      ...(retryExecution ? { retry_execution: retryExecution } : {}),
      state: "blocked",
      by: "coordinador",
      executor: null,
      ...(declared !== null ? { declared_route: declared } : {}),
      blocked: {
        cause: route.reason,
        next_action: declaradaAqui
          ? `${taskId} no se ejecuto: ${declared.by} declaro ${route.tool} y este proceso no lo llama; deja el artefacto en ${task.output?.path ?? "la ruta declarada"} y dale receive a ${taskId}`
          : `esperar a que el host exponga ${route.tool} y lanzar ${taskId}; sin esa herramienta no se ejecuta ni se simula`,
        owner: "coordinador",
        executed: false,
      },
    });
    // La OPERACION si queda en marcha: el encargo existe y alguien lo esta esperando. Lo que no se
    // afirma es que una tarea corra —eso vive en la tarea, que no tiene ejecutor— y sin este paso la
    // operacion se quedaria en `authorized` sin camino legal hasta `closed`.
    return advanceTo(bloqueada, "running", `tarea ${taskId} declarada por ${declared?.by ?? "nadie"} y no ejecutada por este proceso`);
  }
  // Un trabajador no corre porque el host exponga delegate: corre porque su paquete cruzo el limite.
  if (route.intent === "delegation" && delivery?.delivered !== true) {
    throw new Error(`dispatch of ${taskId} needs a delivered task package: use deliverTask, which hands the method and the commission to host.delegate before the task runs`);
  }
  const startedAt = clockIso(now);
  const executor = {
    by: `${hostName ?? "unknown"}/${model ?? "unknown"}`,
    host: hostName ?? "unknown",
    model: model ?? "unknown",
    effort: effort ?? "unknown",
    process: process ?? null,
    startedAt,
  };
  const running = replaceTask(artifact, {
    ...task,
    ...(retryExecution ? { retry_execution: retryExecution } : {}),
    state: "running",
    by: executor.by,
    blocked: null,
    executor,
    ...(delivery ? { delivery } : {}),
    // Una entrega observada se consume al lanzar: el mismo tool_use no vuelve a poner la tarea en marcha
    // tras un rechazo de verificacion (R1 de la revision de L1).
    ...(delivery?.host_observation?.tool_use_id ? { consumed_tool_use_ids: [...(task.consumed_tool_use_ids ?? []), delivery.host_observation.tool_use_id] } : {}),
    deadline: new Date(Date.parse(startedAt) + Number(task.timeoutMs)).toISOString(),
  });
  return advanceTo(running, "running", `tarea ${taskId} lanzada por ${executor.by}`);
}

// taskPrompt: el encargo canonico de un trabajador, tal como debe cruzar el limite de un host que el kit
// no llama (Claude Code lanza el trabajador con su propia herramienta). Usa el metodo fijado en la
// operacion; si el metodo distribuido cambio desde que se planifico, no hay prompt.
export function taskPrompt(artifact, taskId) {
  const gate = dispatchGate(artifact, taskId, null);
  if (gate.stopped) throw new Error(`operation is stopped for search; ${taskId} has no commission to deliver`);
  if (INTENT_BY_ROLE[gate.task.role] !== "delegation") throw new Error(`taskPrompt renders a worker commission; ${gate.task.role} is not a worker`);
  const shipped = loadShippedMethod();
  if (shipped.sha256 !== (artifact.method?.sha256 ?? shipped.sha256)) {
    throw new Error(`the shipped method changed since planning (pinned ${artifact.method.sha256}); re-plan before delivering`);
  }
  const pkg = buildTaskMethod({ operation: artifact, task: gate.task, methodText: shipped.content, cardContent: taskCardContent(artifact, taskId) });
  const prompt_sha256 = packageDigest(pkg);
  const commission = renderCommission(pkg);
  const commission_sha256 = createHash("sha256").update(commission).digest("hex");
  // La referencia es lo que el coordinador escribe en la herramienta de agentes: el hook del host la
  // expande, y el modelo nunca copia el metodo a mano. `reference` lleva al encargo con el metodo dentro;
  // `worker_reference`, al encargo sin metodo para el trabajador del kit, que lo trae en su definicion.
  return {
    prompt: renderTaskPrompt(pkg), prompt_sha256, method_sha256: pkg.method.sha256,
    reference: `@lore-task ${artifact.id} ${taskId} sha256:${prompt_sha256}`,
    commission, commission_sha256,
    worker_reference: `@lore-task ${artifact.id} ${taskId} sha256:${commission_sha256}`,
  };
}

function taskCardContent(artifact, taskId) {
  const offer = artifact.perturbations?.find(item => item.task_id === taskId);
  return offer ? renderTaskCard(offer) : null;
}

// La herramienta del host que lanzo al trabajador vive fuera de este proceso: la ruta existe porque el
// host la observo, no porque aqui haya una funcion que llamar. Llamarla es un error.
const OBSERVED_OUT_OF_PROCESS = { delegate: () => { throw new Error("delegation observed out of process; nothing to call here"); } };

// confirmObservedDelivery: pone en marcha a un trabajador solo con una observacion del host cuya huella
// coincide con el encargo canonico y que el transcript de la sesion respalda. Sin observacion, o sin ese
// respaldo, la tarea queda bloqueada y nada se da por ejecutado. La integridad de la observacion es la del
// mismo usuario del sistema operativo, y se declara.
//
// Dos rutas. `prompt`: el trabajador recibio el encargo con el metodo dentro. `kit-worker`: recibio el
// encargo sin metodo y el metodo le llego en la definicion del trabajador del kit; entonces hacen falta las
// tres pruebas del host: el tipo de agente que lanzo, el primer mensaje del subagente y la huella del metodo
// en la definicion que el hook leyo al lanzar.
export function confirmObservedDelivery(artifact, taskId, { observation = null, hostName = null, model = null, effort = null, process = null, now = null } = {}) {
  const { prompt_sha256: fullSha, commission_sha256: commissionSha, method_sha256 } = taskPrompt(artifact, taskId);
  const kitWorker = observation?.route === "kit-worker";
  const prompt_sha256 = kitWorker ? commissionSha : fullSha;
  const task = taskById(artifact, taskId);
  const base = { package_sha256: prompt_sha256, method_sha256, observed_by: "claude-code-hook", at: clockIso(now) };
  const bloquear = (cause) => advanceTo(replaceTask(artifact, {
    ...task,
    state: "blocked",
    by: "coordinador",
    executor: null,
    delivery: { ...base, host_observation: observation ? { ...observation } : null, recipient: null, delivered: false },
    blocked: { cause, next_action: `lanzar ${taskId} con la herramienta de agentes del host y el prompt de \`operation prompt\`, y confirmar de nuevo`, owner: "coordinador", executed: false },
  }), "running", `tarea ${taskId} no confirmada: ${cause}`);
  if (!observation) return bloquear("delivery not observed by the host: no Pre/Post pair carries this prompt");
  if ((task.consumed_tool_use_ids ?? []).includes(observation.tool_use_id)) return bloquear(`delivery already consumed: tool_use ${observation.tool_use_id} launched this task before; launch the worker again`);
  if (!present(observation.tool_use_id)) return bloquear("delivery not observed by the host: the observation names no tool_use");
  if (observation.prompt_sha256 !== prompt_sha256) return bloquear("delivery not observed by the host for this prompt: the observed fingerprint differs");
  // Una referencia solo cuenta si el hook la expandio en el host: el transcript guarda lo que escribio el
  // modelo (la referencia) y el registro, que el hook la sustituyo por el encargo de esa misma huella.
  const respaldada = observation.transcript === "matched" || (observation.transcript === "matched-reference" && observation.expanded_by_host === true);
  if (!respaldada) return bloquear(`delivery not backed by the session transcript (${observation.transcript ?? "unknown"})`);
  if (observation.worker_received === "mismatch") return bloquear("the worker's own transcript shows another commission: the method did not arrive as planned");
  if (kitWorker) {
    const expectedType = kitWorkerAgentType();
    if (observation.worker_agent_type !== expectedType) return bloquear(`the commission reached an agent type other than this plugin's kit worker (${observation.worker_agent_type ?? "unknown"}, expected ${expectedType}): without its definition the method did not arrive`);
    if (observation.definition_method_sha256 !== method_sha256) return bloquear("the kit worker definition did not carry the method pinned in the operation");
    if (observation.worker_received !== "matched") return bloquear(`the kit worker's own transcript does not show the commission (${observation.worker_received ?? "unknown"})`);
  }
  return launchTask(artifact, taskId, { host: OBSERVED_OUT_OF_PROCESS, hostName, model, effort, process, now }, {
    ...base,
    host_observation: {
      tool_use_id: observation.tool_use_id, session_id: observation.session_id ?? null, route: kitWorker ? "kit-worker" : "prompt",
      transcript: observation.transcript, expanded_by_host: observation.expanded_by_host === true, worker_received: observation.worker_received ?? "absent",
      ...(kitWorker ? { worker_agent_type: observation.worker_agent_type, definition_method_sha256: observation.definition_method_sha256 } : {}),
      integrity: "same-os-user",
    },
    recipient: observation.agent_id ?? observation.tool_use_id,
    delivered: true,
  });
}

// deliverTask: la entrega real a un trabajador. Arma el paquete con el metodo distribuido, el objetivo,
// las fuentes y el terminado; lo pasa a host.delegate y solo despues registra la tarea en marcha, con la
// huella del paquete que cruzo el limite y el destinatario que dice el host. Sin metodo falla antes de
// llamar al host; si el host no toma el paquete, la tarea queda bloqueada y nada se ejecuto.
export async function deliverTask(artifact, taskId, { host = {}, hostName = null, model = null, effort = null, process = null, now = null, retryChange = null, methodText } = {}) {
  const gate = dispatchGate(artifact, taskId, retryChange);
  if (gate.stopped) return gate.stopped;
  if (INTENT_BY_ROLE[gate.task.role] !== "delegation") {
    throw new Error(`deliverTask hands a package to a worker; ${gate.task.role} delivery is not implemented yet`);
  }
  const text = methodText === undefined ? loadShippedMethod().content : methodText;
  const pkg = buildTaskMethod({ operation: artifact, task: gate.task, methodText: text, cardContent: taskCardContent(artifact, taskId) });
  const pinned = artifact.method?.sha256 ?? loadShippedMethod().sha256;
  if (pkg.method.sha256 !== pinned) {
    throw new Error(`method text differs from the method pinned in the operation (${pinned}); a worker receives the same method the coordinator planned with`);
  }
  const route = routeOperation({ intent: "delegation", host });
  if (!route.available) return dispatchTask(artifact, taskId, { host, hostName, model, effort, process, now, retryChange });
  const prompt = renderTaskPrompt(pkg);
  // Lo que se registra es un acuse del adaptador, no una observacion del host: el adaptador en proceso lo
  // escribe el mismo coordinador. La observacion del host (un hook que ve el prompt real) va aparte.
  const base = { package_sha256: packageDigest(pkg), method_sha256: pkg.method.sha256, observed_by: "adapter-acknowledgement", host_observation: null, at: clockIso(now) };
  const noEntregada = (cause) => advanceTo(replaceTask(artifact, {
    ...gate.task,
    state: "blocked",
    by: "coordinador",
    executor: null,
    delivery: { ...base, recipient: null, delivered: false },
    blocked: { cause, next_action: `revisar el host y volver a entregar ${taskId}; nada se ejecuto`, owner: "coordinador", executed: false },
  }), "running", `tarea ${taskId} no entregada: ${cause}`);
  let response;
  try {
    response = await host.delegate({ kind: "task", operationId: pkg.operationId, taskId, prompt, package: pkg });
  } catch (error) {
    return noEntregada(`host did not take the package: ${error?.message ?? String(error)}`);
  }
  if (typeof response?.recipient !== "string" || !response.recipient.trim() || response?.received_sha256 !== base.package_sha256) {
    return noEntregada("adapter did not acknowledge the exact prompt: it must return a recipient and the sha256 of the prompt it received");
  }
  return launchTask(artifact, taskId, { host, hostName, model, effort, process, now, retryChange }, { ...base, recipient: response.recipient, delivered: true });
}

// observeTask: deja escrito que se vio, cuando, y si seguia viva. Una hora posterior al deadline
// con esa observacion nueva deja la tarea vencida: no se marca viva por no mirar.
//
// Se observa una tarea CORRIENDO y tambien una que se declaro y quedo sin ejecutar. La segunda no
// tiene ejecutor ni plazo de ejecucion —nadie la lanzo— y por eso lo que se escribe ahi no afirma
// que algo corra: es lo que el coordinador vio mientras insistir. El muro de tres fallos iguales
// vive justamente en esa insistencia, asi que excluirla dejaria al coordinador sin forma de decir
// "lo intente tres veces y fallo las tres".
export function observeTask(artifact, taskId, { text = null, alive = null, at, signature = null, outcome = null } = {}) {
  const task = taskById(artifact, taskId);
  if (task.state !== "running" && !(task.state === "blocked" && present(task.blocked?.cause))) {
    throw new Error(`observeTask needs a running task, or one declared and not executed: ${taskId} is ${task.state}`);
  }
  if (signature !== null && signature !== undefined && typeof signature !== "string") {
    throw new Error("observe signature must be a string");
  }
  if (at !== undefined && !validObservationTime(at)) {
    throw new Error("observe at must be ISO 8601 with an explicit time zone or a representable integer millisecond timestamp");
  }
  const when = at === undefined ? new Date().toISOString() : at;
  const observedAt = typeof when === "number" ? when : Date.parse(when);
  if (observedAt > Date.now()) throw new Error("observe cannot claim a future observation");
  const overdue = present(task.deadline) ? observedAt > Date.parse(task.deadline) : task.overdue === true;
  const updated = replaceTask(artifact, {
    ...task,
    observations: [...task.observations, {
      at: when,
      text: text ?? "",
      alive: alive ?? null,
      ...(signature ? { signature: signature.slice(0, 500), outcome: outcome ?? "failure" } : {}),
      ...(outcome === "success" ? { outcome } : {}),
    }],
    overdue,
  });
  const retry = retryGate(updated);
  return retry.blocked ? stopForSearch(updated, taskId, retry.stop) : updated;
}

function stopForSearch(artifact, taskId, stop) {
  const task = taskById(artifact, taskId);
  const next = replaceTask(artifact, { ...task, state: "blocked", blocked: {
    cause: "repeated-failure", owner: artifact.owner,
    next_action: "stop_and_search: use an observed host tool; unavailable search keeps this operation blocked",
  } });
  const stopped = { ...next, retry_stop: { ...structuredClone(stop), task_id: stop.task_id ?? taskId } };
  return stopped.state === "blocked" ? { ...stopped, next_legitimate_action: nextLegitimateAction(stopped) }
    : transitionArtifact(stopped, { state: "blocked", note: "stop_and_search after repeated failure" });
}

// A host/coordinator attestation of a lookup already performed. This function never searches.
export function recordRetrySearch(artifact, input = {}) {
  const gate = retryGate(artifact);
  if (!gate.blocked) throw new Error("no stopped failure stretch needs a retry search");
  if (!present(input.observedBy)) throw new Error("retry search needs the host observer");
  const at = input.at ?? new Date().toISOString();
  if (!validObservationTime(at)) throw new Error("retry search needs a valid observation time");
  if ((typeof at === "number" ? at : Date.parse(at)) > Date.now()) throw new Error("retry search cannot claim a future observation");
  const base = { digest: gate.stop.digest, signature: gate.stop.signature, at, observed_by: input.observedBy,
    executed_by_cli: false, source: "coordinator-attestation" };
  let receipt, stop;
  if (input.available !== true) {
    if (!present(input.reason)) throw new Error("unavailable retry search needs its reason");
    receipt = { ...base, status: "unavailable", reason: input.reason };
    stop = { ...gate.stop, status: gate.stop.status === "requires_arbitration" ? "requires_arbitration" : "requires_search", reason: `search unavailable: ${input.reason}` };
  } else {
    if (!present(input.tool) || !present(input.query)) throw new Error("retry search needs the observed tool and query");
    if (!Array.isArray(input.findings) || !input.findings.length) throw new Error("retry search requires findings with source, applicability and limit");
    for (const finding of input.findings) {
      if (!present(finding.source) || !present(finding.finding) || !present(finding.limit) || finding.applies !== true) throw new Error("each finding needs a source, applicable observation and limit");
    }
    if (typeof input.change !== "string" || !input.change.trim()) throw new Error("retry search must name the change before retrying");
    if (input.same_scope !== true) throw new Error("retry change must preserve scope; a new scope returns to the owner");
    const conflicts = input.conflicts ?? [];
    if (!Array.isArray(conflicts) || conflicts.some(item => !present(item.source) || !present(item.conflict) || !present(item.proposal))) throw new Error("conflicts require source, disagreement and arbitration proposal");
    const lastAttempt = Math.max(...gate.stop.attempts.map(item => typeof item.at === "number" ? item.at : Date.parse(item.at)));
    const searchedAt = typeof at === "number" ? at : Date.parse(at);
    if (Number.isFinite(lastAttempt) && searchedAt < lastAttempt) throw new Error("retry search predates the stopped attempts");
    const arbitration = gate.stop.status === "requires_arbitration" || conflicts.length > 0;
    receipt = { ...base, status: arbitration ? "requires_arbitration" : "resolved", tool: input.tool, query: input.query,
      findings: structuredClone(input.findings), change: input.change, conflicts: structuredClone(conflicts) };
    stop = { ...gate.stop, status: receipt.status, reason: arbitration ? "owner arbitration required for recorded Lore/agreement conflict" : "pertinent lookup recorded; retry only the named change" };
  }
  let next = { ...artifact, retry_stop: stop, retry_searches: [...(artifact.retry_searches ?? []), receipt] };
  const task = taskById(next, stop.task_id);
  next = replaceTask(next, { ...task, state: "blocked", blocked: { cause: stop.status === "resolved" ? "retry-ready" : "repeated-failure", owner: artifact.owner, next_action: stop.reason } });
  return { ...next, next_legitimate_action: nextLegitimateAction(next) };
}

function validObservationTime(at) {
  if (typeof at === "number") return Number.isInteger(at) && Number.isFinite(at) && Number.isFinite(new Date(at).getTime());
  if (typeof at !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/i.test(at)) return false;
  const timestamp = Date.parse(at);
  if (!Number.isFinite(timestamp)) return false;
  const [, year, month, day] = at.match(/^(\d{4})-(\d{2})-(\d{2})T/);
  return Number(month) >= 1 && Number(month) <= 12
    && Number(day) >= 1 && Number(day) <= new Date(Date.UTC(Number(year), Number(month), 0)).getUTCDate();
}

// receiveTask: recibida significa que el archivo existe de verdad, con su huella real, DENTRO del
// proyecto. Sin archivo, la tarea sigue corriendo y el llamador se lleva el motivo.
//
// La contencion no es un extra: lo que se sella en FASES.md es la huella de un archivo de este
// proyecto, y un `receive` que aceptara cualquier ruta escribiria en el checkpoint de una operacion
// la voz de un archivo de otro arbol —con su ruta y su sha256— sin que nada diga que entro de
// fuera. Por eso `root` es obligatorio: sin el contra el que comparar, no hay frontera que
// comprobar, y lo que no se puede comprobar no se acepta. Se mira la ruta LEXICA (el `..` escrito a
// mano y la barra ajena) y la FISICA (la junction o el enlace en un directorio intermedio): las
// dos, porque una comparacion de cadenas no ve un enlace y un enlace si se ve.
//
// `output.path` y la ruta que se lee se comprueban las dos, para que el encargo no seDeclare fuera
// y luego se lea un archivo de dentro: el bloqueo tiene que caer en el encargo, no solo en la
// entrega.
function fueraDe(root, candidate) {
  if (!present(root) || !present(candidate)) return false;
  const base = resolve(root);
  const abs = resolve(base, String(candidate));
  if (!contiene(base, abs)) return true;
  const fisicaBase = rutaFisica(base);
  return !contiene(fisicaBase, rutaFisica(abs));
}

function contiene(base, target) {
  const rel = relative(base, target);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

// El ultimo ancestro que existe, resuelto: asi una ruta que todavia no se creo tambien sale por donde
// tiene que salir, y no solo la que ya esta en disco.
function rutaFisica(path) {
  let cursor = resolve(path);
  const tail = [];
  while (!existsSync(cursor)) {
    const parent = dirname(cursor);
    if (parent === cursor) return resolve(path);
    tail.unshift(cursor.slice(parent.length + 1));
    cursor = parent;
  }
  try {
    return resolve(realpathSync.native(cursor), ...tail);
  } catch {
    return resolve(path);
  }
}

export async function receiveTask(artifact, taskId, { path = null, exitCode = null, text = "", now = null, root = null } = {}) {
  const task = taskById(artifact, taskId);
  const file = path ?? task.output?.path ?? null;
  if (!present(file)) throw new Error(`receiveTask needs a path for ${taskId}`);
  const correctingRejected = task.state === "reviewed" && task.verification?.executed === true && task.verification?.passed === false;
  const correctingAdvisor = ["rejected", "changes_requested"].includes(task.review?.verdict);
  const reconcilingLegacy = task.state === "reviewed" && task.received && !task.received.root;
  if (task.state !== "running" && !correctingRejected && !reconcilingLegacy && !(task.state === "blocked" && present(task.blocked?.cause))) {
    throw new Error(`receiveTask needs a running task: ${taskId} is ${task.state}`);
  }
  if (!present(root)) throw new Error(`receiveTask needs the operation root to check the delivered path stays inside it: ${taskId} has none`);
  const escapada = [task.output?.path, file].find((candidate) => fueraDe(root, candidate));
  if (present(escapada)) {
    return replaceTask(artifact, {
      ...task,
      state: "blocked",
      by: "coordinador",
      executor: task.executor ?? null,
      blocked: {
        cause: "out-of-root",
        next_action: `copia la entrega dentro de ${resolve(root)} y vuelve a receive: una huella de fuera del proyecto no se sella en su FASES.md`,
        owner: "coordinador",
      },
    });
  }
  // Se lee exactamente la ruta que fueraDe valido, resuelta contra el root de la operacion: una ruta
  // relativa cruda se resolveria contra el cwd del proceso y sellaria los bytes de un arbol ajeno.
  const archivo = resolve(root, String(file));
  let bytes;
  try {
    bytes = await readFile(archivo);
  } catch (error) {
    if (error?.code === "ENOENT") throw new Error(`the declared output does not exist: ${file}`);
    throw new Error(`the declared output could not be read: ${file} (${error?.code ?? "unreadable"})`);
  }
  const advisorRecovery = task.state === "blocked" && task.received && !task.review;
  if (advisorRecovery) {
    const sha256 = createHash("sha256").update(bytes).digest("hex");
    if (!task.received?.sha256 || sha256 !== task.received.sha256
        || archivo !== resolve(root, task.received.path ?? task.output.path)) {
      return replaceTask(artifact, {
        ...task,
        state: "blocked",
        blocked: {
          cause: "advisor-delivery-changed",
          next_action: `restaurar la entrega recibida de ${taskId} o declarar una nueva ejecucion/entrega antes de revisar; la huella anterior se conserva`,
          owner: "coordinador",
          executed: false,
        },
      });
    }
  }
  const delivery = classifyDelegateOutput({
    exitCode,
    text,
    expectedArtifacts: [task.output?.path ?? file],
    artifactsPresent: [file],
  });
  if (!delivery.delivered) {
    return replaceTask(artifact, {
      ...task,
      state: "blocked",
      blocked: { cause: delivery.cause, next_action: delivery.nextStep, owner: "coordinador" },
    });
  }
  if (advisorRecovery) return replaceTask(artifact, { ...task, state: "received", blocked: null });
  const finishedAt = clockIso(now);
  const loHizo = task.executor ?? task.declared_route ?? null;
  const startedAt = loHizo?.at ?? loHizo?.startedAt;
  const actualMs = Number.isFinite(Date.parse(finishedAt)) && Number.isFinite(Date.parse(startedAt))
    ? Date.parse(finishedAt) - Date.parse(startedAt)
    : null;
  return replaceTask(artifact, {
    ...task,
    state: "received",
    ...((correctingRejected || correctingAdvisor || reconcilingLegacy) ? {
      review: null, verification: null, integration: null,
      review_history: [...(task.review_history ?? []), { received: structuredClone(task.received), review: structuredClone(task.review), verification: structuredClone(task.verification) }],
    } : {}),
    by: task.executor?.by ?? task.by ?? "coordinador",
    blocked: null,
    finishedAt,
    ...(actualMs !== null ? { actualMs } : {}),
    received: {
      root: realpathSync(root),
      path: archivo,
      sha256: createHash("sha256").update(bytes).digest("hex"),
      bytes: bytes.length,
      at: finishedAt,
    },
  });
}

// Calibration is intentionally descriptive: each exact role/host/model key stands on its own.
// Percentiles use nearest rank, and fewer than three valid durations never produce a ratio.
//
// El reloj que se mide es el del ejecutor cuando hay uno, y el de la declaracion cuando no: una
// tarea que solo se declaro no la ejecuto nadie, pero su espera —de la declaracion a la entrega— si
// es un tiempo real de este proyecto, y callarse ese dato seria tirar la medida que si existe. La
// clave sigue siendo rol + host + modelo, y ninguna de las dos cambia por usar el otro reloj.
export function calibrateEstimates(tasks = []) {
  const groups = new Map();
  for (const task of Array.isArray(tasks) ? tasks : []) {
    if (!Number.isInteger(task?.estimateMs) || task.estimateMs <= 0) continue;
    const loHizo = task.executor ?? task.declared_route ?? null;
    const host = loHizo?.host ?? null;
    const model = loHizo?.model ?? null;
    const key = `${task.role ?? "unknown"}|host=${host ?? "unspecified"}|model=${model ?? "unspecified"}`;
    if (!groups.has(key)) groups.set(key, { ratios: [], ignoredNonPositive: 0 });
    const group = groups.get(key);
    const start = Date.parse(loHizo?.startedAt ?? loHizo?.at);
    const finish = Date.parse(task.finishedAt);
    if (!Number.isFinite(start) || !Number.isFinite(finish)) continue;
    const actualMs = finish - start;
    if (actualMs <= 0) {
      group.ignoredNonPositive += 1;
      continue;
    }
    group.ratios.push(actualMs / task.estimateMs);
  }
  return Object.fromEntries([...groups].map(([key, group]) => {
    const ratios = group.ratios.sort((a, b) => a - b);
    if (ratios.length < 3) return [key, { samples: ratios.length, measured: false, ignoredNonPositive: group.ignoredNonPositive }];
    const middle = Math.floor(ratios.length / 2);
    const medianRatio = ratios.length % 2 ? ratios[middle] : (ratios[middle - 1] + ratios[middle]) / 2;
    const p80Ratio = ratios[Math.ceil(ratios.length * 0.8) - 1];
    return [key, { samples: ratios.length, medianRatio, p80Ratio, basis: "actualMs / estimateMs", ignoredNonPositive: group.ignoredNonPositive }];
  }));
}

// reviewTask: revisada es un hecho del revisor, con lo que cotejo dicho. Cotejar es revisar; sin las
// tres cotejadas no hay revision.
export function blockReviewTask(artifact, taskId) {
  const task = taskById(artifact, taskId);
  if (task.state !== "received") throw new Error(`blockReviewTask needs a received task: ${taskId} is ${task.state}`);
  return replaceTask(artifact, {
    ...task,
    state: "blocked",
    by: "coordinador",
    blocked: {
      cause: "advisor-unavailable: host does not expose decide",
      next_action: `esperar a que el coordinador observe decide; luego volver a receive ${taskId} sobre la misma entrega y revisar el mismo acuerdo`,
      owner: "coordinador",
      executed: false,
    },
  });
}

export function reviewTask(artifact, taskId, { reviewer, checked = [], notes = "", advisorRoute = null, verdict } = {}) {
  const task = taskById(artifact, taskId);
  if (advisorRoute?.available !== true || advisorRoute?.tool !== "decide" || !present(advisorRoute?.observedBy)) {
    throw new Error("review blocked: coordinator has not observed the host Advisor tool decide");
  }
  if (task.state !== "received") throw new Error(`reviewTask needs a received task: ${taskId} is ${task.state}`);
  if (!present(reviewer)) throw new Error("review needs a reviewer");
  const executor = task.executor?.by ?? task.declared_route?.by ?? "";
  if (executor && String(reviewer).trim().toLowerCase() === String(executor).trim().toLowerCase()) {
    throw new Error(`review must be independent: ${String(reviewer)} executed ${taskId}`);
  }
  const missing = REVIEW_CHECKS.filter((check) => !checked.includes(check));
  if (missing.length > 0) {
    throw new Error(`review must check scope, sources and risks; missing: ${missing.join(", ")}`);
  }
  if (!["accepted", "changes_requested", "rejected"].includes(verdict)) {
    throw new Error("review needs an explicit verdict: accepted, changes_requested or rejected");
  }
  if (verdict !== "accepted" && !present(notes)) throw new Error("a non-accepted review needs its findings in notes");
  const review = { by: reviewer, verdict, checked: [...checked], notes: notes ?? "", artifact_sha256: task.received?.sha256, advisor_route: { tool: advisorRoute.tool, observed_by: advisorRoute.observedBy, source: "coordinator-attestation" }, at: new Date().toISOString() };
  return replaceTask(artifact, {
    ...task,
    state: verdict === "accepted" ? "reviewed" : "blocked",
    by: reviewer,
    review,
    blocked: verdict === "accepted" ? null : { cause: `advisor-${verdict}`, next_action: `corregir ${taskId} segun el veredicto y recibir la entrega para una nueva revision; un cambio de acuerdo vuelve a su dueno`, owner: "coordinador" },
  });
}

// verifyTask: verificada exige que quien verifica no sea quien ejecuto, que haya observado el criterio
// y que diga con que evidencia. Las tres cosas o ninguna.
//
// Quien lo ejecuto se busca en el ejecutor y, cuando no hay ninguno, en la ruta declarada: una tarea
// que solo se declaro no la ejecuto nadie, pero el nombre que quedo escrito es el de quien iba a
// hacerlo, y dejar que ese mismo nombre certificase el trabajo seria abrir la puerta que esta regla
// existe para cerrar.
function verifyReference(reference, label) {
  if (!reference || typeof reference.path !== "string" || !/^[a-f0-9]{64}$/.test(reference.sha256 ?? "")) {
    throw new Error(`${label} requires an evidence path and sha256`);
  }
  const digest = createHash("sha256").update(readFileSync(reference.path)).digest("hex");
  if (digest !== reference.sha256) throw new Error(`${label} digest changed; receive and check the current bytes again`);
}

function verifyCoverage(task, evidence) {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    throw new Error("verification evidence must bind the criterion, proof and received artifact");
  }
  if (evidence.criterion !== (task.done_criterion ?? task.question)) throw new Error("verification criterion does not match the commission");
  if (evidence.proof !== (task.proof ?? task.question)) throw new Error("verification proof does not match the agreed proof");
  verifyReference(task.received, "received artifact");
  if (evidence.artifact_sha256 !== task.received.sha256) throw new Error("verification artifact digest does not match the delivery");
  if (!Array.isArray(evidence.notCovered) || evidence.notCovered.length > 0) throw new Error("verification has incomplete coverage (notCovered)");
  if (!Array.isArray(evidence.checks) || evidence.checks.length === 0) throw new Error("verification needs observed checks");
  for (const check of evidence.checks) {
    if (check?.passed !== true || typeof check.observation !== "string" || !check.observation.trim()) throw new Error("verification check must have passed with an observation");
    verifyReference(check.evidence, "check evidence");
  }
  if (!Array.isArray(evidence.sources)) throw new Error("verification must declare source coverage");
  for (const source of task.sources ?? []) {
    const covered = evidence.sources.find(item => item?.ref === source);
    if (!covered || typeof covered.observation !== "string" || !covered.observation.trim()) throw new Error(`verification is missing source coverage: ${source}`);
    verifyReference(covered.evidence, "source evidence");
  }
}

export function verifyTask(artifact, taskId, { verifier, observed, evidence } = {}) {
  const task = taskById(artifact, taskId);
  if (task.state !== "reviewed") throw new Error(`verifyTask needs a reviewed task: ${taskId} is ${task.state}`);
  if (task.review?.verdict !== "accepted") throw new Error("verification requires an accepted Advisor verdict");
  if (!task.received?.sha256 || task.review.artifact_sha256 !== task.received.sha256) throw new Error("Advisor verdict does not match the received artifact");
  const loHizo = task.executor?.by ?? task.declared_route?.by ?? "";
  const executorBy = String(loHizo).trim().toLowerCase();
  const verifierNormalized = String(verifier ?? "").trim().toLowerCase();
  const reviewerNormalized = String(task.review?.by ?? "").trim().toLowerCase();
  if (!present(verifier) || (executorBy.length > 0 && verifierNormalized === executorBy)
      || (reviewerNormalized.length > 0 && verifierNormalized === reviewerNormalized)) {
    throw new Error(`verification must be independent: ${String(verifier) ?? "nobody"} cannot verify a task executed by ${loHizo}`);
  }
  if (observed !== true) throw new Error("verification requires observed: true, the criterion checked with one's own eyes");
  if (!present(evidence)) throw new Error("verification requires evidence: what was opened, read and compared");
  verifyCoverage(task, evidence);
  const execution = assertExecuted(artifact, task, evidence);
  return replaceTask(artifact, {
    ...task,
    state: "verified",
    by: verifier,
    verification: { by: verifier, observed: true, evidence: structuredClone(evidence), executed: true, execution: structuredClone(execution), independence: "labels_only", at: new Date().toISOString() },
  });
}

function integrationReference(task, destination) {
  const root = task.received?.root;
  if (!present(root)) throw new Error('integration destination needs the received project root');
  if (!present(destination)) throw new Error('integration needs a destination: where the verified output lands');
  if (fueraDe(root, destination)) throw new Error('integration destination escapes the received project root');
  const path = resolve(root, destination);
  let bytes;
  try { bytes = readFileSync(path); }
  catch { throw new Error('integration destination is missing or unreadable; place the verified output there first'); }
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  if (sha256 !== task.received.sha256) throw new Error('integration destination digest differs from the verified output; receive, review and verify the composed artifact before integrating it');
  return { path, sha256 };
}

function verifyIntegration(task) {
  const reference = integrationReference(task, task.integration?.destination);
  if (task.integration?.path !== reference.path || task.integration?.sha256 !== reference.sha256) {
    throw new Error('integration destination evidence is missing or changed; integrate the verified output again');
  }
}

// Integrar acredita los bytes del destino; una sintesis nueva necesita su propia verificacion.
export function integrateTask(artifact, taskId, { destination } = {}) {
  const task = taskById(artifact, taskId);
  if (["closed", "cancelled"].includes(artifact.state)) throw new Error('integration cannot change a terminal operation');
  if (!["verified", "integrated"].includes(task.state)) throw new Error(`integrateTask needs a verified task: ${taskId} is ${task.state}`);
  if (!present(destination)) throw new Error("integration needs a destination: where the verified output lands");
  verifyCoverage(task, task.verification?.evidence);
  assertExecuted(artifact, task, task.verification?.evidence);
  const reference = integrationReference(task, destination);
  return replaceTask(artifact, {
    ...task,
    state: "integrated",
    by: task.verification?.by ?? "coordinador",
    integration: { destination, ...reference, at: new Date().toISOString() },
  });
}

// Obligaciones del encargo: todo lo que la persona pidio entregar, no solo el artefacto que una prueba
// tecnica mira (un texto y, ademas, ofrecer guardar lo aprendido). Se declaran una vez y quedan fijadas
// por su huella, que ademas queda escrita en un checkpoint: resumir, despachar o borrar los campos no las
// quita (R5 de la revision de L1). Cada una se cumple con evidencia propia, y el cierre no certifica
// conformidad mientras falte alguna, aunque las verificaciones tecnicas pasen.
const obligationsDigest = (obligations) => createHash("sha256").update(JSON.stringify(obligations.map(({ id, description }) => ({ id, description })))).digest("hex");
const OBLIGATIONS_NOTE = "obligaciones declaradas sha256:";
const filled = (value) => typeof value === "string" && value.trim().length > 0;

export function declareObligations(artifact, obligations) {
  if (["closed", "cancelled"].includes(artifact?.state)) throw new Error("obligations cannot change a terminal operation");
  if (Array.isArray(artifact?.obligations) || declaredInTrail(artifact) !== null) throw new Error("obligations already declared; changing the mandate is a decision of its owner");
  if (!Array.isArray(obligations) || obligations.length === 0) throw new Error("declareObligations needs at least one obligation");
  const ids = new Set();
  const declared = obligations.map((item) => {
    if (!filled(item?.id) || !filled(item?.description)) throw new Error("each obligation needs an id and a description");
    if (ids.has(item.id)) throw new Error(`duplicate obligation id: ${item.id}`);
    ids.add(item.id);
    return { id: item.id, description: item.description, fulfilled: null };
  });
  const digest = obligationsDigest(declared);
  let withList = { ...artifact, obligations: declared, obligations_sha256: digest };
  // Declarar obligaciones despues de los finales es un orden legitimo y no bloquea el cierre: la
  // huella de los finales cubre las obligaciones en vigor, asi que se recalcula con la lista nueva
  // y su nota del rastro dice la huella vigente. Editar la lista a mano sigue invalidando el cierre.
  if (Array.isArray(artifact?.final_outputs) && artifact.final_outputs.length > 0) {
    assertFinalOutputsUnchanged(artifact);
    const finalDigest = finalOutputsDigest(withList, artifact.final_outputs);
    withList = {
      ...withList,
      final_outputs_sha256: finalDigest,
      ...(Array.isArray(withList.checkpoints)
        ? { checkpoints: withList.checkpoints.map((cp) => (typeof cp?.note === "string" && cp.note.startsWith(FINAL_OUTPUTS_NOTE) ? { ...cp, note: `${FINAL_OUTPUTS_NOTE}${finalDigest}` } : cp)) }
        : {}),
    };
  }
  return Array.isArray(artifact?.checkpoints) ? appendCheckpoint(withList, { note: `${OBLIGATIONS_NOTE}${digest}` }) : withList;
}

// La evidencia de una obligacion es de una clase que el cierre puede contrastar, o una atestacion humana que
// el cierre declara como tal. Un objeto cualquiera —`{offered:false}`, una nota— no cumple nada (H2), y una
// misma evidencia no cumple dos obligaciones (R2 de la revision de L1):
//   - `task`: una tarea planificada para ESA obligacion (`planTask({obligation})`), integrada al cierre;
//   - `artifact`: `{path, sha256}` absolutos, cuyos bytes se vuelven a leer al cerrar; prueba que esos bytes
//     existen y no cambiaron, no que respondan a la obligacion: el cierre la declara `content-unjudged`;
//   - `attestation`: `{by, words}` de la persona; cierra, y el cierre la declara `attested`.
const EVIDENCE_KINDS = ["task", "artifact", "attestation"];
const absolutePath = (path) => typeof path === "string" && isAbsolute(path) && (process.platform !== "win32" || /^([A-Za-z]:[\\/]|\\\\)/.test(path));

function evidenceKey(evidence) {
  if (evidence.task !== undefined) return `task:${evidence.task}`;
  // Los mismos bytes son la misma evidencia, se llame como se llame su ruta (copia, mayusculas, junction).
  if (evidence.artifact !== undefined) return `artifact:${evidence.artifact.sha256}`;
  return `attestation:${evidence.attestation.by.trim()}:${evidence.attestation.words.trim()}`;
}

function checkEvidenceShape(artifact, id, evidence) {
  const kinds = evidence && typeof evidence === "object" && !Array.isArray(evidence) ? Object.keys(evidence) : [];
  if (kinds.length !== 1 || !EVIDENCE_KINDS.includes(kinds[0])) {
    throw new Error(`obligation ${id} is fulfilled only with evidence of one kind: ${EVIDENCE_KINDS.join(", ")}`);
  }
  if (kinds[0] === "task") {
    const task = (artifact.tasks ?? []).find((candidate) => candidate.id === evidence.task);
    if (!task) throw new Error(`obligation ${id}: unknown task ${String(evidence.task)}`);
    if (task.obligation !== id) throw new Error(`obligation ${id}: task ${task.id} was not planned for this obligation`);
  }
  if (kinds[0] === "artifact" && (!absolutePath(evidence.artifact?.path) || !/^[0-9a-f]{64}$/.test(String(evidence.artifact?.sha256 ?? "")))) {
    throw new Error(`obligation ${id}: artifact evidence needs an absolute path and its sha256`);
  }
  if (kinds[0] === "attestation" && (!filled(evidence.attestation?.by) || !filled(evidence.attestation?.words))) {
    throw new Error(`obligation ${id}: an attestation needs who said it and their words`);
  }
}

export function fulfillObligation(artifact, id, { evidence = null, at = null } = {}) {
  if (["closed", "cancelled"].includes(artifact?.state)) throw new Error("obligations cannot change a terminal operation");
  const found = (artifact?.obligations ?? []).find((item) => item.id === id);
  if (!found) throw new Error(`unknown obligation: ${String(id)}`);
  checkEvidenceShape(artifact, id, evidence);
  const key = evidenceKey(evidence);
  const other = artifact.obligations.find((item) => item.id !== id && item.fulfilled?.evidence && evidenceKey(item.fulfilled.evidence) === key);
  if (other) throw new Error(`obligation ${id}: this evidence already fulfills another obligation (${other.id})`);
  return { ...artifact, obligations: artifact.obligations.map((item) => (item.id === id ? { ...item, fulfilled: { evidence: structuredClone(evidence), at: at ?? new Date().toISOString() } } : item)) };
}

// Manda la PRIMERA declaracion del rastro: una nota posterior no rebaja el mandato. Limite: los checkpoints
// viven en el mismo FASES.md y no estan encadenados; quien borra o reescribe a la vez la lista, su huella y
// la nota del rastro (el mismo usuario del sistema operativo) vuelve a abrir el cierre, y eso no se detecta aqui.
function declaredInTrail(artifact) {
  const note = (artifact?.checkpoints ?? []).find((cp) => typeof cp?.note === "string" && cp.note.startsWith(OBLIGATIONS_NOTE));
  return note ? note.note.slice(OBLIGATIONS_NOTE.length) : null;
}

function assertObligationsMet(artifact) {
  const trail = declaredInTrail(artifact);
  if (!present(artifact?.obligations_sha256) && !Array.isArray(artifact?.obligations) && trail === null) return;
  if (!Array.isArray(artifact.obligations) || !present(artifact.obligations_sha256)) {
    throw new Error("obligations were declared for this operation but their list or fingerprint is missing; the declared mandate still holds");
  }
  if (obligationsDigest(artifact.obligations) !== artifact.obligations_sha256 || (trail !== null && trail !== artifact.obligations_sha256)) {
    throw new Error("obligations changed after they were declared; the mandate in force is the declared one");
  }
  const unmet = artifact.obligations.filter((item) => item.fulfilled == null);
  if (unmet.length > 0) {
    throw new Error(`closure cannot certify conformity with the commission: unmet obligation ${unmet.map((item) => `${item.id} (${item.description})`).join(", ")}`);
  }
  const keys = new Set();
  for (const item of artifact.obligations) {
    const evidence = item.fulfilled.evidence;
    try { checkEvidenceShape(artifact, item.id, evidence); } catch (error) { throw new Error(`closure cannot certify obligation ${item.id}: ${error.message}`); }
    const key = evidenceKey(evidence);
    if (keys.has(key)) throw new Error(`closure cannot certify obligation ${item.id}: its evidence also fulfills another obligation`);
    keys.add(key);
    if (evidence.task !== undefined) {
      const task = artifact.tasks.find((candidate) => candidate.id === evidence.task);
      if (task.state !== "integrated") throw new Error(`closure cannot certify obligation ${item.id}: task ${evidence.task} is not integrated`);
    } else if (evidence.artifact !== undefined) {
      let bytes = null;
      try { bytes = readFileSync(evidence.artifact.path); } catch { bytes = null; }
      if (bytes === null || createHash("sha256").update(bytes).digest("hex") !== evidence.artifact.sha256) {
        throw new Error(`closure cannot certify obligation ${item.id}: its artifact bytes no longer match the recorded sha256`);
      }
    }
  }
}

// Lo que el cierre no cuenta como verificado de las obligaciones: la atestacion y el artefacto cuyo contenido
// nadie juzgo contra la obligacion.
const attestedObligations = (artifact) => (artifact?.obligations ?? []).flatMap((item) => {
  const evidence = item.fulfilled?.evidence ?? {};
  if (evidence.attestation !== undefined) return [`obligation:${item.id}:attested`];
  if (evidence.artifact !== undefined) return [`obligation:${item.id}:content-unjudged`];
  return [];
});

// Salidas finales declaradas: lo que el encargo pide entregar como resultado compuesto, no la suma de
// sus piezas. Se declaran una sola vez con la misma forma y la misma regla que las obligaciones —la
// lista, su huella y una nota en el rastro que manda sobre ediciones ordinarias— y la huella cubre
// ademas el objetivo y las obligaciones vigentes. Sin recalcular huella y nota, esos cambios invalidan
// el cierre; quien comparte el usuario del sistema puede reescribir los tres y el cierre lo acepta.
const FINAL_OUTPUTS_NOTE = "salidas finales declaradas sha256:";

const finalOutputsDigest = (artifact, outputs) => createHash("sha256").update(JSON.stringify({
  outputs: outputs.map(({ id, path, criterion, sources }) => ({ id, path, criterion, sources: [...(sources ?? [])] })),
  working_goal: artifact?.working_goal ?? null,
  intent: artifact?.intent ?? null,
  obligations: (artifact?.obligations ?? []).map(({ id, description }) => ({ id, description })),
})).digest("hex");

function declaredFinalOutputsInTrail(artifact) {
  const note = (artifact?.checkpoints ?? []).find((cp) => typeof cp?.note === "string" && cp.note.startsWith(FINAL_OUTPUTS_NOTE));
  return note ? note.note.slice(FINAL_OUTPUTS_NOTE.length) : null;
}

function assertFinalOutputsUnchanged(artifact) {
  const trail = declaredFinalOutputsInTrail(artifact);
  if (!Array.isArray(artifact?.final_outputs) || !present(artifact.final_outputs_sha256)) {
    throw new Error("final outputs were declared but their list or fingerprint is missing; cannot update obligations");
  }
  if (finalOutputsDigest(artifact, artifact.final_outputs) !== artifact.final_outputs_sha256
    || (trail !== null && trail !== artifact.final_outputs_sha256)) {
    throw new Error("final outputs changed after they were declared; cannot update obligations");
  }
}

function declaredFinalOutput(artifact, id, spec) {
  const output = (artifact?.final_outputs ?? []).find((item) => item.id === id);
  if (!output) throw new Error(`final output ${String(id)} was not declared`);
  if (spec?.output?.path !== output.path) throw new Error(`final output ${id} is declared for ${output.path}`);
  if (spec?.done_criterion !== output.criterion) throw new Error(`final output ${id} needs its declared criterion: ${output.criterion}`);
  const plannedSources = Array.isArray(spec?.sources) ? spec.sources : [];
  for (const source of output.sources ?? []) {
    if (!plannedSources.includes(source)) throw new Error(`final output ${id} needs its declared sources: ${source}`);
  }
  return id;
}

export function declareFinalOutputs(artifact, outputs) {
  if (["closed", "cancelled"].includes(artifact?.state)) throw new Error("final outputs cannot change a terminal operation");
  if (Array.isArray(artifact?.final_outputs) || declaredFinalOutputsInTrail(artifact) !== null) throw new Error("final outputs already declared; changing the mandate is a decision of its owner");
  if (!Array.isArray(outputs) || outputs.length === 0) throw new Error("declareFinalOutputs needs at least one output");
  const ids = new Set(), paths = new Set();
  const declared = outputs.map((item) => {
    if (!filled(item?.id) || !filled(item?.path) || !filled(item?.criterion)) throw new Error("each final output needs an id, a path and a criterion");
    // `C:x` es relativa a una unidad de Windows y `resolve(root, "D:x")` cae en D:\x: no esta dentro
    // de la raiz de la operacion. Se rechaza junto con las absolutas y las que suben con `..`.
    if (isAbsolute(item.path) || /^[A-Za-z]:/.test(item.path) || item.path.split(/[\\/]/).includes("..")) throw new Error(`final output ${item.id} path must stay inside the operation root: ${item.path}`);
    if (item.sources !== undefined && (!Array.isArray(item.sources) || item.sources.some((source) => !filled(source)))) {
      throw new Error(`final output ${item.id} sources must be a list of references`);
    }
    if (ids.has(item.id)) throw new Error(`duplicate final output id: ${item.id}`);
    // Dos salidas no pueden apuntar al mismo archivo con otra grafia (mayusculas o `./`): el cierre
    // elegiria una y la otra quedaria como si se hubiera integrado.
    const alias = process.platform === "win32" ? resolve(item.path).toLowerCase() : resolve(item.path);
    if (paths.has(alias)) throw new Error(`duplicate final output path: ${item.path}`);
    ids.add(item.id);
    paths.add(alias);
    return { id: item.id, path: item.path, criterion: item.criterion, sources: [...(item.sources ?? [])] };
  });
  const digest = finalOutputsDigest(artifact, declared);
  const withList = { ...artifact, final_outputs: declared, final_outputs_sha256: digest };
  return Array.isArray(artifact?.checkpoints) ? appendCheckpoint(withList, { note: `${FINAL_OUTPUTS_NOTE}${digest}` }) : withList;
}

// El cierre no certifica lo que no se declaro. Con finales declarados exige, para cada uno, su tarea
// integrada en el destino declarado y un recibo que el juez nativo aprobo. Cada fallo nombra la salida
// que falta para que el cierre diga cual, no que "algo" fallo.
function assertFinalOutputs(artifact) {
  const declared = Array.isArray(artifact?.final_outputs);
  const trail = declaredFinalOutputsInTrail(artifact);
  if (!declared && !present(artifact?.final_outputs_sha256) && trail === null) return;
  // Una lista vacia no es una declaracion: si hay nota o una huella que no es la del vacio, es un
  // manifiesto recortado y se rechaza; si no, se trata como no declarada y el cierre la nombra.
  if (declared && artifact.final_outputs.length === 0) {
    if (trail !== null || (present(artifact.final_outputs_sha256) && artifact.final_outputs_sha256 !== finalOutputsDigest(artifact, []))) {
      throw new Error("final outputs changed after they were declared; the mandate in force is the declared one");
    }
    return;
  }
  if (!declared || !present(artifact.final_outputs_sha256)) {
    throw new Error("final outputs were declared for this operation but their list or fingerprint is missing; the declared mandate still holds");
  }
  assertFinalOutputsUnchanged(artifact);
  for (const output of artifact.final_outputs) {
    const task = (artifact.tasks ?? []).find((candidate) => candidate.final_output === output.id);
    if (!task || task.state !== "integrated") throw new Error(`final output ${output.id} has no integrated task that composes it`);
    try {
      verifyCoverage(task, task.verification?.evidence);
      assertExecuted(artifact, task, task.verification?.evidence);
      verifyIntegration(task);
      if (task.integration?.path !== resolve(task.received.root, output.path)) throw new Error(`it is not integrated at its declared path ${output.path}`);
    } catch (error) {
      throw new Error(`final output ${output.id}: ${error.message}`);
    }
  }
}

// El recibo de cierre separa lo que el kit midio de lo que solo alguien declaro: pruebas ejecutadas,
// fuentes vinculadas, conformidad de cada final frente a su encargo, y las aprobaciones humanas. La
// frontera declara lo que este host NO puede: detecta, no previene, y no tiene independencia real.
const CLOSURE_BOUNDARY = { host: "same-os-user", prevents: [],
  // Detecta una edicion del destino, del recibo o del manifiesto cuando NO se reescriben a la vez su
  // huella y la nota del rastro. La misma persona del sistema operativo puede reescribir las tres y el
  // cierre la acepta: es deteccion sin independencia, no prevencion (docs/VERIFICATION-EXECUTION.md).
  detects: ["destination-bytes-at-closure", "receipt-edit-without-key", "manifest-edit-without-fingerprint-and-note"],
  independence: "deteccion-sin-independencia" };

function closureReceipt(artifact) {
  const proofs = [], sources = [], commission_conformity = [];
  for (const task of artifact.tasks ?? []) {
    if (task.state !== "integrated") continue;
    const evidence = task.verification?.evidence ?? {};
    const execution = task.verification?.execution ?? {};
    proofs.push({ task: task.id, adapter: execution.adapter ?? null, passed: evidence.notCovered?.length === 0,
      checks: (evidence.checks ?? []).map((check) => ({ observation: check.observation, passed: check.passed === true })) });
    for (const source of evidence.sources ?? []) sources.push({ task: task.id, ref: source.ref, sha256: source.evidence?.sha256 ?? null });
    if (task.final_output) {
      const output = (artifact.final_outputs ?? []).find((item) => item.id === task.final_output);
      commission_conformity.push({ output: task.final_output, path: output?.path ?? null, sha256: task.integration?.sha256 ?? null,
        // El veredicto de conformidad es el del juez que ejecuto la verificacion, no el del Advisor
        // que reviso el encargo antes de ejecutar.
        verdict: execution.passed === true ? "passed" : execution.passed === false ? "rejected" : null,
        adapter: execution.adapter ?? null, thread: execution.thread ?? null });
    }
  }
  const human_approval = (artifact.obligations ?? []).flatMap((item) => {
    const attestation = item.fulfilled?.evidence?.attestation;
    return attestation ? [{ obligation: item.id, by: attestation.by, words: attestation.words }] : [];
  });
  return { proofs, sources, commission_conformity, human_approval, boundary: { ...CLOSURE_BOUNDARY, prevents: [...CLOSURE_BOUNDARY.prevents], detects: [...CLOSURE_BOUNDARY.detects] } };
}

// closeOperation: no se cierra con una tarea abierta. Una tarea bloqueada con su razon si puede: su
// bloqueo ya dice que falta y quien lo resuelve.
export function closeOperation(artifact, { verification } = {}) {
  // `independence` y `closure` los escribe el kit: una etiqueta que aporta quien llama no se copia
  // al registro, porque el recibo debe decir lo que el kit midio, no lo que el llamador declara.
  const { independence: _etiquetaAjena, closure: _cierreAjeno, ...observed } = verification ?? {};
  if (retryGate(artifact).blocked) throw new Error("stop_and_search: resolve search or owner arbitration before closure");
  // Antes de mirar las tareas: una salida declarada y no integrada se nombra por su id, no se pierde
  // entre las tareas abiertas.
  assertFinalOutputs(artifact);
  assertObligationsMet(artifact);
  validateGateBContract({ ...artifact, next_action: artifact?.next_legitimate_action });
  const abiertas = (artifact?.tasks ?? []).filter(
    (task) => task.state !== "integrated" && !(task.state === "blocked" && present(task.blocked?.cause)),
  );
  if (abiertas.length > 0) {
    throw new Error(
      `closeOperation needs every task integrated or blocked with a reason: ${abiertas.map((task) => `${task.id} (${task.state})`).join(", ")}`,
    );
  }
  if (!(artifact?.tasks ?? []).some((task) => task.state === "integrated")) {
    throw new Error("closure requires at least one integrated task with independent verification");
  }
  if (observed.verified !== true) throw new Error("closure requires a verified observation: verification.verified must be true");
  for (const task of artifact?.tasks ?? []) {
    if (task.state === "integrated") {
      verifyCoverage(task, task.verification?.evidence);
      assertExecuted(artifact, task, task.verification?.evidence);
      verifyIntegration(task);
    }
  }
  if (observed.observed !== true) throw new Error("closure requires a verification observed by whoever certifies");
  if (!present(observed.by)) throw new Error("closure requires a verification by a named certifier");
  const integratedIds = (artifact.tasks ?? []).filter(task => task.state === "integrated").map(task => task.id);
  if ((observed.verified_tasks ?? []).some(id => !integratedIds.includes(id))) throw new Error("closure cannot claim an unverified task in verified_tasks");
  const notCovered = [...new Set([...(observed.notCovered ?? []),
    ...(artifact.tasks ?? []).filter(task => task.state !== "integrated").map(task => `task:${task.id}`),
    ...(observed.unverified_effects ?? []).map(id => `effect:${id}`),
    ...(artifact.effects ?? []).filter(effect => effect.status !== "verified" && effect.reconciliation !== "reconciled-absent").map((effect, index) => `effect:${effect.id ?? index}`),
    ...(artifact.uncertainty ?? []).map(item => `uncertainty:${typeof item === "string" ? item : JSON.stringify(item)}`),
    ...((artifact.tasks ?? []).length === 0 ? ["no verified tasks"] : []),
    // Una obligacion cumplida por atestacion cierra, pero el cierre no la cuenta como verificada.
    ...attestedObligations(artifact),
    // Un final declarado se certifica con el juez nativo del host, y el kit no tiene ninguna ruta que
    // produzca independencia real: mientras el verificador comparta el usuario del sistema operativo,
    // el cierre lo declara y queda parcial. Antes de D2, lo compuesto no se certifica completo.
    ...(Array.isArray(artifact.final_outputs) && artifact.final_outputs.length > 0
      ? artifact.final_outputs.map((output) => `final-output:${output.id}:verifier-not-independent`) : []),
    // Dos o mas tareas sin finales declarados: nada dice cual es el resultado, asi que el cierre lo
    // declara en lugar de aceptar cualquier archivo escrito por terminal. Una lista vacia cuenta como
    // no declarada: fabricar `final_outputs: []` no mejora el cierre. Una sola tarea cierra igual.
    ...(!(Array.isArray(artifact.final_outputs) && artifact.final_outputs.length > 0) && (artifact.tasks ?? []).length >= 2 ? ["final-outputs:undeclared"] : []),
  ])];
  let next = { ...artifact, verification: { ...observed,
    verified: notCovered.length === 0, verified_tasks: integratedIds,
    completion: notCovered.length === 0 ? "complete" : "partial", notCovered,
    closure: closureReceipt(artifact),
  } };
  const already = CLOSURE_LADDER.indexOf(next.state);
  for (const state of already === -1 ? CLOSURE_LADDER : CLOSURE_LADDER.slice(already + 1)) {
    next = transitionArtifact(next, { state, note: `cierre: ${state}` });
  }
  return next;
}

// taskSummary: la vista corta. Cinco campos por tarea y nada mas: el detalle vive en el artefacto.
export function taskSummary(artifact) {
  return (artifact?.tasks ?? []).map((task) => ({
    id: task.id,
    role: task.role,
    state: task.state,
    by: task.by ?? null,
    nextCheckAt: task.nextCheckAt ?? null,
  }));
}

function relationalTime(value) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return Date.parse(value);
  return Number.NaN;
}

function normalizedText(value) {
  return String(value ?? "").normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

// La traza acredita transformaciones observables de la conversación; no es el recibo de trabajo
// ni una declaración de experiencia. El usuario puede corregir la distinción propuesta por el agente
// y el agente puede corregir la propuesta del usuario: quien corrige debe diferir de quien propuso.
export function validateRelationalTrace(events) {
  if (!Array.isArray(events)) throw new Error("relational trace must be an event sequence");
  const types = ["mismatch.observed", "correction.received", "response.revised", "distinction.proposed", "distinction.corrected", "decision.applied"];
  const selected = new Map();
  const ids = new Set();
  for (const event of events) {
    if (!event || typeof event !== "object" || typeof event.id !== "string" || !event.id.trim() || typeof event.type !== "string") {
      throw new Error("relational trace event needs id and type");
    }
    if (ids.has(event.id)) throw new Error("relational trace has duplicate event id: " + event.id);
    ids.add(event.id);
    const at = relationalTime(event.at);
    if (!Number.isFinite(at)) throw new Error("relational trace event " + event.id + " needs an ordered timestamp");
    if (types.includes(event.type)) {
      if (selected.has(event.type)) throw new Error("relational trace needs one " + event.type + " event");
      selected.set(event.type, { event, at });
    }
  }
  const ordered = types.map((type) => selected.get(type));
  if (ordered.some((entry) => !entry)) throw new Error("relational trace is missing a required event in the six-step sequence");
  if ([...selected.keys()].some((type, index) => type !== types[index])) throw new Error("relational trace events are out of sequence");
  for (let index = 0; index < ordered.length; index += 1) {
    if (typeof ordered[index].event.by !== "string" || !ordered[index].event.by.trim()) {
      throw new Error("relational trace " + types[index] + " needs a participant");
    }
    if (index > 0 && ordered[index].at <= ordered[index - 1].at) throw new Error("relational trace events must be chronological");
  }
  const [mismatch, correction, response, proposed, corrected, applied] = ordered.map((entry) => entry.event);
  if (!normalizedText(mismatch.content)) throw new Error("relational trace mismatch needs observable content");
  if (correction.ref !== mismatch.id || !normalizedText(correction.content)) throw new Error("relational trace correction must refer to the observed mismatch and contain its correction");
  const before = normalizedText(response.before);
  const after = normalizedText(response.after);
  if (response.ref !== correction.id || !before || !after || before === after || after === normalizedText(correction.content)) {
    throw new Error("relational trace response.revised must change recognizably without literal echo");
  }
  if (!normalizedText(proposed.content) || corrected.ref !== proposed.id || corrected.by === proposed.by || !normalizedText(corrected.content)
      || normalizedText(corrected.content) === normalizedText(proposed.content)) {
    throw new Error("relational trace distinction must be proposed, then corrected by the other participant");
  }
  if (applied.ref !== corrected.id || !normalizedText(applied.input) || !normalizedText(applied.output)
      || normalizedText(applied.input) === normalizedText(applied.output) || !normalizedText(applied.evidence)) {
    throw new Error("relational trace decision.applied must use the corrected distinction and show its influence");
  }
  return { valid: true, sequence: types, eventIds: ordered.map((entry) => entry.event.id) };
}

export function recordInteractionTrace(artifact, events) {
  validateRelationalTrace(events);
  return { ...artifact, interaction_trace: structuredClone(events) };
}

const SELF_REPORT_VALUES = new Set(["affirmative", "negative", "absent", "uncertain", "not_declared"]);
const SELF_REPORT_FIELDS = ["yo_tu", "fertility", "simplicity", "recommend"];

export function recordSelfReport(artifact, report) {
  if (report === null || report === undefined) return artifact;
  if (!report || typeof report !== "object" || Array.isArray(report) || report.reported_by !== "user") {
    throw new Error("self-report must be an explicit user declaration");
  }
  for (const field of SELF_REPORT_FIELDS) {
    if (report[field] !== undefined && !SELF_REPORT_VALUES.has(report[field])) {
      throw new Error("self-report " + field + " must be affirmative, negative, absent, uncertain or not_declared");
    }
  }
  if (report.raw_quote !== undefined && typeof report.raw_quote !== "string") {
    throw new Error("self-report raw_quote must preserve the user's literal words as text");
  }
  return { ...artifact, self_report: { ...structuredClone(report), source: "coordinator-attestation" } };
}

// --- la puerta de entrada vive en operation-state.mjs ------------------------
//
// `operationEntry` lee FASES.md y pregunta al grafo si hay algo abierto. Vive ahi, y no aqui, por
// una razon que no es de estilo: el modulo del estado no importa NADA del kit —solo `node:fs` y
// `node:path`—, y por eso puede viajar en la cadena de la entrada local que los tres hosts
// instalan, que es el cierre transitivo de imports de `lore-cli.mjs` y esta congelado. El
// coordinador, en cambio, tira de `routeOperation` y de la copia vendorizada del kernel entero: una
// puerta que el hook de la apertura no puede alcanzar sin dragar el kernel a una entrada que es de
// solo lectura no es una puerta, es una promesa. Se reexporta desde la fachada para que quien
// importa un solo modulo la encuentre igual.
