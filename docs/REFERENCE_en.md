# Lore Plugin – Reference

This document is the technical reference for the provider-neutral **Lore plugin**.
It defines Lore’s core concepts, the available skills, the Markdown artifacts, and how they fit together.

For a practical “how to use it every day” guide, see [`USAGE_en.md`](./USAGE_en.md).  
For a conceptual overview and philosophy, see the main [`README.md`](../README.md).

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

---

## 2. Skills Overview

The Lore plugin exposes eight main skills through compatible AI agents:

| Skill            | Purpose                                     | Typical trigger phrase                                |
|------------------|---------------------------------------------|------------------------------------------------------|
| `use-lore`       | Entry point, navigation, and help           | Read first; triggers when "lore" is mentioned or a new Area/project starts |
| `brainstorming-lore` | Design Lore-specific changes without taking over general brainstorming | "brainstorm this Lore", or invoked by an artifact-owning Lore skill |
| `create-area`    | Create a new Area with shared Lore          | "create a work area for Frontend", "I want to start working on X with Lore" |
| `create-project` | Create a project inheriting an Area         | "create a project Marketing Site in area Frontend Development" |
| `save-to-lore`   | Capture criteria after solving a problem (**capture**) or arbitrate criteria imported from a third-party skill/guide (**transplant**) | "save to lore", "distill this to the lore" (capture) / "distill skill X into the lore" (transplant) |
| `transmute-lore` | Operate an existing Lore in six modes | add / clean / translate / upgrade / prune / crystallize |
| `create-bot`     | Build a bot: one place to open a session and work across several projects at once, with their criteria already loaded | "create a bot to work on X and Y" (nuevo) / "I want a bot that federates the lore already living in A and B" (federar) |
| `obsidian-lore`  | Capture free notes in the same tree the Lore lives in, and **mine** that inbox for what deserves to become criteria | "review my Obsidian notes and see what belongs in my lore", "mine my inbox", "save this note to Obsidian" |

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

**Typical interactions:**

- “Explain the Lore structure for this repository.”
- “What artifacts exist for this project?”
- “Which skill should I use to capture a new invariant?”

Use `use-lore` whenever you are unsure where to start.

---

### 3.2 `brainstorming-lore`

**Role:** Design a new or materially changed Lore artifact before its owner skill writes it.

**Trigger boundary:**

- Direct requests to brainstorm Lore itself.
- Invocation by an artifact-owning skill before its threshold.
- Not needed for read-only inspection, an approved mechanical edit, or execution of an existing plan.

**Responsibilities:**

- Read the current criterion and relevant artifacts before asking.
- Ask one decision-changing question at a time and compare only materially different approaches.
- Present a proportional design, preserve the owner skill's own threshold, and hand control back after approval.
- Never write the final artifact or take ownership from `create-area`, `create-project`, `create-bot`,
  `save-to-lore`, `transmute-lore`, or `obsidian-lore`.

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
  `golden-paths.template.md`, plus any base
  code scaffold). `create-project` instantiates these templates for each new project.

**Responsibilities:**

- Establish a place where shared criteria for a domain live.
- Provide the skeleton (`_starter/`) that projects instantiate.

Use `create-area` when you want multiple projects to share the same foundational criteria.

---

### 3.4 `create-project`

**Role:** Initialize a project‑specific Lore that inherits from an Area.

**Input:**

- Project name (e.g. `"Landing Lore"`).
- Area name (e.g. `"Frontend Development"`).

**Creates / updates:**

- The project folder, always at `{area}/proyectos/{slug}/` — never directly under the Area.
- If the Area has a `_starter/` folder, instantiates its templates (and any code scaffold) into the
  project instead of starting from scratch.
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

**Role:** Distill newly acquired experience into reusable criteria.

**Two modes, chosen by the SOURCE of the criteria:**

