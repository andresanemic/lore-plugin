# Feature Specification: Lore Plugin 2.2 — el injerto, y lo que enseñó la primera instalación ajena

**Feature Branch**: `main` (sin rama: no hay `before_specify` hook instalado)

**Created**: 2026-08-17

**Status**: Approved — en ejecución

**Repositorio de destino**: `C:\Claude\plugins\proyectos\lore-plugin`

> **Principio III de la constitución.** Este bot es una lente, no un lugar donde aterriza una feature.
> Aquí se escribe el spec; la implementación ocurre en el repositorio de destino declarado arriba,
> cuyo criterio pertenece al área `plugins`. `/speckit-implement` no corre en este repositorio.

> **Desviación declarada de spec-kit**, la misma de la 2.1: su unidad es *una feature por invocación*
> y la unidad de Lore es *una versión*. Las cuatro capacidades de abajo comparten superficie, barrido
> y prueba, así que van en un spec.

**Input**: todo lo de esta versión salió del **primer caso en que alguien que no es el autor instaló
el kit** — una sesión de una hora, acompañada por videollamada, transcrita en dos partes, sobre
material crudo sin ningún Lore previo y en Codex. Cuatro capacidades: (A) el renombre del modo
`TRANSPLANT` a `GRAFT`; (B) las guardias de enrutamiento que impiden que una petición de bots produzca
áreas; (C) el Caso 12 en la documentación pública; (D) un puntero de idioma hacia la referencia en
español.

## Clarifications

### Session 2026-08-17

- Q: ¿Se renombra `TRANSPLANT`, y entra en esta versión? → A: Sí, a `GRAFT` / *injertar*, y entra
  ahora. Eso convierte la versión en 2.2: renombrar un modo publicado es capacidad, no parche.
- Q: ¿El hallazgo de que las skills están en inglés entra? → A: Solo el puntero barato hacia
  `REFERENCE_es` / `USAGE_es`. No se traducen las skills.
- Q: ¿El Caso 12 se escribe abierto o cerrado? → A: Cerrado. El caso **es la instalación**, que ya
  ocurrió. El seguimiento de cómo «Nogal» avanza con Lore será un caso distinto.

## Por qué esta versión existe

Un tercero pidió bots y el kit construyó **áreas**, una por bot, sin invocar `create-bot` y sin
federar nada.

La regla *«un bot no es un área»* estaba escrita en **tres** artefactos: `README.md`, `create-bot`
(«why it must not be an area») y `use-lore` («the third shape»). Los tres se leen cuando ya decidiste
consultar sobre bots. En el momento de la decisión corría `create-area` — la única que no lo decía, y
que además cierra apuntando a `create-project`.

> **Una ley escrita fuera del camino de ejecución no gobierna.** La guardia va en la skill que corre,
> no en la que documenta.

Y el vocabulario del kit se puso a prueba en la misma sesión, contra alguien calificado para juzgarlo:
un químico. **Validó** destilar, cristalizar y podar contra su significado real. **Rechazó** trasplantar,
con argumento: *«trasplantar es mover una cosa de un punto a otro, una planta»* — un trasplante no
cambia lo trasplantado, solo su lugar, y este modo hace lo contrario. También rechazó *translocar*.

## Requisitos funcionales

### A — `TRANSPLANT` pasa a `GRAFT` (injertar)

- **FR-A1** El token del modo es `GRAFT` en toda la documentación y en todas las skills. En
  conversación se dice **injertar**, en el idioma del usuario, por la ley de nombres de modo ya
  vigente.
- **FR-A2** El injerto describe lo que el modo hace: tejido ajeno unido a un patrón que ya existe,
  que **prende o es rechazado**, y lo que crece después pertenece al huésped. Las cuatro puertas del
  modo no cambian, ni su exigencia de declarar **dónde pierde la fuente**.
- **FR-A3** `REFERENCE_{es,en}` y `USAGE_{es,en}` llevan la línea de historia, con la misma forma que
  ya se usó para `arbitrate`: *renombrado en 2.2; hasta la 2.1 se llamó `transplant`; misma ley,
  mismas cuatro puertas*.
- **FR-A4** `save-to-lore` **reconoce el nombre viejo** cuando el usuario lo dice. Renombrar no puede
  romper a quien aprendió la palabra anterior.
- **FR-A5 (frontera del barrido).** Tres archivos **no se tocan**, cada uno por una ley propia:

  | Archivo | Por qué |
  |---|---|
  | `docs/RELEASE_2.1.0.md` | las notas de una versión publicada no se reescriben |
  | `docs/2026-08-14_spec_lore-plugin-2.1.md` | es el registro de esa versión, no documentación viva |
  | `bench/fixtures/lore/lore/animation.md` | `bench/` queda fuera de todo barrido de vocabulario: sus fixtures son línea base de medición |

