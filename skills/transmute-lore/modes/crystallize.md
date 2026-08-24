## CRYSTALLIZE mode — procedure

> **The premise:** some destinations can accept one attached Markdown but cannot navigate a live
> folder tree. CRYSTALLIZE resolves the project's routing into a portable reading copy. The source
> remains authoritative; the derivative never becomes a second Lore to maintain.

> **The yardstick, and it is not optional.** A third person must be able to **work from this file
> alone**. A crystallization that *routes* to criterion it does not contain is not a crystallization:
> it is a table of absences. **`lore-ecosistema/` travels.** So does every live `lore/`, `canon/`,
> identity and principles the routing table or `scripts/ecosistema.json` names. "Canon only",
> "without the ecosystem", "without the area's craft" are **failures of the mode**, not scopes.
> A smaller export is allowed only when the user **names each routed body to drop**, and the
> preview lists those holes as holes. Silence is the full tree.

### Phase 0 — Resolve target and destination

Identify whether the target is a project, area, or bot and where the derivative will be used: a
chat, an AI project, a notebook, or another Markdown-only reader. Default to a localized filename
such as `lore-crystallized.md` / `lore-cristalizado.md` at a user-approved export location, not
inside `lore/`.

CRYSTALLIZE **does not replace the six live artifacts**. It writes no source artifact and never
changes the instruction contract, `FASES.md`, `lore/`, a bot's canon, or any federated source.

### Phase 1 — Resolve the live routing (the default is the whole routed tree)

Read in this order and record every resolved path. **Do not stop at the bot's own folder.**

1. the target contract (`CLAUDE.md`, `AGENTS.md`, or the bot's equivalent);
2. `FASES.md` or the target's current state artifact;
3. the target's `canon/` (a bot) and its `lore/` — identity, principles, index, thematic modules,
   generated `enrutamiento.md`;
4. **if `scripts/ecosistema.json` exists:** every `fuentes[]` row. For each row, take `incluir`
   (or `lore` + the selected contract + `FASES.md` when `incluir` is absent). Resolve first at
   the **live** `origen` under the manifest `raiz`; if that path does not exist on this machine,
   resolve the same pieces under `lore-ecosistema/{destino}`. A copy that exists and a live tree
   that exists must not both be inlined — live wins, one owner;
5. **if `lore-ecosistema/` exists and a row has no live origin:** walk that copy the same way —
   contract, `FASES.md`, `lore/`, `canon/`, `GOLDEN_PATHS.md`, `fuente/` that is already criterion;
6. inherited area modules the project's `index.md` points to, when the target is a project.

Follow owners, not adjacent directories. Deduplicate the same file reached twice. Preserve
ownership in the headings.

**The test that Phase 1 passed:** every `lore/` named by `enrutamiento.md` or by `ecosistema.json`
has a corresponding set of files on the manifest. If a row is missing, Phase 1 is not done —
do not invent a "canon-only" preview to paper over it.

### Phase 2 — Apply the privacy and noise boundary

These stay **out** by default — they do not help a third person work from the file, or they
are not criterion. The privacy set is still **conversations, secrets, ignored files, undistilled notes**,
plus:

- `notas/`, `notes/` (source, not Lore);
- `scripts/` **except** `scripts/ecosistema.json` (the routing source of truth);
- `LICENSE`, lockfiles, `package.json` of tools, `node_modules/`;
- a previous crystallization nested inside the new one;
- environment files, credentials, private histories, caches;
- binaries, unless the user names one and approves it.

An ignored file is excluded even when a routed directory contains it. For research or personal
bots, do not infer that a conversation is safe because it is Markdown. If the user wants an
excluded source included, name it separately in the preview and require explicit approval.

If a source cannot be redistributed, represent it only by a notice that it was omitted — and
that notice **does not replace** inlining every *other* routed `lore/`.

### Phase 3 — Build the preview and threshold

Before writing, present:

- destination path and intended platform;
- the **exact source manifest**, in output order, with owner and resolved path;
- the count of routed `lore/` trees included vs named by the manifest — they must match;
- every excluded category and its count;
- any source whose visibility is uncertain;
- any routed body the user asked to drop, listed as a hole;
- whether an existing derivative would be overwritten;
- that every inlined file will carry an extract marker, and where the snapshot can be unpacked.

Wait for explicit approval. Approval to crystallize the normal route does not approve an uncertain
or private source, and **does not approve omitting `lore-ecosistema/`**. If the destination already
exists, show that fact and obtain overwrite approval; otherwise choose a new filename.

When the scope needs several human decisions, apply `brainstorming-lore`'s **recognizable continuity**
contract: update the same accumulated manifest one decision at a time instead of restarting it.

### Phase 4 — Compose the derivative

Write one Markdown in this order:

1. title and target identity;
2. a warning that this is a generated reading copy;
3. generation date, source root, intended destination, and exact source manifest;
4. the bot or project's own contract, canon, identity and principles;
5. **every routed body**, owner by owner, file by file — identity, principles, modules, state —
   inlined in full, each file wrapped in an extract marker (below);
6. omissions and privacy boundary;
7. regeneration notice.

**Every inlined file is extractable.** Wrap it exactly like this — path relative to the
manifest `raiz`, never a machine-absolute path:

```markdown
<!-- lore:extract path="laboratorio/proyectos/roble/lore/identidad.md" owner="Roble" -->
…file body, unchanged…
<!-- /lore:extract -->
```

- `path` is `{origen}/{rel}` from `ecosistema.json`, or `bots/proyectos/{slug}/{rel}` for the
  bot's own files (contract, canon, `lore/`, `scripts/ecosistema.json`).
- `owner` is the row's `proyecto` (or the bot's name). Optional `destino="..."` records the
  copy slot so unpack can rebuild `lore-ecosistema/` when `copia` is on.
