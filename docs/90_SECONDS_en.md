# Lore in 90 seconds

> [← Back to the README](../README.md) · [Versión en español](./90_SECONDS_es.md)

## The problem

You solve something hard with AI, then explain it again in a new chat next week. The AI did not get
worse; it lacks the lesson from last time. More notes will not help unless they show what should
change in a future decision. A note can describe the event; a criterion keeps the lesson that changes
what you do next. Lore stores the lesson, not the whole conversation.

## The mechanism

Three moves. The middle one is deliberate: you state a lesson, approve it, and write it as criteria:

```text
experience (a friction you lived)  →  distillation (an explicit pass, with a gate)  →  criteria (lore/)
```

Distillation turns a lesson into a rule. Nothing enters automatically: you state it, review it, and
approve the change.

## What comes out

An **invariant clue** — `Context → Root cause → Clue → Confidence`. A real one:

> **Elements flash before the animation starts.** *Context:* entrance animations on a server-rendered
> page. *Root cause:* the initial state was created by the animation library, which runs after
> hydration, so the browser paints the final state first. *Clue:* **the initial state goes in the
> markup; the library confirms it with `fromTo`, it never creates it.** *Confidence:* `confirmed`.

A clue should help beyond the original bug: keep the context needed to apply the rule, not the incident’s full story.

Keep a lesson only if it constrains a future decision. Otherwise, it is a description, not Lore.
Context helps a future reader recognize when the clue applies; confidence says how well it has been
checked.

## Where it lives

Persistent criteria goes in `lore/`; changing state, such as the current phase or plan, goes in
`FASES.md`. Keep them separate so changing plans do not bury stable criteria.

Shared criteria lives once in the mother Area and is inherited by its projects. The agent's contract
— `CLAUDE.md` or `AGENTS.md` — is a small pointer to the Lore files its host should load at session
start, so you do not have to paste criteria into every conversation.

Criteria can become stale, too. Review them and remove rules whose validity has expired.

## What it is not

Use a README, changelog, or design doc to explain the project; use Lore for rules that guide future
decisions.

## And now it also executes

Lore Plugin keeps project criteria available across AI sessions and can run bounded operations with
Vespi. You can begin without knowing TDD or spec-kit; the [technical reference](./REFERENCE_en.md)
explains the tools.

## Start

Install the plugin and write **"I want to start using Lore Plugin, help me"**. The kit brainstorms to build — it will not hand you a menu of
commands.

Longer: [the technical document](./REFERENCE_en.md) · [cases](./CASES_en.md)
