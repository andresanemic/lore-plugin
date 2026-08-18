---
name: transmute-lore
description: Operate a project's body of criteria in six modes — migrate scattered criteria to the six-piece Lore standard (ADD); remove project copies of criteria already owned by its area (CLEAN); standardize language without changing meaning (TRANSLATE); arbitrate healthy Lore against a newer kit and raise it without rewriting earned criterion (UPGRADE); prune a Lore that decayed by accumulating correct things, until it fits the deliverable again (PRUNE); or generate a safe, traceable single-Markdown snapshot for chats, AI projects and notebooks without replacing the live artifacts (CRYSTALLIZE), a snapshot that can be extracted back into a folder whose routing table resolves. Trigger on requests to transmute, migrate, clean, translate, upgrade, bring Lore up to date, prune the Lore, "prune-lore", "poda en lore", "poda el lore de {proyecto}", crystallize Lore, export Lore to one Markdown, prepare Lore as a chat/notebook source, extract a crystallization, or "extrae esta cristalización".
---

# Transmute Lore

The criteria is already there. It is in a README nobody finishes, in a `CLAUDE.md` that grew by
accretion, in a comment that says *don't touch this, it breaks hydration* — written by people who
paid for it, sitting in shapes nothing can load. Nothing is missing. Nothing is reachable either.

This skill operates a project's body of criteria. Six modes, one skill:

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
- **PRUNE** — the Lore is in the standard, in active use, and **nothing in it is wrong**. It decayed
  by accumulating correct things until their sum no longer fits the deliverable. PRUNE is the only
  mode that asks *does any of this need to be here?* and counts apparatus against content. What it
  shrinks is **the deliverable's surface**, not necessarily the corpus — see the warning in Phase 4.
  It is not CLEAN: nothing here is a duplicate.
- **CRYSTALLIZE** — the Lore is healthy and must travel as a **single Markdown derivative** into a
  chat, an AI project, or a notebook such as NotebookLM. It resolves the live routing into one
  traceable snapshot while leaving every source untouched. The snapshot is **extractable**: unpacking
  it rebuilds a mini-root whose routing table resolves, so a third person's AI session can work as
  closely as possible to the crystallizer's. It **does not replace the six live artifacts** and is
  not the normal format for work inside an agent or IDE that can read the live tree.

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
- **PRUNE:** a Lore nobody can point at a defect in, whose *output* has degraded — deliverables that
  go in circles, hedge, or arrive wrapped in more apparatus than content, and a human who has started
  writing the thing by hand instead. That last symptom is the loudest one: **the owner bypassing
  their own system is the measurement.** Triggers: *"prune the lore of {project}"*, *"prune-lore"*,
  *"poda en lore"*, *"poda el lore de {proyecto}"*, *"this lore has too much in it"*. Also the
  scheduled pass of a pruning ritual, run **before** producing the week's work and never after.
- **CRYSTALLIZE:** a project or bot whose routed criteria must be attached to a chat, AI project, or
  notebook as one `.md`, or unpacked from that file into a folder. Triggers: *"crystallize this
  Lore"*, *"export this Lore to one Markdown"*, *"prepare this bot as a ChatGPT source"*,
  *"cristaliza el lore en un solo archivo"*, *"extract this crystallization"*,
  *"extrae esta cristalización"*.

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
> contents, identify ownership and present the choice at the threshold; never discard unique rules
> merely to satisfy the one-file default.

> **No `logos.md` is generated.** That is specific to research projects, not the generic standard.

> **Artifact names are localized.** The names above are the Spanish canonical forms; per the kit's
> language rule they render in the user's language (e.g. English: `identity.md`, `principles.md`,
> `PHASES.md`). Fixed in every language: the selected contract name, `lore/`, `index.md`, `golden-paths.md`, the `<!-- lore:always-on -->` marker pair (literal, never localized — localizing it breaks idempotent stamping silently).
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

### Phase 5 — Threshold
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
is useful before the user is ready to write: it can read, arbitrate and present the full threshold
in a dirty or read-only tree. A clean tree is a precondition for **Phase 4 (writing)**, not for
Phases 1–3. If the target is not a repository, warn that there will be no diff safety net.

