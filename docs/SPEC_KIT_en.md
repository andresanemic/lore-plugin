# Lore alongside spec-kit

> [← Back to the README](../README.md) · [Versión en español](./SPEC_KIT_es.md)

GitHub's [spec-kit](https://github.com/github/spec-kit) and Lore Plugin are both kits of criteria,
and they cover **the same failure mode on two different surfaces**: what is missing does not look
missing. spec-kit makes you fill boxes you would have left empty, before building.
Lore does the same for criteria, after. They do not compete.

**Lore does not depend on spec-kit and never will** — nothing on this page is required to use the
kit. If you do not use spec-kit, stop reading.

## The conflict is about authority, not files

Installing spec-kit over a project with Lore touches no file Lore owns: nothing edits `CLAUDE.md`
or `AGENTS.md`, nothing enters `lore/`; everything lands in `.specify/`, `specs/` and its own skills.

That is why the collision is easy to miss: **two kits on disjoint channels do not fail —
they omit.** No error appears — just a cycle that runs without ever consulting the criteria, and
produces a plan that looks complete.

The one thing spec-kit does claim is authority. Its default constitution template says:

> *Constitution supersedes all other practices*

A kit installed this week, declaring itself supreme over criteria paid for with friction before it
existed.

## The fix: a constitution that is a border

Copy [`assets/constitucion-puntero.md`](../assets/constitucion-puntero.md) over the
`.specify/memory/constitution.md` that `specify init` generated empty, and adapt it.

Delegations with an owner and a path, an explicit order of precedence, the three entry scenarios,
and the supremacy clause **revoked in writing** — an omission leaves a hole, and the next template
regeneration fills it back in.

**Lore Plugin does not write this file for you:** automating another kit's constitution would claim
over it the authority the document itself denies it over Lore. You copy it, you adapt it, you own it.

### Order of precedence

```text
canon/  →  lore/ of the project  →  lore/ of the mother area  →  federated Lore at its source
        →  the constitution  →  specs/<id>/
```

The constitution sits **below every `lore/` and above the cycle's artifacts** — it mediates between
the two and governs neither.

### Division of authority

| Governs | Owner |
|---|---|
| The build cycle — specify, clarify, plan, tasks, implement | spec-kit |
| What good work is — standards, prohibitions, scars | your `lore/` |
| Where a finding gets recorded | `save-to-lore` |

Your `lore/` wins against the cycle **within its declared validity boundary**, not everywhere. Where
a clue does not reach you have territory with no criteria yet, not an exception granted by spec-kit —
the difference decides whether you follow the cycle or open an arbitration.

### Who may write

The constitution carries one principle that delegates nothing: **nothing is committed or published on
the cycle's own initiative.** Commits, pushes, tags, releases and any publication happen only with
your explicit authorization, and `/speckit-implement` and every extension hook are subject to it.

It cannot be delegated to `lore/` — it is a rule about spec-kit, outside what `lore/` governs — nor
left out: `implement` is an autonomous write loop, so a border that mediates between two kits while
saying nothing about who may write has an open gate.

## Where a scar goes when the cycle ends

Through `save-to-lore`, into the `lore/` that owns it. **`specs/` is not kept as project history.**

A `specs/` folder kept "just in case" is case memory: preservation without criteria, the distillable
inert inside. This one has longitudinal evidence — see [the case studies](./CASES_en.md).

## Where spec-kit belongs, and where it does not

The earlier question, the one usually skipped: **does this repository want spec-kit at all?** Its
unit of work is a **feature** and its terminal step writes code, so it belongs where a feature lands.

| Level | Its unit of work | spec-kit | What runs |
|---|---|---|---|
| **Area** | a clue — criteria | **no** | Nothing. An area has no deliverable of its own; `specs/NNN-*/` would be a second register of state parallel to `FASES.md` on a disjoint channel — the shape that produces omission, not error |
| **Project** | a feature | **yes** | The whole cycle, `specify → implement`. This is the only level where `implement` has somewhere to land |
| **Bot** | one short instruction | **yes, the thinking half** | `specify → plan → tasks`. **`implement` runs in the destination repository**, which the spec names |

