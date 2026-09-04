---
name: use-lore
description: Use when the user mentions "lore", asks how this kit or its skills work, installs or updates the plugin, is unsure which Lore skill to invoke, starts a new work area, project or bot, wants to migrate an old project to the Lore standard, or keeps loose notes in the same folder tree as their Lore.
---

# Using Lore

Yesterday you and an agent solved something hard. You argued about the edges, you threw away two
approaches, and the thing finally worked. Today, new session, you are explaining it again from the
beginning — and the agent is not worse. It simply never received what the two of you worked out. The
facts may have survived in a file somewhere. **The reason you changed your mind did not.**

Lore is a **spec-driven development kit** built for that gap: it turns scattered, tacit project
knowledge into **distilled, invariant criteria** that constrain every future decision. Where other
SDD kits speak in pure engineering terms, this one borrows a linguistic and epistemic vocabulary —
*lore, identity, principles, transmutation, distillation* — to name the same discipline.

This skill is the map. It teaches the model and points at the operating skills. Read it before
invoking any other Lore skill.

> **This skill governs session openings too.** A session that opens — including one resumed from a continuity summary, or handed an unfinished task — resolves what Lore governs its tree **before
> continuing**, and loads it silently. In a bot, load its canon
> and routing table first. **Do not preload every federated body**: load only the bodies selected by the task,
> leaving the rest reachable through the routing table. A change of territory
> mid-session (new task type, new tree) re-resolves the same way. *"Finishing what was started" is
> not an exemption: continuing is deciding.* Criterion that waits to be remembered is criterion
> that does not run.
>
> **Every session opening checks that those bodies can load.** In a tree with `lore/`, run the
> bundled `lore-plugin mycelium bodies --tree <root>` check against the governed root just resolved above before relying on its criterion. When a territory change resolves another root, repeat the check. If the
> bundled command is unavailable, inspect the same two links directly: contract → core pieces
> (`identidad`, `principios`, `index`) and index → thematic modules. A clean check says nothing and
> work continues. A missing link stops reliance on that body and names only the concrete decision:
> connect it, or declare it explicitly outside the universe. Never edit either side automatically.
>
> **This is also where the process announcement is claimed, when there is one to make — 2.4.8.** Its
> contract, its pool and the reason it is in trial are in *Move 3*, under **The process announcement**.
> This is the cheap body-load check, not a full MYCELIUM pass and not a fourth trigger for that mode.
>
> **Ordinary communication has only three shapes:** the result when work finished; the decision or
> approval needed when something blocks it; silence when automatic work is clean. Loading, routing,
> skill selection, mode selection and file classification stay below the conversation. If the user
> names a specific skill or mode, or asks for technical detail, use that exact name and explain it.
> Mentioning Lore in general or editing a path under `lore/` does not activate this exception.
> Completing the installed lifecycle check after a user-authorized Lore edit is normal closure, not
> an expansion of scope. It authorizes no unrelated edit. If the host still needs tool or filesystem
> permission, ask only for that permission in plain language.

## 0. Very first use of the kit — a brainstorm, not a menu (threshold)

**If this machine has no Lore yet** — no area with a `lore/`, no project carrying the six pieces —
this runs **before anything else**, and before offering any skill by name. The kit **brainstorms to
build** every artifact it makes; it would be incoherent for the kit itself to greet its first user
with a list of seven skills.

> **Invoke Lore Plugin's own `brainstorming-lore` skill** (`lore:brainstorming-lore` where skills are
> namespaced) and run this through it. If the runtime failed to expose an installed Lore skill,
> run the minimal version below yourself. A kit that cannot start without a third-party skill is a
> kit that does not start.

### Move 1 — look before asking

Scan the working tree and put on screen what is actually there: folders that look like work areas,
projects with scattered criteria (a bloated `CLAUDE.md`, a kilometric `README`, an empty or stale
`lore/`), and any free-note inbox. Short lines, no prose.

This is the presentation **and** the pre-flight at once. Close it with the coverage, never with a
clean bill of health: what you verified is that these folders exist and what shape they are in, not
that any of it is good.

### Move 2 — brainstorm, one question at a time

Follow the thread of the answers instead of walking a list. **Ask only what changes which skill
runs first:**

- What do you work on, in your own words? (stored verbatim — it is the yardstick every later
  arbitration needs)
- Is this one kind of work or several? Ask by the **condition**, never with a closed list: *«does
  your work fall into more than one of these?»* If the answer names more than one, that is an
  **area per kind**, and the border question comes before executing anything.
- Does criteria for this already exist somewhere — in your head, in a doc, in an old repo? That is
  the difference between `create-area` and `transmute-lore`, and the user is the only one who knows.
- Is there anything explicitly out of bounds?

