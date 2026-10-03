### 3.3 `create-area`

**Role:** Initialize a shared Lore root for a domain (Area).

**Input:**

- Area name (e.g. `"Frontend Development"`).

**Creates / updates:**

- Area‑level `lore/` folder, with:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - thematic modules under `lore/` as needed.
- One Area-level contract—`CLAUDE.md` for Claude Code or `AGENTS.md` for Codex—and `FASES.md`
  (contract and project registry).
- An empty `proyectos/` folder, where future projects will be born.
- A `_starter/` folder with project templates tuned to the Area's domain
  (`CLAUDE.template.md` or `AGENTS.template.md`, `FASES.md`, and, if applicable,
  `golden-paths.template.md`, plus any base code scaffold); `create-project` instantiates them per project.
  The floor is structural (2.1.5): always-on, `FASES` outside, threshold, inherit by path — for a `bots`
  Area, the variant is `canon/` plus routing.

**Responsibilities:**

- Establish a place where shared criteria for a domain live.
- Provide the skeleton (`_starter/`) that projects instantiate.
- **Return control to the skill that called it** (2.1.1). An Area is a **step** as often as a destination. When `create-bot` called, the Area is `bots` — **one** Area holding every bot as a project — and its domain is the user's bots, never any single bot's.

Use `create-area` when you want multiple projects to share the same foundational criteria.

---

