---
name: obsidian-lore
description: >-
  Use when Obsidian notes and Lore share one folder tree — the vault is the mother folder of the
  Areas — to capture or MINE free notes outside any lore/. Trigger whenever the user points to
  `notas/` or `notes/` and asks to read, review, integrate, extract, distill, or save anything into
  Lore, FASES, CLAUDE, corpus, hypotheses, or case studies; also on «mina la bandeja», «guarda esta
  nota en Obsidian», or «mine my inbox». This routing takes precedence even when another domain
  skill (for example research-lus) also applies. Work notes from a bot permanently: notes remain
  SOURCE in their inbox after mining, with frontmatter tracing the approved destination; writing
  is delegated to the skill that owns that destination.
---

# obsidian-lore — The bridge between where experience piles up and where criteria is distilled

The note you wrote at midnight is the honest one. It is also the one that never becomes anything:
notes accumulate faster than anyone re-reads them, and an inbox that only grows stops being a source
and becomes a pile you feel bad about.

Obsidian and Lore can share one folder tree: the **vault is the mother folder of the Areas**, so the
same files are at once the work space of Claude Code and the note space of Obsidian. This skill
governs that overlap. It does two things and refuses a third.

| It does | It refuses |
|---|---|
| Capture a free note in the inbox, **outside any `lore/`** | Manage notes. `Read`, `Grep` and `Glob` already read the vault |
| **Mine** the inbox — turn what deserves it into criteria, through `save-to-lore` | Turn Obsidian into a container of Lore |

> **The law: a note is source, the Lore is criteria.** A note answers *«what happened»*. Lore answers
> *«what changed in the relationship because of what happened»*. Nothing crosses from one to the other
> except through an explicit mining pass and a human approval.

## Why mining, and not just a command that is available

A note file satisfies the urge to preserve **without producing criteria**. Once the record exists,
the distillation does not happen — the criterion stays inside the note, technically preserved and
functionally inert, and it comes out by **deliberate mining**, not by consultation. This is observed,
n=1, in LUS as `H08`, and it is the reason this skill is built around a sweep rather than around a
*save* verb.

Two consequences that are not negotiable:

- **The inbox carries a visible debt.** Every mining pass reports *N unmined out of M, oldest X days*.
  A tidy inbox nobody mines is the exact failure this skill exists to prevent.
- **Separating notes from Lore is not the mitigation.** It was already done, in the case that
  produced the finding, and the record was still inert for six weeks. The mitigation is the sweep.

## Precondition — the vault

The vault must be the **mother folder that contains the Areas**, not a folder beside them.

```text
<vault>/                                  ← opened as a vault in Obsidian
  <area>/                                 ← no inbox at the root, ever
    lore/ · contract (`CLAUDE.md` or `AGENTS.md`) · FASES.md
    proyectos/<project>/
  bots/proyectos/<bot>/
    notas/                                ← the bot's own inbox (see below)
    canon/ · lore/ · contract (`CLAUDE.md` or `AGENTS.md`)
```

Verify before anything else: at least one direct child of the root holds a `lore/`. If none does,
there is no Lore to mine into — **stop** and point at `create-area`.

To set it up in Obsidian: *Open folder as vault* → choose that root. Nothing else is configured; the
Areas appear as ordinary folders and their Markdown is already readable.

> Never hardcode a path. The root is wherever the user's tree lives.

## The inbox — it lives where the session is opened

A folder named in the **user's language** (`notas/` in Spanish, `notes/` in English) — the kit's
language rule applies here as everywhere else. Inside it the user organizes however they like: the
sweep is recursive over `**/*.md`, so subfolders are free and this skill imposes none.

> [!IMPORTANT]
> **Work your notes from a bot. Permanently, not as an alternative.**
> Say this the first time this skill runs, and say it again whenever a sweep happens outside one.
> It is the same sentence the README and the docs carry — do not soften it into "the best way" or
> "one option".
>
> The reason is routing. A bot carries `lore/enrutamiento.md`: the purpose of every Area and project
> it federates, written down. A note swept from a bot is routed **against that table**, and the
> border cases are asked instead of guessed. A note swept from a bare folder is routed against one
> path and the model's reading of the text, which is a guess wearing the same confidence.
>
> If the user has no bot yet and their notes touch more than one Area, **propose `create-bot`**. That
> is the setup this skill was designed for; everything else works and works worse.

**The inbox lives where the session is opened**, and this is not cosmetic:

| Session opened in | Its inbox |
|---|---|
| A **bot** ← *recommended* | `<bot>/notas/` |
| A project | `<project>/notas/` |
| An area | `<area>/notas/` |
| **The vault root** | **none. The root never has an inbox** |

