import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('nota 2.5.1 describe el release publicado y sus fronteras de evidencia', () => {
  const note = readFileSync(new URL('../docs/RELEASE_2.5.1.md', import.meta.url), 'utf8');
  assert.match(note, /published at `v2\.5\.1`/i);
  assert.match(note, /está publicado en `v2\.5\.1`/i);
  assert.match(note, /OpenCode 2/i);
  assert.match(note, /receipts attest to recorded execution/i);
  assert.match(note, /los recibos firmados acreditan ejecución registrada/i);
  assert.match(note, /signed-JSON versus signed-XDR format difference/i);
  assert.match(note, /did not establish payment, ledger settlement or superiority/i);
  assert.match(note, /diferencia local de formato entre JSON y XDR firmados/i);
  assert.match(note, /no acreditó pago, liquidación en ledger ni superioridad/i);
  assert.doesNotMatch(note, /test fix|all gates passed|ready to publish|listo para publicar/i);
});

test('badges bilingües pertenecen al corte 2.5.2 y Claude conserva el límite de evidencia de 2.5.1',()=>{
 const readme=readFileSync(new URL('../README.md',import.meta.url),'utf8');
 assert.doesNotMatch(readme,/badge\/(?:version|versi%C3%B3n)-2\.5\.1-/);
 assert.equal((readme.match(/badge\/(?:version|versi%C3%B3n)-2\.5\.2-/g)||[]).length,2);
 const note=readFileSync(new URL('../docs/RELEASE_2.5.1.md',import.meta.url),'utf8');
 assert.match(note,/Claude[\s\S]*quota 429[\s\S]*installed bytes do not establish conversational reception/i);
 assert.match(note,/Claude[\s\S]*cuota 429[\s\S]*tener los bytes instalados no acredita recepción conversacional/i);
 assert.match(note,/No native Codex PreToolUse, PreCompact or Skill invocation is claimed/i);
 assert.match(note,/No se declara invocación nativa de PreToolUse, PreCompact ni Skill en Codex/i);
});

test('documentación vigente refleja kernel fijo y límite semántico acordados',()=>{
 const readme=readFileSync(new URL('../README.md',import.meta.url),'utf8');
 assert.match(readme,/frozen kernel 0\.1\.6/); assert.match(readme,/kernel 0\.1\.6 congelado/);
 const verification=readFileSync(new URL('../docs/VERIFICATION-EXECUTION.md',import.meta.url),'utf8'); assert.match(verification,/128,000-byte/); assert.doesNotMatch(verification,/64 KiB/);
 for(const lang of ['en','es']){const ref=readFileSync(new URL('../docs/REFERENCE_'+lang+'.md',import.meta.url),'utf8');assert.match(ref.slice(0,1200),/Lore Plugin 2\.5\.2/);assert.match(ref.slice(0,1200),/7767daa369e464b486ddf16b08b8985e59ec107d/);}
});
