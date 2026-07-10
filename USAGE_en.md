# Lore Plugin – Usage Guide

This guide shows how to use the Lore plugin in **Claude Code** in everyday work:  
creating Areas and projects, capturing criteria after solving problems, and keeping your Lore clean and useful.

> Lore is a lightweight Spec‑Driven Development (SDD) kit for Claude Code.  
> It helps you preserve the **criteria** behind your decisions, so your AI never has to start from scratch.

---

## 1. Overview

Lore organizes experience into **criteria** that keep participating in future decisions:

- You solve a problem with AI.
- Instead of just moving on, you capture the *reason* behind the solution.
- That criteria is stored in Markdown artifacts that Claude Code can reuse in later sessions.

The Lore plugin bundles a set of **skills** that implement this loop:

- `using-lore` – entry point & navigation.
- `create-area` – shared Lore for a group of projects.
- `create-project` – project‑level Lore inheriting an Area.
- `save-to-lore` – capture criteria after solving a problem.
- `transmute-lore` – migrate existing projects to the Lore architecture.

> **Lore speaks your language.** The skills are written in English, but everything they generate
> (identity, principles, clues, indexes) is written in the language you work in. Only the canonical
> filenames (`identidad.md`, `principios.md`…) and English terms of general technical use
> (workflow, commit, stack…) stay unchanged.

---

## 2. Prerequisites

Before using Lore:

- You have **Claude Code** installed and working.
- You can run `/plugin` commands in your Claude Code environment.

Install the Lore plugin:

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Once installed, the Lore skills become available as commands/prompts inside Claude Code.

---

## 3. Core Loop: Using Lore Day‑to‑Day

The everyday Lore loop is:

1. Work with Claude Code to solve a problem in your project.
2. Decide whether the solution revealed **criteria** that should affect future decisions.
3. Use `save-to-lore` to capture that criteria into your Lore Markdown.
4. Let future sessions reuse those criteria instead of starting from scratch.

### Example: Capturing a Hydration Bug

You and Claude debug a hydration issue in Next.js.  
Instead of just fixing it, you want to capture the rule behind the fix.

In Claude Code, you might run:

```text
save-to-lore "Hydration issue with initial opacity in Next.js"
```

Lore will help you:

- Extract the **Invariant Clues** (e.g. “Never use client‑side state to control initial opacity”).
- Decide whether this belongs in project‑level modules or Area‑level principles.
- Update the appropriate Markdown artifacts (`principios.md`, a thematic module, etc.).

---

## 4. Getting Started: Your First Area and Project

Lore scales through **Areas**.  
An Area is a parent folder that owns shared criteria; projects inherit from it instead of duplicating rules.

### 4.1 Create an Area

Think of an Area as a domain like “Frontend”, “Backend”, or “Product Experiments”.

In Claude Code:

```text
create-area "Frontend Development"
```

Lore will:

- Create a `lore/` folder for the Area.
- Initialize artifacts like `identidad.md`, `principios.md`, `index.md`, and thematic modules as needed.

### 4.2 Create a Project within an Area

Now you want a specific project to inherit that Area‑level Lore.

```text
create a project "Landing Lore" in area "Frontend Development"
```

Lore will:

- Create the project folder **always inside** `{Area}/proyectos/{slug}/` — never directly under
  the Area.
- Instantiate the Area's `_starter/` templates into the new project, if the Area has one.
- Set up project‑level artifacts: `lore/identidad.md` and `lore/principios.md` (own content first,
  then a pointer to the Area), `lore/index.md` (referencing Area modules by relative path), plus
  `FASES.md` and `CLAUDE.md`.
- Register the project in the Area's `FASES.md`, so general criteria is inherited, not copied.

### 4.3 Work and Capture

Once your Area and project exist:

1. Work on the project with Claude Code as usual.
2. Every time you solve a problem that reveals reusable criteria, call:

   ```text
   save-to-lore "Short description of the problem/decision"
   ```

3. Review what Lore proposes and edit the Markdown artifacts if needed.

---

## 5. Skill by Skill: How to Use Them

### 5.1 `using-lore` – Entry Point & Navigation

**Purpose:** Help you understand the Lore model and route you to the right skill.

Typical usage:

```text
using-lore
```

You can ask things like:

- “Explain the Lore architecture for this project.”
- “Show me the artifacts currently defined.”
- “Guide me to the right skill for capturing a new invariant.”

`using-lore` is the safest place to start if you’re unsure which skill to use next.

---

### 5.2 `create-area` – Shared Lore for a Domain

**Purpose:** Create a shared Lore root for a domain (Area).

Example prompt:

```text
create-area "AI‑Assisted Frontend"
```

Lore will:

- Create a folder for the Area.
- Initialize Area‑level artifacts:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - thematic modules under `lore/`
- Optionally explain what each artifact is for and how to extend it.

Use this when you want multiple projects to share a common set of criteria.

