# LORE PLUGIN · MULTI-PROVIDER SETUP

# From a new machine to the first project with portable criteria

**Field version 0.2 · Windows x64 · Written: 2026-10-04**  
**Lore Plugin 2.5.2 (local cut, not yet published) with the pinned Vespi kernel 0.1.6.** Interfaces, free models, and installation methods change. Check the sources before following this walkthrough.

## The idea

You do not need to choose one model forever. You need a place where different models share the same project, state, and criteria between sessions. Here that place is OpenCode. On the second day, we will add Claude Code, Codex if you need it, and the first Area, Project, and Bot.

Lore Plugin preserves earned criteria that can continue to guide decisions across agents and models. The model changes; the work files, their state, and the criteria that govern decisions remain in the project.

## System map

```text
                FREE OPENCODE ZEN MODEL
                            │
                            ▼
                         OpenCode ─────── Claude Code
                            │                    │
                            └────────┬───────────┘
                                     ▼
                                   C:\IA
                                     │
                       ┌─────────────┴─────────────┐
                       │                           │
                     AREAS                        BOTS
                       │                           │
                   PROJECTS ◄────── federation ───┘
                       │
                      LORE
                       │
             criteria kept apart from state
```

Codex can join as another host. Vespi coordinates bounded operations under authority and verification.

## 0. What we will install

| Piece | In this walkthrough | Purpose |
|---|---|---|
| OpenCode | Required | First host and visual home for the walkthrough |
| A free or Contributor OpenCode Zen model | Required for bootstrap | Help prepare the environment |
| Git | Required | Version control and kit download |
| VS Code | Recommended | Complementary conventional editor |
| Obsidian | Recommended | Optional notes editor; not a Lore requirement |
| Superpowers | Recommended | Community add-on for software work |
| Lore Plugin 2.4.9 | Required | Portable criteria, Areas, Projects, and Bots |
| Claude Code | Second day | Second host for the same project |
| Codex | Optional | Another host, if it is already part of your workflow |
| Node.js | Required to install from a clone | Run the kit installer and its local CLI |

> **Walkthrough rule**  
> We will not install everything in one rush. Each section ends at a gate with a check. If it is not green, we do not continue. An installation you cannot repeat and verify does not yet count as a portable installation.

## First day: Lore Plugin installed and verified

### 1. Bootstrap: install OpenCode

OpenCode cannot install itself. Download it for Windows from its official site. The method depends on the edition; confirm that the app opens and can start a session.

> **Bootstrap**  
> Install the host outside the agent. Afterward, the agent can help prepare the environment within the limits you approve.

**We tell the agent:**

```text
Help me check that OpenCode is installed and opens correctly. Do not install or change anything; tell me what you will check and wait for my response.
```

**Gate 1 — GREEN**

OpenCode opens, you can create a conversation, and you can find where to select a provider and model. If the app does not start or you cannot open a session, stop and resolve that before continuing.

### 2. Choose a starting model

In OpenCode, run `/connect`, choose OpenCode Zen, and complete authentication; then run `/models`. Choose a model marked free or Contributor. The catalog rotates, so note the exact selector name and date in `SETUP-LOG.md`.

Examples seen on 2026-09-15: Big Pickle, MiMo-V2.5 Free, and Muse Spark 1.3 Contributor Free. These are dated references, not a current list.

> **Limit**  
> Free does not mean local or private. Review the provider's terms before sharing confidential material or credentials.

**We tell the agent:**

```text
Help me connect OpenCode Zen. Show me models currently marked free or Contributor and wait for my choice. Record the exact name and date in SETUP-LOG.md. Do not store credentials.
```

**Gate 2 — GREEN**

Open a new conversation and ask: `Reply only: SETUP READY; model: <exact selector name>`. The reply must identify the selected model. Confirm that the same name is in `SETUP-LOG.md`. If you do not get a response, check authentication and selection before continuing.

### 3. Create the root and prepare basic tools

Before creating Areas or Lore, prepare `C:\IA\setup\SETUP-LOG.md` outside `lore/`. It is a technical installation log, not criteria.

**We tell the agent:**

```text
Propose creating C:\IA, C:\IA\setup, and SETUP-LOG.md with date, tool, method, version, and GREEN/RED status. Do not create Areas, Projects, Bots, or Lore or install anything. Show me the plan and wait for approval.
```

Install Git, VS Code, and optionally Obsidian, one at a time. Use their official sites or confirm WinGet's current package ID matches the product. Approve each change; then verify the version or open the app and record the result.

**We tell the agent:**

```text
Install Git, VS Code, and optionally Obsidian one at a time. Before each change, tell me its source, command, and effect; wait for approval. Verify each tool before continuing and record the result in C:\IA\setup\SETUP-LOG.md. Do not change other settings.
```

