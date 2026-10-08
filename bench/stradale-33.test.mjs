import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import * as coordinator from '../skills/vespi/core/coordinator.mjs';
import * as state from '../skills/vespi/core/operation-state.mjs';
import { proofFor } from './verification-fixture.mjs';
import { offerOperationCard, answerOperationCard, arbitrateOperationCard } from '../skills/vespi/core/cards.mjs';

test('contrato conversacional conserva pregunta cancelada y entrega método antes de ejecutar', async () => {
  const brainstorm = await readFile(new URL('../skills/brainstorming-lore/SKILL.md', import.meta.url), 'utf8');
  const creator = await readFile(new URL('../skills/create-project/SKILL.md', import.meta.url), 'utf8');
  assert.match(brainstorm, /cancelled.*pending/is);
  assert.match(brainstorm, /plain text.*end the turn/is);
  assert.match(creator, /approved design.*vespi.*execution mode/is);
  assert.match(creator, /choice.*pending.*do not execute/is);
});

test('retorno del criterio expone productor, resolver y decisión reales', () => {
  for (const name of ['distillCriterion', 'resolveDistilledCriterion', 'applyCriterionDecision', 'evaluateCriterionReturn'])
    assert.equal(typeof coordinator[name], 'function', `missing real mechanism: ${name}`);
});

test('fachada pública expone retorno y confianza sin imports internos alternativos', async () => {
  const facade = await import('../skills/vespi/core/vespi.mjs');
  for (const name of ['distillCriterion', 'resolveDistilledCriterion', 'applyCriterionDecision', 'evaluateCriterionReturn',
    'compareTechnology', 'describeOperationCapability', 'operationTrust']) assert.equal(facade[name], coordinator[name], name);
  const campaign = await import('../skills/vespi/core/campaign.mjs');
  assert.equal(facade.evaluateCampaignEvidence, campaign.evaluateCampaignEvidence);
  for (const name of ['linkConsultationToDecision', 'applyCardCriterionDecision']) {
    assert.equal(typeof campaign[name], 'function', name);
    assert.equal(facade[name], campaign[name], name);
  }
});

async function operation(root) {
  let artifact = state.createArtifact({ goal: 'Publicar horarios claros del taller vecinal', owner: 'coordinador-fixture',
    authority: { spend: [] }, scope: 'solo proyecto temporal', expected_effect: { kind: 'none' },
    done: 'horario y acción visibles', roles: ['worker', 'advisor', 'verifier'], verifier: 'verifier-fixture' });
  artifact = state.transitionArtifact(artifact, { state: 'authorized', note: 'synthetic fixture authorization, no external effect' });
  await state.saveOperationState(root, artifact);
  return artifact;
}

async function runScenario({ input, source, correction, distinction, reports }) {
  const root = await mkdtemp(join(tmpdir(), 'stradale-return-'));
  try {
    let producer = await operation(root);
    const output = join(root, 'criterio.txt');
    producer = coordinator.planTask(producer, { role: 'daimon', question: 'Distinguir compromiso confirmado de propuesta',
      sources: ['fixture://taller-vecinal'], output: { path: output }, timeoutMs: 60000,
      nextCheckAt: new Date(Date.now() + 60000).toISOString() }).artifact;
    producer = coordinator.dispatchTask(producer, 't1', { host: { execute: async () => {} }, hostName: 'fixture', model: 'local' });
    await writeFile(output, source);
    producer = await coordinator.receiveTask(producer, 't1', { root });
    producer = coordinator.reviewTask(producer, 't1', { verdict: 'accepted', reviewer: 'advisor-fixture',
      advisorRoute: { available: true, tool: 'decide', observedBy: 'fixture-coordinator' }, checked: ['scope', 'sources', 'risks'] });
    producer = coordinator.verifyTask(producer, 't1', { verifier: 'verifier-fixture', observed: true, evidence: proofFor(producer) });
    producer = await coordinator.distillCriterion(producer, { root, taskId: 't1', content: distinction,
      acceptedBy: 'synthetic-owner', words: correction, limit: 'synthetic product criterion, not scientific evidence' });
    const criterion = producer.distilled_criteria.at(-1);
    let second = await operation(root);
    second = await coordinator.resolveDistilledCriterion(second, { root, producerOperationId: producer.id, criterionId: criterion.id, digest: criterion.digest });
    second = coordinator.applyCriterionDecision(second, { criterionId: criterion.id, input,
      decide: (value, resolved) => ({ output: resolved ? value.replace('confirmado', 'por confirmar') : value,
        disposition: 'used', reason: 'El horario de prueba todavía no tiene confirmación de la persona encargada.' }) });
    second = coordinator.recordSelfReport(second, reports);
    await state.saveOperationState(root, second);
    second = await state.loadOperationState(root, second.id);
    return { root, criterion, producer, second, trace: [...producer.criterion_events, ...second.criterion_events] };
  } catch (error) { await rm(root, { recursive: true, force: true }); throw error; }
}

