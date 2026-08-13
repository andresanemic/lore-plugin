# Lore Plugin 2.0.9 — The definitive Lore Plugin 2.0

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

Lore turns project experience into reusable criterion for AI agents. Version **2.0.9** is the
complete entry point to Lore Plugin 2.0: the 2.0.0 foundation, the consolidated 2.0.8 repository
and documentation work, and the final host-contract correction introduced here.

New users can start with this release. Earlier 2.0 releases remain as a concise, auditable history.

## What Lore Plugin 2.0 contains

- **Eight focused skills:** `use-lore`, `brainstorming-lore`, `create-area`, `create-project`,
  `create-bot`, `save-to-lore`, `transmute-lore` and `obsidian-lore`.
- **Five transmutation modes:** ADD, CLEAN, TRANSLATE, UPGRADE and CRYSTALLIZE.
- **A six-piece Lore standard**—six structural responsibilities, not necessarily six files—and a
  DRY Area↔Project inheritance model.
- **Notes as source, never criterion.** Obsidian inboxes are mined through an explicit HARD GATE.
- **Bots that point before they copy.** Ecosystem copies, packaging, encryption, Telegram and the
  local multi-provider launcher are optional and off by default.
- **Native Claude Code and Codex packaging**, plus direct repository installation for other agents
  that understand Markdown skills.

## What 2.0.9 closes

- Every Area chooses one instruction contract from its primary host: `CLAUDE.md` for Claude Code
  or `AGENTS.md` for Codex. Projects and unpackaged bots inherit that choice.
- Lore no longer creates both contract files by default. Cross-host users can configure Codex's
  `project_doc_fallback_filenames` or explicitly approve a minimal adapter; two full contracts are
  never maintained.
- Federated bots carry each source's actual contract and derive Codex `--add-dir` roots from the
  same manifest that owns routing.
- Packaged bots carry both Claude Code and Codex manifests while their project-level maintenance
  contract still follows the primary host.
- The bilingual README and all Usage, Reference and Migration guidance now share that contract
  model. Benchmark tables use one aligned width in both languages.
- The Origin section restores the detailed mapping from LUS's foundational bibliography to Lore's
  mechanics while preserving the extended dialogue, including Francisco Varela's enaction.
- The repository root remains clean; supporting guides live under `docs/` and every local link is
  checked.

## Audited benchmark

Every published Codex run used **`gpt-5.6-sol` with medium reasoning effort**. Model, prompt and
tools were identical between arms.

| Result | Cold Codex | Codex + Lore |
|---|---:|---:|
| Evaluated criterion respected at first attempt | 25/36 (69.4%) | **33/36 (91.7%)** |
| Modeled time to a conforming result | 61.68 s | **57.11 s (−7.4%)** |
| Tasks made worse | — | **0/12** |

A separate controlled extension measured up to one repair across 52 units per arm. Lore reached
**52/52 goals versus 39/52**, with 15.2% less observed time and 25.3% fewer attempts inside that
limit. These are Codex results, not a universal model claim; modeled and observed costs remain
separate in the documentation.

## Verification

- 42 automated tests passing.
- The public 72-run CSV is recalculated by regression test.
- All local documentation links resolve.
- All eight skills have their own bilingual Usage and Reference sections.
- Four publishable version sources agree on `2.0.9`.
- The npm package dry-run and local Claude Code/Codex installation are verified before release.

## Install or upgrade

### Claude Code

```text
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

### Codex CLI

```bash
codex plugin marketplace add andresanemic/lore-plugin
codex plugin add lore@lore-plugin
```

### Direct from the repository

```bash
git clone https://github.com/andresanemic/lore-plugin.git
cd lore-plugin
node scripts/lore-plugin.mjs install --target all
```

**Full changelog:** https://github.com/andresanemic/lore-plugin/compare/v1.2.1...v2.0.9

---

## Español

Lore convierte la experiencia de un proyecto en criterio reutilizable para agentes de IA. La
**2.0.9** es el punto de entrada completo a Lore Plugin 2.0: reúne la base de 2.0.0, la
consolidación del repositorio y la documentación realizada en 2.0.8, y la corrección final del
contrato por host.

- Ocho skills y cinco modos de `transmute-lore`.
- Un estándar de seis piezas: seis responsabilidades estructurales, no necesariamente seis archivos.
- Un contrato por Área: `CLAUDE.md` para Claude Code o `AGENTS.md` para Codex. Proyectos y bots no
  empaquetados heredan esa elección.
- Compatibilidad cruzada sin dos contratos completos: fallback configurable de Codex o adaptador
  mínimo aprobado de forma explícita.
- Bots federados con contrato y rutas de trabajo derivados de su único manifiesto.
- README bilingüe en un archivo, tablas alineadas y documentación complementaria bajo `docs/`.
- Benchmark identificado: **`gpt-5.6-sol`, razonamiento medio**, 72 corridas auditadas.
- Bibliografía fundacional de LUS explicada con detalle y diálogo extendido, incluido Francisco
  Varela.
- Pruebas de coherencia para versiones, enlaces, modos, documentación y continuidad entre hosts.

Las versiones 2.0.0–2.0.8 permanecen como historia auditable; para instalaciones nuevas y
actualizaciones corresponde usar **v2.0.9**.