### Phase 1 — Establish both versions

- **Installed version:** read it from the **host's installation registry**
  (`~/.claude/plugins/installed_plugins.json`, or the equivalent record the current agent keeps of
  what it actually loaded) — **not** from a `plugin.json` found by walking the working tree. Those two
  answer different questions: the manifest in the repository is the *source's* version, and the
  registry is the version that will run. They diverge routinely, and the case where they diverge most
  is the one where this matters most — working inside the kit's own repository, where the source is
  always ahead of what is installed.

  **And the registry is still not the last word.** A session resolves its plugin version **when it
  opens**: one opened before an install keeps running the previous copy, and the registry — correct on
  disk, updated, agreeing with itself — will not mention it. The witness that survives is the path the
  skill declares as it loads, contrasted against a word that exists in only one version (`GRAFT`,
  `PRUNE`). Measured on two consecutive days, and on the second the path alone was not enough: with a
  **directory marketplace** it carries no version number at all, so the exclusive word did the work by
  itself. **After installing, close the session and open another** — nothing in the output of the old
  one announces which version answered.
- If the installed copy is stale, **stop and say so**: upgrading a Lore against an outdated kit writes
  yesterday's standard into it and marks it as done. Update first, or run deliberately from source and
  **declare it in the gate** — a pass run from source proves nothing about the published kit.
- **The Lore's version:** it is usually not written down. Infer it from what the artifacts carry —
  presence of confidence markers, validity boundaries, the ` · ↑` promotion glyph, the index line
  format, whether imported modules declare provenance and defeats.

Report both, and say plainly when the second is a guess.

### Phase 2 — Arbitrate the existing Lore against the current kit

Before the artifact pass, detect a local `notas/` or `notes/` inbox. If one exists, invoke
`obsidian-lore` to report its debt and mine it through its own threshold. **The notes stay in their
inbox after mining**; they are source and provenance, never migration debris. UPGRADE must not move,
delete or absorb them into `lore/`.

Go artifact by artifact and produce a finding list. Each finding is one of exactly four kinds, and
naming the kind is what keeps this from becoming a rewrite:

| Kind | What it means | What it produces |
|---|---|---|
| **Missing** | The kit now requires something this artifact never had (a validity boundary, a confidence marker, a defeats section on an imported module, a provenance header). | Add it — **asking the user** for anything not derivable from the text. Never fabricate a boundary. |
| **Superseded** | The kit now knows this practice is wrong (e.g. a fact duplicated across artifacts, a rule stated by category rather than by condition, a module copied from an area). | Propose the correction, citing which rule supersedes it. |
| **Earned** | It departs from the current standard **because this project paid for it**. | **Leave it, and write down why** so the next upgrade does not flag it again — in `FASES.md`, see below. |
| **Stale** | It matches the kit and no longer matches **the project**: it describes a practice that changed and nobody amended the text. | Report it with the evidence that contradicts it, and **ask**. The practice is the user's, not the kit's, so the correction is theirs to state. |

The third row is the one that makes the mode safe. A finding list with no `Earned` entries in a Lore
with real history is a sign the pass is being run as a formatter.

**The fourth row is the one no reading finds.** This mode was written to arbitrate a Lore against a
newer *kit*, and its own premise says *nothing about it looks wrong, which is exactly why nobody
upgrades it*. That sentence is just as true one level over, against the *project*: a module went on
describing a step its team had already stopped taking, six deliveries in a row, and nothing flagged it
because the stale flow read perfectly coherent on its own.

**Coherence is not a detector.** An artifact consistent with itself and false about the outside
survives every reading — in this kit's own history it has been caught three times, and all three times
by going to *do* something, never by reviewing. So the check cannot be another re-read. **It is the
repository:** scan the recent commits and the actual deliverables the module governs, and ask of each
procedure it prescribes whether anything still does it that way. Where the evidence contradicts the
text, that is `Stale`. Where there is no recent evidence in either direction, **say so and do not
guess** — a module governing work that stopped happening is a different finding, and it is the user's
to name.

