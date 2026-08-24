# Case studies — Lore

> [← Back to the README](../README.md) · [Español](./CASES_es.md)

---

Lore was not designed ahead of time: every decision in this kit came from applying it to real projects and watching what broke. These pages tell those uses. They do not teach you how to install it.

**Lore** is the criteria — the rules you already paid for with work — that an AI agent loads into the next session, so you do not have to explain the project again every morning. It lives in Markdown files, inside a `lore/` folder.

To follow each case you need the same vocabulary the kit uses when it works:

- **Distill** is the deliberate pass that turns a lived scar into a rule that constrains future decisions. Nothing gets in on its own.
- A **threshold** is the gate on that pass: the machine proposes with the content in view, you approve, and only then is anything written.
- An **area** is the mother folder of a craft: it owns the shared criteria; projects inherit from it instead of copying it.
- A **bot** is a working folder that does not keep that criteria for itself. It **routes** each task to the body that owns it: it decides, by the kind of work, which Lore governs.
- A **graft** judges criteria that arrive from outside against your project's purpose: it takes root or it is rejected, and what grows afterwards belongs to you.
- **Crystallize** is taking a traceable snapshot in a single Markdown file, extractable back into a folder, without replacing the live Lore.

> **Status:** these are cases, not proofs. There are few of them, and **seventeen of the eighteen documented cases come from the same researcher**. What they claim constrains how we use the kit; it does not pretend to be a law. Case 08 adds controlled measurement without removing that boundary, and Cases 09, 10, 11, 13, 14 and 18 are the ones that measure this kit against itself — Case 10 by using it for a full day against a live Lore, Case 11 by running two of its own versions head to head and judging the output blind, Case 13 by crystallizing live bots and judging the snapshot by whether a third person could work from it, Case 14 by raising an already-installed ecosystem without rewriting what was earned, Case 18 by raising 31 trees across eight unrelated areas with two models split by role.
>
> **Case 12 is the first one that does not come from the researcher**, which is why it counts differently: someone outside the project installed the kit and used it for an hour. It breaks the boundary the other seventeen share on authorship, and opens a smaller one that is declared inside the case.

<details>
<summary><b>Case 01 — Lore as the operational form of an entire project</b></summary>

<br>

A real project (*numerología*) was built with Lore from the first day, not as notes added afterwards, on top of a development practice that was already disciplined. The six-piece architecture — identity, principles, thematic modules, index, project state, and the contract the agent reads when the session opens — **held up across a whole project**, not just scattered notes. Criteria accumulated, got consulted while the work was happening, and months later was still making decisions.

</details>

<details>
<summary><b>Case 02 — Criteria can be recovered and shared</b></summary>

<br>

Four projects of a real area (*web development*) were brought to the standard with `transmute-lore`, the skill — the written procedure the agent follows — that operates an existing Lore. It left three things that are now law in this kit:

- **Criteria is recoverable** (`add` mode): a project born without Lore already had criteria scattered across comments, decisions, and scars. It is never invented: it is **rescued**.
- **Criteria is deduplicable** (`clean` mode): generic modules live **once, in the Area**. In one project, `clean` deleted 7 redundant modules (−866 lines) losing nothing: the criteria did not disappear, it **changed owner**.
- **Inheritance is selective:** each project references **only** the Area modules its stack actually uses.

**Declared boundary:** all four projects were in the same domain. Transferability *across* domains remains a promise, not evidence.

</details>

<details>
<summary><b>Case 03 — Imported criteria is not adopted: it is arbitrated</b></summary>

<br>

This case produced the mode now called graft. It was born as `arbitrate`, renamed `transplant` in 2.1 and `graft` in 2.1.1: same law and same four gates. Three areas distilled Lore from third-party skills — procedures written by someone else, under a different purpose — and what we observed contradicted the intuition:

- **The value was not the summary of the skill — it was the disagreement.** In two different areas, the dense block of the resulting module was *"where the skill contradicts our standard and loses"*. That part **existed neither in the skill nor in the previous Lore**: it was born from the collision.
- **The same skill, arbitrated by two opposite purposes, loses in the same place for inverse reasons.** *Copywriting* skills were defeated in a marketing area (*"boring, functional copy always wins"*) and in a journalism area (*"we don't sell, we inform"*). The outcome does not depend on the source: it depends on **your** purpose.
- **Capacity ≠ criteria.** A skill that *executes* was never distilled: it is used as a dependency.

