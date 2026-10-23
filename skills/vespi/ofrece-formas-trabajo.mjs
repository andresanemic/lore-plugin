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

function sinPuntuacionFinal(texto) {
  let fin = texto.length;
  while (fin > 0) {
    const ultimo = texto[fin - 1];
    if (ultimo !== "." && ultimo !== "!" && ultimo !== "?") break;
    fin--;
  }
  return texto.slice(0, fin);
}

function capacidadesFaltantes(forma, capacidades = {}) {
  return forma.capacidades.filter((capacidad) => capacidades[capacidad] !== true);
}

function huellaContexto(contexto, capacidades, efectos) {
  const compactar = (valor) => valor.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
  const inventario = contexto.catalogoSkills.map(({ id, nombre }) => [id, nombre])
    .sort(([a], [b]) => a.localeCompare(b));
  const catalogoSkillsDigest = createHash("sha256").update(JSON.stringify(inventario)).digest("hex");
  const material = {
    instruccion: compactar(contexto.instruccion),
    fuentes: contexto.fuentes,
    entregables: contexto.entregables,
    acciones: contexto.acciones,
    pistas: contexto.pistasPertinentes.map(({ referencia, pertinente, huellaContenido }) => ({ referencia, pertinente, huellaContenido }))
      .sort((a, b) => a.referencia.localeCompare(b.referencia)),
    catalogoSkillsDigest,
    catalogoSkillsOrigen: contexto.catalogoSkillsOrigen,
    skillsSugeridas: contexto.skillsSugeridas.map(({ id }) => id).sort(),
    capacidades: Object.entries(capacidades ?? {})
      .map(([id, disponible]) => [id, disponible === true])
      .sort(([a], [b]) => a.localeCompare(b)),
    efectos: Object.entries(efectos ?? {}).sort(([a], [b]) => a.localeCompare(b)),
  };
  return createHash("sha256").update(JSON.stringify(material)).digest("hex");
}
function alternativasViables(ids, capacidades) {
  return [...new Set(ids)]
    .map((id) => detectarFormaTrabajo({ modalidad: id }))
    .filter((forma) => forma && capacidadesFaltantes(forma, capacidades).length === 0);
}

function nombreRol(id) {
  return ({ daimon: "investigación", advisor: "asesoría", worker: "ejecución", verifier: "verificación", parallelWorktrees: "trabajo paralelo" })[id] ?? id;
}

function nombrePersona(forma) {
  return forma.nombre.replace("Secuencial con checkpoints + Party por roles", "trabajo por etapas con roles especializados")
    .replace("Secuencial con checkpoints", "trabajo por etapas con revisiones")
    .replace("Party por roles", "trabajo con roles especializados")
    .replace("Frentes paralelos", "trabajo en paralelo");
}

