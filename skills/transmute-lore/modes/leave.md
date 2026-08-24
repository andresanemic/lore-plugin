## LEAVE mode — leaving Lore without losing the project — 2.3.0

> **Premise:** a kit you cannot leave makes voluntary return (`H13`) unmeasurable by construction. Leaving is not failure — it is a structural operation that preserves the criterion while removing the governance.

**Trigger:** the person chooses to leave or the project outgrows Lore. **Do not invoke `save-to-lore` — this is transmutation, not capture.** A clue that *leaving should be possible* belongs in `principios.md`; the steps to leave belong here.

**Procedure — one pass, no commit:**

1. Verify `lore/` exists — criterion stays (it belongs to the project, not the kit).
2. Remove the `<!-- lore:always-on -->` block from the host contract (`CLAUDE.md`/`AGENTS.md`). Leave no orphan markers — one well-formed pair or none (`use-lore:stamping`).
3. Convert `FASES.md` to the host's typical form (`init`) — state remains, but no longer points at `lore/`. **The conversion keeps exactly one kit line: `leave: <date> · <reason>`.** That marker is the whole reversibility — `UPGRADE` reads it to come back. Dropping it in the name of the host's typical form turns LEAVE into an exit with no way back, and makes `H13` unmeasurable by the same construction this mode exists to remove.
4. Keep the routing table as plain `enrutamiento.md` (no generated pointer).
5. `git status` — project must remain buildable without the kit. Record the pass under the `leave:` marker in `FASES.md`, not in Lore.

**Why here and not in `save-to-lore`:** `save-to-lore` adds one clue at a time (`use-lore:282`); `transmute-lore` migrates/restructures a whole project (`use-lore:284`). LEAVE touches three artifacts at once — it is ADD/CLEAN/PRUNE class, not CAPTURE/GRAFT. Placing it in `save-to-lore` was the exact error `H14` describes: well written, right frontier, wrong module, never governed.
