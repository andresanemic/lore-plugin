---
name: using-lore
description: Read this first to understand the Lore system — what Lore is, the six-artifact standard, the area↔project model, and which of the Lore skills (create-area, create-project, transmute-lore) to invoke when. Use when the user mentions "lore", asks how this kit works, starts a new work area or project, or wants to migrate an old project to the Lore standard.
---

# Using Lore

Lore is a **spec-driven development kit for humanist builders**. Where other SDD kits speak
in pure engineering terms, Lore borrows a linguistic, epistemic, communicational vocabulary —
*lore, identity, principles, transmutation, distillation* — to name the same discipline: turn
scattered, tacit project knowledge into **distilled, invariant criteria** that constrain every
future decision.

This skill is the map. It teaches the model and points to the operating skills. Read it before
invoking any other Lore skill.

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

## The skills — when to invoke which

| You want to… | Invoke |
|---|---|
| Start a **new work area** (a mother folder for a family of projects) | `create-area` |
| Start a **new project inside an existing area** | `create-project` |
| **Save a lesson** ("save to lore") — capture a clue in the project and promote generic, confirmed ones up to the area | `save-to-lore` |
| Bring an **old project with scattered criteria** up to the six-artifact standard, **clean** a project's redundant modules back down to what the area already owns, or **standardize the language** of an existing Lore | `transmute-lore` |
| Understand the system / decide which skill applies | `using-lore` (this one) |

**Order of a fresh setup:** `create-area` → `create-project` → (work, saving clues with `save-to-lore`)
→ `transmute-lore` as needed.

### project ↔ area routing (the key decision)

When you "save to lore", `save-to-lore` decides the **level**: project-specific criteria stays in the
project (`identidad.md` / `principios.md` project layer, or a project-only module); **generic +
confirmed** criteria is promoted up to the **area** lore, so every project inherits it. Capture is
always local first; promotion to the area is always gated. This is how the shared corpus grows
without polluting it with client-only quirks.

## Language of the Lore

**Lore speaks the user's language.** These skills are written in English, but the Lore they
generate is not English by default: every artifact's **content** (identidad, principios, clues,
index lines, FASES, CLAUDE) is written in the language the user works in. What never changes:
canonical filenames (`identidad.md`, `principios.md`, `index.md`, `FASES.md`, `CLAUDE.md`),
structure and relative paths, confidence markers, and English terms of general technical use
(workflow, commit, stack, scaffold…). A Lore that ended up in the wrong language — or mixed — is
standardized with `transmute-lore` (TRANSLATE mode).

## Invariants of the whole kit

- **Lore speaks the user's language.** Content in the user's language; canonical filenames and
  general technical English terms unchanged.
- **Criteria is never invented.** Every artifact is distilled from what already exists (docs, code,
  the user's words). An artifact with no real criteria stays minimal and says so.
- **Discarded noise is reported**, never deleted silently — the filter is transparent.
- **HARD-GATE before writing.** The skills that produce or restructure Lore present the proposed
  content and wait for explicit approval before touching disk.
- **No automatic commits.** The user reviews the diff and commits when they choose.
- **State ≠ criteria.** `FASES.md` never lives inside `lore/`.

## Adapting Lore to other AI tools

The portable substrate is the **`SKILL.md`** file itself: YAML frontmatter (`name`, `description`)
plus a Markdown body. The plugin packaging (`plugin.json`, `marketplace.json`) is Claude
Code-specific, but the skills are plain Markdown — copy a skill's folder into any tool that reads
instruction files, or paste its body as a system/persona prompt. The six-artifact standard and the
area↔project model are tool-agnostic conventions, not code.
