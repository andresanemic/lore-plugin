import { createHash } from "node:crypto";
const CAPACIDADES_POR_MODALIDAD = {
  acompanada: [],
  "secuencial-checkpoints": [],
  "party-por-roles": ["daimon", "advisor", "worker", "verifier"],
  "frentes-paralelos": ["worker", "advisor", "verifier", "parallelWorktrees"],
  "secuencial-party-checkpoints": ["daimon", "advisor", "worker", "verifier"],
};

export const FORMAS_TRABAJO = [
  {
    id: "acompanada",
    nombre: "Acompañada",
    descripcion: "Una operación acotada a la vez; Andrés participa en los checkpoints acordados.",
    capacidades: CAPACIDADES_POR_MODALIDAD.acompanada,
  },
  {
    id: "secuencial-checkpoints",
    nombre: "Secuencial con checkpoints",
    descripcion: "El coordinador lleva el tramo aprobado y se detiene en gates explícitos.",
    capacidades: CAPACIDADES_POR_MODALIDAD["secuencial-checkpoints"],
  },
  {
    id: "party-por-roles",
    nombre: "Party por roles",
    descripcion: "Daimon investiga, Advisor critica, worker implementa y un verificador aparte observa el resultado.",
    capacidades: CAPACIDADES_POR_MODALIDAD["party-por-roles"],
  },
  {
    id: "frentes-paralelos",
    nombre: "Frentes paralelos",
    descripcion: "Operaciones independientes avanzan en worktrees separados y se integran tras verificarse.",
    capacidades: CAPACIDADES_POR_MODALIDAD["frentes-paralelos"],
  },
  {
    id: "secuencial-party-checkpoints",
    nombre: "Secuencial con checkpoints + Party por roles",
    descripcion: "Una operación a la vez, con los roles especializados y gates de la campaña.",
    capacidades: CAPACIDADES_POR_MODALIDAD["secuencial-party-checkpoints"],
  },
];

export const PRACTICAS_TRABAJO = ["tdd", "loop"];
export const ARTEFACTOS_TRABAJO = ["spec-acuerdo", "plan-ejecucion"];

export function detectarFormaTrabajo({ modalidad = null } = {}) {
  return FORMAS_TRABAJO.find((forma) => forma.id === modalidad) ?? null;
}

function capacidadesFaltantes(forma, capacidades = {}) {
  return forma.capacidades.filter((capacidad) => capacidades[capacidad] !== true);
}

function huellaContexto(contexto, capacidades) {
  const compactar = (valor) => valor.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
  const inventario = contexto.catalogoSkills.map(({ id, nombre }) => [id, nombre])
    .sort(([a], [b]) => a.localeCompare(b));
  const catalogoSkillsDigest = createHash("sha256").update(JSON.stringify(inventario)).digest("hex");
  const material = {
    instruccion: compactar(contexto.instruccion),
    pistas: contexto.pistasPertinentes.map(({ referencia, pertinente, huellaContenido }) => ({ referencia, pertinente, huellaContenido }))
      .sort((a, b) => a.referencia.localeCompare(b.referencia)),
    catalogoSkillsDigest,
    catalogoSkillsOrigen: contexto.catalogoSkillsOrigen,
    skillsSugeridas: contexto.skillsSugeridas.map(({ id }) => id).sort(),
    capacidades: Object.entries(capacidades ?? {})
      .map(([id, disponible]) => [id, disponible === true])
      .sort(([a], [b]) => a.localeCompare(b)),
  };
  return createHash("sha256").update(JSON.stringify(material)).digest("hex");
}
function alternativasViables(ids, capacidades) {
  return [...new Set(ids)]
    .map((id) => detectarFormaTrabajo({ modalidad: id }))
    .filter((forma) => forma && capacidadesFaltantes(forma, capacidades).length === 0);
}