**Declared boundary:** all three areas belong to the same user, using the same tool. The mechanism is observed, not proven at scale.

</details>

<details>
<summary><b>Case 04 — Lore without software: the structure survives outside code</b></summary>

<br>

The first case that crosses from software into another discipline. Two areas outside development — journalism and content strategy — already had real distilled Lore from actual work, not empty scaffolding: thematic modules born of the craft, consulted by real projects.

- **The architecture is not a software trait.** The same skeleton reproduced itself in trades with no compiler or test, just a disciplined practice with an explicit purpose.
- **Existence is not measurement.** The case shows the method *produces* criteria in another domain; it does not yet measure that criteria *reduced re-learning*.

**Declared boundary:** criteria did not *travel* across domains — each Lore was born fresh in its own discipline. What replicates is the mechanism.

</details>

<details>
<summary><b>Case 05 — Case memory does not feed distillation: it displaces it</b></summary>

<br>

The method came back, six weeks later, to the project where it had been invented in raw form. It found two preservation artifacts living side by side with opposite fates. On one side, a `lore/` of distilled **Clues** — small restrictions that keep working after the original context is gone — that still did their job. On the other, an incident log that **took part in no decision at all**, not even when the same technical territory that log documented broke again.

- **Preserving is not distilling, and the resemblance is the problem.** A case log satisfies the urge to preserve **without producing criteria**. Once the "leave a record" principle is met, nobody distills. Mining the log before deleting it surfaced two Clues that had sat there undistilled for six weeks.
- **"Indexed and mandatory" does not imply "consulted".** It was in the `CLAUDE.md` lookup table and it was law in `principios.md`, and still it never loaded. Accessibility is necessary and not sufficient.
- **The admission filter does not measure a Clue's altitude.** A Clue entered one day and the next failed to prevent the second symptom of its own root cause: it had been written about the surface that was seen, not the cause.

**This case is why `obsidian-lore` is a sweep and not a button:** it walks the notes looking for criteria; it does not convert a single note on demand.

**Declared boundary:** this is software, same researcher and same interlocutor, and there is no counterfactual. Testimonial evidence, not measurement.

</details>

<details>
<summary><b>Case 06 — Inheritance between sibling Areas: freeze it or route it</b></summary>

<br>

A project needed criteria from four Areas, only one of which was its mother. **Lore's inheritance model is vertical, and sibling Areas are nobody's mother.** Two independent solutions appeared: **freezing** — copying a snapshot of the criteria, when the folder has to travel on its own — and **routing** — deciding per task which body governs. The second is what `create-bot` writes into the bot.

- **Consuming is not inheriting.** You inherit from the mother Area; criteria from a sibling Area is **consumed**. The distinction decides where a criterion promotes to once it generalizes: it rises to its own Area, never to the one that merely reads it.
- **What is distillable about a set of criteria is the border, not the criteria.** Two sibling Areas each had their half of the line written down. Neither had the rule for deciding which one governs a concrete task, because each body is written from inside its own purpose and the dividing line is only visible from outside both.

**Declared boundary:** the two observations are 48 hours apart, in the same ecosystem and with the same researcher. They are not two independent cases.

</details>

<details>
<summary><b>Case 07 — The same kit four times did not produce the same shape</b></summary>

<br>

Four bots were built with `create-bot`, in the same ecosystem, and all four sources already had tidy Lore of their own. The acceptance test was **written down before any of them was used** — *a short instruction is enough*, in its falsifiable form: *did the project have to be explained to the bot to get the result?* Three of the four were put to work, and none of the three needed it.

- **The method does not produce a shape; it produces shapes fitted to the distance and structure of the ecosystem.** The canon **grows when the ecosystem gets farther away** and empties out when it is next door: one bot distills a sealed corpus no pointer can reach; another ended up with a single file, because summarizing what the routing already reaches would have left two distillations of the same original inside one bot. A fourth **federates** a whole Area — it points at its Lore instead of copying it — instead of a set of projects, and that exception was written down as a boundary of validity before the bot existed.

**Declared boundary:** one builder, one ecosystem, one machine, and every source already had Lore. Three of four were used, and the missing one is precisely the only bot meant for other people — so this case says nothing yet about what happens when the builder and the user are different people.

