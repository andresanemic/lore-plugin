import test from 'node:test';import assert from 'node:assert/strict';
import{mkdtempSync,mkdirSync,writeFileSync,rmSync}from'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';import{createHash}from'node:crypto';
const source=process.env.CRITERION_KIT??new URL('..',import.meta.url).pathname.replace(/^\/(\w:)/,'$1');
const {executeNodeVerification,executeVerification,assertExecuted}=await import('file:///'+source+'/skills/vespi/core/verification-execution.mjs');
function fixture(t){const root=mkdtempSync(join(tmpdir(),'owner-criterion-'));t.after(()=>rmSync(root,{recursive:true,force:true}));mkdirSync(join(root,'lore'));const path=join(root,'copy.txt'),runner=join(root,'weak.test.mjs');const text='A real delivery long enough for the weak checker but without sufficient evidence of editorial coverage.';const body="import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const p=JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE,'utf8'));test('length only',()=>assert.ok(p.artifact.content.length>20));";writeFileSync(path,text);writeFileSync(runner,body);const task={id:'t1',state:'reviewed',done_criterion:'Comply with the owner criterion',proof:'Verify criterion coverage',sources:[],received:{path,root,sha256:createHash('sha256').update(text).digest('hex')},proof_runner:{adapter:'node-test',path:runner,sha256:createHash('sha256').update(body).digest('hex'),required_tests:['length only']}};return{root,task,artifact:{id:'op-owner',state:'reviewed',tasks:[task]},index:join(root,'lore/index.md')};}
test('missing unconditional owner module cannot be omitted from commission',t=>{const f=fixture(t);writeFileSync(f.index,'| Voice | always | `voice.md` |');assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/ENOENT|mandatory owner criterion/);});
test('complete owner source does not make a weak Node checker sufficient',t=>{const f=fixture(t);writeFileSync(f.index,'| Voice | siempre | `voice.md` |');writeFileSync(join(f.root,'lore/voice.md'),'Compare the publication against reader context and the author voice.');assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/semantic verification/);});
test('async route cannot bypass semantic authorization with complete sources',async t=>{const f=fixture(t);writeFileSync(f.index,'| Voice | always | `voice.md` |');writeFileSync(join(f.root,'lore/voice.md'),'Explain the reader benefit.');await assert.rejects(executeVerification(f.artifact,'t1',{root:f.root}),/authorized semantic verification/);});
test('criterion added after a Node receipt prevents replay certification',t=>{const f=fixture(t);const evidence=executeNodeVerification(f.artifact,'t1',{root:f.root});writeFileSync(f.index,'Owner criterion applies.');assert.throws(()=>assertExecuted(f.artifact,f.task,evidence),/semantic verification|coverage changed/);});
test('explicit always-on contract module is resolved before execution',t=>{const f=fixture(t);writeFileSync(join(f.root,'CLAUDE.md'),'<!-- lore:always-on -->\n- `lore/required.md`\n<!-- /lore:always-on -->');assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/ENOENT|mandatory owner criterion/);});

test('alias to owner index still resolves its missing always module',t=>{
  const f=fixture(t);
  writeFileSync(f.index,'| Voice | always | `missing.md` |');
  f.task.sources=['owner-alias'];
  f.task.proof_runner.source_files={'owner-alias':'lore/index.md'};
  assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/ENOENT|mandatory owner criterion/);
});

test('alias to complete owner index cannot avoid semantic authorization',async t=>{
  const f=fixture(t);
  writeFileSync(f.index,'| Voice | always | `voice.md` |');
  writeFileSync(join(f.root,'lore/voice.md'),'Explain the reader benefit.');
  f.task.sources=['owner-alias'];
  f.task.proof_runner.source_files={'owner-alias':'lore/index.md'};
  assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/semantic verification|cover declared sources/);
  await assert.rejects(executeVerification(f.artifact,'t1',{root:f.root}),/authorized semantic verification|cover declared sources/);
});

test('relative commissioned runner resolves before the no-model packet budget gate',async t=>{
  const f=fixture(t);
  writeFileSync(f.index,'Owner criterion applies.\n'+'x'.repeat(65000));
  f.task.proof_runner.path='weak.test.mjs';
  f.task.proof_runner.model='gpt-6-luna';
  f.task.proof_runner.effort='medium';
  await assert.rejects(executeVerification(f.artifact,'t1',{root:f.root}),/verification packet exceeds the budget cap; no model invoked/);
});

