# Mining loose notes

Load this file only when the task points at a note inbox or folder and asks to review, integrate,
extract, distill or save its contents. It governs notes written with Obsidian, a text editor, a word
processor or any other app. The app does not matter; the source-side trace does.

> **The law: a note is source, Lore is criteria.** A note answers *what happened*. Lore answers
> *what changed in the relationship because of what happened*. Nothing crosses without an explicit
> mining pass and a human threshold.

## Why mining is a sweep

A note can satisfy the urge to preserve without producing criteria. Deliberate mining is what makes
the transformation visible and repeatable.

- Every pass reports debt: *N unmined out of M, oldest X days*.
- Separating notes from Lore is not enough; the sweep is the mechanism.
- Reading a small folder ad hoc is still a failure: it loses frontmatter, classification, debt and
  idempotency. **"It is only one folder" does not waive the sweep.**

## Preconditions and root

The root is the mother folder containing the Areas. Verify that at least one direct child contains a
`lore/`. If none does, stop and point to `create-area`.

```text
<root>/
  <area>/
    lore/ · contract · FASES.md
    proyectos/<project>/
  bots/proyectos/<bot>/
    notas/
    canon/ · lore/ · contract
```

Never hardcode the root. Obsidian may open it as a vault, but no editor or app is required.

## Inbox ownership

The inbox is named in the user's language (`notas/`, `notes/`, `apuntes/`) and lives where the
session is opened. The sweep is recursive and accepts `.md` and `.txt`; extract `.docx` to text with
an available native or installed tool before classifying it, preserving the original as source.

| Session opened in | Inbox |
|---|---|
| Bot — recommended | `<bot>/<inbox>/` |
| Project | `<project>/<inbox>/` |
| Area | `<area>/<inbox>/` |
| Root | **none** |

**Work notes from a bot. Permanently, not as an alternative.** Say this the first time the function
runs and whenever a sweep happens outside a bot. A bot routes against a written
`lore/enrutamiento.md`; a bare folder routes by inference. If notes touch more than one Area and no
bot exists, propose `create-bot`.

The root never has an inbox. It has no owner or routing table, so a sweep can silently report zero
debt while leaving a note unseen. A note with no project means the project is missing; work that
must live above all Areas means an Area is missing. Create the missing owner instead of an orphan
inbox.

Create an inbox on first capture, never speculatively. If it appears as untracked inside a
repository, ask whether raw notes should travel before committing or ignoring it.

## Frontmatter

```yaml
---
fecha: 2026-08-08
origen: bots/proyectos/bot-web3-uai
destilado:
---
```

`origen` is optional. Empty or missing `destilado` means unmined. After mining:

```yaml
destilado: 2026-08-10 → desarrollo-web/lore/scroll.md
destilado: 2026-08-10 → FASES.md (fricción abierta)
destilado: 2026-08-10 → nada (ruido — cambio cosmético)
```

`nada` is legitimate and makes the sweep idempotent. A note without frontmatter is still mined; add
the fields only after approval and preserve the body byte-for-byte.

Binary notes such as `.docx` never receive YAML inside the original. After approval, create a
same-name sidecar (`meeting.docx` → `meeting.docx.destilado.md`) containing `fecha`, `origen`,
`destilado` and the extraction status. Treat a non-empty sidecar `destilado` exactly like file-level
frontmatter on later sweeps, and archive the original and sidecar together. This preserves the source
byte-for-byte without sacrificing traceability or idempotency.

## Capture

When asked to save a note, write one source file in the current inbox with the frontmatter above.
Fill `origen` from the current project or bot when available. Never capture inside `lore/`, and do
not touch Lore, `FASES.md` or the contract during capture.

## Mining pass

### 1. Read and report debt

Sweep the requested inbox recursively, skipping `archivadas/` and files with non-empty
`destilado`. Report debt before classifying and name every unreadable inbox. If specific notes were
named, mine them and still report total debt.

Split out notes the agent wrote in the current session: *N unmined, M written by me*. Do not present
the agent's own handoff note as debt the human created.

### 2. Classify into four buckets

| The note records | Bucket | Destination |
|---|---|---|
| Resolved friction: failure, reversal, rejection, paid cost | Experience | CAPTURE |
| Task, pending work, unresolved friction | State | `FASES.md` |
| Someone else's judging criteria | Imported criteria | GRAFT |
| Summary, quote, link or meeting record with no decision | Information/noise | Source for structural work, or reported noise |

A fifth destination is the instruction contract when the note changes how the collaboration itself
works rather than what is true about the domain.

The common mistake is treating state as experience. *"We need to add X"* is state; it becomes a
Clue only after someone tries, something fails, and the cause is understood. Most inboxes contain
mostly information and state. That is a valid result.

### 3. Route in order

1. The note's `origen`.
2. In a bot, its `lore/enrutamiento.md`, by task type rather than project name.
3. The current project or Area.
4. If two owners remain plausible, ask. Never guess.

The first resolved ambiguity may reveal a reusable border between two bodies. Propose that border
only if it passes the normal Lore bar.

### 4. Threshold, then destination write

Present one table with note, bucket, destination, proposed line and archive action. Search outside
the inbox for references to every note that would move and list the hits. Then wait. Nothing is
written before approval.

After approval, use the ordinary CAPTURE or GRAFT machinery in `SKILL.md` for the destination. The
note function owns source routing and trace; the main skill owns clue shape, confidence, index and
project-to-area promotion.

### 5. Close and archive

Write `destilado:` for every mined note, including `nada`. Report what entered, where, what was
discarded and why, plus remaining debt.

Move every closed note with non-empty file-level `destilado:` to `<inbox>/archivadas/` (`git mv` in
a repository, plain move elsewhere). Respect an existing archive folder name. A living notebook
with an empty file-level field stays put even if entries inside it were processed. Never delete a
note.

## Invariants

- A note is source, never authority or criteria by itself.
- No destination changes without the mining pass and threshold.
- Every pass reports debt; unreadable does not mean empty.
- `nada` is written, and noise is reported with its reason.
- Closed notes are archived, never deleted; frontmatter travels with them.
- Ambiguous routing is asked, not guessed.
- A bot is the permanent recommended home for cross-Area notes.
- The root never has an inbox.
- The inbox is not federated; what survives lands with its owning Area or project.
- This conditional note flow overrides the main skill's batch-commit default: no automatic commit or
  push. Commit only when the user explicitly asks for one.
