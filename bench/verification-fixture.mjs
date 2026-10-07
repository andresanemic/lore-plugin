// Test-only commission: exercises state and execution plumbing, not an agent's semantic judgment.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { executeNodeVerification } from '../skills/vespi/core/verification-execution.mjs';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
export function proofFor(artifact, taskId = 't1') {
  const task = artifact.tasks.find(item => item.id === taskId);
  // Raw unit fixtures declare their reception root; genuine received roots are preserved.
  task.received.root ??= dirname(task.received.path);
  const path = `${task.received.path}.proof.test.mjs`;
  const source_files = {};
  for (const [i, ref] of (task.sources ?? []).entries()) {
    const sourcePath = `${task.received.path}.source-${i}.txt`;
    writeFileSync(sourcePath, `Fixture source ${i}: ${ref}. This fixture tests completed local execution, not semantic judgment.`);
    source_files[ref] = sourcePath;
  }
  const body = `import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{createHash}from'node:crypto';const p=JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE,'utf8'));test('fixture delivery is the commissioned byte sequence',()=>{assert.equal(createHash('sha256').update(p.artifact.content).digest('hex'),${JSON.stringify(task.received.sha256)});assert.ok(p.artifact.content.length>0);});test('fixture sources were actually supplied to the checker',()=>{for(const ref of ${JSON.stringify(task.sources ?? [])})assert.ok(p.sources.some(s=>s.ref===ref&&s.content.length>0));});`;
  writeFileSync(path, body);
  task.proof_runner = { adapter: 'node-test', path, sha256: hash(body), source_files,
    required_tests: ['fixture delivery is the commissioned byte sequence', 'fixture sources were actually supplied to the checker'] };
  return executeNodeVerification(artifact, taskId, { root: dirname(task.received.path) });
}
export function proofAt(root, id, taskId = 't1') {
  const path = join(root, 'FASES.md'), markdown = readFileSync(path, 'utf8');
  const matches = [...markdown.matchAll(/```json\s*([\s\S]*?)```/g)];
  const match = matches.find(item => JSON.parse(item[1]).id === id);
  const artifact = JSON.parse(match[1]), evidence = proofFor(artifact, taskId);
  // Fixture setup commissions the runner before the CLI consumes the genuine execution receipt.
  writeFileSync(path, markdown.replace(match[0], `\`\`\`json\n${JSON.stringify(artifact,null,2)}\n\`\`\``));
  return evidence;
}
