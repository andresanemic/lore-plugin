import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { executeNodeVerification, executeVerification } from '../skills/vespi/core/verification-execution.mjs';
import { verifyTask, integrateTask, closeOperation } from '../skills/vespi/core/coordinator.mjs';
const sha = content => createHash('sha256').update(content).digest('hex');
function fixture(t, { good = true, failing = false } = {}) {
  const root = mkdtempSync(join(tmpdir(), 'execution-receipt-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const path = join(root, 'result.txt'), source = join(root, 'source.txt'), runner = join(root, 'proof.test.mjs');
  const text = good ? 'Lore Plugin porta criterio. Vespi coordina operaciones. Find Your Way.' : 'Un texto que omite lo obligatorio.';
  writeFileSync(path, text); writeFileSync(source, 'Debe explicar Lore Plugin, Vespi y Find Your Way.');
  const code = `import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const packet=JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE,'utf8'));test('three commissioned literal requirements',()=>{assert.ok(packet.sources.some(s=>s.ref==='source.txt'));for(const required of ['Lore Plugin','Vespi','Find Your Way'])assert.ok(packet.artifact.content.includes(required),required);${failing ? 'assert.fail("rejected deliberately");' : ''}});`;
  writeFileSync(runner, code);
  const task = { id: 't1', state: 'reviewed', role: 'worker', question: 'Explain three named concepts',
    done_criterion: 'Name Lore Plugin, Vespi and Find Your Way', proof: 'Execute the literal coverage check', sources: ['source.txt'],
    executor: { by: 'writer' }, received: { root, path, sha256: sha(text) },
    proof_runner: { adapter: 'node-test', path: runner, sha256: sha(code), required_tests: ['three commissioned literal requirements'] } };
  const artifact = { id: 'op-local-proof', state: 'reviewed', tasks: [task], checkpoints: [], uncertainty: [], effects: [] };
  return { root, task, artifact, source, path, runner };
}
const verify = (artifact, evidence) => verifyTask(artifact, 't1', { verifier: 'reader', observed: true, evidence });
test('a complete fabricated report cannot certify a task', t => {
  const { task, artifact, source } = fixture(t);
  const reference = { path: source, sha256: sha(readFileSync(source)) };
  const evidence = { criterion: task.done_criterion, proof: task.proof, artifact_sha256: task.received.sha256,
    checks: [{ passed: true, observation: 'Everything passes', evidence: reference }],
    sources: [{ ref: 'source.txt', observation: 'Read', evidence: reference }], notCovered: [] };
  assert.throws(() => verify(artifact, evidence), /receipt.*execut|reported evidence/i);
  evidence.execution_receipt = { execution: { completed: true, passed: true }, signature: '0'.repeat(64) };
  assert.throws(() => verify(artifact, evidence), /signature/i);
});
test('the agreed checker executes and rejects missing mandatory content', t => {
  const { artifact, root } = fixture(t, { good: false });
  const evidence = executeNodeVerification(artifact, 't1', { root });
  assert.equal(evidence.execution_receipt.execution.completed, true);
  assert.equal(evidence.execution_receipt.execution.passed, false);
  assert.match(evidence.checks[0].observation, /Lore Plugin/);
  assert.throws(() => verify(artifact, evidence), /check|reject|coverage/i);
  assert.equal(artifact.tasks[0].state, 'reviewed');
});
test('a real successful check enables verification, integration and closure', t => {
  const { artifact, root } = fixture(t);
  const evidence = executeNodeVerification(artifact, 't1', { root });
  const verified = verify(artifact, evidence);
  assert.equal(verified.tasks[0].verification.executed, true);
  const integrated = integrateTask(verified, 't1', { destination: 'result' });
  const closed = closeOperation(integrated, { verification: { verified: true, observed: true, by: 'reader' } });
  assert.equal(closed.state, 'closed');
});
test('altering a signed report or replaying it for another operation fails', t => {
  const { artifact, root } = fixture(t);
  const evidence = executeNodeVerification(artifact, 't1', { root });
  const forged = structuredClone(evidence); forged.checks[0].observation = 'Changed claim';
  assert.throws(() => verify(artifact, forged), /evidence was changed/i);
  assert.throws(() => verify({ ...artifact, id: 'other' }, evidence), /does not match/i);
  artifact.tasks[0].done_criterion = 'A different criterion';
  evidence.criterion = 'A different criterion';
  assert.throws(() => verify(artifact, evidence), /does not match|changed/i);
});
test('changing a criterion source after verification blocks integration and closure', t => {
  const { artifact, root, source } = fixture(t);
  const evidence = executeNodeVerification(artifact, 't1', { root });
  const verified = verify(artifact, evidence);
  const integrated = integrateTask(verified, 't1', { destination: 'result' });
  writeFileSync(source, 'New criterion');
  assert.throws(() => integrateTask(verified, 't1', { destination: 'result' }), /input changed/i);
  assert.throws(() => closeOperation(integrated, { verification: { verified: true, observed: true, by: 'reader' } }), /input changed/i);
});
test('a changed proof runner cannot execute or replay an old result', t => {
  const { artifact, root, runner } = fixture(t);
  const evidence = executeNodeVerification(artifact, 't1', { root });
  writeFileSync(runner, 'console.log("fake passed")');
  assert.throws(() => executeNodeVerification(artifact, 't1', { root }), /runner changed/i);
  assert.throws(() => verify(artifact, evidence), /input changed/i);
});
test('missing source and missing adapter fail before any certification', async t => {
  const { artifact, root, source } = fixture(t);
  rmSync(source);
  assert.throws(() => executeNodeVerification(artifact, 't1', { root }), /ENOENT/);
  artifact.tasks[0].proof_runner = null;
  await assert.rejects(executeVerification(artifact, 't1', { root }), /no executable verification adapter/i);
});
test('a suite with every check skipped cannot certify a result', t => {
  const { artifact, root, runner } = fixture(t);
  const body = "import test from 'node:test';test.skip('three commissioned literal requirements',()=>{});";
  writeFileSync(runner, body); artifact.tasks[0].proof_runner.sha256 = sha(body);
  const evidence = executeNodeVerification(artifact, 't1', { root });
  assert.equal(evidence.execution_receipt.execution.passed, false);
  assert.ok(evidence.notCovered.some(item => /incomplete|not passed/.test(item)));
  assert.throws(() => verify(artifact, evidence), /coverage|covered|check/i);
});
test('execution does not run before review or with no authority', t => {
  const { artifact, root, task } = fixture(t);
  task.state = 'received';
  assert.throws(() => executeNodeVerification(artifact, 't1', { root }), /reviewed/i);
  task.state = 'reviewed'; artifact.state = 'prepared';
  assert.throws(() => executeNodeVerification(artifact, 't1', { root }), /authorized/i);
});
test('runner imports and paths outside the operation are rejected before execution', t => {
  const { artifact, root, runner } = fixture(t);
  const body = "import './mutable-helper.mjs';";
  writeFileSync(runner, body); artifact.tasks[0].proof_runner.sha256 = sha(body);
  assert.throws(() => executeNodeVerification(artifact, 't1', { root }), /imports/i);
  artifact.tasks[0].proof_runner.path = new URL(import.meta.url).pathname.replace(/^\/(\w:)/, '$1');
  assert.throws(() => executeNodeVerification(artifact, 't1', { root }), /escapes/i);
});
test('a completed checker that omits a required test cannot certify a result', t => {
  const { artifact, root } = fixture(t);
  artifact.tasks[0].proof_runner.required_tests.push('missing independent check');
  const evidence = executeNodeVerification(artifact, 't1', { root });
  assert.equal(evidence.execution_receipt.execution.passed, false);
  assert.match(evidence.notCovered.join(' '), /missing independent check/);
});
test('closing with blocked tasks records partial completion, not verified success', t => {
  const { artifact } = fixture(t);
  artifact.tasks[0].state = 'blocked'; artifact.tasks[0].blocked = { cause: 'no execution' };
  const closed = closeOperation(artifact, { verification: { verified: true, observed: true, by: 'reader' } });
  assert.equal(closed.state, 'closed');
  assert.equal(closed.verification.verified, false);
  assert.equal(closed.verification.completion, 'partial');
  assert.deepEqual(closed.verification.verified_tasks, []);
  assert.ok(closed.verification.notCovered.includes('task:t1'));
  assert.throws(() => closeOperation(artifact, { verification: { verified: true, observed: true, by: 'reader', verified_tasks: ['t1'] } }), /unverified task/i);
});

 test('actual pending effects cannot be hidden by a complete caller report', t => {
  const { artifact, root } = fixture(t);
  const integrated = integrateTask(verify(artifact, executeNodeVerification(artifact, 't1', { root })), 't1', { destination: 'result' });
  integrated.effects = [{ id: 'fx-hidden', status: 'unknown' }];
  integrated.uncertainty = ['unreconciled effect'];
  const closed = closeOperation(integrated, { verification: { verified: true, observed: true, by: 'reader', unverified_effects: [] } });
  assert.equal(closed.verification.verified, false);
  assert.ok(closed.verification.notCovered.includes('effect:fx-hidden'));
  assert.ok(closed.verification.notCovered.includes('uncertainty:unreconciled effect'));
});

test('CLI persists rejection and allows a corrected delivery with fresh review', t => {
  const {artifact,root,task,path}=fixture(t,{good:false});
  const statePath=join(root,'FASES.md');
  writeFileSync(statePath,'# Fixture\n\n## Operaciones\n\n<!-- vespi:operacion '+artifact.id+' -->\n\n```json\n'+JSON.stringify(artifact,null,2)+'\n```\n<!-- /vespi:operacion '+artifact.id+' -->\n');
  const cli=fileURLToPath(new URL('../scripts/operation-cli.mjs',import.meta.url));
  const run=(sub,payload)=>spawnSync(process.execPath,[cli,sub,'--root',root,'--id',artifact.id,'--task','t1','--json',JSON.stringify(payload)],{encoding:'utf8'});
  const rejected=run('verify',{verifier:'reader'});
  assert.equal(rejected.status,1,rejected.stderr);
  let persisted=JSON.parse(readFileSync(statePath,'utf8').match(/```json\s*([\s\S]*?)```/)[1]);
  assert.equal(persisted.tasks[0].state,'reviewed');
  assert.equal(persisted.tasks[0].verification.passed,false);
  assert.equal(persisted.tasks[0].verification.executed,true);
  writeFileSync(path,'Lore Plugin. Vespi. Find Your Way.');
  const received=run('receive',{path,exitCode:0,text:'corrected artifact'});
  assert.equal(received.status,0,received.stdout+received.stderr);
  assert.equal(JSON.parse(received.stdout).task.verification,null);
  assert.equal(run('verify',{verifier:'reader'}).status,1,'fresh review required');
  const reviewed=run('review',{reviewer:'reader',checked:['scope','sources','risks'],notes:'fresh corrected result'});
  assert.equal(reviewed.status,0,reviewed.stdout+reviewed.stderr);
  const verified=run('verify',{verifier:'reader'});
  assert.equal(verified.status,0,verified.stdout+verified.stderr);
  assert.equal(JSON.parse(verified.stdout).task.state,'verified');
});
