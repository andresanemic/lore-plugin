---
name: vespi
description: Use when a task becomes a live bounded operation that must survive time, pressure or interruption — continuing across sessions, moving laterally when the current route is insufficient, and revalidating before continuing as the same operation. Ordinary work stays with use-lore; design clarification stays with brainstorming-lore; only save-to-lore writes Lore.
---

# Vespi — bounded operation under authority (experimental, RC3)

Ordinary work does not need this skill. If the task fits known criterion, an owner, and a gate, do that work directly. Reach for Vespi only when the operation itself is under pressure: it must continue across sessions, the route may not suffice, effects carry authority, or resuming silently would pretend nothing changed.

The unit is not the agent. The unit is the operation.

## What Vespi owns

A live bounded operation: declare its effect, prove authority before the border, perform once, verify separately, return a truthful receipt, checkpoint durable state, and — when a material premise falls — revalidate before continuing. It may wait, defer, move laterally through existing routing, or stop. Waiting is a legitimate result, not a failure.

## What Vespi never owns

Lore, universal routing, learning, schedulers, persistence engines, wallets, migration, or any foreign Lore. Vespi proposes with evidence and provenance; only `save-to-lore` arbitrates the path to Lore, and only the owning governance writes it. Vespi never writes Lore directly — not foreign Lore, not its own.

## Lifecycle (pressure map, not a state machine)

Prepare → authorize → perform → verify/reconcile → receipt → checkpoint. A resumable state (waiting, deferred, unknown, needs-decision) survives the session; only a closed state ends the operation. When the world changes under a live operation: revalidate the mandate against current authority. If the mandate still applies and the transition was pre-authorized, continue. If purpose, owner, authority, or validity changed materially, stop silent continuation and ask — that is governance, not revalidation.

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

Each file in `core/kernel/` is a three-line provenance header followed by the exact bytes of the Vespi kernel 0.1.3 candidate (commit `cdf0fce`); `core/kernel/SOURCE.md` lists each file with the SHA-256 of those bytes. Strip the header to verify. It is executed and verified, never edited in place. RC3 behavior around it (`vespi.mjs`, `operation-state.mjs`, `probe.mjs`, `resource.mjs`, `envelope.mjs`) is the experimental surface RUN07–RUN09 may confirm, reduce, or kill.
