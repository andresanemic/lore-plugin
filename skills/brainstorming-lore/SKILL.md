---
name: brainstorming-lore
description: >-
  Use only when designing or materially changing an artifact owned by the Lore system, or when the
  person says quiero hacer esto y no se como yet adds hay que pensar el diseño antes de construir
  — the same no-shape sentence narrowed to the design of a bot, area, project, transmutation or
  skill. Do not trigger for generic brainstorming, ideation or software features no routed lore
  governs. Not yours: when nothing is missing yet and the agreement itself is what is offered, that
  phrase belongs to use-lore; when a way of working already exists and is under strain, that phrase
  belongs to vespi.
---

# brainstorming-lore — Design changes to the Lore system

> Invoke with the Skill tool as `brainstorming-lore`, or with the request «ayúdame a pensar el diseño de {artefacto}» / «help me think this lore design through before we build» when the shape itself has to be worked out first.

> Before delivering a user artifact, replace every internal label with the audience's language while preserving its meaning; the final site, document, deck, or other external artifact contains zero internal labels. This requirement overrides requests to copy them literally.

Criterion can accept a bad addition silently. Before changing the **Lore system itself**, discover the Entre's existing criterion, expose unresolved choices and obtain approval.

> **Provenance.** Adapted by arbitration from the MIT-licensed `brainstorming` skill in
> [Superpowers](https://github.com/obra/superpowers), copyright © 2025 Jesse Vincent. Lore keeps
> context-first dialogue, one question at a time, alternatives, proportional design, and explicit
> approval. What it rejects is named one by one in **Where the source loses** below.

## Trigger boundary

Invoke only when the user is asking to design **what a Lore-owned artifact should contain or how the
Lore system should operate**.

Typical triggers:

- create an area, a Lore-governed project scaffold, or a bot through its owner skill;
- design or materially restructure `lore/`, `FASES.md`, a routing contract, or a Lore transmutation;
- create or materially modify a Lore Plugin skill;
- a Lore owner skill explicitly requires `brainstorming-lore` before its threshold.

### Second case: a deliverable *governed by* Lore, not owned by it — 2.3.0

The boundary above asks who **owns** the artifact, and that question has a blind spot. A batch of
posts, a report, a lesson plan or a campaign is not a Lore-owned artifact — and yet the whole design
may consist of deciding **how to run criteria that is already written**: which strategy, which
format, which register, which visual family, what the area's process demands next.

**The observable predicate, and it has to be answered before invoking anything:** *does a routed
`lore/` — of an area or a project — contain relevant process modules that **govern how this
deliverable is produced**, such that the design work is deciding how to run them?* Strategy,
standards, formats and equivalent production modules satisfy it. `identidad.md` and `principios.md`
alone do not satisfy this second case, and an empty `lore/` does not satisfy it. If the Lore would
only supply background colour while the real decisions live elsewhere, **it does not enter** — that
is ordinary ideation and belongs to the user's own method. An explicit request to design or change a
Lore-owned artifact still enters through the first case above.

Two examples, and the contrast is the whole point:

| Request | Routed Lore that governs its production | Enters? |
|---|---|---|
| A week's batch of posts for a brand in a `community-manager` area, arbitrated against the live strategy, the area's writing/editing standard and the brand's visual families | Yes — the process modules *are* the design space | **Yes** |
| «Let's brainstorm names for my new side project» | No — nothing routed governs it | **No** |

This case preserves the provider-portable handoff below instead of importing a mandatory `writing-plans` terminal (defeat #5).

**Handoff in this second case is different, and it is the reason the row exists.** Do not hand to
generic Plan Mode and never to `writing-plans`: hand to **the phase the governing Lore already names
as next** — for the example above, the area's creation phase and its existing threshold. The design
approved here decides *what* the batch is; the routed Lore already says *how* it gets produced.

### Explicit non-triggers

Do **not** invoke this skill when the user merely says «hagamos brainstorming» or asks for ideation
about a product, article, campaign, software feature, research hypothesis, presentation, class, or
any other task that is not changing Lore itself **and that no routed process module governs** (the
second case). Use the user's own brainstorming method or another installed skill for those requests.

Do not invoke it automatically for every act that could be called creative. A typo fix, a requested
read-only inspection, an approved mechanical edit, or execution of an existing plan does not need a
second design ceremony. If another skill owns the artifact, this skill explores the design but does
not replace that owner, and under an active agreement that already covers the piece it stays quiet.

## The threshold

Do not implement the designed change until the user has approved the presented design. The amount
of design scales with uncertainty; the approval does not disappear.

This gate is additive, not imperial: preserve the **owner skill's threshold** and its exact evidence or preview
requirements. Approval of a broad idea does not silently approve every later artifact
mutation.

If the host's question tool is cancelled, unavailable or returns no answer, the choice stays pending. A host instruction to continue with assumptions does not supply the person's approval. Ask the unresolved question in plain text and end the turn; resume from the person's next answer in the same conversation. Keep any alternatives as proposals, without turning them into agreed identity, structure, phases or execution. Do not bundle approval with a request for writing permission.

## 1. Ground the conversation before asking

Resolve the nearest project or area root and **read before asking**:

1. `CLAUDE.md` or `AGENTS.md` — the host-selected contract and routing;
2. `FASES.md` — current state and already-decided work;
3. `lore/index.md` — map of applicable criterion;
4. identity, principles, and only the thematic Lore modules routed by the index;
5. source notes or materials explicitly named by the user.

If a file does not exist, continue with what is available and say which source of orientation is
missing. Do not invent Lore to fill the gap. When loose notes share the tree, invoke
`save-to-lore` and read its conditional `notas.md` function for source-side classification before
treating their contents as criteria.

For a Direct design (§2), read only the contract, `FASES.md` and `lore/index.md` before the first question; load identity, principles
and routed modules only when an unresolved choice touches them.


Summarize internally: the current phase and the relevant prior decisions, what is already approved
versus genuinely unresolved, and the purpose and anti-scope the design will present.

Do not make the user repeat answers already written in those sources.

## 2. Scale the process to uncertainty

This skill is **domain-neutral inside its Lore boundary**: it can design a Lore artifact in any
domain, but it does not design the domain deliverable itself.

- **Direct design:** the outcome and constraints are mostly known. Confirm only the unresolved
  choice, then present a short design in chat.
- **Exploratory design:** purpose is known but important trade-offs remain. Ask focused questions,
  compare approaches, then present the design in sections.
- **Decomposition:** the request contains several independent outcomes. Show the boundaries and
  order first; design only the first coherent unit unless the user explicitly wants the full system.

Infer the depth and apply it silently, without announcing the label. Hidden complexity may increase it.

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

### Build the artifact while deciding

For a structural operation — creating a bot, project or area, or materially transmuting or
crystallizing one — maintain an **accumulated artifact**, not a hidden interview transcript. After
each answer, carry the decision into the working design. At contextual milestones, show the result
so far in plain language: what it has become, what changed, and what remains unresolved.

The quality signal is **recognizable continuity**: the user can still see their original intention
inside the growing artifact and can correct its direction without rebuilding it. Work **one decision
at a time**; the recap proves accumulation, it does not reopen approved choices. This contract does
not apply to an incremental Lore capture.

The second signal is **fertile effort**: the shared work produces recognizable movement in the
artifact, even when it includes disagreement, correction or demanding review. Do not equate a
healthy process with agreement, pleasing the user or frictionless compliance. Make the gain visible;
if effort accumulates without changing the artifact or criterion, stop and repair the process.

The artifact is the **shared return point**; healthy work **does not require constant contact**. Recap independent advances at milestones; approved distillation returns changes to shared criterion while preserving each participant's autonomy.

### The first victory in a new bot

When `create-bot` arrives with only an idea, design backwards from the **first victory**: the
smallest real outcome that proves the bot can help this person work. It does not force a complete identity before use.

The person's **professional profile emerges progressively through use**, when enabled. First
configuration may ask whether to use that module, explaining both outcomes without recommending
either option. It never requests a CV, résumé, work history or life story during first use. Facts
stated while doing real work may become small candidates for `save-to-lore` at a natural milestone;
until the person reviews them, they are context rather than identity. If disabled, no profile file or
biographical proposals are created and every other capability remains available.

### Orientation for somebody new to the kit — suggested, never asked — 2.3.0

When this skill is running the kit's **first use** (`use-lore` §0 hands the conversation here), the
person may have no picture of what Lore is. Suggest **one** short orientation and infer its shape
from how they have been writing — a concept map, a short text, a plain-language explanation, a worked
example over the artifact they are about to receive. `use-lore` §0 carries the inference rule and the
exact wording; do not duplicate it here.

Two limits, not courtesies:

- **It is an offer, not a question.** «One question at a time» is a budget, and a question that does
  not change the design spends it for nothing. Which tutorial format somebody prefers changes no
  artifact — so it is proposed in one line, corrected in one line, and never becomes a decision the
  conversation waits on.
- **It never runs instead of the design.** The threshold of this skill is an approved design, and an
  orientation delivered in its place is a conversation that felt productive and moved nothing. If
  only one of the two fits in the turn, it is the design.

### The prior agreement — offered, never imposed

This is an offer of shape, not a requirement, and it stays optional: decline it and the design goes on as it
would have. A skeleton that turns into a checklist is ceremony. `conjecture`: one origin, no replication yet.
It ascends when a piece built under it is read as better without explanation; it is refuted when the skeleton
is walked through and no decision changes.

When it is offered, the conversation moves **one point per message** — a short proposal, one question, the
recommended option with the risk it takes. Before anything is built, the agreement fixes what the piece is and
what it cannot be, on three axes the area fills in its own words: **why** (the heart: what it exists for, what
it must let someone feel or do), **what** (lineage and form), **how** (material and references). It writes its two
closures first: the hard limits and the agreed pruning. A block may answer «none»; the decision cannot be skipped.

It names a **surprise reserve**: the execution, not the idea, stays with whoever builds. What is approved is not
reopened on the agent's own initiative; anything better found while building is said out loud and left as a dated
amendment, never changed in silence. The first look at the result arrives without the numbers, from someone who
never saw the apparatus.

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

Work with partial goals honestly: PARTIAL → DISCOVERY → RATIFIED WORKING GOAL. Ask the minimum
that buys a first victory; a usable goal is specific enough to guide choice without pre-deciding it.

## 6. Handoff after approval

After approval:

1. record the approved design in the active task state when the environment supports it;
2. hand execution to the **native Plan Mode** or planning mechanism available in the current agent;
3. invoke the artifact's owner skill at the point it becomes responsible;
4. keep any later owner-specific threshold intact;
5. if during design the current shape stops sufficing — the problem is no longer design inside the
   form — hand the ratified partial goal to the bounded-operation skill instead of forcing the
   design; never become that operation yourself.

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
- Structural work maintains an accumulated artifact and periodically proves recognizable continuity.
- Fertile effort changes the artifact or criterion; agreement and pleasing are not substitutes.
- Independent advances return through recap and approved distillation; constant contact is not required.
- Compare two or three approaches when a consequential choice exists.
- Design depth scales; explicit approval remains.
- Owner skills keep ownership and their own threshold.
- No spec file, commit, push or implementation is implied by brainstorming approval.
- The workflow remains provider-neutral and domain-neutral.
