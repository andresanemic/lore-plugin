---
name: create-area
description: Use when starting a brand-new WORK AREA that groups several projects of the same kind (web, research, blog, video, apps…). Scaffolds an area folder with its own Lore (identidad/principios + index + optional thematic modules), a CLAUDE.md contract, a FASES.md project registry and an empty proyectos/ folder. Brainstorms the area identity FIRST (HARD-GATE). Trigger on "create a work area for X", "I want to start working on <domain> with Lore".
---

# create-area — Start a new work area

Creates the **mother folder** of a domain (web, research, blog, video, apps…) with its own
**body of criteria** (area Lore) that its projects will inherit. It is the "mold of molds":
`create-project` creates projects INSIDE an area; `create-area` creates the area.

> **Startup golden rule:** the Lore's content is BORN from a brainstorm, not from a template
> filled in blind. The template gives the *shape*; the brainstorm gives the *content*.

> **Language rule:** write EVERYTHING the skill generates — content AND artifact filenames — in the
> **user's language** (the language they speak during the brainstorm), NOT the language this skill
> is written in. The names used throughout this skill (`identidad.md`, `principios.md`, `FASES.md`,
> `proyectos/`) are the Spanish canonical forms: localize them (e.g. English → `identity.md`,
> `principles.md`, `PHASES.md`, `projects/`). Fixed in every language: `CLAUDE.md`, `lore/`,
> `index.md`, `golden-paths.md`, `_starter/`. English terms of general technical use (workflow,
> stack, commit, scaffold, starter…) stay in English regardless.

## Area model (federated + hybrid)

- The area is a **light** folder: `CLAUDE.md` + `FASES.md` + `lore/` + `proyectos/` + `_starter/`.
- The area carries its own **project scaffold** in `_starter/` — the templates (`CLAUDE.template.md`,
  `FASES.md`, and `golden-paths.template.md` when the domain warrants it) **tuned to this area's
  domain**, plus any base code scaffold (e.g. a Next.js app for a web area). `create-project` stamps
  new projects from `{area}/_starter/`, so each area's projects are born in that area's shape.
- **New** projects are born inside `proyectos/` (via `create-project`), inheriting the area Lore.
- **Existing** projects are **ADOPTED by registration** in `FASES.md` (with their path), without
  moving them or touching their git.
- **This skill does NOT adopt projects**: it only creates the area clean. Adopting an existing
  project is a later manual step (add its row to `FASES.md`).
- The area Lore distills the domain's **cross-cutting method and standard**, NOT one concrete
  project's theory. A project consumes and feeds that standard; its own theory lives in the
  project's `lore/`.

## Procedure (step by step)

### 1. Identity brainstorm (HARD-GATE)

**Create no file or folder before the design is approved.** Invoke the `brainstorming` skill. Ask
**one thing at a time** and derive the tokens:

| Token | Where it comes from |
|---|---|
| `{{AREA_SLUG}}` | area name in kebab-case (e.g. `desarrollo-web`) |
| `{{AREA_TITLE}}` | readable name (e.g. "Desarrollo Web") |
| `{{PATH}}` | mother path; default `C:\Claude\{{AREA_SLUG}}` |
| `{{PURPOSE}}` | what does the area produce and for whom? → `identidad.md` |
| `{{NORTH}}` | quality standard: what is every deliverable judged against? → `identidad.md` |
| `{{ANTI_SCOPE}}` | what the area is NOT / what practice it rejects → `identidad.md` |
| `{{PRINCIPLES}}` | invariant laws of the method (may inherit from a prior corpus) → `principios.md` |
| `{{MODULES}}` | initial thematic modules (may be 0; created when the first friction appears) |

Present the design and **wait for explicit approval** before step 2.

### 2. Create the structure

```bash
PATH_AREA="{{PATH}}"
mkdir -p "$PATH_AREA/lore" "$PATH_AREA/proyectos" "$PATH_AREA/_starter"
: > "$PATH_AREA/proyectos/.gitkeep"   # keep proyectos/ present while empty
```

