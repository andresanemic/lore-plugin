## TRANSLATE mode — procedure

Standardizes the **language of the Lore's content**. It translates; it never restructures,
adds, or drops criteria. If while translating you spot a structural problem, report it and
propose ADD/CLEAN as a separate pass.

### Phase 0 — Safety precondition
Same as ADD/CLEAN: require a clean git tree (or warn if not a repo) so the translation lands as a
reviewable diff.

### Phase 1 — Language inventory
1. Resolve the **target language**: the one the user asked for; if unstated, the **user's own
   language** (the one they are speaking in).
2. Scan the scope's artifacts — `lore/*.md`, `FASES.md`, the instruction contract, `golden-paths.md` if present —
   and record each file's current language (or "mixed").
3. Scope boundary: translating a **project** does NOT touch its area's `lore/`; translating an
   **area** does NOT touch its projects. If the other level is in a different language, report the
   mismatch and let the user decide whether to run TRANSLATE there too.

### Phase 2 — Threshold
Present the plan before writing: file-by-file current language → target, including **renames** —
localizable artifact names move to the target language too (e.g. `identidad.md` ↔ `identity.md`,
`principios.md` ↔ `principles.md`, `FASES.md` ↔ `PHASES.md`, `proyectos/` ↔ `projects/`,
`fuente/` ↔ `source/`, thematic modules) — plus what will NOT be translated or renamed:
- the fixed names: the selected contract filename, `lore/`, `index.md`, `golden-paths.md`, `_starter/`;
- code blocks, identifiers, commands, quoted error messages / log excerpts;
- confidence markers (`conjecture` / `confirmed`) and the promotion glyph ` · ↑`;
- English terms of general technical use (workflow, commit, stack, scaffold…);
- proper nouns and brand names.

Renaming `proyectos/` (or moving anything referenced outside the scope) is **opt-in**: propose it,
but only include it if the user accepts — external references (other repos' FASES rows, scripts)
may point at the old path.

Wait for explicit approval.

### Phase 3 — Translate (only after approval)
Translate each file's prose to the target language, preserving Markdown structure (headings,
tables, list shapes) line-for-line where possible. Apply the approved renames with `git mv` and
**rewrite every link that touches a renamed file** — in the scope's `index.md`, instruction contract,
cross-references between artifacts, and inherited-path links. **Meaning-preserving above all**: a
clue's constraint must survive translation intact — when a nuance is ambiguous, flag it in the
report instead of guessing.

Link integrity crosses the scope boundary even though translation does not: when translating an
**area**, grep its projects' lore files for links into any renamed area file and update those
links too (or report them if the projects cannot be touched).

### Phase 4 — Final report
Report files translated (with source language), files renamed (old → new), links rewritten, files
skipped and why, any nuance flagged for human review, and the diff summary. **Do not commit** —
the user reviews the diff and decides.

### Phase 5 — MYCELIUM exit scan (read-only, mandatory)

TRANSLATE renames localizable files and rewrites the links that touch them — a `destino:` or a
step's back-reference that named an old filename is now a dead pointer. Run **MYCELIUM mode**
(`modes/mycelium.md`) over the renamed scope: every junction that survived translation must still
resolve from both sides. TRANSLATE is **not complete** until this scan has run and every finding is
written or declined in writing.
