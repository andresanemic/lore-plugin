<!--
Sync Impact Report
Version: 0.0.0 → 1.0.0 (adapt when you copy this over your own constitution)
Modified sections: all — this replaces the default spec-kit template
Deferred TODOs: none
Source: Lore Plugin, plantilla constitucion-puntero. Verified against specify-cli 0.16.5.dev0
(commit bf88c9f) on 2026-08-14, in a real installation over a bot.
Validity boundary: NOT yet exercised in a repository with code where the cycle actually lands,
which is spec-kit's majority case. Treat the delegations as sound and the ergonomics as untested.

Revision 2026-08-15 — case study: this template was applied over a constitution written by hand the
day before, and the comparison ran in both directions. Added here, because the hand-written file had
them and this did not: Principle IV (write and publish authority), the disjoint-channels finding
under Division of authority, and Declared latency. The hand-written file, in turn, took from here the
validity-boundary condition on "Lore wins" and the declared trigger for amendments.

Revision 2026-08-15b — Principle V added (where the feature lands), and the old placeholder moved to
VI. The hand-written file had this too and this did not: it only appeared here as an aside inside a
verification check. It is a principle, because it decides whether this kit belongs in the repository
at all. Levels and their answers are in docs/SPEC_KIT_*.md.
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

### IV. Nothing is committed or published on the cycle's own initiative
`git commit`, `git push`, tags, releases and any form of publication happen only with the owner's
explicit authorization. `/speckit-implement` and every extension hook are subject to this without
exception.

This is the one principle here that does **not** delegate, and it is deliberate. Everything else in
this document points at criteria that already has an owner; this points at nothing, because it
constrains the cycle itself. `implement` is an autonomous write loop, and a border document that
mediates between two kits while saying nothing about who may write is a border with an open gate.
Delegating it would not work either: it is a rule about spec-kit, and `lore/` does not govern
spec-kit's internals — it governs what good work is.

### V. Where the feature lands is declared, and it may not be here
<!-- Keep ONE of the two paragraphs below and delete the other. -->

**In a repository with code:** the cycle lands here. `implement` writes in this repository and
nowhere else; a spec whose work belongs to another repository is not this project's spec.

**In a repository without code — a bot, a lens:** *no feature lands here.* This project runs
`specify → plan → tasks` because this is where the criteria is loaded, and **`implement` runs in the
destination repository the spec names**. A spec without a declared destination does not proceed to
`plan`. When the destination reports the work done, the scar leaves through `save-to-lore` and
`specs/<id>/` is deleted **here** — otherwise this repository accumulates the case memory of work it
did not do.

An area — a folder that groups projects and owns criteria — takes neither paragraph: it should not
have `.specify/` at all. Its unit of work is a clue, not a feature, and its register of state is
`FASES.md`; a `specs/` beside it is a second register in a disjoint channel.

### VI. {{PROJECT_SPECIFIC_PRINCIPLE}}
<!-- Add the delegations this project actually needs — one per body of criteria it answers to.
     Owner and path, no restated content. Delete this comment. -->

## Division of authority

The two kits write through **disjoint channels** — `.specify/` on one side, the contract and `lore/`
on the other — and that is precisely why this document is needed. Neither kit reads the other's
files, so a conflict between them **produces no error: it produces an omission.** Nothing breaks,
nothing warns, and the criteria that should have constrained the cycle simply never reaches it. A
border you would notice does not need to be written down.

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
| spec-kit already in place, adding Lore | `transmute-lore` over the existing criteria, **then** this file | An existing constitution is imported criteria: it goes through TRANSPLANT, and what survives is recorded with where the source loses |
| Both from zero | `create-area` / `create-project`, then `specify init`, then this file | The Lore is the yardstick the arbitration needs. Without it the only available move against an authoritative source is to obey it |

### Declared latency

Skills a kit installs **mid-session do not become invocable immediately**: the runtime registers them
asynchronously, and there is a window in which they exist on disk but not in the session. Verified on
2026-08-14: `speckit-*` was not invocable right after `specify init` and was invocable minutes later,
within the **same** session.

Nothing here may depend on an artifact taking effect on the turn after the one that wrote it — this
constitution included. Write it, then confirm it is live; do not assume.

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

1. **Declared destination** — does the spec say who owns the criteria it will be judged by? In a
   repository that holds no code of its own — a bot, an area — this also means naming the repository
   the work lands in, and a spec without one does not proceed to `plan`.
2. **No copies** — does any section reproduce criteria that already has an owner at another path?
3. **No disguised exceptions** — does any requirement ask to break a clue? If so, what is open is an
   arbitration, not an exception.

### Language

spec-kit's section headings are fixed names and stay as they are. **The content is written in the
language of the destination Lore** — that is where it will be read from.

**Version**: 1.1.0 | **Ratified**: {{DATE}} | **Last amended**: {{DATE}}
