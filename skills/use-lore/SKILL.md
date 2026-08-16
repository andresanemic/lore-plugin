---
name: use-lore
description: Read this first to understand the Lore system — what Lore is, the six-piece standard, the area↔project model, and which of the Lore skills (brainstorming-lore, create-area, create-project, create-bot, save-to-lore, transmute-lore, obsidian-lore) to invoke when. Carries the kit's threshold for its very first use on a machine with no Lore yet (a brainstorm, never a menu of commands) and the standard that governs every later one — the skill that owns an artifact is always invoked to write it, and the version that runs is the installed, up-to-date one. Use when the user mentions "lore", asks how this kit works, installs or updates the plugin, starts a new work area, project or bot, wants to migrate an old project to the Lore standard, or keeps Obsidian notes in the same folder tree.
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

## 0. Very first use of the kit — a brainstorm, not a menu (threshold)

**If this machine has no Lore yet** — no area with a `lore/`, no project carrying the six pieces —
this runs **before anything else**, and before offering any skill by name. The kit **brainstorms to
build** every artifact it makes; it would be incoherent for the kit itself to greet its first user
with a list of eight skills.

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

### Move 3 — close by naming the route, and run it

State which skill runs first and why, in one line, then run it. Do not list the other seven. The map
below exists for **you**, so you can pick; it is not a menu to hand over.

> **What this move must never do is end in a recommendation.** The first use of the kit produces a
> first artifact, or it produced nothing.

**Declare the register here, in the same line, and do not spend a turn on it.** By now the person has
written several answers, which is the evidence: technical vocabulary used comfortably and without
explanation → `tecnico`; the work described in its own domain's words → `llano`; anything else →
`equilibrado`. Say which one you picked and offer the correction in the same breath — *"I'll keep the
technical vocabulary; tell me if you'd rather I explain as I go."* Then write it into `identidad.md`
as `registro:` when the first artifact is created.

**Never ask it as a question.** Tone is inferred and corrected in one sentence; a brainstorm turn
spent on register buys nothing, and this move exists to produce an artifact.

**Boundary:** this gate is for the **first** Lore on the machine. Once one area exists, entry is by
the routing table below and this section is skipped.

## The standard: the skill runs, and it is the current one

Two rules that hold for **every** new Lore configuration the user builds, forever, not only the
first:

1. **The skill that governs an artifact is always invoked to write it.** Not consulted afterwards,
   not imitated from memory. See *The failure these skills cannot see*, below.
2. **The version that runs is the installed, up-to-date one.** These skills accumulate scars: a
   version behind is a version that does not carry the last defeat somebody already paid for. If the
   installed copy is stale, updating it comes **before** the work, not after — and the plugin cache
   is indexed by version, so what was published without a version bump was never received.

*Why this is a standard and not advice:* the value of the kit is cumulative and lives in the skills.
An agent who writes criteria by hand, or who runs a version from three fixes ago, produces something
that looks identical and silently lacks the gates. Nothing in the output announces it.

## What Lore is (and is not)

**Lore is criteria that persists** — the rules, the standard, the hard-won scars — kept separate
from **state that advances** (the current phase, the todo). A "Pista Invariante" (invariant clue)
is the atom of Lore: `Context → Root cause → Clue → Confidence`. If a sentence does not constrain
a future decision, it is **not** Lore; it is description, and it stays out.

Lore is **not** a README, not a changelog, not a design doc. Those describe. Lore constrains.

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
Nothing else. Reproducing a clue, listing the eight skills or explaining what Lore is belongs
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
**routes outward** into Lore owned by other projects and areas. Packaging it as an installable
plugin is optional.

| | Area | Project | Bot |
|---|---|---|---|
| Holds | projects | one piece of work | **a work session** |
| Its Lore governs | the domain's method | that work | **how the agent behaves** |
| Installable | no | no | **optional** |

Areas and projects are places; a bot is a lens you carry into them. A bot owns none of the criteria
it routes to — which is exactly why it is **not** an area: an area that accumulates criteria it
never paid for will start receiving promotions that belong somewhere else.

## The skills — when to invoke which

