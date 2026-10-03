## 5. Filesystem Layout

A typical Lore layout, with an Area and a project, looks like this:

```text
{area}/
  lore/
    identidad.md
    principios.md
    index.md
    <thematic-modules>.md
  _starter/                    → templates that create-project instantiates
    CLAUDE.template.md or AGENTS.template.md
    FASES.md
    golden-paths.template.md   → only if the domain warrants it
  FASES.md                     → Area's project registry
  CLAUDE.md or AGENTS.md       → the Area's one host-selected contract
  .lore-mycelium               → receipt v2 of the accepted Lore state: content digest
                                 plus UTF-8 bytes of criterion bodies loaded for every
                                 task. Written by `lore-plugin mycelium receipt`, and
                                 committed: the same tree state produces the same **digest**
                                 on every machine. The claim is about the digest and stops
                                 there — anything else the receipt carries is local state

  proyectos/
    {slug}/
      lore/
        identidad.md            → own content + pointer to the Area's
        principios.md           → own content + pointer to the Area's
        index.md                → points to Area modules via ../../../lore/<module>.md
        <own modules>.md        → only criteria specific to this project
      FASES.md
      CLAUDE.md or AGENTS.md
```

Key points of this hierarchy:

- Projects **always** live at `{area}/proyectos/{slug}/`, never directly under the Area.
- Generic thematic modules are **not copied** into the project: they live once in `{area}/lore/`,
  and the project's `index.md` references them by relative path. That path climbs **three** levels
  (`lore/` → `{slug}/` → `proyectos/` → `{area}/`), not two.
- Shared criteria live in the Area. Project‑specific criteria live in the project.

---

