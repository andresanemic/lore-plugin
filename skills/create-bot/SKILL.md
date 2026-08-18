---
name: create-bot
description: Use when building a BOT — one place to open a session and work across several Areas or projects at once, with their criteria already loaded, instead of answering questions about them. Scaffolds a bot project with an always-loaded canon/, its project Lore, and (in `federar` mode) a routing table into Lore scattered across other Areas. Two modes — `nuevo` (canon from a brainstorm plus source docs) and `federar` (canon plus federated routing) — plus an audit pass for a bot that already exists, to fix its scope, README or sources. Scope comes from the registry of the institution the bot serves, never from the builder's folder tree. Sources with NO Lore go through create-area and transmute-lore first, never absorbed into the bot. Encryption and a minimal local launcher are optional and off by default. Trigger on "create a bot for X", "a bot that works on several projects", "federate these areas", "audit my bot", or "fix my bot's scope".
---

# create-bot — Build a bot: one place to work

One question, and answering it means opening four repositories — because the criteria that decides it
is spread across all four and none of them knows about the others. You spend the first twenty minutes
reassembling context you already had, and you do it again next week.

A bot is one place to open that session. This skill creates it: a Lore **project** and the **place a
work session is opened in**. A bot does
not answer questions about the projects — it **works in them**. The instruction goes in, the bot
executes it against real files, the result comes back. **Packaging is crystallization**, not a
plugin wrap: `transmute-lore` CRYSTALLIZE writes one Markdown; unpacking it rebuilds the folder,
including `lore-ecosistema/`. That is how the work travels to someone who does not have your tree.

> **The north, and the only test that matters:** *a short instruction is enough.* If the project
> had to be explained to the bot to get the result, criteria were missing from the load.

## What a bot is, and what it is not

`create-bot` is a sibling of `create-project`, not of `create-area`. **The standard path is
`bots/proyectos/{slug}/`** — `bots` is the area that hosts bots, the way a `web` area hosts
websites. If that area does not exist yet, `create-area` makes it first, exactly as for any other
project. Another area can host a bot when the user says so; do not assume it.

| | Area | Project | **Bot** |
|---|---|---|---|
| Holds | projects | one piece of work | **a work session** |
| Its Lore governs | the domain's method | that work | **how the agent behaves** |
| Opened to | see the registry | advance that work | **work on any of several projects** |

A bot is the only artifact in this kit that **routes outward**. Areas and projects are places; a
bot is a lens you carry into them.

> **A bot is a folder.** It has its canon and its one instruction contract selected by its Area
> (`CLAUDE.md` for Claude Code or `AGENTS.md` for Codex): open a session there and the criteria
> is already loaded, with nothing installed. Do not wrap it in a skill, a marketplace or its own
> plugin repository. To package it, crystallize it: unpacking rebuilds `lore-ecosistema/`.

> **Why it must not be an area.** An area is a container of projects and owns the criteria of its
> domain. A bot owns none of the criteria it routes to — it borrows it. Building it as an area
> creates a parent that accumulates criteria it never paid for, and the first consequence shows up
> fast: when a criterion generalizes, it gets promoted to the bot instead of to the area that
> earned it.

> **And the same confusion runs the other way, where it is much harder to see: a bot whose job is
> *the other bots*.** Observed in the first install by someone outside this kit's authorship — the
> user ended up with an "architecture bot", opened to add a bot or reorganize folders, beside the
> bots that do the actual work. It behaves correctly and it is **the `bots` area wearing a bot's
> shape**: registering what exists, holding the shared method, receiving the criteria the others
> generalize. That is a `FASES.md` and an area `lore/`, and none of it needs a canon or a routing
> table. **A bot administers no bots.** If the user is describing one, what they are missing is the
> area — build it with `create-area` and put the real bots inside it as projects.

## Two modes

| Mode | When | What it produces |
|---|---|---|
| **`nuevo`** | From zero. There is no prior Lore to gather. | Canon born from a brainstorm + source documents. |
| **`federar`** | The criteria already exists, dissolved across several areas. | Canon plus a routing table and live access to those Lore bodies; the synchronized copy is optional. |

Both produce the same artifact. `federar` adds `scripts/ecosistema.json`, `scripts/sync.js`, and
two generated files: `lore/enrutamiento.md` (the routing table) and `.claude/settings.local.json`
(the access to the live trees). It copies nothing unless the copy is turned on (§7).

### When the bot already exists

Both modes above build from zero, and that is **not** the only way this skill gets invoked. It also
gets pointed at a bot already in the tree — to fix its scope, rewrite its README, add a source. Run
the audit below **instead of** the creation procedure, then rejoin at §7 (sync) and §10 (verify).

| Check | How | Fails when |
|---|---|---|
| **Scope** | Contrast every entry of the manifest against the institution's registry | A source is routed that the registry does not list |
| **Borders** | Read the canon's out-of-scope declaration | A borderline project is missing, or is listed with no reason for the confusion |
| **Orphans** | `ls` the sync destination against the manifest — only if the copy is on | A folder survives whose source is no longer in the manifest |
| **Copy** | Ask who uses the bot and whether they have the tree | `lore-ecosistema/` is on for people who all share the folder tree — it is duplication with no reader |
| **README** | If one exists, read it as the audience, not as the author | It argues the method, or its examples are about projects the bot no longer serves |

The audit is not a lighter procedure. It finds what a fresh build cannot: **the drift between what
the bot was built to serve and what it serves now**, which is exactly what nobody re-derives on
their own.

### When a source has no Lore yet

The common starting point is **not** a tidy set of Lore bodies. It is raw material: folders of
documents, a codebase, a database, a Notion workspace — none of it distilled. That material cannot
be federated, and the fix is a chain, **not** a shortcut:

```
raw source (no Lore)
   └─ create-area        → the work area that will OWN this criteria
        └─ transmute-lore (add)  → recover the criteria already scattered inside it
             └─ create-bot (federar)  → the bot routes to it
```

> **The law: the bot never distills into itself.** A source without Lore gets its Lore **in the area
> that owns it**, and only then is federated. Letting the bot distill raw material directly makes it
> the owner of criteria it never earned — the precise failure the area/bot distinction exists to
> prevent, and it is irreversible in practice: once the only copy of that criteria lives in the bot,
> the area can no longer be its source of truth.

Concretely, in step 2 below, **inventory every source before designing anything**. The inventory
has two questions, and **ownership comes first**.

#### First question: does this belong to the institution?