> **The root never gets an inbox, and this is a hard rule rather than a matter of tidiness.** A note
> written there has no owner and no routing table to be filed against, so mining it means filing by
> eye. And the failure is silent: a bot session only reaches its own folder plus the paths in its
> `.claude/settings.local.json`, which never includes the root, so the sweep does not read it, does
> not fail, and **reports a debt of zero**. The note stays intact and technically preserved, which is
> the exact state distillation exists to break.
>
> **The root is not a non-place of work — it is a place of work with no Lore.** Do not justify this
> rule with *«nobody opens a session at the root»*: somebody does, and predictably. Anything that has
> to sit above every area lives there — a launcher that routes into all of them, a spec that decides
> a new area, a script that walks the whole tree. What the root lacks is not visitors: it is an owner,
> a `FASES.md`, an inbox and any instruction contract to load the rules that would have registered the work.
> So the silence is worse than the one described above — **the work itself goes unregistered**, and no
> note is ever written to be swept.
>
> **A note that belongs to no project does not go to the root — it means the project is missing.**
> Propose `create-project` (or `create-bot`), not an orphan inbox. And if the **work** is what had to
> live at the root, what is missing is one level higher: an **area** → `create-area`. Until it exists,
> the note goes to the inbox of the area that asked for the work — never to the root.

Create it on the first capture, in the folder the work is happening in. Never speculatively, and
never at the root.

**An inbox created inside a repository shows up as untracked — ask before it gets committed by
accident.** A bot handed to a team is the case that matters: raw notes are unmined thinking, and
whether they travel with the artifact is the user's call, not a default. Offer both, in one line,
and write the `.gitignore` entry if they decline.

> **Boundary of validity.** This holds where the vault **is** the mother folder of the areas, which
> is the precondition above. In an Obsidian vault kept apart from the work tree, that vault's root
> *is* a place of work and this rule says nothing about it.

### A note's frontmatter

```yaml
---
fecha: 2026-08-08
origen: bots/proyectos/bot-web3-uai   # optional — where the note was written from; feeds the routing
destilado:                            # empty = unmined
---
```

Three fields, all the skill needs. After a note is mined the last one is filled in:

```yaml
destilado: 2026-08-10 → desarrollo-web/lore/scroll.md
destilado: 2026-08-10 → FASES.md (fricción abierta)
destilado: 2026-08-10 → nada (ruido — cambio cosmético)
```

**`nada` is a legitimate result**, and writing it is what keeps the sweep idempotent: a note with a
non-empty `destilado` is skipped on every later pass. A note whose frontmatter the user never wrote
is mined all the same — treat a missing field as empty, and add the field when reporting.

## Capture — writing a note from the CLI

*«guarda esta nota en Obsidian»*. Write the `.md` into the inbox with the frontmatter above. Fill
`origen` with the project or bot the session is running in, when there is one. That is the whole
operation.

> **HARD: never write a note inside `lore/`,** and never touch `identidad.md`, `principios.md`, a
> thematic module, `FASES.md` or instruction contract from a capture. A capture writes one file, in the inbox.

## Mining — the sweep

Triggered by *«revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore»*, *«mina la
bandeja»*, *«destila estas notas»*, or pointed at specific notes.

**Cross-skill routing rule:** a request such as *«lee `LUS/notas` y guarda lo necesario en Lore y
FASES»* invokes this skill first even though `research-lus`, `transmute-lore` or another skill may
also govern the destination. This skill owns the source-side sweep and frontmatter; the destination
skill owns the scientific or Lore write. Reading the notes through the domain skill alone is a
failure: the information was loaded, but the transformation stayed untracked.

### 1. Read

Sweep `<inbox>/**/*.md` — the inbox of the folder the session is open in — skipping notes with a
non-empty `destilado`. Report the debt before classifying anything, and name any inbox that could not
be read. If the user pointed at specific notes, mine those and still report the debt.

### 2. Classify — four buckets

The discriminator is **not the quality of the note**. It is whether the note records a
**transformation** or only a **fact**.

| The note records | What it is | Where it goes |
|---|---|---|
| A friction **that was resolved** — it broke, it was reverted, the client rejected it, it turned out that… | **experience** | `save-to-lore` **CAPTURE** |
| A **task**, a pending item, or a friction **still open** — *«we need to add X»*, *«nobody closed this yet»* | **state**, not criteria | `FASES.md` |
| Someone else's criteria that **judges** — a style guide, a playbook, an article on what good X is | **imported criteria** | `save-to-lore` **TRANSPLANT** — no defeats section, no entry |
| A summary, a quote, a link, a meeting note with no decision in it | **information** | source for `create-area` / `create-project` / `transmute-lore` — or **noise, reported** |

