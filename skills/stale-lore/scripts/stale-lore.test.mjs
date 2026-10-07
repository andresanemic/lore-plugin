import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  leeCapacidadesCentrales,
  buscaRastroCapacidad,
  diasSinRastro,
  marcaEjercido,
  verificaStale,
  ejecutaRetiro,
  ejecutaStaleLore,
  STALE_POR_DEFECTO_DIAS,
} from './stale-lore.mjs';

// --- fixtures ---

function arbolTemporal() {
  const root = mkdtempSync(join(tmpdir(), 'stale-lore-'));
  const cleanup = () => rmSync(root, { recursive: true, force: true });
  return { root, cleanup };
}

function escribe(raiz, ruta, contenido) {
  const full = join(raiz, ruta);
  const dir = join(full, '..');
  mkdirSync(dir, { recursive: true });
  writeFileSync(full, contenido);
}

// --- tests ---

test('STALE_POR_DEFECTO_DIAS es 7', () => {
  assert.equal(STALE_POR_DEFECTO_DIAS, 7);
});

test('leeCapacidadesCentrales deriva capacidades de las skills del arbol', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'skills/create-area/SKILL.md', `---\nname: create-area\n---\n# Create Area\n`);
  escribe(root, 'skills/use-lore/SKILL.md', `---\nname: use-lore\n---\n# Use Lore\n`);
  escribe(root, 'skills/vespi/SKILL.md', `---\nname: vespi\n---\n# Vespi\n`);
  const caps = leeCapacidadesCentrales(root);
  assert.ok(caps.includes('create-area'), 'create-area debe estar en capacidades centrales');
  assert.ok(caps.includes('use-lore'), 'use-lore debe estar en capacidades centrales');
  assert.ok(caps.includes('vespi'), 'vespi debe estar en capacidades centrales');
});

test('leeCapacidadesCentrales lee skills con lore:always-on', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'CLAUDE.md', `# Proyecto\n\n<!-- lore:always-on -->\nLore gobierna aqui. lore/ en la raiz. FASES.md en la raiz.\n<!-- /lore:always-on -->\n`);
  mkdirSync(join(root, 'skills', 'stale-lore'), { recursive: true });
  escribe(root, 'skills/stale-lore/SKILL.md', `---\nname: stale-lore\n---\n# Stale Lore\n`);
  const caps = leeCapacidadesCentrales(root);
  // debe incluir la capacidad stale-lore anunciada por su skill
  assert.ok(caps.length > 0, 'debe encontrar al menos una capacidad derivada del arbol');
});

test('buscaRastroCapacidad encuentra rastro en recibos del kernel (vespi)', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  const recibo = {
    capability: 'vespi',
    at: new Date().toISOString(),
    status: 'verified',
    operation: { id: 'op-1', goal: 'resolver conflicto' },
  };
  escribe(root, '.lore/receipts/vespi.json', JSON.stringify([recibo]));
  const rastro = buscaRastroCapacidad('vespi', root, { ahora: new Date() });
  assert.equal(rastro.encontrado, true);
  assert.equal(rastro.fuentes.includes('recibos:kernel'), true);
});

test('buscaRastroCapacidad NO cuenta una mencion en FASES.md como uso', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'FASES.md', `# Estado\n\nPendiente: revisar use-lore en algun momento.\n`);
  const rastro = buscaRastroCapacidad('use-lore', root, { ahora: new Date() });
  assert.equal(rastro.encontrado, false, 'una mencion textual no es un artefacto de uso');
  assert.deepEqual(rastro.fuentes, []);
});

test('buscaRastroCapacidad no encuentra rastro cuando no existe', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  const rastro = buscaRastroCapacidad('use-lore', root, { ahora: new Date() });
  assert.equal(rastro.encontrado, false);
  assert.deepEqual(rastro.fuentes, []);
});

test('diasSinRastro calcula dias correctamente', () => {
  const ahora = new Date('2026-10-06T12:00:00Z');
  const hace10Dias = new Date('2026-09-26T12:00:00Z').toISOString();
  assert.equal(diasSinRastro(hace10Dias, ahora), 10);
  const hoy = ahora.toISOString();
  assert.equal(diasSinRastro(hoy, ahora), 0);
});