| Mode | Source | Operation |
|---|---|---|
| **CAPTURE** (default) | lived friction (bug, collapse, client rejection) | Distills the scar into an Invariant Clue. Everything described below refers to this mode. |
| **TRANSPLANT** | imported criteria (a *skill*, a style guide, a third-party playbook, **another kit's constitution or governing document**) | **Judges** that criteria against the project's purpose. Only what survives gets in. |

> **Why "transplant".** What grew well in another soil does not necessarily take in this one, and a
> transplant nobody watches is a dead plant with good intentions: you say what took and what did not.
> It is the exact counterpart of `transmute-lore` PRUNE — pruning removes what the plant grew on its
> own, transplanting judges what came from outside. A Lore with one and not the other either bloats
> or ossifies.
>
> *Renamed in 2.1.0. Through 2.0.9 this mode was called `arbitrate`: same law, same four gates.*

**`TRANSPLANT` mode — four gates:**

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

**A governing document is the hardest case, and the one most often skipped.** When a second kit ships
a constitution or charter declaring its own authority, the reflex is to treat it as configuration and
adopt it. It is criteria written under someone else's purpose, and a supremacy clause is precisely the
kind that **loses** — a kit installed this week cannot govern criteria paid for with friction before
it existed. That defeat is **written down**, not merely omitted: an omission leaves a hole the next
template regeneration fills back in. What does not happen is deferring to it while deciding;
arbitration is judgment, not negotiation.

**On a schedule, `TRANSPLANT` starts by reading what already lost.** A recurring pass over a field
that moves slower than its own schedule keeps meeting the same material. The defeats sections this
mode already writes **are** that ledger: read them first, and never re-arbitrate or re-report what is
already in them. **"Nothing entered this time" is a valid result and is written as such** — a
recurring pass that always finds something stopped looking and started justifying itself.

**A third-party skill you *invoke* carries criteria too, and applies it without asking.** `TRANSPLANT`
is for criteria arriving as a **document** to be read; the harder case is criteria arriving as a
**tool that runs** — a formatter, a linter, a style checker. Nobody arbitrates those because they look
like capacity, and every opinionated tool ships a body of criteria. **Feed it your Lore in the
invocation, as its input:** most such tools have a calibration clause that makes a provided sample
outrank their defaults, and the ones that do not are treated as capacity and kept away from anything
the Lore governs.

**Confidence in `TRANSPLANT`:** what is adopted *from* the source enters as `conjecture` (nobody has
paid for it with real friction yet); **the arbitration itself** — the defeats, derived from an
already-validated identity — enters as `confirmed`. The module states its provenance: *"Distilled
from `<source>`, arbitrated against `<identidad.md>`."*

**Input:**

- A short description of the problem, decision, or lesson (e.g. `"Hydration bug on Next.js landing"`); or the name of the source to arbitrate (e.g. `"distill the copywriting skill"`).

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

**Confidence system:** each clue is stored as `conjecture` (default) or `confirmed` (only once
actually validated in the running app). Confidence is never inflated to `confirmed` just to force
a promotion.

**Routing and promotion:** criteria is always captured in the project first; only what is
**confirmed and generic** is proposed for promotion to the Area's `lore/` (the Area is never
written silently). In the project's `index.md`, an already‑promoted line is marked with the
` · ↑` glyph — re‑running the skill on that clue is a safe no‑op (idempotency).

**Correcting a fact is not capturing criteria.** The routing above is built for criteria, which lives
in exactly one place by design. A **verifiable fact** — an address, a figure, a date — behaves the
opposite way: it is repeated in every artifact that cited it and in the source document that handed
it out, so fixing it where the error was noticed leaves the root intact and every other copy with it,
and none of the survivors produce an error. **The unit of work is the set of appearances:** sweep the
tree before writing, fix them all in one pass, and if the fact also sits in a source corpus that is
not edited, mark it there too — struck through and dated, never deleted.

**Invariants:**

- Criteria are never invented.
- Everything comes from real experience.
- Discarded noise is reported, never silently removed.
- Every change passes through a threshold before being written.
- Nothing commits automatically; `git push` is never run.
- A human always reviews the final diff.
- A clue citing an older law inherits its **boundary of validity** or says why not, and states its
  rule by the **condition**, not by the category the condition usually holds in.

Use `save-to-lore` as the main mechanism for feeding your Lore after important decisions.

---

### 3.6 `transmute-lore`

**Role:** Operate an existing body of Lore through six distinct modes.

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
    a Lore that decayed by accumulating things that are each individually correct.
  - `crystallize` – "crystallize this Lore", "export this Lore to one Markdown" — resolve the live
    routing into a safe, traceable reading copy for a chat, AI project or notebook.

**Safety precondition:** modes that modify source artifacts require a clean git tree before writing.
`crystallize` writes no source artifact and may diagnose a dirty tree, but it still requires an
explicit export preview and threshold.

