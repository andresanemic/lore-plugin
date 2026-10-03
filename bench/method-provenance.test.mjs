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

test('la ruta predeterminada encuentra el kernel externo desde la raíz del repositorio', () => {
  const root = new URL('../', import.meta.url);
  const candidates = ['../../../founder/proyectos/vespi/kernel', '../../../founder/proyectos/vespi/kernel-cdx'];
  assert.ok(candidates.some((candidate) => existsSync(new URL(`${candidate}/docs/METHOD.md`, root))), 'ningún candidato predeterminado resuelve el kernel');
});

test('la ruta que usa la comparación predeterminada también resuelve el kernel', () => {
  if (configuredKernel) return;
  assert.ok(kernelDir, 'la comparación sigue apuntando a una ruta inexistente');
});
