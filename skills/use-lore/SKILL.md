---
name: use-lore
description: Read this first to understand the Lore system — what Lore is, the six-artifact standard, the area↔project model, and which of the Lore skills (brainstorming-lore, create-area, create-project, create-bot, save-to-lore, transmute-lore, obsidian-lore) to invoke when. Carries the kit's HARD-GATE for its very first use on a machine with no Lore yet (a brainstorm, never a menu of commands) and the standard that governs every later one — the skill that owns an artifact is always invoked to write it, and the version that runs is the installed, up-to-date one. Use when the user mentions "lore", asks how this kit works, installs or updates the plugin, starts a new work area, project or bot, wants to migrate an old project to the Lore standard, or keeps Obsidian notes in the same folder tree.
---

# Using Lore

Lore is a **spec-driven development kit for humanist builders**. Where other SDD kits speak
in pure engineering terms, Lore borrows a linguistic, epistemic, communicational vocabulary —
*lore, identity, principles, transmutation, distillation* — to name the same discipline: turn
scattered, tacit project knowledge into **distilled, invariant criteria** that constrain every
future decision.

This skill is the map. It teaches the model and points to the operating skills. Read it before
invoking any other Lore skill.

## 0. Very first use of the kit — a brainstorm, not a menu (HARD-GATE)

**If this machine has no Lore yet** — no area with a `lore/`, no project carrying the six artifacts —
this runs **before anything else**, and before offering any skill by name. The kit **brainstorms to
build** every artifact it makes; it would be incoherent for the kit itself to greet its first user
with a list of seven commands.

> **Invoke Lore Plugin's own `brainstorming-lore` skill** (`lore:brainstorming-lore` where skills are
> namespaced) and run this through it. If the runtime failed to expose an installed Lore skill,
> run the minimal version below yourself. A kit that cannot start without a third-party skill is a
> kit that does not start.

### Move 1 — look before asking

Scan the working tree and put on screen what is actually there: folders that look like work areas,
projects with scattered criteria (a bloated `CLAUDE.md`, a kilometric `README`, an empty or stale
`lore/`), and any free-note inbox. Short lines, no prose.

This is the presentation **and** the pre-flight at once. Close it with the coverage, never with a
clean bill of health: what you verified is that these folders exist and what shape they are in, not
that any of it is good.

### Move 2 — brainstorm, one question at a time

Follow the thread of the answers instead of walking a list. **Ask only what changes which skill
runs first:**

- What do you work on, in your own words? (stored verbatim — it is the yardstick every later
  arbitration needs)
- Is this one kind of work or several? Ask by the **condition**, never with a closed list: *«does
  your work fall into more than one of these?»* If the answer names more than one, that is an
  **area per kind**, and the border question comes before executing anything.
- Does criteria for this already exist somewhere — in your head, in a doc, in an old repo? That is
  the difference between `create-area` and `transmute-lore`, and the user is the only one who knows.
- Is there anything explicitly out of bounds?

### Move 3 — close by naming the route, and run it

State which skill runs first and why, in one line, then run it. Do not list the other six. The map
below exists for **you**, so you can pick; it is not a menu to hand over.

> **What this move must never do is end in a recommendation.** The first use of the kit produces a
> first artifact, or it produced nothing.

**Boundary:** this gate is for the **first** Lore on the machine. Once one area exists, entry is by
the routing table below and this section is skipped.

## The standard: the skill runs, and it is the current one

Two rules that hold for **every** new Lore configuration the user builds, forever, not only the
first:

1. **The skill that governs an artifact is always invoked to write it.** Not consulted afterwards,
   not imitated from memory. See *The failure these skills cannot see*, below.
2. **The version that runs is the installed, up-to-date one.** These skills accumulate scars: a
   version behind is a version that does not carry the last defeat somebody already paid for. If the
   installed copy is stale, updating it comes **before** the work, not after — and the plugin cache
   is indexed by version, so what was published without a version bump was never received.

*Why this is a standard and not advice:* the value of the kit is cumulative and lives in the skills.
An agent who writes criteria by hand, or who runs a version from three fixes ago, produces something
that looks identical and silently lacks the gates. Nothing in the output announces it.

## What Lore is (and is not)

**Lore is criteria that persists** — the rules, the standard, the hard-won scars — kept separate
from **state that advances** (the current phase, the todo). A "Pista Invariante" (invariant clue)
is the atom of Lore: `Context → Root cause → Clue → Confidence`. If a sentence does not constrain
a future decision, it is **not** Lore; it is description, and it stays out.

Lore is **not** a README, not a changelog, not a design doc. Those describe. Lore constrains.

## The six-artifact standard

Every project's criteria lives in exactly these artifacts:

