# Lore Plugin 2.4.9 — Vespi runs long operations, and MYCELIUM says what it did not check

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

Lore Plugin 2.4.9 makes Vespi, the kernel that runs under the kit, usable for long, complex work. An operation now keeps its state as a single block in your project's `FASES.md` instead of a second file, and the work can be split into tasks with a role: one reads the sources, one advises, one does a scoped piece. Each task moves from received to reviewed, verified and integrated as separate facts, whoever verifies is never whoever executed, and if the host lacks the tool a role needs, the task comes back blocked with its next step instead of being faked. The coordinator follows a written method that depends on no installed skill, and `lore-plugin operation` drives a whole operation from the command line. Vespi kernel 0.1.3, which this version carries as a fixed copy, is published on its own repository.

MYCELIUM now says plainly when a structural scan does not close the review, and its receipt no longer implies that the full sweep ran. The guard for writes into another tree no longer decides alone: your host's permission system asks, allows or denies, and the plugin only notes it. The Codex installer now copies the whole package, so a new version no longer leaves the previous version's documentation behind, and the three phrases that route everyday requests live once, in `use-lore`, which the coordinator reads.

No public function was removed. Lore Plugin 2.4.9 was tested on Claude Code, Codex, and OpenCode. Existing Lore needs no migration; an operation saved by an earlier build in its own `operations/<id>/estado.md` file is not read by the new state block and needs its goal restated in `FASES.md`.

# Lore Plugin 2.4.9 — Vespi sostiene operaciones largas, y MYCELIUM dice qué no revisó

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

Lore Plugin 2.4.9 hace que Vespi, el kernel que corre bajo el kit, sirva para trabajo largo y complejo. Una operación ahora guarda su estado como un único bloque del `FASES.md` de tu proyecto en lugar de un segundo archivo, y el trabajo se puede repartir en tareas con un rol: una lee las fuentes, otra asesora, otra hace una pieza acotada. Cada tarea pasa de recibida a revisada, verificada e integrada como hechos distintos, quien verifica nunca es quien ejecutó, y si el host no tiene la herramienta que un rol necesita, la tarea vuelve bloqueada con su siguiente paso en lugar de simularse. El coordinador sigue un método escrito que no depende de ninguna skill instalada, y `lore-plugin operation` lleva una operación completa desde la línea de comandos. El kernel Vespi 0.1.3, que esta versión trae como copia fija, está publicado en su propio repositorio.

MYCELIUM ahora dice con claridad cuándo un escaneo estructural no cierra la revisión, y su recibo ya no sugiere que el barrido completo se corrió. La guardia de escrituras en otro árbol ya no decide sola: el sistema de permisos de tu host pregunta, permite o niega, y el plugin solo lo anota. El instalador de Codex ahora copia el paquete entero, de modo que una versión nueva ya no deja la documentación de la anterior, y las tres frases que enrutan los pedidos cotidianos viven una sola vez, en `use-lore`, que el coordinador lee.

No se eliminó ninguna función pública. Lore Plugin 2.4.9 fue probado en Claude Code, Codex y OpenCode. El Lore existente no necesita migración; una operación guardada por una compilación anterior en su propio archivo `operations/<id>/estado.md` no la lee el nuevo bloque de estado y necesita que se vuelva a escribir su objetivo en `FASES.md`.
