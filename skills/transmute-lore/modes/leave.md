## LEAVE mode — leaving Lore without losing the project — 2.3.3

> **Premise:** a kit you cannot leave makes voluntary return (`H13`) unmeasurable by construction. Leaving is not failure — it is a structural operation that preserves the criterion while removing the governance.

**Trigger:** the person chooses to leave or the project outgrows Lore. **Do not invoke `save-to-lore` — this is transmutation, not capture.** A clue that *leaving should be possible* belongs in `principios.md`; the steps to leave belong here.

**Pre-flight — read only:**

1. Verify `lore/` exists — criterion stays (it belongs to the project, not the kit).
2. Resolve the physical target of the host contract. If `CLAUDE.md` or `AGENTS.md` is a symlink, or its target is shared outside this project, **stop before writing** and show the user the boundary. Replacing, copying or editing that contract is a separate decision.
3. **Inventory every active junction** that can load or execute Lore during normal work: the always-on block and surrounding prose in the selected host contract; Lore pointers in `FASES.md`; secondary host contracts; and project-owned automatic junctions in hooks and generated configuration. Search execution surfaces, not references in ordinary documentation.
4. Show the exact removal set. A project-owned automatic junction may be disabled; human-authored content requires the threshold with the exact lines in view. Never delete a whole hook or contract merely because one line invokes Lore.

**Procedure — after the threshold, no commit:**

1. Before the first mutation, write `leave:partial · <date> · <reason>` plus the approved junction checklist in `FASES.md`. If that marker already exists, **resume LEAVE** from its checklist; absence of the always-on block does not prove the earlier pass completed.
2. Remove the `<!-- lore:always-on -->` block from the selected host contract. Leave no orphan markers — one well-formed pair or none (`use-lore:stamping`).
3. Disable only the approved project-owned automatic junctions and remove the approved Lore instructions from host contracts and `FASES.md`. Preserve unrelated content byte-for-byte.
4. Convert `FASES.md` to the host's typical form (`init`) — state remains, but no longer routes to `lore/`. Replace the partial marker with exactly one kit line: `leave: <date> · <reason>`. That marker is the whole reversibility — `UPGRADE` reads it to come back.
5. Keep the routing table as plain `enrutamiento.md` (no generated pointer). A saved map is inert when no active procedure is obliged to consult it.

**Verification — two different claims:**

- **Static verification:** repeat the junction inventory; the approved execution surfaces contain no automatic Lore route, `lore/` and plain `enrutamiento.md` remain, the diff contains no unrelated deletion, the project must remain buildable without the kit, and its normal checks pass.
- **Behavioral verification:** open a fresh session, give it a task whose result a known clue would change, and do so without mentioning Lore. The agent does not apply that clue unless the user explicitly supplies it. This is a fresh-agent observation, not a regex or an `npm test` claim.

Only after both checks pass may the partial marker become `leave:` and LEAVE be reported complete. If either fails, keep `leave:partial` and report the exact remaining junction.

**Why here and not in `save-to-lore`:** `save-to-lore` adds one clue at a time (`use-lore:282`); `transmute-lore` migrates/restructures a whole project (`use-lore:284`). LEAVE touches three artifacts at once — it is ADD/CLEAN/PRUNE class, not CAPTURE/GRAFT. Placing it in `save-to-lore` was the exact error `H14` describes: well written, right frontier, wrong module, never governed.
