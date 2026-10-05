# RC2 — la unidad con reloj

> Especificación del corte. Escribible hoy sin reconstruir nada, que es lo que `andamiaje/lore/principios.md` #19 exige de una pieza antes de que entre a un corte.
>
> **Decisión de Andrés (2026-10-05):** RC2 se instala en los tres hosts al terminar. **AUTH:** *«instala rc2 cuando ermines»*.
>
> **Precedente directo:** RC1 instaló la puerta (`8876bb8`→`057d33a`) y cerró dos bypass silenciosos (`ec975d8`→`c68d37e`, `6a16ccb`→`4352ef1`), suite 885/880/0/5, huella idéntica en OpenCode y Codex.

## Por qué este corte, en la frase de quien lo pidió

Las generaciones funcionan como unidad por seis razones: **son rápidas, tienen tiempo, van al grano, coordinan, tienen hipertexto y tienen lore.** Las seis están escritas. **Ninguna está ocurriendo.** RC2 no agrega capacidades: las sube a código.

| Propiedad | Qué exige | Estado medido hoy | Entra en RC2 |
|---|---|---|---|
| **Rápida** | Moverse rápido porque las reglas se conocen, no porque se saltan | Las medianas existen (`calibracion-tareas-2026-10-04.md`); la puerta existe pero queda detrás del guard de turnos | La puerta por el canal que ya existe (§1) |
| **Tiene tiempo** | El reloj gobierna el bucle | **`deadlineMs` y `delegationStatus` existen en el kernel; nadie los consulta** | El reloj consultado (§2) |
| **Va al grano** | El informe dice el resultado primero | `method.md` §7 lo exige; se incumplió toda la noche | §5, criterio, sin código |
| **Coordina** | Una party con roles que son voces, no funciones | Los roles se intercambian entre modelos: funciones | §4, criterio, sin código |
| **Tiene hipertexto** | El índice dice **cuándo** consultar cada módulo | Se cargaron archivos planos, no el índice. Por eso no salió el *why* | §3 |
| **Tiene lore** | Criterio y acuerdos cargados antes de actuar | Se leyó `CLAUDE.md` y se pasó de largo | §3 |

**Honestidad sobre la tabla, y la revisión laginx:** tres de las seis propiedades —*va al grano*, *coordina*, *tiene lore*— **no son entradas de código.** Son criterio que se verifica en el informe de cada turno y en el caso de estudio. La frase «RC2 no agrega capacidades: las sube a código» era cierta solo para la mitad de las filas, y queda corregida: RC2 sube a código **§1 y §2**; §3, §4 y §5 son criterio, y el caso de estudio es lo que los mide.

## §1 — La puerta, por el canal que ya existe

**Defecto verificado — y corregido por revisión adversarial.** La primera redacción de esta sección decía que «la puerta llega tarde» y citaba `opencode-plugin.js:244`. **Era falso en las dos partes**, y la revisión lo cazó:

- La puerta **ya corre**. `puertaDeOperacion(raiz)` (`hooks/lore-turno.mjs:139-141`) llama a `operationEntry` en cada inyección, y su `catch` ya dice el motivo en vez de degradar al puntero. Eso es RC1.
- La cita correcta: la fábrica admite que *«la fábrica del plugin es lo más cerca de una apertura que la v1 ofrece»* y que *«se fija en silencio y no se evalúa nada»* — **`hooks/opencode-plugin.js:66-67`**, no 63. Y el comentario *«internos del modelo no crean turnos ni consumen la apertura»* está en `hooks/lore-turno.mjs:134`, no 244.

**La causa real, entonces:** la puerta no falta, **queda detrás del guard de turnos**. `chat.message` (`hooks/opencode-plugin.js:134-142`) cuenta turnos humanos y devuelve temprano; la inyección por `chat.message` solo corre cuando `turno` existe (`línea 246`). El único canal que alcanza al modelo antes de su primera respuesta es `experimental.chat.system.transform`, que muta `output.system` (`líneas 237-258`), y ese solo se evalúa **después** del primer mensaje del usuario.

**Qué entra:** la fábrica siembra el veredicto con `encolar()` — el mecanismo que ya usa para `apertura`/`pendiente` (`líneas 69-86`) — y ese llega en el primer `system.transform`. Con eso, la puerta dice su veredicto antes de que el modelo formule su primera respuesta, en vez de después.

**Lo que esto NO arregla, y hay que decirlo:** el sistema no puede hablar antes de que el usuario escriba. La puerta no puede preceder al primer mensaje de una persona. Lo que puede es **no esperar a que el modelo ya haya acted** — que es la diferencia entre esto y un `UserPromptSubmit`.

**Falla roja:** con una operación abierta, el primer `system.transform` de la sesión debe llevar el veredicto. Hoy solo lleva `apertura`/`pendiente`, y el veredicto espera al guard.

## §2 — El reloj en el bucle

**Defecto verificado.** El kernel trae `deadlineMs` y `delegationStatus` por tarea. `RELEASE_0.1.4_KERNEL.md` lo dice textual: *«los plazos informan el estado solo cuando los consultas y nunca programan ni ejecutan trabajo»*. Es decir: **el reloj existe y depende de que alguien pregunte.** Nadie pregunta.

**Qué entra:**

