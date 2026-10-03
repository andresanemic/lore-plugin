### 3.1 `use-lore`

**Role:** Entry point into Lore.

**Responsibilities:**

- Explain Lore’s architecture for the current project or Area.
- Show which artifacts exist and how they are structured.
- Route you to the appropriate skill based on your intent.
- For **complex deliverables**, fix the owner and routed Lore, an approved precedent or
  human-approved specimen, verified tool/connector/MCP capabilities, reviewable batches, human
  review, and checked delivery. When the batch splits into mechanical bulk and arbitration, suggest
  `/model` for the cheaper tier instead of a subagent — a subagent re-reads the whole Lore tree
  before it starts. Route each medium and tool to its owner skill rather than becoming a ninth
  production skill.
- **Route a request for a bot, never answer it with an Area** (2.1.1). On a machine with no Lore at
  all, someone asking for bots has already named the deliverable: the Areas are **steps**, `create-bot`
  runs last, and the whole chain is stated with its cost — one `create-area` plus one `transmute-lore`
  per source.
- **Offer the agreement on first use, starting with the why.** The agreement is offered when the
  work has to last more than one session, and it **binds only if you accept it: the kit never
  refuses to work without it.** It exists only if it passed three doors together — the AI recapped
  it completely, you approved it explicitly, and it was written down before any building started.
  In that first agreement you choose the intensity (`sobria`/`cercana`, default `cercana`), the tempo
  (`despacio`/`normal`/`rapido`, default `normal`), and your limits of use **by model family and
  level, never by version number**. `create-area`, `create-project` and `create-bot` offer it at
  their own threshold, not as a separate step.
- **Tell whoever updates from an earlier version once**, in plain language: Vespi arrived, what it
  can do, and the invitation to set your limits. Showing that notice **approves no agreement** and
  creates none.

**Artifacts the agreement writes:**

| Artifact | What it is | Where |
|---|---|---|
| `acuerdo.md` | The agreement document. It **starts with the why**, then the full recap, the dials, the limits and the four bets. Amendments are **appended at the end**: it is never overwritten. | tree root, beside `FASES.md` and **outside `lore/`** |
| `.lore-acuerdo` | The machine-readable state. It is rewritten, and its `aprobado` field is the only thing that makes an agreement exist: a receipt with that shape but without that field — the state the notice leaves — **does not count**. | tree root, beside `acuerdo.md` |

The agreement declares exactly four bets, all about the apparatus: that everyday phrases suffice to
divide the work between the three skills; that the hook reminder sustains the record turn by turn;
that OpenCode allows notifying without blocking; and that each host lets you read the session's
usage — where it does not, the countable signals stand in and that they are standing in is said out
loud. **When one falls, work continues.** *"The agreement is never imposed"* is not a bet: it is a
hard rule, and so it never degrades. *The guard keeps blocking another owner's criterion* is the
sixth line of that same list, but with the opposite sign: it is not a stop, it is a rule that stays
in force.

**Typical interactions:**- “Explain the Lore structure for this repository.”
- “What artifacts exist for this project?”
- “Which skill should I use to capture a new invariant?”
- “I want to create a bot for X and Y.”
- “Build this complex deliverable from several sources and deliver it to the target system.”

Use `use-lore` whenever you are unsure where to start.

---

