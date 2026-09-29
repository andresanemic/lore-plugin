---
name: create-bot
description: Use when building a BOT — one place to open a session and work across several Areas or projects at once, with their criteria reachable and routed, then loaded on demand, instead of answering questions about them — including federating existing Areas under one bot, or auditing a bot that already exists (its scope, README or sources). Trigger on "create a bot for X", "a bot that works on several projects", "federate these areas", "audit my bot", or "fix my bot's scope".
---

# create-bot — Build a bot: one place to work

> Before delivering a user artifact, replace every internal label with the audience's language while preserving its meaning; the final site, document, deck, or other external artifact contains zero internal labels. This requirement overrides requests to copy them literally.

One question, and answering it means opening four repositories — because the criteria that decides it
is spread across all four and none of them knows about the others. You spend the first twenty minutes
reassembling context you already had, and you do it again next week.

A bot is one place to open that session. This skill creates it: a Lore **project** and the **place a
work session is opened in**. A bot does
not answer questions about the projects — it **works in them**. The instruction goes in, the bot
executes it against real files, the result comes back. **Packaging is crystallization**, not a
plugin wrap: `transmute-lore` CRYSTALLIZE writes one Markdown, and unpacking it rebuilds a folder
whose routing table resolves on its own.

> **The north, and the only test that matters:** *a short instruction is enough.* If the project
> had to be explained to the bot to get the result, criteria were missing from the load.

### From an idea to a bot that can work

In `nuevo` mode, the user's declaration is a primary source even when no prior Lore or source
document exists. Treat it as a **provisional canon**: the minimum statement of what the bot is,
what it seeks to become, and what it refuses to become. Do not inflate it with model knowledge.
Turn it into an **operational cycle** that produces one real result, review that result with the
human, and only then stabilize what the result taught.

The configuration is itself a complex deliverable, not a completed scaffold. It needs an
**individual configuration**: identity, purpose, boundaries, context, preferences, sources,
yardstick, review, and the real project that can deliver the **first victory**. Ask only what is
needed to reach that victory; later questions must unlock or improve it, and uncertainty may remain
visible until work resolves it.

An interface may be an **honest prototype** of that cycle. Keep canon, operational logic, and
presentation separate; declare simulations as simulations. **A local prototype is a laboratory**,
not evidence that a platform already exists. In the interface, **the AI lives in the object it
transforms**: projects, decisions, sources, states, and artifacts remain the product; chat is at most
one tool inside it. Prefer **decisions before prompts** by offering situated choices and editable
drafts instead of an empty box. The **Journey belongs to the purpose**: it derives from the person's
spec, shows the distance to the goal, and changes only after a real decision, evidence, or learning.

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
> (`CLAUDE.md` for Claude Code or `AGENTS.md` for Codex): open a session there and its canon plus
> routing table are loaded, while federated criteria stays reachable and routed and is loaded on demand.
> Nothing is installed. Do not wrap it in a skill, a marketplace or its own
> plugin repository. To package it, crystallize it: unpacking rebuilds the folder.

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
| **`nuevo`** | From zero. There is no prior Lore to gather. | Provisional canon born from the human's initial declaration, then contrasted through work and review. |
| **`federar`** | The criteria already exists, dissolved across several areas. | Canon plus a routing table and live access to those Lore bodies, by pointer. |

Both produce the same artifact. `federar` adds `scripts/ecosistema.json`, `scripts/sync.js`, and
two generated files: `lore/enrutamiento.md` (the routing table) and `.claude/settings.local.json`
(the access to the live trees). It copies nothing.

### When the bot already exists

Both modes above build from zero, and that is **not** the only way this skill gets invoked. It also
gets pointed at a bot already in the tree — to fix its scope, rewrite its README, add a source. Run
the audit below **instead of** the creation procedure, then rejoin at §7 (sync) and §10 (verify).