1. `operation plan` acepta `deadlineMs` y lo persiste por tarea.
2. `operation entry` y `operation status` **consultan** `delegationStatus` y devuelven, por tarea vencida sin éxito, el muro con su edad — no solo su estado.
3. Una tarea vencida **se declara vencida en `status` y `entry`**, con su edad. **No se le bloquea la integración.**

**Sobre por qué `integrate` no rechaza vencidas.** La primera redacción pedía que `integrate` las rechazara. **La revisión adversarial lo cazó y esta versión lo retira:** eso no es consultar estado, es **ejecutar juicio con el reloj**, y `RELEASE_0.1.4_KERNEL.md` (línea 83) declara que los plazos *«informan el estado solo cuando los consultas y nunca programan ni ejecutan trabajo»*. Un muro declarado es capacidad prometida. RC2 da el reloj **consultado** y el juez visible; que la vencimiento tenga consecuencia la decide el host, no el kernel.

**Falla roja:** una tarea con `deadlineMs` en el pasado, sin verificar, hoy **no aparece en ningún lado como vencida**. Hoy no la ve ni `status`, ni `entry`, ni el informe.

**Lo que NO se promete:** el kernel no programa ni ejecuta. RC2 no le da un reloj de verdad —le da un reloj **consultado**, que es lo que el núcleo puede sostener sin mentir. La línea que lo dice es la de siempre: *«un `todo` no es una prueba aprobada»* (`RELEASE_0.1.4_KERNEL.md`).

## §3 — Hipertexto real: el índice con «cuándo consultarlo»

**Defecto verificado.** `lore/index.md` de cada árbol declara una columna **«cuándo consultarlo»**. Esta noche se cargaron archivos sueltos y se pasó de largo el índice. Consecuencia directa: el *why* —`esencia-esencia` por MCP, y `identidad.md` de Vespi— no se cargó, y por eso toda la noche corrió la mecánica con la forma correcta.

**Qué entra:** el bloque siempre-activo de cada contrato nombra **la ruta con su cuándo**, no la lista de archivos. Donde ya existe esa columna, se usa. Donde no, la fila nueva la lleva.

**Falla roja:** no hay falla de código. Se mide por el caso de estudio (§4). Un cambio de contrato no es código: es decir la fila.

**El límite, y es real:** arreglar el contrato del bot es de otro árbol y de otra puerta. RC2 lo **propone y deja el mecanismo**, no lo aplica. Decisión de Andrés.

## §4 — La party: voces, no funciones

Sin código. Es la lectura de `los-picantes/lore/party.md`, que ya existe y no se estaba aplicando:

- *«¿Esta línea podría decirla cualquiera? Si sí, falta personaje.»* Aplica a los roles: un rol intercambiable con otro modelo es una línea que podría decir cualquiera.
- *«Desde el V nadie camina en procesión por convención.»* La party de esta noche fue una procesión: un plan, cuatro funciones debajo.
- *«Mapa de presencia, no turnos de habla.»* Nadie está obligado a hablar, y nadie recibe turno para demostrar que sigue ahí.
- *«La party vive sin Nico.»* El coordinador es protagonista, no centro.

**Cómo se mide:** los tres argumentos de esta sesión —Rocket (rol como recurso), Magma (el plan basta), Aqua (la certeza de estar haciéndolo bien)— son tres voces distintas. Los cuatro copies de hoy fueron la misma voz cinco veces. **Eso lo detecta un lector ciego, y por eso no tenían alma.**

## §5 — Va al grano

`method.md` §7, textual: *«The first sentence says what happened or what you found»* y *«Never narrate step numbers or names to the person»*. Se incumplió toda la noche: narré los pasos y vendí el resultado antes que el hallazgo.

**Sin cambio de código.** Se verifica en el informe de cada turno, no en una suite.

## Fuera de RC2, y por qué

| No entra | Por qué |
|---|---|
| Causal Trace, códigos comprimidos, Veritas, sonda y deriva | Agregar capacidades mientras la puerta es nueva es el defecto que nos trajo acá |
| `party grande` (cientos de agentes), vespiqueen | Descartados por Andrés el 2026-10-04 |
| `verifier` como identidad criptográfica | **No es arreglo, es decisión de producto.** Hoy `verifier` es texto libre y el kernel lo dice. Lo que RC2 hace es **decirlo en el texto del release**, no prometerlo |
| Techo de peso | Está roto: `bench/continuidad-2.4.9.test.mjs:127` tiene un `t.skip` que anula la medición. Arreglarlo es entrada de RC3, y aquí iría antes que cualquier feature |

## El caso de estudio

**Pregunta:** ¿un coordinador nuevo puede retomar esto sin reconstruir nada?
**Método:** RC2 instalado en los tres hosts, sesión nueva, otro coordinador.
**Se mide:** pasos y minutos hasta *«sé qué está pasando»*.
**Refuta:** si lee y no sabe qué hacer, la puerta era otro texto que nombra el lugar. **Eso sería exactamente H11 otra vez.**

## Lo que este corte no promete

No promete que RC2 funcione: se construye, se instala y **se ejerce**. No promete que la identidad real del verificador exista. No arregla el techo de peso. Y el tag `v2.4.9` ya es una coordenada que no se mueve: esto es RC2 sobre `release/2.5-prep`, no un 2.5 publicado.