export function ofrecerFormaTrabajo({
  contexto = null,
  modalidad,
  motivo,
  tradeoff,
  alternativas = [],
  capacidades = {},
  preferencia = null,
}) {
  const contextoValidado = contexto === null ? null : validarContextoRecomendacion(contexto);
  const modalidadPreferida = preferencia?.mismaOperacion === true
    && typeof preferencia.modalidad === "string"
    ? preferencia.modalidad
    : null;
  const retomarModalidad = Boolean(preferencia?.mismaOperacion === true
    && preferencia.contextoCambioMaterial !== true
    && detectarFormaTrabajo({ modalidad: modalidadPreferida }));
  const modalidadEfectiva = retomarModalidad ? modalidadPreferida : modalidad;
  const propuesta = detectarFormaTrabajo({ modalidad: modalidadEfectiva });
  if (!propuesta) throw new Error("modalidad no reconocida: " + String(modalidad));
  if (typeof motivo !== "string" || !motivo.trim()) throw new Error("motivo no puede estar vacío");
  if (typeof tradeoff !== "string" || !tradeoff.trim()) throw new Error("tradeoff no puede estar vacío");
  if (!Array.isArray(alternativas)) throw new Error("alternativas debe ser una lista");

  const faltantes = capacidadesFaltantes(propuesta, capacidades);
  const opcionesAlternativas = alternativasViables(
    alternativas.filter((id) => id !== modalidadEfectiva),
    capacidades,
  ).map((forma) => forma.id);
  const nombresAlternativas = opcionesAlternativas
    .map((id) => detectarFormaTrabajo({ modalidad: id }).nombre);
  const camposContexto = contextoValidado ? {
    fundamento: {
      instruccion: contextoValidado.instruccion,
      pistas: contextoValidado.pistasPertinentes,
      pistasDescartadas: contextoValidado.pistasDescartadas,
      motivoSinPistas: contextoValidado.motivoSinPistas,
      catalogoSkillsOrigen: contextoValidado.catalogoSkillsOrigen,
      catalogoSkillsDigest: createHash("sha256").update(JSON.stringify(
        contextoValidado.catalogoSkills.map(({ id, nombre }) => [id, nombre]).sort(([a], [b]) => a.localeCompare(b)),
      )).digest("hex"),
      huellaContexto: huellaContexto(contextoValidado, capacidades),
    },
    skillsSugeridas: contextoValidado.skillsSugeridas,
  } : {};
  if (retomarModalidad && modalidadPreferida !== modalidad && faltantes.length === 0) {
    return {
      tipo: "oferta_forma_trabajo",
      disponible: true,
      modalidad: propuesta.id,
      motivo: null,
      tradeoff: null,
      alternativas: [],
      capacidades_faltantes: [],
      preferencia,
      ...camposContexto,
      requiere_eleccion: false,
      reanudada: true,
      mensaje: "Seguimos con " + propuesta.nombre + ", ya elegida para esta operación. "
        + "El contexto sigue estable; conservo el registro de decisiones sobre skills de esta operación.",
    };
  }
  const fundamentoTexto = contextoValidado
    ? contextoValidado.pistasPertinentes.length > 0
      ? "Pista consultada: " + contextoValidado.pistasPertinentes.map((pista) => pista.referencia).join(", ") + "."
      : "No declaro una Pista pertinente: " + contextoValidado.motivoSinPistas + "."
    : "";
  const skillsTexto = contextoValidado?.skillsSugeridas.length
    ? " Skills disponibles que pueden ayudar: " + contextoValidado.skillsSugeridas.map((skill) => skill.nombre + " (" + skill.proposito + ")").join(", ") + "."
    : "";

  if (faltantes.length > 0) {
    const puedeElegir = opcionesAlternativas.length > 0;
    return {
      tipo: "oferta_forma_trabajo",
      disponible: false,
      modalidad: null,
      modalidad_solicitada: modalidad,
      motivo: motivo.trim(),
      tradeoff: tradeoff.trim(),
      capacidades_faltantes: faltantes,
      alternativas: opcionesAlternativas,
      preferencia,
      ...camposContexto,
      requiere_eleccion: puedeElegir,
      bloqueada: !puedeElegir,
      mensaje: puedeElegir
        ? "No recomiendo " + propuesta.nombre + ": faltan capacidades (" + faltantes.join(", ") + "). Puedo ofrecer " + nombresAlternativas.join(", ") + ". ¿Cuál prefieres?"
        : "No puedo ofrecer " + propuesta.nombre + ": faltan capacidades (" + faltantes.join(", ") + ") y no hay una alternativa disponible.",
    };
  }

  if (opcionesAlternativas.length === 0) {
    throw new Error("una recomendación debe incluir al menos una alternativa disponible");
  }

  const contextoCambioMaterial = preferencia?.mismaOperacion === true
    && preferencia.contextoCambioMaterial === true;
  const retomaSinPregunta = preferencia?.mismaOperacion === true
    && retomarModalidad
    && !contextoCambioMaterial;
  const motivoTexto = motivo.trim().replace(/[.!?]+$/u, "");
  const costeTexto = tradeoff.trim().replace(/[.!?]+$/u, "");
  const mensajeBase = "Para esta tarea recomiendo " + propuesta.nombre + " porque " + motivoTexto
    + ". Coste: " + costeTexto + ". Alternativas: " + nombresAlternativas.join(", ") + ". "
    + fundamentoTexto + skillsTexto;
  const mensajePreferencia = retomaSinPregunta
    ? "Seguimos con " + propuesta.nombre + ", ya elegida para esta operación. "
    : preferencia?.mismaOperacion === true && contextoCambioMaterial
      ? "El contexto cambió materialmente desde la decisión anterior. La modalidad anterior era "
        + (detectarFormaTrabajo({ modalidad: modalidadPreferida })?.nombre ?? modalidadPreferida)
        + "; revisa esta propuesta antes de seguir. "
      : "";

  return {
    tipo: "oferta_forma_trabajo",
    disponible: true,
    modalidad: propuesta.id,
    motivo: motivo.trim(),
    tradeoff: tradeoff.trim(),
    alternativas: opcionesAlternativas,
    capacidades_faltantes: [],
    preferencia,
    ...camposContexto,
    requiere_eleccion: !retomaSinPregunta,
    mensaje: "Vamos paso a paso. " + mensajePreferencia + mensajeBase
      + (retomaSinPregunta ? "" : " ¿Cómo prefieres avanzar?"),
  };
}

