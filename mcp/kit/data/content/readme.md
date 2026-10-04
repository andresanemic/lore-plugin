
<p align="center">
  <img src="https://i.imgur.com/DWYL7vz.png" alt="Lore" width="100%">
</p>

<h1 align="center">Lore</h1>

<p align="center">
  <a href="#installation"><img src="https://img.shields.io/badge/version-2.4.9-FF557A?style=for-the-badge&labelColor=0B0B12" alt="Version"></a>
  <a href="#installation"><img src="https://img.shields.io/badge/AI_provider-neutral-22D9EE?style=for-the-badge&labelColor=0B0B12" alt="AI provider: neutral"></a>
  <a href="#the-eight-skills"><img src="https://img.shields.io/badge/writing--skills-RED%E2%86%92GREEN_2.3.3_%C2%B7_2.4.0-63C49B?style=for-the-badge&labelColor=0B0B12" alt="writing-skills: RED to GREEN in 2.3.3 and 2.4.0"></a>
  <a href="./docs/SPEC_KIT_en.md"><img src="https://img.shields.io/badge/spec--kit-compatible-F94F79?style=for-the-badge&labelColor=0B0B12" alt="spec-kit compatible"></a>
  <a href="#what-is-lore"><img src="https://img.shields.io/badge/fine--tuning-local-35E5F5?style=for-the-badge&labelColor=0B0B12" alt="Local fine-tuning"></a>
  <a href="#origin"><img src="https://img.shields.io/badge/research-active-00DFF5?style=for-the-badge&labelColor=0B0B12" alt="Status"></a>
</p>

<p align="center">
  <b>Stop explaining your project to the AI every morning.</b><br>
  Lore is the operating system for working with AI: it keeps your criterion, runs the method silently, and executes with Vespi.
</p>

---

<details>
<summary><b>Read in English</b></summary>

<a id="english"></a>

## The problem

Every session starts blank: everything you taught the agent yesterday — every correction, every back-and-forth — gets erased, and you open the next one explaining the project again. Your Lore is where that stays.

In *Groundhog Day* (Harold Ramis, 1993), Phil Connors wakes up to the same radio every February 2nd and nobody in town remembers a thing about yesterday — only him. Your agent is the town, not Phil: every session opens on that same morning, and the one who walks in carrying the memory is you.

It is a loop of re-explanations and mediocre solutions you had already rejected. Lore calls this **ephemeral experience**: the facts may survive, but the learning never became a reusable structure.

---

