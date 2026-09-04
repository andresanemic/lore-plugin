## MYCELIUM mode — can the Lore actually fire? — 2.3.0

> **The premise (H14).** A clue can be well written, in the right module, with its validity boundary
> declared — and still not govern, because no step of any procedure obliges anyone to run it. Its
> symptom is not error: it is **inertia**. The agent does everything it was asked and hands back an
> artifact that violates a written rule, and nobody gets a warning.

This mode does not ask whether criteria is *correct*. It asks whether it can **fire**. The two are
independent, and that is why no amount of re-reading finds this: an artifact coherent with itself and
inert toward the outside survives every review (`H11` — coherence is not a detector).

**It runs quiet, and that is a rule.** The scan is infrastructure, not an event. Never
announce it, never narrate that it ran, never ask anybody to learn a vocabulary in order to be
answered. A clean pass says nothing at all. A pass with findings reports **the findings**, in plain
language, and says what waits on them. The person should be able to use this mode for a year without
knowing its name — and the six outcomes below are distinctions the *repair* needs, never terms the
person has to type.

**Ordinary output has three shapes:** the result in plain language; the decision needed when a
finding blocks progress; silence when the pass is clean. Do not announce entry or exit, loaded
bodies, routes, receipts, hooks or modes. `FASES.md` is state and does not trigger this check; the
same applies to `PHASES.md`. If the user names MYCELIUM or asks for technical detail, exact terms are
allowed.

**A clean review is not a result to report.** When an automatic guard reopens the work, complete the
review and record the accepted state. If there are no findings, return only to the result of the
user's original task. Do not manufacture a network map, a rate, a list of checked clues or a summary
of the review. Mentioning Lore in general or a path under `lore/` is still ordinary use; it does not
make the internal procedure user-facing.

**Exact clean-output shape:** `<the original task result>`. The automatic review contributes zero
words before or after it — not even a one-line confirmation that the check was clean.

An installed lifecycle request to verify and record the state after a user-authorized Lore edit is
part of finishing that edit; it is not a new task and needs no second scope approval. It does not
authorize unrelated changes. Host permission for a tool or file remains a real permission boundary;
if it is required, ask for that permission plainly and nothing else.

**Three triggers, and they are not the same measurement:**

1. **Before a complex task** — the one that matters. You are about to lean on the Lore for real work,
   and you learn which rules cannot fire *before* the deliverable, not after.
2. **Right after installing or updating the kit** — cheap, and it must report honestly. On a fresh
   machine it finds `0 of 0`, and **that green proves nothing**: there is no criteria yet to be
   disconnected. Say so in the same line, or the check manufactures confidence exactly during the
   period when it cannot fail.

   **And it answers a narrower question than "am I current".** This pass — on its own, without
   `UPGRADE` — only asks *does what's here fire?* It says nothing about whether the tree's own Lore
   still matches the kit's current schema: a `lore/` written against an older version can be fully
   connected and materially behind at the same time, because being wired to a step and being current
   are independent properties. Confirmed at ecosystem scale on 2026-08-30: a 43-tree sweep for
   connectivity alone found and fixed six trees, and none of it substituted for asking whether any of
   the 43 needed `UPGRADE` — that question was never run. **`UPGRADE` already runs this scan on both
   ends of its own procedure** (Phase 1c, Phase 6); a standalone connectivity pass after an update is
   the lighter check, not a replacement for `UPGRADE` when the tree is old enough to need one.
3. **On the way out of any pass that wrote Lore.** Not trigger 1 repeated: the pass on the way in
   looks at the Lore that survived; the pass on the way out looks at the Lore *the operation just
   wrote*.

