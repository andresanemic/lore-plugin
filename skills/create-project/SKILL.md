---
name: create-project
description: Use when starting a brand-new PROJECT inside an existing WORK AREA (created with create-area) — before it has its own identidad.md, principios.md or index.md. Replaces the old web-only nuevo-sitio. Trigger on "create project X in area Y" or "start project X inside an area".
---

# create-project — Start a new project inside an area

New project, same domain. The standard has not changed, the anti-scope has not changed, the four
things you always get wrong have not changed — and you are about to explain all of it again, because
the folder is empty and empty folders know nothing.

They do not have to. This skill creates a concrete **project** inside an existing work area (made
with `create-area`). The project **inherits the area Lore** and derives its **folder structure and
phases from its source documents** (a spec PDF, a brief, a proposal), not from a fixed mold. If the area carries a project
**starter scaffold** (`{area}/_starter/`, e.g. a Next.js template), the project is instantiated
from it — this is how `create-project` replaces the old web-only `nuevo-sitio` without depending on
any global starter folder.

> **Startup golden rule:** the content of the project's `identidad.md` and `principios.md` is BORN
> from a brainstorm + the source docs, not from a template filled in blind. The template gives the
> *shape*; the brainstorm + the source give the *content*.

> **Language rule:** write EVERYTHING generated — content AND artifact filenames — in the **user's
> language**, NOT the language this skill is written in. The names used throughout this skill
> (`identidad.md`, `principios.md`, `FASES.md`, `proyectos/`, `fuente/`) are the Spanish canonical
> forms: localize them (e.g. English → `identity.md`, `principles.md`, `PHASES.md`, `projects/`,
> `source/`). Fixed in every language: the area's selected contract name (`CLAUDE.md` or
> `AGENTS.md`), `lore/`, `index.md`, `golden-paths.md`, the `<!-- lore:always-on -->` marker pair (literal, never localized — localizing it breaks idempotent stamping silently).
> **Consistency with the area wins:** the project uses the area's actual folder and artifact names
> (its `proyectos/`-equivalent, its area-module filenames in inherited links); if the area's
> language differs from the user's, flag the mismatch and let the user pick. English terms of
> general technical use (workflow, stack, commit, scaffold…) stay in English.

## Inheritance model (DRY — points to the area, does not duplicate it)

Following the area↔project model:

- The project lives inside its area: `{area}/proyectos/{slug}/`.
- **Thematic modules are NOT copied.** The generic modules (animation, layout, routing, scroll,
  responsive, copy, testing, backend domains…) live **once, in the area**. The project's `index.md`
  **points to them** by relative path (`../../../lore/<module>.md`).
  > **Depth is three `../`, not two.** The referring file (`index.md`, `identidad.md`,
  > `principios.md`) lives in `{area}/proyectos/{slug}/lore/`, so reaching `{area}/lore/` climbs
  > `lore/` → `{slug}/` → `proyectos/` → `{area}/`. Do not "simplify" it to `../../lore/`.
- The project keeps only what is **its own**: `identidad.md` and `principios.md` that **lead with
  project-specific content** and **reference the area** for the shared standard, plus its `index.md`.
- Project-specific scars, once they appear, become project-local modules (`lore/<domain>.md`) via
  `save-to-lore`; generic + confirmed ones are promoted up to the area.

> This is a deliberate change from the old copy-everything approach: DRY beats autonomy here, so a
> fix to a generic clue in the area is seen by every project at once. If a project must be fully
> self-contained (e.g. handed off outside the area), run `transmute-lore` ADD to inline the area
> modules it depends on.

## Precondition

The target area exists and its `lore/` has at least `identidad.md` + `principios.md`. If the area
does not exist, **stop** and propose `create-area` first.

## Procedure (step by step)

### 1. Gather inputs (through Lore's `brainstorming-lore`, one at a time)

| Token | Where it comes from |
|---|---|
| `{{AREA_PATH}}` | path of the target area (e.g. `<root>/desarrollo-web`) |
| `{{PROJECT_SLUG}}` | project name in kebab-case (e.g. `acme`) |
| `{{DESCRIPTION}}` | one line: what the project is |
| `{{SOURCE_DOCS}}` | paths of the documents defining the project (spec PDF, brief, **free notes** the user already wrote about it…) |
| `{{INITIAL_PHASE}}` | active phase at start (derived from the source; see step 3) |
| `{{CONTRACT_FILE}}` | inherited from the Area's one contract: `CLAUDE.md` or `AGENTS.md` |

### 2. Read context (MANDATORY before creating anything)

