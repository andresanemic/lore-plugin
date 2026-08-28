# Lore Plugin 2.3.3 — Observable boundaries

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

Nemotron 3 Ultra audited the kit end to end and found contracts that could claim more than an agent could actually observe. Its own proposed fixes didn't hold up either — the implementation was discarded and rebuilt from scratch, this time checked with GPT-5.6 Sol medium and Claude Code Sonnet 5, and every claim below is tied to a test or a real fresh-agent scenario rather than to how convincing the prose reads.

`LEAVE` changed the most. It used to erase the always-on block and call the exit done, while prose outside that block, secondary contracts, `FASES.md` pointers and project hooks kept loading Lore anyway. It now inventories every one of those junctions before touching anything, stops in front of a shared symlink or contract instead of guessing past it, and writes a recoverable `leave:partial` marker that survives an interrupted pass — `use-lore` resumes from that checklist, and UPGRADE re-checks the recorded surfaces before offering a later re-entry. It is still an agent-run recipe, not a deterministic script: five fresh agents given the old contract left junctions alive under a five-minute deadline; four given 2.3.3 closed all of them. That comparison is recorded in full at [`bench/leave-agent-scenarios/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave-agent-scenarios/README.md).

Three smaller claims needed the same kind of correction, not a rewrite. `brainstorming-lore`'s implicit trigger used to fire on identity and principles alone; under pressure, five out of five fresh agents wrongly opened a brainstorm that no routed process module actually governed, and five out of five correctly declined once the predicate required a real production module — with two further checks confirming the fix doesn't block a genuine case ([`bench/writing-skills-2.3.3/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/writing-skills-2.3.3/README.md)). UPGRADE's relevance gate had no answer for missing release notes: two out of three fresh agents guessed an affected-or-not verdict rather than admit the gap, so 2.3.3 makes the gap itself the answer — report it, offer one optional review, never block the work. And CRYSTALLIZE now does what its "no secrets" promise always implied instead of only implying it: it omits sensitive filenames and aborts before composing a snapshot when routed text carries a private key, a provider token or a credential assignment, with real pack, extract and secret-rejection tests running under `npm test`.

Federated bots got a wording fix, not a behavior fix. "Criteria already loaded" became "reachable and routed, loaded on demand," because that phrase was always describing what the kit does — fresh-agent testing found no scenario where the old wording actually caused an agent to under-load or over-load a federated body, so this correction is honest about being a documentation fix, not a bug closed.

Nothing here is claimed past what was checked. `obsidian-lore` still has no executable sweep; it stays an agent-run workflow, tested statically. MYCELIUM still only reports a rate, never a score. SAVE's exit trigger and its handoff to a single `bots` area were already true in 2.3.2 and aren't claimed as new here. No LUS hypothesis is created or promoted by any of this. And the behavioral verification procedure was specified but not executed end to end — that debt is written down rather than smoothed over.

Existing Lore needs no migration.

Full notes: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.3

---

<a id="español"></a>

# Lore Plugin 2.3.3 — Fronteras observables

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

Nemotron 3 Ultra auditó el kit de punta a punta y encontró contratos que podían prometer más de lo que un agente podía observar de verdad. Su propia propuesta de arreglo tampoco se sostuvo — la implementación se descartó y se reconstruyó desde cero, esta vez verificada con GPT-5.6 Sol medium y Claude Code Sonnet 5, y cada afirmación de abajo está atada a un test o a un escenario real con agentes frescos, no a lo convincente que suene la prosa.

`LEAVE` es lo que más cambió. Antes borraba el bloque always-on y daba la salida por terminada, mientras la prosa fuera de ese bloque, los contratos secundarios, los punteros de `FASES.md` y los hooks del proyecto seguían cargando Lore igual. Ahora inventaría cada una de esas junctions antes de tocar nada, se detiene ante un symlink o contrato compartido en vez de pasarlo de largo, y escribe un marcador `leave:partial` recuperable que sobrevive a una pasada interrumpida — `use-lore` reanuda desde ese checklist, y UPGRADE vuelve a comprobar las superficies registradas antes de ofrecer una reentrada posterior. Sigue siendo una receta que ejecuta un agente, no un script determinista: cinco agentes frescos con el contrato viejo dejaron junctions vivas bajo un plazo de cinco minutos; cuatro con 2.3.3 las cerraron todas. Esa comparación completa está en [`bench/leave-agent-scenarios/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/leave-agent-scenarios/README.md).

Tres afirmaciones más chicas necesitaban el mismo tipo de corrección, no una reescritura. El disparo implícito de `brainstorming-lore` antes se activaba solo con identidad y principios; bajo presión, cinco de cinco agentes frescos entraron indebidamente a un brainstorm que ningún módulo de proceso ruteado gobernaba de verdad, y cinco de cinco rechazaron correctamente una vez que el predicado exigió un módulo de producción real — con dos chequeos más que confirman que el arreglo no bloquea un caso genuino ([`bench/writing-skills-2.3.3/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/writing-skills-2.3.3/README.md)). El filtro de relevancia de UPGRADE no tenía respuesta para cuando faltan notas de release: dos de tres agentes frescos adivinaban un veredicto de afectado-o-no en vez de admitir el hueco, así que 2.3.3 convierte el hueco mismo en la respuesta — declararlo, ofrecer una revisión manual opcional, nunca bloquear el trabajo. Y CRYSTALLIZE ahora hace lo que su promesa de "sin secretos" siempre daba a entender, en vez de solo darlo a entender: omite nombres de archivo sensibles y aborta antes de componer una fotografía cuando el texto enrutado trae una clave privada, un token de proveedor o una asignación de credencial, con tests reales de pack, extract y rechazo de secretos corriendo bajo `npm test`.

Los bots federados recibieron una corrección de redacción, no de comportamiento. "Criterio ya cargado" pasó a ser "alcanzable y ruteado, cargado bajo demanda", porque esa frase siempre describió lo que el kit hace — las pruebas con agentes frescos no encontraron ningún escenario donde la redacción vieja causara de verdad que un agente sub-cargara o sobre-cargara un cuerpo federado, así que esta corrección es honesta sobre ser un arreglo de documentación, no un bug cerrado.

Nada acá se afirma más allá de lo que se comprobó. `obsidian-lore` sigue sin un barrido ejecutable; sigue siendo un flujo que corre el agente, probado estáticamente. MYCELIUM sigue reportando solo una tasa, nunca un score. El disparo de salida de SAVE y su handoff hacia una sola Área `bots` ya eran ciertos en 2.3.2 y no se reclaman como nuevos acá. Ninguna hipótesis de LUS se crea ni se promueve por nada de esto. Y el procedimiento de verificación conductual quedó especificado, pero no fue ejecutado de extremo a extremo — esa deuda queda escrita, no disimulada.

El Lore existente no necesita migración.

Notas completas: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.3