Resulting structure:

```
{{PATH}}\
  CLAUDE.md              → area contract (pointers to lore/, how work is done here)
  FASES.md               → project registry (path + status + internal phase)
  lore\
    index.md             → map of the area's modules
    identidad.md         → what the area is + its quality north + anti-scope
    principios.md        → invariant laws of the method
    {{thematic modules, if any}}
  _starter\              → project scaffold that create-project stamps from
    CLAUDE.template.md   → project contract template (domain-tuned pointers)
    FASES.md             → project phases template (domain-tuned phase map)
    golden-paths.template.md → critical-paths template (if the domain warrants it)
    {{base code scaffold, e.g. web/ for a web area}}
  proyectos\             → empty; new projects are born here
```

### 3. Write the files with **Write** (resolved content, no `{{TOKENS}}`)

Do not copy templates blind: write each file resolving the tokens with what was discussed in the
brainstorm. Reference templates below (§Templates).

Order: `lore/identidad.md` → `lore/principios.md` → `lore/index.md` → `FASES.md` → `CLAUDE.md`
(+ any thematic module agreed in the brainstorm).

### 3b. Generate the area's project scaffold (`_starter/`)

Write the project templates **tuned to this area's domain** into `_starter/`. These are what
`create-project` stamps for every new project — so they must reflect this area's stack, phases and
critical paths, not a generic mold.

- `_starter/CLAUDE.template.md` — the **project** contract template (slimmed to pointers), carrying
  the area's stack/conventions and `{{TOKENS}}` for the project's own name/description. Adapted from
  the area's `identidad.md`/`principios.md`.
- `_starter/FASES.md` — the **project** phases template: the typical phase map for a project in this
  domain (a web project's Research→Design→Build differs from a research project's phases).
- `_starter/golden-paths.template.md` — only if the domain has critical paths worth verifying
  (e.g. web routes); omit for domains where it does not apply.
- Any **base code scaffold** the domain needs (e.g. a `web/` Next.js app for a web area). Keep it
  versioned-only (no `node_modules`/build output) so the stack resolves to its latest version when a
  project is stamped.

> If the area is derived from an existing starter (like a web area from a prior site starter), seed
> `_starter/` from that starter's templates + app instead of writing them from scratch.

### 4. Verify and report

- Verify no unresolved `{{TOKEN}}` remains in any file.
- Verify every `index.md` link resolves to a present file.
- Report the created structure and the **next step** (create a project with `create-project`, or
  adopt an existing one by registering it by hand in `FASES.md`).

## Invariants

- `lore/` ALWAYS at the area root. `FASES.md` ALWAYS **outside** `lore/` (Lore is criteria that
  persists; FASES is state that advances — never mix them).
- The content of identidad/principles is BORN from the brainstorm, never from invented defaults.
- **Everything generated — content and artifact filenames — is in the user's language** (fixed
  names `CLAUDE.md` / `lore/` / `index.md` / `golden-paths.md` / `_starter/` and general technical
  English terms excluded). Never default to English/Spanish because the skill or the templates are.
- The area carries a **domain-tuned `_starter/`** (project templates + optional code scaffold);
  `create-project` stamps from it, never from a global/hardcoded starter. This is what keeps the kit
  path-agnostic.
- The area is NOT auto-committed. The user decides.
- This skill creates the area clean; it does NOT move or adopt existing projects.

---

## Templates (reference)

> These templates are **shape, not literal text**: render every heading, sentence AND localizable
> filename in the user's language (per the language rule above), keeping structure and the fixed
> names (`CLAUDE.md`, `lore/`, `index.md`) as-is.

### `lore/identidad.md`

```markdown
# Identidad — {{AREA_TITLE}} (work area)

## What we are
{{PURPOSE}}

## Our north (quality standard)
{{NORTH}}

## What we are NOT
{{ANTI_SCOPE}}
```

### `lore/principios.md`

```markdown
# Principios — {{AREA_TITLE}}

> Invariant laws of the method. Every project in the area inherits them.

{{PRINCIPLES}}
```

