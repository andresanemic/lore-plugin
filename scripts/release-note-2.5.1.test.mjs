import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('nota 2.5.1 presenta candidato y fronteras de evidencia sin declarar release terminado', () => {
  const note = readFileSync(new URL('../docs/RELEASE_2.5.1.md', import.meta.url), 'utf8');
  assert.match(note, /publication is pending/i);
  assert.match(note, /publicación pendiente/i);
  assert.match(note, /OpenCode 2/i);
  assert.match(note, /coordinator attestations/i);
  assert.match(note, /atestaciones del coordinador/i);
  assert.match(note, /signed JSON was rejected and signed XDR was accepted/i);
  assert.match(note, /not settlement, consensus or superiority/i);
  assert.match(note, /JSON firmado válido fue rechazado y XDR firmado fue aceptado/i);
  assert.match(note, /no liquidación, consenso ni superioridad/i);
  assert.doesNotMatch(note, /test fix|all gates passed|ready to publish|listo para publicar/i);
});

test('badges bilingües pertenecen al candidato 2.5.1 y Claude conserva límite de evidencia',()=>{
 const readme=readFileSync(new URL('../README.md',import.meta.url),'utf8');
 assert.doesNotMatch(readme,/badge\/(?:version|versi%C3%B3n)-2\.5\.0-/);
 assert.equal((readme.match(/badge\/(?:version|versi%C3%B3n)-2\.5\.1-/g)||[]).length,2);
 const note=readFileSync(new URL('../docs/RELEASE_2.5.1.md',import.meta.url),'utf8');
 assert.match(note,/Claude[\s\S]*weekly quota[\s\S]*compatibility remains unverified/i);
 assert.match(note,/Claude[\s\S]*límite semanal[\s\S]*compatibilidad sigue sin comprobarse/i);
 assert.match(note,/does not authorize installation or publication/i);
 assert.match(note,/(?:no|ni) autoriza instalación o publicación/i);
});

test('documentación vigente refleja kernel fijo y límite semántico acordados',()=>{
 const readme=readFileSync(new URL('../README.md',import.meta.url),'utf8');
 assert.match(readme,/frozen kernel 0\.1\.5/); assert.match(readme,/kernel 0\.1\.5 congelado/);
 const verification=readFileSync(new URL('../docs/VERIFICATION-EXECUTION.md',import.meta.url),'utf8'); assert.match(verification,/128,000-byte/); assert.doesNotMatch(verification,/64 KiB/);
 for(const lang of ['en','es']){const ref=readFileSync(new URL('../docs/REFERENCE_'+lang+'.md',import.meta.url),'utf8');assert.match(ref.slice(0,1200),/Lore Plugin 2\.5\.1/);assert.match(ref.slice(0,1200),/ed559e83c976dd6e6a379a5510db776206f670b4/);}
});