function criterioRevision(contexto, efectos, alcanceOriginal) {
  if (!contexto) return { simple: false, requiereRevision: false };
  const instruccion = contexto?.instruccion ?? "";
  if (instruccion.length > 10000) return { simple: false, requiereRevision: true };
  const efectosSolicitados = Object.values(efectos ?? {}).some(Boolean);
  const camposAlcance = ["fuentes", "entregables", "acciones"];
  const hayMetadataAlcance = camposAlcance.some((campo) => Object.hasOwn(alcanceOriginal ?? {}, campo));
  const edicionTrivial = !hayMetadataAlcance && !efectosSolicitados
    && /^(?:corrige (?:una errata(?: local)?|el t[ií]tulo)|actualiza el t[ií]tulo|renombra el t[ií]tulo|cambia (?:las comillas|los espacios|el punto final|la puntuaci[oó]n)(?: del t[ií]tulo)?|borra los espacios(?: del t[ií]tulo)?|change (?:the final punctuation in the title|the section titles|the title)|fix (?:a typo|the title)|edit the title|rename the title)$/iu.test(instruccion.trim().replace(/[.!?]+$/u, ""));
  const simple = edicionTrivial && contexto.pistasPertinentes.length <= 1;
  return { simple, requiereRevision: !simple };
}
function formaInferida() { return "acompanada"; }
export function ofrecerFormaTrabajo({
  contexto = null,
  modalidad = null,
  motivo,
  tradeoff,
  alternativas = [],
  capacidades = {},
  preferencia = null,
  efectos = null,
}) {
  capacidades = Object.setPrototypeOf(Object.fromEntries(Object.entries(capacidades ?? {})), null);
  const contextoValidado = contexto === null ? null : validarContextoRecomendacion(contexto);
  const criterio = criterioRevision(contextoValidado, efectos, contexto);
  const compuesta = criterio.requiereRevision;
  const modalidadPreferida = preferencia?.mismaOperacion === true
    && typeof preferencia.modalidad === "string"
    ? preferencia.modalidad
    : null;
  const retomarPreferencia = preferencia?.mismaOperacion === true
    && Boolean(detectarFormaTrabajo({ modalidad: modalidadPreferida }));
  const retomarModalidad = retomarPreferencia && preferencia.contextoCambioMaterial !== true;
  const modalidadEfectiva = retomarPreferencia
    ? modalidadPreferida
    : (modalidad ?? formaInferida(contextoValidado, capacidades, criterio));
  const modalidadAjustada = criterio.simple && modalidad === null && !retomarPreferencia
    ? "acompanada"
    : modalidadEfectiva;
  let propuesta = detectarFormaTrabajo({ modalidad: modalidadAjustada });
  if (!propuesta) throw new Error("modalidad no reconocida: " + String(modalidad));
  if (typeof motivo !== "string" || !motivo.trim()) throw new Error("motivo no puede estar vacío");
  if (typeof tradeoff !== "string" || !tradeoff.trim()) throw new Error("tradeoff no puede estar vacío");
  if (!Array.isArray(alternativas)) throw new Error("alternativas debe ser una lista");

  const verificacionSolicitada = propuesta.capacidades.includes("verifier") || compuesta;
  let faltantes = capacidadesFaltantes(propuesta, capacidades);
  if (compuesta && capacidades.verifier !== true && !faltantes.includes("verifier")) faltantes.push("verifier");
  const faltantesPreferencia = [...faltantes];
  const alternativasDisponibles = alternativasViables(alternativas.filter((id) => id !== modalidadAjustada), capacidades);
  if (faltantes.length > 0 && alternativasDisponibles.length > 0 && !retomarPreferencia
    && (!verificacionSolicitada || capacidades.verifier === true)) {
    propuesta = alternativasDisponibles[0];
    faltantes = [];
  }
  const rutaAlternativa = propuesta.id !== modalidadAjustada;
  const opcionesAlternativas = compuesta && capacidades.verifier !== true && contextoValidado ? [] : alternativasViables(
    alternativas.filter((id) => id !== propuesta.id),
    capacidades,
  ).map((forma) => forma.id);
  const nombresAlternativas = opcionesAlternativas
    .map((id) => nombrePersona(detectarFormaTrabajo({ modalidad: id })));
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
      huellaContexto: huellaContexto(contextoValidado, capacidades, efectos),
    },
    skillsSugeridas: contextoValidado.skillsSugeridas,
  } : {};
  const requiereRevision = compuesta || verificacionSolicitada || propuesta.capacidades.includes("verifier");
  const rutaTecnica = requiereRevision
    ? capacidades.verifier === true ? "metodo-y-revision-final" : "revision-pendiente"
    : "directa";
  const razonRuta = rutaTecnica === "directa"
    ? "La instrucción coincide con una excepción textual finita, sin metadatos de alcance ni efectos solicitados."
    : capacidades.verifier === true
      ? "La ruta requiere revisi\u00f3n final y el host inform\u00f3 un verificador disponible."
      : "La ruta requiere revisi\u00f3n final y el host no inform\u00f3 un verificador; no puede declararse conformidad.";
  const mensajeRuta = rutaTecnica === "directa"
    ? "Haré la tarea en una sola pasada, sin efectos adicionales."
    : rutaTecnica === "metodo-y-revision-final"
      ? "No tengo evidencia suficiente para omitir la revisión final; usaré el método y el verificador informado por el host."
      : "No tengo evidencia suficiente para omitir la revisión final y falta un verificador; no declararé conformidad.";
  const camposRuta = {
    ruta_tecnica: rutaTecnica,
    razon_ruta: razonRuta,
    revision_final: requiereRevision && capacidades.verifier === true,
    verificacion_requerida: requiereRevision,
    conformidad: null,
    efectos: { gasto: false, publicacion: false, acceso_archivos: false },
    ...(preferencia?.contextoCambioMaterial === true ? { requiere_revalidacion: true } : {}),
  };
  if (retomarModalidad && propuesta.id === modalidadPreferida && modalidadPreferida !== modalidad && faltantes.length === 0) {
    return {
      tipo: "oferta_forma_trabajo",
      disponible: true,
      modalidad: propuesta.id,
      motivo: null,
      tradeoff: null,
      alternativas: [],
      capacidades_faltantes: [],
      preferencia,
      ...camposRuta,
      ...camposContexto,
      requiere_eleccion: false,
      reanudada: true,
      mensaje: "Retomamos el trabajo " + nombrePersona(propuesta) + ", ya elegida para esta operación. "
        + "El contexto sigue estable; conservo las herramientas elegidas para esta operación."
        + (requiereRevision ? " La entrega requiere revisión final." : ""),
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
      modalidad: retomarPreferencia ? propuesta.id : null,
      modalidad_solicitada: modalidadPreferida ?? modalidad,
      motivo: motivo.trim(),
      tradeoff: tradeoff.trim(),
      capacidades_faltantes: faltantes,
      alternativas: opcionesAlternativas,
      preferencia,
      ...camposRuta,
      ...(requiereRevision && capacidades.verifier !== true ? { bloqueo: "Falta un verificador para declarar conformidad." } : {}),
      ...camposContexto,
      requiere_eleccion: puedeElegir,
      bloqueada: !puedeElegir,
      mensaje: puedeElegir
        ? (retomarPreferencia
          ? "La opción que elegiste necesita los roles de " + faltantes.map(nombreRol).join(", ") + ", que ahora no están disponibles. Puedo ofrecer " + nombresAlternativas.join(", ") + "; tu preferencia se conserva. ¿Cuál prefieres?"
          : "No recomiendo " + propuesta.nombre + ": faltan capacidades (" + faltantes.join(", ") + "). Puedo ofrecer " + nombresAlternativas.join(", ") + ". ¿Cuál prefieres?")
        : requiereRevision && capacidades.verifier !== true
          ? "No seguir\u00e9 con esta entrega hasta contar con una revisi\u00f3n final. Faltan " + faltantes.map(nombreRol).join(", ")
            + (preferencia?.contextoCambioMaterial === true ? "; el contexto cambi\u00f3 materialmente y hay que revalidar." : ". No afirmar\u00e9 que cumple.")
          : "No puedo ofrecer " + propuesta.nombre + ": faltan capacidades (" + faltantes.join(", ") + ") y no hay una alternativa disponible.",
    };
  }

  if (opcionesAlternativas.length === 0 && faltantes.length === 0 && !rutaAlternativa && modalidad !== null && !criterio.simple) {
    throw new Error("una recomendación debe incluir al menos una alternativa disponible");
  }

  const contextoCambioMaterial = preferencia?.mismaOperacion === true
    && preferencia.contextoCambioMaterial === true;
  const retomaSinPregunta = preferencia?.mismaOperacion === true
    && retomarModalidad
    && !contextoCambioMaterial;
  const seleccionAutomatica = preferencia?.contextoCambioMaterial !== true && (modalidad === null || criterio.simple || rutaAlternativa);
  const cambioDeRutaGuardada = rutaAlternativa && Boolean(modalidadPreferida);
  const motivoTexto = sinPuntuacionFinal(motivo.trim());
  const costeTexto = sinPuntuacionFinal(tradeoff.trim());
  const mensajeBase = "Para esta tarea recomiendo " + nombrePersona(propuesta) + " porque " + motivoTexto
    + ". Coste: " + costeTexto + ". Alternativas: " + nombresAlternativas.join(", ") + ". "
    + fundamentoTexto + skillsTexto;
  const modalidadAnterior = detectarFormaTrabajo({ modalidad: modalidadPreferida });
  const mensajePreferencia = cambioDeRutaGuardada
    ? "La modalidad ya elegida requiere " + faltantesPreferencia.map(nombreRol).join(", ") + ", que no está disponible. Propongo " + nombrePersona(propuesta) + "; tu preferencia se conserva. "
    : retomaSinPregunta
      ? "Seguimos con " + nombrePersona(propuesta) + ", modalidad ya elegida para esta operación. "
      : preferencia?.mismaOperacion === true && contextoCambioMaterial
        ? "El contexto cambió materialmente desde la decisión anterior. La modalidad anterior era "
        + (modalidadAnterior ? nombrePersona(modalidadAnterior) : "la modalidad guardada")
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
    ...camposRuta,
    ...camposContexto,
    requiere_eleccion: cambioDeRutaGuardada || (!retomaSinPregunta && !seleccionAutomatica),
    mensaje: seleccionAutomatica
      ? mensajePreferencia + mensajeRuta + (modalidad === null && !contextoCambioMaterial ? " Motivo: " + motivo.trim() + ". Coste: " + tradeoff.trim() + "." : "")
      : "Vamos paso a paso. " + mensajePreferencia + mensajeBase + (retomaSinPregunta ? "" : " \u00bfC\u00f3mo prefieres avanzar?"),
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
  for (const campo of ["fuentes", "entregables", "acciones"]) {
    if (contexto[campo] !== undefined && (!Array.isArray(contexto[campo]) || contexto[campo].some((item) => typeof item !== "string" || !item.trim()))) {
      throw new Error(`contexto.${campo} debe ser una lista de textos no vacíos`);
    }
  }

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
    fuentes: (contexto.fuentes ?? []).map((item) => item.trim()),
    entregables: (contexto.entregables ?? []).map((item) => item.trim()),
    acciones: (contexto.acciones ?? []).map((item) => item.trim()),
    pistasPertinentes,
    pistasDescartadas,
    motivoSinPistas,
    catalogoSkillsOrigen: contexto.catalogoSkillsOrigen.trim(),
    catalogoSkills: catalogo,
    catalogoSkillIds: catalogo.map((skill) => skill.id),
    skillsSugeridas,
  };
}

import { isIntegratedSparkReceipt } from "./core/vespi.mjs";

export function reviewSparks(receipt, reviews) {
  const sparks = receipt?.sparks;
  if (!isIntegratedSparkReceipt(receipt) || !Array.isArray(sparks) || sparks.length !== 5) throw new Error("spark review needs an authentic accepted integration receipt");
  if (!Array.isArray(reviews) || reviews.length !== 5) throw new Error("spark review needs one disposition per spark");
  const result = { dead: [], mutated: [], promoted: [] };
  reviews.forEach((review, index) => {
    if (review?.text !== sparks[index] || !["dead", "mutated", "promoted"].includes(review.disposition)) throw new Error("spark review must match the integrated sparks and use dead, mutated or promoted");
    result[review.disposition].push({ index, text: review.text });
  });
  return result;
}
