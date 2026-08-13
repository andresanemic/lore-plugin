---
name: transmute-lore
description: Operate a project's body of criteria in five modes — migrate scattered criteria to the six-piece Lore standard (ADD); remove project copies of criteria already owned by its area (CLEAN); standardize language without changing meaning (TRANSLATE); arbitrate healthy Lore against a newer kit and raise it without rewriting earned criterion (UPGRADE); or generate a safe, traceable single-Markdown snapshot for chats, AI projects and notebooks without replacing the live artifacts (CRYSTALLIZE). Trigger on requests to transmute, migrate, clean, translate, upgrade, bring Lore up to date, crystallize Lore, export Lore to one Markdown, or prepare Lore as a chat/notebook source.
---

# Transmute Lore

Operates a project's body of criteria. Five modes, one skill:

- **ADD** — the project **never applied** the Lore method (or has a rough/incomplete `lore/`).
  Valuable criteria is *trapped* in non-distillable forms: long READMEs, an everything-mixed
  instruction contracts (`CLAUDE.md` or `AGENTS.md`), comments, tacit knowledge. ADD extracts it and lifts it to the six-piece
  standard **without losing it and without inventing what never existed**.
- **CLEAN** — the project already has the standard, but carries **per-project copies of thematic
  modules that duplicate what its area already owns**. CLEAN removes those modules, keeps
  `identidad.md` / `principios.md` / `index.md`, and rewrites `index.md` to point at the **area's**
  modules — but only after confirming that criteria already lives in the area (or reporting it if
  it does not).
- **TRANSLATE** — the Lore exists but its **language is mixed or wrong** (e.g. artifacts generated
  in English when the user works in Spanish). TRANSLATE standardizes every Lore artifact into one
  target language — **content and localizable filenames** — preserving structure, link integrity,
  confidence markers and — above all — **meaning**: it is a translation, never a rewrite.
- **UPGRADE** — the Lore is **in the standard and in active use**, but was written against an older
  version of these skills. It is structurally fine and materially behind: it lacks the gates and
  distinctions the kit learned after it was written. UPGRADE arbitrates the existing Lore **against
  the current version of the kit** and raises it, without rewriting what is already earned.
- **CRYSTALLIZE** — the Lore is healthy and must travel as a **single Markdown derivative** into a
  chat, an AI project, or a notebook such as NotebookLM. It resolves the live routing into one
  traceable snapshot while leaving every source untouched. It **does not replace the six live
  artifacts** and is not the normal format for work inside an agent or IDE that can read the tree.

## When to use

- **ADD:** a project with real criteria but no standard structure — no `lore/identidad.md` or
  `lore/principios.md`, state living inline in the instruction contract, or an incomplete/stale `lore/`.
  Triggers: *"transmute the lore of {project}"*, *"this old project isn't in the new format"*,
  *"migrate this project to the lore standard"*.
