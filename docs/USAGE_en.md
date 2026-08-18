# Lore Plugin – Usage Guide

This guide shows how to use Lore with **Claude Code, Codex, or another skills-compatible AI agent**
in everyday work: creating Areas and projects, capturing criteria after solving problems, and
keeping your Lore clean and useful.

> Lore is a lightweight, provider-neutral Spec‑Driven Development (SDD) kit for AI agents.
> It helps you preserve the **criteria** behind your decisions, so your AI never has to start from scratch.  
> Closest analogy: local fine-tuning for your own tasks, and the one doing the training is you.

---

## 1. Overview

Lore organizes experience into **criteria** that keep participating in future decisions:

- You solve a problem with AI.
- Instead of just moving on, you capture the *reason* behind the solution.
- That criteria is stored in Markdown artifacts that an AI agent can reuse in later sessions.

The Lore plugin bundles a set of **skills** that implement this loop:

- `use-lore` – entry point & navigation.
- `brainstorming-lore` – design changes to Lore artifacts before their owner skill reaches its gate.
- `create-area` – shared Lore for a group of projects.
- `create-project` – project‑level Lore inheriting an Area.
- `save-to-lore` – capture criteria after solving a problem.
- `transmute-lore` – add, clean, translate, upgrade or crystallize an existing body of Lore.
- `create-bot` – one place to work across several Areas or projects with their criteria loaded.
- `obsidian-lore` – capture free notes in the same tree and **mine** that inbox for criteria.

> **Lore speaks your language.** The skills are written in English, but everything they generate —
> content **and artifact filenames** — is written in the language you work in. `identidad.md`,
> `principios.md`, `FASES.md` are the Spanish canonical forms (the ones this guide uses); in
> English they become `identity.md`, `principles.md`, `PHASES.md`. Only the selected contract name
> (`CLAUDE.md` or `AGENTS.md`), `lore/`,
> `index.md`, and English terms of general technical use (workflow, commit, stack…) stay fixed.

---

## 2. Prerequisites

Install Lore through the route for your agent. For **Claude Code**:

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

For **Codex CLI**:

```bash
codex plugin marketplace add andresanemic/lore-plugin
codex plugin add lore@lore-plugin
```

