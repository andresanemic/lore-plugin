<p align="center">
  <img src="https://i.imgur.com/6u3Cnkw.png" alt="Lore" width="100%">
</p>

# Lore

**Un kit de desarrollo guiado por especificaciones para constructores humanistas.**

Lore persigue el mismo objetivo que los kits de SDD (*Spec-Driven Development*) centrados en ingeniería: hacer que un agente de programación con IA trabaje a partir de criterios duraderos y explícitos, en lugar de tener que volver a deducirlos en cada sesión. Sin embargo, nombra esa disciplina desde otro registro: *lore, identidad, principios, transmutación, destilación*. Su vocabulario es lingüístico, epistemológico y comunicacional, más que puramente mecánico, porque el problema que resuelve es el de los **criterios compartidos entre un ser humano y un modelo**, no solo el de la configuración.

Mientras otros kits te entregan una estructura, Lore te ofrece una forma de **capturar los criterios adquiridos con esfuerzo que normalmente se evaporan cuando una sesión termina**: las cicatrices, los estándares, los "nunca volvamos a hacer esto", y conservarlos como pistas invariantes que restringen cada decisión futura.

---

## Qué es

Lore es un pequeño conjunto de convenciones junto con cinco *skills* para Claude Code que las operan.

**La convención — el estándar de los seis artefactos.** Los criterios de cada proyecto viven exactamente en estos documentos:

| Artefacto | Contiene | Ubicación |
|---|---|---|
| `identidad.md` | Qué es el proyecto, su propósito y su estándar mínimo de calidad (la estrella del norte). | `lore/` |
| `principios.md` | Leyes invariantes (técnicas y de negocio): prohibiciones e imperativos. | `lore/` |
| Módulos temáticos | Cicatrices técnicas organizadas por tema (animaciones, layout, scroll, etc.) como pistas invariantes. | `lore/` |
| `index.md` | Mapa de navegación del lore: una línea por patrón. | `lore/` |
| `FASES.md` | Estado y planificación del proyecto (fase actual, foco). | raíz |
| `CLAUDE.md` | El contrato, reducido a referencias (nunca duplica criterios). | raíz |

La regla que diferencia a Lore de un README es simple: **si una frase no restringe una decisión futura, no es Lore.** Los criterios permanecen; la descripción y el estado del proyecto no pertenecen al lore.

---

## Cómo funciona

Lore escala mediante **áreas de trabajo**. Un *área* es una carpeta madre con su propio `lore/`; los *proyectos* viven dentro de ella e heredan ese lore. Los criterios genéricos existen una sola vez, en el área; cada proyecto conserva únicamente aquello que le es propio y referencia el área para compartir el estándar común.

El flujo cotidiano, con los *skills* ejecutándose automáticamente según sus disparadores, es el siguiente:

1. **`create-area`** — crea una carpeta madre para una familia de proyectos, con su propio Lore.
2. **`create-project`** — crea un proyecto dentro de un área; hereda el lore del área (DRY: referencia los módulos del área en lugar de copiarlos) y deriva su estructura a partir de tus documentos fuente.
3. **`save-to-lore`** — di *"save to lore"* después de resolver algo que valga la pena conservar. La pista se captura en el proyecto y, si es genérica y está confirmada, se propone promoverla al **área** para que todos los proyectos la hereden. Las particularidades específicas permanecen en el proyecto. Este flujo proyecto ↔ área es el núcleo del crecimiento del corpus compartido sin introducir ruido.
4. **`transmute-lore`** — lleva un proyecto antiguo y desestructurado al estándar (*modo add*), o elimina de un proyecto los módulos redundantes que ya pertenecen al área (*modo clean*).

Y **`using-lore`** es el *skill* de entrada: léelo primero para comprender el modelo y elegir el *skill* adecuado.

---

## Instalación

**Claude Code (recomendado):**

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

**Otras herramientas de IA.** El componente portátil es el propio archivo `SKILL.md`: un *frontmatter* YAML (`name`, `description`) seguido de un cuerpo en Markdown. El empaquetado del plugin (`plugin.json`, `marketplace.json`) es específico de Claude Code, pero los *skills* son simplemente archivos Markdown.

Para adaptar Lore a otra herramienta:

- Copia la carpeta de un *skill* desde `skills/` al directorio de instrucciones que utilice tu herramienta.
- O pega el contenido del *skill* como *system prompt* o *persona prompt*.