- **CLEAN:** a project inside an area that has redundant thematic modules (e.g. its own
  `lore/animation.md` identical to the area's). Trigger: *"clean the lore of {project}"*.
- **TRANSLATE:** a Lore whose content is in the wrong language, or mixes languages across artifacts.
  Triggers: *"standardize the language of the lore of {project}"*, *"translate the lore of
  {project} to {language}"*, *"estandariza el idioma del lore"*.
- **UPGRADE:** a healthy Lore that predates the installed version of the kit — nothing looks broken,
  which is the point. Triggers: *"improve the lore of {project} with the new version"*, *"bring this
  lore up to date with the plugin"*, *"arbitra mi lore contra la versión nueva"*, *"mejora este lore
  con lo nuevo del plugin"*. Also the natural next step right after updating the plugin.
- **CRYSTALLIZE:** a project or bot whose routed criteria must be attached to a chat, AI project, or
  notebook as one `.md`. Triggers: *"crystallize this Lore"*, *"export this Lore to one Markdown"*,
  *"prepare this bot as a ChatGPT source"*, *"cristaliza el lore en un solo archivo"*.

Detect the area: a project living in `{area}/proyectos/{name}/` inherits from `{area}/lore/`.
If the project is standalone (no parent area), CLEAN does not apply — say so.

## Target — the six-piece standard

| Artifact | Holds | Location |
|---|---|---|
| `identidad.md` | What the project is, its purpose, its **quality floor** (the north star). | `lore/` |
| `principios.md` | Invariant laws (technical + business): prohibitions and imperatives. | `lore/` |
| Thematic modules | Technical scars by topic (animation, layout, scroll…) as clues. | `lore/` |
| `index.md` | Navigation map of the lore: one line per pattern. | `lore/` |
| `FASES.md` | The project's state and plan (current phase, focus). **Outside `lore/`.** | root |
| `CLAUDE.md` or `AGENTS.md` | The one host-selected contract slimmed to **pointers** (no duplicated criteria). | root |

These are six structural pieces, not six literal files: thematic modules may be many.

> **Scope boundary for contracts:** “one contract” applies at the Lore scope root. Do not delete,
> rename or absorb nested instruction files managed by a framework or another tool (for example a
> Next.js or HyperFrames `AGENTS.md`). If both names already exist at the target root, compare their
> contents, identify ownership and present the choice at the HARD GATE; never discard unique rules
> merely to satisfy the one-file default.

> **No `logos.md` is generated.** That is specific to research projects, not the generic standard.

> **Artifact names are localized.** The names above are the Spanish canonical forms; per the kit's
> language rule they render in the user's language (e.g. English: `identity.md`, `principles.md`,
> `PHASES.md`). Fixed in every language: the selected contract name, `lore/`, `index.md`, `golden-paths.md`.
> Inside an existing corpus, its established names win.

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

### Phase 3 — Classification by destination

| Criteria type | Destination |
|---|---|
| Purpose, what the project is, quality floor, aesthetic standard | `identidad.md` |
| Invariant laws: prohibitions/imperatives (technical and business) | `principios.md` |
| Technical scar by topic (bug → cause → fix) | module `lore/<topic>.md` (clue) |
| State, current phase, work focus, active branch | `FASES.md` |
| Critical paths / mandatory verification | `golden-paths.md` (if applicable) |
| Stack, folder structure, navigation map | instruction contract (pointers/reference) |
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
2. What changes in the instruction contract (what moves to lore, what stays as a pointer).
3. The **discarded-noise report**, justified piece by piece.
4. Any **discrepancy** found between old lore/docs and the code or the user's description.

Wait for explicit approval before writing.

### Phase 6 — Writing (only after approval)
Create the artifacts, slim the instruction contract to pointers, build/update `index.md`. **Do not overwrite old
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

### Phase 2 — HARD-GATE
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

---

## UPGRADE mode — procedure

> **The premise:** these skills accumulate scars. A Lore written against an older version is
> structurally correct and materially behind — it never got the chance to carry defeats that were
> paid for after it was written. Nothing about it looks wrong, which is exactly why nobody upgrades
> it.

**What this mode is not:** it is not a rewrite, not a style pass, and not an excuse to regenerate a
Lore that works. A clue that was earned with real friction **outranks** any improvement the kit
learned later. The upgrade adds what is missing and marks what is now known to be wrong; it does not
relitigate what the project already paid for.

### Phase 0 — Safety precondition

Inspect `git status` and report whether the tree is clean, but **do not stop the diagnosis**. UPGRADE
is useful before the user is ready to write: it can read, arbitrate and present the full HARD-GATE
in a dirty or read-only tree. A clean tree is a precondition for **Phase 4 (writing)**, not for
Phases 1–3. If the target is not a repository, warn that there will be no diff safety net.

### Phase 1 — Establish both versions

- **Installed version:** read it from the active plugin manifest (`.claude-plugin/plugin.json`,
  `.codex-plugin/plugin.json`, or the equivalent manifest used by the current agent). If the installed
  copy is stale, **stop and say so**: upgrading a Lore against an outdated kit writes yesterday's
  standard into it and marks it as done. Update first.
- **The Lore's version:** it is usually not written down. Infer it from what the artifacts carry —
  presence of confidence markers, validity boundaries, the ` · ↑` promotion glyph, the index line
  format, whether imported modules declare provenance and defeats.

Report both, and say plainly when the second is a guess.

### Phase 2 — Arbitrate the existing Lore against the current kit

