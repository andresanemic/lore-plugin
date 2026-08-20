---
name: create-area
description: Use when starting a brand-new WORK AREA that groups several projects of the same kind (web, research, blog, video, apps…). Scaffolds an area folder with its own Lore (identidad/principios + index + optional thematic modules), one host-selected instruction contract, a FASES.md project registry and an empty proyectos/ folder. Brainstorms the area identity FIRST (threshold). Trigger on "create a work area for X" or "I want to start working on a domain with Lore".
---

# create-area — Start a new work area

You are writing the same rule into a third repository. Not copying it — rewriting it, slightly
differently each time, because you half-remember how you phrased it last time. In six months those
three versions will disagree and none of them will be marked as the wrong one.

That is the problem an area solves. This skill creates the **mother folder** of a domain (web,
research, blog, video, apps…) with its own **body of criteria** (area Lore) that its projects
inherit. It is the "mold of molds": `create-project` creates projects INSIDE an area; `create-area`
creates the area.

> **Startup golden rule:** the Lore's content is BORN from a brainstorm, not from a template
> filled in blind. The template gives the *shape*; the brainstorm gives the *content*.

> **Language rule:** write EVERYTHING the skill generates — content AND artifact filenames — in the
> **user's language** (the language they speak during the brainstorm), NOT the language this skill
> is written in. The names used throughout this skill (`identidad.md`, `principios.md`, `FASES.md`,
> `proyectos/`) are the Spanish canonical forms: localize them (e.g. English → `identity.md`,
> `principles.md`, `PHASES.md`, `projects/`). Fixed in every language: the selected contract name
> (`CLAUDE.md` or `AGENTS.md`), `lore/`,
> `index.md`, `golden-paths.md`, `_starter/`, the `<!-- lore:always-on -->` marker pair (literal, never localized — localizing it breaks idempotent stamping silently). English terms of general technical use (workflow,
> stack, commit, scaffold, starter…) stay in English regardless.

## Area model (federated + hybrid)

