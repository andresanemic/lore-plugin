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

test('leeCapacidadesCentrales deriva capacidades del README', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'README.md', `# Lore Kit\n\n## The eight skills\n\nLas ocho skills del kit son:\n- create-area: inicia un area de trabajo\n- create-project: inicia un proyecto\n- create-bot: construye un bot\n- use-lore: el mapa\n- save-to-lore: captura lecciones\n- transmute-lore: opera el cuerpo de criterio\n- brainstorming-lore: disena formas de trabajo\n- vespi: opera bajo presion\n`);
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

test('buscaRastroCapacidad encuentra rastro en recibos del kernel', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  const recibo = {
    capability: 'use-lore',
    at: new Date().toISOString(),
    status: 'verified',
    operation: { id: 'op-1', goal: 'resolver conflicto' },
  };
  escribe(root, '.lore/receipts/use-lore.json', JSON.stringify([recibo]));
  const rastro = buscaRastroCapacidad('use-lore', root, { ahora: new Date() });
  assert.equal(rastro.encontrado, true);
  assert.equal(rastro.fuentes.includes('recibo'), true);
  assert.equal(rastro.ultimoUso, recibo.at);
});

test('buscaRastroCapacidad encuentra rastro en FASES.md', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  const hace3Dias = new Date(Date.now() - 3 * 86400000).toISOString().slice(0, 10);
  escribe(root, 'FASES.md', `# Estado\n\n## Operaciones\n\n- [${hace3Dias}] op: invoco use-lore para resolver conflicto\n`);
  const rastro = buscaRastroCapacidad('use-lore', root, { ahora: new Date() });
  assert.equal(rastro.encontrado, true);
  assert.equal(rastro.fuentes.includes('fases'), true);
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

test('end-to-end: detecta capacidad stale y la retira con rastro', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  // capacidad que se ejercio hace 30 dias
  const hace30Dias = new Date(Date.now() - 30 * 86400000).toISOString();
  const recibo = { capability: 'transmute-lore', at: hace30Dias, status: 'verified', operation: { id: 'op-old', goal: 'limpiar' } };
  escribe(root, '.lore/receipts/transmute-lore.json', JSON.stringify([recibo]));
  // buscar rastro
  const rastro = buscaRastroCapacidad('transmute-lore', root, { ahora: new Date() });
  assert.equal(rastro.encontrado, true);
  // verificar stale
  const stale = verificaStale('transmute-lore', { ultimoUso: rastro.ultimoUso, ahora: new Date() });
  assert.equal(stale.stale, true);
  assert.ok(stale.dias >= 30);
  // retirar
  escribe(root, 'CHANGELOG.md', `# Changelog\n`);
  ejecutaRetiro(root, [{
    capacidad: 'transmute-lore',
    fecha: new Date().toISOString().slice(0, 10),
    diasSinUso: stale.dias,
    razon: `sin rastro en ${stale.dias} dias`,
    reemplazo: null,
  }]);
  const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');
  assert.match(changelog, /transmute-lore/);
});