Configure your Git name and email only after the agent asks you. It must not invent them or record personal data in the log unless you ask.

**Gate 3 — GREEN**

Git responds to `git --version`, VS Code opens, Obsidian opens if you installed it, and `SETUP-LOG.md` contains the results. Check that the log is in `C:\IA\setup`, outside any `lore/` directory.

### 4. Superpowers, a recommended add-on

Superpowers is an optional community collection of development skills, separate from Lore Plugin. If you choose it, follow its current official OpenCode instructions, restart if required, and confirm the host recognizes it. Otherwise, continue.

**We tell the agent:**

```text
Install Superpowers as an optional add-on using https://raw.githubusercontent.com/obra/superpowers/refs/heads/main/.opencode/INSTALL.md. Read my configuration, preserve existing settings, and show the diff before saving. If the guide changed or contradicts an earlier installation, stop and explain. Then we will check its skills.
```

**Gate 4 — GREEN, if you installed Superpowers**

After restarting, ask the agent which Superpowers skills it detects and check the reply. If you did not install it, record “skipped, optional” and continue.

### 5. Install Lore Plugin in OpenCode

In OpenCode, use the kit installer from a repository clone. You need Git and Node.js. Use the public `v2.5.2` clone for this walkthrough. From a local clone of this branch:

```powershell
git clone https://github.com/andresanemic/lore-plugin.git "$env:USERPROFILE\Tools\lore-plugin"
Set-Location "$env:USERPROFILE\Tools\lore-plugin"
node scripts/lore-plugin.mjs install --target opencode
```

The installer copies and verifies the skills, hook, TUI mark, `tui.json`, and local CLI. Restart OpenCode and check the result. Do not edit `opencode.jsonc` for local plugin discovery.

**We tell the agent:**

```text
Install Lore Plugin from my local clone with node scripts/lore-plugin.mjs install --target opencode. Check existing installs and duplicates first. Preserve unrelated skills and leave no duplicate Lore copies. Do not create Lore yet. Report what you installed and verified.
```

**Gate 5 — GREEN: Lore installed**

Restart OpenCode. Ask the host to list its Lore skills without running any. The kit contains eight main Lore skills: `use-lore`, `brainstorming-lore`, `create-area`, `create-project`, `save-to-lore`, `transmute-lore`, `create-bot`, and `stale-lore`. Version 2.5.2 also includes the experimental `vespi` skill. `obsidian-lore` is not part of the kit. Check paths, duplicates, and successful installer verification. If `obsidian-lore` appears, note its path and confirm whether it is left over from another install before removing it. Do not create Lore yet: this is the right point to end the first day.

**We tell the agent:**

```text
Use OpenCode's skill tool to list Lore Plugin skills. Do not load or run any yet. I expect use-lore, brainstorming-lore, create-area, create-project, save-to-lore, transmute-lore, and create-bot; also confirm vespi is present as an experimental skill. obsidian-lore is not part of the kit: if it appears, report its path and do not delete it. Report duplicate or missing paths; change nothing.
```

## Second day: other hosts and the first project work

### 6. Install Claude Code and the Lore plugin

Claude Code is another host and does not inherit OpenCode skills. On Windows, use the official native installer from PowerShell. In a new terminal, check `claude --version` and `claude doctor`. You sign in yourself.

**We tell the agent:**

```text
Install Claude Code on Windows with `irm https://claude.ai/install.ps1 | iex`. Explain the command and wait for my approval. Do not use my credentials or sign in. Check claude --version and claude doctor, record the result, and stop before login.
```

From the same `v2.5.2` clone you used for OpenCode, run Claude's installer. It calls Claude Code's official marketplace, installs the kit's local CLI, and connects the status mark. It depends on the `v2.5.2` release being available in the public repository:

```powershell
node scripts/lore-plugin.mjs install --target claude
```

**We tell the agent:**

```text
Run node scripts/lore-plugin.mjs install --target claude from the `v2.5.2` clone. Before changing anything, explain the marketplace commands and local paths you will touch. Do not use my credentials. Open a new session and confirm the eight main Lore skills and `vespi`. Do not delete existing installs without showing their paths.
```

Open a new session as Claude Code directs.

**Gate 6 — GREEN**

Confirm that Claude Code starts a session and its skill selector shows the eight main Lore skills and `vespi`. The marketplace loads the plugin; the local CLI and status mark are separate components.

### 7. Codex, if you need it

Codex is optional. From a local clone, `node scripts/lore-plugin.mjs install --target codex` copies the package and prepares the personal marketplace. Then run `codex plugin add lore@personal` and enable it in Codex. Public commands use the `v2.5.2` release.

**We tell the agent:**

```text
Prepare Codex as an optional host according to this version's README. Show configuration paths and diff before changing anything. Run node scripts/lore-plugin.mjs install --target codex and verify the components. Then run codex plugin add lore@personal. Do not use credentials.
```

**Gate 7 — GREEN, if you installed Codex**

Open Codex in a test project and confirm that it detects the plugin and its skills. If you do not use Codex, mark this step skipped and continue with Claude Code and OpenCode.

### 8. One contract for this pilot

For this pilot, we propose one body of instructions in `AGENTS.md` and a `CLAUDE.md` adapter importing it with `@AGENTS.md`. This is a **pilot convention**, not Lore Plugin canon. Check that each host reads the expected file.

```text
AGENTS.md ───────────────► Codex and OpenCode
   ▲
   │ @AGENTS.md
