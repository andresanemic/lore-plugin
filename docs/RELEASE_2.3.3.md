# Lore Plugin 2.3.3 — Leaving means no active route remains

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

`LEAVE` used to remove the always-on block and preserve the criterion, but it did not inventory the other execution surfaces that could still load Lore. A root-contract instruction outside the block, a secondary host contract or a project-owned hook could keep governance alive after the mode reported success. 2.3.3 makes the exit boundary observable: the read-only pre-flight inventories every active junction, stops before touching symlinks or shared contracts, and shows the exact removal set at the threshold. After approval it disables only project-owned Lore routes, preserves unrelated contract and hook content byte-for-byte, keeps `lore/` plus plain `enrutamiento.md`, and records `leave:partial` before the first mutation so an interrupted pass resumes from its checklist instead of guessing from a missing marker.

Nemotron 3 Ultra performed the initial audit that exposed the LEAVE gap. Its proposed implementation and the audit's other claimed fixes were not accepted as evidence: they introduced untested behavior, contradicted MYCELIUM's read-only contract and attributed changes to files that had not changed. The correction was reimplemented and verified independently with GPT-5.6 Sol medium. Static regression tests are in [`bench/leave.test.mjs`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave.test.mjs); the separate fresh-agent control and treatment record is in [`bench/leave-behavior/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave-behavior/README.md). A regex proves that a safeguard is written; only the fresh-session treatment checks that a known clue stays dormant after exit.

This patch changes one mode of `transmute-lore`, its bilingual documentation, release metadata and tests; all eight skills and the public contract remain intact. It deliberately adds no OBSIDIAN executable, no UPGRADE/MYCELIUM score, no stricter BRAINSTORMING taxonomy and no new scientific hypothesis: those claims lacked behavioral evidence or were already covered by the current skills. Existing Lore needs no migration; the new boundary applies only when `LEAVE` runs.

Full notes: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.3

---

<a id="español"></a>

# Lore Plugin 2.3.3 — salir significa que no queda ninguna ruta activa

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

`LEAVE` quitaba el bloque siempre activo y conservaba el criterio, pero no inventariaba las otras superficies de ejecución capaces de seguir cargando Lore. Una instrucción fuera del bloque en el contrato raíz, un contrato secundario o un hook propio del proyecto podían mantener el gobierno después de que el modo declarara éxito. 2.3.3 vuelve observable la frontera de salida: el pre-flight de solo lectura inventaría cada junta activa, se detiene antes de tocar symlinks o contratos compartidos y muestra en el umbral el conjunto exacto que retirará. Después de la aprobación desactiva solo las rutas Lore propias del proyecto, conserva byte por byte el contenido ajeno de contratos y hooks, mantiene `lore/` más `enrutamiento.md` plano y escribe `leave:partial` antes de la primera mutación para que un pase interrumpido se reanude desde su checklist en vez de adivinar a partir de un marcador ausente.

Nemotron 3 Ultra realizó la auditoría inicial que expuso el hueco de LEAVE. Su implementación propuesta y los demás arreglos atribuidos por la auditoría no se aceptaron como evidencia: introducían conducta sin probar, contradecían el contrato read-only de MYCELIUM y adjudicaban cambios a archivos que no habían cambiado. La corrección fue reimplementada y verificada de forma independiente con GPT-5.6 Sol medium. Los tests estáticos de regresión están en [`bench/leave.test.mjs`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave.test.mjs); el registro separado de controles y tratamientos con agentes frescos está en [`bench/leave-behavior/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave-behavior/README.md). Un regex demuestra que la guarda está escrita; solo el tratamiento en sesión fresca comprueba que una Pista conocida quede dormida después de salir.

Este patch cambia un modo de `transmute-lore`, su documentación bilingüe, metadatos de release y tests; las ocho skills y el contrato público permanecen intactos. Deliberadamente no agrega un ejecutable OBSIDIAN, un score UPGRADE/MYCELIUM, una taxonomía más estricta para BRAINSTORMING ni una hipótesis científica nueva: esas afirmaciones carecían de evidencia conductual o ya estaban cubiertas por las skills vigentes. El Lore existente no requiere migración; la nueva frontera se aplica solo cuando corre `LEAVE`.

Notas completas: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.3