</details>

<details>
<summary><b>Case 08 — Lore written with Claude decides again with Codex</b></summary>

<br>

A controlled benchmark asked whether criteria earned in work with one model could change the future decisions of another. In the frozen 72-run web protocol, Codex without Lore respected **25/36 evaluated Clues (69.4%)** and Codex with Lore respected **33/36 (91.7%)**: +22.3 points, with no task made worse. Synthetic writing and UPGRADE extensions — the mode that raises an already-installed Lore to the current standard — widened the protocol beyond one web fixture.

Across all three protocols, Lore respected **48/52 Clues on the first attempt versus 29/52**. With one controlled repair allowed, it reached **52/52 goals versus 39/52**, using fewer observed attempts and less observed time. The benchmark publishes raw transcripts, deterministic graders, raw and audited cuts, regression tests, and the exact boundary of every claim in [`bench/`](../bench/).

**Declared boundary:** one model, one effort level, one machine, synthetic tasks, and the same researcher built the Lore, fixtures, and graders. It measures compliance with one Clue per task, not the integral correctness of the deliverable, universal savings, or a validated skill-measurement instrument (IME).

</details>

<details>
<summary><b>Case 09 — The form returned to the case it came from</b></summary>

<br>

Two capabilities of this release were generalized from **a single case** and then declared finished without being applied back to it. One is the **always-on block**: the marked stretch of the contract that the agent loads first, pointing at where the Lore lives. The other is the **pointer constitution**: the template that mediates between this kit and another, made of delegations rather than copies. Applying them back produced **five defects, none of them visible by reading the files**.

The split is the finding, not the number: **two defects were found by the form in the case, and three by the case in the form** — including the most expensive one, a template that mediates between two kits and said nothing about who may write in the repository. Generalizing loses in both directions, and neither loss is visible from where you stand: reading the form alone you cannot see what it lacks, because it is complete with respect to itself.

The practice this leaves is cheap and mechanical: **before publishing a generalization, lay it back over the case it came from and write down the differences in both directions.** The ones running form → case are defects of the case; the ones running case → form are what you were about to ship.

**Declared boundary:** one builder, one machine, a repository with no code, zero completed cycles of the second kit, and the strongest self-sealing in the series — the author of the kit, of the case, and the operator are the same person. The yardstick was fixed late and covers only one of the three stages, which the case declares rather than hides.

</details>

<details>
<summary><b>Case 10 — The kit used for a full day against a live Lore, while measuring itself</b></summary>

<br>

It did not start from a hypothesis. It started from an angry note: *«I don't like the copy results at all… I end up writing the copy by hand myself.»* A community-management area with a complete Lore, distilled criteria and a written method, producing work its owner discarded. **The distiller bypassing his own system is the only measurement that mattered**, and it was red.

`PRUNE`, the graft and the threshold came out of that day. But what the case contributes is not the capabilities: it is what became visible while using them.

- **The defect was not bad criteria: it was correct criteria, accumulated.** Writing a five-line post loaded ~797 lines of active criteria. Nothing was refuted, no single law was superfluous, and **each one read fine on its own**. You find it by counting apparatus against content — ~120 lines of scaffolding around 5 lines of copy — never by reading files. It is the class of finding `Missing` / `Superseded` / `Earned` had no slot for, which is why `PRUNE` brought `Crowding`: correct criteria that, together, smother the task.
- **Pruning such a Lore correctly leaves it BIGGER.** The corpus ended 35 lines larger and the apparatus inside the deliverable went from ~120 lines to none. Four of six findings were `Crowding`, and repairing `Crowding` means *adding* a boundary, a destination or a ceiling. **Measured by corpus size, the correct repair reports as a failure** — and the incentive becomes deleting earned criteria. The skill claimed the opposite that same morning, and its first run disproved it.
- **The threshold guards the skills and nothing guards the text editor.** That day 241 lines of new criteria went into a Lore that had been diagnosed eight hours earlier for missing boundaries. They produced **one**. `save-to-lore` demands them if you invoke it; `UPGRADE` catches them months later; opening the file and typing has no gate at all, and that is the path most criteria takes. **The defect survived the best possible case** — the author of the rule, the same day, with the rule fresh — so it belongs to the mechanism, not to anyone's discipline.
- **The omission between two kits runs both ways.** Case 09 showed the cycle can run without ever consulting the criteria. Here the inverse happened: the criteria ran without ever consulting the cycle, and the version gained three capabilities while its spec still described two. Nothing failed and nothing warned, **because a stale spec looks exactly like a current one**.
- **A tool is not neutral because it is useful.** A third-party writing reviewer flags emoji and short-fragment bursts as machine tells. The brand whose distilled voice is built on exactly those two devices ran it cold: it would have erased that voice while being right about everything except this corpus. The graft covered criteria arriving as a document; criteria arriving as **a tool you invoke** was covered by nobody.

