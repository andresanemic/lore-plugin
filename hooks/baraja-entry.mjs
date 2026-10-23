// hooks/baraja-entry.mjs — Punto de entrada para la baraja de perturbaciones.
// Ofrece una carta interna al empezar una tarea y prepara el prompt una sola vez.
// No es una skill: es un hook que cualquier skill puede invocar.

import { tirarCarta } from "../scripts/baraja.mjs";
import { loadOperationState, saveOperationState } from "../skills/vespi/core/operation-state.mjs";
import { offerTaskCard } from "../skills/vespi/core/cards.mjs";

const ESTANCAMIENTO_PALABRAS = [
  "loop", "stuck", "atascado", "repetiendo", "no avanzo", "no sé qué hacer",
  "mismo error", "tres veces", "sin progreso", "estancado", "bucle",
];

export function detectarEstancamiento(texto) {
  // Legacy text classifier; never authorizes an offer or prompt.
  const lower = texto.toLowerCase();
  return ESTANCAMIENTO_PALABRAS.some((palabra) => lower.includes(palabra));
}

export function ofrecerCarta({ semilla = null, fuente = null } = {}) {
  return tirarCarta({ semilla, fuente });
}

export async function inyectarCartaEnPrompt({ operacion = null, root = null, taskId = null, semilla = null } = {}) {
  if (!root || !operacion?.id) return null;
  const stored = await loadOperationState(root, operacion.id);
  if (!stored || ["closed", "cancelled"].includes(stored.state)) return null;
  let current = stored;
  // A task only receives its own offer. Re-reading its prompt is idempotent and
  // returns that same card; it must neither consume another task's offer nor
  // create a duplicate.
  let offer = taskId
    ? current.perturbations?.find(item => item.task_id === taskId)
    : current.perturbations?.findLast(item => item.response_status === "offered" && !item.prompt_prepared_at);
  if (!offer && taskId) {
    current = offerTaskCard(current, { taskId, semilla });
    offer = current.perturbations.at(-1);
  }
  if (!offer) return null;
  if (!offer.prompt_prepared_at) {
    await saveOperationState(root, { ...current, perturbations: current.perturbations.map(item => item.id === offer.id ? { ...item, prompt_prepared_at: new Date().toISOString() } : item) });
  }
  const carta = offer.card;

  return {
    role: "system",
    cardId: offer.id,
    content: `[Baraja] Perturbación ofrecida (no requerida): "${carta.texto}" — Fuente: ${carta.fuente}. Total disponibles: ${carta.total}.`,
  };
}