- The area is a **light** folder: one instruction contract + `FASES.md` + `lore/` + `proyectos/` + `_starter/`.
- The area carries its own **project scaffold** in `_starter/` — the templates (`{{CONTRACT_FILE}}.template.md`,
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

### 1. Identity brainstorm (threshold)

**Create no file or folder before the design is approved.** Invoke Lore Plugin's own
`brainstorming-lore` skill (`lore:brainstorming-lore` where skills are namespaced). Ask
**one thing at a time** and derive the tokens:

| Token | Where it comes from |
|---|---|
| `{{AREA_SLUG}}` | area name in kebab-case (e.g. `desarrollo-web`) |
| `{{AREA_TITLE}}` | readable name (e.g. "Desarrollo Web") |
| `{{PATH}}` | mother path; default `{{ROOT}}/{{AREA_SLUG}}`, where `{{ROOT}}` is the user's own root of areas — ask for it, never assume one |
| `{{CONTRACT_FILE}}` | the user's primary host: Claude Code → `CLAUDE.md`; Codex → `AGENTS.md` |
| `{{PURPOSE}}` | what does the area produce and for whom? → `identidad.md` |
| `{{NORTH}}` | quality standard: what is every deliverable judged against? → `identidad.md` |
| `{{ANTI_SCOPE}}` | what the area is NOT / what practice it rejects → `identidad.md` |
| `{{REGISTRO}}` | how technical the kit speaks here: `tecnico` / `equilibrado` (default) / `llano` → `identidad.md`. **Inferred from how the user wrote during the brainstorm, never asked.** Declare which one you picked in one line and offer the correction in the same breath. It calibrates how much ground surrounds a rule and **never the rules themselves** — a threshold stays a threshold. It is a declared preference, not criteria: no confidence marker, never promoted |
| `{{PRINCIPLES}}` | invariant laws of the method (may inherit from a prior corpus) → `principios.md` |
| `{{MODULES}}` | initial thematic modules (may be 0; created when the first friction appears) |

> **If `create-bot` sent you here, the area is `bots` and its domain is *the user's bots* — never the
> domain of any one of them.** There is **one** `bots` area, and every bot is a project inside it. A
> second area named after the bot being requested is the failure `create-bot` documents as *«why it
> must not be an area»*, arriving through this skill instead of being caught by that one. Do not
> brainstorm an identity out of the bot's purpose: that purpose belongs to the bot, and it gets
> written when control returns.

**If the user already has material about this domain — source documents, or a pile of free notes
they have been writing (an Obsidian inbox, meeting minutes) — read it before proposing anything.**
An area born from real material has a purpose and an anti-scope that can be argued; one born from a
blank brainstorm has adjectives. The notes are source: they shape the identity, and nothing in them
becomes criteria until it is distilled.

Present the design and **wait for explicit approval** before step 2.

During this structural brainstorm, apply `brainstorming-lore`'s **recognizable continuity** contract:
carry each approved decision into the accumulated area design and recap it at contextual milestones.

### 2. Create the structure

```bash
PATH_AREA="{{PATH}}"
mkdir -p "$PATH_AREA/lore" "$PATH_AREA/proyectos" "$PATH_AREA/_starter"
: > "$PATH_AREA/proyectos/.gitkeep"   # keep proyectos/ present while empty
```

Resulting structure:

```
{{PATH}}\
  {{CONTRACT_FILE}}      → the one area contract (pointers to lore/, how work is done here)
  FASES.md               → project registry (path + status + internal phase)
  lore\
    index.md             → map of the area's modules
    identidad.md         → what the area is + its quality north + anti-scope
    principios.md        → invariant laws of the method
    {{thematic modules, if any}}
  _starter\              → project scaffold that create-project stamps from
    {{CONTRACT_FILE}}.template.md → project contract template (domain-tuned pointers)
    FASES.md             → project phases template (domain-tuned phase map)
    golden-paths.template.md → critical-paths template (if the domain warrants it)
    {{base code scaffold, e.g. web/ for a web area}}
  proyectos\             → empty; new projects are born here
```

### 3. Write the files with **Write** (resolved content, no `{{TOKENS}}`)

Do not copy templates blind: write each file resolving the tokens with what was discussed in the
brainstorm. Reference templates below (§Templates).

Order: `lore/identidad.md` → `lore/principios.md` → `lore/index.md` → `FASES.md` → `{{CONTRACT_FILE}}`
(+ any thematic module agreed in the brainstorm).

### 3b. Generate the area's project scaffold (`_starter/`)

Write the project templates **tuned to this area's domain** into `_starter/`. These are what
`create-project` stamps for every new project — so they must reflect this area's stack, phases and
critical paths, not a generic mold.

**Floor, not clone.** Tune the *content* (phases, stack, north) to this domain. Do **not** copy
another person's Notion bases, house style or corpus into the kit. Every `_starter/` shares one
**structural** floor — the same one a later user of this kit must receive:

1. `{_starter/{{CONTRACT_FILE}}.template.md}` and `{_starter/FASES.md}` both exist.
2. The contract carries `<!-- lore:always-on -->` with exactly four things, under 25 lines: what
   Lore governs; where it lives (relative paths); where `FASES.md` lives; the signal to invoke the
   skill. Rules and ceiling are in `use-lore`.
3. A **project** starter inherits area modules by `../../../lore/<module>.md`, never by copy.
4. A **bot** starter (this area is `bots`) is the bot variant: `canon/` + `lore/enrutamiento.md` +
   `FASES.md`. It does not list federated Lores one by one, and it does not put `identidad.md` in
   the block in place of `canon/`.
5. Present tense says **threshold**, never `HARD-GATE`.
6. Nothing teaches wrapping the artifact as a shareable plugin. Packaging is crystallization.

- `_starter/{{CONTRACT_FILE}}.template.md` — the **project** contract template (slimmed to pointers), carrying
  the area's stack/conventions and `{{TOKENS}}` for the project's own name/description. Adapted from
  the area's `identidad.md`/`principios.md`. **If this area is `bots`** (or `create-bot` sent you
  here), write the **bot variant** below, not the project one.
- `_starter/FASES.md` — the **project** phases template: the typical phase map for a project in this
  domain (a web project's Research→Design→Build differs from a research project's phases). For
  `bots`, the map includes crystallize-if-it-must-travel, not a plugin-wrap phase.
- `_starter/golden-paths.template.md` — only if the domain has critical paths worth verifying
  (e.g. web routes); omit for domains where it does not apply.
- Any **base code scaffold** the domain needs (e.g. a `web/` Next.js app for a web area). Keep it
  versioned-only (no `node_modules`/build output) so the stack resolves to its latest version when a
  project is stamped.

> If the area is derived from an existing starter (like a web area from a prior site starter), seed
> `_starter/` from that starter's templates + app instead of writing them from scratch — then still
> pass the floor above. A seeded starter that lacks the always-on block or still says `HARD-GATE`
> is not finished.

### 4. Verify and report

