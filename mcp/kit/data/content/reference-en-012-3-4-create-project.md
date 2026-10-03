### 3.4 `create-project`

**Role:** Initialize a project‑specific Lore that inherits from an Area.

**Input:**

- Project name (e.g. `"Landing Lore"`).
- Area name (e.g. `"Frontend Development"`).

**Creates / updates:**

- The project folder, always at `{area}/proyectos/{slug}/` — never directly under the Area.
- If the Area has a `_starter/` folder, instantiates its templates (and any code scaffold) into the project.
- Project‑level artifacts:
  - `lore/identidad.md` and `lore/principios.md`, leading with **their own** content, then a
    pointer to the Area standard.
  - `lore/index.md`, referencing the Area's thematic modules by relative path
    (`../../../lore/<module>.md` — three levels up, not two).
  - `FASES.md` (root) for current state and roadmap.
  - `CLAUDE.md` or `AGENTS.md` (root) for the one collaboration contract and operational references;
    the project inherits the Area's host choice.
- Registers the new project in the Area's `FASES.md`.

**Responsibilities:**

- Give the project a place to store **its own** criteria and state.
- Avoid duplicating thematic modules already defined at Area level (they are referenced, not copied).

Use `create-project` whenever you start a new codebase inside an existing Area.

---

