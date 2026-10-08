import test from 'node:test';
import assert from 'node:assert/strict';
import { tirarCarta, tirarMultiples, listarFuentes, cargarBaraja } from './baraja.mjs';
import { inyectarCartaEnPrompt } from '../hooks/baraja-entry.mjs';
import { attemptWall, createArtifact, saveOperationState, loadOperationState } from '../skills/vespi/core/operation-state.mjs';
import { mkdtemp, cp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

test('cartas funcionan desde la skill instalada sin scripts externos', async t => {
  const root = await mkdtemp(join(tmpdir(), 'cards-installed-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await cp(resolve(import.meta.dirname, '../skills/vespi'), join(root, 'vespi'), { recursive: true });
  const api = await import(pathToFileURL(join(root, 'vespi/core/cards.mjs')));
  assert.equal(typeof api.offerOperationCard, 'function');
});

const decisionPoint = { dimension: 'sequence', options: [{ id: 'a', viable: true, consequence: 'build then check' }, { id: 'b', viable: true, consequence: 'check before build' }] };
test('el helper no muestra cartas sin recibo durable', async () => {
  assert.equal(await inyectarCartaEnPrompt({ historial: [{ text: 'stuck no sé qué hacer' }] }), null);
  assert.equal(await inyectarCartaEnPrompt({ operacion: { id: 'fixture', perturbations: [] }, decisionPoint, semilla: 19 }), null);
});

test('helper prepara una sola vez el prompt de una oferta persistida', async t => {
  const root = await mkdtemp(join(tmpdir(), 'cards-prompt-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const { offerOperationCard, cardEligibility } = await import('../skills/vespi/core/cards.mjs');
  let op = createArtifact({ goal: 'fixture choice', owner: 'fixture-owner' });
  assert.ok(cardEligibility(op, decisionPoint));
  assert.equal(cardEligibility(op, { ...decisionPoint, options: decisionPoint.options.map(x => ({ ...x, consequence: 'same' })) }), null);
  op = offerOperationCard(op, { decisionPoint, semilla: 19, decisionBefore: 'build then check' });
  await saveOperationState(root, op);
  const prompt = await inyectarCartaEnPrompt({ root, operacion: op });
  assert.equal(prompt.cardId, op.perturbations[0].id);
  assert.equal(await inyectarCartaEnPrompt({ root, operacion: op }), null);
  const stored = await loadOperationState(root, op.id);
  assert.ok(stored.perturbations[0].prompt_prepared_at);
});

test('oferta y respuesta no determinan clase; regla aprobada exige evidencia posterior', async () => {
  const api = await import('../skills/vespi/core/cards.mjs');
  assert.equal(typeof api.offerOperationCard, 'function');
  const initial = { id: 'fixture-op', state: 'running', perturbations: [] };
  const offered = api.offerOperationCard(initial, { decisionPoint, semilla: 19, decisionBefore: 'build then check' });
  const card = offered.perturbations[0];
  assert.equal(card.classification_status, 'pending');
  assert.equal(card.classification, null);
  for (const response of ['accepted', 'declined', 'ignored']) {
    const answered = api.answerOperationCard(offered, { id: card.id, response });
    assert.equal(answered.perturbations[0].classification, null);
    assert.throws(() => api.offerOperationCard(answered, { decisionPoint }), /already offered/i);
  }
  const answered = api.answerOperationCard(offered, { id: card.id, response: 'accepted' });
  const observation = { cardId: card.id, source: 'fixture://observed-decision', by: 'fixture-verifier', at: new Date().toISOString(), decisionBefore: card.decision_before, decisionAfter: 'check before build', kind: 'opening', distinction: 'verify assumptions first', description: 'changed execution order after reading the card' };
  const germen = api.arbitrateOperationCard(answered, { id: card.id, evidence: observation });
  assert.equal(germen.perturbations[0].classification, 'germen');
  const neutral = api.arbitrateOperationCard(answered, { id: card.id, evidence: { ...observation, kind: 'evaluation', decisionAfter: card.decision_before, description: 'evaluated alternatives, retained order' } });
  assert.equal(neutral.perturbations[0].classification, 'neutral');
  const noise = api.arbitrateOperationCard(answered, { id: card.id, evidence: { ...observation, kind: 'friction', disposition: 'reverted', reversalReason: 'unrelated branch delayed the task', decisionAfter: card.decision_before } });
  assert.equal(noise.perturbations[0].classification, 'ruido');
  for (const evidence of [null, { ...observation, cardId: 'other' }, { ...observation, contradictory: true }, { ...observation, source: '' }, { ...observation, kind: 'friction', reversalReason: 'claim without reversal observation' }]) {
    assert.equal(api.arbitrateOperationCard(answered, { id: card.id, evidence }).perturbations[0].classification, null);
  }
});

test('muro requiere búsqueda registrada; otras firmas o éxito no lo reemplazan', async () => {
  const api = await import('../skills/vespi/core/cards.mjs');
  const base = { id: 'wall-fixture', state: 'blocked', observations: [1, 2, 3].map(n => ({ signature: 'HTTP 503 timeout', text: `attempt ${n}` })), perturbations: [] };
  assert.equal(api.cardEligibility(base), null);
  const searched = { ...base, retry_searches: [{ signature: attemptWall(base).signature, status: 'unavailable' }] };
  assert.equal(api.cardEligibility(searched).kind, 'failure-wall');
  for (const observations of [base.observations.slice(0, 1), base.observations.map((item,n) => ({ ...item, signature: `Error distinct ${['alpha','beta','gamma'][n]}` })), [base.observations[0], { outcome: 'success' }, ...base.observations.slice(1)]]) {
    assert.equal(api.cardEligibility({ ...searched, observations }), null);
  }
  assert.throws(() => api.offerOperationCard({ ...searched, perturbations: [{ response_status: 'ignored' }] }, { decisionBefore: 'a' }), /already offered/i);
});

test('cargarBaraja devuelve las cartas', () => {
  const baraja = cargarBaraja();
  assert.ok(Array.isArray(baraja.cartas));
  assert.ok(baraja.cartas.length > 0);
});

test('tirarCarta devuelve una carta válida', () => {
  const carta = tirarCarta();
  assert.ok(carta);
  assert.ok(typeof carta.texto === 'string');
  assert.ok(carta.texto.length > 0);
  assert.ok(typeof carta.fuente === 'string');
});

test('tirarCarta con filtro por fuente solo devuelve cartas de esa fuente', () => {
  const carta = tirarCarta({ fuente: 'Eno' });
  assert.equal(carta.fuente, 'Eno');
});

test('tirarCarta con semilla es determinista', () => {
  const a = tirarCarta({ semilla: 5 });
  const b = tirarCarta({ semilla: 5 });
  assert.equal(a.id, b.id);
});

test('tirarMultiples devuelve la cantidad solicitada sin duplicados', () => {
  const cartas = tirarMultiples(3);
  assert.equal(cartas.length, 3);
  const ids = new Set(cartas.map((c) => c.id));
  assert.equal(ids.size, 3);
});

test('tirarMultiples no excede el total de cartas', () => {
  const baraja = cargarBaraja();
  const cartas = tirarMultiples(baraja.cartas.length + 10);
  assert.ok(cartas.length <= baraja.cartas.length);
});

test('listarFuentes devuelve las fuentes únicas', () => {
  const fuentes = listarFuentes();
  assert.ok(Array.isArray(fuentes));
  assert.ok(fuentes.includes('Eno'));
  assert.ok(fuentes.length >= 3);
});