> **The scope of a bot comes from the registry of the institution it serves, never from the folder
> tree of the machine it is being built on.**

Before asking whether a source has Lore, ask **whose it is**. Open the institution's own registry —
its `FASES.md`, its catalogue, its charter — and confirm the source is listed there. If it is not
listed, it does not enter the manifest.

*Why this is the first gate and not a later check:* the failure is silent. A manifest filled by
walking the builder's project tree produces a routing table that looks complete and internally
consistent while being wrong, and nobody re-derives it afterwards. Proximity on disk gets mistaken
for institutional membership once, and from then on it is inherited.

**A borderline source is declared, never merely omitted.** A project that shares people with the
institution, that appears in its public showcase, or that was the bot's own first use case will
look like it belongs. Put it in the canon as **explicitly out of scope, with the reason it gets
confused**. A border written with its reason holds; one that is only left out gets crossed again
the next time somebody looks at the folder tree.

#### The same question, one level up: which **areas** get federated

> **An area enters the manifest only if the institution has a project inside it — and it enters
> *together with that project*.**

The rule above filters projects. Areas need it too, and it is easy to miss because an area is
federated for its **method**, which feels like it arrives clean of whoever's projects live in it. It
does not. Criteria from outside gets in by two routes, and only the first is visible:

| Route | How it shows up |
|---|---|
| **Thematic contamination** — visible | a method distilled while looking at other institutions' projects arrives stained with them, and its principles name projects this bot declared out of scope |
| **A competing distillation** — invisible | the area carries a module summarizing a source **the bot's canon already distills**. Two summaries of the same original, inside the same bot |

The second is the dangerous one, and it is the boundary-of-validity law read one level up. The canon's
distillation names its source and writes its boundary; the copied one usually does neither and points
at originals that do not exist in the shared repository. **They do not compete as summary against
original — they compete as two summaries, and the winner is whichever sits closer to the lookup
index.** Nobody picks it, which is why nobody notices.

So, before federating an area: check whether it carries a distillation of a source the canon already
declares. **Two summaries of the same original in one bot is worse than none**, because the one that
wins is not the better one.

*Boundary of validity:* this governs bots that federate **by project**. A bot that federates a
**whole area** — several sibling projects, so you can read one while working in another — inverts it:
there the area is the scope, and the projects justify themselves by belonging to it. That is a
different legitimate shape, not an exception to fix.

#### Second question: what state is its Lore in?

