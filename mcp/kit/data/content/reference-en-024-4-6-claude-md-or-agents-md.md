### 4.6 `CLAUDE.md` or `AGENTS.md`

**Scope:** Project (root level).

**Purpose:**

- Define the collaboration contract between humans and the project's primary AI host.
- Store operational references for AI‑assisted work.

**Typical contents:**

- How the primary host is expected to be used in the project.
- Non‑negotiable constraints for AI suggestions (e.g. “Never bypass code review”).
- Pointers to prompts, workflows, and safety rails.

**Guidelines:**

- Think of it as the “working agreement” for human–AI collaboration.
- Keep it explicit and practical.

**The always-on block:**

The contract is the only artifact both hosts load without being asked, so it carries the kit's
always-on channel — its pointer section, delimited by a marker pair:

```markdown
<!-- lore:always-on -->
…what Lore governs here · where it lives · where the state lives · when to invoke instead of writing by hand…
<!-- /lore:always-on -->
```

- **Markers are literal.** No spacing variants, no attributes, no version number; located by
  full-line match after trimming whitespace, and **never localized** — localizing them breaks
  idempotent stamping with no error.
- **Ceiling: 25 lines, markers included.** Hard limit. If a variant does not fit, content moves into
  `lore/`; the ceiling does not move.
- **Exactly four things:** what Lore governs here, where it lives, **where the state lives**
  (`FASES.md`, one line, path only), and the signal to invoke instead of writing criteria by hand. It
  points at `lore/` and never reproduces a clue. Criteria and state stay in separate files — that law
  does not move — but the session receiving them cannot read twice, and an agent holding the criteria
  without the phase proposes correctly and **out of order**. The state entry is a **pointer, not
  content**: the path is stable, only its target churns.
- **Three variants.** Area → its own `lore/`. Project → its own layer plus the mother area's. Bot →
  `canon/` plus the routing table, never the federated Lores one by one. All three point at their own
  `FASES.md`, which is one line and does not scale with the number of sources.
- **Who stamps:** `create-area`, `create-project` and `create-bot`, inside the threshold they already
  have; `transmute-lore` UPGRADE for contracts that predate the block.
- **Idempotency:** no markers → insert after the first H1. One well-formed pair with identical
  content → **no-op, write nothing**. One well-formed pair with different content → **report the
  divergence and wait**. Duplicated or broken markers → **stop and report**; never guess. Apart from
  the block, the file does not change.
- **Collision with pre-existing prose.** A contract older than the block usually already names the same paths in a load section, and stamping leaves two copies of the same pointers. The block is the one the skills re-stamp, so the stale copy is the hand-written section: leave the pointers only inside the block and reduce that section to what the block does not carry — reported in the same threshold, never silently.

---

