import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
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
test("una oferta automática no hace que el consumidor cree una pregunta de modalidad", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    modalidad: null,
    motivo: "cambio local de una frase",
    tradeoff: "una pasada",
    alternativas: [],
    capacidades: {},
    contexto: { instruccion: "Renombra el título", pistas: [], motivoSinPistas: "no aplica", catalogoSkills: [], catalogoSkillsOrigen: "host", skillsSugeridas: [] },
  });
  assert.equal(oferta.requiere_eleccion, false);
  assert.doesNotThrow(() => preguntas.generarPreguntasIniciales({ tarea: "Renombra el título", ofertaModalidad: oferta }));
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
  assert.match(oferta.mensaje, /herramientas elegidas/i);
  assert.doesNotMatch(oferta.mensaje, /party|skills|checkpoints|TDD|SDD/i);
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

test("la puntuación adversarial conserva el mensaje sin búsquedas cuadráticas", () => {
  const motivo = "razón " + "!".repeat(50_000) + "x";
  const inicio = performance.now();
  const oferta = ofertas.ofrecerFormaTrabajo({
    ...recomendacion,
    motivo,
    tradeoff: "cuesta tiempo?!",
  });
  assert.ok(performance.now() - inicio < 1_000, "la limpieza de puntuación debe ser lineal");
  assert.ok(oferta.mensaje.includes(motivo));
  assert.match(oferta.mensaje, /Coste: cuesta tiempo\. Alternativas:/);
});

test("una tarea simple sin roles disponibles elige la ruta directa sin party", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    modalidad: null,
    motivo: "es una correccion local de un solo archivo",
    tradeoff: "sin revision independiente",
    alternativas: ["acompanada", "secuencial-checkpoints"],
    capacidades: {},
    contexto: { instruccion: "Corrige una errata local", pistas: [], motivoSinPistas: "no aplica", catalogoSkills: [], catalogoSkillsOrigen: "host", skillsSugeridas: [] },
  });
  assert.equal(oferta.disponible, true);
  assert.equal(oferta.modalidad, "acompanada");
  assert.equal(oferta.ruta_tecnica, "directa");
  assert.match(oferta.razon_ruta, /excepción textual finita/i);
  assert.equal(oferta.requiere_eleccion, false);
});

test("una tarea compuesta selecciona metodo y revision final si el host los ofrece", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    modalidad: null,
    motivo: "compone varias entregas",
    tradeoff: "requiere revision final",
    alternativas: ["secuencial-checkpoints"],
    capacidades: { daimon: true, advisor: true, worker: true, verifier: true },
    contexto: { instruccion: "Componer varios entregables y revisarlos", pistas: [], motivoSinPistas: "no aplica", catalogoSkills: [], catalogoSkillsOrigen: "host", skillsSugeridas: [] },
  });
  assert.equal(oferta.ruta_tecnica, "metodo-y-revision-final");
  assert.equal(oferta.revision_final, true);
  assert.equal(oferta.verificacion_requerida, true);
});

test("si falta un rol, una tarea compuesta toma la ruta disponible con revision final", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    ...recomendacion,
    contexto: { instruccion: "Componer varios entregables", pistas: [], motivoSinPistas: "no aplica", catalogoSkills: [], catalogoSkillsOrigen: "host", skillsSugeridas: [] },
    capacidades: { verifier: true },
    alternativas: ["secuencial-checkpoints"],
  });
  assert.equal(oferta.disponible, true);
  assert.equal(oferta.modalidad, "secuencial-checkpoints");
  assert.equal(oferta.ruta_tecnica, "metodo-y-revision-final");
  assert.equal(oferta.revision_final, true);
  assert.equal(oferta.requiere_eleccion, false);
});

test("la ausencia de verificador no permite declarar conformidad", () => {
  const oferta = ofertas.ofrecerFormaTrabajo({
    ...recomendacion,
    modalidad: null,
    capacidades: { daimon: true, worker: true },
    contexto: { instruccion: "Componer varios entregables", pistas: [], motivoSinPistas: "no aplica", catalogoSkills: [], catalogoSkillsOrigen: "host", skillsSugeridas: [] },
  });
  assert.equal(oferta.disponible, false);
  assert.equal(oferta.bloqueada, true);
  assert.equal(oferta.conformidad, null);
  assert.equal(oferta.verificacion_requerida, true);
  assert.match(oferta.bloqueo ?? oferta.mensaje, /verificador|revisi[oó]n final/i);
});

test("un cambio material conserva operacion y preferencia y exige revalidacion", () => {
  const preferencia = { modalidad: "secuencial-checkpoints", mismaOperacion: true, contextoCambioMaterial: true, operationId: "op-1", presupuesto: 0, autoridad: { spend: [] } };
  const oferta = ofertas.ofrecerFormaTrabajo({ ...recomendacion, preferencia });
  assert.equal(oferta.modalidad, preferencia.modalidad);
  assert.deepEqual(oferta.preferencia, preferencia);
  assert.equal(oferta.requiere_revalidacion, true);
});

test("una recomendacion no anade gasto, publicacion ni acceso a archivos", () => {
  const oferta = ofertas.ofrecerFormaTrabajo(recomendacion);
  assert.deepEqual(oferta.efectos, { gasto: false, publicacion: false, acceso_archivos: false });
});

const guiaVespi = readFileSync(resolve(import.meta.dirname, "../skills/vespi/SKILL.md"), "utf8");

test("una pregunta critica tras un fallo abre diagnostico sin reescribir ni dar efectos", () => {
  assert.match(guiaVespi, /critical question after failure diagnoses only/i);
});

test("una correccion agrega una tarea versionada, conserva la anterior y revalida antes de lanzar", () => {
  assert.match(guiaVespi, /correction adds a new task and keeps the prior task/i);
  assert.match(guiaVespi, /revalidate before dispatch/i);
});

test("la exploracion entrega candidatos, no criterios aprobados ni ejecucion", () => {
  assert.match(guiaVespi, /exploration yields candidates, never approval or execution/i);
});
