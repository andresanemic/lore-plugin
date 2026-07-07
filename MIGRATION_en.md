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

`transmute-lore` is the main tool for migration.

### 3.1 `add` Mode – Create Missing Lore

**Purpose:** Introduce Lore artifacts into a legacy project.

Example prompt:

```text
transmute-lore --mode add "Legacy Frontend"
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

**Purpose:** Remove duplication and move shared rules to the Area.

Example prompt:

```text
transmute-lore --mode clean "Legacy Frontend"
```

Conceptually, Lore will:

- Identify rules that appear in multiple project documents.
- Suggest moving truly general criteria into the Area’s `principios.md` or thematic modules.
- Remove redundant copies from the project Lore, leaving references instead.

You review changes to ensure nothing important is lost and that shared rules are correctly placed.

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

1. **Create Area:**

   ```text
   create-area "AI‑Assisted Frontend"
   ```

2. **Register Project:**

   ```text
   create-project "Legacy Marketing Site" in "AI‑Assisted Frontend"
   ```

3. **Add Lore Structure:**

   ```text
   transmute-lore --mode add "Legacy Marketing Site"
   ```

   - Review proposed `identidad.md`, `principios.md`, modules, `FASES.md`, `CLAUDE.md`.

4. **Clean Shared Criteria:**

   ```text
   transmute-lore --mode clean "Legacy Marketing Site"
   ```

   - Move general frontend rules (e.g. “Prefer static rendering for marketing pages”) into the Area.
   - Keep project‑specific criteria (e.g. “This brand’s homepage must stay below X ms”) in project modules.

5. **Refine and Commit:**

   - Manually edit artifacts for clarity.
   - Confirm that the final structure reflects real constraints.

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
