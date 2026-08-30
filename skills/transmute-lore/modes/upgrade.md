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

Read `FASES.md` for LEAVE state before ordinary upgrade diagnosis. `leave:partial` means the exit is
unfinished: stop UPGRADE and resume LEAVE from its approved checklist. A final `leave:` means the
person is asking to re-enter governance. Use its approved junction checklist as the restoration
manifest, re-check each recorded surface against the current tree, and present the routes that can
still be restored as `Missing` findings at the normal threshold. Never recreate a deleted hook,
contract or generated file from memory. A legacy `leave:` with no checklist can restore only the
canonical block and `FASES.md` pointers that can be derived from the current shape; report every
other former junction as unknown.

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

### Phase 1b — Map the tree before reading it (campaign and nested layouts)

Before opening a thematic module, name: every git root in the tree; what the area `.gitignore` hides; where `lore/` actually lives; which contract the user loads. If the work session, the lore body and the git root are three different folders, **name all three**. A diagnosis that opened only the session folder cannot conclude «no Lore».

This is cheap and mandatory on an area tree. A standalone project with one git root still costs one `git rev-parse` and one listing of `lore/`.

### Phase 1c — MYCELIUM entry scan (read-only)

Run **MYCELIUM mode** (`modes/mycelium.md`) over the existing Lore before arbitrating it. A clue
nothing runs is not a `Missing` finding and not a `Superseded` one — it is disconnected, and the
repair is a junction, not a boundary or a correction. Carry its findings into the Phase 3 threshold
alongside the four arbitration kinds so the user decides on all of them in one pass.

### Phase 2 — Arbitrate the existing Lore against the current kit

Before the artifact pass, detect a local `notas/`, `notes/` or `apuntes/` inbox. **Count it and declare the debt.** Mine a note only when it constrains a decision of *this* upgrade. The rest wait for the conditional `save-to-lore/notas.md` function as its own job. **The notes stay in their inbox**; they are source and provenance, never migration debris. UPGRADE must not move, delete or absorb them into `lore/`.

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
complete one**, and every row reads fine on its own.

**On a long index, write the format in one line at the top and leave the old rows.** Rewriting every row is a format pass, not an upgrade: it dominates the diff and does not change a decision. Aligning a short index this pass is already touching is allowed. The next pass arbitrates against the written header, not a majority vote among the rows.

**In a live `.md` that still commands, say threshold (`umbral`), not `HARD-GATE`.** Rename it in `lore/`, the contract and `FASES.md` wherever the sentence still governs a present decision — including this project's own approval step. Leave a dated record, a published version note, a bench fixture, and another skill's `DESIGN.md`. The cut is present vs dated (or vs another kit), not kit vs craft. The same split applies to a superseded mode name (`TRANSPLANT` → `GRAFT` and the next one).

**A missing `identidad.md` or `principios.md` is ADD, not UPGRADE.** Report it. Do not invent the file to complete the six-piece standard.

**Contract paths are checked against the live `FASES.md` registry**, not against the contract's own prose. A pointer that still names the adoption path after the project was internalized is `Stale`.

**In a campaign of several trees, the threshold is per finding class, not per tree.** The first tree presents classes with content in view. Later trees apply accepted classes and only show a class that is new. A boundary the user already refused to invent is not reopened.

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

Show the finding list with content in view: file, kind, what changes, and what rule of the
current version demands it. Nothing is written before approval. The user can accept per finding.

On a **campaign** (several trees against the same kit), present new classes. Classes already accepted on an earlier tree of this campaign are applied, not re-litigated.

### Phase 4 — Upgrade (only after approval)

Re-check `git status` now. Require a clean tree before the first write so the upgrade lands as a
reviewable diff. If it is dirty, keep the approved findings intact, report the blocker and stop
before modifying anything; do not force the user to repeat the diagnosis.

Apply the accepted findings. Three limits that do not move:

- **Confidence is never raised.** A `conjecture` that survived three versions is still a conjecture:
  time is not validation. Only real friction promotes it.
- **A missing boundary is asked, never inferred.** The boundary says where the clue stops being
  true, and that is knowledge from whoever lived it. If the user does not know it either, the clue
  is marked as boundary-less rather than given a plausible one.
- **A paragraph is a paragraph** (kit invariant in `use-lore`). Prose written or rewritten in this
  phase is not hard-wrapped at column 80. Do not unwrap a file this pass is not already touching.

### Phase 5 — Final report

Report per kind: what was added, what was corrected, what was left as `Earned` and why, and what was
left pending because only the user could answer it. Record the version upgraded to, in the project's
`FASES.md` — not in the Lore. **Do not commit.**

### Phase 6 — MYCELIUM exit scan (read-only, mandatory)

UPGRADE writes new boundaries, defeats sections, provenance headers and sometimes new procedure
steps. Run **MYCELIUM mode** (`modes/mycelium.md`) over what Phase 4 wrote: a boundary added to a
clue can move which step is obliged to run it, and a new gate in the contract is a step that needs
its clue named back. UPGRADE is **not complete** until this scan has run and every finding is a
two-sided junction or a written decline.