| Check | How | Fails when |
|---|---|---|
| **Scope** | Contrast every entry of the manifest against the institution's registry | A source is routed that the registry does not list |
| **Borders** | Read the canon's out-of-scope declaration | A borderline project is missing, or is listed with no reason for the confusion |
| **Orphans** | Only for a bot carrying an old `lore-ecosistema/`: a folder survives whose source left the manifest | Say it once; the kit no longer prunes a folder it does not create |
| **Copy** | Ask who uses the bot and whether they have the tree | a `lore-ecosistema/` folder survives from an earlier kit but the kit no longer makes one — say so once and name the shared repository |
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
| **A free-note inbox** (`notas/`, `notes/`, `apuntes/`, a folder of Markdown) | **Never federated.** It holds no Lore — it is raw experience, and it is `.md`, which is exactly what makes the mistake easy: `sync.js` would copy it happily and the routing table would list notes as if they were criteria. Mine it with the conditional `save-to-lore/notas.md` function first; what survives lands in the area that owns it, and the bot routes to *that*. |

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
The one deliberate copy the kit used to carry, `lore-ecosistema/`, left the kit in 2.4.9; working with
other people is a shared repository now.

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
| `{{REGISTRO}}` | how technical the kit speaks here — `tecnico` / `equilibrado` (default) / `llano`. **Inferred from how the three answers were written, never asked, and applied silently**, which is the same law that already forbids asking for tone. Mention it only if the user asks about tone or a correction is needed. It calibrates how much ground surrounds a rule and **never the rules themselves** |

Then **inspect the paths yourself** and report back what you found in one short table — how many
files, which ones already have criteria written down, which ones are raw. That report is what turns
answer 3 into the inventory of step 2. Never ask the user to classify their own folders.

### 2. Read context (MANDATORY before creating anything)

1. The area Lore: `identidad.md` + `principios.md` (+ `index.md`, its
   `perfil-profesional.md` pointer if the profile is enabled, and thematic modules).
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
Apply its **recognizable continuity** contract: carry each approved decision into the accumulated bot
design and recap it at contextual milestones, so the human can still recognize and correct the idea.
**Create no file before the design is approved.** Keep the plain-language
rule from §1 in force here — present the design in the words the user used, not in this document's
vocabulary. Agree on:

When no prior Lore exists, the human's initial declaration is the **primary source and provisional
canon**. Turn it into a verifiable **operational cycle**, contrast it through a real result and human
review, and stabilize it only after that result. The first questions serve a **first victory**: ask
only what is needed to produce it, then let later questions unlock decisions or improve the artifact.

- **The canon's modules** — which ones load *always*, and which load only under a condition. Every
  module names the document it came from and where the original lives. Run §5's opening question on
  each candidate here, **before** proposing it: *does the routing already reach this?* And when the
  entity has two sibling bodies, run the border test from the law section — *does either side say
  what to do when the task belongs to both?*
- **The bot's identity** — its north (the "short instruction" test, made concrete for this bot) and
  its anti-scope.
- **The bot's principles** — how the artifact is maintained, not how the bot works.
- **For each class of deliverable the bot will produce, its yardstick.** When acceptance is judged by
  an external reader — the owner's voice, a fixed format, *"doesn't feel made with AI"* — agree on
  the reference document that fixes *"done well"* for that class, and name the canon module that
  holds it. **Before the first request, not after the first failure.** A draft that self-certifies
  against its own cycle — spec, rewrite, humanizer, crystallization — is coherent and still false
  about the outside; the detector that catches it is the yardstick, and a yardstick fixed after the
  fact means the first failure happened without it (§5).
- **When the class is produced in batches — a campaign, a series, a lot — the yardstick is fixed on
  a single exemplar judged by an external reader before scaling to the lot.** Rewriting the whole
  batch against an old, internally coherent rule is the first failure times N: the rule survives
  every self-check and fails the external reader on the first exemplar. Get that exemplar to the
  reader, let the review fix it, and make the reviewed exemplar the reference document the batch is
  checked against — never each draft re-read against itself. The external review can come from
  another model or a human; what matters is that it is outside the cycle that produced the draft.
