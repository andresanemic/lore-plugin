# Lore Plugin 2.3.0 — borrador, sin publicar

> **Estado: borrador.** `origin/main` está en `2.2.2`. Esta versión existe solo en el árbol local y
> en la instalación manual de esta máquina. El tag anotado se crea sobre el commit probado que se
> publique, nunca antes (`plugins/lore/principios.md` #12).

## Qué entra

- **`LEAVE`** — dejar el Lore sin perder el proyecto. Escribe la marca `leave:` en `FASES.md`, que es
  toda su reversibilidad: sin ella `UPGRADE` no puede volver y `H13` sigue sin instrumento.
- **`MICELIO`** — octavo modo, con **tres disparadores**: antes de una tarea compleja, tras instalar
  o actualizar el kit, y **al salir de cualquier pasada que escribió Lore** (`PRUNE`, `GRAFT`, una
  destilación). La pasada de salida no es la de entrada repetida — **una Pista nueva nace `Aislada`**,
  así que una pasada que escribe fabrica el defecto que el modo detecta. Recorrido de solo lectura que reporta qué
  Pistas quedaron **aisladas**: ningún paso de ningún procedimiento las corre. Dos disparadores —
  antes de una tarea compleja, y tras instalar o actualizar el kit.
- Auditoría con `ponytail` + `writing-skills`: cuatro defectos de enchufe corregidos, más la guardia
  estructural que detecta una capacidad sin paso que la corra.

## Vocabulario de `MICELIO`

El **micelio** es la red que reparte; la **micorriza** es la junta entre una Pista y el paso que la
corre. Los cuatro casos: `Micorrizada` · `Aislada` · `Media junta` · `Junta seca`.

El término anterior era `Orphan` y se retiró: es **vertical** —dice que falta alguien arriba— y el
defecto es **lateral**. Una Pista aislada tiene autor, módulo y frontera; lo que no tiene es junta
con nada al lado. Un nombre que apunta al eje equivocado manda la reparación al lugar equivocado.

## Registros del kit — decisión explícita, uno por uno (`principios.md` #15)

| Registro | ¿Entra `MICELIO`? | Por qué |
|---|---|---|
| Lista de modos + `When to use` de `transmute-lore` | **Sí** | es un modo |
| Tabla de enrutamiento de `use-lore` | **Sí** | sin fila no lo invoca nadie |
| Invariantes de `transmute-lore` y de `use-lore` | **Sí** | hueco detectado grepeando, no revisando |
| `README` · `USAGE_en/es` · `REFERENCE_en/es` | **Sí** | documentación de usuario, el hueco más caro de 2.1 |
| Nombres fijos en todo idioma (`create-area`, `create-project`, `create-bot`) | **No** | esa lista gobierna **nombres de artefacto** que no se localizan (`lore/`, `index.md`, `golden-paths.md`, la marca always-on). Los nombres de modo no son artefactos y nunca se traducen; agregarlos confundiría dos registros distintos |
| `CASES_en/es` · `90_SECONDS_en/es` | **No, todavía** | describen casos y versiones **publicadas**. Entran cuando la 2.3.0 salga, con un caso real corrido, no con el estreno |
| `MIGRATION_en/es` | **No, todavía** | documenta migraciones entre versiones publicadas. `2.2.2 → 2.3.0` se escribe al publicar |

## Frontera declarada

`MICELIO` prueba que una regla **puede** dispararse. No prueba que sea correcta, ni que se corra
bien, ni que el entregable mejore. Su premisa (`H14`) es **hipótesis abierta en `n=1`**, con
`Crowding` como explicación rival declarada: las dos se ven igual desde afuera y piden remedios
opuestos. El verde post-instalación es `0 de 0` y no prueba nada.

## Suite

`85/85` — 70 previos + 4 de la auditoría + 11 de `MICELIO` y sus hallazgos sobre el propio kit.

## `brainstorming-lore` — el segundo caso

El gate preguntaba **quién es dueño** del artefacto, y eso tenía un punto ciego: un entregable que
Lore no posee pero que un `lore/` enrutado **gobierna** —un lote de publicaciones, un informe—, donde
todo el diseño es decidir cómo correr criterio ya escrito. Ese caso caía afuera, y afuera lo espera
un brainstorming genérico que **termina obligando `writing-plans`**: la derrota #5 de la fuente,
evitada adentro del kit y vuelta a comer por el flanco. Entra con **predicado observable** —¿hay un
`lore/` enrutado que gobierne la producción de esto?— y con su lado negativo escrito. El handoff va a
la fase que el Lore gobernante ya nombra, nunca a `writing-plans`.