test('received operation root cannot be replaced by a criterion-free delivery subroot',async t=>{
  const f=fixture(t);
  writeFileSync(f.index,'| Voice | always | `missing.md` |');
  const child=join(f.root,'delivery');mkdirSync(child);
  const childPath=join(child,'copy.txt'),runner=join(child,'weak.test.mjs');
  const body="import test from 'node:test';import assert from 'node:assert/strict';test('length only',()=>assert.ok(true));";
  writeFileSync(childPath,'Delivery under the actual owner.');writeFileSync(runner,body);
  const {receiveTask,reviewTask}=await import('../skills/vespi/core/coordinator.mjs');
  f.task.state='running';f.task.output={path:childPath};f.task.proof_runner={...f.task.proof_runner,path:runner,sha256:createHash('sha256').update(body).digest('hex')};
  const received=await receiveTask(f.artifact,'t1',{root:f.root});
  const reviewed=reviewTask(received,'t1',{reviewer:'coordinator',checked:['scope','sources','risks']});
  assert.throws(()=>executeNodeVerification(reviewed,'t1',{root:child}),/root|criterion|reconcil/i);
});


test('owner criterion written only in a heading still requires semantic review',t=>{
  const f=fixture(t);
  writeFileSync(join(f.root,'CLAUDE.md'),'# Never publish without human review\n');
  assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/semantic verification|cover declared sources/);
});


test('legacy reception without root requires reconciliation before verification',t=>{
  const f=fixture(t);
  delete f.task.received.root;
  assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/root|receive|reconcil/i);
});

test('aliased nested mandatory index still closes its always references',t=>{
  const f=fixture(t);
  mkdirSync(join(f.root,'lore/sub'));
  writeFileSync(join(f.root,'CLAUDE.md'),'<!-- lore:always-on -->\n- '+String.fromCharCode(96)+'lore/sub/index.md'+String.fromCharCode(96)+'\n<!-- /lore:always-on -->');
  writeFileSync(join(f.root,'lore/sub/index.md'),'| Voice | always | '+String.fromCharCode(96)+'missing.md'+String.fromCharCode(96)+' |');
  f.task.sources=['nested-alias'];
  f.task.proof_runner.source_files={'nested-alias':'lore/sub/index.md'};
  assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/ENOENT|mandatory owner criterion/);
});

test('canonical owner contract cannot be replaced by source_files mapping',t=>{
  const f=fixture(t);
  writeFileSync(join(f.root,'CLAUDE.md'),'<!-- lore:always-on -->\n- `lore/missing-owner-rule.md`\n<!-- /lore:always-on -->');
  writeFileSync(join(f.root,'harmless.md'),'Unrelated harmless text.');
  f.task.sources=['CLAUDE.md'];
  f.task.proof_runner.source_files={'CLAUDE.md':'harmless.md'};
  assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/ENOENT|mandatory owner criterion/);
});

test('existing mandatory module cannot be replaced by a declared mapped copy',t=>{
  const f=fixture(t);
  writeFileSync(f.index,'| Rule | always | `module.md` |');
  writeFileSync(join(f.root,'lore/module.md'),'<!-- lore:always-on -->\n- `missing-child.md`\n<!-- /lore:always-on -->');
  writeFileSync(join(f.root,'harmless.md'),'An incomplete mapped copy.');
  f.task.sources=['lore/module.md'];
  f.task.proof_runner.source_files={'lore/module.md':'harmless.md'};
  assert.throws(()=>executeNodeVerification(f.artifact,'t1',{root:f.root}),/ENOENT|mandatory owner criterion/);
});

test('external source absent from the operation root keeps its local snapshot mapping',async t=>{
  const f=fixture(t);
  const external=mkdtempSync(join(tmpdir(),'external-criterion-'));
  t.after(()=>rmSync(external,{recursive:true,force:true}));
  const ref=join(external,'external-rule.md');
  writeFileSync(ref,'External source outside the operation root.');
  writeFileSync(join(f.root,'external-snapshot.md'),'External source outside the operation root.');
  f.task.sources=[ref];
  f.task.proof_runner.source_files={[ref]:'external-snapshot.md'};
  const coverBody="import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const p=JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE,'utf8'));test('covers external source',()=>assert.ok(p.sources.length>0));";
  const coverPath=join(f.root,'cover.test.mjs');
  writeFileSync(coverPath,coverBody);
  f.task.proof_runner.path=coverPath;
  f.task.proof_runner.sha256=createHash('sha256').update(coverBody).digest('hex');
  f.task.proof_runner.required_tests=['covers external source'];
  const evidence=executeNodeVerification(f.artifact,'t1',{root:f.root});
  assert.equal(evidence.execution_receipt.execution.passed,true);
  assert.ok(evidence.execution_receipt.execution.inputs.some(input=>input.ref===ref&&input.path===join(f.root,'external-snapshot.md')));
});