| Source state | What to do |
|---|---|
| Has Lore, in an area | Federate it directly. |
| Has criteria but no Lore (a project born without it) | `transmute-lore` **add** on that project first. The criteria is **rescued, never invented**. |
| Raw material, no area owns it yet | `create-area` for the domain, then `transmute-lore` add, then federate. |
| Not text (a database, a spreadsheet, a Notion base) | **Extract to text first** — schema dump, export, `pdftotext -layout`. The extraction lands in that area's `fuente/`, **never** in the bot. `sync.js` only copies `.md`, `.txt` and `.json`, so anything unextracted is silently invisible to the bot. |
| **A document that arrives *after* the bot exists** — the user drops a PDF, a deck, a report into the bot's folder and says *«read this»* | The commonest question a bot's owner asks in week one, and the answer is the same law read forwards: the document belongs to the **area that owns its subject**, and lands in that area's `fuente/`. A bot may keep an **inbox in transit** for what has not been routed yet — never a `base de conocimiento/` that grows — and it is empty again once each document reaches its area. A folder in the bot that keeps documents is the bot becoming the owner of material it never distilled. |
| **A free-note inbox** (an Obsidian vault's `notas/`, a folder of Markdown) | **Never federated.** It holds no Lore — it is raw experience, and it is `.md`, which is exactly what makes the mistake easy: `sync.js` would copy it happily and the routing table would list notes as if they were criteria. Mine it with `obsidian-lore` first; what survives lands in the area that owns it, and the bot routes to *that*. |

Report this inventory to the user as part of the brainstorm, with the honest cost: each source
lacking Lore is a `create-area`/`transmute-lore` run **before** the bot can exist. Proposing to skip
it and "distill it all into the bot" is faster and produces an artifact that cannot be maintained.

## Precondition

The target area exists and its `lore/` has at least `identidad.md` + `principios.md`. If it does
not, **stop** and propose `create-area` first — a bot inherits the area's method just like any
project.

> **Say what that area is when you hand over: `bots` — one area, holding every bot as a project.**
> Not one area per bot, and never an area named after the bot being requested; its purpose belongs to
> the bot and gets written in §3. **This skill resumes when the area exists**, in the same session.
> Say that too, because `create-area` closes by pointing at `create-project` while the thing the user
> asked for is the bot — and a handover with no return is how *«three bots»* comes back as three
> areas, with every gate in this document intact and never reached.

> **Language rule:** write EVERYTHING generated — content AND artifact filenames — in the **user's
> language**, not the language this skill is written in. `identidad.md`, `principios.md`,
> `FASES.md`, `proyectos/`, `canon/`, `enrutamiento.md` are the Spanish canonical forms: localize
> them. Fixed in every language: the Area's selected contract name (`CLAUDE.md` or `AGENTS.md`),
> `lore/`, `index.md`, `canon/`, the `<!-- lore:always-on -->` marker pair (literal, never localized — localizing it breaks idempotent stamping silently).
> The area's established names win inside its tree; flag a clash, never resolve it silently. Do not
> generate `.claude-plugin/`, `.codex-plugin/` or `skills/{{BOT_SLUG}}/` — those names are leftovers
> of wrapping a bot as a plugin, which this skill does not do.

---

## The law this skill exists to enforce

A bot holds **three bodies of criteria with three different owners**. Merging them is the default
failure mode, and it is silent: everything still works, and the copy slowly starts outranking its
source.

| Body | What it is | Rule |
|---|---|---|
| `canon/` | criteria the bot **is** — loaded before every decision | distilled; lives next to the contract |
| `lore/` | criteria for **maintaining** the bot | the project's own, like any project |
| **borrowed criteria** | every other project's Lore | reached **by pointer**, at its own address; **never authoritative** |

Three names because three owners. The test that keeps them apart:

> **Would the source be discardable?** Distilling produces something smaller that can *replace* its
> origin. Copying produces something identical that **cannot**.

**Borrowed criteria is reached by pointer, not by copy.** The routing table gives the address, the
generated access opens it, and that Lore keeps one owner and one version — the same DRY rule the
rest of the kit runs on, where a project references its area's modules instead of duplicating them.
`lore-ecosistema/` (§7) turns those pointers into a copy for one situation only, and is off by
default.

And the law that makes routing work:

> **Route by type of task, not by name of project.**

**One entity can own several bodies of criteria whose own principles forbid crossing them.** The
common split is *what it does* versus *how it tells it* — product against communications — and it
holds whether the entity is a single project or the institution the bot serves. Naming it does not
select a Lore: the institution appears twice in the routing table, on purpose. If a task is
ambiguous between two, **ask** — it is cheaper than six paragraphs written against the wrong
criteria.

**Do not look for the border to be missing — it almost never is.** It is written **half-way, and
the written half looks complete**: the side that depends more on the other gives it a whole section,
well argued, while the other side gets a single line. Look for an absence and you find that good
half and conclude there is nothing left to distill — skipping the one canon module the bot had
earned.

> **The test is not *«is the border written?»* but *«does either side say what to do when the task
> belongs to both?»***

That question does not exist from inside either body, so neither one answers it — and that answer is
the module: the **arbitration**, not the description. Which order the steps go in, which direction
is read and which is written, and what happens when the fact does not exist yet.

**The test returns one of three states, and the third is the one nobody plans for:**

| State | What you found | What the module says |
|---|---|---|
| **Nobody wrote it** | neither side mentions the other | the arbitration, written from scratch |
| **One side wrote it** | the side that depends more gave it a section; the other, a line | the arbitration, completing the half that is missing |
| **Both wrote it and they disagree** | the same fact stated two ways | which one is cited, **and why** |

For the third state, the rule you would reach for by default — *product fixes the facts,
communications tells them* — **produces false claims**, because the side that outranks by hierarchy
is often the one that is wrong. **The corrected side wins, not the nominal owner of the fact**, and
the date and reason for the correction go beside it: that is the only thing distinguishing a
correction from a plain disagreement.

**An arbitration of the third kind lives to be closed** — once the source is fixed, the section is
deleted. But there is a fourth ending the module has to be able to write: the human looks at the
divergence, understands the risk and **decides to keep it**. Record per divergence whether it is
still open **by omission or by decision, with its date**. The arbitration of *reading* does not
change — the corrected side is still the one cited — but the **proposal to correct** is switched off
in writing: *«do not propose this again»*. A bot that repeats a proposal already rejected spends the
credibility it needs for the ones that matter. Never switch a proposal off on the bot's own
authority: that call belongs to the human and is written down with its date.

> Write this section from the entity the bot actually serves. The routing table is the piece a
> reader checks against their own case, and an example carried over from another bot sends them to
> the wrong Lore while looking authoritative.

---

## Procedure

### 1. Ask the user — three questions, in plain language

> **Speak plainly.** This document is dense because it instructs a model. **The conversation with
> the user is not.** While using this skill, do not say *canon*, *federate*, *distill*, *boundary of
> validity*, *invariant clue*, *anti-scope* or *Entre*. Say what they mean: *what the bot always
> knows*, *hook it up to*, *the criteria worth keeping*, *where this stops being true*, *a rule*,
> *what it is not for*. If a sentence needs a glossary, rewrite the sentence.

Ask **one at a time**, and take the answers in the user's own words:

1. **¿Cómo se va a llamar el bot?**
2. **¿Para qué lo vas a usar?** — free text. Do not tidy it up; it is re-read later to check that a
   task matches what was declared.
3. **¿Dónde están las carpetas con la información que le va a servir?** — ask for **paths**.
   Folders, databases, document dumps, notes. Accept "no sé todavía" and continue: a bot can be
   created with one source and grow.

Everything else is derived from those three, or read from disk. Do not interrogate the user for it:

| Derived | From |
|---|---|
| `{{BOT_SLUG}}` | the name, in kebab-case |
| `{{BOT_TITLE}}` | the name as given |
| `{{AREA_PATH}}` | the `bots` area by default — propose it, confirm in one line |
| `{{CONTRACT_FILE}}` | inherited from that Area's one contract: `CLAUDE.md` or `AGENTS.md` |
| `{{MODE}}` | `federar` if there are existing sources, `nuevo` if there are none |
| `{{PURPOSE}}` | answer 2, verbatim |
| `{{SOURCE_DOCS}}` / `{{ECOSYSTEM}}` | answer 3, after inspecting each path on disk |
| `{{REGISTRO}}` | how technical the kit speaks here — `tecnico` / `equilibrado` (default) / `llano`. **Inferred from how the three answers were written, never asked**, which is the same law that already forbids asking for tone. Declare the pick in one line and offer the correction in the same breath. It calibrates how much ground surrounds a rule and **never the rules themselves** |

Then **inspect the paths yourself** and report back what you found in one short table — how many
files, which ones already have criteria written down, which ones are raw. That report is what turns
answer 3 into the inventory of step 2. Never ask the user to classify their own folders.

### 2. Read context (MANDATORY before creating anything)

1. The area Lore: `identidad.md` + `principios.md` (+ `index.md` and thematic modules).
2. The area `FASES.md`, and any sibling bot already registered there.
3. **The source documents.** For a PDF, extract text (`pdftotext -layout`). The canon is distilled
   from these — never from the model's own knowledge of the topic.
4. **`federar` only — inventory the sources first** (see the table above). Classify every intended
   source by whether it already has Lore, and surface the ones that need `create-area` /
   `transmute-lore` before the bot can federate them. Do this **before** the brainstorm: it changes
   what the bot can route to on day one.
5. **`federar` only:** read each Lore body you intend to route to. You need its **purpose** and
   its **anti-scope** — the anti-scope is what tells you where the boundary between two siblings
   runs, and the boundary is the only thing here that is genuinely distillable.

### 3. Canon brainstorm (threshold)

Invoke Lore Plugin's own `brainstorming-lore` skill (`lore:brainstorming-lore` where skills are namespaced).
**Create no file before the design is approved.** Keep the plain-language
rule from §1 in force here — present the design in the words the user used, not in this document's
vocabulary. Agree on:

- **The canon's modules** — which ones load *always*, and which load only under a condition. Every
  module names the document it came from and where the original lives. Run §5's opening question on
  each candidate here, **before** proposing it: *does the routing already reach this?* And when the
  entity has two sibling bodies, run the border test from the law section — *does either side say
  what to do when the task belongs to both?*
- **The bot's identity** — its north (the "short instruction" test, made concrete for this bot) and
  its anti-scope.
- **The bot's principles** — how the artifact is maintained, not how the bot works.
- **`federar`:** the routing map — task type → which Lore governs.
- **Optional and OFF by default:** encryption (§8) and a minimal local launcher (§9). Ask both;
  assume neither. Do not offer packaging as a plugin. **Packaging is crystallization:** the
  snapshot's extract is what writes `lore-ecosistema/` for someone who does not have your folders.

### 4. Create the structure

```bash
DEST="{{AREA_PATH}}/proyectos/{{BOT_SLUG}}"
mkdir -p "$DEST/canon" "$DEST/lore"
```

```
{{AREA_PATH}}/proyectos/{{BOT_SLUG}}/
  canon/*.md             → criteria the bot always loads (§5)
  lore/
    identidad.md · principios.md · index.md
    enrutamiento.md      → federar only; GENERATED, never hand-edited
  scripts/
    ecosistema.json      → federar only
    sync.js              → federar only
    canon.js             → encryption only
  .claude/
    settings.local.json  → federar only; GENERATED; local, never committed
  lore-ecosistema/       → ONLY if the copy is on (§7); the synchronized copy
  FASES.md · travesia.html · {{CONTRACT_FILE}} · .gitignore
```

If the area starter has `travesia.html`, **copy it** and resolve `{{TOKENS}}`. Point its art at
`../../_starter/assets/`. `FASES.md` is state; `travesia.html` is the map of a large campaign.
A project in an area without a bot uses the same file — this is not a bot extra.

The bot's behaviour (§6) lives once in `{{CONTRACT_FILE}}`. The selected host loads it directly.
Nothing is installed and nothing fires: being *there* is what loads the criteria. Do not create the
other provider's contract by default. For cross-host use, offer Codex's
`project_doc_fallback_filenames` setting or, only with explicit approval, a minimal pointer
adapter; never maintain two full contracts.

**Do not wrap the bot as a plugin.** No `.claude-plugin/`, no `.codex-plugin/`, no
`skills/{{BOT_SLUG}}/`, no `scripts/validar.js`. Packaging is crystallization: unpacking the
snapshot rebuilds `lore-ecosistema/`.

**`README.md` is not in the base shape.** Everything a README would say is already said — to the
agent that opens the session — by the selected contract sitting next to it. If the user wants one
anyway, keep it to what the bot is for, how a session is opened in it and how the manifest is
re-synced. **Never a second copy of the behaviour** — a duplicated rule drifts, and the copy that
drifts is the one nobody rereads.

### 5. Write the canon

**Before writing a module, ask: *does the routing already reach this?*** If a pointer gets there,
the pointer goes — the canon is for what **no pointer reaches**, not for what matters most. Those
two are not the same thing, and confusing them is the easiest mistake in this whole procedure: the
canon feels like "what the bot is", which invites filling it with the important stuff.

**Summarizing in the canon something the routing already reaches produces two distillations of the
same original inside the same bot**, and the one that wins is the one nearer the index of
consultation — §2's competing-distillation failure, one level down. With the live tree on the same
machine it gets *easier* to commit, not harder: everything is at hand, so everything looks like a
candidate.

What earns a module:

| Enters the canon | Why no pointer reaches it |
|---|---|
| An **external or sealed source** | it is not in the tree — a corpus, a standard, a document under seal |
| The **map** of the sources | what each one is and where its work lives; no single Lore contains the set |
| The **border** | what is *not* the bot's business, with the reason it gets confused |
| The **arbitration** between two sibling bodies of one institution | neither writes it whole (see the law section above) |

An arbitration module runs the three-state test from the law section, and for every divergence it
records whether it is still open **by omission or by decision, with its date**. Written without that,
the module proposes the same correction in the next task, and in the next.

**A minimal canon is not a half-built bot** when everything it needs is next door. A canon that
repeats the tree **is** a broken bot, and it breaks silently. The canon grows when the ecosystem
gets *farther away* — a teammate without the tree — not when it gets bigger.

One file per body of criteria, in `canon/`. Each one
opens by declaring **which document it was distilled from and where the original lives**, and closes
with its **boundary of validity** — where it stops applying.

> **Distill from the source, never from another distillation.** When the source changes, go back
> **to the source**; do not patch the summary. A distillation of a distillation loses its boundary
> at every step and nobody can audit where the claim came from.

Mark conditional modules **OPTIONAL** in their own heading, and state the condition in the load
table (§6.1). A canon that always loads everything stops being a canon and becomes a preamble.

### 6. Write the bot — its `{{CONTRACT_FILE}}`

This is the deliverable. The shape below is **shape, not literal text**: it is written from the
brainstorm, in the user's language. It goes in the bot's selected contract and there is no
frontmatter to write — the file loads because the session opens in that folder.

**The bot's contract carries the always-on block** (bot variant), delimited by
`<!-- lore:always-on -->` / `<!-- /lore:always-on -->`. It points at `canon/` and at
`lore/enrutamiento.md` — **the routing table, never the federated Lores one by one.** That is the
whole reason a bot that reaches a dozen bodies of criteria still fits under the 25-line ceiling: the
block delegates to the table, which is what the table is for. Listing the federated sources inside
the block puts the routing table's job in two places, and the copy is the one that goes stale.
Putting `lore/identidad.md` in the block *instead of* `canon/` is the same failure: the session
loads how the bot is maintained and not what the bot is.

If the host area already has a `_starter/`, read it. That starter is the **floor**, not the
deliverable — this section still writes the full contract. The generated always-on must carry the
same three pointers as the bot-variant starter (`canon/`, `enrutamiento.md`, `FASES.md`). If the
starter is still the project variant (identidad / principios / index in the block, no `canon/`),
**rewrite the starter to the bot variant** before writing this bot: a `bots` area that stamps
projects as if they were ordinary area-projects is how the next bot is born below the floor.

Rules, ceiling and the idempotency table are in `use-lore`. This is stamped inside the threshold
this skill already has, never as a pass afterwards. Shape, in the user's language — the markers
themselves never localize:

```markdown
<!-- lore:always-on -->
## The criteria this bot carries
- `canon/` — what the bot **is**. Loaded before the first decision, always.
- `lore/enrutamiento.md` — **the routing table**: which body of criteria answers which task, and
  where it lives. Consulted there, never from memory.
- `FASES.md` — state, outside `lore/`. It advances; the criteria persists.

> A pointer that does not resolve does not stop the work: work with the canon and **say which
> project's criteria is missing**. A missing canon does stop it.

> **Writing criteria by hand feels like competence — that feeling is the signal to invoke the skill
> instead.** `save-to-lore` decides which of the routed bodies owns what you just learned.
<!-- /lore:always-on -->
```

Thirteen lines under a ceiling of twenty-five, and it stays there whether the bot federates two
bodies of criteria or twenty — because what grows is the table, not the block.

#### 6.0 First use — a brainstorm, not a form (threshold)

If `.{{BOT_SLUG}}.json` does not exist at the working directory root, this runs **before anything
else**. And it is not a questionnaire: this whole kit **brainstorms to build** every artifact it
makes, so the artifact that comes out of it does not greet its first user with four fields to fill.

> **Invoke Lore Plugin's own `brainstorming-lore` skill** (`lore:brainstorming-lore` where skills are
> namespaced) and run this through it. If the runtime failed to expose an installed Lore skill,
> run the minimal version below yourself. A bot that cannot start without a third-party
> skill is a bot that does not start.

