# UPGRADE benchmark — Lore Plugin 2.0

Two legacy editorial Lores test whether `transmute-lore UPGRADE` can distinguish `Missing`,
`Superseded`, and `Earned` criterion and present a sufficient HARD-GATE without writing.

## Frozen design

- Domains: Community Manager and News Writing.
- Tasks: 2 fixtures × 2 arms × 2 repetitions = 8 first attempts.
- `cold`: the legacy Lore and target manifest, without the UPGRADE skill.
- `lore`: the same fixture plus the exact `transmute-lore` 2.0 skill copied to `skill/SKILL.md`.
- Model: `gpt-5.6-sol`, medium reasoning.
- Maximum: one controlled repair only for first-attempt failures.
- The fixtures are read-only: success is a diagnosis and HARD-GATE, never file mutation.

The older 1.2.1 run is preserved under `results-v1.2.1/`. The 2.0 evidence lives under
`results/codex/`; they are never combined.

## Audited result

| Metric | Cold | Lore 2.0 |
|---|---:|---:|
| Correct at first attempt | 1/4 (25%) | **4/4 (100%)** |
| Goal reached within two attempts | 4/4 | **4/4** |
| Attempts consumed per unit | 1.75 | **1.00** |
| Observed time per unit | 231.3 s | **216.7 s** |
| Input tokens consumed | 2,107,036 | **845,501** |
| Output tokens consumed | 34,112 | **28,641** |
| Tool calls | 110 | **63** |

Lore 2.0 reached the same four goals with 42.9% fewer attempts, 6.3% less observed time, 59.9%
fewer input tokens, 16.0% fewer output tokens, and 42.7% fewer tool calls. This is a small synthetic
suite, not a universal cost claim.

## Grader audit

The frozen transcripts exposed three phrasing variants the initial regex did not recognize:

1. duplication explained across paragraphs;
2. a limit requested as “you must provide”;
3. `Earned` preceding “five options” across a paragraph break.

Before regrading, those variants were added as failing regression tests in
`grader-regressions.test.mjs`. The revised tests pass 3/3 and both arms were regraded symmetrically.
The raw cut was cold 1/4 and Lore 2/4; the audited cut is cold 1/4 and Lore 4/4. No transcript was
edited.

## Reproduce

```powershell
node bench/run.mjs --suite upgrade --selftest
node --test bench/upgrade/grader-regressions.test.mjs
node bench/run.mjs --suite upgrade --provider codex --model gpt-5.6-sol --reasoning-effort medium -n 2
node bench/run.mjs --suite upgrade --provider codex --regrade
node bench/run.mjs --suite upgrade --provider codex --model gpt-5.6-sol --reasoning-effort medium -n 2 --repair
```

An instant `n/a` with `Access denied` means the CLI launcher was blocked, not that the task failed.
Rerun only `n/a` rows with `--retry-na` after restoring CLI access. Never count launcher failures as
model results.

## Claude replication rule

When Claude Code tokens return, keep tasks, fixtures, target version, grader, repetitions, and
repair limit fixed. Write Claude results to its provider-specific directory; do not replace Codex
results. If a grader defect appears, freeze transcripts, add a failing regression first, regrade
both arms, and publish raw and audited cuts.