**Where an `Earned` note is written: the Lore owner's `FASES.md`, not the artifact it defends.**
Writing it inside the artifact is the obvious move and it is wrong in exactly the case that produces
the most `Earned` findings — a **generated** file, where the next run of its script erases the note
and the pass after that flags the same thing again. `FASES.md` is the only piece of the standard that
is hand-kept, dated and read by the next pass before it starts, which is what an exemption needs. One
line per exemption: what departs, and what the project paid to learn it.

**The contract is an artifact of this pass, not an afterthought.** A Lore that predates the
always-on block has the pointer section but no markers, so nothing can find it and nothing can
re-stamp it. That is a `Missing` finding like any other: wrap the existing pointer section in
`<!-- lore:always-on -->` / `<!-- /lore:always-on -->` and add the invocation signal if it is absent,
choosing the variant by shape (area, project, bot). Rules and ceiling are in `use-lore`.

Two cases that are **not** `Missing`: a contract whose pointer section the project rewrote for its
own reasons is `Earned` — wrap it, do not normalize its wording; and a contract with markers already
present whose content differs from the canonical is a divergence, which is reported and waits, never
silently overwritten.

**And one case that is neither: the existing section carries more than the block's four things.**
This is the common shape in a contract written by hand, where loading and routing were never
separated — a numbered procedure that starts by naming the paths and then keeps going into what to do
with them. Do **not** wrap that section: wrapping it drags a procedure inside a block whose contents
are fixed at four, and the ceiling goes with it. Insert the block, then **reduce the section to what
the block does not carry** and report both moves together in the gate. The pointers end up in one
place, and the place they end up in is the one the skills re-stamp. This is the path by which an already-installed ecosystem receives the block:
without it the feature only ever reaches projects created after it existed, which is the smaller
half of any installed base.

**Check the index against its own row format, not just its links.** `index.md` is `topic · when to
consult · file`, and the failure to look for is a middle field that has quietly split in two — some
rows saying *when to open this*, others carrying a confidence marker or a one-word description of
what the file is. That is a `Superseded` finding: confidence belongs inside the Pista, next to its
validity boundary, because that is the only place the two mean anything together. The drift is worth
a dedicated check because of how it hides — **a malformed list looks exactly as well-formed as a
complete one**, and every row reads fine on its own. Repair the rows and put the format in one line
at the top of the file, so the next pass arbitrates against a written contract instead of a majority
vote among the rows.

**A second kit sharing the repository is part of the diagnosis, not out of scope.** If a governing
document from another kit is present — the clearest case being spec-kit's
`.specify/memory/constitution.md` — check one thing: does it claim authority over criteria it does
not own? A clause of the *«this document supersedes all other practices»* family is a `Superseded`
finding, and the correction is not to delete it but to **revoke it in writing, with its reason**.
Deleting leaves a hole that the next template regeneration fills back in.

Check one more thing, which is a `Missing` finding: **does the document say who may write?** A border
that revokes the other kit's supremacy and then says nothing about commits, pushes, releases or
publication is half a border — the other kit's build step is an autonomous write loop, and revoking
its authority over criteria does not revoke its authority over the repository.

Two limits on this. The document is **not migrated into `lore/`** — it stays where it lives and keeps
its owner; what UPGRADE proposes is an edit inside it. And if the user wants it arbitrated properly
rather than patched, that is `save-to-lore` in GRAFT mode, which is where imported criteria
belongs. When no second kit is present this check costs nothing and produces no finding.

### Phase 3 — Threshold

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

## PRUNE mode — procedure

> **The premise, and it is not the same as CLEAN.** CLEAN removes *duplicates* — modules the area
> already owns. PRUNE removes *weight*: criteria that is not duplicated, not wrong, and not
> superseded, and whose only defect is that it is still there. A Lore in daily use does not decay by
> going stale. It decays by **accumulating correct things**, and no other mode asks the subtractive
> question.
>
> Every check below comes from one observed failure, not from a preference. They are named in the
> phases so a future pass can tell which ones were earned and which were assumed.

**The unit this mode counts is not the Lore. It is the deliverable.** A body of criteria is not too
big in the abstract; it is too big *for the thing it has to produce*. Ask for the artifact the
project actually ships — a post, a page, a component, a report — before reading a single module.
Without it, PRUNE has no denominator and turns into taste.

### Phase 0 — Safety precondition

