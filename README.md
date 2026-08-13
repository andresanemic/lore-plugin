<a id="english"></a>

<p align="center">
  <img src="https://i.imgur.com/DWYL7vz.png" alt="Lore" width="100%">
</p>

<!-- Language selector (top of README.md) -->

<p align="right">
  <strong>Language / Idioma:</strong>
  <a href="#english">English</a> |
  <a href="#español">Español</a>
</p>

<h1 align="center">Lore</h1>

<p align="center">
  <a href="#installation"><img src="https://img.shields.io/badge/version-2.0.3-F72585?style=for-the-badge&labelColor=0B0B12" alt="Version"></a>
  <a href="#installation"><img src="https://img.shields.io/badge/Claude_Code-plugin-7B2CBF?style=for-the-badge&labelColor=0B0B12" alt="Claude Code"></a>
  <a href="#what-is-lore"><img src="https://img.shields.io/badge/paradigm-Spec--Driven_Development-00D9FF?style=for-the-badge&labelColor=0B0B12" alt="SDD"></a>
  <a href="#what-is-lore"><img src="https://img.shields.io/badge/fine--tuning-local-FFBE0B?style=for-the-badge&labelColor=0B0B12" alt="Local fine-tuning"></a>
  <a href="#obsidian--the-way-in"><img src="https://img.shields.io/badge/Obsidian-compatible-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white&labelColor=0B0B12" alt="Obsidian compatible"></a>
  <a href="#origin"><img src="https://img.shields.io/badge/research-active-10B981?style=for-the-badge&labelColor=0B0B12" alt="Status"></a>
  <a href="#benchmark"><img src="https://img.shields.io/badge/benchmark-72_runs-FF6B35?style=for-the-badge&labelColor=0B0B12" alt="Benchmark: 72 runs"></a>
  <a href="#shared-invariants"><img src="https://img.shields.io/badge/local_only-no_network-14B8A6?style=for-the-badge&labelColor=0B0B12" alt="Local only, no network"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-6B7280?style=for-the-badge&labelColor=0B0B12" alt="MIT"></a>
</p>

<p align="center">
  <b>Stop explaining your project to the AI every morning.</b><br>
  Lore keeps the criteria behind your decisions and loads it into the next session.
</p>

<p align="center">
  no re-explaining the stack &nbsp;·&nbsp; no re-proposing what you ruled out last week &nbsp;·&nbsp; criteria that outlives the session
</p>

<p align="center">
  <i>An SDD kit that gives you local fine-tuning for your own tasks — and the one doing the training is you.</i>
</p>

<p align="center">
  <code>8 skills · 7 case studies · 72 benchmark runs</code>
</p>

<h3 align="center">Up to <strong>28% faster</strong> and <strong>24% fewer output tokens</strong> to a correct result, with <strong>+28 points of first-pass correctness.</strong></h3>

| Metric | Cold Codex | Codex + Lore |
|---|---:|---:|
| First-pass correctness | 37% | **65% (+28 pts)** |
| Time to a correct result | 118 s | **85 s (−28%)** |
| Output tokens to a correct result | 4,116 | **3,119 (−24%)** |

<p align="center"><sub>72 controlled runs · 12 frozen tasks · same agent, tools and task; only Lore changed. Lore worsened <strong>0/12</strong> task results. <a href="#benchmark">Method and limits ↓</a></sub></p>

---

<table>
<tr>
<td width="33%" valign="top">

**Start**

