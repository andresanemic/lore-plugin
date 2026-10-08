import { detectarFormaTrabajo } from "./ofrece-formas-trabajo.mjs";

const TIMEOUT_PREGUNTAS = 3;

export function crearPregunta({
  pregunta,
  opciones = null,
  valores = null,
  porDefecto = null,
  timeout = TIMEOUT_PREGUNTAS,
  requiereEleccion = false,
}) {
  return {
    tipo: "pregunta",
    pregunta,
    opciones,
    ...(valores ? { valores } : {}),
    porDefecto,
    timeout,
    requiereEleccion,
    timestamp: Date.now(),
  };
}

export function crearPreguntaDeModalidad(oferta) {
  if (oferta?.requiere_eleccion !== true) {
    throw new Error("la oferta no requiere una elección de modalidad");
  }
  const ids = [
    ...(oferta.modalidad ? [oferta.modalidad] : []),
    ...(oferta.alternativas ?? []),
  ];
  const formas = ids
    .map((modalidad) => detectarFormaTrabajo({ modalidad }))
    .filter(Boolean);
  if (formas.length === 0) {
    throw new Error("no hay modalidades disponibles para elegir");
  }
  return crearPregunta({
    pregunta: oferta.mensaje,
    opciones: formas.map((forma) => forma.nombre),
    valores: formas.map((forma) => forma.id),
    porDefecto: null,
    timeout: null,
    requiereEleccion: true,
  });
}

export function procesarRespuesta(pregunta, respuesta) {
  if (!respuesta || respuesta.trim() === "") {
    if (pregunta.requiereEleccion) {
      return {
        omitida: true,
        valor: null,
        bloqueada: true,
        mensaje: "[Elección pendiente] No se crea ni despacha una operación sin modalidad elegida.",
      };
    }
    return {
      omitida: true,
      valor: pregunta.porDefecto,
      mensaje: "[Pregunta omitida] Se continúa con: " + String(pregunta.porDefecto),
    };
  }

  if (pregunta.requiereEleccion) {
    const indice = pregunta.opciones?.indexOf(respuesta) ?? -1;
    if (indice < 0) {
      return {
        omitida: false,
        valor: null,
        rechazada: true,
        mensaje: "[Elección rechazada] Elige una de las modalidades ofrecidas.",
      };
    }
    return {
      omitida: false,
      valor: pregunta.valores?.[indice] ?? respuesta,
      mensaje: "[Pregunta respondida] " + respuesta,
    };
  }

  return {
    omitida: false,
    valor: respuesta,
    mensaje: "[Pregunta respondida] " + respuesta,
  };
}

export function generarPreguntasIniciales({ tarea = null, ofertaModalidad = null } = {}) {
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

  if (ofertaModalidad) {
    preguntas.push(crearPreguntaDeModalidad(ofertaModalidad));
  }

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