> **A request for a bot is routed through this gate, never answered by it.** Someone arriving with
> *«I want to build my bots»* has already named the deliverable, and the questions above will then
> read their answers as **kinds of work** — which is exactly how *«three bots»* becomes three areas,
> each one looking like a correct artifact. What is actually true is narrower: the Lore a bot routes
> to does not exist yet. So the areas are **steps**, the bot is the deliverable, and `create-bot` runs **last**.
> Explain the whole chain in the user's task language with its honest cost — one area plus one pass
> per source before the bot can route to anything — and never report an area as the
> finished answer to a request for a bot.

### Move 3 — close by naming the route, and run it

State the first operation and why, in one line, then invoke its owning skill silently. Do not name
the skill unless the user named it or asked for technical detail. Do not list the other seven. The
map below exists for **you**, so you can pick; it is not a menu to hand over.

**When the first operation does not deliver what was asked for, state the final operation in the
same line, without its internal name.** The route is the answer, not its opening step — and the step
that gets forgotten is always the one that was still pending when the first artifact came out
looking finished.

> **What this move must never do is end in a recommendation.** The first use of the kit produces a
> first artifact, or it produced nothing.

**Apply the register here, silently, and do not spend a turn on it.** By now the person has
written several answers, which is the evidence: technical vocabulary used comfortably and without
explanation → `tecnico`; the work described in its own domain's words → `llano`; anything else →
`equilibrado`. Mention it only if the person asks about tone or a correction is needed. Then write it
into `identidad.md` as `registro:` when the first artifact is created.

**Never ask it as a question.** Tone is inferred and corrected in one sentence; a brainstorm turn
spent on register buys nothing, and this move exists to produce an artifact.

**And offer a short orientation in the same breath, inferred like the register — one shape, never a
menu — 2.3.0.** Somebody meeting this kit for the first time has no picture of what it is, and a list
of seven skills is not that picture. Pick **one** shape from what the person already wrote: they
asked what it does or how it works → a short text; they described their work as a structure or a set
of relations → a concept map; they write in fragments and want to be shown rather than told → a
worked example over the artifact they are about to get; they answered tersely and moved fast → skip
it, and say once that it exists.

**It costs one line and never a turn:** *«Want the two-minute picture of how this fits together? I'd
draw it as a map.»* Yes → produce it **about their own tree**, never a generic diagram. No, or
silence → continue, and do not offer it again.

**Never expand it into a list of options.** *«Concept map, short text, plain explanation or a mini
test?»* is exactly the menu this section refuses, wearing a friendlier face. One inferred shape,
corrected in one sentence, for the same reason the register is.

**And it never replaces the artifact.** Move 3 produces something or it produced nothing; a tutorial
handed over *instead* of a first artifact is the kit explaining itself to somebody who still has
nothing to show for the conversation. Offer it, then run the route.

### The process announcement — the same orientation, in drip mode, and in trial — 2.4.8

The two-minute picture is offered once, to somebody new. The **process announcement** is that same
orientation spread thin over a tree already in use: one sentence, **written as prose by you** — never
a hook, never `additionalContext` — saying what class of work comes next and what the person will
have to judge. It is decoupled from the moment of execution: no threshold, no confirmation, nothing
blocked, nothing waited on.

**What it may say is settled by a contrast, not by a paragraph:**

| | Sentence | Why |
|---|---|---|
| **Never** | *«MYCELIUM is going to verify how the clues connect…»* | narrates the machinery: it names a mode and a mechanism |
| **This** | *«I'll look first at what criterion already governs this project, so I don't duplicate it»* | makes **the action that follows** legible, naming no mode, skill or internal part |

**The rule in one line: do not narrate the machinery; make the action that follows legible.** Its
mechanical test: **an announcement that cannot be written without naming an internal part of the kit
is an announcement that does not go out.** So this permits nothing the rule above ever forbade —
selecting an operation still does not announce it, and the names in the routing table stay yours.

**What earns a slot is what class of work comes and what the person will have to judge.** Measured,
not imagined: reading one long session back for the places an announcement would have helped returned
three, and the one that earned its place was the one that would have caught a real error — not the
one that described a process.

**Equalized, and the pool is small on purpose.** Three per tree, claimed against the session-opening
check that already runs: `lore-plugin mycelium announce --tree <root>` — exit 0 means there was
budget and it was spent, exit 1 means there is none, and a tree with no recorded sweep has no pool at
all. **At most one per session, and that half is this instruction and nothing else:** the command
meters per tree and has no session identifier, so nothing verifies it. **Omitted entirely when the
person arrives with an urgent instruction** — framing work nobody asked to have framed is ceremony,
not orientation.

**It is in trial, and one question judges it: does it add orientation, or does it add ceremony?** Its
observable form is that the announcements start getting read past. If that happens, the feature lost
and it is withdrawn before publication. **Nothing may be built that depends on it.**

**Boundary:** this gate is for the **first** Lore on the machine. Once one area exists, entry is by
the routing table below and this section is skipped.

## The standard: the skill runs, and it is the current one

Three rules that hold for **every** new Lore configuration the user builds, forever, not only the
first:

Before applying the version gate, read LEAVE state in `FASES.md`. A `leave:partial` marker means the
exit never finished: resume LEAVE from its checklist and do not start another structural operation.
A final `leave:` marker means governance is intentionally dormant; offer UPGRADE once if the person
wants to re-enter, because UPGRADE owns restoration from the retained checklist. Otherwise leave the
tree dormant and continue without treating its version as an upgrade debt.

1. **The skill that governs an artifact is always invoked to write it.** Not consulted afterwards,
   not imitated from memory. See *The failure these skills cannot see*, below.
2. **The version that runs is the installed, up-to-date one.** These skills accumulate scars: a
   version behind is a version that does not carry the last defeat somebody already paid for. If the
   installed copy is stale, updating it comes **before** the work, not after — and the plugin cache
   is indexed by version, so what was published without a version bump was never received.
3. **A project's own Lore is checked against the kit too, not only which skill runs.** Before
   non-trivial work on a project that already has `lore/`, read its `FASES.md` for the most recent
   `## UPGRADE a X.Y.Z` line and compare that version to the installed kit's. If the kit is ahead,
   determine whether the delta between the local version and the installed version actually affects
   this tree: collect the RELEASE notes between those two versions first, then intersect module names
   with what this tree uses — the module list in its `lore/index.md` + `lore/enrutamiento.md`, its shape
   (area/project/bot), and any open concern in its `FASES.md` that explicitly names an affected module.
   `Uses Lore` in general is not an intersection; a module name must appear on both sides. Do not infer
   affect from the version number alone. If there is no intersection — e.g. a BlockVoz/redaccion-noticias
   project on 2.3.0 with kit 2.3.1–2.3.2 where the delta (save-to-lore provenance and note archive,
   use-lore session guard, 2.3.2 gate itself) touches none of `anatomia-nota`/`estilo-y-legibilidad`/`fuentes-y-transcripcion`
   — say nothing and do not block; continue with the work. `Kit is ahead so I must offer` without checking
   the delta is the rationalization this gate exists to stop. Silence when unaffected is the correct outcome,
   not a missed check. If there is an intersection, say so plainly and offer to update the local Lore
   once, before the work starts; invoke the matching operation internally — a healthy Lore behind the kit looks correct in every
   reading, which is exactly why nobody notices on its own. If the person defers, proceed; do not repeat the offer on every later message in the same session. If release notes for any version in the
   interval are missing, do not claim that the tree is affected or unaffected: report the evidence gap,
   offer one optional manual UPGRADE review, and do not block the work if the person defers.

> **Right after installing or updating the kit, run `transmute-lore` in **MYCELIUM** mode over the
> Lore already on this machine.** An update changes what the skills demand; the criteria written
> against the previous one does not move by itself. On a machine with no Lore yet the answer is
> `0 of 0` — report it as such and say plainly that it proves nothing yet, because there is nothing
> that could be disconnected.

> **Rule 3 is not MYCELIUM, and must not fold into it.** Rule 3 asks one cheap, deterministic
> question — is the *kit* ahead of what this Lore was written against? MYCELIUM asks whether a
> *specific clue*, already in the standard, can fire. A stale version and a disconnected clue can
> both be true, or only one, and the repair for each is different — merging the two would put back,
> inside a mode that just paid to remove exactly this, the layer `MYCELIUM` was pruned of.

*Why this is a standard and not advice:* the value of the kit is cumulative and lives in the skills.
An agent who writes criteria by hand, or who runs a version from three fixes ago, produces something
that looks identical and silently lacks the gates. Nothing in the output announces it.

## Complex deliverables — fix the yardstick before the batch

When the requested result combines a structure with many pieces — a researched CRM, a document
assembled from several sources, a campaign, or delivery into an external system — Lore still routes
the criteria; it does not become a ninth production skill.

Before producing:

0. **Run `transmute-lore` in MYCELIUM mode over that project's Lore** — before a complex task, not
   after it. **And again after anything that wrote Lore**, before the work leans on the result: a
   clue that was just written is joined to nothing yet. It is read-only and it answers one question the loading cannot: *of the criteria I am
   about to lean on, how much of it can actually fire?* A clue nothing runs will not announce itself
   while you work; it announces itself as a deliverable that quietly broke a written rule.
   When the writing happened inside `save-to-lore` or a `transmute-lore` writing mode, that exit
   scan is **their** closing gate, not a courtesy: the pass they ran is not done, and this work does
   not start, until the scan has run and every finding is a two-sided junction or a written decline.
   A finding deferred "to a later pass" leaves the bracket open.
1. Name the owning project and load its routed Lore.
2. Fix the quality yardstick from an **approved precedent** for that class of deliverable. If none
   exists, the human must approve a representative piece or explicit criteria before the batch.
3. Verify the **available tools, connectors or MCPs** against the real source and destination. Never
   promise scraping, document generation or external delivery from a capability that was not tested.
