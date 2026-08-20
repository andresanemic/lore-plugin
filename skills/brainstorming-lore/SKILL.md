---
name: brainstorming-lore
description: >-
  Use only when designing or materially changing an artifact owned by the Lore system: a Lore body
  or module, work area, Lore-governed project scaffold, bot, FASES structure, routing contract,
  transmutation, distillation flow, or Lore Plugin skill. Reads the contract, state, and applicable
  Lore before asking questions; explores alternatives one question at a time; presents a
  proportional design; preserves the threshold of the owner skill; then hands the approved result
  to the current agent's native planning mechanism. Do not trigger for generic brainstorming,
  ideation, writing, product design, software features, research questions, or any task unrelated
  to operating Lore.
---

# brainstorming-lore — Design changes to the Lore system

Changing the Lore is not like changing code. Code tells you when you broke it; a body of criteria
accepts a bad addition silently and keeps reading perfectly well — the cost arrives months later, in
a decision that goes the wrong way for a reason nobody can trace back.

So this one slows down on purpose. `brainstorming-lore` is the bridge between accumulated criterion
and a change to the **Lore system itself**. It does not begin from a blank prompt: it discovers what
this Entre already knows, makes the unresolved choices visible, and obtains approval before changing
a Lore-owned artifact.

> **Provenance.** Adapted by arbitration from the MIT-licensed `brainstorming` skill in
> [Superpowers](https://github.com/obra/superpowers), copyright © 2025 Jesse Vincent. Lore keeps
> context-first dialogue, one question at a time, alternatives, proportional design, and explicit
> approval. It rejects the source's software-only taxonomy, universal activation, forced spec path,
> automatic commit, and required `writing-plans` handoff. See **Where the source loses** below.

## Trigger boundary

Invoke this skill only when the user is asking to design **what a Lore-owned artifact should contain
or how the Lore system should operate**, not merely because the request involves ideas or creative
work.

Typical triggers:

- create an area, a Lore-governed project scaffold, or a bot through its owner skill;
- design or materially restructure `lore/`, `FASES.md`, a routing contract, or a Lore transmutation;
- create or materially modify a Lore Plugin skill;
- a Lore owner skill explicitly requires `brainstorming-lore` before its threshold.

### Explicit non-triggers

Do **not** invoke this skill when the user merely says «hagamos brainstorming» or asks for ideation
about a product, article, campaign, software feature, research hypothesis, presentation, class, or
any other task that is not changing Lore itself. Use the user's own brainstorming method or another
installed skill for those requests.

Do not invoke it automatically for every act that could be called creative. A typo fix, a requested
read-only inspection, an approved mechanical edit, or execution of an existing plan does not need a
second design ceremony. If another skill owns the artifact, this skill explores the design but does
not replace that owner.

## The threshold

Do not implement the designed change until the user has approved the presented design. The amount
of design scales with uncertainty; the approval does not disappear.

This gate is additive, not imperial: when an owner skill has its own threshold, preserve the **owner
skill's threshold** and its exact evidence or preview requirements. Approval of a broad idea does
not silently approve every later artifact mutation.

## 1. Ground the conversation before asking

Resolve the nearest project or area root and **read before asking**:

1. `CLAUDE.md` or `AGENTS.md` — the host-selected contract and routing;
2. `FASES.md` — current state and already-decided work;
3. `lore/index.md` — map of applicable criterion;
4. identity, principles, and only the thematic Lore modules routed by the index;
5. source notes or materials explicitly named by the user.

If a file does not exist, continue with what is available and say which source of orientation is
missing. Do not invent Lore to fill the gap. When notes share an Obsidian tree, invoke
`obsidian-lore` for source-side classification before treating their contents as criteria.

Summarize internally:

- purpose and quality north;
- current phase and relevant prior decisions;
- constraints and anti-scope;
- what is already approved versus genuinely unresolved.

Do not make the user repeat answers already written in those sources.

## 2. Scale the process to uncertainty

This skill is **domain-neutral inside its Lore boundary**: it can design Lore artifacts for software,
editorial work, research, teaching, design, operations, or a mixed project, but it does not design
the domain deliverable itself.

- **Direct design:** the outcome and constraints are mostly known. Confirm only the unresolved
  choice, then present a short design in chat.
- **Exploratory design:** purpose is known but important trade-offs remain. Ask focused questions,
  compare approaches, then present the design in sections.
- **Decomposition:** the request contains several independent outcomes. Show the boundaries and
  order first; design only the first coherent unit unless the user explicitly wants the full system.

Announce the chosen depth briefly so the user can correct it. Hidden complexity may increase depth;
never use a label to reduce an owner skill's required gate.

## 3. Clarify one decision at a time

Ask **one question at a time**. Prefer a concrete recommendation with alternatives when the source
material supports one; use an open question when it does not.

When the work begins from provisional canon, ask only what is necessary for a **first victory**.
Every later question must unlock a decision or improve the artifact, and the conversation must admit
**uncertainty and correction** instead of turning the first answer into permanent doctrine.

Only ask what changes the design:

- who or what the result serves;
- success criterion;
- constraints and non-goals;
- compatibility and portability expectations;
- acceptable evidence and verification;
- irreversible or externally visible consequences.

Stop asking when the remaining uncertainty can be stated as a trade-off in the proposal.

### The first victory in a new bot

When `create-bot` arrives with only an idea, design backwards from the **first victory**: the
smallest real outcome that proves the bot can help this person work. Ask the minimum needed to make
that outcome possible. Preserve **uncertainty and correction** in the proposal instead of forcing a
complete identity before use; every later question must unlock the victory or improve its quality.

## 4. Compare approaches

For consequential choices, present **two or three approaches** with their real trade-offs. Lead with
the recommendation and explain why it best serves the project's identity and present phase.

An approach is not a cosmetic variation. It must differ in a decision such as scope, ownership,
coupling, publication boundary, evidence burden, or maintenance cost. Remove options that violate
Lore or the explicit anti-scope.

## 5. Present a proportional design

Present enough structure for the user to know what will happen:

- intended outcome and boundary;
- chosen approach and why;
- artifacts or systems affected;
- routing and ownership;
- failure modes or protected material;
- verification and definition of done;
- what remains outside this change.

For a direct design, this can be a few sentences. For exploratory work, split it into coherent
sections and request feedback as needed. Use domain vocabulary; do not force every design into
software headings such as components, data flow, or error handling.

Then state the threshold plainly and wait for explicit approval.

## 6. Handoff after approval

After approval:

1. record the approved design in the active task state when the environment supports it;
2. hand execution to the **native Plan Mode** or planning mechanism available in the current agent;
3. invoke the artifact's owner skill at the point it becomes responsible;
4. keep any later owner-specific threshold intact.

This skill **does not require `writing-plans`** or any other third-party planning skill. It also
**does not create a spec file or commit by default**. Create a design document only when the user,
the project's Lore, or the owner skill requires a durable artifact. Never commit or push merely
because brainstorming ended.

## Where the source loses

The Superpowers source is valuable but was written for a different purpose. Against Lore's plugin
identity, it loses in five places:

1. **Universal activation loses to a Lore-only boundary.** A generic request to brainstorm must not
   activate this skill; only a change to a Lore-owned artifact enters this route.
2. **Software taxonomy loses to domain neutrality.** `spike / bounded / architectural` is useful in
   code work but distorts research, editorial, teaching and publication decisions.
3. **A fixed spec directory loses to local structure.** Lore follows the project's own routing and
   language instead of creating `docs/superpowers/specs/` everywhere.
4. **Automatic commit loses to user authority.** Approval to design is not approval to change git or
   publish externally.
5. **A mandatory `writing-plans` terminal loses to provider portability.** Claude, ChatGPT/Codex and
   other agents may expose different native planning mechanisms.

## Invariants

- Read contract, state and routed Lore before asking the user to reconstruct context.
- One question at a time.
- Compare two or three approaches when a consequential choice exists.
- Design depth scales; explicit approval remains.
- Owner skills keep ownership and their own threshold.
- No spec file, commit, push or implementation is implied by brainstorming approval.
- The workflow remains provider-neutral and domain-neutral.