**Process — `add` mode (conceptually):**

1. Inventory existing sources of criteria: `CLAUDE.md`/`AGENTS.md` (usually the biggest deposit of
   mixed criteria), `README.md`, a stale or missing `lore/`, `incidents/`, code comments with
   signals like "never", "always", "WARNING".
2. Separate **criteria** (constrains a future decision) from **noise** (merely descriptive).
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
3. Any clue **not** found in the Area is reported (not deleted) so the user can decide.
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

**Binaries: compare before extracting, record after.** A `.pdf`, `.docx` or `.xlsx` among the sources
looks like pending work forever, because a binary that **has already been transcribed** is
indistinguishable from one that has not: transmutation writes the `.md` under the name the content
deserves and leaves the binary where it was, extension intact. So `add` mode compares a binary's text
against the existing corpus before extracting it — literal overlap in chunks costs seconds — and
**records the correspondence binary → transcription** in the destination when it does transcribe one.
Pending extraction items are written by **content, not by extension**.

**Process — `upgrade` mode (conceptually):**

1. **Establish both versions.** The installed one comes from the host's installation registry, never
   from a `plugin.json` found by walking the working tree — the manifest is the *source's* version and
   the registry is the version that will run. And the registry is not the last word either: a session
   resolves its plugin version **when it opens**, so one opened before an install keeps running the
   previous copy and the registry will not say so. The witness that survives is the path the skill
   declares as it loads, contrasted against a word that exists in only one version. The Lore's own
   version is usually not written down and is inferred from what its artifacts carry; say plainly when
   that is a guess. If the installed copy is stale, **stop and say so**.
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
   as a complete one**, and every row reads fine on its own.
4. A finding list with **no `Earned` entries** in a Lore with real history means the pass is being run
   as a formatter. **`Stale` is the one no reading finds:** it is detected against the repository —
   recent commits and the actual deliverables the module governs — never by re-reading, because an
   artifact consistent with itself and false about the outside survives every reading.
5. Present the full threshold, write only after approval, and record the version upgraded to in
   `FASES.md` — not in the Lore. **Does not commit.**

**Process — `prune` mode (conceptually):**

**The unit this mode counts is the deliverable, not the Lore.** A body of criteria is not too big in
the abstract; it is too big *for the thing it has to produce*. Ask for the artifact the project
actually ships — a post, a page, a component, a report — before reading a single module. Without it,
`prune` has no denominator and turns into taste.

1. **Measure before reading**, because the defect this mode exists for is invisible when reading files
   one at a time: laws in `principios.md` (area + project), clues across thematic modules, **clues
   with no validity boundary** (one with no boundary applies *always* — this is the multiplier),
   guardrails from the active phase, and **scaffolding against content in the last three
   deliverables**. That last count finds what reading cannot: it belongs to no single clue, which is
   exactly why no per-artifact pass ever caught it. Also inventory whether each piece type the project
   ships has a **declared length ceiling** — the piece with no ceiling is the one that will bloat, and
   it is usually the *most* published one.
2. **Classify, four kinds:**

| Kind | What it means | What it produces |
|---|---|---|
| **Deadwood** | It constrains no future decision — the decision it once shaped no longer exists, or it was adopted from elsewhere and never bit. | **Comes out**, after its residue is written down. |
| **Crowding** | Correct, earned and not refutable — and yet its *sum* with the others saturates the deliverable. | **Does not come out.** It receives a validity boundary, a destination for the artifact it demands, or a ceiling. |
| **Rooted** | Load-bearing: a real scar behind it and a decision that still depends on it. | Untouched, and **not re-examined by the next pass**. |
| **Unhealed** | Declared applied and only partly applied — the correction landed in one place and not in its siblings. | **Finish it or unmark it.** It may not stay declared-and-false. |

3. **A prune list with no `Rooted` entries is a pass being run as a chainsaw.** This is the mirror of
   `upgrade`'s `Earned` rule and exists for the same reason: a mode that only removes will always find
   something to remove.
4. Nothing comes out without its residue written down, and **what shrinks is the deliverable, not
   necessarily the corpus**.

