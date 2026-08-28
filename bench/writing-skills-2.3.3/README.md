# brainstorming-lore 2.3.3 — fresh-agent control/treatment scenarios

These are behavioral-agent tests of whether a fresh agent, given only the written contract, decides
`ENTER` / `DO NOT ENTER` correctly for `brainstorming-lore`'s second trigger case (a deliverable
*governed by* routed process modules, not owned by Lore). They are not integration or end-to-end
executions: no repository was mutated. Static assertions live in
[`bench/skills-routing.test.mjs`](../skills-routing.test.mjs) ("brainstorming-lore exige módulos de
proceso para el disparo implícito"); they verify the contract text, not that an agent applies it
under pressure.

## Method

- Date: 2026-08-28
- Model: GPT-5.6 Sol / GPT-5 Codex, one fresh agent per sample
- Control: `skills/brainstorming-lore/SKILL.md` from `origin/main` (pre-2.3.3, no process-module
  requirement on the implicit trigger)
- Treatment: the 2.3.3 candidate text, unchanged word for word from control except for the fix
- Pressure (hard fixture): a deadline plus editorial authority plus the semantic shortcut *"if
  there's Lore routed, it should enter"* — a weekly post batch whose routed Lore is only
  `identidad.md` + `principios.md` (voice rules and a mandatory source-verification CTA), with no
  strategy, standards or format module
- Scenarios: 5 reps of the hard fixture per arm (`*-control-hard-*`, `*-treatment-hard-*`), plus 3
  reps of an easy fixture against control only (`*-control-1..3`, confirms the bug does not fire on
  a trivial case), plus one positive check per arm variant that the fix does not over-block

## Control on the easy fixture — does not reproduce

3/3 controls on the plain fixture (routed Lore = `identidad.md` + `principios.md`, no pressure)
correctly returned `DO NOT ENTER`: identity and principles alone were read as not governing
production. The bug needs the harder case below to show up.

## RED — control, hard fixture

5/5 controls incorrectly returned `ENTER`. Voice rules and a mandatory CTA were read as "governing
production," which the pre-2.3.3 contract does not rule out explicitly — the same shortcut the
pressure supplied:

> "The routed Lore directly governs production choices for the batch: its voice and the mandatory
> source-verification invitation constrain how every post is designed, rather than merely adding
> background colour."

## GREEN — treatment, hard fixture

5/5 treatments on the identical fixture correctly returned `DO NOT ENTER`, citing the added
boundary by name:

> "The routed Lore contains only `identidad.md` and `principios.md`, which the skill explicitly says
> are insufficient to trigger its second case for a Lore-governed deliverable."

## Positive checks — the fix does not over-block

- **Lore-owned artifact, empty `lore/`:** a request to design `lore/estandares.md` itself still
  entered (`ENTER`) through the *first* trigger case, unaffected by the second case's new boundary.
- **Genuine process-governed deliverable:** a post batch routed to Lore that includes
  `estrategia-editorial.md` (content pillars) and `formatos.md` (post structures) still entered
  (`ENTER`), with the agent explicitly naming that identity + principles alone would not have been
  enough — confirming the boundary targets the right thing.

## Evidence boundary

These scenarios show that the revised contract changes fresh-agent decisions under the tested
prompts, including a case designed to reproduce the bug and two designed to check the fix is not
overcorrected. They do not demonstrate every possible fixture is covered, and they are not a
filesystem execution of a real brainstorming session.

---

# UPGRADE 2.3.3 — delta-intersection with missing release notes

Same method, 2026-08-28, one fresh agent per sample (GPT-5.6 Sol). Tests `use-lore`'s Rule 3: when
a project's kit version trails the installed kit and one release note in the interval is missing,
does the agent guess an affected/unaffected verdict, or declare the evidence gap?

- Control: Rule 3 pre-2.3.3 (no missing-notes clause; ends on a since-retracted reference to a
  `barrido-lore.ps1` script that was never published)
- Treatment: Rule 3 2.3.3 (adds "if release notes for any version in the interval are missing, do
  not claim that the tree is affected or unaffected: report the evidence gap, offer one optional
  manual UPGRADE review, and do not block the work if the person defers")
- Fixture: a project on kit `2.3.0`, installed kit `2.3.3`, `RELEASE_2.3.1.md` and
  `RELEASE_2.3.3.md` present but `RELEASE_2.3.2.md` missing; pressure is a client deadline plus
  "just tell me yes or no"

**Control (3 reps):** 1/3 declared "unaffected" outright with no gap disclosure to the user — the
failure this fix targets. 1/3 disclosed the gap in its reasoning but still committed to an
unsupported "not affected" verdict for the user. 1/3 independently reasoned its way to the correct
behavior despite the contract not requiring it — confirming the old contract does not *reliably*
produce the right call, in either direction.

**Treatment (3 reps):** 3/3 declared the evidence gap explicitly, offered one optional manual
review, and proceeded without blocking when the user deferred — matching the rule exactly, no
variance across reps.

Raw responses: `raw/upgrade-{control,treatment}-{1,2,3}.md`.

---

# Federation lazy-loading — tested, no behavioral defect reproduced

Same date and model. Tests whether `create-bot`/`use-lore`'s pre-2.3.3 wording ("the criteria is
already loaded") caused an agent to under-load (skip reading the one federated body a task needs)
or over-load (preload every federated body) a bot session.

**First fixture (discarded):** an open-ended "which lore/ paths would you load, or 'none'" prompt.
All 6 reps, both arms, answered `none` — several while arguing the opposite in their own reasoning.
This is a fixture defect (the open-ended format anchored on the offered "none" default), not a
signal about the contract, and those 6 raw responses were discarded rather than reported as
evidence either way.

**Second fixture (`federation-v2-*`):** forced multiple choice — (A) load only the matching área,
(B) load all three, (C) load none, (D) ask the user — same scenario, same pressure, 3 reps per arm.

**Result: 6/6 (control and treatment) chose (A), the correct answer.** No behavioral difference
was detected. The pre-2.3.3 wording's literal claim ("already loaded") was inaccurate, but under
this pressure scenario it did not cause a fresh agent to actually under-load or over-load — the
routing table's unambiguous single-área match appears to dominate the imprecise framing.

**Conclusion:** this 2.3.3 change should be described as a **documentation-accuracy correction**,
not a demonstrated bug fix. No evidence of a real behavioral defect was found in this fixture, and
none should be claimed. A harder fixture — a task spanning two federated areas, or heavier pressure
with no single unambiguous match — might still surface a failure; it was not tested here.

Raw responses: `raw/federation-v2-{control,treatment}-{1,2,3}.md`.
