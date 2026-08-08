#!/usr/bin/env node
/**
 * Sincroniza el Lore del ecosistema hacia el repo del bot, y genera con el MISMO manifiesto
 * la tabla de enrutamiento que el bot consulta.
 *
 *   node scripts/sync.js             → copia + regenera lore/enrutamiento.md
 *   node scripts/sync.js --revisar   → no escribe nada; solo informa qué falta y qué cambió
 *   node scripts/sync.js --self-test → verifica el clasificador de la poda, sin tocar el disco
 *
 * Un solo origen (scripts/ecosistema.json) para la copia y para la tabla: mantenerlos como dos
 * artefactos separados garantiza que se desincronicen, y una tabla desincronizada manda al bot
 * al Lore equivocado sin avisar.
 *
 * Una sola dirección: del árbol local (la fuente viva) hacia lore-ecosistema/ (la copia que
 * viaja). NUNCA al revés — si el equipo edita la copia existen dos versiones del mismo criterio
 * y ninguna manda. La marca de tiempo del encabezado deja la desactualización a la vista en vez
 * de esconderla.
 *
 * Y no resume: la copia jamás es autoritativa sobre su fuente. Un resumen que vive junto al
 * índice de consulta empieza a competir con el original, y gana por estar más cerca.
 */

const fs   = require('fs');
const path = require('path');

const RAIZ       = path.join(__dirname, '..');
const MANIFIESTO = path.join(__dirname, 'ecosistema.json');
const DESTINO    = path.join(RAIZ, 'lore-ecosistema');
const TABLA      = path.join(RAIZ, 'lore', 'enrutamiento.md');

const revisar = process.argv.includes('--revisar');

/* ── self-test del clasificador de la poda ────────────────────────────────
 * La poda borra carpetas, así que su clasificador no puede quedar sin red.
 * No toca el disco ni necesita manifiesto: es una función pura.
 */
if (process.argv.includes('--self-test')) {
  const assert = require('assert');
  const d = ['areas/founder', 'laboratorio/transferencia', 'laboratorio/comunicacion', 'tim'];
  const casos = [
    ['areas',                      'intermedio'],  // camino hacia un destino
    ['areas/founder',              'vivo'],
    ['areas/founder/lore',         'vivo'],        // adentro de un destino
    ['areas/vieja',                'huerfano'],
    ['laboratorio',                'intermedio'],
    ['laboratorio/transferencia',  'vivo'],
    ['laboratorio/vieja',          'huerfano'],    // anidado: el nivel superior sigue vivo
    ['tim',                        'vivo'],
    ['timbre',                     'huerfano'],    // colisión de prefijo: no es 'tim'
    ['healthproof',                'huerfano'],
  ];
  for (const [rel, esperado] of casos) {
    assert.strictEqual(clasificar(rel, d), esperado, `${rel} debería ser ${esperado}`);
  }
  console.log(`✓ clasificador de poda — ${casos.length} casos`);
  process.exit(0);
}

const { raiz, nota, fuentes } = JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8'));

/* ── copia ────────────────────────────────────────────────────────────── */

const IGNORAR = new Set(['.git', 'node_modules', '.next', '.claude']);

function copiar(origen, destino) {
  const st = fs.statSync(origen);
  if (st.isDirectory()) {
    let n = 0;
    if (!revisar) fs.mkdirSync(destino, { recursive: true });
    for (const e of fs.readdirSync(origen)) {
      if (IGNORAR.has(e)) continue;
      n += copiar(path.join(origen, e), path.join(destino, e));
    }
    return n;
  }
  if (!/\.(md|txt|json)$/i.test(origen)) return 0;   // solo criterio en texto
  if (!revisar) {
    fs.mkdirSync(path.dirname(destino), { recursive: true });   // la pieza puede venir anidada
    fs.copyFileSync(origen, destino);
  }
  return 1;
}

/* ── recorrer el manifiesto ───────────────────────────────────────────── */

const informe = [];
let total = 0, faltantes = 0;

for (const f of fuentes) {
  const base = path.join(raiz, f.origen);
  const piezas = f.incluir ?? ['.'];
  const destino = path.join(DESTINO, f.destino);
  const ausentes = piezas.filter(p => !fs.existsSync(p === '.' ? base : path.join(base, p)));
  let n = 0;

  /* El destino se reconstruye, no se superpone. Cambiar `incluir` mueve los archivos DENTRO
   * del destino —de su raíz a lore/, por ejemplo— y la poda de más abajo no lo ve: clasifica
   * destinos, no piezas. Superponer dejaba dos copias del mismo criterio, que es peor que
   * ninguna: gana la que esté más cerca del índice de consulta, y nadie la eligió.
   * No se reconstruye si falta una pieza: ahí la copia anterior es lo único que queda. */
  if (!ausentes.length && !revisar && fs.existsSync(destino)) {
    fs.rmSync(destino, { recursive: true, force: true });
  }

  for (const pieza of piezas) {
    const origen = pieza === '.' ? base : path.join(base, pieza);
    if (!fs.existsSync(origen)) continue;
    n += copiar(origen, pieza === '.' ? destino : path.join(destino, pieza));
  }

  total += n;
  if (ausentes.length) faltantes++;
  informe.push({ ...f, n, ausentes });
}

