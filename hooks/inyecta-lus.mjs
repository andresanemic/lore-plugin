// hooks/inyecta-lus.mjs — Inyecta la esencia de LUS en el contexto de los agentes.
// Cuando una skill de Lore Plugin se activa, el agente lee la esencia y sabe que es un jardinero.

import { readFileSync } from "node:fs";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(import.meta.url);
const kitRoot = resolve(__dirname, "..");
const esenciaPath = join(kitRoot, "..", "..", "..", "investigacion-cientifica", "proyectos", "LUS", "esencia", "esencia.md");

function leeEsencia() {
  try { return readFileSync(esenciaPath, "utf8"); } catch { return null; }
}

export function inyectaLus({ skill = null } = {}) {
  const esencia = leeEsencia();
  if (!esencia) return null;

  return {
    role: "system",
    content: `[LUS — Esencia del programa]\n\n${esencia}\n\n${skill ? `[Skill activada: ${skill}]` : ""}`,
  };
}

export function inyectaEnPrompt({ messages = [], skill = null }) {
  const inyeccion = inyectaLus({ skill });
  if (!inyeccion) return messages;
  // Insertar la inyección como primer mensaje de sistema
  const resultado = [...messages];
  const primerSysteme = resultado.findIndex((m) => m.role === "system");
  if (primerSysteme >= 0) {
    resultado.splice(primerSysteme, 0, inyeccion);
  } else {
    resultado.unshift(inyeccion);
  }
  return resultado;
}
