// Copia de la referencia del revisor independiente; casos propios al final, sin heredar su veredicto.
import test from 'node:test';
import assert from 'node:assert/strict';
import { ofrecerFormaTrabajo as offer } from '../skills/vespi/ofrece-formas-trabajo.mjs';
import { readFileSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const caps = { daimon:true, advisor:true, worker:true, verifier:true };
const context = instruccion => ({ instruccion, pistas:[], motivoSinPistas:'sin criterio pertinente', catalogoSkills:[], catalogoSkillsOrigen:'fixture observado', skillsSugeridas:[] });
const payload = (instruccion, extra={}) => ({ motivo:'alcance autorizado local', tradeoff:'tiempo local', capacidades:{}, contexto:context(instruccion), ...extra });
const revision = o => { assert.equal(o.verificacion_requerida,true); assert.equal(o.revision_final,true); assert.equal(o.ruta_tecnica,'metodo-y-revision-final'); };

test('R2 predeterminado neutral sin roles es directo', () => {
  const o=offer(payload('Actualiza el título')); assert.equal(o.ruta_tecnica,'directa'); assert.equal(o.disponible,true); assert.equal(o.modalidad,'acompanada');
});

test('R3 CLI conserva preferencia real frente al payload y no cambia autoridad al recomendar', async () => {
  const root=mkdtempSync(join(tmpdir(),'l3-operation-'));
  const run=(sub,p,id)=>{
    const r=spawnSync(process.execPath,['scripts/operation-cli.mjs',sub,'--root',root,...(id?['--id',id]:[]),'--json',JSON.stringify(p)],{encoding:'utf8'});
    assert.equal(r.status,0,r.stderr); return JSON.parse(r.stdout);
  };
  try {
    const p=payload('Actualiza el título',{capacidades:caps}); const first=run('recommend',p);
    const held=run('hold',{goal:'revisión local',owner:'revisor',authority:{spend:[]},coordinacion:{modalidad:'secuencial-checkpoints',huellaContexto:first.offer.fundamento.huellaContexto,skills:[]}});
    const before=readFileSync(join(root,'FASES.md'),'utf8');
    const resumed=run('recommend',{...p,modalidad:'party-por-roles',alternativas:['acompanada'],preferencia:{mismaOperacion:true,modalidad:'party-por-roles',contextoCambioMaterial:false}},held.id);
    assert.equal(resumed.offer.modalidad,'secuencial-checkpoints');
    const changed=run('recommend',payload('Compone varios entregables',{capacidades:caps}),held.id);
    assert.equal(changed.offer.requiere_revalidacion,true); assert.equal(changed.offer.preferencia.modalidad,'secuencial-checkpoints');
    await Promise.all(Array.from({length:8},()=>new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,['scripts/operation-cli.mjs','recommend','--root',root,'--id',held.id,'--json',JSON.stringify(p)],{stdio:['ignore','pipe','pipe']});
      let out='',err=''; child.stdout.on('data',b=>out+=b); child.stderr.on('data',b=>err+=b); child.on('error',reject);
      child.on('close',code=>{try {assert.equal(code,0,err); assert.equal(JSON.parse(out).offer.modalidad,'secuencial-checkpoints'); resolve();} catch(e){reject(e);}});
    })));
    assert.equal(readFileSync(join(root,'FASES.md'),'utf8'),before);
  } finally {rmSync(root,{recursive:true,force:true});}
});

