# Lore Plugin – Reference

This is **the technical document** for the provider-neutral **Lore plugin**: getting started, day-to-day
use, core concepts, the exact spec for every skill, mode and artifact, and how to migrate an existing
project. For the motivation, the architecture at a glance and the index of every document, see the
main [`README.md`](../README.md); for the 90-second version, [`90_SECONDS_en.md`](./90_SECONDS_en.md).

---

## Getting started

### The daily loop

1. You work with your AI agent to solve a problem in your project.
2. You decide whether the solution revealed **criteria** that should shape future decisions.
3. You use `save-to-lore` to capture that criterion into your Markdown Lore.
4. Future sessions reuse that criterion instead of starting from scratch.

**Example — capturing a hydration bug.** You and Claude debug a hydration problem in Next.js. Instead
of just fixing it:

```text
save-to-lore "Hydration issue with initial opacity in Next.js"
```

Lore helps you extract the **Invariant Clue** (e.g. "the initial state goes in the markup; the
library confirms it with `fromTo`, never creates it"), decide whether it belongs to a project module
or to the Area's `principios.md`, and update the right Markdown artifacts — always after your approval
at the threshold.

### Your first Area and project

Lore scales through **Areas**: a mother folder that owns shared criteria; projects inherit it instead
of duplicating rules.

```text
create a work area for "AI-assisted frontend"
create a project "Marketing site" in the area "AI-assisted frontend"
```

- `create-area` initializes `lore/identidad.md`, `lore/principios.md`, `lore/index.md`, whatever
  thematic modules are needed, the Area's contract and its `FASES.md`, plus a `_starter/` with the
  templates `create-project` instantiates.
- `create-project` creates the folder in `{area}/proyectos/{slug}/` — never directly under the Area —
  prepares `lore/` for its own modules (the Area's generic ones are only referenced by relative
  path), `FASES.md` and the contract, and registers the project in the Area's `FASES.md`.

Then you work in the project as usual and call `save-to-lore` whenever you solve something that
reveals reusable criteria. **First time, you need to know no command:** write *"I want to start using
Lore Plugin, help me"* and the kit opens a brainstorming that ends with your first artifact created.

### Best practices

- Capture criteria only: if it does not constrain a future decision, do not add it.
- Prefer small, single-domain modules over long narrative documents.
- Identity and principles change rarely; keep them short.
- `FASES.md` reflects reality; update it when the phase changes.
- Use Areas for anything that should be shared; keep project Lore light.
- Keep all Lore in one language; if it ended up mixed, use `transmute-lore` `translate` mode.
- Always review the diff Lore proposes before confirming.

---

## 1. Core Concepts

Lore is built around a small set of concepts:

- **Criteria** – The rules and constraints that should influence future decisions.
- **Invariant Clues** – Small, distilled pieces of criteria that remain useful even after the original context is gone.
- **Areas** – Parent folders that own shared Lore; projects inherit their criteria.
- **Projects** – Individual codebases with their own Lore, inheriting from an Area.
- **Artifacts** – Markdown files that structure and store criteria and project state.

Traditional documentation stores information.  
Lore stores criteria that constrain what should happen next.

**Purpose boundary:** Lore Plugin is the technical arm of LUS. The professional-memory-card impact
and Morin's wager are declared hypothesis and ethical north, not benchmark results. Productivity measures an effect; it does not replace the purpose.

---

## 2. Skills Overview

The Lore plugin exposes seven main skills through compatible AI agents:

| Skill            | Purpose                                     | Typical trigger phrase                                |
|------------------|---------------------------------------------|------------------------------------------------------|
| `use-lore`       | Entry point, navigation, and help           | Read first; triggers when "lore" is mentioned or a new Area, project or bot starts |
| `brainstorming-lore` | Design Lore-specific changes without taking over general brainstorming | "brainstorm this Lore", or invoked by an artifact-owning Lore skill |
| `create-area`    | Create a new Area with shared Lore          | "create a work area for Frontend", "I want to start working on X with Lore" |
| `create-project` | Create a project inheriting an Area         | "create a project Marketing Site in area Frontend Development" |
| `save-to-lore`   | Capture criteria (**capture**), arbitrate imported criteria (**graft**), or conditionally mine a loose-notes inbox | "save to lore", "distill skill X into the lore", "review my notes and save what belongs" |
| `transmute-lore` | Operate an existing Lore in eight modes | add / clean / translate / upgrade / prune / **mycelium** / leave / crystallize |
| `create-bot`     | Build a bot: one place to open a session and work across several projects at once, with their criteria reachable and routed | "create a bot to work on X and Y" (nuevo) / "I want a bot that federates the lore already living in A and B" (federar) |

Each skill operates on or creates specific Markdown artifacts under your repository.

**Language:** the skills are written in English, but the Lore they generate is always written in
the **user's language** — both content and artifact filenames. `identidad.md`, `principios.md`,
`FASES.md`, `proyectos/` are the Spanish canonical forms (and appear as such throughout this
document); in English, for example, they become `identity.md`, `principles.md`, `PHASES.md`,
`projects/`. Fixed in every language: the selected contract name (`CLAUDE.md` or `AGENTS.md`),
`lore/`, `index.md`, `golden-paths.md`,
relative-path depth, and English terms of general technical use (workflow, commit, stack,
scaffold…). Inside an existing corpus, its established names win. A Lore in the wrong language is
standardized with `transmute-lore` in `translate` mode.

These skills are **not CLI commands**: they are agent skills triggered by natural language,
not by flags or terminal syntax. The phrases above are real invocation examples, taken from the
triggers documented in each skill's `SKILL.md`.

---

## 3. Skill Details

### 3.1 `use-lore`

**Role:** Entry point into Lore.

**Responsibilities:**

- Explain Lore’s architecture for the current project or Area.
- Show which artifacts exist and how they are structured.
- Route you to the appropriate skill based on your intent.
- For **complex deliverables**, fix the owner and routed Lore, an approved precedent or
  human-approved specimen, verified tool/connector/MCP capabilities, reviewable batches, human
  review, and checked delivery. When the batch splits into mechanical bulk and arbitration, suggest
  `/model` for the cheaper tier instead of a subagent — a subagent re-reads the whole Lore tree
  before it starts. Route each medium and tool to its owner skill rather than becoming a ninth
  production skill.
- **Route a request for a bot, never answer it with an Area** (2.1.1). On a machine with no Lore at
  all, someone asking for bots has already named the deliverable: the Areas are **steps**, `create-bot`
  runs last, and the whole chain is stated with its cost — one `create-area` plus one `transmute-lore`
  per source.

**Typical interactions:**- “Explain the Lore structure for this repository.”
- “What artifacts exist for this project?”
- “Which skill should I use to capture a new invariant?”
- “I want to create a bot for X and Y.”
- “Build this complex deliverable from several sources and deliver it to the target system.”

Use `use-lore` whenever you are unsure where to start.

---

### 3.2 `brainstorming-lore`

**Provisional-canon rule:** questions serve the first victory; later questions exist only to unlock decisions or improve the artifact, and must admit uncertainty and correction.

**Recognizable-continuity rule:** structural work maintains one accumulated artifact, advances one decision at a time and recaps at milestones — the user can still recognize and correct the original intention. `create-area`, `create-project`, `create-bot` and structural `transmute-lore` modes inherit the rule; mechanical work does not.

**Autonomy-with-return rule:** independent work may accumulate; a recap and approved distillation resynchronize it with the shared criterion.

**Fertile-effort rule:** correction, disagreement and review must leave recognizable movement in the artifact or criterion; effort without movement triggers repair.

**Role:** Design a new or materially changed Lore artifact before its owner skill writes it.

**Trigger boundary:**

- Direct requests to brainstorm Lore itself.
- Invocation by an artifact-owning skill before its threshold.
- A non-Lore deliverable whose production is governed by relevant routed process modules; identity
  plus principles alone, or an empty `lore/`, do not satisfy this implicit trigger.
- Not needed for read-only inspection, an approved mechanical edit, or execution of an existing plan.

**Responsibilities:**

- Read the current criterion and relevant artifacts before asking.
- Ask one decision-changing question at a time and compare only materially different approaches.
- Present a proportional design, preserve the owner skill's own threshold, and hand control back after approval.
- Never write the final artifact or take ownership from `create-area`, `create-project`, `create-bot`,
  `save-to-lore` or `transmute-lore`.

---

### 3.3 `create-area`

**Role:** Initialize a shared Lore root for a domain (Area).

**Input:**

- Area name (e.g. `"Frontend Development"`).

**Creates / updates:**

- Area‑level `lore/` folder, with:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - thematic modules under `lore/` as needed.
- One Area-level contract—`CLAUDE.md` for Claude Code or `AGENTS.md` for Codex—and `FASES.md`
  (contract and project registry).
- An empty `proyectos/` folder, where future projects will be born.
- A `_starter/` folder with project templates tuned to the Area's domain
  (`CLAUDE.template.md` or `AGENTS.template.md`, `FASES.md`, and, if applicable,
  `golden-paths.template.md`, plus any base code scaffold); `create-project` instantiates them per project.
  The floor is structural (2.1.5): always-on, `FASES` outside, threshold, inherit by path — for a `bots`
  Area, the variant is `canon/` plus routing.

**Responsibilities:**

- Establish a place where shared criteria for a domain live.
- Provide the skeleton (`_starter/`) that projects instantiate.
- **Return control to the skill that called it** (2.1.1). An Area is a **step** as often as a destination. When `create-bot` called, the Area is `bots` — **one** Area holding every bot as a project — and its domain is the user's bots, never any single bot's.

Use `create-area` when you want multiple projects to share the same foundational criteria.

---

### 3.4 `create-project`

**Role:** Initialize a project‑specific Lore that inherits from an Area.

**Input:**

- Project name (e.g. `"Landing Lore"`).
- Area name (e.g. `"Frontend Development"`).

**Creates / updates:**

- The project folder, always at `{area}/proyectos/{slug}/` — never directly under the Area.
- If the Area has a `_starter/` folder, instantiates its templates (and any code scaffold) into the project.
- Project‑level artifacts:
  - `lore/identidad.md` and `lore/principios.md`, leading with **their own** content, then a
    pointer to the Area standard.
  - `lore/index.md`, referencing the Area's thematic modules by relative path
    (`../../../lore/<module>.md` — three levels up, not two).
  - `FASES.md` (root) for current state and roadmap.
  - `CLAUDE.md` or `AGENTS.md` (root) for the one collaboration contract and operational references;
    the project inherits the Area's host choice.
- Registers the new project in the Area's `FASES.md`.

**Responsibilities:**

- Give the project a place to store **its own** criteria and state.
- Avoid duplicating thematic modules already defined at Area level (they are referenced, not copied).

Use `create-project` whenever you start a new codebase inside an existing Area.

---

### 3.5 `save-to-lore`

**Contextual capture:** hold candidates until a real milestone or a cluster of related clues; the preview shows destination, wording and why now, and approval covers the shown batch's writes and commits, never push.

**Role:** Distill newly acquired experience into reusable criteria.

**Two modes, chosen by the SOURCE of the criteria:**

| Mode | Source | Operation |
|---|---|---|
| **CAPTURE** (default) | lived friction (bug, collapse, client rejection) | Distills the scar into an Invariant Clue. Everything described below refers to this mode. |
| **GRAFT** | imported criteria (a *skill*, a style guide, a third-party playbook, **another kit's constitution or governing document**) | **Judges** that criteria against the project's purpose. Only what survives gets in. |

> *Why "graft".* A graft takes root or is rejected, and what grows afterwards belongs to the host — the exact counterpart of `transmute-lore` PRUNE: pruning removes what the plant grew on its own, grafting judges what came from outside. A Lore with one and not the other either bloats or ossifies.
>
> *Renamed in 2.1.1 (`arbitrate`, then `transplant`): same law, same four gates — a transplant moves a plant without changing it; this mode changes what it lets in.*

**`GRAFT` mode — four gates:**

1. **Capacity or criteria?** A source that **executes** (renders, crawls, compiles) is **not Lore**:
   record it as a dependency and stop there. Only a source that **judges** gets arbitrated.
2. **Does the project have a written purpose?** With no `identidad.md` there is no yardstick: facing
   an authoritative source, all you can do is obey it. Identity first.
3. **Collide, don't copy.** Only what constrains a future decision **here** gets in. Where source and
   standard conflict, **the standard wins**, and that resolution is usually the most valuable line
   produced: it exists in neither body.
4. **Exit threshold — the defeats section.** The module **must** record where the source contradicts
   the standard and **loses**. **No defeats, no entry:** either nothing was arbitrated (it was a
   copy), or the source carried capacity, not criteria.

**A governing document is the hardest case.** A second kit's constitution is criteria written under someone else's purpose, and its supremacy clause is precisely the kind that **loses** — a kit installed this week cannot govern criteria paid for before it existed. The defeat is **written down**, never omitted: an omission leaves a hole the next template regeneration fills back in. Arbitration is judgment, not negotiation.

**On a schedule, `GRAFT` starts by reading what already lost.** The defeats sections it writes **are** the ledger: read them first, never re-arbitrate or re-report what is in them. **"Nothing entered this time" is a valid result and is written as such** — a pass that always finds something stopped looking and started justifying itself.

**A third-party skill you *invoke* carries criteria too, and applies it without asking.** The harder case is criteria arriving as a **tool that runs** — every opinionated tool ships a body of criteria nobody arbitrates because it looks like capacity. **Feed it your Lore in the invocation:** most tools let a provided sample outrank their defaults; the ones that do not stay away from anything the Lore governs.

**Confidence in `GRAFT`:** what is adopted *from* the source enters as `conjecture` (nobody has
paid for it with real friction yet); **the arbitration itself** — the defeats, derived from an
already-validated identity — enters as `confirmed`. The module states its provenance: *"Distilled
from `<source>`, arbitrated against `<identidad.md>`."*

**Input:**

- A short description of the problem or lesson (`"Hydration bug on Next.js landing"`), or the source to arbitrate (`"distill the copywriting skill"`).

**Process (conceptually):**

1. Ask for context: what happened, what was tried, what finally worked.
2. Extract **Invariant Clues**:
   - Constraints that should affect future decisions.
   - Rules that are valid beyond the specific incident.
3. Decide where to store them:
   - Project‑level modules under `lore/`.
   - Area‑level `principios.md` for general rules.
   - Updates to `identidad.md` or the instruction contract if identity or collaboration changed.

**The Lore bar (proactive trigger):** for Claude to propose saving something unprompted, all 4
conditions must hold at once: **constraint** (forbids a future error or demands a standard),
**signal** (distillable to Context → Cause → Clue, no raw logs), **executability** (an unambiguous
directive), and **genericity** (would help another project in the Area). Cosmetic changes never
count.

**`destino:` and landing verification — 2.3.0.** A clue demanding a verifiable artifact or step declares **where it is run**: module and step. Before the threshold closes, the declared term is **grepped in the declared file** and reported as `arrived` or `written, never exercised`; in the second case it stays `conjecture` with **promotion blocked** until the destination exists.

**The junction is written on both sides:** the clue carries its `destino:`; the step carries one line naming the clue. The two sides often live in different trees, and a session loads only its own always-on block — a pointer written in one direction leaves whoever stands at the step looking at a procedure with no visible obligation behind it, which a prune there removes as surplus. From that side, it is.

**Confidence system:** each clue is `conjecture` (default) or `confirmed` (only once validated in the running app) — never inflated to force a promotion.

**Routing and promotion:** criteria is captured in the project first; only what is **confirmed and generic** is proposed for promotion to the Area's `lore/`, which is never written silently. In the project's `index.md`, an already-promoted line carries the ` · ↑` glyph — re-running the skill on that clue is a safe no-op.

**Correcting a fact is not capturing criteria.** Criteria lives in exactly one place by design; a **verifiable fact** — an address, a figure, a date — behaves the opposite way: it repeats in every citing artifact and in the source that handed it out. Fixing it where noticed leaves every other copy wrong. **The unit of work is the set of appearances:** sweep the tree before writing, fix them all in one pass, and if the fact also sits in an unedited source corpus, mark it there too — struck through and dated, never deleted.

**Invariants:** criteria are never invented; everything comes from real experience; discarded noise is reported, never silently removed; every change passes through a threshold before being written; nothing commits automatically and `git push` is never run; a human always reviews the final diff. A clue citing an older law inherits its **boundary of validity** or says why not, and states its
  rule by the **condition**, not by the category the condition usually holds in.

**Loose-note function (conditional reading):** when the request targets `notes/`, `notas/` or
`apuntes/`, `save-to-lore` loads `skills/save-to-lore/notas.md`. The procedure is app-neutral;
Obsidian is optional. It sweeps the whole inbox — even when it is only one folder — extracts `.md`,
`.txt` and `.docx`, reports debt, classifies experience, state, imported criteria or information,
routes, proposes the diff and waits for approval. On close it marks `destilado:` and moves closed
notes to `archivadas/`; it never deletes them. A note remains source, not criteria.

Use `save-to-lore` as the main mechanism for feeding your Lore after important decisions.

---

### 3.6 `transmute-lore`

**Role:** Operate an existing body of Lore through eight distinct modes.

**Entry and portability boundary:** ADD may build Lore where none exists from folders, documents,
chat summaries and notes, but those inputs remain sources until approved distillation; CRYSTALLIZE
creates a derivative, traceable, extractable memory card that never replaces the live Lore.

**Input:**

- Project name (e.g. `"Legacy Frontend"`).
- Mode, inferred from the phrase (not a flag):
  - `add` – "transmute the lore of Legacy Frontend", "this old project isn't in the new format" —
    create missing Lore artifacts.
  - `clean` – "clean the lore of Legacy Frontend" — remove project thematic modules that already
    duplicate the Area's.
  - `translate` – "standardize the language of the lore of Legacy Frontend", "translate the lore of
    Legacy Frontend to Spanish" — standardize the language of every Lore artifact: content and
    filenames.
  - `upgrade` – "improve the lore of Legacy Frontend with the new version", "bring this lore up to
    date with the plugin" — raise a healthy Lore written against an older version of these skills to
    the current standard.
  - `prune` – "prune the lore of Legacy Frontend", "this lore got too heavy" — remove **weight** from
    a Lore that decayed by accumulating things that are each individually correct —
    a quantitative target is an acceptance constraint.
  - `micelio` – "run the micelio", "is the Lore plugged in?" — a **read-only** walk reporting which
    clues no step runs. It writes nothing and never prunes. Three triggers: before a complex task,
    after installing or updating the kit, and on the way out of any pass that wrote Lore — a new clue
    is born disconnected, so the exit pass is never the entry pass repeated. Findings block whatever
    comes next until they are written or declined, and a declined finding is never re-reported.

  Six outcomes, said in plain language: there is a step that runs it · nothing runs it · it names a
  place and is not written there · a step only says "consult this" · it is criteria outside `lore/` ·
  the step exists, in a file this session does not load. The mode runs quiet — nobody needs the
  vocabulary to ask, and the six do not merge: the last four are repaired in different directions.
  - `leave` – "leave Lore", "leave Lore without losing the criterion" — inventories every active
    execution junction, stops before changing a symlink or shared contract, and removes only the
    approved automatic routes while keeping `lore/` and plain `enrutamiento.md`. An interrupted pass
    stays `leave:partial`; `leave:` is written only after static and fresh-session verification and
    retains the approved checklist for a later UPGRADE re-entry.
  - `crystallize` – "crystallize this Lore", "export this Lore to one Markdown", "extract this
    crystallization" — resolve the live routing into a safe, traceable reading copy for a chat,
    AI project or notebook, marked so it can be unpacked into a folder whose routing table resolves.

**Safety precondition:** modes that modify source artifacts require a clean git tree before writing;
`crystallize` writes none and may diagnose a dirty tree, but still requires an explicit export preview and threshold.

**Process — `add` mode (conceptually):**

1. Inventory existing sources of criteria: `CLAUDE.md`/`AGENTS.md` (usually the biggest deposit of
   mixed criteria), `README.md`, a stale or missing `lore/`, `incidents/`, code comments with
   signals like "never", "always", "WARNING".
2. Separate **criteria** (which constrains future decisions) from **noise**.
3. Propose how to map that criteria onto:
   - `identidad.md`, `principios.md`, `index.md`, thematic modules under `lore/`.
   - `FASES.md` and the instruction contract at the root.
4. Present the full mapping (real content, not just a routing table) and **wait for explicit
   approval** before writing anything (threshold).

**Process — `clean` mode (conceptually):**

1. Requires the project to have a **parent Area** (`{area}/proyectos/{slug}/`); if it is standalone,
   `clean` does not apply and this is reported.
2. Compare each of the project's thematic modules against its counterpart in `{area}/lore/`: if every
   clue in the project module is already in the Area, the module is redundant and removable.
3. Any clue **not** found in the Area is reported (not deleted) for the user to decide.
4. **Never deletes** `identidad.md`, `principios.md`, or `index.md` — only redundant thematic
   modules. Rewrites `index.md` to point at the Area's modules.

**Process — `translate` mode (conceptually):**

1. Resolve the **target language**: the one you asked for; if unstated, your own language.
2. Inventory the current language of each artifact in scope (`lore/*.md`, `FASES.md`, the contract,
   `golden-paths.md` if present), including mixed-language files.
3. Present the file-by-file plan — including **renames** of localizable artifacts (e.g.
   `identidad.md` ↔ `identity.md`, `FASES.md` ↔ `PHASES.md`) — and **wait for explicit approval**
   before writing (threshold), stating what will NOT be translated or renamed: the selected contract name,
   `lore/`, `index.md`, `golden-paths.md`, code blocks, identifiers, quoted error messages,
   confidence markers (`conjecture`/`confirmed`), the ` · ↑` glyph, English terms of general
   technical use, and proper nouns. Renaming `proyectos/` is opt-in and proposed separately
   (external references may point at that path).
4. Translate **preserving meaning**: it is a translation, never a rewrite — no clue is added,
   removed, or reinterpreted. Renames are applied with `git mv` and every link touching a renamed
   file is rewritten, leaving no broken links.
   Ambiguous nuances are flagged, not guessed.
5. Scope boundary: translating a project does not touch its Area's `lore/` (and vice versa); if the
   other level is in a different language, the mismatch is reported. Exception: link integrity does
   cross the boundary — renaming an Area's modules updates (or reports) its projects' links into
   those files.

**Binaries: compare before extracting, record after.** A transcribed binary is indistinguishable from a pending one, so `add` compares a binary's text against the existing corpus before extracting it and **records the correspondence binary → transcription** in the destination when it transcribes one. The `.md` is written under the name the content deserves; the binary stays put, extension intact. Pending extraction items are written by **content, not by extension**.

**Process — `upgrade` mode (conceptually):**

1. **Establish both versions.** The installed one comes from the host's installation registry, never
   from a `plugin.json` found in the tree — the manifest is the *source's* version, and a session
   resolves its plugin version when it opens, so the registry may not describe what is running. The
   witness that survives is the path the skill declares as it loads, contrasted against a word that
   exists in only one version. The Lore's own version is inferred from its artifacts; say plainly when
   that is a guess, and if the installed copy is stale, **stop and say so**.
2. **Arbitrate artifact by artifact**, sorting every finding into exactly four kinds:

| Kind | What it means | What it produces |
|---|---|---|
| **Missing** | The kit now requires something this artifact never had (a validity boundary, a confidence marker, a defeats section, a provenance header). | Add it, **asking** for anything not derivable from the text. Never fabricate a boundary. |
| **Superseded** | The kit now knows this practice is wrong. | Propose the correction, citing which rule supersedes it. |
| **Earned** | It departs from the current standard **because this project paid for it**. | Leave it, and write why in `FASES.md` — one line per exemption, never inside the artifact it defends. |
| **Stale** | It matches the kit and no longer matches **the project**: it describes a practice that changed and nobody amended the text. | Report it with the contradicting evidence and **ask**; the correction is the user's to state. |

3. **`index.md` is checked against its own row format**, not only its links. The failure to look for is
   a middle field that has quietly split in two — some rows saying *when to open this*, others
   carrying a confidence marker. It hides well because **a malformed list looks exactly as well-formed
   as a complete one**, and every row reads fine on its own. On a long index, write the format at the top and leave the old rows (2.1.4).
4. A finding list with **no `Earned` entries** in a Lore with real history means the pass is being run
   as a formatter. **`Stale` is the one no reading finds:** it is detected against the repository —
   recent commits and the actual deliverables the module governs — never by re-reading, because an
   artifact consistent with itself and false about the outside survives every reading.
5. **Since 2.1.4:** map the tree before reading it. In a live `.md` that still commands, `HARD-GATE` is said as threshold. A missing identity file is ADD. In a campaign the threshold is per class. Count the notes inbox; mine only what constrains this pass.
6. Present the full threshold, write only after approval, and record the version upgraded to in
   `FASES.md` — not in the Lore. **Does not commit.**

**Process — `prune` mode (conceptually):**

**The unit this mode counts is the deliverable, not the Lore.** A body of criteria is not too big in
the abstract; it is too big *for the thing it has to produce*. Ask for the artifact the project
actually ships before reading a single module — without it, `prune` has no denominator and turns into taste.

1. **Measure before reading**, because the defect this mode exists for is invisible when reading files
   one at a time: laws in `principios.md` (area + project), clues across thematic modules, **clues
   with no validity boundary** (one with no boundary applies *always* — this is the multiplier),
   guardrails from the active phase, and **scaffolding against content in the last three
   deliverables** — that last count finds what no per-artifact pass ever caught. Also inventory whether each piece type the project ships has a **declared length ceiling**: the piece with no ceiling is the one that will bloat, usually the most published one.
2. **Classify, four kinds:**

| Kind | What it means | What it produces |
|---|---|---|
| **Deadwood** | It constrains no future decision — the decision it once shaped no longer exists, or it was adopted from elsewhere and never bit. | **Comes out**, after its residue is written down. |
| **Crowding** | Correct, earned and not refutable — and yet its *sum* with the others saturates the deliverable. | **Does not come out.** It receives a validity boundary, a destination for the artifact it demands, or a ceiling. |
| **Rooted** | Load-bearing: a real scar behind it and a decision that still depends on it. | Untouched, and **not re-examined by the next pass**. |
| **Unhealed** | Declared applied and only partly applied — the correction landed in one place and not in its siblings. | **Finish it or unmark it.** It may not stay declared-and-false. |

3. **A prune list with no `Rooted` entries is a pass being run as a chainsaw** — the mirror of
   `upgrade`'s `Earned` rule: a mode that only removes will always find something to remove.
4. Nothing comes out without its residue written down, and **what shrinks is the deliverable, not
   necessarily the corpus**.

**Process — `crystallize` mode (conceptually):** resolve the **whole routed tree** — the target's
contract, canon, identity, principles, and every `lore/` named by `enrutamiento.md` or
`scripts/ecosistema.json`, including `lore-ecosistema/` when the live origin is absent. A snapshot
that only *points* at criterion it does not contain has failed the mode. Classify the rest as
private, noise (notes, scripts other than the manifest, lockfiles) or unrouted; show the full
manifest; wait for approval; write one snapshot outside `lore/`. Each inlined file is wrapped in
`<!-- lore:extract path="..." owner="..." -->`; unpack with
`skills/transmute-lore/scripts/crystallize.mjs` into a mini-root that mirrors `raiz`. The header
states that the copy may become stale. Private material is excluded by default: sensitive filenames
are omitted, and recognized secret markers in routed text abort the pass. "Without the
ecosystem" is not a default. The user does not write the extractor.

`transmute-lore` **does not commit the target project**. Source-changing modes leave a reviewable
diff; `crystallize` verifies that source hashes or byte counts did not change.

Use `transmute-lore` when you already have a project and want to bring it into Lore without rebuilding everything by hand.

---

### 3.7 `create-bot`

**Birth from an idea:** the initial declaration is provisional canon; configuration runs the cycle to a reviewed first victory. Any interface keeps canon, logic and presentation apart, puts decisions before prompts, and derives Journey state from purpose.

**Role:** Build a **bot** — one place to open a session and work across several projects or Areas at
once, with their criteria reachable and routed, then loaded on demand, instead of answering questions about them.

A bot is a sibling of `create-project`, not of `create-area`: it lives at
`{area}/proyectos/{slug}/`, and **one** property sets it apart — it **routes outward**, into Lore owned by
other projects and Areas. By default it is a folder with its canon and its host-selected contract:
opening a session loads the canon and routing table, while routed bodies are read when the task
selects them. Nothing is installed. **Packaging is CRYSTALLIZE**, not an installable plugin.

> **Why it cannot be an Area.** An Area owns its domain's criteria; a bot borrows what it routes to. Built as an Area, it becomes a parent accumulating criteria it never paid for — and when a criterion generalizes, it gets promoted to the bot instead of to the Area that earned it.
>
> **The inverse confusion (2.1.1): a bot administers no bots.** One that exists to add bots or reorganize folders is the `bots` Area wearing a bot's shape — that job needs no canon and no routing table. If one shows up, what is missing is the Area.

> **The premiere opens with the access check (2.1.1).** The bot is opened **the way its user will open
> it**, confirming the session reaches the manifest's paths — each host grants that reach its own way
> (Claude: session in the bot plus `.claude/settings.local.json`; Codex: a project at the **mother**
> folder of the federated tree; CLI: `--add-dir`). A host pointed at the wrong folder fails as *«it
> reads the wrong Lore»*, a symptom that sends debugging into the criteria and never into the access.

**Input:**

- Target Area path, the bot's `slug` (also the skill name), and its purpose.
- Source documents the canon is distilled from.
- `federar` mode: which Lore bodies it routes to, and what **type of task** each one governs.

**Modes:**

| Mode | When | What it adds |
|---|---|---|
| `nuevo` | No prior Lore to gather. | Nothing; canon only. |
| `federar` | The criteria already exists, dissolved across several Areas. | `scripts/ecosistema.json`, `scripts/sync.js`, and two **generated** files: `lore/enrutamiento.md` (the table) and `.claude/settings.local.json` (access to the live trees). **It copies nothing** unless the copy is turned on. |

For an existing bot, the skill runs an **audit pass** instead of either creation procedure: it checks the institution's actual registry, scope, sources, routing and README, then rejoins the sync and verification flow.

> **Federating is pointing, not copying:** each manifest row is an address to Lore living where it
> lives, so that criteria keeps one owner and one version.

**An Area is federated the way it is opened:** `lore` **plus** its selected contract and its `FASES.md`. Its **laws** live in the Lore, but the **sequence of work** lives in its `CLAUDE.md` or `AGENTS.md`, and the **registry of what exists and where** in its `FASES.md`, including projects adopted by path. A bot carrying only the Lore cites every rule correctly and still works differently.

**Access is declared per source, not inferred from its category.** If any project inside an Area falls outside the bot's scope — the normal case — working access stays off so excluded projects cannot reopen through the back door. Only a deliberately whole-Area federation may carry `"trabajo": true`, with the reason beside the manifest row.

**Chain for sources with no Lore:**

The usual starting point is raw material — folders of documents, a database, scattered notes — not a
tidy set of Lore bodies. That does not get federated: it gets chained.

```text
raw folder → create-area → transmute-lore (add) → create-bot (federar)
```

> **The bot never distills into itself.** A source with no Lore gets its Lore in the Area it belongs
> to, and is federated afterwards. Absorbing it directly leaves the bot owning criteria it never paid
> for, and once the only copy lives there the Area can no longer be its source of truth.

`create-bot` inspects the paths and classifies each source: already has Lore (federate), has
undistilled criteria (`transmute-lore` add first), has no owning Area (`create-area` first), or is
not text (extract first — `sync.js` moves only `.md`, `.txt` and `.json`, so anything unextracted is
invisible and unwarned). Reported as part of the brainstorm.

**Register with the user:** the skill asks three things — name, purpose, where the useful folders are — **in plain language**; the dense vocabulary belongs to the skill document, not the conversation.

**Creates / updates:**

- `CLAUDE.md` or `AGENTS.md` — **the bot**: first-use configuration, canon loading, routing, execution, distillation proposal on close.
- `canon/*.md` — the criteria the bot **is**, each module declaring origin and boundary of validity.
- `lore/`, `FASES.md`, `.gitignore`.
- `federar` mode: `scripts/ecosistema.json`, `scripts/sync.js`, plus the generated `lore/enrutamiento.md` and `.claude/settings.local.json` (local, never committed).
- A README only when the user asks for one. Registers the bot in the Area's `FASES.md`.

**The three bodies of criteria (the central invariant):**

| Body | What it is | Rule |
|---|---|---|
| `canon/` | criteria the bot **is**; loaded before every decision | distilled; lives next to the contract |
| `lore/` | criteria for **maintaining** the bot | the project's own |
| **borrowed** criteria | the Lore of every project the bot routes to | reached **by pointer**, at its own address; **never authoritative** |

The test that keeps them apart: **would the source be discardable?** Distilling produces something
smaller that can replace its origin; copying produces something identical that cannot.

**The copy (`lore-ecosistema/`) is optional and off by default** (`"copia": true`). It answers one question: *do the people who will use this bot have your folders, or only the bot?* Without the tree the pointer resolves to nothing and the copy is the only way that criteria exists on their machine. With it on, `sync.js` never summarizes — a summary next to the consultation index competes with the original and wins by being closer — and **precedence is checked per row at read time**: if the live source resolves, it is read there and the copy is not opened, so the copy **deactivates itself**, row by row, as someone acquires the folders.

**Responsibilities:**

- Brainstorm the canon **before** creating anything (threshold), distilled **from the source** — never from another distillation nor from the model's own knowledge; each module names its origin and where it stops applying.
- Route **by type of task, not by name of project**; when ambiguous between two Lore bodies, ask.
- Close **every** task with a distillation proposal, reporting what was discarded.
- Write negative reports with coverage in the same sentence: *«none of the laws I carry are broken»*, never *«it is fine»* — what nobody scarred is not written down, and its absence from the corpus looks exactly like its absence from the work.
- `federar`: one manifest generates table, access and pruning so they cannot drift; sync runs one way only; `enrutamiento.md` is never hand-edited.

**First use — a brainstorm, not a form:**

The kit brainstorms to build every artifact it makes, so the artifact does not greet its first user
with four fields to fill. If a brainstorming skill is installed, the bot runs the first use through
it; otherwise it runs a minimal one itself. Three moves:

1. **It shows what it reaches before asking anything** — each federated body with whether it resolves
   *on this machine*, what the canon distills, what is out of scope. A broken pointer surfaces in
   front of the person who can fix it.
2. **It asks only what changes behaviour**, one question at a time, and **never with closed options
   for a field that picks a branch**: the question is asked by its **condition** — *«does your work
   fall into more than one of these?»* — and an answer naming two bodies opens by both. Tone and
   nickname are inferred, corrected in a sentence.
3. **It closes by separating configuration from criteria.** Configuration goes to `.{slug}.json`;
   criteria is proposed to **the Lore of whoever paid for it**, never stored in the bot.

**Configuring the first use is not the first use.** That gate is answered identically with an empty
canon and broken paths, so passing it proves nothing about whether the bot works. The bot is reported as finished after a
**premiere**: an instruction that does not name the criteria, recorded **verbatim** in the Area's
`FASES.md` — a paraphrase can no longer be judged for whether it was short.

Optional, off by default:

- **Encryption** (*experimental*, see [`ENCRYPTION.md`](./ENCRYPTION.md)): encrypt in distribution,
  never at consultation. With encryption the plaintext stays out of git; without it the criteria
  **must** be committed, or the repository travels with no criteria. The passphrase comes from *stdin*
  and never enters the chat.

A bot without it is complete. **Packaging is crystallization**, not wrapping the bot as a plugin:
unpacking the snapshot rebuilds the folder, including `lore-ecosistema/` — that is how the work
travels to someone who does not have your tree.

Use `create-bot` when you want one session that works across several projects — with or without existing Lore: none, it orchestrates the chain above; some, it federates it. It never substitutes for building that Lore in the Area that owns it.

---

### 3.8 Note function loaded by `save-to-lore`

**Purpose:** capture loose notes and mine the inbox without depending on an app. A note is always
source material; `save-to-lore` owns any criterion that survives classification, routing and the
threshold. The operational detail lives in `skills/save-to-lore/notas.md` and is loaded only when the
request concerns a notes folder.

**Precondition:** the work root must be the **mother folder containing the Areas**, not a folder beside them — the function verifies that at least one direct child of the root holds a `lore/`, or it stops and points at `create-area`. The path is never assumed.

**The inbox:** a folder named in the user's language (`notes/`, `notas/` or `apuntes/`). The sweep is recursive and extracts `.md`, `.txt` and `.docx`; subfolders are the writer's business.

**Standing recommendation: the inbox lives in a bot.** It is the recommended setup on first run and whenever a sweep happens outside one. The reason is routing: a bot routes each note **against `lore/enrutamiento.md`**, where the purpose of every federated Area and project is written down, and border cases get asked instead of guessed. Outside a bot, routing is one path plus the model's reading — a guess wearing the same confidence. No bot, and notes touching more than one Area? The function proposes `create-bot`.

**It lives where the session is opened**, and this is not cosmetic:

| Session opened in | Its inbox |
|---|---|
| A **bot** ← *recommended* | `<bot>/notes/` |
| A project or an area | that folder's `notes/` |
| **The vault root** | **none. The root never has an inbox** |

**The root never has an inbox, and that is a law rather than tidiness.** A note at the root has no owner and no table to route against, and the failure is silent — the sweep does not read it, does not fail, and **reports a debt of zero**, leaving the note intact: the exact state distillation exists to break. A note belonging to no project means **the project is missing** (`create-project`), not that an orphan inbox is needed.

**And somebody does work at the root** — launchers that route into every Area, specs that decide a new one, whole-tree scripts. The root is **a place of work with no Lore**: no owner, no `FASES.md`, no inbox, no contract to register what happened, so **the work itself goes unregistered** and no note ever exists for a sweep to find. What is missing is one level up: an **Area** (`create-area`). Until it exists, the note goes to the inbox of the Area that asked for the work, never to the root.

**A note's frontmatter:**

```yaml
---
fecha: 2026-08-08
origen: bots/proyectos/my-bot   # optional — where it was written from; feeds the routing
destilado:                      # empty = unmined
---
```

**The two operations:**

| Operation | What it does |
|---|---|
| **Capture** | Writes a `.md` into the inbox with that frontmatter. Never inside `lore/`, and never touches `identidad.md`, `principios.md`, a module, `FASES.md` or the instruction contract. |
| **Mine** | Sweeps the inbox, reports the debt, classifies, routes, proposes and waits for approval. The writing is executed by `save-to-lore`. **Debt is what the human wrote and nobody distilled** (2.1.1): a note the agent wrote itself does not count as the user's without saying so. |

**The four buckets.** The discriminator is not the quality of the note: it is whether the note records
a **transformation** or only a **fact**.

| The note records | What it is | Destination |
|---|---|---|
| A friction **that was resolved** | experience | `save-to-lore` **capture** |
| A **task**, a pending item or an **open** friction — *"we need to add X"* | state | `FASES.md` |
| Someone else's criteria that **judges** | imported criteria | `save-to-lore` **graft** (no defeats, no entry) |
| A summary, a quote, a link, a jotting | information | source for `create-area` / `create-project` / `transmute-lore`, or **reported noise** |

A fifth destination exists and is rarer: a note that changes **how we work together** belongs in the instruction contract, not the Lore.

**Routing**, stopping at the first that resolves: the note's `origen` → the bot's `lore/enrutamiento.md` → the project or area the session runs in → **ambiguous, ask**. The first time an ambiguity resolves, the **border** may be worth a Clue; the noise filter applies there too.

**Idempotency and lifecycle:** on close, every mined note gets its `destilado:` with date and destination — including the ones that produced nothing. A non-empty `destilado` is skipped on later sweeps. Closed notes then move to `<inbox>/archivadas/` (an inbox that already uses another subfolder for this keeps its name); a living notebook with an empty `destilado:` stays put. The mark travels with the file, so idempotency holds and the debt count does not change. **The function never deletes a note:** moving is not deleting; mine before deleting, and deleting is the human's call.

**Why a sweep and not an available command.** A note satisfies the urge to preserve while the criterion stays inert inside it — separating notes from Lore did not prevent that; the record stayed inert for six weeks. What prevents it is the sweep and its visible debt, which `save-to-lore` also reports on close.

Use `save-to-lore` once you have notes piling up and want them to stop being only notes — it is not a note manager: the reading tools already read the inbox.

---

## 4. Artifacts Specification

Lore uses a fixed set of Markdown artifacts to keep criteria structured.

### 4.1 `lore/identidad.md`

**Scope:** Area or project.

**Purpose:**

- Define the identity of the project or Area.
- Capture the minimum quality standard that must be upheld.

**Typical contents:**

- Name and description.
- Core intent and audience.
- Non‑negotiable quality bar (e.g. “No user‑visible regressions in production”).
- **`registro:`** — how technical you want the kit to speak to you: `tecnico`, `equilibrado`
  (default) or `llano`. One line. See below.

**The `registro:` key (2.1.0).** It sets how much ground surrounds a rule when the kit explains
itself — `tecnico` keeps the specification and drops the scene, `llano` grows the scene and explains
a technical term the first time it appears, `equilibrado` is half and half. **It never moves the rules
themselves:** a threshold is still a threshold, a `MUST` is still a `MUST`, and a validity boundary is
never omitted. A calibrator that could switch off a gate would be a way of skipping the kit by asking
it nicely.

It is **inferred, never asked** — from how the person writes during the brainstorm — then declared out
loud in one line with the correction offered in the same breath. It is a **declared preference, not
criteria**: it constrains no decision about the work, so it carries no confidence marker and is never
promoted to the area. Absent the line, assume `equilibrado`.

**Guidelines:**

- Keep it short and stable.
- Update only when identity or standards truly change.

---

### 4.2 `lore/principios.md`

**Scope:** Area (and sometimes project).

**Purpose:**

- Store permanent engineering and business rules.

**Typical contents:**

- Architectural principles (e.g. “Prefer static rendering for marketing pages”).
- Business rules that shape technical decisions.
- Constraints that apply across multiple projects.

**Guidelines:**

- Favor clear, actionable principles over abstract slogans.
- Move highly specific rules to thematic modules instead.

---

### 4.3 Thematic Modules under `lore/`

**Scope:** Project and Area.

**Purpose:**

- Group distilled experience by domain.

**Examples:**

- `frontend-rendering.md`
- `error-handling.md`
- `data-modeling.md`
- `deployment-and-ops.md`

**Typical contents:**

- Invariant Clues related to that domain.
- Short context snippets only when needed to understand a rule.

**Guidelines:**

- Each module should focus on a single domain or concern.
- When a module grows too large, consider splitting it.

---

### 4.4 `lore/index.md`

**Scope:** Area or project.

**Purpose:**

- Act as a navigation map for Lore.

**Typical contents:**

- High‑level structure:
  - links to `identidad.md` and `principios.md`;
  - list of thematic modules with short descriptions.
- Pointers to project‑level and Area‑level artifacts.

**Guidelines:**

- Keep this file up‑to‑date when adding or renaming modules.
- Make it easy for a newcomer to know where to look for a given topic.

---

### 4.5 `FASES.md`

**Scope:** Project (root level).

**Purpose:**

- Describe the current state and roadmap of the project.

**Typical contents:**

- Current phase (e.g. “Exploration”, “MVP”, “Scaling”).
- Active goals and constraints.
- Upcoming milestones relevant to criteria and decisions.

**Guidelines:**

- Update as the project progresses through phases.
- Use concise, factual descriptions.

---

### 4.6 `CLAUDE.md` or `AGENTS.md`

**Scope:** Project (root level).

**Purpose:**

- Define the collaboration contract between humans and the project's primary AI host.
- Store operational references for AI‑assisted work.

**Typical contents:**

- How the primary host is expected to be used in the project.
- Non‑negotiable constraints for AI suggestions (e.g. “Never bypass code review”).
- Pointers to prompts, workflows, and safety rails.

**Guidelines:**

- Think of it as the “working agreement” for human–AI collaboration.
- Keep it explicit and practical.

**The always-on block:**

The contract is the only artifact both hosts load without being asked, so it carries the kit's
always-on channel — its pointer section, delimited by a marker pair:

```markdown
<!-- lore:always-on -->
…what Lore governs here · where it lives · where the state lives · when to invoke instead of writing by hand…
<!-- /lore:always-on -->
```

- **Markers are literal.** No spacing variants, no attributes, no version number; located by
  full-line match after trimming whitespace, and **never localized** — localizing them breaks
  idempotent stamping with no error.
- **Ceiling: 25 lines, markers included.** Hard limit. If a variant does not fit, content moves into
  `lore/`; the ceiling does not move.
- **Exactly four things:** what Lore governs here, where it lives, **where the state lives**
  (`FASES.md`, one line, path only), and the signal to invoke instead of writing criteria by hand. It
  points at `lore/` and never reproduces a clue. Criteria and state stay in separate files — that law
  does not move — but the session receiving them cannot read twice, and an agent holding the criteria
  without the phase proposes correctly and **out of order**. The state entry is a **pointer, not
  content**: the path is stable, only its target churns.
- **Three variants.** Area → its own `lore/`. Project → its own layer plus the mother area's. Bot →
  `canon/` plus the routing table, never the federated Lores one by one. All three point at their own
  `FASES.md`, which is one line and does not scale with the number of sources.
- **Who stamps:** `create-area`, `create-project` and `create-bot`, inside the threshold they already
  have; `transmute-lore` UPGRADE for contracts that predate the block.
- **Idempotency:** no markers → insert after the first H1. One well-formed pair with identical
  content → **no-op, write nothing**. One well-formed pair with different content → **report the
  divergence and wait**. Duplicated or broken markers → **stop and report**; never guess. Apart from
  the block, the file does not change.
- **Collision with pre-existing prose.** A contract older than the block usually already names the same paths in a load section, and stamping leaves two copies of the same pointers. The block is the one the skills re-stamp, so the stale copy is the hand-written section: leave the pointers only inside the block and reduce that section to what the block does not carry — reported in the same threshold, never silently.

---

### 4.7 `golden-paths.md` (optional)

**Scope:** Project or Area (root level).

**Purpose:**

- Document the critical routes/flows that must be manually verified (e.g. key web routes in a
  frontend Area).

This is not part of the six-piece core: `create-area` and `create-project` generate it only when the domain warrants it (e.g. a web Area with critical routes); otherwise it simply does not exist.

### 4.8 `assets/constitucion-puntero.md` — the pointer constitution (2.1.0)

**Scope:** shipped **with the kit**, not generated into your repository. It is a template you copy.

**Purpose:** let a repository governed by **spec-kit** coexist with Lore without either body of
criteria silently absorbing the other. spec-kit's constitution is authoritative over the *cycle*
(spec → plan → tasks → implement); Lore is authoritative over the *criteria* that constrains how any
of it gets built. The template makes that boundary explicit instead of leaving it to whoever writes
the next document.

**Why it is a pointer and not a copy.** A constitution that restates the Lore's rules becomes a second source that drifts invisibly — both documents keep reading correctly on their own. The template points at `lore/` for anything Lore owns and states in writing that it does not govern there.

**Its own rule, and the one people skip:** a clause of the *"this document supersedes all other practices"* family is **revoked in writing, with its reason** — never merely deleted. An omission leaves a hole the next template regeneration fills back in. Arbitrating a governing document is `save-to-lore` **graft**, the hardest case that mode has.

See [`SPEC_KIT_en.md`](./SPEC_KIT_en.md) for installation and the three entry scenarios.

---

## 5. Filesystem Layout

A typical Lore layout, with an Area and a project, looks like this:

```text
{area}/
  lore/
    identidad.md
    principios.md
    index.md
    <thematic-modules>.md
  _starter/                    → templates that create-project instantiates
    CLAUDE.template.md or AGENTS.template.md
    FASES.md
    golden-paths.template.md   → only if the domain warrants it
  FASES.md                     → Area's project registry
  CLAUDE.md or AGENTS.md       → the Area's one host-selected contract
  .lore-mycelium               → receipt of the last MYCELIUM sweep (2.4.2). A digest
                                 of the content of the tree's Lore files. Written by
                                 `lore-plugin mycelium receipt`, and committed: being
                                 content-derived, it is identical on any machine for
                                 the same tree state

  proyectos/
    {slug}/
      lore/
        identidad.md            → own content + pointer to the Area's
        principios.md           → own content + pointer to the Area's
        index.md                → points to Area modules via ../../../lore/<module>.md
        <own modules>.md        → only criteria specific to this project
      FASES.md
      CLAUDE.md or AGENTS.md
```

Key points of this hierarchy:

- Projects **always** live at `{area}/proyectos/{slug}/`, never directly under the Area.
- Generic thematic modules are **not copied** into the project: they live once in `{area}/lore/`,
  and the project's `index.md` references them by relative path. That path climbs **three** levels
  (`lore/` → `{slug}/` → `proyectos/` → `{area}/`), not two.
- Shared criteria live in the Area. Project‑specific criteria live in the project.

---

## 6. Operational Invariants

Lore’s behavior is governed by a set of shared invariants:- **Lore is written in the user's language** – content and artifact filenames; only the selected
  contract name, `lore/`, `index.md`, `golden-paths.md`, and English terms of general technical use stay fixed.
- **Criteria are never invented** – all rules come from actual experience.
- **Everything comes from real work** – experiments, incidents, decisions.
- **Discarded noise is reported** – nothing is silently removed.
- **Every change passes through a threshold** – criteria must be reviewed before being written.
- **Nothing commits automatically** – human review is required.
- **A human always reviews the final diff** – AI assists, but does not silently change Lore.
- **A pass that wrote Lore is not finished until its exit sweep is recorded** – the Claude Code `Stop`
  hook compares the content of the Lore files against `.lore-mycelium` and blocks the stop when they
  differ. Detection is by **content**, so the tool used to write the file does not matter, and the
  agent is never asked whether the sweep ran. Codex does not run hooks: there the guarantee is carried
  by the skills' own text.

These invariants are what separate Lore from generic note‑taking or logging tools: a trusted, human‑curated body of criteria that AI can rely on.

---

## 7. Relationship to the other documents

This is the complete technical document: getting started, day-to-day use, concepts, the spec for
every skill/mode/artifact, and migration. The [`README.md`](../README.md) carries story, motivation,
architecture at a glance and the index of everything else; [`90_SECONDS_en.md`](./90_SECONDS_en.md)
is the 90-second version; [`ENCRYPTION.md`](./ENCRYPTION.md), the optional bot-criteria encryption;
[`CASES_en.md`](./CASES_en.md), the case studies. One technical document — instead of a separate
usage guide and reference that restated the same model in a friendlier voice — keeps the spec in one
place with no drift between copies.

---

## 8. Migrating an existing project

Migrating a legacy project into Lore is `transmute-lore` (§3.6) applied to what you already have. It
is worth doing when documentation is scattered (README, wikis, ADRs), teams keep re-litigating the
same decisions, or you want AI-assisted work to rest on stable criteria rather than ad-hoc notes.
**You do not have to rewrite your whole history** — only move the criteria that still constrains
decisions.

### 8.1 Strategy

1. **Create the Area** for the domain (`create-area`).
2. **Pick one or two pilot projects** representing typical work.
3. **Run `transmute-lore`** on those projects: `add` to create missing artifacts, then `clean` to
   lift shared criteria to the Area.
4. **Refine the Lore**: consolidate rules, remove duplication, clarify Clues.
5. **Extend the pattern** to the other projects once the structure feels solid.

An **already existing** project is not created: it is **adopted** by adding a row with its path to
the Area's `FASES.md`, without moving it or touching its git. If the destination is a bot, this is
the first half of the chain `raw folder → create-area → transmute-lore (add) → create-bot (federate)`
— the bot never distills into itself.

### 8.2 Mapping old documentation to artifacts

| Legacy source | Destination |
|---|---|
| Old READMEs: identity and purpose | `lore/identidad.md` |
| Old READMEs: domain overview | `lore/index.md` + initial thematic modules |
| Architecture docs: lasting principles | `lore/principios.md` |
| Architecture docs: domain-specific criteria | thematic modules (`frontend-rendering.md`, `api-design.md`…) |
| Roadmaps and phase notes | `FASES.md` |
| Onboarding and "how we work" with AI | the instruction contract |

Focus on rules that still constrain decisions today; ignore obsolete detail.

### 8.3 Post-migration checklist

- The Area's Lore captures the shared criteria; project modules do not repeat general rules.
- Projects keep only their own specific criteria.
- Clues are actionable: anything ambiguous or obsolete is removed or clarified.
- `FASES.md` reflects the real phase and roadmap.
- The contract matches how you actually use Claude.

`transmute-lore` does not commit: the diff is yours to review as a human editor. With one or two
pilots migrated, reuse the same patterns across the Area's other repositories.
