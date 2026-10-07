// hooks/baraja-entry.mjs — Punto de entrada para la baraja de perturbaciones.
// Ofrece una carta cuando se detecta estancamiento o loop.
// No es una skill: es un hook que cualquier skill puede invocar.

import { tirarCarta } from "../scripts/baraja.mjs";

const ESTANCAMIENTO_PALABRAS = [
  "loop", "stuck", "atascado", "repetiendo", "no avanzo", "no sé qué hacer",
  "mismo error", "tres veces", "sin progreso", "estancado", "bucle",
];

export function detectarEstancamiento(texto) {
  const lower = texto.toLowerCase();
  return ESTANCAMIENTO_PALABRAS.some((palabra) => lower.includes(palabra));
}

export function ofrecerCarta({ semilla = null, fuente = null } = {}) {
  return tirarCarta({ semilla, fuente });
}

export function inyectarCartaEnPrompt({ historial = [], maxIntentos = 3 } = {}) {
  // Detecta estancamiento en los últimos turnos
  const reciente = historial.slice(-maxIntentos);
  const estancado = reciente.some((turno) =>
    detectarEstancamiento(turno?.content ?? turno?.text ?? "")
  );
  if (!estancado) return null;

  const carta = ofrecerCarta();
  if (!carta) return null;

  return {
    role: "system",
    content: `[Baraja] Perturbación ofrecida (no requerida): "${carta.texto}" — Fuente: ${carta.fuente}. Total disponibles: ${carta.total}.`,
  };
}