The bot row looks like a compromise and is not: a bot holds federated criteria from several areas
and operates in repositories that hold none of it. The spec belongs written where that criteria is
reachable through routing — a spec says *what good work is here*, and that is the bot's whole content. What a
bot cannot do is finish: nothing to compile, so `implement` crosses over.

**The cost has a clause.** The cycle's artifacts end up in one repository and the code in another,
and Principle III says `specs/` is not kept. So the closing move is explicit and belongs to the bot:
**when the destination reports the implementation done, the bot distils the scar through
`save-to-lore` and deletes `specs/NNN-*/`.** Without it a bot accumulates specs for work it did not
do — case memory under someone else's name, the failure this kit exists to prevent, by the side door.

Two consequences: a spec written in a bot **must** name its destination repository, and one that
does not is not ready for `plan` — that is what the first check below was written for. And there is
exactly **one** constitution to maintain per repository with `.specify/`, the practical reason not to
install at all three levels: every installation is another self-supreme document to revoke in writing.

## Three entry scenarios

| You arrive with | What runs first |
|---|---|
| Lore in place, adding spec-kit | The constitution, **before** the first `/speckit-specify` |
| spec-kit in place, adding Lore | `transmute-lore` over the existing criteria, **then** the constitution — an existing constitution is imported criteria and goes through GRAFT |
| Both from zero | `create-area` / `create-project`, then `specify init` **in the project**, then the constitution |

The middle row matters most: arbitration needs a yardstick. Against an authoritative source with no
written identity to judge it by, the only available move is to obey it.

## Before moving from `specify` to `plan`

1. **Declared destination** — does the spec say who owns the criteria it will be judged by? In a
    repository with no code of its own — bot, area — also name the repository the work lands in.
2. **No copies** — does any section reproduce criteria that already has an owner at another path?
3. **No disguised exceptions** — does any requirement ask to break a clue? Then what is open is an
   arbitration, not an exception.

## Declared latency

Skills a kit installs **mid-session do not become invocable immediately.** The runtime registers them
asynchronously — there is a window where they are on disk but not in the session. Verified on
2026-08-14: `speckit-*` was not invocable right after `specify init`, and was invocable minutes
later — within the **same** session.

So after `specify init`, missing commands are not a missing step: wait or start a new session. Nothing
should depend on a write taking effect the very next turn. Write it, then confirm it is live.

## The optional Claude Code hook

Claude Code can run a `SessionStart` hook injecting text at the start of every session — a
legitimate way to make a Lore louder, and **optional on purpose**:

- It is **provider-specific**: Codex has no equivalent, so a kit relying on it would stop being
  neutral — the contract, which both hosts already load, is the channel that keeps it.
- It is **not the primary mechanism**; the always-on block inside the contract is. The hook adds
  emphasis to something that already works without it.

If you want it, add it to your own `.claude/settings.json`. Lore Plugin does not install it.

> **Never gitignore all of `.claude/`.** It is a common reflex and it takes the installed skills
> with it.

## Validity boundary

Verified against `specify-cli 0.16.5.dev0` (commit `bf88c9f`) on 2026-08-14, in a real installation
over a **bot** — a project whose product is records, not code.

 Delegations and precedence order are sound; the ergonomics of the full
cycle under this border, untested. Treat that as the open question it is.

The same boundary covers the levels table, worth saying plainly because the table reads more
confident than its evidence. The **bot** row was exercised. The **project** row —
the whole cycle in a repository with code — **is reasoning, not experience**: it follows from where
`implement` can land, and nobody has run it. The **area** row is a design decision about a second
register of state, taken from a distilled failure mode rather than an area that tried it and
suffered. Use the table; do not cite it as a result.