1. Read the area's one instruction contract and its Lore: `{{AREA_PATH}}/lore/identidad.md` +
   `principios.md` (+ `index.md` and any
   thematic modules that carry reusable criteria).
2. Read the area `FASES.md` (project registry) and prior projects' Lore/docs if they offer reusable
   criteria.
3. Check whether the area carries a **starter scaffold**: `{{AREA_PATH}}/_starter/`. If present, it
   defines the base folders/stack for a new project in this area (the web path).
4. **Read the source documents** (`{{SOURCE_DOCS}}`). If a PDF, extract text (`pdftotext -layout`)
   and locate: **objectives**, **content domains** (→ folders) and **timeline / deliverables /
   Gantt** (→ phases). The source wins over any tentative structure.
   **Free notes count as source documents** — a project often begins as a pile of them. They inform
   the structure and the identity; they are never copied into the Lore, and nothing in them is
   criteria until it is distilled.

### 3. Project identity brainstorm (threshold)

Invoke Lore Plugin's own `brainstorming-lore` skill (`lore:brainstorming-lore` where skills are namespaced).
With what you read, propose and **get the user's approval** for:
- The project's **specific identity** (what it is, its own north, its anti-scope) — leads
  `identidad.md`, then a pointer to the area standard.
- The project's **specific principles** (its own constraints) — lead `principios.md`, then a pointer
  to the area laws.
- The **folder schema** derived from the source's domains (thematic, per-deliverable, or hybrid) —
  or the area starter's layout if `{area}/_starter/` exists.
- The **phase map** derived from the source's timeline/deliverables, and the initial **active phase**.

Apply `brainstorming-lore`'s **recognizable continuity** contract: carry each approved decision into
the accumulated project design and recap it at contextual milestones.

**Create no file before the design is approved.**

### 4. Create the structure

```bash
DEST="{{AREA_PATH}}/proyectos/{{PROJECT_SLUG}}"
mkdir -p "$DEST/lore"
```

- **If the area has a starter** (`{{AREA_PATH}}/_starter/`): instantiate it into `$DEST` (copy its
  versioned files; do not copy `node_modules`/build output/lockfiles so the stack resolves to its
  latest version). Then rename the project templates and adapt folders per the brainstorm:
  ```bash
  STARTER="{{AREA_PATH}}/_starter"
  cp -r "$STARTER/." "$DEST/"                          # templates + code scaffold (web/, …)
  for CONTRACT in CLAUDE AGENTS; do
    [ -f "$DEST/$CONTRACT.template.md" ] && mv "$DEST/$CONTRACT.template.md" "$DEST/$CONTRACT.md"
  done
  [ -f "$DEST/golden-paths.template.md" ] && mv "$DEST/golden-paths.template.md" "$DEST/golden-paths.md"
  # $DEST/FASES.md comes from the starter as-is; tokens are resolved in step 6.
  ```
- **Otherwise:** create the work folders derived from the source docs, each with a `.gitkeep`.

Resulting structure (folder names come from step 2/3):

```
{{AREA_PATH}}\proyectos\{{PROJECT_SLUG}}\
  {{CONTRACT_FILE}}    → the one project contract (pointers to lore/)
  FASES.md             → state + phase map derived from the source
  lore\
    index.md           → project Lore map: points to area modules (../../../lore/<module>.md)
    identidad.md       → project identity + pointer to area identidad
    principios.md      → project laws + pointer to area principios
    (if the area profile is enabled, this index carries its pointer)
  {{thematic / per-deliverable folders, empty with .gitkeep}}
  fuente\              → original source document(s) + extracted text
```

### 5. Write the inherited-but-DRY Lore

> The snippets below are **shape, not literal text**: render every heading, sentence AND
> localizable filename in the user's language (per the language rule above). Relative-path depth
> stays as-is, but path segments use the area's actual (localized) names.

Write the project's `lore/identidad.md`:

```markdown
# Identidad — {{PROJECT_TITLE}}

## Este proyecto
{{PROJECT_SPECIFIC_IDENTITY}}   # what it is, its own north, its anti-scope

## Estándar heredado del área
This project inherits the area's premium standard and quality floor.
Source of truth for the shared standard: [`../../../lore/identidad.md`](../../../lore/identidad.md).
```

**`registro:` is inherited, not re-decided.** A project takes the area's line and writes none of its
own; only add `registro:` here when the user says this project should read differently from the rest
of the area, and then it is inferred from how they said it — never asked. Everything about how the
calibrator behaves is in `use-lore`.

Write the project's `lore/principios.md`:

