# Plugin Lore – Referencia

Este documento es la referencia técnica del **plugin Lore** para Claude Code.  
Define los conceptos centrales de Lore, los skills disponibles, los artefactos en Markdown y cómo encajan entre sí.

Para una guía práctica de “cómo usarlo en el día a día”, consulta [`USAGE_es.md`](./USAGE_es.md).  
Para una visión conceptual y la filosofía del proyecto, consulta el [`README.md`](./README.md).

---

## 1. Conceptos centrales

Lore se construye sobre un conjunto pequeño de conceptos:

- **Criterio** – Reglas y restricciones que deberían influir decisiones futuras.
- **Pistas Invariantes** – Pequeñas piezas de criterio destilado que siguen siendo útiles incluso cuando el contexto original desaparece.
- **Áreas** – Carpetas madre que poseen Lore compartido; los proyectos heredan su criterio.
- **Proyectos** – Bases de código individuales con su propio Lore, heredando de un Área.
- **Artefactos** – Archivos Markdown que estructuran y almacenan criterio y estado de proyecto.

La documentación tradicional almacena información.  
Lore almacena criterio que restringe lo que debería ocurrir después.

---

## 2. Resumen de skills

El plugin Lore expone cinco skills principales en Claude Code:

| Skill            | Propósito                                     | Frase disparadora típica                                   |
|------------------|-----------------------------------------------|------------------------------------------------------------|
| `using-lore`     | Punto de entrada, navegación y ayuda          | Se lee primero; se dispara al mencionar “lore” o al empezar una Área/proyecto |
| `create-area`    | Crear una nueva Área con Lore compartido      | «crea un área de trabajo para Frontend», «quiero empezar a trabajar en X con Lore» |
| `create-project` | Crear un proyecto que hereda de un Área       | «crea un proyecto de Sitio de marketing en el área Frontend» |
| `save-to-lore`   | Capturar criterio tras resolver un problema   | «guarda en lore», «destila esto en el lore»                |
| `transmute-lore` | Migrar proyectos existentes hacia Lore        | «transmuta el lore del Frontend heredado» (add) / «limpia el lore del Frontend heredado» (clean) / «estandariza el idioma del lore del Frontend heredado» (translate) |

Cada skill opera sobre, o crea, artefactos Markdown específicos dentro de tu repositorio.

**Idioma:** los skills están escritos en inglés, pero el Lore que generan se escribe siempre en el
**idioma del usuario** — tanto el contenido como los nombres de los artefactos. `identidad.md`,
`principios.md`, `FASES.md`, `proyectos/` son las formas canónicas en español (y así aparecen en
este documento); en inglés, por ejemplo, serían `identity.md`, `principles.md`, `PHASES.md`,
`projects/`. Permanecen fijos en todos los idiomas: `CLAUDE.md`, `lore/`, `index.md`,
`golden-paths.md`, la profundidad de las rutas relativas y los términos técnicos de uso general en
inglés (workflow, commit, stack, scaffold…). Dentro de un corpus existente mandan los nombres ya
establecidos. Un Lore en el idioma equivocado se estandariza con `transmute-lore` en modo
`translate`.

Estos skills **no son comandos de una CLI**: son *skills* de Claude Code que se disparan por lenguaje natural según la frase que uses, no por flags o sintaxis de terminal. Las frases de la tabla son ejemplos de invocación real, tomadas de los disparadores documentados en cada `SKILL.md`.

---

## 3. Detalle de skills

### 3.1 `using-lore`

**Rol:** Punto de entrada a Lore.

**Responsabilidades:**

- Explicar la arquitectura de Lore para el proyecto o Área actual.
- Mostrar qué artefactos existen y cómo están estructurados.
- Dirigirte al skill adecuado según tu intención.

**Interacciones típicas:**

- «Explícame la estructura de Lore de este repositorio.»
- «¿Qué artefactos existen para este proyecto?»
- «¿Qué skill debería usar para capturar una nueva pista invariante?»

Usa `using-lore` siempre que no tengas claro dónde empezar.

---

### 3.2 `create-area`

**Rol:** Inicializar una raíz de Lore compartida para un dominio (Área).

**Entrada:**

