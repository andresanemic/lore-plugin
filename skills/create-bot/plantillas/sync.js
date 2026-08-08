#!/usr/bin/env node
/**
 * Sincroniza el Lore del ecosistema hacia el repo del bot, y genera con el MISMO manifiesto
 * la tabla de enrutamiento que el bot consulta.
 *
 *   node scripts/sync.js            → copia + regenera lore/enrutamiento.md
 *   node scripts/sync.js --revisar  → no escribe nada; solo informa qué falta y qué cambió
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
  let n = 0, ausentes = [];

  for (const pieza of piezas) {
    const origen = pieza === '.' ? base : path.join(base, pieza);
    if (!fs.existsSync(origen)) { ausentes.push(pieza); continue; }
    n += copiar(origen, pieza === '.' ? path.join(DESTINO, f.destino)
                                      : path.join(DESTINO, f.destino, pieza));
  }

  total += n;
  if (ausentes.length) faltantes++;
  informe.push({ ...f, n, ausentes });
}

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
console.log(`\n${revisar ? '(revisión, no se escribió nada) ' : ''}${total} archivos · ` +
            `${fuentes.length - faltantes}/${fuentes.length} fuentes completas`);
if (!revisar) console.log(`Tabla de enrutamiento → lore/enrutamiento.md`);