4. **When the batch splits into mechanical bulk and arbitration**, and a lighter model plausibly
   covers the bulk at the same quality, name that split and suggest `/model` to run it on a cheaper
   tier for that part, then switch back for arbitration and review. Never spend a subagent on it —
   a fresh subagent re-reads the project's whole Lore before it can start, which burns exactly the
   tokens this move exists to save; `/model` keeps the same session and its already-loaded context.
5. Make the structure and fixed facts visible, then produce in reviewable batches. A batch inherits
   the same yardstick; it does not renegotiate quality piece by piece.
6. Keep **human review** between each consequential batch and the word *definitive*. Delivery is
   complete only when the target contains the reviewed result and that state was checked.

Invoke the domain skill that owns each medium or tool. This route coordinates criteria, precedent,
work and review; it does not duplicate document, scraping, connector or publishing instructions.

## What Lore is (and is not)

**Lore is criteria that persists** — the rules, the standard, the hard-won scars — kept separate
from **state that advances** (the current phase, the todo). A "Pista Invariante" (invariant clue)
is the atom of Lore: `Context → Root cause → Clue → Confidence`. If a sentence does not constrain
a future decision, it is **not** Lore; it is description, and it stays out.

Lore is **not** a README, not a changelog, not a design doc. Those describe. Lore constrains.

The relational shape is **autonomy with return**. Human and agent may advance independently; Lore
does not demand constant contact or fuse them into one author. At a contextual milestone,
**distillation resynchronizes** the shared criterion: each side can return to the same constraints
and continue without pretending that no drift occurred.

An **enjoyable Entre** is not one that always pleases. It is one where shared effort is perceived as
fertile because disagreement, correction and review leave recognizable movement in the artifact or
criterion. Ease, agreement and usage volume are not proxies for that fertility; when effort leaves
no usable change, the process must be repaired rather than celebrated.

**Most of what happens does not survive, and that is the design.** A Lore is not an archive of the
work; it is the narrow part of the work that still gets a say. Its worth is counted in future
decisions changed, never in experience held — and a body that grew by preserving fails without any
visible symptom, because a full folder looks exactly like a healthy one.

Which means the filter above is not a quality bar an entry has to clear. It is what is left over
after accepting that the rest is gone. Read the other way round — *keep what might matter someday* —
the same sentence licenses everything, and the Lore stops constraining the moment it stops losing.

## The six-piece standard

These are six structural responsibilities, not necessarily six files. The thematic-module piece
may contain many focused files; the other five usually map to one file each.

Every project's criteria lives in exactly these artifacts:

| Artifact | Holds | Location |
|---|---|---|
| `identidad.md` | What the project is, its purpose, its **quality floor** (the north star). | `lore/` |
| `principios.md` | Invariant laws (technical + business): prohibitions and imperatives. | `lore/` |
| Thematic modules | Technical scars by topic (animation, layout, scroll…) as invariant clues. | `lore/` |
| `index.md` | Navigation map of the lore: one line per pattern. | `lore/` |
| `FASES.md` | The project's state and plan (current phase, focus). **Outside `lore/`.** | root |
| `CLAUDE.md` or `AGENTS.md` | The one host-selected contract, slimmed to **pointers** (never duplicated criteria). | root |

> Lore is criteria (it persists); `FASES.md` is state (it advances). Never mix them.

### The always-on block inside the contract

The contract is the only artifact **both** hosts load without being asked. That makes it the kit's
always-on channel, and the pointer section that lives there is delimited so it can be found and
re-stamped without touching anything else:

```markdown
<!-- lore:always-on -->
…what Lore governs here · where it lives · where the state lives · when to invoke instead of writing by hand…
<!-- /lore:always-on -->
```

Markers are **literal**: no spacing variants, no attributes, no version number. They are located by
full-line match after trimming whitespace.

**Contents — exactly four things, in this order.** What Lore governs here; where it lives (relative
paths that resolve from the root); **where the state lives** (`FASES.md`, one line, path only); and
the signal that writing criteria by hand feels like competence and is the moment to invoke the skill.
Nothing else. Reproducing a clue, listing the seven skills or explaining what Lore is belongs
elsewhere and already has an owner.

> **Why state earns a line in a block that is otherwise about criteria.** Criteria and state are two
> files with two rules, and that separation is not negotiable — `FASES.md` never lives inside `lore/`.
> But separate **storage** was never an argument for separate **delivery**, and the session receiving
> them cannot read twice. An agent that loads the criteria and not the phase knows how the work must
> be done and not which work is next, so it proposes correctly and **out of order** — and nothing in
> its output announces the gap.
>
> Today the phase reaches the session through the contract's hand-written prose, which is precisely
> the half this skill documents as the one that goes stale: the skills re-stamp the block and never
> touch the rest. So the durable half carries criteria forever and the rotting half carries state.
>
> **It is a pointer, not content.** The path is stable; only its target churns. Nothing about the
> phase, the roadmap or the current task enters the block — one line saying where to look. That is
> what keeps this from being the fusion the law forbids.