- Do not invent a second wrapping format. The bundled script parses this pair and nothing else.

Preserve the source language and substantive content. Normalize heading levels only so the combined
file remains navigable. Do not summarize away examples, confidence markers, defeats, validity
boundaries, or provenance: those are what let criterion participate rather than merely be named.
**Do not leave a routing table whose destinations are missing from this file.**

The header must say plainly: **this snapshot may become stale**. It must direct the reader back to
the live project tree for updates and warn agents not to write changes back into the derivative.

### Phase 5 — Verify and report

- Compare source hashes or byte counts before and after: CRYSTALLIZE **writes no source artifact**.
- Confirm every manifest entry has one corresponding section or an explicit omission notice.
- **Fail the pass** if `enrutamiento.md` or `ecosistema.json` names a `lore/` that has no inlined
  files in the derivative, unless the user accepted that hole by name in Phase 3.
- Scan the derivative for excluded filenames and known secret markers before reporting success.
- Confirm links that only made sense inside the tree are either expanded with source context or
  labeled as non-portable; do not leave silent broken navigation.
- Confirm every inlined file has one `<!-- lore:extract path="..." owner="..." -->` /
  `<!-- /lore:extract -->` pair, and that no `path` is absolute or contains `..`.
- Report output path, size, source count, excluded count, and the command/request needed to
  regenerate it or extract it. **Do not commit.**

### Phase 6 — Extract (when asked, or as part of a review test)

The snapshot is not only for reading. A third person must be able to unpack it into a folder
whose routing table **resolves**, so their AI session behaves as closely as possible to the
session that crystallized.

**Do not ask the user to write the extractor.** Run the script that ships with this skill:

```text
node <plugin>/skills/transmute-lore/scripts/crystallize.mjs pack --bot <bot-dir> --out <snapshot.md>
node <plugin>/skills/transmute-lore/scripts/crystallize.mjs extract --from <snapshot.md> --out <folder>
```

If the `lore-plugin` CLI is on the path, the same verbs work as `lore-plugin crystallize pack|extract`.
An agent composing by hand still writes the markers in Phase 4; the script is the default for a
bot-sized tree and the only supported unpacker.

Unpack layout — a **mini-root** that mirrors the origin `raiz`:

```text
<out>/
  bots/proyectos/{slug}/     ← the bot (contract, canon, lore/, ecosistema.json)
  {origen}/...               ← every federated body at its live path
  LEEME.md
```

Rewrite every unpacked `scripts/ecosistema.json` so `raiz` is `<out>`. If that manifest has
`copia: true`, also rebuild `{bot}/lore-ecosistema/{destino}` from the same files so the
fallback column of `enrutamiento.md` works.

**Fail extract** if any live path named by the unpacked `enrutamiento.md` is missing under
`<out>`. Same yardstick as Phase 5: a table of absences is not a crystallization.

The extract folder is a derived tree, not a second Lore. Do not write it back over the live
`raiz`. Do not commit it unless the user asks.
