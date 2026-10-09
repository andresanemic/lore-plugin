import { proofFor } from "./verification-fixture.mjs";
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { verifyTask, integrateTask, closeOperation } from '../skills/vespi/core/coordinator.mjs';
import { createArtifact } from '../skills/vespi/core/operation-state.mjs';

const sha = text => createHash('sha256').update(text).digest('hex');
function delivery(t) {
  const root = mkdtempSync(join(tmpdir(), 'criterion-proof-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const path = join(root, 'draft.md');
  const proofPath = join(root, 'comparison.txt');
  writeFileSync(path, 'A draft that must be compared with its sources.');
  writeFileSync(proofPath, 'Source A: the draft explains the mechanism. Source B: its limitation is retained.');
  const task = { id: 't1', state: 'reviewed', executor: { by: 'writer' },
    question: 'Explain the tool', done_criterion: 'Explain the mechanism and its limits',
    proof: 'Compare both required sources with the draft', sources: ['source-a', 'source-b'],
    received: { path, sha256: sha('A draft that must be compared with its sources.') } };
  const reference = { path: proofPath, sha256: sha('Source A: the draft explains the mechanism. Source B: its limitation is retained.') };
  const evidence = { criterion: task.done_criterion, proof: task.proof, artifact_sha256: task.received.sha256,
    checks: [{ passed: true, observation: 'The draft states the mechanism and retains the limitation.', evidence: reference }],
    sources: task.sources.map(ref => ({ ref, observation: `Compared ${ref} with the draft in the saved comparison.`, evidence: reference })),
    notCovered: [] };
  // Synthetic review attestation; proofFor executes the actual local checker.
  task.review = { by: 'fixture-advisor', verdict: 'accepted', artifact_sha256: task.received.sha256 };
  const artifact = { ...createArtifact({ goal: task.question, owner: 'fixture-owner', scope: 'Local coverage checks', expected_effect: { kind: 'none' }, done: task.done_criterion, roles: ['worker','advisor','verifier'], verifier: 'reader' }), state: 'reviewed', tasks: [task] };
  return { artifact, task, evidence, path, proofPath };
}
for (const invalid of ['', 'I read everything', {}, []]) {
  test(`verification rejects unbound evidence ${JSON.stringify(invalid)}`, t => {
    const { artifact } = delivery(t);
    assert.throws(() => verifyTask(artifact, 't1', { verifier: 'reader', observed: true, evidence: invalid }), /evidence|criterion|proof/i);
  });
}
test('verification rejects coverage missing a required source', t => {
  const { artifact, evidence } = delivery(t); evidence.sources.pop();
  assert.throws(() => verifyTask(artifact, 't1', { verifier: 'reader', observed: true, evidence }), /source/i);
});
test('verification rejects a criterion or proof from another task', t => {
  const { artifact, evidence } = delivery(t); evidence.criterion = 'Count text boxes';
  assert.throws(() => verifyTask(artifact, 't1', { verifier: 'reader', observed: true, evidence }), /criterion/i);
});
test('verification rejects a changed artifact and changed proof bytes', t => {
  const { artifact, evidence, path, proofPath } = delivery(t);
  writeFileSync(path, 'Changed draft');
  assert.throws(() => verifyTask(artifact, 't1', { verifier: 'reader', observed: true, evidence }), /artifact|digest|changed/i);
  writeFileSync(path, 'A draft that must be compared with its sources.');
  writeFileSync(proofPath, 'A different review');
  assert.throws(() => verifyTask(artifact, 't1', { verifier: 'reader', observed: true, evidence }), /evidence|digest|changed/i);
});
test('partial or failed checks cannot certify a complete result', t => {
  const { artifact, evidence } = delivery(t); evidence.notCovered = ['source-b'];
  assert.throws(() => verifyTask(artifact, 't1', { verifier: 'reader', observed: true, evidence }), /coverage|covered/i);
  evidence.notCovered = []; evidence.checks[0].passed = false;
  assert.throws(() => verifyTask(artifact, 't1', { verifier: 'reader', observed: true, evidence }), /check|passed/i);
});
test('a bound proof is accepted but changing the result prevents integration', t => {
  const { artifact, evidence, path } = delivery(t);
  const verified = verifyTask(artifact, 't1', { verifier: 'reader', observed: true, evidence: proofFor(artifact) });
  assert.equal(verified.tasks[0].state, 'verified');
  assert.equal(verified.tasks[0].verification.independence, 'labels_only');
  writeFileSync(path, 'Changed after verification');
  assert.throws(() => integrateTask(verified, 't1', { destination: 'draft' }), /artifact|digest|changed/i);
});
test('the verification fixture keeps untrusted source names out of executable checker code', t => {
  const { artifact, task } = delivery(t);
  const untrustedRef = "source');process.exit(23);//";
  task.sources = [untrustedRef];
  const result = proofFor(artifact);
  const runner = readFileSync(task.proof_runner.path, 'utf8');
  assert.equal(result.execution_receipt.execution.passed, true);
  assert.equal(runner.includes(untrustedRef), false);
});
test('Codex SessionStart delivers the tree purpose through additionalContext', t => {
  const root = mkdtempSync(join(tmpdir(), 'criterion-start-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(join(root, 'lore'));
  writeFileSync(join(root, 'lore', 'identidad.md'), '# Identidad\n\n**El para qué: devolver tiempo a la persona**\n');
  const hook = process.env.CRITERION_HOOK ? new URL(`file:///${process.env.CRITERION_HOOK.replaceAll('\\', '/')}`) : new URL('../hooks/codex-guard.mjs', import.meta.url);
  const stdout = execFileSync(process.execPath, [hook.pathname.replace(/^\/(\w:)/, '$1'), 'session_start'], {
    encoding: 'utf8', input: JSON.stringify({ cwd: root, session_id: `criterion-${process.pid}-${Date.now()}`, nivel: 'full' }),
  });
  assert.notEqual(stdout.trim(), '', 'SessionStart must not discard the opening context');
  const output = JSON.parse(stdout);
  assert.equal(output.hookSpecificOutput.hookEventName, 'SessionStart');
  assert.match(output.hookSpecificOutput.additionalContext, /tiempo|persona/i);
});
