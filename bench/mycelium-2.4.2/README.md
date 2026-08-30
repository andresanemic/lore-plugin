# Evidence — 2.4.2, the exit bracket detects what it said it detected

RED → GREEN, run on 2026-08-30. Unlike the 2.4.1 evidence, this one is **not** a fresh-agent scenario,
and the choice is deliberate: both defects below are **deterministic properties of the hook's code**,
so a unit-level scenario proves them exactly and a behavioural run would only add noise. What a fresh
agent could show — whether it *complies* once blocked — is a different question and is not what 2.4.2
claims to fix.

## RED — four scenarios failing against 2.4.1

Run against the published `hooks/mycelium-guard.mjs` of 2.4.1, before any code changed.

| | Scenario | Result |
|---|---|---|
| **R1** | Lore written with a python heredoc, no sweep after | ✖ `stdout: ''` — no block |
| **R1b** | Same with `sed -i`, with `cat > … <<EOF`, and with the `head`/`cat`/`mv` pattern over `FASES.md` | ✖ all three |
| **R2** | The agent edits Lore with `Edit` and writes *“I have not run MYCELIUM yet: connecting the junction is left to a future `transmute-lore` pass”* | ✖ no block |
| **R2b** | The mode merely mentioned while discussing something else | ✖ no block |

In all four the output was **empty**: the guard never reached the point of deciding whether to block.

**R2 is not hypothetical.** It is a transcription of the incident that motivated 2.4.1 — `save-to-lore`
wrote a module, declared the junction a *“future `transmute-lore` pass”*, and stopped. **The hook
published to close that incident does not stop it**, because the sentence that declares the failure
contains the word.

### Why each one failed

- **R1** — `mycelium-guard.mjs:47` counted only `Edit`/`Write`/`MultiEdit`/`NotebookEdit`. Anything
  written with a script left `lastLoreWriteIdx` at `-1` and the guard exited silently at line 85. Not
  an edge case: Claude Code's own session prompt instructs *“make file changes with sed, heredocs, or
  short scripts, rather than using the dedicated Read, Edit, or Write tools”*. **The guarantee was
  blind exactly where the host pushes you to work.**
- **R2** — `:55` defined the evidence that the sweep ran as a regular expression over **any** assistant
  text block. It could not tell *“I ran it”* from *“I did not run it”*: both contain the word.

### And the second defect was specified, not overlooked

`bench/mycelium-guard.test.mjs:46` of 2.4.1 was a **green** test asserting that the hook does *not*
block after the assistant says *“Running the MYCELIUM exit sweep: 0 findings.”* Stated plainly: **the
guard trusted the agent's report.** So 2.4.2 does not add a test here — it removes the question the
test was guarding.

## GREEN — the mechanism, and why this one

Detection is by **content hash of the tree's Lore files**, compared against a receipt
(`.lore-mycelium`) written by `lore-plugin mycelium receipt`.

Three candidate mechanisms were considered and two were discarded **for reasons already recorded
before they were proposed**:

| Mechanism | Why not |
|---|---|
| Tool names in the transcript | Blind to every write made by script — the R1 defect itself |
| `git status` | **`git` is not a requirement of this kit** (only of the clone install route), and Lore trees without it exist. A guard that depends on it would do nothing on such a tree, **and would do nothing silently** — the exact failure mode being fixed. Replacing a transcript blind spot with a `git` blind spot is a relocation, not a repair |
| **Content hash + receipt** | No `git`, no session-start hook, no transcript, no tool names. Only the filesystem, which is the one floor both hosts and every user share |

**It dissolves the second defect instead of patching it.** The agent is never asked whether the sweep
ran, so what it says stops mattering.

**The receipt is derived, not declared.** Its validity is a function of the tree's current state, not
of a date someone wrote — which is the correction absorbed from a live case the same day: a `FASES.md`
declaring *“`notas/` 12 files: debt counted”* when there were 22. A correct junction whose content had
aged, reading as current.

**Bootstrapping:** the first run writes the receipt, so adopting the kit on an existing tree does not
produce a standing block.

### Two false positives, found and repaired during the phase

Both are the same class — **a copy of a Lore is not the Lore of the tree that contains it**:

- **84 benchmark fixtures** were being counted as the kit's own criteria → now **0**.
- **41 backups of *other* trees' Lore**, left by an earlier sweep under `informes/_backup/`, were being
  counted as a bot's criteria → **51 → 10**.

The first fix excluded them by folder names taken from one ecosystem, which is generalising from `n=1`.
The shipped version excludes `fixtures` and `_backup`, **with the boundary written down**: the walk
cannot tell an arbitrary copy from an original, so it relies on naming conventions, and a tree that
keeps copies under another name will see them counted.

## GREEN — the question MYCELIUM did not have

`lore-plugin mycelium bodies` asks two links of one chain: **contract → index → thematic module**.

The mode asks, clue by clue, what step forces it to run. It never asked whether the **body** holding
them loads. A `lore/` with no loader produces **no disconnected clue at all**, so nine modules can sit
inert while every clue looks fine — which is exactly what a sweep over `bot-lus-lore` missed on
2026-08-24.

**Its universe was narrowed during the phase, because the first version tripped the abort criterion.**
Asking about every module reported five findings on one tree, three on another, one on a third — **all
of them correct**: a thematic module outside the always-on block is not a defect, it opens per task
from the index. That is noise over any healthy tree, and a check that annoys gets turned off, and a
check that is off protects nothing. Narrowed to the core pieces, it is **silent on all nine trees of
the ecosystem and reports one true positive**.

**It returns data, never a verdict**, and a test enforces it: the returned object may not contain
“orphan”, “connect” or “fix”. The two repairs are opposite — connect it, or declare it out of the
universe in writing — and which one applies is not something a directory walk knows.

## Numbers

`npm test`: **158 → 179**, all green. The guard's own file went from 7 transcript-based tests to 17
filesystem-based ones, plus 11 new for the body question.

## What this does not cover, stated here rather than discovered later

- **Codex does not run hooks.** There the guarantee is carried by the mode's text and the writing
  skills' closing gate.
- **Neither the hook nor the skills see Lore written without invoking any skill in a tree the working
  directory does not reach** — a session editing another tree's Lore is outside the bracket entirely.