CLAUDE.md ───────────────► Claude Code
```

**We tell the agent:**

```text
Inspect the instruction files and propose one body in AGENTS.md, with CLAUDE.md as an @AGENTS.md adapter. This is a pilot convention, not canon. Show the diff and wait for approval. Check which contract each host reads.
```

**Gate 8 — GREEN**

OpenCode and Codex find `AGENTS.md`; Claude Code finds `CLAUDE.md` and its imported content. If you cannot verify a read, record that limit and do not claim the contract is shared.

### 9. Create the first Area and Project

Open a host in `C:\IA` and use the getting-started sentence. The kit inspects the tree and criteria, asks one question at a time, and works toward an artifact. Do not create Areas in advance or copy a system without deciding what governs.

**We tell the agent:**

```text
I want to start using Lore Plugin; help me. Check C:\IA for a contract, lore/, or FASES.md. Ask one question at a time and help me create the first needed artifact. Explain any proposed criteria and wait for approval before writing.
```

With a real Area, `create-project` creates each Project in `{Area}/projects/{slug}/`. Its Lore references the Area criteria by path instead of copying them. Lore persists; `FASES.md` holds state and plans.

**Gate 9 — GREEN**

The first Area has its contract, `lore/`, and `FASES.md`; the Project is inside `projects/`, and its Area references resolve. Review the diff before accepting any criteria.

### 10. Design the first Bot

A Bot lets you start a session and work across Projects with routed criteria. `create-bot` defines what it governs, leaves out, and points to. Federation points to source Lore; it does not copy it. Superpowers is optional.

**We tell the agent:**

```text
Let's design my first Bot. Review the Areas and Projects; use create-bot to decide what it handles, excludes, and points to. Ask one thing at a time. Do not copy Lore. Present the design and wait for approval before writing.
```

**Gate 10 — GREEN**

The Bot has a reviewable purpose, limit, and routing table. Every route resolves to the right tree, and federated criteria still live at their source.

## Vespi

### What it is and when to use it

Vespi is a JavaScript kernel integrated in the `vespi` skill. Use it when a bounded operation continues across sessions, needs authority, or must be checked before resuming. Declare the goal, owner, effect, and bounded human-granted authority before acting; verify the effect separately and leave a receipt of what was and was not observed and the next agreed action. State lives under `## Operaciones` in the project's `FASES.md`. A receipt grants no permission.

Ordinary work does not need Vespi. A phrase of strain does not invoke it: `use-lore` routes it to the coordinator. Only `save-to-lore` arbitrates writing criteria; Vespi does not write Lore.

### How to invoke it in each host

- **OpenCode:** load skills with its skill tool. Ask the coordinator to assess the operation and invoke `vespi` if appropriate.
- **Claude Code:** install Lore separately. Ask the coordinator to use `vespi` if appropriate and confirm the skill appears in a new session.
- **Codex:** install and enable Lore; confirm it discovered `vespi`, then ask the coordinator to assess it.

In all three hosts, “let's continue tomorrow” is a signal for the coordinator, not authorization or direct invocation.

### Minimal walkthrough

Practice with a reversible local note. Define who authorizes it, the exact file, and a separate check. Do not use payments, networks, or irreversible effects to learn.

**We tell the agent:**

```text
I want to create <project-path>/vespi-demo.md and continue after this session. Check the contract and FASES.md. If appropriate, use vespi to declare goal, owner, effect, authority, and verification. Wait for my approval before writing. Check the file separately, leave state and receipt where the kit specifies, and say what was verified. Do not contact external services.
```

**Vespi gate — GREEN**

The block appears under `## Operaciones` in `FASES.md`; permission matches the declared effect; the check observed the file; and the receipt separates coverage from limits. End the session, return to the project, and ask to continue. Before proceeding, the coordinator rereads the contract, `FASES.md`, receipt, and authority. If a material premise changed or evidence is insufficient, it stops and asks for the missing decision.