El estándar de los seis artefactos y el modelo área ↔ proyecto son convenciones independientes de cualquier herramienta; no son código.

---

## Qué incluye

```text
lore-plugin/
  .claude-plugin/
    plugin.json          manifiesto del plugin
    marketplace.json     catálogo del marketplace
  skills/
    using-lore/          el mapa: el modelo y qué skill usar en cada caso
    create-area/         crea una nueva área de trabajo con su propio Lore
    create-project/      crea un proyecto heredando el Lore del área
    save-to-lore/        captura una pista; decide si pertenece al proyecto o al área
    transmute-lore/      migra un proyecto antiguo (add) o limpia módulos redundantes (clean)
  README.md
  LICENSE
```

| Skill | Qué hace |
|---|---|
| `using-lore` | Explica el modelo de Lore y te guía hacia el *skill* correcto. Debe leerse primero. |
| `create-area` | Crea la carpeta madre de un dominio con su propio Lore de área. |
| `create-project` | Crea un proyecto dentro de un área, heredando el Lore del área (DRY). |
| `save-to-lore` | Captura un aprendizaje en el proyecto y promueve las pistas genéricas y confirmadas al área. |
| `transmute-lore` | Lleva un proyecto disperso al estándar o elimina módulos redundantes. |

Todos los *skills* comparten las mismas invariantes:

- **Los criterios nunca se inventan** (solo se destilan a partir de lo que ya existe).
- **El ruido descartado se reporta**, nunca se elimina silenciosamente.
- Existe un **HARD-GATE** antes de escribir cualquier cambio.
- **Nada se confirma automáticamente** (*commit*): tú revisas el *diff* y decides.

---

## Origen y filosofía

Lore es una destilación de **LUS** (*Lore + Usuario System*), un programa de investigación sobre cómo un ser humano y una IA acumulan criterios compartidos a lo largo de múltiples sesiones: la teoría del **"Entre"**.

Este plugin es el kit operativo que surgió de esa investigación; la teoría permanece en LUS.

Su vocabulario no es un adorno. Varias de las referencias fundamentales del programa se reflejan directamente en la mecánica del kit:

- **Martin Buber**, *Yo y Tú* (*Ich und Du*, 1923): el **Entre**. El conocimiento no reside ni en el prompt ni en el modelo, sino en la relación entre ambos.
- **Claude Shannon** y **Warren Weaver**, *The Mathematical Theory of Communication* (1949): la destilación como reducción del ruido. Los registros en bruto aumentan la entropía; una pista es la señal que permanece.
- **Gregory Bateson**, *Steps to an Ecology of Mind* (1972): "una diferencia que produce una diferencia". Si un hecho guardado no restringe una acción futura, no es información: es ruido. Ese es el criterio para identificar una pista invariante.
- **Andy Clark** y **David Chalmers**, *The Extended Mind* (1998): el lore como una extensión externa y acoplada de los propios criterios del constructor.

Puedes explorar la investigación en **LUS NotebookLM**:

https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b794509

---

## Licencia

MIT — consulta `LICENSE`.

# Lore

**A spec-driven development kit for humanist builders.**

Lore pursues the same goal as engineering-first SDD kits — make an AI coding agent work from
durable, explicit criteria instead of re-deriving everything each session — but it names the
discipline in a different register: *lore, identity, principles, transmutation, distillation*. The
vocabulary is linguistic, epistemic, communicational rather than purely mechanical, because the
problem it solves is one of **shared criteria between a human and a model**, not just configuration.

Where other kits give you scaffolding, Lore gives you a way to **capture the hard-won criteria that
usually evaporates when a session ends** — the scars, the standards, the "never do this again" — and
keep it as invariant clues that constrain every future decision.

---

## What it is

Lore is a small set of conventions plus five Claude Code skills that operate them.

**The convention — the six-artifact standard.** Every project's criteria lives in exactly these:

| Artifact | Holds | Location |
|---|---|---|
| `identidad.md` | What the project is, its purpose, its quality floor (the north star). | `lore/` |
| `principios.md` | Invariant laws (technical + business): prohibitions and imperatives. | `lore/` |
| Thematic modules | Technical scars by topic (animation, layout, scroll…) as invariant clues. | `lore/` |
| `index.md` | Navigation map of the lore: one line per pattern. | `lore/` |
| `FASES.md` | The project's state and plan (current phase, focus). | root |
| `CLAUDE.md` | The contract, slimmed to pointers (never duplicated criteria). | root |