##### Move 1 — show what you reach, before asking anything

Resolve the pointers and put the result on screen: each federated body with whether it resolves **on
this machine**, what the canon distills, and what is declared out of scope. Short lines, no prose.

This is the presentation **and** the pre-flight at once. A broken pointer shows up here, in front of
the person who can fix it, instead of surfacing three tasks later as an answer that quietly left a
body of criteria out.

Close the move with the coverage, never with a clean bill of health:

> **What is verified is that the criteria is reachable — never that it is correct, and never that
> the project is in good shape.** Say the first; the other two are not yours to say.

##### Move 2 — brainstorm, one question at a time

Follow the thread of the answers instead of walking a list. Two rules govern the whole move:

**No closed options for anything that decides behaviour.** A closed list has no default for the
answer that names two of its items, and an absent default gets filled in by the nearest match while
the discarded half leaves no trace. Ask by the **condition** — *«does your work fall into more than
one of these?»* — and if the answer names more than one body of criteria, **open by all of them**
and put the border question first, before executing anything. Fields that are satisfied by being
stored (a name, a purpose) are a different thing from fields that **pick a branch**; only the second
kind needs this care, and confusing the two is how the mixed answer gets lost.

**Ask only what changes behaviour.** What the bot will be used for, in the user's own words, and it
is stored verbatim because it gets re-read at the start of every task. Which bodies of criteria the
work touches. Anything the user says is out of bounds. The condition gating each OPTIONAL canon
module. **Tone and a nickname are not asked here**: they are inferred from how the person writes and
corrected in one sentence whenever they want, and spending the first two turns of the artifact on
them buys nothing.

