# Lore Plugin 2.4.4 — The generator stops rewriting what did not change

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

The `create-bot` template generated `lore/enrutamiento.md` with the current minute on every run, then wrote the file unconditionally. Two runs over the same manifest therefore produced different bytes even when routing had not changed. That noise was enough to invalidate MYCELIUM's content receipt and block a session for criterion that nobody had edited; the guard was reporting the tree accurately, but the generator had manufactured the change.

The generator is now idempotent at that boundary: it compares the previous and candidate routing tables without the generated timestamp line, preserves the existing file byte for byte when the effective content is equal, and still rewrites it — with a fresh timestamp — when the manifest changes the table. The regression test runs the real template in a temporary bot, proves an unchanged manifest preserves both content and modification time, then changes the manifest and proves the table is regenerated. `npm test`: 183/183.

This is a behavior patch inside `create-bot`; all seven skills remain intact. Existing bots keep their copied `scripts/sync.js` until that template copy is explicitly refreshed, so this release does not silently rewrite them. No corpus change, no Lore schema migration, and no scientific claim.

# Lore Plugin 2.4.4 — El generador deja de reescribir lo que no cambió

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

La plantilla de `create-bot` generaba `lore/enrutamiento.md` con el minuto actual en cada corrida y después escribía el archivo sin condición. Dos ejecuciones sobre el mismo manifiesto producían por eso bytes distintos aunque el enrutamiento no hubiera cambiado. Ese ruido bastaba para invalidar el recibo de contenido de MYCELIUM y bloquear una sesión por criterio que nadie había editado; la guardia estaba informando correctamente el estado del árbol, pero el generador había fabricado el cambio.

El generador ahora es idempotente en esa frontera: compara la tabla anterior y la candidata sin la línea de timestamp generada, conserva el archivo existente byte por byte cuando el contenido efectivo coincide y todavía lo reescribe —con una fecha nueva— cuando el manifiesto cambia la tabla. El test de regresión ejecuta la plantilla real en un bot temporal, demuestra que un manifiesto sin cambios conserva contenido y fecha de modificación, luego cambia el manifiesto y demuestra que la tabla se regenera. `npm test`: 183/183.

Este es un patch de comportamiento dentro de `create-bot`; las siete skills permanecen intactas. Los bots existentes conservan su copia de `scripts/sync.js` hasta que se actualice explícitamente esa copia de la plantilla, así que esta versión no los reescribe en silencio. Sin cambio de corpus, sin migración del esquema de Lore y sin afirmación científica.