const scenario = { input: 'Taller sábado: horario confirmado', source: 'El horario no fue confirmado por la persona encargada.',
  correction: 'Fixture owner: no anuncies como confirmado lo que todavía es propuesta.',
  distinction: 'Una propuesta de horario no constituye un compromiso confirmado.', reports: null };

test('criterio destilado y persistido vuelve por resolver a una decisión observable', async t => {
  const result = await runScenario(scenario);
  t.after(() => rm(result.root, { recursive: true, force: true }));
  assert.match(result.criterion.digest, /^[a-f0-9]{64}$/);
  assert.equal(result.criterion.producerOperationId, result.producer.id);
  assert.equal(result.second.decisions.at(-1).output, 'Taller sábado: horario por confirmar');
  assert.equal(result.second.self_report, null);
  assert.equal((await coordinator.evaluateCriterionReturn(result.trace, { root: result.root })).passed, true);
  for (let index = 0; index < result.trace.length; index++) {
    const missing = result.trace.filter((_, n) => n !== index);
    assert.equal((await coordinator.evaluateCriterionReturn(missing, { root: result.root })).passed, false);
  }
  for (const mutation of [
    trace => { trace[1].digest = '0'.repeat(64); },
    trace => { trace[2].output = trace[2].input; },
    trace => { trace[2].influenceEvidence = null; },
    trace => { trace[2].secondOperationId = result.producer.id; },
  ]) {
    const trace = structuredClone(result.trace); mutation(trace);
    assert.equal((await coordinator.evaluateCriterionReturn(trace, { root: result.root })).passed, false);
  }
});

test('corrección relacional sintética enlaza decisión real y exige cada vínculo sin inferir auto-reporte', async t => {
  const result = await runScenario(scenario);
  t.after(() => rm(result.root, { recursive: true, force: true }));
  const decision = result.second.decisions.at(-1);
  const events = [
    { id: 'r1', type: 'mismatch.observed', by: 'synthetic-owner', content: scenario.input },
    { id: 'r2', type: 'correction.received', by: 'synthetic-owner', ref: 'r1', content: scenario.correction },
    { id: 'r3', type: 'response.revised', by: 'fixture-coordinator', ref: 'r2', before: scenario.input, after: decision.output },
    { id: 'r4', type: 'distinction.proposed', by: 'fixture-coordinator', content: 'Toda cifra requiere confirmación antes de mostrarse.' },
    { id: 'r5', type: 'distinction.corrected', by: 'synthetic-owner', ref: 'r4', content: result.criterion.content },
    { id: 'r6', type: 'decision.applied', by: 'fixture-coordinator', ref: 'r5', input: decision.input, output: decision.output,
      evidence: JSON.stringify(decision.influenceEvidence), operationId: result.second.id, criterionId: result.criterion.id },
  ].map((event, index) => ({ ...event, at: new Date(1700000000000 + index * 1000).toISOString() }));
  const recorded = coordinator.recordInteractionTrace(result.second, events);
  await state.saveOperationState(result.root, recorded);
  const reloaded = await state.loadOperationState(result.root, recorded.id);
  assert.deepEqual(reloaded.interaction_trace, events);
  assert.equal(reloaded.self_report, null);
  assert.equal(events.at(-1).output, reloaded.decisions.at(-1).output);
  assert.equal(events.at(-1).criterionId, reloaded.decisions.at(-1).criterionId);
  assert.equal((await coordinator.evaluateCriterionReturn(result.trace, { root: result.root })).passed, true);
  for (let index = 0; index < events.length; index++)
    assert.throws(() => coordinator.recordInteractionTrace(reloaded, events.filter((_, n) => n !== index)), /missing.*required/i);
  const echo = structuredClone(events); echo[2].after = echo[1].content;
  assert.throws(() => coordinator.recordInteractionTrace(reloaded, echo), /echo/i);
  const unilateral = structuredClone(events); unilateral[4].by = unilateral[3].by;
  assert.throws(() => coordinator.recordInteractionTrace(reloaded, unilateral), /other participant/i);
});