##### Move 3 — close by separating configuration from criteria

What is configuration goes to `.{{BOT_SLUG}}.json`, verbatim and uninterpreted:

```json
{ "proposito": "…user's own words…", "cuerpos": ["…", "…"], "fuera": ["…"],
  "entrega": "…", "tono": "directo", "estreno": null }
```

What turned out to be **criteria** does not go in that file. A brainstorm about a project surfaces
things that are true about the project rather than about the bot, and those belong to **the Lore of
whoever paid for them with experience** — proposed there, with the usual gate, never written into
the bot. That is §6.4 arriving early, and it is the law this whole skill is built on: a bot does not
invent criteria, and it does not keep what is not its own.

**`"estreno"` stays `null`, and that is the point.** Configuration is not the first use: this gate is
answered exactly the same with an empty canon, a stale routing table and broken paths, so none of the
failure modes the bot exists to prevent can show up in it. What the gate proves is that the gate
works. The field is filled in when **an instruction that does not name the criteria produces a
deliverable** — and it stores that instruction **verbatim**, because a paraphrase can no longer be
judged for whether it was short.

Close by proposing the first real task, derived from what was just said. Not *«you are all set»* —
the artifact finishes its configuration **working**.

#### 6.1 Load the canon

A table of file → what it governs → when. Always before the first decision.

If `canon/` is missing but `canon.enc` exists, the canon is encrypted and not yet unlocked: **say
so and stop.** Never suggest the passphrase be pasted into the chat.

A pointer that does not resolve — the tree is not on this machine, or the copy is absent — does
**not** stop the work: the bot works with the canon and **declares it is working without that
project's criteria**. Missing canon does stop it.

#### 6.2 Route before executing

Point at `lore/enrutamiento.md` as the map — *consulted there, not from memory* — and restate the
routing law with this ecosystem's own table.

**With the copy on, precedence is checked per row, at the moment of reading:** if the live source
resolves on **this** machine, read it there and **do not open the copy** — reading both is the
duplication the table exists to prevent, and the copy is the one that is out of date. The copy opens
only when that check fails, and the bot then says it is reading a photograph, with its date. Never
decide this from memory or from what the table looked like elsewhere: it was generated on the
machine that ran `sync.js`. As a teammate acquires the real folders, their rows stop reading from the
copy on their own — the copy deactivates itself, row by row, without anyone editing anything.

#### 6.3 Execute

Fidelity over capacity: institutional criteria beats the model's and the conversation's. Cite the
file a rule came from — without the citation the behavior is not reconstructible. `git push` only
when the user asks.

Give the bot an explicit **conflict block** for when an instruction collides with the canon:
declare it, offer the trade-off, and **wait**. Once a human approves, execute in full and do not
re-litigate.

**And give it the rule for the report that finds nothing.** A bot that points at borrowed criteria
inherits its coverage **and its silence**: the Lore records what somebody paid for, and what nobody
paid for is not written down — so its absence from the corpus is indistinguishable from its absence
from the work. The gap is not the problem; every distilled experience has one. The problem is that
*«I found no violations»* and *«this is fine»* are written almost the same way, and the second is the
one that gets remembered. The authority of the routed criteria transfers whole to a conclusion that
criteria never supported, and the bot sounds most confident exactly where it knows least. A green
mechanical gate makes it worse: it looks like a measurement and it is a checklist.

> **Every negative finding is written with its coverage in the same sentence.** *«None of the laws I
> carry are broken»*, *«it does not hit any of the five patterns that cost a session in X»* — never
> *«it is fine»* or *«there is nothing to fix»*. In a separate paragraph the boundary gets dropped
> the moment anyone summarizes.

When the request came from something the user **felt** and the loaded criteria has no way to measure
it, say so without being asked. That is the boundary-of-validity law applied to the case where the
boundary is *what the bot cannot see*. It follows from the rule that the bot never invents criteria:
for the same reason, it cannot certify what no criteria of its own covers.

