---
name: save-to-lore
description: Use when saving a lesson to the Lore or right after solving a problem worth keeping, AND when distilling Lore from an external body of criteria (a skill, a style guide, a third-party playbook). Two modes — CAPTURE (default: distill lived friction into an invariant clue) and ARBITRATE (judge imported criteria against this Entre's purpose; only what survives enters). Captures in the CURRENT project's lore/ and — for confirmed, generic clues — proposes promoting up to the mother AREA lore (project ↔ area routing). Trigger on "save to lore", "distill this to the lore", "guarda en lore", "distill this skill", "destila esta skill", or proactively after resolving a friction that passes the Lore threshold (constraint + signal + executability + genericity).
---

# save-to-lore — Incremental capture and promotion

Captures a friction into the **current project's** `lore/`, then promotes to the project's **mother
area** the clues that are already **confirmed + generic**. This is the incremental counterpart to
the structural skills: `transmute-lore` migrates a whole project; `save-to-lore` adds one clue at a
time and routes it to the right level.

> **Language rule:** write every clue, index line and law in the **language the target lore already
> uses** (consistency wins); if the lore has no established language yet, use the **user's
> language** — never English by default. The same applies to filenames: new module files are named
> in the target lore's language, and existing files are never renamed by this skill (that is
> `transmute-lore` TRANSLATE's job). Artifact names in this skill (`identidad.md`, `principios.md`,
> `proyecto.md`…) are Spanish canonical forms — use the corpus's actual localized names. Relative
> paths, confidence markers (`conjecture`/`confirmed`), the ` · ↑` glyph and general technical
> English terms stay as-is.

> **The area is the shared corpus.** A project lives in `{area}/proyectos/{name}/` and inherits from
> `{area}/lore/`. Generic, confirmed criteria belongs in the **area** (every project sees it);
> project-specific criteria stays in the **project**. This skill decides which is which.

## Two modes — pick by the SOURCE of the criteria

| Mode | Source | What it is |
|---|---|---|
| **CAPTURE** (default) | **lived friction** — a bug, a collapse, a client rejection | The scar. Everything below (threshold, routing, promotion) is written for this mode. |
| **ARBITRATE** | **imported criteria** — a skill, a style guide, a third-party playbook | Criteria already distilled **by someone else, under someone else's purpose**, arriving with no validity boundary declared. |

> **The law of ARBITRATE: an external body of criteria is not distilled — it is arbitrated.** Only
> what survives the collision with **this** Entre's purpose enters the Lore, and the record must
> state **where the source loses**. A faithful summary of a skill is not Lore: it is redundant
> literature wearing the authority of an Invariant Clue. What the source *loses* is worth more than
> what the source *offers* — the summary already exists (better written) in the source; the
> disagreement exists nowhere else.

### ARBITRATE — the four gates

1. **Capacity or criteria?** A source that brings **capacity** (it *executes* something: renders,
   crawls, compiles) is **not Lore** — record it as a dependency (how and when to invoke it) and
   stop. Only a source that brings **criteria** (it *judges*: what is good copy, good design, good
   SEO) is arbitrated. Confusing the two produces either a bloated Lore or a tool reimplemented by
   hand.
2. **Does this Entre have a written purpose?** Arbitration needs a yardstick. If `identidad.md` (the
   standard) is empty or missing, the only available move against an authoritative source is to
   **obey it** — so **stop and say so**: write the identity first, import second.
3. **Collide, don't copy.** Go through the source against the standard. Keep only what constrains a
   future decision **here**. Where source and standard conflict, **the standard wins** and the
   conflict is resolved into a new clue (that resolution is usually the most valuable line produced:
   it exists in neither body).
4. **Exit HARD-GATE — the defeats section.** The resulting module MUST carry an explicit section
   naming where the source contradicts our standard and loses. **No defeats = no entry:** either
   nothing was arbitrated (it was a copy), or the source carried capacity, not criteria.

**Confidence in ARBITRATE:** what is adopted *from* the source enters as **`conjecture`** (nobody has
paid for it with real friction yet). The **arbitration itself** — the defeats, derived from an
already-validated identity — enters as **`confirmed`**. Head the module with its provenance:
*"Distilled from `<source>`, arbitrated against `<identidad.md>`."*

## Two triggers

1. **Explicit:** the user says "save to lore…", "distill this to the lore", "guarda en lore" — or
   points at a source: "distill this skill", "destila esta skill" (→ ARBITRATE).
2. **Proactive:** you just solved a friction and propose saving it — **only** if it clears the
   **threshold** (below). Cosmetic changes (color, aesthetic reshuffle) do NOT count.

## Lore threshold (for the proactive trigger, all 4 must hold)

1. **Constraint** — does it forbid a future error or demand a standard? If it constrains no future
   action, it is redundant literature → do not save.
