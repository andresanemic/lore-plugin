// Prueba de procedencia del método del coordinador: las dos copias deben decir lo mismo y llevar su crédito.
// skills/vespi/method.md (Lore Plugin y skill única de Vespi) es la fuente de este árbol;
// docs/METHOD.md del kernel de Vespi lleva el mismo texto en inglés y su versión en español.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolveKernelDir, verifyMethodCopy } from './method-provenance-resolver.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configuredKernel = process.env.VESPI_KERNEL_DIR;
const releaseRequired = process.env.LORE_RELEASE_GATE === '1';
const kernelDir = resolveKernelDir({ repoRoot, configured: configuredKernel, release: releaseRequired });
const coverageMessage = 'Falta cobertura de procedencia del método: apunta VESPI_KERNEL_DIR a la raíz del kernel (por ejemplo VESPI_KERNEL_DIR=file:///C:/ruta/al/kernel) para comparar docs/METHOD.md.';
const skill = readFileSync(new URL('../skills/vespi/method.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n').trimEnd();

test('la skill de Vespi trae el método y su crédito, sin depender de una skill instalada', () => {
  assert.match(skill, /Sahir619/);
  assert.match(skill, /MIT/);
  assert.match(skill, /Copyright \(c\) 2026 Sahir619/);
  assert.match(skill, /depends on no installed skill/);
  for (const marca of ['AUTH:', 'INTENT:', 'TWINS:', 'PENDING:']) assert.ok(skill.includes(marca), marca);
});

test('el kernel lleva el mismo texto en inglés que la skill', {
  todo: !kernelDir && !releaseRequired ? coverageMessage : false,
}, () => {
  assert.ok(kernelDir, releaseRequired ? `${coverageMessage} La puerta de liberación exige esa comparación.` : coverageMessage);
  const kernel = readFileSync(resolve(kernelDir, 'docs', 'METHOD.md'), 'utf8').replace(/\r\n/g, '\n');
  const [en] = kernel.split('\n---\n\n# El método del coordinador');
  assert.equal(verifyMethodCopy(skill, en), true);
});

// Prueba la lógica de la ruta predeterminada con un sistema de archivos simulado: no depende de que
// esta máquina tenga el kernel en una carpeta hermana (en un clon limpio o en CI no la tiene).
test('la ruta predeterminada apunta al kernel externo desde la raíz del repositorio', () => {
  const esperado = resolve(repoRoot, '../../../founder/proyectos/vespi/kernel');
  const encontrado = resolveKernelDir({ repoRoot, exists: (candidate) => candidate === resolve(esperado, 'docs', 'METHOD.md') });
  assert.equal(encontrado, esperado);
  assert.equal(resolveKernelDir({ repoRoot, exists: () => false }), undefined, 'sin kernel en ninguna ruta, no inventa una');
});

test('la ruta que usa la comparación predeterminada también resuelve el kernel', {
  todo: !kernelDir && !releaseRequired ? coverageMessage : false,
}, () => {
  if (configuredKernel) return;
  assert.ok(kernelDir, 'la comparación sigue apuntando a una ruta inexistente');
});