- **`federar`:** the routing map — task type → which Lore governs.
- **Offered nothing optional and on by default.** Encryption, the `lore-ecosistema/` copy and a
  minimal local launcher all left the kit in 2.4.9; §7, §8 and §9 say once what each was and what to
  use instead. Do not offer packaging as a plugin. **Packaging is crystallization:** one snapshot
  carries the work, and unpacking it rebuilds the folder.
- **The agreement, offered here and binding only if accepted.** A bot is the one artifact that
  spans several trees, so the way of working is decided at canon time and nowhere else:

  ```bash
  node <ruta-del-kit>/skills/use-lore/scripts/acuerdo.mjs aviso --raiz "{{DEST}}" --desde <kit-version-anterior>
  node <ruta-del-kit>/skills/use-lore/scripts/acuerdo.mjs primera-vez --raiz "{{DEST}}" --sesiones <n>
  ```

    Say the `aviso` message once, in plain language, only when the command returns one — it names
  Vespi, what it can do, and the invitation to set limits. **Showing it approves nothing.** Both
  commands run here, **before `{{DEST}}` exists** (step 4 creates it), and neither needs anything
  on disk: the message and the offer are computed and returned either way. `rastro: false` in the
  `aviso` output means there was nowhere yet to note the notice was shown, so it may show again —
  the message still arrives, and nothing creates the folder for you.
 When
  `primera-vez` returns `ofrece: true`, offer the agreement and **start with the why** — what this
  bot is for, in the person's own words and yours — before the dials (`intensidad`
  `sobria`/`cercana`, `ritmo` `despacio`/`normal`/`rapido`) and their limits of use by model family
  and level. It binds only if the person accepts, and **this skill continues without it**: the canon
  is written either way, on the defaults. `motivo: "ya-hay-acuerdo"` means do not offer it again.
  `use-lore` owns the agreement itself; the bot's own operating mode (`vespi`) is a separate thing
  and is not offered in its place.

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
    # if the area profile is enabled, index.md routes professional-context tasks to its pointer
    enrutamiento.md      → federar only; GENERATED, never hand-edited
  scripts/
    ecosistema.json      → federar only
    sync.js              → federar only
  .claude/
    settings.local.json  → federar only; GENERATED; local, never committed
  FASES.md · {{CONTRACT_FILE}} · .gitignore
