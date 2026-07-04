---
name: transmute-lore
description: Migrate a project with scattered criteria (bloated CLAUDE.md, kilometric READMEs, stale or absent lore/, criteria buried in code comments) up to the six-artifact Lore standard (ADD mode), OR clean a project's redundant per-project thematic modules back down to what its area already owns (CLEAN mode). Recovers trapped criteria and crystallizes it into invariant clues, separating it from descriptive noise. Trigger on "transmute the lore of {project}", "this old project isn't in the new format", "migrate this project to the lore standard", or "clean the lore of {project}".
---

# Transmute Lore

Repairs a project's body of criteria. Two modes, one skill:

- **ADD** — the project **never applied** the Lore method (or has a rough/incomplete `lore/`).
  Valuable criteria is *trapped* in non-distillable forms: long READMEs, an everything-mixed
  `CLAUDE.md`, comments, tacit knowledge. ADD extracts it and lifts it to the six-artifact
  standard **without losing it and without inventing what never existed**.
- **CLEAN** — the project already has the standard, but carries **per-project copies of thematic
  modules that duplicate what its area already owns**. CLEAN removes those modules, keeps
  `identidad.md` / `principios.md` / `index.md`, and rewrites `index.md` to point at the **area's**
  modules — but only after confirming that criteria already lives in the area (or reporting it if
  it does not).

## When to use

- **ADD:** a project with real criteria but no standard structure — no `lore/identidad.md` or
  `lore/principios.md`, state living inline in `CLAUDE.md`, or an incomplete/stale `lore/`.
  Triggers: *"transmute the lore of {project}"*, *"this old project isn't in the new format"*,
  *"migrate this project to the lore standard"*.
