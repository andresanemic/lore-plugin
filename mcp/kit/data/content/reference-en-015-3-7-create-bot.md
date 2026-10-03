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

**The `lore-ecosistema/` copy left the kit in 2.4.9.** It duplicated a bot's borrowed Lore so that
someone who cloned the repository without your folder tree still had criteria; **a shared repository
is the way to work with other people now**, and it keeps one owner and one version. A
`lore-ecosistema/` folder that already exists is left alone: `transmute-lore` CRYSTALLIZE still
reads it when a live source is absent, and still travels it, so nothing already built is lost.

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

Removed in 2.4.9, and what to use instead:

- **Encryption** used to seal a bot's criteria so they travelled encrypted — off by default, never
  audited, no key rotation and no answer for a passphrase that leaked. **A private repository does
  that job now**, without a passphrase to lose: `canon/` and `lore/` are committed as plain
  Markdown and never leave the repository in the clear. A `canon.enc` you already carry is yours —
  decrypt it once and commit the Markdown.
- **The `lore-ecosistema/` copy** duplicated borrowed Lore for a teammate without your tree. **A
  shared repository is the way to work with other people now.** A folder that already exists is
  never written, never pruned, and still travels when you crystallize.
- **The local launcher** offered a small menu to open Lore-governed folders in Claude Code CLI or
  Codex CLI. **Opening the folder is the whole of it** — a bot is a folder and its contract loads
  when you open a session there. A launcher of your own outside the kit is untouched.

A bot without any of them is complete. **Packaging is crystallization**, not wrapping the bot as a
plugin: unpacking the snapshot rebuilds the folder, and that is how the work travels to someone who
does not have your tree.

Use `create-bot` when you want one session that works across several projects — with or without existing Lore: none, it orchestrates the chain above; some, it federates it. It never substitutes for building that Lore in the Area that owns it.