**Ceiling: 25 lines, markers included.** Hard limit, not guidance. If a variant's content does not
fit, the answer is never to raise the ceiling — it is to move content into `lore/`, where it lives.
The first exception to a ceiling is how the ceiling dies.

**Three variants**, same ceiling: an **area** points at its own `lore/`; a **project** points at its
own layer and its mother area's; a **bot** points at `canon/` and at its **routing table**, never at
the federated Lores one by one — a bot that federates many sources fits precisely because it
delegates to the table. All three point at their own `FASES.md`, which is one line and does not
scale with the number of sources.

**Stamping is idempotent**, and it is done by the skills that already write the contract
(`create-area`, `create-project`, `create-bot`), inside the threshold they already have —
`transmute-lore` in UPGRADE mode adds it to contracts that predate it. No new gate, no operation to
remember:

| What is on disk | What happens |
|---|---|
| No markers | Insert the block after the contract's first H1 (or at the top if there is none) |
| One well-formed pair, content identical | **NO-OP — write nothing.** Rewriting identical content dirties the diff and makes `git status` lie |
| One well-formed pair, content differs | **Report the divergence and wait for a decision.** A human edit inside the block is a decision, not a sync error |
| Duplicated or broken markers | **Stop and report.** Never guess |

Apart from the block, the file does not change — not one blank line, not a different line ending.

**The table covers the markers; it does not cover the prose around them.** A contract written before
the block usually already has a load section naming the same paths, and stamping leaves the project
with two copies of its own pointers. Of the two, the one that goes stale is **not** the block — the
skills re-stamp that one — so the drift lands in the hand-written section, which is also the one a
human is more likely to read first.

The fix is never to skip the block. It is to leave the pointers **only** inside it and reduce the
pre-existing section to what the block does not carry: routing, procedure, gates. Report the
collision and the proposed reduction inside the same threshold, and never do it silently — deleting
a line somebody wrote by hand is a decision, not a cleanup.

## The area ↔ project model

Lore scales through **work areas**:

- An **area** is a mother folder (e.g. `desarrollo-web/`) with its **own `lore/`** — the source of
  criteria its projects inherit. Generic modules live **once**, in the area.
- A **project** lives in `{area}/proyectos/{name}/` and gets its lore by **inheriting from the
  area**. It keeps only what is its own: `identidad.md` + `principios.md` (area base + a project
  layer) and an `index.md` that **points to the area's modules** via relative path
  (e.g. `../../../lore/animation.md`).

This keeps criteria DRY: fix a generic clue once in the area, every project sees it.

### The third shape: a bot

A **bot** is a project (it lives at `{area}/proyectos/{slug}/`) with one extra property: it
**routes outward** into Lore owned by other projects and areas. It is a folder you open, not a
plugin you install. To hand it to someone who does not have your folders, crystallize it.

| | Area | Project | Bot |
|---|---|---|---|
| Holds | projects | one piece of work | **a work session** |
| Its Lore governs | the domain's method | that work | **how the agent behaves** |
| Installable | no | no | no |

Areas and projects are places; a bot is a lens you carry into them. A bot owns none of the criteria
it routes to — which is exactly why it is **not** an area: an area that accumulates criteria it
never paid for will start receiving promotions that belong somewhere else.

## The skills — when to invoke which

