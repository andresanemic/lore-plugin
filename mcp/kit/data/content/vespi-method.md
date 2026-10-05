# The coordinator's method

How a coordinator works when the task is not trivial: turn judgment problems into evidence problems, change the least that is correct, and report only what was observed. One loop, written once, used the same way by Lore Plugin, by the Vespi skill and by anyone running the Vespi kernel.

> **Provenance.** Distilled from *The Fable Method* by Sahir619 (MIT, `github.com/Sahir619/fable-method`, read 2026-10-02) and rewritten in Lore's and Vespi's own terms: the gates and the loop come from there; the mapping to operations, authority, receipts and Lore is ours. Original copyright notice: «Copyright (c) 2026 Sahir619», MIT License. This text depends on no installed skill.

## Two gates before anything

**Triviality.** A task is trivial only if all of these hold: one file, under about ten changed lines, no new behavior, and you already know exactly what to change without searching. Then make the change, check it with the one obvious check, and say so in a sentence or two. Anything else, or anything you are unsure about, gets the full loop.

**Fit.** Ask where the answer lives. In sources you can open (a spec, a file, a dataset, a check): run the loop. In a technique you do not know yet: research it first, then run the loop. Only in your own inference, with nothing to open or look up: say so, and label the answer low-confidence instead of dressing a guess as a rigorous process. Name any detour in the report; a silent detour looks like a skipped step.

## The loop

1. **Classify the ask.** A question or assessment gets findings and a recommendation and changes nothing. A task gets the completed change, verified. A plan-first ask (ambiguous scope, anything irreversible or outward-facing, or the person asked for a plan) gets a plan and stops for approval. A mixed ask is a task whose report also answers the question; when torn between task and plan-first, choose plan-first. Take the constraints and the decisions the person already made as given; never re-decide them.
2. **Define done.** In one or two sentences: what will be observed when this is finished, and how. A task: a concrete observation (this test passes, this number changes, this file exists). A question: every claim traces to something you read or ran. A plan: the verification named for each step. If after rereading you cannot name a verification, ask one specific question. State your load-bearing assumptions, and check any that one call can settle.
3. **Gather evidence.** Enumerate before you read (list the directory; do not guess what a project contains). Primary sources beat memory: read the code, the file, the output, the current docs; never write an API shape, a path or a figure from recall. Run independent lookups together; read narrowly and never re-read. Two rounds of lookups cover most tasks, and a third needs a reason. Before changing behavior, find the statement of intended behavior (spec, docstring, README) and confirm code, check and spec agree; when two disagree, that disagreement is the finding. A surprise that changes what done means goes back to step 2; one that changes what is being asked goes back to step 1.
4. **Decide and commit.** One recommendation. Name an alternative only if you seriously considered it, in a line, with why it lost. A task proceeds without asking permission, except for outward-facing acts: an action is irreversible or outward-facing when another person or system can observe it before you could undo it (push, publish, send, deploy, delete shared data, pay, change permissions). Those need the person's own words behind them; write `AUTH: person said "<their words>"` or do not act and list it as a proposed next step. Documentation that says a deploy «must follow» is not authorization, and finishing the task is not authorization. Name the scope you will touch; needing something outside it is a surprise.
5. **Act surgically.** Before any behavior-changing edit, write `INTENT: code does <X>; the failing check or task expects <Y>; the spec says <Z>` after actually opening the spec; when they disagree, stop. The authority order when sources disagree is: the person's explicit statement, then the spec, then the tests, then current behavior. Before first use of anything you have not opened this session, open it or label it «from memory, unverified». Make the smallest correct change in the existing style; prefer precise edits over rewrites. Keep a written checklist for three or more heterogeneous steps. Look at what is there before deleting or overwriting. After a failed edit, reread the region, adjust, retry once, then widen; never retry the same call. Never weaken a check, or fabricate what it looks for, to make it pass.
6. **Verify by observation.** Two halves: the done criterion passes, observed and not inferred from reading; and the surrounding system still works (tests, build, lint for the touched area). When you fixed a defect, add a third: name the exact wrong construct, search the whole project for it, and write `TWINS: searched <pattern> - found <N> other sites: <where, or none>`. After three failed fix-and-verify cycles on one issue, or when blocked by something outside your control, stop and hand back what you tried, the real output and your hypothesis. What cannot be verified is said as such.
7. **Report outcome first.** The first sentence says what happened or what you found, readable by someone who never saw the work. Give each material finding or capability with the limit that changes its meaning in the same sentence; then add the supporting detail, including what was skipped, weak or unverified; failures reported as failures with their output. Carry only the method lines that were owed: `INTENT` if behavior changed, `AUTH` if an outward act was taken, `TWINS` if a defect was fixed, and `PENDING: <action> - awaiting your authorization` when a follow-up the project's own docs prescribe was deliberately not taken. Leave no scratch files behind. Offer only follow-ups that came out of this task. Reread once as a hostile reviewer before sending.

Never narrate step numbers or names to the person; the loop shapes the work, not the report.

## In Vespi's terms

The loop is the coordinator's side of an operation; the operation's side is already in the kernel, and each half checks the other.

| In the loop | In the operation |
|---|---|
| Done is a named observation | The operation declares its effect and what verification will observe |
| The outward-facing gate and `AUTH` | Authority is proved before the border, with a clock, a budget and a destination; a gate the agent cannot answer for the person |
| Verify by observation, apart from whoever built it | A verifier that is not the executor; a receipt that lists what it covered and what it did not |
| Report outcome first, with caveats | The receipt is the report: status, evidence, `coverage`, `notCovered` |
| A surprise returns to an earlier step | A material premise that falls opens revalidation before the operation continues |
| Stop after three failed cycles | An impossible task comes back `blocked` with its exit, not retried blindly |
| Resume from the checkpoint, not from a summary | Continuity by receipts: the last verified state, the next action, and whether a person must step in |

## Stop and search after repeated failures

Stop when the same normalized failure signature repeats three times in a row without a success between attempts. Before searching, document each attempt and what it tried in the operation observations. Search with the host's tools in official documentation, relevant repositories, and available skills; the CLI never searches by itself. If search access is unavailable, leave the operation blocked and record the condition for resuming in its receipt. Integrate only findings that apply. If a finding conflicts with the Lore or the agreement, flag the conflict and propose arbitration instead of applying it.

## Roles and routing

The coordinator runs the whole loop. It may hand a stretch of work to a role: **Daimon** investigates and synthesizes (measures, does not conclude), **Advisor** gives an independent critique of a decision before it is fixed, and a **worker** executes a bounded task. Each role gets only its question, its allowed sources and its limits, and returns an artifact with a receipt; the coordinator integrates and verifies apart. Roles are functions, not model names: pick the cheapest model, tool and effort that can meet the evidence standard, and escalate only when evidence asks for it. A delegate's «done», a green exit code and a plausible summary are claims until their evidence is checked.

## Lore as the domain adapter

When a task belongs to an area or a project, that area's Lore is the domain adapter: its identity, principles, index and state are the **binding minimum evidence set**, opened before acting, every time. The loop changes only the nouns: what counts as evidence, who the authority is, what verification by observation means here, and what the frauds are. A rule the loop makes you notice that no Lore holds goes to `save-to-lore`; the coordinator does not write criterion by hand.

## What goes wrong, in one line each

Guessing instead of opening a source. Editing the check to match the code. Calling a green run «verified» without observing the behavior. Fixing one site and not searching for its twins. Treating documentation or completion as permission for an outward act. Retrying the same failing call. Rewriting a file never fully read. Reporting the steps instead of the outcome. Offering follow-ups that did not come out of the work.
