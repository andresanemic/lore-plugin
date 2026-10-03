# Using Lore Plugin and Vespi from OpenCode

This manual describes the planned Lore Plugin 2.4.9 and Vespi Kernel 0.1.4 releases. Their announced release date is Monday, 2026-10-05. Until they are published, install from the release when it exists; this manual does not use Ollama or local-model instructions.

## What you will do

You will open a project in OpenCode, have Lore Plugin load the relevant existing criteria and state, and use Vespi when an operation needs authority, receipts, or continuity across sessions. The same method also works in Claude Code and Codex.

## Install OpenCode

Install OpenCode by following its [official documentation](https://opencode.ai/docs/). The steps depend on your system, so this manual does not assume an installer or command that is not documented here. When installation is complete, confirm that you can start OpenCode and open a project directory.

## Install Lore Plugin

When release 2.4.9 is available, install that release and run this command in a terminal:

```sh
lore-plugin install --target opencode
```

If you are working from a repository clone, the documented equivalent is:

```sh
node scripts/lore-plugin.mjs install --target opencode
```

The OpenCode installer puts skills in `~/.config/opencode/skills/`, along with the hooks, TUI plugin, and local CLI components. Restart OpenCode afterward. To confirm installation, check that `~/.config/opencode/skills/` contains the Lore skills; the installer also reports whether it verified the copied components. You do not need to edit `opencode.jsonc` for local plugins to be discovered.

## Your first session

Open the project directory you want to work on in OpenCode. If this is your first time using Lore, write: “I want to start using Lore Plugin, help me.” The kit first looks at the shape of the tree, asks one question at a time, and works toward a first artifact; it does not end with a list of recommendations.

If the project already has an instruction contract, routing table, `lore/`, or `FASES.md`, the session resolves which territory governs the work and loads the relevant criteria before continuing. Lore holds criteria that constrain future decisions. `FASES.md` holds project state and plan, outside `lore/`; it is not a copy of Lore. The load check verifies the links it will rely on and presents a specific decision if a link is missing instead of repairing it on its own.

OpenCode makes installed skills available for the agent to invoke as the task requires. If you know what you want, describe it in ordinary language. If there is no working method yet, ask for help getting started; you do not need to remember a skill name.

## Work with Vespi

Vespi is experimental. Use it for a bounded operation that must continue across sessions, whose effects require authority, or where resuming without checking what changed would pretend nothing happened. The coordinator declares the goal, owner, effect, and authority; checks authority before acting; performs the step; verifies separately; and leaves a receipt that distinguishes what was observed from what was not verified.

The human gate is used when a decision belongs to the person. The agent can prepare the context and request approval; it cannot invent or expand that approval. OpenCode permissions also decide which actions and paths the host allows. Its native permissions for structured writes to other directories use `external_directory` and `edit`; `ask` prompts, `allow` permits, and `deny` blocks. For a single operation, the documentation recommends choosing `once` in the host.

The state of a live operation is stored as a block under `## Operaciones` in the project's `FASES.md`. When ending a session, state clearly whether the operation remains open, is waiting for a decision, or is closed. Tomorrow, open the same project, reread its contract and `FASES.md`, and ask to continue the pending operation. The coordinator reads the receipt and revalidates authority and premises before continuing; a receipt alone is not authorization.

You do not need Vespi for every task. Ordinary work follows the project's criteria. Phrases such as “this is getting complicated,” “we are losing what we decided,” and “let's continue tomorrow” are signals for the coordinator to choose a route; a phrase does not invoke Vespi directly.

## Save learned criteria

When a real point of friction has been resolved and you want it to change future decisions, say “save this to Lore” or ask to save the lesson. `save-to-lore` proposes a clue with context, cause, criterion, and evidence, then waits for your approval before writing. Review the diff. An open task or unresolved idea belongs in the state in `FASES.md`; it is not criteria. Vespi does not write Lore either; only `save-to-lore` arbitrates that path.

## Claude Code and Codex

From a repository clone, use the same installer and change the target:

```sh
node scripts/lore-plugin.mjs install --target claude
node scripts/lore-plugin.mjs install --target codex
```

With the `lore-plugin` CLI from the installed release, the forms are `lore-plugin install --target claude` and `lore-plugin install --target codex`. Restart the host after installation and review the installer's result. Hooks, permissions, and write boundaries depend on each host; Lore Plugin does not replace them.

## Common issues

If OpenCode does not find the skills, confirm they are in `~/.config/opencode/skills/` and restart the host. The global installer preserves existing `tui.json` entries and leaves `tui.jsonc` untouched.

An unattended `opencode run` automatically rejects a permission request left in `ask` and ends the run. To prepare access to routed sibling trees, run `lore-plugin opencode-permissions --project <dir> --from-routing`; add `--write` to merge the proposal into that project's `opencode.json`. To prepare a confined profile, run `lore-plugin opencode-sandbox <dir>`. Neither command changes global OpenCode configuration. The technical reference explains closing stdin, the order of `-f`, and the `TEMP`, `TMP`, and `TMPDIR` variables.

To inspect a tree for possible residue and omissions without changing it, run:

```sh
lore-plugin hygiene <project-path>
```

The command is read-only, reports its coverage, and proposes reviewing findings; it does not delete or prune files. You can also add `--json` for JSON output.

If a delegate is blocked by permissions, record that cause as a block; do not report it as failed work. A task that writes to another tree remains subject to the host's decision.

## What it does not do

Lore Plugin does not guarantee a correct result, write criteria without approval, automatically turn notes into Lore, or replace your judgment. Vespi is not a permanent agent, scheduler, or universal persistence engine. A receipt describes evidence and state; by itself it does not prove who authorized an action, grant authority, or guarantee an external effect.

## Superpowers

[Superpowers](https://github.com/obra/superpowers) is a community collection of skills. You can explore it as a complement; it is not a Lore Plugin requirement and this manual does not install it automatically.