| You want to… | Invoke |
|---|---|
| Start a **new work area** (a mother folder for a family of projects) | `create-area` |
| Start a **new project inside an existing area** | `create-project` |
| Build a **bot** — a canon-driven work session that operates across real repositories, either from zero or by federating Lore already dissolved across several areas | `create-bot` |
| Open Lore-governed bots/projects through a small local provider and model launcher | `create-bot` (optional extra: a minimum local registry and script) |
| **Save a lesson** ("save to lore") — capture a clue from **lived friction**, or from a rule/vara the user just defined and asked to reuse ("guarda esta vara/definición") | `save-to-lore` (**CAPTURE**, default) |
| **Distill from an external body of criteria** — a skill, a style guide, a third-party playbook ("destila esta skill") | `save-to-lore` (**GRAFT**): imported criteria is judged against this Entre's purpose; only what survives enters, and the module must state **where the source loses** |
| Bring an **old project with scattered criteria** up to the six-piece standard | `transmute-lore` (**ADD**): extracts what is trapped in READMEs, contracts and comments and lifts it to the six pieces — without losing it and without inventing what never existed |
| **Clean** a project's redundant modules back down to what the area already owns | `transmute-lore` (**CLEAN**): removes only thematic modules whose criteria already lives in the area, never `identidad.md` / `principios.md` / `index.md`, and rewrites the index to point up |
| **Standardize the language** of an existing Lore | `transmute-lore` (**TRANSLATE**): content and localizable filenames together, meaning-preserving, never a rewrite and never a broken link |
| **Raise a healthy Lore to a newer version of these skills** — it is in the standard and in use, but predates gates the kit learned later. Nothing looks broken, which is why nobody upgrades it | `transmute-lore` (**UPGRADE**): map the tree first, then arbitrate against the current version; adds what is missing and leaves what the project **earned**. On a campaign, the threshold is per class |
| **Prune a Lore that grew** — nothing in it is wrong, and the work coming out of it goes in circles, hedges, or arrives buried in apparatus. The loudest symptom is the owner writing the deliverable by hand instead ("poda en lore") | `transmute-lore` (**PRUNE**): counts apparatus against content, separates criteria that no longer constrains anything from criteria that is correct but **saturating in sum**, and treats a smaller corpus as the result. Nothing comes out without its residue written down |
| **Check whether a Lore can actually fire** before leaning on it for real work, right after installing/updating the kit, **and again on the way out of any pass that wrote Lore** (`PRUNE`, `GRAFT`, a distillation) — it looks healthy, and *looking* healthy is exactly the symptom | `transmute-lore` (**MYCELIUM**): read-only walk of the network reporting which clues have **no micorriza** — no step of any procedure runs them. Reports pairs (clue ⇢ missing junction) and a rate, never a score; proposes the enchufe and never prunes. **Three triggers, and the exit pass is not the entry pass repeated:** a new clue is born `Aislada`, so a pass that writes manufactures the very defect this mode detects, and the scan that ran before it cannot see its own output. In `save-to-lore` and every `transmute-lore` writing mode the exit scan is a **closing gate** — the pass is not done until it runs and every finding is written or declined |
| Leave Lore without losing the project — remove governance, keep `lore/` and routing as plain `enrutamiento.md` | `transmute-lore` (**LEAVE**): one-pass structural removal of the `<!-- lore:always-on -->` block, conversion of `FASES.md` to host init, project stays buildable; a kit you cannot leave makes `H13` unmeasurable |
| Export a project, Area or bot's **live routed Lore as one Markdown** for a chat, AI project or notebook — and **extract** that file back into a folder whose routing table resolves | `transmute-lore` (**CRYSTALLIZE**): inlines every routed `lore/` (including `lore-ecosistema/`) into one snapshot marked so the bundled script can unpack it; a file that only points at missing bodies has failed the mode |
| Capture or **mine loose notes** (`notas/`, `notes/`, `apuntes/`, `.md`, `.txt`, `.docx`) and route what deserves to become criteria | `save-to-lore` — read its conditional `notas.md` function |
| Work in a repository that **also** has GitHub's spec-kit (`.specify/` is present) | Nothing new to invoke. Read [`docs/SPEC_KIT_en.md`](../../docs/SPEC_KIT_en.md) and copy `assets/constitucion-puntero.md` over the constitution `specify init` generated. **Lore never depends on spec-kit** — this row is recognition, not a dependency |
| **Decide whether to add spec-kit** to a repository that has Lore | Answer by level before installing anything: an **area** does not take it — its unit of work is a clue, not a feature; a **project** takes the whole cycle; a **bot** takes `specify → plan → tasks` only, and `implement` runs in the destination repository its spec names. Table and the closing clause for the bot case: [`docs/SPEC_KIT_en.md`](../../docs/SPEC_KIT_en.md) |

> **Gate before adding a mode:** If your task touches an artifact that is **not a clue** — the governance block, the host contract, `FASES.md`, `enrutamiento.md`, the shape of the tree — it is `transmute-lore` class; check this table first. Writing a clue **and** its `index.md` line is one capture, not two artifacts. No row matches → run `brainstorming-lore` before choosing a skill. Proximity batching without this check put `Exit` in `save-to-lore` (`H14`, `837eb73`).

> **The names in the right-hand column select the operation; they do not announce it.** Report the
> result, ask for the decision that blocks progress, or say nothing when the automatic work is clean.
> Use the verb in the user's language — *"we could trim this"*, *"that guide is worth adding"*,
> *"this one should be saved"*. Exact skill and mode names stay in documentation and diagnostics,
> unless the user names one or asks for technical detail.
| Understand the system / decide which skill applies | `use-lore` (this one) |

**Order of a fresh setup:** `create-area` → `create-project` → (work, saving clues with `save-to-lore`)
→ `transmute-lore` as needed. A **bot** is the last step when that is the deliverable, not a
precondition: if the sources have no Lore yet, `create-area` and `transmute-lore` add run first and
`create-bot` runs last. `create-bot` orchestrates that chain; it does not require Lore to already
exist, and it never substitutes for building it in the Area that owns it.

**Source-side precedence:** when a request points at `notas/`, `notes/`, `apuntes/` or another loose-note
folder and asks to integrate, extract, distill or save its contents anywhere, invoke `save-to-lore`
and read its conditional `notas.md` function first. A domain skill understanding the notes does not
replace the source-side sweep, debt report, classification, frontmatter or archive.

### The failure these skills cannot see: not being invoked at all

Every skill above describes what to do **once you are inside it**. None of them fires if you never
enter, and the moment you decide not to enter has a specific shape — it feels like competence:

| The thought | What it actually means |
|---|---|
| "I already know what to write" | **Invoke.** This is the signal, not the exemption. |
| "This is faster to write by hand" | It is. That is why the skipped step is the one with the gate. |
| "It's one clue, not a migration" | One clue is exactly `save-to-lore`'s unit of work. |
| "I'll invoke it after I draft the file" | The skill decides the **mode**, and the mode decides what the draft must contain. |
| "The lore is small / this project is simple" | Size is not the classifier. Source of the criteria is. |
| "The research/domain skill already read the notes" | Reading is not mining. If the source is an inbox, load `save-to-lore/notas.md` and leave a trace in every note. |

**There is no error signal for this.** Criteria written by hand comes out well-worded, lands in the
right file, and passes human review. What is missing does not look missing, because it never got
written: the provenance header, the confidence markers, the defeats section — and, above all, the
**mode**. An agent who assumes CAPTURE when the source was imported produces a module with no
defeats, which is precisely what GRAFT's exit gate rejects. Redacting well does not compensate
for skipping the gate; the gate was never about prose.

> **Writing into any `lore/`, `canon/` or `principios.md` without invoking the skill that governs it
> is applying the model's knowledge where the institutional one belonged** — the exact inversion the
> whole kit exists to prevent.

*Boundary:* this governs **writing** criteria while the skill is installed. Reading a Lore needs no
skill, and with the plugin absent you write by hand — and say that you did.

### project ↔ area routing (the key decision)

When you "save to lore", `save-to-lore` decides the **level**: project-specific criteria stays in the
project (`identidad.md` / `principios.md` project layer, or a project-only module); **generic +
confirmed** criteria is promoted up to the **area** lore, so every project inherits it. Capture is
always local first; promotion to the area is always gated. This is how the shared corpus grows
without polluting it with client-only quirks.

### Where experience comes from — notes are the entrance, not the destination

Most people arrive already holding a pile of free notes (Obsidian, a folder of Markdown, meeting
minutes). That pile is a legitimate **source** and it is not Lore: a note answers *«what happened»*,
Lore answers *«what changed in the relationship because of what happened»*. The path between them
has three steps and the middle one is an act, not a folder:

```text
experience piled up (notes)  →  distillation (an explicit pass + threshold)  →  criteria (lore/)
```

The conditional `save-to-lore/notas.md` function governs the first arrow when loose notes live in
the same tree as the Lore. It captures notes **outside any `lore/`**, mines the inbox and hands what
survives to CAPTURE or GRAFT. Obsidian is one possible editor, never a prerequisite.

> **Why an explicit mining pass and not simply "save when you feel like it".** A note satisfies the
> urge to preserve without producing criteria — the record exists, so the distillation never
> happens, and the criterion stays inert inside it. Separating notes from Lore does not fix that;
> only sweeping the inbox does.

## Language of the Lore

**Lore speaks the user's language.** These skills are written in English, but the Lore they
generate is not English by default: every artifact — **content AND filename** — is written in the
language the user works in. The artifact names used across these skills (`identidad.md`,
`principios.md`, `FASES.md`, `proyectos/`, `fuente/`) are the Spanish canonical forms; in another
language they localize (e.g. English: `identity.md`, `principles.md`, `PHASES.md`, `projects/`,
`source/`).