- Nombre del Área (por ejemplo, `"Desarrollo Frontend"`).

**Crea / actualiza:**

- Carpeta `lore/` a nivel Área, con:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos bajo `lore/`, según se necesiten.
- `CLAUDE.md` y `FASES.md` a nivel Área (contrato y registro de proyectos).
- Una carpeta `proyectos/` vacía, donde nacerán los proyectos futuros.
- Una carpeta `_starter/` con las plantillas de proyecto ajustadas al dominio del Área
  (`CLAUDE.template.md`, `FASES.md` y, si aplica, `golden-paths.template.md`, más cualquier
  scaffold de código base). `create-project` instancia estas plantillas al crear cada proyecto.

**Responsabilidades:**

- Establecer un lugar donde viva el criterio compartido de un dominio.
- Proporcionar el esqueleto (`_starter/`) que los proyectos instancian.

Usa `create-area` cuando quieras que varios proyectos compartan el mismo criterio fundamental.

---

### 3.3 `create-project`

**Rol:** Inicializar Lore específico de un proyecto que hereda de un Área.

**Entrada:**

- Nombre del proyecto (por ejemplo, `"Landing Lore"`).
- Nombre del Área (por ejemplo, `"Desarrollo Frontend"`).

**Crea / actualiza:**

- La carpeta del proyecto, siempre en `{área}/proyectos/{slug}/` — nunca directamente bajo el Área.
- Si el Área tiene una carpeta `_starter/`, instancia sus plantillas (y cualquier scaffold de
  código) en el proyecto en lugar de partir de cero.
- Artefactos a nivel proyecto:
  - `lore/identidad.md` y `lore/principios.md`, con **su propio** contenido primero y un puntero
    al estándar del Área después.
  - `lore/index.md`, que referencia los módulos temáticos del Área por ruta relativa
    (`../../../lore/<módulo>.md` — tres niveles, no dos).
  - `FASES.md` (raíz) para estado actual y hoja de ruta.
  - `CLAUDE.md` (raíz) para contrato de colaboración y referencias operativas.
- Registra el nuevo proyecto en el `FASES.md` del Área.

**Responsabilidades:**

- Dar al proyecto un lugar donde almacenar **su propio** criterio y estado.
- Evitar duplicar módulos temáticos ya definidos a nivel Área (se referencian, no se copian).

Usa `create-project` siempre que arranques una nueva base de código dentro de un Área existente.

---

### 3.4 `save-to-lore`

**Rol:** Destilar la experiencia recién adquirida en criterio reutilizable.

**Entrada:**

- Una descripción corta del problema, decisión o aprendizaje (por ejemplo, `"Bug de hidratación en landing de Next.js"`).

**Proceso (conceptual):**

1. Preguntar por contexto: qué ocurrió, qué se intentó, qué funcionó al final.
2. Extraer **Pistas Invariantes**:
   - Restricciones que deberían afectar decisiones futuras.
   - Reglas válidas más allá del incidente específico.
3. Decidir dónde guardarlas:
   - Módulos de proyecto bajo `lore/`.
   - `principios.md` a nivel Área para reglas generales.
   - Actualizaciones en `identidad.md` o `CLAUDE.md` si cambian identidad o colaboración.

**Umbral de Lore (disparo proactivo):** para que Claude proponga guardar algo sin que se lo pidas,
deben cumplirse las 4 condiciones a la vez: **restricción** (prohíbe un error futuro o exige un
estándar), **señal** (destilable a Contexto → Causa → Pista, sin logs crudos), **ejecutabilidad**
(una directriz inequívoca) y **genericidad** (le serviría a otro proyecto del Área). Cambios
cosméticos no cuentan.

**Sistema de confianza:** cada pista se guarda como `conjecture` (por defecto) o `confirmed` (solo
si se validó realmente en la app en marcha). Nunca se infla a `confirmed` solo para forzar una
promoción.

**Ruteo y promoción:** el criterio se captura primero en el proyecto; solo lo **confirmado y
genérico** se propone para promoción al `lore/` del Área (nunca se escribe el Área en silencio).
En el `index.md` del proyecto, una línea ya promovida se marca con el glifo ` · ↑` — re-ejecutar el
skill sobre esa pista es un no-op seguro (idempotencia).

