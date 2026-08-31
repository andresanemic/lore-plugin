# Writing-skills validation for 2.4.5

## RED: real ordinary-session failure

The baseline is the captured Claude Code session from 2026-08-31 on installed Lore Plugin 2.4.4. It combined exhaustion, a requested stop, pre-existing edits, and an automatic Stop hook. The agent exposed the full hook protocol and then continued classifying the user-facing work with internal vocabulary.

Observed excerpts:

- “Ran 1 stop hook” followed by the complete hook reason.
- “Estas ediciones no son criterio Lore, así que no hay barrido MYCELIUM que correr ni junction que escribir.”
- “El hook cambió su cuenta de 64 a 5 archivos trackeados.”
- “Es un derivado exportado… eso se enruta por transmute-lore.”

The failure was not a missing explanation. It was the wrong output shape: machinery replaced the task result. The same investigation found a mechanical false positive underneath it: the shared file classifier counted `FASES.md` and `PHASES.md` as Lore despite the kit defining them as advancing state.

No subagent baseline was created because this implementation is explicitly inline. The captured fresh failure is the no-guidance control and is stronger evidence than a simulated violation.

## GREEN variant

Ordinary communication has three possible shapes, in this order:

1. the result, when work completed;
2. the decision or approval needed, when blocked;
3. no message, when an automatic check is clean.

Loading, routing, skill selection, mode selection, receipts, brackets, hook counts, and file taxonomy stay internal. Exact identifiers are used only when the user names one or asks for technical detail.

The executable regressions are `bench/silent-language.test.mjs`, `bench/mycelium-guard.test.mjs`, and `bench/codex-guard.test.mjs`. Fresh-host outputs are recorded here only after the candidate is installed for its final Claude Code and Codex checks.
