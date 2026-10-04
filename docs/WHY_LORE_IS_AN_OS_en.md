# Why is Lore an operating system for working with AI?

**In one sentence:** Lore organizes the criteria and method of your AI work; Vespi coordinates bounded operations under authority, leaves receipts, and lets you continue them with verifiable context.

## What an operating system does for you

An operating system prepares the ground for applications to do useful work: it manages resources, organizes processes, and applies boundaries. Lore uses this comparison to describe a system for work, not a computer operating system.

Lore Plugin provides the ground: your criteria, stored as files you can read and correct; routing to the relevant criteria; and a method that guides how a task is carried out. Persistent criteria live in `lore/`; current state and plan live in `FASES.md`.

Vespi is the experimental kernel of this working system. It coordinates a bounded operation: declare the goal, effect, owner, and authority; let the host enforce its permissions; request a human decision when needed; verify the effect separately; record a receipt; and preserve resumable state. The receipt reports what was observed and what remains uncovered. By itself, it does not prove who authorized an action or turn a claim into evidence.

If you already work with AI and want to improve your workflows, or do not want to spend months studying loops, security testing, and QA, Lore Plugin and Vespi let you work with that method and discipline. You can build workflows for software, writing, graphic design, or whatever you have in mind; the domain criteria and your judgment remain yours.

## A non-technical case: preparing a document with a designer

1. You and a designer agree who will read the document, what decision it should support, and who approves the final text. The project stores durable decisions as criteria and tracks its phase and open work in `FASES.md`.
2. The AI uses those criteria to propose an outline and draft. You and the designer review examples, tone, facts, and readability; visual review and approval of the document remain human decisions.
3. If the draft stops because information is missing, the operation leaves that item pending with an owner. It does not invent the information or record it as approved.
4. The next day, you return to the same project. The session reads the state and receipt, confirms what is still valid, and resumes from the pending point. If you learned a reusable rule, `save-to-lore` proposes it with evidence and waits for your approval.

## A software case

1. You ask to change a form. The project already contains interface, compatibility, and quality criteria, along with its current phase in `FASES.md`. The session loads them before deciding how to work.
2. The AI describes the change and a way to check it. If TDD is chosen, first write a failing test, then make the smallest change, and run the test again; use this cycle when the workflow and task justify it rather than promising it for every change.
3. For a step that crosses an authority boundary, Vespi checks permission before execution. If human approval is missing, it stops at that gate. The result is verified separately from execution and recorded in the receipt.
4. A person reviews the integrated change and diff. Automated tests help with QA, but they do not replace independent review or prove every risk has been checked.
5. If the work remains open, state and receipts support continuing in another session. A correction that teaches a durable criterion goes through `save-to-lore`; it is not added automatically.

## What happens without you learning the names

The coordinator recognizes the kind of work, loads the relevant criteria, and follows the applicable stages. An agent or subagent can receive a bounded task when the host provides that tool; the coordinator reviews its delivery and verifies the artifact before integration. If the host does not provide the needed tool, the task is blocked and that cause is reported.

Loops are work cycles with an exit condition; TDD can organize part of software work; security tests and QA add checks; independent verification checks a result without taking the producer's word as proof. Lore and Vespi can make these boundaries visible in a workflow. They do not activate every practice for every task or hide when something is simulated, pending, or unverified.

## Status and limits

Lore Plugin 2.4.9 and Vespi Kernel 0.1.4 were published on 2026-10-05. The kernel release prep suite passed 277/277 tests; six simulated independent verification passes are recorded, and they are not an external audit. The real superreview is still pending. TDD was used with red-first tests to fix reproduced kernel defects; this does not claim every product change follows TDD. QA has automated tests and those simulated passes, but is not presented as certification or a real independent evaluation.

Vespi does not claim mainnet, production availability, a stable protocol, or a production runtime. Lore Plugin and the kernel also do not promise that AI will always be right, that receipts are identity signatures, or that the system replaces your judgment. The published limits for kernel 0.1.4 describe a verifiable demo without external connectivity inside the kernel; do not mistake evidence from a specific test for general production readiness.

## Ready-to-post versions

**X:**

> Lore Plugin keeps your criteria and organizes the method. Vespi coordinates operations with authority, receipts, and continuity. Build AI workflows without studying every loop, TDD, or QA practice first. Experimental: no mainnet or production claim.

**LinkedIn:**

If you already work with AI and want to improve your workflows, Lore Plugin preserves your criteria and organizes the method; Vespi coordinates bounded operations with authority, receipts, and continuity across sessions. You can use loops, agents, TDD, and verification in software, writing, or design without first learning all the machinery. Vespi remains experimental: the real superreview is pending, and we make no mainnet or production availability claim.

**Release notes:**

Lore Plugin 2.4.9 organizes criteria, routing, and method for working with AI. Vespi Kernel 0.1.4 adds experimental mechanisms for bounded operations under authority and continuity through receipts. The release prep suite passed 277/277 tests, and six simulated independent verification passes are recorded; the real superreview is pending. TDD was used for fixes with red-first tests. No mainnet or production readiness is claimed.
