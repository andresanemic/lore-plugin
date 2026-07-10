# Lore Plugin – Migration Guide

This guide explains how to migrate **existing projects** into the Lore architecture using the `transmute-lore` skill, and how to map legacy documentation onto Lore artifacts.

---

## 1. When to Migrate

Migration makes sense when:

- You have projects with scattered documentation (README, wiki pages, issues, ADRs).
- Teams repeatedly re‑discuss the same decisions or rediscover old lessons.
- You want AI‑assisted work to rely on a stable body of criteria, not just ad‑hoc notes.

Lore does not require you to rewrite your entire history.  
You only need to bring in the **criteria** that should keep influencing future decisions.

---

## 2. Migration Strategy

A pragmatic migration strategy is:

1. **Create an Area** for the domain:
   - e.g. `"AI‑Assisted Frontend"`, `"Core Backend"`, `"Product Experiments"`.
2. **Pick one or two pilot projects** that represent typical work in that Area.
3. **Run `transmute-lore`** on those projects:
   - start with `add` to create missing artifacts;
   - then use `clean` to move shared criteria up to the Area.
4. **Refine the Lore**:
   - consolidate rules;
   - remove duplication;
   - clarify Invariant Clues.
5. **Expand to other projects** once the pattern feels solid.

---

## 3. Using `transmute-lore`

`transmute-lore` is the main tool for migration. It is not a CLI command: the mode is inferred from
the phrase you use, not from a flag.

**Safety precondition (all modes):** the project's repository must have a clean git tree. If there
are uncommitted changes, the skill stops and asks you to commit or stash first, so the migration
lands as a reviewable diff.

### 3.1 `add` Mode – Create Missing Lore

**Purpose:** Introduce Lore artifacts into a legacy project.

Example prompt:

```text
transmute the lore of "Legacy Frontend"
```

Conceptually, Lore will:

- Inspect existing files (e.g. `README`, architecture docs, notes).
- Propose a mapping to:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - thematic modules under `lore/`
  - `FASES.md` and `CLAUDE.md` at the root.
- Suggest which parts are criteria vs. pure information.

You then review and confirm or adjust the proposed structure.

### 3.2 `clean` Mode – DRY Shared Criteria

**Purpose:** Remove thematic modules from the project that already duplicate the Area's.

Example prompt:

```text
clean the lore of "Legacy Frontend"
```

**Requires a parent Area:** the project must live at `{area}/proyectos/{slug}/`. If it is a
standalone project (no Area), this mode does not apply and Lore reports so.

Conceptually, Lore will:

- Compare each of the project's thematic modules against its counterpart in the Area's Lore.
- If every clue in a project module is already in the Area, propose removing that module and
  pointing `index.md` at the Area's version via relative path.
- Report any clue **not yet** found in the Area (never discard it) so you can decide whether it
  stays as a project‑only module or gets promoted to the Area first.
- **Never** touch or rewrite `identidad.md` or `principios.md` — only redundant thematic modules.

You review changes to ensure nothing important is lost and that shared rules are correctly placed.

### 3.3 `translate` Mode – Standardize the Language

**Purpose:** Leave a project's (or Area's) entire Lore in a single language.

Useful after a migration: a legacy project may carry artifacts in English, in Spanish, or mixed.
Lore's skills generate content in your language, but pre-migration material keeps the language it
was written in.

Example prompts:

```text
standardize the language of the lore of "Legacy Frontend"
translate the lore of "Legacy Frontend" to Spanish
```

Conceptually, Lore will:

- Detect the current language of each artifact (`lore/*.md`, `FASES.md`, `CLAUDE.md`).
- Propose a file-by-file plan and wait for your approval before writing (HARD GATE).
- Translate **content only**, preserving meaning: it never touches filenames, relative paths, code
  blocks, confidence markers, or English terms of general technical use (workflow, commit, stack…).
- It is not a rewrite: no clue is added, removed, or reinterpreted.

---

