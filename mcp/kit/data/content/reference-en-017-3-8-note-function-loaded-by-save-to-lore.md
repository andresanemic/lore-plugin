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

