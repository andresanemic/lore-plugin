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
  <a href="#installation"><img src="https://img.shields.io/badge/version-2.2.2-FF557A?style=for-the-badge&labelColor=0B0B12" alt="Version"></a>
  <a href="#installation"><img src="https://img.shields.io/badge/AI_agents-provider--neutral-22D9EE?style=for-the-badge&labelColor=0B0B12" alt="Provider-neutral AI agents"></a>
  <a href="./docs/SPEC_KIT_en.md"><img src="https://img.shields.io/badge/spec--kit-compatible-F94F79?style=for-the-badge&labelColor=0B0B12" alt="spec-kit compatible"></a>
  <a href="#what-is-lore"><img src="https://img.shields.io/badge/fine--tuning-local-35E5F5?style=for-the-badge&labelColor=0B0B12" alt="Local fine-tuning"></a>
  <a href="#obsidian--the-way-in"><img src="https://img.shields.io/badge/Obsidian-compatible-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white&labelColor=0B0B12" alt="Obsidian compatible"></a>
  <a href="#origin"><img src="https://img.shields.io/badge/research-active-00DFF5?style=for-the-badge&labelColor=0B0B12" alt="Status"></a>
  <a href="#shared-invariants"><img src="https://img.shields.io/badge/local_only-no_network-FF6685?style=for-the-badge&labelColor=0B0B12" alt="Local only, no network"></a>
</p>

<p align="center">
  <b>Stop explaining your project to the AI every morning.</b><br>
  Lore keeps the criteria behind your decisions and loads it into the next session.
</p>

<h3 align="center"><strong>+44.5 points of cross-domain first-pass compliance</strong>.</h3>

<div align="center">
<table>
  <thead>
    <tr>
      <th>Metric</th>
      <th align="right">Cold Codex</th>
      <th align="right">Codex + Lore</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>First-pass compliance (Web–Editorial macro-average)</td>
      <td align="right">51.3%</td>
      <td align="right"><strong>95.8% (+44.5 pp)</strong></td>
    </tr>
    <tr>
      <td>Goals reached (≤1 correction; 52 units)</td>
      <td align="right">39/52 (75.0%)</td>
      <td align="right"><strong>52/52 (100%; +25.0 pp)</strong></td>
    </tr>
    <tr>
      <td>Observed attempts to goal completion</td>
      <td align="right">1.44</td>
      <td align="right"><strong>1.08 (−25.3%)</strong></td>
    </tr>
    <tr>
      <td>Observed time to goal completion</td>
      <td align="right">68.7 s</td>
      <td align="right"><strong>58.2 s (−15.2%)</strong></td>
    </tr>
  </tbody>
</table>
</div>

<p align="center">
  <i>An SDD kit that gives you local fine-tuning for your own tasks — and the one doing the training is you.</i>
</p>

---

<table>
<tr>
<td width="33%" valign="top">

**Start**

