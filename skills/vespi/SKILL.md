---
name: vespi
description: >-
  Invoke to run a bounded operation under authority: declare its effect, prove authority
  before the border, perform once, verify separately, return a truthful receipt, checkpoint
  durable state, and revalidate when a material premise falls. Called by the coordinator
  in role, never by parsing human phrases — strain phrases route through use-lore's
  canonical table. Not yours: no way of working yet belongs to use-lore; designing a
  Lore-owned artifact belongs to brainstorming-lore. Only save-to-lore writes Lore.
---

# Vespi — bounded operation under authority (experimental)

> Invoke with the Skill tool as `vespi`, or with the person's sentences «esto me está complicando» / «se está perdiendo lo que decidimos» / «sigamos mañana» when a way of working already exists and is under strain.

Ordinary work does not need this skill. If the task fits known criterion, an owner, and a gate, do that work directly. Reach for Vespi only when the operation itself is under pressure: it must continue across sessions, the route may not suffice, effects carry authority, or resuming silently would pretend nothing changed.

When the person asks to coordinate existing work across projects, use the bounded sequence below. Reading across the garden grants no write authority; a simple task with a working route needs no coordination wrapper.

## Coordination when the work already has a shape

1. Receive the current agreement and evidence. Separate what the person decided from what an agent merely proposed.
2. Break only the unresolved work into verifiable outputs, dependencies and human gates. Name the owner of each output.
3. Choose the existing skill, tool or delegate that fits each output. Use the least effort that can meet its evidence standard; do not create parallel jobs just because resources are available.
4. Verify each delivered artifact independently. A delegate's “done,” a green exit code and a plausible summary are claims until their relevant evidence is checked.
5. Arbitrate conflicts between sources and territories. Keep a scientific finding separate from a product decision, and a simulated result separate from a real effect.
6. Show a short, truthful checkpoint: completed, running, pending, blocked, next decision and its owner. Bring a changed scope or authority back to the person; do not silently approve it.

This is an invocable way to run a multi-step operation, not a permanent mode or a new agent. It stops when direct execution is enough.

Before running work concurrently, you may call `node skills/vespi/core/host-resources.mjs` from the installed kit to measure time, free/total memory and available parallelism. Its result is a local snapshot, not a quota or an authorization; if it is unavailable, say “not measured” and choose a conservative sequence. Do not run the probe by default on every turn or copy private host details into public Lore.

The unit is not the agent. The unit is the operation.

## What Vespi owns

A live bounded operation: declare its effect, prove authority before the border, perform once, verify separately, return a truthful receipt, checkpoint durable state, and — when a material premise falls — revalidate before continuing. It may wait, defer, move laterally through existing routing, or stop. Waiting is a legitimate result, not a failure.

## What Vespi never owns

Lore, universal routing, learning, schedulers, persistence engines, wallets, migration, or any foreign Lore. Vespi proposes with evidence and provenance; only `save-to-lore` arbitrates the path to Lore, and only the owning governance writes it. Vespi never writes Lore directly — not foreign Lore, not its own.

## ## Invocation — who calls, and what arrives

The coordinator in role calls this protocol with a strained or continuing operation: its mandate, authority, state, and what changed. Human phrases never invoke it directly — they route through use-lore’s canonical table ("Three ordinary phrases, three owners"). Under an active agreement that already covers the piece, this protocol stays quiet: the silent check runs first, silently. Under every invocation, the five R2 conditions run as the internal test — the full list lives in `use-lore`, and this skill applies the same law.

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
- Delegated work is not this operation's work until the orchestrator reviewed it, and a violation already on record survives every clean answer that follows.

## Delegation — what the host gives, and what it does not

Where the host offers a subagent, the delegation goes through the kernel's `createDelegation` with a `medium`: the area the delegate was given, and what in it it must not touch. A file the delegate reports outside that area is a violation, and a violation is a fact about the delegation, not about its last delivery.

The host returns one message. It is not a receipt, and it is not verification. What the delegate says it touched is a claim, so the orchestrator fills `touched` from what it can observe itself, and a delegate that could not read its assignment is relaunched, never resumed. Nothing here delegates by itself, and no host is assumed to police the medium. A spark the delegate leaves on the way out is at most twenty words; over that it is a report, and the report is the result.

## Handoff

Anything worth keeping leaves as evidence, artifact, proposal, question, refusal, or nothing — handed to `save-to-lore` arbitration with source and provenance. Nothing here auto-becomes Lore.

Project state and operation state stay apart: `FASES.md` owns the project's phase, roadmap, and open work; this operation owns its state under `operations/<id>/`. `FASES.md` carries one pointer line to a live operation, never a copy of its progress.

Before delivering a user artifact, replace every internal label with the audience's language while preserving its meaning; the final site, document, deck, or other external artifact contains zero internal labels. Operation, envelope, validity, and probe stay below the conversation unless the user asks for technical detail.

## Core provenance

Fixed copy of the Vespi kernel **0.1.3 (candidate)** inside Lore Plugin 2.4.9-rc.6. Canonical source: `founder/proyectos/vespi/kernel/src/`, branch `codex/rc6`, commit `892bd91`. Lore Plugin is the stable branch carrying a fixed kernel version; adopting a newer one is decided by Andrés (the plugin framework's principle 22). The five vendored files in `core/kernel/` (`authority.js`, `continuity.js`, `delegation.js`, `operation.js`, `receipt.js`) are each a three-line provenance header followed by the exact source bytes; to verify, strip the first three lines and compare the SHA-256 with the table in `core/kernel/SOURCE.md` (`SOURCE.md` itself and `package.json` carry no header and are outside this rule). The table does not vouch for itself: `bench/vespi-kernel-provenance.test.mjs` reads `git show 892bd91:src/<file>` from the canonical repository and compares byte for byte, so a copy that drifts from what it claims is caught whether or not `SOURCE.md` was updated with it. Never edit the copy in place: edit the canonical source, then re-copy. The experimental wrappers around it (`vespi.mjs`, `operation-state.mjs`, `probe.mjs`, `resource.mjs`, `envelope.mjs`) remain subject to evidence from actual use.