test('R1 efectos extra no se convierten en autoridad ni mutan payload', () => {
  const p=payload('Corrige una errata',{authority:{spend:['100 USD'],publish:true,files:['C:/privado']},efectos:{gasto:true,publicacion:true,acceso_archivos:true},autorizada:true});
  const before=structuredClone(p); const o=offer(p);
  assert.deepEqual(o.efectos,{gasto:false,publicacion:false,acceso_archivos:false}); assert.deepEqual(p,before); assert.equal(o.authority,undefined);
});
test('forma Party explícita en una tarea trivial conserva revisión', () => {
  const o=offer(payload('Cambia el punto final del título',{modalidad:'party-por-roles',capacidades:caps,alternativas:['acompanada'],autorizada:true}));
  assert.equal(o.modalidad,'party-por-roles'); assert.equal(o.revision_final,true);
});
test('R1 compuesta corriente recibe método y revisión', () => {
  revision(offer(payload('Integra tres informes en un documento y contrástalo con sus fuentes',{capacidades:caps})));
});
test('R1 mezcla de errata y composición no elimina revisión', () => {
  revision(offer(payload('Corrige una errata y compone varios entregables',{capacidades:caps})));
});
test('R1 falta verificador declara bloqueo y ninguna conformidad', () => {
  const o=offer(payload('Compone varios entregables')); assert.equal(o.bloqueada,true); assert.equal(o.disponible,false); assert.equal(o.conformidad,null);
});
test('R1 cambio material conserva presupuesto autoridad y operación sin mutarlos', () => {
  const preferencia={mismaOperacion:true,modalidad:'secuencial-checkpoints',contextoCambioMaterial:true,operationId:'op-r',presupuesto:9,autoridad:{spend:[]}};
  const before=structuredClone(preferencia); const o=offer(payload('Compone varios entregables',{capacidades:caps,preferencia}));
  assert.deepEqual(o.preferencia,before); assert.deepEqual(preferencia,before); assert.equal(o.requiere_revalidacion,true);
});
test('R1 mensaje automático explica razón observada y costo', () => {
  const o=offer(payload('Compone varios entregables',{capacidades:caps}));
  assert.match(o.mensaje,/verificador|revisor disponible|revisión disponible/i); assert.match(o.mensaje,/tiempo local/i);
});
test('R1 reanudación usa lenguaje corriente sin etiquetas internas', () => {
  const o=offer(payload('Compone varios entregables',{capacidades:caps,modalidad:'acompanada',preferencia:{mismaOperacion:true,modalidad:'party-por-roles',contextoCambioMaterial:false}}));
  assert.doesNotMatch(o.mensaje,/party|skills|checkpoints|TDD|SDD/i);
});
test('R1 tipos hostiles rechazan contexto inválido sin contaminar prototipo', () => {
  for(const contexto of [[],false,1,'texto',{instruccion:4}]) assert.throws(()=>offer(payload('x',{contexto})));
  const p=JSON.parse('{"__proto__":{"verifier":true},"motivo":"local","tradeoff":"tiempo","contexto":null}');
  const o=offer(p); assert.equal(o.verificacion_requerida,false); assert.equal({}.verifier,undefined);
});
test('R1 capacidades heredadas no acreditan roles observados', () => {
  const o=offer(payload('Compone varios entregables',{capacidades:Object.create(caps)}));
  assert.equal(o.bloqueada,true);
});
test('R1 cadenas grandes mantienen resultado y tiempo acotado', () => {
  const start=performance.now(); const o=offer(payload('x'.repeat(1000000)+' compone varios entregables',{capacidades:caps,motivo:'!'.repeat(1000000)+'x'}));
  revision(o); assert.ok(performance.now()-start<2000);
});
test('R1 pregunta crítica y exploración en recommend no escriben ni ejecutan', () => {
  const root=mkdtempSync(join(tmpdir(),'l3-review-'));
  try { for(const instruction of ['¿Por qué falló la entrega? Diagnostica sin reescribir.','Exploremos candidatos; no apruebes ni ejecutes.']) {
    const run=spawnSync(process.execPath,['scripts/operation-cli.mjs','recommend','--root',root,'--json',JSON.stringify(payload(instruction))],{encoding:'utf8'});
    assert.equal(run.status,0,run.stderr); assert.deepEqual(JSON.parse(run.stdout).offer.efectos,{gasto:false,publicacion:false,acceso_archivos:false}); assert.deepEqual(readdirSync(root),[]);
  } } finally {rmSync(root,{recursive:true,force:true});}
});
test('R1 contrato de interpelación y exploración explícito', () => {
  const skill=readFileSync('skills/vespi/SKILL.md','utf8'); assert.match(skill,/critical question after failure diagnoses only/i); assert.match(skill,/exploration yields candidates, never approval or execution/i);
});
test('R3 rol ausente no cambia preferencia vigente silenciosamente', () => {
  const preferencia={mismaOperacion:true,modalidad:'party-por-roles',contextoCambioMaterial:false};
  const o=offer(payload('Compone varios entregables',{preferencia,capacidades:{verifier:true},alternativas:['acompanada']}));
  assert.equal(o.modalidad,preferencia.modalidad,'conservar modo o bloquear declarando su ausencia');
});
test('R3 fallback no afirma reanudación de una modalidad distinta', () => {
  const o=offer(payload('Compone varios entregables',{preferencia:{mismaOperacion:true,modalidad:'party-por-roles',contextoCambioMaterial:false},capacidades:{verifier:true},alternativas:['acompanada']}));
  assert.ok(!(o.reanudada===true && o.modalidad==='acompanada'));
});
test('R3 reanudar cambio material no oculta revalidación en mensaje', () => {
  const o=offer(payload('Compone varios entregables',{capacidades:caps,preferencia:{mismaOperacion:true,modalidad:'secuencial-checkpoints',contextoCambioMaterial:true}}));
  assert.match(o.mensaje,/revalid|revisa|cambi[oó]/i);
});
test('R3 preferencia contradice payload pero prevalece sin efectos', () => {
  const o=offer(payload('Compone varios entregables',{modalidad:'party-por-roles',capacidades:caps,alternativas:['acompanada'],preferencia:{mismaOperacion:true,modalidad:'secuencial-checkpoints',contextoCambioMaterial:false}}));
  assert.equal(o.modalidad,'secuencial-checkpoints'); assert.equal(o.reanudada,true); assert.equal(o.requiere_eleccion,false);
});
test('R3 llamadas intercaladas no comparten selección mutable', async () => {
  const p=payload('Corrige una errata'); const before=structuredClone(p);
  const results=await Promise.all(Array.from({length:60},(_,i)=>Promise.resolve().then(()=>offer(i%2?payload('Compone varios entregables',{capacidades:caps}):p))));
  for(let i=0;i<results.length;i++) assert.equal(results[i].ruta_tecnica,i%2?'metodo-y-revision-final':'directa'); assert.deepEqual(p,before);
});

