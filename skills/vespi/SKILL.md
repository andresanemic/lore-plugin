---
name: vespi
description: >-
  Use when an operation is under pressure: it must continue across sessions, the
  route may not suffice, effects carry authority, or resuming silently would pretend
  nothing changed. Called by the coordinator
  in role, never by parsing human phrases — strain phrases route through use-lore's
  canonical table. Not yours: no way of working yet belongs to use-lore; designing a
  Lore-owned artifact belongs to brainstorming-lore. Only save-to-lore writes Lore.
---

# Vespi — bounded operation under authority (experimental)

Invoke `vespi` with the Skill tool. Human phrases route through `use-lore`. An ordinary operation is still an operation: retain criterion, owner, gate, receipt, distinct verification and next step. Sparse work skips the bounded wrapper below.

**How the coordinator works.** Read [`method.md`](./method.md): classify, define done, gather evidence, decide, act surgically, verify by observation, report outcome first. Retry: [`retry-method.md`](./retry-method.md). Choice/trust: [`capabilities.md`](./capabilities.md).

## Recommending the work mode

Before tasks or dispatch, read the agreement, pertinent Pistas and observed host capabilities. Recommend a viable mode with reason, cost and a real alternative; await the person's choice, without a default. Missing roles make a mode unavailable. TDD/loops are practices, specs/plans are artifacts; Plan Maestro is optional.

Run `node scripts/operation-cli.mjs recommend --root <project> --json <payload>`. The offer changes no operation. Supply the actual instruction, Pista reference/passage/pertinence/reason (or why none applies), observed skill inventory and its source, and suggested IDs/purposes. Never claim unread criterion or invent a skill. The CLI checks IDs against this inventory and hashes passage, inventory and instruction to detect material changes; it does not authenticate the host catalog. Keep the user's mode and accept/correct/decline skill choices in the operation.

Suggest fitting skills; reading siblings grants no write authority. LUS: [`lus-method.md`](./lus-method.md). Cards: [`cards-method.md`](./cards-method.md).

## Coordination when the work already has a shape

Name `method.md`, next step and file. Receive agreement/evidence, separating human decisions from agent proposals. Split unresolved work into owned outputs, dependencies and gates. Choose fitting skills/tools and the least sufficient effort; spare resources do not justify parallelism. Independently check deliveries; “done” and exit 0 are claims. Arbitrate conflicts, separating scientific findings from product decisions and simulation from effects. Checkpoint completed/running/pending/blocked work, next decision and owner; changed scope/authority returns to the person.

Give each ready, authorized operation a bounded stretch; name the served and next one at its checkpoint. Repeat only for a recorded dependency, authorized urgency or no other ready operation. Waiting consumes no turn and is no failure. This is turn coordination, not scheduling or a permanent agent mode.

Pause/resume retains operation identity, served stretch, budget, attempts, pending review and uncertain effects. Recheck authority/continuity; a fresh name/worker grants no fresh budget or priority.

Before concurrent work, optionally run `node skills/vespi/core/host-resources.mjs` for local time/memory/parallelism. It is not quota or permission; if unavailable say “not measured” and sequence conservatively. No default per-turn probe or private host details in public Lore.

The unit is not the agent. The unit is the operation.

## What Vespi owns

A live bounded operation: declare its effect, prove authority before the border, perform once, verify separately, return a truthful receipt, checkpoint durable state, and — when a material premise falls — revalidate before continuing. It may wait, defer, move laterally through existing routing, or stop. Waiting is a legitimate result, not a failure.

## What Vespi never owns

Lore, universal routing, learning, schedulers, persistence engines, wallets, migration, or any foreign Lore. Vespi proposes with evidence and provenance; only `save-to-lore` arbitrates the path to Lore, and only the owning governance writes it. Vespi never writes Lore directly — not foreign Lore, not its own.

## Invocation — who calls, and what arrives

The coordinator in role calls this protocol with a strained or continuing operation: its mandate, authority, state, and what changed. Human phrases never invoke it directly — they route through use-lore’s canonical table ("Three ordinary phrases, three owners"): no way of working yet is `use-lore`’s, and designing a Lore-owned artifact is `brainstorming-lore`’s. Under an active agreement that already covers the piece, this protocol stays quiet: the silent check runs first, silently. Under every invocation, the five R2 conditions run as the internal test — the full list lives in `use-lore`, and this skill applies the same law.

