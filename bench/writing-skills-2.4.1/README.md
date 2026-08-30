# 2.4.1 — writing-skills check on the changed skill prose

Eight skill files changed (`+86 / −7`). The change is a wording hardening, not new capability, so the
`writing-skills` pass is a register-and-constraint review of the added lines, not a scenario.

## Files and what was added

| File | Addition |
|---|---|
| `save-to-lore/SKILL.md` | opening bracket blockquote; *Closing either mode* reworded to a "done means" gate; one invariant |
| `transmute-lore/SKILL.md` | one blockquote at the mode dispatch; one invariant |
| `transmute-lore/modes/add.md` | Phase 7b (exit scan) |
| `transmute-lore/modes/clean.md` | Phase 1b (entry scan), Phase 5 (exit scan) |
| `transmute-lore/modes/translate.md` | Phase 5 (exit scan) |
| `transmute-lore/modes/upgrade.md` | Phase 1c (entry scan), Phase 6 (exit scan) |
| `transmute-lore/modes/leave.md` | static verification renamed as LEAVE's exit scan + one finding rule |
| `use-lore/SKILL.md` | already named all three triggers; two sentences aligning its wording to the closing gate |

## Review

- **Register match.** The additions use the same devices the surrounding corpus uses — em-dash
  asides, "not X, it is Y", short imperative closers. This is deliberate: `save-to-lore` itself
  carries the observed case of a cleanup tool that flags exactly those as machine tells and would
  have erased this corpus's voice. The new lines were checked against the paragraphs they sit next
  to (PRUNE's Phase 1b and closing block are the reference shape) and read as the same hand.
- **Constraint, not decoration.** Every added sentence changes a future decision: it names a step
  that must run, or reframes "done" so a deferral fails the check. No line restates what another
  line already says. The one risk of redundancy — the bracket appears in the opening blockquote,
  the *Closing either mode* section, and an invariant — is the kit's existing pattern for a
  load-bearing rule (see the junction-on-both-sides rule, stated three times in `save-to-lore`),
  and the three placements are read at different moments: setup, mid-pass, and final audit.
- **No hedging or throat-clearing.** The additions open on the imperative ("Set up two todos", "Run
  **MYCELIUM mode**", "Done means the exit scan ran"), not on a frame ("It is worth noting that…").
- **Active voice, present tense.** Consistent with the mode files.
- **Length.** `transmute-lore/SKILL.md` stays under the 3000-word dispatcher ceiling
  (`skill-consistency.test.mjs` guard passes). `save-to-lore/SKILL.md` gained ~35 lines; it carries
  no ceiling and the addition is proportionate to the failure it closes.

## Static guards

`scripts/skill-consistency.test.mjs` gained two tests: the bracket wording is present in
`save-to-lore` and every writing mode, and the `Stop` hook is declared and its script exists.
`bench/mycelium-guard.test.mjs` covers the hook's block / no-block / loop-guard / fail-open paths.
`npm test`: 158/158.

## Fresh-agent scenario

Behavioral evidence that the reworded skill makes the exit scan fire unprompted is in
[`../exit-mycelium-2.4.1/README.md`](../exit-mycelium-2.4.1/README.md), run on Claude Code and Codex.