<h3 align="center"><strong>+9.4 points of cross-domain first-pass compliance</strong>.</h3>

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
[Who can use it](#who-can-use-lore-plugin) ·
[Start building](#start-building-your-lore) ·
[Benchmark](#benchmark) ·
[Installation](#installation)

</td>
<td width="33%" valign="top">

**Use it**

[Architecture](#architecture) ·
[The eight skills](#the-eight-skills) ·
[Loose notes](#loose-notes) ·
[Documentation](#documentation)

</td>
<td width="33%" valign="top">

**Understand it**

[Shared invariants](#shared-invariants) ·
[Case studies](./docs/CASES_en.md) ·
[Reach](#reach) · [The deck](#the-deck) · [Origin](#origin)

</td>
</tr>
</table>

---

## What is Lore?

A lightweight, provider-neutral **Spec-Driven Development** kit for AI agents. Or, in one line: **local fine-tuning for your own tasks, and the one doing the training is you.**

#### The same destination as a fine-tune, by the other road

A fine-tune conditions a model on thousands of examples until it stops answering like a generalist. Lore gets to the same place from the other side: one written constraint per thing that went wrong. No training happens and no weights move, so your criteria stays as plain text you can read, correct in one line, and carry to a different model tomorrow. A fine-tune stops asking things of you the day it ships; Lore never stops — one distillation, every time something breaks. That is the cost, and it is worth knowing before you install anything.

#### What it provides

Three things:

- a simple convention for organizing a project's criteria;
- eight skills that operate that convention;
- and a continuous loop for distilling experience into reusable criteria.

Spec-driven is not a label here: one contract per project (`CLAUDE.md` or `AGENTS.md`, whichever your host reads), `FASES.md` for where the work stands, `lore/` for what constrains how it gets built.

#### You can start from what you already have

You do not have to begin from an empty folder. `transmute-lore` reads what is already there — your project folders, documents, exported chat summaries, the notes you keep — and helps you put words to the criteria, canon and routing that were already shaping the project, just never written down. Your files stay as they are: nothing becomes Lore until you have read the distillation and approved it.

When that criterion needs to travel, **CRYSTALLIZE** makes a traceable single-Markdown “memory card”: portable across models, shareable on your terms, extractable back into a working folder, with sensitive filenames omitted and secret markers rejected. It is a snapshot, never a replacement for the live Lore.

#### What it does not promise

That the work will come out right. Accumulated criteria does not end uncertainty: it only shrinks the space of ways to be wrong. Albert Camus, in *The Myth of Sisyphus* (1942), argued that the absurd is not solved but inhabited, and the line this kit takes from him is its own: **a system of criteria does not reduce the absurd; it knows what to do when the absurd shows up.** Lore does not promise the deploy holds. It promises there is a next step for the morning it does not, and that you chose that step back when you still had time to think.

And there is a cost on the other side, worth saying out loud because this kit sells accumulation. Karl Weick, in “Drop Your Tools” (1996), made the point after studying a crew that died in the 1949 Mann Gulch fire still carrying the tools that defined their competence: **a body of criteria makes reframing more expensive, and that cost peaks exactly when reframing is what would save you.** `PRUNE` and the connectivity sweep exist for that — and both assume you have time to think. Neither knows how to drop everything at once.

#### The only filter

Lore does not try to describe everything — that is what documentation is for. It preserves what changes future behavior. A README answers *"what is this?"*; Lore answers something else: **What did we learn that we should never have to learn again?**

> **If a sentence does not constrain a future decision, it is not Lore.** That rule is the whole filter, and it is what keeps the system from becoming another graveyard of documents.

Gregory Bateson, in *Steps to an Ecology of Mind* (1972), defined information as **“a difference that makes a difference”**. Lore applies that test to experience: what happened yesterday only becomes criteria if it would change what you do tomorrow — everything else is a log.

---

## Who can use Lore Plugin?

- **Professionals early in working with AI** — if you want what you learn to compound instead of evaporating, start here: a professional memory card that outlasts any project or model, where your **professional criterion** refines how real work gets done.
- **People who read the benchmark before anything else**, willing to try something that is not mainstream yet if the numbers hold up.
- **Researchers curious about LUS itself** — less the kit than the question behind it: what changes when a person and an AI accumulate criteria together over time. Lore is where that question gets answered one decision at a time.
- **Teams already running spec-kit, SDD pipelines or another automation framework.** Those manage *process* — constitution, plan, tasks, quality gates — and none asks whether the knowledge behind those gates is still alive. That gap is what `MYCELIUM` and `PRUNE` close, and Lore runs alongside spec-kit rather than replacing it (see [`SPEC_KIT_en.md`](./docs/SPEC_KIT_en.md)).

Lore Plugin operationalizes a narrow part of the questions LUS studies. Its benchmark tests product behavior under a frozen protocol; it does not test the richness or stability of a human–AI **Between**. [Read the current research boundary →](./docs/LUS_en.md)

> Martin Buber, in *I and Thou* (1923): what matters does not live inside either party but in the relation between them. This kit takes the structure, not the theology — what accumulates here is neither yours nor the model's: it is the criteria the two of you built.

---

## Start building your Lore

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

Every step of the loop moves the same way: it is proposed, you approve, and only then is it written. **That gate is the threshold**, and it is the reason nothing reaches your Lore that you did not read first.

The shape behind that gate has a name: Andy Clark and David Chalmers called it the **extended mind** ("The Extended Mind", 1998). An external store stops being a filing cabinet and starts participating in the thinking when the system reaches for it by default. Lore is loaded before the work starts — reaching for it is not a step you remember to take, it is how the work begins.

And the process has a name too: Gilbert Simondon called it **transduction**, an operation that advances through a domain step by step, each phase founded on the structuration of the one before. One distillation is exactly that — friction crystallizes into a constraint that changes the next interaction, and then the next, until the accumulated structure becomes a body of criteria nobody designed in advance: your Lore.

So that is the mechanism: not documentation, not a memory dump — a threshold between what happened and what gets to constrain tomorrow. The next section takes you from zero to a running install.

---

## Installation

The clearest provider-neutral route is to clone the repository: the source stays visible, updates remain ordinary Git operations, and the same checkout can prepare Claude Code and Codex. It requires Git and Node.js.

### Recommended — clone the repository

```bash
git clone https://github.com/andresanemic/lore-plugin.git
cd lore-plugin
node scripts/lore-plugin.mjs install --target all
codex plugin add lore@personal
```

To target one host, replace `all`. OpenCode receives Lore's skills, hooks and TUI mark.

If you already use a host plugin manager, these shorter routes install the same package without keeping a separate checkout.

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

To connect the visible status mark after installing through Claude's plugin manager, run from the repository clone:

```bash
node scripts/lore-plugin.mjs statusline install
```

### Codex CLI

Run these commands in your terminal:

```bash
codex plugin marketplace add andresanemic/lore-plugin
codex plugin add lore@lore-plugin
```

<details>
<summary><b>Other hosts — copy from the same clone</b> (OpenCode, Cursor, Antigravity)</summary>

<br>

### OpenCode

Install Lore's skills, hooks and TUI mark globally:

```bash
node scripts/lore-plugin.mjs install --target opencode
```

Restart OpenCode. Existing `tui.json` entries are preserved; `tui.jsonc` is left untouched. For one project, use `.opencode/skills/` instead.

- For non-interactive delegates, configure routed access with `lore-plugin opencode-permissions --project <dir> --from-routing [--write]`, or prepare a confined profile with `lore-plugin opencode-sandbox <dir>`. The reference explains stdin, `-f` ordering and temporary-directory requirements.

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

Claude Code does not receive routine hook context: its adapter is deliberately absent because anything handed to the agent can become visible or alter the reply. Its red-only `PreToolUse` guard classifies structured file destinations from the session tree, an existing shared `intercambio/`, its scratchpad, routed sibling trees and session memory, anchored at `SessionStart` rather than a drifting shell `cwd`. **Own** passes. **Foreign** asks the host for approval before the structured file operation: `ask` prompts the person, `allow` can run without prompting, `deny` blocks. Choose `once` for a single operation; the plugin stores no `always`. A host-level deny still wins. Shell and indirect writes stay under the host sandbox policy; this adapter grants none. **Unknown** passes with a notice and is written down. Codex also keeps its automatic local guard through silent `SessionStart` and `PostToolUse`. OpenCode's native `external_directory` and `edit` permissions decide foreign structured writes: `ask` prompts, `allow` may pass silently, `deny` blocks. Choose `once`; the hook cannot select it or save grants. Shell and indirect writes follow host policy. In every host, `use-lore` checks body-load integrity at session opening: a clean check says nothing, a missing connection names only the decision needed. One opening exception, on both hosts since 2.4.8: inside a federated bot whose always-on block does not declare its load, `SessionStart` names the repair (`lore-plugin mycelium federated`) in exactly one line; green stays at zero bytes and everything fails open. `FASES.md` and `PHASES.md` remain state and do not enter the receipt.

</details>

Then open a new CLI session. **If this is your first time, you do not need to know a single command** — write *«I want to start using Lore Plugin, help me»* and the kit opens a **brainstorming, not a menu**: it looks at your tree first, asks one question at a time, and ends with your **first artifact created**, never with a recommendation. If you already know what you want, `use-lore` routes you.

One question at a time is not a courtesy, and a form would be faster. The questions are what keep you and the model two things instead of one — no fusion, and no sparing each other the friction — long enough for an answer neither of you had alone.

## What it looks like in practice

You just shipped a landing page and the feedback is: "I didn't know what to do on the page." The CTA was below the fold and the headline talked about the product, not the outcome. You fixed it. Instead of closing the tab:

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

They are kept apart because they age at different speeds: who you are and how you work stay true next month; which phase the project is in does not. Mixing them means re-reading a document where half the sentences expired and nothing says which half.

The canonical names are Spanish; in your language they are localized.

#### The always-on block

The contract is the only artifact **both** hosts load without being asked, which is why Lore stamps
a delimited pointer section into it — the kit's always-on channel to the session.

<details>
<summary><b>The exact mechanics</b> (ceiling, variants, how it gets stamped)</summary>

<br>

```markdown
<!-- lore:always-on -->
…what Lore governs here · where it lives · where the state lives · when to invoke instead of writing by hand…
<!-- /lore:always-on -->
```

Four items and no more, under a hard ceiling of **25 lines**, pointing to `lore/` and to `FASES.md`: criteria and state live apart, but a session that receives the criteria without the phase proposes the right thing at the wrong time. Three variants — an **area** to its own `lore/`, a **project** to its own layer and its mother area's, a **bot** to `canon/` and its **routing table**, never to the federated Lores one by one, which is why a bot reaching twenty bodies of criteria still fits. The block never reproduces a clue; the owning skills stamp it idempotently, and a hand-edited divergence is reported, never overwritten.

</details>

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

Areas and projects are places; **a bot is a lens you carry into them.** An Area that collects criteria it never earned starts receiving promotions that belong somewhere else.

---

## The eight skills

**This kit moves with Superpowers' `writing-skills` discipline, not past it.** Every changed skill is checked against it before it ships; the latest record is [`bench/writing-skills-2.4.1/README.md`](./bench/writing-skills-2.4.1/README.md), with the 2.4.0 loose-note and 2.3.3 audit records.

> **The skills are written in English; the Lore they produce is not** — content and filenames included, in your language. Do not open one to explain a mode to someone (we learned this in Case 12, live) — that is what the table and the two docs below are for.

| Skill | What for | When |
|---|---|---|
| `use-lore` | Entry point: explains the model and routes you to the right skill | first, always |
| `brainstorming-lore` | Designs Lore artifacts, or deliverables governed by routed process modules, without taking over generic ideation; preserves recognizable continuity and fertile effort | before a material Lore change or governed design |
| `create-area` | Creates an Area with its shared Lore | opening a new domain |
| `create-project` | Creates a project that inherits from the Area | starting a piece of work |
| `save-to-lore` | Distills a lesson, or mines a loose-notes inbox, and decides whether it rises to the Area | every day |
| `transmute-lore` | Migrates, cleans, translates, upgrades, prunes or exports a safe snapshot of Lore | inheriting, maintaining, updating or sharing Lore |
| `create-bot` | One place to open a session and work across several Areas at once | from zero, or once there is Lore to federate |
| `vespi` | Bounded operation under authority (experimental): continues across sessions, moves laterally, revalidates before continuing | when the work is a live operation under pressure |

**Day one needs two of these:** `use-lore` routes you to whatever comes next, and `save-to-lore` is the one you will actually type — *"save to lore"*, after solving something that cost you. **Getting started, day-to-day use and the full mechanism for every skill and mode** live in one place: [`REFERENCE_en.md`](./docs/REFERENCE_en.md).

Version 2.4.9 retires four things: encryption, the `lore-ecosistema/` copy, `create-bot`'s local launcher, and the Professor with its Notebook. A shared repository takes their place. Detail in [`REFERENCE_en.md`](./docs/REFERENCE_en.md).

---

## Vespi

**Vespi is the kernel that runs under Lore Plugin: [kernel 0.1.4](https://github.com/andresanemic/vespi/releases/tag/v0.1.4-kernel) was published on 2026-10-05, and Lore Plugin 2.4.9 carries that fixed copy.**

<p align="center">
  <img src="./assets/vespi-B.png" alt="Vespi" width="100%">
</p>

Lore Plugin is the ground: your criterion, written once, and the routing that opens the right one for each task. Vespi is what runs on that ground: an operation under an authority you grant, checked apart from whoever carries it out, that leaves a receipt anyone can verify. It does not write your Lore and it does not decide for you: it says what it sees, states its assumptions as assumptions, and the choice is yours.

What 2.4.9 adds:

- **An operation survives the session.** Its state is one block in your project's `FASES.md`, not a second file, and resuming asks the operation, not you.
- **Work split into tasks with a role** (read the sources, advise, do a scoped piece). Each task moves through received, reviewed, verified and integrated as separate facts, and whoever verifies is never whoever executed. If the host lacks a tool, the task comes back blocked with its exit; nothing is simulated.
- **Authority with three limits at once** (until when, how much, to whom). The agent never signs for you, every receipt says what was verified and what was not, and an external effect of uncertain result is never retried blindly.
- **A written method for the coordinator** ([`skills/vespi/method.md`](./skills/vespi/method.md), [also in the kernel](https://github.com/andresanemic/vespi/blob/master/docs/METHOD.md)) that depends on no installed skill, and `lore-plugin operation …` to drive a whole operation from the command line.
- **A read-only hygiene scan** – `lore-plugin hygiene [path]` reports selected cleanup candidates and its coverage; it proposes review but changes and deletes nothing.
- **A stop-and-search wall** – after the same failure repeats three times without a success, `operation status` reports the attempts and says to stop and search with the host's tools; the CLI does not search.

The kernel is developed separately: [github.com/andresanemic/vespi](https://github.com/andresanemic/vespi).

## Loose notes

Add a `notes/`, `notas/` or `apuntes/` folder inside any project, Area or bot; any editor works. To have the AI read what you left there, run:

> "review my notes and see what belongs in my lore"

`save-to-lore` loads its loose-note procedure, scans the inbox, separates criteria from tasks and noise, proposes the owning Lore and waits for your approval, marks each mined note with date and destination and never deletes it. **A note is source, never criteria** — nothing crosses without explicit distillation and an approved diff.

---

## Shared invariants

All eight skills follow the same rules:

- Lore is written **in your language**.
- **Criteria is never invented.** Everything comes from real experience.
- **A note is source, never criteria.**
- **Discarded noise is reported**, never silently deleted.
- Every change passes a **threshold** before being written.
- **Nothing commits automatically.** You review the final diff.

Those last two are the whole bet. Agent frameworks increasingly keep a memory of their own successes and failures and generate reusable skills from the patterns they find — a real capability, and the opposite choice: there, the agent gets better; here, **the person does**. Lore's criteria live in files you own, in your language, and nothing enters them without your approval. If you want a system that learns behind your back, this is not it.

---

## Benchmark

<p align="center">
  <img src="./assets/benchmark-impact.png" alt="Lore Plugin 2.3.2 benchmark: 9.4 points more cross-domain first-pass compliance, 8 of 8 goals reached within two attempts versus 6 of 8 without Lore, and twice as many goals reached on the first attempt" width="100%">
</p>

**Lore improved convergence across different kinds of practical work.** With the same task, factual dossier and execution model, the complete system — Lore Plugin 2.3.2 plus routed project Lore — reached **59/64 criteria (92.2%)** on the first pass, against **53/64 (82.8%)** without Lore. It doubled complete first-pass deliverables (**4/8 vs 2/8**) and brought **8/8 goals** within two attempts; the cold arm reached **6/8**. Lore runs took longer, so “faster to goal” here means fewer review cycles and no residual failures, not fewer wall-clock seconds.

The benchmark was designed and preregistered with **GPT-5.6 Sol medium**, then executed in isolated sessions with **GPT-5.6 Terra medium**: 16 first passes and 10 controlled repairs across landing direction, news writing, community management and founder CRM work. The [frozen instrument, blind adjudication, raw outputs and derived summary](./bench/effect-2.3.2/) are auditable. The product ledger records this as **Lore Plugin Case 19**; the independent scientific ledger records the same event as **LUS Case 18**. These are situated Codex results, not a universal model claim.

---

## Documentation

This README covers motivation and architecture. Everything else lives in its own document:

| Document | What it's for |
|---|---|
| [`90_SECONDS_en.md`](./docs/90_SECONDS_en.md) | **Start here.** The whole mechanism, short enough to read before deciding whether to install anything. |
| [`REFERENCE_en.md`](./docs/REFERENCE_en.md) | **The technical document.** Getting started, day-to-day use, core concepts, the exact spec for each skill, mode and artifact, and how to migrate an existing project. |
| [`CASES_en.md`](./docs/CASES_en.md) | The nineteen case studies, each with its declared boundary. |
| [`SPEC_KIT_en.md`](./docs/SPEC_KIT_en.md) | Lore alongside GitHub's spec-kit: who governs what. Optional — Lore never depends on it. |
| [`LUS_en.md`](./docs/LUS_en.md) | The research program behind Lore, its current hypotheses and evidence boundaries. |
| [`GENEALOGY_en.md`](./docs/GENEALOGY_en.md) | Affective genealogy: cultural provenance kept separate from theory and product rules. |
| [`BIBLIOGRAPHY_en.md`](./docs/BIBLIOGRAPHY_en.md) | Conceptual sources: the entry rule, and where each one loses. |
| [`OBSERVER_en.md`](./docs/OBSERVER_en.md) | Observer provenance: the third registry — its method is published, its content does not travel. |
| [`CONTRIBUTING_en.md`](./docs/CONTRIBUTING_en.md) | How to contribute product changes, cases, refutations and research questions. |
| [`CODE_OF_CONDUCT.md`](./docs/CODE_OF_CONDUCT.md) | Participation standards and reporting route. |
| [`LICENSE`](./LICENSE) · [`NOTICE`](./NOTICE) | Apache License 2.0; authorship in `NOTICE`. |
| [`bench/`](./bench/) | The benchmark: Web, Editorial and UPGRADE harnesses; frozen tasks; method; declared limits; and raw results. |

---

## Case studies

Lore was not designed ahead of time: every decision came from applying it to real projects and watching what broke — documented as **nineteen case studies**, each with its declared boundary. **Case 12 is the first install run by someone who is not the author.**

> **Status:** cases, not proofs — small n, and **eighteen of the nineteen come from the same researcher**. The measured claim belongs to [Case 08 and its benchmark](#benchmark); the rest are qualitative evidence.

**[Read the nineteen case studies →](./docs/CASES_en.md)**

---

## Reach

<p align="center">
  <img src="./assets/reach-en.png" alt="3,000+ clones and counting" width="100%">
</p>

<p align="center">
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/3%2C232-clones_through_2026-09-23-FF557A?style=for-the-badge&labelColor=0B0B12" alt="3,232 clones"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/81-days-22D9EE?style=for-the-badge&labelColor=0B0B12" alt="81 days"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/~40-a_day-F94F79?style=for-the-badge&labelColor=0B0B12" alt="40 a day"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/225-peak-35E5F5?style=for-the-badge&labelColor=0B0B12" alt="225 peak"></a>
</p>

GitHub traffic windows preserved in [`data/traffic/clones.json`](./data/traffic/clones.json). A **minimum, cut at 2026-09-23**.

Lore Plugin is the technical arm of LUS, not a productivity system with philosophy attached. The benchmark tests a narrow product claim; it does not validate LUS as a whole. [The research boundary is explicit here.](./docs/LUS_en.md)

Morin gives this work its ethical north: in UNESCO's [*Seven Complex Lessons in Education for the Future*](https://unesdoc.unesco.org/ark:/48223/pf0000378091) he writes that “the notion of wager should be generalized to every faith” (our translation). [The sensibility that made such questions thinkable lives here.](./docs/GENEALOGY_en.md)

> **A reach signal, not a demonstration.** Nobody knows what anyone did with their copy — installed, distilled, opened once? It is no case, and answers none of the questions the [case studies](./docs/CASES_en.md) do. And the API's "unique cloners" are unique **per day**, not people: they cannot be summed into a headcount.

---

## The deck

<p align="center">
  <img src="./assets/deck-cover-en.png" alt="LUS + Lore Plugin deck — cover slide" width="100%">
</p>

The full **LUS + Lore Plugin** talk — what Lore Plugin is, the LUS research behind it, and how a project goes from zero to its first useful Lore: **[open the deck →](https://docs.google.com/presentation/d/1p1JoHTVL_A1EW3hG82E6rZpyysznmJbb/edit?usp=sharing)**

---


## Origin

Lore was born from **LUS (Lore User System)**, a research program about relations that accumulate criteria capable of participating in later decisions. Lore is one operational architecture produced by that work, not a demonstration of the program. One idea links them:

> **Experience only creates value when it can participate in a future decision.**

That makes us **gardeners of the Between**: we preserve the experiences that deserve to orient another decision and prune those that no longer constrain anything. Research and software remain separate: a product observation is not automatically a scientific result, and a hypothesis does not become a skill rule without evidence and review.

Read the full [LUS research overview](./docs/LUS_en.md), its [conceptual bibliography](./docs/BIBLIOGRAPHY_en.md), and the separate [affective genealogy](./docs/GENEALOGY_en.md). The public [LUS NotebookLM](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450) is an accessible introduction, not the source of record.

### Why "Lore"?

In video games, *lore* is the accumulated story and rules that keep a universe coherent — what can and cannot happen next. We borrow the image and shift the weight: specific events fade, and **what remains is the criteria** that keeps the next work coherent. The visual debt is explicit too: the anime palette comes from ***Tales of Berseria*** (Bandai Namco, 2016), the author's favorite game.

## Author

**Andrés Peña Mellado** — principal researcher of LUS.

Building in Web3 — General Editor of the community journalism pilot at **Tellus Cooperative**;
formerly on the editorial teams of **Polkadot Español** and **BeInCrypto**.

He helped establish UTEM's **Design Thinking** course and taught it from 2023 to 2025. **Speaker at
[KCD El Salvador 2023](https://www.credly.com/badges/ad17002a-16be-474b-ada4-d7ba0df3a0fd)**.

<p>
  <a href="https://github.com/andresanemic"><img src="https://img.shields.io/badge/GitHub-andresanemic-0B1320?style=for-the-badge&logo=github&logoColor=F4F0E8&labelColor=0B0B12" alt="GitHub"></a>
  <a href="https://x.com/andresanemic"><img src="https://img.shields.io/badge/X-@andresanemic-FF557A?style=for-the-badge&logo=x&logoColor=0B0B12&labelColor=0B0B12" alt="X"></a>
  <a href="https://www.linkedin.com/in/andresanemic/"><img src="https://img.shields.io/badge/LinkedIn-Andrés%20Peña%20Mellado-00DFF5?style=for-the-badge&logo=linkedin&logoColor=0B0B12&labelColor=0B0B12" alt="LinkedIn"></a>
  <a href="https://t.me/andresanemic"><img src="https://img.shields.io/badge/Telegram-@andresanemic-22D9EE?style=for-the-badge&logo=telegram&logoColor=0B0B12&labelColor=0B0B12" alt="Telegram"></a>
  <img src="https://img.shields.io/badge/Discord-andresanemic-F94F79?style=for-the-badge&logo=discord&logoColor=0B0B12&labelColor=0B0B12" alt="Discord">
  <a href="mailto:[public contact omitted]"><img src="https://img.shields.io/badge/[public contact omitted]-35E5F5?style=for-the-badge&logo=gmail&logoColor=0B0B12&labelColor=0B0B12" alt="Email"></a>
</p>

</details>

---

<details>
<summary><b>Leer en español</b></summary>

<a id="español"></a>

<p align="center">
  <img src="https://i.imgur.com/AKHwfNa.png" alt="Lore" width="100%">
</p>

<h1 align="center">Lore</h1>

<p align="center">
  <a href="#instalación"><img src="https://img.shields.io/badge/versi%C3%B3n-2.4.9-FF557A?style=for-the-badge&labelColor=0B0B12" alt="Versión"></a>
  <a href="#instalación"><img src="https://img.shields.io/badge/proveedor_IA-neutral-22D9EE?style=for-the-badge&labelColor=0B0B12" alt="Proveedor IA: neutral"></a>
  <a href="#las-ocho-skills"><img src="https://img.shields.io/badge/writing--skills-ROJO%E2%86%92VERDE_2.3.3_%C2%B7_2.4.0-63C49B?style=for-the-badge&labelColor=0B0B12" alt="writing-skills: de rojo a verde en 2.3.3 y 2.4.0"></a>
  <a href="./docs/SPEC_KIT_es.md"><img src="https://img.shields.io/badge/spec--kit-compatible-F94F79?style=for-the-badge&labelColor=0B0B12" alt="spec-kit compatible"></a>
  <a href="#qué-es-lore"><img src="https://img.shields.io/badge/fine--tuning-local-35E5F5?style=for-the-badge&labelColor=0B0B12" alt="Fine-tuning local"></a>
  <a href="#origen"><img src="https://img.shields.io/badge/investigaci%C3%B3n-activa-00DFF5?style=for-the-badge&labelColor=0B0B12" alt="Estado"></a>
</p>

<p align="center">
  <b>Deja de explicarle tu proyecto a la IA todas las mañanas.</b><br>
  Lore es el sistema operativo del trabajo con IA: guarda tu criterio, corre el método en silencio y ejecuta con Vespi.
</p>

---

## El problema

Cada sesión arranca en blanco: todo lo que le enseñaste al agente ayer —cada corrección, cada ida y vuelta— se borra, y abres la siguiente explicando otra vez el proyecto. Tu Lore es donde eso sí permanece.

En *El día de la marmota* (Harold Ramis, 1993), Phil Connors despierta con la misma radio cada 2 de febrero y nadie en el pueblo recuerda nada de lo de ayer — solo él. Tu agente es el pueblo, no Phil: cada sesión abre en esa misma mañana, y el único que entra con memoria eres tú.

Es un bucle de reexplicaciones y soluciones mediocres que ya habías descartado. Lore llama a esto **experiencia efímera**: los datos pueden sobrevivir, pero el aprendizaje nunca se convirtió en una estructura reutilizable.

---

<h3 align="center"><strong>+9,4 puntos de cumplimiento multidominio al primer intento</strong>.</h3>

<p align="center">
  <i>Lo que aprendes trabajando con IA, guardado para que no vuelvas a empezar de cero.</i><br>
  <i>Para quien sabe: un kit SDD que te permite hacer fine-tuning local de tus tareas — y el que entrena eres tú.</i>
</p>

---

<table>
<tr>
<td width="33%" valign="top">

**Empezar**

[El problema](#el-problema) ·
[Qué es Lore](#qué-es-lore) ·
[Quién puede usarlo](#quién-puede-usar-lore-plugin) ·
[Comienza a construir](#comienza-a-construir-tu-lore) ·
[Benchmark](#el-benchmark) ·
[Instalación](#instalación)

</td>
<td width="33%" valign="top">

**Usarlo**

[Arquitectura](#arquitectura) ·
[Las ocho skills](#las-ocho-skills) ·
[Notas sueltas](#notas-sueltas) ·
[Documentación](#documentación)

</td>
<td width="33%" valign="top">

**Entenderlo**

[Invariantes](#invariantes-compartidas) ·
[Casos de estudio](./docs/CASES_es.md) ·
[Alcance](#alcance) · [El deck](#el-deck) · [Origen](#origen)

</td>
</tr>
</table>

---

## ¿Qué es Lore?

Un lugar donde queda escrito lo que aprendes trabajando con la IA, para que la próxima sesión empiece desde ahí y no desde cero. Dicho en técnico: un kit ligero y neutral al proveedor de **Spec-Driven Development** para agentes de IA. O, en una línea: **fine-tuning local de tus tareas, y el que entrena eres tú.**

#### El mismo destino que un fine-tune, por el otro camino

Un fine-tune condiciona un modelo con miles de ejemplos hasta que deja de responder como generalista. Lore llega al mismo lugar por el otro lado: una restricción escrita por cada cosa que salió mal. No se entrena nada y ningún peso se mueve, así que tu criterio se queda en texto plano que puedes leer, corregir en una línea y llevarte mañana a otro modelo. Un fine-tune deja de pedirte cosas el día que está listo; Lore no para nunca — una destilación, cada vez que algo se rompe. Ese es el costo, y conviene saberlo antes de instalar nada.

#### Qué aporta

Tres cosas:

- una convención sencilla para organizar el criterio de un proyecto;
- ocho *skills* que operan esa convención;
- y un ciclo continuo para destilar experiencia en criterio reutilizable.

Lo de *spec-driven* no es una etiqueta: un contrato por proyecto (`CLAUDE.md` o `AGENTS.md`, el que lea tu host), `FASES.md` para dónde está el trabajo, `lore/` para lo que restringe cómo se construye.

#### Puedes empezar desde lo que ya tienes

No tienes que empezar con una carpeta vacía. `transmute-lore` lee lo que ya está ahí —las carpetas del proyecto, documentos, resúmenes de chats exportados, las notas que guardas— y te ayuda a poner en palabras el criterio, el canon y el enrutamiento que ya le daban forma al proyecto, solo que nunca se escribieron. Tus archivos se quedan tal como están: nada se vuelve Lore hasta que has leído la destilación y la has aprobado.

Cuando ese criterio necesita viajar, **CRYSTALLIZE** crea una «memory card» trazable en un solo Markdown: portable entre modelos, compartible en tus términos, extraíble de vuelta a una carpeta de trabajo, con los nombres de archivo sensibles omitidos y los marcadores de secreto rechazados. Es una fotografía, nunca un reemplazo del Lore vivo.

#### Qué no promete

Que el trabajo salga bien. El criterio acumulado no termina con la incertidumbre: apenas achica el espacio de maneras de equivocarse. Albert Camus, en *El mito de Sísifo* (1942), sostuvo que el absurdo no se resuelve sino que se habita, y la línea que este kit toma de ahí es suya propia: **un sistema de criterio no reduce el absurdo; sabe qué hacer cuando el absurdo aparece.** Lore no promete que el despliegue aguante. Promete que hay un paso siguiente para la mañana en que no aguante, y que ese paso lo elegiste cuando todavía tenías tiempo de pensarlo.

Y hay un costo del otro lado, que conviene decir en voz alta porque este kit vende acumular. Karl Weick, en «Drop Your Tools» (1996), lo dijo después de estudiar una brigada que murió en el incendio de Mann Gulch en 1949 todavía cargando las herramientas que definían su oficio: **un cuerpo de criterio encarece re-encuadrar, y ese costo es máximo justo cuando re-encuadrar es lo que te salvaría.** `PRUNE` y el barrido de conectividad existen para eso — y los dos suponen que tienes tiempo de pensar. Ninguno sabe soltarlo todo de golpe.

#### El único filtro

Lore no intenta describirlo todo — para eso está la documentación. Conserva aquello que modifica el comportamiento futuro. Un README responde *«¿qué es esto?»*; Lore responde otra cosa: **¿Qué aprendimos que nunca deberíamos tener que volver a aprender?**

> **Si una frase no restringe una decisión futura, no es Lore.** Esa regla es todo el filtro, y es lo que impide que el sistema se convierta en otro cementerio de documentos.

Gregory Bateson, en *Pasos hacia una ecología de la mente* (1972), definió la información como **«una diferencia que hace una diferencia»**. Lore le aplica esa prueba a la experiencia: lo que pasó ayer se vuelve criterio solo si cambiaría lo que haces mañana — todo lo demás es un registro.

---

## ¿Quién puede usar Lore Plugin?

Quien sabe y quien no sabe.

- **Si recién empiezas**, o nunca has trabajado con IA y no sabes qué es un test o un token, puedes empezar igual: tú dices qué quieres hacer, con tus palabras, eliges y dices sí o no; lo demás lo vas aprendiendo mientras lo usas. Lo que aprendes queda guardado y te sirve en el próximo proyecto, aunque cambies de modelo.
- **Si ya trabajas con IA** y te cansaste de explicarle lo mismo en cada sesión: Lore guarda por qué decidiste lo que decidiste y lo carga antes de empezar. Y si quieres que eso cruce de proyecto sin quedarse en tu historia personal, tu **criterio profesional** afina el **uso real** de tu oficio, en una memoria de trabajo que sobrevive a cualquier modelo.
- **Si quieres ver números antes de probar:** el kit se midió haciendo las mismas tareas con y sin Lore, corregidas por alguien que no sabía cuál era cuál. Los resultados, y todo lo necesario para revisarlos, están en [El benchmark](#el-benchmark).
- **Si te interesa la pregunta de investigación que hay detrás** (LUS): qué cambia cuando una persona y una IA acumulan criterio juntas a lo largo del tiempo. Lore es donde esa pregunta se responde una decisión a la vez.
- **Si tu equipo ya usa spec-kit, SDD u otra herramienta que ordena el trabajo** —plan, tareas, controles de calidad—: esas herramientas cuidan el proceso, y ninguna revisa si el conocimiento detrás de cada control sigue vigente. Eso es lo que hacen `MYCELIUM` y `PRUNE`, y Lore corre al lado de spec-kit sin reemplazarlo (ver [`SPEC_KIT_es.md`](./docs/SPEC_KIT_es.md)).

Lore Plugin lleva a la práctica una parte acotada de lo que estudia LUS. El benchmark mide cómo se comporta el kit en tareas fijas; no mide la relación entre una persona y una IA, que es lo que LUS llama el **Entre**. [Lee hasta dónde llega hoy la investigación →](./docs/LUS_es.md)

> Martin Buber, en *Yo y Tú* (1923): lo que importa no vive dentro de ninguna de las dos partes sino en la relación entre ellas. Este kit toma la estructura, no la teología — lo que se acumula acá no es tuyo ni del modelo: es el criterio que construyeron los dos.

---

## Comienza a construir tu Lore

Lo primero no es guardar nada: es ponerse de acuerdo. Cuando lo que vas a hacer va a durar más de una sesión, Lore Plugin te ofrece un acuerdo corto —para qué es, qué no se mueve sin tu palabra, dónde hay margen— y trabaja dentro de él. Si no lo quieres, no pasa nada: el kit trabaja igual. Después, mientras trabajas, empieza lo que le da nombre al kit.

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

Cada paso del ciclo avanza igual: se propone, apruebas, y recién entonces se escribe. **Esa puerta es el umbral**, y es la razón de que nada llegue a tu Lore sin que lo hayas leído antes. El acuerdo pasa por la misma puerta: te lo muestran completo, dices que sí, y recién entonces queda escrito.

La forma detrás de esa puerta tiene nombre: Andy Clark y David Chalmers la llamaron **mente extendida** («The Extended Mind», 1998). Un almacén externo deja de ser un archivador y empieza a participar del pensamiento cuando el sistema lo consulta por defecto. El Lore se carga antes de empezar el trabajo — alcanzarlo no es un paso que recuerdas dar, es la forma en que el trabajo empieza.

Y el proceso también tiene nombre: Gilbert Simondon lo llamó **transducción**, una operación que avanza por un dominio paso a paso, cada fase fundada en la estructuración de la anterior. Una destilación es exactamente eso — la fricción cristaliza en una restricción que modifica la siguiente interacción, y luego la siguiente, hasta que la estructura acumulada se vuelve un cuerpo de criterio que nadie diseñó de antemano: tu Lore.

Ese es el mecanismo: no es documentación ni un volcado de memoria, es un umbral entre lo que pasó y lo que puede condicionar mañana. La sección siguiente te lleva de cero a tenerlo corriendo.

---

## Instalación

La ruta neutral al proveedor más clara es clonar el repositorio: el código fuente queda visible, las actualizaciones siguen siendo operaciones normales de Git y el mismo checkout puede preparar Claude Code y Codex. Requiere Git y Node.js.

### Recomendado — clona el repositorio

```bash
git clone https://github.com/andresanemic/lore-plugin.git
cd lore-plugin
node scripts/lore-plugin.mjs install --target all
codex plugin add lore@personal
```

Para un host, reemplaza `all`. OpenCode recibe las skills, hooks y marca TUI de Lore.

Si ya usas el gestor de plugins de un host, estas rutas más cortas instalan el mismo paquete sin conservar un checkout separado.

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

Para conectar la marca visible después de instalar desde el gestor de Claude, ejecútalo desde el clon del repositorio:

```bash
node scripts/lore-plugin.mjs statusline install
```

### Codex CLI

Ejecuta estos comandos en tu terminal:

```bash
codex plugin marketplace add andresanemic/lore-plugin
codex plugin add lore@lore-plugin
```

<details>
<summary><b>Otros hosts — copia desde el mismo clon</b> (OpenCode, Cursor, Antigravity)</summary>

<br>

### OpenCode

Instala las skills, hooks y marca TUI de Lore en OpenCode:

```bash
node scripts/lore-plugin.mjs install --target opencode
```

Reinicia OpenCode. Conserva otras entradas de `tui.json`; `tui.jsonc` queda intacto. Para un solo proyecto usa `.opencode/skills/`.

- Para delegados sin interacción, configura el acceso enrutado con `lore-plugin opencode-permissions --project <dir> --from-routing [--write]` o prepara un perfil confinado con `lore-plugin opencode-sandbox <dir>`. La referencia explica el cierre de stdin, el orden de `-f` y la carpeta de temporales.

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

Claude Code no recibe contexto rutinario del hook: el guard no entrega texto al modelo. Su `PreToolUse` solo-en-rojo clasifica destinos estructurados desde el árbol de sesión, un `intercambio/` compartido que ya exista, su scratchpad, los árboles hermanos enrutados y la memoria de sesión; ancla la jurisdicción en `SessionStart`, no en un `cwd` de shell que deriva. **Propio** pasa. **Ajeno** solicita aprobación al host antes de la operación estructurada: `ask` pregunta a la persona, `allow` puede ejecutar sin preguntar, `deny` bloquea. Elige `once` para una sola operación; el plugin no guarda `always`. Un `deny` del host sigue prevaleciendo. Shell y escrituras indirectas quedan bajo la política del host; esto no habilita shell. **Desconocido** pasa con aviso y queda anotado. Codex conserva su guardia local automática mediante `SessionStart` y `PostToolUse` silenciosos. OpenCode deja que los permisos nativos `external_directory` y `edit` decidan las escrituras estructuradas ajenas: `ask` pregunta, `allow` puede pasar en silencio, `deny` bloquea. Elige `once`; el hook no puede elegirlo ni guardar concesiones. Shell y escrituras indirectas siguen bajo la política del host. En todos los hosts, `use-lore` comprueba al abrir la integridad de carga de los cuerpos: un control limpio no dice nada y una conexión faltante nombra solo la decisión necesaria. Una excepción de apertura, en ambos hosts desde 2.4.8: dentro de un bot federado cuyo always-on no declara su carga, `SessionStart` nombra la reparación (`lore-plugin mycelium federated`) en exactamente una línea; el verde queda en cero bytes y todo falla abierto. `FASES.md` y `PHASES.md` siguen siendo estado y no entran al recibo.

</details>

Después abre una sesión nueva en la CLI. **Si es tu primera vez, no necesitas saber ningún comando** — escribe *«quiero comenzar a usar Lore Plugin, ayúdame»* y el kit abre un **brainstorming, no un menú**: primero mira tu árbol, después pregunta de a una cosa por vez, y termina con **tu primer artefacto creado**, nunca con una recomendación. En esa primera vez también te ofrece el acuerdo, y ahí eliges cómo quieres que te hablen —más sobrio o más cercano; despacio, normal o rápido; si no eliges, cercano y a ritmo normal— y tus límites de uso: qué modelos, o qué niveles de un modelo, no quieres que se usen nunca. Se nombran por familia y no por número de versión, para que una actualización del proveedor no te deje atado a un modelo viejo. Si ya sabes qué quieres, `use-lore` te enruta.

Si ya usabas una versión anterior, al actualizar recibes una sola vez un mensaje corto: llegó Vespi, qué puede hacer por ti y la invitación a fijar tus límites.

Preguntar de a una cosa por vez no es cortesía, y un formulario sería más rápido. Las preguntas son lo que te mantiene a ti y al modelo siendo dos cosas y no una —sin fusión y sin ahorrarse la fricción—, el rato suficiente para que aparezca una respuesta que ninguno tenía por separado.

## Así se ve en la práctica

Quieres hacer la web de tu taller de cerámica y nunca has hecho una. Lo dices tal cual:

```text
› quiero hacer la web de mi taller y no sé cómo
```

Antes de escribir una sola línea, Lore Plugin te propone ponerse de acuerdo:

```text
  Antes de empezar, pongámonos de acuerdo. Es corto y lo
  puedes cambiar cuando quieras.

  Para qué es ·················· que la gente vea tus piezas
                                 y te escriba para encargar
  No lo muevo sin tu palabra ··· tus fotos y tus precios
  Aquí tengo margen ············ el diseño y el orden
  Lo que probamos ·············· una galería por colección;
                                 si no te gusta, se cambia
  Para sorprenderte ············ cómo se presenta cada pieza
  Cómo te hablo ················ cercano, a ritmo normal
  Te vuelvo a preguntar ········ antes de publicar

  ¿Así está bien?
```

Dices que sí y queda escrito. Desde ahí trabajas con calma: lo acordado se sostiene sin que tengas que vigilarlo, y si algo nuevo no cabe en el acuerdo, te lo preguntan antes de hacerlo.

Dos semanas después la web tiene tienda, carrito y envíos, y te sorprendes escribiendo:

```text
› esto me está complicando demasiado
```

Esta vez responde Vespi, la parte del kit que cuida que lo acordado siga en pie:

```text
  Según las notas, llevamos tres sesiones con la tienda, y el
  acuerdo decía encargos por mensaje. Supongo que la tienda
  se sumó en el camino.

  ¿La sumamos al acuerdo, o volvemos a lo acordado y la
  dejamos para después?
```

Tú eliges. Y cuando algo sale mal y lo arreglas, lo que aprendiste también se guarda. Acabas de publicar una landing y el feedback es: "No sabía qué hacer en la página". El CTA quedaba abajo y el titular hablaba del producto, no del resultado. Lo corregiste. En vez de cerrar la pestaña:

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

Se mantienen aparte porque envejecen a velocidades distintas: quién eres y cómo trabajas sigue siendo cierto el mes que viene; en qué fase está el proyecto, no. Mezclarlos significa releer un documento donde la mitad de las frases venció y nada dice cuál mitad.

#### El bloque siempre-activo

El contrato es el único artefacto que **los dos** hosts cargan sin que nadie se lo pida, y por eso
Lore le estampa una sección de punteros delimitada — el canal siempre activo del kit hacia la sesión.

<details>
<summary><b>La mecánica exacta</b> (techo, variantes, cómo se estampa)</summary>

<br>

```markdown
<!-- lore:always-on -->
…qué Lore gobierna acá · dónde vive · dónde vive el estado · cuándo invocar en vez de escribir a mano…
<!-- /lore:always-on -->
```

Cuatro elementos y no más, con un techo duro de **25 líneas**, apuntando a `lore/` y a `FASES.md`: el criterio y el estado viven separados, pero una sesión que recibe el criterio sin la fase propone lo correcto en el momento equivocado. Tres variantes: un **área** a su propio `lore/`, un **proyecto** al suyo y al del área madre, un **bot** a `canon/` y a su **tabla de enrutamiento**, nunca a los Lore federados uno por uno, y por eso un bot que alcanza veinte cuerpos de criterio sigue entrando. El bloque nunca reproduce una pista; las skills dueñas lo estampan de forma idempotente, y una divergencia editada a mano se reporta sin sobrescribirse.

</details>

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

**Este kit avanza junto a la disciplina `writing-skills` de Superpowers, no por delante de ella.** Cada skill modificada se revisa antes de publicarse; el registro más reciente vive en [`bench/writing-skills-2.4.1/README.md`](./bench/writing-skills-2.4.1/README.md), con los de notas sueltas 2.4.0 y la auditoría 2.3.3.

> **Las skills están escritas en inglés y el Lore que producen, no** — contenido y nombres de archivo incluidos, en tu idioma. No abras uno para explicarle a alguien qué hace un modo (lo aprendimos en el Caso 12, en vivo) — para eso está la tabla y los dos docs de abajo.

| Skill | Para qué | Cuándo |
|---|---|---|
| `use-lore` | Punto de entrada: explica el modelo y te manda a la skill correcta | primero, siempre; y cuando dices «quiero hacer esto y no sé cómo», te ofrece el acuerdo |
| `brainstorming-lore` | Diseña artefactos Lore, o entregables gobernados por módulos de proceso enrutados, sin apropiarse de la ideación genérica; preserva la continuidad reconocible y el esfuerzo fértil | antes de un cambio Lore material o un diseño gobernado; o cuando dices «ayúdame a pensar el diseño» |
| `create-area` | Crea un Área con su Lore compartido | al abrir un dominio nuevo |
| `create-project` | Crea un proyecto que hereda del Área | al empezar un trabajo |
| `save-to-lore` | Destila una lección, o mina una bandeja de notas sueltas, y decide si sube al Área | todos los días |
| `transmute-lore` | Migra, limpia, traduce, actualiza, poda o exporta una fotografía segura del Lore | al heredar, mantener, actualizar o compartir Lore |
| `create-bot` | Un lugar donde abrir sesión y trabajar sobre varias Áreas a la vez | desde cero, o cuando ya hay Lore que federar |
| `vespi` | Cuida que lo acordado siga en pie. Operación acotada bajo autoridad (experimental): continúa entre sesiones, se mueve lateralmente y revalida antes de seguir | cuando dices «esto me está complicando», «se está perdiendo lo que decidimos» o «sigamos mañana»: el trabajo es una operación viva bajo presión |

**El primer día necesitas dos de estas:** `use-lore` te enruta hacia lo que sigue, y `save-to-lore` es la que vas a escribir de verdad — *"guarda en lore"*, después de resolver algo que te costó. **Cómo empezar, el uso cotidiano y el mecanismo completo de cada skill y modo** viven en un solo lugar: [`REFERENCE_es.md`](./docs/REFERENCE_es.md).

La versión 2.4.9 retira cuatro cosas: el cifrado, la copia `lore-ecosistema/`, el launcher local de `create-bot` y el Professor con su Cuaderno. En su lugar queda un repositorio compartido. Detalle en [`REFERENCE_es.md`](./docs/REFERENCE_es.md).

---

## Vespi

**Vespi es el kernel que corre bajo Lore Plugin: el [kernel 0.1.4](https://github.com/andresanemic/vespi/releases/tag/v0.1.4-kernel) se publicó el 2026-10-05 y Lore Plugin 2.4.9 lleva esa copia fija.**

<p align="center">
  <img src="./assets/vespi-B.png" alt="Vespi" width="100%">
</p>

Lore Plugin es el terreno: tu criterio escrito una vez y el enrutamiento que abre el correcto para cada tarea. Vespi es lo que corre sobre ese terreno: una operación bajo una autoridad que tú otorgas, verificada aparte de quien la ejecuta, que deja un recibo que cualquiera puede comprobar. No escribe tu Lore ni decide por ti: te dice lo que ve, dice sus suposiciones como suposiciones, y la elección es tuya.

Lo que agrega el 2.4.9:

- **Una operación sobrevive a la sesión.** Su estado es un bloque del `FASES.md` de tu proyecto, no un segundo archivo, y retomarla se le pregunta a la operación, no a ti.
- **El trabajo se reparte en tareas con un rol** (leer las fuentes, asesorar, hacer una pieza acotada). Cada tarea pasa por recibida, revisada, verificada e integrada como hechos distintos, y quien verifica nunca es quien ejecutó. Si el host no tiene la herramienta, la tarea vuelve bloqueada con su salida; nada se simula.
- **Autoridad con tres límites a la vez** (hasta cuándo, cuánto y a quién). El agente nunca firma por ti, cada recibo dice qué se verificó y qué no, y un efecto externo de resultado incierto no se reintenta a ciegas.
- **Un método escrito para el coordinador** ([`skills/vespi/method.md`](./skills/vespi/method.md), [también en el kernel](https://github.com/andresanemic/vespi/blob/master/docs/METHOD.md)) que no depende de ninguna skill instalada, y `lore-plugin operation …` para llevar una operación completa desde la línea de comandos.
- **Un escaneo de higiene de solo lectura** – `lore-plugin hygiene [ruta]` informa candidatos de limpieza seleccionados y su cobertura; propone revisarlos, pero no modifica ni borra nada.
- **Un muro para detenerse y buscar** – si el mismo fallo se repite tres veces sin un éxito, `operation status` informa los intentos e indica detenerse y buscar con las herramientas del host; la CLI no busca.

El kernel se desarrolla aparte: [github.com/andresanemic/vespi](https://github.com/andresanemic/vespi).

## Notas sueltas

Agrega una carpeta `notas/`, `notes/` o `apuntes/` dentro del proyecto, Área o bot donde estés trabajando; cualquier editor sirve. Para que la IA la lea, pide:

> «revisa mis notas y checa si algo se puede guardar en mi lore»

`save-to-lore` carga su procedimiento de notas, hace el barrido completo, separa criterio de tareas y ruido, propone el Lore dueño y espera tu aprobación, marca cada nota minada con fecha y destino y nunca la borra. **Una nota es fuente, nunca criterio**: nada cruza sin destilación explícita y un diff aprobado.

El kit también deja notas: lo que se ofrece guardar primero se anota fuera de tu Lore, y lo que ya pesa se te ofrece después a `save-to-lore`, que sigue siendo la única puerta. Vespi deja notas del mismo modo y, si lo que sugiere es técnico —un hook, un cron, un traspaso—, primero te pregunta si sabes qué es y, si no, te lo explica en llano.

---

## Invariantes compartidas

- El Lore se escribe **en tu idioma**.
- **El criterio nunca se inventa.** Todo proviene de experiencia real.
- **Una nota es fuente, nunca criterio.**
- **El ruido descartado se informa**, nunca se elimina en silencio.
- Todo cambio pasa por un **umbral** antes de escribirse.
- **Nada hace *commit* automáticamente.** Tú revisas el *diff* final.

Esas dos últimas son la apuesta entera. Hay una clase creciente de frameworks de agentes que guarda memoria de sus propios éxitos y fracasos y genera skills a partir de sus patrones — una capacidad real, y la elección contraria: ahí mejora el agente; acá **mejoras tú**. El criterio vive en archivos tuyos, en tu idioma, y nada entra sin tu aprobación. Si quieres un sistema que aprenda a tus espaldas, este no es.

---

## El benchmark

<p align="center">
  <img src="./assets/benchmark-impact-es.png" alt="Benchmark de Lore Plugin 2.3.2: 9,4 puntos más de cumplimiento multidominio al primer intento, 8 de 8 metas alcanzadas en dos intentos frente a 6 de 8 sin Lore, y el doble de metas alcanzadas al primer intento" width="100%">
</p>

**Lore mejoró la convergencia entre distintos tipos de trabajo práctico.** Con la misma tarea, dossier factual y modelo de ejecución, el sistema completo —Lore Plugin 2.3.2 más Lore de proyecto enrutado— alcanzó **59/64 criterios (92,2%)** al primer intento, frente a **53/64 (82,8%)** sin Lore. Duplicó los entregables completos de primera pasada (**4/8 frente a 2/8**) y llevó **8/8 metas** a objetivo en un máximo de dos intentos; el brazo frío alcanzó **6/8**. Las corridas con Lore tardaron más: «más rápido a la meta» significa menos ciclos de revisión y ninguna falla residual, no menos segundos de reloj.

El benchmark fue diseñado y prerregistrado con **GPT-5.6 Sol medium**, y después ejecutado en sesiones aisladas con **GPT-5.6 Terra medium**: 16 primeras pasadas y 10 reparaciones controladas sobre dirección de landing, redacción de noticias, community management y CRM founder. El [instrumento congelado, la adjudicación ciega, las salidas crudas y el resumen derivado](./bench/effect-2.3.2/) son auditables. El registro de producto lo documenta como **Caso 19 de Lore Plugin**; el registro científico independiente documenta el mismo evento como **Caso 18 de LUS**. Son resultados situados de Codex, no una afirmación universal sobre modelos.

---

## Documentación

| Documento | Para qué sirve |
|---|---|
| [`90_SECONDS_es.md`](./docs/90_SECONDS_es.md) | **Empieza acá.** El mecanismo completo, corto como para leerlo antes de decidir si instalas algo. |
| [`REFERENCE_es.md`](./docs/REFERENCE_es.md) | **El documento técnico.** Cómo empezar, uso cotidiano, conceptos, la especificación exacta de cada *skill*, modo y artefacto, y cómo migrar un proyecto existente. |
| [`CASES_es.md`](./docs/CASES_es.md) | Los diecinueve casos de estudio, cada uno con su frontera declarada. |
| [`SPEC_KIT_es.md`](./docs/SPEC_KIT_es.md) | Lore junto a spec-kit de GitHub: quién gobierna qué. Opcional — Lore no depende de él. |
| [`LUS_es.md`](./docs/LUS_es.md) | El programa de investigación detrás de Lore, sus hipótesis vigentes y fronteras de evidencia. |
| [`GENEALOGY_es.md`](./docs/GENEALOGY_es.md) | Genealogía afectiva: procedencia cultural separada de la teoría y las reglas de producto. |
| [`BIBLIOGRAPHY_es.md`](./docs/BIBLIOGRAPHY_es.md) | Fuentes conceptuales: la regla de entrada, y dónde pierde cada una. |
| [`OBSERVER_es.md`](./docs/OBSERVER_es.md) | Procedencia del observador: el tercer registro — se publica su método, su contenido no viaja. |
| [`CONTRIBUTING_es.md`](./docs/CONTRIBUTING_es.md) | Cómo contribuir cambios de producto, casos, refutaciones y preguntas de investigación. |
| [`CODE_OF_CONDUCT.md`](./docs/CODE_OF_CONDUCT.md) | Normas de participación y vía de reporte. |
| [`LICENSE`](./LICENSE) · [`NOTICE`](./NOTICE) | Licencia Apache 2.0; autoría en `NOTICE`. |
| [`bench/`](./bench/) | El benchmark: harnesses Web, Editorial y UPGRADE; tareas congeladas; método; fronteras declaradas; y resultados crudos. |

---

## Casos de estudio

Lore no se diseñó de antemano: cada decisión salió de aplicarlo a proyectos reales y mirar qué se rompía — **diecinueve casos de estudio**, cada uno con su frontera declarada. El **Caso 12 es la primera instalación hecha por alguien que no es el autor**.

> **Estatus:** casos, no demostraciones — n pequeño, y **dieciocho de los diecinueve vienen del mismo investigador**. La afirmación medida pertenece al [Caso 08 y su benchmark](#el-benchmark); los demás aportan evidencia cualitativa.

**[Leer los diecinueve casos de estudio →](./docs/CASES_es.md)**

---

## Alcance

<p align="center">
  <img src="./assets/reach-es.png" alt="3.000+ clonaciones y sumando" width="100%">
</p>

<p align="center">
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/3%2C232-clonaciones_hasta_2026-09-23-FF557A?style=for-the-badge&labelColor=0B0B12" alt="3.232 clonaciones"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/81-d%C3%ADas-22D9EE?style=for-the-badge&labelColor=0B0B12" alt="81 días"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/~40-al_d%C3%ADa-F94F79?style=for-the-badge&labelColor=0B0B12" alt="40 al día"></a>
  <a href="./data/traffic/clones.json"><img src="https://img.shields.io/badge/225-pico-35E5F5?style=for-the-badge&labelColor=0B0B12" alt="225 pico"></a>
</p>

Ventanas GitHub preservadas en [`data/traffic/clones.json`](./data/traffic/clones.json). Un **mínimo, con corte al 2026-09-23**.

Lore Plugin es el brazo técnico de LUS, no un sistema de productividad con filosofía agregada. El benchmark prueba una afirmación acotada de producto; no valida LUS como conjunto. [La frontera de investigación está explícita acá.](./docs/LUS_es.md)

Morin le da a este trabajo su norte ético: en la edición de UNESCO de [*Los siete saberes necesarios para la educación del futuro*](https://unesdoc.unesco.org/ark:/48223/pf0000378091) escribe que «la noción de apuesta se debe generalizar para cualquier fe». [La sensibilidad que volvió pensables esas preguntas vive acá.](./docs/GENEALOGY_es.md)

> **Una señal de alcance, no una demostración.** Nadie sabe qué hizo cada quien con su copia — ¿instalada, destilada, abierta una vez? No es un caso y no responde lo que responden los [casos de estudio](./docs/CASES_es.md). Y los «clonadores únicos» de la API son únicos **por día**, no personas: no se pueden sumar para contar cabezas.

---

## El deck

<p align="center">
  <img src="./assets/deck-cover.png" alt="Deck LUS + Lore Plugin — portada" width="100%">
</p>

La charla completa de **LUS + Lore Plugin** — qué es Lore Plugin, la investigación LUS que hay detrás y cómo un proyecto va de cero a su primer Lore útil: **[abrir el deck →](https://docs.google.com/presentation/d/1eg0OBUwm86yMp3OYFBX_z9pyLrXPCKZV/edit?usp=sharing)**

---


## Origen

Lore nació de **LUS (Lore User System)**, un programa de investigación sobre relaciones que acumulan criterio capaz de participar en decisiones posteriores. Lore es una arquitectura operativa producida por ese trabajo, no una demostración del programa. Una idea los conecta:

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

Eso nos vuelve **jardineros del Entre**: conservamos las experiencias que merecen orientar otra decisión y podamos las que ya no restringen nada. Investigación y software siguen separados: una observación de producto no se vuelve automáticamente resultado científico, y una hipótesis no se vuelve regla de una skill sin evidencia y revisión.

Lee la [presentación completa de LUS](./docs/LUS_es.md), su [bibliografía conceptual](./docs/BIBLIOGRAPHY_es.md) y la [genealogía afectiva](./docs/GENEALOGY_es.md), mantenida aparte. El [NotebookLM público de LUS](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450) es una introducción accesible, no la fuente de registro.

### ¿Por qué «Lore»?

En los videojuegos, el *lore* es la historia y las reglas acumuladas que mantienen coherente un universo —qué puede y qué no puede pasar después. Tomamos esa imagen y cambiamos el peso: los hechos puntuales se desvanecen, y **lo que permanece es el criterio** que mantiene coherente el próximo trabajo. La deuda visual también es explícita: la paleta anime viene de ***Tales of Berseria*** (Bandai Namco, 2016), el juego favorito del autor.

## Autor

**Andrés Peña Mellado** — investigador principal de LUS.

Construyendo en Web3: editor general del piloto de periodismo comunitario en **Tellus Cooperative**.
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
  <a href="mailto:[public contact omitted]"><img src="https://img.shields.io/badge/[public contact omitted]-35E5F5?style=for-the-badge&logo=gmail&logoColor=0B0B12&labelColor=0B0B12" alt="Email"></a>
</p>

</details>
