<p align="center">
  <img src="https://i.imgur.com/6u3Cnkw.png" alt="Lore" width="100%">
</p>

<!-- Language selector (top of README.md) -->

<p align="right">
  <strong>Idioma / Language:</strong>
  <a href="#español">Español</a> |
  <a href="#english">English</a>
</p>

---

# Lore

[![License](https://img.shields.io/github/license/andresanemic/lore-plugin.svg)](./LICENSE)
[![Diseñado para Claude Code](https://img.shields.io/badge/diseñado%20para-Claude%20Code-4B8BF5.svg)](#instalación)
[![Spec-Driven Development](https://img.shields.io/badge/paradigma-SDD%20%7C%20Spec--Driven%20Development-6332F6.svg)](#qué-es-lore)
[![Colaboración Humano–IA](https://img.shields.io/badge/foco-colaboración%20humano%E2%80%93IA-10B981.svg)](#origen)
[![Estado](https://img.shields.io/badge/estado-investigación%20activa-F97316.svg)](#origen)

> **Un kit de desarrollo guiado por especificaciones para constructores humanistas.**  
> *Deja de reconstruir tu criterio cada vez que comienzas una nueva sesión con IA.*

---

## Índice

- [Motivación](#motivación)
- [Qué es Lore](#qué-es-lore)
- [Problema: experiencia efímera](#problema-experiencia-efímera)
- [Principio fundamental](#principio-fundamental)
- [Arquitectura de Lore](#arquitectura-de-lore)
  - [Los seis artefactos](#los-seis-artefactos)
  - [Herencia Área → Proyecto](#herencia-área--proyecto)
- [Flujo de trabajo](#flujo-de-trabajo)
- [Instalación](#instalación)
- [Documentación adicional](#documentación-adicional)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Invariantes compartidas](#invariantes-compartidas)
- [Lore vs README](#lore-vs-readme)
- [Por qué “Lore”](#por-qué-lore)
- [Origen](#origen)

---

## Motivación

Todo proyecto desarrollado con inteligencia artificial acumula experiencia adquirida con esfuerzo:

- decisiones arquitectónicas;
- incidentes en producción;
- experimentos fallidos;
- estándares de desarrollo;
- y decenas de momentos de *«nunca volvamos a hacer esto»*.

La mayor parte de esa experiencia desaparece.

La siguiente sesión comienza con una comprensión incompleta del proyecto, obligándote a ti —y a tu IA— a redescubrir decisiones que ya habías pagado con tiempo y esfuerzo.

**Lore existe para evitar eso.**

No generando más documentación,  
sino preservando el **criterio** que debe seguir participando en las decisiones futuras.

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

---

## Qué es Lore

Lore es un kit ligero de **Spec-Driven Development (SDD)** para Claude Code.

Proporciona:

- una convención sencilla para organizar el criterio de un proyecto;
- cinco *skills* que automatizan ese proceso;
- y un flujo continuo para destilar la experiencia en criterios reutilizables.

A diferencia de la documentación tradicional, Lore no intenta describirlo todo.

Solo conserva aquello que modifica el comportamiento futuro.

**Si una frase no restringe una decisión futura, no es Lore.**

---

## Problema: experiencia efímera

La documentación tradicional responde preguntas como:

> ¿Qué es esto?  
> ¿Cómo se instala?  
> ¿Qué API debo utilizar?

Lore responde una pregunta completamente distinta:

> **¿Qué aprendimos que nunca deberíamos tener que volver a aprender?**

Esa diferencia lo cambia todo:

- Un README almacena información.
- Lore preserva criterio.
- Ese criterio continúa participando en decisiones futuras.

---

## Principio fundamental

Todo problema resuelto contiene dos cosas:

- la solución;
- y la razón por la que esa solución existe.

La mayoría de la documentación conserva únicamente la primera.  
Lore conserva la segunda.

En lugar de registrar acontecimientos, Lore los destila en **Pistas Invariantes**: pequeñas restricciones que siguen siendo útiles mucho tiempo después de que el contexto original haya desaparecido.

Por ejemplo, en lugar de recordar:

> «Tuvimos un problema de hidratación en Next.js.»

Lore conserva:

> «Nunca utilices estado del cliente para controlar la opacidad inicial.»

El evento desaparece.  
El criterio permanece.

---

## Arquitectura de Lore

Lore organiza el criterio de cada proyecto en artefactos claramente separados y heredables.

### Los seis artefactos

Cada proyecto organiza su criterio utilizando exactamente seis artefactos:

| Artefacto          | Propósito                                          | Ubicación |
|--------------------|----------------------------------------------------|----------|
| `identidad.md`     | Identidad del proyecto y estándar mínimo de calidad | `lore/`  |
| `principios.md`    | Reglas permanentes de ingeniería y negocio          | `lore/`  |
| Módulos temáticos  | Experiencia destilada organizada por dominio        | `lore/`  |
| `index.md`         | Mapa de navegación del Lore                         | `lore/`  |
| `FASES.md`         | Estado actual y hoja de ruta del proyecto           | raíz     |
| `CLAUDE.md`        | Contrato de colaboración y referencias operativas   | raíz     |

Cada artefacto tiene una única responsabilidad.

Ninguno duplica a otro.

---

### Herencia Área → Proyecto

Lore escala mediante **Áreas**.

Un Área es una carpeta madre que posee su propio Lore.  
Los proyectos heredan ese criterio en lugar de copiarlo:

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

## Flujo de trabajo

Lore opera mediante cinco *skills* para Claude Code.

### `using-lore`

Punto de entrada.

Explica el modelo de Lore y te guía hacia el *skill* adecuado.

---

### `create-area`

Crea una nueva Área con su propio Lore compartido.

---

### `create-project`

Crea un proyecto dentro de una Área.

Los proyectos heredan el criterio del Área en lugar de duplicarlo.

---

### `save-to-lore`

El flujo más importante.

Después de resolver un problema realmente valioso:

> «save to lore»

El *skill* extrae el criterio detrás de esa solución.

- Las lecciones específicas permanecen dentro del proyecto.
- Las lecciones genéricas pueden proponerse para ser promovidas al Área.
- Nada se promueve automáticamente.

---

### `transmute-lore`

Migra proyectos existentes hacia la arquitectura Lore.

Dispone de dos modos:

- **add** → crea el Lore faltante.
- **clean** → elimina módulos redundantes que ya pertenecen al Área.

---

## Instalación

### Claude Code

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

---

### Otras herramientas de IA

Lore es, en esencia, Markdown.

Cada *skill* está compuesto por:

- un encabezado YAML (*frontmatter*);
- instrucciones escritas en Markdown.

El empaquetado del plugin es específico de Claude Code.  
La arquitectura de Lore no lo es.

Puedes adaptar Lore copiando cualquier *skill* a la herramienta de IA que prefieras.

---

## Documentación adicional

Este README cubre la motivación y la arquitectura. Para el resto, hay tres documentos dedicados
(en español e inglés), en la raíz del repositorio:

| Documento | Para qué sirve |
|---|---|
| [`USAGE_es.md`](./USAGE_es.md) / [`USAGE_en.md`](./USAGE_en.md) | Guía práctica de uso día a día: instalación, ciclo de trabajo, y cada *skill* con ejemplos. |
| [`REFERENCE_es.md`](./REFERENCE_es.md) / [`REFERENCE_en.md`](./REFERENCE_en.md) | Referencia técnica: conceptos, especificación exacta de cada artefacto y cada *skill*. |
| [`MIGRATION_es.md`](./MIGRATION_es.md) / [`MIGRATION_en.md`](./MIGRATION_en.md) | Cómo migrar un proyecto existente hacia Lore con `transmute-lore`. |

---

## Estructura del repositorio

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

## Invariantes compartidas

Todos los *skills* siguen las mismas reglas:

- El criterio nunca se inventa.
- Todo proviene de experiencia real.
- El ruido descartado se informa; nunca se elimina silenciosamente.
- Todo cambio pasa por un HARD-GATE antes de escribirse.
- Nada realiza *commit* automáticamente.
- El ser humano siempre revisa el *diff* final.

---

## Lore vs README

Un README explica un proyecto.  
Lore modifica cómo se trabajará en el futuro.

| README                         | Lore                                |
|--------------------------------|-------------------------------------|
| Explica el proyecto            | Restringe decisiones futuras        |
| Almacena información           | Preserva criterio                   |
| Está escrito para humanos      | Es compartido entre humanos e IA    |
| Describe el pasado             | Da forma al futuro                  |

---

## ¿Por qué “Lore”?

En los videojuegos, el *lore* es aquello que da coherencia a un universo.

No son las mecánicas.

Es la historia acumulada.

Las reglas que siguen influyendo en todo lo que puede ocurrir después.

Lore aplica esa misma idea al desarrollo de software.

Transforma la experiencia en criterio compartido.

Los acontecimientos originales dejan de ser importantes.  
El criterio permanece.

---

## Origen

Lore nació como una destilación de **LUS (Lore User System)**, un programa de investigación que estudia cómo un ser humano y una IA acumulan criterio compartido a lo largo de una colaboración prolongada.

LUS estudia la relación.  
Lore es una implementación operativa surgida de esa investigación.

Su principio central puede resumirse en una sola idea:

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

El objetivo de Lore es convertir esa idea en una práctica cotidiana para el desarrollo asistido por IA.

Entre las principales influencias del programa se encuentran:

- **Martin Buber** — *Yo y Tú*
- **Claude Shannon** y **Warren Weaver** — *The Mathematical Theory of Communication*
- **Gregory Bateson** — «Una diferencia que produce una diferencia»
- **Andy Clark** y **David Chalmers** — *The Extended Mind*

Puedes explorar la investigación detrás de Lore en el NotebookLM de LUS:

[NotebookLM de LUS](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b794509)

<p align="center">
  <img src="https://i.imgur.com/6u3Cnkw.png" alt="Lore" width="100%">
</p>

---

# English

<p align="right">
  <strong>Language:</strong>
  <a href="#español">Español</a> |
  <a href="#english">English</a>
</p>

# Lore

[![License](https://img.shields.io/github/license/andresanemic/lore-plugin.svg)](./LICENSE)
[![Built for Claude Code](https://img.shields.io/badge/built%20for-Claude%20Code-4B8BF5.svg)](#installation)
[![Spec-Driven Development](https://img.shields.io/badge/paradigm-SDD%20%7C%20Spec--Driven%20Development-6332F6.svg)](#what-is-lore)
[![Human–AI Collaboration](https://img.shields.io/badge/focus-human%E2%80%93AI%20collaboration-10B981.svg)](#origin)
[![Status](https://img.shields.io/badge/status-active%20research-F97316.svg)](#origin)

> **A specification‑driven development kit for humanist builders.**  
> *Stop rebuilding your criteria every time you start a new session with AI.*

---

## Table of Contents

- [Motivation](#motivation-1)
- [What is Lore](#what-is-lore)
- [Problem: Ephemeral Experience](#problem-ephemeral-experience)
- [Core Principle](#core-principle)
- [Lore Architecture](#lore-architecture)
  - [The Six Artifacts](#the-six-artifacts)
  - [Area → Project Inheritance](#area--project-inheritance)
- [Workflow](#workflow)
- [Installation](#installation)
- [Further Documentation](#further-documentation)
- [Repository Structure](#repository-structure)
- [Shared Invariants](#shared-invariants)
- [Lore vs README](#lore-vs-readme)
- [Why “Lore”](#why-lore)
- [Origin](#origin-1)

---

## Motivation

Any project developed with artificial intelligence accumulates hard‑won experience:

- architectural decisions;
- production incidents;
- failed experiments;
- development standards;
- and dozens of “let’s never do that again” moments.

Most of that experience disappears.

The next session starts with an incomplete understanding of the project, forcing you —and your AI— to rediscover decisions you already paid for with time and effort.

**Lore exists to prevent that.**

Not by generating more documentation,  
but by preserving the **criteria** that must keep participating in future decisions.

> **Experience only creates value when it can participate in a future decision.**

---

## What is Lore

Lore is a lightweight **Spec‑Driven Development (SDD)** kit for Claude Code.

It provides:

- a simple convention for organizing a project’s criteria;
- five skills that automate that process;
- and a continuous flow to distill experience into reusable criteria.

Unlike traditional documentation, Lore does not try to describe everything.

It only preserves what changes future behavior.

**If a sentence does not constrain a future decision, it is not Lore.**

---

## Problem: Ephemeral Experience

Traditional documentation answers questions like:

> What is this?  
> How do I install it?  
> Which API should I use?

Lore answers a completely different question:

> **What did we learn that we should never have to learn again?**

That difference changes everything:

- A README stores information.
- Lore preserves criteria.
- Those criteria keep participating in future decisions.

---

## Core Principle

Every solved problem contains two things:

- the solution;  
- and the reason that solution exists.

Most documentation preserves only the first.  
Lore preserves the second.

Instead of recording events, Lore distills them into **Invariant Clues**: small constraints that remain useful long after the original context has disappeared.

For example, instead of remembering:

> “We had a hydration issue in Next.js.”

Lore keeps:

> “Never use client‑side state to control initial opacity.”

The event disappears.  
The criteria remain.

---

## Lore Architecture

Lore organizes each project’s criteria into clearly separated and inheritable artifacts.

### The Six Artifacts

Each project uses exactly six artifacts:

| Artifact           | Purpose                                          | Location |
|--------------------|--------------------------------------------------|----------|
| `identidad.md`     | Project identity and minimum quality standard    | `lore/`  |
| `principios.md`    | Permanent engineering and business rules         | `lore/`  |
| Thematic modules   | Distilled experience organized by domain         | `lore/`  |
| `index.md`         | Navigation map for Lore                          | `lore/`  |
| `FASES.md`         | Current state and project roadmap                | root     |
| `CLAUDE.md`        | Collaboration contract and operational references | root     |

Each artifact has a single responsibility.

None of them duplicates another.

---

### Area → Project Inheritance

Lore scales through **Areas**.

An Area is a parent folder that owns its own Lore.  
Projects inherit that criteria instead of copying it:

```text
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

General criteria exist only once.

Each project keeps only what belongs to it.

This keeps the system DRY without losing accumulated experience.

---

## Workflow

Lore operates through five skills for Claude Code.

### `using-lore`

Entry point.

Explains Lore’s model and guides you to the appropriate skill.

---

### `create-area`

Creates a new Area with its own shared Lore.

---

### `create-project`

Creates a project inside an Area.

Projects inherit the Area’s criteria instead of duplicating it.

---

### `save-to-lore`

The most important flow.

After solving a genuinely valuable problem:

> “save to lore”

The skill extracts the criteria behind that solution.

- Specific lessons stay inside the project.
- Generic lessons can be proposed for promotion to the Area.
- Nothing is promoted automatically.

---

### `transmute-lore`

Migrates existing projects into Lore’s architecture.

It has two modes:

- **add** → creates missing Lore artifacts.
- **clean** → removes redundant modules that already belong to the Area.

---

## Installation

### Claude Code

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

---

### Other AI Tools

At its core, Lore is Markdown.

Each skill is made of:

- a YAML header (frontmatter);
- instructions written in Markdown.

The plugin packaging is specific to Claude Code.  
Lore’s architecture is not.

You can adapt Lore by copying any skill into the AI tool of your choice.

---

## Further Documentation

This README covers motivation and architecture. For everything else, there are three dedicated
documents (in Spanish and English), at the repository root:

| Document | What it's for |
|---|---|
| [`USAGE_en.md`](./USAGE_en.md) / [`USAGE_es.md`](./USAGE_es.md) | Practical day‑to‑day usage guide: installation, core loop, and each skill with examples. |
| [`REFERENCE_en.md`](./REFERENCE_en.md) / [`REFERENCE_es.md`](./REFERENCE_es.md) | Technical reference: core concepts, the exact spec for each artifact and each skill. |
| [`MIGRATION_en.md`](./MIGRATION_en.md) / [`MIGRATION_es.md`](./MIGRATION_es.md) | How to migrate an existing project into Lore using `transmute-lore`. |

---

## Repository Structure

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

## Shared Invariants

All skills follow the same rules:

- Criteria are never invented.
- Everything comes from real experience.
- Discarded noise is reported; it is never silently removed.
- Every change passes through a HARD GATE before being written.
- Nothing commits automatically.
- A human always reviews the final diff.

---

## Lore vs README

A README explains a project.  
Lore changes how future work will be done.

| README                          | Lore                                 |
|---------------------------------|--------------------------------------|
| Explains the project            | Constrains future decisions          |
| Stores information              | Preserves criteria                   |
| Written for humans              | Shared between humans and AI         |
| Describes the past              | Shapes the future                    |

---

## Why “Lore”

In video games, *lore* is what gives a universe coherence.

It is not the mechanics.

It is the accumulated story.

The rules that keep influencing everything that can happen afterwards.

Lore applies that same idea to software development.

It turns experience into shared criteria.

The original events stop being important.  
The criteria remain.

---

## Origin

Lore was born as a distillation of **LUS (Lore User System)**, a research program that studies how a human and an AI accumulate shared criteria over a long‑term collaboration.

LUS studies the relationship.  
Lore is an operational implementation that emerged from that research.

Its core principle can be summarized in a single idea:

> **Experience only creates value when it can participate in a future decision.**

Lore’s goal is to turn that idea into everyday practice for AI‑assisted development.

Some of the main influences behind the program are:

- **Martin Buber** — *I and Thou*
- **Claude Shannon** and **Warren Weaver** — *The Mathematical Theory of Communication*
- **Gregory Bateson** — “A difference that makes a difference”
- **Andy Clark** and **David Chalmers** — *The Extended Mind*

You can explore the research behind Lore in the LUS NotebookLM:

[NotebookLM for LUS](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b794509)
