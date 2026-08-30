# Lore Plugin 2.4.2

## English

**2.4.1 published a promise it did not keep. This keeps it.**

Its release note said: *“If Lore files were edited and no `MYCELIUM` ran since, it blocks the stop
once.”* That sentence was false in two independent directions, and neither was covered by its bench.

- **The guard only saw writes made with the editing tools.** Anything written with `sed`, a heredoc or
  a script left it blind — and that is the default working mode of Claude Code, whose own session
  prompt instructs *“make file changes with sed, heredocs, or short scripts, rather than using the
  dedicated Read, Edit, or Write tools”*. The guarantee was blind exactly where the host pushes you to
  work. **The class is wider than this hook: any guarantee that reads a transcript looking for tool
  names inherits the same hole.**
- **Naming the mode counted as having run it.** The evidence that the sweep had happened was a regular
  expression over the assistant's prose, which could not tell *“I ran it”* from *“I have not run it
  yet”*. And this one was **specified, not overlooked**: a green test asserted that not blocking after
  such a sentence was correct. Stated plainly, the guard trusted the agent's report.

### What changed

**Detection is now by content hash of the tree's Lore files**, compared against a receipt
(`.lore-mycelium`) written by the new `lore-plugin mycelium receipt`. How a file was written stops
being a variable, and the agent is never asked whether the sweep ran — so what it says stops
mattering. **The second defect is dissolved rather than patched.**

`git` was considered and discarded: it is not a requirement of this kit, Lore trees without it exist,
and a guard depending on it would do nothing on such a tree **and would do nothing silently** — which
is the failure mode being fixed. Content hashing needs only the filesystem, the one floor both hosts
and every user share.

**The block now routes instead of only detecting.** Criteria written by hand is what `save-to-lore` —
or the matching write mode of `transmute-lore` — exists to replace, and the message says so before it
says how to close the bracket.

**`MYCELIUM` gains the question it did not have**, as `lore-plugin mycelium bodies`: *does the body
holding these clues load at all?* The mode asks, clue by clue, what step forces it to run; it never
asked whether the `lore/` itself is ever opened. A body with no loader produces **no disconnected clue
at all**, so a whole module set can sit inert while every clue looks fine. It reports data and decides
nothing: a body the contract does not name is either connected or **declared out of the universe in
writing**, and which one applies is not something a directory walk knows.

`npm test`: **158 → 179**. Evidence, including the four RED scenarios and the two false positives found
and repaired mid-phase, in
[`bench/mycelium-2.4.2/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/mycelium-2.4.2/README.md).

### What it still does not cover, said here rather than discovered later

Codex does not run hooks: there the guarantee is carried by the skills' own text. And neither the hook
nor the skills see Lore written **without invoking any skill in a tree the working directory does not
reach**.

No corpus change and no migration. Existing Lore is unaffected; installed copies still require their
normal manual synchronization to pick up the hook, the CLI and the reworded mode. On first run the
receipt is written and nothing is blocked, so adopting this version on an existing tree is silent.

`RELEASE_2.4.1` is not rewritten — the historical record stands, and the correction travels as a new
version.

---

## Español

**La 2.4.1 publicó una promesa que no cumplía. Esta la cumple.**

Su nota de versión decía: *«Si se editaron archivos de Lore y no corrió `MYCELIUM` desde entonces,
bloquea el cierre una vez»*. Esa frase era falsa en dos direcciones independientes, y su banco no
cubría ninguna.

- **El guard solo veía las escrituras hechas con las herramientas de edición.** Lo escrito con `sed`,
  un heredoc o un script lo dejaba ciego — y ese es el modo de trabajo por defecto de Claude Code,
  cuyo prompt de sesión instruye *«make file changes with sed, heredocs, or short scripts, rather than
  using the dedicated Read, Edit, or Write tools»*. La garantía era ciega exactamente donde el entorno
  empuja a trabajar. **La clase es más ancha que este hook: toda garantía que lea un transcript
  buscando nombres de herramientas hereda el mismo agujero.**
- **Nombrar el modo contaba como haberlo corrido.** La evidencia de que el barrido había ocurrido era
  una expresión regular sobre la prosa del asistente, incapaz de distinguir *«lo corrí»* de *«todavía
  no lo corrí»*. Y este defecto estaba **especificado, no olvidado**: un test en verde afirmaba que no
  bloquear después de esa frase era lo correcto. Dicho sin adornos, el guard confiaba en el reporte del
  agente.

### Qué cambió

**La detección ahora es por hash de contenido de los archivos de Lore del árbol**, contrastado contra
un recibo (`.lore-mycelium`) que escribe el subcomando nuevo `lore-plugin mycelium receipt`. Cómo se
escribió un archivo deja de ser una variable, y al agente no se le pregunta si corrió el barrido — así
que deja de importar qué diga. **El segundo defecto se disuelve en vez de parchearse.**

`git` se consideró y se descartó: no es requisito de este kit, existen árboles de Lore sin él, y un
guard que dependiera de él no haría nada en un árbol así **y no haría nada en silencio** — que es el
modo de falla que se viene a cerrar. El hash de contenido solo necesita el sistema de archivos, que es
el único piso que comparten los dos hosts y todos los usuarios.

**El bloqueo ahora enruta, no solo detecta.** Escribir criterio a mano es lo que `save-to-lore` —o el
modo de escritura de `transmute-lore` que corresponda— existe para reemplazar, y el mensaje lo dice
antes de decir cómo se cierra el bracket.

**`MYCELIUM` gana la pregunta que no tenía**, como `lore-plugin mycelium bodies`: *¿el cuerpo que
contiene estas Pistas se carga?* El modo pregunta, Pista por Pista, qué paso obliga a correrla; nunca
preguntó si el `lore/` llega a abrirse. Un cuerpo sin loader **no produce ninguna Pista desconectada**,
así que un conjunto entero de módulos puede quedar inerte mientras cada Pista se ve bien. Reporta datos
y no decide nada: un cuerpo que el contrato no nombra o se conecta, o se **declara fuera del universo
por escrito**, y cuál corresponde no lo sabe un recorrido de archivos.

`npm test`: **158 → 179**. La evidencia, incluidos los cuatro escenarios RED y los dos falsos positivos
encontrados y reparados a mitad de fase, en
[`bench/mycelium-2.4.2/README.md`](https://github.com/andresanemic/lore-plugin/blob/main/bench/mycelium-2.4.2/README.md).

### Lo que sigue sin cubrir, dicho acá y no descubierto después

Codex no ejecuta hooks: ahí la garantía la carga el texto de las skills. Y ni el hook ni las skills ven
Lore escrito **sin invocar ninguna skill en un árbol que el directorio de trabajo no alcanza**.

Sin cambio de corpus y sin migración. El Lore existente no se ve afectado; las copias instaladas
conservan su sincronización manual habitual para tomar el hook, el CLI y el modo reescrito. En la
primera corrida se escribe el recibo y no se bloquea nada, así que adoptar esta versión sobre un árbol
existente es silencioso.

`RELEASE_2.4.1` no se reescribe — el registro histórico se conserva, y la corrección viaja como versión
nueva.