**The finding none of the five bullets contains, and the most important one:** almost all of those defects were found by **the project's owner, not by the kit and not by the agent**. The reviewer that was not running, the line breaks the storage surface was destroying, the noise creeping back under every delivery, the stanza form of the posts that had actually performed. The kit has no mechanism that would have caught any of it, and calling that «human supervision» would be softening it: **the instrument spent the day being wrong and the human was the only detector.**

**Declared boundary, the widest in the series.** One operator, one machine, one area, one day. The terminal measurement — *«I no longer feel I have to write them by hand»* — came from an **interactive** session, while the copy that caused the complaint came from an unattended automated run: **the biggest variable that changed is not the Lore, it is that someone was watching**, and separating them requires an unattended run that has not happened yet. Add Case 09's self-sealing, intact: kit author, case author and operator are still the same person.

</details>

<details>
<summary><b>Case 11 — The counters said one thing and the judge said the other</b></summary>

<br>

Two versions of this kit were about to be separated by a number. Version `v1.2.1` and version `2.1.0` ran **the same task on the same corpus**, in separate agent sessions, each against a frozen worktree at the same commit. Then the corpus owner read four pairs of the resulting work **blind** — same theme per pair, order drawn independently, nothing marking which version wrote what — and was asked one question: *which one would you sign as yours?*

**He picked 2.1 three times out of four.** None of his four reasons named a capability of the kit; they were about writing.

And the older version had won **every mechanical measure**:

| Measure | `v1.2.1` | `2.1.0` |
|---|---|---|
| Validity boundaries declared | **23** | 20 |
| Confidence markers added | **+22** | +1 |
| Lines of criteria produced | 1539 | 1571 |

- **Counting the artifacts of criteria counts acts of writing.** Those happen on the day of the run. What the artifacts are worth arrives months later, the first time somebody opens the clue and it changes a decision. A run that scores well on the count has declared its boundaries; it has not shown they were worth declaring. This is the counter-example that settles it, and one is enough: **to break a claim that a measure tracks quality, you only need a case where it points at the loser.**
- **The single loss is not a win for the old version.** He chose the older copy while criticising it in the same sentence, and what sank the newer one was not its form but that he could not follow it: *«it feels strange to say the technology died on Tuesday, I don't really understand.»* Three pairs were won by the copy with the line breaks and the fourth by the one without — not an inconsistency. **Form rules while the text is understood, and stops ruling the moment it is not.**
- **The most expensive finding belongs to neither version.** Asked which delivery shape he actually wanted, he answered: *«options and one suggestion, so I write the final copy myself»*. Neither arm produced that, and **neither could have**, because that criterion was not written in any `lore/`. A test designed to separate two versions uncovered a hole that belongs to both. It is also the answer to *«what would a better version have changed?»* — nothing.

**What it changed in the kit, and this is why the case exists:** the invariant in `use-lore` used to recommend counting clues against boundaries as the cheap check while no gate exists. It still does. It is now written as a **completeness check, never a quality one** — because this repository publishes a benchmark figure, and the distinction is not academic.

**Declared boundary, and seven confounders published with the result.** A single case (`n=1`), one judge, one session, one corpus. A power cut mid-run destroyed the second arm's threshold decisions — the skill writes the result, not the decisions. Three of four pairs happened to place the older arm first. The pairs were assembled by the same person who ran the test. Manual copy-paste corrupted stretches of both deliverables, and one Monday copy was lost before it could enter a pair. The two arms ran against trees that differed in nature: one frozen at a tag, one the live working repository. And the older arm ran first, with the judge having seen no output yet.

</details>

<details>
<summary><b>Case 12 — The first install the researcher did not run</b></summary>

