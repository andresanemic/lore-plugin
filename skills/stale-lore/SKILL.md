---
name: stale-lore
description: >-
  Use when the kit's published surface must be reconciled against actual usage in the user's tree.
  Trigger on "stale-lore", "retira capacidades", "capacidades sin ejercicio", "purge unused skills",
  or after a major refactoring that renames or replaces published capabilities. Not yours: operating a
  project's criteria body belongs to transmute-lore; saving one lesson belongs to save-to-lore.
---

# stale-lore — Retiro declarativo de capacidades sin ejercicio

> Invoke with the Skill tool as `stale-lore`, or with the phrases «retira capacidades» / «capacidades sin ejercicio» when the published kit surface must be reconciled against actual usage.

The kit announces capabilities — eight skills, contracts, a `<!-- lore:always-on -->` block — and
those promises accumulate. Some get exercised daily. Others were written for a problem that no
longer exists, or were superseded by a better mechanism. A kit that promises everything and uses
nothing is not a kit: it is a catalog nobody verified.

This skill reconciles promise against evidence. It derives the list of central capabilities from what
the kit publishes, searches the user's tree for proof of exercise, marks each receipt with its
`ejercido` state, and withdraws the ones that crossed the stale threshold — with a declarative
trace so the withdrawal itself is auditable.

> **The withdrawal is declarative, not surgical.** It writes a changelog entry and marks the
> receipt. It does not delete the skill from the kit, does not edit the user's `lore/`, and does not
> touch any tree the user owns. If the user ignores the withdrawal, that is their jurisdiction.

> **The field `ejercido` lives in the kernel receipt, not in the skill.** This skill writes it as
> an extension compatible with kernel 0.1.4. Kernel 0.1.5 will read it natively. The contract is
> `{ ejercido: 'ejercido' | 'no-ejercido' | 'stale', ejercicio_en: ISO date }`.