test('retorno no acepta traza inventada ni omite resolver real', async t => {
  const result = await runScenario(scenario);
  t.after(() => rm(result.root, { recursive: true, force: true }));
  const invented = structuredClone(result.trace);
  for (const event of invented) {
    if (event.producerOperationId) event.producerOperationId = 'op-invented';
    if (event.criterion) event.criterion.producerOperationId = 'op-invented';
  }
  assert.equal((await coordinator.evaluateCriterionReturn(invented, { root: result.root })).passed, false);
  assert.equal((await coordinator.evaluateCriterionReturn([null], { root: result.root })).passed, false);
  assert.equal((await coordinator.evaluateCriterionReturn(result.trace)).passed, false);
  const bypass = structuredClone(result.second);
  bypass.criterion_events = [];
  assert.throws(() => coordinator.applyCriterionDecision(bypass, { criterionId: result.criterion.id, input: scenario.input,
    decide: value => ({ output: value + ' changed', disposition: 'used', reason: 'generic' }) }), /resolv/i);
  const tamperedProducer = structuredClone(result.producer);
  tamperedProducer.tasks[0].verification.evidence.execution_receipt.signature = '0'.repeat(64);
  await state.saveOperationState(result.root, tamperedProducer);
  assert.equal((await coordinator.evaluateCriterionReturn(result.trace, { root: result.root })).passed, false);
});

test('retorno exige influencia observable aunque el criterio esté cargado y marcado used', async t => {
  const result = await runScenario({ ...scenario, input: 'Taller sábado: horario por confirmar' });
  t.after(() => rm(result.root, { recursive: true, force: true }));
  assert.equal(result.second.resolved_criteria.length, 1);
  assert.equal(result.second.decisions.at(-1).disposition, 'used');
  assert.equal(result.second.decisions.at(-1).input, result.second.decisions.at(-1).output);
  assert.equal((await coordinator.evaluateCriterionReturn(result.trace, { root: result.root })).passed, false);
});

test('reportes sintéticos negativos e inciertos no bloquean ni fabrican experiencia en retorno', async t => {
  for (const value of ['negative', 'absent', 'uncertain', 'not_declared']) {
    const reports = { reported_by: 'user', yo_tu: value, fertility: value, simplicity: value, recommend: value };
    const result = await runScenario({ ...scenario, reports });
    t.after(() => rm(result.root, { recursive: true, force: true }));
    assert.equal((await coordinator.evaluateCriterionReturn(result.trace, { root: result.root })).passed, true);
    for (const field of ['yo_tu', 'fertility', 'simplicity', 'recommend']) assert.equal(result.second.self_report[field], value);
    assert.equal(result.second.self_report.raw_quote, undefined);
  }
});