<br>

Someone outside the project — a chemist, called "Nogal" here — installed the kit over a video call. One hour, transcribed in full, on raw material with no prior Lore, in Codex rather than Claude Code. It is the first case whose evidence does not come from the author.

**The main failure: he asked for bots and got areas**, one per bot, without `create-bot` ever being invoked and without federating anything.

The rule *«a bot is not an area»* was already written in **three** artifacts: the README, `create-bot` and `use-lore`. All three are read once someone has decided to consult about bots. At the moment of the decision, the skill actually running was `create-area` — the only one that did not say it, and the one that closes by pointing at `create-project`.

> **A law written outside the path of execution does not govern.** The guard belongs in the skill that runs, not in the one that documents. Writing it in a fourth place would have been the same mistake once more.

**The other three findings share one shape — the symptom names something other than the cause:**

| What was seen | What it was |
|---|---|
| The bot was *«reading the wrong Lore»* | The host's project pointed at the folder it defaulted to, not at the federated tree. The symptom sends you to debug the criteria; the problem was the access. |
| An *architecture bot* appeared, for adding bots and reorganizing folders | That is the `bots` area wearing a bot's shape. A bot administers no bots: that job is a `FASES.md` and an area `lore/`. |
| The note debt flagged an unmined note | The bot had written it itself four minutes earlier, closing the task. Debt is what the human wrote and nobody distilled. |

**And the vocabulary was tested against someone qualified to judge it.** The installer validated *distill*, *crystallize* and *prune* against their real meaning in chemistry, and **rejected** *transplant* with an argument: moving a plant does not change it, and this mode does change what it lets in. That is where 2.1.1's rename to `graft` comes from. No internal review had caught it in two versions.

**What went right, which is the other half of the case.** With a short instruction, without the institution being explained and without the criteria being named, the bot routed on its own, cited the sources it used, closed by proposing a distillation, refused to store knowledge of its own because it federates, and left the next session's prompt written down. `create-bot`'s north — *a short instruction is enough* — held in a third party's hands, which is the only proof that north accepts.

**What changed in the kit:** all of 2.1.1. The routing guards in `create-area`, `create-bot` and `use-lore`, the access check when a bot premieres, note debt that distinguishes who wrote what, and the graft rename. Four new tests fail if any guard is removed.

**Declared boundary.** A single case (`n=1`), one session of one hour, **accompanied live by the kit's author** — so the case says nothing about installing the kit *unaided*, which is exactly the question left open. One host, one model, one domain. And the follow-up — whether the use improves or degrades over the weeks — is a different case, not yet written.

</details>

<details>
<summary><b>Case 13 — A crystallization that only points is not a crystallization</b></summary>

<br>

On 2026-08-17 the kit crystallized three live bots. The owner rejected all three. The files *routed* to criterion they did not contain: **Roble**, a laboratory bot, at 57 KB, labeled "without the ecosystem"; **Sauce**, a craft-area bot, at 47 KB, "without the area's craft". A third file was closer and still not enough. The yardstick was a manual merge the owner had already made (~1.1 MB): one Markdown a third person could work from.

The defect had no error signal. Each snapshot was well-formed, private material stayed out, and the routing table was correct. It was a **table of absences**. CRYSTALLIZE had looked at the origin tree and never at the destination: a third person's AI session, with no live root underneath.

A day later the mode was run again, this time with the missing half: the snapshot **inlines every routed `lore/`**, and it is **extractable**. Two bots were crystallized and handed over as a review folder — **Roble** again (116 files, 935 KB) and **Laurel**, a two-body venture bot (54 files, 370 KB). Every live path in the unpacked routing table resolved. The extractor ships with the skill; the owner did not write it.

The owner judged the pair **in the same terms as the rejection**: *this is what we were looking for with crystallize*.

**What it changed in the kit:** all of 2.1.3. The yardstick of CRYSTALLIZE is that a third person can work from the file alone. `lore-ecosistema/` travels. "Without the ecosystem" is a failure of the mode, not a scope. Each inlined file carries `<!-- lore:extract path="..." owner="..." -->`. Unpacking rebuilds a mini-root that mirrors `raiz`, rewrites `ecosistema.json`, and fails if any routing pointer is missing. The script is `skills/transmute-lore/scripts/crystallize.mjs`.