- **CLEAN:** a project inside an area that has redundant thematic modules (e.g. its own
  `lore/animation.md` identical to the area's). Trigger: *"clean the lore of {project}"*.

Detect the area: a project living in `{area}/proyectos/{name}/` inherits from `{area}/lore/`.
If the project is standalone (no parent area), CLEAN does not apply — say so.

## Target — the six-artifact standard

| Artifact | Holds | Location |
|---|---|---|
| `identidad.md` | What the project is, its purpose, its **quality floor** (the north star). | `lore/` |
| `principios.md` | Invariant laws (technical + business): prohibitions and imperatives. | `lore/` |
| Thematic modules | Technical scars by topic (animation, layout, scroll…) as clues. | `lore/` |
| `index.md` | Navigation map of the lore: one line per pattern. | `lore/` |
| `FASES.md` | The project's state and plan (current phase, focus). **Outside `lore/`.** | root |
| `CLAUDE.md` | The contract slimmed to **pointers** (no duplicated criteria). | root |

> **No `logos.md` is generated.** That is specific to research projects, not the generic standard.

---

## ADD mode — procedure (7 phases · single gate with content in view)

### Phase 0 — Safety precondition
Run `git status` in the target repo. If there are uncommitted changes, **stop** and ask the user to
commit or stash first. Reason: the transmutation must land as a **clean, reviewable diff**. If the
project is not a git repo, warn (no diff safety net) and ask to confirm before continuing.

### Phase 1 — Diagnosis
Inventory the existing sources of criteria and their state:
- `CLAUDE.md` / `AGENTS.md` — often the biggest deposit of mixed criteria.
- `README.md`, `PROJECT.md`, loose docs at the root.
- Old `lore/` (if any) — assess format and currency.
- `incidents/`, `design/`, `reports/`, `soluciones.md` — scars and decisions.
- `GOLDEN_PATHS.md` / equivalent — critical paths.
- Code comments carrying criteria (grep for "never", "always", "WARNING", "NO ", "hack", "workaround"
  and their localized equivalents).

Report what exists, where, and in what state (current / stale / narrative).

### Phase 2 — Criteria extraction
Walk the sources separating **criteria** from **noise** with the heuristics below. Criteria is
anything that **constrains a future decision**. Noise is descriptive and constrains nothing.

### Phase 3 — Classification by destination

| Criteria type | Destination |
|---|---|
| Purpose, what the project is, quality floor, aesthetic standard | `identidad.md` |
| Invariant laws: prohibitions/imperatives (technical and business) | `principios.md` |
| Technical scar by topic (bug → cause → fix) | module `lore/<topic>.md` (clue) |
| State, current phase, work focus, active branch | `FASES.md` |
| Critical paths / mandatory verification | `golden-paths.md` (if applicable) |
| Stack, folder structure, navigation map | `CLAUDE.md` (pointers/reference) |
| Descriptive with no constraint | **discard** (reported, see invariants) |

**Area-aware routing:** if the project belongs to an area, a generic thematic clue that the **area
already owns** does NOT get copied into the project — the project's `index.md` points to the area's
module instead. Only project-specific scars become project-local modules.

### Phase 4 — Rewrite to target format
- **Scars** → invariant clue: `Context → Probable cause → Clue → Confidence (confirmed/conjecture)`.
- **Laws** → imperative lines in `principios.md`, grouped (technical / business).
- **Purpose + quality floor** → `identidad.md` in brief prose (what we are, what we are NOT, the north).
- **State** → `FASES.md` with the current phase and focus.
- **Index** → `index.md`, one line per pattern (`topic · symptom · confidence · file`), area
  modules linked by relative path (`../../../lore/<topic>.md`).

### Phase 5 — HARD-GATE
Do not write yet. Present **one** mapping document containing:
1. The **real proposed content** of each new artifact (not just a routing table).
2. What changes in `CLAUDE.md` (what moves to lore, what stays as a pointer).
3. The **discarded-noise report**, justified piece by piece.
4. Any **discrepancy** found between old lore/docs and the code or the user's description.

Wait for explicit approval before writing.

### Phase 6 — Writing (only after approval)
Create the artifacts, slim `CLAUDE.md` to pointers, build/update `index.md`. **Do not overwrite old
`lore/` without surfacing discrepancies**: if old content contradicts current code or the user's
words, report it instead of proceeding blind.

### Phase 7 — Final report
Summarize: what was transmuted (by artifact), what was discarded as noise (justified), and the diff
summary. **Do not commit the target project** — the diff stays for the user to review and commit.

---

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

### Phase 2 — HARD-GATE
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

---

## Criteria-extraction heuristics (ADD)

**Signals of CRITERIA** (enters the corpus):
- Imperatives and prohibitions: "never", "always", "mandatory", "do not use", "without exception".
- Concrete values **with a reason**: "`#60A0FF` in dark because `#0057FF` is illegible".
- Scars: a bug with its cause and fix (even in `incidents/` or comments).
- Quality standard: "the approved landing is the floor", "Awwwards level".
- Justified decisions: any claim with a "because" that binds a future decision.

**Signals of NOISE** (does not enter `principios`/`identidad`; stays as descriptive doc or is discarded):
- Description of what a component does without constraining anything.
- Folder-structure and stack inventories → `CLAUDE.md` as reference, not `principios.md`.
- Historical narrative with no criteria ("first we tried X, then Y").
- One-off process instructions already completed.

**Cutting rule:** if a sentence changes no future decision, it is not invariant criteria.

## Invariants

- **Criteria is never invented.** Only already-scattered criteria is transmuted. An artifact that
  would be empty because the project lacks that criteria stays minimal and says so — never padded.
- **Discarded noise is reported**, not silently deleted (filter transparency).
- **Clean-tree precondition**: transmutation runs on a committed tree, to land as a reviewable diff.
- **Do not overwrite old lore/docs without surfacing discrepancies** with code or the description.
- **HARD-GATE**: present the mapping with content in view and wait for approval before writing.
- **Do not auto-commit the target project.** The user reviews the diff and decides.
- **CLEAN never deletes `identidad.md` / `principios.md` / `index.md`** — only thematic modules, and
  only after confirming their criteria already lives in the area (otherwise reported, not deleted).
