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
  Pistas quedaron **aisladas**: ningún paso de ningún procedimiento las corre.
- Auditoría con `ponytail` + `writing-skills`: cuatro defectos de enchufe corregidos, más la guardia
  estructural que detecta una capacidad sin paso que la corra.

## Vocabulario de `MICELIO`

El **micelio** es la red que reparte; la **micorriza** es la junta entre una Pista y el paso que la
corre. Los **seis** casos: `Micorrizada` · `Aislada` · `Media junta` · `Junta seca` ·
`Fuera del sustrato` · `Junta a otro árbol`.

El sexto entró el **2026-08-22**, el mismo día y en la segunda corrida, y salió de que el quinto
acertara por el motivo equivocado. El quinto dice que el criterio en `docs/` está ahí **por
descuido** y no se puede ni clasificar. Después apareció un **staging**: criterio dejado fuera de
`lore/` **a propósito**, con su gate escrito y el paso que lo ejerce nombrado — todo lo que el quinto
diagnostica es falso sobre él— y aun así no disparaba, porque **el paso que nombra vive en un
artefacto operativo que el árbol desde el que se opera no carga**. No es `Media junta`: ahí el
término falta en el destino, y acá está — el destino simplemente no es el artefacto en vigor. Los dos
reparos apuntan al revés, y por eso es un caso y no una variante.

El quinto entró el 2026-08-22 y lo encontró el modo **fallando en encontrarlo**: una regla escrita en
el `docs/` de un proyecto se reportó `Aislada` solo porque el autor recordaba haberla escrito una
hora antes. El paso 1 toma su universo del `lore/`, así que **criterio que aterrizó en una carpeta de
fuente es invisible por construcción** — no está aislado, nunca estuvo en el sustrato. Su reparo son
**dos movimientos**: primero se mueve adentro de `lore/`, donde el enrutamiento lo alcanza, y recién
ahí se le cuelga un paso. Un paso colgado de un archivo que nada carga es una junta que apunta al
vacío. El mismo barrido encontró la variante de entrada: un documento destilado que citaba cinco
capturas que vivían fuera del repositorio — correcto, citado, y no verificable por nadie más.

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

## La capa llana, el disparo automático y el tutorial — 2026-08-22

Tres cosas que entraron el mismo día, y las tres salieron de la misma objeción de Andrés: **el kit no
puede exigirle a nadie que aprenda su vocabulario para poder usarlo.**

**1. Los seis casos de `MICELIO` se dicen en llano, y los nombres no se tocan.** El defecto era real y
verificable —seis casos en español dentro de skills escritas en inglés—, pero **enunciar simple y
renombrar son dos operaciones distintas**, y solo hacía falta la primera. `Junta seca` y `Media junta`
se reparan al revés; un nombre simple que las fusionara devolvería el error que el nombre vertical
retirado ya había causado. Así que cada caso tiene ahora una **clave estable** que no se traduce
—`connected`, `alone`, `missed`, `no-exchange`, `outside`, `other-tree`— y una **frase llana** que sí.
Se reporta en la frase; el vocabulario se **infiere del uso**, como el perfil profesional, y **nunca se
exige para hacer una pregunta**. Quien aprende los seis nombres porque quiso, adoptó una herramienta;
quien tuvo que aprenderlos para que le contestaran, pagó un peaje.

**2. El tercer disparador de `MICELIO` es automático, y para en una condición estrecha a propósito.**
Salta cuando una pasada **escribió criterio y tocó enrutamiento** —las dos mitades: un typo toca
enrutamiento y no escribe criterio; una línea en `FASES.md` escribe estado y no toca enrutamiento— y
**nunca vuelve a reportar un hallazgo declinado.**

> **Por qué no se volvió «el auditor interno del kit», que era la propuesta.** Se cae por la frontera
> del propio modo: `MICELIO` prueba que una regla **puede** disparar, y nada más. Un nombre que promete
> auditoría se lee como certificado de que el criterio es **correcto**, que es justo lo que el modo se
> niega a decir. Ensanchar el nombre sin ensanchar el mecanismo es el defecto que retiró el nombre
> anterior. Y su premisa (`H14`) sigue en `n=1` con `Crowding` como rival declarada: base fina para un
> auditor universal, suficiente para una condición estrecha.
>
> **Y la ecualización es una regla, no una intención.** *«Mantener el Entre disfrutable no se tranza»*
> (Andrés, 2026-08-22). Un chequeo que se vuelve ruido se saltea, y un chequeo que nadie corre no
> detecta nada — así que no re-reportar lo declinado no es cortesía: es lo que mantiene al modo vivo.

**3. `use-lore` y `brainstorming-lore` ofrecen una orientación breve, inferida y en una línea.** Quien
llega por primera vez no tiene una imagen de qué es esto, y una lista de ocho skills no es esa imagen.
Se elige **una** forma —texto corto, mapa conceptual, ejemplo trabajado— a partir de cómo la persona
viene escribiendo, y se ofrece en una línea corregible en una línea. **Nunca como menú:** *«¿mapa,
texto, explicación fácil o test?»* es exactamente lo que el umbral 0 rechaza, con cara amable. Y
**nunca en lugar del primer artefacto**: el movimiento 3 produce algo o no produjo nada.

**Lo que este mismo día encontró en la documentación, y es del tipo que la 2.3 vino a atacar.** La
tabla de registros de más arriba declara que `MICELIO` entra a `README` y a `REFERENCE`. En `README`
había entrado; en `REFERENCE_es` y `REFERENCE_en` el §2 decía **ocho modos** y el §3.6 decía **seis** y
listaba seis — faltaban `micelio` y `leave` en el detalle, en los dos idiomas. Con el vocabulario del
propio kit es una **media junta**: el destino estaba declarado y el término ausente ahí. Se corrigió,
y vale registrarlo porque **una tabla de registros no es un registro**: declarar dónde tiene que
aterrizar algo no lo aterriza, y eso es `H14` aplicado al propio release.

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
