# CHANGELOG

## 2.5.2 — Servine

Lo que entra: los commits locales posteriores a 2.5.1.

- **Vigilante de FASES:** verificador externo de FASES y pre-commit que las obliga; el pre-commit de FASES y el vigilante nombran la ley 52 que corren.
- **Hooks:** los tres hallazgos normales de la superreview y el aviso rojo de PreToolUse.
- **Docs:** state the open source commitment (Apache 2.0) in NOTICE and the README license row.
- **Tests:** isolate guard test sessions by fixture root; use unique session IDs in jurisdiction tests; provenance checks no longer depend on a folder only one machine has; guard generated verifier against task data.
- **CI:** run full suite across platforms; make CI suite portable across hosted runners; keep CI source fixtures outside the scanned tree; fix CI and keep Meridian links under Vespi.
- **Fix:** parse the shipped code again, two CodeQL-unreadable files; remove CodeQL flagged code construction and regex.
- **Hero:** simplify bilingual guides for 2.5.1; hero Spanish matches English; hero outside expandable; clean hero: separate languages, no mixed noise.
- **Kernel fijado:** 0.1.6 (commit 95f2d614f4492056c8bb2cd951f08d1089027d4f).

Suite (Windows, `npm test`, 2026-10-11): 1109 pruebas, 1103 aprobadas, 0 fallas, 6 omitidas.