> **Why a second pass, when the first came back green.** Because **a new clue is born disconnected.**
> Isolation does not accumulate with age — it is produced at the rate criteria is written, including
> by an author who knows about `H14` and is writing about `H14`. A pass that writes is a pass that
> manufactures the defect this mode detects, and the scan that ran before it is structurally blind to
> its own output.
>
> **Collapsing the two breaks both.** Skip the entry pass and `PRUNE` deletes what was only waiting
> to form its junction; skip the exit pass and the next deliverable runs against criteria written an
> hour ago and joined to nothing. Findings on the way in block the pass that writes. Findings on the
> way out block **the work**, which is the operation the whole ritual existed to protect.

**The condition that fires trigger 3 by itself is narrow on purpose.** A pass fires the exit scan
when it **wrote criteria and touched routing**: a new clue, a new module, a rewritten `index.md`, a
step added to a procedure. **Both halves are required.** A typo fix touches routing and writes no
criteria; a dated line in `FASES.md` writes state and touches no routing. Neither fires it.

**And it never re-reports what the person already declined.** A declined finding is recorded as
declined and does not come back. Without that rule the mode turns into noise, and a check that is
noise gets skipped — which costs more than the finding it was going to report.

> **Its boundary, and it is why this stops here instead of becoming «the kit's internal auditor».**
> MYCELIUM proves that a rule *can* fire, and nothing else. A name that promises auditing gets read as
> certifying that the criteria is *right*, which is the claim this mode refuses in writing.

**Procedure — one read-only pass, nothing is written:**

0. **Resolve the owning area of every tree the work will touch — before reading a single clue.** A
   session loads the always-on block of *its own* tree and nothing else. Editing a project that lives
   in another area means that area's `lore/` and contract **never enter context**, and nothing warns.
   For each tree in play, name its area root, its `lore/` and its contract, and load them.

0b. **Before the clues: does the body that holds them load at all?** One command, and it is not the
   same question as the rest of this mode:

   ```bash
   npx lore-plugin mycelium bodies          # or: --tree <dir>
   ```

   It reports two links of one chain — **contract → index → thematic module**. A core piece
   (`identidad`, `principios`, `index`) that the contract's always-on block does not name, and a
   module that the loaded index does not reach. **A thematic module absent from the always-on block is
   not a defect**: by design it opens per task from the index, and asking for all of them would turn
   this into noise over any healthy tree.

   **Why it is not covered by the sweep below.** This mode asks, clue by clue, what step forces it to
   run. A `lore/` with no loader produces **no disconnected clue at all** — it is a file the sweep
   opens to read its clues without noticing the real session never opens it. Nine modules can sit
   inert at once and every clue looks fine. It was found in the wild on 2026-08-24 exactly that way,
   by a sweep that reported nothing.

   **And the repair has two opposite outcomes — the tool reports data and decides nothing.** A body
   the contract does not name is either **connected** (name it, so it loads) or **declared out of the
   universe in writing, with its reason** — which is the right answer for a source folder, a registry
   that only records, or a body the contract routes by another path. Guessing *connect* by default is
   how a check starts giving the wrong repair.

   **Resolve the tree first, as in step 0.** This check is a `grep` and a directory read, which makes
   it cheap and therefore easy to point at the wrong place: a sweep that resolves the wrong tree
   returns a perfectly well-formed finding about something else.

   **Its clean result proves less than it reads, so the command now prints its own coverage — 2.4.8.**
   Observed on 2026-09-03: it came back clean before *and* after four dead always-on pointers were
   repaired in the same tree, and said nothing either time. That is the check working correctly inside
   its universe, and it is why the universe stopped being something the reader had to infer.

1. **Take the universe, and it is narrower than the Lore.** Only clues that mandate a **verifiable
   artifact or step**. Criteria that governs continuously while writing — tone of voice, a dialect, a
   register — is satisfied in the text itself and is not in scope. Say what you excluded and why.

   **And the boundary of a clue is outside this universe too, which is the half nobody notices —
   2.4.8.** A validity boundary is a **condition on** a clue, not a clue of its own, so the junction
   this sweep looks for points at the clue and nothing points at the condition. A clue whose boundary
   is written in its first line and perfectly routed comes back **connected**, and nobody was ever
   asked what step evaluates that boundary before the clue gets applied. What makes it a defect rather
   than a gap: **no boundary in any tree can come back isolated**, so the silence is indistinguishable
   from health. It gets **declared** in the report, not inferred from a clean pass.

