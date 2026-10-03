### 3.5 `save-to-lore`

**Contextual capture:** hold candidates until a real milestone or a cluster of related clues; the preview shows destination, wording and why now, and approval covers the shown batch's writes and commits, never push.

**Role:** Distill newly acquired experience into reusable criteria.

**Two modes, chosen by the SOURCE of the criteria:**

| Mode | Source | Operation |
|---|---|---|
| **CAPTURE** (default) | lived friction (bug, collapse, client rejection) | Distills the scar into an Invariant Clue. Everything described below refers to this mode. |
| **GRAFT** | imported criteria (a *skill*, a style guide, a third-party playbook, **another kit's constitution or governing document**) | **Judges** that criteria against the project's purpose. Only what survives gets in. |

> *Why "graft".* A graft takes root or is rejected, and what grows afterwards belongs to the host — the exact counterpart of `transmute-lore` PRUNE: pruning removes what the plant grew on its own, grafting judges what came from outside. A Lore with one and not the other either bloats or ossifies.
>
> *Renamed in 2.1.1 (`arbitrate`, then `transplant`): same law, same four gates — a transplant moves a plant without changing it; this mode changes what it lets in.*

**`GRAFT` mode — four gates:**

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

**A governing document is the hardest case.** A second kit's constitution is criteria written under someone else's purpose, and its supremacy clause is precisely the kind that **loses** — a kit installed this week cannot govern criteria paid for before it existed. The defeat is **written down**, never omitted: an omission leaves a hole the next template regeneration fills back in. Arbitration is judgment, not negotiation.

**On a schedule, `GRAFT` starts by reading what already lost.** The defeats sections it writes **are** the ledger: read them first, never re-arbitrate or re-report what is in them. **"Nothing entered this time" is a valid result and is written as such** — a pass that always finds something stopped looking and started justifying itself.

**A third-party skill you *invoke* carries criteria too, and applies it without asking.** The harder case is criteria arriving as a **tool that runs** — every opinionated tool ships a body of criteria nobody arbitrates because it looks like capacity. **Feed it your Lore in the invocation:** most tools let a provided sample outrank their defaults; the ones that do not stay away from anything the Lore governs.

**Confidence in `GRAFT`:** what is adopted *from* the source enters as `conjecture` (nobody has
paid for it with real friction yet); **the arbitration itself** — the defeats, derived from an
already-validated identity — enters as `confirmed`. The module states its provenance: *"Distilled
from `<source>`, arbitrated against `<identidad.md>`."*

**Input:**

- A short description of the problem or lesson (`"Hydration bug on Next.js landing"`), or the source to arbitrate (`"distill the copywriting skill"`).

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

**`destino:` and landing verification — 2.3.0.** A clue demanding a verifiable artifact or step declares **where it is run**: module and step. Before the threshold closes, the declared term is **grepped in the declared file** and reported as `arrived` or `written, never exercised`; in the second case it stays `conjecture` with **promotion blocked** until the destination exists.

**The junction is written on both sides:** the clue carries its `destino:`; the step carries one line naming the clue. The two sides often live in different trees, and a session loads only its own always-on block — a pointer written in one direction leaves whoever stands at the step looking at a procedure with no visible obligation behind it, which a prune there removes as surplus. From that side, it is.

**Confidence system:** each clue is `conjecture` (default) or `confirmed` (only once validated in the running app) — never inflated to force a promotion.

**Routing and promotion:** criteria is captured in the project first; only what is **confirmed and generic** is proposed for promotion to the Area's `lore/`, which is never written silently. In the project's `index.md`, an already-promoted line carries the ` · ↑` glyph — re-running the skill on that clue is a safe no-op.

**Correcting a fact is not capturing criteria.** Criteria lives in exactly one place by design; a **verifiable fact** — an address, a figure, a date — behaves the opposite way: it repeats in every citing artifact and in the source that handed it out. Fixing it where noticed leaves every other copy wrong. **The unit of work is the set of appearances:** sweep the tree before writing, fix them all in one pass, and if the fact also sits in an unedited source corpus, mark it there too — struck through and dated, never deleted.

**Invariants:** criteria are never invented; everything comes from real experience; discarded noise is reported, never silently removed; every change passes through a threshold before being written; nothing commits automatically and `git push` is never run; a human always reviews the final diff. A clue citing an older law inherits its **boundary of validity** or says why not, and states its
  rule by the **condition**, not by the category the condition usually holds in.

**Loose-note function (conditional reading):** when the request targets `notes/`, `notas/` or
`apuntes/`, `save-to-lore` loads `skills/save-to-lore/notas.md`. The procedure is app-neutral;
Obsidian is optional. It sweeps the whole inbox — even when it is only one folder — extracts `.md`,
`.txt` and `.docx`, reports debt, classifies experience, state, imported criteria or information,
routes, proposes the diff and waits for approval. On close it marks `destilado:` and moves closed
notes to `archivadas/`; it never deletes them. A note remains source, not criteria.

Use `save-to-lore` as the main mechanism for feeding your Lore after important decisions.

**Verifiable safeguards (executable core: `skills/save-to-lore/scripts/save-to-lore.mjs`):** every new clue carries one line `evidencia: <relative path>` naming the report, case or note that earned it — the line starts at column 0-3 with spaces, no `>`, no leading tab (4+ spaces is indented code and never counts), outside fenced examples (```/~~~, including fences nested in blockquotes) —, and `verificaEvidencia` checks the line exists, stays a relative path (absolute paths and URLs rejected; `..` to a sibling folder allowed, e.g. `../notas/caso.md` from `lore/`), and resolves to a real file — gate the new clue's own section as `node skills/save-to-lore/scripts/save-to-lore.mjs --pista <pista.md> --seccion "<the new clue's exact heading>"` (`--seccion` matches the heading text exactly, only case and outer spaces ignored; `--lineas <A-B>` selects by line interval instead — read against the whole file, so a range starting inside a fenced example fails as selection —, and a duplicate exact heading fails as ambiguous asking for `--lineas`), which exits nonzero when the new clue's evidence is missing — a clue with no resolving evidence does not enter. The bare `--pista <pista.md>` without selection checks the whole file and serves only as diagnostics, never as the gate for the new clue. The checker is a limited fence-aware scan, not a general Markdown parser. Migration: an `evidencia:` indented 4+ spaces or with a leading tab used to count and no longer does — move it to column 0; a `--lineas` range starting inside a fenced example used to pass with the example's pointer and now fails as selection. Notes are never deleted to make room for criteria: a note leaves the inbox only by a non-empty `destilado:` plus archive to `archivadas/`, and `autorizaBorrado` blocks every delete — first while the note is still unarbitrated, then because an arbitrated note is archived, never deleted. A generic learning that would travel beyond the area asks one explicit question before it moves (`preguntaNivel` / `resuelveNivel`): what holds for anyone goes to the kit as a PR or proposal, never auto-committed to the kit repository; what holds for this person goes to the root of their garden, outside the kit. No answer, no move: an ambiguous or negated answer asks again instead of assuming a destination.

---