For a local clone, both CLIs, or another skills-compatible agent, use the
[direct installation route in the README](../README.md#direct-install-from-the-repository).

Once installed, invoke Lore in natural language. `use-lore` is the safest first prompt.

---

## 3. Core Loop: Using Lore Day‑to‑Day

The everyday Lore loop is:

1. Work with your AI agent to solve a problem in your project.
2. Decide whether the solution revealed **criteria** that should affect future decisions.
3. Use `save-to-lore` to capture that criteria into your Lore Markdown.
4. Let future sessions reuse those criteria instead of starting from scratch.

### Example: Capturing a Hydration Bug

You and Claude debug a hydration issue in Next.js.  
Instead of just fixing it, you want to capture the rule behind the fix.

You might ask:

```text
save-to-lore "Hydration issue with initial opacity in Next.js"
```

Lore will help you:

- Extract the **Invariant Clues** (e.g. “Never use client‑side state to control initial opacity”).
- Decide whether this belongs in project‑level modules or Area‑level principles.
- Update the appropriate Markdown artifacts (`principios.md`, a thematic module, etc.).

---

## 4. Getting Started: Your First Area and Project

Lore scales through **Areas**.  
An Area is a parent folder that owns shared criteria; projects inherit from it instead of duplicating rules.

### 4.1 Create an Area

Think of an Area as a domain like “Frontend”, “Backend”, or “Product Experiments”.

Ask your agent:

```text
create-area "Frontend Development"
```

Lore will:

- Create a `lore/` folder for the Area.
- Initialize artifacts like `identidad.md`, `principios.md`, `index.md`, and thematic modules as needed.

### 4.2 Create a Project within an Area

Now you want a specific project to inherit that Area‑level Lore.

```text
create a project "Landing Lore" in area "Frontend Development"
```

Lore will:

- Create the project folder **always inside** `{Area}/proyectos/{slug}/` — never directly under
  the Area.
- Instantiate the Area's `_starter/` templates into the new project, if the Area has one.
- Set up project‑level artifacts: `lore/identidad.md` and `lore/principios.md` (own content first,
  then a pointer to the Area), `lore/index.md` (referencing Area modules by relative path), plus
  `FASES.md` and the instruction contract.
- Register the project in the Area's `FASES.md`, so general criteria is inherited, not copied.

### 4.3 Work and Capture

Once your Area and project exist:

1. Work on the project with your AI agent as usual.
2. Every time you solve a problem that reveals reusable criteria, call:

   ```text
   save-to-lore "Short description of the problem/decision"
   ```

3. Review what Lore proposes and edit the Markdown artifacts if needed.

---

## 5. Skill by Skill: How to Use Them

### 5.1 `use-lore` – Entry Point & Navigation

**Purpose:** Help you understand the Lore model and route you to the right skill.

Typical usage:

```text
use-lore
```

You can ask things like:

- “Explain the Lore architecture for this project.”
- “Show me the artifacts currently defined.”
- “Guide me to the right skill for capturing a new invariant.”

`use-lore` is the safest place to start if you’re unsure which skill to use next.

---

### 5.2 `brainstorming-lore` – Design Lore Changes Before Writing

**Purpose:** explore a new or materially changed Lore artifact without taking ownership away from
the skill that will write it.

It is usually invoked by `create-area`, `create-project`, or `create-bot` before their threshold. You
can also invoke it directly:

```text
brainstorm this Lore before we restructure it
```

It reads the current criterion first, asks one decision-changing question at a time, compares only
the approaches that matter, and hands the approved design back to the owner skill. Read-only audits,
small mechanical edits, and an already approved plan do not need it.

---

### 5.3 `create-area` – Shared Lore for a Domain

**Purpose:** Create a shared Lore root for a domain (Area).

Example prompt:

```text
create-area "AI‑Assisted Frontend"
```

Lore will:

- Create a folder for the Area.
- Initialize Area‑level artifacts:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - thematic modules under `lore/`
- Optionally explain what each artifact is for and how to extend it.

Use this when you want multiple projects to share a common set of criteria.

---

### 5.4 `create-project` – Project Scoped Lore

**Purpose:** Create a project that inherits Lore from an Area.

Example prompt:

```text
create a project "Marketing Site" in area "AI‑Assisted Frontend"
```

Lore will:

- Create the project folder at `{Area}/proyectos/{slug}/` — never directly under the Area.
- Set up:
  - `lore/` for project‑specific modules (generic Area modules are only referenced, never copied).
  - `FASES.md` at the root for state and roadmap.
  - one contract at the root: `CLAUDE.md` when the Area uses Claude Code, or `AGENTS.md` when it
    uses Codex. The project inherits the Area's choice.
- Wire the project to the Area’s Lore so shared criteria are visible but not duplicated.

Use this whenever you start a new codebase inside a domain that already has an Area.

---

### 5.5 `save-to-lore` – Capture Criteria After Solving a Problem, or Graft External Criteria

**Purpose:** Distill reusable criteria. It has **two modes**, chosen by where that criteria comes
from: **capture** (lived friction) and **graft** (criteria imported from a third-party skill,
guide, or another kit's governing document).

> *Renamed in 2.1.1: through 2.0.9 the second mode was called `arbitrate`, and in 2.1 `transplant`.
> Same law, same four gates — the new name says what the operation is. A graft is foreign tissue
> bound to a living rootstock: it takes or it is rejected, and what grows afterwards belongs to the
> host. A graft nobody checks is deadwood tied to a healthy tree.*

#### `capture` mode (default) — the scar

Example prompts:

```text
save-to-lore "Hydration bug on Next.js landing"
save-to-lore "Decision: always prefer static rendering for marketing pages"
save-to-lore "Standard: error messages must be human‑centered and actionable"
```

#### `graft` mode — the external skill

Example prompts:

```text
save-to-lore "distill the copywriting skill into the area's lore"
save-to-lore "graft this style guide against our standard"
```

A skill is criteria **already distilled by someone else, under someone else's purpose**, and it
arrives without saying where it stops being valid. Copying it into your Lore produces redundant
literature wearing the authority of an Invariant Clue. **So it is not distilled: it is arbitrated.**

Lore will do three things you should expect:

- **It will ask whether the source brings capacity or criteria.** A skill that *executes* (renders
  video, crawls a site) is **not Lore**: it is used as a dependency. Only a skill that *judges* (what
  is good copy, good design, good SEO) gets arbitrated.
- **It will refuse to arbitrate if your `identidad.md` is empty.** With no standard of your own there
  is no yardstick: facing an authoritative source, all you could do is obey it. Identity first.
- **It will require a defeats section.** The resulting module must record **where the source
  contradicts your standard and loses**. Without that section, nothing gets in — either it was a
  copy, or the source carried no criteria.

Three cases worth knowing before you run it:

- **A governing document is the hardest one, and the most often skipped.** When a second kit ships a
  constitution or charter that declares its own authority, the reflex is to treat it as configuration
  and adopt it. It is criteria written under someone else's purpose, and a supremacy clause is exactly
  the kind that **loses** — a kit installed this week cannot govern criteria you paid for before it
  existed. That defeat gets written down rather than quietly omitted, because an omission leaves a
  hole the next template regeneration fills back in.
- **On a schedule, it starts by reading what already lost.** A recurring pass over a field that moves
  slower than its own schedule keeps meeting the same material, so it reads the existing defeats first
  and does not re-arbitrate them. **"Nothing entered this time" is a valid result** and is written as
  such — a recurring pass that always finds something stopped looking and started justifying itself.
- **A third-party skill you *invoke* carries criteria too**, and applies it without asking. This mode
  is for criteria arriving as a document to read; the harder case is a tool that runs — a formatter, a
  linter, a style checker. Feed it your Lore in the invocation, as its input: most have a calibration
  clause that makes a provided sample outrank their defaults, and the ones that do not should be
  treated as capacity and kept away from what your Lore governs. **A tool is not neutral because it is
  useful.**

> **What the source loses is worth more than what the source offers.** The summary already exists,
> better written, in the source. The disagreement exists nowhere else, and it is the only thing that
> will constrain a future decision of yours.

You don't always have to ask explicitly: if you just resolved a friction that clears a **4‑condition
threshold** (constrains a future decision, is distillable to Context→Cause→Clue, is actionable, and
would help another project in the Area), Lore can propose saving it on its own. Cosmetic changes
never count.

Lore will typically:

- Ask for context about what happened.
- Extract **Invariant Clues** (criteria that constrain future decisions), stored as `conjecture` by
  default, or `confirmed` only once actually validated in the running app.
- Suggest where to store them:
  - project modules under `lore/`;
  - Area‑level `principios.md` if they are general and confirmed;
  - updates to `identidad.md` or the instruction contract if they change identity or collaboration rules.
- Respect invariants:
  - Never invent criteria.
  - Report discarded noise.
  - Require a human to review before anything is written; never runs `git push`.
  - Mark what's already promoted to the Area with the ` · ↑` glyph in the project's `index.md`, so
    the same clue is never re‑promoted.

Use this as the main tool to feed your Lore over time.

---

### 5.6 `transmute-lore` – Operate an Existing Body of Criteria

**Purpose:** operate an existing body of Lore: migrate it, remove duplication, standardize its language, upgrade its standard, or export a safe reading copy.

It is not a CLI command: the mode is inferred from the phrase, not from a flag. It has six modes:

- `add` – create missing Lore artifacts.
- `clean` – remove modules that already duplicate the Area's (requires the project to have a
  parent Area; if it's standalone, this mode does not apply).
- `translate` – standardize the Lore's language: translate content and rename localizable
  artifacts into a single language (the one you ask for or, by default, your own), rewriting
  affected links and without touching structure, code, or meaning.
- `upgrade` – **(v1.2.1)** bring a healthy Lore up to date when it was written against an older
  version of these skills. Nothing is broken: it is in the standard and in use, and it lacks the
  gates the kit learned afterwards. It arbitrates what already exists against the installed version.
- `prune` – **(2.1.0)** remove **weight** from a Lore that decayed by accumulating things that are
  each individually correct. Not the same as `clean`: `clean` removes *duplicates*, `prune` removes
  criteria that is not duplicated, not wrong and not superseded, and whose only defect is still being
  there. It is the only subtractive mode, and **the unit it counts is the deliverable, not the Lore**
  — it will ask what your project actually ships before reading a single module.
- `crystallize` – export the live, routed Lore as one safe and traceable Markdown for a chat, AI
  project or notebook. The snapshot is derived, may become stale, never replaces the source, and
  can be **extracted** back into a folder whose routing table resolves.

**About `upgrade`, the mode easiest to misread.** It is not a rewrite and not a style pass. It sorts
every finding into four kinds, and that labelling is what keeps it from degenerating:

| Kind | What it means |
|---|---|
| **Missing** | the kit now requires something this artifact never had (a validity boundary, a confidence marker, the defeats section of an imported module) |
| **Superseded** | the kit now knows this practice is wrong, and the rule that supersedes it is cited |
| **Earned** | it departs from the current standard **because this project paid for it with real friction**: it is left alone and the reason written down **in `FASES.md`** — one line per exemption, never inside the artifact it defends — so the next upgrade does not flag it again |
| **Stale** | it matches the kit and no longer matches **the project** — it describes a practice that changed and nobody amended the text. Found against the repository, never by re-reading, and the correction is the user's to state |

What was earned with experience outranks any improvement the kit learned later. A finding list with
no `Earned` entries in a Lore with real history means the pass is being run as a formatter. Also:
confidence **never** rises with age — a conjecture that survived three versions is still a conjecture
— and a missing boundary is **asked for**, never inferred.

**`Stale` is the one no reading finds**, which is why it is detected against the repository — the
recent commits and the actual deliverables the module governs — and never by re-reading. An artifact
consistent with itself and false about the outside survives every review: the stale text reads
perfectly coherent on its own, and that is exactly what keeps anyone from noticing.

**About `prune`, the only subtractive mode.** It sorts every finding into four kinds of its own, and
it counts before it reads — because the defect it exists for is invisible when you read files one at
a time, since every law is fine on its own:

| Kind | What it means |
|---|---|
| **Deadwood** | it constrains no future decision — the decision it once shaped is gone, or it was adopted from elsewhere and never bit |
| **Crowding** | correct, earned and not refutable, and yet its *sum* with the others saturates the deliverable. It does **not** come out: it gets a validity boundary, a destination, or a ceiling |
| **Rooted** | load-bearing — a real scar behind it and a decision that still depends on it. Untouched, and not re-examined next pass |
| **Unhealed** | declared applied and only partly applied: the correction landed in one place and not in its siblings. Finish it or unmark it |

A prune list with **no `Rooted` entries** is a pass being run as a chainsaw — the mirror of `Earned`,
and it exists for the same reason: a mode that only removes will always find something to remove.
Nothing comes out without its residue written down, and what shrinks is the deliverable, not
necessarily the corpus.

Example prompts:

```text
transmute the lore of "Legacy Frontend"
clean the lore of "Legacy Frontend"
standardize the language of the lore of "Legacy Frontend"
translate the lore of "Legacy Frontend" to Spanish
improve the lore of "Legacy Frontend" with the new version
bring this lore up to date with the plugin
crystallize this lore into one Markdown for a ChatGPT project
```

**Precondition:** modes that modify source artifacts require a clean git tree before writing.
`crystallize` does not modify the source tree: it inventories routed sources, excludes private or
uncertain material by default, shows the complete export preview and destination, and waits at its
own threshold. Overwriting an existing snapshot requires separate approval.

Expected behavior:

- Scan existing documentation and structure.
- Propose how to map old files onto:
  - `identidad.md`, `principios.md`, `index.md`, thematic modules.
  - `FASES.md` and the instruction contract.
- Wait for your explicit approval before writing anything (threshold).
- Ensure the result is DRY:
  - Shared rules go to the Area.
  - Project keeps only specific criteria; `identidad.md` and `principios.md` are never deleted in
    `clean` mode.

Use this when you already have projects and want to bring them into Lore without rewriting everything manually.

For `crystallize`, the snapshot must be workable **alone**: every routed `lore/` (the bot's, the
areas', `lore-ecosistema/` when that is what the machine has) is inlined in full. A file that
routes to bodies it does not contain is not a crystallization. Each inlined file carries a
`<!-- lore:extract path="..." owner="..." -->` marker. Unpack with the bundled script
(`skills/transmute-lore/scripts/crystallize.mjs` — `pack` / `extract`); do not ask the user to
write an extractor. The unpack is a mini-root that mirrors the origin `raiz`, with
`ecosistema.json` rewritten so `enrutamiento.md` resolves. Regenerate from the live tree when
it becomes stale; never edit the export as if it were authoritative Lore.

---

### 5.7 `create-bot` – Work Across Several Areas or Projects

**Purpose:** build a **bot**: one place to open a session and **work across several projects or Areas
at once**, with their criteria already loaded, instead of answering questions about them.

A bot lives at `{Area}/proyectos/{slug}/` like any project. One thing sets it apart: it **routes
outward** — into Lore owned by other projects and Areas. Areas and projects are places; a bot is a
lens you carry into them.

By default **nothing gets installed**: it is a folder with its canon and the one contract selected
by its Area. Opening the session there loads the criteria in that host.
Packaging it as a plugin is optional, and serves to
hand it to a team.

> **The test that says whether the bot is well built:** *a short instruction is enough.* If you had
> to explain the project to the bot to get the result, criteria were missing from the load.

> **The bot is the last step, not the first (2.1.1).** If your sources have no Lore yet, the chain is
> `create-area` → `transmute-lore add` → `create-bot`, once per source, and there is no shortcut: a
> bot does not distill into itself. The Area that hosts bots is **one**, `bots`, with all of them
> inside as projects — not one Area per bot, and no bot dedicated to administering the others.
>
> **Before calling it done, open it the way its user will** and confirm the session reaches the
> manifest's paths. A host pointed at the wrong folder does not complain: it looks like the bot is
> reading the wrong Lore.

Example prompts:

```text
create a bot to work on HealthProof and Nodo Zero, in the "bots" area
I want a bot that federates the lore already living in founder and community-manager
```

It has **two creation modes**, by where the criteria comes from:

- `nuevo` – from zero. The canon is born from a brainstorm + the source documents.
- `federar` – the criteria already exists, dissolved across several Areas. On top of the canon it
  generates a routing table (`lore/enrutamiento.md`) and access to the live trees
  (`.claude/settings.local.json`), so you can **work** in those projects and not just read them.

If the bot already exists, the same skill runs an **audit pass** instead of rebuilding it. It checks
the institution's real registry, scope, sources, routing, README and optional seals, then rejoins the
normal sync, packaging and verification flow.

> **Federating is pointing, not copying.** Each row is an address to the Lore where it lives, so that
> criteria keeps one owner and one version — the same way a project references its Area's modules
> instead of duplicating them. A new project created from the bot is born in the Area that owns it,
> inheriting its Lore by relative path. Copying it into `lore-ecosistema/` is **optional**, and only
> needed if whoever will use the bot **does not have your folders**: there the pointer resolves to
> nothing.

It starts by asking you three things, in this order: **what the bot is called**, **what you are
going to use it for**, and **where the folders with the useful information are**. It then inspects
those paths itself and reports what it found; it does not ask you to classify your own folders.

**If the folders have no Lore yet** — the normal case — they do not get federated: the chain is
`create-area` → `transmute-lore (add)` → `create-bot (federar)`. The bot **never distills into
itself**; the criteria is born in the Area it belongs to and is routed to afterwards. `create-bot`
inspects your paths and tells you which one needs what.

What to expect while it runs:

- It proposes the design and **waits for your approval** before writing anything.
- It keeps the three bodies of criteria apart: what the bot always knows, what maintains the bot, and
  what it borrows from other projects (the last never outranks its source).
- In `federar` mode the routing table and the local access are generated from the manifest; do not
  hand-edit them. The paths are written **once**, there.
- Federating an Area carries `lore` **plus** its selected contract and its `FASES.md`: the Lore brings the
  laws, but the sequence of work and the registry of what exists live in those two.
- It asks whether to package it as a plugin, and if you say yes it **does not call it finished**
  until `scripts/validar.js` passes — the frontmatter defects it checks produce no error message at
  all; the skill installs, gets listed, and never fires.

**The first time you open the bot, it runs a brainstorm — not a form.** It starts by showing what it
reaches: each body of criteria it federates, whether that pointer resolves on your machine, and what
is out of scope. Then it asks only what changes how it behaves, one question at a time — and if your
answer names more than one body of criteria, it opens by all of them instead of picking the closest
match. If you have a brainstorming skill installed, it runs that conversation through it.

> **Answering that is not the same as using it.** The gate is answered identically with an empty
> canon and broken paths, so it proves nothing. The bot counts as launched once **a short instruction
> that does not name the criteria produces a real deliverable** — that instruction is the evidence,
> and it gets recorded word for word.

Three things you will use every day:

- **Route by type of task, not by name of project.** Saying *"let's work on X"* is not enough if X
  keeps product and communications criteria apart; the bot asks which one.
- **Every task closes by proposing what criteria to keep and where.** It does not wait to be asked.
- **A negative report comes with its coverage attached.** The bot says *"none of the laws I carry are
  broken"*, never *"this is fine"* — it can only vouch for the scars somebody already paid for, and
  what nobody scarred is not written anywhere.

Five extras are optional and off by default: **the ecosystem copy**, **encryption** (*experimental*,
see [`ENCRYPTION.md`](./ENCRYPTION.md)), **Telegram access**, **a local multi-provider launcher**, and
**packaging as a shareable plugin**. A bot with none of the five is complete.

Use this when you want one session that works across several projects — including from zero.
If the sources have no Lore yet, the skill orchestrates the chain (`create-area` → `transmute-lore` add → `create-bot`); it does not require Lore to already exist. When the Lore is already there, it federates it. The bot never substitutes for building that Lore in the Area that owns it.

---

### 5.8 `obsidian-lore` – Capture and Mine Notes Without Treating Them as Criteria

**What it is for:** if you already write notes in Obsidian, you already have the raw material. This
skill governs the overlap between the vault and the Lore when they share a file tree.

**Setting it up:** point the vault at the **mother folder of your Areas** (*Open folder as vault*).
The same tree becomes both your workspace and your vault, with nothing else to configure.

**Work your notes from a bot. Permanently, not as an alternative.**

That is the setup this skill was designed for, and the reason is routing. A bot carries
`lore/enrutamiento.md`, with the purpose of every Area and project it federates written down. A note
swept from a bot is routed **against that table**, and border cases get asked. A note swept from a
bare folder is routed with one path plus the model's reading of the text: a guess wearing the same
confidence. If you have no bot yet and your notes touch more than one Area, the skill will propose
`create-bot`, and it is worth taking it up on that.

**The inbox lives where you open the session:**

| Session opened in | Its inbox |
|---|---|
| A **bot** ← *recommended* | `<bot>/notes/` |
| A project or an Area | that folder's `notes/` |
| **The vault root** | **none. The root never has an inbox** |

**The root never has an inbox.** A note written at the root has no owner and no table to be routed
against. Worse: a bot cannot reach the root, so the sweep does not read it, does not fail, and
**reports a debt of zero**. If a note belongs to no project, what is missing is the project —
`create-project`, not an orphan inbox.

**The root is a place of work with no Lore, not a place nobody works in.** Anything that has to sit
above every area ends up there — a launcher that routes into all of them, a spec that decides a new
area. What the root lacks is an owner, a `FASES.md`, an inbox and any instruction contract to load the rules,
so the work done there goes unregistered and never even becomes a note to sweep. If that is what
happened, what is missing is an **area** — `create-area`, and meanwhile the note goes to the inbox of
the area that asked for the work.

**How you use it, in two sentences:**

```text
save this note to Obsidian
review my Obsidian notes and see what belongs in my lore
```

The first writes a `.md` into the inbox, never inside `lore/`. The second sweeps, classifies, routes,
and **waits for your approval** before writing anything.

**What it does with each note:**

| The note records | Where it goes |
|---|---|
| A friction you resolved | Invariant Clue, via `save-to-lore` |
| A **task** or an open problem — *"we need to add X"* | `FASES.md`. That is state, not criteria |
| Someone else's criteria you collected | Arbitration against your standard |
| A summary, a link, a meeting jotting | Noise, and it tells you |

On close, every mined note gets its `destilado:` mark with date and destination — **including the
ones that produced nothing**. That mark makes the sweep idempotent and makes the debt visible: how
many notes have gone how long unmined. `save-to-lore` reports it too when it finishes.

**Two things it does not do:** it never deletes notes (mine before deleting, and deleting is your
call) and it does not manage the vault — `Read` and `Grep` already read it.

> **A note is source, never criteria.** It answers *"what happened"*; Lore answers *"what changed
> because of it"*. Nothing crosses without explicit distillation.

**If the inbox ends up inside a repository**, decide whether it travels or goes into `.gitignore`.
For a bot handed to a team, the usual answer is that it does not: those are unmined notes.

---

## 6. Working with Artifacts

Lore uses a fixed set of artifacts to keep criteria organized:

- `lore/identidad.md` – project identity and minimum quality standard.
- `lore/principios.md` – permanent engineering and business rules.
- `lore/` thematic modules – distilled experience grouped by domain.
- `lore/index.md` – navigation map for Lore in that project or Area.
- `FASES.md` (root) – current state and roadmap.
- `CLAUDE.md` **or** `AGENTS.md` (root) – the one collaboration contract and its operational references,
  selected by the primary host. Its pointer section sits between `<!-- lore:always-on -->` markers:
  that is the kit's always-on channel, capped at 25 lines, stamped idempotently by the skills that
  write the contract and added to older contracts by `transmute-lore` UPGRADE. Edit inside it freely —
  the kit reports the divergence and waits, it never overwrites you. The markers themselves are
  literal and never translated.

General guidelines:

- Identity and principles change slowly; keep them small and intentional.
- Thematic modules can grow, but each should focus on a specific domain.
- `FASES.md` should reflect reality; update it when the project moves phases.
- The instruction contract should describe how humans and the primary host work together (prompts,
  rituals, constraints).

---

## 7. Best Practices

To keep your Lore useful:

- Capture only **criteria**: if it doesn’t constrain a future decision, don’t add it.
- Prefer small, focused modules over long narrative documents.
- Review Lore periodically to merge overlapping rules and remove obsolete ones.
- Use Areas for everything that should be shared; keep the project Lore lean.
- Keep all your Lore in a single language; if it ended up mixed or in the wrong language, use
  `transmute-lore` in `translate` mode.
- Always review the diff that Lore proposes before committing changes.

If you want a conceptual overview of why Lore exists and how it differs from traditional documentation, see the main [`README.md`](../README.md).
