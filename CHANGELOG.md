# CHANGELOG

## 2.5.3 — Revisar el resultado final

Lo que entra: el trabajo coordinado pasa de comprobar piezas delegadas a revisar el resultado final compuesto contra el encargo original y sus fuentes.

- **Método y obligaciones:** el coordinador lleva el método distribuido con cada encargo acotado, conserva las obligaciones pedidas y declara los resultados finales para revisarlos aparte. Un parcial correcto ya no sustituye una composición sin revisar ni una obligación omitida; los cambios en archivos de destino integrados, también escritos por terminal, siguen siendo detectables al cerrar dentro de los límites documentados.
- **Ruta predeterminada:** las correcciones triviales reconocidas de forma acotada pueden resolverse en una pasada directa; el resto exige revisión final y la verificación ausente queda visible. La elección no concede gasto, publicación ni acceso adicional a archivos.
- **Cartas y chispas:** cartas silenciosas y cinco chispas revisadas apoyan la coordinación sin volverse Lore aprobado automáticamente. El contraste offline separa el material del trabajador de las respuestas del evaluador; no establece un beneficio medido.
- **Fix, recepción:** `receiveTask` lee la ruta resuelta contra el root de la operación que validó, no la ruta cruda relativa al directorio de trabajo del proceso; una CLI lanzada desde otro directorio ya no sella la huella de un archivo ajeno al proyecto.
- **Fix, FASES.md:** las escrituras de estado toman un cerrojo exclusivo por archivo (`FASES.md.lock`, con token propio, válido entre procesos) y usan temporales de nombre único; dos escrituras concurrentes ya no pierden una carta ni chocan en el temporal. Un cerrojo huérfano de más de 30 s lo retira un solo escritor (se renombra a un nombre único y se borra solo ese), y al liberar solo se borra el cerrojo propio. Límites: ordena solo a quienes lo toman, no cubre secuencias entre comandos de la CLI, y la espera máxima por un cerrojo vivo ajeno es de 35 s.
- **Fix, obligaciones:** la evidencia de tipo artefacto de una obligación exige el root de la operación y cumple la misma contención que la entrega de una tarea, al registrarla y al cerrar (la ruta se lee resuelta contra ese root); sin root se rechaza con un error claro.
- **Instalación:** probada en homes aislados de Claude Code, Codex y OpenCode con fixtures offline. La evidencia de entrega del método cubre al trabajador del kit en Claude Code con hooks recibidos; no cubre a advisor o daimon ni demuestra entrega en los tres hosts. Recibir el método no establece que haya causado una conducta conforme.
- **Límites:** las pruebas y fixtures offline apoyan comprobaciones de implementación, no una auditoría de seguridad independiente, un benchmark conductual completo ni la validación científica de LUS. La verificación final comparte usuario del sistema con el coordinador: ofrece detección sin independencia, no prevención de escrituras arbitrarias. Los recibos anteriores sin los vínculos requeridos necesitan recepción, revisión y verificación nuevas; se conservan estado y evidencia.
- **Desktop:** se presentará en Lisboa la próxima semana y no bloquea esta publicación del kit.
- **Kernel fijado:** 0.1.8 (commit 0c0a3e3425a915aa43af1e8c5ffaaacb24c55729); once módulos copiados se comprueban contra la fuente versionada e incluyen contexto aprobado y continuaciones acotadas.

## 2.5.2 — Servine

Lo que entra: los commits locales posteriores a 2.5.1.

- **Vigilante de FASES:** verificador externo de FASES y pre-commit que las obliga; el pre-commit de FASES y el vigilante nombran la ley 52 que corren.
- **Hooks:** los tres hallazgos normales de la superreview y el aviso rojo de PreToolUse.
- **Docs:** state the open source commitment (Apache 2.0) in NOTICE and the README license row.
- **Tests:** isolate guard test sessions by fixture root; use unique session IDs in jurisdiction tests; provenance checks no longer depend on a folder only one machine has; guard generated verifier against task data.
- **CI:** run full suite across platforms; make CI suite portable across hosted runners; keep CI source fixtures outside the scanned tree; fix CI and keep Meridian links under Vespi.
- **Fix:** parse the shipped code again, two CodeQL-unreadable files; remove CodeQL flagged code construction and regex.
- **Hero:** simplify bilingual guides for 2.5.1; hero Spanish matches English; hero outside expandable; clean hero: separate languages, no mixed noise.
- **Revisión:** superreview con la revisión de código multiagente de Claude Code, ocho hallazgos y tres normales corregidos; no hay auditoría de seguridad externa independiente.
- **Instalador:** el README dice qué toca `install` en OpenCode y en Codex y cómo volver atrás; se probó en un home aislado. Todavía no hay comando para desinstalar.
- **Find Your Way:** la postulación está completa salvo su video; este es su último tag.
- **Kernel fijado:** 0.1.6 (commit 39d45733839d0a05f60248fc6e5b81c892c464f8).

Suite (Windows, `npm test`, 2026-10-11): 1109 pruebas, 1103 aprobadas, 0 fallas, 6 omitidas.
