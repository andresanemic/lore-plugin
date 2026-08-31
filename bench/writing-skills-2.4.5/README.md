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

## First fresh Claude Code attempt: still RED

The first 2.4.5 worktree session hid the raw hook reason but answered the original one-line edit with “Corrí la revisión de conexiones (micelio)”, a network description, two clue-to-route rows, and a clean-rate summary. This proved that silencing the adapter was insufficient: a clean internal review could still replace the user's result with machinery narration.

The revised contract makes two distinctions explicit. A path under `lore/` is ordinary work and does not activate the technical-name exception. When an automatic guard reopens work and the review is clean, the agent records the state silently and returns only to the original task result; a network map, rate, checked-clue list, or review summary is not produced.

## Second fresh Claude Code attempt: still RED

With the clean-review rule present, Claude still narrated the review and then asked for permission to reach the receipt command. This separated a real host permission boundary from conversational noise: when permission is missing, only the permission is relevant.

## Third fresh Claude Code attempt: still RED

With tool permission available, Claude completed the edit but refused the hook request because “do not describe this control” sounded like an instruction to hide actions and because it treated recording the already-authorized edit as new scope. The wording was wrong. The hook now asks positively to check the change, record the local state if sound, and finish with the response already intended. The skill also states that closing the state of an authorized Lore edit is normal completion, never authority for unrelated changes.

## Fourth fresh Claude Code attempt: near miss

Claude completed and recorded the review, avoided every internal identifier, and ended with the requested result. It still prefixed that result with a one-line clean-check confirmation ending in “Nada más que conectar.” The final recipe is therefore exact: after a clean automatic review, the response contains the original task result and the review contributes zero words before or after it.

## Fifth fresh Claude Code attempt: GREEN

With the exact recipe loaded and tool permission available, Claude edited the file, completed the automatic closure, and its entire agent response was: “Línea agregada a `lore/principios.md`.” No skill, mode, hook, receipt, network, route, or review language appeared.

The explicit technical exception also passed in a separate fresh session. Prompted with “Explica en una sola frase qué hace MYCELIUM”, Claude used the exact `MYCELIUM` and `transmute-lore` identifiers and explained the operation in one sentence. This is the intended boundary: ordinary use stays quiet; a named technical request remains answerable.
