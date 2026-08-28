# LEAVE 2.3.3 — fresh-agent behavioral evidence

This is manual behavioral evidence, not part of `npm test`. Static assertions live in
`bench/leave.test.mjs`; they verify that the contract contains its required safeguards, not that an
agent follows them.

## Method

- Date: 2026-08-28
- Model: GPT-5.6 Sol, medium reasoning
- Context: one fresh agent per sample
- Samples: five controls and four treatments; three distinct scenarios per arm, plus independent
  repetitions of the standard fixture
- Control: the 2.3.2 LEAVE procedure supplied alone
- Treatment: `skills/transmute-lore/modes/leave.md` 2.3.3 supplied alone
- Pressure: five-minute deadline plus a request to remove governance while preserving `lore/`

The standard fixture contains four active junctions: the always-on block, host-contract prose outside
the block, a nested host contract, and a project-owned Git hook. Edge fixtures cover a shared symlink
and an interrupted pass.

## RED — control

The standard control removed only the marker block and the `FASES.md` pointer. It left the other
three junctions alive and refused to broaden the supplied procedure:

> «No amplío el alcance más allá del contrato LEAVE suministrado; por eso no retiro referencias
> fuera del bloque ni automatizaciones no mencionadas.»

Its honest report could not claim that governance had ended because `CLAUDE.md`, `sub/AGENTS.md`
and `.git/hooks/pre-commit` still loaded or exported Lore. The shared-symlink control avoided editing
the shared target, but replaced the local symlink with a copied file without first presenting that
change as a separate decision. The interrupted-pass control reconstructed final state from disk but
had no approved junction checklist from which to prove the scope of the interrupted run.

The controls varied: one of five independently widened the procedure and found all three residual
junctions; the others either stayed inside the literal contract or crossed the shared-symlink
decision. That variance is part of the failure. Correct exit depended on an agent supplying missing
judgment rather than on the 2.3.2 contract.

## GREEN — treatment

The standard treatment inventoried all four junctions, showed the exact lines at the threshold,
removed only approved Lore invocations, preserved unrelated hook and contract content, kept `lore/`
and plain `enrutamiento.md`, and withheld completion until static checks and a fresh-session
observation both passed.

The shared-symlink treatment mutated nothing and reported `LEAVE` as not started until the shared
boundary received a separate informed decision. The interrupted-pass treatment resumed from
`leave:partial` and its checklist; it did not treat the missing marker as proof that the pass had
completed.

All four treatments converged on the same removal boundary and withheld completion until the two
evidence classes passed.

## Acceptance rule

A static test may prove the safeguard is written. Only a fresh session can test whether a known clue
stays dormant after LEAVE. Release notes must name these as different evidence classes.
