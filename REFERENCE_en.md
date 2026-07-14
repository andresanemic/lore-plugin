# Lore Plugin – Reference

This document is the technical reference for the **Lore plugin** for Claude Code.  
It defines Lore’s core concepts, the available skills, the Markdown artifacts, and how they fit together.

For a practical “how to use it every day” guide, see [`USAGE_en.md`](./USAGE_en.md).  
For a conceptual overview and philosophy, see the main [`README.md`](./README.md).

---

## 1. Core Concepts

Lore is built around a small set of concepts:

- **Criteria** – The rules and constraints that should influence future decisions.
- **Invariant Clues** – Small, distilled pieces of criteria that remain useful even after the original context is gone.
- **Areas** – Parent folders that own shared Lore; projects inherit their criteria.
- **Projects** – Individual codebases with their own Lore, inheriting from an Area.
- **Artifacts** – Markdown files that structure and store criteria and project state.

Traditional documentation stores information.  
Lore stores criteria that constrain what should happen next.

---

## 2. Skills Overview

The Lore plugin exposes five main skills in Claude Code:

| Skill            | Purpose                                     | Typical trigger phrase                                |
|------------------|---------------------------------------------|------------------------------------------------------|
| `using-lore`     | Entry point, navigation, and help           | Read first; triggers when "lore" is mentioned or a new Area/project starts |
| `create-area`    | Create a new Area with shared Lore          | "create a work area for Frontend", "I want to start working on X with Lore" |
| `create-project` | Create a project inheriting an Area         | "create a project Marketing Site in area Frontend Development" |
| `save-to-lore`   | Capture criteria after solving a problem (**capture**) or arbitrate criteria imported from a third-party skill/guide (**arbitrate**) | "save to lore", "distill this to the lore" (capture) / "distill skill X into the lore" (arbitrate) |
| `transmute-lore` | Migrate existing projects to Lore           | "transmute the lore of Legacy Frontend" (add) / "clean the lore of Legacy Frontend" (clean) / "standardize the language of the lore of Legacy Frontend" (translate) |

Each skill operates on or creates specific Markdown artifacts under your repository.

**Language:** the skills are written in English, but the Lore they generate is always written in
the **user's language** — both content and artifact filenames. `identidad.md`, `principios.md`,
`FASES.md`, `proyectos/` are the Spanish canonical forms (and appear as such throughout this
document); in English, for example, they become `identity.md`, `principles.md`, `PHASES.md`,
`projects/`. Fixed in every language: `CLAUDE.md`, `lore/`, `index.md`, `golden-paths.md`,
relative-path depth, and English terms of general technical use (workflow, commit, stack,
scaffold…). Inside an existing corpus, its established names win. A Lore in the wrong language is
standardized with `transmute-lore` in `translate` mode.

These skills are **not CLI commands**: they are Claude Code skills triggered by natural language,
not by flags or terminal syntax. The phrases above are real invocation examples, taken from the
triggers documented in each skill's `SKILL.md`.

---

## 3. Skill Details

### 3.1 `using-lore`

**Role:** Entry point into Lore.

**Responsibilities:**

- Explain Lore’s architecture for the current project or Area.
- Show which artifacts exist and how they are structured.
- Route you to the appropriate skill based on your intent.

**Typical interactions:**

- “Explain the Lore structure for this repository.”
- “What artifacts exist for this project?”
- “Which skill should I use to capture a new invariant?”

Use `using-lore` whenever you are unsure where to start.

---

### 3.2 `create-area`

**Role:** Initialize a shared Lore root for a domain (Area).

**Input:**

- Area name (e.g. `"Frontend Development"`).

**Creates / updates:**

- Area‑level `lore/` folder, with:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - thematic modules under `lore/` as needed.
- Area‑level `CLAUDE.md` and `FASES.md` (contract and project registry).
- An empty `proyectos/` folder, where future projects will be born.
- A `_starter/` folder with project templates tuned to the Area's domain
  (`CLAUDE.template.md`, `FASES.md`, and, if applicable, `golden-paths.template.md`, plus any base
  code scaffold). `create-project` instantiates these templates for each new project.

**Responsibilities:**

- Establish a place where shared criteria for a domain live.
- Provide the skeleton (`_starter/`) that projects instantiate.

Use `create-area` when you want multiple projects to share the same foundational criteria.

---

### 3.3 `create-project`

**Role:** Initialize a project‑specific Lore that inherits from an Area.

**Input:**

- Project name (e.g. `"Landing Lore"`).
- Area name (e.g. `"Frontend Development"`).

**Creates / updates:**

