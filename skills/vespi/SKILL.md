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

> Invoke with the Skill tool as `vespi` when the coordinator, in role, takes on a strained or continuing operation. A person's sentence never invokes it directly: those sentences route through the canonical table in `use-lore`.

Ordinary work does not need this skill. If the task fits known criterion, an owner, and a gate, do that work directly. Reach for Vespi only when the operation itself is under pressure: it must continue across sessions, the route may not suffice, effects carry authority, or resuming silently would pretend nothing changed.

**How the coordinator works.** The loop the coordinator follows — classify the ask, define done, gather evidence, decide, act surgically, verify by observation, report the outcome first — is written in [`method.md`](./method.md). It depends on no installed skill. Under an operation, the coordinator’s report and the operation’s receipt are the same act seen from two sides: what was observed, what was covered, and what was not.

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

The coordinator in role calls this protocol with a strained or continuing operation: its mandate, authority, state, and what changed. Human phrases never invoke it directly — they route through use-lore’s canonical table ("Three ordinary phrases, three owners"): no way of working yet is `use-lore`’s, and designing a Lore-owned artifact is `brainstorming-lore`’s. Under an active agreement that already covers the piece, this protocol stays quiet: the silent check runs first, silently. Under every invocation, the five R2 conditions run as the internal test — the full list lives in `use-lore`, and this skill applies the same law.

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

### Launching a delegate on OpenCode

For a non-interactive OpenCode delegate, prepare its directory with `lore-plugin opencode-sandbox <dir>`, or configure routed sibling access with `lore-plugin opencode-permissions --project <dir> --from-routing [--write]`. A run that ends because OpenCode rejected a permission request is blocked by that permission cause, not failed work; record the cause in the existing operation task or receipt when that surface is in use. Keep the existing operation contract unchanged.

## Holding an operation that outlives the session

`operation-state.mjs` writes and reloads an operation artifact; `vespi.mjs` is the module an agent imports, and it carries that surface too, so a declared persistence owner is either a file that exists or the explicit `none`. Four calls, all through the facade:

- `holdOperation({ root, goal, owner, authority })` declares the operation and writes its state before anything runs.
- `runDurableOperation({ root, goal, owner, authority, capability, io, intent, host, id, effect, economy, chain })` runs one step and leaves the operation readable afterwards. With no `root` there is nowhere to write, so the receipt says `none` and the operation stays ephemeral. With an `id` it resumes from disk instead of declaring a new one.
- `resumeOperation({ root, id, freshness })` reads the state back and returns the artifact's own verdict. A refused resume writes nothing: a terminal, stale or invalid-authority operation stops here rather than continuing silently.
- `readOperation({ root, id })` reads one artifact with no verdict attached.

The state lives as one block in the `## Operaciones` section of `FASES.md` under the root the caller passes: a single checkpoint, no second copy. Where a project keeps its folders is the person's policy and the host's permission; this names a file inside the root it is handed and adds no rule of its own about where a write may land. The receipt carries the path of what now exists, so a receipt and the disk cannot drift apart. A verified step ends the artifact at `verified` with `certify` pending: finishing, verifying and closing are three different things, and closing is the owner's.

## Routes follow the host, not a provider's willingness

`routeOperation({ intent, host })` reports what the host actually exposes. `direct` runs in this process; `delegation`, `advisor` and `daimon` each need a host tool, and a tool the host does not expose is never stood in for. There is no stand-in delegate, no stand-in decision model, and above all no stand-in approval: the gate belongs to the person, and a function returning `{approved: true}` is not a person. A declared route whose tool is missing comes back `blocked`, naming the tool that is missing, and `perform` is never reached. An intent the kit does not declare is refused by name rather than falling back to `direct`.

## Tasks inside an operation: the coordinator flow

