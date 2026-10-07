// Test RED: reproduce el bypass de la prueba adversarial 2.5.0.
// Un runner Node que solo comprueba longitud (>100 caracteres) NO debe poder
// certificar el cumplimiento del criterio obligatorio cuando hay fuentes declaradas
// que el runner ignora.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { executeNodeVerification } from '../skills/vespi/core/verification-execution.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'adversarial-250-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'lore'));
  const path = join(root, 'copy.txt');
  const runner = join(root, 'weak-length.test.mjs');
  // Texto que pasa la comprobación de longitud pero no cubre el criterio obligatorio.
  const text = 'Este texto tiene más de cien caracteres para pasar la comprobación mecánica del runner, pero no contiene evidencia de que se haya cumplido el criterio obligatorio del propietario.';
  // Runner que SOLO comprueba longitud. No accede a las fuentes declaradas.
  const body = "import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const p=JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE,'utf8'));test('length only',()=>assert.ok(p.artifact.content.length>100));";
  writeFileSync(path, text);
  writeFileSync(runner, body);
  const task = {
    id: 't1',
    state: 'reviewed',
    done_criterion: 'Comply with the owner criterion: voice and tone',
    proof: 'Verify criterion coverage against declared sources',
    sources: ['lore/voice.md', 'lore/tone.md'],
    received: { path, root, sha256: createHash('sha256').update(text).digest('hex') },
    proof_runner: {
      adapter: 'node-test',
      path: runner,
      sha256: createHash('sha256').update(body).digest('hex'),
      required_tests: ['length only'],
    },
  };
  return { root, task, artifact: { id: 'op-adv250', state: 'reviewed', tasks: [task] } };
}

test('RED: weak length-only runner cannot certify mandatory criterion coverage', (t) => {
  const f = fixture(t);
  // Las fuentes declaradas existen pero el runner no las lee.
  writeFileSync(join(f.root, 'lore/voice.md'), 'The publication must match the declared author voice.');
  writeFileSync(join(f.root, 'lore/tone.md'), 'The tone must be consistent throughout the piece.');
  // El runner solo comprueba longitud e ignora las fuentes. Debe ser rechazado.
  assert.throws(
    () => executeNodeVerification(f.artifact, 't1', { root: f.root }),
    /coverage|source|criterion/i,
  );
});
