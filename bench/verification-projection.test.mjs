import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { createHash, createHmac } from 'node:crypto';
import { tmpdir, homedir } from 'node:os';
import { join } from 'node:path';
import { distillCriterion } from '../skills/vespi/core/coordinator.mjs';
import { projectOwnFases, restoreOwnFasesProjection } from '../skills/vespi/core/verification-execution.mjs';
import { executeNodeVerification, assertExecuted } from '../skills/vespi/core/verification-execution.mjs';
import { createArtifact, saveOperationState } from '../skills/vespi/core/operation-state.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const block = (id, value) => `<!-- vespi:operacion ${id} -->\n### Operación ${id}\n\n\`\`\`json\n${JSON.stringify({ id, ...value }, null, 2)}\n\`\`\`\n<!-- /vespi:operacion ${id} -->`;

test('proyecta FASES propio con dos operaciones, conserva prosa y reconstruye todos los campos', () => {
  const repeated = 'verificación observada '.repeat(180);
  const first = { state: 'closed', scope: 'primera', unknownField: { opaque: 'conservar' },
    tasks: [{ id: 't1', review: { verdict: 'accepted' }, verification: { evidence: { checks: [{ observation: repeated }],
      execution_receipt: { evidence: { checks: [{ observation: repeated }] }, signature: hash(repeated) } } } }] };
  const second = { state: 'reviewed', authority: { scope: 'segunda' }, checkpoints: [{ id: 'R1', note: repeated }],
    tasks: [{ id: 't2', review: { verdict: 'accepted' }, coverage: { source: repeated } }] };
  const original = `# FASES\n\nProsa anterior intacta.\n\n${block('op-uno', first)}\n\n${block('op-dos', second)}\n\n## Siguiente decisión\n\nProsa posterior intacta.\n`;
  const projected = projectOwnFases(original);
  assert.equal(projected.snapshotDigest, hash(original));
  assert.deepEqual(projected.operationIds, ['op-uno', 'op-dos']);
  const restored = restoreOwnFasesProjection(projected.content);
  assert.deepEqual(restored.operations, [{ id: 'op-uno', ...first }, { id: 'op-dos', ...second }]);
  assert.match(restored.prose, /Prosa anterior intacta/);
  assert.match(restored.prose, /Prosa posterior intacta/);
  assert.ok(Buffer.byteLength(projected.content) < Buffer.byteLength(original));
  assert.match(projected.content, /\$vespiDuplicateRef/);
  assert.doesNotMatch(projected.content, /\$vespiDuplicateRef[^}]*sha256/,
    'duplicate pointers use the whole projection digest, not a repeated hash per occurrence');
  assert.match(projected.content, /Prosa anterior intacta/);
  assert.match(projected.content, /Prosa posterior intacta/);
});

test('rechaza ID duplicado o bloque con ID discordante sin proyectar', () => {
  const valid = block('op-uno', { state: 'reviewed' });
  assert.throws(() => projectOwnFases(`${valid}\n${valid}`), /duplicate|duplicado/i);
  assert.throws(() => projectOwnFases(valid.replace('"id": "op-uno"', '"id": "op-otro"')), /ID|discord/i);
  assert.throws(() => projectOwnFases(valid.replace('<!-- /vespi:operacion op-uno -->', '')), /missing|malformed/i);
  assert.throws(() => projectOwnFases(block('op-uno', { opaque: { $vespiDuplicateRef: '/literal-del-usuario' } })), /reserved|colli/i);
});

