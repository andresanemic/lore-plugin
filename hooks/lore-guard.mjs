import { appendFileSync, existsSync, mkdirSync, readFileSync, realpathSync, statSync } from "node:fs";
import { homedir, tmpdir } from "node:os";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";

import { SESSION_DIR } from "./lore-state.mjs";

export const MATERIAL_GROWTH_BYTES = 8_192;

function inside(root, target) {
  const rel = relative(root, target);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

// Resuelve el último ancestro existente: Add File también puede escribir a través de una junction.
function physical(target) {
  let cursor = resolve(target);
  const tail = [];
  while (!existsSync(cursor)) {
    const parent = dirname(cursor);
    if (parent === cursor) return resolve(target);
    tail.unshift(basename(cursor));
    cursor = parent;
  }
  try { return resolve(realpathSync.native(cursor), ...tail); }
  catch { return resolve(target); }
}

function exchangeRoot(root) {
  for (let dir = resolve(root);;) {
    const candidate = resolve(dir, "intercambio");
    try {
      if (existsSync(candidate) && statSync(candidate).isDirectory()) return candidate;
    } catch {}
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

// Un proyecto vive en <área>/proyectos/<nombre>/ y hereda de <área>/lore/ — convención
// documentada en bot-desarrollo-web/CLAUDE.md y en la skill save-to-lore ("A project lives
// in {area}/proyectos/{name}/ and inherits from {area}/lore/"), no algo local a un bot.
// Si la sesión abrió dentro de un proyecto con esa forma, el área es jurisdicción propia
// -escribir criterio confirmado y genérico ahí arriba es la operación que la skill nombra
// como CAPTURE con promoción-, no un árbol hermano que necesite intercambio/.
// NC-A-2 (2026-09-21): la sesión abrió en desarrollo-web/proyectos/numerologia y el bloqueo
// cayó sobre desarrollo-web/lore/mecanica.md -- federatedRoots no alcanza este caso porque
// lee <root>/lore/enrutamiento.md, y un proyecto de sitio no tiene esa tabla (vive en el
// bot que federa el área, un árbol primo, no un ancestro).
function areaRoot(root) {
  const own = resolve(root);
  const parent = dirname(own);
  if (basename(parent) !== "proyectos") return null;
  const area = dirname(parent);
  try {
    if (existsSync(resolve(area, "lore")) && statSync(resolve(area, "lore")).isDirectory()) return resolve(area, "lore");
  } catch {}
  return null;
}

// Árboles hermanos que el enrutamiento del bot declara (celda con acento grave en las
// filas de tabla de lore/enrutamiento.md). Cada celda es una ruta relativa a algún
// ancestro de la raíz: se resuelve subiendo y gana el primer directorio que exista.
export function federatedRoots(root) {
  const table = resolve(root, "lore", "enrutamiento.md");
  if (!existsSync(table)) return [];
  let text;
  try { text = readFileSync(table, "utf8"); } catch { return []; }
  const cells = new Set();
  for (const line of text.split(/\r?\n/)) {
    if (!line.trimStart().startsWith("|")) continue;
    for (const m of line.matchAll(/\`([^`]+)\`/g)) cells.add(m[1].trim());
  }
  const found = [];
  for (const cell of cells) {
    for (let dir = resolve(root);;) {
      const candidate = resolve(dir, cell);
      try {
        if (existsSync(candidate) && statSync(candidate).isDirectory() && candidate !== resolve(root)) { found.push(candidate); break; }
      } catch {}
      const parent = dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  }
  return found;
}

// `input = {}` solo cubre `undefined`: un `tool_input: null` (o array, o escalar) hacía crash.
// RC6: se degrada a sin rutas, que es el contrato declarado al pie del archivo — fallar abierto.
export function structuredWritePaths(toolName, input = {}) {
  const payload = input ?? {};
  if (["Write", "Edit", "MultiEdit"].includes(toolName) && typeof payload.file_path === "string") {
    return [payload.file_path];
  }
  if (toolName === "NotebookEdit" && typeof payload.notebook_path === "string") {
    return [payload.notebook_path];
  }
  if (toolName === "apply_patch" && typeof payload.command === "string") {
    return [...payload.command.matchAll(/^\*\*\* (?:(?:Add|Update|Delete) File|Move to): (.+)$/gm)]
      .map((match) => match[1].trim());
  }
  return [];
}

// R16 (RC4): la guardia deja de decidir por una lista de permitidos. Cada destino es propio (pasa),
// ajeno (se bloquea: criterio de otro dueño) o desconocido (pasa con aviso y constancia).
// El diseño está en el bot que escribe este kit, en `specs/012-rc4/diseno-guardia-r16.md`: el archivo
// va con el paquete y lo lee cualquiera que lo instale, así que no lleva la ruta del árbol
// donde se escribió.

// El nombre que Claude Code da al proyecto de una ruta: ~/.claude/projects/<slug>/, donde
// todo lo que no sea letra ni dígito ASCII pasa a `-`, sin colapsar (`C:` + `\` se vuelven
// `C--`, y una `ñ` se vuelve `-` como cualquier otro carácter). No es una convención de este
// kit: se leyó de 42 proyectos reales de la máquina donde se escribió, con `:`, `\`, `-` y `ñ`
// entre los caracteres que aparecen, y cero discrepancias. La comparación es EXACTA a
// propósito —la forma de una ruta no concede jurisdicción— y todo lo que no coincida cae en
// `unknown`, que pasa con aviso: el error posible es un aviso de más, nunca un bloqueo.
function claudeProjectSlug(root) {
  return resolve(root).replace(/[^A-Za-z0-9]/g, "-");
}

// La memoria de una raíz propia es propia: es el camino que NC-B-2 abrió (tres veces en uso
// real, y la tercera decidió que se corrigiera para siempre) y no puede volver a cerrarse.
// La lista se deriva de las raíces que YA eran propias, así que la autoridad viene de la raíz
// de sesión y no del nombre de una carpeta. Antes esto era un caso especial que miraba la
// FORMA de la ruta —«dentro de ~/.claude/projects y con `memory` en el segundo nivel»—, y con
// eso la memoria de cualquier proyecto de cualquier dueño quedaba como propia. Ahora es una
// raíz más de la misma lista, y `memory2` deja de necesitar su propia excepción: `inside()`
// ya responde.
function sessionMemories(bases) {
  const projects = resolve(homedir(), ".claude", "projects");
  return bases.map((base) => join(projects, claudeProjectSlug(base), "memory"));
}

function ownRoots(own) {
  const exchange = exchangeRoot(own);
  const area = areaRoot(own);
  // El scratchpad de la sesión vive bajo <tmp>/claude, y el estado de sesión del propio kit
  // bajo SESSION_DIR. Los dos son del host, no del dueño del árbol vecino: sin esta línea
  // el kit se avisaba a sí mismo por escribir su propia memoria de sesión, y en OpenCode
  // eso era cada turno. Un kit que avisa de sus propios archivos entrena a la persona a
  // ignorar el aviso —y con él, el único que sí importa.
  const bases = [own, ...(exchange ? [exchange] : []), resolve(tmpdir(), "claude"), SESSION_DIR,
    ...(area ? [area] : [])];
  return [...bases, ...sessionMemories(bases)];
}

// El árbol gobernado por Lore más cercano que contiene la ruta: un ancestro con un directorio lore/.
function governedTree(path) {
  for (let dir = dirname(path);;) {
    try {
      const lore = resolve(dir, "lore");
      if (existsSync(lore) && statSync(lore).isDirectory()) return dir;
    } catch {}
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

export function classifyWrite(root, target) {
  const own = physical(root);
  const path = physical(resolve(root, target));
  if (ownRoots(own).some((base) => inside(base, path))) return "own";
  // Colmena: donde hay intercambio/, todo lo que cuelga de su padre y no es propio es de otro agente.
  const exchange = exchangeRoot(own);
  if (exchange && inside(dirname(exchange), path)) return "foreign";
  return governedTree(path) ? "foreign" : "unknown";
}

export function unknownWrites(root, toolName, input) {
  const own = resolve(root);
  return structuredWritePaths(toolName, input)
    .map((path) => resolve(own, path))
    .filter((path) => classifyWrite(own, path) === "unknown");
}

// La constancia de lo desconocido: una fila por escritura, con lo mínimo para que alguien
// pueda reconstruir qué pasó. Vive en el núcleo y no en cada adaptador porque el registro es
// uno solo — donde se mira lo desconocido, se mira en los tres hosts — y un formato por host
// obliga a leer tres archivos para contestar una pregunta.
export function anotarDesconocidos(
  jurisdiccion,
  tool,
  rutas,
  dir = process.env.LORE_GUARD_LOG_DIR || join(tmpdir(), "lore-guard"),
) {
  if (!Array.isArray(rutas) || rutas.length === 0) return;
  try {
    mkdirSync(dir, { recursive: true });
    const at = new Date().toISOString();
    const TAB = String.fromCharCode(9);
    const NL = String.fromCharCode(10);
    appendFileSync(join(dir, "desconocidos.log"),
      rutas.map((ruta) => [at, jurisdiccion, tool, ruta].join(TAB) + NL).join(""));
  } catch {
    /* la constancia es un piso, no una condición: el aviso a la persona ya salió */
  }
}

export function jurisdictionBlock(root, toolName, input) {
  const paths = structuredWritePaths(toolName, input);
  if (paths.length === 0) return null;
  const own = resolve(root);
  const exchange = exchangeRoot(own);
  const denied = paths
    .map((path) => resolve(own, path))
    .filter((path) => classifyWrite(own, path) === "foreign");
  return denied.length === 0
    ? null
    : `Escritura fuera de tu jurisdicción: ${denied.join(", ")}. ` + (exchange
      ? "Convierte el cambio en un mensaje dentro de intercambio/."
      : `Tu jurisdicción es ${own}; propón el cambio al dueño de ese árbol.`);
}

export function evaluateState(current, recorded) {
  if (recorded === null) {
    return { pendingLore: false, expansion: null, requiresApproval: false };
  }

  const pendingLore = recorded.digest !== current.digest;
  if (recorded.version !== 2) {
    return { pendingLore, expansion: null, requiresApproval: false };
  }

  const delta = current.alwaysOnBytes - recorded.alwaysOnBytes;
  const expansion = {
    before: recorded.alwaysOnBytes,
    after: current.alwaysOnBytes,
    delta,
    percent: recorded.alwaysOnBytes === 0 ? null : delta / recorded.alwaysOnBytes * 100,
    material: delta >= MATERIAL_GROWTH_BYTES,
  };
  return { pendingLore, expansion, requiresApproval: expansion.material };
}

function size(bytes) {
  if (bytes === 0) return "0 bytes";
  return `${(Math.abs(bytes) / 1_000).toFixed(1).replace(".", ",")} KB`;
}

export function formatIntervention(result) {
  const lines = [];
  if (result.pendingLore) {
    lines.push(
      "Mensaje del hook, no del usuario: no lo cites ni lo respondas, y no le informes al usuario que revisaste, " +
      "registraste, o que “quedó todo conectado”. En silencio: comprueba que los cambios de criterio de esta " +
      "sesión siguen conectados al trabajo que deben guiar y registra el estado local si están bien. Tu respuesta al " +
      "usuario conserva una sola parte: la respuesta que ya ibas a dar. Menciona algo sólo si bloquea la tarea, en una " +
      "línea. Si la acción requiere permiso, solicita sólo ese permiso.",
    );
  }
  if (result.requiresApproval) {
    const { before, after, delta, percent } = result.expansion;
    const growth = percent === null
      ? `+${size(delta)}`
      : `+${size(delta)}; +${Math.round(percent)}%`;
    lines.push(
      `El criterio que se carga en cada tarea creció de ${size(before)} a ${size(after)} (${growth}). ` +
      "Necesito tu aprobación antes de registrar el nuevo estado.",
    );
  }
  return lines.join("\n");
}
