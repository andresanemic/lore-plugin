# Lore Plugin – Migration Guide

This guide explains how to migrate **existing projects** into the Lore architecture using the `transmute-lore` skill, and how to map legacy documentation onto Lore artifacts.

---

## 1. When to Migrate

Migration makes sense when:

- You have projects with scattered documentation (README, wiki pages, issues, ADRs).
- Teams repeatedly re‑discuss the same decisions or rediscover old lessons.
- You want AI‑assisted work to rely on a stable body of criteria, not just ad‑hoc notes.

Lore does not require rewriting your history: bring in only the **criteria** that should keep influencing future decisions.

---

## 2. Migration Strategy

A pragmatic migration strategy is:

1. **Create an Area** for the domain:
   - e.g. `"AI‑Assisted Frontend"`, `"Core Backend"`, `"Product Experiments"`.
2. **Pick one or two pilot projects** that represent typical work in that Area.
3. **Run `transmute-lore`** on those projects:
   - start with `add` to create missing artifacts;
   - then use `clean` to move shared criteria up to the Area.
4. **Refine the Lore**: consolidate rules, remove duplication, clarify Invariant Clues.
5. **Expand to other projects** once the pattern feels solid.
6. **If the destination is a bot**, this guide is the first half of the chain, not a separate
   product. Migration is how sources that started as raw folders become Lore that `create-bot` can
   federate:

```text
raw folder → create-area → transmute-lore (add) → create-bot (federar)
```

`transmute-lore` is the middle step — do not skip it to distill everything into the bot: the bot
never distills into itself. If the Lore already exists, go straight to `create-bot`; if not, stay
here until each source has an owning Area and a rescued Lore.

---

## 3. Using `transmute-lore`

`transmute-lore` is the main tool for migration; the mode is inferred from your phrase, not a flag.

**Safety precondition for source-changing modes:** the project's repository must have a clean git
tree before writing, so the migration lands as a reviewable diff.

> **Since v1.2.1 there is a fourth mode, `upgrade`.** It migrates nothing: it brings a Lore that is
> **already in the standard** up to date when written against an older version of these skills.
> Already migrated and only want what the kit learned afterwards? That is the mode, not `add`.
> **Since 2.1.4** that mode can raise a tree or an ecosystem without a full reread: git map first, index header instead of rewriting rows, live `HARD-GATE` becomes threshold, threshold per class in a campaign.

> **The fifth mode is `crystallize`.** Not a migration: it exports a safe, traceable Markdown
> snapshot for a destination that cannot navigate the live tree, extractable back into a folder
> whose routing table resolves. It never replaces or edits Lore — see
> [`USAGE_en.md`](./USAGE_en.md) and [`REFERENCE_en.md`](./REFERENCE_en.md) for its contract.

> **Since 2.1.0 there is a sixth mode, `prune`** — the only subtractive one: it removes **weight**
> from a Lore that decayed by accumulating things that are each individually correct. Never while
> migrating: a freshly migrated Lore has had no time to accumulate anything. Its unit of count is
> the **deliverable**, not the Lore.

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
  - `FASES.md` and one existing or host-selected contract (`CLAUDE.md` or `AGENTS.md`) at the root.
    Nested instruction files owned by frameworks or other tools remain in their narrower scope.
- Suggest which parts are criteria vs. pure information.

You review, confirm or adjust the proposed structure.

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
- Report any clue **not yet** found in the Area (never discard it) so you decide whether it stays as a project‑only module or gets promoted to the Area first.
- **Never** touch or rewrite `identidad.md` or `principios.md` — only redundant thematic modules.

### 3.3 `translate` Mode – Standardize the Language

**Purpose:** Leave a project's (or Area's) entire Lore in a single language.

Useful after a migration, when a legacy project carries artifacts in English, Spanish, or mixed:
pre-migration material keeps the language it was written in.

Example prompts:

```text
standardize the language of the lore of "Legacy Frontend"
translate the lore of "Legacy Frontend" to Spanish
```

Conceptually, Lore will:

