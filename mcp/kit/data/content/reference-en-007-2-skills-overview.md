## 2. Skills Overview

The Lore plugin exposes eight main skills through compatible AI agents:

| Skill            | Purpose                                     | Typical trigger phrase                                |
|------------------|---------------------------------------------|------------------------------------------------------|
| `use-lore`       | Entry point, navigation, and help           | Read first; triggers when "lore" is mentioned or a new Area, project or bot starts |
| `brainstorming-lore` | Design Lore-specific changes without taking over general brainstorming | "brainstorm this Lore", or invoked by an artifact-owning Lore skill |
| `create-area`    | Create a new Area with shared Lore          | "create a work area for Frontend", "I want to start working on X with Lore" |
| `create-project` | Create a project inheriting an Area         | "create a project Marketing Site in area Frontend Development" |
| `save-to-lore`   | Capture criteria (**capture**), arbitrate imported criteria (**graft**), or conditionally mine a loose-notes inbox | "save to lore", "distill skill X into the lore", "review my notes and save what belongs" |
| `transmute-lore` | Operate an existing Lore in eight modes | add / clean / translate / upgrade / prune / **mycelium** / leave / crystallize |
| `create-bot`     | Build a bot: one place to open a session and work across several projects at once, with their criteria reachable and routed | "create a bot to work on X and Y" (nuevo) / "I want a bot that federates the lore already living in A and B" (federar) |

Each skill operates on or creates specific Markdown artifacts under your repository.

**Language:** the skills are written in English, but the Lore they generate is always written in
the **user's language** — both content and artifact filenames. `identidad.md`, `principios.md`,
`FASES.md`, `proyectos/` are the Spanish canonical forms (and appear as such throughout this
document); in English, for example, they become `identity.md`, `principles.md`, `PHASES.md`,
`projects/`. Fixed in every language: the selected contract name (`CLAUDE.md` or `AGENTS.md`),
`lore/`, `index.md`, `golden-paths.md`,
relative-path depth, and English terms of general technical use (workflow, commit, stack,
scaffold…). Inside an existing corpus, its established names win. A Lore in the wrong language is
standardized with `transmute-lore` in `translate` mode.

These skills are **not CLI commands**: they are agent skills triggered by natural language,
not by flags or terminal syntax. The phrases above are real invocation examples, taken from the
triggers documented in each skill's `SKILL.md`.

---

