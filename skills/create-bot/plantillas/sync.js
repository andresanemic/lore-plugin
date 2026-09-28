#!/usr/bin/env node
/**
 * Genera, desde un solo manifiesto, las dos cosas que el bot necesita para trabajar en varios
 * proyectos a la vez: la TABLA de enrutamiento que consulta y el ACCESO a sus árboles vivos.
 *
 *   node scripts/sync.js             → regenera la tabla y el acceso local
 *   node scripts/sync.js --revisar   → no escribe nada; solo informa qué falta y qué cambiaría
 *
 * Un solo origen (scripts/ecosistema.json) para todo: mantenerlos como artefactos separados
 * garantiza que se desincronicen, y una tabla desincronizada manda al bot al Lore equivocado
 * sin avisar.
 *
 * POR PUNTEROS, NUNCA POR COPIA. El bot APUNTA a cada Lore donde vive, y quien lo abre lo alcanza
 * porque el acceso salió del mismo manifiesto. No hay segunda versión de nada, que es la regla del
 * resto del kit: un proyecto referencia los módulos de su área, no los duplica.
 *
 * La copia `lore-ecosistema/` salió del kit en 2.4.9. Este script ya no la escribe ni la poda: una
 * carpeta que exista de una versión anterior se queda donde está, intacta, y `transmute-lore`
 * CRYSTALLIZE la sigue leyendo y viajando. Quien comparte trabajo con otras personas usa un
 * repositorio compartido.
 */

const fs   = require('fs');
const path = require('path');

const RAIZ       = path.join(__dirname, '..');
const MANIFIESTO = path.join(__dirname, 'ecosistema.json');
const TABLA      = path.join(RAIZ, 'lore', 'enrutamiento.md');

const revisar = process.argv.includes('--revisar');

const { raiz, nota, fuentes } = JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8'));

/* ── recorrer el manifiesto ───────────────────────────────────────────── */

const informe = [];
let faltantes = 0;

for (const f of fuentes) {
  const base = path.join(raiz, f.origen);
  const piezas = f.incluir ?? ['.'];
  const ausentes = piezas.filter(p => !fs.existsSync(p === '.' ? base : path.join(base, p)));
  if (ausentes.length) faltantes++;
  informe.push({ ...f, ausentes });
}

/* ── tabla de enrutamiento ────────────────────────────────────────────── */

const porTipo = {};
for (const f of informe) (porTipo[f.tipo] ??= []).push(f);

/* Dónde se define el comportamiento del bot depende de si está empaquetado, y el bot SIN
 * empaquetar es el caso por defecto: ahí no hay skill y la ley vive en su contrato. Nombrar
 * «la skill» siempre mandaba al lector, en el caso más común, a un archivo que no existe. */
const contrato = fs.existsSync(path.join(RAIZ, 'CLAUDE.md')) ? '`CLAUDE.md`' : '`AGENTS.md`';
const LEY = fs.existsSync(path.join(RAIZ, 'skills')) ? 'la skill del bot' : `el ${contrato} del bot`;

const tabla = `# Enrutamiento — a qué Lore va cada tarea

> **Generado por \`scripts/sync.js\` desde \`scripts/ecosistema.json\`. No editar a mano.**
> Última generación: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}.

La ley que gobierna esta tabla vive en ${LEY}: **se enruta por tipo de tarea, no por
nombre de proyecto.** Un proyecto puede aparecer más de una vez si tiene varios cuerpos de
criterio; decir su nombre no basta para elegir.
${nota ? `\n${nota}\n` : ''}
Cada fila es un **puntero** al Lore donde vive, no una copia. Ese criterio tiene un solo
dueño y una sola versión: la de su proyecto. Se lee ahí.

${Object.entries(porTipo).map(([tipo, grupo]) => `
## Tarea de ${tipo}

| Proyecto | Cuándo | Dónde vive su Lore |
|---|---|---|
${grupo.map(f => `| ${f.proyecto} | ${f.cuando} | \`${f.origen}\` |`).join('\n')}`).join('\n')}

## Cuando un Lore no está

Si el puntero no resuelve —el árbol no está en esta máquina—, se trabaja con el canon y **se
declara que se está trabajando sin ese criterio**. Nunca se inventa lo que ese Lore diría.
`;

if (!revisar) {
  fs.mkdirSync(path.dirname(TABLA), { recursive: true });
  const sinFecha = texto => texto.replace(/^> Última generación:.*\r?$/m, '');
  const anterior = fs.existsSync(TABLA) ? fs.readFileSync(TABLA, 'utf8') : '';
  if (sinFecha(anterior) !== sinFecha(tabla)) fs.writeFileSync(TABLA, tabla, 'utf8');
}

/* ── acceso a los árboles vivos ───────────────────────────────────────────
 * Un bot TRABAJA en los proyectos, no solo consulta su criterio, y la sesión
 * solo alcanza la carpeta donde se abre. Sin esto el bot cita bien y no puede
 * editar nada: responde preguntas, que es exactamente lo que un bot no es.
 *
 * Sale del mismo manifiesto que la tabla: las rutas se escriben UNA vez, en `origen`.
 * Escribirlas también a mano en un settings garantiza que se desincronicen, y la que se queda
 * vieja falla sin decir por qué.
 *
 * Pero se DECLARA, no se infiere: solo las fuentes con `"trabajo": true`. Y lo que
 * decide ese valor es una CONDICIÓN, no el tipo de fila: ¿queda algún proyecto de
 * esta carpeta fuera del alcance? Si queda —el caso normal de un área— va apagado:
 * su carpeta contiene todos sus proyectos, incluidos los que el alcance dejó fuera,
 * y conceder el origen abriría por la puerta del acceso lo que el alcance cerró.
 * Si no queda ninguno —un bot que federa un área entera— la premisa es falsa y el
 * área sí lo lleva, con su `motivo` escrito en la fila del manifiesto.
 *
 * Local y no versionado, igual que `raiz`: son rutas de esta máquina. Quien comparte
 * trabajo con otra persona comparte el repositorio, y ahí estas rutas ya existen.
 */
const AJUSTES = path.join(RAIZ, '.claude', 'settings.local.json');
const vivos = [...new Set(fuentes.filter(f => f.trabajo).map(f => path.join(raiz, f.origen)))]
  .filter(d => fs.existsSync(d))
  .map(d => d.replace(/\\/g, '/'));

if (!revisar) {
  fs.mkdirSync(path.dirname(AJUSTES), { recursive: true });
  const previo = fs.existsSync(AJUSTES) ? JSON.parse(fs.readFileSync(AJUSTES, 'utf8')) : {};
  previo.permissions = { ...previo.permissions, additionalDirectories: vivos };
  fs.writeFileSync(AJUSTES, JSON.stringify(previo, null, 2) + '\n', 'utf8');
}

/* ── informe ──────────────────────────────────────────────────────────── */

for (const f of informe) {
  const marca = f.ausentes.length ? '⚠' : '✓';
  console.log(`${marca} ${f.proyecto.padEnd(28)} → ${f.origen}` +
              (f.ausentes.length ? `  — no encontrado: ${f.ausentes.join(', ')}` : ''));
}

console.log(`\n${revisar ? '(revisión, no se escribió nada) ' : ''}` +
            `por punteros, sin copia · ` +
            `${fuentes.length - faltantes}/${fuentes.length} fuentes completas`);

if (!revisar) {
  console.log(`Tabla de enrutamiento → lore/enrutamiento.md`);
  console.log(`Acceso a los árboles vivos → .claude/settings.local.json (${vivos.length} directorio(s))`);
}
