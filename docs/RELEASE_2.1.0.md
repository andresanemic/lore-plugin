# Lore Plugin 2.1.0 — The garden: always on, pruned, and bordered

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

Lore turns project experience into reusable criteria for AI agents. Version **2.1.0** adds three
capabilities to the 2.0 foundation and changes nothing about how the kit is installed or used.

## What 2.1.0 adds

**Pruning — `transmute-lore` gains a sixth mode, `PRUNE`.** Until now every mode in this kit could
only add. A Lore in daily use rarely decays by going stale; it decays by **accumulating correct
things** until their sum no longer fits the deliverable it has to produce. `PRUNE` is the only mode
that asks *does any of this need to be here?* It counts **apparatus against content** in the last
deliverables shipped, and sorts findings into four kinds:

| Kind | Meaning | Result |
|---|---|---|
| **Deadwood** | Constrains no future decision. | Comes out — after its residue is written. |
| **Crowding** | Correct, earned, irrefutable — and saturating **in sum**. | Stays, and receives a boundary, a destination or a ceiling. |
| **Rooted** | Load-bearing, with a real scar behind it. | Untouched. |
| **Unhealed** | Declared applied, and only partly applied. | Finished, or unmarked. |

`Crowding` is the one that does the work, and it names a defect the existing
`Missing`/`Superseded`/`Earned` triad had no slot for: **correct laws whose sum saturates the
surface of the deliverable**. It is found by counting, not by reading — every law reads fine on its
own. Two invariants keep the mode safe: a finding list with **no `Rooted` entries is a pass running
as a chainsaw** (the mirror of UPGRADE's `Earned` rule), and **nothing comes out without residue** —
each removal is a dated line in `FASES.md` saying what it used to be for. Pruning without residue is
not distillation, it is amnesia. Fewer clues is reported as the **result**, not apologized for as a
loss.

**The other pass gets its name: `save-to-lore` ARBITRATE is now `TRANSPLANT`.** What grew well in
another soil does not necessarily take in this one, and a transplant nobody watches is a dead plant
with good intentions. The mode is unchanged — imported criteria is still judged against this Entre's
purpose, only what survives enters, and the module still has to say **where the source loses**. What
the name adds is the pair: **pruning removes what the plant grew on its own; transplanting judges
what came from outside.** Those are the two passes of a maintained Lore, and having one without the
other is why a body of criteria either bloats or ossifies.

**Two names changed, one did not.** `prune-lore` as a skill name was considered and rejected: it
would name five sixths of `transmute-lore` after one sixth. What did carry a foreign register was
**`HARD-GATE`**, now the **threshold** (*umbral*) — same rule, same force, no exception softened.
*A threshold is never crossed alone: the machine proposes with content in view, the human approves,
and only then is anything written.* Trigger phrases carry the garden vocabulary where a human
actually touches it: *"prune the lore of X"*, *"poda en lore"*.

**The always-on block.** The pointer to a project's criteria now lives inside the instruction
contract between two literal markers, `<!-- lore:always-on -->` and `<!-- /lore:always-on -->`. The
six skills that write contracts stamp it inside the threshold they already had — no new gate, no
operation to remember. It is idempotent: N runs leave exactly one block and an empty diff. It has a
hard ceiling of **25 lines** and three variants — area, project, bot — and it holds pointers only,
never criteria. `transmute-lore` in UPGRADE mode stamps it into contracts that already exist, so the
installed ecosystem receives it and not only projects created after it.

**The pointer constitution.** [`assets/constitucion-puntero.md`](../assets/constitucion-puntero.md)
is a border document for repositories that also use [GitHub's spec-kit](https://github.com/github/spec-kit).
Two kits of criteria on disjoint channels **do not fail — they omit**: nothing breaks, nothing warns,
and the cycle runs without ever consulting the criteria. The template revokes spec-kit's default
*«Constitution supersedes all other practices»* clause **in writing**, declares an explicit order of
precedence, states **who may write** — commits, pushes, tags and releases are never taken on the
cycle's own initiative — and says **at which levels spec-kit belongs at all**: an area no, a project
the whole cycle, a bot only `specify → plan → tasks`. Guides in
[English](./SPEC_KIT_en.md) and [Spanish](./SPEC_KIT_es.md).

**Lore does not depend on spec-kit and never will.** Uninstalling it breaks nothing here.

## What is measured, and what is not

This is the part worth reading before you trust either capability.

- **Verified.** Idempotent stamping, the 25-line ceiling and marker recognition are covered by five
  regression tests in [`scripts/always-on-block.test.mjs`](../scripts/always-on-block.test.mjs).
- **Not measured.** The spec for this release set a success criterion — *does the block's presence
  actually make the agent invoke the skill instead of writing criteria by hand?* — and gated the
  capability on it. **It was never run, and it is not runnable with the current instrument:** the
  benchmark mounts a fixture with a contract and a `lore/` folder but **no installed skills**, so
  there is nothing the block could cause to be invoked. The criterion has been reclassified as a
  requirement for the measurement instrument still being built, and the capability ships **on design
  derivation, not on evidence**. Saying so is the point.
- **Derived from one case, not measured.** Every check in `PRUNE` comes from a documented failure in
  a single real Lore — an area whose output had degraded while nothing in it was wrong — and **not one
  of them comes from a preference**. That is its strength and its whole limit: `n=1`, one operator,
  one corpus. The mode has **never been run end to end**, and the density claim (*fewer clues, better
  deliverable*) is a **conjecture** until a pruned Lore produces work its owner accepts. Whether a
  prune improves output, or merely feels tidier, is exactly what this release cannot tell you.
- **Exercised since the spec was written.** The border with spec-kit was first verified on a **bot** —
  a repository whose product is records, not code — against `specify-cli 0.16.5.dev0` (commit
  `bf88c9f`), and the spec declared the code case unexercised. It has since been applied to a
  repository **with code**: this kit's own. The levels table remains reasoning for the project row and
  a design decision for the area row.
- **Measured head to head, and the result is not what the counters said.** Before publishing, `v1.2.1`
  and this version ran the same task on the same corpus, in separate agent sessions, and the corpus
  owner judged four pairs of the resulting work **blind**. This version won 3 to 1, on reasons that
  named no capability of the kit. The older version had won **every mechanical measure**: more
  validity boundaries (23 against 20) and far more confidence markers (+22 against +1). Counting the
  artifacts of criteria counts **acts of writing**, which happen on the day of the run; what those
  artifacts are worth arrives months later, the first time someone reads the clue. This run is the
  counter-example that settles it — **the count is a completeness check, never a quality one**, and
  the invariant in `use-lore` now says so. Measured on corpus commit `d3c9448`, kit at `2eced3c`,
  with **seven confounders declared** alongside the result, among them a power cut mid-run and pairs
  assembled by the same person who ran the test. `n=1`, one judge, one session.

## Also in this release

- **Case 09** enters the case studies: the two capabilities above were generalized from a single case
  and then laid back over it before publishing, which produced **five defects, none of them visible by
  reading the files** — two found by the form in the case, three by the case in the form.
- `transmute-lore` UPGRADE reads the installed version from the **host's installation registry**
  rather than a manifest found in the working tree, writes `Earned` exemptions into `FASES.md` instead
  of the artifact they defend, and arbitrates `index.md` against its row format. And the registry is
  **not the last word**: a session resolves its plugin version when it opens, so one opened before an
  install keeps running the previous copy while the registry, correct on disk, says nothing.
- **UPGRADE gains a fourth finding kind: `Stale`** — an artifact that matches the kit and no longer
  matches **the project**, because the practice changed and nobody amended the text. The mode was
  written to arbitrate a Lore against a newer *kit*; this is the same failure one level over, against
  the project itself. It is the one no reading finds: a module went on describing a step its team had
  already stopped taking, six deliveries in a row, and nothing flagged it because the stale flow read
  perfectly coherent on its own. **Coherence is not a detector**, so `Stale` is detected against the
  repository — recent commits and actual deliverables — and never by re-reading.
- **`save-to-lore` gains an asymmetry it was missing:** falsification is not induction. A clue that
  *denies* something is `confirmed` by a single counter-example, because one is all it takes to break
  a claim of «always»; the positive form of the same sentence needs accumulation. And `confirmed` no
  longer requires *"the running app"*, which does not exist in a corpus whose product is criteria.
- **The kit stops speaking in mode names.** *"Lore speaks the user's language"* used to cover what
  gets written to disk; it now covers what the kit says out loud. A suggestion names the **operation
  as a verb in your language** — *"now we can prune this"*, *"that guide is worth transplanting"* —
  instead of *"let's run a PRUNE"*. Skill names are unchanged, because they are what gets invoked, and
  mode names are unchanged in the documentation, where a reader needs the exact token. The reason is
  the threshold: it only works if you can agree or refuse **with the content in view**, and an
  identifier you have to translate first is one more thing standing between you and that decision.
- **And you calibrate how technical it gets.** A `registro:` line in `identidad.md` takes three
  positions — `tecnico` keeps the specification and drops the scene, `llano` grows the scene and
  explains a term the first time it appears, `equilibrado` (the default) is half and half. **It never
  moves the rules:** a threshold is still a threshold and a `MUST` is still a `MUST`, because a
  calibrator that could switch off a gate would be a way of skipping the kit by asking it nicely. And
  it is **never asked as a question** — the kit infers it from how you write, says which one it picked
  in one line, and offers the correction in the same breath. Spending a brainstorm turn on register
  buys nothing.

  Two external reviews of 2.0.9 independently called the documentation **"dense"**. This release
  answers that without diluting a single gate: the prose carries the rule *and* the ground under it,
  and you decide how much ground you want.
- The README chain from a raw folder now shows the missing link: an existing folder is **adopted by
  registration, by path, without moving it** — `create-area` creates the area clean.

## Verification

**The `npm test` wiring is disabled in this release.** `package.json` ships with an empty `scripts`
block; the `.test.mjs` files and the `bin` entry are untouched, so reconnecting it is one line.

What that replaces, stated plainly rather than dropped: the suite used to run 44 passing with **three
pre-existing failures** in the README consistency tests, unrelated to this release — they freeze
README text instead of deriving figures from the benchmark CSVs. **That defect is still there. What is
gone is the gate that reported it.** Publishing in the red was a declared decision; publishing with no
light is a different one, and this is where it is declared.

The measurement this release actually rests on is the benchmark below, not the suite.

## Install or upgrade

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

After upgrading, run `transmute-lore` in UPGRADE mode over an existing project to receive the block
and have its Lore arbitrated against this version.

---

<a id="español"></a>

# Lore Plugin 2.1.0 — El jardín: siempre activo, podado y con frontera

Lore convierte la experiencia de un proyecto en criterio reutilizable para agentes de IA. La versión
**2.1.0** añade tres capacidades sobre la base 2.0 y no cambia nada de cómo se instala ni se usa.

## Qué añade 2.1.0

**La poda — `transmute-lore` gana un sexto modo, `PRUNE`.** Hasta ahora todos los modos de este kit
solo sabían agregar. Un Lore en uso diario rara vez se degrada por quedar viejo: se degrada
**acumulando cosas correctas** hasta que su suma ya no cabe en el entregable que tiene que producir.
`PRUNE` es el único modo que pregunta *¿hace falta que esto esté acá?* Cuenta **aparato contra
contenido** en los últimos entregables publicados y clasifica los hallazgos en cuatro clases:

| Clase | Qué significa | Resultado |
|---|---|---|
| **Deadwood** | No condiciona ninguna decisión futura. | Sale — después de escribir su residuo. |
| **Crowding** | Correcto, ganado, irrefutable — y saturante **en suma**. | Se queda, y recibe una frontera, un destino o un techo. |
| **Rooted** | Sostiene peso, con una cicatriz real detrás. | Intacto. |
| **Unhealed** | Declarado aplicado, y aplicado a medias. | Se termina, o se desmarca. |

`Crowding` es la clase que hace el trabajo, y nombra un defecto para el que la tríada
`Missing`/`Superseded`/`Earned` no tenía casilla: **leyes correctas cuya suma satura la superficie
del entregable**. Se encuentra contando, no leyendo — cada ley se ve bien por separado. Dos
invariantes lo mantienen seguro: una lista de hallazgos **sin ningún `Rooted` es una pasada corriendo
como motosierra** (espejo de la regla `Earned` de UPGRADE), y **nada sale sin residuo** — cada
remoción es una línea fechada en `FASES.md` diciendo para qué servía. Podar sin residuo no es
destilación, es amnesia. Tener menos Pistas se reporta como **el resultado**, no se pide disculpas
por ello.

**La otra pasada recibe su nombre: el modo ARBITRATE de `save-to-lore` pasa a ser `TRANSPLANT`.** Lo
que crecía bien en otra tierra no necesariamente prende en esta, y un trasplante que nadie mira es
una planta muerta con buena intención. El modo no cambia — el criterio importado se sigue juzgando
contra el propósito de este Entre, solo entra lo que sobrevive, y el módulo sigue teniendo que decir
**dónde pierde la fuente**. Lo que agrega el nombre es el par: **la poda quita lo que la planta
creció sola; el trasplante juzga lo que vino de afuera.** Son las dos pasadas de un Lore mantenido, y
tener una sin la otra es la razón de que un cuerpo de criterio se infle o se osifique.

**Dos nombres cambiaron, uno no.** `prune-lore` como nombre de skill se evaluó y se descartó:
nombraría cinco sextos de `transmute-lore` por un sexto. Lo que sí venía de un registro ajeno era
**`HARD-GATE`**, que pasa a ser el **umbral** — misma regla, misma fuerza, sin ablandar ninguna
excepción. *Un umbral no se cruza en solitario: la máquina propone con el contenido a la vista, el
humano aprueba, y recién entonces se escribe algo.* Las frases disparadoras llevan el vocabulario del
jardín adonde un humano de verdad lo toca: *«poda en lore»*, *«poda el lore de X»*.

**El bloque siempre-activo.** El puntero al criterio de un proyecto ahora vive dentro del contrato de
instrucciones, entre dos marcadores literales: `<!-- lore:always-on -->` y `<!-- /lore:always-on -->`.
Las seis skills que escriben contratos lo estampan dentro del umbral que ya tenían — sin puerta
nueva y sin operación que haya que recordar. Es idempotente: N ejecuciones dejan exactamente un bloque
y un diff vacío. Tiene un techo duro de **25 líneas** y tres variantes —área, proyecto, bot— y lleva
punteros, nunca criterio. `transmute-lore` en modo UPGRADE lo estampa en contratos que ya existen, de
modo que el ecosistema instalado lo reciba y no solo los proyectos creados después.

**La constitución-puntero.** [`assets/constitucion-puntero.md`](../assets/constitucion-puntero.md) es
un documento de frontera para repositorios que además usan [spec-kit de GitHub](https://github.com/github/spec-kit).
Dos kits de criterio en canales disjuntos **no fallan: omiten**. No se rompe nada, no avisa nada, y el
ciclo corre sin consultar jamás el criterio. La plantilla revoca **por escrito** la cláusula por
defecto *«Constitution supersedes all other practices»*, declara un orden de precedencia explícito,
dice **quién puede escribir** —commits, pushes, tags y releases nunca por iniciativa del ciclo— y dice
**en qué niveles conviene tener spec-kit**: un área no, un proyecto el ciclo completo, un bot solo
`specify → plan → tasks`. Guías en [español](./SPEC_KIT_es.md) e [inglés](./SPEC_KIT_en.md).

**Lore no depende de spec-kit y no va a depender.** Desinstalarlo no rompe nada acá.

## Qué está medido y qué no

Esta es la parte que conviene leer antes de confiar en cualquiera de las dos capacidades.

- **Verificado.** El estampado idempotente, el techo de 25 líneas y el reconocimiento de marcadores
  están cubiertos por cinco tests de regresión en
  [`scripts/always-on-block.test.mjs`](../scripts/always-on-block.test.mjs).
- **Sin medir.** El spec de esta versión fijó un criterio de éxito —*¿la presencia del bloque hace
  realmente que el agente invoque la skill en vez de escribir criterio a mano?*— y condicionó la
  capacidad a ese resultado. **Nunca se corrió, y no es corrible con el instrumento actual:** el banco
  monta un fixture con un contrato y una carpeta `lore/` pero **sin skills instaladas**, así que no hay
  nada que el bloque pueda hacer invocar. El criterio queda reclasificado como requisito del
  instrumento de medida que todavía se está construyendo, y la capacidad sale **por derivación de
  diseño, no por evidencia**. Decirlo es justamente el punto.
- **Derivado de un caso, no medido.** Cada chequeo de `PRUNE` viene de un fallo documentado en un
  Lore real —un área cuyo resultado se había degradado sin que nada en ella estuviera mal— y **ninguno
  viene de una preferencia**. Esa es su fuerza y también todo su límite: `n=1`, un operador, un
  corpus. El modo **nunca se corrió de punta a punta**, y la afirmación de densidad —*menos Pistas,
  mejor entregable*— es una **conjetura** hasta que un Lore podado produzca trabajo que su dueño
  acepte. Si podar mejora el resultado o solo se siente más ordenado es exactamente lo que este
  release no puede decirte.
- **Ejercido desde que se escribió el spec.** La frontera con spec-kit se verificó primero sobre un
  **bot** —un repositorio cuyo producto son registros, no código— contra `specify-cli 0.16.5.dev0`
  (commit `bf88c9f`), y el spec declaró el caso con código como sin ejercer. Desde entonces se aplicó
  a un repositorio **con código**: el de este mismo kit. La tabla de niveles sigue siendo razonamiento
  en la fila del proyecto y decisión de diseño en la del área.
- **Medido cabeza a cabeza, y el resultado no es lo que decían los contadores.** Antes de publicar,
  `v1.2.1` y esta versión corrieron la misma tarea sobre el mismo corpus, en sesiones de agente
  separadas, y el dueño del corpus juzgó cuatro pares del trabajo resultante **a ciegas**. Esta versión
  ganó 3 a 1, con razones que no nombran ninguna capacidad del kit. La versión vieja había ganado
  **todas las medidas mecánicas**: más fronteras de validez (23 contra 20) y muchas más marcas de
  confianza (+22 contra +1). Contar los artefactos del criterio cuenta **actos de escritura**, que
  ocurren el día de la corrida; lo que esos artefactos valen llega meses después, la primera vez que
  alguien lee la Pista. Esta corrida es el contraejemplo que lo zanja — **el conteo es un chequeo de
  completitud, nunca de calidad**, y el invariante de `use-lore` ya lo dice así. Medido sobre el commit
  de corpus `d3c9448`, con el kit en `2eced3c`, y con **siete confundidores declarados** junto al
  resultado, entre ellos un corte de luz a mitad de corrida y pares armados por la misma persona que
  corrió el test. `n=1`, un juez, una sesión.

## También en esta versión

- **Entra el Caso 09** a los casos de estudio: las dos capacidades de arriba se generalizaron desde un
  solo caso y se superpusieron sobre él antes de publicar, lo que produjo **cinco defectos, ninguno
  detectable leyendo los archivos** — dos los encontró la forma en el caso y tres el caso en la forma.
- `transmute-lore` UPGRADE lee la versión instalada del **registro de instalación del host** y no de un
  manifiesto encontrado en el árbol, escribe las exenciones `Earned` en `FASES.md` en vez de dentro del
  artefacto que defienden, y arbitra `index.md` contra su formato de fila. Y el registro **tampoco es
  la última palabra**: una sesión resuelve su versión de plugin al abrirse, así que una abierta antes
  de instalar sigue corriendo la copia anterior mientras el registro, correcto en disco, no dice nada.
- **UPGRADE gana un cuarto tipo de hallazgo: `Stale`** — un artefacto que coincide con el kit y ya no
  coincide con **el proyecto**, porque la práctica cambió y nadie enmendó el texto. El modo se escribió
  para arbitrar un Lore contra un *kit* más nuevo; esto es el mismo fallo un nivel más allá, contra el
  proyecto mismo. Es el que ninguna lectura encuentra: un módulo describió seis entregas seguidas un
  paso que su equipo ya había dejado de dar, y nada lo señaló porque el flujo viejo se leía
  perfectamente coherente. **La coherencia no es un detector**, así que `Stale` se detecta contra el
  repositorio —commits recientes y entregables reales— y nunca releyendo.
- **`save-to-lore` gana una asimetría que le faltaba:** falsar no es inducir. Una Pista que *niega*
  algo queda `confirmed` con un solo contraejemplo, porque uno basta para romper un «siempre»; la
  forma positiva de esa misma frase necesita acumulación. Y `confirmed` deja de exigir *«the running
  app»*, que no existe en un corpus cuyo producto es criterio.
- **El kit deja de hablar en nombres de modo.** *«El Lore habla el idioma del usuario»* cubría lo que
  se escribe a disco; ahora cubre también lo que el kit dice en voz alta. Una sugerencia nombra la
  **operación como verbo en tu idioma** —*«ahora podemos podar esto»*, *«esa guía conviene
  trasplantarla»*— en vez de *«hagamos un PRUNE»*. Los nombres de las skills no cambian, porque son lo
  que se invoca, y los nombres de modo tampoco cambian en la documentación, donde el lector necesita
  el token exacto. La razón es el umbral: solo funciona si puedes aceptar o rechazar **con el contenido
  a la vista**, y un identificador que hay que traducir primero es una cosa más entre tú y esa
  decisión.
- **Y tú calibras qué tan técnico se pone.** Una línea `registro:` en `identidad.md` toma tres
  posiciones — `tecnico` conserva la especificación y baja la escena al mínimo, `llano` agranda la
  escena y explica un término la primera vez que aparece, `equilibrado` (el default) es mitad y mitad.
  **Nunca mueve las reglas:** un umbral sigue siendo un umbral y un `MUST` sigue siendo un `MUST`,
  porque un calibrador capaz de apagar una puerta sería una forma de saltarse el kit pidiéndoselo
  amablemente. Y **nunca se pregunta** — el kit lo infiere de cómo escribes, dice cuál eligió en una
  línea, y ofrece la corrección en el mismo aliento. Gastar un turno de brainstorm en el registro no
  compra nada.

  Dos revisiones externas de la 2.0.9 calificaron la documentación de **«densa»**, por separado. Esta
  versión responde a eso sin diluir una sola puerta: la prosa lleva la regla *y* el suelo que la
  sostiene, y tú decides cuánto suelo quieres.
- La cadena del README desde una carpeta en bruto muestra el eslabón que faltaba: una carpeta que ya
  existe se **adopta por registro, por ruta, sin moverla** — `create-area` crea el área limpia.

## Verificación

**El cableado de `npm test` queda desactivado en esta versión.** `package.json` sale con el bloque
`scripts` vacío; los archivos `.test.mjs` y la entrada `bin` no se tocaron, así que volver a
conectarlo es una línea.

Lo que eso reemplaza, dicho y no omitido: la suite corría 44 pasando con **tres fallos previos** en
las pruebas de consistencia del README, ajenos a esta versión — congelan el texto del README en vez de
derivar las cifras de los CSV del banco. **Ese defecto sigue ahí. Lo que ya no está es el gate que lo
reportaba.** Publicar en rojo era una decisión declarada; publicar sin luz es otra, y este es el lugar
donde queda declarada.

La medición sobre la que esta versión se apoya es el banco de abajo, no la suite.

## Instalar o actualizar

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Después de actualizar, corre `transmute-lore` en modo UPGRADE sobre un proyecto existente para recibir
el bloque y que su Lore quede arbitrado contra esta versión.
