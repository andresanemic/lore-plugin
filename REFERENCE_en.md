# Lore Plugin – Reference

This document is the technical reference for the **Lore plugin** for Claude Code.  
It defines Lore’s core concepts, the available skills, the Markdown artifacts, and how they fit together.

For a practical “how to use it every day” guide, see [`USAGE_EN.md`](./USAGE_EN.md).  
For a conceptual overview and philosophy, see the main [`README.md`](../README.md).

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

| Skill            | Purpose                                     | Typical Usage Example                                |
|------------------|---------------------------------------------|------------------------------------------------------|
| `using-lore`     | Entry point, navigation, and help           | `using-lore`                                         |
| `create-area`    | Create a new Area with shared Lore          | `create-area "Frontend Development"`                 |
| `create-project` | Create a project inheriting an Area         | `create-project "Marketing Site" in "Frontend Development"` |
| `save-to-lore`   | Capture criteria after solving a problem    | `save-to-lore "Hydration bug on Next.js landing"`   |
| `transmute-lore` | Migrate existing projects to Lore           | `transmute-lore --mode add "Legacy Frontend"`       |

Each skill operates on or creates specific Markdown artifacts under your repository.

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

- Area‑level `lore/` folder.
- Core artifacts, typically:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - thematic modules under `lore/` as needed.

**Responsibilities:**

- Establish a place where shared criteria for a domain live.
- Provide a skeleton that projects can inherit from.

Use `create-area` when you want multiple projects to share the same foundational criteria.

---

### 3.3 `create-project`

**Role:** Initialize a project‑specific Lore that inherits from an Area.

**Input:**

- Project name (e.g. `"Landing Lore"`).
- Area name (e.g. `"Frontend Development"`).

**Creates / updates:**

- Project folder with its own `lore/` directory.
- Project‑level artifacts:
  - `lore/` thematic modules.
  - `FASES.md` (root) for current state and roadmap.
  - `CLAUDE.md` (root) for collaboration contract and operational references.
- Links between the project Lore and the Area Lore so shared criteria are inherited.

**Responsibilities:**

- Give the project a place to store **its own** criteria and state.
- Avoid duplicating rules already defined at Area level.

Use `create-project` whenever you start a new codebase inside an existing Area.

---

### 3.4 `save-to-lore`

**Role:** Distill newly acquired experience into reusable criteria.

**Input:**

- A short description of the problem, decision, or lesson (e.g. `"Hydration bug on Next.js landing"`).

**Process (conceptually):**

1. Ask for context: what happened, what was tried, what finally worked.
2. Extract **Invariant Clues**:
   - Constraints that should affect future decisions.
   - Rules that are valid beyond the specific incident.
3. Decide where to store them:
   - Project‑level modules under `lore/`.
   - Area‑level `principios.md` for general rules.
   - Updates to `identidad.md` or `CLAUDE.md` if identity or collaboration changed.

**Invariants:**

- Criteria are never invented.
- Everything comes from real experience.
- Discarded noise is reported, never silently removed.
- Every change passes through a HARD GATE before being written.
- Nothing commits automatically.
- A human always reviews the final diff.

Use `save-to-lore` as the main mechanism for feeding your Lore after important decisions.

---

### 3.5 `transmute-lore`

**Role:** Migrate existing projects into Lore’s architecture.

**Input:**

- Project name (e.g. `"Legacy Frontend"`).
- Mode:
  - `add` – create missing Lore artifacts.
  - `clean` – remove redundant modules and move shared criteria to the Area.

**Process (conceptually):**

1. Scan existing documentation and structure.
2. Propose how to map old files onto:
   - `identidad.md`, `principios.md`, `index.md`, thematic modules under `lore/`.
   - `FASES.md` and `CLAUDE.md` at the root.
3. Identify criteria that should be shared at Area level versus project‑specific details.
4. Help you clean up duplication while preserving experience.

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

## 5. Filesystem Layout

A typical Lore layout looks like this:

```text
<area-or-project-root>/
  lore/
    identidad.md
    principios.md
    index.md
    <thematic-modules>.md

  FASES.md
  CLAUDE.md
```

When using Areas and projects:

- The **Area** owns its own `lore/` and (optionally) high‑level `FASES.md` / `CLAUDE.md`.
- Each **project** inside that Area has:
  - its own `lore/` for project‑specific modules;
  - its own `FASES.md` and `CLAUDE.md` at the project root.

Shared criteria live in the Area.  
Project‑specific criteria live in the project.

---

## 6. Operational Invariants

Lore’s behavior is governed by a set of shared invariants:

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
- `docs/USAGE_EN.md` / `docs/USAGE_ES.md` – practical usage guides and workflows.
- `docs/REFERENCE.md` – this document, which defines the technical model.
- `docs/MIGRATION.md` – migration strategies and examples for legacy projects.

Keeping reference separate from usage and narrative docs makes it easier to:

- Look up specific skill behavior or artifact semantics.
- Keep the README focused and readable.
- Evolve usage patterns without breaking the underlying model.