test('R1 conservative signals cover common wording and another language', () => {
  for (const instruction of [
    'Combina dos notas para producir una sintesis y comparala con las fuentes.',
    'Combine the three reports into one brief and check it against their sources.',
    'Compare two reports against their sources and publish a consolidated summary.',
  ]) revision(offer(payload(instruction, { capacidades: caps })));
  revision(offer(payload("Change punctuation in the title", { capacidades: caps, efectos: { publicacion: true } })));
});

test('R3 inherited capabilities do not count as observed roles', () => {
  const o = offer(payload('Combine three reports and verify the final summary', {
    modalidad: 'party-por-roles', capacidades: Object.create(caps), alternativas: ['acompanada'],
  }));
  assert.equal(o.disponible, false);
  assert.ok(o.capacidades_faltantes.includes('daimon'));
  assert.ok(o.capacidades_faltantes.includes('verifier'));
});

test('R2 viable alternative is offered without replacing the saved preference', () => {
  const preferencia = { mismaOperacion: true, modalidad: 'party-por-roles', contextoCambioMaterial: false };
  const o = offer(payload('Combine three reports and verify the final summary', {
    preferencia, capacidades: { verifier: true }, alternativas: ['acompanada'],
  }));
  assert.equal(o.disponible, false);
  assert.equal(o.modalidad, preferencia.modalidad);
  assert.deepEqual(o.preferencia, preferencia);
  assert.notEqual(o.reanudada, true);
  assert.ok(o.alternativas.includes('acompanada'));
  assert.match(o.mensaje, /investigaci.n|asesor.a|ejecuci.n/i);
});

test('una modalidad explícita no se reescribe en una edición trivial', () => {
  const o = offer(payload('Change the final punctuation in the title', {
    modalidad: 'party-por-roles', capacidades: caps, alternativas: ['acompanada'],
  }));
  assert.equal(o.modalidad, 'party-por-roles');
  assert.equal(o.revision_final, true);
});

test('R4 invalid saved mode still reports material revalidation', () => {
  const o = offer(payload('Combine several reports and review each result', {
    capacidades: caps,
    preferencia: { mismaOperacion: true, modalidad: 'unknown-mode', contextoCambioMaterial: true },
  }));
  assert.equal(o.requiere_revalidacion, true);
  assert.match(o.mensaje, /modalidad anterior era la modalidad guardada/i);
});

