#!/usr/bin/env node
/**
 * Valida el frontmatter de todas las skills de un plugin antes de empaquetarlo.
 *
 *   node scripts/validar.js              → informa; sale 1 si algo está mal
 *   node scripts/validar.js --arreglar   → corrige lo corregible y vuelve a validar
 *   node …/plantillas/validar.js <ruta>  → valida el repo en <ruta> (raíz explícita)
 *
 * ── Por qué existe ────────────────────────────────────────────────────────
 * Los tres fallos que cubre son SILENCIOSOS: el plugin instala sin error, la skill aparece
 * en el listado, y simplemente nunca se dispara. No hay mensaje que diga qué pasó, así que
 * sin esta verificación el problema se descubre semanas después, en la máquina de otro.
 *
 *   1. `: ` (dos puntos + espacio) dentro de la description. Es un escalar YAML plano: esa
 *      secuencia se lee como separador clave/valor y parte la description en dos.
 *   2. description de más de 1024 caracteres — se descarta entera.
 *   3. description partida en varias líneas — solo se lee la primera.
 *
 * Solo stdlib de Node. Sirve para cualquier plugin con skills/<nombre>/SKILL.md.
 */

const fs   = require('fs');
const path = require('path');

// Por defecto la raíz es el repo que contiene scripts/. Un argumento posicional la cambia, para
// poder validar otro repo sin duplicar este archivo (así el propio kit se valida a sí mismo).
const arg  = process.argv.slice(2).find(a => !a.startsWith('--'));
const RAIZ = arg ? path.resolve(arg) : path.join(__dirname, '..');
const SKILLS    = path.join(RAIZ, 'skills');
const MAX_DESC  = 1024;
const arreglar  = process.argv.includes('--arreglar');

/** Separa el frontmatter YAML del cuerpo. Devuelve null si no hay. */
function leerFrontmatter(texto) {
  const m = texto.match(/^---\r?\n([\s\S]*?)\r?\n---(\r?\n|$)/);
  return m ? { crudo: m[1], fin: m[0].length } : null;
}

/** Los problemas de `description` que se pueden corregir sin decidir nada. */
function corregir(desc) {
  return desc
    .replace(/\r?\n\s*/g, ' ')   // multilínea → una línea
    .replace(/:\s/g, ' — ')      // el separador que rompe el escalar
    .replace(/\s+/g, ' ')
    .trim();
}

function revisar() {
  if (!fs.existsSync(SKILLS)) {
    console.error(`✗ no existe ${path.relative(RAIZ, SKILLS)}/`);
    return 1;
  }

  const carpetas = fs.readdirSync(SKILLS, { withFileTypes: true })
    .filter(e => e.isDirectory()).map(e => e.name);
  if (!carpetas.length) { console.error('✗ no hay skills'); return 1; }

  let fallos = 0, corregidos = 0;

  for (const nombre of carpetas) {
    const archivo = path.join(SKILLS, nombre, 'SKILL.md');
    const problemas = [];

    if (!fs.existsSync(archivo)) {
      console.log(`✗ ${nombre.padEnd(18)} sin SKILL.md`);
      fallos++;
      continue;
    }

    let texto = fs.readFileSync(archivo, 'utf8');
    const fm = leerFrontmatter(texto);
    if (!fm) {
      console.log(`✗ ${nombre.padEnd(18)} frontmatter ausente o mal cerrado`);
      fallos++;
      continue;
    }

    const nom = (fm.crudo.match(/^name:[ \t]*(.+)$/m) || [])[1]?.trim();
    // Captura hasta la próxima clave de nivel raíz — así detecta la description multilínea.
    // SIN la flag `m`: con ella, `$` casa en cada fin de línea y la continuación se pierde
    // en silencio, que es justo el fallo que este script existe para encontrar.
    const desc = (fm.crudo.match(/(?:^|\n)description:[ \t]*([\s\S]*?)(?=\n[a-zA-Z_-]+:|$)/) || [])[1];

    if (!nom)               problemas.push('falta `name`');
    else if (nom !== nombre) problemas.push(`\`name: ${nom}\` ≠ carpeta \`${nombre}\``);

    if (desc === undefined || !desc.trim()) {
      problemas.push('falta `description`');
    } else {
      if (/\r?\n/.test(desc.trim()))   problemas.push('description en varias líneas (solo se lee la primera)');
      if (/:\s/.test(desc))            problemas.push('`: ` dentro de la description (rompe el escalar YAML)');
      if (desc.trim().length > MAX_DESC) problemas.push(`description de ${desc.trim().length} caracteres (máx. ${MAX_DESC})`);
    }

    // Corrección automática: solo lo determinista. El exceso de largo lo decide un humano.
    if (arreglar && desc && problemas.some(p => p.includes('`: `') || p.includes('varias líneas'))) {
      const nueva = corregir(desc);
      if (nueva.length <= MAX_DESC) {
        texto = texto.slice(0, fm.fin).replace(
          /(^|\n)description:[ \t]*[\s\S]*?(?=\n[a-zA-Z_-]+:|\n---|$)/,
          '$1description: ' + nueva
        ) + texto.slice(fm.fin);
        fs.writeFileSync(archivo, texto, 'utf8');
        corregidos++;
        continue;   // se revalida en la segunda pasada
      }
    }

    if (problemas.length) {
      console.log(`✗ ${nombre.padEnd(18)} ${problemas.join(' · ')}`);
      fallos++;
    } else {
      console.log(`✓ ${nombre.padEnd(18)} ${desc.trim().length} caracteres`);
    }
  }

  if (corregidos) {
    console.log(`\n${corregidos} corregida(s) — revalidando…\n`);
    return revisar();
  }

  console.log(fallos
    ? `\n✗ ${fallos} skill(s) con problemas. NO empaquetar.` +
      (arreglar ? '' : '\n  Prueba: node scripts/validar.js --arreglar')
    : `\n✓ ${carpetas.length} skill(s) válidas — el frontmatter carga.`);
  return fallos ? 1 : 0;
}

/* ── self-test ────────────────────────────────────────────────────────── */

if (process.argv.includes('--self-test')) {
  const assert = require('assert');
  assert.strictEqual(corregir('Uso — modo A: hace algo'), 'Uso — modo A — hace algo');
  assert.strictEqual(corregir('línea uno\n  línea dos'), 'línea uno línea dos');
  assert.ok(!/:\s/.test(corregir('a: b: c')));
  assert.ok(leerFrontmatter('---\nname: x\n---\ncuerpo'));
  assert.strictEqual(leerFrontmatter('sin frontmatter'), null);
  console.log('✓ self-test: corrección de `: `, multilínea y lectura de frontmatter — OK');
  process.exit(0);
}

process.exit(revisar());