**Process — `crystallize` mode (conceptually):** resolve the project, Area or bot's live routing;
classify sources as included, private, uncertain or unrouted; show the full manifest, destination
and overwrite status; wait for approval; then write one snapshot outside `lore/`. The header states
that the copy may become stale and points back to the live tree. Private material is excluded by
default, uncertain sources require separate approval, and the derivative is never an authority.

`transmute-lore` **does not commit the target project**. Source-changing modes leave a reviewable
diff; `crystallize` verifies that source hashes or byte counts did not change.

Use `transmute-lore` when you already have a project and want to bring it into Lore without rebuilding everything by hand.

---

### 3.7 `create-bot`

**Role:** Build a **bot** — one place to open a session and work across several projects or Areas at
once, with their criteria already loaded, instead of answering questions about them.

A bot is a sibling of `create-project`, not of `create-area`: it lives at
`{area}/proyectos/{slug}/`. **One** property sets it apart: it **routes outward**, into Lore owned by
other projects and Areas. By default it is a folder with its canon and its host-selected contract — open a
session there and the criteria is already loaded, with nothing installed. **Packaging it as an
installable plugin is optional**, and serves one purpose: handing it to a team.

> **Why it cannot be an Area.** An Area holds projects and owns its domain's criteria. A bot owns
> none of the criteria it routes to: it borrows it. Building it as an Area creates a parent that
> accumulates criteria it never paid for, and the consequence shows up fast — when a criterion
> generalizes, it gets promoted to the bot instead of to the Area that earned it.

**Input:**

- Target Area path, the bot's `slug` (which is also the skill name), and its purpose.
- Source documents the canon is distilled from.
- `federar` mode: which Lore bodies it routes to, and what **type of task** each one governs.

**Modes:**

| Mode | When | What it adds |
|---|---|---|
| `nuevo` | No prior Lore to gather. | Nothing; canon only. |
| `federar` | The criteria already exists, dissolved across several Areas. | `scripts/ecosistema.json`, `scripts/sync.js`, and two **generated** files: `lore/enrutamiento.md` (the table) and `.claude/settings.local.json` (access to the live trees). **It copies nothing** unless the copy is turned on. |

For an existing bot, the skill runs an **audit pass** instead of either creation procedure. It checks
the institution's actual registry, scope, sources, routing, README and optional seals, then rejoins
the sync, packaging and verification flow.

> **Federating is pointing, not copying.** Each row of the manifest is an **address**: the table says
> which Lore governs a task, and the generated access lets the session reach it **where it lives**.
> That criteria keeps one owner and one version — the same DRY rule the rest of the kit runs on, where
> a project references its Area's modules instead of duplicating them.

**An Area is federated the way it is opened:** `lore` **plus** its selected contract and its `FASES.md`.
Federating only its `lore/` is the asymmetry to avoid, and it is invisible from inside: the Area's
**laws** live in the Lore, but the **sequence of work** — what is read first, which skill closes a
deliverable — lives in its `CLAUDE.md` or `AGENTS.md`, and the **registry of what exists and where** in its
`FASES.md`, including projects adopted by path. A bot carrying only the Lore cites every rule
correctly and still works differently.

**Access is declared per source, not inferred from its category.** Ask whether any project inside the
folder falls outside the bot's scope. If yes — the normal case for an Area — working access stays off
so excluded projects cannot reopen through the back door. If the bot deliberately federates the
whole Area and leaves no project out, that Area may carry `"trabajo": true`, with the reason written
beside the manifest row.

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
not text (extract first — `sync.js` only moves `.md`, `.txt` and `.json`, so anything unextracted is
invisible and it will not warn). That classification is reported as part of the brainstorm.

**Register with the user:** the skill asks three things — the name, what it will be used for, and
where the useful folders are — **in plain language**. The dense vocabulary (canon, distill, boundary
of validity, Invariant Clue) belongs to the skill document, not to the conversation.

**Creates / updates:**

- `CLAUDE.md` or `AGENTS.md` — **the bot**: first-use configuration, canon loading, routing, execution, and the
  distillation proposal on close. It loads just for the session being opened in that folder.
- `canon/*.md` — the criteria the bot **is**, each module declaring its origin and its boundary of
  validity.
- `lore/`, `FASES.md`, `.gitignore`.
- `federar` mode: `scripts/ecosistema.json`, `scripts/sync.js`, and the generated
  `lore/enrutamiento.md` and `.claude/settings.local.json` (local, never committed).