/* ── podar destinos huérfanos ─────────────────────────────────────────────
 * Sacar una fuente del manifiesto son DOS pasos, y nada los ata entre sí:
 * borrarla de ecosistema.json y borrar su carpeta acá. Si solo se hace el
 * primero, la copia sobrevive y el bot la sigue leyendo — ahora sin ninguna
 * fila del enrutamiento que la explique. Es el mismo modo de falla silencioso
 * que el .gitignore del cifrado, así que el script cierra el segundo paso.
 *
 * Los destinos anidan (`laboratorio/transferencia`), así que no basta con
 * mirar el primer nivel: hay que clasificar cada entrada del árbol.
 */

function clasificar(rel, destinos) {
  if (destinos.some(d => rel === d || rel.startsWith(d + '/'))) return 'vivo';
  if (destinos.some(d => d.startsWith(rel + '/'))) return 'intermedio';
  return 'huerfano';
}

const destinos  = fuentes.map(f => f.destino.replace(/\\/g, '/').replace(/\/+$/, ''));
const huerfanos = [];

function podar(dir, rel) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const r = rel ? `${rel}/${e.name}` : e.name;
    const clase = clasificar(r, destinos);
    if (clase === 'vivo') continue;
    if (clase === 'intermedio' && e.isDirectory()) { podar(path.join(dir, e.name), r); continue; }
    huerfanos.push(r);
    if (!revisar) fs.rmSync(path.join(dir, e.name), { recursive: true, force: true });
  }
}

if (fs.existsSync(DESTINO)) podar(DESTINO, '');

/* ── tabla de enrutamiento ────────────────────────────────────────────── */

const porTipo = {};
for (const f of informe) (porTipo[f.tipo] ??= []).push(f);

const tabla = `# Enrutamiento — a qué Lore va cada tarea

> **Generado por \`scripts/sync.js\` desde \`scripts/ecosistema.json\`. No editar a mano.**
> Última sincronización: ${new Date().toISOString().slice(0, 16).replace('T', ' ')} · ${total} archivos.

La ley que gobierna esta tabla vive en la skill del bot: **se enruta por tipo de tarea, no por
nombre de proyecto.** Un proyecto puede aparecer más de una vez si tiene varios cuerpos de
criterio; decir su nombre no basta para elegir.
${nota ? `\n${nota}\n` : ''}
Cada ruta apunta a \`lore-ecosistema/\`, la copia que viaja en este repo. Si tienes el árbol
local, la **fuente viva** está en la última columna y le gana a la copia.

${Object.entries(porTipo).map(([tipo, grupo]) => `
## Tarea de ${tipo}

| Proyecto | Cuándo | Copia en el repo | Fuente viva |
|---|---|---|---|
${grupo.map(f => `| ${f.proyecto} | ${f.cuando} | \`lore-ecosistema/${f.destino}/\` | \`${f.origen}\` |`).join('\n')}`).join('\n')}

## Cuando un Lore no está

Si la copia no existe y no tienes el árbol local, se trabaja con el canon y **se declara que se
está trabajando sin ese criterio**. Nunca se inventa lo que ese Lore diría.
`;

if (!revisar) {
  fs.mkdirSync(path.dirname(TABLA), { recursive: true });
  fs.writeFileSync(TABLA, tabla, 'utf8');
}

/* ── informe ──────────────────────────────────────────────────────────── */

for (const f of informe) {
  const marca = f.ausentes.length ? '⚠' : '✓';
  console.log(`${marca} ${f.destino.padEnd(28)} ${String(f.n).padStart(3)} archivo(s)` +
              (f.ausentes.length ? `  — no encontrado: ${f.ausentes.join(', ')}` : ''));
}
for (const h of huerfanos) {
  console.log(`✗ ${h.padEnd(28)} huérfano — ya no está en el manifiesto` +
              (revisar ? ' (se borraría)' : ' — borrado'));
}

console.log(`\n${revisar ? '(revisión, no se escribió nada) ' : ''}${total} archivos · ` +
            `${fuentes.length - faltantes}/${fuentes.length} fuentes completas` +
            (huerfanos.length ? ` · ${huerfanos.length} huérfano(s)` : ''));
if (!revisar) console.log(`Tabla de enrutamiento → lore/enrutamiento.md`);