What stays **fixed in every language**: the selected contract name (`CLAUDE.md` for Claude Code or
`AGENTS.md` for Codex), `lore/`
(the kit's own name), `index.md`, `golden-paths.md`, `_starter/`, the `<!-- lore:always-on -->` marker pair (literal, never localized — localizing it breaks idempotent stamping silently), structure and relative-path depth,
confidence markers, and English terms of general technical use (workflow, commit, stack,
scaffold…).

**Consistency wins:** inside an existing area or project, the filenames already in use are the law
— never mix naming schemes. A Lore that ended up in the wrong language — or mixed — is standardized
with `transmute-lore` (TRANSLATE mode), which translates content and renames artifacts together.

## Invariants of the whole kit

- **Lore speaks the user's language.** Content and artifact filenames in the user's language; the
  fixed names (the selected contract name, `lore/`, `index.md`) and general technical English terms unchanged.
  Inside an existing corpus, its established names win.

  > **And this covers what the kit says out loud, not only what it writes to disk.** Skill and mode
  > names are internal identifiers, not conversational milestones. In ordinary conversation, report
  > the result or required action in the user's language. Keep exact identifiers in documentation and
  > diagnostics; use them with the user only when they name one or ask for technical detail.
  >
  > *Why this is not cosmetic.* Every mode ends at a threshold, and a threshold only works if the human
  > can agree or refuse **with the content in view**. Naming the machine's identifier asks them to
  > translate before they can judge, and a word standing between the user and the decision is a cost
  > the threshold pays. The kit already refuses to make people learn a CLI; making them learn its
  > internal vocabulary is the same mistake wearing prose.

- **The register is calibrated by the person reading, in three positions.** `tecnico` — the scene
  drops to a minimum, the specification stays. `equilibrado` *(default)* — half and half. `llano` —
  the scene grows, and a technical term is explained the first time it appears.

  > **What the calibrator never moves: the rules.** A threshold is still a threshold, a `MUST` is
  > still a `MUST`, a validity boundary is never omitted. What changes is **how much ground** surrounds
  > a rule, never whether the rule is there. A calibrator that could switch off a gate would be a way
  > of skipping the kit by asking it nicely.
  >
  > **It is never asked as a question.** The kit's own law is that tone is inferred from how the person
  > writes and corrected in one sentence, because spending a brainstorm turn on it buys nothing.
  > So: **infer and apply it silently**. Mention it only if the user asks about tone or a correction is
  > needed. The decision still belongs to the reader and costs no question.
  >
  > **Where it lives:** one line in `identidad.md`, under a `registro:` key. It is a **declared
  > preference, not criteria** — it constrains no decision about the work, so it is never promoted to
  > the area and never carries a confidence marker. Absent the line, assume `equilibrado`.
- **Criteria is never invented.** Every artifact is distilled from what already exists (docs, code,
  the user's words). An artifact with no real criteria stays minimal and says so.
- **Discarded noise is reported**, never deleted silently — the filter is transparent.
- **The threshold, before writing.** The skills that produce or restructure Lore present the proposed
  content and wait for explicit approval before touching disk.

  > **A threshold is never crossed alone.** The machine proposes with the content in view, the human
  > approves, and only then does anything get written. It is not a confirmation prompt and it is not
  > negotiable: a skill that writes before the threshold has failed, however good the result.
  >
  > *Until 2.0.9 this was called a HARD-GATE. Same rule, same force, and no exception was softened —
  > only the word, which came from a register this kit does not otherwise speak.*

  > **The threshold guards the skills, and nothing guards the text editor.** `save-to-lore` demands a
  > confidence marker and a validity boundary; `transmute-lore` UPGRADE catches their absence on a
  > later pass, which may be months away. **Opening a `lore/` file and typing has no gate at all** —
  > and that is the path most criteria actually takes. Measured once: an author of this kit spent a
  > day writing 241 lines of criteria into a Lore he had diagnosed that same morning for missing
  > boundaries, and produced one. The defect survived the best possible case, so it is a property of
  > the mechanism, not of anyone's discipline. Until a gate exists, **the check is a count**: clues
  > added against boundaries declared. It costs one `grep`.
  >
  > **And the count is a completeness check, never a quality one.** Measured head to head: two
  > versions of this kit ran the same task on the same corpus, and the older one declared more
  > validity boundaries (23 against 20) and far more confidence markers (+22 against +1) — then lost
  > the deliverable 3 to 1 with the corpus owner judging blind, on reasons that named no capability of
  > the kit. Counting the artifacts of criteria counts **acts of writing**, and those happen on the day
  > of the run; what the artifacts are worth arrives months later, the first time someone reads the
  > clue. A run that scores well has declared its boundaries. It has not shown they were worth
  > declaring — and a kit that publishes a benchmark figure cannot let those two be the same number.
- **A paragraph is a paragraph.** Continuous prose in `lore/`, the instruction contract and
  `FASES.md` runs to the period, not to column 80. Lists, tables, headings and code blocks keep
  their shape. Only rewrite a file the pass already has to touch — unwrapping a whole tree is a
  format pass, not an upgrade. This does not govern published version notes, bench fixtures,
  verbatim quotations, or the wrap inside these `SKILL.md` files (that last one is a version
  decision). The same rule covers every artifact these skills write.
- **No automatic commits.** The user reviews the diff and commits when they choose.
- **State ≠ criteria.** `FASES.md` never lives inside `lore/`.
- **A note is source, never criteria.** Free notes are never loaded as if they were Lore; they cross
  only through an explicit distillation with its gate.
- **Lore never defers to another kit's authority, and never depends on one.** Where a second kit of
  criteria shares the repository, it is **recognized, not obeyed**: its declarations are imported
  criteria and get arbitrated like any other. This is not a claim of supremacy — it is what makes
  precedence structural instead of declared. A body of criteria that does not consult another cannot
  be overruled by it, and that holds no matter what the other body's files say about themselves.

- **A check that runs is not a check that lands.** `MYCELIUM` reports which clues have no junction
  with any step; plugging in a check's *execution* does not plug in its *result*. Run it before a
  complex task and after updating the kit, resolve the **owning area of every tree the work touches**
  first, and let its findings block what comes next.

## Adapting Lore to other AI tools

The portable substrate is the **`SKILL.md`** file itself: YAML frontmatter (`name`, `description`)
plus a Markdown body. Native packaging is host-specific — Lore ships manifests for Claude Code and
Codex — but the skills are plain Markdown. Copy a skill's folder into another tool that reads
instruction files, or paste its body as a system/persona prompt. The six-piece standard and the
area↔project model are tool-agnostic conventions, not code.
