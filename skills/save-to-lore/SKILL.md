---
name: save-to-lore
description: Use when saving a lesson to the Lore or right after solving a problem worth keeping, AND when distilling Lore from an external body of criteria (a skill, a style guide, a third-party playbook). Two modes — CAPTURE (default — distill lived friction into an invariant clue) and ARBITRATE (judge imported criteria against this Entre's purpose; only what survives enters). Captures in the CURRENT project's lore/ and — for confirmed, generic clues — proposes promoting up to the mother AREA lore (project ↔ area routing). Trigger on "save to lore", "distill this to the lore", "guarda en lore", "distill this skill", "destila esta skill", or proactively after resolving a friction that passes the Lore threshold (constraint + signal + executability + genericity).
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
> paths, confidence markers (`conjecture`/`confirmed`), the ` · ↑` glyph, the `<!-- lore:always-on -->`
> marker pair and general technical English terms stay as-is.

> **The area is the shared corpus.** A project lives in `{area}/proyectos/{name}/` and inherits from
> `{area}/lore/`. Generic, confirmed criteria belongs in the **area** (every project sees it);
> project-specific criteria stays in the **project**. This skill decides which is which.

## Before anything: the mode is decided here, not before you arrived

If you already drafted the entry and are invoking this skill to check it, **stop and classify the
source first.** The mode is not formatting applied to a finished draft — it changes what the entry
must contain. A draft written assuming CAPTURE, when the criteria was actually imported, is missing
its provenance header, its confidence split and its defeats section. And a module with no defeats
does not enter at all.

The tell that you skipped this step: the draft reads like a good summary of the source. That is the
failure state of ARBITRATE, not its output.

## Two modes — pick by the SOURCE of the criteria

| Mode | Source | What it is |
|---|---|---|
| **CAPTURE** (default) | **lived friction** — a bug, a collapse, a client rejection | The scar. Everything below (threshold, routing, promotion) is written for this mode. |
| **ARBITRATE** | **imported criteria** — a skill, a style guide, a third-party playbook, **another kit's constitution or governing document** | Criteria already distilled **by someone else, under someone else's purpose**, arriving with no validity boundary declared. |

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

> **A governing document is the hardest case of ARBITRATE, and the one most often skipped.** When a
> second kit ships a constitution, a charter or a set of rules that declares its own authority, the
> reflex is to treat it as configuration and adopt it. It is not configuration: it is criteria
> written under someone else's purpose, and a clause claiming supremacy is precisely the kind that
> **loses** — a kit installed this week cannot govern criteria paid for with friction before it
> existed. That defeat is written down, not merely omitted: an omission leaves a hole, and the next
> template regeneration fills it back in.
>
> The one thing that does **not** happen is deferring to it while deciding. Arbitration is judgment,
> not negotiation.

**Confidence in ARBITRATE:** what is adopted *from* the source enters as **`conjecture`** (nobody has
paid for it with real friction yet). The **arbitration itself** — the defeats, derived from an
already-validated identity — enters as **`confirmed`**. Head the module with its provenance:
*"Distilled from `<source>`, arbitrated against `<identidad.md>`."*

## Before either mode — is this a fact, or is it criteria?

The routing below is built for **criteria**, which lives in exactly one place by design. A
**verifiable fact** — an address, a figure, a date, who does what — behaves the opposite way: it is
repeated in every artifact that ever cited it, and in the source document that handed it out. Fixing
it where the error was noticed does not fix it.

> **The unit of work for a fact is the set of its appearances, never the file where it was noticed.**

A correction is made where the error turns up, and that place feels like *the* place. But the fact
did not come in from there — it came **down** from a source corpus that distributed it to every Lore
that cited it. Correcting downward from one leaf leaves the root intact and every other leaf with it,
and the root hands the fact out again the next time anybody distills. None of the survivors produce
an error: they get quoted as if they were true.

When what you are saving is a fact rather than a clue:

1. **Search the whole tree for the fact before writing the correction** — `grep` the figure, the
   name, the address. Count the appearances.
2. **Fix all of them in one pass**, and report the count. One fixed out of five is not a fix.
3. **If it also appears in a source document that is not edited**, mark it there too — struck
   through and dated, not deleted. A source that silently contradicts the Lore is the mechanism that
   re-injects the error.

*Boundary:* this covers **repeated, verifiable facts**. It does not authorize duplicating a clue —
criteria lives in one place on purpose — and it does not say a source corpus may be rewritten freely:
it says that if it is corrected, the correction is **visible**. Marking the source is a decision, not
a validated pattern: in another project the source may need to stay untouched with the note kept
somewhere else.

## Two triggers

1. **Explicit:** the user says "save to lore…", "distill this to the lore", "guarda en lore" — or
   points at a source: "distill this skill", "destila esta skill" (→ ARBITRATE).
2. **Proactive:** you just solved a friction and propose saving it — **only** if it clears the
   **threshold** (below). Cosmetic changes (color, aesthetic reshuffle) do NOT count.

### The input can be a note, not only a conversation

One or several **free notes** — an Obsidian inbox, a folder of Markdown, meeting minutes — are a
valid input to either mode. The note is **source, never criteria**: it does not skip the threshold,
it does not enter verbatim, and it is never cited as a rule. Pick the mode by what the note records —
a friction the user lived through → CAPTURE; someone else's criteria the user collected → ARBITRATE.

A note that records a friction **still open** is state, not criteria → `FASES.md`. A note that is a
summary, a link or an agenda is **information**, and information is not distillable: report it as
noise, or hand it to `create-area` / `create-project` / `transmute-lore` as source material.

`obsidian-lore` is what sweeps a `notes/` or `notas/` inbox and routes it here, so invoke it first
whenever the source lives there. A standalone source note outside an inbox may be handled directly.

## Lore threshold (for the proactive trigger, all 4 must hold)

1. **Constraint** — does it forbid a future error or demand a standard? If it constrains no future
   action, it is redundant literature → do not save.
2. **Signal** — distillable to Context → Cause → Clue, without raw logs?
3. **Executability** — an unambiguous directive you can act on next time?
4. **Genericity** — would it help another project in the area (not a client-only quirk)?

> **What the threshold is holding back is not bad entries — it is the pull that produces them.**
> Having lived something creates an urge to keep it, and that urge peaks right after the friction,
> which is the exact moment this skill runs. An entry that fails the threshold almost never looks
> wrong; it looks like something worth keeping, written by someone who was there. Saying no to it is
> not hygiene applied to a folder. It is accepting a loss on purpose, one entry at a time, so that
> what stays keeps its force.

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

## Flow (three steps, one pass)

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

#### Writing a law into a body that already has laws

A Lore grows by accumulation, so a new law usually leans on a distinction an older one already made.
**It inherits the older law's statement and not its boundary** — the boundary is written last, as a
note about *that* law, while the reasoning the new one needs sits in the body above it. So the
conclusion gets carried over and the condition attached to it does not, and the new law reads as
absolute in precisely the case the first one had declared exceptional. Nothing in the text warns
about it: the result looks complete and consistent and fails only in the rare case, which is the one
the boundary named.

Two habits, and the second is the cheap one that pays every time:

- **When the clue cites another law, open it and look for its boundary of validity.** If it has one,
  the new clue inherits it or says why it does not.
- **State the rule by its condition, never by the category the condition usually holds in.** *«Does
  any of this fall outside the scope?»* survives the rare case; *«only for projects»* does not,
  because the category was a shorthand for the condition and nobody remembers that it was.

*Boundary of validity:* this applies to bodies of criteria whose laws cite each other, which is any
Lore that grows by accumulation. A flat list of independent rules has no inheritance to break.

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

### Step 3 — Inbox debt (one line, only if an inbox exists)

If the current project, area, or bot has a free-note inbox (see `obsidian-lore`), count the notes with an
empty `destilado` and close with one line: *«N notas sin minar, la más vieja de hace X días.»*
Nothing else — no listing, no proposal.

> **Why here and nowhere else.** A note satisfies the urge to preserve without producing criteria,
> so the debt grows unnoticed and the criterion inside stays inert. The only moment that number
> changes anything is the moment someone is already distilling. Reporting it anywhere else is noise;
> not reporting it is how an inbox rots.

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
- **A note is source, never criteria.** A free note clears the same threshold as anything else, never
  enters verbatim, and is never authoritative.
- **A validity boundary does not travel on its own to the laws that lean on it.** A clue citing an
  older law opens it and inherits its boundary or says why not — and it states its rule by the
  **condition**, not by the category the condition usually holds in. A rule named after the category
  fails exactly where the boundary it never carried had said it would.
- **Correcting a fact is not capturing criteria.** A clue lives in one place; a verifiable fact lives
  in every artifact that cited it and in the source that handed it out. The unit of work is the **set
  of appearances** — sweep the tree before writing, fix them all in one pass, and mark the source
  corpus struck through and dated if it is not edited.
- **Honest confidence:** `confirmed` only after real validation; never inflated to force promotion.
- **Discarded noise is reported**, not silently dropped.
- **No auto-commit, no push.** The user reviews and decides.