- Verify the area and starter each contain exactly one contract file. Do not generate both names by
  default. If the user needs both hosts, offer Codex's `project_doc_fallback_filenames` setting or,
  only with explicit approval, a minimal pointer adapter.
- Verify the **floor** on both contracts (area + `_starter/`): one `<!-- lore:always-on -->` block,
  four things, ≤ 25 lines; `FASES.md` named outside `lore/`; no `HARD-GATE` in present tense; no
  plugin wrap. A project starter points at `../../../lore/`. A `bots` starter points at `canon/`
  and `lore/enrutamiento.md`.
- Verify no unresolved `{{TOKEN}}` remains in any file.
- Verify every `index.md` link resolves to a present file.
- Report the created structure and the **next step** (create a project with `create-project`, or
  adopt an existing one by registering it by hand in `FASES.md`).
- **If another skill sent you here, the next step is to go back to it** — not `create-project`.
  `create-bot` needs its host area before the bot can exist, and `create-project` needs the area it
  was pointed at. Name the skill you are returning to and **resume it in the same session**. The user
  asked for a bot or a project; an area reported as the finished deliverable answers a request nobody
  made, and the request that is still open is the one they will not restate.

## Invariants

- `lore/` ALWAYS at the area root. `FASES.md` ALWAYS **outside** `lore/` (Lore is criteria that
  persists; FASES is state that advances — never mix them).
- The content of identidad/principles is BORN from the brainstorm, never from invented defaults.
- **Everything generated — content and artifact filenames — is in the user's language** (fixed
  selected contract name (`CLAUDE.md` or `AGENTS.md`) / `lore/` / `index.md` / `golden-paths.md` / `_starter/` and general technical
  English terms excluded). Never default to English/Spanish because the skill or the templates are.
- The area carries a **domain-tuned `_starter/`** (project templates + optional code scaffold);
  `create-project` stamps from it, never from a global/hardcoded starter. This is what keeps the kit
  path-agnostic. The starter always meets the **structural floor** in §3b — that is how a stranger
  using this kit gets the same quality of `_starter/` as a mature area, without inheriting someone
  else's domain. When the area is `bots`, the starter is the bot variant.
- **A paragraph is a paragraph** (kit invariant in `use-lore`): generated `lore/`, contract and
  `FASES.md` are not hard-wrapped at column 80.
- The area is NOT auto-committed. The user decides.
- This skill creates the area clean; it does NOT move or adopt existing projects.
- **A derived area returns to its caller.** This skill is a **step** inside `create-bot` and
  `create-project` as often as it is a destination, and ending at its own report is how a request for
  three bots becomes three areas: what names the deliverable is the caller's request, which is still
  open. When called by `create-bot`, the area is `bots` — one of them, holding every bot as a project.

---

## Templates (reference)

> These templates are **shape, not literal text**: render every heading, sentence AND localizable
> filename in the user's language (per the language rule above), keeping structure and the fixed
> names (the selected contract filename, `lore/`, `index.md`) as-is.

### `lore/identidad.md`

```markdown
# Identidad — {{AREA_TITLE}} (work area)

registro: {{REGISTRO}}

## What we are
{{PURPOSE}}

## Our north (quality standard)
{{NORTH}}

## What we are NOT
{{ANTI_SCOPE}}
```

> `registro:` sits above the sections because it is **not** one of them: it is a declared preference
> about how the kit speaks here, not a claim about what this area is. It carries no confidence marker
> and is never promoted.

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

### `{{CONTRACT_FILE}}` (area contract)

```markdown
# {{CONTRACT_FILE}} — {{AREA_TITLE}}

> Source of truth for AI agents in this area. Read fully before any task.
> **{{AREA_TITLE}}** — a work area grouping several projects of the same kind.
> The project registry and their status live in **`FASES.md`**.

<!-- lore:always-on -->
## The Lore — where the area's criteria lives
The area's distilled memory lives in **`lore/`**. Before deciding anything about method:
- `lore/index.md` — map: topic · when to consult · file
- `lore/identidad.md` — what we are, our north, and what we are NOT
- `lore/principios.md` — invariant laws of the method

**Where the state lives: `FASES.md`, at the root.** It does **NOT** live in `lore/` — Lore is criteria
(persists), FASES is state (advances). Read it alongside the Lore: the criteria says how, the state
says which.

> **Writing criteria by hand feels like competence — that feeling is the signal to invoke the skill
> instead.** `save-to-lore` to capture or arbitrate one clue, `transmute-lore` to restructure.
> Nothing is written into `lore/` without them.
<!-- /lore:always-on -->

## How work is done here
1. Read this file + `FASES.md` + `lore/identidad.md` + `lore/principios.md`.
2. New projects → `create-project` (born in `proyectos/`, inheriting the area Lore).
3. Existing projects → adopt by registering in `FASES.md` (without moving them).
4. Every deliverable is judged against the north in `identidad.md`.

## Distillation
When resolving a friction or when told "save to lore", distill as an invariant clue
(Context → Root cause → Clue) in the matching thematic module + update `index.md`. Noise filter:
if a fact does not constrain a future decision, it does not enter. Packaging a tree is crystallization, not this.
```