*This governs **negative** reports.* A positive finding stands on its own — the clue behind it is
written and can be cited. And it does not apply to a bot that **measures** instead of checking: a
measurement has its own margin of error, which is a different problem and is declared differently.

#### 6.4 Close: always propose criteria

**Every task ends with a distillation proposal.** Not optional, and it does not wait to be asked —
it is half the bot's job.

1. **Noise filter.** If it does not constrain a future decision, it does not enter — and it is
   **reported as discarded**, not dropped in silence.
2. **Destination**, by the same routing table: the bot's own friction → this project's `lore/`; a
   project's friction → that project's Lore, in the area matching the **task type**; confirmed
   cross-cutting criteria → the **area** that owns it. **The write lands on the live source, never
   on `lore-ecosistema/`** — the copy is regenerated and pruned by the next `sync.js`, so criteria
   written there disappears with no error at all. If the live tree is not reachable from where the
   bot runs, hand over the text and name its destination instead of writing it where it will be lost.
3. **Form:** Invariant Clue — Context → Root cause → Clue, with its boundary of validity.
4. **Delegate the writing** to `save-to-lore` when the Lore plugin is installed. The bot
   contributes the **routing**, which is what `save-to-lore` does not know.
5. **A proposal, never an automatic write.** The human approves.

Nothing to distill is a normal outcome, not a failure. Say it in one line.

### 7. `federar` mode — manifest, routing table, access

Copy `plantillas/ecosistema.json` and fill it from the brainstorm; copy `plantillas/sync.js`
unchanged. Then:

```bash
node scripts/sync.js --self-test  # verifies the prune classifier; touches no files
node scripts/sync.js --revisar    # dry run: reports what is missing and what would change
node scripts/sync.js              # generates lore/enrutamiento.md + .claude/settings.local.json
```

> **Federating is pointing, not copying.** Each row of the manifest is an **address**: the routing
> table says which Lore governs a task, and the generated access lets the session reach it where it
> lives. That criteria keeps one owner and one version — the same DRY rule the whole kit runs on. A
> new project created from the bot is born in the area that owns it, inheriting that area's Lore by
> relative path, exactly as `create-project` does. Nothing is duplicated into the bot.

#### The ecosystem copy — written by crystallization, not sold as a create-bot extra

**Packaging is crystallization.** `transmute-lore` CRYSTALLIZE packs the routed tree; extract
rebuilds `lore-ecosistema/` so the unpacked routing table resolves for someone who does not have
your folders. Do not wrap the bot as a plugin to get that copy.

`"copia": true` in the manifest is the flag extract already reads — it answers **one** question,
which is about people rather than tooling: *«¿los que van a usar el bot tienen tus carpetas, o solo
el bot?»*

| They have the tree | They only have the bot |
|---|---|
| Pointers resolve. **No copy.** The bot reads each Lore at its own address and can work on the files. | Pointers resolve to nothing. The copy is the only way that criteria exists on their machine. |

Leave it off when in doubt. A bot for one person, or for a team that shares the folder tree, is
complete without it — and turning it on buys two silent failure modes (orphans, and duplicates when
`incluir` changes) plus three guardrails to maintain forever. Turning it on for a teammate who
cannot reach the tree buys them a bot that carries criteria but cannot edit their files: it can
write **new** text with the right criteria, which is real work, and not much more.

With the copy on, everything below applies. With it off, `sync.js` neither copies nor prunes.

> **Turning the copy off is two steps** — `"copia": false` **and** deleting `lore-ecosistema/`.
> Doing only the first leaves a frozen photograph nobody updates and the bot keeps reading, now
> without even a fresh timestamp to give away its age. It is the same silent pair as the encryption
> `.gitignore` and as removing a source. `sync.js` warns instead of deleting: that folder is
> criteria, and deleting criteria unasked is worse than the orphan.

- **Before adding an area, run the two checks from §2:** does the institution have a project inside
  it (if not, it does not enter), and does it carry a module distilling a source the canon already
  declares (if so, one of the two goes — two summaries of the same original inside one bot is worse
  than none, because the winner is the one nearest the lookup index, not the better one).
- **An area is federated the way it is opened: `lore` **plus** its selected contract and its `FASES.md`.**
  Federating `<area>/lore` alone is the asymmetry to avoid, and it is invisible from inside: the
  area's **laws** live in the Lore, but the **sequence of work** — what is read first, which skill
  closes a deliverable, what is checked before starting — lives in its `CLAUDE.md` or `AGENTS.md`, and the
  **registry of what exists and where** lives in its `FASES.md`, including projects adopted by path,
  which are recorded nowhere else. A bot federating only `lore/` cites every rule correctly and
  still works differently from the area it borrowed them from. Name the area's actual contract in
  `incluir`; never
  federate an area's whole tree, which would drag in every project it holds.
- **The manifest is the single source of the routing table.** Keeping them as two artifacts
  guarantees they drift, and a drifted routing table sends the bot to the wrong Lore without
  warning. Therefore **`enrutamiento.md` is never hand-edited.**
- **The manifest also opens the door to the live trees.** A bot **works in** the projects, and a
  session only reaches the folder it was opened in — so criteria alone leaves it able to cite
  correctly and unable to edit anything, which is answering questions, exactly what a bot is not.
  `sync.js` writes `permissions.additionalDirectories` into `.claude/settings.local.json`. **The
  paths are written once, in the manifest**; hand-copying them into a settings file guarantees the
  two drift, and the stale one fails without saying why. The file is local and gitignored, like
  `raiz`: those paths exist on one machine.
- **Access is declared per source, with `"trabajo": true`, never inferred from the row.** The
  question to ask is the **condition**, not the kind of row: ***«does any project in this folder fall
  outside the scope?»*** When the answer is yes — the ordinary case for an area — access stays off,
  because an area's folder holds *all* of its projects, including the ones the registry excluded
  (see the scope gate), and granting `origen` would reopen through the access door exactly what the scope closed.
  **When the answer is no, the premise is false and the conclusion is not inherited:** a bot
  federating a whole area leaves no project out, so **the area carries working access**, and the
  reason is written beside its row in the manifest, where whoever wonders why that row disobeys the
  rule will actually read it. Without it the bot cannot reach the `lore/` it routes to, nor the gates
  the area requires, nor its scaffold, and it cannot **write** into the live source what it proposes:
  it cites correctly and executes nothing, which is the definition of what a bot is not.

  > *Why the rule is stated by its condition and not by the category:* «only for projects» was a
  > shorthand for the condition, and nobody remembers that it was one. A rule named after the
  > category fails precisely in the rare case — which is the case the boundary of validity had
  > already named.
