# LEAVE 2.3.3 — fresh-agent contract-application scenarios

These are behavioral-agent tests of how fresh agents interpret and apply a LEAVE recipe to
synthetic fixtures. They are not functional, integration or end-to-end executions: no project was
mutated and no post-LEAVE task was actually run. Static assertions live in `bench/leave.test.mjs`;
they verify that the contract contains its safeguards, not that an agent follows them.

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

The standard control proposed removing only the marker block and the `FASES.md` pointer. It left the
other three junctions alive and refused to broaden the supplied procedure:

> «No amplío el alcance más allá del contrato LEAVE suministrado; por eso no retiro referencias
> fuera del bloque ni automatizaciones no mencionadas.»

Its report could not claim that governance had ended because `CLAUDE.md`, `sub/AGENTS.md` and
`.git/hooks/pre-commit` still loaded or exported Lore. The shared-symlink control avoided editing the
shared target, but proposed replacing the local symlink with a copied file without first presenting
that change as a separate decision. The interrupted-pass control reconstructed final state from disk
but had no approved junction checklist from which to prove the scope of the interrupted run.

The controls varied: one of five independently widened the procedure and found all three residual
junctions; the others either stayed inside the literal contract or crossed the shared-symlink
decision. Correct exit therefore depended on an agent supplying judgment absent from the 2.3.2
contract.

## GREEN — treatment

The standard treatments proposed inventorying all four junctions, showing the exact lines at the
threshold, removing only approved Lore invocations, preserving unrelated hook and contract content,
keeping `lore/` plus plain `enrutamiento.md`, and withholding completion until static and fresh-session
verification had passed.

The shared-symlink treatment proposed mutating nothing and reporting `LEAVE` as not started until the
shared boundary received a separate informed decision. The interrupted-pass treatment proposed
resuming from `leave:partial` and its checklist; it did not treat the missing marker as proof that the
pass had completed.

All four treatments converged on the same proposed removal boundary and completion gate.

## Evidence boundary

These scenarios show that the revised written contract changes fresh-agent decisions under the tested
prompts. They do not demonstrate that a real repository was transformed correctly or that a clue
stayed dormant afterward. The end-to-end behavioral verification procedure is specified in LEAVE and
remains to be executed on a real project.
