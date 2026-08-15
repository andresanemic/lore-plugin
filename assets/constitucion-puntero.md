<!--
Sync Impact Report
Version: 0.0.0 → 1.0.0 (adapt when you copy this over your own constitution)
Modified sections: all — this replaces the default spec-kit template
Deferred TODOs: none
Source: Lore Plugin, plantilla constitucion-puntero. Verified against specify-cli 0.16.5.dev0
(commit bf88c9f) on 2026-08-14, in a real installation over a bot.
Validity boundary: NOT yet exercised in a repository with code where the cycle actually lands,
which is spec-kit's majority case. Treat the delegations as sound and the ergonomics as untested.
-->

# Constitution — {{PROJECT_NAME}}

> **This is a border, not a copy.** It exists so that two kits of criteria can live in the same
> repository without either silently governing the other. It holds delegations and an order of
> precedence; it holds no criteria of its own.
>
> Copy this file over the `.specify/memory/constitution.md` that `specify init` generated, and
> replace the bracketed parts. Lore Plugin does **not** write it for you: automating the
> constitution of another kit would be claiming over it the authority this document denies it over
> Lore.

## Core Principles

Each principle names an owner and a path. **None of them reproduces the criteria it delegates** — a
copy here is a second source that drifts, and the drifted one wins the day somebody reads only this
file.

### I. Criteria is delegated, never restated
What is good work here is decided by `{{LORE_PATH}}`. This document points at it. If a principle
below ever grows an example, a rule or a clue, that content belongs in the Lore and must move.

### II. The cycle is ephemeral, the criteria persists
`specs/` holds the artifacts of one cycle. They are working material with an end date. `lore/` holds
what survives the cycle, and it has no end date.

### III. A scar leaves the cycle through `save-to-lore`
When a cycle produces a lesson, it exits into the `lore/` that owns it. **`specs/` is not kept as
project history.** A `specs/` folder retained "just in case" is case memory: it satisfies the urge to
preserve without producing criteria, and what was distillable stays inert inside it.

### IV. {{PROJECT_SPECIFIC_PRINCIPLE}}
<!-- Add the delegations this project actually needs — one per body of criteria it answers to.
     Owner and path, no restated content. Delete this comment. -->

## Division of authority

| Governs | Owner | Loses when |
|---|---|---|
| The build cycle — specify, clarify, plan, tasks, implement | spec-kit | it contradicts a clue in `lore/` |
| What good work is — standards, prohibitions, scars | `{{LORE_PATH}}` | never, within its declared validity boundary |
| Where a finding is recorded | `save-to-lore` | never |
| The order between the two | this document | it contradicts `lore/` |

## Entry scenarios

| You arrive with | What runs first | Why |
|---|---|---|
| Lore already in place, adding spec-kit | Copy this constitution **before** the first `/speckit-specify` | The default template declares itself supreme; running a cycle first means the cycle is governed by criteria nobody arbitrated |
| spec-kit already in place, adding Lore | `transmute-lore` over the existing criteria, **then** this file | An existing constitution is imported criteria: it goes through ARBITRATE, and what survives is recorded with where the source loses |
| Both from zero | `create-area` / `create-project`, then `specify init`, then this file | The Lore is the yardstick the arbitration needs. Without it the only available move against an authoritative source is to obey it |

## Governance

### Order of precedence

Highest to lowest, skipping the bodies this project does not have:

```text
canon/  →  lore/ of the project  →  lore/ of the mother area  →  federated Lore at its source
        →  this constitution  →  specs/<id>/
```

**The constitution sits below every `lore/` and above the cycle's artifacts.** That is its place: it
mediates between the two and governs neither.

### The revoked clause

spec-kit's default template carries, under Governance:

> *Constitution supersedes all other practices*

**That clause is revoked here, explicitly and in writing.** Omitting it is not enough: an omission
leaves a hole, and the next template regeneration fills it back in.

It is revoked because it is imported criteria that did not survive arbitration against this Entre's
purpose. A kit installed this week cannot declare itself supreme over criteria that was paid for
with friction before it existed.

### Amendment

This document is amended when the border between the two kits moves — not when a rule inside either
of them changes. A change to what good work is belongs in `lore/` and needs no amendment here.

### Verification before moving from `specify` to `plan`

Three checks, all cheap:

1. **Declared destination** — does the spec say which repository it lands in and who owns its
   criteria?
2. **No copies** — does any section reproduce criteria that already has an owner at another path?
3. **No disguised exceptions** — does any requirement ask to break a clue? If so, what is open is an
   arbitration, not an exception.

### Language

spec-kit's section headings are fixed names and stay as they are. **The content is written in the
language of the destination Lore** — that is where it will be read from.

**Version**: 1.0.0 | **Ratified**: {{DATE}} | **Last amended**: {{DATE}}