An operation can carry tasks, each with one role and its own commission: **daimon** (reads the sources and returns evidence and limits), **advisor** (answers one question from the context it was given) and **worker** (does a scoped piece against a done criterion and a proof). A task is born with its whole commission, a timeout and the time it will be observed again, or it is not born. It then moves `proposed → running → received → reviewed → verified → integrated`, and each step is a different fact: a file that arrived is not a file that was reviewed, and a reviewed file is not a verified one. The verifier is never whoever executed it, and closing names every task that is neither integrated nor blocked with its reason.

If the host does not expose the tool a role needs, the task comes back `blocked` with the missing tool and the next action; nothing is simulated. The operation also declares its effect up front: `none`, or `external` with its economy (cost, grant, settlement) and whether it goes on chain; an on-chain placement without a reason of distrust is recorded as a defect, not rejected silently.

From the command line, in the project root: `node scripts/lore-plugin.mjs operation <hold|authorize|plan|dispatch|observe|receive|review|verify|integrate|close|status|resume> --root <dir> --id <op> [--task <t>] [--tools <observed host tools>] --json <payload>`. `authorize` records who authorized and their own words; it cannot prove who said them, so the words are the person's and never the agent's. `dispatch` takes only the tools the operator actually observed. Each command prints one JSON line and writes nothing when it fails.

## Handoff

Anything worth keeping leaves as evidence, artifact, proposal, question, refusal, or nothing — handed to `save-to-lore` arbitration with source and provenance. Nothing here auto-becomes Lore.

Project state and operation state stay apart: `FASES.md` owns the project's phase, roadmap, and open work; this operation keeps its single checkpoint as a delimited block inside that same `FASES.md`, so there is one place to look and nothing to reconcile.

Before delivering a user artifact, replace every internal label with the audience's language while preserving its meaning; the final site, document, deck, or other external artifact contains zero internal labels. Operation, envelope, validity, and probe stay below the conversation unless the user asks for technical detail.

## Core provenance

Fixed copy of the Vespi kernel **0.1.3 (candidate)** inside Lore Plugin 2.4.9-rc.7. Canonical source: `founder/proyectos/vespi/kernel/src/`, branch `codex/rc6`, commit `892bd91`. Lore Plugin is the stable branch carrying a fixed kernel version; adopting a newer one is decided by Andrés (the plugin framework's principle 22). The five vendored files in `core/kernel/` (`authority.js`, `continuity.js`, `delegation.js`, `operation.js`, `receipt.js`) are each a three-line provenance header followed by the exact source bytes; to verify, strip the first three lines and compare the SHA-256 with the table in `core/kernel/SOURCE.md` (`SOURCE.md` itself and `package.json` carry no header and are outside this rule). The table does not vouch for itself: `bench/vespi-kernel-provenance.test.mjs` reads `git show 892bd91:src/<file>` from the canonical repository and compares byte for byte, so a copy that drifts from what it claims is caught whether or not `SOURCE.md` was updated with it. Never edit the copy in place: edit the canonical source, then re-copy. The experimental wrappers around it (`vespi.mjs`, `operation-state.mjs`, `probe.mjs`, `resource.mjs`, `envelope.mjs`) remain subject to evidence from actual use.

## Delegating to Codex and OpenCode on Windows

With Codex `-s workspace-write`, it can write only to directories it creates or directories granted with `--add-dir`; it cannot edit existing files in a directory that already existed under other Windows permissions, so use a new Git worktree or folder and copy the files it must edit there. Codex cannot read outside its working directory, so copy reference files and images inside it. Put a long prompt in a file and pass it through stdin or a file tool, never in a shell heredoc or quoted inline. Under PowerShell, `npm test` can be blocked by execution policy; run `npm.cmd test`. Git Bash paths such as `/c/Users/...` and `/tmp/...` are not native paths for Node or PowerShell: convert them with `cygpath -w` or use forward-slash paths such as `C:/work/file`. Git's “LF will be replaced by CRLF” notices on Windows are normalization noise; `.gitattributes` prevents them. A worker exiting with code 0 does not prove delivery: check the expected artifact and verify it separately.