Clean tree before writing. Diagnosis may run on a dirty tree; writing may not.

### Phase 1 — Measure before reading

Produce the count first, because the defect this mode exists for **is invisible when reading files
one at a time** — every law reads fine on its own.

| What | Why it is counted |
|---|---|
| Laws in `principios.md`, area + project | These are all active at once on every task. |
| Clues across thematic modules | Same. |
| Clues **with no validity boundary** | A clue with no boundary applies *always*. This is the multiplier. |
| Guardrails from the active strategy or phase | Also active at once, and usually forgotten in the count. |
| **Scaffolding vs. content in the last three deliverables** | Lines of apparatus (justifications, discards, checklists, applied-guardrail notes) against lines of the thing actually published. |

The last row is the one that finds what reading cannot. A ratio where apparatus dwarfs content is a
finding on its own, and it belongs to no single clue — which is exactly why no per-artifact pass has
ever caught it.

**Also inventory, per piece type the project ships: is there a declared length ceiling?** The piece
with no ceiling is the piece that will bloat, and the trap is that it is usually the *most* published
one — a ceiling gets written for the rare formats and skipped for the daily one, because the daily
one felt too obvious to bound.

### Phase 2 — Classify, four kinds

| Kind | What it means | What it produces |
|---|---|---|
| **Deadwood** | It constrains no future decision. The decision it once shaped no longer exists, or it was adopted from elsewhere and never bit. | **Comes out** — after its residue is written (below). |
| **Crowding** | Correct, earned, not refutable — and yet its *sum* with the others saturates the deliverable. | **Does not come out.** It receives a **validity boundary**, or a **destination** for the artifact it demands, or a **ceiling**. |
| **Rooted** | Load-bearing. A real scar behind it and a decision that still depends on it. | Untouched, and **not re-examined by the next pass**. |
| **Unhealed** | Declared applied and only partly applied — the correction landed in one place and not in its siblings. | **Finish it or unmark it.** It may not stay declared-and-false. |

**A prune list with no `Rooted` entries is a pass being run as a chainsaw.** This is the mirror of
UPGRADE's `Earned` rule and it exists for the same reason: a mode that only removes will always find
something to remove.

**`Crowding` is the kind that does the work, and the one a careless pass will misfile as
`Deadwood`.** The three-clue case that produced this mode had every clue correct, every scar dated,
and nothing to refute — and their sum put ~120 lines of apparatus around 5 lines of copy. The defect
was not in any clue. It was that **none of them declared where the artifact it demands lives**, so
all of them landed on the same surface: the one the deliverable is published from. Look for that
first: a clue that mandates an artifact and does not name its home is `Crowding`, not `Deadwood`, and
the repair is a **destination**, not a deletion.

**`Unhealed` exists because nothing else verifies it.** A clue that says *"the dialect was
corrected"* is cited by every later pass as done. `save-to-lore` already carries the rule — *one fixed
out of five is not a fix* — and **no mode checks it on a later pass**. For every clue that declares a
correction applied, grep the corpus for the pattern it claims to have removed. A clue that is
declared applied and is not is worse than a missing clue: it is trusted.

### Phase 3 — Two questions that are not about any single clue

**Is a law actually plumbing?** `principios.md` holds **invariant law**. Where a file is stored, what
status a new entry starts in, what a deliverable is made of — those are storage convention and flow
specification. They belong to the contract or the schema. The cost is not tidiness: whoever is about
to work loads ten "principles" of which several are pipework, and the two that are real criteria are
buried among them. Route them out; this is `Crowding`, and its repair is a move, not a cut.

**Does the review pipeline have a subtractive pass?** Count the passes an editing module prescribes
and ask how many of them can *remove*. A pipeline whose passes all check clarity, voice, proof,
specificity, emotion and risk — and none of which asks *is any of this unnecessary?* — has its output
shape decided in advance, no matter how good each pass is. A missing subtractive pass is `Crowding`
on the pipeline itself.

### Phase 4 — Threshold

Present the four lists with content in view, plus the Phase 1 counts **before and after**. Nothing is
written before approval, and the user can accept per finding.

