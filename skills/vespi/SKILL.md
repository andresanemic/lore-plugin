---
name: vespi
description: >-
  Use when the person says esto me está complicando or se está perdiendo lo que decidimos or
  sigamos mañana — the way of working already exists and está en riesgo, so hold the current
  route and revalidate before continuing as the same operation. Not yours: when no shape exists
  yet and quiero hacer esto y no se como is the sentence, that phrase belongs to use-lore; when
  that same sentence narrows to thinking the design of a Lore-owned artifact, that phrase belongs
  to brainstorming-lore. Only save-to-lore writes Lore.
---

# Vespi — bounded operation under authority (experimental, RC3)

> Invoke with the Skill tool as `vespi`, or with the person's sentences «esto me está complicando» / «se está perdiendo lo que decidimos» / «sigamos mañana» when a way of working already exists and is under strain.

Ordinary work does not need this skill. If the task fits known criterion, an owner, and a gate, do that work directly. Reach for Vespi only when the operation itself is under pressure: it must continue across sessions, the route may not suffice, effects carry authority, or resuming silently would pretend nothing changed.

The unit is not the agent. The unit is the operation.

## What Vespi owns

A live bounded operation: declare its effect, prove authority before the border, perform once, verify separately, return a truthful receipt, checkpoint durable state, and — when a material premise falls — revalidate before continuing. It may wait, defer, move laterally through existing routing, or stop. Waiting is a legitimate result, not a failure.

## What Vespi never owns

Lore, universal routing, learning, schedulers, persistence engines, wallets, migration, or any foreign Lore. Vespi proposes with evidence and provenance; only `save-to-lore` arbitrates the path to Lore, and only the owning governance writes it. Vespi never writes Lore directly — not foreign Lore, not its own.

## Everyday phrases — who answers, and when

Three skills answer the three ways a person says something ordinary, and the state of the work
decides, not the wording. Still no shape of work — «quiero hacer esto y no sé cómo», todavía no
hay forma de trabajo — is `use-lore`'s: what is missing is the shape, and the shape is what the
agreement offers. The same sentence narrowed to the design of a Lore-owned artifact is
`brainstorming-lore`'s. The shape exists and under strain — «esto me está complicando», «se está
perdiendo lo que decidimos», «sigamos mañana» — is this skill's. Under a vigente agreement that
already covers the piece, all three go quiet: the silent check runs first, silently, and answering
a phrase the agreement already covers would ask the person about the same thing twice. Under the
phrases, the five R2 conditions run as the internal test under every phrase, whether or not a
phrase arrived — the full list lives in `use-lore`, and this skill applies the same law.

## Lifecycle (pressure map, not a state machine)

Prepare → authorize → perform → verify/reconcile → receipt → checkpoint. A resumable state (waiting, deferred, unknown, needs-decision) survives the session; only a closed state ends the operation. When the world changes under a live operation: revalidate the mandate against current authority. If the mandate still applies and the transition was pre-authorized, continue. If purpose, owner, authority, or validity changed materially, stop silent continuation and ask — that is governance, not revalidation.

## Sparse operation — a simple operation stays simple

A single-step ephemeral operation with no external effect leaves a one-line receipt (outcome plus persistence owner `none`) and skips the rest: no lateral probe, no certification block, no human-context or provenance-role fields. Those appear only when material — a route that no longer reaches, an effect that crossed a border, a wait someone else depends on. What no future session needs in order to decide legitimately is omitted, not defaulted.

## Rules that decide real branches

- Authority constrains the real effect before execution, never after. Terms that diverge from the declared effect never reach the border.
- A receipt records only what happened: absent decider is `no_decision`, explicit refusal is `rejected`, explicit approval is `approved`. Every receipt declares its persistence owner, or `none` — honestly ephemeral beats falsely durable.
- Reachable criterion is not loaded criterion. A material decision names what it actually dereferenced, or declares `unverifiable` with its reason — which never auto-passes.
- An uncertain external effect is never retried blindly: reconcile first, then decide.
- History stays true without governing: only `ACTIVE` blocks decide the present.
- The prompt, the output, and the receipt can never widen the operation's own authority.
- A foreign body may change its own state while this operation is absent; on resume, reconcile its delta with provenance and claim nothing.

## Handoff

Anything worth keeping leaves as evidence, artifact, proposal, question, refusal, or nothing — handed to `save-to-lore` arbitration with source and provenance. Nothing here auto-becomes Lore.

Project state and operation state stay apart: `FASES.md` owns the project's phase, roadmap, and open work; this operation owns its state under `operations/<id>/`. `FASES.md` carries one pointer line to a live operation, never a copy of its progress.

Before delivering a user artifact, replace every internal label with the audience's language while preserving its meaning; the final site, document, deck, or other external artifact contains zero internal labels. Operation, envelope, validity, and probe stay below the conversation unless the user asks for technical detail.

## Core provenance

Fixed copy of the Vespi kernel **0.1.3 (candidate)** inside Lore Plugin 2.4.9-rc.4. Canonical source: `founder/proyectos/vespi/kernel/src/`, branch `rc4`, commit `cdf0fce`. Lore Plugin is the stable branch carrying a fixed kernel version; adopting a newer one is decided by Andrés (andamiaje principle #22). The four vendored files in `core/kernel/` (`authority.js`, `operation.js`, `receipt.js`, `continuity.js`) are each a three-line provenance header followed by the exact source bytes; to verify, strip the first three lines and compare the SHA-256 with the table in `core/kernel/SOURCE.md` (`SOURCE.md` itself and `package.json` carry no header and are outside this rule). Never edited in place: edit the canonical source, then re-copy. RC3 behavior around it (`vespi.mjs`, `operation-state.mjs`, `probe.mjs`, `resource.mjs`, `envelope.mjs`) is the experimental surface RUN07–RUN09 may confirm, reduce, or kill.
