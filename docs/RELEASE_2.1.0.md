# Lore Plugin 2.1.0 — Always on, and a border with spec-kit

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

Lore turns project experience into reusable criteria for AI agents. Version **2.1.0** adds two
capabilities to the 2.0 foundation and changes nothing about how the kit is installed or used.

## What 2.1.0 adds

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

# Lore Plugin 2.1.0 — Siempre activo, y una frontera con spec-kit

Lore convierte la experiencia de un proyecto en criterio reutilizable para agentes de IA. La versión
**2.1.0** añade dos capacidades sobre la base 2.0 y no cambia nada de cómo se instala ni se usa.

## Qué añade 2.1.0

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
