---
name: obsidian-lore
description: Use when Obsidian notes and Lore share one folder tree — the vault is the mother folder of the Areas — to capture free notes outside any lore/ and, above all, to MINE that inbox for criteria worth distilling. Trigger on «revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore», «mina la bandeja», «destila estas notas», «guarda esta nota en Obsidian», «review my Obsidian notes and see what belongs in my lore», «mine my inbox». Notes are SOURCE, never criteria — only an explicit mining pass plus HARD-GATE turns one into Lore, and the writing is delegated to save-to-lore.
---

# obsidian-lore — The bridge between where experience piles up and where criteria is distilled

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
  notas/                                  ← the root inbox
  <area>/
    lore/ · CLAUDE.md · FASES.md
    proyectos/<project>/
  bots/proyectos/<bot>/
    notas/                                ← the bot's own inbox (see below)
    canon/ · lore/ · CLAUDE.md
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

**Where it goes depends on where the session runs**, and this is not cosmetic:

| Session opened in | Its inbox |
|---|---|
| The vault root | `<vault>/notas/` — the default, for notes that belong to no project yet |
| A **bot** | `<bot>/notas/` — **always**, never the root's |
| A project or an area, when the user wants one there | that folder's `notas/` |

> **A bot's inbox lives inside the bot, and this is a hard rule, not a preference.** A session only
> reaches the folder it was opened in plus the paths in its `.claude/settings.local.json` — which
> lists the federated projects and **not** the vault root. An inbox at the root is unreachable from
> a bot session: the capture fails, or worse, the sweep silently finds nothing and reports a debt of
> zero. Notes written while working in a bot are the bot's.

Create it on the first capture or on the first sweep, never speculatively.

**An inbox created inside a repository shows up as untracked — ask before it gets committed by
accident.** A bot handed to a team is the case that matters: raw notes are unmined thinking, and
whether they travel with the artifact is the user's call, not a default. Offer both, in one line,
and write the `.gitignore` entry if they decline.

**On a sweep, mine the local inbox first, then the root's if it is reachable.** Notes at the root
can concern any area, so they are worth including — but a root that does not resolve does **not**
stop the pass: mine what is reachable and **say which inbox was not read**, the same way a routing
pointer that does not resolve is declared rather than silently skipped.

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
> thematic module, `FASES.md` or `CLAUDE.md` from a capture. A capture writes one file, in the inbox.

## Mining — the sweep

Triggered by *«revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore»*, *«mina la
bandeja»*, *«destila estas notas»*, or pointed at specific notes.

### 1. Read

Sweep `<inbox>/**/*.md` — the local one first, then the root's if it resolves — skipping notes with a
non-empty `destilado`. Report the debt before classifying anything, and name any inbox that could not
be read. If the user pointed at specific notes, mine those and still report the debt.

### 2. Classify — four buckets

The discriminator is **not the quality of the note**. It is whether the note records a
**transformation** or only a **fact**.

| The note records | What it is | Where it goes |
|---|---|---|
| A friction **that was resolved** — it broke, it was reverted, the client rejected it, it turned out that… | **experience** | `save-to-lore` **CAPTURE** |
| A **task**, a pending item, or a friction **still open** — *«we need to add X»*, *«nobody closed this yet»* | **state**, not criteria | `FASES.md` |
| Someone else's criteria that **judges** — a style guide, a playbook, an article on what good X is | **imported criteria** | `save-to-lore` **ARBITRATE** — no defeats section, no entry |
| A summary, a quote, a link, a meeting note with no decision in it | **information** | source for `create-area` / `create-project` / `transmute-lore` — or **noise, reported** |

A fifth destination exists and is rarer: a note that changes **how we work together** rather than
what is true about the domain (what gets read first, what closes a deliverable) belongs in
`CLAUDE.md`, not in the Lore.

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

### 4. Propose, then write (HARD-GATE)

Present, per note, in one table: the bucket, the destination, and the proposed line. Then **wait**.
Nothing is written before a human approves.

On approval, **delegate the writing to `save-to-lore`** (CAPTURE by default, ARBITRATE when the
source is someone else's criteria). That skill owns the Clue format, the index line, the confidence
marker and the project ↔ area promotion — this skill contributes the routing and the source, which
is what `save-to-lore` does not know.

### 5. Close

Write `destilado:` in every note that was mined, including the ones that produced nothing. Report:
what entered, where, what was discarded as noise and **why**, and the remaining debt.

## Invariants

- **A note is source, never criteria.** It is never authoritative, never loaded as if it were Lore,
  and never cited as a rule.
- **Nothing enters `lore/`, `FASES.md` or `CLAUDE.md` without a mining pass and a HARD-GATE.** A
  capture writes one file in the inbox, and nothing else.
- **The sweep, not the availability of a command, is what releases the criteria.** Every pass reports
  the debt.
- **`nada` is a legitimate result** and is written down. Discarded noise is reported, never dropped in
  silence.
- **This skill never deletes a note.** Mine before deleting, and deleting is the human's call.
- **Ambiguous routing is asked, not guessed.**
- **The inbox lives where the session is opened, and a bot's lives inside the bot.** A bot session
  cannot reach the vault root, so a root inbox would fail silently and report a debt of zero.
- **An inbox that could not be read is named**, never counted as empty.
- **The inbox is not federated.** It holds no Lore, so a bot never routes to it — the source gets its
  Lore in the area that owns it first.
- **The inbox folder is named in the user's language**, like every other artifact this kit generates.
- **No auto-commit, no push.**
