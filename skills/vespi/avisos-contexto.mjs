// avisos-contexto.mjs — El coordinador avisa cuando queda poco contexto o tokens.
// Primer corte: cuenta turnos y sugiere compactar o delegar.

const UMBRAL_TURNOS_COMPACTAR = 15;
const UMBRAL_TURNOS_DELEGAR = 10;

export function verificarContexto({ turnos = 0, tokensUsados = null, hostExponeTokens = false }) {
  const avisos = [];

  // Aviso por turnos (proxy de contexto)
  if (turnos >= UMBRAL_TURNOS_COMPACTAR) {
    avisos.push({
      tipo: "compactar",
      severidad: "alta",
      mensaje: `Llevamos ${turnos} turnos. El contexto puede estar cerca del límite. Sugiero compactar o delegar a un subagente para no perder el hilo.`,
    });
  } else if (turnos >= UMBRAL_TURNOS_DELEGAR) {
    avisos.push({
      tipo: "delegar",
      severidad: "media",
      mensaje: `Llevamos ${turnos} turnos. Si la tarea es larga, sugiero delegar a un subagente para preservar contexto.`,
    });
  }

  // Aviso por tokens (solo si el host los expone)
  if (hostExponeTokens && tokensUsados !== null) {
    const UMBRAL_TOKEN_BAJO = 50000;
    if (tokensUsados <= UMBRAL_TOKEN_BAJO) {
      avisos.push({
        tipo: "tokens_bajos",
        severidad: "alta",
        mensaje: `Quedan ~${tokensUsados} tokens. Sugiero compactar o finalizar la tarea actual.`,
      });
    }
  }

  return avisos;
}

export function avisosATexto(avisos) {
  if (!avisos.length) return null;
  return avisos.map((a) => `[${a.severidad.toUpperCase()}] ${a.mensaje}`).join("\n");
}