| Artifact | Holds | Location |
|---|---|---|
| `identidad.md` | What the project is, its purpose, its **quality floor** (the north star). | `lore/` |
| `principios.md` | Invariant laws (technical + business): prohibitions and imperatives. | `lore/` |
| Thematic modules | Technical scars by topic (animation, layout, scroll…) as invariant clues. | `lore/` |
| `index.md` | Navigation map of the lore: one line per pattern. | `lore/` |
| `FASES.md` | The project's state and plan (current phase, focus). **Outside `lore/`.** | root |
| `CLAUDE.md` | The contract, slimmed to **pointers** (never duplicated criteria). | root |

> Lore is criteria (it persists); `FASES.md` is state (it advances). Never mix them.

## The area ↔ project model

Lore scales through **work areas**:

- An **area** is a mother folder (e.g. `desarrollo-web/`) with its **own `lore/`** — the source of
  criteria its projects inherit. Generic modules live **once**, in the area.
- A **project** lives in `{area}/proyectos/{name}/` and gets its lore by **inheriting from the
  area**. It keeps only what is its own: `identidad.md` + `principios.md` (area base + a project
  layer) and an `index.md` that **points to the area's modules** via relative path
  (e.g. `../../../lore/animation.md`).

This keeps criteria DRY: fix a generic clue once in the area, every project sees it.

### The third shape: a bot

A **bot** is a project (it lives at `{area}/proyectos/{slug}/`) with two extra properties: it is an
**installable plugin**, and it **routes outward** into Lore owned by other projects and areas.

| | Area | Project | Bot |
|---|---|---|---|
| Holds | projects | one piece of work | **a work session** |
| Its Lore governs | the domain's method | that work | **how the agent behaves** |
| Installable | no | no | **yes** |

Areas and projects are places; a bot is a lens you carry into them. A bot owns none of the criteria
it routes to — which is exactly why it is **not** an area: an area that accumulates criteria it
never paid for will start receiving promotions that belong somewhere else.

## The skills — when to invoke which

| You want to… | Invoke |
|---|---|
| Start a **new work area** (a mother folder for a family of projects) | `create-area` |
| Start a **new project inside an existing area** | `create-project` |
| Build a **bot** — an installable plugin that carries a canon and works inside real repositories, either from zero or by federating Lore already dissolved across several areas | `create-bot` |
| Open Lore-governed bots/projects through a provider and model launcher | `create-bot`; use the separate `lore-in-the-shell` skill when installed, otherwise build its minimal fallback there |
| **Save a lesson** ("save to lore") — capture a clue from **lived friction** in the project and promote generic, confirmed ones up to the area | `save-to-lore` (**CAPTURE**, default) |
| **Distill from an external body of criteria** — a skill, a style guide, a third-party playbook ("destila esta skill") | `save-to-lore` (**ARBITRATE**): imported criteria is judged against this Entre's purpose; only what survives enters, and the module must state **where the source loses** |
| Bring an **old project with scattered criteria** up to the six-artifact standard, **clean** a project's redundant modules back down to what the area already owns, or **standardize the language** of an existing Lore | `transmute-lore` |
| **Raise a healthy Lore to a newer version of these skills** — it is in the standard and in use, but predates gates the kit learned later. Nothing looks broken, which is why nobody upgrades it | `transmute-lore` (**UPGRADE**): arbitrates the existing Lore against the current version, adds what is missing, and leaves untouched what the project **earned** with real friction |
| Export a project, Area or bot's **live routed Lore as one Markdown** for a chat, AI project or notebook | `transmute-lore` (**CRYSTALLIZE**): creates a safe, traceable snapshot without replacing the live Lore or including private material by default |
| Keep **Obsidian notes in the same folder tree** as the Lore, and **mine that inbox** for what deserves to become criteria ("revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore") | `obsidian-lore` |
| Understand the system / decide which skill applies | `use-lore` (this one) |

**Order of a fresh setup:** `create-area` → `create-project` → (work, saving clues with `save-to-lore`)
→ `transmute-lore` as needed. A **bot** comes later, once several projects have Lore worth carrying
into one session — `create-bot` federates what exists; it does not substitute for building it.

**Source-side precedence:** when a request points at `notas/` or `notes/` and asks to integrate,
extract, distill or save its contents anywhere, invoke `obsidian-lore` first. Then invoke the skill
that owns the destination (`save-to-lore`, `research-lus`, or another domain workflow). A domain
skill understanding the notes does not replace the mining pass or its frontmatter.

### The failure these skills cannot see: not being invoked at all

Every skill above describes what to do **once you are inside it**. None of them fires if you never
enter, and the moment you decide not to enter has a specific shape — it feels like competence:

