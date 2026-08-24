## CLEAN mode — procedure

### Phase 0 — Safety precondition
Same as ADD: require a clean git tree (or warn if not a repo). The cleanup must be a reviewable diff.

### Phase 1 — Locate the area and compare
1. Resolve the parent area: the project is at `{area}/proyectos/{name}/`; the area lore is
   `{area}/lore/`. If there is no parent area, **stop** — CLEAN does not apply.
2. List the project's thematic modules (everything in the project's `lore/` **except**
   `identidad.md`, `principios.md`, `index.md`).
3. For each project module, compare against the area's counterpart (`{area}/lore/<topic>.md`):
   - Every clue in the project module **already present** in the area module → redundant, removable.
   - Any clue **not** in the area → project-specific (or not yet promoted). **Do not delete it.**
     Report it so the user can decide (keep as project module, or promote to the area first).

### Phase 2 — Threshold
Present: which modules will be removed (fully redundant with the area), which are kept (and why),
and the exact rewritten `index.md` pointing to the area modules. Wait for explicit approval.

### Phase 3 — Clean (only after approval)
- Delete the fully-redundant project thematic modules. **Never delete `identidad.md`,
  `principios.md`, or `index.md`.**
- Rewrite `index.md`: entries for area-owned topics link to `../../../lore/<topic>.md`; entries for any
  kept project-specific module keep their local link.
  > **Three `../`, not two:** `index.md` sits in `{area}/proyectos/{slug}/lore/`, so the area is three
  > levels up. Verify each rewritten link resolves to a real file in `{area}/lore/`.
- Leave `identidad.md` / `principios.md` untouched (they carry the project's own layer).

### Phase 4 — Final report
Report what was removed, what was kept and why, any clue that was NOT in the area (so nothing is
lost silently), and the diff summary. **Do not commit.**
