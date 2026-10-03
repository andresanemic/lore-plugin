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
`scripts/ecosistema.json`, including a `lore-ecosistema/` copy left by an earlier kit when the live
origin is absent — read, never created. A snapshot
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

