// preguntas-coordinador.mjs — El coordinador hace preguntas que puede omitir si no responde.
// Primer corte: pregunta con timeout y valor por defecto.

const TIMEOUT_PREGUNTAS = 3; // turnos de espera antes de continuar

export function crearPregunta({ pregunta, opciones = null, porDefecto = null, timeout = TIMEOUT_PREGUNTAS }) {
  return {
    tipo: "pregunta",
    pregunta,
    opciones,
    porDefecto,
    timeout,
    timestamp: Date.now(),
  };
}

export function procesarRespuesta(pregunta, respuesta) {
  // Si no hay respuesta, usar valor por defecto
  if (!respuesta || respuesta.trim() === "") {
    return {
      omitida: true,
      valor: pregunta.porDefecto,
      mensaje: `[Pregunta omitida] Se continúa con: "${pregunta.porDefecto}"`,
    };
  }

  // Si hay respuesta, usarla
  return {
    omitida: false,
    valor: respuesta,
    mensaje: `[Pregunta respondida] ${respuesta}`,
  };
}

export function generarPreguntasIniciales({ tarea = null }) {
  const preguntas = [];

  if (!tarea) {
    preguntas.push(
      crearPregunta({
        pregunta: "¿Qué tarea quieres hacer?",
        porDefecto: "continuar con lo pendiente",
        timeout: 2,
      })
    );
  }

  preguntas.push(
    crearPregunta({
      pregunta: "¿Tienes preferencia de método? (TDD, plan maestro, workflow directo)",
      opciones: ["TDD", "plan maestro", "workflow directo", "dejar que el kit decida"],
      porDefecto: "dejar que el kit decida",
      timeout: 2,
    })
  );

  preguntas.push(
    crearPregunta({
      pregunta: "¿Quieres que te guíe paso a paso o prefieres autonomía?",
      opciones: ["guía paso a paso", "autonomía", "mixto"],
      porDefecto: "mixto",
      timeout: 2,
    })
  );

  return preguntas;
}