### `lore/index.md`

```markdown
# Índice del Lore — {{AREA_TITLE}}

> Navigation map. Row format: **topic · when to consult · file**.
> Projects in this area inherit these modules by relative path (`../../../lore/<file>`).

| Topic | When to consult | File |
|---|---|---|
| What we are + quality north | before any scope decision | `identidad.md` |
| Invariant laws of the method | before any method decision | `principios.md` |
```

### `FASES.md` (area project registry)

```markdown
# FASES.md — {{AREA_TITLE}}

> Registry of the area's projects. It is NOT Lore. Rewritten at each milestone.
> A project is **internal** (lives in `proyectos/`) or **adopted** (lives elsewhere and is
> registered by path, without being moved).

## Projects

| Project | Type | Path | Status | Internal phase | Description |
|---|---|---|---|---|---|
| _(empty — register the first one)_ | | | | | |

## Log
- {{DATE}} — area created.
```

### `CLAUDE.md` (area contract)

```markdown
# CLAUDE.md — {{AREA_TITLE}}

> Source of truth for Claude Code in this area. Read fully before any task.
> **{{AREA_TITLE}}** — a work area grouping several projects of the same kind.
> The project registry and their status live in **`FASES.md`**.

## The Lore — where the area's criteria lives
The area's distilled memory lives in **`lore/`**. Before deciding anything about method:
- `lore/index.md` — map: topic · when to consult · file
- `lore/identidad.md` — what we are, our north, and what we are NOT
- `lore/principios.md` — invariant laws of the method

> **`FASES.md` does NOT live in `lore/`.** Lore is criteria (persists); FASES is state (advances).

## How work is done here
1. Read this file + `FASES.md` + `lore/identidad.md` + `lore/principios.md`.
2. New projects → `create-project` (born in `proyectos/`, inheriting the area Lore).
3. Existing projects → adopt by registering in `FASES.md` (without moving them).
4. Every deliverable is judged against the north in `identidad.md`.

## Distillation
When resolving a friction or when told "save to lore", crystallize as an invariant clue
(Context → Root cause → Clue) in the matching thematic module + update `index.md`. Noise filter:
if a fact does not constrain a future decision, it does not enter.
```

---

## Project-scaffold templates (`_starter/`, reference)

These are **project** templates the area stamps — they carry `{{PROJECT_TOKENS}}` that
`create-project` resolves per project. Tune them to the area's domain.

### `_starter/CLAUDE.template.md` (project contract)

```markdown
# CLAUDE.md — {{PROJECT_TITLE}}

> Source of truth for Claude Code in this project. Read fully before any task.
> **{{PROJECT_TITLE}}** — {{PROJECT_DESCRIPTION}}
> State and plan live in **`FASES.md`**. Inherited standard: this project's area Lore.

## The Lore — where the criteria lives
- `lore/index.md` — map; thematic modules are **inherited from the area** by relative path
  (`../../../lore/<module>.md`).
- `lore/identidad.md` — this project's identity + pointer to the area standard.
- `lore/principios.md` — this project's laws + pointer to the area laws.

## Stack / conventions
{{AREA_STACK_AND_CONVENTIONS}}   # filled from the area's principios; e.g. Next.js + Tailwind + GSAP

## Base rules
- No Playwright. Manual visual/functional validation.
- `git push` only when the user says so.
- Read this file fully before touching anything.
```

### `_starter/FASES.md` (project phases)

```markdown
# FASES.md — {{PROJECT_TITLE}}

> Project state and plan. NOT Lore. Rewritten as phases advance.

## Current phase: {{INITIAL_PHASE}}

## Phase map (domain-typical; adjust from the project's source docs)
{{AREA_PHASE_MAP}}   # e.g. 1 Research · 2 Design direction · 3 Build · 4 Launch

## Log
- {{DATE}} — project scaffolded.
```

> A web area's `_starter/` also carries a `web/` app scaffold and a `golden-paths.template.md`.
> Non-web areas may need neither — include only what the domain warrants.
