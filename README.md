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

(Further references — Simondon, Althusser, Wiener, Morin, Dreyfus — are documented in the LUS corpus.)

---

## License

MIT — see [LICENSE](LICENSE).