2. **Signal** — distillable to Context → Cause → Clue, without raw logs?
3. **Executability** — an unambiguous directive you can act on next time?
4. **Genericity** — would it help another project in the area (not a client-only quirk)?

## Routing — project vs area

**"The domain is the classifier."** A clue is generic if it belongs to a domain the **area owns**
(a thematic module the area carries, e.g. animation, layout, scroll, responsive, routing, testing,
copy — plus any backend domain the area declares). Project-only material lives in files the area
does not own and **never** promotes.

| What you're saving | Destination |
|---|---|
| Technical scar in a generic domain, **confirmed** | area module `{area}/lore/<domain>.md`; project `index.md` points to it (`../../../lore/<domain>.md`) |
| Technical scar in a generic domain, **conjecture** | project `lore/<domain>.md` for now; promote once confirmed |
| Scar tied to project-only code / a client quirk | project `lore/proyecto.md` (create if absent) — never promoted |
| A generic invariant **law** for all projects (confirmed) | propose adding to `{area}/lore/principios.md` (gated) |
| A law specific to this project | project `principios.md` (its own "## Este proyecto" layer) |
| A generic quality-standard refinement (confirmed) | propose adding to `{area}/lore/identidad.md` (gated) |
| Identity/standard specific to this project | project `identidad.md` (its project layer) |

**Default posture:** always **capture in the project first** (local, safe), then **propose**
promotion to the area. Never write the area silently.

## Flow (two steps, one pass)

### Step 1 — Capture (in the CURRENT project's lore/)

1. Distill the input into the triad **Domain → Symptom/Cause → Invariant clue**.
2. Choose the file by domain:
   - Generic domain → project `lore/<domain>.md`.
   - Project-specific → project `lore/proyecto.md` (create if absent). **Not** promotable.
   - A law/standard → the project layer of `principios.md` / `identidad.md` (see routing table).
3. Write the full entry in that file, and one line in the project's `lore/index.md` with the index
   format: `` `domain` · symptom · confidence · [file](file) ``.
   - Confidence **`conjecture`** by default; **`confirmed`** only if validated in the running app.
     **Honest confidence:** never inflate to `confirmed` just to force a promotion.

### Step 2 — Promotion review (always, after capturing)

1. Resolve the mother area: the project at `{area}/proyectos/{name}/` promotes to `{area}/lore/`.
   If the project has **no parent area** (standalone), skip promotion and say so.
2. Read the project's `lore/index.md`. Candidates = lines that meet all three:
   - confidence **`confirmed`**, **and**
   - the domain is one the **area owns** (a module present in `{area}/lore/`, or a declared area
     domain), **and**
   - the line does **not** end with the `↑` glyph (not yet promoted).
3. For each candidate:
   a. Route by domain → target file `{area}/lore/<domain>.md`.
   b. **Dedupe:** grep the symptom text in the target file. If already there → **skip** and report
      it (no duplicates).
   c. If the target file does not exist (first clue of that domain) → create it with the same
      section header the project's lore files use.
   d. Copy the **full clue entry** (Context → Cause → Clue) from the project's `lore/<domain>.md`
      to the end of the target file.
   e. Add the line to `{area}/lore/index.md`, under the matching topic heading (create it if
      missing), linking to `<domain>.md`.
   f. In the project's `lore/index.md`, mark the line as promoted by appending ` · ↑`.
4. **Do not commit yet.** Show the user a summary (what was captured, what would be promoted, what
   was deduped, what is pending). Stage the area repo commit ready
   (`git -C {area} add lore/` + a drafted message) and run it **only** when the user approves.
   Never `git push`.

## Idempotency

The ` · ↑` glyph in the project's `index.md` marks what is already promoted. Re-running the skill is
a safe no-op for those clues.

## Edge cases

- **No parent area** (standalone project) → capture in the project only; skip promotion, report it.
- **Clue already in the area** (same symptom) → skip, report.
- **`confirmed` in a project-only file** (e.g. `proyecto.md`) → ignore for promotion.
- **`conjecture`** → never promote.
- **Same clue in the area with different text** (it evolved) → do NOT overwrite; flag for the user's
  manual review and report.
- **No candidates** → report "nothing to promote", no-op.

## Invariants

- **Capture first in the project; promotion to the area is always gated** — never written silently.
- **Criteria is never invented**; only distilled from what happened.
- **Imported criteria is arbitrated, never adopted** (ARBITRATE): it was distilled under someone
  else's purpose. No defeats section → no entry.
- **Clues and new filenames follow the lore's established language** (or the user's, if none) —
  never English just because this skill is. Existing files are never renamed here.
- **Honest confidence:** `confirmed` only after real validation; never inflated to force promotion.
- **Discarded noise is reported**, not silently dropped.
- **No auto-commit, no push.** The user reviews and decides.