export function validarContextoRecomendacion(contexto) {
  if (!contexto || typeof contexto !== "object" || Array.isArray(contexto)) {
    throw new Error("contexto requerido: instruccion, Pistas consultadas y catálogo de skills observado");
  }
  if (typeof contexto.instruccion !== "string" || !contexto.instruccion.trim()) {
    throw new Error("contexto.instruccion no puede estar vacío");
  }
  if (!Array.isArray(contexto.pistas)) throw new Error("contexto.pistas debe ser una lista explícita");
  if (!Array.isArray(contexto.catalogoSkills)) throw new Error("contexto.catalogoSkills debe ser una lista observada");
  if (typeof contexto.catalogoSkillsOrigen !== "string" || !contexto.catalogoSkillsOrigen.trim()) {
    throw new Error("contexto.catalogoSkillsOrigen debe nombrar el inventario observado");
  }
  if (!Array.isArray(contexto.skillsSugeridas)) throw new Error("contexto.skillsSugeridas debe ser una lista");

  const pistas = contexto.pistas.map((pista, index) => {
    if (!pista || typeof pista.referencia !== "string" || !pista.referencia.trim()) {
      throw new Error("contexto.pistas[" + index + "].referencia no puede estar vacía");
    }
    if (typeof pista.pertinente !== "boolean") {
      throw new Error("contexto.pistas[" + index + "].pertinente debe ser explícito");
    }
    if (typeof pista.razon !== "string" || !pista.razon.trim()) {
      throw new Error("contexto.pistas[" + index + "].razon no puede estar vacía");
    }
    if (pista.pertinente && (typeof pista.contenido !== "string" || !pista.contenido.trim())) {
      throw new Error("contexto.pistas[" + index + "].contenido debe incluir el pasaje leído cuando la Pista es pertinente");
    }
    const pasaje = typeof pista.contenido === "string" ? pista.contenido.trim().replace(/\s+/g, " ") : "";
    return {
      referencia: pista.referencia.trim(),
      pertinente: pista.pertinente,
      razon: pista.razon.trim(),
      ...(pasaje ? { huellaContenido: createHash("sha256").update(pasaje).digest("hex") } : {}),
    };
  });
  const pistasPertinentes = pistas.filter((pista) => pista.pertinente);
  const pistasDescartadas = pistas.filter((pista) => !pista.pertinente);
  const motivoSinPistas = typeof contexto.motivoSinPistas === "string" ? contexto.motivoSinPistas.trim() : "";
  if (pistasPertinentes.length === 0 && !motivoSinPistas) {
    throw new Error("si no hay Pista pertinente, contexto.motivoSinPistas debe explicarlo");
  }

  const catalogo = contexto.catalogoSkills.map((skill, index) => {
    if (!skill || typeof skill.id !== "string" || !skill.id.trim() || typeof skill.nombre !== "string" || !skill.nombre.trim()) {
      throw new Error("contexto.catalogoSkills[" + index + "] requiere id y nombre observados");
    }
    return { id: skill.id.trim(), nombre: skill.nombre.trim() };
  });
  const porId = new Map(catalogo.map((skill) => [skill.id, skill]));
  const skillsSugeridas = contexto.skillsSugeridas.map((skill, index) => {
    if (!skill || typeof skill.id !== "string" || !porId.has(skill.id.trim())) {
      throw new Error("skill sugerida fuera del catálogo disponible en contexto.skillsSugeridas[" + index + "]");
    }
    if (typeof skill.proposito !== "string" || !skill.proposito.trim()) {
      throw new Error("contexto.skillsSugeridas[" + index + "].proposito no puede estar vacío");
    }
    return { ...porId.get(skill.id.trim()), proposito: skill.proposito.trim() };
  });

  return {
    instruccion: contexto.instruccion.trim(),
    pistasPertinentes,
    pistasDescartadas,
    motivoSinPistas,
    catalogoSkillsOrigen: contexto.catalogoSkillsOrigen.trim(),
    catalogoSkills: catalogo,
    catalogoSkillIds: catalogo.map((skill) => skill.id),
    skillsSugeridas,
  };
}
