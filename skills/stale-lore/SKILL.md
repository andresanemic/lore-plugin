---
name: stale-lore
description: >-
  Use when verifying which published kit capabilities have gone unexercised and withdrawing them
  declaratively. Trigger on "stale-lore", "retira capacidades", "capacidades sin ejercicio",
  "purge unused skills", or when the kit's published surface needs to be reconciled against actual
  usage in the user's tree. Not yours: operating a project's criteria body belongs to transmute-lore;
  saving one lesson belongs to save-to-lore.
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

## The three sources of capability

A capability is central when it appears in one of these three sources. A capability in none of them
is not a published promise, and this skill does not touch it.

| Source | Where | What it proves |
|---|---|---|
| `<!-- lore:always-on -->` | Contract (`CLAUDE.md` / `AGENTS.md`) | The kit governs this tree, and the contract names the skills |
| README / `README.md` | Kit root | What the kit publicly announces as a capability |
| `skills/<nombre>/SKILL.md` | Skills directory | A published skill with frontmatter |

This skill derives the list from all three. It does not trust autodeclaration: a skill that exists
on disk but never left a receipt is a promise, not an exercise.

## The three sources of exercise

A capability is exercised when it leaves a trace in the user's tree. No trace means no exercise,
regardless of what the capability's documentation claims.

| Source | Where | What it proves |
|---|---|---|
| Kernel receipts | `.lore/receipts/<capacidad>.json` | The capability ran under Vespi and sealed a receipt |
| `FASES.md` | Tree root | The capability was invoked as part of a named operation |
| Tree content | Any file in the tree | The capability's name appears in active documentation (counts as recent trace) |

Receipts are the strongest signal. `FASES.md` mentions count as trace but carry no date — the mere
mention is taken as recent exercise. Tree-content matches are weak and only set the timestamp to
"now" when no receipt exists.

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

Run `leeCapacidadesCentrales(raiz)` against the kit root. This scans the three sources above and
returns a de-duplicated, sorted list. If a capability appears in none of the three sources, it is
not a published promise and is not evaluated.

### Move 2 — Search exercise trace

For each capability, run `buscaRastroCapacidad(capacidad, raiz, { ahora })`. This searches the three
trace sources above and returns `{ encontrado, ultimoUso, fuentes }`. A capability with `encontrado:
false` and `ultimoUso: null` was **never exercised**.

### Move 3 — Verify stale state

For each capability, run `verificaStale(capacidad, { ultimoUso, umbralDias, ahora })`. Returns `{
 stale, dias, nuncaEjercida, umbral }`. A capability is stale when `dias > umbral`, or when
`nuncaEjercida` is true.

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
| No trace in any source, ever | Withdraw with `nunca-ejercida: true` |
| Last trace > 7 days (or configured threshold) | Withdraw with days count |
| Replacement capability exists | Withdraw with migration path |
| Replacement does not exist | Withdraw with `sin soporte` |
| Within threshold, receipt exists | Mark `ejercido`, no withdrawal |

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
