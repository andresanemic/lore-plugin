#!/usr/bin/env node
/**
 * Genera, desde un solo manifiesto, las dos cosas que el bot necesita para trabajar en varios
 * proyectos a la vez: la TABLA de enrutamiento que consulta y el ACCESO a sus árboles vivos.
 *
 *   node scripts/sync.js             → regenera la tabla y el acceso local (+ la copia, si está)
 *   node scripts/sync.js --revisar   → no escribe nada; solo informa qué falta y qué cambiaría
 *   node scripts/sync.js --self-test → verifica el clasificador de la poda, sin tocar el disco
 *
 * Un solo origen (scripts/ecosistema.json) para todo: mantenerlos como artefactos separados
 * garantiza que se desincronicen, y una tabla desincronizada manda al bot al Lore equivocado
 * sin avisar.
 *
 * POR PUNTEROS, NO POR COPIA. Por defecto el bot APUNTA a cada Lore donde vive, y quien lo abre
 * lo alcanza porque el acceso salió del mismo manifiesto. No hay segunda versión de nada, que
 * es la regla del resto del kit: un proyecto referencia los módulos de su área, no los duplica.
 *
 * `"copia": true` enciende `lore-ecosistema/`, y sirve para UNA cosa: que el bot funcione en la
 * máquina de alguien que clonó el repo y NO tiene el árbol. Ahí el puntero no apunta a nada. Es
 * la única duplicación deliberada del kit, y se paga con tres guardarraíles —una sola dirección,
 * marca de tiempo visible, jamás resumir—: quitar cualquiera convierte la copia en una segunda
 * fuente de verdad, y gana por estar más cerca del índice de consulta.
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

const { raiz, nota, copia = false, fuentes } = JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8'));

/* ── copia — OPCIONAL, apagada por defecto ────────────────────────────── */

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
  if (copia && !ausentes.length && !revisar && fs.existsSync(destino)) {
    fs.rmSync(destino, { recursive: true, force: true });
  }

  if (copia) for (const pieza of piezas) {
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

if (copia && fs.existsSync(DESTINO)) podar(DESTINO, '');

/* Apagar la copia son DOS pasos, como encender el cifrado y como sacar una fuente: poner
 * "copia": false y borrar la carpeta. Hacer solo el primero deja una foto congelada que
 * nadie vuelve a actualizar y que el bot sigue leyendo, ahora sin marca de tiempo nueva
 * que delate su edad. El script no la borra solo —es criterio, y borrarlo sin permiso es
 * peor que el huérfano— pero no deja que pase en silencio. */
const congelada = !copia && fs.existsSync(DESTINO);

/* ── tabla de enrutamiento ────────────────────────────────────────────── */

const porTipo = {};
for (const f of informe) (porTipo[f.tipo] ??= []).push(f);

/* Dónde se define el comportamiento del bot depende de si está empaquetado, y el bot SIN
 * empaquetar es el caso por defecto: ahí no hay skill y la ley vive en su CLAUDE.md. Nombrar
 * «la skill» siempre mandaba al lector, en el caso más común, a un archivo que no existe. */
const LEY = fs.existsSync(path.join(RAIZ, 'skills')) ? 'la skill del bot' : 'el `CLAUDE.md` del bot';

const tabla = `# Enrutamiento — a qué Lore va cada tarea

> **Generado por \`scripts/sync.js\` desde \`scripts/ecosistema.json\`. No editar a mano.**
> Última generación: ${new Date().toISOString().slice(0, 16).replace('T', ' ')}${copia ? ` · ${total} archivos copiados` : ''}.

La ley que gobierna esta tabla vive en ${LEY}: **se enruta por tipo de tarea, no por
nombre de proyecto.** Un proyecto puede aparecer más de una vez si tiene varios cuerpos de
criterio; decir su nombre no basta para elegir.
${nota ? `\n${nota}\n` : ''}
${copia
  ? `**Antes de leer una fila, comprueba su fuente viva.** Si esa ruta existe en esta máquina, se
lee **ahí** y la copia **no se abre**: es la misma criatura dos veces, y leer las dos es la
duplicación que esta tabla existe para evitar. La copia es para la máquina donde la fuente viva
no está — se abre solo cuando la comprobación falla, y entonces se dice que se está leyendo una
foto, con su fecha.

> La comprobación se hace por fila y en el momento, nunca de memoria: esta tabla se generó en la
> máquina de quien corrió \`sync.js\`, y lo que ahí resolvía puede no existir acá. A medida que
> alguien va teniendo las carpetas de verdad, sus filas dejan de leerse de la copia solas.`
  : `Cada fila es un **puntero** al Lore donde vive, no una copia. Ese criterio tiene un solo
dueño y una sola versión: la de su proyecto. Se lee ahí.`}