## Lifecycle (pressure map, not a state machine)

Prepare → authorize → perform → verify/reconcile → receipt → checkpoint. A resumable state (waiting, deferred, unknown, needs-decision) survives the session; only a closed state ends the operation. When the world changes under a live operation: revalidate the mandate against current authority. If the mandate still applies and the transition was pre-authorized, continue. If purpose, owner, authority, or validity changed materially, stop silent continuation and ask — that is governance, not revalidation.

## Sparse operation — a simple operation stays simple

Sparse opens no operation: a single step with no external effect is reported in one line (outcome plus persistence owner `none`) and skips the rest: no lateral probe, no human-context or provenance-role fields. What continues is not sparse: open a bounded operation, whose receipt carries a verifier distinct from the executor. Those appear only when material — a route that no longer reaches, an effect that crossed a border, a wait someone else depends on. What no future session needs is omitted, not defaulted.

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

Use the kernel's `createDelegation` with a `medium`: granted area and forbidden material. The host's message is a claim, not a receipt/verification. Fill `touched` from observed evidence; outside-area work is a violation that survives later clean answers. Relaunch a delegate unable to read its assignment rather than resume it. This protocol neither delegates automatically nor assumes the host polices the medium. Exit spark: at most twenty words; longer is a result/report.

### Launching a delegate on OpenCode

For a non-interactive OpenCode delegate, prepare its directory with `lore-plugin opencode-sandbox <dir>`, or configure routed sibling access with `lore-plugin opencode-permissions --project <dir> --from-routing [--write]`. A run that ends because OpenCode rejected a permission request is blocked by that permission cause, not failed work; record the cause in the existing operation task or receipt when that surface is in use. Keep the existing operation contract unchanged.

## Holding an operation that outlives the session

Import `vespi.mjs`: its `operation-state.mjs` surface exposes `holdOperation({root,goal,owner,authority,scope,expected_effect,done,roles,verifier})`, `runDurableOperation({root,goal,owner,authority,capability,io,intent,host,id,effect,economy,chain,...contract})`, `resumeOperation({root,id,freshness})` and `readOperation({root,id})`. Hold writes prepared state; run executes one step with a complete Gate B contract. No root means ephemeral receipt owner `none`; id resumes disk state, not a new identity. Resume returns the artifact verdict; terminal, stale or invalid-authority refusal writes nothing. Read attaches no verdict.

State is one block in the `## Operaciones` section of `FASES.md`, inside the supplied root under host permissions. No second checkpoint or folder policy is imposed. The receipt carries the path written at that checkpoint; the host and coordinator must reread and compare it before relying on it later. A capability's verified receipt cannot close work without reviewed, verified, integrated tasks; closure belongs to the owner. Resume preserves authority/goal/effect; external effects need durable, agreed and inspectable terms.

## Routes follow the host, not a provider's willingness

`routeOperation({ intent, host })` reports what the host actually exposes. `direct` runs in this process; `delegation`, `advisor` and `daimon` each need a host tool, and a tool the host does not expose is never stood in for. There is no stand-in delegate, no stand-in decision model, and above all no stand-in approval: the gate belongs to the person, and a function returning `{approved: true}` is not a person. A declared route whose tool is missing comes back `blocked`, naming the tool that is missing, and `perform` is never reached. An intent the kit does not declare is refused by name rather than falling back to `direct`.

## Tasks inside an operation: the coordinator flow

An operation can carry tasks, each with one role and its own commission: **daimon** (reads the sources and returns evidence and limits), **advisor** (answers one question from the context it was given) and **worker** (does a scoped piece against a done criterion and a proof). A task is born with its whole commission, a timeout and the time it will be observed again, or it is not born. It then moves `proposed → running → received → reviewed → verified → integrated`, and each step is a different fact: a file that arrived is not a file that was reviewed, and a reviewed file is not a verified one. The record requires different executor and verifier labels; actual independence is declared, not verified — check the evidence yourself. Closing names every task that is neither integrated nor blocked with its reason.

Record time; calibrate after three samples. Earlier, say “not measured”; dated references orient, never promise or limit. Effect inspectors report adapter claims, not independently authenticated effects.