## 4. Mapping Old Docs to Lore Artifacts

When migrating, you’ll typically map legacy content like this:

### 4.1 Old READMEs

- High‑level identity and purpose → `lore/identidad.md`.
- Summary of main concerns and domains → `lore/index.md` + initial thematic modules.

Example:

- README section “Project Overview” → identity.
- README section “Tech Stack and Principles” → principles + modules.

### 4.2 Architecture Documents

- Long architecture docs → split into:
  - enduring principles → `lore/principios.md`;
  - domain‑specific criteria → thematic modules (e.g. `frontend-rendering.md`, `api-design.md`).

Focus on rules that still constrain decisions today; ignore outdated details.

### 4.3 Roadmaps and Planning Notes

- Roadmap and phase descriptions → `FASES.md`.
- Historical plans that no longer affect decisions may be discarded, or referenced briefly.

### 4.4 Onboarding Notes and “How We Work”

- Onboarding guides and collaboration notes → `CLAUDE.md` (for AI‑specific parts) + `identidad.md` / `principios.md` where relevant.
- Any explicit agreements on how the team uses AI → `CLAUDE.md`.

---

## 5. Example Migration Flow

### 5.1 Migrating a Legacy Frontend Project

1. **Create the Area** (if it doesn't exist yet):

   ```text
   create a work area for "AI‑Assisted Frontend"
   ```

2. **Adopt the legacy project.** `create-project` scaffolds **brand‑new** projects from scratch — it
   is not the tool for bringing in an already‑existing codebase. A legacy project is instead
   **adopted** by adding a row with its path to the Area's `FASES.md` (without moving it or
   touching its git):

   ```text
   register "Legacy Marketing Site" in the Area's FASES.md, at its current path
   ```

3. **Add Lore Structure**, run directly against the adopted project's real folder:

   ```text
   transmute the lore of "Legacy Marketing Site"
   ```

   - The project must have a clean git tree before this (`transmute-lore`'s precondition).
   - Review proposed `identidad.md`, `principios.md`, modules, `FASES.md`, `CLAUDE.md`, and approve
     the mapping before anything is written (HARD GATE).

4. **Clean redundant modules** once the Area already owns its own general modules:

   ```text
   clean the lore of "Legacy Marketing Site"
   ```

   - Removes project thematic modules that already duplicate the Area's (e.g. a generic rendering
     module, if the Area already has one).
   - Keeps genuinely project‑specific criteria (e.g. “This brand’s homepage must stay below X ms”)
     — `identidad.md` and `principios.md` are never touched in this mode.

5. **Refine and Commit:**

   - Manually edit artifacts for clarity.
   - Confirm that the final structure reflects real constraints.
   - `transmute-lore` does not commit for you: the diff is left for you to review and commit.

---

## 6. Post‑Migration Checklist

After running `transmute-lore` and adjusting artifacts, verify:

- **Areas capture shared criteria:**
  - Principles that apply across projects live in the Area.
  - Project modules don’t repeat general rules.

- **Projects keep only specific criteria:**
  - Project Lore focuses on decisions unique to that codebase.
  - Thematic modules are scoped to project concerns.

- **Invariant Clues are actionable:**
  - Rules are specific enough to constrain future decisions.
  - Ambiguous or obsolete statements are removed or clarified.

- **`FASES.md` reflects reality:**
  - Current phase is accurate.
  - Roadmap aligns with how you actually work.

- **`CLAUDE.md` matches your collaboration:**
  - Describes how you use Claude in practice.
  - Includes non‑negotiable constraints on AI behavior.

---

## 7. Migration Principles

To keep migration manageable:

- Do **not** try to preserve every historical detail.
- Focus on what still constrains decisions today.
- Treat Lore as living documentation: it should reflect how you work now, not just how you used to work.
- Let `transmute-lore` do the heavy lifting, but always review its suggestions as a human editor.

Once one or two pilot projects are migrated, you can reuse the same patterns for other repositories in the Area.