${Object.entries(porTipo).map(([tipo, grupo]) => `
## Tarea de ${tipo}

${copia ? `| Proyecto | Cuándo | 1º — fuente viva | 2º — copia, si la de arriba no está |
|---|---|---|---|
${grupo.map(f => `| ${f.proyecto} | ${f.cuando} | \`${f.origen}\` | \`lore-ecosistema/${f.destino}/\` |`).join('\n')}`
        : `| Proyecto | Cuándo | Dónde vive su Lore |
|---|---|---|
${grupo.map(f => `| ${f.proyecto} | ${f.cuando} | \`${f.origen}\` |`).join('\n')}`}`).join('\n')}

## Cuando un Lore no está

${copia
  ? `Si fallan las dos —ni fuente viva ni copia—, se trabaja con el canon y **se declara que se
está trabajando sin ese criterio**. Nunca se inventa lo que ese Lore diría.`
  : `Si el puntero no resuelve —el árbol no está en esta máquina—, se trabaja con el canon y **se
declara que se está trabajando sin ese criterio**. Nunca se inventa lo que ese Lore diría.`}
`;

if (!revisar) {
  fs.mkdirSync(path.dirname(TABLA), { recursive: true });
  fs.writeFileSync(TABLA, tabla, 'utf8');
}

/* ── acceso a los árboles vivos ───────────────────────────────────────────
 * Un bot TRABAJA en los proyectos, no solo consulta su criterio, y la sesión
 * solo alcanza la carpeta donde se abre. Sin esto el bot cita bien y no puede
 * editar nada: responde preguntas, que es exactamente lo que un bot no es.
 *
 * Sale del mismo manifiesto que la copia, la tabla y la poda: las rutas se
 * escriben UNA vez, en `origen`. Escribirlas también a mano en un settings
 * garantiza que se desincronicen, y la que se queda vieja falla sin decir por qué.
 *
 * Pero se DECLARA, no se infiere: solo las fuentes con `"trabajo": true`. Y lo que
 * decide ese valor es una CONDICIÓN, no el tipo de fila: ¿queda algún proyecto de
 * esta carpeta fuera del alcance? Si queda —el caso normal de un área— va apagado:
 * su carpeta contiene todos sus proyectos, incluidos los que el alcance dejó fuera,
 * y conceder el origen abriría por la puerta del acceso lo que el alcance cerró.
 * Si no queda ninguno —un bot que federa un área entera— la premisa es falsa y el
 * área sí lo lleva, con su `motivo` escrito en la fila del manifiesto.
 *
 * Local y no versionado, igual que `raiz`: son rutas de esta máquina. Quien
 * clona el repo sin el árbol no las tiene, y para eso existe lore-ecosistema/.
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
  console.log(`${marca} ${f.destino.padEnd(28)} ${copia ? `${String(f.n).padStart(3)} archivo(s)` : `→ ${f.origen}`}` +
              (f.ausentes.length ? `  — no encontrado: ${f.ausentes.join(', ')}` : ''));
}
for (const h of huerfanos) {
  console.log(`✗ ${h.padEnd(28)} huérfano — ya no está en el manifiesto` +
              (revisar ? ' (se borraría)' : ' — borrado'));
}

console.log(`\n${revisar ? '(revisión, no se escribió nada) ' : ''}` +
            (copia ? `${total} archivos · ` : 'por punteros, sin copia · ') +
            `${fuentes.length - faltantes}/${fuentes.length} fuentes completas` +
            (huerfanos.length ? ` · ${huerfanos.length} huérfano(s)` : ''));
if (congelada) {
  console.log(`\n⚠ lore-ecosistema/ existe y la copia está APAGADA. Es una foto que ya nadie`);
  console.log(`  actualiza y el bot la sigue leyendo. Bórrala, o pon "copia": true en el manifiesto.`);
}

if (!revisar) {
  console.log(`Tabla de enrutamiento → lore/enrutamiento.md`);
  console.log(`Acceso a los árboles vivos → .claude/settings.local.json (${vivos.length} directorio(s))`);
}