[The problem](#the-problem) ·
[What is Lore](#what-is-lore) ·
[How it works](#how-it-works) ·
[Benchmark](#benchmark) ·
[Installation](#installation)

</td>
<td width="33%" valign="top">

**Use it**

[Architecture](#architecture) ·
[The eight skills](#the-eight-skills) ·
[Obsidian](#obsidian--the-way-in) ·
[Documentation](#documentation)

</td>
<td width="33%" valign="top">

**Understand it**

[Shared invariants](#shared-invariants) ·
[Case studies](./docs/CASES_en.md) ·
[Reach](#reach) · [Origin](#origin)

</td>
</tr>
</table>

---

## The problem

You open a session. You explain, again, what the project is for. Which approach you already tried and why you dropped it. Which shortcut cost you an afternoon last month, and which decision you are not reopening.

You explained all of it yesterday. You will explain it again tomorrow.

Meanwhile, the things you actually paid to learn keep piling up: architecture decisions, production incidents, failed experiments, dozens of *"let's never do that again"* moments. That is the real cost — and **none of it survives the session**.

It is a loop of re-explanations and mediocre solutions you had already rejected. Lore calls this **ephemeral experience**: the facts may survive, but the learning never became a reusable structure.

> The picture is *Groundhog Day*. The world resets and **the only thing that crosses the reset is what Phil learned** — the facts are wiped every February 2nd, the criteria are not. Every session of an agent is a February 2nd.

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

Spec-driven is not a label here. Each project has a single contract chosen by its primary host — `CLAUDE.md` for Claude Code or `AGENTS.md` for Codex — `FASES.md` holds the current state, the roadmap and the task list, and `lore/` holds the criteria that constrains how all of it gets built. If you use both hosts, Codex can fall back to `CLAUDE.md`; you still do not need two contracts.

Unlike documentation, Lore does not try to describe everything. It only preserves what changes future behavior.

You do not need existing Lore to start. In **ADD** mode, `transmute-lore` can read what you already have — project folders, documents, exported chat summaries, loose notes — and propose the criteria, canon and routing hidden inside. Sources remain sources: nothing becomes Lore until you approve the distillation.

When that criterion needs to travel, **CRYSTALLIZE** creates a traceable single-Markdown “memory
card”: portable across models, usable wherever Markdown instructions are accepted, shareable on
your terms and extractable back into a working folder. It is a snapshot, never a replacement for
the live Lore.

A README answers *"what is this?"*. Lore answers something else: **What did we learn that we should never have to learn again?**

> [!IMPORTANT]
> **If a sentence does not constrain a future decision, it is not Lore.** That rule is the whole filter, and it is what keeps the system from becoming another graveyard of documents.

---

## How it works

Every solved problem contains two things: the solution, and the reason that solution exists. Documentation keeps the first. **Lore keeps the second.**

Instead of recording what happened, it distills it into an **Invariant Clue**: a small constraint that stays useful long after the original context is gone.

| Instead of remembering | Lore keeps |
|---|---|
| "The AI wrote a report that was too technical for the reader" | "Before drafting, identify who will read it and explain every unfamiliar term in plain language" |
| "A meeting summary omitted who was responsible for each task" | "Every meeting summary ends with each task, its owner and its deadline" |

The event is forgotten. The criteria keeps working.

### The loop

<p align="center">
  <img src="https://i.imgur.com/y3fsT7D.png" alt="Lore" width="100%">
</p>

Each step in the loop passes a **threshold**: it is proposed, you approve, and only then it is written.

---

## Installation

Choose **one** of the following routes. Claude Code and Codex use different commands; do not mix them.

### Claude Code

Run these commands inside Claude Code:

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Or run their CLI equivalents from a terminal:

```bash
claude plugin marketplace add andresanemic/lore-plugin
claude plugin install lore@lore-plugin
```

### Codex CLI

Run these commands in your terminal:

```bash
codex plugin marketplace add andresanemic/lore-plugin
codex plugin add lore@lore-plugin
```

### OpenCode

From a local clone, copy Lore's eight skill folders into OpenCode's global directory:

```bash
mkdir -p ~/.config/opencode/skills
cp -R skills/* ~/.config/opencode/skills/
```

Restart OpenCode. For one project, use `.opencode/skills/` instead.

### Cursor

Cursor already discovers skills installed under `~/.codex/skills/` or `~/.agents/skills/`. To keep
a separate Cursor copy, use its global directory and restart Cursor:

```bash
mkdir -p ~/.cursor/skills
cp -R skills/* ~/.cursor/skills/
```

### Google Antigravity

Antigravity loads global skills from `~/.gemini/config/skills/` and workspace skills from
`.agents/skills/`. From a local clone:

```bash
mkdir -p ~/.gemini/config/skills
cp -R skills/* ~/.gemini/config/skills/
```

Restart Antigravity after copying them.

### Direct install from the repository

Use this provider-neutral route when you prefer a local clone or want to prepare both CLIs. It requires Git and Node.js:

```bash
git clone https://github.com/andresanemic/lore-plugin.git
cd lore-plugin
node scripts/lore-plugin.mjs install --target all
codex plugin add lore@personal
```

Replace `all` with `claude` or `codex` to target only one CLI. The installer configures Claude directly; for Codex it prepares the local `personal` marketplace and prints the final `codex plugin add` command.

Then open a new CLI session. **If this is your first time, you do not need to know a single command** — write *«I want to start using Lore Plugin, help me»* and the kit opens a **brainstorming, not a menu**: it looks at your tree first, asks one question at a time, and ends with your **first artifact created**, never with a recommendation. If you already know what you want, `use-lore` routes you.

> **Using another AI tool?** Each skill is a Markdown file with a YAML header. Copy the skill folder into that tool's supported skills directory, or use its body as agent instructions. The six-piece architecture and the Area↔Project model are provider-neutral conventions, not code.

## What it looks like in practice

You just shipped a landing page and the feedback is: "I didn't know what to do next." The CTA was below the fold and the headline talked about the product, not the outcome. You fixed it. Instead of closing the tab:

```text
› save to lore
```

```text
  Distilled this:

  [cta] CTA not visible — headline without outcome

  Context ······· landing page had the CTA below the fold
  Root cause ···· headline described the product, not the
                  result for the reader
  Clue ·········· place the main CTA above the fold and
                  write the headline around the outcome,
                  not the feature
  Confidence ···· confirmed — fixed on live page

  → projects/client-a/lore/cta.md
  → this clue is generic and confirmed: promote it to the Area
    so the other 3 projects see it?

  Write it?
```

Three months later, another project in the same Area ships a landing page. The criteria is already loaded, so that mistake does not happen again.

> None of it was written without a human saying yes. The same gate governs all eight skills.

---

## Architecture

### The six pieces

Every project organizes its criteria and state into six structural pieces. They are not necessarily six files: thematic modules are one piece, implemented across as many focused files as the work requires.

| Piece | What it holds | Where |
|---|---|---|
| `identidad.md` | What the project is, its purpose and its **quality floor** | `lore/` |
| `principios.md` | Invariant laws, technical and business: prohibitions and imperatives | `lore/` |
| Thematic modules | Technical scars by domain (animation, layout, scroll…) | `lore/` |
| `index.md` | Navigation map: one line per pattern | `lore/` |
| `FASES.md` | State and roadmap: current phase, focus | root |
| `CLAUDE.md` **or** `AGENTS.md` | One collaboration contract, selected by primary host and slimmed to **pointers** | root |

Each has one responsibility. None duplicates another.

> **Lore is criteria (it persists); `FASES.md` is state (it advances).** They never mix, and `FASES.md` never lives inside `lore/`.

Identity and state stay separate because they age at different speeds: one constrains the work; the
other says where it currently stands.

The canonical names are Spanish; in your language they are localized.

#### The always-on block

The contract is the only artifact **both** hosts load without being asked, which makes it the kit's always-on channel. Its pointer section is delimited so it can be found and re-stamped without touching anything else:

> **Why a delimited block and not just a paragraph.** One piece loads first, without exception, and only then can the rest be read in any order. It is not a hierarchy of importance: the anchor is what makes everything behind it legible.

```markdown
<!-- lore:always-on -->
…what Lore governs here · where it lives · where the state lives · when to invoke instead of writing by hand…
<!-- /lore:always-on -->
```

Four items and no more, under a hard ceiling of **25 lines**. It points to `lore/` and to `FASES.md` — criteria and state live apart, but the session that receives them can only read once. An agent that gets the criteria without the phase will propose the right thing at the wrong time. The block never reproduces a clue. If a variant does not fit, move content into `lore/`; do not raise the ceiling.

Three variants: an **area** points to its own `lore/`; a **project** points to its own layer and to its mother area's; a **bot** points to `canon/` and to its **routing table** — never to the federated Lores one by one. That is why a bot that reaches twenty bodies of criteria still fits.

The owning skills stamp it idempotently inside their existing threshold; UPGRADE adds it to older
contracts. Hand-edited divergence is reported, never overwritten.

### Area → Project inheritance

Lore scales through **Areas**. An Area is a mother folder with its own Lore, and projects inherit it instead of copying it:

```text
web-development/
│
├── lore/                      ← general criteria lives ONCE
│     identity · principles · index · animation · scroll · layout
│
├── PHASES.md                  ← the Area's project registry
├── CLAUDE.md or AGENTS.md     ← the Area's one host-selected contract
│
└── projects/
    ├── client-a/
    │   └── lore/              ← only its own; the index points at the Area
    ├── client-b/
    │   └── lore/
    └── client-c/
        └── lore/
```

Fix a generic clue once in the Area and every project sees it. Each project keeps only what is truly its own — the system stays DRY without losing accumulated experience.

### The third shape: a bot

| | Area | Project | **Bot** |
|---|---|---|---|
| Holds | projects | one piece of work | **a work session** |
| Its Lore governs | the domain's method | that work | **how the agent behaves** |
| Opened to | see the registry | advance that work | **work on any of several projects** |

Areas and projects are places; **a bot is a lens you carry into them.** It is not an Area, because it owns none of the criteria it routes to. An Area that collects criteria it never earned starts receiving promotions that belong somewhere else.

---

## The eight skills

> **The skills are written in English; the Lore they produce is not** — that is written in your language, content and filenames included. The English in a `SKILL.md` is the portable substrate that lets the kit run on other hosts, not the language of the kit.
>
> So **do not open a `SKILL.md` to explain to someone what a mode does**: [`REFERENCE_es.md`](./docs/REFERENCE_es.md) documents every skill and mode in Spanish and [`USAGE_es.md`](./docs/USAGE_es.md) shows them in use. We learned this in Case 12, live and with an audience.

| Skill | What for | When |
|---|---|---|
| [`use-lore`](#use-lore) | Entry point: explains the model and routes you to the right skill | first, always |
| [`brainstorming-lore`](#brainstorming-lore) | Designs changes to Lore artifacts without colliding with general-purpose brainstorming skills | before creating or materially restructuring Lore |
| [`create-area`](#create-area) | Creates an Area with its shared Lore | opening a new domain |
| [`create-project`](#create-project) | Creates a project that inherits from the Area | starting a piece of work |
| [`save-to-lore`](#save-to-lore) | Distills a lesson and decides whether it rises to the Area | every day |
| [`transmute-lore`](#transmute-lore) | Migrates, cleans, translates, upgrades, prunes or exports a safe snapshot of Lore | inheriting, maintaining, updating or sharing Lore |
| [`create-bot`](#create-bot) | One place to open a session and work across several Areas at once | from zero, or once there is Lore to federate |
| [`obsidian-lore`](#obsidian--the-way-in) | Mines loose notes and routes what survives | once the inbox gets heavy |

### `use-lore`

> **2.0 rename:** `using-lore` is now `use-lore`. Remove the old skill when updating; do not keep
> both names installed, because duplicate entry-point triggers make routing ambiguous.

The entry point. Explains Lore's model, the six-piece standard, the Area↔Project model, and routes you to the right skill. Read it before invoking any other.

For **complex deliverables**—a researched CRM, a multi-source document, a campaign, or delivery into an external system—it also fixes the owning project and routed Lore, an approved precedent or human-approved specimen, verified tool/connector/MCP capabilities, reviewable batches, human review, and checked delivery. It routes each medium and tool to its owner skill; it is not a ninth production skill.

### `brainstorming-lore`

The kit's own design conversation. It is deliberately narrow: it activates for Lore, bots, Areas, projects and phases—not for general ideation—and hands the approved result to the skill that owns the artifact and its threshold. With provisional canon it asks only what earns a first victory; later questions must unlock a decision or improve the artifact, with uncertainty and correction kept visible.

Structural work builds the artifact while deciding: one decision at a time, two or three real approaches when a trade-off exists, and contextual recaps of the accumulated result. The floor is **recognizable continuity**—the human can still see the original intention in what is growing and correct its direction without starting over. `create-area`, `create-project`, `create-bot` and structural `transmute-lore` modes inherit this contract; mechanical edits and one-off captures do not.

The accumulated artifact is the return point. Work may advance independently; contextual recap and approved distillation resynchronize it. Portable professional criterion also refines naturally through real work.

An enjoyable Entre is not permanent agreement. Its effort feels **fertile** because correction, disagreement and review leave recognizable progress in the artifact or criterion. Pleasantness alone is not the quality signal.

### `create-area`

Creates a new Area with its own shared Lore: `identity` + `principles`, an `index.md`, one host-selected contract, a `PHASES.md` acting as project registry, and an empty `projects/` folder. It brainstorms the identity **before** touching disk.

### `create-project`

Creates a project inside an existing Area. The project inherits the Area's criteria instead of duplicating it: it keeps its own identity and principles, plus an `index.md` that **points** at the Area's modules by relative path. Folder structure and phases are derived from the project's source documents, not from a generic template.

### `save-to-lore`

The flow you will use every day. You solve something that cost you, and you type:

> "save to lore"

The skill keeps candidates while work continues and proposes capture at a contextual milestone or when related clues accumulate. Before writing, it shows destination, wording and why now; one approved preview covers the corresponding writes and commits, never a push.

- Specific lessons stay inside the project.
- Generic, confirmed ones are proposed for promotion to the Area.
- Nothing is promoted automatically.

It has **two modes**, chosen by where the criteria comes from:

| Mode | Source | What it does |
|---|---|---|
| **capture** (default) | **lived friction**: a bug, a collapse, a client rejection | Distills the scar into an Invariant Clue. |
| **graft** | **imported criteria**: a skill, a style guide, a third-party playbook, another kit's governing document | Judges it against **your** project's purpose. Only what survives gets in. |

> **External criteria is not distilled; it is arbitrated.** `graft` records where the imported
> source contradicts your standard and loses. Without that boundary it would only be a copy wearing
> the authority of an Invariant Clue. The full four-gate procedure lives in the Reference.

Two warnings `graft` mode will give you:

- **Capacity ≠ criteria.** A skill that **executes** (renders video, crawls, compiles) is **used** as a dependency: it is not Lore. Only a skill that **judges** (what is good copy, good design, good SEO) gets arbitrated.
- **No identity, no arbitration.** If your identity file is empty you have no yardstick, and facing an authoritative source all you can do is obey it. Identity first, source second.

### `transmute-lore`

Operates existing Lore in eight modes:

| Mode | What it does |
|---|---|
| **add** | Rescues criteria already scattered around (a bloated `CLAUDE.md`, a kilometric README, code comments) and crystallizes it into the six-piece architecture. |
| **clean** | Removes the project's redundant modules that the Area already owns. The criteria does not disappear: it changes owner. |
| **translate** | Standardizes the language of an existing Lore, translating content and renaming artifacts, without altering structure or meaning. |
| **upgrade** | Raises a healthy Lore written against an older version of these skills. Sorts every finding into Missing, Superseded, **Earned** or **Stale** — what the project paid for with real friction is left alone, and what no longer matches the project's own practice is reported against the repository. |
| **prune** | Prunes a Lore that decayed by **accumulating correct things**. Sorts every finding into Deadwood, Crowding, Rooted or **Unhealed**, and counts apparatus against content. What shrinks is the deliverable, not necessarily the corpus. Nothing comes out without its residue written down. |
| **micelio** | **(2.3.0)** Read-only: which clues have **no micorriza** — no step runs them, so they cannot fire. Three triggers, the third **on the way out of a pass that wrote Lore**: a new clue is born disconnected. Reports in plain language. |
| **leave** | Removes governance, keeps `lore/` — reversible via `UPGRADE` (H13). |
| **crystallize** | Exports a safe, traceable single-Markdown snapshot for a chat or notebook — every routed `lore/` inlined, extractable back into a folder whose routing table resolves — without replacing the live Lore or exposing private material. |

The Reference carries the full diagnostic categories and gates.

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

In `nuevo`, the initial human declaration is provisional canon. The first complex artifact is an individual configuration that must produce a reviewed first victory. If the bot has an interface, it is an honest local laboratory: the AI lives in the object being transformed, decisions precede prompts, and the Journey changes only when the path changes.

<details>
<summary><b>When the folders have no Lore yet</b></summary>

<br>

The usual starting point is not a tidy set of Lore bodies. It is raw material: folders of documents, a database, a Notion workspace, undistilled code. That cannot be federated yet. The fix is a short chain:

```text
raw folder (no Lore)
 └─ create-area            → creates the Area that will OWN that criteria
      └─ register path     → the existing folder is listed in FASES.md by path;
                              it stays where it is, nothing moves
           └─ transmute-lore (add) → rescues the criteria already scattered inside
                └─ create-bot (federar) → the bot routes to that Lore
```

The new Area is a clean owner; the existing folder is adopted **by path, without moving it**. The bot never distills into itself: each source first earns Lore in its owning Area, then the bot points to it. `create-bot` reports which paths are ready, which need ADD, and which still need text extraction. Free-note inboxes remain sources and are never federated.

</details>

Three bodies never merge: `canon/` contains what the bot is; `lore/`, the criteria for maintaining
it; and borrowed criteria stays in each project, reached by pointer. **Federating is pointing, not
copying, and routing follows task type.**

The first use is a brainstorm, not a form: it shows which paths resolve, asks only what changes
behaviour and separates configuration from criteria. Launch happens when a short instruction that
does not name the criteria produces a real deliverable.

Optional Lore encryption remains experimental and off by default; see
[`ENCRYPTION.md`](./docs/ENCRYPTION.md). Portability belongs to CRYSTALLIZE, which packages the bot
as an extractable Markdown memory card.

---

## Obsidian — the way in

Point Obsidian at the **mother folder of your Areas** and add a `notes/` (or `notas/`) folder inside any project, Area or bot — the same tree is your workspace and your vault. When you want the AI to read what you left there, run:

> "review my Obsidian notes and see what belongs in my lore"

`obsidian-lore` scans the folder, separates criteria from tasks and noise, proposes the owning Lore and waits for your approval. It marks each mined note with date and destination and never deletes it. A bot routes notes more reliably because it already knows each project's purpose. **A note is source, never criteria** — nothing crosses without explicit distillation and an approved diff.

---

## Shared invariants

All eight skills follow the same rules:

- Lore is written **in your language**.
- **Criteria is never invented.** Everything comes from real experience.
- **A note is source, never criteria.**
- **Discarded noise is reported**, never silently deleted.
- Every change passes a **threshold** before being written.
- **Nothing commits automatically.** You review the final diff.

Those last two are the whole bet, and they are worth stating against the alternative. A growing class
of agent frameworks keeps a memory of its own successes and failures and generates its own reusable
skills from the patterns it finds. That is a real capability and it is the opposite choice: there,
the agent gets better. Here, **the person does.** Lore's criteria live in files you own, in your
language, and nothing enters them without you approving it with the content in view. If you want a
system that learns behind your back, this is not it, and it never will be.

---

## Benchmark

<p align="center">
  <img src="./assets/benchmark-impact.png" alt="Audited Lore benchmark: 44.5 points more cross-domain first-pass compliance, every measured goal reached and 15.2 percent less observed time" width="100%">
</p>

**Lore acts as stability infrastructure when the domain changes.** The public first-pass result now reports an equal-weight macro-average across two domain families: Web and Editorial (community management plus news writing). This prevents the larger Web cut from hiding the editorial drop. Every run used **`gpt-5.6-sol` with medium reasoning effort**; model, prompt and tools were identical between arms.

<table width="100%">
  <thead><tr><th width="50%">Multidomain result</th><th align="right">Cold Codex</th><th align="right">Codex + Lore</th><th align="right">Effect</th></tr></thead>
  <tbody>
    <tr><td>First-pass compliance</td><td align="right">51.3%</td><td align="right"><strong>95.8%</strong></td><td align="right"><strong>+44.5 pp</strong></td></tr>
    <tr><td>Goals reached with at most one correction</td><td align="right">39/52 (75.0%)</td><td align="right"><strong>52/52 (100%)</strong></td><td align="right"><strong>+25.0 pp</strong></td></tr>
    <tr><td>Observed attempts to goal completion</td><td align="right">1.44</td><td align="right"><strong>1.08</strong></td><td align="right"><strong>−25.3%</strong></td></tr>
    <tr><td>Observed time to goal completion</td><td align="right">68.7 s</td><td align="right"><strong>58.2 s</strong></td><td align="right"><strong>−15.2%</strong></td></tr>
  </tbody>
</table>

**Lore reached every measured goal within the repair limit, with fewer attempts and less observed time.**

In the 72-run Web cut, Cold Codex reached **25/36 (69.4%)** and Codex + Lore **33/36 (91.7%)**.

The harness, frozen tasks, graders, raw outputs and declared limits are in [`bench/`](./bench/). These are Codex results, not a universal model claim.

---

## Documentation

This README covers motivation and architecture. Everything else lives in its own document:

| Document | What it's for |
|---|---|
| [`90_SECONDS_en.md`](./docs/90_SECONDS_en.md) | **Start here.** The whole mechanism, short enough to read before deciding whether to install anything. |
| [`USAGE_en.md`](./docs/USAGE_en.md) | Practical day-to-day usage guide: installation, core loop, and each skill with examples. |
| [`REFERENCE_en.md`](./docs/REFERENCE_en.md) | Technical reference: core concepts, the exact spec for each artifact and each skill. |
| [`MIGRATION_en.md`](./docs/MIGRATION_en.md) | How to migrate an existing project into Lore using `transmute-lore`. |
| [`ENCRYPTION.md`](./docs/ENCRYPTION.md) | The optional, experimental encryption for a bot's criteria: what it protects and what it does not. |
| [`CASES_en.md`](./docs/CASES_en.md) | The seventeen case studies, each with its declared boundary. |
| [`SPEC_KIT_en.md`](./docs/SPEC_KIT_en.md) | Using Lore alongside GitHub's spec-kit: **which levels should have it at all** — an area no, a project the whole cycle, a bot only up to `tasks` — who governs what, and the constitution that draws the border. Optional — Lore never depends on it. |
| [`bench/`](./bench/) | The benchmark: Web, Editorial and UPGRADE harnesses; frozen tasks; method; declared limits; and raw results. |

<details>
<summary><b>Repository structure</b></summary>

<br>

```text
lore-plugin/
  .claude-plugin/
    plugin.json
    marketplace.json

  .codex-plugin/
    plugin.json

  skills/
    use-lore/
    brainstorming-lore/
    create-area/
    create-project/
    create-bot/
      plantillas/        # canon.js · sync.js · ecosistema.json
    save-to-lore/
    transmute-lore/
      scripts/         # crystallize.mjs — pack / extract
    obsidian-lore/

  README.md
  LICENSE
```

</details>

---

## Case studies

Lore was not designed on a whiteboard: every decision in this kit came from applying it to real projects and watching what broke. Those applications are documented as **seventeen case studies**, each with its own declared boundary. Case 08 is the controlled benchmark summarized above; Cases 09, 10, 11, 13 and 14 turned the kit on itself; **Case 12 is the first install run by someone who is not the author**; Cases 15 and 16 fixed the external yardstick; and **Case 17 tests `create-bot` from a minimal idea through Jasmine, where provisional canon had to become a reviewed first victory**.

> **Status:** these are cases, not proofs. Small n, and **sixteen of the seventeen come from the same researcher** — Case 12 is the one that does not. What they claim constrains how we use the kit; it does not pretend to be a law. The measured claim belongs to [Case 08 and its benchmark](#benchmark); the rest are qualitative evidence.

**[Read the seventeen case studies →](./docs/CASES_en.md)**

---

## Reach

<p align="center">
  <img src="./assets/reach-en.png" alt="1,000+ clones and counting" width="100%">
</p>

<p align="center">
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/1%2C804-clones-FF557A?style=for-the-badge&labelColor=0B0B12" alt="1,804 clones"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/47-days-22D9EE?style=for-the-badge&labelColor=0B0B12" alt="47 days"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/~30-a_day-F94F79?style=for-the-badge&labelColor=0B0B12" alt="30 a day"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/225-peak-35E5F5?style=for-the-badge&labelColor=0B0B12" alt="225 peak"></a>
</p>

GitHub traffic windows preserved in [`data/traffic/clones.json`](./data/traffic/clones.json).

Lore Plugin is the technical arm of LUS, not a productivity system with philosophy attached. Its
hoped-for impact is to make shared, human-governed criteria operational. Starting a professional
memory card early lets corrections, standards and preferences compound across models. The LUS
hypothesis — only partly tested by the benchmark — is that a richer, more stable human–AI Between
can help people become better professionals and realize better projects with less repetition, time
and cost.

Morin gives this work its ethical north. In UNESCO's [*Seven Complex Lessons in Education for the
Future*](https://unesdoc.unesco.org/ark:/48223/pf0000378091), he writes that “the notion of
wager should be generalized to every faith” (our translation), including faith in fraternity,
justice and a better world. He also warns that giving up the best of all worlds does not mean giving
up a better world.
Lore makes that wager actionable through projects and bots, while evidence stays bounded to what
was measured.

> **This is a reach signal, not a demonstration.** Nobody knows what anyone did with their copy: how many installed it, how many distilled anything, how many opened the folder once. It does not count as a case and it does not answer the question the [case studies](./docs/CASES_en.md) do. Note also that the "unique cloners" the API returns are unique **per day**, not people, so they cannot be summed into a headcount.

---


## Origin

Lore was born as a distillation of **LUS (Lore User System)**, a research program that studies how a human and an AI accumulate shared criteria over a long-term collaboration.

LUS studies the relationship. Lore is an operational implementation that emerged from that research. Its core principle fits in one idea:

> **Experience only creates value when it can participate in a future decision.**

That makes us **gardeners of the Between**: the shared space where a human and an AI change what
the other can do next. We do not preserve every experience. We cultivate the ones that deserve to
orient another decision, prune what no longer constrains anything, and keep the trace of what was
discarded. Lore is not the garden; it is the practice that keeps this shared ground alive.

In simple terms, LUS asks **what happens when a person and an AI work together long enough to build
shared criteria**. Lore turns one part of that question into a practical kit. The research and the
software remain separate: an observation from using Lore is not automatically a scientific result,
and a research hypothesis does not become a skill rule without evidence and review.

The program began with a **foundational bibliography** whose concepts map directly onto the practice:

- **Martin Buber** · *Ich und Du* (1923) — the **Between**: knowledge emerges in the relation, not in the prompt or the model alone.
- **Louis Althusser** · "Ideology and Ideological State Apparatuses" (1970) — **interpellation**: the AI does not merely answer; it calls the human into a position of judgment and responsibility.
- **Gilbert Simondon** · *Individuation in Light of Notions of Form and Information* (1958) — **transduction**: friction crystallizes into a structure that changes the next interaction.
- **Claude Shannon and Warren Weaver** · *The Mathematical Theory of Communication* (1949) — **signal, entropy and noise**: why raw logs are filtered into Context, Root cause and Invariant Clue.
- **Gregory Bateson** · *Steps to an Ecology of Mind* (1972) — **"a difference that makes a difference"**: the test for whether an experience can constrain a future action.
- **Norbert Wiener** · *Cybernetics* (1948) — **feedback**: the error from real work returns to stabilize the human–AI system.
- **Edgar Morin** · *Introduction to Complex Thought* (1990) — **dialogic and organizational recursion**: parts and whole keep reshaping one another. His UNESCO lessons give this work its ethical north.
- **Andy Clark and David Chalmers** · "The Extended Mind" (1998) — **coupled external memory**: Lore can participate in cognition instead of sitting beside it as passive documentation.
- **Hubert Dreyfus** · *What Computers Still Can't Do* (1992) — **situated, tacit knowledge**: the human friction Lore translates into usable constraints for a general model.
- **Francisco Varela, Evan Thompson and Eleanor Rosch** · *The Embodied Mind* (1991) — **enaction**: criteria is not stored, it is brought forth by acting.

They are interlocutors, **not borrowed authority**: LUS uses them to expose convergences, differences and tensions in its claims about the Between, accumulated criterion and Lore.

<details>
<summary><b>Extended bibliography, and what entered in 2026</b></summary>

<br>

**The dialogue that widens it**

- **Edwin Hutchins** · *Cognition in the Wild* (1995) — **distributed cognition**: the unit that thinks is the system, not the head inside it.
- **Daniel Wegner** · transactive memory (1985) — **who remembers what**: a pair remembers more than its two members, and only while it knows who holds which part.
- **Karl Weick** · *Sensemaking in Organizations* (1995) — **sensemaking**: meaning is made retrospectively, which is why a clue is written after the friction and not during it.
- **Heinz von Foerster** · *Understanding Understanding* (2003) — **second-order cybernetics**: the observer is inside the system being described.

**Arbitrated in 2026 — and the two results are not the same**

- **Albert Camus** · *The Myth of Sisyphus* (1942) · *The Stranger* (1942) · *The Misunderstanding* (1944) · *The Rebel* (1951) · *Summer* (1954), for "Helen's Exile" and "The Almond Trees" — **entered as criterion, in one affirmation**: *a system of criteria does not reduce the absurd; it knows what to do when it appears.* The play carries it: a mother and sister kill the son who came home **because he would not say his name** — no malice, no faulty reasoning, only what was known failing to reach where it was decided. **Where Camus loses:** his *mesure* is an ethical-political limit on rebellion, not an epistemic rule of routing. It enters as a declared analogy and grounds no routing rule.
- **Martin Heidegger** · *Being and Time* (1927) — **entered as bibliography, and NOT as criterion.** Finitude assumed is what makes an existence authentic, and the intuition it was brought in for is that **the Between is finite too**. But in *Being and Time* death is *je meines* — radically one's own, **not shareable** — and that incompartibility is the engine of the argument: death **individualizes**. The unit of LUS is the relation. Adopting it would mean contradicting Heidegger exactly where his thesis rests, and that work is not done. **What he leaves open is worth more than anything adoptable today:** how can a relation anticipate an ending that neither of its parts can anticipate on the other's behalf?

</details>

<details>
<summary><b>Affective genealogy — the works that taught the sensibility</b></summary>

<br>

**Registry, not rule.** These works constrain no decision and govern nothing. They are recorded because the aesthetics and the intuitions of a technical artifact are never neutral, and knowing where they came from is what lets someone tell **inherited taste** from **argument** the day anybody proposes changing them. It belongs to LUS, not to the kit.

- **[*Fire*](https://genius.com/Waxahatchee-fire-lyrics)** · Waxahatchee — maturity as moving forward **without a total vision**. Criteria does not remove uncertainty; it responsibly narrows what the Between managed to learn.
- **[*Loving*](https://genius.com/Land-of-talk-loving-lyrics)** · Land of Talk — a fertile bond **does not fuse its parts** nor spare them friction. It makes possible what neither would have produced alone.
- ***Tales of Berseria*** · Bandai Namco (2016) — **aesthetic, not conceptual**: the art direction of this kit comes from here before any software design reference. Genealogy of the *form*.
- **[*Keep Running*](https://genius.com/Tei-shi-keep-running-lyrics)** · Tei Shi — keeping up with **who the other is now**. Criteria nobody revisits does not go neutral: it keeps operating, on someone who already changed.
- **[*Stalker*](https://en.wikipedia.org/wiki/Stalker_(1979_film))** · Tarkovsky (1979) — the nut thrown ahead, and walking to where it landed. **Not going straight at the solution is how you reach it**: pure routing.
- ***Groundhog Day*** · Ramis (1993) — the only thing that survives the reset is what Phil **learned**. **Every session of an agent is a February 2nd.**
- ***50 First Dates*** · Segal (2004) — Lucy's video gives her **who she is and where things stand**, at once. That is `lore/` ↔ `FASES.md`: criteria persists, state advances.
- **[*Running Back to You*](https://genius.com/The-juan-maclean-running-back-to-you-lyrics)** · The Juan MacLean — **autonomy with return** (`H13`). It does not demand constant contact; it demands a point where both catch up before drift makes the shared work unrecognizable.
- **[*1998*](https://www.shazam.com/song/1023974557/1998-feat-banks)** · Chet Faker with BANKS — entered after a real failure: a README asked to shrink 40% came back near 80%. It names what breaks when **a human instruction stops being a reliable floor** and collaborating turns into supervising.
- ***Aliso*** · Malena Zavala (2018) — *"admired, not reset"*. And on translation: the damage is not in one party, it is in **the language two of them broke**.

</details>

[Explore the research in the LUS NotebookLM](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450)

> **How to read it.** NotebookLM is the accessible introduction, not the source of record. For what
> the kit does, this repository wins; for a number, use the current benchmark cut.

### Why "Lore"?

In video games, *lore* is the accumulated story and rules that keep a universe coherent — tournament results, world rules, what can and cannot happen next. We borrow that image and shift the weight: here, specific events fade and **what remains is the criteria** that keeps the next work coherent. The visual debt is explicit too: the anime palette and graphic sensibility come from ***Tales of Berseria*** (Bandai Namco, 2016), the author's favorite game. Naming that provenance separates a design decision from inherited taste.

## Author

**Andrés Peña Mellado** — principal researcher of LUS.

Web3 founder of two blockchain projects and community manager at ChatterPay; formerly on the
editorial teams of **Polkadot Español** and **BeInCrypto**.

He helped establish UTEM's **Design Thinking** course and taught it from 2023 to 2025. **Speaker at
[KCD El Salvador 2023](https://www.credly.com/badges/ad17002a-16be-474b-ada4-d7ba0df3a0fd)**.

<p>
  <a href="https://github.com/andresanemic"><img src="https://img.shields.io/badge/GitHub-andresanemic-0B1320?style=for-the-badge&logo=github&logoColor=F4F0E8&labelColor=0B0B12" alt="GitHub"></a>
  <a href="https://x.com/andresanemic"><img src="https://img.shields.io/badge/X-@andresanemic-FF557A?style=for-the-badge&logo=x&logoColor=0B0B12&labelColor=0B0B12" alt="X"></a>
  <a href="https://www.linkedin.com/in/andresanemic/"><img src="https://img.shields.io/badge/LinkedIn-Andrés%20Peña%20Mellado-00DFF5?style=for-the-badge&logo=linkedin&logoColor=0B0B12&labelColor=0B0B12" alt="LinkedIn"></a>
  <a href="https://t.me/andresanemic"><img src="https://img.shields.io/badge/Telegram-@andresanemic-22D9EE?style=for-the-badge&logo=telegram&logoColor=0B0B12&labelColor=0B0B12" alt="Telegram"></a>
  <img src="https://img.shields.io/badge/Discord-andresanemic-F94F79?style=for-the-badge&logo=discord&logoColor=0B0B12&labelColor=0B0B12" alt="Discord">
  <a href="mailto:andres@healthproof.cl"><img src="https://img.shields.io/badge/Email-andres@healthproof.cl-35E5F5?style=for-the-badge&logo=gmail&logoColor=0B0B12&labelColor=0B0B12" alt="Email"></a>
</p>

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
  <a href="#instalación"><img src="https://img.shields.io/badge/versi%C3%B3n-2.2.2-FF557A?style=for-the-badge&labelColor=0B0B12" alt="Versión"></a>
  <a href="#instalación"><img src="https://img.shields.io/badge/agentes_de_IA-neutral_al_proveedor-22D9EE?style=for-the-badge&labelColor=0B0B12" alt="Agentes de IA neutrales al proveedor"></a>
  <a href="./docs/SPEC_KIT_es.md"><img src="https://img.shields.io/badge/spec--kit-compatible-F94F79?style=for-the-badge&labelColor=0B0B12" alt="spec-kit compatible"></a>
  <a href="#qué-es-lore"><img src="https://img.shields.io/badge/fine--tuning-local-35E5F5?style=for-the-badge&labelColor=0B0B12" alt="Fine-tuning local"></a>
  <a href="#obsidian--la-puerta-de-entrada"><img src="https://img.shields.io/badge/Obsidian-compatible-7C3AED?style=for-the-badge&logo=obsidian&logoColor=white&labelColor=0B0B12" alt="Compatible con Obsidian"></a>
  <a href="#origen"><img src="https://img.shields.io/badge/investigaci%C3%B3n-activa-00DFF5?style=for-the-badge&labelColor=0B0B12" alt="Estado"></a>
  <a href="#invariantes-compartidas"><img src="https://img.shields.io/badge/todo_local-cero_red-FF6685?style=for-the-badge&labelColor=0B0B12" alt="Todo local, cero red"></a>
</p>

<p align="center">
  <b>Deja de explicarle tu proyecto a la IA todas las mañanas.</b><br>
  Lore guarda el criterio detrás de tus decisiones y lo carga en la siguiente sesión.
</p>

<h3 align="center"><strong>+44,5 puntos de cumplimiento multidominio al primer intento</strong>.</h3>

<div align="center">
<table>
  <thead>
    <tr>
      <th>Métrica</th>
      <th align="right">Codex frío</th>
      <th align="right">Codex + Lore</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Cumplimiento al primer intento (macromedia Web–Editorial)</td>
      <td align="right">51,3%</td>
      <td align="right"><strong>95,8% (+44,5 pp)</strong></td>
    </tr>
    <tr>
      <td>Metas alcanzadas (≤1 corrección; 52 unidades)</td>
      <td align="right">39/52 (75,0%)</td>
      <td align="right"><strong>52/52 (100%; +25,0 pp)</strong></td>
    </tr>
    <tr>
      <td>Intentos observados hasta completar la meta</td>
      <td align="right">1,44</td>
      <td align="right"><strong>1,08 (−25,3%)</strong></td>
    </tr>
    <tr>
      <td>Tiempo observado hasta completar la meta</td>
      <td align="right">68,7 s</td>
      <td align="right"><strong>58,2 s (−15,2%)</strong></td>
    </tr>
  </tbody>
</table>
</div>

<p align="center">
  <i>Un kit SDD que te permite hacer fine-tuning local de tus tareas — y el que entrena eres tú.</i>
</p>

---

<table>
<tr>
<td width="33%" valign="top">

**Empezar**

[El problema](#el-problema) ·
[Qué es Lore](#qué-es-lore) ·
[Cómo funciona](#cómo-funciona) ·
[Benchmark](#el-benchmark) ·
[Instalación](#instalación)

</td>
<td width="33%" valign="top">

**Usarlo**

[Arquitectura](#arquitectura) ·
[Las ocho skills](#las-ocho-skills) ·
[Obsidian](#obsidian--la-puerta-de-entrada) ·
[Documentación](#documentación)

</td>
<td width="33%" valign="top">

**Entenderlo**

[Invariantes](#invariantes-compartidas) ·
[Casos de estudio](./docs/CASES_es.md) ·
[Alcance](#alcance) · [Origen](#origen)

</td>
</tr>
</table>

---

## El problema

Abres una sesión. Explicas, otra vez, para qué es el proyecto. Qué camino ya probaste y por qué lo descartaste. Qué atajo te costó una tarde el mes pasado, y qué decisión no vas a volver a abrir.

Todo eso lo explicaste ayer. Mañana lo vas a explicar de nuevo.

Mientras tanto, lo que de verdad te costó aprender se sigue acumulando: decisiones de arquitectura, incidentes en producción, experimentos fallidos, decenas de momentos de *«nunca volvamos a hacer esto»*. Ese es el costo real — y **nada de eso sobrevive a la sesión**.

Es un bucle de reexplicaciones y soluciones mediocres que ya habías descartado. Lore llama a esto **experiencia efímera**: los datos pueden sobrevivir, pero el aprendizaje nunca se convirtió en una estructura reutilizable.

> La imagen es *El día de la marmota*. El mundo se reinicia y **lo único que atraviesa el reinicio es lo que Phil aprendió**: los hechos se borran cada 2 de febrero, el criterio no. Cada sesión de un agente es un 2 de febrero.

> La documentación tradicional resolvió parte del problema, pero solo preserva **información**. Los manuales describen procedimientos, los README explican instalaciones, las bases de datos guardan hechos. Casi nunca capturan lo que de verdad modifica una decisión futura.

---

## Qué es Lore

Un kit ligero y neutral al proveedor de **Spec-Driven Development** para agentes de IA. O, en una línea: **fine-tuning local de tus tareas, y el que entrena eres tú.**

Un fine-tune condiciona un modelo con miles de ejemplos hasta que deja de responder como generalista. Lore llega al mismo lugar por el otro lado: una restricción escrita por cada cosa que salió mal. No se entrena nada y ningún peso se mueve, así que tu criterio se queda en texto plano que puedes leer, corregir en una línea y llevarte mañana a otro modelo.

Un fine-tune deja de pedirte cosas el día que está listo. Lore no para nunca: una destilación, cada vez que algo se rompe. Ese es el costo, y conviene saberlo antes de instalar nada.

Aporta tres cosas:

- una convención sencilla para organizar el criterio de un proyecto;
- ocho *skills* que operan esa convención;
- y un ciclo continuo para destilar experiencia en criterio reutilizable.

Lo de *spec-driven* no es una etiqueta. Cada proyecto tiene un solo contrato, elegido por su host principal —`CLAUDE.md` para Claude Code o `AGENTS.md` para Codex—, `FASES.md` guarda el estado, la hoja de ruta y el listado de tareas, y `lore/` guarda el criterio que restringe cómo se construye todo lo anterior. Si usas ambos hosts, Codex puede usar `CLAUDE.md` como respaldo; sigues sin necesitar dos contratos.

A diferencia de la documentación, Lore no intenta describirlo todo. Solo conserva aquello que modifica el comportamiento futuro.

No necesitas tener Lore para empezar. En modo **ADD**, `transmute-lore` lee lo que ya tienes —carpetas del proyecto, documentos, resúmenes de chats exportados, notas sueltas— y propone el criterio, el canon y el enrutamiento que viven dispersos ahí. Las fuentes siguen siendo fuentes: nada se vuelve Lore hasta que apruebas la destilación.

Cuando ese criterio necesita viajar, **CRYSTALLIZE** crea una «memory card» trazable en un solo
Markdown: portable entre modelos, utilizable donde se acepten instrucciones Markdown, compartible
en tus términos y extraíble de vuelta a una carpeta de trabajo. Es una fotografía, nunca un
reemplazo del Lore vivo.

Un README responde *«¿qué es esto?»*. Lore responde otra cosa: **¿Qué aprendimos que nunca deberíamos tener que volver a aprender?**

> [!IMPORTANT]
> **Si una frase no restringe una decisión futura, no es Lore.** Esa regla es todo el filtro, y es lo que impide que el sistema se convierta en otro cementerio de documentos.

---

## Cómo funciona

Todo problema resuelto contiene dos cosas: la solución, y la razón por la que esa solución existe. La documentación conserva la primera. **Lore conserva la segunda.**

En lugar de registrar lo que pasó, lo destila en una **Pista Invariante**: una restricción pequeña que sigue sirviendo mucho después de que el contexto original desapareció.

| En vez de recordar | Lore guarda |
|---|---|
| «La IA escribió un informe demasiado técnico para quien debía leerlo» | «Antes de redactar, identifica quién lo leerá y explica en lenguaje simple cada término poco familiar» |
| «El resumen de una reunión omitió quién era responsable de cada tarea» | «Todo resumen de reunión termina con cada tarea, su responsable y su fecha límite» |

El acontecimiento se olvida. El criterio sigue trabajando.

### El ciclo

<p align="center">
  <img src="https://i.imgur.com/I7odxus.png" alt="Lore" width="100%">
</p>

Cada paso del ciclo pasa por un **umbral**: se propone, tú apruebas y recién entonces se escribe.

> **Un umbral no se cruza en solitario.** La máquina propone con el contenido a la vista, el humano
> aprueba, y recién entonces se escribe algo. No es un cuadro de confirmación y no se negocia: una
> skill que escribe antes del umbral falló, por bueno que sea el resultado.
>
> *Hasta 2.0.9 esto se llamaba HARD-GATE. Misma regla y misma fuerza — no se ablandó ninguna
> excepción. Cambió solo la palabra, que venía de un registro que este kit no habla en ningún otro
> lado.*

---

## Instalación

Elige **una** de las siguientes rutas. Claude Code y Codex usan comandos distintos; no los mezcles.

### Claude Code

Ejecuta estos comandos dentro de Claude Code:

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

O ejecuta sus equivalentes desde una terminal:

```bash
claude plugin marketplace add andresanemic/lore-plugin
claude plugin install lore@lore-plugin
```

### Codex CLI

Ejecuta estos comandos en tu terminal:

```bash
codex plugin marketplace add andresanemic/lore-plugin
codex plugin add lore@lore-plugin
```

### OpenCode

Desde un clon local, copia las ocho carpetas de Lore en el directorio global de OpenCode:

```bash
mkdir -p ~/.config/opencode/skills
cp -R skills/* ~/.config/opencode/skills/
```

Reinicia OpenCode. Para un solo proyecto usa `.opencode/skills/`.

### Cursor

Cursor ya descubre las skills instaladas en `~/.codex/skills/` o `~/.agents/skills/`. Si prefieres
una copia separada para Cursor, usa su directorio global y reinícialo:

```bash
mkdir -p ~/.cursor/skills
cp -R skills/* ~/.cursor/skills/
```

### Google Antigravity

Antigravity carga skills globales desde `~/.gemini/config/skills/` y skills del proyecto desde
`.agents/skills/`. Desde un clon local:

```bash
mkdir -p ~/.gemini/config/skills
cp -R skills/* ~/.gemini/config/skills/
```

Reinicia Antigravity después de copiarlas.

### Instalación directa desde el repositorio

Usa esta ruta neutral al proveedor si prefieres un clon local o quieres preparar ambas CLI. Requiere Git y Node.js:

```bash
git clone https://github.com/andresanemic/lore-plugin.git
cd lore-plugin
node scripts/lore-plugin.mjs install --target all
codex plugin add lore@personal
```

Reemplaza `all` por `claude` o `codex` para preparar solo una CLI. El instalador configura Claude directamente; para Codex prepara el marketplace local `personal` e imprime el comando final `codex plugin add`.

Después abre una sesión nueva en la CLI. **Si es tu primera vez, no necesitas saber ningún comando** — escribe *«quiero comenzar a usar Lore Plugin, ayúdame»* y el kit abre un **brainstorming, no un menú**: primero mira tu árbol, después pregunta de a una cosa por vez, y termina con **tu primer artefacto creado**, nunca con una recomendación. Si ya sabes qué quieres, `use-lore` te enruta.

> **¿Usas otra herramienta de IA?** Cada skill es un archivo Markdown con encabezado YAML. Copia la carpeta de la skill en el directorio compatible de esa herramienta, o usa su contenido como instrucciones del agente. La arquitectura de seis piezas y el modelo Área↔Proyecto son convenciones neutrales al proveedor, no código.

## Así se ve en la práctica

Acabas de publicar una landing y el feedback es: "No sabía qué hacer después". El CTA quedaba abajo y el titular hablaba del producto, no del resultado. Lo corregiste. En vez de cerrar la pestaña:

```text
› guarda en lore
```

```text
  Destilé esto:

  [cta] CTA poco visible — titular sin resultado

  Contexto ······ la landing tenía el CTA debajo del pliegue
  Causa raíz ···· el titular describía el producto, no el
                  resultado para quien lee
  Pista ········· poner el CTA principal arriba del pliegue y
                  escribir el titular alrededor del resultado,
                  no de la funcionalidad
  Confianza ····· confirmada — corregido en la página publicada

  → proyectos/cliente-a/lore/cta.md
  → esta pista es genérica y confirmada: ¿la promuevo al Área
    para que la vean los otros 3 proyectos?

  ¿Escribo?
```

Tres meses después, otro proyecto del Área publica una landing. El criterio ya está cargado y ese error no se repite.

---

## Arquitectura

### Las seis piezas

Cada proyecto organiza su criterio y su estado en seis piezas estructurales. No son necesariamente seis archivos: los módulos temáticos son una sola pieza, repartida en tantos archivos enfocados como el trabajo requiera.

| Pieza | Qué guarda | Dónde |
|---|---|---|
| `identidad.md` | Qué es el proyecto, su propósito y su **piso de calidad** | `lore/` |
| `principios.md` | Leyes invariantes, técnicas y de negocio | `lore/` |
| Módulos temáticos | Cicatrices técnicas por dominio | `lore/` |
| `index.md` | Mapa de navegación: una línea por patrón | `lore/` |
| `FASES.md` | Estado y hoja de ruta | raíz |
| `CLAUDE.md` **o** `AGENTS.md` | Un contrato de colaboración, elegido por host principal y reducido a **punteros** | raíz |

Cada uno tiene una responsabilidad. Ninguno duplica a otro.

> **El Lore es criterio (persiste); `FASES.md` es estado (avanza).** Nunca se mezclan, y `FASES.md` nunca vive dentro de `lore/`.

Identidad y estado permanecen separados porque envejecen a velocidades distintas: una restringe el
trabajo; el otro dice en qué punto se encuentra.

#### El bloque siempre-activo

El contrato es el único artefacto que **los dos** hosts cargan sin que nadie se lo pida, y eso lo convierte en el canal siempre activo del kit. Su sección de punteros va delimitada para poder encontrarla y reestamparla sin tocar nada más:

> **Por qué un bloque delimitado y no un párrafo cualquiera.** Una pieza se carga primero, sin excepción, y solo entonces el resto puede leerse en cualquier orden. No es una jerarquía de importancia: el ancla es lo que vuelve legible todo lo que viene detrás.

```markdown
<!-- lore:always-on -->
…qué Lore gobierna acá · dónde vive · dónde vive el estado · cuándo invocar en vez de escribir a mano…
<!-- /lore:always-on -->
```

Cuatro elementos y no más, con un techo duro de **25 líneas**. Apunta a `lore/` y a `FASES.md`: el criterio y el estado viven separados, pero la sesión que los recibe solo puede leer una vez. Un agente que recibe el criterio sin la fase propone lo correcto en el momento equivocado. El bloque nunca reproduce una pista. Si una variante no entra, mueve contenido a `lore/`; no subas el techo.

Tres variantes: un **área** apunta a su propio `lore/`; un **proyecto** apunta al suyo y al del área madre; un **bot** apunta a `canon/` y a su **tabla de enrutamiento** — nunca a los Lore federados uno por uno. Por eso un bot que alcanza veinte cuerpos de criterio sigue entrando.

Las skills dueñas lo estampan de forma idempotente dentro de su umbral; UPGRADE lo agrega a
contratos antiguos. Una divergencia editada a mano se reporta y nunca se sobrescribe.

### Herencia Área → Proyecto

```text
desarrollo-web/
│
├── lore/                      ← el criterio general vive UNA sola vez
│     identidad · principios · index · animacion · scroll · layout
│
├── FASES.md                   ← registro de proyectos del Área
├── CLAUDE.md o AGENTS.md      ← contrato único del Área, elegido por host
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

> **Las skills están escritas en inglés y el Lore que producen, no** — ese se escribe en tu idioma, contenido y nombres de archivo incluidos. El inglés del `SKILL.md` es el sustrato portable con el que el kit funciona en otros hosts, no el idioma del kit.
>
> Así que **no abras el `SKILL.md` para explicarle a alguien qué hace un modo**: para eso está [`REFERENCE_es.md`](./docs/REFERENCE_es.md), que documenta cada skill y cada modo en español, y [`USAGE_es.md`](./docs/USAGE_es.md), que los muestra en uso. Lo aprendimos en el Caso 12, en vivo y con público.

| Skill | Para qué | Cuándo |
|---|---|---|
| [`use-lore`](#use-lore) | Punto de entrada: explica el modelo y te manda a la skill correcta | primero, siempre |
| [`brainstorming-lore`](#brainstorming-lore-1) | Diseña cambios en los artefactos Lore sin chocar con skills generales de brainstorming | antes de crear o reestructurar Lore de forma material |
| [`create-area`](#create-area) | Crea un Área con su Lore compartido | al abrir un dominio nuevo |
| [`create-project`](#create-project) | Crea un proyecto que hereda del Área | al empezar un trabajo |
| [`save-to-lore`](#save-to-lore) | Destila una lección y decide si sube al Área | todos los días |
| [`transmute-lore`](#transmute-lore) | Migra, limpia, traduce, actualiza, poda o exporta una fotografía segura del Lore | al heredar, mantener, actualizar o compartir Lore |
| [`create-bot`](#create-bot) | Un lugar donde abrir sesión y trabajar sobre varias Áreas a la vez | desde cero, o cuando ya hay Lore que federar |
| [`obsidian-lore`](#obsidian--la-puerta-de-entrada) | Mina tus notas sueltas y enruta lo que sobrevive | cuando la bandeja pesa |

### `use-lore`

El punto de entrada. Explica el modelo de Lore, el estándar de seis piezas, el modelo Área↔Proyecto, y te guía hacia la skill adecuada. Léelo antes de invocar cualquier otro.

Para **entregables complejos** —un CRM investigado, un documento de múltiples fuentes, una campaña o una entrega en un sistema externo— también fija el proyecto dueño y su Lore enrutado, un precedente aprobado o ejemplar aprobado por una persona, las capacidades verificadas de herramientas, conectores o MCPs, lotes revisables, revisión humana y la entrega comprobada. Enruta cada medio y herramienta a su skill dueña; no es una novena skill de producción.

> **Cambio de nombre en 2.0:** `using-lore` ahora es `use-lore`. Al actualizar, elimina la skill
> anterior; no conserves ambos nombres instalados porque duplican el trigger de entrada.

### `brainstorming-lore`

La conversación de diseño propia del kit. Es deliberadamente específica: se activa para Lore, bots, Áreas, proyectos y fases —no para ideación general— y entrega el resultado aprobado a la skill dueña del artefacto y de su umbral. Con canon provisional pregunta solo lo necesario para obtener una primera victoria; las preguntas siguientes deben desbloquear una decisión o mejorar el artefacto, admitiendo incertidumbre y corrección.

El trabajo estructural construye el artefacto mientras decide: una decisión por vez, dos o tres enfoques reales cuando existe un trade-off y recapitulaciones contextuales del resultado acumulado. El piso es la **continuidad reconocible**: la persona sigue viendo su intención original en lo que crece y puede corregir el rumbo sin comenzar de nuevo. `create-area`, `create-project`, `create-bot` y los modos estructurales de `transmute-lore` heredan este contrato; las ediciones mecánicas y capturas puntuales no.

El artefacto acumulado es el punto de retorno. El trabajo puede avanzar por separado; la recapitulación y la destilación aprobada lo resincronizan. El criterio profesional portable también se afina con el uso real.

Un Entre disfrutable no es acuerdo permanente. Su esfuerzo se percibe como **fértil** porque la corrección, el desacuerdo y la revisión dejan progreso reconocible en el artefacto o el criterio. La agradabilidad por sí sola no es la señal de calidad.

### `create-area`

Crea un Área nueva con su propio Lore compartido: `identidad.md` + `principios.md`, un `index.md`, un contrato elegido por host, un `FASES.md` que hace de registro de proyectos, y una carpeta `proyectos/` vacía. Hace un brainstorm de la identidad **antes** de tocar el disco.

### `create-project`

Crea un proyecto dentro de un Área existente. El proyecto hereda el criterio del Área en vez de duplicarlo: conserva su `identidad.md` y `principios.md` propios, y un `index.md` que **apunta** a los módulos del Área por ruta relativa. La estructura de carpetas y las fases se derivan de los documentos fuente del proyecto, no de una plantilla genérica.

### `save-to-lore`

El flujo que usarás todos los días. Mantiene candidatas mientras avanza el trabajo y propone guardarlas en un hito contextual o cuando se acumulan pistas relacionadas. Antes de escribir muestra destino, redacción y por qué ahora; una vista aprobada cubre las escrituras y commits correspondientes, nunca un push.

- Las lecciones específicas se quedan en el proyecto.
- Las genéricas y confirmadas se proponen para promoción al Área.
- Nada se promueve automáticamente.

| Modo | Fuente | Qué hace |
|---|---|---|
| **capture** (por defecto) | **fricción vivida**: un bug, un cliente que rechaza | Destila la cicatriz en una Pista Invariante. |
| **graft** | **criterio importado**: una skill, una guía ajena, el documento de gobierno de otro kit | Lo juzga contra la finalidad de **tu** proyecto. |

> **Un criterio ajeno no se destila; se arbitra.** `graft` registra dónde la fuente importada
> contradice tu estándar y pierde. Sin esa frontera solo sería una copia con autoridad de Pista
> Invariante. El procedimiento de cuatro puertas vive en la Referencia.

Dos avisos que te dará:

- **Capacidad ≠ criterio.** Una skill que **ejecuta** se **usa** como dependencia: no es Lore. Solo se arbitra la que **juzga**.
- **Sin identidad no hay arbitraje.** Si tu `identidad.md` está vacío, frente a una fuente con autoridad lo único que puedes hacer es obedecerla.

### `transmute-lore`

Opera un Lore existente en ocho modos:

| Modo | Qué hace |
|---|---|
| **add** | Rescata el criterio ya disperso y lo cristaliza en la arquitectura de seis piezas. |
| **clean** | Elimina los módulos del proyecto que el Área ya posee. El criterio cambia de dueño. |
| **translate** | Estandariza el idioma de un Lore existente, sin alterar estructura ni significado. |
| **upgrade** | Pone al día un Lore sano escrito contra una versión anterior de estos skills. Clasifica cada hallazgo en Missing, Superseded, **Earned** o **Stale**: lo que el proyecto pagó con fricción real se deja intacto, y lo que ya no coincide con su práctica se detecta contra el repositorio y se reporta. |
| **prune** | Poda un Lore que se degradó **acumulando cosas correctas**. Clasifica cada hallazgo en Deadwood, Crowding, Rooted o **Unhealed**, y cuenta aparato contra contenido. Lo que encoge es el entregable, no necesariamente el corpus. Nada sale sin dejar su residuo escrito. |
| **micelio** | **(2.3.0)** Solo lectura: qué Pistas están **sin micorriza** — ningún paso las corre, así que no pueden dispararse. Tres disparadores, el tercero **al salir de una pasada que escribió Lore**: una Pista nueva nace desconectada. Reporta en lenguaje llano. |
| **leave** | Quita gobierno, conserva `lore/` — reversible vía `UPGRADE` (H13). |
| **crystallize** | Exporta una fotografía trazable en un solo Markdown para un chat o notebook — cada `lore/` enrutado va adentro, extraíble a una carpeta cuyo enrutamiento resuelve — sin reemplazar el Lore vivo ni exponer material privado. |

La Referencia conserva las categorías de diagnóstico y las puertas completas.

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

En `nuevo`, la declaración humana inicial es canon provisional. El primer artefacto complejo es una configuración individual que debe producir una primera victoria revisada. Si hay interfaz, es un laboratorio local honesto: la IA vive en el objeto transformado, las decisiones van antes que los prompts y la Travesía cambia solo cuando cambia el camino.

<details>
<summary><b>Cuando las carpetas todavía no tienen Lore</b></summary>

<br>

El punto de partida habitual no es un conjunto ordenado de Lore. Es material en bruto: carpetas de documentos, una base de datos, un espacio de Notion, código sin destilar. Eso no se puede federar todavía. El arreglo es una cadena corta:

```text
carpeta en bruto (sin Lore)
 └─ create-area            → crea el Área que va a ser DUEÑA de ese criterio
      └─ adopción por ruta → la carpeta existente se registra en FASES.md por ruta;
                              se queda donde está, no se mueve nada
           └─ transmute-lore (add) → rescata el criterio que ya estaba disperso adentro
                └─ create-bot (federar) → el bot enruta hacia ese Lore
```

El Área nueva es un dueño limpio; lo existente se adopta **por ruta, sin moverlo**. El bot nunca destila hacia sí mismo: cada fuente primero gana Lore en su Área dueña y luego el bot la apunta. `create-bot` informa qué rutas están listas, cuáles necesitan ADD y cuáles aún requieren extracción a texto. Las bandejas de notas siguen siendo fuentes y nunca se federan.

</details>

Tres cuerpos nunca se mezclan: `canon/` contiene lo que el bot es; `lore/`, el criterio para
mantenerlo; y el criterio prestado sigue en cada proyecto, alcanzado por puntero. **Federar es
apuntar, no copiar, y se enruta por tipo de tarea.**

El primer uso es un brainstorming, no un formulario: muestra qué rutas resuelven, pregunta solo lo
que cambia el comportamiento y separa configuración de criterio. El estreno ocurre cuando una
instrucción corta que no nombra el criterio produce un entregable real.

El cifrado del Lore sigue experimental y apagado por defecto; consulta
[`ENCRYPTION.md`](./docs/ENCRYPTION.md). La portabilidad pertenece a CRYSTALLIZE, que empaqueta el
bot como una memory card Markdown extraíble.

---

## Obsidian — la puerta de entrada

Apunta Obsidian a la **carpeta madre de tus Áreas** y agrega una carpeta `notas/` (o `notes/`) dentro del proyecto, Área o bot donde estés trabajando — el mismo árbol es tu espacio de trabajo y tu vault. Cuando quieras que la IA lo lea, activa la skill:

> «revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore»

`obsidian-lore` hace el barrido, separa criterio de tareas y ruido, propone el Lore dueño y espera tu aprobación. Marca cada nota minada con fecha y destino y nunca la borra. Un bot enruta mejor porque ya conoce la finalidad de cada proyecto. **Una nota es fuente, nunca criterio**: nada cruza sin destilación explícita y un diff aprobado.

---

## Invariantes compartidas

- El Lore se escribe **en tu idioma**.
- **El criterio nunca se inventa.** Todo proviene de experiencia real.
- **Una nota es fuente, nunca criterio.**
- **El ruido descartado se informa**, nunca se elimina en silencio.
- Todo cambio pasa por un **umbral** antes de escribirse.
- **Nada hace *commit* automáticamente.** Tú revisas el *diff* final.

Esas dos últimas son la apuesta entera, y conviene decirla contra la alternativa. Hay una clase
creciente de frameworks de agentes que guarda memoria de sus propios éxitos y fracasos y **genera sus
propias skills** a partir de los patrones que encuentra. Es una capacidad real y es la elección
contraria: ahí mejora el agente. Acá **mejoras tú.** El criterio de Lore vive en archivos que son
tuyos, en tu idioma, y nada entra en ellos sin que lo apruebes con el contenido a la vista. Si
quieres un sistema que aprenda a tus espaldas, este no es, y no va a serlo.

---

## El benchmark

<p align="center">
  <img src="./assets/benchmark-impact-es.png" alt="Benchmark auditado de Lore: 44,5 puntos más de cumplimiento multidominio al primer intento, todas las metas medidas alcanzadas y 15,2 por ciento menos tiempo observado" width="100%">
</p>

**Lore funciona como infraestructura de estabilidad cuando cambia el dominio.** El resultado público al primer intento ahora usa una macromedia equiponderada entre dos familias: Web y Editorial (community management y redacción de noticias). Así, el mayor número de corridas Web no oculta la caída editorial. Todas las corridas usaron **`gpt-5.6-sol` con esfuerzo de razonamiento medio**; modelo, prompt y herramientas fueron idénticos entre brazos.

<table width="100%">
  <thead><tr><th width="50%">Resultado multidominio</th><th align="right">Codex frío</th><th align="right">Codex + Lore</th><th align="right">Efecto</th></tr></thead>
  <tbody>
    <tr><td>Cumplimiento al primer intento</td><td align="right">51,3%</td><td align="right"><strong>95,8%</strong></td><td align="right"><strong>+44,5 pp</strong></td></tr>
    <tr><td>Metas alcanzadas con hasta una corrección</td><td align="right">39/52 (75,0%)</td><td align="right"><strong>52/52 (100%)</strong></td><td align="right"><strong>+25,0 pp</strong></td></tr>
    <tr><td>Intentos observados hasta completar la meta</td><td align="right">1,44</td><td align="right"><strong>1,08</strong></td><td align="right"><strong>−25,3%</strong></td></tr>
    <tr><td>Tiempo observado hasta completar la meta</td><td align="right">68,7 s</td><td align="right"><strong>58,2 s</strong></td><td align="right"><strong>−15,2%</strong></td></tr>
  </tbody>
</table>

**Lore alcanzó todas las metas medidas dentro del límite de reparación, con menos intentos y menos tiempo observado.**

En el corte Web de 72 corridas, Codex frío alcanzó **25/36 (69,4%)** y Codex + Lore **33/36 (91,7%)**.

El harness, las tareas congeladas, los graders, las salidas crudas y las fronteras declaradas están en [`bench/`](./bench/). Son resultados de Codex, no una afirmación universal sobre modelos.

---

## Documentación

| Documento | Para qué sirve |
|---|---|
| [`90_SECONDS_es.md`](./docs/90_SECONDS_es.md) | **Empieza acá.** El mecanismo completo, corto como para leerlo antes de decidir si instalas algo. |
| [`USAGE_es.md`](./docs/USAGE_es.md) | Guía práctica de uso día a día, con ejemplos. |
| [`REFERENCE_es.md`](./docs/REFERENCE_es.md) | Referencia técnica de cada artefacto y cada *skill*. |
| [`MIGRATION_es.md`](./docs/MIGRATION_es.md) | Cómo migrar un proyecto existente con `transmute-lore`. |
| [`ENCRYPTION.md`](./docs/ENCRYPTION.md) | El cifrado opcional y experimental del criterio de un bot: qué protege y qué no. |
| [`CASES_es.md`](./docs/CASES_es.md) | Los diecisiete casos de estudio, cada uno con su frontera declarada. |
| [`SPEC_KIT_es.md`](./docs/SPEC_KIT_es.md) | Usar Lore conviviendo con spec-kit de GitHub: **en qué niveles conviene tenerlo** — un área no, un proyecto el ciclo completo, un bot solo hasta `tasks` — quién gobierna qué, y la constitución que traza la frontera. Opcional — Lore no depende de él. |
| [`bench/`](./bench/) | El benchmark: harnesses Web, Editorial y UPGRADE; tareas congeladas; método; fronteras declaradas; y resultados crudos. |

<details>
<summary><b>Estructura del repositorio</b></summary>

<br>

```text
lore-plugin/
  .claude-plugin/
    plugin.json
    marketplace.json

  .codex-plugin/
    plugin.json

  skills/
    use-lore/
    brainstorming-lore/
    create-area/
    create-project/
    create-bot/
      plantillas/        # canon.js · sync.js · ecosistema.json
    save-to-lore/
    transmute-lore/
      scripts/         # crystallize.mjs — pack / extract
    obsidian-lore/

  README.md
  LICENSE
```

</details>

---

## Casos de estudio

Lore no se diseñó en una pizarra: cada decisión salió de aplicarlo a proyectos reales y mirar qué se rompía. Esas aplicaciones están documentadas como **diecisiete casos de estudio**, cada uno con su frontera declarada. El Caso 08 es el benchmark controlado; los Casos 09, 10, 11, 13 y 14 volvieron el kit contra sí mismo; el **Caso 12 es la primera instalación hecha por alguien que no es el autor**; los Casos 15 y 16 fijaron la vara externa; y el **Caso 17 prueba `create-bot` desde una idea mínima mediante Jazmín, donde el canon provisional tuvo que convertirse en una primera victoria revisada**.

> **Estatus:** son casos, no demostraciones. n pequeño, y **dieciséis de los diecisiete vienen del mismo investigador** — el Caso 12 es el que no. Restringen cómo usamos el kit; no pretenden ser una ley. La afirmación medida pertenece al [Caso 08 y su benchmark](#el-benchmark); los demás aportan evidencia cualitativa.

**[Leer los diecisiete casos de estudio →](./docs/CASES_es.md)**

---

## Alcance

<p align="center">
  <img src="./assets/reach-es.png" alt="1.000+ clonaciones y sumando" width="100%">
</p>

<p align="center">
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/1%2C804-clonaciones-FF557A?style=for-the-badge&labelColor=0B0B12" alt="1.804 clonaciones"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/47-d%C3%ADas-22D9EE?style=for-the-badge&labelColor=0B0B12" alt="47 días"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/~30-al_d%C3%ADa-F94F79?style=for-the-badge&labelColor=0B0B12" alt="30 al día"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/225-pico-35E5F5?style=for-the-badge&labelColor=0B0B12" alt="225 pico"></a>
</p>

Ventanas GitHub preservadas en [`data/traffic/clones.json`](./data/traffic/clones.json).

Lore Plugin es el brazo técnico de LUS, no un sistema de productividad con filosofía agregada. Su
impacto buscado es volver operativo el criterio compartido y gobernado por la persona. Empezar pronto
una memory card profesional permite que correcciones, estándares y preferencias se acumulen entre
modelos. La hipótesis de LUS —solo parcialmente puesta a prueba por el benchmark— es que un Entre
humano–IA más rico y estable puede ayudarnos a ser mejores profesionales y realizar mejores proyectos
con menos repetición, tiempo y costo.

Morin le da a este trabajo su norte ético. En la edición de UNESCO de [*Los siete saberes
necesarios para la educación del futuro*](https://unesdoc.unesco.org/ark:/48223/pf0000378091)
escribe: «La noción de apuesta se debe generalizar para cualquier fe», incluidas la fe en la
fraternidad, la justicia y un mundo mejor. También advierte: «La renuncia al mejor de los mundos no
es de ninguna manera la renuncia a un mundo mejor».
Lore vuelve esa apuesta operable mediante proyectos y bots, mientras la evidencia se limita a lo
realmente medido.

> **Es una señal de alcance, no una demostración.** Nadie sabe qué hizo cada quien con su copia: cuántos la instalaron, cuántos destilaron algo, cuántos abrieron la carpeta una vez. No cuenta como caso y no responde la pregunta que sí responden los [casos de estudio](./docs/CASES_es.md). Y los «clonadores únicos» que devuelve la API son únicos **por día**, no personas: no se pueden sumar para contar cabezas.

---


## Origen

Lore nació como una destilación de **LUS (Lore User System)**, un programa de investigación que estudia cómo un ser humano y una IA acumulan criterio compartido a lo largo de una colaboración prolongada.

LUS estudia la relación. Lore es su implementación operativa. Un principio lo resume:

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

Eso nos vuelve **jardineros del Entre**: el espacio compartido donde un ser humano y una IA
modifican lo que el otro puede hacer después. No preservamos toda experiencia. Cultivamos la que
merece orientar otra decisión, podamos lo que ya no restringe nada y conservamos el rastro de lo
descartado. Lore no es el jardín: es la práctica que mantiene vivo ese terreno común.

En palabras simples, LUS pregunta **qué ocurre cuando una persona y una IA trabajan juntas durante
el tiempo suficiente para construir criterio compartido**. Lore convierte una parte de esa pregunta
en un kit práctico. La investigación y el software permanecen separados: una observación al usar
Lore no se vuelve automáticamente un resultado científico, y una hipótesis no se vuelve regla de
una skill sin evidencia y revisión.

El programa comenzó con una **bibliografía fundacional** cuyos conceptos se traducen directamente en la práctica:

- **Martin Buber** · *Yo y Tú* (1923) — el **Entre**: el conocimiento emerge en la relación, no en el prompt ni en el modelo.
- **Louis Althusser** · «Ideología y aparatos ideológicos de Estado» (1970) — la **interpelación**: la IA no se limita a responder; llama al humano a ocupar una posición de criterio y responsabilidad.
- **Gilbert Simondon** · *La individuación a la luz de las nociones de forma y de información* (1958) — la **transducción**: la fricción cristaliza en una estructura que modifica la siguiente interacción.
- **Claude Shannon y Warren Weaver** · *The Mathematical Theory of Communication* (1949) — **señal, entropía y ruido**: por qué los registros crudos se filtran en Contexto, Causa y Pista Invariante.
- **Gregory Bateson** · *Pasos hacia una ecología de la mente* (1972) — **«una diferencia que hace una diferencia»**: la prueba de que una experiencia puede restringir una acción futura.
- **Norbert Wiener** · *Cibernética* (1948) — la **retroalimentación**: el error del trabajo real vuelve para estabilizar el sistema humano–IA.
- **Edgar Morin** · *Introducción al pensamiento complejo* (1990) — **dialógica y recursividad organizacional**: las partes y el todo se transforman mutuamente. Sus saberes de la UNESCO le dan a este trabajo su norte ético.
- **Andy Clark y David Chalmers** · «The Extended Mind» (1998) — **memoria externa acoplada**: el Lore puede participar en la cognición en vez de quedar al lado como documentación pasiva.
- **Hubert Dreyfus** · *What Computers Still Can't Do* (1992) — **conocimiento situado y tácito**: la fricción humana que Lore traduce en restricciones útiles para un modelo generalista.
- **Francisco Varela, Evan Thompson y Eleanor Rosch** · *De cuerpo presente* (1991) — la **enacción**: el criterio no se almacena, se hace emerger actuando.

Son interlocutores, **no autoridad prestada**: LUS los usa para hacer visibles convergencias, diferencias y tensiones en sus afirmaciones sobre el Entre, el criterio acumulado y el Lore.

<details>
<summary><b>Bibliografía extendida, y lo que entró en 2026</b></summary>

<br>

**El diálogo que la amplía**

- **Edwin Hutchins** · *Cognition in the Wild* (1995) — **cognición distribuida**: la unidad que piensa es el sistema, no la cabeza que está adentro.
- **Daniel Wegner** · memoria transactiva (1985) — **quién recuerda qué**: una pareja recuerda más que sus dos miembros, y solo mientras sepa quién guarda cada parte.
- **Karl Weick** · *Sensemaking in Organizations* (1995) — el **sentido se construye hacia atrás**, que es por qué una Pista se escribe después de la fricción y no durante.
- **Heinz von Foerster** · *Understanding Understanding* (2003) — **cibernética de segundo orden**: el observador está adentro del sistema que describe.

**Arbitrados en 2026 — y los dos resultados no son el mismo**

- **Albert Camus** · *El mito de Sísifo* (1942) · *El extranjero* (1942) · *El malentendido* (1944) · *El hombre rebelde* (1951) · *El verano* (1954), por «El exilio de Helena» y «Los almendros» — **entró como criterio, en una sola afirmación**: *un sistema de criterio no reduce el absurdo; sabe qué hacer cuando aparece.* La obra de teatro lo lleva adentro: una madre y una hermana matan al hijo que volvió **porque él no dice su nombre** — sin malicia y sin error de razonamiento, solo lo que se sabía sin llegar a donde se decidía. **Dónde pierde Camus:** su *mesure* es un límite ético-político a la rebelión, no una regla epistémica de enrutamiento. Entra como analogía declarada y no funda ninguna regla de enrutamiento.
- **Martin Heidegger** · *Ser y tiempo* (1927) — **entró como bibliografía, y NO como criterio.** La finitud asumida es lo que vuelve auténtica una existencia, y la intuición que lo trajo a esta mesa es que **el Entre también es finito**. Pero en *Ser y tiempo* la muerte es *je meines* —radicalmente propia, **no compartible**— y esa incompartibilidad es el motor del argumento: la muerte **individualiza**. La unidad de LUS es la relación. Adoptarlo exigiría contradecir a Heidegger justo donde su tesis se apoya, y ese trabajo no está hecho. **Lo que deja abierto vale más que cualquier cosa adoptable hoy:** ¿cómo puede una relación anticipar un final que ninguna de sus partes puede anticipar por la otra?

</details>

<details>
<summary><b>Genealogía afectiva — las obras que formaron la sensibilidad</b></summary>

<br>

**Registro, no regla.** Estas obras no restringen ninguna decisión y no gobiernan nada. Se anotan porque la estética y las intuiciones de un artefacto técnico **nunca son neutrales**, y saber de dónde vienen es lo único que permite distinguir el **gusto heredado** del **argumento** el día que alguien proponga cambiarlas. Pertenece a LUS, no al kit.

- **[*Fire*](https://genius.com/Waxahatchee-fire-lyrics)** · Waxahatchee — la madurez como avanzar **sin una visión total**. El criterio no elimina la incertidumbre: restringe con responsabilidad lo que el Entre alcanzó a aprender.
- **[*Loving*](https://genius.com/Land-of-talk-loving-lyrics)** · Land of Talk — un vínculo fértil **no fusiona a sus partes** ni les evita la fricción. Hace posible lo que ninguna habría producido sola.
- ***Tales of Berseria*** · Bandai Namco (2016) — aporte **estético y no conceptual**: la dirección de arte de este kit viene de acá antes que de cualquier referencia de diseño de software. Genealogía de **la forma**.
- **[*Keep Running*](https://genius.com/Tei-shi-keep-running-lyrics)** · Tei Shi — mantenerse al día con **quién es el otro ahora**. Un criterio que no se revisa no queda neutral: sigue operando, sobre alguien que ya cambió.
- **[*Stalker*](https://es.wikipedia.org/wiki/Stalker_(pel%C3%ADcula))** · Tarkovski (1979) — la tuerca lanzada delante, y caminar hacia donde cayó. **No ir directo a la solución es la forma de conseguirla**: enrutamiento puro.
- ***El día de la marmota*** · Ramis (1993) — lo único que atraviesa el reinicio es lo que Phil **aprendió**. **Cada sesión de un agente es un 2 de febrero.**
- ***50 First Dates*** · Segal (2004) — el video de Lucy le da **quién es y en qué punto está**, a la vez. Eso es `lore/` ↔ `FASES.md`: el criterio persiste, el estado avanza.
- **[*Running Back to You*](https://genius.com/The-juan-maclean-running-back-to-you-lyrics)** · The Juan MacLean — **autonomía con retorno** (`H13`). No exige contacto constante; exige un punto donde las dos partes vuelvan a ponerse al día antes de que la deriva vuelva irreconocible el trabajo compartido.
- **[*1998*](https://www.shazam.com/song/1023974557/1998-feat-banks)** · Chet Faker con BANKS — entró después de una falla concreta: se pidió reducir un README un 40% y volvió reducido cerca del 80%. Nombra qué se rompe cuando **la instrucción humana deja de ser una base confiable** y colaborar se vuelve vigilar.
- ***Aliso*** · Malena Zavala (2018) — *«admired, not reset»*. Y sobre traducir: el daño no está en una parte, está en **el lenguaje que dos rompieron**.

</details>

[Explora la investigación en el NotebookLM de LUS](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450)

> **Cómo leerlo.** NotebookLM es la introducción accesible, no la fuente de registro. Para saber qué
> hace el kit manda este repositorio; para una cifra, usa el corte vigente del benchmark.

### ¿Por qué «Lore»?

En los videojuegos, el *lore* es la historia y las reglas acumuladas que mantienen coherente un universo —resultados de torneos pasados, reglas del mundo, qué puede y qué no puede pasar después. Tomamos esa imagen y cambiamos el peso: acá los hechos puntuales se desvanecen y **lo que permanece es el criterio** que mantiene coherente el próximo trabajo. La deuda visual también es explícita: la paleta anime y el tratamiento gráfico vienen de ***Tales of Berseria*** (Bandai Namco, 2016), el juego favorito del autor. Nombrar esa procedencia separa una decisión de diseño de un gusto heredado.

## Autor

**Andrés Peña Mellado** — investigador principal de LUS.

Construyendo en Web3: dos proyectos blockchain como founder, y community management en ChatterPay.
Antes, parte del equipo editorial de **Polkadot Español** y editor en **BeInCrypto**.

Docencia e investigación: integró el equipo que estableció las bases bibliográficas y metodológicas
de la asignatura **Design Thinking** de la Escuela de Ingeniería en Informática de la UTEM (2023), y
la dictó desde 2023 hasta 2025. **Speaker en [KCD El Salvador
2023](https://www.credly.com/badges/ad17002a-16be-474b-ada4-d7ba0df3a0fd)**.

<p>
  <a href="https://github.com/andresanemic"><img src="https://img.shields.io/badge/GitHub-andresanemic-0B1320?style=for-the-badge&logo=github&logoColor=F4F0E8&labelColor=0B0B12" alt="GitHub"></a>
  <a href="https://x.com/andresanemic"><img src="https://img.shields.io/badge/X-@andresanemic-FF557A?style=for-the-badge&logo=x&logoColor=0B0B12&labelColor=0B0B12" alt="X"></a>
  <a href="https://www.linkedin.com/in/andresanemic/"><img src="https://img.shields.io/badge/LinkedIn-Andrés%20Peña%20Mellado-00DFF5?style=for-the-badge&logo=linkedin&logoColor=0B0B12&labelColor=0B0B12" alt="LinkedIn"></a>
  <a href="https://t.me/andresanemic"><img src="https://img.shields.io/badge/Telegram-@andresanemic-22D9EE?style=for-the-badge&logo=telegram&logoColor=0B0B12&labelColor=0B0B12" alt="Telegram"></a>
  <img src="https://img.shields.io/badge/Discord-andresanemic-F94F79?style=for-the-badge&logo=discord&logoColor=0B0B12&labelColor=0B0B12" alt="Discord">
  <a href="mailto:andres@healthproof.cl"><img src="https://img.shields.io/badge/Email-andres@healthproof.cl-35E5F5?style=for-the-badge&logo=gmail&logoColor=0B0B12&labelColor=0B0B12" alt="Email"></a>
</p>