- Detect the current language of each artifact (`lore/*.md`, `FASES.md`, and the instruction contract).
- If both contract names exist at the migration root, compare their contents and ownership at the
  threshold. Preserve unique rules; never delete a framework-managed file to force the default.
- Propose a file-by-file plan — including renames of localizable artifacts (e.g. `identidad.md` ↔
  `identity.md`, `FASES.md` ↔ `PHASES.md`) — and wait for your approval before writing (threshold).
- Translate content and rename artifacts **preserving meaning**, rewriting every affected link; it
  never touches the selected contract filename, `lore/`, `index.md`, code blocks, confidence markers, or English terms
  of general technical use (workflow, commit, stack…).
- It is not a rewrite: no clue is added, removed, or reinterpreted.

---

## 4. Mapping Old Docs to Lore Artifacts

When migrating, you’ll typically map legacy content like this:

### 4.1 Old READMEs

- High‑level identity and purpose → `lore/identidad.md`.
- Summary of main concerns and domains → `lore/index.md` + initial thematic modules.

E.g. “Project Overview” → identity; “Tech Stack and Principles” → principles + modules.

### 4.2 Architecture Documents

- Long architecture docs → split into:
  - enduring principles → `lore/principios.md`;
  - domain‑specific criteria → thematic modules (e.g. `frontend-rendering.md`, `api-design.md`).

Focus on rules that still constrain decisions today; ignore outdated details.

### 4.3 Roadmaps and Planning Notes

- Roadmap and phase descriptions → `FASES.md`.
- Historical plans that no longer affect decisions may be discarded, or referenced briefly.

### 4.4 Onboarding Notes and “How We Work”

- Onboarding guides and collaboration notes → the instruction contract (AI‑specific parts, explicit agreements on how the team uses AI) + `identidad.md` / `principios.md` where relevant.

---

## 5. Example Migration Flow

### 5.1 Migrating a Legacy Frontend Project

1. **Create the Area** (if missing):

   ```text
   create a work area for "AI‑Assisted Frontend"
   ```

2. **Adopt the legacy project.** `create-project` scaffolds **brand‑new** projects; an existing
   codebase is instead **adopted** by adding a row with its path to the Area's `FASES.md`, without
   moving it or touching its git:

   ```text
   register "Legacy Marketing Site" in the Area's FASES.md, at its current path
   ```

3. **Add Lore Structure**, run directly against the adopted project's real folder:

   ```text
   transmute the lore of "Legacy Marketing Site"
   ```

   - Clean git tree required (`transmute-lore`'s precondition).
   - Review the proposed mapping and approve it before anything is written (threshold).

4. **Clean redundant modules** once the Area already owns its own general modules:

   ```text
   clean the lore of "Legacy Marketing Site"
   ```

   - Removes project modules that already duplicate the Area's; keeps genuinely project‑specific
     criteria (“this homepage must stay below X ms”). `identidad.md` and `principios.md` are never
     touched.

5. **Refine and Commit:**

   - Edit artifacts for clarity; confirm the structure reflects real constraints.
   - `transmute-lore` does not commit for you: the diff is yours to review and commit.

---

## 6. Post‑Migration Checklist

After running `transmute-lore` and adjusting artifacts, verify:

- **Areas capture shared criteria:** cross-project principles live in the Area; project modules don’t repeat general rules.
- **Projects keep only specific criteria:** project Lore holds decisions unique to that codebase.
- **Invariant Clues are actionable:** rules constrain future decisions; ambiguous or obsolete statements are gone or clarified.
- **`FASES.md` reflects reality:** current phase accurate; roadmap aligned with how you actually work.
- **The instruction contract matches your collaboration:** how you actually use Claude, with non‑negotiable constraints on AI behavior.

---

## 7. Migration Principles

To keep migration manageable:

- Do **not** try to preserve every historical detail.
- Focus on what still constrains decisions today.
- Treat Lore as living documentation: it reflects how you work now, not how you used to.
- Let `transmute-lore` do the heavy lifting, but always review its suggestions as a human editor.

One or two pilots migrated, reuse the same patterns across the Area's repositories.