- **FR-A6** El renombre **cierra corriendo la suite completa**, no con `grep`. Es cicatriz declarada:
  un renombre alcanza la prosa y deja vivas las aserciones que la vigilan.

### B — Las guardias de enrutamiento *(implementadas en `1d0966f`, salen en esta versión)*

- **FR-B1** `create-area` vuelve a la skill que la llamó, en la misma sesión, en vez de cerrar
  apuntando a `create-project`.
- **FR-B2** Cuando quien la llamó es `create-bot`, el área es `bots`: **una**, con los bots adentro
  como proyectos, y su dominio son los bots del usuario y nunca el de ninguno de ellos.
- **FR-B3** `create-bot` nombra esa área al delegar y declara que **se reanuda** cuando exista.
- **FR-B4** `create-bot` rechaza el **bot que administra bots**: el que existe para agregar o
  reordenar a los otros es el área `bots` con forma de bot.
- **FR-B5** El estreno de un bot abre con el **chequeo de acceso por host** — el bot abierto como lo
  abrirá su usuario, alcanzando las rutas del manifiesto. Un host apuntando a la carpeta equivocada
  falla como *«lee el Lore equivocado»*, síntoma que manda a depurar el criterio y nunca el acceso.
- **FR-B6** `use-lore` **enruta** una petición de bot en su puerta de primer uso en vez de
  contestarla con un área: las áreas son pasos, `create-bot` corre al final, y la cadena se nombra
  con su costo honesto.
- **FR-B7** `obsidian-lore` no cuenta como deuda del usuario una nota que el propio agente escribió,
  sin decirlo.
- **FR-B8** `create-bot` responde dónde va un documento que llega **después** de que el bot existe:
  al `fuente/` del área dueña; en el bot, a lo sumo, un buzón en tránsito que se vacía.

### C — Caso 12 en la documentación pública

- **FR-C1** `CASES_{es,en}` incorporan el Caso 12, **cerrado**, con el alias **«Nogal»**. El nombre
  real de la persona y de su proyecto no entra a ningún artefacto.
- **FR-C2** Frontera declarada del caso: `n=1`, una sesión de una hora, **acompañada en vivo por el
  autor del kit** — no mide instalación autónoma —, un solo host (Codex) y un solo modelo.
- **FR-C3** El caso registra también **lo que salió bien**: con una instrucción corta y sin
  explicarle la institución, el bot enrutó solo, citó sus fuentes, cerró proponiendo destilación, se
  negó a guardar conocimiento propio por ser federado y dejó escrito el prompt de la sesión siguiente.
- **FR-C4** El README pasa a **doce casos** en sus dos idiomas, y se corrige la incoherencia que ya
  arrastra: el bloque de estatus dice *«nueve evidencias»* mientras el resto dice *«once casos»*.
- **FR-C5** La frontera global del corpus cambia y hay que decirlo: **ya no todas las evidencias
  vienen del mismo investigador**. Es la primera que no.

### D — Puntero de idioma

- **FR-D1** El README, en sus dos idiomas, y las cabeceras de `REFERENCE`/`USAGE` dicen dónde se lee
  **en español** qué hace cada modo. Motivo directo del caso: el instalador abrió el `SKILL.md` en
  vivo para mostrar qué era el trasplante y no pudo leerlo.
- **FR-D2** No se traduce ninguna skill. El arreglo es de navegación, no de contenido.

## Criterios de aceptación

1. `node --test bench/*.test.mjs` termina con los mismos 2 fallos previos e independientes
   (`benchmark-consistency`, que solo lee `results.csv`, `README.md` y `bench/README.md`) y ningún
   fallo nuevo.
2. No queda ninguna ocurrencia del nombre viejo fuera de los tres archivos exentos de FR-A5 y de las
   líneas de historia que FR-A3 exige.
3. Los cuatro manifiestos declaran `2.2.0`: `package.json`, `.claude-plugin/plugin.json`,
   `.claude-plugin/marketplace.json`, `.codex-plugin/plugin.json`.
4. `docs/RELEASE_2.2.0.md` existe, bilingüe, y describe las cuatro capacidades.
5. Tag `v2.2.0`, push y release publicados — y la publicación **se cierra verificando el artefacto
   instalado**, no el mensaje de éxito de ningún comando.
6. La copia local se reinstala con `uninstall` + `install`, nunca con `update`, y la sesión se
   reinicia para que cargue.

## Lo que esta versión NO hace

- **No traduce las skills.** Anotado, con su evidencia, y decidido en contra por ahora.
- **No escribe el caso del seguimiento de «Nogal».** Ese es otro caso y todavía no ocurrió.
- **No toca las notas de 2.1.0 ni los fixtures del banco.** FR-A5.
- **No repite el benchmark del Caso 08.** Sigue encolado en `FASES.md` con su propia condición: se
  repite contra la versión que se publique, antes del push de esa versión.