**Report both sizes, and do not confuse them.** What PRUNE shrinks is **the deliverable's surface**;
the corpus may go either way. A `Crowding`-dominated Lore gets **bigger** when it is pruned
correctly, because the repair for `Crowding` is to *add* a boundary, a destination or a ceiling —
only `Deadwood` subtracts. The first real run of this mode ended with a corpus **35 lines larger**
and the apparatus inside its deliverable down from ~120 lines to none. That is a success, and
counting clues would have called it a failure.

> **Never optimize for the smaller number.** A pass judged on corpus size has exactly one cheap way
> to win: delete earned criteria. Say what the corpus weighs before and after, say what the
> deliverable weighs before and after, and let the second one be the verdict.

### Phase 5 — Prune (only after approval)

**Nothing comes out without residue.** Every `Deadwood` removal is written as one dated line in the
owner's `FASES.md`: what came out, and what it used to be for. Pruning without residue is not
distillation, it is amnesia — and the next person to meet the same friction will re-derive the clue
from scratch and believe it is new.

Three limits that do not move:

- **A clue whose scar you cannot see is `Rooted`, not `Deadwood`.** Absence of a visible reason is
  absence of evidence. Criteria you did not pay for is not yours to remove; ask, or leave it.
- **A boundary is asked, never inferred** — same rule as UPGRADE. `Crowding` repaired with an invented
  boundary is worse than `Crowding` left alone, because it now reads as knowledge.
- **Confidence is never raised by pruning.** Surviving a prune is not evidence. A `conjecture` that
  came through untouched is still a `conjecture`.

### Phase 6 — Final report

Report the counts before and after, the four lists, and — separately — **what was removed and where
its residue was written**. Record the pass and its date in `FASES.md`, not in the Lore. **Do not
commit.**

---

## CRYSTALLIZE mode — procedure

> **The premise:** some destinations can accept one attached Markdown but cannot navigate a live
> folder tree. CRYSTALLIZE resolves the project's routing into a portable reading copy. The source
> remains authoritative; the derivative never becomes a second Lore to maintain.

> **The yardstick, and it is not optional.** A third person must be able to **work from this file
> alone**. A crystallization that *routes* to criterion it does not contain is not a crystallization:
> it is a table of absences. **`lore-ecosistema/` travels.** So does every live `lore/`, `canon/`,
> identity and principles the routing table or `scripts/ecosistema.json` names. "Canon only",
> "without the ecosystem", "without the area's craft" are **failures of the mode**, not scopes.
> A smaller export is allowed only when the user **names each routed body to drop**, and the
> preview lists those holes as holes. Silence is the full tree.

### Phase 0 — Resolve target and destination

Identify whether the target is a project, area, or bot and where the derivative will be used: a
chat, an AI project, a notebook, or another Markdown-only reader. Default to a localized filename
such as `lore-crystallized.md` / `lore-cristalizado.md` at a user-approved export location, not
inside `lore/`.

CRYSTALLIZE **does not replace the six live artifacts**. It writes no source artifact and never
changes the instruction contract, `FASES.md`, `lore/`, a bot's canon, or any federated source.

### Phase 1 — Resolve the live routing (the default is the whole routed tree)

Read in this order and record every resolved path. **Do not stop at the bot's own folder.**

