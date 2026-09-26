import { existsSync, readFileSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, isAbsolute, relative, resolve } from "node:path";

export const MATERIAL_GROWTH_BYTES = 8_192;

function inside(root, target) {
  const rel = relative(root, target);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
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
    if (existsSync(resolve(area, "lore")) && statSync(resolve(area, "lore")).isDirectory()) return area;
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

export function structuredWritePaths(toolName, input = {}) {
  if (["Write", "Edit", "MultiEdit"].includes(toolName) && typeof input.file_path === "string") {
    return [input.file_path];
  }
  if (toolName === "NotebookEdit" && typeof input.notebook_path === "string") {
    return [input.notebook_path];
  }
  if (toolName === "apply_patch" && typeof input.command === "string") {
    return [...input.command.matchAll(/^\*\*\* (?:(?:Add|Update|Delete) File|Move to): (.+)$/gm)]
      .map((match) => match[1].trim());
  }
  return [];
}

export function jurisdictionBlock(root, toolName, input) {
  const paths = structuredWritePaths(toolName, input);
  if (paths.length === 0) return null;
  const own = resolve(root);
  const exchange = exchangeRoot(own);
  const area = areaRoot(own);
  // El scratchpad de la sesión vive bajo <tmp>/claude; el resto de <tmp> no es jurisdicción.
  const allowed = [own, ...(exchange ? [exchange] : []), resolve(tmpdir(), "claude"), ...federatedRoots(own), ...(area ? [area] : [])];
  const denied = paths
    .map((path) => resolve(own, path))
    .filter((path) => !allowed.some((base) => inside(base, path)));
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