[The problem](#the-problem)
[What is Lore](#what-is-lore)
[How it works](#how-it-works)
[Benchmark](#benchmark)
[Installation](#installation)

</td>
<td width="33%" valign="top">

**Use it**

[Architecture](#architecture)
[The eight skills](#the-eight-skills)
[Obsidian](#obsidian--the-way-in)
[Documentation](#documentation)

</td>
<td width="33%" valign="top">

**Understand it**

[Shared invariants](#shared-invariants)
[Case studies](./CASES_en.md)
[Reach](#reach) · [Origin](#origin)

</td>
</tr>
</table>

---

## The problem

You open a session. You explain, again, what the project is for. Which approach you already tried and why you dropped it. Which shortcut cost you an afternoon last month, and which decision you are not reopening.

You explained all of it yesterday. You will explain it again tomorrow.

Meanwhile the project keeps accumulating what actually cost you — architectural decisions, production incidents, failed experiments, dozens of *"let's never do that again"* moments — and **none of it survives the session**.

It is a loop of re-explanations and mediocre solutions you had already rejected. LUS calls it **ephemeral experience**, and it does not happen because facts get forgotten: it happens because the learning never became a reusable structure.

> Traditional documentation solved part of the problem, but it only preserves **information**. Manuals describe procedures, READMEs explain installs, databases store facts. They rarely capture what actually changes a future decision.

---

## What is Lore

A lightweight, provider-neutral **Spec-Driven Development** kit for AI agents. Or, in one line: **local fine-tuning for your own tasks, and the one doing the training is you.**

A fine-tune conditions a model on thousands of examples until it stops answering like a generalist. Lore gets to the same place from the other side: one written constraint per thing that went wrong. No training happens and no weights move, so your criteria stays as plain text you can read, correct in one line, and carry to a different model tomorrow.

A fine-tune stops asking things of you the day it ships. Lore never stops: one distillation, every time something breaks. That is the cost, and it is worth knowing before you install anything.

It provides three things:

- a simple convention for organizing a project's criteria;
- eight skills that operate that convention;
- and a continuous loop for distilling experience into reusable criteria.

Spec-driven is not a label here. `CLAUDE.md` is the contract, `FASES.md` is the state and what comes next, and `lore/` is the criteria that constrains how any of it gets built.

Unlike documentation, Lore does not try to describe everything. It only preserves what changes future behavior.

A README answers *"what is this?"*. Lore answers something else:

> **What did we learn that we should never have to learn again?**

> [!IMPORTANT]
> **If a sentence does not constrain a future decision, it is not Lore.** That rule is the whole filter, and it is what keeps the system from becoming another graveyard of documents.

---

## How it works

Every solved problem contains two things: the solution, and the reason that solution exists. Documentation keeps the first. **Lore keeps the second.**

Instead of recording what happened, it distills it into an **Invariant Clue**: a small constraint that stays useful long after the original context is gone.

| Instead of remembering | Lore keeps |
|---|---|
| "We had a hydration issue in Next.js" | "Never use client-side state to control initial opacity" |
| "Assets 404'd after deploying from Windows" | "Never compress with native Windows tools: use `tar.exe -a -c -f`" |

The event is forgotten. The criteria keeps working.

### The loop

<p align="center">
  <img src="https://i.imgur.com/y3fsT7D.png" alt="Lore" width="100%">
</p>

Every step of the loop passes a **HARD GATE**: it is proposed, you approve, only then it is written.

---

## Installation

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Two lines, no dependencies or configuration. Then type `use-lore` and the kit points you at the skill you need.

> **Using another AI tool?** Each skill is a Markdown file with a YAML header: the packaging is Claude Code's, the architecture is not. Copy the skill folder anywhere, or paste its body as a system prompt. The six artifacts and the Area↔Project model are conventions, not code.

> **Investigating LUS itself?** [research-lus](https://github.com/andresanemic/research-lus)
> carries the program's public corpus, bibliography, cases, hypotheses and scientific-research Lore
> into a critical research session. It keeps each researcher's conversation with Logos private and
> works independently; install Lore Plugin alongside it only when you also need to create, preserve
> or upgrade Lore in your own projects.

> **Want one door into those projects?** [Lore in the Shell](https://github.com/andresanemic/lore-in-the-shell)
> opens a Lore-governed folder with the Claude Code or Codex CLI and model you choose. Lore Plugin's
> `create-bot` can build a minimal launcher without it; install the standalone plugin for the
> maintained provider/model workflow, optional colors and future updates.

### What it looks like in practice

You just spent two hours fighting a flash of unstyled content on load. You solved it. Instead of closing the tab:

```text
› save to lore
```

```text
  Distilled this:

  [animation] Flash on load — initial state delegated to JS

  Context ······· Next.js with entrance animations under SSR
  Root cause ···· the JS hydrates after the browser painted the raw
                  HTML, so the element shows up for one frame before
                  the animation hides it
  Clue ·········· never delegate the initial state to JS. It lives
                  inline in the JSX (opacity: 0). Use fromTo to
                  transition, never to create the state
  Confidence ···· confirmed — validated in the running app

  → projects/client-a/lore/animation.md
  → this Clue is generic and confirmed: promote it to the Area,
    so the other 3 projects see it?

  Write it?
```

Three months later, in another project of the Area, someone asks for an entrance animation. The criteria is already loaded and that discussion never happens again.

> None of it was written without a human saying yes. The same gate governs all eight skills.

---

## Architecture

### The six artifacts

Every project organizes its criteria with exactly these six:

| Artifact | What it holds | Where |
|---|---|---|
| `identidad.md` | What the project is, its purpose and its **quality floor** | `lore/` |
| `principios.md` | Invariant laws, technical and business: prohibitions and imperatives | `lore/` |
| Thematic modules | Technical scars by domain (animation, layout, scroll…) | `lore/` |
| `index.md` | Navigation map: one line per pattern | `lore/` |
| `FASES.md` | State and roadmap: current phase, focus | root |
| `CLAUDE.md` | Collaboration contract, slimmed to **pointers** | root |

Each has one responsibility. None duplicates another.

> **Lore is criteria (it persists); `FASES.md` is state (it advances).** They never mix, and `FASES.md` never lives inside `lore/`.

The names shown are the Spanish canonical forms; in your language they localize.

### Area → Project inheritance

Lore scales through **Areas**. An Area is a mother folder with its own Lore, and projects inherit it instead of copying it:

```text
web-development/
│
├── lore/                      ← general criteria lives ONCE
│     identity · principles · index · animation · scroll · layout
│
├── PHASES.md                  ← the Area's project registry
├── CLAUDE.md                  ← the Area's contract
│
└── projects/
    ├── client-a/
    │   └── lore/              ← only its own; the index points at the Area
    ├── client-b/
    │   └── lore/
    └── client-c/
        └── lore/
```

Fix a generic Clue once, in the Area, and every project sees it. Each project keeps only what belongs to it: the system stays DRY without losing accumulated experience.

### The third shape: a bot

| | Area | Project | **Bot** |
|---|---|---|---|
| Holds | projects | one piece of work | **a work session** |
| Its Lore governs | the domain's method | that work | **how the agent behaves** |
| Opened to | see the registry | advance that work | **work on any of several projects** |

Areas and projects are places; **a bot is a lens you carry into them.** It is not an Area, because it owns none of the criteria it routes to. An Area that collects criteria it never earned starts receiving promotions that belong somewhere else.

---

## The eight skills

| Skill | What for | When |
|---|---|---|
| [`use-lore`](#use-lore) | Entry point: explains the model and routes you to the right skill | first, always |
| [`brainstorming-lore`](#brainstorming-lore) | Designs changes to Lore artifacts without colliding with general-purpose brainstorming skills | before creating or materially restructuring Lore |
| [`create-area`](#create-area) | Creates an Area with its shared Lore | opening a new domain |
| [`create-project`](#create-project) | Creates a project that inherits from the Area | starting a piece of work |
| [`save-to-lore`](#save-to-lore) | Distills a lesson and decides whether it rises to the Area | every day |
| [`transmute-lore`](#transmute-lore) | Migrates old projects, cleans duplicates, translates the Lore, or raises it to a newer version of the kit | inheriting something with no Lore, or updating the plugin |
| [`create-bot`](#create-bot) | One place to open a session and work across several Areas at once | once there is Lore worth gathering |
| [`obsidian-lore`](#obsidian--the-way-in) | Turns your loose notes into criteria | once the inbox gets heavy |

### `use-lore`

> **2.0 rename:** `using-lore` is now `use-lore`. Remove the old skill when updating; do not keep
> both names installed, because duplicate entry-point triggers make routing ambiguous.

The entry point. Explains Lore's model, the six-artifact standard, the Area↔Project model, and routes you to the right skill. Read it before invoking any other.

### `brainstorming-lore`

The kit's own design conversation. It is deliberately narrow: it activates for Lore, bots, Areas, projects and phases—not for general ideation—and hands the approved result to the skill that owns the artifact and its HARD-GATE.

### `create-area`

Creates a new Area with its own shared Lore: `identity` + `principles`, an `index.md`, a `CLAUDE.md`, a `PHASES.md` acting as project registry, and an empty `projects/` folder. It brainstorms the identity **before** touching disk.

### `create-project`

Creates a project inside an existing Area. The project inherits the Area's criteria instead of duplicating it: it keeps its own identity and principles, plus an `index.md` that **points** at the Area's modules by relative path. Folder structure and phases are derived from the project's source documents, not from a generic template.

### `save-to-lore`

The flow you will use every day. You solve something that cost you, and you type:

> "save to lore"

The skill extracts the criteria behind the solution, writes it where it belongs, and **proposes** — never executes — promoting it to the Area if it serves every project.

- Specific lessons stay inside the project.
- Generic, confirmed ones are proposed for promotion to the Area.
- Nothing is promoted automatically.

It has **two modes**, chosen by where the criteria comes from:

| Mode | Source | What it does |
|---|---|---|
| **capture** (default) | **lived friction**: a bug, a collapse, a client rejection | Distills the scar into an Invariant Clue. |
| **arbitrate** | **imported criteria**: a skill, a style guide, a third-party playbook | Judges it against **your** project's purpose. Only what survives gets in. |

> **The law of `arbitrate` mode: external criteria is not distilled, it is arbitrated.**
>
> A skill is criteria already distilled **by someone else, under someone else's purpose**, and it arrives without declaring where it stops being valid. Copying it into your Lore produces **redundant literature wearing the authority of an Invariant Clue**: criteria nobody paid for with real experience.
>
> That is why `arbitrate` has an exit HARD GATE: the resulting module **must** record **where the source contradicts your standard and loses**. No defeats section, no entry — either nothing was arbitrated (it was a copy), or the source carried no criteria at all.
>
> **What the source loses is worth more than what it offers:** the summary already exists, better written, in the source. The disagreement exists nowhere else.

Two warnings `arbitrate` mode will give you:

- **Capacity ≠ criteria.** A skill that **executes** (renders video, crawls, compiles) is **used** as a dependency: it is not Lore. Only a skill that **judges** (what is good copy, good design, good SEO) gets arbitrated.
- **No identity, no arbitration.** If your identity file is empty you have no yardstick, and facing an authoritative source all you can do is obey it. Identity first, source second.

### `transmute-lore`

Migrates existing projects into Lore's architecture. Four modes:

| Mode | What it does |
|---|---|
| **add** | Rescues criteria already scattered around (a bloated `CLAUDE.md`, a kilometric README, code comments) and crystallizes it into the six artifacts. |
| **clean** | Removes the project's redundant modules that the Area already owns. The criteria does not disappear: it changes owner. |
| **translate** | Standardizes the language of an existing Lore, translating content and renaming artifacts, without altering structure or meaning. |
| **upgrade** | Raises a healthy Lore written against an older version of these skills. Sorts every finding into Missing, Superseded or **Earned** — and what the project paid for with real friction is left alone. |

### `create-bot`

Lets you **work from a single place across several Areas that belong to one project**. We call that *federating*.

Think of a blockchain lab. It has a website, it runs its social media, and it sustains lines of scientific research and technology transfer. Each of those Areas already has its own Lore. A bot routes all of them into one folder: you open the session there and can work on any of them, and make them talk to each other.

It works the other way round too: if you have an Area with several projects — several websites, say — a bot lets you work on one while reading the files of the others. Copying a footer from one site into another stops being an expedition.

**A bot does not answer questions about the projects: it works in them.**

> **Its north, and the only test that matters:** *a short instruction is enough.* If the project had to be explained to the bot to get the result, criteria were missing from the load.

**Two modes**, by where the criteria comes from:

| Mode | When | What it produces |
|---|---|---|
| **`nuevo`** | From zero. No prior Lore to gather. | Canon born from a brainstorm + source documents. |
| **`federar`** | The criteria already exists, dissolved across several Areas. | Canon **plus** a routing table over those Lore bodies. |

<details>
<summary><b>When the folders have no Lore yet</b></summary>

<br>

The usual starting point is not a tidy set of Lore bodies. It is raw material: folders of documents, a database, a Notion workspace, undistilled code. That cannot be federated yet, and the fix is a chain:

```text
raw folder (no Lore)
   └─ create-area                → the Area that will OWN that criteria
        └─ transmute-lore (add)     → rescues the criteria already scattered inside it
             └─ create-bot (federar)  → the bot routes to that Lore
```

**The law: the bot never distills into itself.** A source with no Lore first gets its Lore **in the Area it belongs to**. Only then can the bot federate it. Otherwise the bot becomes the sole owner of criteria earned elsewhere, and the Area can no longer act as their source of truth.

`create-bot` inspects the paths you give it and tells you which already have Lore, which need transmuting first, and which need extracting to text beforehand. A free-note inbox is **never federated**: it holds no Lore, and it is `.md`, which is exactly what makes the mistake easy.

</details>

<details>
<summary><b>The three bodies that never merge</b></summary>

<br>

A bot holds three bodies of criteria with **three different owners**. Merging them is the default failure mode, and it is silent: everything still works, and the copy starts outranking its source.

| Body | What it is | Rule |
|---|---|---|
| `canon/` | criteria the bot **is** — loaded before every decision | distilled |
| `lore/` | criteria for **maintaining** the bot | the project's own |
| **borrowed** criteria | the Lore of every project the bot routes to | reached **by pointer**; **never authoritative** |

The test that keeps them apart: **would the source be discardable?** Distilling produces something smaller that can *replace* its origin; copying produces something identical that **cannot**.

**Federating is pointing, not copying.** Each row of the manifest is an **address**: the table says which Lore governs the task, and the generated access lets the session reach it where it lives. That criteria keeps one owner and one version, the same DRY rule the whole kit runs on.

And the law that makes routing work:

> **Route by type of task, not by name of project.**

One entity can own several bodies of criteria that should not mix. The usual split is what it does versus how it talks about it. Naming the entity does not tell the bot which body governs the task.

</details>

<details>
<summary><b>The first use is a brainstorm, not a form</b></summary>

<br>

This kit brainstorms to build every artifact it makes, so the artifact it produces does not greet its first user with four fields to fill. **If you have a brainstorming skill installed, the bot runs the first use through it**; if not, it runs a minimal one itself.

- **It shows what it reaches before asking anything**: every federated body, whether its pointer resolves *on this machine*, what its canon contains, and what remains out of scope. A broken pointer appears there, before it can produce an answer that silently omits part of the criteria.
- **It asks only what changes its behaviour**, one question at a time. It infers tone and a nickname from how you write; either can be corrected in one sentence.
- **No closed options for anything that picks a branch.** A closed list cannot handle an answer that names two items without discarding one. The bot asks about the condition instead: *"does your work fall into more than one of these?"* If the answer names two bodies of criteria, it opens both.
- **It closes by separating configuration from criteria.** What is configuration is stored. What turned out to be true about *the project* is proposed to the Lore of whoever paid for it with experience — never kept inside the bot.

> **Configuring the first use is not the first use.** That setup is answered the same way whether the canon is full or empty and whether the paths resolve or not, so passing it proves nothing about the bot. A bot counts as launched when **an instruction that does not name the criteria produces a deliverable**, and that instruction is recorded verbatim.

</details>

<details>
<summary><b>Three optional extras, off by default</b></summary>

<br>

All three are asked when the bot is configured for the first time. A bot with none of them is complete: they are seals, not parts.

- **The ecosystem copy (`lore-ecosistema/`).** By default the bot **points** at each project's Lore where it lives, duplicating nothing. Turning it on only makes sense if whoever will use the bot does **not** have your folders: there the pointer resolves to nothing, and the copy is the only way that criteria exists on their machine.
- **Packaging it as a shareable plugin.** **Not created by default.** A bot is a folder with its canon and its `CLAUDE.md`: you open the session there and the criteria is already loaded, with nothing to install. Wrapping it in a skill with its own repository serves **one purpose**, handing it to a team, and if you are working alone it is scaffolding you still have to maintain.
- **Lore encryption** — *experimental*, see [`ENCRYPTION.md`](./ENCRYPTION.md).

</details>

---

## Obsidian — the way in

If you already write notes in Obsidian, you already have the raw material. Point the vault at the **mother folder of your Areas** (*Open folder as vault*) and the same file tree is both your workspace and your vault. Nothing else gets configured.

Then, whenever you want:

> "review my Obsidian notes and see what belongs in my lore"

`obsidian-lore` sweeps the inbox, separates criteria from everything else, tells you which Lore each thing belongs to, and **waits for your approval** before writing anything.

> [!IMPORTANT]
> **Work your notes from a bot. Permanently, not as an alternative.**
>
> That is the setup this skill was designed for, and the reason is routing. A bot carries a routing table with the purpose of every Area and project it federates written down, so a note is routed **against that table** and the border cases get asked instead of guessed. From a bare folder, routing comes from one path plus a reading of the text: a guess wearing the same confidence.
>
> No bot yet, and your notes touch more than one Area? The skill will propose [`create-bot`](#create-bot). Take it up on that.

```text
<your mother folder>/           ← open it as a vault in Obsidian
  web-development/              ← your Areas and projects, with their Lore
  bots/projects/my-bot/         ← ★ open your sessions here
    notes/                      ← the inbox that matters: routed, not guessed
    canon/ · lore/ · CLAUDE.md
```

### What it does with each note

The discriminator is not the quality of the note: it is whether the note records a **transformation** or only a **fact**.

| The note records | Where it goes |
|---|---|
| A friction you **resolved** | Invariant Clue in the Lore |
| A **task** or an open problem — *"we need to add X"* | `FASES.md`. That is state, not criteria |
| Someone else's criteria you collected | Arbitration against your standard |
| A summary, a link, a meeting jotting | Noise, and it tells you so |

Most of a real inbox lands in the last row: a note folder fills up with information, and criteria is the rare thing inside it.

> **Why a sweep and not a save button.** Writing the note feels like preserving it, so nobody goes back to distill it. We tried keeping notes apart from the Lore, and the record sat unused for six weeks ([Case 05](./CASES_en.md)). The sweep is what breaks that: each pass tells you how many notes are still unmined, and for how long.

### Where the inbox lives

**Where you open the session** — and **the vault root never has one**. A note written there has no owner and no table to be routed against. Worse, a bot cannot reach the root: the sweep does not read it, does not fail, and reports a debt of zero. A note that belongs to no project means the project is missing — `create-project`, not an orphan inbox. And the reason is not that nobody works at the root: somebody does, whenever something has to sit above every Area — a launcher that routes into all of them, a spec that decides a new one. The root is a place of work **with no Lore**, so what happens there goes unregistered and never even becomes a note — which means an **Area** is missing (`create-area`), still not an inbox.

Every mined note gets a mark with date and destination, **including the ones that produced nothing**. That mark makes the sweep idempotent and makes the debt visible. The skill **never deletes a note**: mine before deleting, and deleting is your call.

**A note is source, never criteria.** It answers *"what happened"*; Lore answers *"what changed because of it"*. Nothing crosses without explicit distillation and a human approving the diff.

---

## Shared invariants

All eight skills follow the same rules:

- Lore is written **in your language**.
- **Criteria is never invented.** Everything comes from real experience.
- **A note is source, never criteria.**
- **Discarded noise is reported**, never silently deleted.
- Every change passes a **HARD GATE** before being written.
- **Nothing commits automatically.** You review the final diff.

---

## Benchmark

<p align="center">
  <img src="./assets/benchmark-impact.png" alt="Lore benchmark: plus 28 points first-pass correctness, 28 percent less time and 24 percent fewer output tokens to a correct result" width="100%">
</p>

**Lore does more before answering—so you redo less.** We tested twelve frozen tasks with three independent runs per condition: cold Codex and Codex with Lore, for 72 runs in total. Lore spends more time reading before an attempt; the useful measure is the work required to finish correctly.

| Result | Cold Codex | Codex + Lore |
|---|---:|---:|
| Correct on the first attempt | 37% | **65%** |
| Correct tasks per 10 attempts | 3.7 | **6.5** |
| Correct reading of project criteria | — | **96%** |

That is **+28 points of first-pass correctness**. Lore never made a task result worse: it improved 3 of the 12 tasks and preserved the result in the other 9.

| Cost to reach a correct result | Without Lore | With Lore | Effect |
|---|---:|---:|---:|
| Time per attempt | 44 s | 55 s | +25% |
| Expected attempts per success | 2.70 | **1.53** | **−43%** |
| Estimated time to success | 118 s | **85 s** | **−28%** |
| Output tokens to success | 4,116 | **3,119** | **−24%** |

> **Lore was slower per attempt, but faster at finishing correctly.**

The harness, frozen tasks, graders, raw outputs and declared limits are in [`bench/`](./bench/). These are Codex results, not a universal model claim. The same benchmark will be repeated with Claude Code during the week of August 17; those results will remain separate and will not change the 2.0 skills or version.

---

## Documentation

This README covers motivation and architecture. Everything else lives in its own document:

| Document | What it's for |
|---|---|
| [`USAGE_en.md`](./USAGE_en.md) | Practical day-to-day usage guide: installation, core loop, and each skill with examples. |
| [`REFERENCE_en.md`](./REFERENCE_en.md) | Technical reference: core concepts, the exact spec for each artifact and each skill. |
| [`MIGRATION_en.md`](./MIGRATION_en.md) | How to migrate an existing project into Lore using `transmute-lore`. |
| [`ENCRYPTION.md`](./ENCRYPTION.md) | The optional, experimental encryption for a bot's criteria: what it protects and what it does not. |
| [`CASES_en.md`](./CASES_en.md) | The seven case studies, each with its declared boundary. |
| [`bench/`](./bench/) | The benchmark: harness, the twelve frozen tasks, method, declared limits and the raw results. |

<details>
<summary><b>Repository structure</b></summary>

<br>

```text
lore-plugin/
  .claude-plugin/
    plugin.json
    marketplace.json

  skills/
    use-lore/
    create-area/
    create-project/
    create-bot/
      plantillas/        # validar.js · canon.js · sync.js · ecosistema.json
    save-to-lore/
    transmute-lore/
    obsidian-lore/

  README.md
  LICENSE
```

</details>

---

## Case studies

Lore was not designed on a whiteboard: every decision in this kit came from applying it to real projects and watching what broke. LUS documents those applications as **case studies** — seven of them, each with its own declared boundary.

> **Status:** these are cases, not proofs. Small n, and all seven come from the same researcher. What they claim constrains how we use the kit; it does not pretend to be a law. The measured claim is the [benchmark](#benchmark); this is the qualitative half.

**[Read the seven case studies →](./CASES_en.md)**

---

## Reach

<p align="center">
  <img src="./assets/reach-en.png" alt="1,000+ clones and counting" width="100%">
</p>

<p align="center">
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/1%2C127-clones-F72585?style=for-the-badge&labelColor=0B0B12" alt="1,127 clones"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/35-days-7B2CBF?style=for-the-badge&labelColor=0B0B12" alt="35 days"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/~27-a_day-00D9FF?style=for-the-badge&labelColor=0B0B12" alt="27 a day"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/221-peak-10B981?style=for-the-badge&labelColor=0B0B12" alt="221 peak"></a>
</p>

For thirty-four days the number held at a steady twenty-odd clones a day, well past the launch spike. That steadiness was the interesting part: not a launch bump, just people still arriving. Then August 8th brought 221 clones in a single day — a second peak, larger than the launch itself. I left it in the data exactly as it arrived.

The daily rate quoted above is the steady one, not the average with that day folded in. Data comes from GitHub's traffic API, stored in [`data/traffic/clones.json`](./data/traffic/clones.json) because the API only keeps 14 days.

> **This is a reach signal, not a demonstration.** Nobody knows what anyone did with their copy: how many installed it, how many distilled anything, how many opened the folder once. It does not count as a case and it does not answer the question the [case studies](./CASES_en.md) do. Note also that the "unique cloners" the API returns are unique **per day**, not people, so they cannot be summed into a headcount.

---


## Origin

Lore was born as a distillation of **LUS (Lore User System)**, a research program that studies how a human and an AI accumulate shared criteria over a long-term collaboration.

LUS studies the relationship. Lore is an operational implementation that emerged from that research. Its core principle fits in one idea:

> **Experience only creates value when it can participate in a future decision.**

Some of the main influences behind the program:

- **Martin Buber** — *I and Thou*
- **Claude Shannon** and **Warren Weaver** — *The Mathematical Theory of Communication*
- **Gregory Bateson** — "a difference that makes a difference"
- **Andy Clark** and **David Chalmers** — *The Extended Mind*

[Explore the research in the LUS NotebookLM](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450)

### Why "Lore"?

In video games, *lore* is what gives a universe coherence. Not the mechanics: the accumulated story, the rules that keep influencing everything that can happen afterwards.

Lore applies that same idea to development. The original events stop mattering. The criteria remain.

---

## Author

**Andrés Peña Mellado** — principal researcher of LUS.

<p>
  <a href="https://github.com/andresanemic"><img src="https://img.shields.io/badge/GitHub-andresanemic-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://x.com/andresanemic"><img src="https://img.shields.io/badge/X-@andresanemic-000000?style=for-the-badge&logo=x&logoColor=white" alt="X"></a>
  <a href="https://www.linkedin.com/in/andresanemic/"><img src="https://img.shields.io/badge/LinkedIn-Andrés%20Peña%20Mellado-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://t.me/andresanemic"><img src="https://img.shields.io/badge/Telegram-@andresanemic-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram"></a>
  <img src="https://img.shields.io/badge/Discord-andresanemic-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord">
  <a href="mailto:andres@healthproof.cl"><img src="https://img.shields.io/badge/Email-andres@healthproof.cl-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"></a>
</p>

Questions, cases that contradict ours, a Lore that came out weird? The [repository discussions](https://github.com/andresanemic/lore-plugin/discussions) are the place. The cases that **refute** something are the ones that help most.

> **If Lore saved you from explaining yourself again, a ⭐ on the repo helps other people find it.**

---

<a id="español"></a>

<p align="center">
  <img src="https://i.imgur.com/AKHwfNa.png" alt="Lore" width="100%">
</p>

<p align="right">
  <strong>Language / Idioma:</strong>
  <a href="#english">English</a> |
  <a href="#español">Español</a>
</p>

<h1 align="center">Lore</h1>

<p align="center">
  <a href="#instalación"><img src="https://img.shields.io/badge/versi%C3%B3n-2.0.3-F72585?style=for-the-badge&labelColor=0B0B12" alt="Versión"></a>
  <a href="#instalación"><img src="https://img.shields.io/badge/Claude_Code-plugin-7B2CBF?style=for-the-badge&labelColor=0B0B12" alt="Claude Code"></a>
  <a href="#qué-es-lore"><img src="https://img.shields.io/badge/paradigma-Spec--Driven_Development-00D9FF?style=for-the-badge&labelColor=0B0B12" alt="SDD"></a>
  <a href="#qué-es-lore"><img src="https://img.shields.io/badge/fine--tuning-local-FFBE0B?style=for-the-badge&labelColor=0B0B12" alt="Fine-tuning local"></a>
  <a href="#obsidian--la-puerta-de-entrada"><img src="https://img.shields.io/badge/Obsidian-compatible-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white&labelColor=0B0B12" alt="Compatible con Obsidian"></a>
  <a href="#origen"><img src="https://img.shields.io/badge/investigaci%C3%B3n-activa-10B981?style=for-the-badge&labelColor=0B0B12" alt="Estado"></a>
  <a href="#el-benchmark"><img src="https://img.shields.io/badge/benchmark-72_corridas-FF6B35?style=for-the-badge&labelColor=0B0B12" alt="Benchmark: 72 corridas"></a>
  <a href="#invariantes-compartidas"><img src="https://img.shields.io/badge/todo_local-cero_red-14B8A6?style=for-the-badge&labelColor=0B0B12" alt="Todo local, cero red"></a>
  <a href="./LICENSE"><img src="https://img.shields.io/badge/licencia-MIT-6B7280?style=for-the-badge&labelColor=0B0B12" alt="MIT"></a>
</p>

<p align="center">
  <b>Deja de explicarle tu proyecto a la IA todas las mañanas.</b><br>
  Lore guarda el criterio detrás de tus decisiones y lo carga en la siguiente sesión.
</p>

<p align="center">
  no volver a explicar el stack &nbsp;·&nbsp; no volver a proponer lo que descartaste la semana pasada &nbsp;·&nbsp; criterio que sobrevive al cierre de la sesión
</p>

<p align="center">
  <i>Un kit SDD que te permite hacer fine-tuning local de tus tareas — y el que entrena eres tú.</i>
</p>

<p align="center">
  <code>8 skills · 7 casos de estudio · 72 corridas de benchmark</code>
</p>

<h3 align="center">Hasta <strong>28% más rápido</strong> y <strong>24% menos tokens de salida</strong> para llegar a un resultado correcto, con <strong>+28 puntos de correctitud al primer intento.</strong></h3>

| Métrica | Codex frío | Codex + Lore |
|---|---:|---:|
| Correctitud al primer intento | 37% | **65% (+28 pts)** |
| Tiempo hasta un resultado correcto | 118 s | **85 s (−28%)** |
| Tokens de salida hasta un resultado correcto | 4.116 | **3.119 (−24%)** |

<p align="center"><sub>72 corridas controladas · 12 tareas congeladas · mismo agente, herramientas y tarea; solo cambió Lore. Lore empeoró <strong>0/12</strong> resultados. <a href="#el-benchmark">Método y límites ↓</a></sub></p>

---

<table>
<tr>
<td width="33%" valign="top">

**Empezar**

[El problema](#el-problema)
[Qué es Lore](#qué-es-lore)
[Cómo funciona](#cómo-funciona)
[Benchmark](#el-benchmark)
[Instalación](#instalación)

</td>
<td width="33%" valign="top">

**Usarlo**

[Arquitectura](#arquitectura)
[Las ocho skills](#las-ocho-skills)
[Obsidian](#obsidian--la-puerta-de-entrada)
[Documentación](#documentación)

</td>
<td width="33%" valign="top">

**Entenderlo**

[Invariantes](#invariantes-compartidas)
[Casos de estudio](./CASES_es.md)
[Alcance](#alcance) · [Origen](#origen)

</td>
</tr>
</table>

---

## El problema

Abres una sesión. Explicas, otra vez, para qué es el proyecto. Qué camino ya probaste y por qué lo descartaste. Qué atajo te costó una tarde el mes pasado, y qué decisión no vas a volver a abrir.

Todo eso lo explicaste ayer. Mañana lo vas a explicar de nuevo.

Mientras tanto el proyecto sigue acumulando lo que de verdad te costó —decisiones de arquitectura, incidentes en producción, experimentos fallidos, decenas de momentos de *«nunca volvamos a hacer esto»*— y **nada de eso sobrevive a la sesión**.

Es un bucle de reexplicaciones y de soluciones mediocres que ya habías rechazado. LUS lo llama **experiencia efímera**, y no ocurre porque se olviden los datos: ocurre porque el aprendizaje nunca se convirtió en una estructura reutilizable.

> La documentación tradicional resolvió parte del problema, pero solo preserva **información**. Los manuales describen procedimientos, los README explican instalaciones, las bases de datos guardan hechos. Casi nunca capturan lo que de verdad modifica una decisión futura.

---

## Qué es Lore

Un kit ligero de **Spec-Driven Development** para Claude Code. O, en una línea: **fine-tuning local de tus tareas, y el que entrena eres tú.**

Un fine-tune condiciona un modelo con miles de ejemplos hasta que deja de responder como generalista. Lore llega al mismo lugar por el otro lado: una restricción escrita por cada cosa que salió mal. No se entrena nada y ningún peso se mueve, así que tu criterio se queda en texto plano que puedes leer, corregir en una línea y llevarte mañana a otro modelo.

Un fine-tune deja de pedirte cosas el día que está listo. Lore no para nunca: una destilación, cada vez que algo se rompe. Ese es el costo, y conviene saberlo antes de instalar nada.

Aporta tres cosas:

- una convención sencilla para organizar el criterio de un proyecto;
- siete *skills* que operan esa convención;
- y un ciclo continuo para destilar experiencia en criterio reutilizable.

Lo de *spec-driven* no es una etiqueta. `CLAUDE.md` es el contrato, `FASES.md` es el estado y lo que viene, y `lore/` es el criterio que restringe cómo se construye todo lo anterior.

A diferencia de la documentación, Lore no intenta describirlo todo. Solo conserva aquello que modifica el comportamiento futuro.

Un README responde *«¿qué es esto?»*. Lore responde otra cosa:

> **¿Qué aprendimos que nunca deberíamos tener que volver a aprender?**

> [!IMPORTANT]
> **Si una frase no restringe una decisión futura, no es Lore.** Esa regla es todo el filtro, y es lo que impide que el sistema se convierta en otro cementerio de documentos.

---

## Cómo funciona

Todo problema resuelto contiene dos cosas: la solución, y la razón por la que esa solución existe. La documentación conserva la primera. **Lore conserva la segunda.**

En lugar de registrar lo que pasó, lo destila en una **Pista Invariante**: una restricción pequeña que sigue sirviendo mucho después de que el contexto original desapareció.

| En vez de recordar | Lore guarda |
|---|---|
| «Tuvimos un problema de hidratación en Next.js» | «Nunca uses estado del cliente para controlar la opacidad inicial» |
| «Al desplegar desde Windows los assets daban 404» | «Prohibido comprimir con herramientas nativas de Windows: usar `tar.exe -a -c -f`» |

El acontecimiento se olvida. El criterio sigue trabajando.

### El ciclo

<p align="center">
  <img src="https://i.imgur.com/I7odxus.png" alt="Lore" width="100%">
</p>

Cada paso del ciclo pasa por un **HARD-GATE**: se propone, tú apruebas, recién entonces se escribe.

---

## Instalación

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Dos líneas, sin dependencias ni configuración. Después escribe `use-lore` y el kit te guía hacia la skill que necesitas.

> **¿Usas otra herramienta de IA?** Cada skill es un archivo Markdown con encabezado YAML: el empaquetado es de Claude Code, la arquitectura no. Copia la carpeta de la skill donde quieras, o pega su cuerpo como prompt de sistema.

> **¿Quieres investigar LUS?** [research-lus](https://github.com/andresanemic/research-lus)
> lleva el corpus público, la bibliografía, los casos, las hipótesis y el Lore de investigación
> científica del programa a una sesión crítica. Mantiene privada la conversación de cada
> investigador con Logos y funciona por sí solo; instala Lore Plugin a su lado solo si además
> necesitas crear, preservar o actualizar el Lore de tus propios proyectos.

> **¿Quieres una sola puerta para entrar a esos proyectos?** [Lore in the Shell](https://github.com/andresanemic/lore-in-the-shell)
> abre una carpeta gobernada por Lore con la CLI y el modelo de Claude Code o Codex que elijas.
> `create-bot` de Lore Plugin puede crear un launcher mínimo sin esa skill; instala el plugin
> separado para recibir el flujo mantenido de proveedor/modelo, colores opcionales y actualizaciones.

### Así se ve en la práctica

Acabas de pasar dos horas peleando con un parpadeo al cargar la página. Lo resolviste. En vez de cerrar la pestaña:

```text
› guarda en lore
```

```text
  Destilé esto:

  [animacion] Parpadeo al cargar — el estado inicial delegado a JS

  Contexto ······ Next.js con animaciones de entrada en SSR
  Causa raíz ···· el JS se hidrata después de que el navegador pintó
                  el HTML crudo, así que el elemento aparece visible
                  un frame antes de que la animación lo oculte
  Pista ········· prohibido delegar el estado inicial a JS. Vive
                  inline en el JSX (opacity: 0). Usar fromTo para
                  transicionar, nunca para crear el estado
  Confianza ····· confirmada — validado en la app corriendo

  → proyectos/cliente-a/lore/animacion.md
  → esta Pista es genérica y confirmada: ¿la promuevo al Área,
    para que la vean los otros 3 proyectos?

  ¿Escribo?
```

Tres meses después, en otro proyecto del Área, alguien pide una animación de entrada. El criterio ya está cargado y esa discusión no vuelve a ocurrir.

---

## Arquitectura

### Los seis artefactos

| Artefacto | Qué guarda | Dónde |
|---|---|---|
| `identidad.md` | Qué es el proyecto, su propósito y su **piso de calidad** | `lore/` |
| `principios.md` | Leyes invariantes, técnicas y de negocio | `lore/` |
| Módulos temáticos | Cicatrices técnicas por dominio | `lore/` |
| `index.md` | Mapa de navegación: una línea por patrón | `lore/` |
| `FASES.md` | Estado y hoja de ruta | raíz |
| `CLAUDE.md` | Contrato de colaboración, reducido a **punteros** | raíz |

Cada uno tiene una responsabilidad. Ninguno duplica a otro.

> **El Lore es criterio (persiste); `FASES.md` es estado (avanza).** Nunca se mezclan, y `FASES.md` nunca vive dentro de `lore/`.

### Herencia Área → Proyecto

```text
desarrollo-web/
│
├── lore/                      ← el criterio general vive UNA sola vez
│     identidad · principios · index · animacion · scroll · layout
│
├── FASES.md                   ← registro de proyectos del Área
├── CLAUDE.md                  ← contrato del Área
│
└── proyectos/
    ├── cliente-a/
    │   └── lore/              ← solo lo propio; el index apunta al Área
    ├── cliente-b/
    │   └── lore/
    └── cliente-c/
        └── lore/
```

Arreglas una Pista genérica una vez, en el Área, y todos los proyectos la ven.

### La tercera forma: un bot

| | Área | Proyecto | **Bot** |
|---|---|---|---|
| Contiene | proyectos | un trabajo | **una sesión de trabajo** |
| Su Lore gobierna | el método del dominio | ese trabajo | **cómo se comporta el agente** |
| Se abre para | ver el registro | avanzar eso | **trabajar en varios proyectos** |

Las Áreas y los proyectos son lugares; **un bot es una lente que llevas a ellos.**

---

## Las ocho skills

| Skill | Para qué | Cuándo |
|---|---|---|
| [`use-lore`](#use-lore) | Punto de entrada: explica el modelo y te manda a la skill correcta | primero, siempre |
| [`brainstorming-lore`](#brainstorming-lore-1) | Diseña cambios en los artefactos Lore sin chocar con skills generales de brainstorming | antes de crear o reestructurar Lore de forma material |
| [`create-area`](#create-area) | Crea un Área con su Lore compartido | al abrir un dominio nuevo |
| [`create-project`](#create-project) | Crea un proyecto que hereda del Área | al empezar un trabajo |
| [`save-to-lore`](#save-to-lore) | Destila una lección y decide si sube al Área | todos los días |
| [`transmute-lore`](#transmute-lore) | Migra proyectos viejos, limpia duplicados, traduce el Lore o lo pone al día con una versión nueva del kit | al heredar algo sin Lore, o al actualizar el plugin |
| [`create-bot`](#create-bot) | Un lugar donde abrir sesión y trabajar sobre varias Áreas a la vez | cuando ya hay Lore que reunir |
| [`obsidian-lore`](#obsidian--la-puerta-de-entrada) | Convierte tus notas sueltas en criterio | cuando la bandeja pesa |

### `use-lore`

El punto de entrada. Explica el modelo de Lore, el estándar de seis artefactos, el modelo Área↔Proyecto, y te guía hacia la skill adecuada. Léelo antes de invocar cualquier otro.

> **Cambio de nombre en 2.0:** `using-lore` ahora es `use-lore`. Al actualizar, elimina la skill
> anterior; no conserves ambos nombres instalados porque duplican el trigger de entrada.

### `brainstorming-lore`

La conversación de diseño propia del kit. Es deliberadamente específica: se activa para Lore, bots, Áreas, proyectos y fases —no para ideación general— y entrega el resultado aprobado a la skill dueña del artefacto y de su HARD-GATE.

### `create-area`

Crea un Área nueva con su propio Lore compartido: `identidad.md` + `principios.md`, un `index.md`, un `CLAUDE.md`, un `FASES.md` que hace de registro de proyectos, y una carpeta `proyectos/` vacía. Hace un brainstorm de la identidad **antes** de tocar el disco.

### `create-project`

Crea un proyecto dentro de un Área existente. El proyecto hereda el criterio del Área en vez de duplicarlo: conserva su `identidad.md` y `principios.md` propios, y un `index.md` que **apunta** a los módulos del Área por ruta relativa. La estructura de carpetas y las fases se derivan de los documentos fuente del proyecto, no de una plantilla genérica.

### `save-to-lore`

El flujo que usarás todos los días. Resuelves algo que costó y escribes «guarda en lore». La skill extrae el criterio detrás de la solución, lo escribe donde corresponde y **propone** —nunca ejecuta— subirlo al Área si sirve para todos los proyectos.

- Las lecciones específicas se quedan en el proyecto.
- Las genéricas y confirmadas se proponen para promoción al Área.
- Nada se promueve automáticamente.

| Modo | Fuente | Qué hace |
|---|---|---|
| **capture** (por defecto) | **fricción vivida**: un bug, un cliente que rechaza | Destila la cicatriz en una Pista Invariante. |
| **arbitrate** | **criterio importado**: una skill, una guía ajena | Lo juzga contra la finalidad de **tu** proyecto. |

> **Un criterio ajeno no se destila, se arbitra.** Una skill es criterio destilado por otro, bajo otra finalidad, y llega sin declarar dónde deja de valer. Por eso `arbitrate` exige registrar **dónde la fuente contradice tu estándar y pierde**: sin esa sección no entra. Lo que la fuente pierde vale más que lo que aporta — el resumen ya existe, mejor escrito, en la fuente.

Dos avisos que te dará:

- **Capacidad ≠ criterio.** Una skill que **ejecuta** se **usa** como dependencia: no es Lore. Solo se arbitra la que **juzga**.
- **Sin identidad no hay arbitraje.** Si tu `identidad.md` está vacío, frente a una fuente con autoridad lo único que puedes hacer es obedecerla.

### `transmute-lore`

| Modo | Qué hace |
|---|---|
| **add** | Rescata el criterio ya disperso y lo cristaliza en los seis artefactos. |
| **clean** | Elimina los módulos del proyecto que el Área ya posee. El criterio cambia de dueño. |
| **translate** | Estandariza el idioma de un Lore existente, sin alterar estructura ni significado. |
| **upgrade** | Pone al día un Lore sano escrito contra una versión anterior de estos skills. Clasifica cada hallazgo en Missing, Superseded o **Earned**, y lo que el proyecto pagó con fricción real se deja intacto. |

### `create-bot`

Te permite **trabajar desde un solo lugar sobre varias Áreas que forman parte de un mismo proyecto**. A eso lo llamamos *federar*.

Piensa en un laboratorio de blockchain: tiene su sitio web, lleva sus redes sociales, y sostiene líneas de investigación y de transferencia tecnológica. Cada una es un Área con su propio Lore. Un bot las enruta a todas hacia una misma carpeta: abres la sesión ahí y trabajas en cualquiera de ellas.

**Un bot no responde preguntas sobre los proyectos: trabaja en ellos.**

> **Su norte, y el único test que importa:** *una instrucción corta basta.* Si hubo que explicarle el proyecto al bot para obtener el resultado, faltaba criterio cargado.

**Dos modos**, según de dónde sale el criterio:

| Modo | Cuándo | Qué produce |
|---|---|---|
| **`nuevo`** | Desde 0. No hay Lore previo que reunir. | Canon nacido de un brainstorm + documentos fuente. |
| **`federar`** | El criterio ya existe, disuelto en varias Áreas. | Canon **más** una tabla de enrutamiento sobre esos Lore. |

<details>
<summary><b>Cuando las carpetas todavía no tienen Lore</b></summary>

<br>

El punto de partida habitual no es un conjunto ordenado de Lore. Es material en bruto: carpetas de documentos, una base de datos, un espacio de Notion, código sin destilar. Eso no se puede federar todavía, y el arreglo es una cadena:

```text
carpeta en bruto (sin Lore)
   └─ create-area                → el Área que va a ser DUEÑA de ese criterio
        └─ transmute-lore (add)     → rescata el criterio que ya estaba disperso adentro
             └─ create-bot (federar)   → el bot enruta hacia ese Lore
```

**La ley: el bot nunca destila hacia sí mismo.** Una fuente sin Lore primero recibe su Lore **en el Área que le corresponde**. Solo entonces el bot puede federarla. De otro modo, el bot queda como único dueño de un criterio ganado en otro lugar y el Área deja de ser su fuente de verdad.

`create-bot` inspecciona las rutas que le des y te dice cuáles ya tienen Lore, cuáles hay que transmutar primero y cuáles hay que extraer a texto antes. Una bandeja de notas libres **nunca se federa**: no tiene Lore, y es `.md`, que es justo lo que vuelve fácil el error.

</details>

<details>
<summary><b>Los tres cuerpos que nunca se mezclan</b></summary>

<br>

Un bot sostiene tres cuerpos de criterio con **tres dueños distintos**. Fundirlos es el modo de falla por defecto, y es silencioso: todo sigue funcionando, y la copia empieza a ganarle a su fuente.

| Cuerpo | Qué es | Regla |
|---|---|---|
| `canon/` | criterio que el bot **es** — cargado antes de cada decisión | destilado |
| `lore/` | criterio para **mantener** el bot | propio del proyecto |
| criterio **prestado** | el Lore de cada proyecto que el bot enruta | se alcanza **por puntero**; **nunca es autoritativo** |

El test que los separa: **¿sería descartable la fuente?** Destilar produce algo más chico que puede *reemplazar* a su origen; copiar produce algo idéntico que **no puede**.

**Federar es apuntar, no copiar.** Cada fila del manifiesto es una **dirección**: la tabla dice qué Lore gobierna la tarea, y el acceso generado deja que la sesión lo alcance donde vive. Ese criterio conserva un solo dueño y una sola versión, la misma regla DRY con la que funciona todo el kit.

Y la ley que hace funcionar el enrutamiento:

> **Se enruta por tipo de tarea, no por nombre de proyecto.**

Una entidad puede tener varios cuerpos de criterio que no deben mezclarse. El corte habitual separa lo que hace de cómo lo cuenta. Nombrar la entidad no le dice al bot cuál gobierna la tarea.

</details>

<details>
<summary><b>El primer uso es un brainstorming, no un formulario</b></summary>

<br>

Este kit hace un brainstorming para construir cada artefacto que produce, así que el artefacto no recibe a su primer usuario con cuatro campos que rellenar. **Si tienes una skill de brainstorming instalada, el bot corre el primer uso a través de ella**; si no, corre uno mínimo él mismo.

- **Muestra qué alcanza antes de preguntar nada**: cada cuerpo federado, si su puntero resuelve *en esta máquina*, qué contiene su canon y qué queda fuera de alcance. Un puntero roto aparece ahí, antes de producir una respuesta que omita criterio sin decirlo.
- **Pregunta solo lo que cambia su comportamiento**, de a una pregunta. El tono y un apodo no se preguntan: se infieren de cómo escribes y se corrigen en una frase, y gastar en ellos los dos primeros turnos del artefacto no compra nada.
- **Nada de opciones cerradas para lo que decide una rama.** Una lista cerrada no puede procesar una respuesta que nombra dos opciones sin descartar una. Por eso el bot pregunta por la condición: *«¿tu trabajo cae en más de uno de estos?»*. Si la respuesta nombra dos cuerpos de criterio, abre ambos.
- **Cierra separando configuración de criterio.** Lo que es configuración se guarda. Lo que resultó ser cierto sobre *el proyecto* se propone al Lore de quien lo pagó con experiencia — nunca se queda dentro del bot.

> **Configurar el primer uso no es el primer uso.** Esa configuración se contesta igual con el canon lleno o vacío, y con las rutas sanas o rotas, así que pasarla no prueba nada sobre el bot. Un bot cuenta como estrenado cuando **una instrucción que no nombra el criterio produce un entregable**, y esa instrucción se anota textual.

</details>

<details>
<summary><b>Tres extras opcionales, apagados por defecto</b></summary>

<br>

Los tres se preguntan al configurar el bot la primera vez. Un bot sin ninguno está completo: son sellos, no piezas.

- **La copia del ecosistema (`lore-ecosistema/`).** Por defecto el bot **apunta** al Lore de cada proyecto donde vive, sin duplicar nada. Encenderla solo tiene sentido si quien va a usar el bot **no** tiene tus carpetas: ahí el puntero no apunta a nada y la copia es lo único que hace existir ese criterio en su máquina.
- **Empaquetarlo como *plugin* compartible.** Por defecto **no se crea**. Un bot es una carpeta con su canon y su `CLAUDE.md`: abres la sesión ahí y el criterio ya está cargado, sin instalar nada. Envolverlo en una skill con su repositorio propio sirve para **una sola cosa**, repartirlo a un equipo, y si vas a trabajar tú solo es andamiaje que igual hay que mantener.
- **Cifrado del Lore** — *experimental*, ver [`ENCRYPTION.md`](./ENCRYPTION.md).

</details>

---

## Obsidian — la puerta de entrada

Si ya escribes notas en Obsidian, ya tienes la materia prima. Apunta la vault a la **carpeta madre de tus Áreas** (*Open folder as vault*) y el mismo árbol de archivos es a la vez tu espacio de trabajo y tu vault.

Después, cuando quieras:

> «revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore»

`obsidian-lore` barre la bandeja, separa lo que es criterio de lo que no, te dice a qué Lore va cada cosa y **espera tu aprobación** antes de escribir nada.

> [!IMPORTANT]
> **Ten tus notas en un bot. De forma permanente, no como una opción entre varias.**
>
> Es la configuración para la que esta skill fue diseñada, y la razón es el enrutamiento. Un bot lleva una tabla con la finalidad de cada Área y proyecto que federa escrita ahí, así que una nota se enruta **contra esa tabla** y los casos frontera se preguntan en vez de adivinarse. Desde una carpeta suelta, el enrutamiento sale de una sola ruta y de la lectura del texto: una conjetura con la misma cara de certeza.
>
> ¿Todavía sin bot, y tus notas tocan más de un Área? La skill te va a proponer `create-bot`. Hazle caso.

```text
<tu carpeta madre>/             ← ábrela como vault en Obsidian
  desarrollo-web/               ← tus Áreas y proyectos, con su Lore
  bots/proyectos/mi-bot/        ← ★ abre tus sesiones acá
    notas/                      ← la bandeja que importa: enrutada, no adivinada
    canon/ · lore/ · CLAUDE.md
```

### Qué hace con cada nota

El discriminador no es la calidad de la nota: es si registra una **transformación** o solo un **hecho**.

| La nota registra | Adónde va |
|---|---|
| Una fricción que **resolviste** | Pista Invariante en el Lore |
| Una **tarea** o un problema abierto — *«hay que añadir X»* | `FASES.md`. Es estado, no criterio |
| Criterio ajeno que recogiste | Arbitraje contra tu estándar |
| Un resumen, un link, un apunte de reunión | Ruido, y te lo informa |

La mayoría de una bandeja real cae en la última fila: una carpeta de notas se llena de información, y el criterio es lo raro adentro.

> **Por qué un barrido y no un botón de guardar.** Escribir la nota ya se siente como haberla guardado, así que nadie vuelve a destilarla. Probamos separar las notas del Lore, y el registro quedó seis semanas sin usarse (Caso 05). El barrido es lo que rompe eso: cada pase te dice cuántas notas siguen sin minar, y desde cuándo.

### Dónde vive la bandeja

**Donde abres la sesión** — y **la raíz de la vault nunca tiene una**. Una nota escrita ahí no tiene dueño ni tabla contra la cual enrutarse. Peor: un bot no alcanza la raíz, de modo que el barrido no la lee, no falla y reporta deuda cero. Una nota que no pertenece a ningún proyecto significa que falta el proyecto — `create-project`, no una bandeja huérfana. Y el motivo no es que nadie trabaje en la raíz: alguien trabaja ahí cada vez que algo tiene que estar por encima de todas las Áreas — un launcher que enruta a todas, una spec que decide un Área nueva. La raíz es un lugar de trabajo **sin Lore**, así que lo que pasa ahí queda sin registrar y no llega ni a ser una nota — o sea que falta un **Área** (`create-area`), tampoco una bandeja.

Cada nota minada recibe una marca con fecha y destino, **incluidas las que no produjeron nada**. La skill **nunca borra una nota**: se mina antes de borrar, y borrar lo decides tú.

**Una nota es fuente, nunca criterio.** Responde *«qué pasó»*; el Lore responde *«qué cambió por eso»*.

---

## Invariantes compartidas

- El Lore se escribe **en tu idioma**.
- **El criterio nunca se inventa.** Todo proviene de experiencia real.
- **Una nota es fuente, nunca criterio.**
- **El ruido descartado se informa**, nunca se elimina en silencio.
- Todo cambio pasa por un **HARD-GATE** antes de escribirse.
- **Nada hace *commit* automáticamente.** Tú revisas el *diff* final.

---

## El benchmark

<p align="center">
  <img src="./assets/benchmark-impact-es.png" alt="Benchmark de Lore: 28 puntos más de correctitud al primer intento, 28 por ciento menos tiempo y 24 por ciento menos tokens de salida hasta un resultado correcto" width="100%">
</p>

**Lore hace más antes de responder, para que tú repitas menos.** Probamos doce tareas congeladas con tres corridas independientes por condición: Codex frío y Codex con Lore, para un total de 72 corridas. Lore dedica más tiempo a leer antes de un intento; la medida útil es el trabajo necesario para terminar correctamente.

| Resultado | Codex frío | Codex + Lore |
|---|---:|---:|
| Correcto al primer intento | 37% | **65%** |
| Tareas correctas cada 10 intentos | 3,7 | **6,5** |
| Lectura correcta del criterio | — | **96%** |

Son **+28 puntos de correctitud al primer intento**. Lore nunca empeoró el resultado de una tarea: mejoró 3 de las 12 y mantuvo el resultado en las otras 9.

| Costo hasta llegar a un resultado correcto | Sin Lore | Con Lore | Efecto |
|---|---:|---:|---:|
| Tiempo por intento | 44 s | 55 s | +25% |
| Intentos esperados por éxito | 2,70 | **1,53** | **−43%** |
| Tiempo estimado hasta el éxito | 118 s | **85 s** | **−28%** |
| Tokens de salida hasta el éxito | 4.116 | **3.119** | **−24%** |

> **Lore fue más lento por intento, pero más rápido para terminar correctamente.**

El harness, las tareas congeladas, los graders, las salidas crudas y las fronteras declaradas están en [`bench/`](./bench/). Son resultados de Codex, no una afirmación universal sobre modelos. El mismo benchmark se repetirá con Claude Code durante la semana del 17 de agosto; esos resultados quedarán separados y no cambiarán las skills ni la versión 2.0.

---

## Documentación

| Documento | Para qué sirve |
|---|---|
| [`USAGE_es.md`](./USAGE_es.md) | Guía práctica de uso día a día, con ejemplos. |
| [`REFERENCE_es.md`](./REFERENCE_es.md) | Referencia técnica de cada artefacto y cada *skill*. |
| [`MIGRATION_es.md`](./MIGRATION_es.md) | Cómo migrar un proyecto existente con `transmute-lore`. |
| [`ENCRYPTION.md`](./ENCRYPTION.md) | El cifrado opcional y experimental del criterio de un bot: qué protege y qué no. |
| [`CASES_es.md`](./CASES_es.md) | Los siete casos de estudio, cada uno con su frontera declarada. |
| [`bench/`](./bench/) | El benchmark: harness, las doce tareas congeladas, método, fronteras declaradas y los resultados crudos. |

<details>
<summary><b>Estructura del repositorio</b></summary>

<br>

```text
lore-plugin/
  .claude-plugin/
    plugin.json
    marketplace.json

  skills/
    use-lore/
    create-area/
    create-project/
    create-bot/
      plantillas/        # validar.js · canon.js · sync.js · ecosistema.json
    save-to-lore/
    transmute-lore/
    obsidian-lore/

  README.md
  LICENSE
```

</details>

---

## Casos de estudio

Lore no se diseñó en una pizarra: cada decisión salió de aplicarlo a proyectos reales y mirar qué se rompía. LUS documenta esas aplicaciones como **casos de estudio** — siete, cada uno con su frontera declarada.

> **Estatus:** son casos, no demostraciones. n pequeño, y las siete evidencias vienen del mismo investigador. Restringen cómo usamos el kit; no pretenden ser una ley. La afirmación medida es el [benchmark](#benchmark); esto es la mitad cualitativa.

**[Leer los siete casos de estudio →](./CASES_es.md)**

---

## Alcance

<p align="center">
  <img src="./assets/reach-es.png" alt="1.000+ clonaciones y sumando" width="100%">
</p>

<p align="center">
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/1%2C127-clonaciones-F72585?style=for-the-badge&labelColor=0B0B12" alt="1.127 clonaciones"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/35-d%C3%ADas-7B2CBF?style=for-the-badge&labelColor=0B0B12" alt="35 días"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/~27-al_d%C3%ADa-00D9FF?style=for-the-badge&labelColor=0B0B12" alt="27 al día"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/221-pico-10B981?style=for-the-badge&labelColor=0B0B12" alt="221 pico"></a>
</p>

Durante treinta y cuatro días el número se mantuvo en unas veinte y pico de clonaciones diarias, mucho después del pico del lanzamiento. Esa constancia era lo interesante: no el rebote de un lanzamiento, sino gente que seguía llegando. Y entonces el 8 de agosto trajo 221 clonaciones en un solo día — un segundo pico, más alto que el del lanzamiento. Queda en los datos tal como llegó.

El ritmo diario de arriba es el constante, no el promedio con ese día adentro. Los datos vienen de la API de tráfico de GitHub y se guardan en [`data/traffic/clones.json`](./data/traffic/clones.json), porque la API solo conserva 14 días.

> **Es una señal de alcance, no una demostración.** Nadie sabe qué hizo cada quien con su copia: cuántos la instalaron, cuántos destilaron algo, cuántos abrieron la carpeta una vez. No cuenta como caso y no responde la pregunta que sí responden los [casos de estudio](./CASES_es.md). Y los «clonadores únicos» que devuelve la API son únicos **por día**, no personas: no se pueden sumar para contar cabezas.

---


## Origen

Lore nació como una destilación de **LUS (Lore User System)**, un programa de investigación que estudia cómo un ser humano y una IA acumulan criterio compartido a lo largo de una colaboración prolongada.

LUS estudia la relación. Lore es su implementación operativa. Un principio lo resume:

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

Influencias: **Martin Buber** (*Yo y Tú*), **Shannon** y **Weaver** (*The Mathematical Theory of Communication*), **Gregory Bateson** («una diferencia que produce una diferencia»), **Clark** y **Chalmers** (*The Extended Mind*).

[Explora la investigación en el NotebookLM de LUS](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450)

### ¿Por qué «Lore»?

En los videojuegos, el *lore* es aquello que da coherencia a un universo. No son las mecánicas: es la historia acumulada, las reglas que siguen influyendo en todo lo que puede ocurrir después. Los acontecimientos dejan de importar. El criterio permanece.

---

## Autor

**Andrés Peña Mellado** — investigador principal de LUS.

<p>
  <a href="https://github.com/andresanemic"><img src="https://img.shields.io/badge/GitHub-andresanemic-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"></a>
  <a href="https://x.com/andresanemic"><img src="https://img.shields.io/badge/X-@andresanemic-000000?style=for-the-badge&logo=x&logoColor=white" alt="X"></a>
  <a href="https://www.linkedin.com/in/andresanemic/"><img src="https://img.shields.io/badge/LinkedIn-Andrés%20Peña%20Mellado-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"></a>
  <a href="https://t.me/andresanemic"><img src="https://img.shields.io/badge/Telegram-@andresanemic-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram"></a>
  <img src="https://img.shields.io/badge/Discord-andresanemic-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord">
  <a href="mailto:andres@healthproof.cl"><img src="https://img.shields.io/badge/Email-andres@healthproof.cl-EA4335?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"></a>
</p>

¿Preguntas, casos que contradigan los nuestros, un Lore que quedó raro? La [discusión del repositorio](https://github.com/andresanemic/lore-plugin/discussions) es el lugar. Los casos que **refutan** algo son los que más sirven.

> **Si Lore te ahorró volver a explicarte, una ⭐ en el repositorio ayuda a que otras personas lo encuentren.**
