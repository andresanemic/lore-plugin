<!--
Sync Impact Report
Version: 0.0.0 → 1.0.0
Modified sections: all — replaces the default spec-kit template
Source: Lore Plugin, assets/constitucion-puntero.md v1.1.0
Applied: 2026-08-15, on the kit's own repository.
Note: this is the FIRST time the pointer constitution is applied to a repository WITH code —
the exact case the 2.1.0 release notes declared as "not exercised".
-->

# Constitution — Lore Plugin

> **This is a border, not a copy.** It exists so two kits of criteria can live in the same repository
> without either silently governing the other. It holds delegations and an order of precedence; it
> holds no criteria of its own.

## Core Principles

Each principle names an owner and a path. **None of them reproduces the criteria it delegates** — a
copy here is a second source that drifts, and the drifted one wins the day somebody reads only this
file.

### I. Criteria is delegated, never restated

What good work is here is decided by **`../../lore/`** — the Lore of the *plugins* area, which owns
this project. This document points at it.

> **This project has no `lore/` of its own, and that is a live question rather than a settled
> decision.** The kit's *content* is its skills: writing a `lore/` that restates them would be the
> second source this constitution exists to prevent. But the criteria about **how the kit is built**
> — what earns a version, when a change is product and when it is a scar — has no home here today.
> Part of it lives in `bots/proyectos/bot-lus-lore/lore/`, which is a different owner for a different
> purpose. Recorded on 2026-08-15, unresolved on purpose: it is decided with `create-project` or
> `save-to-lore`, never by this file.

### II. The cycle is ephemeral, the criteria persists

`specs/` holds the artifacts of one cycle. They are working material with an end date. The Lore holds
what survives the cycle, and it has no end date.

### III. A scar leaves the cycle through `save-to-lore`

When a cycle produces a lesson, it exits into the Lore that owns it. **`specs/` is not kept as
project history.** A `specs/` folder retained "just in case" is case memory: it satisfies the urge to
preserve without producing criteria, and what was distillable stays inert inside it.

### IV. Nothing is committed or published on the cycle's own initiative

`git commit`, `git push`, tags, releases and any form of publication happen only with the owner's
explicit authorization. `/speckit-implement` and every extension hook are subject to this without
exception.

This is the one principle here that does **not** delegate, and it is deliberate. `implement` is an
autonomous write loop, and a border document that mediates between two kits while saying nothing
about who may write is a border with an open gate.

**It bites harder in this repository than anywhere else:** this is a published npm package and a
Claude Code marketplace. A tag pushed on the cycle's initiative is not an internal mistake, it is a
release.

### V. Where the feature lands is declared, and it may not be here

**In a repository with code:** the cycle lands here. `implement` writes in this repository and
nowhere else; a spec whose work belongs to another repository is not this project's spec.

The complement is already exercised and holds: `bot-lus-lore` runs `specify → plan → tasks` and names
this repository as the destination. When that happens, the spec is **read** here and `implement`
runs here, while the bot deletes its `specs/<id>/` once the work is reported done.

### VI. The skills are the product, and the spec has to know what the version is

A change to a `SKILL.md` is a change to the shipped product, not an internal refactor. It has a
public name, a documented behaviour and installed users.

**Therefore: if a change alters what the version *is* — a capability, a public name, a vocabulary of
the kit — the spec is updated before the bump, never after.** Written on 2026-08-15 after the
opposite happened: version 2.1 gained a new mode, a renamed mode and a kit-wide vocabulary change
while its spec kept describing two capabilities and mentioning none of the three. Nothing failed and
nothing warned, because a stale spec looks exactly like a current one.

The cheap check, because reading does not reveal it: **count the capabilities the spec declares
against the ones the changelog announces.**

### VII. What this kit measures about itself is arbitrated by its two custodians

The benchmark in `bench/` is not only this product's. The same measurement lives as a case in the LUS
research programme with a different purpose. The rule that governs who closes the figure is written
in `bench/README.md` and is not restated here.

## Division of authority

The two kits write through **disjoint channels** — `.specify/` on one side, `CLAUDE.md` and the area
Lore on the other — and that is precisely why this document is needed. Neither kit reads the other's
files, so a conflict between them **produces no error: it produces an omission.**

| Governs | Owner | Loses when |
|---|---|---|
| The build cycle — specify, clarify, plan, tasks, implement | spec-kit | it contradicts a clue in the Lore |
| What good work is — standards, prohibitions, scars | `../../lore/` | never, within its declared validity boundary |
| Where a finding is recorded | `save-to-lore` | never |
| The order between the two | this document | it contradicts the Lore |

**The omission runs both ways.** The cycle can complete without ever consulting the criteria, and the
criteria can complete without ever consulting the cycle. Both were observed on this repository. The
second is what Principle VI exists to stop.

## Governance

### Order of precedence

Highest to lowest:

```text
lore/ of the plugins area  →  this constitution  →  specs/<id>/
```

**The constitution sits below the Lore and above the cycle's artifacts.** That is its place: it
mediates between the two and governs neither.

### The revoked clause

spec-kit's default template carries, under Governance:

> *Constitution supersedes all other practices*

**That clause is revoked here, explicitly and in writing.** Omitting it is not enough: an omission
leaves a hole, and the next template regeneration fills it back in.

It is revoked because it is imported criteria that did not survive arbitration against this Entre's
purpose. A kit installed this week cannot declare itself supreme over criteria that was paid for with
friction before it existed — and in this repository the point is not academic: the criteria this kit
distributes is older than the cycle now installed beside it.

### Amendment

This document is amended when the border between the two kits moves — not when a rule inside either
of them changes. A change to what good work is belongs in the Lore and needs no amendment here.

### Verification before moving from `specify` to `plan`

1. **Declared destination** — does the spec say who owns the criteria it will be judged by?
2. **No copies** — does any section reproduce criteria that already has an owner at another path?
3. **No disguised exceptions** — does any requirement ask to break a clue? If so, what is open is an
   arbitration, not an exception.

### Language

spec-kit's section headings are fixed names and stay as they are. **The content is written in the
language of the destination Lore** — English here, matching the kit.

**Version**: 1.0.0 | **Ratified**: 2026-08-15 | **Last amended**: 2026-08-15