---

### 5.3 `create-project` – Project Scoped Lore

**Purpose:** Create a project that inherits Lore from an Area.

Example prompt:

```text
create a project "Marketing Site" in area "AI‑Assisted Frontend"
```

Lore will:

- Create the project folder at `{Area}/proyectos/{slug}/` — never directly under the Area.
- Set up:
  - `lore/` for project‑specific modules (generic Area modules are only referenced, never copied).
  - `FASES.md` at the root for state and roadmap.
  - `CLAUDE.md` at the root for collaboration contract and references.
- Wire the project to the Area’s Lore so shared criteria are visible but not duplicated.

Use this whenever you start a new codebase inside a domain that already has an Area.

---

### 5.4 `save-to-lore` – Capture Criteria After Solving a Problem

**Purpose:** Distill newly acquired experience into reusable criteria.

Example prompts:

```text
save-to-lore "Hydration bug on Next.js landing"
save-to-lore "Decision: always prefer static rendering for marketing pages"
save-to-lore "Standard: error messages must be human‑centered and actionable"
```

You don't always have to ask explicitly: if you just resolved a friction that clears a **4‑condition
threshold** (constrains a future decision, is distillable to Context→Cause→Clue, is actionable, and
would help another project in the Area), Lore can propose saving it on its own. Cosmetic changes
never count.

Lore will typically:

- Ask for context about what happened.
- Extract **Invariant Clues** (criteria that constrain future decisions), stored as `conjecture` by
  default, or `confirmed` only once actually validated in the running app.
- Suggest where to store them:
  - project modules under `lore/`;
  - Area‑level `principios.md` if they are general and confirmed;
  - updates to `identidad.md` or `CLAUDE.md` if they change identity or collaboration rules.
- Respect invariants:
  - Never invent criteria.
  - Report discarded noise.
  - Require a human to review before anything is written; never runs `git push`.
  - Mark what's already promoted to the Area with the ` · ↑` glyph in the project's `index.md`, so
    the same clue is never re‑promoted.

Use this as the main tool to feed your Lore over time.

---

### 5.5 `transmute-lore` – Migrate Existing Projects

**Purpose:** Move legacy projects into the Lore architecture.

It is not a CLI command: the mode is inferred from the phrase, not from a flag. It has three modes:

- `add` – create missing Lore artifacts.
- `clean` – remove modules that already duplicate the Area's (requires the project to have a
  parent Area; if it's standalone, this mode does not apply).
- `translate` – standardize the Lore's language: translate every artifact's content into a single
  language (the one you ask for or, by default, your own), without touching filenames, structure,
  code, or meaning.

Example prompts:

```text
transmute the lore of "Legacy Frontend"
clean the lore of "Legacy Frontend"
standardize the language of the lore of "Legacy Frontend"
translate the lore of "Legacy Frontend" to Spanish
```

**Precondition:** the project must have a clean git tree before running any of the three modes; if
there are uncommitted changes, the skill stops and asks you to commit or stash first.

Expected behavior:

- Scan existing documentation and structure.
- Propose how to map old files onto:
  - `identidad.md`, `principios.md`, `index.md`, thematic modules.
  - `FASES.md` and `CLAUDE.md`.
- Wait for your explicit approval before writing anything (HARD GATE).
- Ensure the result is DRY:
  - Shared rules go to the Area.
  - Project keeps only specific criteria; `identidad.md` and `principios.md` are never deleted in
    `clean` mode.

Use this when you already have projects and want to bring them into Lore without rewriting everything manually.

---

## 6. Working with Artifacts

Lore uses a fixed set of artifacts to keep criteria organized:

- `lore/identidad.md` – project identity and minimum quality standard.
- `lore/principios.md` – permanent engineering and business rules.
- `lore/` thematic modules – distilled experience grouped by domain.
- `lore/index.md` – navigation map for Lore in that project or Area.
- `FASES.md` (root) – current state and roadmap.
- `CLAUDE.md` (root) – collaboration contract and operational references.

General guidelines:

- Identity and principles change slowly; keep them small and intentional.
- Thematic modules can grow, but each should focus on a specific domain.
- `FASES.md` should reflect reality; update it when the project moves phases.
- `CLAUDE.md` should describe how you and Claude work together (prompts, rituals, constraints).

---

## 7. Best Practices

To keep your Lore useful:

- Capture only **criteria**: if it doesn’t constrain a future decision, don’t add it.
- Prefer small, focused modules over long narrative documents.
- Review Lore periodically to merge overlapping rules and remove obsolete ones.
- Use Areas for everything that should be shared; keep the project Lore lean.
- Keep all your Lore in a single language; if it ended up mixed or in the wrong language, use
  `transmute-lore` in `translate` mode.
- Always review the diff that Lore proposes before committing changes.

If you want a conceptual overview of why Lore exists and how it differs from traditional documentation, see the main [`README.md`](./README.md).