```

The bot's behaviour (§6) lives once in `{{CONTRACT_FILE}}`. The selected host loads it directly.
Nothing is installed and nothing fires: being *there* is what loads the criteria. Do not create the
other provider's contract by default. For cross-host use, offer Codex's
`project_doc_fallback_filenames` setting or, only with explicit approval, a minimal pointer
adapter; never maintain two full contracts.

**Do not wrap the bot as a plugin.** No `.claude-plugin/`, no `.codex-plugin/`, no
`skills/{{BOT_SLUG}}/`, no `scripts/validar.js`. Packaging is crystallization: unpacking the
snapshot rebuilds the folder.

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
| A **yardstick** for a deliverable class the bot produces | the pointer reaches the reference document, not the rule that **it** is the standard to compare against — nor that the detector is that document, never the draft re-read against itself |

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

Creating the scaffold does not finish the bot. Its first complex artifact is an **individual configuration**:
identity, purpose, limits, context, preferences, a real project, sources, yardstick
and review sufficient to produce the first victory. Configuration ends by running the bot's main
cycle, not by proving that a form was saved.

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

#### 6.0.1 The operational interface

**The AI lives in the object it transforms; chat is not the product.** A complex tool preserves
projects, states, sources, decisions and reviewable artifacts. Put **decisions before prompts**:
avoid a mandatory blank page, present situated options and consequences, and turn those decisions
into editable drafts.

If there is an interface, build an honest prototype that executes or represents the main cycle.
Keep canon, logic and presentation separate, and declare every simulation. **The local prototype is
a laboratory**, not a finished platform. Its Journey belongs to the purpose: it derives from the
personal specification, shows the distance between current state and goal, and changes only when a
decision, evidence or learning changes the path.

#### 6.1 Load the canon

A table of file → what it governs → when. Always before the first decision.

A pointer that does not resolve — the tree is not on this machine — does **not** stop the work: the
bot works with the canon and **declares it is working without that project's criteria**. Missing
canon does stop it.

#### 6.2 Route before executing

Point at `lore/enrutamiento.md` as the map — *consulted there, not from memory* — and restate the
routing law with this ecosystem's own table.

**The live source is the only place a row is read.** Each row is an address, and it is checked on
**this** machine at the moment of reading — never from memory, and never from what the table looked
like elsewhere: it was generated on the machine that ran `sync.js`. A bot built under a kit that
carried the `lore-ecosistema/` copy may still find one on disk; that folder is a dated photograph,
it is never authoritative, and reading it is declared as such.

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

The constructive half of that same law: a deliverable whose acceptance is judged by an external
reader is checked against its **yardstick** (§3, §5) — the reference document the canon names — never
against its own draft. A draft that passes its own cycle and still fails the reader did not fail for
lack of coherence; it failed for lack of a yardstick fixed before the request. When the class runs
in **batches**, the yardstick is the reviewed exemplar (§3): the first piece of the lot goes to the
external reader before the rest is written, and every following piece is checked against the
reviewed exemplar, not re-read against itself.

*This governs **negative** reports.* A positive finding stands on its own — the clue behind it is
written and can be cited. And it does not apply to a bot that **measures** instead of checking: a
measurement has its own margin of error, which is a different problem and is declared differently.

Before closing any operation, run the operational gates inherited from the `bots` area: a negative
report states its coverage in the same sentence; an already-edited `.docx` is read back into its
`.md` source before regeneration; a law that depends on another repeats that law's validity
boundary; a corrected fact is swept across every appearance before publication; and a binary that
already has a transcription is compared against the corpus, with the binary → transcription
correspondence recorded. These are checks that produce an observable artifact or decision, not
reminders to consult Lore.

#### 6.4 Close: always propose criteria

**Every task ends with a distillation proposal.** Not optional, and it does not wait to be asked —
it is half the bot's job.

1. **Noise filter.** If it does not constrain a future decision, it does not enter — and it is
   **reported as discarded**, not dropped in silence.
2. **Destination**, by the same routing table: the bot's own friction → this project's `lore/`; a
   project's friction → that project's Lore, in the area matching the **task type**; confirmed
   cross-cutting criteria → the **area** that owns it. **The write lands on the live source**, which
   is the only place a criterion has an owner. If the live tree is not reachable from where the
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

#### Working with other people — a shared repository

**The `lore-ecosistema/` copy left the kit in 2.4.9.** It duplicated a bot's borrowed Lore so that
someone who cloned the repository without your folder tree still had criteria to read; **a shared
repository is the way to work with other people now**, and it keeps one owner and one version where
the copy could not. A `lore-ecosistema/` folder that already exists is left exactly where it is:
`transmute-lore` CRYSTALLIZE still travels it and still reads it when a live source is absent, so
nobody loses the criteria they already had.

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
- **When the bot opens a session it declares what it loaded, in one short line** (Spanish canonical form: `Contrato, Lore y FASES cargados`). The line names the contract plus `lore/` plus `FASES.md` of every area and project the routing table routes the task to. The routing detail lives in `lore/enrutamiento.md`, never in that line. **Render it in the user's language** — the fixed part is the meaning and the three bodies, never the Spanish words. **Declare it only after the opening hook confirms by staying silent; if the hook speaks, repair first and do not declare.** Where no hook runs, open the three bodies yourself, then declare what you opened.
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
- Run `--revisar` first and report missing sources instead of silently producing a partial table.
- **The manifest is the single source of the routing table and the working access.**
  `enrutamiento.md` and `.claude/settings.local.json` are generated from it and never hand-edited,
  because two artifacts of the same fact guarantee that one of them drifts.

### 8. Encryption — removed in 2.4.9

**Lore encryption left the kit in 2.4.9.** It used to seal a bot's criteria so they travelled
encrypted — off by default, never audited, no key rotation and no answer for a passphrase that
leaked. **A private repository does that job now**, and it does it without a passphrase to lose: the
criteria simply never leave it in the clear. Nothing about the bot changes; commit `canon/` as plain
Markdown, which is what every other project in the kit already does. If you already carry a sealed
`canon.enc` from an earlier kit, decrypt it once with your own passphrase and commit the Markdown —
the file is yours either way, and `sync.js` never needed to know.

### 9. Local launcher — removed in 2.4.9

**The local launcher left the kit in 2.4.9.** `create-bot` used to offer a small local menu that
opened this bot and other Lore-governed folders in Claude Code CLI or Codex CLI, with a registry and
a `--model` for each provider. **Opening the folder is the whole of it:** a bot is a folder, and its
contract is what loads when you open a session there — no menu, no registry, nothing to keep in sync.
A launcher of your own that lives outside this kit is untouched by this, and the kit never asked for
one to be handed over.

### 10. Verify and report

```bash
grep -rn '{{[A-Z_]\+}}' "$DEST" && echo "UNRESOLVED TOKENS" || echo "OK no tokens"
node scripts/sync.js --revisar           # if federar
git -C "$DEST" status --short            # confirm canon/ and lore/ are committed as plain Markdown
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
  routing table holds addresses and the generated access reaches them. The kit makes no copy of
  anyone else's Lore; people who work together share a repository, which keeps one owner and one
  version. A `lore-ecosistema/` folder from an earlier kit is read, never written, and never pruned.