- **Only if packaged (optional):** `.claude-plugin/plugin.json` and `marketplace.json`, the behaviour
  moves into `skills/{slug}/SKILL.md` with its `canon/` inside, `scripts/validar.js` (the packaging
  gate), `README.md`, and `LICENSE`. An unpackaged bot gets a README only when explicitly requested.
- Registers the bot in the Area's `FASES.md`.

**The three bodies of criteria (the central invariant):**

| Body | What it is | Rule |
|---|---|---|
| `canon/` | criteria the bot **is**; loaded before every decision | distilled (travels inside the skill if packaged) |
| `lore/` | criteria for **maintaining** the bot | the project's own |
| **borrowed** criteria | the Lore of every project the bot routes to | reached **by pointer**, at its own address; **never authoritative** |

The test that keeps them apart: **would the source be discardable?** Distilling produces something
smaller that can replace its origin; copying produces something identical that cannot.

**The copy (`lore-ecosistema/`) is optional and off by default** (`"copia": true` in the manifest).
It answers a single question: *do the people who will use this bot have your folders, or only the
bot?* Without the tree, the pointer resolves to nothing and the copy is the only way that criteria
exists on their machine. With the copy on, `sync.js` never summarizes — a summary living next to the
consultation index competes with the original and wins by being closer — and **precedence is checked
per row at read time**: if the live source resolves on that machine, it is read there and the copy is
not opened. That way the copy **deactivates itself**, row by row, as someone acquires the folders.

**Responsibilities:**

- Brainstorm the canon **before** creating anything (threshold).
- Distill the canon **from the source**, never from another distillation nor from the model's own
  knowledge. Each module names its origin and where it stops applying.
- Route **by type of task, not by name of project**; when ambiguous between two Lore bodies, ask.
- Close **every** task with a distillation proposal, reporting what was discarded.
- Write **negative reports with their coverage in the same sentence**: *«none of the laws I carry are
  broken»*, never *«it is fine»*. A bot points at borrowed criteria, so it inherits its coverage and
  its silence — what nobody scarred is not written down, and its absence from the corpus looks
  exactly like its absence from the work.
- `federar` mode: one manifest generates the table, the access and the pruning so they cannot drift;
  sync runs one way only, and `enrutamiento.md` is never hand-edited.

**First use — a brainstorm, not a form:**

The kit brainstorms to build every artifact it makes, so the artifact does not greet its first user
with four fields to fill. If a brainstorming skill is installed, the bot runs the first use through
it; otherwise it runs a minimal one itself. Three moves:

1. **It shows what it reaches before asking anything** — each federated body with whether it resolves
   *on this machine*, what the canon distills, what is out of scope. That display is also the
   pre-flight: a broken pointer surfaces in front of the person who can fix it.
2. **It asks only what changes behaviour**, one question at a time, and **never with closed options
   for a field that picks a branch**. A closed list has no default for the answer naming two of its
   items, so the question is asked by its **condition** — *«does your work fall into more than one of
   these?»* — and an answer naming two bodies of criteria opens by both. Tone and nickname are not
   asked: they are inferred and corrected in a sentence.
3. **It closes by separating configuration from criteria.** Configuration goes to
   `.{slug}.json`; what turned out to be criteria is proposed to **the Lore of whoever paid for it**,
   never stored in the bot.

**Configuring the first use is not the first use.** That gate is answered identically with an empty
canon and broken paths, so passing it proves nothing about whether the bot works. The bot is reported as finished after a
**premiere**: an instruction that does not name the criteria, recorded **verbatim** in the Area's
`FASES.md` — a paraphrase can no longer be judged for whether it was short.

**Optional, off by default:**

- **The ecosystem copy** (`lore-ecosistema/`): only if whoever will use the bot does **not** have the
  folder tree. Turning it off is **two steps** — `"copia": false` and deleting the folder; doing only
  the first leaves a frozen photograph the bot keeps reading, and `sync.js` warns instead of deleting.
- **Packaging it as a shareable plugin**: only if **other people** are going to install it. For one
  person, opening the folder is enough, and packaging charges maintenance forever.
- **Encryption** (*experimental*, see [`ENCRYPTION.md`](./ENCRYPTION.md)): encrypt in distribution,
  never at consultation. The `.gitignore` follows the choice — with encryption the plaintext is
  excluded; without it the criteria **must** be committed, or the repository travels with no criteria
  and the bot is useless to the team. The passphrase is read from *stdin* and **never enters the
  chat**.