- The project folder, always at `{area}/proyectos/{slug}/` — never directly under the Area.
- If the Area has a `_starter/` folder, instantiates its templates (and any code scaffold) into the
  project instead of starting from scratch.
- Project‑level artifacts:
  - `lore/identidad.md` and `lore/principios.md`, leading with **their own** content, then a
    pointer to the Area standard.
  - `lore/index.md`, referencing the Area's thematic modules by relative path
    (`../../../lore/<module>.md` — three levels up, not two).
  - `FASES.md` (root) for current state and roadmap.
  - `CLAUDE.md` (root) for collaboration contract and operational references.
- Registers the new project in the Area's `FASES.md`.

**Responsibilities:**

- Give the project a place to store **its own** criteria and state.
- Avoid duplicating thematic modules already defined at Area level (they are referenced, not copied).

Use `create-project` whenever you start a new codebase inside an existing Area.

---

### 3.4 `save-to-lore`

**Role:** Distill newly acquired experience into reusable criteria.

**Two modes, chosen by the SOURCE of the criteria:**

| Mode | Source | Operation |
|---|---|---|
| **capture** (default) | lived friction (bug, collapse, client rejection) | Distills the scar into an Invariant Clue. Everything described below refers to this mode. |
| **arbitrate** | imported criteria (a *skill*, a style guide, a third-party playbook) | **Judges** that criteria against the project's purpose. Only what survives gets in. |

**`arbitrate` mode — four gates:**

1. **Capacity or criteria?** A source that **executes** (renders, crawls, compiles) is **not Lore**:
   record it as a dependency and stop there. Only a source that **judges** gets arbitrated.
2. **Does the project have a written purpose?** With no `identidad.md` there is no yardstick: facing
   an authoritative source, all you can do is obey it. Identity first.
3. **Collide, don't copy.** Only what constrains a future decision **here** gets in. Where source and
   standard conflict, **the standard wins**, and that resolution is usually the most valuable line
   produced: it exists in neither body.
4. **Exit HARD GATE — the defeats section.** The module **must** record where the source contradicts
   the standard and **loses**. **No defeats, no entry:** either nothing was arbitrated (it was a
   copy), or the source carried capacity, not criteria.

**Confidence in `arbitrate`:** what is adopted *from* the source enters as `conjecture` (nobody has
paid for it with real friction yet); **the arbitration itself** — the defeats, derived from an
already-validated identity — enters as `confirmed`. The module states its provenance: *"Distilled
from `<source>`, arbitrated against `<identidad.md>`."*

**Input:**

- A short description of the problem, decision, or lesson (e.g. `"Hydration bug on Next.js landing"`); or the name of the source to arbitrate (e.g. `"distill the copywriting skill"`).

**Process (conceptually):**

1. Ask for context: what happened, what was tried, what finally worked.
2. Extract **Invariant Clues**:
   - Constraints that should affect future decisions.
   - Rules that are valid beyond the specific incident.
3. Decide where to store them:
   - Project‑level modules under `lore/`.
   - Area‑level `principios.md` for general rules.
   - Updates to `identidad.md` or `CLAUDE.md` if identity or collaboration changed.

**Lore threshold (proactive trigger):** for Claude to propose saving something unprompted, all 4
conditions must hold at once: **constraint** (forbids a future error or demands a standard),
**signal** (distillable to Context → Cause → Clue, no raw logs), **executability** (an unambiguous
directive), and **genericity** (would help another project in the Area). Cosmetic changes never
count.

**Confidence system:** each clue is stored as `conjecture` (default) or `confirmed` (only once
actually validated in the running app). Confidence is never inflated to `confirmed` just to force
a promotion.

**Routing and promotion:** criteria is always captured in the project first; only what is
**confirmed and generic** is proposed for promotion to the Area's `lore/` (the Area is never
written silently). In the project's `index.md`, an already‑promoted line is marked with the
` · ↑` glyph — re‑running the skill on that clue is a safe no‑op (idempotency).

**Invariants:**

- Criteria are never invented.
- Everything comes from real experience.
- Discarded noise is reported, never silently removed.
- Every change passes through a HARD GATE before being written.
- Nothing commits automatically; `git push` is never run.
- A human always reviews the final diff.

Use `save-to-lore` as the main mechanism for feeding your Lore after important decisions.

---

### 3.5 `transmute-lore`

**Role:** Migrate existing projects into Lore’s architecture.

**Input:**

- Project name (e.g. `"Legacy Frontend"`).
- Mode, inferred from the phrase (not a flag):
  - `add` – "transmute the lore of Legacy Frontend", "this old project isn't in the new format" —
    create missing Lore artifacts.
  - `clean` – "clean the lore of Legacy Frontend" — remove project thematic modules that already
    duplicate the Area's.
  - `translate` – "standardize the language of the lore of Legacy Frontend", "translate the lore of
    Legacy Frontend to Spanish" — standardize the language of every Lore artifact: content and
    filenames.