**Declared boundary.** Same researcher, same judge as Case 11, two bots, one machine. The verdict is that the snapshot and the unpack match the owner's bar — not that a stranger already opened the folder in their favorite AI and worked as if they were him. That is the use the mode now claims, and it is not yet a case.

</details>

<details>
<summary><b>Case 14 — An upgrade that does not rewrite what was earned</b></summary>

<br>

An already-installed ecosystem — several areas, their projects, and the bots last — was raised to 2.1.4 by area tree, not folder by folder. Nothing looked broken. What it lacked was the always-on block, the word *threshold* where `HARD-GATE` still commanded — the previous name of the threshold, through 2.0.9 — and the distinctions the kit had learned after those Lores were written.

**What the mode already knew was not enough.** UPGRADE could name missing, superseded, earned and stale. It did not know to map three different folders (session, parent, body) before opening a module. A live site is worked in a folder that does not carry `lore/` beside it; concluding «no Lore» is the failure. Mapping git roots and `lore/` became the first phase.

**A campaign's threshold is per class, not per tree.** The first tree paid the threshold with content in view. Later trees applied accepted classes. A long index was repaired by its header, not by rewriting rows. A missing `identidad.md` or `principios.md` was reported as ADD, not invented. Notes were counted; they were not mined.

**A clue from the kit itself does not take root if the owner contradicts it.** The test had written that a craft's `HARD-GATE` is left alone. When the rest of the trees were raised, the owner said live `.md` files must stop speaking that way. The old clue stays `refuted`. The one that commands: in lore, contract and FASES that still govern today, say threshold. A dated record and another skill's file stay.

**What it changed in the kit:** all of 2.1.4. The UPGRADE procedure (map first, campaign by class, index by header, ADD when the pieces are missing, inbox counted) and the present/dated cut for vocabulary. The writing skills already carried «a paragraph is a paragraph»; this version documents it, it does not reintroduce it.

**Declared boundary.** Same researcher, same machine, one ecosystem. The case shows the mode can raise an installed tree without letting unwrap dominate the diff or inventing criterion. It does not measure relearning. It is not the scientific case for LUS. The bots and the bot that wrote this case were raised after absorption; they are not evidence that the procedure was applied blind.

</details>

<details>
<summary><b>Case 15 — A yardstick fixed after the first failure</b></summary>

<br>

A bot built with `create-bot` was asked for an institutional manifesto — a university lab's whitepaper. The request arrived with feedback already distilled: *the content is fine, but it reads "made with AI"; it lacks the human touch; add the work we have been doing, like a logbook, with the meetings.* The bot ran its whole cycle — spec, rewrites, a humanizer pass, crystallization — and produced a document that was **internally coherent, verified against its own sources, and still rejected by the owner**. The rejection was by voice, not by structure.

The feedback named two possible readings: *the structure is wrong* versus *the human part is missing*. The process took the first to its limit and produced an institutional form — coherent, and not what the team wanted. The detector that worked was **external**: the owner reading. Nothing inside the draft could have caught it, because what the draft lacked — the voice, the logbook, the people — was not a flaw in it. It was an absence the draft could not name.

This is the scientific program's hypothesis **H11** in its canonical form: an internally consistent artifact, false toward the outside, that survives every re-reading of itself. LUS, the research program this kit implements, records the same event as one of its own cases — an appearance of H11; the count does not rise. Here only the operational half enters.

**The fix was a yardstick, and it arrived late.** The definitive document, written by hand, became the minimum standard for that class of deliverable: an opening that situates the work from the person and the why, a real origin and history, the state declared as it is. The bot's canon now holds that yardstick and the rule — *compare against it, never self-certify against the draft* — which is what 2.1.6 teaches `create-bot` to fix **before** the first request.

**What it changed in the kit:** 2.1.6. `create-bot`'s canon brainstorm asks, per class of deliverable, for its yardstick; a new canon-module kind holds it; and the execution rule completes the "coherence is not a detector" teaching already in UPGRADE.

**Declared boundary.** Same researcher, same machine, same ecosystem and same campaign as Cases 09–14 — the strongest self-sealing in the series. The case is an appearance of an already-open hypothesis, not a replica: it does not raise the count. It is about one deliverable class — institutional text with a voice requirement — and says nothing about documents without one. The yardstick was fixed after the failure, as a consequence, not as prior design.