- **Telegram access:** adds a phone channel through a separate Telegram MCP and an explicit access
  list. Remote use requires a reachable machine and an open session.
- **Local multi-provider launcher:** use Lore in the Shell when installed; otherwise build the
  minimum local registry and launcher. It selects the CLI and model but never carries the criteria.

A bot with none of the five is complete.

Use `create-bot` once you have several projects with Lore worth carrying into a single work session.
It does not substitute for building that Lore: it federates it.

---

### 3.8 `obsidian-lore`

**Purpose:** govern the overlap between an Obsidian vault and the Lore when they share a file tree,
capture notes, and mine the inbox. A note is always source material; `save-to-lore` owns any criterion
that survives classification, routing and the threshold.

**Precondition:** the vault must be the **mother folder containing the Areas**, not a folder beside
them. The skill verifies that at least one direct child of the root holds a `lore/`; if none does, it
stops and points at `create-area`. The path is never assumed: it is whatever tree the user has.

**The inbox:** a folder named in the user's language (`notas/` in Spanish, `notes/` in English). The
sweep is recursive over `**/*.md`, so subfolders are the writer's business; the skill imposes none.

**Standing recommendation: the inbox lives in a bot.** Not one option among several — it is the
setup this skill was designed for, and the skill recommends it on first run and whenever a sweep
happens outside one. The reason is routing: a bot carries `lore/enrutamiento.md`, where the purpose
of every Area and project it federates is written down, so a note is routed **against that table**
and border cases are asked instead of guessed. Outside a bot, routing comes from one path plus the
model's reading of the text: a guess wearing the same confidence. If the user has no bot and their
notes touch more than one Area, the skill proposes `create-bot`.

**It lives where the session is opened**, and this is not cosmetic:

| Session opened in | Its inbox |
|---|---|
| A **bot** ← *recommended* | `<bot>/notes/` |
| A project or an area | that folder's `notes/` |
| **The vault root** | **none. The root never has an inbox** |

**The root never has an inbox, and that is a law rather than tidiness.** A note written at the root
has no owner and no table to be routed against, and the failure is silent — a session only reaches
the folder it was opened in plus the paths in its `.claude/settings.local.json`, which never includes
the root, so the sweep does not read it, does not fail, and **reports a debt of zero**. The note stays
intact, which is the exact state distillation exists to break. A note that belongs to no project
means **the project is missing** (`create-project`), not that an orphan inbox is needed.

**And the reason is not that nobody works at the root — somebody does.** Anything that has to sit
above every Area lives there: a launcher that routes into all of them, a spec that decides a new Area,
a script that walks the whole tree. The root is **a place of work with no Lore** — no owner, no
`FASES.md`, no inbox, no instruction contract to load the rules that would have registered what happened. So
the silence goes one step further than the paragraph above: **the work itself goes unregistered**, and
no note is ever written for a sweep to find. When that is the case, what is missing is one level above
the project: an **Area** (`create-area`). Until it exists, the note goes to the inbox of the Area that
asked for the work, never to the root.

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
| **Mine** | Sweeps the inbox, reports the debt, classifies, routes, proposes and waits for approval. The writing is executed by `save-to-lore`. |

**The four buckets.** The discriminator is not the quality of the note: it is whether the note records
a **transformation** or only a **fact**.

| The note records | What it is | Destination |
|---|---|---|
| A friction **that was resolved** | experience | `save-to-lore` **capture** |
| A **task**, a pending item or an **open** friction — *"we need to add X"* | state | `FASES.md` |
| Someone else's criteria that **judges** | imported criteria | `save-to-lore` **transplant** (no defeats, no entry) |
| A summary, a quote, a link, a jotting | information | source for `create-area` / `create-project` / `transmute-lore`, or **reported noise** |

A fifth destination exists and is rarer: a note that changes **how we work together** (what gets read
first, what closes a deliverable) belongs in the instruction contract, not the Lore.

**Routing**, in order, stopping at the first that resolves: the note's `origen` → if the session runs
in a bot, its `lore/enrutamiento.md` → the project or area the session runs in → **ambiguous between
two bodies, ask**. The first time an ambiguity is resolved, the **border** may be worth a Clue; the
noise filter applies there too.