- **Sync runs one way only:** local tree → `lore-ecosistema/`. Never back. The live source of each
  Lore is its own project; the repo copy is a photograph with a visible date.
- Run `--revisar` first and report missing sources instead of silently producing a partial copy.
- **The manifest is also the single source of what gets deleted.** Removing a source used to be two
  steps that nothing tied together — delete it from `ecosistema.json`, and delete its folder — and
  doing only the first left an orphan copy the bot kept reading, now with no routing row to explain
  it. `sync.js` closes the second step itself. Because that path deletes, its classifier ships with
  `--self-test`; run it after touching the script.

### 8. Encryption — OPTIONAL, off by default, **EXPERIMENTAL**

Ask. If declined, **skip this entire section**: the bot is fully functional without it, and this is
the expected state for a bot that already lives in a private repository.

> **Experimental status — say it out loud when offering it.** The template passes its self-test
> (round-trip, wrong passphrase, GCM tampering, no plaintext leak), but it has **not** been audited,
> has no key rotation, no revocation, and no answer for a passphrase that leaks. It is a seal for a
> repository shared among people who already trust each other — not a security control to put
> between an adversary and something that matters. Offer it as what it is.

If accepted, copy `plantillas/canon.js` and resolve `{{BOT_SLUG}}`. In `nuevo` mode delete the
`ecosistema` entry from `CARGAS` — the usage text derives from those keys and adjusts itself.

```bash
node scripts/canon.js --self-test   # round-trip, wrong passphrase, tampering, plaintext leak
```

> **The law: encrypt in distribution, never at consultation.** Payloads travel encrypted and are
> decrypted **once** on clone; at rest they are plain Markdown. Encrypting at the point of
> consultation does not forbid reading — it makes reading **expensive**, and what is expensive
> stops being consulted. That is the artifact dying of access cost.

**The `.gitignore` follows from the choice, and getting it backwards is silent and severe:**

| Encryption | `.gitignore` | Why |
|---|---|---|
| **on** | ignore `canon/`, `lore-ecosistema/` (if the copy is on), `.{{BOT_SLUG}}.json` | only the `.enc` files travel |
| **off** | ignore only `.{{BOT_SLUG}}.json` | the criteria **must** be committed, or the repo carries no criteria and the bot is useless to the team |

`.claude/settings.local.json` is gitignored either way: it holds absolute paths of one machine.

If encryption is off, say plainly that the repository must be private — that is now the only thing
protecting the criteria.

Two things the README must state, whichever way it goes:

- It protects the repository and the transport. It does **not** protect against someone who holds
  the passphrase — a shared passphrase defends against a leak, not against a teammate.
- It does **not** cover what an AI tool does with the text once loaded into its context. This is a
  declared boundary, not a solved problem, and it is never papered over with language suggesting
  otherwise.

> **Credit, and status.** The question — *what protects a Lore that has to be shared?* — was opened
> by **Mantra**, by LonelyAchemist, which encrypted the Lore **at rest**. This template is the
> inverted answer, for the reason above. The idea is theirs; the decision is not, and neither is the
> code: Mantra's own SDK is not used here. **The whole line is experimental** — it is offered,
> labelled, and never presented as a hardened guarantee.

### 9. Local launcher — OPTIONAL, off by default

Ask whether the user wants a small local menu that opens this bot and other Lore-governed folders
in Claude Code CLI or Codex CLI. If declined, skip. If accepted, create the **minimum launcher
locally**: an editable JSON registry plus a script that selects folder, provider and a model
belonging to that provider, and passes `--model` to the selected native CLI. Test every configured
path and both CLI commands. Do not create a second memory store: the launched folder's Lore remains
the source of criterion.

When the selected folder is a federated bot, derive every Codex `--add-dir` argument from the same
`scripts/ecosistema.json` entries marked `"trabajo": true`. Loading the contract is not enough if
the routed repositories are outside the primary workspace; the agent must be able to write where
the manifest says it works. Never maintain a second path list in the launcher.

The launcher is provider-neutral. Do not use a Claude-, Codex- or other provider mascot as its
identity. Any theme is optional and needs separate approval for every target environment.

### 10. Verify and report

```bash
grep -rn '{{[A-Z_]\+}}' "$DEST" && echo "UNRESOLVED TOKENS" || echo "OK no tokens"
node scripts/canon.js --self-test        # if encryption is on
node scripts/sync.js --self-test         # if federar
node scripts/sync.js --revisar           # if federar
git -C "$DEST" status --short            # confirm .gitignore matches the encryption choice
```

Then check the two things a script cannot:

- **Scope.** Every manifest entry appears in the institution's registry, and every borderline
  project the registry excludes is declared out of scope in the canon, with its reason.
- Every `index.md` link resolves; area links resolve outside the project.
- **Floor on the contract just written.** One always-on block, bot variant: `canon/`,
  `lore/enrutamiento.md`, `FASES.md`. No federated Lore listed one by one. No `HARD-GATE` in
  present tense. No `.claude-plugin/`, `.codex-plugin/` or `skills/{{BOT_SLUG}}/` wrap. Packaging
  named in the contract is crystallization. Ceiling 25 lines, markers included.
- **Report what was not verified.** If actual loading in Claude Code or Codex could not be tested,
  say so rather than implying it was checked.
- Register the bot in the **area's** `FASES.md` (path + status + phase).

### 11. The premiere — the bot is not finished when the gate is written

Writing §6.0 is the last thing this skill touches, and **it is not the moment the bot can be known to
work**. That gate is answered identically with an empty canon, a desynchronized routing table and
broken paths: not one of the failure modes the bot exists to prevent is able to appear there.
Configuration is the interaction with the **most ceremony** — a gate, questions in order, a file
written — so it feels like the opening night, and the builder registers it as one. It is not. What
the gate proves is that the gate works.

The bot's acceptance criterion is *a short instruction is enough*, so that is what has to be run:

0. **Open the bot the way its user will open it, and confirm the session reaches the manifest's
   paths.** This is not the same as the bot being correct on disk, and it is where the first
   third-party install actually broke: the host was pointed at the folder it defaulted to instead of
   the tree the bot federates, so the routing resolved to nothing and the failure surfaced as the bot
   *«reading the wrong Lore»* — a symptom that names the criteria and never the access. Each host
   grants that reach its own way (a Claude Code session opened in the bot plus
   `.claude/settings.local.json`; a Codex project whose folder is the **mother** of the federated
   tree, never the bot's own folder; `--add-dir` for the CLI). Verify by **opening it**, not by
   reading the settings file. And write the answer into the bot's README or contract, because the
   person who has to redo it after a reinstall is the one who was not there when it was solved.

1. **The builder picks a test instruction** that **does not name the body of criteria, does not
   explain the institution and does not say where anything is** — one real task, of the kind the bot
   was built for.
2. Run it. Observe whether the bot routed **on its own**, whether it declared the border before
   executing, and whether it produced a deliverable.
3. **Record the instruction verbatim** in the area's `FASES.md`, next to what the bot did with it. A
   paraphrase can no longer be judged for whether it was short, and the instruction *is* the evidence.
4. Fill `"estreno"` in `.{{BOT_SLUG}}.json` with that instruction and its date.

Configuration gets registered as what it is: configuration. Until the premiere runs, the bot is
tested as a form and not as a lens — report it that way rather than as a finished artifact.

*This applies to bots with a first-use gate*, which is every bot this skill builds. And it does not
say the configuration is superfluous: it says the configuration is not evidence of the north.

## Invariants

- **Speak plainly to the user.** The vocabulary of this document is for the model. A user who has to
  learn a glossary before answering a question was asked the question badly.
- **Generate only what this bot uses.** No `lore-ecosistema/` in `nuevo` mode, no empty canon
  module "for later". An empty folder is a promise the artifact does not keep, and someone
  maintains it anyway.
- **Federating is pointing, not copying.** Lore is DRY everywhere in this kit — a project references
  its area's modules by relative path instead of duplicating them — and a bot is no exception: the
  routing table holds addresses and the generated access reaches them. `lore-ecosistema/` is the one
  deliberate copy, **off by default**, and it exists for a single situation: a teammate whose machine
  has no source tree, where a pointer resolves to nothing. When it is on, the price is three
  guardrails, and removing any one turns the copy into a second source of truth: **one direction
  only**, **a visible timestamp**, and **never summarize**.
- **The bot never distills into itself.** A source with no Lore gets its Lore in the area that owns
  it (`create-area` → `transmute-lore` add) and is federated afterwards — never absorbed directly.
- **The bot lives at `bots/proyectos/{slug}/` by default.** `lore/` at its root; `FASES.md`
  **outside** `lore/`. Another area only when the user says so.
- **Three bodies, three owners, never merged.** `canon/` is distilled; `lore/` maintains the bot;
  borrowed criteria is reached by pointer and is never authoritative — nor is `lore-ecosistema/`,
  when the copy is on.
- **The canon is distilled from the source**, never from another distillation or from the model's
  own knowledge. Each module names its origin and its boundary of validity.
- **The canon is for what the routing does not reach.** If a pointer gets there, the pointer goes.
  Important and unreachable are not the same thing, and a canon that repeats the tree is a broken
  bot that breaks silently. A minimal canon is not a half-built bot when the ecosystem is next door.
- **Route by type of task, not by name of project.** Ambiguity between two Lore bodies ⇒ ask. And
  the border between two sibling bodies is not missing, it is **half-written**: the test is whether
  either side says what to do when the task belongs to both, never whether the border exists. It
  returns **three** states — nobody wrote it, one side did, or both did and they disagree — and in
  the third **the corrected side wins, not the nominal owner of the fact**. A divergence can stay
  open **by decision**: record it with its date and switch the correction proposal off, or the bot
  repeats it every session.
- **The first use is a brainstorm, not a form.** The bot shows what it reaches before asking
  anything — that display is also the pre-flight — and asks only what changes behaviour, one
  question at a time. **No closed options for a field that picks a branch:** ask by the condition,
  and an answer naming more than one body of criteria opens by all of them. What turns out to be
  criteria is proposed to the Lore that paid for it, never stored in the bot.
- **Configuring the first use is not the first use.** The gate is answered the same with an empty
  canon and broken paths, so it proves nothing about the north. The bot is reported as finished
  after a **premiere**: an instruction that does not name the criteria, recorded **verbatim**. The
  premiere opens with the **access check** — the bot opened the way its user opens it, reaching the
  manifest's paths — because a host pointed at the wrong folder fails as *«it read the wrong Lore»*,
  which sends whoever debugs it into the criteria instead of into the access.
- **A bot administers no bots.** One that exists to add, register or reorganize the others is the
  `bots` **area** in a bot's shape: that job is a `FASES.md` and an area `lore/`, and it needs no
  canon and no routing table.
- **A bot certifies the absence of the scars it carries, never good health.** A negative report
  carries its coverage in the same sentence — *«none of the laws I carry are broken»*, never *«it is
  fine»*. It points and does not own, so it cannot sign off on what no criteria of its own covers.
- **Scope comes from the institution's registry, never from the builder's folder tree.** A source
  the registry does not list does not enter the manifest, and a borderline one is **declared out of
  scope with its reason**, not silently omitted — a border written with its reason holds, one that
  is only left out gets crossed again.
- **An area enters only if the institution has a project inside it, and enters together with that
  project.** An area federated for its method alone arrives stained with whoever's projects it was
  distilled from — and, worse, may carry a summary of a source the canon already distills. Two
  summaries of the same original inside one bot is worse than none: the one that wins is the one
  nearest the lookup index.
- **Every task closes with a distillation proposal**, and discarded noise is reported.
- **The manifest is the single source** of the copy, the routing table, the pruning and the working
  access; `enrutamiento.md` and `.claude/settings.local.json` are generated, never hand-edited. Sync
  goes one way only.
- **A bot is a folder, not a plugin.** Do not wrap it as a shareable plugin. **Packaging is
  crystallization:** unpacking the snapshot rebuilds `lore-ecosistema/`. Encryption and a minimal
  local launcher are optional and off by default. The `.gitignore` follows the encryption choice;
  getting it backwards ships either a leak or an empty repo.
- **The passphrase never enters the chat.** stdin only — never an argument, never pasted. What
  enters a model's context does not come back out.
- **A paragraph is a paragraph** (kit invariant in `use-lore`). Canon, `lore/`, contract and
  `FASES.md` are not hard-wrapped at column 80. This covers every artifact this skill writes.
- The bot **proposes** criteria; the human writes it. Nothing is auto-committed.