**Safety precondition (Phase 0, all three modes):** the project's repository must have a clean git tree.
If there are uncommitted changes, the skill stops and asks you to commit or stash first, so the
transmutation lands as a reviewable diff.

**Process — `add` mode (conceptually):**

1. Inventory existing sources of criteria: `CLAUDE.md`/`AGENTS.md` (usually the biggest deposit of
   mixed criteria), `README.md`, a stale or missing `lore/`, `incidents/`, code comments with
   signals like "never", "always", "WARNING".
2. Separate **criteria** (constrains a future decision) from **noise** (merely descriptive).
3. Propose how to map that criteria onto:
   - `identidad.md`, `principios.md`, `index.md`, thematic modules under `lore/`.
   - `FASES.md` and `CLAUDE.md` at the root.
4. Present the full mapping (real content, not just a routing table) and **wait for explicit
   approval** before writing anything (HARD GATE).

**Process — `clean` mode (conceptually):**

1. Requires the project to have a **parent Area** (`{area}/proyectos/{slug}/`); if it is standalone,
   `clean` does not apply and this is reported.
2. Compare each of the project's thematic modules against its counterpart in `{area}/lore/`: if every
   clue in the project module is already in the Area, the module is redundant and removable.
3. Any clue **not** found in the Area is reported (not deleted) so the user can decide.
4. **Never deletes** `identidad.md`, `principios.md`, or `index.md` — only redundant thematic
   modules. Rewrites `index.md` to point at the Area's modules.

**Process — `translate` mode (conceptually):**

1. Resolve the **target language**: the one you asked for; if unstated, your own language.
2. Inventory the current language of each artifact in scope (`lore/*.md`, `FASES.md`, `CLAUDE.md`,
   `golden-paths.md` if present), including mixed-language files.
3. Present the file-by-file plan — including **renames** of localizable artifacts (e.g.
   `identidad.md` ↔ `identity.md`, `FASES.md` ↔ `PHASES.md`) — and **wait for explicit approval**
   before writing (HARD GATE), stating what will NOT be translated or renamed: `CLAUDE.md`,
   `lore/`, `index.md`, `golden-paths.md`, code blocks, identifiers, quoted error messages,
   confidence markers (`conjecture`/`confirmed`), the ` · ↑` glyph, English terms of general
   technical use, and proper nouns. Renaming `proyectos/` is opt-in and proposed separately
   (external references may point at that path).
4. Translate **preserving meaning**: it is a translation, never a rewrite — no clue is added,
   removed, or reinterpreted. Renames are applied with `git mv` and every link touching a renamed
   file is rewritten, leaving no broken links.
   Ambiguous nuances are flagged, not guessed.
5. Scope boundary: translating a project does not touch its Area's `lore/` (and vice versa); if the
   other level is in a different language, the mismatch is reported. Exception: link integrity does
   cross the boundary — renaming an Area's modules updates (or reports) its projects' links into
   those files.

In all three modes, `transmute-lore` **does not commit the target project** — the diff is left for
the user to review and decide.

Use `transmute-lore` when you already have a project and want to bring it into Lore without rebuilding everything by hand.

---

## 4. Artifacts Specification

Lore uses a fixed set of Markdown artifacts to keep criteria structured.

### 4.1 `lore/identidad.md`

**Scope:** Area or project.

**Purpose:**

- Define the identity of the project or Area.
- Capture the minimum quality standard that must be upheld.

**Typical contents:**

- Name and description.
- Core intent and audience.
- Non‑negotiable quality bar (e.g. “No user‑visible regressions in production”).

**Guidelines:**

- Keep it short and stable.
- Update only when identity or standards truly change.

---

### 4.2 `lore/principios.md`

**Scope:** Area (and sometimes project).

**Purpose:**

- Store permanent engineering and business rules.

**Typical contents:**

- Architectural principles (e.g. “Prefer static rendering for marketing pages”).
- Business rules that shape technical decisions.
- Constraints that apply across multiple projects.

**Guidelines:**

- Favor clear, actionable principles over abstract slogans.
- Move highly specific rules to thematic modules instead.

---

### 4.3 Thematic Modules under `lore/`

**Scope:** Project and Area.

**Purpose:**

- Group distilled experience by domain.

**Examples:**

- `frontend-rendering.md`
- `error-handling.md`
- `data-modeling.md`
- `deployment-and-ops.md`

**Typical contents:**

- Invariant Clues related to that domain.
- Short context snippets only when needed to understand a rule.