1b. **Then widen it past `lore/`, because the worst case is not in there.** Sweep the tree's **source
   folders** — `docs/`, `notas/`/`notes/`, `estrategia/`, anything the routing table does not own —
   for imperative language: *never*, *always*, *se publica*, *no se escribe*, *antes de*. Criteria
   that landed in a source folder **cannot be classified at all**, because the universe of step 1
   never contained it. And it is not a rare accident: a source folder is where criteria goes when
   somebody is writing *about* a thing rather than writing the rule, which is most of the time.

   **Check the inputs too, not only the rules.** A distilled document that cites a source — *«derivado
   de cinco capturas»*, *«transcrito del `.docx`»* — is only as auditable as that source is reachable.
   A source outside the repository reads perfectly and cannot be verified by anyone who was not there.

2. For each one, `grep` the procedures that could run it: the host contract, `FASES.md`, the process
   modules, the checklists, the phases of any ritual.

3. **Say what is true of each one, in the plain sentence.** Six outcomes, and the repair differs:

| What the person is told | The repair |
|---|---|
| there is a step that runs it | none — it fires |
| **nothing runs it** | give it a step |
| it names a place, and it is not written there | write the term at the destination it named |
| a step only says «consult this», so nothing comes out of it | make the step produce an artifact |
| it is criteria, and it is not in `lore/` | **two moves** — move it in, *then* give it a step |
| the step exists, in a file this session does not load | name the step in the artifact actually in force |

> **The six do not collapse, and the last three are why.** *«It names a place and it is not written
> there»* and *«a step only says consult this»* are repaired in **opposite directions**, and a wording
> that merged them would send the repair back to the wrong place. The same holds for the last two,
> which look identical in a report: one is criteria sitting where routing cannot reach it, the other
> is a junction that is correct and simply names a file this tree does not load — writing the term
> again at the original destination changes nothing there, because that destination was never the
> problem. Its tell is cheap: the same criteria is reachable from one tree and invisible from
> another, and which tree you are in is decided by where the session was opened.
>
> **Two of these came from the mode failing to find them**, and both were criteria living outside
> `lore/` — one by accident, one deliberately staged. That is why step 1b exists and is not optional.

4. **Report pairs, never a list of clues.** The value is in the junction, so each row carries the one
   that is missing: `clue file:line ⇢ the step that should run it, and does not`. A row without its
   proposed junction is half a finding.

   **And the report declares what it did not look at — 2.4.8.** One clause, at the end, naming the
   **class** of object that stayed outside the universe of step 1: the boundaries of the clues, and
   criteria satisfied in the text itself. It is the exclusion step 1 already asks you to state, now
   carried through to the person who reads the result.

   **It is not a verdict and never becomes one.** It does not say a boundary is missing, wrong or
   owed — it says the sweep did not look. **A count is not the shape of this either:** a census of
   boundaries is a number anybody raises by writing *«boundary: everything»* (`H12` — counting
   artifacts does not measure value), so the raw datum survives as a **debt signal** and never as a
   measure of health.

   **The silence does not change.** A clean automatic pass still contributes zero words, exactly as
   above: this clause rides on a report that was already going to speak, and a tree with nothing
   outside its coverage does not earn a new line.

5. **Propose the junction. Never prune.** A disconnected clue looks exactly like surplus, and deleting
   it is the one move that cannot be undone — what looked like excess was criteria nobody had
   connected yet. MYCELIUM hands the list to the human; `PRUNE` and `save-to-lore` do the writing.