1. the target contract (`CLAUDE.md`, `AGENTS.md`, or the bot's equivalent);
2. `FASES.md` or the target's current state artifact;
3. the target's `canon/` (a bot) and its `lore/` — identity, principles, index, thematic modules,
   generated `enrutamiento.md`;
4. **if `scripts/ecosistema.json` exists:** every `fuentes[]` row. For each row, take `incluir`
   (or `lore` + the selected contract + `FASES.md` when `incluir` is absent). Resolve first at
   the **live** `origen` under the manifest `raiz`; if that path does not exist on this machine,
   resolve the same pieces under `lore-ecosistema/{destino}`. A copy that exists and a live tree
   that exists must not both be inlined — live wins, one owner;
5. **if `lore-ecosistema/` exists and a row has no live origin:** walk that copy the same way —
   contract, `FASES.md`, `lore/`, `canon/`, `GOLDEN_PATHS.md`, `fuente/` that is already criterion;
6. inherited area modules the project's `index.md` points to, when the target is a project.

Follow owners, not adjacent directories. Deduplicate the same file reached twice. Preserve
ownership in the headings.

**The test that Phase 1 passed:** every `lore/` named by `enrutamiento.md` or by `ecosistema.json`
has a corresponding set of files on the manifest. If a row is missing, Phase 1 is not done —
do not invent a "canon-only" preview to paper over it.

### Phase 2 — Apply the privacy and noise boundary

These stay **out** by default — they do not help a third person work from the file, or they
are not criterion. The privacy set is still **conversations, secrets, ignored files, undistilled notes**,
plus:

- `notas/`, `notes/` (source, not Lore);
- `scripts/` **except** `scripts/ecosistema.json` (the routing source of truth);
- `LICENSE`, lockfiles, `package.json` of tools, `node_modules/`;
- a previous crystallization nested inside the new one;
- environment files, credentials, private histories, caches;
- binaries, unless the user names one and approves it.

An ignored file is excluded even when a routed directory contains it. For research or personal
bots, do not infer that a conversation is safe because it is Markdown. If the user wants an
excluded source included, name it separately in the preview and require explicit approval.

If a source cannot be redistributed, represent it only by a notice that it was omitted — and
that notice **does not replace** inlining every *other* routed `lore/`.

### Phase 3 — Build the preview and threshold

Before writing, present:

- destination path and intended platform;
- the **exact source manifest**, in output order, with owner and resolved path;
- the count of routed `lore/` trees included vs named by the manifest — they must match;
- every excluded category and its count;
- any source whose visibility is uncertain;
- any routed body the user asked to drop, listed as a hole;
- whether an existing derivative would be overwritten;
- that every inlined file will carry an extract marker, and where the snapshot can be unpacked.

Wait for explicit approval. Approval to crystallize the normal route does not approve an uncertain
or private source, and **does not approve omitting `lore-ecosistema/`**. If the destination already
exists, show that fact and obtain overwrite approval; otherwise choose a new filename.

### Phase 4 — Compose the derivative

Write one Markdown in this order:

1. title and target identity;
2. a warning that this is a generated reading copy;
3. generation date, source root, intended destination, and exact source manifest;
4. the bot or project's own contract, canon, identity and principles;
5. **every routed body**, owner by owner, file by file — identity, principles, modules, state —
   inlined in full, each file wrapped in an extract marker (below);
6. omissions and privacy boundary;
7. regeneration notice.

**Every inlined file is extractable.** Wrap it exactly like this — path relative to the
manifest `raiz`, never a machine-absolute path:

```markdown
<!-- lore:extract path="laboratorio/proyectos/roble/lore/identidad.md" owner="Roble" -->
…file body, unchanged…
<!-- /lore:extract -->
```

- `path` is `{origen}/{rel}` from `ecosistema.json`, or `bots/proyectos/{slug}/{rel}` for the
  bot's own files (contract, canon, `lore/`, `scripts/ecosistema.json`).
- `owner` is the row's `proyecto` (or the bot's name). Optional `destino="..."` records the
  copy slot so unpack can rebuild `lore-ecosistema/` when `copia` is on.
- Do not invent a second wrapping format. The bundled script parses this pair and nothing else.

Preserve the source language and substantive content. Normalize heading levels only so the combined
file remains navigable. Do not summarize away examples, confidence markers, defeats, validity
boundaries, or provenance: those are what let criterion participate rather than merely be named.
**Do not leave a routing table whose destinations are missing from this file.**

The header must say plainly: **this snapshot may become stale**. It must direct the reader back to
the live project tree for updates and warn agents not to write changes back into the derivative.

### Phase 5 — Verify and report

- Compare source hashes or byte counts before and after: CRYSTALLIZE **writes no source artifact**.
- Confirm every manifest entry has one corresponding section or an explicit omission notice.
- **Fail the pass** if `enrutamiento.md` or `ecosistema.json` names a `lore/` that has no inlined
  files in the derivative, unless the user accepted that hole by name in Phase 3.
- Scan the derivative for excluded filenames and known secret markers before reporting success.
- Confirm links that only made sense inside the tree are either expanded with source context or
  labeled as non-portable; do not leave silent broken navigation.
