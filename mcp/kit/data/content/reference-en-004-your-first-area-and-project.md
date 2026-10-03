### Your first Area and project

Lore scales through **Areas**: a mother folder that owns shared criteria; projects inherit it instead
of duplicating rules.

```text
create a work area for "AI-assisted frontend"
create a project "Marketing site" in the area "AI-assisted frontend"
```

- `create-area` initializes `lore/identidad.md`, `lore/principios.md`, `lore/index.md`, whatever
  thematic modules are needed, the Area's contract and its `FASES.md`, plus a `_starter/` with the
  templates `create-project` instantiates.
- `create-project` creates the folder in `{area}/proyectos/{slug}/` — never directly under the Area —
  prepares `lore/` for its own modules (the Area's generic ones are only referenced by relative
  path), `FASES.md` and the contract, and registers the project in the Area's `FASES.md`.

Then you work in the project as usual and call `save-to-lore` whenever you solve something that
reveals reusable criteria. **First time, you need to know no command:** write *"I want to start using
Lore Plugin, help me"* and the kit opens a brainstorming that ends with your first artifact created.