6. **The findings block what comes next.** MYCELIUM runs *before* something — a complex task, an
   install, a sync, a release. Its list is not a report filed away: **until every finding is written
   or explicitly declined by the human, that next operation does not start.** Say so in the same
   breath as the list: *"N findings; the sync waits."*

> **This step exists because the mode failed it on its first run** — findings were reported and the
> session moved on to a sync that would have certified as coherent a tree with an unwritten finding
> in it. **Plugging in a check's *execution* does not connect its *result*.** A scan whose output
> nothing consumes is this mode's own «a step that only says consult this» case.

**Report the rate, never a score.** A percentage invites the one cheap way to raise it: delete the
disconnected clues (`H12` — counting artifacts does not measure value). What is safe to report is
**how recent the disconnections are**, because that cannot be inflated by deleting: the first real
run found four, and **all four were under 48 hours old**. Two of them named the mechanism in their
own text and were disconnected anyway — plugging in is not a virtue of a careful author, it is
something only a scan catches.

**Its premise is an open hypothesis, and the mode says so because the difference changes the
repair.** `H14` stands at `n=1` and carries a **declared rival explanation**: `Crowding` — criteria
that is correct, earned and irrefutable, whose *sum* saturates the deliverable. The two look
identical from outside and pull in opposite directions: `Crowding` is repaired by pruning (`PRUNE`),
and if the same finding is really isolation, pruning destroys the junction nobody had made yet.
**When a finding could be either, say so and hand both readings to the human.**

> *Registers written before this version name these outcomes with the older vocabulary — `Micorrizada`,
> `Aislada`, `Media junta`, `Junta seca`, `Fuera del sustrato`, `Junta a otro árbol`. They stay as
> written: they name what happened, not what governs.*


## Recording the sweep — the receipt

**A sweep that is not recorded did not close the bracket.** When the pass is done — every finding
written as a two-sided junction or declined in writing with its reason — record it:

```bash
npx lore-plugin mycelium receipt          # or: lore-plugin mycelium receipt --tree <dir>
```

It writes receipt v2 to `.lore-mycelium` at the tree root: a digest of the **content** of every Lore
file the tree holds plus `alwaysOnBytes`, the normalized size of criterion bodies loaded for every
task. The Claude Code `Stop` hook and the Codex `SessionStart` + `PostToolUse` pair compare that state
against the tree and intervene when Lore changed and no sweep was recorded since.

If the loaded bodies grew by 8 KiB or more, the command leaves the receipt untouched and asks for
authority in plain language. After approval, record it with `--accept-always-on`. The flag accepts
the expansion only; it does not replace the connection review.

**Why a fact and not a sentence, and this is the correction that 2.4.2 exists for.** Until then the
hook accepted the word *MYCELIUM* appearing anywhere in the agent's prose as evidence that the sweep
had run — including in the sentence *«I have not run MYCELIUM yet»*. It also only saw writes made
through the editing tools, so any Lore written with `sed`, a heredoc or a script was invisible to it.
**Content hashing removes both questions instead of answering them:** how the file was written stops
being a variable, and nobody is asked whether the sweep ran.

**Commit the receipt.** The digest is content-derived, so it is identical on every machine for the
same tree — a teammate who pulls a swept Lore inherits a closed bracket, and one who pulls an unswept
change inherits the block. **The digest** is shared state, not machine state.

**And that claim is about the digest and stops there — 2.4.8.** The receipt also carries the process
announcement's pool (`use-lore`, *Move 3*), which is **usage** state: it counts what was spent on this
copy of the tree, so it is not derived from content and two machines will disagree about it without
either being wrong. Nothing reads it but the pool itself, and the sweep carries it forward untouched.
It is written here because narrowing the sentence costs one line and leaving it wide would make the
receipt claim more than it verified.

**What this does not cover, said here rather than discovered later.** Neither host adapter sees Lore
written in a tree the resolved working directory does not reach. The receipt proves that a state was
accepted; it does not prove the semantic quality of the review that produced it.