A fifth destination exists and is rarer: a note that changes **how we work together** rather than
what is true about the domain (what gets read first, what closes a deliverable) belongs in
the instruction contract, not in the Lore.

**Signals of a resolved friction**, which is the only bucket that produces Lore directly: a
quoted error, a decision that was reversed, a *«no funcionó»*, a *«al final tuvimos que»*, a
rejection, a cost paid. **Signals of information**: a list, a citation, a link with a comment, an
agenda.

> **The most common mistake is the second row, and it looks like the first.** *«Hay que añadir la
> idea de Francisco al sitio»* is a **task**: it names work to be done, not a constraint on how the
> work is done. It goes to `FASES.md` and never to the Lore. The same note becomes Lore only once
> somebody tries it, it fails, and the reason it failed is understood — then the Clue is about the
> reason, never about the task. **Anything phrased as *«we have to…»* is state.**

Most of a real inbox is the fourth row. That is the expected outcome, not a failure of the sweep —
the four levels are *information → knowledge → experience → criteria*, and a note-taking habit
collects the first two. Say so plainly instead of manufacturing Clues to justify the pass.

### 3. Route

In order, stopping at the first that resolves:

1. The note's `origen`.
2. If the session runs in a **bot**, its `lore/enrutamiento.md` — routing is **by type of task, not
   by name of project**, and it is consulted there, never from memory.
3. The project or area the session is running in.
4. **Ambiguous between two bodies of criteria — ask.** Never guess. Cheaper than distilling against
   the wrong purpose.

The first time an ambiguity is resolved, the **border** itself may be worth keeping — it exists
written in neither body, because each is written from inside its own purpose. Propose it as a Clue
only the first time; the noise filter applies here too.

### 4. Propose, then write (threshold)

Present, per note, in one table: the bucket, the destination, and the proposed line. Then **wait**.
Nothing is written before a human approves.

On approval, **delegate the writing to `save-to-lore`** (CAPTURE by default, TRANSPLANT when the
source is someone else's criteria). That skill owns the Clue format, the index line, the confidence
marker and the project ↔ area promotion — this skill contributes the routing and the source, which
is what `save-to-lore` does not know.

### 5. Close

Write `destilado:` in every note that was mined, including the ones that produced nothing. Report:
what entered, where, what was discarded as noise and **why**, and the remaining debt.

If a pre-existing note has no frontmatter, add all three fields (`fecha`, optional `origen`, and
`destilado`) after approval while preserving its body byte-for-byte below the header. **Never move
or delete the note after mining.** A processed inbox is not an empty inbox; it is a traceable source
archive whose non-empty `destilado` fields make future sweeps idempotent.

## Invariants

- **A note is source, never criteria.** It is never authoritative, never loaded as if it were Lore,
  and never cited as a rule.
- **Nothing enters `lore/`, `FASES.md` or the instruction contract without a mining pass and a threshold.** A
  capture writes one file in the inbox, and nothing else.
- **The sweep, not the availability of a command, is what releases the criteria.** Every pass reports
  the debt.
- **`nada` is a legitimate result** and is written down. Discarded noise is reported, never dropped in
  silence.
- **This skill never deletes a note.** Mine before deleting, and deleting is the human's call.
- **Mining leaves notes in `notas/` / `notes/`.** Frontmatter records where the transformation
  landed; neither this skill nor `transmute-lore` treats processed notes as cleanup candidates.
- **Ambiguous routing is asked, not guessed.**
- **A bot is the recommended home for an inbox, permanently.** It is the only place where routing is
  read from a written table instead of guessed. Recommend it on first run and whenever a sweep
  happens outside one; propose `create-bot` when the notes touch more than one Area.
- **The inbox lives where the session is opened, and the vault root never has one.** A bot session
  cannot reach the root, so an inbox there fails silently and reports a debt of zero. A note that
  belongs to no project means the project is missing, not that the root needs an inbox — and **work
  that had to happen at the root means an area is missing**, which is `create-area`, still not an
  inbox. The root is a place of work with no Lore, never a place nobody works in.
- **An inbox that could not be read is named**, never counted as empty.
- **The inbox is not federated.** It holds no Lore, so a bot never routes to it — the source gets its
  Lore in the area that owns it first.
- **The inbox folder is named in the user's language**, like every other artifact this kit generates.
- **No auto-commit, no push.**