- **The bot never distills into itself.** A source with no Lore gets its Lore in the area that owns
  it (`create-area` → `transmute-lore` add) and is federated afterwards — never absorbed directly.
- **The bot lives at `bots/proyectos/{slug}/` by default.** `lore/` at its root; `FASES.md`
  **outside** `lore/`. Another area only when the user says so.
- **Three bodies, three owners, never merged.** `canon/` is distilled; `lore/` maintains the bot;
  borrowed criteria is reached by pointer and is never authoritative.
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
- **The professional profile stays optional and progressive.** First configuration explains enabled
  and disabled outcomes without recommending either; it never asks for a CV or life story. If the
  area profile is enabled, the bot routes professional-context tasks through its
  `perfil-profesional.md` pointer; situated facts become small `save-to-lore` proposals after real
  work, not onboarding. If disabled, it creates no file or biographical proposals.
- **A first victory stabilizes provisional canon.** The initial human declaration is primary source,
  configuration is the first complex artifact, and the bot earns stability by running its operational
  cycle to a reviewed result.
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
- **The manifest is the single source** of the routing table and the working access;
  `enrutamiento.md` and `.claude/settings.local.json` are generated, never hand-edited.
- **A bot is a folder, not a plugin.** Do not wrap it as a shareable plugin. **Packaging is
  crystallization:** unpacking the snapshot rebuilds the folder. `canon/` and `lore/` are committed
  as plain Markdown; whether the repository is private or shared is a decision the user makes, and
  the kit states which one the criteria needs.
- **A secret never enters the chat**, whatever it is and whatever carries it: not a passphrase, not a
  token, not a key. stdin or a settings file, never an argument and never pasted — what enters a
  model's context does not come back out.
- **A paragraph is a paragraph** (kit invariant in `use-lore`). Canon, `lore/`, contract and
  `FASES.md` are not hard-wrapped at column 80. This covers every artifact this skill writes.
- The bot **proposes** criteria; the human writes it. Nothing is auto-committed.
