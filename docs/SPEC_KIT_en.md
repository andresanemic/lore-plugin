# Lore alongside spec-kit

> [← Back to the README](../README.md) · [Versión en español](./SPEC_KIT_es.md)

GitHub's [spec-kit](https://github.com/github/spec-kit) and Lore Plugin are both kits of criteria,
and they cover **the same failure mode on two different surfaces**: what is missing does not look
missing. spec-kit makes you fill boxes you would have left empty without noticing, before building.
Lore does the same for criteria, after. They do not compete.

**Lore does not depend on spec-kit, and never will.** Nothing on this page is required to use the
kit. If you do not use spec-kit, stop reading here.

## The conflict is about authority, not files

Installing spec-kit over a project with Lore touches no file Lore owns. It does not edit `CLAUDE.md`
or `AGENTS.md`, it does not enter `lore/`. Everything lands in `.specify/`, `specs/` and its own
skills.

Which is exactly why the collision is easy to miss: **two kits on disjoint channels do not fail —
they omit.** No error appears. What appears is a cycle that runs without ever consulting the
criteria, and produces a plan that looks complete.

The one thing spec-kit does claim is authority. Its default constitution template says:

> *Constitution supersedes all other practices*

A kit installed this week, declaring itself supreme over criteria that was paid for with friction
before it existed.

## The fix: a constitution that is a border

Copy [`assets/constitucion-puntero.md`](../assets/constitucion-puntero.md) over the
`.specify/memory/constitution.md` that `specify init` generated empty, and adapt it.

It holds delegations with an owner and a path, an explicit order of precedence, the three entry
scenarios, and the supremacy clause **revoked in writing** — not omitted. An omission leaves a hole,
and the next template regeneration fills it back in.

**Lore Plugin does not write this file for you.** Automating another kit's constitution would be
claiming over it the authority the document itself denies it over Lore. You copy it, you adapt it,
you own it.

### Order of precedence

```text
canon/  →  lore/ of the project  →  lore/ of the mother area  →  federated Lore at its source
        →  the constitution  →  specs/<id>/
```

The constitution sits **below every `lore/` and above the cycle's artifacts**. It mediates between
the two and governs neither.

### Division of authority

| Governs | Owner |
|---|---|
| The build cycle — specify, clarify, plan, tasks, implement | spec-kit |
| What good work is — standards, prohibitions, scars | your `lore/` |
| Where a finding gets recorded | `save-to-lore` |

Your `lore/` wins against the cycle **within its declared validity boundary**, not everywhere. Where
a clue does not reach, what you have is not an exception granted by spec-kit — it is territory with
no criteria yet, and the difference decides whether you follow the cycle or open an arbitration.

### Who may write

The constitution carries one principle that delegates nothing: **nothing is committed or published on
the cycle's own initiative.** Commits, pushes, tags, releases and any publication happen only with
your explicit authorization, and `/speckit-implement` and every extension hook are subject to it.

It cannot be delegated to `lore/`, because it is a rule about spec-kit and `lore/` does not govern
spec-kit's internals — it governs what good work is. And it cannot be left out: `implement` is an
autonomous write loop, so a border that mediates between two kits while saying nothing about who may
write is a border with an open gate.

## Where a scar goes when the cycle ends

Through `save-to-lore`, into the `lore/` that owns it. **`specs/` is not kept as project history.**

A `specs/` folder retained "just in case" is case memory: it satisfies the urge to preserve without
producing criteria, and what was distillable stays inert inside it. This one has longitudinal
evidence behind it — see [the case studies](./CASES_en.md).

## Where spec-kit belongs, and where it does not

Before the entry scenarios there is an earlier question, and it is the one usually skipped: **does
this repository want spec-kit at all?** The answer follows from a single fact — spec-kit's unit of
work is a **feature**, and its terminal step writes code. So it belongs where a feature lands.

| Level | Its unit of work | spec-kit | What runs |
|---|---|---|---|
| **Area** | a clue — criteria | **no** | Nothing. An area has no deliverable of its own, and `specs/NNN-*/` would be a second register of state running parallel to `FASES.md` in a disjoint channel — the exact shape that produces omission rather than error |
| **Project** | a feature | **yes** | The whole cycle, `specify → implement`. This is the only level where `implement` has somewhere to land |
| **Bot** | one short instruction | **yes, the thinking half** | `specify → plan → tasks`. **`implement` runs in the destination repository**, which the spec names |

