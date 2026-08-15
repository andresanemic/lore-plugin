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
- **Not exercised.** The border with spec-kit was verified on a **bot** — a repository whose product
  is records, not code — against `specify-cli 0.16.5.dev0` (commit `bf88c9f`). The full cycle in a
  repository with code, which is spec-kit's majority case, has not been run. The levels table is
  reasoning for the project row and a design decision for the area row.

## Also in this release

- **Case 09** enters the case studies: the two capabilities above were generalized from a single case
  and then laid back over it before publishing, which produced **five defects, none of them visible by
  reading the files** — two found by the form in the case, three by the case in the form.
- `transmute-lore` UPGRADE reads the installed version from the **host's installation registry**
  rather than a manifest found in the working tree, writes `Earned` exemptions into `FASES.md` instead
  of the artifact they defend, and arbitrates `index.md` against its row format.
- The README chain from a raw folder now shows the missing link: an existing folder is **adopted by
  registration, by path, without moving it** — `create-area` creates the area clean.

## Verification

```bash
npm test
```

44 passing. Three pre-existing failures in the README consistency tests remain open and are unrelated
to this release: they freeze README text instead of deriving figures from the benchmark CSVs.

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
- **Sin ejercer.** La frontera con spec-kit se verificó sobre un **bot** —un repositorio cuyo producto
  son registros, no código— contra `specify-cli 0.16.5.dev0` (commit `bf88c9f`). El ciclo completo en
  un repositorio con código, que es el caso mayoritario de spec-kit, no se ha corrido. La tabla de
  niveles es razonamiento en la fila del proyecto y decisión de diseño en la del área.

## También en esta versión

- **Entra el Caso 09** a los casos de estudio: las dos capacidades de arriba se generalizaron desde un
  solo caso y se superpusieron sobre él antes de publicar, lo que produjo **cinco defectos, ninguno
  detectable leyendo los archivos** — dos los encontró la forma en el caso y tres el caso en la forma.
- `transmute-lore` UPGRADE lee la versión instalada del **registro de instalación del host** y no de un
  manifiesto encontrado en el árbol, escribe las exenciones `Earned` en `FASES.md` en vez de dentro del
  artefacto que defienden, y arbitra `index.md` contra su formato de fila.
- La cadena del README desde una carpeta en bruto muestra el eslabón que faltaba: una carpeta que ya
  existe se **adopta por registro, por ruta, sin moverla** — `create-area` crea el área limpia.

## Verificación

```bash
npm test
```

44 pasando. Quedan abiertos tres fallos previos en las pruebas de consistencia del README, ajenos a
esta versión: congelan el texto del README en vez de derivar las cifras de los CSV del banco.

## Instalar o actualizar

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Después de actualizar, corre `transmute-lore` en modo UPGRADE sobre un proyecto existente para recibir
el bloque y que su Lore quede arbitrado contra esta versión.