test('diasSinRastro retorna null cuando no hay rastro', () => {
  assert.equal(diasSinRastro(null, new Date()), null);
});

test('marcaEjercido actualiza el campo en el recibo', () => {
  const recibo = {
    capability: 'use-lore',
    status: 'verified',
    at: new Date().toISOString(),
  };
  const actualizado = marcaEjercido(recibo, 'ejercido');
  assert.equal(actualizado.ejercido, 'ejercido');
  assert.ok(actualizado.ejercido_en, 'debe registrar fecha de evaluacion');
});

test('marcaEjercido soporta estado stale', () => {
  const recibo = { capability: 'use-lore', status: 'verified' };
  const actualizado = marcaEjercido(recibo, 'stale');
  assert.equal(actualizado.ejercido, 'stale');
});

test('verificaStale retorna stale cuando pasan mas dias que el umbral', () => {
  const hace10Dias = new Date(Date.now() - 10 * 86400000).toISOString();
  const resultado = verificaStale('use-lore', { ultimoUso: hace10Dias, umbralDias: 7, ahora: new Date() });
  assert.equal(resultado.stale, true);
  assert.equal(resultado.dias, 10);
});

test('verizaStale retorna no-stale cuando esta dentro del umbral', () => {
  const hace3Dias = new Date(Date.now() - 3 * 86400000).toISOString();
  const resultado = verificaStale('use-lore', { ultimoUso: hace3Dias, umbralDias: 7, ahora: new Date() });
  assert.equal(resultado.stale, false);
  assert.equal(resultado.dias, 3);
});

test('verificaStale usa el umbral por defecto cuando no se pasa uno', () => {
  const hace8Dias = new Date(Date.now() - 8 * 86400000).toISOString();
  const resultado = verificaStale('use-lore', { ultimoUso: hace8Dias, ahora: new Date() });
  assert.equal(resultado.stale, true);
  assert.equal(resultado.umbral, STALE_POR_DEFECTO_DIAS);
});

test('verizaStale declara stale cuando nunca se ejercio', () => {
  const resultado = verificaStale('use-lore', { ultimoUso: null, ahora: new Date() });
  assert.equal(resultado.stale, true);
  assert.equal(resultado.nuncaEjercida, true);
});

test('ejecutaRetiro escribe entrada en changelog', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'CHANGELOG.md', `# Changelog\n`);
  const entradas = [{
    capacidad: 'brainstorming-lore',
    fecha: '2026-10-06',
    diasSinUso: 15,
    razon: 'sin rastro en 15 dias',
    reemplazo: null,
  }];
  ejecutaRetiro(root, entradas);
  const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
  assert.match(changelog, /brainstorming-lore/);
  assert.match(changelog, /15 dias/);
  assert.match(changelog, /sin soporte/);
});

test('ejecutaRetiro declara migracion cuando hay reemplazo', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'CHANGELOG.md', `# Changelog\n`);
  const entradas = [{
    capacidad: 'save-to-legacy',
    fecha: '2026-10-06',
    diasSinUso: 20,
    razon: 'sin rastro en 20 dias',
    reemplazo: 'save-to-lore',
  }];
  ejecutaRetiro(root, entradas);
  const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
  assert.match(changelog, /save-to-legacy/);
  assert.match(changelog, /migracion.*save-to-lore/i);
  assert.match(changelog, /20 dias/);
});

test('end-to-end: un arbol con Pista en lore/ deja save-to-lore como ejercida', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'skills/save-to-lore/SKILL.md', `---\nname: save-to-lore\n---\n# Save\n`);
  escribe(root, 'lore/principios.md', `# Principios\n\n## Una leccion — \`confirmed\`\n\n**Pista.** ...\n`);
  const r = ejecutaStaleLore(root, { dryRun: true });
  const evaluada = r.evaluadas.find((x) => x.capacidad === 'save-to-lore');
  assert.equal(evaluada.nuncaEjercida, false);
  assert.equal(evaluada.encontrado, true);
});