- Confirm every inlined file has one `<!-- lore:extract path="..." owner="..." -->` /
  `<!-- /lore:extract -->` pair, and that no `path` is absolute or contains `..`.
- Report output path, size, source count, excluded count, and the command/request needed to
  regenerate it or extract it. **Do not commit.**

### Phase 6 — Extract (when asked, or as part of a review test)

The snapshot is not only for reading. A third person must be able to unpack it into a folder
whose routing table **resolves**, so their AI session behaves as closely as possible to the
session that crystallized.

**Do not ask the user to write the extractor.** Run the script that ships with this skill:

```text
node <plugin>/skills/transmute-lore/scripts/crystallize.mjs pack --bot <bot-dir> --out <snapshot.md>
node <plugin>/skills/transmute-lore/scripts/crystallize.mjs extract --from <snapshot.md> --out <folder>
```

If the `lore-plugin` CLI is on the path, the same verbs work as `lore-plugin crystallize pack|extract`.
An agent composing by hand still writes the markers in Phase 4; the script is the default for a
bot-sized tree and the only supported unpacker.

Unpack layout — a **mini-root** that mirrors the origin `raiz`:

```text
<out>/
  bots/proyectos/{slug}/     ← the bot (contract, canon, lore/, ecosistema.json)
  {origen}/...               ← every federated body at its live path
  LEEME.md
```

Rewrite every unpacked `scripts/ecosistema.json` so `raiz` is `<out>`. If that manifest has
`copia: true`, also rebuild `{bot}/lore-ecosistema/{destino}` from the same files so the
fallback column of `enrutamiento.md` works.

**Fail extract** if any live path named by the unpacked `enrutamiento.md` is missing under
`<out>`. Same yardstick as Phase 5: a table of absences is not a crystallization.

The extract folder is a derived tree, not a second Lore. Do not write it back over the live
`raiz`. Do not commit it unless the user asks.

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
  precondition; UPGRADE may diagnose and present its threshold in a dirty/read-only tree, then
  requires a clean tree immediately before applying the approved findings.
- **Free notes survive transmutation.** A `notas/` / `notes/` inbox is mined by `obsidian-lore`,
  receives traceable frontmatter, and remains in place. No transmute mode deletes it as cleanup.
- **Do not overwrite old lore/docs without surfacing discrepancies** with code or the description.
- **Threshold**: present the mapping with content in view and wait for approval before writing.
- **Do not auto-commit the target project.** The user reviews the diff and decides.
- **CLEAN never deletes `identidad.md` / `principios.md` / `index.md`** — only thematic modules, and
  only after confirming their criteria already lives in the area (otherwise reported, not deleted).
- **ADD writes new artifacts in the user's language — content and filenames** (fixed names
  selected contract name / `lore/` / `index.md` / `golden-paths.md` and general technical English terms
  excluded) — never in English just because this skill is.
- **TRANSLATE is meaning-preserving**: it changes the language of content and localizable
  filenames, never the criteria or the structure, and never leaves a broken link behind.
  Ambiguous nuances are flagged, not guessed.
- **PRUNE never removes criteria it did not pay for.** No visible scar behind a clue means `Rooted`,
  not `Deadwood` — absence of a visible reason is not evidence of no reason. And **nothing comes out
  without residue**: every removal is a dated line in `FASES.md` saying what it used to be for, or the
  next person to meet that friction re-derives the clue and believes it is new.
- **CRYSTALLIZE is a derivative, never authority.** It follows routed owners, excludes private and
  unrouted material by default, writes no source artifact, and declares that its snapshot may become
  stale. Regenerate it from the live tree instead of editing it as Lore.
- **CRYSTALLIZE inlines every routed body.** A file that only *points* at `lore-ecosistema/` or at
  an area's `lore/` has failed the mode. The yardstick is that a third person can work from the
  snapshot alone. "Without the ecosystem" is not a default and not a convenience.
- **CRYSTALLIZE is extractable.** Every inlined file carries a `<!-- lore:extract path="..." owner="..." -->`
  marker. Unpacking rebuilds a mini-root where `enrutamiento.md` resolves. The extractor ships with
  this skill (`scripts/crystallize.mjs`); the user does not write it.