test('recibo enlaza snapshot local inmutable y rechaza cambio de autoridad tras ejecución', async t => {
  const root = mkdtempSync(join(tmpdir(), 'phase-projection-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const delivery = join(root, 'entrega.txt'), runner = join(root, 'proof.test.mjs');
  writeFileSync(delivery, 'Entrega local revisada.');
  const body = "import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';const p=JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE,'utf8'));test('cubre FASES',()=>assert.ok(p.sources.some(s=>s.ref==='FASES.md'&&s.content.includes('op-projection'))));";
  writeFileSync(runner, body);
  const task = { id: 't1', state: 'reviewed', role: 'worker', question: 'Verificar entrega', done_criterion: 'Entrega local', proof: 'Cubre FASES',
    sources: ['FASES.md'], received: { path: delivery, root, sha256: hash('Entrega local revisada.') },
    review: { by: 'advisor', verdict: 'accepted', artifact_sha256: hash('Entrega local revisada.') },
    proof_runner: { adapter: 'node-test', path: runner, sha256: hash(body), required_tests: ['cubre FASES'] } };
  const artifact = { ...createArtifact({ goal: 'Verificar entrega', owner: 'fixture', scope: 'local',
    authority: { spend: [], scope: 'solo entrega' }, expected_effect: { kind: 'none' }, done: 'Entrega local',
    roles: ['worker', 'advisor', 'verifier'], verifier: 'verifier' }), id: 'op-projection', state: 'reviewed', tasks: [task] };
  const phase = join(root, 'FASES.md');
  writeFileSync(phase, `# FASES\n\n## Operaciones\n\n${block(artifact.id, artifact)}\n\nSiguiente acción: verificar.\n`);
  const evidence = executeNodeVerification(artifact, 't1', { root });
  const saved = evidence.execution_receipt.execution.phaseSnapshots?.[0];
  assert.equal(saved.snapshotDigest, hash(readFileSync(phase)));
  assert.equal(hash(readFileSync(saved.path)), saved.snapshotDigest);
  assert.match(saved.projectionDigest, /^[a-f0-9]{64}$/);
  assert.equal(assertExecuted(artifact, task, evidence).completed, true);
  await saveOperationState(root, createArtifact({ goal: 'Segunda operación local', owner: 'fixture', scope: 'local', expected_effect: { kind: 'none' }, done: 'decisión', roles: ['worker', 'advisor', 'verifier'], verifier: 'fixture' }));
  assert.equal(assertExecuted(artifact, task, evidence).completed, true, 'el escritor real de una segunda operación conserva la prosa y autoridad anteriores');
  writeFileSync(phase, `${readFileSync(phase, 'utf8')}\n${block('op-consumidor', { state: 'prepared', authority: { spend: [] }, tasks: [] })}\n`);
  assert.equal(assertExecuted(artifact, task, evidence).completed, true,
    'otra operación válida no invalida el recibo de la productora');
  const withProseChange = readFileSync(phase, 'utf8').replace('Siguiente acción: verificar.', 'Siguiente acción: publicar sin revisión.');
  writeFileSync(phase, withProseChange);
  assert.throws(() => assertExecuted(artifact, task, evidence), /FASES|prose|authority|criterion/i,
    'la autoridad en prosa exterior no puede cambiar tras la verificación');
  writeFileSync(phase, withProseChange.replace('Siguiente acción: publicar sin revisión.', 'Siguiente acción: verificar.'));
  const altered = readFileSync(phase, 'utf8').replace('solo entrega', 'todo el proyecto');
  writeFileSync(phase, altered);
  assert.throws(() => assertExecuted(artifact, task, evidence), /authority|alcance|snapshot|criterion|coverage changed/i);
  writeFileSync(phase, altered.replace('todo el proyecto', 'solo entrega'));
  task.state = 'verified'; task.verification = { evidence, executed: true };
  artifact.state = 'verified';
  const rewriteOperation = value => readFileSync(phase, 'utf8').replace(/<!-- vespi:operacion op-projection -->[\s\S]*?<!-- \/vespi:operacion op-projection -->/, block('op-projection', value));
  writeFileSync(phase, rewriteOperation(artifact));
  const distilled = await distillCriterion(artifact, { root, taskId: 't1', content: 'La entrega requiere criterio observado.', acceptedBy: 'fixture', words: 'Aceptado como criterio de producto.', limit: 'Solo fixture local.' });
  writeFileSync(phase, rewriteOperation(distilled));
  assert.equal(assertExecuted(distilled, distilled.tasks[0], evidence).completed, true,
    'destilar criterio desde el productor no invalida la verificación previa');
  writeFileSync(saved.path, `${readFileSync(saved.path, 'utf8')}\nALTERADO`);
  assert.throws(() => assertExecuted(artifact, task, evidence), /immutable snapshot|snapshot changed/i);
});

test('recibo previo sin phaseSnapshots recupera FASES desde el input firmado y exige identidad', t => {
  const root = mkdtempSync(join(tmpdir(), 'phase-legacy-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const delivery = join(root, 'entrega.txt'), runner = join(root, 'proof.test.mjs');
  writeFileSync(delivery, 'Entrega histórica.');
  const body = "import test from 'node:test';import assert from'node:assert/strict';import{readFileSync}from'node:fs';const p=JSON.parse(readFileSync(process.env.LORE_VERIFICATION_INPUT_FILE,'utf8'));test('lee FASES',()=>assert.ok(p.sources.some(s=>s.ref==='FASES.md'&&s.content.includes('op-legacy'))));";
  writeFileSync(runner, body);
  const task = { id: 't1', state: 'reviewed', role: 'worker', question: 'Entrega histórica', done_criterion: 'Criterio de entrega', proof: 'Leer FASES', sources: ['FASES.md'],
    received: { path: delivery, root, sha256: hash('Entrega histórica.') }, review: { by: 'advisor', verdict: 'accepted', artifact_sha256: hash('Entrega histórica.') },
    proof_runner: { adapter: 'node-test', path: runner, sha256: hash(body), required_tests: ['lee FASES'] } };
  const artifact = { ...createArtifact({ goal: 'Entrega histórica', owner: 'fixture', scope: 'local', authority: { spend: [], scope: 't1' }, expected_effect: { kind: 'none' }, done: 'Criterio de entrega', roles: ['worker','advisor','verifier'], verifier: 'verifier' }), id: 'op-legacy', state: 'reviewed', tasks: [task] };
  const phase = join(root, 'FASES.md'); writeFileSync(phase, `# FASES\n${block(artifact.id, artifact)}\n`);
  const evidence = executeNodeVerification(artifact, 't1', { root });
  const legacy = structuredClone(evidence);
  delete legacy.execution_receipt.execution.phaseSnapshots;
  const { signature, ...unsigned } = legacy.execution_receipt;
  legacy.execution_receipt.signature = createHmac('sha256', readFileSync(join(homedir(), '.lore-plugin', 'verification', 'execution.key'))).update(JSON.stringify(unsigned)).digest('hex');
  assert.equal(assertExecuted(artifact, task, legacy, {historicalOnly:true}).completed, true);
  assert.equal(assertExecuted(artifact, task, legacy, {historicalOnly:true}).certifiesCurrentState, false);
  assert.throws(()=>assertExecuted(artifact, task, legacy), /historical|current state|authority/i);
  writeFileSync(phase, readFileSync(phase,'utf8').replace('"scope": "t1"','"scope": "unbounded"'));
  assert.throws(()=>assertExecuted(artifact, task, legacy), /historical|current state|authority/i);
  writeFileSync(phase, `# FASES\n${block(artifact.id,artifact)}\nChanged external authority.\n`);
  assert.throws(()=>assertExecuted(artifact, task, legacy), /historical|current state|authority/i);
  writeFileSync(phase, `# FASES\n${block(artifact.id,artifact)}\n`);
  assert.equal(assertExecuted(artifact, task, evidence).certifiesCurrentState, true);
  const t2={...structuredClone(task),id:'t2',state:'reviewed'};
  const currentArtifact={...artifact,tasks:[task,t2]};
  writeFileSync(phase, `# FASES\n${block(artifact.id,currentArtifact)}\n`);
  const currentEvidence=executeNodeVerification(currentArtifact,'t2',{root});
  t2.verification={evidence:currentEvidence};
  assert.equal(assertExecuted(currentArtifact,task,legacy).certifiesCurrentState,true,
    'a fresh authenticated receipt covering the entire same operation can attest current state separately');
  const changedAuthority={...currentArtifact,authority:{spend:[],scope:'unbounded'}};
  writeFileSync(phase,`# FASES\n${block(artifact.id,changedAuthority)}\n`);
  changedAuthority.tasks.find(t=>t.id==='t2').verification={evidence:executeNodeVerification(changedAuthority,'t2',{root})};
  assert.throws(()=>assertExecuted(changedAuthority,task,legacy),/authority|historical|changed/i,'fresh unrelated task cannot upgrade a legacy receipt across changed governing authority');
  const changedProse={...currentArtifact,tasks:[task,{...t2,verification:undefined}]};
  writeFileSync(phase,`# FASES\n${block(artifact.id,changedProse)}\nChanged external authority.\n`);
  changedProse.tasks[1].verification={evidence:executeNodeVerification(changedProse,'t2',{root})};
  assert.throws(()=>assertExecuted(changedProse,task,legacy),/prose|historical|authority/i,'fresh task cannot upgrade legacy prose changes');
  t2.verification={evidence:currentEvidence};
  writeFileSync(phase, `# FASES\n${block(artifact.id,currentArtifact)}\n`);
  writeFileSync(phase,readFileSync(phase,'utf8')+'Changed external authority.');
  assert.throws(()=>assertExecuted(currentArtifact,task,legacy),/prose|FASES|authority/i);
  writeFileSync(phase,`# FASES\n${block(artifact.id,artifact)}\n`);
  const absent = structuredClone(legacy);
  absent.execution_receipt.execution.phaseSnapshots = [];
  const { signature: oldSignature, ...empty } = absent.execution_receipt;
  absent.execution_receipt.signature = createHmac('sha256', readFileSync(join(homedir(), '.lore-plugin', 'verification', 'execution.key'))).update(JSON.stringify(empty)).digest('hex');
  assert.throws(() => assertExecuted(artifact, task, absent), /coverage|snapshot/i);
});

test('semantic packet deduplicates exact repeated data with lossless backward references',async()=>{
 const {projectVerificationPacket,restoreVerificationPacket}=await import('../skills/vespi/core/verification-execution.mjs');
 const value='Exact observed criterion and evidence. '.repeat(70);
 const original={binding:{question:value},sources:[{ref:'primary',content:value},{ref:'independent',content:'different exact source'}],unknown:{preserved:value}};
 const projected=projectVerificationPacket(original);
 assert.ok(Buffer.byteLength(JSON.stringify(projected))<Buffer.byteLength(JSON.stringify(original)));
 assert.deepEqual(restoreVerificationPacket(projected),original);
 assert.throws(()=>projectVerificationPacket({a:{$vespiPacketRef:'/a'}}),/reserved/);
 assert.throws(()=>restoreVerificationPacket({a:{$vespiPacketRef:'/missing'}}),/missing/);
});

test('transport preserves exact projected FASES text while avoiding double JSON escaping',async()=>{
 const {projectVerificationPacket,restoreVerificationPacket}=await import('../skills/vespi/core/verification-execution.mjs');
 const originalPhase=block('op-transport',{state:'reviewed',authority:{scope:'local only'},unknown:Array.from({length:100},(_,i)=>({id:'entry-'+i,value:'Exact unique criterion '+i}))});
 const projected=projectOwnFases(originalPhase);
 const packet={sources:[{ref:'FASES.md',content:projected.content}],binding:{scope:'local only'}};
 const compact=projectVerificationPacket(packet);
 assert.deepEqual(restoreVerificationPacket(compact),packet);
 assert.ok(Buffer.byteLength(JSON.stringify(compact))<Buffer.byteLength(JSON.stringify(packet)));
 assert.throws(()=>projectVerificationPacket({a:{$vespiPacketJsonText:[]}}),/reserved/);
});

test('transport references address actual RFC6901 paths inside JSON text encoding',async()=>{
 const {projectVerificationPacket,restoreVerificationPacket}=await import('../skills/vespi/core/verification-execution.mjs');
 const repeated={criterion:'Exact portable criterion. '.repeat(15)};
 const projected=projectOwnFases(block('op-pointer',{state:'reviewed',unknown:repeated}));
 const packet={sources:[{ref:'FASES.md',content:projected.content}],later:repeated};
 const compact=projectVerificationPacket(packet);
 const refs=[];
 const walk=value=>{if(value&&typeof value==='object'){if(Object.hasOwn(value,'$vespiPacketRef'))refs.push(value.$vespiPacketRef);else Object.values(value).forEach(walk);}};
 walk(compact);assert.ok(refs.length>0);
 for(const ref of refs){let value=compact;for(const key of ref.slice(1).split('/').map(k=>k.replace(/~1/g,'/').replace(/~0/g,'~'))){assert.ok(value&&Object.hasOwn(value,key),'reference must address existing field: '+ref);value=value[key];}}
 assert.deepEqual(restoreVerificationPacket(compact),packet);
});

test('legacy without governed FASES is historical only and cannot claim current state',t=>{
 const root=mkdtempSync(join(tmpdir(),'legacy-no-fases-'));t.after(()=>rmSync(root,{recursive:true,force:true}));
 const delivery=join(root,'delivery.txt'),runner=join(root,'proof.test.mjs');writeFileSync(delivery,'Historical local delivery.');
 const body="import test from'node:test';import assert from'node:assert/strict';test('local delivery',()=>assert.ok(true));";writeFileSync(runner,body);
 const task={id:'t1',state:'reviewed',question:'Local delivery',done_criterion:'Local assertion only',proof:'local delivery',sources:[],received:{path:delivery,root,sha256:hash(readFileSync(delivery))},review:{by:'advisor',verdict:'accepted',artifact_sha256:hash(readFileSync(delivery))},proof_runner:{adapter:'node-test',path:runner,sha256:hash(body),required_tests:['local delivery']}};
 const artifact={...createArtifact({goal:'Historical delivery',owner:'fixture',scope:'local',authority:{spend:[],scope:'local'},expected_effect:{kind:'none'},done:'Local assertion only',roles:['worker','advisor','verifier'],verifier:'verifier'}),id:'op-no-phase',state:'reviewed',tasks:[task]};
 const legacy=executeNodeVerification(artifact,'t1',{root});delete legacy.execution_receipt.execution.phaseSnapshots;
 const {signature,...unsigned}=legacy.execution_receipt;legacy.execution_receipt.signature=createHmac('sha256',readFileSync(join(homedir(),'.lore-plugin','verification','execution.key'))).update(JSON.stringify(unsigned)).digest('hex');
 assert.equal(assertExecuted(artifact,task,legacy,{historicalOnly:true}).certifiesCurrentState,false);
 assert.throws(()=>assertExecuted(artifact,task,legacy),/historical|current state|authority/i);
});
