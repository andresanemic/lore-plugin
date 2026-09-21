import { existsSync, statSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";

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
  const denied = paths
    .map((path) => resolve(own, path))
    .filter((path) => !inside(own, path) && !(exchange && inside(exchange, path)));
  return denied.length === 0
    ? null
    : `Escritura fuera de tu jurisdicción: ${denied.join(", ")}. Convierte el cambio en un mensaje dentro de intercambio/.`;
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
