# Fresh-agent results — 2026-08-28

## GREEN sample

**Verdict: PASS, with one real `.docx` ambiguity.** The agent invoked `save-to-lore` and its
conditional note function; swept the whole four-file folder; extracted the Word document while
preserving the original; reported debt; classified experience, state, imported criteria and
information/noise; waited for approval; wrote `destilado:`; archived without deletion; and never
asked for Obsidian. It rejected “only one folder,” “already read the meeting note,” and “Word files
do not count because they lack YAML.” It could not close a binary source traceably without either
mutating it or inventing a sidecar, so REFACTOR was required.

## Post-REFACTOR sample

**Verdict: PASS.** A second fresh agent followed the same procedure and closed the Word source with
`<name>.docx.destilado.md`, treating the sidecar as the idempotency marker and archiving it together
with the untouched binary. It also applied the conditional rule that note mining makes no commit or
push unless explicitly requested. All nine observables passed; neither earlier ambiguity remained
on the tested route.
