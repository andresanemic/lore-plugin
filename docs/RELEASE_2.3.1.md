# Lore Plugin 2.3.1 — Asking where a fact comes from

> [README](https://github.com/andresanemic/lore-plugin#readme) — [Español](#español)

The key of this release is one question added to `save-to-lore`: **before distilling a fact from what is at hand, ask whether an authoritative source exists — and take the fact from there.** The release carries its own founding case: Fresno's brand palette entered the Lore sampled from published social pieces (`#41D449`) while the brand manual said `#00D856`. Four appearances, all consistent with each other, all wrong — and the provenance note (*"sampled from the original files"*) raised confidence in the bad datum instead of inviting doubt. A corpus distilled from outputs while the source exists is internally coherent and externally false; the correction cost scales with every artifact that ever cited the fact.

Three companions ride along. The third trigger of `save-to-lore` — an **approved artifact**, captured together with the trace of what was discarded — leaves the skill and reaches the documentation, paying a debt its commit left declared on purpose. And `use-lore` now states what every session owes its tree before continuing: resolve what Lore governs it, resumed-from-a-summary included, and say which bodies it loaded — because this release's own making tripped over exactly that failure. *"Finishing what was started" is not an exemption: continuing is deciding.* And `obsidian-lore` now **archives what it closes**: notes whose file-level `destilado:` came out of a sweep non-empty move to `<inbox>/archivadas/`, so the live inbox keeps only what is pending — living notebooks stay put, references get flagged before anything moves, and the mark travels with the file so idempotency and the debt count hold. The old rule that a mined note never moved kept traceability but pushed inbox hygiene to unmanaged manual moves; this replaces it with one governed move, still without ever deleting.

This patch changes no contracts and keeps eight skills; one new consistency test guards the question so it cannot rot the way unchecked guards rot. The scientific boundary is declared, not hidden: LUS v1.22 registers the founding case as an appearance with a twist of its own on H11 — declared provenance *raised* confidence in the mis-sampled datum — and opens H17 elsewhere in the same week. Next is the general benchmark of 2.3 over the whole ecosystem, preregistered in `bench/`; whatever it surfaces lands after it runs, and the numbers this README cites will be derived from that run's CSV, not before.

**If you have Lore written with an earlier version**, update the plugin first — the cache is keyed by version, so a publish without a bump is never received. Nothing else is asked of your trees: the question runs at capture time, inside the skill you already invoke.

Full notes: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.1

---

<a id="español"></a>

# Lore Plugin 2.3.1 — preguntar de dónde viene un hecho

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

La clave de este release es una pregunta agregada a `save-to-lore`: **antes de destilar un hecho desde lo que hay a la mano, preguntar si existe una fuente autoritativa — y tomar el hecho de ahí.** El release trae su propio caso fundante: la paleta de Fresno entró al Lore muestreada de piezas publicadas (`#41D449`) mientras el manual de marca declaraba `#00D856`. Cuatro apariciones, consistentes entre sí, todas equivocadas — y la nota de procedencia (*«muestreada de los archivos originales»*) aumentó la confianza en el dato malo en vez de invitar a dudar de él. Un corpus destilado desde salidas mientras la fuente existe queda internamente coherente y externamente falso; el costo de corregir crece con cada artefacto que citó el hecho.

Tres acompañantes viajan con ella. El tercer disparador de `save-to-lore` — un **artefacto aprobado**, capturado junto con la traza de lo descartado — sale de la skill y llega a la documentación, pagando una deuda que su commit dejó declarada a propósito. Y `use-lore` declara ahora lo que toda sesión le debe a su árbol antes de continuar: resolver qué Lore lo gobierna, reanudación desde resumen incluida, y decir qué cuerpos cargó — porque la propia confección de este release tropezó exactamente con ese fallo. *«Terminar lo que se empezó» no es exención: continuar es decidir.* Y `obsidian-lore` ahora **archiva lo que cierra**: las notas cuyo `destilado:` a nivel archivo salió no vacío del barrido se mueven a `<bandeja>/archivadas/`, así que la bandeja viva conserva solo lo pendiente — los cuadernos abiertos se quedan donde están, las referencias se marcan antes de mover nada, y la marca viaja con el archivo para que la idempotencia y el conteo de deuda se mantengan. La ley vieja de que una nota minada nunca se movía daba trazabilidad pero empujaba la higiene de bandeja a mudanzas manuales sin regla; esta la reemplaza por una única mudanza gobernada, siempre sin borrar.

Este patch no cambia contratos y mantiene ocho skills; un test nuevo de consistencia cuida la pregunta para que no se pudra como se pudren las guardas sin test. La frontera científica está declarada, no escondida: LUS v1.22 registra el caso fundante como aparición con giro propio en H11 — la procedencia declarada *aumentó* la confianza en el dato mal muestreado — y abre H17 en la misma semana. Sigue el benchmark general de 2.3 sobre todo el ecosistema, preregistrado en `bench/`; lo que arroje entra después de correrse, y las cifras que este README cite se derivan del CSV de esa corrida, no antes.

**Si tienes Lore escrito con una versión anterior**, actualiza primero el plugin — la caché se indexa por versión, así que una publicación sin bump nunca llega. Nada más se le pide a tus árboles: la pregunta corre al capturar, dentro de la skill que ya invocas.

Notas completas: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.1