**Guidelines:**

- Each module should focus on a single domain or concern.
- When a module grows too large, consider splitting it.

---

### 4.4 `lore/index.md`

**Scope:** Area or project.

**Purpose:**

- Act as a navigation map for Lore.

**Typical contents:**

- High‑level structure:
  - links to `identidad.md` and `principios.md`;
  - list of thematic modules with short descriptions.
- Pointers to project‑level and Area‑level artifacts.

**Guidelines:**

- Keep this file up‑to‑date when adding or renaming modules.
- Make it easy for a newcomer to know where to look for a given topic.

---

### 4.5 `FASES.md`

**Scope:** Project (root level).

**Purpose:**

- Describe the current state and roadmap of the project.

**Typical contents:**

- Current phase (e.g. “Exploration”, “MVP”, “Scaling”).
- Active goals and constraints.
- Upcoming milestones relevant to criteria and decisions.

**Guidelines:**

- Update as the project progresses through phases.
- Use concise, factual descriptions.

---

### 4.6 `CLAUDE.md`

**Scope:** Project (root level).

**Purpose:**

- Define the collaboration contract between humans and Claude (or other AI tools).
- Store operational references for AI‑assisted work.

**Typical contents:**

- How Claude is expected to be used in the project.
- Non‑negotiable constraints for AI suggestions (e.g. “Never bypass code review”).
- Pointers to prompts, workflows, and safety rails.

**Guidelines:**

- Think of it as the “working agreement” for human–AI collaboration.
- Keep it explicit and practical.

---

### 4.7 `golden-paths.md` (optional)

**Scope:** Project or Area (root level).

**Purpose:**

- Document the critical routes/flows that must be manually verified (e.g. key web routes in a
  frontend Area).

This is not one of the six mandatory artifacts: `create-area` and `create-project` only generate it
when the domain warrants it (e.g. a web Area with critical routes). If the domain doesn't need it,
it simply doesn't exist.

---

## 5. Filesystem Layout

A typical Lore layout, with an Area and a project, looks like this:

```text
{area}/
  lore/
    identidad.md
    principios.md
    index.md
    <thematic-modules>.md
  _starter/                    → templates that create-project instantiates
    CLAUDE.template.md
    FASES.md
    golden-paths.template.md   → only if the domain warrants it
  FASES.md                     → Area's project registry
  CLAUDE.md                    → Area contract

  proyectos/
    {slug}/
      lore/
        identidad.md            → own content + pointer to the Area's
        principios.md           → own content + pointer to the Area's
        index.md                → points to Area modules via ../../../lore/<module>.md
        <own modules>.md        → only criteria specific to this project
      FASES.md
      CLAUDE.md
```

Key points of this hierarchy:

- Projects **always** live at `{area}/proyectos/{slug}/`, never directly under the Area.
- Generic thematic modules are **not copied** into the project: they live once in `{area}/lore/`,
  and the project's `index.md` references them by relative path. That path climbs **three** levels
  (`lore/` → `{slug}/` → `proyectos/` → `{area}/`), not two.
- Shared criteria live in the Area. Project‑specific criteria live in the project.

---

## 6. Operational Invariants

Lore’s behavior is governed by a set of shared invariants:

- **Lore is written in the user's language** – content and artifact filenames; only `CLAUDE.md`, `lore/`, `index.md`, `golden-paths.md`, and English terms of general technical use stay fixed.
- **Criteria are never invented** – all rules come from actual experience.
- **Everything comes from real work** – experiments, incidents, decisions.
- **Discarded noise is reported** – nothing is silently removed.
- **Every change passes through a HARD GATE** – criteria must be reviewed before being written.
- **Nothing commits automatically** – human review is required.
- **A human always reviews the final diff** – AI assists, but does not silently change Lore.

These invariants distinguish Lore from generic note‑taking or logging tools:  
the goal is to maintain a trusted, human‑curated body of criteria that AI can rely on.

---

## 7. Relationship to README and Usage Docs

Lore’s documentation is typically split as follows:

- `README.md` – story, motivation, architecture overview, installation, and high‑level comparison with traditional docs.
- `USAGE_en.md` / `USAGE_es.md` – practical usage guides and workflows.
- `REFERENCE_en.md` / `REFERENCE_es.md` – this document, which defines the technical model.
- `MIGRATION_en.md` / `MIGRATION_es.md` – migration strategies and examples for legacy projects.

All of these files live at the repository root (there is no `docs/` folder).

Keeping reference separate from usage and narrative docs makes it easier to:

- Look up specific skill behavior or artifact semantics.
- Keep the README focused and readable.
- Evolve usage patterns without breaking the underlying model.
