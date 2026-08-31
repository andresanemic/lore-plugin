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
    lines.push("El Lore cambió y falta revisar sus conexiones antes de cerrar.");
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
