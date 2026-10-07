// ofrece-formas-trabajo.mjs — El coordinador ofrece formas de trabajar al usuario.
// Primer corte: detecta la tarea y sugiere un workflow.

export const FORMAS_TRABAJO = [
  {
    id: "tdd",
    nombre: "TDD (Test-Driven Development)",
    descripcion: "Primero escribimos el test rojo, después el código que lo hace pasar.",
    cuandoUsar: "Implementar una feature o bugfix con pruebas automáticas.",
    pasos: [
      "1. Escribir test que falle (ROJO).",
      "2. Escribir código mínimo para que pase (VERDE).",
      "3. Refactorizar sin romper el test.",
      "4. Iterar.",
    ],
  },
  {
    id: "plan-maestro",
    nombre: "Plan Maestro",
    descripcion: "Definimos alcance, roles, tramos, evidencia y gates antes de construir.",
    cuandoUsar: "Proyectos complejos con múltiples piezas y dependencias.",
    pasos: [
      "1. Definir el goal y el alcance.",
      "2. Identificar roles (coordinador, daimon, advisor, worker).",
      "3. Dividir en tramos con evidencia de término.",
      "4. Establecer gates (terminado, verificado, certificado, cerrado).",
      "5. Ejecutar tramo por tramo.",
    ],
  },
  {
    id: "workflow-directo",
    nombre: "Workflow Directo",
    descripcion: "El kit ejecuta la tarea paso a paso sin planificación formal.",
    cuandoUsar: "Tareas simples o cuando se conoce el procedimiento.",
    pasos: [
      "1. Identificar la tarea.",
      "2. Ejecutar paso a paso.",
      "3. Verificar al final.",
    ],
  },
  {
    id: "spec-kit",
    nombre: "Spec-Kit (Especificación primero)",
    descripcion: "Escribimos la spec, después generamos el plan, después ejecutamos.",
    cuandoUsar: "Cuando el alcance no está claro o requiere arbitraje.",
    pasos: [
      "1. Escribir spec.md con requisitos.",
      "2. Generar plan.md desde la spec.",
      "3. Generar tasks.md desde el plan.",
      "4. Ejecutar tasks.",
    ],
  },
  {
    id: "loop-expansivo",
    nombre: "Loop Expansivo",
    descripcion: "El kit produce, arbitrar, destilar y absorber en ciclos recurrentes.",
    cuandoUsar: "Mejora continua del kit o del jardín.",
    pasos: [
      "1. Revisar experiencia y corpus.",
      "2. Probar o producir trabajo.",
      "3. Arbitrar lo aprendido.",
      "4. Absorber el criterio que sí puede participar.",
      "5. El resultado abre otra vuelta.",
    ],
  },
];

export function detectarFormaTrabajo({ tarea = null, complejidad = "media" }) {
  if (!tarea) return FORMAS_TRABAJO.find((f) => f.id === "workflow-directo");

  const lower = tarea.toLowerCase();

  // TDD: tareas de código con pruebas
  if (lower.includes("test") || lower.includes("prueba") || lower.includes("bug") || lower.includes("fix")) {
    return FORMAS_TRABAJO.find((f) => f.id === "tdd");
  }

  // Plan maestro: proyectos complejos
  if (lower.includes("proyecto") || lower.includes("plan") || complejidad === "alta") {
    return FORMAS_TRABAJO.find((f) => f.id === "plan-maestro");
  }

  // Spec-kit: alcance no claro
  if (lower.includes("spec") || lower.includes("requisito") || lower.includes("alcance")) {
    return FORMAS_TRABAJO.find((f) => f.id === "spec-kit");
  }

  // Loop expansivo: mejora continua
  if (lower.includes("mejora") || lower.includes("loop") || lower.includes("ciclo")) {
    return FORMAS_TRABAJO.find((f) => f.id === "loop-expansivo");
  }

  // Default
  return FORMAS_TRABAJO.find((f) => f.id === "workflow-directo");
}

export function ofrecerFormaTrabajo({ tarea = null, complejidad = "media" }) {
  const forma = detectarFormaTrabajo({ tarea, complejidad });
  if (!forma) return null;

  return {
    tipo: "oferta_forma_trabajo",
    forma,
    mensaje: `Para esta tarea, sugiero: **${forma.nombre}** — ${forma.descripcion}\n\nPasos:\n${forma.pasos.join("\n")}\n\n¿Quieres que procedamos así o prefieres otra forma?`,
  };
}
