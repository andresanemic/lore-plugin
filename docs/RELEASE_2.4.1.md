# Lore Plugin 2.4.1 — The exit scan is no longer something you ask for

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

`MYCELIUM` was always meant to run at both ends of a pass that writes Lore — an entry scan before it leans on existing criteria, an exit scan over what it just wrote. In practice the exit scan depended on a single sentence buried mid-skill and on the model choosing to invoke a second skill with nothing enforcing it. Observed with Codex: `save-to-lore` wrote a module, deferred the junction "to a future pass", and the user had to type "run mycelium" every time.

2.4.1 makes the bracket not-skippable, without new machinery:

- **`save-to-lore`** opens with the bracket stated in its contract — two todos, entry and exit — and its *Closing either mode* section is reframed as a "done means the exit scan ran" gate. A finding parked for a later pass leaves the save **not done**.
- **`transmute-lore`** carries one invariant for every writing mode. `ADD`, `CLEAN`, `TRANSLATE`, `UPGRADE` and `LEAVE` each gained the entry and exit anchors, modelled on `PRUNE`, which already had both. `LEAVE`'s static verification is named as its exit scan — the one mode whose exit confirms disconnection rather than looking for junctions to make.
- **`use-lore`** already named all three MYCELIUM triggers; its wording is aligned to the same gate — when the writing happened inside `save-to-lore` or a `transmute-lore` writing mode, the exit scan is their closing gate, not a courtesy.
- **A `Stop` hook** (`hooks/hooks.json`) ships for Claude Code — the plugin's first. If Lore files were edited and no `MYCELIUM` ran since, it blocks the stop once and says to close the bracket. It fails open on any error and does not loop. Codex ignores it, which is why the wording had to carry the guarantee on its own; the fresh-agent scenario in [`bench/exit-mycelium-2.4.1/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/exit-mycelium-2.4.1/README.md) is run on both hosts.

Writing-skills evidence for the changed skills: [`bench/writing-skills-2.4.1/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/writing-skills-2.4.1/README.md).

No corpus change and no migration. Existing Lore is unaffected; installed copies still require their normal manual synchronization to pick up the hook and the reworded skills.

Full notes: https://github.com/andresanemic/lore-plugin/releases/tag/v2.4.1

---

<a id="español"></a>

# Lore Plugin 2.4.1 — El barrido de salida ya no es algo que pides

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

`MYCELIUM` siempre fue pensado para correr en las dos puntas de una pasada que escribe Lore — un barrido de entrada antes de apoyarse en criterio existente, un barrido de salida sobre lo que se acaba de escribir. En la práctica el de salida dependía de una sola frase enterrada a mitad de la skill y de que el modelo decidiera invocar una segunda skill sin nada que lo obligara. Observado con Codex: `save-to-lore` escribió un módulo, difirió la junta "a una pasada futura", y el usuario tenía que tipear "corre mycelium" cada vez.

2.4.1 vuelve el bracket no-salteable, sin mecanismo nuevo:

- **`save-to-lore`** abre con el bracket declarado en su contrato — dos todos, entrada y salida — y su sección *Closing either mode* pasa a ser un gate "terminado significa que el barrido de salida corrió". Un hallazgo aparcado para después deja el guardado **sin terminar**.
- **`transmute-lore`** lleva un invariante para todo modo que escribe. `ADD`, `CLEAN`, `TRANSLATE`, `UPGRADE` y `LEAVE` ganaron las anclas de entrada y salida, modeladas en `PRUNE`, que ya tenía las dos. La verificación estática de `LEAVE` queda nombrada como su barrido de salida — el único modo cuyo cierre confirma la desconexión en vez de buscar juntas que hacer.
- **`use-lore`** ya nombraba los tres disparadores de MYCELIUM; se alinea su tono al mismo gate — cuando la escritura ocurrió dentro de `save-to-lore` o un modo de escritura de `transmute-lore`, el barrido de salida es su gate de cierre, no una cortesía.
- **Un hook `Stop`** (`hooks/hooks.json`) para Claude Code — el primero del plugin. Si se editaron archivos de Lore y no corrió `MYCELIUM` desde entonces, bloquea el cierre una vez y pide cerrar el bracket. Falla abierto ante cualquier error y no entra en bucle. Codex lo ignora, por eso la redacción tuvo que cargar la garantía sola; el escenario de agente fresco en [`bench/exit-mycelium-2.4.1/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/exit-mycelium-2.4.1/README.md) se corre en los dos hosts.

Evidencia writing-skills de las skills cambiadas: [`bench/writing-skills-2.4.1/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/writing-skills-2.4.1/README.md).

Sin cambio de corpus y sin migración. El Lore existente no se ve afectado; las copias instaladas conservan su sincronización manual habitual para tomar el hook y las skills reescritas.

Notas completas: https://github.com/andresanemic/lore-plugin/releases/tag/v2.4.1
