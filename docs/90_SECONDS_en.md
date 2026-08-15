# Lore in 90 seconds

> [← Back to the README](../README.md) · [Versión en español](./90_SECONDS_es.md)

## The problem

You solve something hard with an AI. Next week, in a new chat, you explain it again. The AI is not
worse — it simply never received what you learned. The experience was real and it left no trace that
constrains anything.

Piling up notes does not fix it. A note answers *what happened*. What you need answered is *what
changed in how we decide because of what happened*.

## The mechanism

Three moves, and the middle one is an act, not a folder:

```text
experience (a friction you lived)  →  distillation (an explicit pass, with a gate)  →  criteria (lore/)
```

Distillation is where a scar becomes a rule. It is deliberate: something has to be said out loud,
approved, and written. Nothing gets in automatically — a container that fills itself satisfies the
urge to preserve without producing anything that constrains a decision.

## What comes out

An **invariant clue** — `Context → Root cause → Clue → Confidence`. A real one:

> **Elements flash before the animation starts.** *Context:* entrance animations on a server-rendered
> page. *Root cause:* the initial state was created by the animation library, which runs after
> hydration, so the browser paints the final state first. *Clue:* **the initial state goes in the
> markup; the library confirms it with `fromTo`, it never creates it.** *Confidence:* `confirmed`.

The test for admission is one question: **does this constrain a future decision?** If not, it is
description, and it stays out. This is the part people skip, and skipping it is how a `lore/` turns
into a folder nobody reads.

## Where it lives

Criteria that persists goes in `lore/`. State that advances — the current phase, the plan — goes in
`FASES.md`, outside it. Mixing the two is the most common way a Lore rots: the state churns, and the
churn buries the criteria.

Generic criteria lives **once**, in the mother area, and every project inherits it. Fix a clue in one
place, everything sees it.

## What it is not

Not a README, not a changelog, not a design doc. Those describe. Lore constrains.

And most of what happens does not survive it. That is the design: a Lore is worth what it changes in
future decisions, never what it holds.

## Start

Install the plugin and say **"lore"**. The kit brainstorms to build — it will not hand you a menu of
commands.

Longer: [usage](./USAGE_en.md) · [reference](./REFERENCE_en.md) · [cases](./CASES_en.md)