**Invariantes:**

- El criterio nunca se inventa.
- Todo proviene de experiencia real.
- El ruido descartado se informa; nunca se elimina en silencio.
- Todo cambio pasa por un HARD-GATE antes de escribirse.
- Nada hace commit automáticamente; nunca se hace `git push`.
- Un ser humano siempre revisa el *diff* final.

Usa `save-to-lore` como mecanismo principal para alimentar tu Lore tras decisiones importantes.

---

### 3.5 `transmute-lore`

**Rol:** Migrar proyectos existentes hacia la arquitectura Lore.

**Entrada:**

- Nombre del proyecto (por ejemplo, `"Frontend heredado"`).
- Modo, inferido de la frase (no de un flag):
  - `add` – «transmuta el lore de {proyecto}», «este proyecto viejo no está en el formato nuevo» — crea artefactos de Lore que aún no existen.
  - `clean` – «limpia el lore de {proyecto}» — elimina módulos temáticos del proyecto que ya duplican los del Área.
  - `translate` – «estandariza el idioma del lore de {proyecto}», «traduce el lore de {proyecto} a {idioma}» — estandariza el idioma de todos los artefactos del Lore: contenido y nombres de archivo.

**Precondición de seguridad (Fase 0, los tres modos):** el repositorio del proyecto debe tener el
árbol de git limpio. Si hay cambios sin commitear, el skill se detiene y pide hacer commit o
`stash` primero, para que la transmutación aterrice como un *diff* revisable.

**Proceso — modo `add` (conceptual):**

1. Inventariar las fuentes de criterio existentes: `CLAUDE.md`/`AGENTS.md` (suele ser el mayor
   depósito de criterio mezclado), `README.md`, un `lore/` viejo o incompleto, `incidents/`,
   comentarios de código con señales como "nunca", "siempre", "WARNING".
2. Separar **criterio** (restringe una decisión futura) de **ruido** (solo describe).
3. Proponer cómo mapear ese criterio a:
   - `identidad.md`, `principios.md`, `index.md`, módulos temáticos bajo `lore/`.
   - `FASES.md` y `CLAUDE.md` en la raíz.
4. Presentar el mapeo completo (contenido real, no solo una tabla de rutas) y **esperar aprobación
   explícita** antes de escribir nada (HARD-GATE).

**Proceso — modo `clean` (conceptual):**

1. Requiere que el proyecto tenga una **Área madre** (`{área}/proyectos/{slug}/`); si es standalone,
   `clean` no aplica y así se informa.
2. Comparar cada módulo temático del proyecto contra su contraparte en `{área}/lore/`: si toda pista
   del módulo del proyecto ya está en el Área, el módulo es redundante y se puede eliminar.
3. Cualquier pista que **no** esté en el Área se reporta (no se borra) para que el usuario decida.
4. **Nunca elimina** `identidad.md`, `principios.md` ni `index.md` — solo módulos temáticos
   redundantes. Reescribe `index.md` para que apunte a los módulos del Área.

**Proceso — modo `translate` (conceptual):**

1. Resolver el **idioma destino**: el que pidas; si no lo indicas, tu propio idioma.
2. Inventariar el idioma actual de cada artefacto del ámbito (`lore/*.md`, `FASES.md`, `CLAUDE.md`,
   `golden-paths.md` si existe), incluyendo los que estén mezclados.
3. Presentar el plan archivo por archivo — incluyendo los **renombrados** de artefactos
   localizables (p. ej. `identidad.md` ↔ `identity.md`, `FASES.md` ↔ `PHASES.md`) — y **esperar
   aprobación explícita** antes de escribir (HARD-GATE), indicando lo que NO se traduce ni se
   renombra: `CLAUDE.md`, `lore/`, `index.md`, `golden-paths.md`, bloques de código,
   identificadores, mensajes de error citados, marcadores de confianza (`conjecture`/`confirmed`),
   el glifo ` · ↑`, términos técnicos de uso general en inglés y nombres propios. Renombrar
   `proyectos/` es opcional y se propone aparte (puede haber referencias externas a esa ruta).
