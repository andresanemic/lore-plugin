import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  leeCapacidadesCentrales,
  buscaRastroCapacidad,
  ejecutaStaleLore,
} from './stale-lore.mjs';

/**
 * RED de stale-lore 2.5 — los casos que la primera corrida real produjo (2026-10-07).
 *
 * La corrida en vivo sobre el kit marcó las 9 capacidades stale, con `diasSinUso: 999`
 * inventado, y propuso retirarse a sí misma. Los 17 tests anteriores pasaban porque
 * probaban las funciones con fixtures que el autor imaginó, no el flujo sobre un árbol real.
 *
 * Cada test de acá DEBE fallar contra la implementación de 2.5. Ese es el RED.
 */

function arbolTemporal() {
  const root = mkdtempSync(join(tmpdir(), 'stale-lore-red-'));
  const cleanup = () => rmSync(root, { recursive: true, force: true });
  return { root, cleanup };
}

function escribe(raiz, ruta, contenido) {
  const full = join(raiz, ruta);
  mkdirSync(join(full, '..'), { recursive: true });
  writeFileSync(full, contenido);
}

// --- Caso 1: deriva del árbol, no de una lista hardcodeada ---

test('RED: leeCapacidadesCentrales deriva una skill nueva del arbol, no solo las canonicas', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'skills/nueva-capacidad/SKILL.md', `---\nname: nueva-capacidad\ndescription: Use when probando.\n---\n# Nueva\n`);
  const caps = leeCapacidadesCentrales(root);
  assert.ok(
    caps.includes('nueva-capacidad'),
    'debe derivar la skill del arbol; hoy solo devuelve las 9 hardcodeadas'
  );
});

test('RED: leeCapacidadesCentrales no inventa capacidades de un arbol vacio', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  const caps = leeCapacidadesCentrales(root);
  assert.deepEqual(caps, [], 'un arbol sin skills no declara ninguna capacidad central');
});

// --- Caso 2: no fabricar la cifra ---

test('RED: ejecutaStaleLore no inventa 999 dias; sin rastro es null, no una cifra', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'skills/use-lore/SKILL.md', `---\nname: use-lore\n---\n# Use\n`);
  const r = ejecutaStaleLore(root, { dryRun: true });
  for (const retiro of r.retiros) {
    assert.notEqual(retiro.diasSinUso, 999, `"${retiro.capacidad}" no puede fabricar 999 dias`);
    assert.ok(
      retiro.diasSinUso === null || retiro.diasSinUso === undefined,
      `sin rastro la cifra es null, no ${retiro.diasSinUso}`
    );
  }
});

// --- Caso 3: no se retira a si misma ---

test('RED: stale-lore no se propone retirar a si misma', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'skills/stale-lore/SKILL.md', `---\nname: stale-lore\n---\n# Stale\n`);
  const r = ejecutaStaleLore(root, { dryRun: true });
  const seRetira = r.retiros.some((x) => x.capacidad === 'stale-lore');
  assert.equal(seRetira, false, 'la capacidad que mide no puede retirarse a si misma');
});

// --- Caso 4: la mencion no es uso (falso verde) ---

test('RED: una mencion en FASES.md no cuenta como uso de hoy', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'FASES.md', `# Estado\n\nPendiente: revisar use-lore en algun momento.\n`);
  const rastro = buscaRastroCapacidad('use-lore', root, { ahora: new Date() });
  assert.notEqual(
    rastro.encontrado,
    true,
    'una mencion sin artefacto no es rastro de uso; hoy da encontrado:true con fecha de hoy'
  );
});

// --- Caso 5: el flujo real sobre un arbol con uso real no retira todo ---

test('RED: un arbol con lore ejercido no marca save-to-lore como nunca ejercida', () => {
  const { root, cleanup } = arbolTemporal();
  test.after(cleanup);
  escribe(root, 'skills/save-to-lore/SKILL.md', `---\nname: save-to-lore\n---\n# Save\n`);
  // rastro real: una Pista guardada en el lore del usuario
  escribe(root, 'lore/principios.md', `# Principios\n\n## Una leccion — \`confirmed\`\n\n**Pista.** ...\n`);
  const r = ejecutaStaleLore(root, { dryRun: true });
  const evaluada = r.evaluadas.find((x) => x.capacidad === 'save-to-lore');
  assert.equal(
    evaluada.nuncaEjercida,
    false,
    'save-to-lore dejo una Pista en lore/: eso es rastro de uso, no "nunca ejercida"'
  );
});
