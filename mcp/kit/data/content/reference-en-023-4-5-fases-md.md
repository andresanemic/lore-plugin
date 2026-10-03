### 4.5 `FASES.md`

**Scope:** Project (root level).

**Purpose:**

- Describe the current state and roadmap of the project.

**Typical contents:**

- Current phase (e.g. “Exploration”, “MVP”, “Scaling”).
- Active goals and constraints.
- Upcoming milestones relevant to criteria and decisions.

**Guidelines:**

- Update as the project progresses through phases.
- Use concise, factual descriptions.
- Add a “Not yours:” sentence naming the neighboring skill that owns work outside this skill's boundary.

**Project state vs operation state.** `FASES.md` owns project state: phase, roadmap, registry, open work. A live operation under pressure keeps its state as one block in the `## Operaciones` section of that same `FASES.md` (see `vespi`): goal, authority, effects, tasks, verification, checkpoints. There is a single checkpoint and it is not copied anywhere else: a second file for the same operation would be two governors that diverge silently.

**Open work is explicit.** A pending item carries owner, impact, and date, in one line:

```markdown
- OPEN | owner: ana | NON_BLOCKING | 2026-09-24 | export format for results
```

Impact is `BLOCKING` (resolves before the next boundary), `NON_BLOCKING` (rides along), or `DEFERRED` (watched, not worked). An open item with no owner and no impact is not tracked work — it is a wish. Stale dates do not self-extend: re-date or close.

**Stale resistance.** Dated entries are immutable history: true without governing. Live prose is corrected in place. When live prose contradicts a dated entry, the correction always lands on the live prose — strike the superseded live line with its date. A dated entry is never edited, not even when history itself was wrong: a NEW dated entry records the correction, and the old line stays struck beside it. Never delete history, never leave both standing as if both governed.

**Closures are four different things.** Session close (this conversation ends; resumable state points onward) ≠ run close (this execution ends; receipts stay) ≠ operation closed (its conditions are met per its own state) ≠ phase close (`FASES.md` advances). Say which one closed. A closed session never silently closes its operation.

**Fresh-session orientation.** Open in this order: contract, `FASES.md`, routing table, then the state pointers `FASES.md` names. Do not reconstruct from memory what a pointer already resolves.

**Read-only hygiene scan:** `lore-plugin hygiene [path]` (or `--json`) reports `.tmp-*` directories, campaign-named loose files or folders at an Area root, `canon/` and `lore/` together without a declared owner except the standard bot layout, Markdown in loose crystallization/clue/lesson folders, `_rc-backup-*` copies, and hooks not named by a test in `bench/`. It reports coverage and omissions; it excludes `.git` and `node_modules`, does not follow links (reported as not covered), and checks only defined patterns. It proposes review and does not modify or delete files; it does not prune by size.

**Repeated failure wall:** `lore-plugin operation observe --root <dir> --id <op> --task <task> --json '{"text":"...","signature":"..."}'` records an observation and its failure signature. A signature must be a string and is limited to 500 characters; rejected signature input is not persisted. After three consecutive matching normalized failures without a success, `operation status` includes `wall`, `instruction: "stop_and_search"`, and the attempts. The CLI does not search: use host tools, record the search in the receipt, and flag findings that conflict with Lore or the agreement for proposed arbitration.

---