### What 0.1.6 includes and does not include

The kit pins the frozen Vespi 0.1.6 cut from commit `ed99f6ef11c59552f48d0bb62ba575fa5d50c2fa`, with operations, granted authority, human decisions, receipts, bounded delegations, and resuming. The facade `skills/vespi/core/vespi.mjs` declares, from the vendored copy, the four optional surfaces present (`capabilities.md` only describes them): emergency permission, skill provenance, x402 payments, and ZK verification. `zk-bn254-reference.js`, an experimental cryptographic reference, and the SDK-backed x402 bridge are excluded; the surfaces are not connected automatically and remain in field validation.

The kernel documentation includes historical testnet evidence; this walkthrough does not run transactions, and that evidence is not an audit. Version 0.1.6 lacks receipt chaining with `prev`, intent recorded before effects, accumulated budgets, `narrow(parent, child)`, and a resume epoch. The host supplies the clock; injected ports are trusted code, not a sandbox. A digest protects integrity, not approval identity or external effects.

## Continuity after compaction

After compaction or resuming, `use-lore` requires rereading the contract, connected Lore, and `FASES.md`, checking links, and reconstructing work from files. Claude Code and Codex have hooks that leave a marker before compaction and notify on resume. OpenCode does not offer its plugin the same compaction event; save state before reaching the limit and apply the rule when reopening the session or receiving the next request. No host recovers data that was never written. Vespi revalidates authority, premises, and receipts; resuming does not authorize effects.

## Final test: change the model without changing the work

Check the walkthrough in the same Project:

1. Open the Project in OpenCode and ask which Lore, contract, and `FASES.md` govern it.
2. Switch models and continue with the same files.
3. Open the folder in Claude Code and confirm it reads the contract and state. Repeat in Codex if installed.
4. Resolve a friction. If it reveals criteria, ask to “save this to Lore” and review the diff.

**Final gate — GREEN**

A second model and another host can continue the work from the same artifacts without you having to reconstruct the project verbally. Criteria remain in project files, changes are verifiable, and no skill wrote to Lore without your approval.

## What Lore Plugin and Vespi do not do

Lore Plugin does not guarantee correct answers, add criteria without approval, or replace your judgment. `FASES.md` records state and plans. A skill installed in one host is no proof that another loaded it. Vespi is not a permanent agent, scheduler, or universal persistence engine. A receipt grants no authority or proof of an external effect. Host permissions still decide what the agent can do.

## Technical sources and status

Field version written on 2026-10-04. Interfaces, free models, and installation methods can change; recheck them before publishing this manual.

- OpenCode: https://opencode.ai/docs/, https://opencode.ai/download/, https://opencode.ai/docs/windows-wsl, https://opencode.ai/docs/providers, https://opencode.ai/docs/skills, and https://opencode.ai/docs/zen (checked 2026-10-05; free offers rotate).
- Claude Code, installation, verification, and plugins: https://code.claude.com/docs/en/setup and https://code.claude.com/docs/en/plugins (checked 2026-10-05).
- Codex, plugins and marketplaces: https://developers.openai.com/plugins/build/plugins (checked 2026-10-05).
- Superpowers, per-host installation and OpenCode guide: https://github.com/obra/superpowers and https://github.com/obra/superpowers/blob/main/docs/README.opencode.md (checked 2026-10-05).
- Git for Windows, WinGet, Visual Studio Code, and Obsidian: https://git-scm.com/install/windows, https://learn.microsoft.com/windows/package-manager/winget/install, https://code.visualstudio.com/Download, and https://obsidian.md/help/Getting%2Bstarted/Download%2Band%2Binstall%2BObsidian (checked 2026-10-05).
- Lore Plugin, install source, commands, and eight main skills: `README.md`, `scripts/installer.mjs`, `scripts/lore-plugin.mjs`, and `skills/` in this kit. Use the `v2.5.2` release for the public install commands.
- Vespi 0.1.6 and evidence: `skills/vespi/SKILL.md`, `skills/vespi/capabilities.md`, `skills/vespi/core/kernel/SOURCE.md`, `docs/RELEASE_2.5.2.md` in this kit, and `README.md`, `docs/CAPABILITIES.md`, `docs/RELEASE_0.1.5_KERNEL.md`, `docs/WALKTHROUGH.md`, and `docs/TESTNET_EVIDENCE.md` in the kernel repository. This does not imply a live connection from the kit.

## Provenance note

This adapts the structure and tone of Andrés's master tutorial v0.1: map, gates, callouts, two days, and final test. It removes Ollama, Qwen, Ponytail, and local models; Superpowers is recommended. It updates skills and per-host installation, and adds Vespi and continuity after compaction. It applies the 2026-09-15 corrections; the model examples are dated that day.
