# Case studies — Lore

> [← Back to the README](../README.md) · [Español](./CASES_es.md)

---


Lore was not designed on a whiteboard: every decision in this kit came from applying it to real projects and watching what broke. LUS documents those applications as **case studies**.

> **Status:** these are cases, not proofs. Small n, and all nine documented cases come from the same researcher. What they claim constrains how we use the kit; it does not pretend to be a law. Case 08 adds controlled measurement without removing that boundary, and Case 09 is the one that measures this kit against itself.

<details>
<summary><b>Case 01 — Lore as the operational form of an entire project</b></summary>

<br>

A real project (*numerología*) built with Lore from start to finish, on top of a disciplined development practice. It showed that the six-piece architecture **holds up across a whole project**, not just scattered notes: criteria accumulate, get consulted, and keep making decisions months later.

</details>

<details>
<summary><b>Case 02 — Criteria can be recovered and shared</b></summary>

<br>

Four projects of a real area (*web development*) migrated to the standard with `transmute-lore`. It left three things that are now law in this kit:

- **Criteria is recoverable** (`add` mode): a project born without Lore already had criteria scattered across comments, decisions, and scars. It is never invented: it is **rescued**.
- **Criteria is deduplicable** (`clean` mode): generic modules live **once, in the Area**. In one project, `clean` deleted 7 redundant modules (−866 lines) losing nothing: the criteria did not disappear, it **changed owner**.
- **Inheritance is selective:** each project references **only** the Area modules its stack actually uses.

**Declared boundary:** all four projects were in the same domain. Transferability *across* domains remains a promise, not evidence.

</details>

<details>
<summary><b>Case 03 — Imported criteria is not adopted: it is arbitrated</b></summary>

<br>

The case that produced `arbitrate` mode. Three areas distilled Lore from third-party skills, and what we observed contradicted the intuition:

- **The value was not the summary of the skill — it was the disagreement.** In two different areas, the dense block of the resulting module was *"where the skill contradicts our standard and loses"*. That part **existed neither in the skill nor in the previous Lore**: it was born from the collision.
- **The same skill, arbitrated by two opposite purposes, loses in the same place for inverse reasons.** *Copywriting* skills were defeated in a marketing area (*"boring, functional copy always wins"*) and in a journalism area (*"we don't sell, we inform"*). The outcome does not depend on the source: it depends on **your** purpose.
- **Capacity ≠ criteria.** A skill that *executes* was never distilled: it is used as a dependency.

**Declared boundary:** all three areas belong to the same user, using the same tool. The mechanism is observed, not proven at scale.

</details>

<details>
<summary><b>Case 04 — Lore without software: the structure survives outside code</b></summary>

<br>

The first case that crosses from software into another discipline. Two areas outside development — journalism and content strategy — already had real distilled Lore, not scaffolding: thematic modules derived from real work, consulted by real projects.

- **The architecture is not a software trait.** The same skeleton reproduced itself in trades with no compiler or test, just a disciplined practice with an explicit purpose.
- **Existence is not measurement.** The case shows the method *produces* criteria in another domain; it does not yet measure that criteria *reduced re-learning*.

**Declared boundary:** criteria did not *travel* across domains — each Lore was born fresh in its own discipline. What replicates is the mechanism.

</details>

<details>
<summary><b>Case 05 — Case memory does not feed distillation: it displaces it</b></summary>

<br>

The method came back, six weeks later, to the project where it had been invented in raw form. It found two preservation artifacts living side by side with opposite fates: a `lore/` of distilled Clues that kept working, and an incident log that **took part in no decision at all** — not even when the same technical territory that log documented broke again.

- **Preserving is not distilling, and the resemblance is the problem.** A case log satisfies the urge to preserve **without producing criteria**. Once the "leave a record" principle is met, nobody distills. Mining the log before deleting it surfaced two Clues that had sat there undistilled for six weeks.
- **"Indexed and mandatory" does not imply "consulted".** It was in the `CLAUDE.md` lookup table and it was law in `principios.md`, and still it never loaded. Accessibility is necessary and not sufficient.
- **The admission filter does not measure a Clue's altitude.** A Clue entered one day and the next failed to prevent the second symptom of its own root cause: it had been written about the surface that was seen, not the cause.

**This case is why `obsidian-lore` is a sweep and not a button.**

**Declared boundary:** this is software, same researcher and same interlocutor, and there is no counterfactual. Testimonial evidence, not measurement.