4. Traducir **preservando el significado**: es una traducción, nunca una reescritura — ninguna
   pista se añade, se elimina ni se reinterpreta. Los renombrados se aplican con `git mv` y se
   reescribe todo enlace que toque un archivo renombrado, sin dejar enlaces rotos. Los matices
   ambiguos se reportan, no se adivinan.
5. Límite de ámbito: traducir un proyecto no toca el `lore/` de su Área (y viceversa); si el otro
   nivel está en un idioma distinto, se informa el desajuste. Excepción: la integridad de enlaces
   sí cruza el límite — al renombrar módulos de un Área se actualizan (o reportan) los enlaces de
   sus proyectos hacia esos archivos.

En los tres modos, `transmute-lore` **no hace commit del proyecto destino**: el *diff* queda para que
el usuario lo revise y decida.

Usa `transmute-lore` cuando ya tienes proyectos en marcha y quieres incorporarlos a Lore sin reconstruirlo todo desde cero.

---

## 4. Especificación de artefactos

Lore usa un conjunto fijo de artefactos Markdown para mantener el criterio estructurado.

### 4.1 `lore/identidad.md`

**Ámbito:** Área o proyecto.

**Propósito:**

- Definir la identidad del proyecto o Área.
- Capturar el estándar mínimo de calidad que debe cumplirse.

**Contenido típico:**

- Nombre y descripción.
- Intención central y audiencia.
- Barrera mínima de calidad (por ejemplo, «Nunca introducir regresiones visibles para el usuario en producción»).

**Guías:**

- Mantén este archivo breve y estable.
- Solo actualízalo cuando la identidad o los estándares cambien de verdad.

---

### 4.2 `lore/principios.md`

**Ámbito:** Área (y, a veces, proyecto).

**Propósito:**

- Almacenar reglas permanentes de ingeniería y negocio.

**Contenido típico:**

- Principios arquitectónicos (por ejemplo, «Preferir renderizado estático en páginas de marketing»).
- Reglas de negocio que moldean decisiones técnicas.
- Restricciones que aplican a varios proyectos.

**Guías:**

- Prefiere principios claros y accionables frente a eslóganes abstractos.
- Mueve reglas muy específicas a módulos temáticos en lugar de saturar este archivo.

---

### 4.3 Módulos temáticos bajo `lore/`

**Ámbito:** Proyecto y Área.

**Propósito:**

- Agrupar experiencia destilada por dominio.

**Ejemplos:**

- `frontend-rendering.md`
- `error-handling.md`
- `data-modeling.md`
- `deployment-and-ops.md`

**Contenido típico:**

- Pistas Invariantes relacionadas con ese dominio.
- Fragmentos breves de contexto sólo cuando son necesarios para entender una regla.

**Guías:**

- Cada módulo debería enfocarse en un solo dominio o preocupación.
- Si un módulo crece demasiado, considera dividirlo.

---

### 4.4 `lore/index.md`

**Ámbito:** Área o proyecto.

**Propósito:**

- Actuar como mapa de navegación del Lore.

**Contenido típico:**

- Estructura de alto nivel:
  - enlaces a `identidad.md` y `principios.md`;
  - lista de módulos temáticos con descripciones cortas.
- Punteros a artefactos a nivel proyecto y Área.

**Guías:**

- Mantén este archivo actualizado al añadir o renombrar módulos.
- Haz que sea fácil para alguien nuevo saber dónde buscar un tema concreto.

---

### 4.5 `FASES.md`

**Ámbito:** Proyecto (nivel raíz).

**Propósito:**

- Describir el estado actual y la hoja de ruta del proyecto.

**Contenido típico:**

- Fase actual (por ejemplo, «Exploración», «MVP», «Escalado»).
- Objetivos y restricciones activas.
- Hitos próximos relevantes para criterio y decisiones.

**Guías:**

- Actualiza este archivo cuando el proyecto avance de fase.
- Usa descripciones concisas y basadas en hechos.

---

### 4.6 `CLAUDE.md`

**Ámbito:** Proyecto (nivel raíz).

**Propósito:**

- Definir el contrato de colaboración entre humanos y Claude (u otras herramientas de IA).
- Almacenar referencias operativas para trabajo asistido por IA.

**Contenido típico:**