**Idempotency and lifecycle:** on close, every mined note gets its `destilado:` with date and
destination — including the ones that produced nothing (`nada` is a legitimate result). A note with a
non-empty `destilado` is skipped on later sweeps. **The skill never deletes a note:** mine before
deleting, and deleting is the human's call.

**Why a sweep and not an available command.** A note satisfies the urge to preserve without producing
criteria: once the record exists, the distillation does not happen and the criterion stays inert
inside it. Separating notes from Lore does not prevent that — it was already done, and the record
stayed inert for six weeks. What prevents it is the sweep and its visible debt, which `save-to-lore`
also reports on close.

Use `obsidian-lore` once you have notes piling up and want them to stop being only notes. It is not a
note manager: `Read` and `Grep` already read the vault.

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
- **Collision with pre-existing prose.** The rules above cover the markers, not the text around
  them. A contract older than the block usually already names the same paths in a load section, and
  stamping leaves two copies of the same pointers. The block is the one the skills re-stamp, so the
  stale copy is the hand-written section. Leave the pointers only inside the block and reduce that
  section to what the block does not carry — reported in the same threshold, never silently.

---

### 4.7 `golden-paths.md` (optional)

**Scope:** Project or Area (root level).

**Purpose:**

- Document the critical routes/flows that must be manually verified (e.g. key web routes in a
  frontend Area).

This is not part of the six-piece core: `create-area` and `create-project` only generate it
when the domain warrants it (e.g. a web Area with critical routes). If the domain doesn't need it,
it simply doesn't exist.

### 4.8 `assets/constitucion-puntero.md` — the pointer constitution (2.1.0)

**Scope:** shipped **with the kit**, not generated into your repository. It is a template you copy.

**Purpose:** let a repository governed by **spec-kit** coexist with Lore without either body of
criteria silently absorbing the other. spec-kit's constitution is authoritative over the *cycle*
(spec → plan → tasks → implement); Lore is authoritative over the *criteria* that constrains how any
of it gets built. The template makes that boundary explicit instead of leaving it to whoever writes
the next document.

**Why it is a pointer and not a copy.** A constitution that restates the Lore's rules becomes a second
source that drifts — and the drift is invisible, because both documents keep reading correctly on
their own. The template points at `lore/` for anything Lore owns, and states in writing that it does
not govern there.

**Its own rule, and it is the one people skip:** a clause of the *"this document supersedes all other
practices"* family is **revoked in writing, with its reason** — never merely deleted. An omission
leaves a hole that the next template regeneration fills back in. Arbitrating a governing document is
`save-to-lore` **transplant**, and it is the hardest case that mode has.

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

Lore’s behavior is governed by a set of shared invariants:

- **Lore is written in the user's language** – content and artifact filenames; only the selected
  contract name, `lore/`, `index.md`, `golden-paths.md`, and English terms of general technical use stay fixed.
- **Criteria are never invented** – all rules come from actual experience.
- **Everything comes from real work** – experiments, incidents, decisions.
- **Discarded noise is reported** – nothing is silently removed.
- **Every change passes through a threshold** – criteria must be reviewed before being written.
- **Nothing commits automatically** – human review is required.
- **A human always reviews the final diff** – AI assists, but does not silently change Lore.

These invariants distinguish Lore from generic note‑taking or logging tools:  
the goal is to maintain a trusted, human‑curated body of criteria that AI can rely on.

---

## 7. Relationship to README and Usage Docs

Lore’s documentation is typically split as follows:

- `README.md` – story, motivation, architecture overview, installation, and high‑level comparison with traditional docs.
- `USAGE_en.md` / `USAGE_es.md` – practical usage guides and workflows.
- `REFERENCE_en.md` / `REFERENCE_es.md` – this document, which defines the technical model.
- `MIGRATION_en.md` / `MIGRATION_es.md` – migration strategies and examples for legacy projects.
- `ENCRYPTION.md` – the optional, experimental encryption for a bot's criteria (English and Spanish).

All of these files live at the repository root (there is no `docs/` folder).

Keeping reference separate from usage and narrative docs makes it easier to:

- Look up specific skill behavior or artifact semantics.
- Keep the README focused and readable.
- Evolve usage patterns without breaking the underlying model.