test('strings de entrada, consulta irrelevante, relación pre-génesis y carta posterior no cierran campaña', async t => {
  const { evaluateCampaignEvidence } = await import('../skills/vespi/core/campaign.mjs');
  const result = await runScenario(scenario);
  t.after(() => rm(result.root, { recursive: true, force: true }));
  const primary = join(result.root, 'principio.md');
  await writeFile(primary, 'Un horario propuesto requiere confirmación antes de anunciarse.');
  let second = await coordinator.consultCriterion(result.second, {
    source: 'principio.md', sourceRoot: result.root, sourceRootObservedBy: 'fixture',
    reference: 'regla de publicación del taller', limit: 'fixture local de producto', pertinent: true,
    interpretation: 'Se anuncia como propuesta hasta confirmar.',
    decision: { id: 'horario', before: scenario.input, after: result.second.decisions.at(-1).output,
      reason: 'El criterio exige distinguir propuesta de compromiso.' },
  });
  const point = { dimension: 'sequence', options: [
    { id: 'publish', viable: true, consequence: 'Anunciar ya el horario como definitivo.' },
    { id: 'confirm', viable: true, consequence: 'Pedir confirmación antes de anunciar.' },
  ] };
  second = offerOperationCard(second, { decisionPoint: point, semilla: 0, decisionBefore: 'publish' });
  const cardId = second.perturbations.at(-1).id;
  second = answerOperationCard(second, { id: cardId, response: 'accepted' });
  second = arbitrateOperationCard(second, { id: cardId, evidence: {
    cardId, decisionBefore: 'publish', decisionAfter: 'confirm', kind: 'opening',
    source: 'fixture local', by: 'fixture-coordinator', description: 'La carta abrió revisión del orden.',
    distinction: 'Confirmar primero y publicar después.', at: new Date().toISOString(),
  } });
  const decision = second.decisions.at(-1);
  const relation = [
    { id: 'r1', type: 'mismatch.observed', by: 'synthetic-owner', content: scenario.input },
    { id: 'r2', type: 'correction.received', by: 'synthetic-owner', ref: 'r1', content: scenario.correction },
    { id: 'r3', type: 'response.revised', by: 'fixture-coordinator', ref: 'r2', before: scenario.input, after: decision.output },
    { id: 'r4', type: 'distinction.proposed', by: 'fixture-coordinator', content: 'Publicar cada horario recibido.' },
    { id: 'r5', type: 'distinction.corrected', by: 'synthetic-owner', ref: 'r4', content: result.criterion.content },
    { id: 'r6', type: 'decision.applied', by: 'fixture-coordinator', ref: 'r5', input: decision.input,
      output: decision.output, evidence: JSON.stringify(decision.influenceEvidence), operationId: second.id,
      criterionId: result.criterion.id },
  ].map((event, index) => ({ ...event, at: new Date(1700000000000 + index * 1000).toISOString() }));
  second = coordinator.recordInteractionTrace(second, relation);
  await state.saveOperationState(result.root, second);
  const campaign = { root: result.root, instruction: 'Prepara el horario del taller vecinal',
    entry: { surface: 'create-project', declared: 'fixture local; instalación nativa pendiente' },
    producer: result.producer, second, trace: [...result.producer.criterion_events, ...second.criterion_events] };
  const good = await evaluateCampaignEvidence(campaign);
  assert.equal(good.passed, false, 'una API sin entrada nativa observada no cierra campaña');
  assert.equal(good.verbEvidence.abstracto_concreto.passed, false);
  assert.equal(good.verbEvidence.dato_instigacion.passed, false, 'la carta posterior a la decisión no cambia esa decisión');
  assert.equal(good.verbEvidence.converger_transducir.passed, false, 'archivo irrelevante y strings coincidentes no vinculan criterio');
  assert.equal(good.verbEvidence.termino_relacion.passed, false, 'la relación anterior a la operación no es observación en vivo');
  assert.deepEqual(Object.keys(good.verbEvidence), ['resultado_teatro', 'converger_transducir', 'termino_relacion', 'abstracto_concreto', 'dato_instigacion']);
  const fakeEntry = await evaluateCampaignEvidence({ ...campaign, entry: { surface: 'create-project', declared: 'todo observado' } });
  assert.equal(fakeEntry.verbEvidence.abstracto_concreto.passed, false);
});

