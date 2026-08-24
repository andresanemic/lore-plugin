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
- **Free notes about this project** — the current project/area/bot inbox, a folder of Markdown,
  meeting minutes. They are source like any other, and most of what they hold is information rather
  than criteria: keep only what constrains a future decision, and report the rest as discarded. If
  the source is a `notes/` or `notas/` inbox, invoke `obsidian-lore` first regardless of size; it
  sweeps the source and hands over what is distillable.

Report what exists, where, and in what state (current / stale / narrative).

#### Binaries: check before extracting, and leave a trace after

A `.pdf`, `.docx` or `.xlsx` in the sources looks like pending work forever, because **a binary that
has already been transcribed is indistinguishable from one that has not**. Transmutation writes the
`.md` under the name the *content* deserves and leaves the binary exactly where it was, extension
intact and nothing recording the correspondence — so the only evidence is the resemblance between two
texts whose filenames do not resemble each other at all.

- **Before extracting one, compare its text against the `.md` corpus already there.** Normalizing
  whitespace and measuring literal overlap in chunks is enough and costs seconds. High overlap means
  it was already transcribed: report it and do not extract it again.
- **When you do transcribe one, record the correspondence in the destination** — one line in the
  corpus `index.md`, or in the header of the generated `.md`, naming the binary it came from. That
  single line is what prevents the whole pending item from being written in the first place.
- **Write pending extraction items by content, never by extension.** *«Extract the binaries»* sends
  the next person to redo work that is done; *«extract what is not yet in the corpus»* does not.

*Boundary:* this applies to a corpus that has been through a prior distillation — in one that has
not, there is nothing to compare against and every extraction is real work. Literal comparison
catches faithful transcriptions; a deep rewrite of the same content can fall under the threshold, so
**low overlap does not prove** the material is new.

### Phase 2 — Criteria extraction
Walk the sources separating **criteria** from **noise** with the heuristics below. Criteria is
anything that **constrains a future decision**. Noise is descriptive and constrains nothing.

ADD may also find explicit professional facts, roles, experience and goals across existing projects,
documents and chat summaries. Treat them as sourced candidate clues, never as a profile inferred from
personality or sensitive attributes. If `perfil-profesional.md` is not already enabled, explain the
two outcomes and ask neutrally: enabling it creates a visible, portable profile from reviewed small
clues; declining creates nothing and suppresses later biographical suggestions. Proceed without
recommending either option and never require a CV, résumé or life story.

### Phase 3 — Classification by destination

| Criteria type | Destination |
|---|---|
| Purpose, what the project is, quality floor, aesthetic standard | `identidad.md` |
| Invariant laws: prohibitions/imperatives (technical and business) | `principios.md` |
| Technical scar by topic (bug → cause → fix) | module `lore/<topic>.md` (clue) |
| State, current phase, work focus, active branch | `FASES.md` |
| Critical paths / mandatory verification | `golden-paths.md` (if applicable) |
| Stack, folder structure, navigation map | instruction contract (pointers/reference) |
| Explicit professional facts, experience and goals, only if enabled | `perfil-profesional.md` in the owning area's `lore/`, or local `lore/` when standalone |
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

### Phase 5 — Threshold
Do not write yet. Present **one** mapping document containing:
1. The **real proposed content** of each new artifact (not just a routing table).
2. What changes in the instruction contract (what moves to lore, what stays as a pointer).
3. The **discarded-noise report**, justified piece by piece.
4. Any **discrepancy** found between old lore/docs and the code or the user's description.
5. If enabled, every proposed professional clue with its source; if declined, only note that the
   optional module was not selected.

Wait for explicit approval before writing.

For a multi-decision transmutation, apply `brainstorming-lore`'s **recognizable continuity** contract:
the mapping is the accumulated artifact and each recap carries forward what the user already approved.

### Phase 6 — Writing (only after approval)
Create the approved artifacts, including `perfil-profesional.md` only when enabled; projects and bots
point to the area's master instead of copying it. Slim the instruction contract to pointers and
build/update `index.md`. **Do not overwrite old
`lore/` without surfacing discrepancies**: if old content contradicts current code or the user's
words, report it instead of proceeding blind.
**A paragraph is a paragraph** (kit invariant in `use-lore`): continuous prose in `lore/`, the
contract and `FASES.md` runs to the period, not to column 80. Do not hard-wrap mid-sentence.

### Phase 7 — Final report
Summarize: what was transmuted (by artifact), what was discarded as noise (justified), and the diff
summary. **Do not commit the target project** — the diff stays for the user to review and commit.

## Criteria-extraction heuristics (ADD)

**Signals of CRITERIA** (enters the corpus):
- Imperatives and prohibitions: "never", "always", "mandatory", "do not use", "without exception".
- Concrete values **with a reason**: "`#60A0FF` in dark because `#0057FF` is illegible".
- Scars: a bug with its cause and fix (even in `incidents/` or comments).
- Quality standard: "the approved landing is the floor", "Awwwards level".
- Justified decisions: any claim with a "because" that binds a future decision.

**Signals of NOISE** (does not enter `principios`/`identidad`; stays as descriptive doc or is discarded):
- Description of what a component does without constraining anything.
- Folder-structure and stack inventories → the instruction contract as reference, not `principios.md`.
- Historical narrative with no criteria ("first we tried X, then Y").
- One-off process instructions already completed.

**Cutting rule:** if a sentence changes no future decision, it is not invariant criteria.
