// Prueba de procedencia del método del coordinador: las dos copias deben decir lo mismo y llevar su crédito.
// skills/vespi/method.md (Lore Plugin y skill única de Vespi) es la fuente de este árbol;
// docs/METHOD.md del kernel de Vespi lleva el mismo texto en inglés y su versión en español.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const KERNEL = process.env.VESPI_KERNEL_DIR || '../../founder/proyectos/vespi/kernel';
const skill = readFileSync(new URL('../skills/vespi/method.md', import.meta.url), 'utf8').replace(/\r\n/g, '\n').trimEnd();

test('la skill de Vespi trae el método y su crédito, sin depender de una skill instalada', () => {
  assert.match(skill, /Sahir619/);
  assert.match(skill, /MIT/);
  assert.match(skill, /Copyright \(c\) 2026 Sahir619/);
  assert.match(skill, /depends on no installed skill/);
  for (const marca of ['AUTH:', 'INTENT:', 'TWINS:', 'PENDING:']) assert.ok(skill.includes(marca), marca);
});

test('el kernel lleva el mismo texto en inglés que la skill', { skip: !existsSync(new URL(`${KERNEL}/docs/METHOD.md`, import.meta.url)) }, () => {
  const kernel = readFileSync(new URL(`${KERNEL}/docs/METHOD.md`, import.meta.url), 'utf8').replace(/\r\n/g, '\n');
  const [en] = kernel.split('\n---\n\n# El método del coordinador');
  const h = (s) => createHash('sha256').update(s.trimEnd()).digest('hex');
  assert.equal(h(en), h(skill));
});