The bot row is the one that needs explaining, because it looks like a compromise and is not. A bot
holds federated criteria from several areas and operates in repositories that hold none of it. The
spec is worth more written where that criteria is already loaded than written where the code happens
to live — a spec is a document about *what good work is here*, and that is the bot's whole content.
What a bot cannot do is finish: it has nothing to compile, so `implement` crosses over.

**This has a cost and the cost has a clause.** The cycle's artifacts end up in one repository and the
code in another, and Principle III says `specs/` is not kept. So the closing move is explicit and it
belongs to the bot, not to the destination: **when the destination reports the implementation done,
the bot distils the scar through `save-to-lore` and deletes `specs/NNN-*/`.** Without that clause a
bot slowly accumulates specs for work it did not do, which is case memory with someone else's name on
it — the failure this kit exists to prevent, arrived by the side door.

Two consequences worth stating plainly. A spec written in a bot **must** name its destination
repository, and one that does not is not ready for `plan` — this is the first of the three checks
below, and this is the case it was written for. And there is exactly **one** constitution to maintain
per repository that has `.specify/`, which is the practical reason not to install the kit at all
three levels: every installation is another governing document that declares itself supreme and has
to be revoked in writing.

## Three entry scenarios

| You arrive with | What runs first |
|---|---|
| Lore in place, adding spec-kit | The constitution, **before** the first `/speckit-specify` |
| spec-kit in place, adding Lore | `transmute-lore` over the existing criteria, **then** the constitution — an existing constitution is imported criteria and goes through TRANSPLANT |
| Both from zero | `create-area` / `create-project`, then `specify init` **in the project**, then the constitution |

The middle row matters most: arbitration needs a yardstick. Against an authoritative source with no
written identity to judge it by, the only available move is to obey it.

## Before moving from `specify` to `plan`

1. **Declared destination** — does the spec say who owns the criteria it will be judged by? In a
   repository that holds no code of its own — a bot, an area — this also means naming the repository
   the work lands in.
2. **No copies** — does any section reproduce criteria that already has an owner at another path?
3. **No disguised exceptions** — does any requirement ask to break a clue? Then what is open is an
   arbitration, not an exception.

## Declared latency

Skills a kit installs **mid-session do not become invocable immediately.** The runtime registers them
asynchronously, and there is a window in which they are on disk but not in the session. Verified on
2026-08-14: `speckit-*` was not invocable right after `specify init`, and was invocable minutes
later — within the **same** session.

So: after `specify init`, if the commands are not there, you are not missing a step. Wait, or start a
new session. And more generally, nothing you write should depend on taking effect on the turn after
the one that wrote it. Write it, then confirm it is live.

## The optional Claude Code hook

Claude Code can run a `SessionStart` hook that injects text at the start of every session. It is a
legitimate way to make a Lore louder, and it is **optional on purpose**:

- It is **provider-specific**. Codex has no equivalent, so a kit that relied on it would stop being
  neutral — and the contract, which both hosts already load, is the channel that is not.
- It is **not the primary mechanism**. The always-on block inside the contract is. The hook adds
  emphasis to something that already works without it.

If you want it, add it to your own `.claude/settings.json`. Lore Plugin does not install it.

> **Never gitignore all of `.claude/`.** It is a common reflex and it takes the installed skills
> with it.

## Validity boundary

Verified against `specify-cli 0.16.5.dev0` (commit `bf88c9f`) on 2026-08-14, in a real installation
over a **bot** — a project whose product is records, not code.

**This has not been exercised in a repository with code where the cycle actually lands**, which is
spec-kit's majority case. The delegations and the precedence order are sound; the ergonomics of the
full cycle under this border are untested. Treat that as the open question it is.

That boundary covers the levels table above too, and it is worth saying plainly because the table
reads more confident than the evidence behind it. The **bot** row was exercised. The **project** row —
the whole cycle in a repository with code — **is reasoning, not experience**: it follows from where
`implement` can land, and nobody has run it. The **area** row is a design decision about a second
register of state, taken on the strength of a distilled failure mode rather than on an area that tried
it and suffered. Use the table; do not cite it as a result.