Before the artifact pass, detect a local `notas/` or `notes/` inbox. If one exists, invoke
`obsidian-lore` to report its debt and mine it through its own HARD-GATE. **The notes stay in their
inbox after mining**; they are source and provenance, never migration debris. UPGRADE must not move,
delete or absorb them into `lore/`.

Go artifact by artifact and produce a finding list. Each finding is one of exactly three kinds, and
naming the kind is what keeps this from becoming a rewrite:

| Kind | What it means | What it produces |
|---|---|---|
| **Missing** | The kit now requires something this artifact never had (a validity boundary, a confidence marker, a defeats section on an imported module, a provenance header). | Add it — **asking the user** for anything not derivable from the text. Never fabricate a boundary. |
| **Superseded** | The kit now knows this practice is wrong (e.g. a fact duplicated across artifacts, a rule stated by category rather than by condition, a module copied from an area). | Propose the correction, citing which rule supersedes it. |
| **Earned** | It departs from the current standard **because this project paid for it**. | **Leave it, and write down why** so the next upgrade does not flag it again. |

The third row is the one that makes the mode safe. A finding list with no `Earned` entries in a Lore
with real history is a sign the pass is being run as a formatter.

### Phase 3 — HARD-GATE

Show the full finding list with content in view: file, kind, what changes, and what rule of the
current version demands it. Nothing is written before approval. The user can accept per finding.

### Phase 4 — Upgrade (only after approval)

Re-check `git status` now. Require a clean tree before the first write so the upgrade lands as a
reviewable diff. If it is dirty, keep the approved findings intact, report the blocker and stop
before modifying anything; do not force the user to repeat the diagnosis.

Apply the accepted findings. Two limits that do not move:

- **Confidence is never raised.** A `conjecture` that survived three versions is still a conjecture:
  time is not validation. Only real friction promotes it.
- **A missing boundary is asked, never inferred.** The boundary says where the clue stops being
  true, and that is knowledge from whoever lived it. If the user does not know it either, the clue
  is marked as boundary-less rather than given a plausible one.

### Phase 5 — Final report

Report per kind: what was added, what was corrected, what was left as `Earned` and why, and what was
left pending because only the user could answer it. Record the version upgraded to, in the project's
`FASES.md` — not in the Lore. **Do not commit.**

---

## CRYSTALLIZE mode — procedure

> **The premise:** some destinations can accept one attached Markdown but cannot navigate a live
> folder tree. CRYSTALLIZE resolves the project's routing into a portable reading copy. The source
> remains authoritative; the derivative never becomes a second Lore to maintain.

### Phase 0 — Resolve target and destination

Identify whether the target is a project, area, or bot and where the derivative will be used: a
chat, an AI project, a notebook, or another Markdown-only reader. Default to a localized filename
such as `lore-crystallized.md` / `lore-cristalizado.md` at a user-approved export location, not
inside `lore/`.

CRYSTALLIZE **does not replace the six live artifacts**. It writes no source artifact and never
changes the instruction contract, `FASES.md`, `lore/`, a bot's canon, or any federated source.

### Phase 1 — Resolve the live routing

Read in this order and record every resolved path:

1. the target contract (`CLAUDE.md`, `AGENTS.md`, or the bot's equivalent);
2. `FASES.md` or the target's current state artifact;
3. `lore/index.md`, identity, and principles;
4. thematic modules routed by the index, including inherited area modules;
5. for a federated bot, its routing table and the exact canon/Lore sources it points to.

Follow links to their owners rather than copying adjacent files by directory. Deduplicate the same
source reached through multiple routes and preserve ownership in the resulting headings.

### Phase 2 — Apply the privacy boundary

Exclude by default **conversations, secrets, ignored files, undistilled notes**, environment files,
credentials, private histories, caches, and any corpus or directory not explicitly routed by the
target's contract. An ignored file is excluded even when a routed directory contains it.

For research or personal bots, do not infer that a conversation is safe because it is Markdown.
Public corpus and private continuity are different sources. If the user wants an excluded source
included, name it separately in the preview and require explicit approval for that source.

If a source carries its own visibility or distribution rule, that rule outranks convenience. A
source that cannot be redistributed is represented only by a notice that it was omitted.

### Phase 3 — Build the preview and HARD-GATE

Before writing, present:

- destination path and intended platform;
- the **exact source manifest**, in output order, with owner and resolved path;
- every excluded category found and its count;
- any source whose visibility is uncertain;
- the proposed title and section outline;
- whether an existing derivative would be overwritten.

Wait for explicit approval. Approval to crystallize the normal route does not approve an uncertain
or private source. If the destination already exists, show that fact and obtain overwrite approval;
otherwise choose a new filename.

### Phase 4 — Compose the derivative

Write one Markdown in this order:

1. title and target identity;
2. a warning that this is a generated reading copy;
3. generation date, source root, intended destination, and exact source manifest;
4. purpose and quality north;
5. principles;
6. routed thematic criterion, grouped by owner and original file;
7. current state from `FASES.md`, clearly labeled as volatile state rather than Lore;
8. bot routing/canon instructions when applicable;
9. omissions and privacy boundary;
10. regeneration notice.

Preserve the source language and substantive content. Normalize heading levels only so the combined
file remains navigable. Do not summarize away examples, confidence markers, defeats, validity
boundaries, or provenance: those are what let criterion participate rather than merely be named.

The header must say plainly: **this snapshot may become stale**. It must direct the reader back to
the live project tree for updates and warn agents not to write changes back into the derivative.

### Phase 5 — Verify and report

- Compare source hashes or byte counts before and after: CRYSTALLIZE **writes no source artifact**.
- Confirm every manifest entry has one corresponding section or an explicit omission notice.
- Scan the derivative for excluded filenames and known secret markers before reporting success.
- Confirm links that only made sense inside the tree are either expanded with source context or
  labeled as non-portable; do not leave silent broken navigation.
- Report output path, size, source count, excluded count, and the command/request needed to
  regenerate it. **Do not commit.**

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
- Folder-structure and stack inventories → the instruction contract as reference, not `principios.md`.
- Historical narrative with no criteria ("first we tried X, then Y").
- One-off process instructions already completed.

**Cutting rule:** if a sentence changes no future decision, it is not invariant criteria.

## Invariants

- **Criteria is never invented.** Only already-scattered criteria is transmuted. An artifact that
  would be empty because the project lacks that criteria stays minimal and says so — never padded.
- **A transcribed binary is not told apart by its extension.** Compare a binary's text against the
  existing corpus before extracting it, and when transcribing one, **record the correspondence
  binary → transcription** in the destination. Pending extraction items are written by content, not
  by file type.
- **Discarded noise is reported**, not silently deleted (filter transparency).
- **Clean tree gates writing, not diagnosis:** ADD/CLEAN/TRANSLATE keep their existing Phase 0
  precondition; UPGRADE may diagnose and present its HARD-GATE in a dirty/read-only tree, then
  requires a clean tree immediately before applying the approved findings.
- **Free notes survive transmutation.** A `notas/` / `notes/` inbox is mined by `obsidian-lore`,
  receives traceable frontmatter, and remains in place. No transmute mode deletes it as cleanup.
- **Do not overwrite old lore/docs without surfacing discrepancies** with code or the description.
- **HARD-GATE**: present the mapping with content in view and wait for approval before writing.
- **Do not auto-commit the target project.** The user reviews the diff and decides.
- **CLEAN never deletes `identidad.md` / `principios.md` / `index.md`** — only thematic modules, and
  only after confirming their criteria already lives in the area (otherwise reported, not deleted).
- **ADD writes new artifacts in the user's language — content and filenames** (fixed names
  selected contract name / `lore/` / `index.md` / `golden-paths.md` and general technical English terms
  excluded) — never in English just because this skill is.
- **TRANSLATE is meaning-preserving**: it changes the language of content and localizable
  filenames, never the criteria or the structure, and never leaves a broken link behind.
  Ambiguous nuances are flagged, not guessed.
- **CRYSTALLIZE is a derivative, never authority.** It follows routed owners, excludes private and
  unrouted material by default, writes no source artifact, and declares that its snapshot may become
  stale. Regenerate it from the live tree instead of editing it as Lore.
