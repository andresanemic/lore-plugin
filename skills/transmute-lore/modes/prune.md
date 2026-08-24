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

**A quantitative target is an acceptance constraint.** When the user names a percentage, word
count, or size, record the baseline, calculate the expected remainder and declare a narrow
acceptance band before editing; measure again before presenting. The result **must not exceed the
requested cut** and call the excess an improvement. A draft outside the band is rejected, not
rationalized.

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

### Phase 1b — MYCELIUM scan, read-only, before classifying anything

Run **MYCELIUM mode** (`modes/mycelium.md`) over every clue in view. It is a precondition of
Phase 2, not an appendix: a clue nothing runs, misfiled as `Deadwood`, is the one removal this mode
cannot undo, because what looked like surplus was criteria nobody had connected yet.

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

> **Closing a PRUNE pass: run `MYCELIUM` again over what it left.** A removal changes junctions, not
> only volume — the step that ran a surviving clue may have been what came out. The exit pass is the
> only thing that separates *«the corpus weighs less»* from *«the corpus weighs less and still
> fires»*, and only the second one is what PRUNE was for. See `MYCELIUM`, trigger 3.
