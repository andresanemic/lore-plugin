# Lore Plugin 2.5.2 — Servine

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español) · Local cut, 2026-10-11. Not published: no tag or GitHub release has been pushed.

Lore Plugin 2.5.2 is a local cut on top of 2.5.1. It keeps the operation model of 2.5.1 and adds three things.

**FASES watchdog.** `lore-plugin vigilante` checks, from a process other than the one that works, that each tree's `FASES.md` accompanied the latest work, and leaves a sealed receipt that declares what it covered and what it did not. `lore-plugin fases install-hook` installs a git pre-commit that stops a work commit that leaves `FASES.md` behind. It measures synchrony, not whether what `FASES.md` says is true. The three normal findings of the superreview are fixed in the hooks, and PreToolUse no longer paints a red message in Claude Code mobile. The kit pins the separately versioned Vespi kernel **0.1.6** (commit `ed99f6ef11c59552f48d0bb62ba575fa5d50c2fa`), which carries one fix: a duplicated declared capability no longer leaves a gap in the registered authority.

**Evidence and limits.** Tested on Windows with the full suite of the kit; the result is recorded in the [CHANGELOG](../CHANGELOG.md). Installation checks in Codex, OpenCode and Claude Code were not rerun for 2.5.2; the evidence of 2.5.1 stays in its [own note](./RELEASE_2.5.1.md). Review: this cut went through a superreview run with the multi-agent code review of Claude Code, with eight findings, three of them normal, all three fixed in this cut. The project ran those reviews itself; they are not an independent external security audit. No operation-state migration is specified; preserve `FASES.md` and operation receipts.

**Not in this cut.** Silent cards and exit sparks in every agent turn are in progress. They enter 2.5.2 only if they pass their tests and an independent review; this note will say so when they do.

---

<a id="español"></a>

# Lore Plugin 2.5.2 — Servine

> [README](https://github.com/andresanemic/lore-plugin#readme) · [English](#lore-plugin-252--servine) · Corte local, 2026-10-11. Sin publicar: no se ha subido ningún tag ni release a GitHub.

Lore Plugin 2.5.2 es un corte local sobre 2.5.1. Conserva el modelo de operación de 2.5.1 y agrega tres cosas.

**Vigilante de FASES.** `lore-plugin vigilante` comprueba, desde un proceso distinto del que trabaja, que el `FASES.md` de cada árbol acompañó al último trabajo, y deja un recibo sellado que declara qué cubrió y qué no. `lore-plugin fases install-hook` instala un pre-commit de git que detiene el commit de trabajo que deja atrás a `FASES.md`. Mide sincronía, no que lo que dice `FASES.md` sea cierto. Los tres hallazgos normales de la superreview están arreglados en los hooks, y PreToolUse ya no pinta un mensaje rojo en Claude Code móvil. El kit fija el kernel de Vespi **0.1.6**, versionado por separado (commit `ed99f6ef11c59552f48d0bb62ba575fa5d50c2fa`), que trae una corrección: una capacidad declarada duplicada ya no deja un hueco en la autoridad registrada.

**Evidencia y límites.** Probado en Windows con la suite completa del kit; el resultado está en el [CHANGELOG](../CHANGELOG.md). No se repitieron las pruebas de instalación en Codex, OpenCode y Claude Code para 2.5.2; la evidencia de 2.5.1 queda en su [propia nota](./RELEASE_2.5.1.md). Revisión: este corte pasó por una superreview hecha con la revisión de código multiagente de Claude Code, con ocho hallazgos, tres normales, los tres corregidos en este corte. Son revisiones propias, no una auditoría de seguridad externa independiente. No se especifica migración del estado de operación; conserva `FASES.md` y sus recibos.

**Fuera de este corte.** Las cartas silenciosas y las chispas de salida en cada turno de cada agente están en construcción. Entran en 2.5.2 solo si pasan sus pruebas y una revisión independiente; esta nota lo dirá cuando ocurra.
