<p align="center">
  <img src="https://i.imgur.com/6u3Cnkw.png" alt="Lore" width="100%">
</p>

# Lore

**Un kit de desarrollo guiado por especificaciones para constructores humanistas.**

*Deja de reconstruir tu criterio cada vez que comienzas una nueva sesión con IA.*

Todo proyecto desarrollado con inteligencia artificial acumula experiencia adquirida con esfuerzo:

- decisiones arquitectónicas,
- incidentes en producción,
- experimentos fallidos,
- estándares de desarrollo,
- y decenas de momentos de "nunca volvamos a hacer esto".

La mayor parte de esa experiencia desaparece.

La siguiente sesión comienza con una comprensión incompleta del proyecto, obligándote a ti —y a tu IA— a redescubrir decisiones que ya habías pagado con tiempo y esfuerzo.

**Lore existe para evitar eso.**

No generando más documentación.

Sino preservando el **criterio** que debe seguir participando en las decisiones futuras.

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

---

# ¿Qué es Lore?

Lore es un kit ligero de **Spec-Driven Development (SDD)** para Claude Code.

Proporciona:

- una convención sencilla para organizar el criterio de un proyecto;
- cinco *skills* que automatizan ese proceso;
- y un flujo continuo para destilar la experiencia en criterios reutilizables.

A diferencia de la documentación tradicional, Lore no intenta describirlo todo.

Solo conserva aquello que modifica el comportamiento futuro.

**Si una frase no restringe una decisión futura, no es Lore.**

---

# El problema: la experiencia efímera

La documentación tradicional responde preguntas como:

> ¿Qué es esto?

> ¿Cómo se instala?

> ¿Qué API debo utilizar?

Lore responde una pregunta completamente distinta:

> **¿Qué aprendimos que nunca deberíamos tener que volver a aprender?**

Esa diferencia lo cambia todo.

Un README almacena información.

Lore preserva criterio.

Y ese criterio continúa participando en decisiones futuras.

---

# El principio fundamental

Todo problema resuelto contiene dos cosas:

- la solución;
- y la razón por la que esa solución existe.

La mayoría de la documentación conserva únicamente la primera.

Lore conserva la segunda.

En lugar de registrar acontecimientos, Lore los destila en **Pistas Invariantes**: pequeñas restricciones que siguen siendo útiles mucho tiempo después de que el contexto original haya desaparecido.

Por ejemplo:

En lugar de recordar:

> "Tuvimos un problema de hidratación en Next.js."

Lore conserva:

> "Nunca utilices estado del cliente para controlar la opacidad inicial."

El evento desaparece.

El criterio permanece.

---

# Los seis artefactos

Cada proyecto organiza su criterio utilizando exactamente seis artefactos.

| Artefacto | Propósito | Ubicación |
|------------|-----------|-----------|
| `identidad.md` | Identidad del proyecto y estándar mínimo de calidad | `lore/` |
| `principios.md` | Reglas permanentes de ingeniería y negocio | `lore/` |
| Módulos temáticos | Experiencia destilada organizada por dominio | `lore/` |
| `index.md` | Mapa de navegación del Lore | `lore/` |
| `FASES.md` | Estado actual y hoja de ruta del proyecto | raíz |
| `CLAUDE.md` | Contrato de colaboración y referencias operativas | raíz |

Cada artefacto tiene una única responsabilidad.

Ninguno duplica a otro.

---

# Herencia Área → Proyecto

Lore escala mediante **Áreas**.

Un Área es una carpeta madre que posee su propio Lore.

Los proyectos heredan ese criterio en lugar de copiarlo.

```text
Desarrollo/
│
├── lore/
│
├── Proyecto A/
│   └── lore/
│
├── Proyecto B/
│   └── lore/
│
└── Proyecto C/
    └── lore/
```

Los criterios generales existen una sola vez.

Cada proyecto conserva únicamente aquello que le pertenece.

Así el sistema permanece DRY sin perder la experiencia acumulada.

---

# Flujo de trabajo

Lore opera mediante cinco *skills* para Claude Code.

## `using-lore`

Punto de entrada.

Explica el modelo de Lore y te guía hacia el *skill* adecuado.

---

## `create-area`

Crea una nueva Área con su propio Lore compartido.

---

## `create-project`

Crea un proyecto dentro de un Área.

Los proyectos heredan el criterio del Área en lugar de duplicarlo.

---

## `save-to-lore`

El flujo más importante.

Después de resolver un problema realmente valioso:

> "save to lore"

El *skill* extrae el criterio detrás de esa solución.

Las lecciones específicas permanecen dentro del proyecto.

Las lecciones genéricas pueden proponerse para ser promovidas al Área.

Nada se promueve automáticamente.

---

## `transmute-lore`

Migra proyectos existentes hacia la arquitectura Lore.

Dispone de dos modos:

- **add** → crea el Lore faltante.
- **clean** → elimina módulos redundantes que ya pertenecen al Área.

---

# Instalación

## Claude Code

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

---

## Otras herramientas de IA

Lore es, en esencia, Markdown.

Cada *skill* está compuesto por:

- un encabezado YAML (*frontmatter*);
- instrucciones escritas en Markdown.

El empaquetado del plugin es específico de Claude Code.

La arquitectura de Lore no lo es.

Puedes adaptar Lore copiando cualquier *skill* a la herramienta de IA que prefieras.

---

# Estructura del repositorio

```text
lore-plugin/
  .claude-plugin/
    plugin.json
    marketplace.json

  skills/
    using-lore/
    create-area/
    create-project/
    save-to-lore/
    transmute-lore/

  README.md
  LICENSE
```

---

# Invariantes compartidas

Todos los *skills* siguen las mismas reglas.

- El criterio nunca se inventa.
- Todo proviene de experiencia real.
- El ruido descartado se informa; nunca se elimina silenciosamente.
- Todo cambio pasa por un HARD-GATE antes de escribirse.
- Nada realiza *commit* automáticamente.
- El ser humano siempre revisa el *diff* final.

---

# Lore vs README

Un README explica un proyecto.

Lore modifica cómo se trabajará en el futuro.

| README | Lore |
|----------|----------|
| Explica el proyecto | Restringe decisiones futuras |
| Almacena información | Preserva criterio |
| Está escrito para humanos | Es compartido entre humanos e IA |
| Describe el pasado | Da forma al futuro |

---

# ¿Por qué "Lore"?

En los videojuegos, el *lore* es aquello que da coherencia a un universo.

No son las mecánicas.

Es la historia acumulada.

Las reglas que siguen influyendo en todo lo que puede ocurrir después.

Lore aplica esa misma idea al desarrollo de software.

Transforma la experiencia en criterio compartido.

Los acontecimientos originales dejan de ser importantes.

El criterio permanece.

---

# Origen

Lore nació como una destilación de **LUS (Lore User System)**, un programa de investigación que estudia cómo un ser humano y una IA acumulan criterio compartido a lo largo de una colaboración prolongada.

LUS estudia la relación.

Lore es una implementación operativa surgida de esa investigación.

Su principio central puede resumirse en una sola idea:

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

El objetivo de Lore es convertir esa idea en una práctica cotidiana para el desarrollo asistido por IA.

Entre las principales influencias del programa se encuentran:

- **Martin Buber** — *Yo y Tú*
- **Claude Shannon** y **Warren Weaver** — *The Mathematical Theory of Communication*
- **Gregory Bateson** — "Una diferencia que produce una diferencia"
- **Andy Clark** y **David Chalmers** — *The Extended Mind*

Puedes explorar la investigación detrás de Lore en el [NotebookLM de LUS](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b794509):

---

## Licencia

MIT — [LICENSE](LICENSE)

<p align="center">
  <img src="https://i.imgur.com/Heb7IzB.png" alt="Lore" width="100%">
</p>

# Lore

**Stop rebuilding your engineering judgment every time you start a new AI session.**

Every AI-assisted project accumulates hard-earned experience:

- architectural decisions,
- production incidents,
- failed experiments,
- coding standards,
- and dozens of "never do this again" moments.

Most of that experience disappears.

The next session starts from an incomplete understanding of the project, forcing you—and your AI—to rediscover decisions you've already paid for.

**Lore exists to prevent that.**

Not by generating more documentation.

By preserving the **judgment** that should continue shaping future decisions.

> **Experience only creates value when it can participate in a future decision.**

---

# What is Lore?

Lore is a lightweight **Spec-Driven Development (SDD)** kit for Claude Code.

It provides:

- a simple convention for organizing project judgment,
- five automation skills,
- and a workflow for continuously distilling experience into reusable engineering criteria.

Unlike traditional documentation, Lore does not try to describe everything.

It only preserves what changes future behavior.

If a sentence does not restrict a future decision, **it is not Lore.**

---

# The Problem: Ephemeral Experience

Documentation usually answers questions like:

> What is this?

> How do I install it?

> Which API should I call?

Lore answers a different question:

> **What have we already learned that we should never have to learn again?**

That distinction changes everything.

A README stores information.

Lore stores judgment.

---

# The Core Principle

Every solved problem contains two things:

- the solution,
- and the reason the solution exists.

Most documentation preserves only the first.

Lore preserves the second.

Instead of recording events, Lore distills them into **Invariant Leads**—small engineering constraints that remain useful long after the original context has disappeared.

For example:

Instead of remembering:

> "We had a hydration issue in Next.js."

Lore stores:

> "Never use client-side state to control initial opacity."

The event disappears.

The criterion remains.

---

# The Six Artifacts

Every project organizes its judgment using exactly six artifacts.

| Artifact | Purpose | Location |
|------------|----------|----------|
| `identidad.md` | Project identity and quality standard | `lore/` |
| `principios.md` | Permanent engineering and business rules | `lore/` |
| Topic modules | Distilled engineering experience by domain | `lore/` |
| `index.md` | Navigation map of the Lore | `lore/` |
| `FASES.md` | Current project state and roadmap | project root |
| `CLAUDE.md` | Collaboration contract and operational pointers | project root |

Each artifact has one responsibility.

None duplicates another.

---

# Area → Project Inheritance

Lore scales through **Areas**.

An Area is a parent workspace that owns its own Lore.

Projects inherit that judgment instead of copying it.

```
Development/
│
├── lore/
│
├── Project A/
│   └── lore/
│
├── Project B/
│   └── lore/
│
└── Project C/
    └── lore/
```

Generic engineering criteria live once.

Projects only keep what is uniquely theirs.

This keeps the system DRY without sacrificing accumulated experience.

---

# Workflow

Lore operates through five Claude Code skills.

## `using-lore`

Entry point.

Explains the model and routes you to the correct workflow.

---

## `create-area`

Creates a new Area with its own shared Lore.

---

## `create-project`

Creates a project inside an Area.

Projects inherit Area knowledge instead of duplicating it.

---

## `save-to-lore`

The most important workflow.

After solving a meaningful problem:

> "save to lore"

The skill extracts the engineering criterion behind the solution.

Project-specific lessons stay inside the project.

Generic lessons are proposed for promotion to the Area.

Nothing is promoted automatically.

---

## `transmute-lore`

Migrates existing projects into the Lore architecture.

Supports two modes:

- **add** → build missing Lore
- **clean** → remove redundant modules already inherited from the Area

---

# Installation

## Claude Code

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

---

## Other AI tools

Lore is fundamentally Markdown.

Each skill consists of:

- YAML frontmatter
- Markdown instructions

The plugin packaging is Claude Code-specific.

The architecture itself is tool-agnostic.

You can adapt Lore by copying any skill into your preferred AI environment.

---

# Repository Structure

```text
lore-plugin/
  .claude-plugin/
    plugin.json
    marketplace.json

  skills/
    using-lore/
    create-area/
    create-project/
    save-to-lore/
    transmute-lore/

  README.md
  LICENSE
```

---

# Shared Invariants

Every skill follows the same rules.

- Engineering judgment is never invented.
- Everything comes from real experience.
- Discarded information is reported—not silently removed.
- Every change passes through a HARD-GATE before being written.
- Nothing commits automatically.
- The human always reviews the final diff.

---

# Lore vs README

A README explains a project.

Lore changes how future work happens.

| README | Lore |
|----------|----------|
| Explains the project | Restricts future decisions |
| Stores information | Stores engineering judgment |
| Written for humans | Shared between humans and AI |
| Describes the past | Shapes the future |

---

# Why "Lore"?

In videogames, lore is everything that gives coherence to a universe.

Not the mechanics.

The accumulated history.

The rules that continue influencing what can happen next.

Lore applies the same idea to software projects.

It transforms experience into shared engineering judgment.

The original events become irrelevant.

The criteria remain.

---

# Origin

Lore emerged from **LUS (Lore User System)**, an ongoing research program exploring how humans and AI accumulate shared judgment across long-term collaboration.

LUS studies the relationship.

Lore is one operational implementation of that research.

Its intellectual influences include:

- Martin Buber — *I and Thou*
- Claude Shannon & Warren Weaver — Information Theory
- Gregory Bateson — "A difference that makes a difference"
- Andy Clark & David Chalmers — The Extended Mind

Learn more about the research on [NotebookLM]:(https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b794509)