import { generarPreguntasIniciales, crearPreguntaDeModalidad } from '../skills/vespi/preguntas-coordinador.mjs';

test('R7 composición breve de dos fuentes exige revisión', () => {
  for (const instruction of ['Unifica el informe con la carta', 'Coteja el informe contra la fuente', 'Resume cada capítulo del libro']) {
    const o = offer(payload(instruction, { capacidades: caps }));
    assert.equal(o.revision_final, true, JSON.stringify({ instruction, ...o }));
  }
});

test('R7 trivial con plural gramatical no selecciona Party', () => {
  for (const instruction of ['Cambia las comillas del título', 'Borra los espacios del título']) {
    const o = offer(payload(instruction, { capacidades: caps }));
    assert.equal(o.modalidad, 'acompanada', JSON.stringify(o));
  }
});

test('R8 oferta automática llega al consumidor de preguntas', () => {
  const o = offer(payload('Renombra el título', { capacidades: caps }));
  assert.equal(o.requiere_eleccion, false);
  assert.doesNotThrow(() => generarPreguntasIniciales({ tarea: 'Renombra el título', ofertaModalidad: o }));
});

test('R9 cambio de efectos exige revalidación en la operación guardada', () => {
  const root = mkdtempSync(join(tmpdir(), 'l3-effects-'));
  const run = (sub, p, id) => {
    const r = spawnSync(process.execPath, ['scripts/operation-cli.mjs', sub, '--root', root, ...(id ? ['--id', id] : []), '--json', JSON.stringify(p)], { encoding: 'utf8' });
    assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout);
  };
  try {
    const p = payload('Renombra el título', { capacidades: caps });
    const initial = run('recommend', p).offer;
    const held = run('hold', { goal: 'revisión', owner: 'revisor', authority: { spend: [] }, coordinacion: { modalidad: initial.modalidad, huellaContexto: initial.fundamento.huellaContexto, skills: [] } });
    const before = readFileSync(join(root, 'FASES.md'), 'utf8');
    const next = run('recommend', { ...p, efectos: { publicacion: true } }, held.id).offer;
    assert.equal(readFileSync(join(root, 'FASES.md'), 'utf8'), before);
    assert.equal(next.requiere_revalidacion, true, JSON.stringify(next));
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('R10 reanudación explica la revisión requerida', () => {
  const o = offer(payload('Reúne evidencia para elaborar la entrega final y exige revisión', { capacidades: caps,
    preferencia: { mismaOperacion: true, modalidad: 'acompanada', contextoCambioMaterial: false } }));
  assert.equal(o.revision_final, true);
  assert.match(o.mensaje, /revisi[oó]n final/i, JSON.stringify(o));
});

test('R10 bloqueo por roles enumera ausencias y cambio material', () => {
  const o = offer(payload('Prepara la entrega completa y exige una revisión final', { capacidades: {},
    preferencia: { mismaOperacion: true, modalidad: 'party-por-roles', contextoCambioMaterial: true } }));
  assert.equal(o.bloqueada, true);
  assert.match(o.mensaje, /investigaci[oó]n|asesor[ií]a|ejecuci[oó]n/i);
  assert.match(o.mensaje, /revalid|revisa|cambi[oó]/i);
});

test('R11 prototipo global no acredita capacidades propias', () => {
  const previous = Object.getOwnPropertyDescriptor(Object.prototype, 'verifier');
  try {
    Object.defineProperty(Object.prototype, 'verifier', { value: true, configurable: true, enumerable: false });
    const o = offer(payload('Elabora una entrega con revisión final y contraste', { capacidades: {} }));
    assert.equal(o.disponible, false, JSON.stringify(o));
    assert.equal(o.bloqueada, true);
  } finally {
    if (previous) Object.defineProperty(Object.prototype, 'verifier', previous);
    else delete Object.prototype.verifier;
  }
});

test('R12 preferencia no disponible no vuelve a ofrecerse como elección viable', () => {
  const o = offer(payload('Prepara la entrega completa y exige una revisión final', { capacidades: { verifier: true }, alternativas: ['acompanada'],
    preferencia: { mismaOperacion: true, modalidad: 'party-por-roles', contextoCambioMaterial: false } }));
  assert.equal(o.disponible, false);
  const question = crearPreguntaDeModalidad(o);
  assert.ok(!question.valores.includes('party-por-roles'), JSON.stringify(question));
});

test('R7 plurales descriptivos en español e inglés siguen siendo una sola entrega', () => {
  for (const instruction of ['Cambia las comillas del título', 'Change the section titles']) {
    const o = offer(payload(instruction, { capacidades: caps }));
    assert.equal(o.modalidad, 'acompanada');
    assert.equal(o.ruta_tecnica, 'directa');
  }
});

test('R7 el metadato de fuentes, entregables y acciones fuerza revisión por conteo', () => {
  const o = offer(payload('Edita el borrador', { capacidades: caps, contexto: {
    ...context('Edita el borrador'), fuentes: ['informe', 'carta'], entregables: ['informe final'], acciones: ['unificar'],
  } }));
  assert.equal(o.revision_final, true);
});

test('R13 alcance desconocido requiere revisión salvo edición textual acotada', () => {
  for (const instruction of ['Prepara una propuesta', 'Corrige el título y resume tres informes']) {
    const o = offer(payload(instruction, { capacidades: caps }));
    assert.equal(o.revision_final, true, JSON.stringify({ instruction, ...o }));
  }
  for (const instruction of ['Cambia las comillas del título', 'Change the final punctuation in the title']) {
    const o = offer(payload(instruction, { capacidades: caps }));
    assert.equal(o.ruta_tecnica, 'directa', JSON.stringify({ instruction, ...o }));
    assert.equal(o.modalidad, 'acompanada');
  }
});

test('R13 alcance estructurado completo conserva revisión: no acredita coherencia', () => {
  const instruccion = 'Actualiza el borrador';
  const completo = offer(payload(instruccion, { capacidades: caps, contexto: {
    ...context(instruccion), fuentes: ['borrador'], entregables: ['borrador actualizado'], acciones: ['actualizar'],
  } }));
  assert.equal(completo.verificacion_requerida, true);
  assert.equal(completo.ruta_tecnica, 'metodo-y-revision-final');
  const parcial = offer(payload(instruccion, { capacidades: caps, contexto: {
    ...context(instruccion), fuentes: ['borrador'],
  } }));
  assert.equal(parcial.revision_final, true);
});

test('R14 metadata declarada no sustituye el permiso textual finito para trabajo directo', () => {
  const scope = { fuentes: ['borrador'], entregables: ['borrador actualizado'], acciones: ['actualizar'] };
  for (const instruction of ['Integra tres informes', 'Corrige el título y resume tres informes', 'Resume el borrador y publica el resultado']) {
    const o = offer(payload(instruction, { capacidades: caps, contexto: { ...context(instruction), ...scope } }));
    assert.equal(o.verificacion_requerida, true, JSON.stringify({ instruction, ...o }));
    assert.equal(o.revision_final, true);
    assert.equal(o.ruta_tecnica, 'metodo-y-revision-final');
  }
  for (const metadata of [
    { fuentes: ['borrador'] }, { fuentes: ['borrador'], acciones: ['actualizar'] },
    { fuentes: ['borrador'], entregables: ['actualizado'] },
    { fuentes: [], entregables: [], acciones: [] },
    { fuentes: ['borrador'], entregables: ['actualizado'], acciones: ['resumir y publicar'] },
  ]) {
    const instruction = 'Actualiza el borrador';
    const o = offer(payload(instruction, { capacidades: caps, contexto: { ...context(instruction), ...metadata } }));
    assert.equal(o.verificacion_requerida, true, JSON.stringify({ metadata, ...o }));
  }
});

test('R14 las Pistas múltiples y la incertidumbre conservan revisión sin inferir Party', () => {
  const instruction = 'Prepara una propuesta';
  const contexto = { ...context(instruction), pistas: [
    { referencia: 'a', pertinente: true, razon: 'r', contenido: 'uno' },
    { referencia: 'b', pertinente: true, razon: 'r', contenido: 'dos' },
  ] };
  const o = offer(payload(instruction, { capacidades: caps, contexto }));
  assert.equal(o.modalidad, 'acompanada');
  assert.equal(o.ruta_tecnica, 'metodo-y-revision-final');
  assert.equal(o.revision_final, true);
});

test('R14 forma explícita y preferencia Party sobreviven la selección conservadora', () => {
  const instruction = 'Corrige el título';
  const explicit = offer(payload(instruction, { capacidades: caps, modalidad: 'party-por-roles' }));
  assert.equal(explicit.modalidad, 'party-por-roles');
  assert.equal(explicit.revision_final, true);
  const preferred = offer(payload('Prepara una propuesta', { capacidades: caps,
    preferencia: { mismaOperacion: true, modalidad: 'party-por-roles', contextoCambioMaterial: false } }));
  assert.equal(preferred.modalidad, 'party-por-roles');
  assert.equal(preferred.revision_final, true);
});

test('R9 la huella cambia al cambiar fuentes o entregables explícitos', () => {
  const first = offer(payload('Edita el borrador', { capacidades: caps, contexto: {
    ...context('Edita el borrador'), fuentes: ['informe'], entregables: ['resumen'],
  } }));
  const next = offer(payload('Edita el borrador', { capacidades: caps, contexto: {
    ...context('Edita el borrador'), fuentes: ['informe', 'carta'], entregables: ['resumen'],
  } }));
  assert.notEqual(next.fundamento.huellaContexto, first.fundamento.huellaContexto);
});

test('NUEVA efectos y claves extra no conceden autoridad', () => {
  for (const extra of [JSON.parse('{"__proto__":{"verifier":true}}'), { budget: 999, authority: { publish: true, files: ['privado'], spend: [999] }, efectos: { gasto: true, publicacion: true, acceso_archivos: true } }]) {
    const p = payload('Revisa la entrega con contraste de evidencia', { capacidades: caps, ...extra });
    const before = structuredClone(p); const o = offer(p);
    assert.deepEqual(o.efectos, { gasto: false, publicacion: false, acceso_archivos: false });
    assert.equal(o.authority, undefined); assert.deepEqual(p, before); assert.equal({}.verifier, undefined);
  }
});

test('NUEVA capacidades de tipos falsos no acreditan verificador', () => {
  for (const value of ['true', 1, [], {}, null, false]) {
    const o = offer(payload('Prepara la entrega completa y exige una revisión final', { capacidades: { verifier: value } }));
    assert.equal(o.bloqueada, true); assert.equal(o.conformidad, null);
  }
});

test('NUEVA matrices de roles nunca anuncian conformidad sin verificador', () => {
  for (let mask = 0; mask < 16; mask++) {
    const capacidades = Object.fromEntries(Object.keys(caps).map((k, i) => [k, !!(mask & (1 << i))]));
    const o = offer(payload('Integra la entrega con evidencia y revisa el resultado', { capacidades }));
    assert.equal(o.conformidad, null);
    if (!capacidades.verifier) { assert.equal(o.bloqueada, true); assert.equal(o.revision_final, false); }
    else assert.equal(o.revision_final, true);
  }
});

test('NUEVA interpelación distinta y exploración no persisten ni producen efectos', () => {
  const root = mkdtempSync(join(tmpdir(), 'l3-dialogo-'));
  try {
    for (const instruction of ['¿De dónde salió ese resultado equivocado?', 'Pensemos qué enfoque podría servir antes de decidir']) {
      const r = spawnSync(process.execPath, ['scripts/operation-cli.mjs', 'recommend', '--root', root, '--json', JSON.stringify(payload(instruction, { capacidades: caps }))], { encoding: 'utf8' });
      assert.equal(r.status, 0, r.stderr); const o = JSON.parse(r.stdout).offer;
      assert.deepEqual(o.efectos, { gasto: false, publicacion: false, acceso_archivos: false });
      assert.equal(o.conformidad, null); assert.deepEqual(readdirSync(root), []);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('NUEVA cambio material exige elección antes de continuar', () => {
  const o = offer(payload('Integra la entrega con evidencia y revisa el resultado', { capacidades: caps,
    preferencia: { mismaOperacion: true, modalidad: 'secuencial-checkpoints', contextoCambioMaterial: true } }));
  assert.equal(o.requiere_revalidacion, true);
  assert.equal(o.requiere_eleccion, true);
  assert.match(o.mensaje, /revisa|revalid|cambi[oó]/i);
});