```markdown
# Principios — {{PROJECT_TITLE}}

## Leyes propias de este proyecto
{{PROJECT_SPECIFIC_PRINCIPLES}}

## Leyes heredadas del área
The area's invariant laws apply in full. Source of truth:
[`../../../lore/principios.md`](../../../lore/principios.md).
```

Write `lore/index.md` pointing to the area modules:

```markdown
# Índice del Lore — {{PROJECT_TITLE}}

## Fundamentos (project)
- Identidad — this project + inherited standard · [identidad.md](identidad.md)
- Principios — this project's laws + inherited laws · [principios.md](principios.md)

## Módulos heredados del área (por ruta relativa)
- Professional criterion · [../../../lore/perfil-profesional.md](../../../lore/perfil-profesional.md) _(only if it exists)_
- animation · [../../../lore/animation.md](../../../lore/animation.md)
- layout · [../../../lore/layout.md](../../../lore/layout.md)
- (…the area modules this project relies on…)

## Módulos propios del proyecto
_(none yet — created by save-to-lore when a project-specific scar appears)_
```

> Only list the area modules the project actually relies on. Project-specific clues get their own
> local module later, added by `save-to-lore`.

### 6. Write / resolve `{{CONTRACT_FILE}}` and `FASES.md`

- **If the area starter provided them** (step 4 renamed the contract template and left
  `FASES.md`): do NOT rewrite from scratch — **resolve their `{{TOKENS}}`** with the project's
  name/description and the phase map derived from the source docs.
- **Otherwise, write them with Write:**
  - `{{CONTRACT_FILE}}`: slimmed to pointers — where `lore/` lives, that thematic modules are inherited from
    the area by relative path, and the area's actual base rules; never invent a web-only rule for
    a non-web project.
  - `FASES.md`: **outside** `lore/`, with the phase map **derived from the source's timeline** and
    the initial active phase.

After either path, verify there is exactly one instruction contract and that its name matches the
Area. Do not create a second contract merely because another host might be used later.

**Stamp the always-on block** (project variant) in that contract — the pointer section wrapped in
`<!-- lore:always-on -->` / `<!-- /lore:always-on -->`, pointing at this project's own layer and its
mother area's, at its own `FASES.md` in one line, plus the signal to invoke instead of writing by
hand. The area starter template
already carries it; if the contract was written from scratch, add it. Rules, ceiling and the
idempotency table are in `use-lore` — this happens inside the threshold this skill already has, and
never as a second pass afterwards. If a block is already there and differs, report it and wait: a
human edit inside the block is a decision.

Resolve every `{{TOKEN}}` with what was discussed; leave none unresolved.

### 7. Verify and report

```bash
grep -rn '{{[A-Z_]\+}}' "$DEST" && echo "UNRESOLVED TOKENS" || echo "OK no tokens"
# every local index link resolves; area links point outside the project:
```

- Verify local `index.md` links resolve to present files, and the `../../../lore/<module>.md` links
  resolve to files in the area.
- Verify the stamped contract meets the starter **floor**: one always-on block, four things, ≤ 25
  lines; `FASES.md` outside `lore/`; modules inherited by relative path, not copied; no `HARD-GATE`
  in present tense; no plugin wrap. If the area is `bots`, stop and hand back to `create-bot` —
  that skill owns the bot variant.
- Verify exactly one of `CLAUDE.md` or `AGENTS.md` exists. For cross-host use, offer Codex's
  `project_doc_fallback_filenames` setting or, only with explicit approval, a minimal adapter.
- Register the project in the **area's** `FASES.md` (row with path + status + internal phase).
- Report the created structure and the next step (start the active phase; optionally `git init`).

## Invariants

- The project ALWAYS lives in `{area}/proyectos/{slug}/`. `lore/` at its root; `FASES.md`
  **outside** `lore/` (criteria persists, state advances).
- **Thematic modules and, if it exists, `perfil-profesional.md` are referenced from the area, not duplicated** (DRY). Only `identidad.md`,
  `principios.md` and `index.md` are project-local Lore files at creation.
- **Read the source docs before** fixing folders and phases. Structure and phase map come from the
  source, not a mold.
- Project-specific identity/principles are BORN from the brainstorm, never from invented defaults.
- **Everything generated — content and artifact filenames — is in the user's language** (fixed
  selected contract name (`CLAUDE.md` or `AGENTS.md`) / `lore/` / `index.md` and general technical English terms excluded); the
  area's established names win inside its tree, and a language clash with the area is flagged —
  never resolved silently.
- No data, figures or deliverables are invented: they are derived from the source.
- **A paragraph is a paragraph** (kit invariant in `use-lore`): generated `lore/`, contract and
  `FASES.md` are not hard-wrapped at column 80.
- The project is NOT auto-committed. The user decides.
