# Lore Plugin 2.5.1 — Corrección de tests

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

Lore Plugin 2.5.1 es una corrección de tests sobre el corte 2.5.0. No entra nada nuevo; arregla lo que se rompió después del corte.

Lo que se corrigió:

- 5 tests que fallaban por el campo `sweepType` agregado en la corrección de MYCELIUM (el recibo ahora incluye `sweepType` como metadato de la revisión, no del contenido).
- 2 tests que fallaban por el release notes (párrafos hardwrap, falta de "prueba por hosts", orden de secciones EN/ES).

Este release se prueba en Claude Code, Codex y OpenCode a nivel de adaptador de repositorio. La instalación, los límites de verificación y la cobertura medida acompañan este release.

# Lore Plugin 2.5.1 — Test fixes

> [README](https://github.com/andresanemic/lore-plugin#readme) · [English](#lore-plugin-251--test-fixes)

Lore Plugin 2.5.1 is a test fix over the 2.5.0 cut. Nothing new enters; it fixes what broke after the cut.

What was fixed:

- 5 tests failing on the `sweepType` field added in the MYCELIUM correction (the receipt now includes `sweepType` as review metadata, not content).
- 2 tests failing on the release notes (hardwrap paragraphs, missing "tested by hosts", EN/ES section order).

This release is tested on Claude Code, Codex and OpenCode at the repository adapter level. Installation, verification limits and measured coverage accompany this release.
