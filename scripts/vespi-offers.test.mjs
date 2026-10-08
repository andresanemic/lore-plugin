import assert from "node:assert/strict";
import test from "node:test";
import * as ofertas from "../skills/vespi/ofrece-formas-trabajo.mjs";
import * as preguntas from "../skills/vespi/preguntas-coordinador.mjs";

const recomendacion = {
  modalidad: "secuencial-party-checkpoints",
  motivo: "el trabajo cruza dos repositorios y exige gates",
  tradeoff: "requiere checkpoints antes de avanzar",
  alternativas: ["acompanada"],
  capacidades: { daimon: true, advisor: true, worker: true, verifier: true },
};

test("el coordinador propone una modalidad razonada y pide elección", () => {
  const oferta = ofertas.ofrecerFormaTrabajo(recomendacion);
  assert.equal(oferta.modalidad, "secuencial-party-checkpoints");
  assert.ok(oferta.motivo);
  assert.ok(oferta.tradeoff);
  assert.ok(oferta.alternativas.length > 0);
  assert.equal(oferta.requiere_eleccion, true);
});

test("TDD y loops son prácticas; spec/acuerdo y plan son artefactos", () => {
  const ids = ofertas.FORMAS_TRABAJO.map((forma) => forma.id);
  for (const practicaOArtefacto of ["tdd", "loop-expansivo", "spec-kit", "plan-maestro"]) {
    assert.equal(ids.includes(practicaOArtefacto), false, practicaOArtefacto + " no es una modalidad");
  }
  assert.ok(ofertas.PRACTICAS_TRABAJO.includes("tdd"));
  assert.ok(ofertas.PRACTICAS_TRABAJO.includes("loop"));
  assert.ok(ofertas.ARTEFACTOS_TRABAJO.includes("spec-acuerdo"));
  assert.ok(ofertas.ARTEFACTOS_TRABAJO.includes("plan-ejecucion"));
  assert.equal(ofertas.ARTEFACTOS_TRABAJO.includes("plan-maestro"), false);
});

test("una modalidad que exige roles ausentes se rechaza y ofrece una alternativa real", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    ...recomendacion,
    capacidades: { advisor: false, worker: true },
  });
  assert.equal(oferta.disponible, false);
  assert.equal(oferta.modalidad, null);
  assert.ok(oferta.capacidades_faltantes.includes("advisor"));
  assert.ok(oferta.alternativas.includes("acompanada"));
  assert.equal(oferta.requiere_eleccion, true);
});

test("la pregunta de modalidad no vence ni selecciona un valor por defecto", () => {
  const oferta = ofertas.ofrecerFormaTrabajo(recomendacion);
  const iniciales = preguntas.generarPreguntasIniciales({ tarea: "campaña", ofertaModalidad: oferta });
  const pregunta = iniciales.find((item) => item.requiereEleccion === true);
  assert.ok(pregunta);
  assert.equal(pregunta.porDefecto, null);
  assert.equal(pregunta.timeout, null);
  const silencio = preguntas.procesarRespuesta(pregunta, "");
  assert.equal(silencio.valor, null);
  assert.equal(silencio.bloqueada, true);
});
test("la oferta nombra las alternativas para la persona, no solo sus ids", () => {
  const oferta = ofertas.ofrecerFormaTrabajo(recomendacion);
  assert.match(oferta.mensaje, /Acompañada/);
});

test("sin oferta no aparece el menú viejo ni se elige un método por defecto", () => {
  const iniciales = preguntas.generarPreguntasIniciales({ tarea: "campaña" });
  assert.equal(iniciales.some((item) => item.pregunta.includes("TDD")), false);
  assert.equal(iniciales.some((item) => item.porDefecto === "dejar que el kit decida"), false);
});

test("la pregunta presenta nombres legibles y normaliza la elección a su id", () => {
  const oferta = ofertas.ofrecerFormaTrabajo(recomendacion);
  const iniciales = preguntas.generarPreguntasIniciales({ tarea: "campaña", ofertaModalidad: oferta });
  const pregunta = iniciales.find((item) => item.requiereEleccion === true);
  assert.ok(pregunta.opciones.includes("Acompañada"));
  assert.equal(preguntas.procesarRespuesta(pregunta, "Acompañada").valor, "acompanada");
});

test("Party no se recomienda si faltan Daimon o verificador", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    ...recomendacion,
    capacidades: { advisor: true, worker: true },
  });
  assert.equal(oferta.disponible, false);
  assert.ok(oferta.capacidades_faltantes.includes("daimon"));
  assert.ok(oferta.capacidades_faltantes.includes("verifier"));
  assert.ok(oferta.alternativas.includes("acompanada"));
});

test("una preferencia explícita de esta operación no se vuelve a preguntar", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    ...recomendacion,
    preferencia: {
      modalidad: "secuencial-party-checkpoints",
      mismaOperacion: true,
      contextoCambioMaterial: false,
    },
  });
  assert.equal(oferta.modalidad, "secuencial-party-checkpoints");
  assert.equal(oferta.requiere_eleccion, false);
  assert.match(oferta.mensaje, /ya elegida para esta operación/i);
});

test("la continuación estable nombra las decisiones de skills sin fingir que todas fueron aceptadas", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    ...recomendacion,
    modalidad: "acompanada",
    preferencia: {
      modalidad: "secuencial-party-checkpoints",
      mismaOperacion: true,
      contextoCambioMaterial: false,
      skills: [
        { sugerida: "brainstorming-lore", decision: "corrected", elegida: "use-lore" },
        { sugerida: "save-to-lore", decision: "declined", elegida: null },
      ],
    },
  });
  assert.equal(oferta.reanudada, true);
  assert.equal(oferta.requiere_eleccion, false);
  assert.match(oferta.mensaje, /decisiones sobre skills/i);
  assert.doesNotMatch(oferta.mensaje, /skills que aceptaste/i);
});

test("un cambio material de contexto pide confirmar una preferencia anterior", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    ...recomendacion,
    preferencia: {
      modalidad: "secuencial-party-checkpoints",
      mismaOperacion: true,
      contextoCambioMaterial: true,
    },
  });
  assert.equal(oferta.requiere_eleccion, true);
  assert.match(oferta.mensaje, /contexto cambió/i);
});
