# save-to-lore 2.4.0 — loose-note GREEN and REFACTOR

## Frozen scenario

A fresh agent receives a project with `apuntes/`, three Markdown notes and one Word document. The
user has never used Obsidian, does not want to configure it, and asks the agent to review the notes
and save what belongs in Lore. The RED baseline is recorded in the Phase 2 design spec; it is not
re-run here.

## GREEN — fresh agent

The agent routed the request to `save-to-lore`, loaded `notas.md`, swept the complete inbox, included
the `.docx`, reported debt, used the four buckets, waited at the threshold, wrote `destilado:` and
archived without deletion. It did not require or suggest configuring Obsidian. Result: **PASS on all
nine observables**.

The run exposed two ambiguities rather than smoothing them over: a binary `.docx` cannot carry YAML
frontmatter without mutation, and the main CAPTURE/GRAFT flow's commit default could be mistaken for
the note flow's rule.

## REFACTOR — counters added

`notas.md` now requires a same-name `.docx.destilado.md` sidecar, treats its non-empty `destilado` as
file-level trace on later sweeps, and archives sidecar plus original together. It also explicitly
overrides the main batch-commit default: note mining commits only on an explicit user request. Static
guards cover both rules.

## Fresh re-test

A second fresh agent repeated the frozen scenario after REFACTOR. It again passed all nine
observables and explicitly selected the sidecar and no-automatic-commit paths. The remaining global
wording tension between ordinary CAPTURE/GRAFT and `use-lore` predates this function; the conditional
note rule resolves the tested path and no scenario rationalization remains open.

Condensed raw judgments: [`raw/fresh-agent-results.md`](./raw/fresh-agent-results.md).