- Cómo se espera usar Claude en el proyecto.
- Restricciones innegociables para las sugerencias de IA (por ejemplo, «Nunca saltarse la revisión de código»).
- Punteros a prompts, flujos de trabajo y mecanismos de seguridad.

**Guías:**

- Piensa en este archivo como el “acuerdo de trabajo” para la colaboración humano–IA.
- Mantén el contenido explícito y práctico.

---

### 4.7 `golden-paths.md` (opcional)

**Ámbito:** Proyecto o Área (nivel raíz).

**Propósito:**

- Documentar las rutas/flujos críticos que deben verificarse manualmente (por ejemplo, rutas web
  clave en un Área de frontend).

No es uno de los seis artefactos obligatorios: `create-area` y `create-project` solo lo generan
cuando el dominio lo justifica (por ejemplo, un Área web con rutas críticas). Si el dominio no lo
necesita, simplemente no existe.

---

## 5. Estructura de archivos

Una estructura típica de Lore, con Área y proyecto, se ve así:

```text
{área}/
  lore/
    identidad.md
    principios.md
    index.md
    <módulos-temáticos>.md
  _starter/                    → plantillas que create-project instancia
    CLAUDE.template.md
    FASES.md
    golden-paths.template.md   → solo si el dominio lo justifica
  FASES.md                     → registro de proyectos del Área
  CLAUDE.md                    → contrato del Área

  proyectos/
    {slug}/
      lore/
        identidad.md            → contenido propio + puntero al del Área
        principios.md           → contenido propio + puntero al del Área
        index.md                → apunta a los módulos del Área por ../../../lore/<módulo>.md
        <módulos propios>.md    → solo criterio específico de este proyecto
      FASES.md
      CLAUDE.md
```

Puntos clave de esta jerarquía:

- Los proyectos **siempre** viven en `{área}/proyectos/{slug}/`, nunca directamente bajo el Área.
- Los módulos temáticos genéricos **no se copian** al proyecto: viven una sola vez en
  `{área}/lore/`, y el `index.md` del proyecto los referencia por ruta relativa. Esa ruta sube
  **tres** niveles (`lore/` → `{slug}/` → `proyectos/` → `{área}/`), no dos.
- El criterio compartido vive en el Área. El criterio específico de proyecto vive en el proyecto.

---

## 6. Invariantes operativas

El comportamiento de Lore está gobernado por un conjunto de invariantes compartidas:

- **El Lore se escribe en el idioma del usuario** – contenido y nombres de artefactos; solo `CLAUDE.md`, `lore/`, `index.md`, `golden-paths.md` y los términos técnicos de uso general en inglés permanecen fijos.
- **El criterio nunca se inventa** – todas las reglas provienen de experiencia real.
- **Todo proviene de trabajo real** – experimentos, incidentes, decisiones.
- **El ruido descartado se informa** – nada se elimina en silencio.
- **Todo cambio pasa por un HARD-GATE** – el criterio debe revisarse antes de escribirse.
- **Nada hace commit automáticamente** – la revisión humana es obligatoria.
- **Un humano revisa siempre el diff final** – la IA asiste, pero no modifica Lore en secreto.

Estas invariantes distinguen a Lore de herramientas genéricas de notas o logs:  
el objetivo es mantener un cuerpo de criterio confiable, curado por humanos, del que la IA pueda depender.

---

## 7. Relación con README y otros docs

La documentación de Lore suele dividirse así:

- `README.md` – historia, motivación, visión de arquitectura, instalación y comparación de alto nivel con documentación tradicional.
- `USAGE_en.md` / `USAGE_es.md` – guías prácticas de uso y flujos de trabajo.
- `REFERENCE_en.md` / `REFERENCE_es.md` – esta referencia técnica del modelo.
- `MIGRATION_en.md` / `MIGRATION_es.md` – estrategias y ejemplos de migración para proyectos heredados.

Todos estos archivos viven en la raíz del repositorio (no hay una carpeta `docs/`).

Separar referencia de uso y narrativa facilita:

- Consultar el comportamiento exacto de un skill o la semántica de un artefacto.
- Mantener el README enfocado y legible.
- Evolucionar patrones de uso sin romper el modelo subyacente.
