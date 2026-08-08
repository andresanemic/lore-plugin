<p align="center">
  <img src="https://i.imgur.com/AKHwfNa.png" alt="Lore" width="100%">
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
[![Versión](https://img.shields.io/badge/versión-1.0.5-6332F6.svg)](#instalación)
[![Diseñado para Claude Code](https://img.shields.io/badge/diseñado%20para-Claude%20Code-4B8BF5.svg)](#instalación)
[![Spec-Driven Development](https://img.shields.io/badge/paradigma-SDD%20%7C%20Spec--Driven%20Development-6332F6.svg)](#qué-es-lore)
[![Colaboración Humano–IA](https://img.shields.io/badge/foco-colaboración%20humano%E2%80%93IA-10B981.svg)](#origen)
[![Estado](https://img.shields.io/badge/estado-investigación%20activa-F97316.svg)](#origen)

> **Deja de explicarle tu proyecto a la IA todas las mañanas.**
> Lore destila lo que aprendiste en criterio que se carga solo en la siguiente sesión.

---

## Índice

- [Qué es Lore](#qué-es-lore)
- [Instalación](#instalación)
- [Cómo funciona](#cómo-funciona)
- [Arquitectura](#arquitectura)
- [Las siete skills](#las-siete-skills)
- [Obsidian — la puerta de entrada](#obsidian--la-puerta-de-entrada)
- [Idioma del Lore](#idioma-del-lore)
- [Documentación](#documentación)
- [Invariantes](#invariantes)
- [Cifrado (experimental)](#cifrado-experimental)
- [Casos de estudio](#casos-de-estudio)
- [Origen](#origen)

---

## Qué es Lore

Tu proyecto acumula decisiones de arquitectura, incidentes en producción, experimentos que fallaron y decenas de momentos de *«nunca volvamos a hacer esto»*.

Mañana abres una sesión nueva y nada de eso existe: vuelves a explicar, y la IA vuelve a proponer lo que ya descartaste.

**Lore corta ese bucle.** No generando más documentación —de eso tienes de sobra— sino preservando el **criterio** que debe seguir decidiendo por ti.

Un README responde *«¿qué es esto?»*. Lore responde otra cosa:

> **¿Qué aprendimos que nunca deberíamos tener que volver a aprender?**

**Si una frase no restringe una decisión futura, no es Lore.** Esa regla es todo el filtro.

---

## Instalación

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Dos líneas, sin dependencias ni configuración. Después escribe `using-lore` y el kit te guía hacia la skill que necesitas.

**¿Otra herramienta de IA?** Cada skill es un archivo Markdown con encabezado YAML. El empaquetado es de Claude Code; la arquitectura no. Copia la carpeta de la skill donde quieras.

---

## Cómo funciona

Todo problema resuelto contiene dos cosas: la solución, y la razón por la que esa solución existe. La documentación conserva la primera. Lore conserva la segunda.

En lugar de registrar lo que pasó, lo destila en una **Pista Invariante**:

| En vez de recordar | Lore guarda |
|---|---|
| «Tuvimos un problema de hidratación en Next.js» | «Nunca uses estado del cliente para controlar la opacidad inicial» |

El acontecimiento se olvida. El criterio sigue trabajando.

---

## Arquitectura

### Los seis artefactos

| Artefacto | Qué guarda | Dónde |
|---|---|---|
| `identidad.md` | Qué es el proyecto y su piso de calidad | `lore/` |
| `principios.md` | Leyes invariantes: prohibiciones e imperativos | `lore/` |
| Módulos temáticos | Cicatrices técnicas por dominio | `lore/` |
| `index.md` | Mapa de navegación | `lore/` |
| `FASES.md` | Estado y hoja de ruta | raíz |
| `CLAUDE.md` | Contrato de colaboración, solo punteros | raíz |

Cada uno tiene una responsabilidad. Ninguno duplica a otro. **El Lore es criterio (persiste); `FASES.md` es estado (avanza).** Nunca se mezclan.

> Los nombres son las formas canónicas en español; en tu idioma se localizan. Ver [Idioma del Lore](#idioma-del-lore).

### Herencia Área → Proyecto

Un **Área** es una carpeta madre con su propio Lore. Los proyectos lo heredan en vez de copiarlo:

```text
desarrollo-web/
├── lore/                 ← el criterio general vive una sola vez
├── proyectos/
│   ├── cliente-a/lore/   ← solo lo suyo, apunta al Área
│   └── cliente-b/lore/
```

Arreglas una Pista genérica una vez, en el Área, y todos los proyectos la ven.

---

## Las siete skills

| Skill | Para qué |
|---|---|
| `using-lore` | Punto de entrada. Explica el modelo y te manda a la skill correcta. |
| `create-area` | Crea un Área con su Lore compartido. |
| `create-project` | Crea un proyecto que hereda del Área. |
| `create-bot` | Un lugar donde abrir sesión y trabajar sobre varias Áreas a la vez. |
| `save-to-lore` | El flujo principal: destila una lección y decide si sube al Área. |
| `transmute-lore` | Migra proyectos viejos al estándar, limpia duplicados o traduce el Lore. |
| `obsidian-lore` | Convierte tus notas sueltas en criterio. |

### `save-to-lore` — el flujo que usarás todos los días

Resuelves algo que costó. Escribes «guarda en lore». La skill extrae el criterio detrás de la solución, lo escribe donde corresponde y te propone —nunca ejecuta— subirlo al Área si sirve para todos los proyectos.

Tiene **dos modos**, según de dónde viene el criterio:

| Modo | Fuente | Qué hace |
|---|---|---|
| **capture** (por defecto) | fricción vivida: un bug, un cliente que rechaza | Destila la cicatriz en una Pista Invariante. |
| **arbitrate** | criterio importado: una skill, una guía de estilo ajena | Lo juzga contra la finalidad de **tu** proyecto. Solo entra lo que sobrevive. |

> **Un criterio ajeno no se destila: se arbitra.** Una skill es criterio destilado por otro, bajo otra finalidad, y llega sin declarar dónde deja de valer. Copiarla produce literatura redundante con la autoridad de una Pista.
>
> Por eso `arbitrate` exige registrar **dónde la fuente contradice tu estándar y pierde**. Sin esa sección no entra. Lo que la fuente pierde vale más que lo que aporta: el resumen ya existe, mejor escrito, en la fuente. El desacuerdo no existe en ningún otro lado.

### `create-bot` — trabajar en varios proyectos desde un solo lugar

Un laboratorio tiene su sitio web, sus redes sociales y sus líneas de investigación. Cada una es un Área con su propio Lore. Un bot las enruta a todas hacia una carpeta: abres la sesión ahí y trabajas en cualquiera, con su criterio ya cargado.

**Un bot no responde preguntas sobre los proyectos: trabaja en ellos.**

> **Su norte, y el único test que importa:** *una instrucción corta basta.* Si hubo que explicarle el proyecto para obtener el resultado, faltaba criterio cargado.

Dos leyes lo sostienen:

- **Federar es apuntar, no copiar.** Cada fila del manifiesto es una dirección. Ese criterio conserva un dueño y una versión.
- **Se enruta por tipo de tarea, no por nombre de proyecto.** Una entidad puede tener varios cuerpos de criterio cuyos principios prohíben cruzarlos.

Empaquetarlo como plugin, la copia del ecosistema, el cifrado y Telegram son **opcionales y están apagados**. Un bot es una carpeta con su canon y su `CLAUDE.md`; abrir la sesión ahí ya carga todo.

---

## Obsidian — la puerta de entrada

Si ya escribes notas en Obsidian, ya tienes la materia prima. Apunta la vault a la **carpeta madre de tus Áreas** y el mismo árbol de archivos es a la vez tu espacio de trabajo y tu vault.

```text
<tu carpeta madre>/       ← ábrela como vault en Obsidian
  notas/                  ← la bandeja: escribe libre, sin formato
  desarrollo-web/         ← tus Áreas y proyectos, con su Lore
  bots/proyectos/mi-bot/
    notas/                ← si trabajas desde un bot, su bandeja va acá
```

**La bandeja vive donde abres la sesión.** Un bot alcanza su propia carpeta y los proyectos que
federa, no la raíz de la vault — así que sus notas van adentro del bot. Al minar se barre la bandeja
local y, si es alcanzable, también la de la raíz.

Después, cuando quieras:

> «revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore»

`obsidian-lore` barre la bandeja, separa lo que es criterio de lo que no, te dice a qué Lore va cada cosa y espera tu aprobación antes de escribir nada.

**La separación no se negocia:** una nota responde *«qué pasó»*; el Lore responde *«qué cambió por eso»*. Nada cruza sin destilación explícita.

| Lo que registra la nota | Adónde va |
|---|---|
| Una fricción que resolviste | Pista Invariante en el Lore |
| Una tarea o un problema abierto — *«hay que añadir X»* | `FASES.md` — es estado, no criterio |
| Criterio ajeno que recogiste | Arbitraje contra tu estándar |
| Un resumen, un link, un apunte | Ruido, y te lo dice |

> **Por qué un barrido y no un botón de guardar.** Escribir la nota ya satisface las ganas de preservar, así que la destilación nunca ocurre y el criterio se queda dormido adentro. Separar las notas del Lore no lo arregla —eso ya se probó—. Lo que lo arregla es barrer la bandeja, y que cada barrido te diga cuántas notas llevan cuánto tiempo sin minar.

**Lore no es un segundo cerebro.** Un sistema de notas acumula información; Lore acumula criterio. Los dos sirven, y hacen cosas distintas.

---

## Idioma del Lore

**El Lore habla tu idioma.** Las skills están en inglés, pero el Lore que generan no: contenido **y** nombres de archivo van en el idioma en que trabajas. `identidad.md`, `principios.md`, `FASES.md` son las formas canónicas en español; en inglés serían `identity.md`, `principles.md`, `PHASES.md`.

Fijos en todos los idiomas: `CLAUDE.md`, `lore/`, `index.md`, la estructura y los términos técnicos de uso general.

Dentro de un Área existente mandan los nombres ya establecidos. Si un Lore quedó mezclado, `transmute-lore` en modo **translate** lo estandariza.

---

## Documentación

| Documento | Para qué |
|---|---|
| [`USAGE_es.md`](./USAGE_es.md) · [`USAGE_en.md`](./USAGE_en.md) | Guía de uso día a día, con ejemplos. |
| [`REFERENCE_es.md`](./REFERENCE_es.md) · [`REFERENCE_en.md`](./REFERENCE_en.md) | Referencia técnica de cada artefacto y skill. |
| [`MIGRATION_es.md`](./MIGRATION_es.md) · [`MIGRATION_en.md`](./MIGRATION_en.md) | Cómo migrar un proyecto existente. |

---

## Invariantes

Las siete skills siguen las mismas reglas:

- El Lore se escribe en tu idioma.
- **El criterio nunca se inventa**: todo sale de experiencia real.
- Una nota es fuente, nunca criterio.
- El ruido descartado se informa; nunca se borra en silencio.
- Todo cambio pasa por un HARD-GATE antes de escribirse.
- Nada hace commit automático. Tú revisas el diff.

---

## Cifrado (experimental)

`create-bot` puede sellar el criterio de un bot para que viaje cifrado. Está **apagado por defecto** y **se recomienda solo para pruebas**: un bot sin cifrado está completo, y para criterio que importa, un repositorio privado es hoy la respuesta seria.

**La ley: se cifra en distribución, nunca en consulta.** Las cargas viajan cifradas y se descifran una vez al clonar; en reposo son Markdown plano. Cifrar donde el agente consulta no prohíbe leer: **encarece** leer, y lo caro deja de consultarse.

AES-256-GCM con clave derivada por scrypt, solo con la stdlib de Node. La passphrase se pide por *stdin*, nunca como argumento ni pegada en el chat.

> **Estado: experimental.** Pasa su *self-test*, pero **no ha sido auditado**, no tiene rotación de claves ni revocación, y no tiene respuesta para una passphrase filtrada. Protege el repositorio y el tránsito; **no protege contra quien tiene la passphrase**, y no cubre lo que una herramienta de IA hace con el texto una vez cargado en su contexto.

**Crédito:** la pregunta —*¿qué protege a un Lore que tiene que compartirse?*— la abrió **Mantra**, de [LonelyAchemist](https://github.com/lonelyachemist-arch), que cifraba el Lore en reposo. La respuesta acá está invertida, y el código es propio.

---

## Casos de estudio

Lore no se diseñó en una pizarra. Cada decisión salió de aplicarlo a proyectos reales y mirar qué se rompía. LUS documenta esas aplicaciones como casos.

> **Estatus:** son casos, no demostraciones. n pequeño, y las seis evidencias vienen del mismo investigador. Restringen cómo usamos el kit; no pretenden ser una ley.

**01 — La arquitectura aguanta un proyecto entero.** Un proyecto real construido con Lore de principio a fin: el criterio se acumula, se consulta y sigue decidiendo meses después.

**02 — El criterio se recupera y se comparte.** Cuatro proyectos migrados con `transmute-lore`. Un proyecto nacido sin Lore ya tenía criterio disperso en comentarios y decisiones: no se inventa, **se rescata**. Y el `clean` borró 7 módulos redundantes (−866 líneas) sin perder nada: el criterio no desapareció, **cambió de dueño**. *Frontera: mismo dominio los cuatro.*

**03 — El criterio importado se arbitra, no se adopta.** Tres áreas destilaron Lore de skills ajenas. Lo valioso no fue el resumen: fue el desacuerdo. La misma skill de copywriting perdió en marketing (*«el copy aburrido y funcional gana siempre»*) y en periodismo (*«no vendemos, informamos»*) por razones inversas. **El resultado depende de tu finalidad, no de la fuente.**

**04 — La estructura sobrevive fuera del código.** Periodismo y community management tenían Lore destilado real, sin compilador ni test. *Frontera: el criterio no viajó entre dominios; nació fresco en cada uno.*

**05 — La memoria del caso no alimenta la destilación: la desplaza.** Un registro de incidentes convivió seis semanas con un `lore/` y **no participó de una sola decisión** — ni cuando volvió a romperse el territorio que documentaba. Estaba indexado y era obligatorio. Al minarlo antes de borrarlo aparecieron dos Pistas que llevaban seis semanas dormidas. **Preservar no es destilar, y el parecido es el problema.** Este caso es la razón de que `obsidian-lore` sea un barrido y no un botón.

**06 — La herencia entre Áreas hermanas: congelarla o enrutarla.** Un proyecto necesitó criterio de cuatro Áreas y solo una era su madre. Lo destilable de un conjunto de criterios **es la frontera, no los criterios**: cada Área tenía escrita su mitad de la línea, ninguna la regla para usar el par. De ahí sale la ley de enrutamiento del bot.

**Alcance:** el repositorio lleva **906 clonaciones en 34 días**. Es una señal de alcance, no una demostración: nadie sabe qué hizo cada quien con su copia. No sustituye la pregunta que los casos sí responden.

---

## Origen

Lore nació como destilación de **LUS (Lore User System)**, un programa de investigación sobre cómo un humano y una IA acumulan criterio compartido a lo largo de una colaboración larga.

LUS estudia la relación. Lore es su implementación operativa. Un principio lo resume:

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

Influencias del programa: **Martin Buber** (*Yo y Tú*), **Shannon** y **Weaver** (*The Mathematical Theory of Communication*), **Gregory Bateson** («una diferencia que hace una diferencia»), **Clark** y **Chalmers** (*The Extended Mind*).

[Explora la investigación en el NotebookLM de LUS](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450)

### ¿Por qué «Lore»?

En los videojuegos, el *lore* es lo que le da coherencia a un universo. No son las mecánicas: es la historia acumulada, las reglas que siguen influyendo en todo lo que puede ocurrir después. Los acontecimientos dejan de importar. El criterio permanece.

---

<p align="center">
  <img src="https://i.imgur.com/DWYL7vz.png" alt="Lore" width="100%">
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
[![Version](https://img.shields.io/badge/version-1.0.5-6332F6.svg)](#installation)
[![Built for Claude Code](https://img.shields.io/badge/built%20for-Claude%20Code-4B8BF5.svg)](#installation)
[![Spec-Driven Development](https://img.shields.io/badge/paradigm-SDD%20%7C%20Spec--Driven%20Development-6332F6.svg)](#what-is-lore)
[![Human–AI Collaboration](https://img.shields.io/badge/focus-human%E2%80%93AI%20collaboration-10B981.svg)](#origin)
[![Status](https://img.shields.io/badge/status-active%20research-F97316.svg)](#origin)

> **Stop explaining your project to the AI every morning.**
> Lore distills what you learned into criteria that loads itself in the next session.

---

## Table of Contents

- [What is Lore](#what-is-lore)
- [Installation](#installation)
- [How it works](#how-it-works)
- [Architecture](#architecture)
- [The seven skills](#the-seven-skills)
- [Obsidian — the way in](#obsidian--the-way-in)
- [Lore Language](#lore-language)
- [Documentation](#documentation)
- [Invariants](#invariants)
- [Encryption (experimental)](#encryption-experimental)
- [Case Studies](#case-studies)
- [Origin](#origin-1)

---

## What is Lore

Your project accumulates architectural decisions, production incidents, failed experiments, and dozens of *"let's never do that again"* moments.

Tomorrow you open a new session and none of it exists: you explain it all again, and the AI proposes what you already ruled out.

**Lore breaks that loop.** Not by generating more documentation — you have plenty — but by preserving the **criteria** that should keep deciding for you.

A README answers *"what is this?"*. Lore answers something else:

> **What did we learn that we should never have to learn again?**

**If a sentence does not constrain a future decision, it is not Lore.** That rule is the whole filter.

---

## Installation

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Two lines, no dependencies or configuration. Then type `using-lore` and the kit points you at the skill you need.

**Another AI tool?** Each skill is a Markdown file with a YAML header. The packaging is Claude Code's; the architecture is not. Copy the skill folder anywhere.

---

## How it works

Every solved problem contains two things: the solution, and the reason that solution exists. Documentation keeps the first. Lore keeps the second.

Instead of recording what happened, it distills it into an **Invariant Clue**:

| Instead of remembering | Lore keeps |
|---|---|
| "We had a hydration issue in Next.js" | "Never use client-side state to control initial opacity" |

The event is forgotten. The criteria keeps working.

---

## Architecture

### The six artifacts

| Artifact | What it holds | Where |
|---|---|---|
| `identidad.md` | What the project is and its quality floor | `lore/` |
| `principios.md` | Invariant laws: prohibitions and imperatives | `lore/` |
| Thematic modules | Technical scars by domain | `lore/` |
| `index.md` | Navigation map | `lore/` |
| `FASES.md` | State and roadmap | root |
| `CLAUDE.md` | Collaboration contract, pointers only | root |

Each has one responsibility. None duplicates another. **Lore is criteria (it persists); `FASES.md` is state (it advances).** They never mix.

> The names are the Spanish canonical forms; in your language they localize. See [Lore Language](#lore-language).

### Area → Project inheritance

An **Area** is a mother folder with its own Lore. Projects inherit it instead of copying it:

```text
web-development/
├── lore/                ← general criteria lives once
├── projects/
│   ├── client-a/lore/   ← only its own; points at the Area
│   └── client-b/lore/
```

Fix a generic Clue once, in the Area, and every project sees it.

---

## The seven skills

| Skill | What for |
|---|---|
| `using-lore` | Entry point. Explains the model and routes you to the right skill. |
| `create-area` | Creates an Area with its shared Lore. |
| `create-project` | Creates a project that inherits from the Area. |
| `create-bot` | One place to open a session and work across several Areas at once. |
| `save-to-lore` | The main flow: distills a lesson and decides whether it rises to the Area. |
| `transmute-lore` | Migrates old projects to the standard, cleans duplicates, or translates the Lore. |
| `obsidian-lore` | Turns your loose notes into criteria. |

### `save-to-lore` — the flow you will use every day

You solve something that cost you. You type "save to lore". The skill extracts the criteria behind the solution, writes it where it belongs, and **proposes** — never executes — promoting it to the Area if it serves every project.

It has **two modes**, by where the criteria comes from:

| Mode | Source | What it does |
|---|---|---|
| **capture** (default) | lived friction: a bug, a client rejection | Distills the scar into an Invariant Clue. |
| **arbitrate** | imported criteria: a skill, someone else's style guide | Judges it against **your** project's purpose. Only what survives gets in. |

> **External criteria is not distilled — it is arbitrated.** A skill is criteria distilled by someone else, under someone else's purpose, arriving without declaring where it stops being valid. Copying it produces redundant literature wearing the authority of a Clue.
>
> So `arbitrate` requires recording **where the source contradicts your standard and loses**. No defeats section, no entry. What the source loses is worth more than what it offers: the summary already exists, better written, in the source. The disagreement exists nowhere else.

### `create-bot` — working across projects from one place

A lab has its website, its social media, and its research lines. Each is an Area with its own Lore. A bot routes all of them into one folder: you open the session there and work on any of them, with their criteria already loaded.

**A bot does not answer questions about the projects: it works in them.**

> **Its north, and the only test that matters:** *a short instruction is enough.* If the project had to be explained to the bot to get the result, criteria were missing from the load.

Two laws hold it up:

- **Federating is pointing, not copying.** Each row of the manifest is an address. That criteria keeps one owner and one version.
- **Route by type of task, not by name of project.** One entity can own several bodies of criteria whose principles forbid crossing them.

Packaging it as a plugin, the ecosystem copy, encryption and Telegram are **optional and off**. A bot is a folder with its canon and its `CLAUDE.md`; opening the session there loads everything.

---

## Obsidian — the way in

If you already write notes in Obsidian, you already have the raw material. Point the vault at the **mother folder of your Areas** and the same file tree is both your workspace and your vault.

```text
<your mother folder>/     ← open it as a vault in Obsidian
  notes/                  ← the inbox: write freely, no format
  web-development/        ← your Areas and projects, with their Lore
  bots/projects/my-bot/
    notes/                ← working from a bot? its inbox goes here
```

**The inbox lives where you open the session.** A bot reaches its own folder and the projects it
federates, not the vault root — so its notes go inside the bot. A sweep mines the local inbox and,
if reachable, the root's too.

Then, whenever you want:

> "review my Obsidian notes and see what belongs in my lore"

`obsidian-lore` sweeps the inbox, separates criteria from everything else, tells you which Lore each thing belongs to, and waits for your approval before writing anything.

**The separation is not negotiable:** a note answers *"what happened"*; Lore answers *"what changed because of it"*. Nothing crosses without explicit distillation.

| What the note records | Where it goes |
|---|---|
| A friction you resolved | Invariant Clue in the Lore |
| A task or an open problem — *"we need to add X"* | `FASES.md` — that is state, not criteria |
| Someone else's criteria you collected | Arbitration against your standard |
| A summary, a link, a jotting | Noise, and it tells you so |

> **Why a sweep and not a save button.** Writing the note already satisfies the urge to preserve, so the distillation never happens and the criterion stays asleep inside. Separating notes from Lore does not fix that — that was already tried. What fixes it is sweeping the inbox, and having every sweep tell you how many notes have gone how long unmined.

**Lore is not a second brain.** A note system accumulates information; Lore accumulates criteria. Both are useful, and they do different things.

---

## Lore Language

**Lore speaks your language.** The skills are written in English, but the Lore they generate is not: content **and** filenames go in the language you work in. `identidad.md`, `principios.md`, `FASES.md` are the Spanish canonical forms; in English they would be `identity.md`, `principles.md`, `PHASES.md`.

Fixed in every language: `CLAUDE.md`, `lore/`, `index.md`, the structure, and general technical terms.

Inside an existing Area the established names win. If a Lore ended up mixed, `transmute-lore` in **translate** mode standardizes it.

---

## Documentation

| Document | What for |
|---|---|
| [`USAGE_en.md`](./USAGE_en.md) · [`USAGE_es.md`](./USAGE_es.md) | Day-to-day usage guide, with examples. |
| [`REFERENCE_en.md`](./REFERENCE_en.md) · [`REFERENCE_es.md`](./REFERENCE_es.md) | Technical reference for every artifact and skill. |
| [`MIGRATION_en.md`](./MIGRATION_en.md) · [`MIGRATION_es.md`](./MIGRATION_es.md) | How to migrate an existing project. |

---

## Invariants

All seven skills follow the same rules:

- Lore is written in your language.
- **Criteria is never invented**: everything comes from real experience.
- A note is source, never criteria.
- Discarded noise is reported, never silently deleted.
- Every change passes a HARD GATE before being written.
- Nothing commits automatically. You review the diff.

---

## Encryption (experimental)

`create-bot` can seal a bot's criteria so it travels encrypted. It is **off by default** and **recommended for testing only**: a bot without encryption is complete, and for criteria that matters, a private repository is today's serious answer.

**The law: encrypt in distribution, never at consultation.** Payloads travel encrypted and are decrypted once on clone; at rest they are plain Markdown. Encrypting where the agent consults does not forbid reading: it makes reading **expensive**, and what is expensive stops being consulted.

AES-256-GCM with a scrypt-derived key, using only Node's stdlib. The passphrase is read from *stdin*, never as an argument and never pasted into the chat.

> **Status: experimental.** It passes its self-test, but it has **not been audited**, has no key rotation, no revocation, and no answer for a leaked passphrase. It protects the repository and the transport; **it does not protect against someone holding the passphrase**, and it does not cover what an AI tool does with the text once loaded into its context.

**Credit:** the question — *what protects a Lore that has to be shared?* — was opened by **Mantra**, by [LonelyAchemist](https://github.com/lonelyachemist-arch), which encrypted the Lore at rest. The answer here is inverted, and the code is our own.

---

## Case Studies

Lore was not designed on a whiteboard. Every decision came from applying it to real projects and watching what broke. LUS documents those applications as cases.

> **Status:** these are cases, not proofs. Small n, and all six come from the same researcher. They constrain how we use the kit; they do not pretend to be a law.

**01 — The architecture holds a whole project.** A real project built with Lore end to end: criteria accumulate, get consulted, and keep making decisions months later.

**02 — Criteria can be recovered and shared.** Four projects migrated with `transmute-lore`. A project born without Lore already had criteria scattered across comments and decisions: it is never invented, it is **rescued**. And `clean` deleted 7 redundant modules (−866 lines) losing nothing: the criteria did not disappear, it **changed owner**. *Boundary: all four in the same domain.*

**03 — Imported criteria is arbitrated, not adopted.** Three areas distilled Lore from third-party skills. The value was not the summary — it was the disagreement. The same copywriting skill lost in marketing (*"boring, functional copy always wins"*) and in journalism (*"we don't sell, we inform"*) for inverse reasons. **The outcome depends on your purpose, not on the source.**

**04 — The structure survives outside code.** Journalism and community management had real distilled Lore, with no compiler and no tests. *Boundary: criteria did not travel across domains; each was born fresh.*

**05 — Case memory does not feed distillation: it displaces it.** An incident log lived beside a `lore/` for six weeks and **took part in no decision at all** — not even when the territory it documented broke again. It was indexed and mandatory. Mining it before deleting surfaced two Clues that had been asleep for six weeks. **Preserving is not distilling, and the resemblance is the problem.** This case is why `obsidian-lore` is a sweep and not a button.

**06 — Inheritance between sibling Areas: freeze it or route it.** A project needed criteria from four Areas and only one was its mother. What is distillable about a set of criteria **is the border, not the criteria**: each Area had written its half of the line, neither had the rule for using the pair. That is where the bot's routing law comes from.

**Reach:** the repository has been cloned **906 times in 34 days**. That is a reach signal, not a demonstration: nobody knows what anyone did with their copy. It does not replace the question the cases do answer.

---

## Origin

Lore was born as a distillation of **LUS (Lore User System)**, a research program on how a human and an AI accumulate shared criteria across a long collaboration.

LUS studies the relationship. Lore is its operational implementation. One principle sums it up:

> **Experience only creates value when it can participate in a future decision.**

Influences: **Martin Buber** (*I and Thou*), **Shannon** and **Weaver** (*The Mathematical Theory of Communication*), **Gregory Bateson** ("a difference that makes a difference"), **Clark** and **Chalmers** (*The Extended Mind*).

[Explore the research in the LUS NotebookLM](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450)

### Why "Lore"?

In video games, *lore* is what gives a universe coherence. Not the mechanics: the accumulated story, the rules that keep influencing everything that can happen next. The events stop mattering. The criteria remain.
