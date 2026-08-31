export const MATERIAL_GROWTH_BYTES = 8_192;

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