</details>

<details>
<summary><b>Case 06 — Inheritance between sibling Areas: freeze it or route it</b></summary>

<br>

A project needed criteria from four Areas, only one of which was its mother. **Lore's inheritance model is vertical, and sibling Areas are nobody's mother.** Two independent solutions appeared: **freezing** — copying snapshots, when the folder has to travel on its own — and **routing** — deciding per task which body governs. The second is what `create-bot` packages.

- **Consuming is not inheriting.** You inherit from the mother Area; criteria from a sibling Area is **consumed**. The distinction decides where a criterion promotes to once it generalizes: it rises to its own Area, never to the one that merely reads it.
- **What is distillable about a set of criteria is the border, not the criteria.** Two sibling Areas each had their half of the line written down. Neither had the rule for deciding which one governs a concrete task, because each body is written from inside its own purpose and the dividing line is only visible from outside both.

**Declared boundary:** the two observations are 48 hours apart, in the same ecosystem and with the same researcher. They are not two independent cases.

</details>

<details>
<summary><b>Case 07 — The same kit four times did not produce the same shape</b></summary>

<br>

Four bots built with `create-bot`, same ecosystem, all four sources with tidy Lore of their own. The acceptance test was **written down before any of them was used** — *a short instruction is enough*, in its falsifiable form: *did the project have to be explained to the bot to get the result?* Three of the four were put to work, and none of the three needed it.

- **The method does not produce a shape; it produces shapes fitted to the distance and structure of the ecosystem.** The canon **grows when the ecosystem gets farther away** and empties out when it is next door: one bot distills a sealed corpus no pointer can reach, another ended up with a single file, because summarizing what the routing already reaches would have left two distillations of the same original inside one bot. A fourth federates a whole Area instead of a set of projects, and that exception was written down as a boundary of validity before the bot existed.

**Declared boundary:** one builder, one ecosystem, one machine, and every source already had Lore. Three of four were used, and the missing one is precisely the only bot meant for other people — so this case says nothing yet about what happens when the builder and the user are different people.

</details>

<details>
<summary><b>Case 08 — Lore written with Claude decides again with Codex</b></summary>

<br>

A controlled benchmark asked whether criteria earned in work with one model could change the future
decisions of another. In the frozen 72-run web protocol, cold Codex respected **25/36 evaluated
Clues (69.4%)** and Codex with Lore respected **33/36 (91.7%)**: +22.3 points, with no task made
worse. Synthetic writing and UPGRADE extensions widened the protocol beyond one web fixture.

Across all three protocols, Lore respected **48/52 Clues on the first attempt versus 29/52**. With
one controlled repair allowed, it reached **52/52 goals versus 39/52**, using fewer observed attempts
and less observed time. The benchmark publishes raw transcripts, deterministic graders, raw and
audited cuts, regression tests, and the exact boundary of every claim in [`bench/`](../bench/).

**Declared boundary:** one model, one effort level, one machine, synthetic tasks, and the same
researcher built the Lore, fixtures, and graders. It measures compliance with one Clue per task, not
the integral correctness of the deliverable, universal savings, or a validated IME.

</details>

<details>
<summary><b>Case 09 — The form returned to the case it came from</b></summary>

<br>

Two capabilities of this release — the always-on block and the pointer constitution — were
generalized from **a single case** and then declared finished without being applied back to it.
Applying them back produced **five defects, none of them visible by reading the files**.

The split is the finding, not the number: **two defects were found by the form in the case, and three
by the case in the form** — including the most expensive one, a template that mediates between two
kits and said nothing about who may write in the repository. Generalizing loses in both directions,
and neither loss is visible from where you stand: reading the form alone you cannot see what it
lacks, because it is complete with respect to itself.

The practice this leaves is cheap and mechanical: **before publishing a generalization, lay it back
over the case it came from and write down the differences in both directions.** The ones running
form → case are defects of the case; the ones running case → form are what you were about to ship.

**Declared boundary:** one builder, one machine, a repository with no code, zero completed cycles of
the second kit, and the strongest self-sealing in the series — the author of the kit, of the case, and
the operator are the same person. The yardstick was fixed late and covers only one of the three
stages, which the case declares rather than hides.

</details>
---

> Cases that **refute** something are the ones that help most. The [repository discussions](https://github.com/andresanemic/lore-plugin/discussions) are the place.