If the host does not expose the tool a role needs, the task comes back `blocked` with the missing tool and the next action; nothing is simulated. The operation also declares its effect up front: `none`, or `external` with its economy (cost, grant, settlement) and whether it goes on chain; an on-chain placement without a reason of distrust is recorded as a defect, not rejected silently.

CLI: `node scripts/operation-cli.mjs <command> --root <dir> --id <op> [--task <t>] --json <payload>`. Commission pinned Node tests or authorized Luna medium/high; see `docs/VERIFICATION-EXECUTION.md`. `verify` executes after review. Owner criterion needs native judgment, including Node-check adequacy; missing sources or authority stops verification. Rejection persists in FASES. Integration/closure recheck signed inputs; uncovered work stays partial. Labels do not prove identity.

## The relational trace is not the operation receipt

Gate B requires intent, owner, authority, scope, expected effect, done, roles/tasks, verifier, receipt, state and next action before execution/advance. Missing fields block by name. Closure needs reviewed, independently verified, integrated work; all-blocked work cannot close. Terminal state preserves identity, agreement, uncertainty, coordination, receipt and evidence channels.

Record the observed Advisor `decide` route and observer. Absence durably blocks the same task with cause/recovery, never a fabricated review. On return, `receive` requires the original path/SHA-256, preserves the receipt and checks delivery failures; dispatch cannot replace an unreviewed delivery. Review requires `accepted`, `changes_requested` or `rejected`; negatives need reasons and block verification. Only acceptance of the received SHA permits verification. Corrections, including after redispatch, archive rejected bytes/review in `review_history`; closure keeps `task_reviews`. Route, identity and verdict are coordinator attestations, not authenticated Advisor invocation or domain proof.

Record linked, ordered interaction events separately: mismatch → correction received → response revised without echo → distinction proposed → distinction corrected by the other party → later decision applied. Effect/verification/receipt and optional literal user `self-report` are separate. Absent, negative, uncertain and undeclared reports are valid; never infer yo–tú, fertility, simplicity or recommendation from success or the trace.

For external effects, `request-effect` names exact action/destination. Record the person's explicit words for that current request with `approve-effect` and expiry; never invent/paraphrase approval. `effect-permission` checks identity, action/destination, recency, expiry and revocation, returning only action/destination to the adapter. Generic authority, “avancemos” or GREEN never authorizes commit/push/tag/Release/deployment. Commands record/check authority, do not execute effects or authenticate who typed approval.

## Handoff

Anything worth keeping leaves as evidence, artifact, proposal, question, refusal, or nothing — handed to `save-to-lore` arbitration with source and provenance. Nothing here auto-becomes Lore.

Project state and operation state stay apart: `FASES.md` owns the project's phase, roadmap, and open work; this operation keeps its single checkpoint as a delimited block inside that same `FASES.md`, so there is one place to look; resuming still requires reconciliation of changed authority, evidence and effects.

Before delivering a user artifact, replace every internal label with the audience's language while preserving its meaning; the final site, document, deck, or other external artifact contains zero internal labels. Operation, envelope, validity, and probe stay below the conversation unless the user asks for technical detail.

## Core provenance

Pinned Vespi kernel **0.1.6**, publication date pending: `founder/proyectos/vespi/kernel/src/`, branch `master`, commit `95f2d614f4492056c8bb2cd951f08d1089027d4f`. Andrés decides adoption. Copies have three provenance lines then exact source bytes; the table/test in `core/kernel/SOURCE.md` checks identity. Never edit vendor: change canonical source then re-copy. Vendored: `authority.js`, `continuity.js`, `delegation.js`, `emergency.js`, `operation.js`, `receipt.js`, `skill-provenance.js`, `time.js`, `x402.js`, `zk.js`. Experimental `zk-bn254-reference.js` is not vendored. Wrappers remain experimental and require evidence from use.

## Delegating to Codex and OpenCode on Windows

Use the host's actual sandbox/granted directories; if an existing checkout is unwritable, use an authorized worktree or new folder. Copy only permitted references. Pass long prompts by file/stdin. PowerShell may require `npm.cmd test`; Node/PowerShell need native or forward-slash Windows paths, not `/c/...` or `/tmp/...`. Use `cygpath -w` when converting Git Bash paths. Normalization notices are not test results; `.gitattributes` governs line endings. Exit 0 never proves delivery: inspect the artifact and verify separately.