</details>

<details>
<summary><b>Case 16 — A yardstick fixed on one specimen before scaling to a batch</b></summary>

<br>

The product twin of Case 15, reversed and at scale: a cold-outreach campaign with written criteria already in place — format, subject, signature — went to an external reviewer **before** the batch was produced, not after the first failure. The module's prior criterion was internally coherent: it had survived its own cycle — spec, rewrites, humanizer — and every piece that followed it could be checked against it. The external reviewer (another model, not an internal reading) rewrote **one specimen** and returned it as the yardstick: a concrete subject naming the institution and topic, no links or material in the first touch, one problem in business language, and the offer before the CTA. With that reviewed specimen as reference, the full batch was rewritten and verified in the CRM table — the tables and emails live in Notion, which is the module's delivery form.

This is the shape of Case 15 applied as **prior design**: the yardstick is fixed on a specimen judged by an external reader **before** scaling to a batch, not as the consequence of a failure. In Case 15 the detector was the owner reading; here it is the external reviewer reading the first specimen, outside the cycle that produced the draft. It is an appearance of the same **H11** hypothesis — internally consistent criterion that is false toward the outside — in preventive form: internal coherence does not detect external falsehood, so the yardstick is not validated by rereading the batch; it is fixed by external review of one specimen.

**What it changed in the kit:** 2.2.0. `create-bot` §3 requires a deliverable class produced **in batches** to fix its yardstick on one specimen reviewed by an external reader before scaling; §6 extends the execution rule — every piece in the batch is compared against the reviewed specimen, never against itself.

**Declared boundary.** Same researcher, same machine, same ecosystem and same campaign as Case 15 — the strongest self-sealing in the series. The case is an appearance of H11, not a replica: it does not raise the count. It concerns one deliverable class — cold email judged by an external reader — and says nothing about deliverables without an external reader or what happens when the reviewer also writes the criterion. The reviewer was another model, not the market: the yardstick remains `conjecture` until a sending cycle confirms it.

</details>
<details>
<summary><b>Case 17 — Jasmine, the first `create-bot` test from a minimal idea</b></summary>

<br>

The starting point was one human declaration, not prior Lore: **Jasmine** is a local-first artistic IDE for an independent digital artist who also manages their career; the product was explicitly not a chatbot. Configuration became the first complex artifact, and the reviewed first victory was a real application to an artist funding call: the bot had to extract requirements, assess fit and draft fields without inventing facts or submitting without approval.

The broader result was not another bot feature. The case stabilized the Entre as a **healthy, fast and simple way of working**: one decision at a time, two or three alternatives with trade-offs, and recaps where the original intention remained recognizable inside the accumulated artifact. Later reflection added fertile effort: an enjoyable Entre is not one that always pleases; correction, disagreement and review leave recognizable movement in the artifact or criterion. The pattern does not belong only to `create-bot`; it governs structural operations that create or transform bots, projects, areas, crystallizations and other complex artifacts.

The session also sharpened the rhythm of that stability: **drift → return → distillation → resynchronization**. Contact need not be constant and working separately is not itself a collapse; several clues may accumulate. The contextual milestone calls both sides back to the same artifact, and `save-to-lore` returns only what changed future decisions to the shared criterion.

**What it changed in the kit:** 2.2.0 treats the human declaration as provisional canon, configuration as the first complex artifact and a reviewed first victory as the stabilizing event. Version 2.2.1 adds fertile effort without equating it with agreement or pleasantness. `brainstorming-lore` asks only what advances that victory and maintains an accumulated artifact with recognizable continuity; `create-bot` additionally requires an honest operational prototype, decisions before prompts and a Journey derived from purpose; `save-to-lore` captures at contextual milestones or accumulated clues with one visible batch threshold. The case's product details stay outside generic skill law.

**Declared boundary.** One researcher, one assisted session, one product domain and a local prototype. This is qualitative situated evidence, not a general product law and not proof that the application wins funding, sustains a career or works for other artists. LUS v1.21 records fertile effort and continuity as H13, open with situated `n=1`; no second Entre, corpus change or general effect has been established.

</details>

> Cases that **refute** something are the ones that help most. The [repository discussions](https://github.com/andresanemic/lore-plugin/discussions) are the place.