| You want to… | Invoke |
|---|---|
| Start a **new work area** (a mother folder for a family of projects) | `create-area` |
| Start a **new project inside an existing area** | `create-project` |
| Build a **bot** — a canon-driven work session that operates across real repositories, either from zero or by federating Lore already dissolved across several areas | `create-bot` |
| Open Lore-governed bots/projects through a provider and model launcher | `create-bot`; use the separate `lore-in-the-shell` skill when installed, otherwise build its minimal fallback there |
| **Save a lesson** ("save to lore") — capture a clue from **lived friction** in the project and promote generic, confirmed ones up to the area | `save-to-lore` (**CAPTURE**, default) |
| **Distill from an external body of criteria** — a skill, a style guide, a third-party playbook ("destila esta skill") | `save-to-lore` (**TRANSPLANT**): imported criteria is judged against this Entre's purpose; only what survives enters, and the module must state **where the source loses** |
| Bring an **old project with scattered criteria** up to the six-piece standard, **clean** a project's redundant modules back down to what the area already owns, or **standardize the language** of an existing Lore | `transmute-lore` |
| **Raise a healthy Lore to a newer version of these skills** — it is in the standard and in use, but predates gates the kit learned later. Nothing looks broken, which is why nobody upgrades it | `transmute-lore` (**UPGRADE**): arbitrates the existing Lore against the current version, adds what is missing, and leaves untouched what the project **earned** with real friction |
| **Prune a Lore that grew** — nothing in it is wrong, and the work coming out of it goes in circles, hedges, or arrives buried in apparatus. The loudest symptom is the owner writing the deliverable by hand instead ("poda en lore") | `transmute-lore` (**PRUNE**): counts apparatus against content, separates criteria that no longer constrains anything from criteria that is correct but **saturating in sum**, and treats a smaller corpus as the result. Nothing comes out without its residue written down |
| Export a project, Area or bot's **live routed Lore as one Markdown** for a chat, AI project or notebook | `transmute-lore` (**CRYSTALLIZE**): creates a safe, traceable snapshot without replacing the live Lore or including private material by default |
| Keep **Obsidian notes in the same folder tree** as the Lore, and **mine that inbox** for what deserves to become criteria ("revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore") | `obsidian-lore` |
| Work in a repository that **also** has GitHub's spec-kit (`.specify/` is present) | Nothing new to invoke. Read [`docs/SPEC_KIT_en.md`](../../docs/SPEC_KIT_en.md) and copy `assets/constitucion-puntero.md` over the constitution `specify init` generated. **Lore never depends on spec-kit** — this row is recognition, not a dependency |
| **Decide whether to add spec-kit** to a repository that has Lore | Answer by level before installing anything: an **area** does not take it — its unit of work is a clue, not a feature; a **project** takes the whole cycle; a **bot** takes `specify → plan → tasks` only, and `implement` runs in the destination repository its spec names. Table and the closing clause for the bot case: [`docs/SPEC_KIT_en.md`](../../docs/SPEC_KIT_en.md) |

> **The mode names in the right-hand column select the operation. They are not how you announce it.**
> This table is what you read immediately before proposing something out loud, which makes it the
> place the machine's vocabulary leaks from. Say the **verb, in the user's language** — *"we could
> prune this"*, *"that skill is worth transplanting"*, *"this one should be saved"* — and keep
> `PRUNE`, `TRANSPLANT` and the rest for the documentation, where a reader needs the exact token. The
> skill name itself is always said as it is: it is what gets invoked.
| Understand the system / decide which skill applies | `use-lore` (this one) |

**Order of a fresh setup:** `create-area` → `create-project` → (work, saving clues with `save-to-lore`)
→ `transmute-lore` as needed. A **bot** comes later, once several projects have Lore worth carrying
into one session — `create-bot` federates what exists; it does not substitute for building it.

**Source-side precedence:** when a request points at `notas/` or `notes/` and asks to integrate,
extract, distill or save its contents anywhere, invoke `obsidian-lore` first. Then invoke the skill
that owns the destination (`save-to-lore`, `research-lus`, or another domain workflow). A domain
skill understanding the notes does not replace the mining pass or its frontmatter.

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
| "The research/domain skill already read the notes" | Reading is not mining. If the source is an inbox, invoke `obsidian-lore` and leave a trace in every note. |

**There is no error signal for this.** Criteria written by hand comes out well-worded, lands in the
right file, and passes human review. What is missing does not look missing, because it never got
written: the provenance header, the confidence markers, the defeats section — and, above all, the
**mode**. An agent who assumes CAPTURE when the source was imported produces a module with no
defeats, which is precisely what TRANSPLANT's exit gate rejects. Redacting well does not compensate
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

`obsidian-lore` governs the first arrow when the notes live in the same tree as the Lore — the
vault being the mother folder of the Areas. It captures notes **outside any `lore/`** and **mines**
the inbox, routing what survives into `save-to-lore`. It writes no criteria itself.

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

  > **And this covers what the kit says out loud, not only what it writes to disk.** A mode name is an
  > internal identifier, not a word for a conversation. **Propose the operation in the user's language,
  > as the verb it is** — *"now we can prune this"*, *"that guide is worth transplanting"*, *"this one
  > should be captured"* — never *"let's run a PRUNE"*.
  >
  > **Skill names do not change**: `use-lore`, `save-to-lore`, `transmute-lore` and the rest are how a
  > skill is invoked, and translating them in prose would make the kit unusable. Mode names do not
  > change either — in the **documentation**, where they are specification and a reader needs the exact
  > token. What changes is the register of a **suggestion**.
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
  > So: **infer it, say it out loud in one line, and offer the correction in the same breath** —
  > *"I'll speak to you in plain terms; say the word and I'll go technical."* The decision belongs to
  > the reader and costs no question.
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
- **No automatic commits.** The user reviews the diff and commits when they choose.
- **State ≠ criteria.** `FASES.md` never lives inside `lore/`.
- **A note is source, never criteria.** Free notes are never loaded as if they were Lore; they cross
  only through an explicit distillation with its gate.
- **Lore never defers to another kit's authority, and never depends on one.** Where a second kit of
  criteria shares the repository, it is **recognized, not obeyed**: its declarations are imported
  criteria and get arbitrated like any other. This is not a claim of supremacy — it is what makes
  precedence structural instead of declared. A body of criteria that does not consult another cannot
  be overruled by it, and that holds no matter what the other body's files say about themselves.

## Adapting Lore to other AI tools

The portable substrate is the **`SKILL.md`** file itself: YAML frontmatter (`name`, `description`)
plus a Markdown body. Native packaging is host-specific — Lore ships manifests for Claude Code and
Codex — but the skills are plain Markdown. Copy a skill's folder into another tool that reads
instruction files, or paste its body as a system/persona prompt. The six-piece standard and the
area↔project model are tool-agnostic conventions, not code.