> **Language rule:** write every output, index line and changelog entry in the language the target
> uses (the kit is Spanish, so this skill's output is Spanish). The receipt field `ejercido` is
> Spanish canonical — never rename it to English.

> **External artifacts:** before delivering a user artifact, replace every internal label with the
> audience's language while preserving its meaning; the final changelog, report or document
> contains zero internal labels.

## Where the capability list comes from

A capability is central when the kit publishes it as a skill: `skills/<nombre>/SKILL.md`. The
directory is the source — a skill that exists on disk is a published promise. The list is derived
from the tree, never hardcoded: a new skill enters the list the day its `SKILL.md` lands, and no
list has to be updated by hand.

The contract's `<!-- lore:always-on -->` block and the README announce the kit, but they do not
define the capability list — they are the surface the list is reconciled *against*, not its source.

This skill does not trust autodeclaration: a skill that exists on disk but never left its artifact
is a promise, not an exercise.

## What proves exercise

A capability is exercised when it leaves **the artifact it produces** in the user's tree. A mention
is not an artifact. A name that appears in active documentation, in a `FASES.md` line, or in the
capability's own `SKILL.md` proves nothing about use — the kit's own README names all nine skills
and exercises none of them. Reading a name is not running a capability.

| Capability | The artifact that proves it was exercised |
|---|---|
| `save-to-lore` | a Pista (`**Pista**`) in `lore/` |
| `use-lore` | the `<!-- lore:always-on -->` block in a contract |
| `transmute-lore` | a crystallization in `cristalizaciones/`, or a `.lore-mycelium` marker |
| `brainstorming-lore` | an agreement in `specs/` |
| `create-area` | a tree with `lore/` and `proyectos/` |
| `create-bot` | a tree with `canon/`, `lore/` and `CLAUDE.md` |
| `vespi` | a receipt in `.lore/receipts/` or a `recibo` in `operations/` |
| `create-project` | **no detector declared** |
| `stale-lore` | **no detector declared** — it measures; it is not measured |

**A capability without a declared detector is never declared `stale`.** This skill does not assert
what it did not measure. Reporting `sinDetector` is a result, not a gap: it says «the kit has not
decided what artifact this capability leaves», which is a decision for the kit's owner, not a
verdict from this skill.

**A `FASES.md` mention is not exercise.** It is the exact false green this skill exists to avoid:
a tree can name every capability in its state file and have exercised none.

## The `ejercido` field

The kernel receipt carries a field named `ejercido` with three possible values:

| Value | Meaning |
|---|---|
| `ejercido` | Receipt exists and is within the threshold |
| `no-ejercido` | Receipt exists but the capability was declared unused by a human decision |
| `stale` | No receipt within the threshold, or no receipt at all |

This skill writes the field with `marcaEjercido(recibo, estado)`. It returns a **copy** of the
receipt — never mutates the original. Kernel 0.1.5 will read this field natively; in 0.1.4 it
travels as a compatible extension.

## The withdrawal flow

The default threshold is **7 days** (`STALE_POR_DEFECTO_DIAS`). Configurable per invocation.

### Move 1 — Derive central capabilities

Run `leeCapacidadesCentrales(raiz)` against the kit root. This reads `skills/<nombre>/SKILL.md` and
returns a sorted list. If the tree has no `skills/`, the list is empty — no capability is invented.

### Move 2 — Search exercise trace

For each capability, run `buscaRastroCapacidad(capacidad, raiz, { ahora })`. This runs the
capability's detector against the user's tree and returns `{ encontrado, ultimoUso, fuentes,
sinDetector }`. A capability with `encontrado: false` and `sinDetector: false` was **never
exercised**; one with `sinDetector: true` has no detector and is not evaluated.

### Move 3 — Verify stale state

For each capability, run `verificaStale(capacidad, { encontrado, ultimoUso, sinDetector, umbralDias, ahora })`.
Returns `{ stale, dias, nuncaEjercida, umbral, sinDetector }`. A capability is stale when its detector
ran, found no artifact, and the threshold has passed. It is **not** stale when `sinDetector` is true —
there is nothing to measure against.

### Move 4 — Mark receipts

For each stale capability, run `marcaEjercido(recibo, 'stale')` against its receipt file. For
capabilities within threshold, mark `ejercido`. This step is a **copy** — the original receipt is
not mutated; the updated copy is written back.

### Move 5 — Execute withdrawal

For each stale capability, `ejecutaRetiro(raiz, entradas)` writes a `## Capacidades retiradas`
section to `CHANGELOG.md` with:

- What was withdrawn
- When it was withdrawn
- How many days without exercise
- Why (no trace, or last trace N days ago)
- Migration path if a replacement exists, or `sin soporte` if not

**The withdrawal does not delete the skill.** It writes a changelog entry and marks the receipt.
The skill remains on disk; the changelog declares it unmaintained.

## The orchestrator

`ejecutaStaleLore(raiz, opciones)` runs the full cycle. Returns `{ evaluadas, retiros, dryRun }`.
With `dryRun: true` it evaluates and reports without writing anything. Use it for a first pass
before committing the withdrawal.

## When to use

- **Scheduled pass** — run weekly or per-version to reconcile the kit's published surface.
- **After a major refactoring** — when capabilities were renamed or replaced.
- **Before a release** — the kit's published promises must match its exercised surface.
- **When the kit bloats** — the symptom of a capability nobody invokes is the same as PRUNE's, but
  scoped to the kit itself rather than the user's `lore/`.

## Boundaries

- **This skill does not edit the user's `lore/`.** That is `transmute-lore` territory.
- **This skill does not save lessons.** That is `save-to-lore` territory.
- **This skill does not edit contracts.** It reads them for capability names; it never writes them.
- **The user can ignore a withdrawal.** If they do, the changelog entry stands as the kit's
  declaration; the user owns the decision to keep or remove the capability from their own tree.
- **A capability that is published but never exercised is stale, not broken.** This skill does not
  judge quality — only exercise.

## What earns a withdrawal

| Condition | Action |
|---|---|
| Detector ran, no artifact ever | Withdraw with `nunca-ejercida: true` |
| Detector ran, last artifact > threshold | Withdraw with days count |
| Replacement capability exists | Withdraw with migration path |
| Replacement does not exist | Withdraw with `sin soporte` |
| Detector found the artifact | Mark `ejercido`, no withdrawal |
| **No detector declared** | **Report `sinDetector`; never withdraw** |
| **The capability is `stale-lore` itself** | **Never withdraw** — it measures, it is not measured |

The `diasSinUso` of a withdrawal is a **measured** number or `null`. It is never a placeholder: an
invented figure (`999`) is the same lie this skill exists to catch.

## The contract with kernel 0.1.5

Kernel 0.1.5 will expose `ejercido` as a first-class receipt field. When that lands, this skill's
`marcaEjercido` function aligns with the native contract — no migration needed. Until then, the
field travels as an extension and is written by this skill, not the kernel.

The shape the kernel will accept:

```json
{
  "capability": "use-lore",
  "status": "verified",
  "at": "2026-10-06T12:00:00Z",
  "ejercido": "ejercido",
  "ejercido_en": "2026-10-06T12:00:00Z"
}
```