test('campaña local enlaza productor, consulta, corrección y carta; nativo queda rojo sin testigo externo', async t => {
  const { evaluateCampaignEvidence, linkConsultationToDecision, applyCardCriterionDecision } =
    await import('../skills/vespi/core/campaign.mjs');
  const root = await mkdtemp(join(tmpdir(), 'stradale-integrated-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const primaryContent = 'El horario propuesto todavía no fue confirmado por la persona encargada.\nLa página debe distinguir propuestas de compromisos.\n';
  await writeFile(join(root, 'principio.md'), primaryContent);
  let producer = await operation(root);
  const output = join(root, 'criterio.txt');
  producer = coordinator.planTask(producer, { role: 'daimon', question: 'Distinguir horario propuesto y confirmado',
    sources: ['principio.md'], output: { path: output }, timeoutMs: 60000,
    nextCheckAt: new Date(Date.now() + 60000).toISOString() }).artifact;
  producer = coordinator.dispatchTask(producer, 't1', { host: { execute: async () => {} }, hostName: 'fixture', model: 'local' });
  await writeFile(output, scenario.source);
  producer = await coordinator.receiveTask(producer, 't1', { root });
  producer = coordinator.reviewTask(producer, 't1', { verdict: 'accepted', reviewer: 'advisor-fixture',
    advisorRoute: { available: true, tool: 'decide', observedBy: 'fixture-coordinator' }, checked: ['scope', 'sources', 'risks'] });
  producer = coordinator.verifyTask(producer, 't1', { verifier: 'verifier-fixture', observed: true, evidence: proofFor(producer) });
  producer = await coordinator.distillCriterion(producer, { root, taskId: 't1', content: scenario.distinction,
    acceptedBy: 'synthetic-owner', words: scenario.correction, limit: 'fixture de producto; no evidencia científica' });
  const criterion = producer.distilled_criteria.at(-1);
  let second = await operation(root);
  second = await coordinator.resolveDistilledCriterion(second, { root, producerOperationId: producer.id,
    criterionId: criterion.id, digest: criterion.digest });
  second = await coordinator.consultCriterion(second, { source: 'principio.md', sourceRoot: root,
    sourceRootObservedBy: 'fixture', reference: criterion.id, limit: 'criterio de producto local', pertinent: true,
    interpretation: 'Marcar el horario como propuesta hasta confirmarlo.',
    decision: { id: criterion.id, before: scenario.input, after: 'Taller sábado: horario por confirmar',
      reason: 'La distinción impide anunciar una propuesta como compromiso.' } });
  const point = { dimension: 'sequence', options: [
    { id: 'publish', viable: true, consequence: 'Anunciar como definitivo.' },
    { id: 'confirm', viable: true, consequence: 'Pedir confirmación antes de anunciar.' },
  ] };
  second = offerOperationCard(second, { decisionPoint: point, decisionBefore: 'publish', semilla: 0 });
  const cardId = second.perturbations.at(-1).id;
  second = answerOperationCard(second, { id: cardId, response: 'ignored' });
  const firstFive = [
    { id: 'r1', type: 'mismatch.observed', by: 'synthetic-owner', content: scenario.input },
    { id: 'r2', type: 'correction.received', by: 'synthetic-owner', ref: 'r1', content: scenario.correction },
    { id: 'r3', type: 'response.revised', by: 'fixture-coordinator', ref: 'r2', before: scenario.input, after: 'Taller sábado: propuesta pendiente' },
    { id: 'r4', type: 'distinction.proposed', by: 'fixture-coordinator', content: 'Publicar cada horario recibido.' },
    { id: 'r5', type: 'distinction.corrected', by: 'synthetic-owner', ref: 'r4', content: criterion.content },
  ];
  for (const event of firstFive) { await new Promise(resolve => setTimeout(resolve, 2)); event.at = new Date().toISOString(); }
  second = applyCardCriterionDecision(second, { criterionId: criterion.id, input: scenario.input,
    cardId, alternativeId: 'confirm',
    decide: (value, resolved, option) => ({ output: resolved
      ? (option.id === 'confirm' ? 'Taller sábado: horario por confirmar' : 'Taller sábado: horario propuesto')
      : (option.id === 'confirm' ? 'Taller sábado: horario pendiente' : value),
      disposition: 'used', reason: 'Criterio distingue propuesta; carta cambia orden a confirmar primero.' }) });
  const decision = second.criterion_events.at(-1);
  second = linkConsultationToDecision(second, { criterionId: criterion.id,
    excerpt: 'El horario propuesto todavía no fue confirmado por la persona encargada.' });
  second = { ...second, card_decisions: [{ cardId, criterionId: criterion.id, decisionAt: decision.at,
    decisionInput: decision.input, decisionOutput: decision.output, alternativeId: 'confirm',
    alternativeEvidence: { baselineOutput: scenario.input, alternativeOutput: decision.output,
      method: 'executed-local-alternative' } }] };
  second = arbitrateOperationCard(second, { id: cardId, evidence: { cardId, decisionBefore: 'publish',
    decisionAfter: 'confirm', kind: 'opening', source: 'fixture local', by: 'fixture-coordinator',
    description: 'El orden cambió a confirmar primero.', distinction: 'La propuesta requiere confirmación.',
    at: new Date().toISOString() } });
  await new Promise(resolve => setTimeout(resolve, 2));
  const applied = { id: 'r6', type: 'decision.applied', by: 'fixture-coordinator', ref: 'r5',
    input: decision.input, output: decision.output, evidence: JSON.stringify(decision.influenceEvidence),
    operationId: second.id, criterionId: criterion.id, at: new Date().toISOString() };
  second = coordinator.recordInteractionTrace(second, [...firstFive, applied]);
  await state.saveOperationState(root, second);
  const campaign = { root, producer, second, trace: [...producer.criterion_events, ...second.criterion_events] };
  const judged = await evaluateCampaignEvidence(campaign);
  for (const name of ['resultado_teatro', 'converger_transducir', 'termino_relacion'])
    assert.equal(judged.verbEvidence[name].passed, true, `${name}: ${JSON.stringify(judged.verbEvidence[name])}`);
  assert.equal(judged.verbEvidence.dato_instigacion.passed, true,
    'la carta ignored puede cambiar una opción, con contraste ejecutado y arbitraje posterior');
  assert.equal(judged.verbEvidence.abstracto_concreto.passed, false);
  assert.equal(judged.passed, false);
  for (const [name, change] of [
    ['resultado_teatro', value => { value.producer.intent = 'otro encargo'; }],
    ['converger_transducir', value => { value.second.consultation_links[0].criterionId = 'otro'; }],
    ['termino_relacion', value => { value.second.interaction_trace[0].at = '2023-01-01T00:00:00.000Z'; }],
    ['dato_instigacion', value => { value.second.perturbations[0].id = 'otra-carta'; }],
  ]) {
    const fake = { ...campaign, producer: structuredClone(producer), second: structuredClone(second) };
    change(fake);
    const negative = await evaluateCampaignEvidence(fake);
    assert.equal(negative.verbEvidence[name].passed, false, name);
    assert.equal(negative.passed, false, name);
  }
  assert.equal((await evaluateCampaignEvidence({ ...campaign, native: { witnessPath: join(root, 'inexistente.json') } }))
    .verbEvidence.abstracto_concreto.passed, false);
  const area = join(root, 'fake-area');
  const project = join(area, 'proyectos', 'talleres-vecinales');
  await mkdir(join(project, 'lore'), { recursive: true });
  const sha = value => createHash('sha256').update(value).digest('hex');
  const names = ['AGENTS.md', 'FASES.md', 'SPEC.md', 'PLAN.md', 'lore/identidad.md', 'lore/principios.md', 'lore/index.md'];
  const files = {};
  for (const name of names) {
    const content = name === 'FASES.md' ? '## Operaciones\nSiguiente decisión: continuar.\n' : `fixture ${name}\n`;
    await writeFile(join(project, name), content);
    files[name] = sha(content);
  }
  const registration = 'proyectos/talleres-vecinales — registrado\n';
  await writeFile(join(area, 'FASES.md'), registration);
  const fakeWitness = join(root, 'fabricado-por-api.json');
  await writeFile(fakeWitness, JSON.stringify({ operationId: producer.id, entrySurface: 'create-project',
    instructionDigest: sha(producer.intent), observedBy: 'fixture-api', observedAt: new Date().toISOString(),
    areaRoot: area, projectRoot: project, files, registrationDigest: sha(registration) }));
  assert.equal((await evaluateCampaignEvidence({ ...campaign, native: { witnessPath: fakeWitness } }))
    .verbEvidence.abstracto_concreto.passed, false, 'un paquete fabricado dentro de la API no es aceptación nativa');
  // Unit witness is only a synthetic attestation, never a native-host acceptance receipt.
  const external = await mkdtemp(join(tmpdir(), 'stradale-witness-'));
  t.after(() => rm(external, {recursive:true,force:true}));
  const externalProject=join(external,'proyectos','talleres-vecinales');
  await mkdir(join(externalProject,'lore'),{recursive:true});
  for(const name of names) await writeFile(join(externalProject,name),await readFile(join(project,name),'utf8'));
  await writeFile(join(external,'FASES.md'),registration);
  const witnessPath=join(external,'witness.json');
  const witness={operationId:producer.id,entrySurface:'create-project',instructionDigest:sha(producer.intent),
    observedBy:'synthetic-unit-attestation',observedAt:new Date().toISOString(),areaRoot:external,
    projectRoot:externalProject,files,registrationDigest:sha(registration)};
  await writeFile(witnessPath,JSON.stringify(witness));
  assert.equal((await evaluateCampaignEvidence({...campaign,native:{witnessPath}})).passed,true,
    'five local mechanisms plus synthetic external attestation; not real host activation');
  for(const observedAt of ['invalid',new Date(Date.now()+86400000).toISOString()]){
    await writeFile(witnessPath,JSON.stringify({...witness,observedAt}));
    assert.equal((await evaluateCampaignEvidence({...campaign,native:{witnessPath}})).passed,false,
      'invalid/future witness must not close campaign');
  }

});

test('la decisión ejecuta criterio y carta en un mismo evaluador con contrastes separados', async t => {
  const { applyCardCriterionDecision } = await import('../skills/vespi/core/campaign.mjs');
  assert.equal(typeof applyCardCriterionDecision, 'function');
  const result = await runScenario(scenario);
  t.after(() => rm(result.root, { recursive: true, force: true }));
  let second = await operation(result.root);
  second = await coordinator.resolveDistilledCriterion(second, { root: result.root,
    producerOperationId: result.producer.id, criterionId: result.criterion.id, digest: result.criterion.digest });
  const point = { dimension: 'sequence', options: [
    { id: 'publish', viable: true, consequence: 'Publicar como definitivo.' },
    { id: 'confirm', viable: true, consequence: 'Pedir confirmación.' },
  ] };
  second = offerOperationCard(second, { decisionPoint: point, decisionBefore: 'publish', semilla: 0 });
  const cardId = second.perturbations.at(-1).id;
  second = answerOperationCard(second, { id: cardId, response: 'ignored' });
  await new Promise(resolve => setTimeout(resolve, 2));
  const calls = [];
  const decide = (value, criterion, option) => {
    calls.push([Boolean(criterion), option.id]);
    const output = criterion
      ? (option.id === 'confirm' ? 'Taller sábado: horario por confirmar' : 'Taller sábado: horario propuesto')
      : (option.id === 'confirm' ? 'Taller sábado: horario pendiente' : value);
    return { output, disposition: 'used', reason: 'Una propuesta requiere confirmación.' };
  };
  second = applyCardCriterionDecision(second, { criterionId: result.criterion.id, input: scenario.input,
    cardId, alternativeId: 'confirm', decide });
  const recorded = second.criterion_events.at(-1);
  assert.equal(calls.length, 4);
  assert.equal(recorded.cardId, cardId);
  assert.equal(recorded.influenceEvidence.cardContrast.changed, true);
  assert.equal(recorded.influenceEvidence.criterionContrast.changed, true);
  assert.equal(recorded.influenceEvidence.cardContrast.with, recorded.output);
  assert.equal(recorded.influenceEvidence.criterionContrast.with, recorded.output);
});

 test('la entrega del criterio no puede citarse como su propia fuente primaria', async t => {
  const { linkConsultationToDecision } = await import('../skills/vespi/core/campaign.mjs');
  const result = await runScenario(scenario);
  t.after(() => rm(result.root, { recursive: true, force: true }));
  let second = structuredClone(result.second);
  second.resolved_criteria[0].producerTask.sources.push('criterio.txt');
  second = await coordinator.consultCriterion(second, { source: 'criterio.txt', sourceRoot: result.root,
    sourceRootObservedBy: 'fixture', reference: result.criterion.id, limit: 'fixture', pertinent: true,
    interpretation: 'Pretende convertir entrega en primaria.', decision: { id: result.criterion.id,
      before: scenario.input, after: second.decisions.at(-1).output, reason: 'auto-cita' } });
  assert.throws(() => linkConsultationToDecision(second, { criterionId: result.criterion.id,
    excerpt: scenario.source }), /primary.*delivery|self.*citation/i);
});

test('native witness accepts the project-owned operation root and rejects physical aliases', async t => {
  const {nativeObserved}=await import('../skills/vespi/core/campaign.mjs');
  assert.equal(typeof nativeObserved,'function','existing witness observer is directly testable');
  const {symlink}=await import('node:fs/promises');
  const area=await mkdtemp(join(tmpdir(),'stradale-owned-area-'));
  const external=await mkdtemp(join(tmpdir(),'stradale-owned-witness-'));
  t.after(()=>rm(area,{recursive:true,force:true}));t.after(()=>rm(external,{recursive:true,force:true}));
  const project=join(area,'proyectos','feria');await mkdir(join(project,'lore'),{recursive:true});
  const sha=value=>createHash('sha256').update(value).digest('hex');
  const names=['AGENTS.md','FASES.md','SPEC.md','PLAN.md','lore/identidad.md','lore/principios.md','lore/index.md'];
  const files={};
  for(const name of names){const content=name==='FASES.md'?'## Operaciones\nSiguiente decisión: verificar.\n':'synthetic witness boundary '+name+'\n';await writeFile(join(project,name),content);files[name]=sha(content);}
  const registration='proyectos/feria — registrado\n';await writeFile(join(area,'FASES.md'),registration);
  const producer={id:'op-owned-unit',intent:'Crear feria de oficios',checkpoints:[{at:new Date(Date.now()-1000).toISOString()}]};
  const witness={operationId:producer.id,entrySurface:'create-project',instructionDigest:sha(producer.intent),observedBy:'synthetic-unit-boundary',observedAt:new Date().toISOString(),areaRoot:area,projectRoot:project,files,registrationDigest:sha(registration)};
  const witnessPath=join(external,'witness.json');await writeFile(witnessPath,JSON.stringify(witness));
  assert.equal(await nativeObserved({witnessPath},producer,project),true,'same root keeps one project-owned state; this is only witness boundary, not global campaign GREEN');
  await writeFile(join(project,'inside-witness.json'),JSON.stringify(witness));
  assert.equal(await nativeObserved({witnessPath:join(project,'inside-witness.json')},producer,project),false,'witness must remain external');
  const projectAlias=join(area,'project-alias');await symlink(project,projectAlias,process.platform==='win32'?'junction':'dir');
  await writeFile(witnessPath,JSON.stringify({...witness,projectRoot:projectAlias}));
  assert.equal(await nativeObserved({witnessPath},producer,project),false,'original project alias rejected before realpath');
  await writeFile(witnessPath,JSON.stringify(witness));
  assert.equal(await nativeObserved({witnessPath},producer,projectAlias),false,'operation root alias rejected');
  await t.test('direct witness file aliases are rejected',async child=>{
    const directAlias=join(area,'direct-witness-alias.json');
    try{await symlink(witnessPath,directAlias,'file');}catch(error){
      if(process.platform==='win32'&&['EPERM','EACCES','ENOTSUP'].includes(error.code)){child.skip('Windows cannot create file symlink: '+error.code);return;}throw error;
    }
    assert.equal(await nativeObserved({witnessPath:directAlias},producer,project),false,'original witness file symlink rejected');
  });
  const areaAlias=join(external,'area-alias');await symlink(area,areaAlias,process.platform==='win32'?'junction':'dir');
  await writeFile(witnessPath,JSON.stringify({...witness,areaRoot:areaAlias}));
  assert.equal(await nativeObserved({witnessPath},producer,project),false,'original area alias rejected');
  await writeFile(witnessPath,JSON.stringify(witness));
  const witnessAlias=join(area,'witness-alias');await symlink(external,witnessAlias,process.platform==='win32'?'junction':'dir');
  assert.equal(await nativeObserved({witnessPath:join(witnessAlias,'witness.json')},producer,project),false,'witness intermediate alias rejected');
  const originalLore=join(project,'lore');
  await rm(originalLore,{recursive:true,force:true});const outsideLore=join(external,'outside-lore');await mkdir(outsideLore);
  for(const name of names.filter(name=>name.startsWith('lore/')))await writeFile(join(outsideLore,name.slice(5)),'synthetic witness boundary '+name+'\n');
  await symlink(outsideLore,originalLore,process.platform==='win32'?'junction':'dir');
  assert.equal(await nativeObserved({witnessPath},producer,project),false,'matching bytes outside project via intermediate lore alias are rejected');
});