The rule that separates Lore from a README: **if a sentence does not constrain a future decision,
it is not Lore.** Criteria persists; description and state do not belong in it.

---

## How it works

Lore scales through **work areas**. An *area* is a mother folder with its own `lore/`; *projects*
live inside it and inherit that lore. Generic criteria lives once, in the area; a project keeps only
what is its own and points to the area for the shared standard.

The everyday flow, with skills firing automatically on their triggers:

1. **`create-area`** — start a mother folder for a family of projects, with its own Lore.
2. **`create-project`** — start a project inside an area; it inherits the area's lore (DRY: it
   references the area's modules instead of copying them) and derives its structure from your source
   documents.
3. **`save-to-lore`** — say *"save to lore"* after solving something worth keeping. The clue is
   captured in the project, and if it is generic and confirmed it is proposed for promotion up to
   the **area** so every project inherits it. Project-specific quirks stay in the project. This
   project ↔ area routing is the core of how the shared corpus grows without noise.
4. **`transmute-lore`** — bring an old, unstructured project up to the standard (*add* mode), or
   strip a project's redundant modules back down to what the area already owns (*clean* mode).

And **`using-lore`** is the entry skill: read it first to learn the model and pick the right skill.

---

## Installation

**Claude Code (recommended):**

```
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

**Other AI tools.** The portable substrate is the `SKILL.md` file itself — YAML frontmatter
(`name`, `description`) plus a Markdown body. The plugin packaging (`plugin.json`,
`marketplace.json`) is Claude Code-specific, but the skills are plain Markdown. To adapt Lore to
another tool: copy a skill's folder from `skills/` into whatever instruction directory your tool
reads, or paste a skill body as a system/persona prompt. The six-artifact standard and the
area↔project model are tool-agnostic conventions, not code.

---

## What's inside

```
lore-plugin/
  .claude-plugin/
    plugin.json          plugin manifest
    marketplace.json      marketplace catalog
  skills/
    using-lore/          the map: model + which skill to use when
    create-area/         scaffold a new work area with its own Lore
    create-project/      scaffold a new project inheriting the area's Lore
    save-to-lore/        capture a clue; route project vs area (promotion)
    transmute-lore/      migrate an old project (add) / clean redundant modules (clean)
  README.md
  LICENSE
```

| Skill | What it does |
|---|---|
| `using-lore` | Explains the Lore model and routes you to the right skill. Read first. |
| `create-area` | Creates the mother folder of a domain with its own area Lore. |
| `create-project` | Creates a project inside an area, inheriting the area Lore (DRY). |
| `save-to-lore` | Captures a lesson into the project and promotes generic, confirmed clues to the area. |
| `transmute-lore` | Lifts a scattered project to the standard, or cleans redundant modules. |

Every skill shares the same invariants: **criteria is never invented** (only distilled from what
exists), **discarded noise is reported** not silently dropped, there is a **HARD-GATE** before
writing, and **nothing is committed automatically** — you review the diff and decide.

---

## Origin & philosophy

Lore is a distillation of **LUS** (*Lore + Usuario System*), a research program on how a human and
an AI accumulate shared criteria across sessions — the theory of the *"Entre"* (the "between"). This
plugin is the operational kit that fell out of that research; the theory stays in LUS.

The vocabulary is not decoration. A handful of the program's foundational references map directly
onto the kit's mechanics:

- **Martin Buber**, *Ich und Du* (1923) — the *Entre*: knowledge lives neither in the prompt nor in
  the model, but in the relation between them.
- **Claude Shannon & Warren Weaver**, *The Mathematical Theory of Communication* (1949) — distillation
  as noise reduction: raw logs raise entropy; a clue is the signal kept.
- **Gregory Bateson**, *Steps to an Ecology of Mind* (1972) — "a difference that makes a difference":
  if a saved fact does not constrain future action, it is not information, it is noise. This is the
  test for an invariant clue.
- **Andy Clark & David Chalmers**, *The Extended Mind* (1998) — the lore as an external, coupled
  extension of the builder's own criteria.

You can read [LUS NotebookLM](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b794509).

---

## License

MIT — see [LICENSE](LICENSE).
