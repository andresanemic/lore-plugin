// hooks/baraja-entry.mjs — Punto de entrada para la baraja de perturbaciones.
// Ofrece una carta cuando se detecta estancamiento o loop.
// No es una skill: es un hook que cualquier skill puede invocar.

import { tirarCarta } from "../scripts/baraja.mjs";
import { loadOperationState, saveOperationState } from "../skills/vespi/core/operation-state.mjs";

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

export async function inyectarCartaEnPrompt({ operacion = null, root = null } = {}) {
  if (!root || !operacion?.id) return null;
  const stored = await loadOperationState(root, operacion.id);
  if (!stored || ["closed", "cancelled"].includes(stored.state)) return null;
  const offer = stored.perturbations?.findLast(item => item.response_status === "offered" && !item.prompt_prepared_at);
  if (!offer) return null;
  await saveOperationState(root, { ...stored, perturbations: stored.perturbations.map(item => item.id === offer.id ? { ...item, prompt_prepared_at: new Date().toISOString() } : item) });
  const carta = offer.card;

  return {
    role: "system",
    cardId: offer.id,
    content: `[Baraja] Perturbación ofrecida (no requerida): "${carta.texto}" — Fuente: ${carta.fuente}. Total disponibles: ${carta.total}.`,
  };
}