| The thought | What it actually means |
|---|---|
| "I already know what to write" | **Invoke.** This is the signal, not the exemption. |
| "This is faster to write by hand" | It is. That is why the skipped step is the one with the gate. |
| "It's one clue, not a migration" | One clue is exactly `save-to-lore`'s unit of work. |
| "I'll invoke it after I draft the file" | The skill decides the **mode**, and the mode decides what the draft must contain. |
| "The lore is small / this project is simple" | Size is not the classifier. Source of the criteria is. |
| "The research/domain skill already read the notes" | Reading is not mining. If the source is an inbox, invoke `obsidian-lore` and leave a trace in every note. |

**There is no error signal for this.** Criteria written by hand comes out well-worded, lands in the
right file, and passes human review. What is missing does not look missing, because it never got
written: the provenance header, the confidence markers, the defeats section — and, above all, the
**mode**. An agent who assumes CAPTURE when the source was imported produces a module with no
defeats, which is precisely what ARBITRATE's exit gate rejects. Redacting well does not compensate
for skipping the gate; the gate was never about prose.

> **Writing into any `lore/`, `canon/` or `principios.md` without invoking the skill that governs it
> is applying the model's knowledge where the institutional one belonged** — the exact inversion the
> whole kit exists to prevent.

*Boundary:* this governs **writing** criteria while the skill is installed. Reading a Lore needs no
skill, and with the plugin absent you write by hand — and say that you did.

### project ↔ area routing (the key decision)

When you "save to lore", `save-to-lore` decides the **level**: project-specific criteria stays in the
project (`identidad.md` / `principios.md` project layer, or a project-only module); **generic +
confirmed** criteria is promoted up to the **area** lore, so every project inherits it. Capture is
always local first; promotion to the area is always gated. This is how the shared corpus grows
without polluting it with client-only quirks.

### Where experience comes from — notes are the entrance, not the destination

Most people arrive already holding a pile of free notes (Obsidian, a folder of Markdown, meeting
minutes). That pile is a legitimate **source** and it is not Lore: a note answers *«what happened»*,
Lore answers *«what changed in the relationship because of what happened»*. The path between them
has three steps and the middle one is an act, not a folder:

```text
experience piled up (notes)  →  distillation (an explicit pass + HARD-GATE)  →  criteria (lore/)
```

`obsidian-lore` governs the first arrow when the notes live in the same tree as the Lore — the
vault being the mother folder of the Areas. It captures notes **outside any `lore/`** and **mines**
the inbox, routing what survives into `save-to-lore`. It writes no criteria itself.

> **Why an explicit mining pass and not simply "save when you feel like it".** A note satisfies the
> urge to preserve without producing criteria — the record exists, so the distillation never
> happens, and the criterion stays inert inside it. Separating notes from Lore does not fix that;
> only sweeping the inbox does.

## Language of the Lore

**Lore speaks the user's language.** These skills are written in English, but the Lore they
generate is not English by default: every artifact — **content AND filename** — is written in the
language the user works in. The artifact names used across these skills (`identidad.md`,
`principios.md`, `FASES.md`, `proyectos/`, `fuente/`) are the Spanish canonical forms; in another
language they localize (e.g. English: `identity.md`, `principles.md`, `PHASES.md`, `projects/`,
`source/`).

What stays **fixed in every language**: `CLAUDE.md` (a Claude Code convention), `lore/` (the kit's
own name), `index.md`, `golden-paths.md`, `_starter/`, structure and relative-path depth,
confidence markers, and English terms of general technical use (workflow, commit, stack,
scaffold…).

**Consistency wins:** inside an existing area or project, the filenames already in use are the law
— never mix naming schemes. A Lore that ended up in the wrong language — or mixed — is standardized
with `transmute-lore` (TRANSLATE mode), which translates content and renames artifacts together.

## Invariants of the whole kit

- **Lore speaks the user's language.** Content and artifact filenames in the user's language; the
  fixed names (`CLAUDE.md`, `lore/`, `index.md`) and general technical English terms unchanged.
  Inside an existing corpus, its established names win.
- **Criteria is never invented.** Every artifact is distilled from what already exists (docs, code,
  the user's words). An artifact with no real criteria stays minimal and says so.
- **Discarded noise is reported**, never deleted silently — the filter is transparent.
- **HARD-GATE before writing.** The skills that produce or restructure Lore present the proposed
  content and wait for explicit approval before touching disk.
- **No automatic commits.** The user reviews the diff and commits when they choose.
- **State ≠ criteria.** `FASES.md` never lives inside `lore/`.
- **A note is source, never criteria.** Free notes are never loaded as if they were Lore; they cross
  only through an explicit distillation with its gate.

## Adapting Lore to other AI tools

The portable substrate is the **`SKILL.md`** file itself: YAML frontmatter (`name`, `description`)
plus a Markdown body. The plugin packaging (`plugin.json`, `marketplace.json`) is Claude
Code-specific, but the skills are plain Markdown — copy a skill's folder into any tool that reads
instruction files, or paste its body as a system/persona prompt. The six-artifact standard and the
area↔project model are tool-agnostic conventions, not code.
