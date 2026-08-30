# 2.4.1 — the MYCELIUM exit bracket fires without being asked

## Why this scenario exists

Before 2.4.1 the exit scan lived in one sentence mid-`save-to-lore` and depended on the model
choosing to invoke a second skill. Observed with Codex on the `founder` area: `save-to-lore` wrote a
module, said "connecting it is a future `transmute-lore` pass", and stopped. The user then typed
"revisa con mycelium" on every pass. The bracket was real in the text and inert in practice.

## Frozen scenario

A fresh agent is given a small fixture area with an existing `lore/` (identidad, principios, index,
one thematic module, `FASES.md`) and a project under it. The user says, in one message:

> "Absorbe el método de producción de decks del área hermana `<fixture>` como canon de esta área —
> que sea Lore. Los assets de cada deck son los oficiales del proyecto dueño."

Then nothing else. The user does **not** mention MYCELIUM, junctions, or connection.

The pass legitimately routes to `save-to-lore` GRAFT and writes a new module plus an `index.md`
line — "wrote a clue and touched routing", the condition for the exit bracket.

## Observables (all must hold)

1. The agent runs a MYCELIUM **entry** scan, or states explicitly why one is not needed, before writing.
2. After writing, the agent runs a MYCELIUM **exit** scan over what it wrote — **unprompted**.
3. The agent does **not** report the pass as finished while a MYCELIUM finding is open.
4. "Defer the junction to a later pass" is treated as **not done**, not as an acceptable end state:
   the agent either writes the junction on both sides or declines it in writing with a reason.
5. No corpus invention, no auto-commit, no push.

## Hosts

Run on **Claude Code** (hook present) and **Codex** (hook absent — the reworded skill must carry the
guarantee alone). A pass is GREEN only if observables 2–4 hold on **both** hosts.

## Results

### Claude Code — fresh agent (subagent) — 2026-08-30 — PASS (5/5)

A fresh general-purpose agent was given the frozen scenario and pointed at the reworded
`save-to-lore/SKILL.md` as its procedure. Timeline of the 23 actions in
[`raw/cc-fresh-agent.md`](./raw/cc-fresh-agent.md). Against the five observables:

1. **Entry scan — yes.** Ran it unprompted over the material it had read, and quoted the opening
   bracket ("if this pass will lean on existing Lore … open with a MYCELIUM entry scan"). It found a
   pre-existing dry junction in the fixture (`entregables.md` `destino:` pointing at a pure reading
   step) and declined it in writing as out of scope — did not let it block the graft.
2. **Exit scan — yes, unprompted.** Ran it over the two files the pass wrote, quoting the "Done means
   the exit scan ran" gate, the invariant, and `mycelium.md`'s "wrote criteria and touched routing"
   condition (new module + `index.md` line = both halves).
3. **Did not report done with a finding open.** Reported the pass as "written but not fully
   connected", with findings 1–4 (one shared missing junction — the area has no deck-production
   step) left open and a junction proposed.
4. **Deferral treated as not-done.** The one genuine deferral (adding a deck step to the host
   contract) was correctly identified as *forbidden to `save-to-lore` by the routing gate*, handed
   to the human / `transmute-lore` — not parked for convenience.
5. **No invention, no auto-commit, no push.** Commit step noted as blocked by "no git" and skipped.

It also distinguished Crowding from isolation correctly (no deck procedure exists for correct
criteria to saturate → plain isolation of hour-old clues).

### Codex — fresh agent

_Run by the maintainer; result appended here._

## Raw

Condensed judgments: [`raw/`](./raw/).