---

## Project-scaffold templates (`_starter/`, reference)

These are **project** templates the area stamps — they carry `{{PROJECT_TOKENS}}` that
`create-project` resolves per project. Tune them to the area's domain.

### `_starter/{{CONTRACT_FILE}}.template.md` (project contract)

```markdown
# {{CONTRACT_FILE}} — {{PROJECT_TITLE}}

> Source of truth for AI agents in this project. Read fully before any task.
> **{{PROJECT_TITLE}}** — {{PROJECT_DESCRIPTION}}
> State and plan live in **`FASES.md`**. Inherited standard: this project's area Lore.

<!-- lore:always-on -->
## The Lore — where the criteria lives
- `lore/index.md` — map; thematic modules are **inherited from the area** by relative path
  (`../../../lore/<module>.md`).
- `lore/identidad.md` — this project's identity + pointer to the area standard.
- `lore/principios.md` — this project's laws + pointer to the area laws.

**Where the state lives: `FASES.md`, at the project root** — never inside `lore/`.

> **Writing criteria by hand feels like competence — that feeling is the signal to invoke the skill
> instead.** `save-to-lore` decides whether a clue stays here or is promoted to the area.
<!-- /lore:always-on -->

## Stack / conventions
{{AREA_STACK_AND_CONVENTIONS}}   # filled from the area's principios; e.g. Next.js + Tailwind + GSAP

## Base rules
- {{AREA_BASE_RULES}}
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

### `_starter/` when this area is `bots` (bot variant)

`create-bot` writes the live contract from its own skill. This starter is the floor that skill
must not fall below, and what `create-project` would stamp if invoked in this area. Same four
things, same 25-line ceiling — `canon/` and the routing table, never the federated Lores.

```markdown
# {{CONTRACT_FILE}} — {{PROJECT_TITLE}}

> Source of truth for AI agents in this bot. Read fully before any task.
> **{{PROJECT_TITLE}}** — {{PROJECT_DESCRIPTION}}
> State and plan live in **`FASES.md`**. Inherited standard: the `bots` area Lore.

<!-- lore:always-on -->
## The criteria this bot carries
- `canon/` — what the bot **is**. Loaded before the first decision, always. Lives next to the contract.
- `lore/enrutamiento.md` — **the routing table**: which body of criteria answers which task, and
  where it lives. Consulted there, never from memory.
- `FASES.md` — state, outside `lore/`. It advances; the criteria persists.

> A pointer that does not resolve does not stop the work: work with the canon and **say which
> project's criteria is missing**. A missing canon does stop it.

> **Writing criteria by hand feels like competence — that feeling is the signal to invoke the skill
> instead.** `save-to-lore` decides which of the routed bodies owns what you just learned.
<!-- /lore:always-on -->

## The two layers, which are not the same
- `lore/` — how this bot is **maintained**.
- `canon/` — what the bot **is**. Next to the contract, not inside a skill.

## Base rules
- A bot is a folder you open. Do not wrap it as a plugin. Packaging is crystallization: unpacking
  rebuilds `lore-ecosistema/`.
- The bot **proposes** criteria; it never writes them without approval.
- `git push` only when the user asks.
```

```markdown
# FASES.md — {{PROJECT_TITLE}}

> Bot state and plan. NOT Lore. Rewritten as phases advance.

## Current phase: {{INITIAL_PHASE}}

## Phase map
1. Criteria available — the project this bot will work on already has distilled Lore.
2. Canon — what the bot always loads, with its boundary written. Lives in `canon/`, next to the contract.
3. Routing — which Lore answers which kind of task.
4. Contract — the bot's behaviour and first-use configuration.
5. Crystallize if it must travel — do not wrap it as a plugin. Unpacking rebuilds `lore-ecosistema/`.
6. Premiere — a short instruction produces a deliverable; recorded verbatim.

## Log
- {{DATE}} — bot scaffolded.
```
