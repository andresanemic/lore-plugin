# Plan maestro — 2.5 «el enunciado del salto»

> Vigencia 2026-10-06, instrucciones posteriores de Andrés: el benchmark grande con/sin Lore queda aplazado por falta de tokens y herramientas; no condiciona este lanzamiento. El resultado pequeño ya ejecutado conserva su alcance. Andrés pidió corregir y ejercer la operación real antes de lanzar 2.5; la reparación de verificación ejecutada y recuperación forma parte de ese alcance autorizado. Las exigencias históricas de benchmark en este documento no reintroducen el ensayo aplazado. La publicación pública sigue requiriendo su decisión sobre el corte concreto.

> Sustituye al roadmap del 2026-10-04 para el corte 2.5. Nace de la sesión del 2026-10-05, donde
> 2.4.9 se publicó sin ejercitar su capacidad central y eso se~~
> encontró ejecutando, no leyendo.
>
> **Método:** `andamiaje/lore-plugin/lore/principios.md` **#23** exige dos bloques antes de escribir
> el acuerdo. Los dos están abajo. Un bloque puede resolver «nada», no puede omitirse.

---

## Bloque I — Continuidad con la versión previa

### Qué se mejora

| Pieza | Antes (2.4.9) | Ahora (RC1→RC3) |
|---|---|---|
| **La puerta** | `hooks/lore-turno.mjs:151` nombraba dónde vivía el estado | `operation entry` **ejecuta** y devuelve el veredicto; sale con **código 3** si hay operación abierta sin leer |
| **La puerta caída** | Degradaba al puntero, en silencio | Dice el motivo. `6a16ccb`→`4352ef1` |
| **La CLI** | Devolvía «ok» sin hacer nada, si se invocaba como módulo | Se ejecuta a sí misma. `ec975d8`→`c68d37e` |
| **El reloj** | `delegationStatus` **venía en el vendor y la fachada lo cargaba sin exponerlo** | Se consulta; la vencida se declara con su edad. `1017dc7`→`7a9c6cb` |
| **La ley del peso** | Se podía anular a sí misma con un `t.skip` | Se mide: delta 0 B, y si no se puede, lo dice con la voz de un fallo. `4074d47`→`cc7229d` |
| **La superficie** | El techo medía **2 de 8 archivos** | Hay un instrumento con la superficie declarada. `fd01901` |
| **El para qué** | `identidad.md` lo promete; `recordatorio()` no lo tiene | *(en construcción — RC3)* |

### Qué quedó mal y se corrige — y es la parte que 2.4.9 no tuvo

**1. La capacidad central se publicó sin usarse.** Quince tareas, cero operaciones, cero recibos,
cero bloque `## Operaciones`. El tag `v2.4.9` es una coordenada que no se mueve: **no se puede
corregir dentro de 2.4.9.** Se corrige en 2.5 y en adelante.

**2. El kit se decreció a sí mismo.** `SKILL.md:16`, textual: *«Ordinary work does not need this
skill… Reach for Vespi only when the operation itself is under pressure.»* **Una operación
ordinaria no es una operación**, según el kit. Por eso nunca hubo recibo ni verificador: no porque
nadie los usara, sino porque **el kit decía que no hacían falta.** Eso es H14 con mayúsculas y es
lo que este corte tiene que arreglar.

**3. Dos mediciones mal hechas, ambas mías.** El UTF-16 de PowerShellPassed a un archivo y un tag
anotado leído como commit. Las dos produjeron una alarma que no existía. **Pista operativa:** un
hallazgo no es «dos números distintos»; es una diferencia que sobrevive a *«¿cómo medí esto?»*.

**4. Se escribió el método antes de probarlo.** `metodo-de-coordinacion.md` tenía cifras que su
propia fuente desmiente. Lo rechazó Fludge. **Borrado.** Es la ley de hierro de
`superpowers/writing-skills`: *«NO SKILL WITHOUT A FAILING TEST FIRST»*, y aplica igual al criterio.

**5. El benchmark quedó diseñado y no ejecutado** (2026-10-03), y una superreview se estancó en
la corrida 1 de 3 (2026-10-04). **Este corte no publica sin su benchmark corrido.**

---

## Bloque II — Maestros

Cada uno: qué le presta a 2.5, **dónde pierde**, o «sin perturbación pertinente».

| Maestro | Qué le presta | Dónde pierde |
|---|---|---|
| **`plugins/lore/principios.md` §31** | El salto se autoriza por su enunciado, no por su volumen; y la causa de que el kit se quedara en Mini | Pierde si el enunciado necesita taxonomía: ahí es capa y manda #24. El enunciado de 2.5 no la necesita |
| **`plugins/lore/principios.md` #31 (cláusula del Mini)** | Un salto no degrada a pregunta en lenguaje llano: el cuerpo viejo nunca se reporta como roto | — |
| **`andamiaje` #18 — se ejerce antes de publicar** | La ley que ordena este corte: benchmark antes de publicar, no al revés | `n=0`. Ningún corte salió por esta vía. **Este es el primero y por eso sufallo sería el más caro** |
| **`andamiaje` #19 — definición escrita** | Cada pieza se juzga por si alguien puede escribir hoy qué hace | Pierde si la definición se escribe después de encolarla |
| **LUS, `el-tiempo-en-lus.md`** | *«La memoria existe para seguir colaborando.»* El presente es donde dialogan pasado y futuro | **Pierde como spec:** es una nota de investigación, no un protocolo. Presta el marco, no el método |
| **LUS, Maturana y Varela** (`conjecture`, 1.26) | **El texto perturba y el receptor reconstruye; selecciona, nunca instruye.** Por eso un mensaje corto no es pérdida | Pierde fuera del Entre humano-IA: la autopoiesis está definida para lo vivo y no está demostrado aquí |
| **LUS, H14 — inercia** | El diagnóstico de toda esta noche: la ausencia de un criterio produce inercia, no error | Pierde si el punto de aplicación existía y nadie lo invocó: sería otra cosa |
| **LUS, H11 — la coherencia no es un detector** | Por qué 2.4.9 pasó todo y no cambió nada | No gobierna decisiones sin caso: `n=1` |
| **LUS, H20 — condensación semántica** | Que un mensaje corto carga historia compartida, y sin historia colapsa | `n=0`, y bloqueado: contrastarlo exige un Entre con otro observador |
| **Chéjov** (`referentes.md`, dimensión de amor) | *«Cortar la explicación y dejar el vidrio.»* **Un objeto puede estar en la escena y no disparar nunca** | **Pierde en el kit entero:** es procedencia estética del producto, no criterio. `GENEALOGY_es.md` lo ata a *Tales of Berseria*; Pokémon **no figura** en la genealogía del kit |
| **Los Picantes, `party.md`** | *«La party vive sin Nico»* — una unidad que nadie coordina no está averiada: está fuera de cuadro. *Mapa de presencia, no turnos de habla* | Pierde como criterio del kit: es una novela. **Presta estructura, no ley** |
| **Elias y Dunning** (bibliografía, 2026-09-28) | *«¿Qué trabajo hace el contenedor?»* — sin un espacio que contenga el descontrol, no hay encuentro. **La cota que falta: ni demasiado fuerte, ni demasiado débil** | Pierde si el kit se vuelve grillete: *«la gente muere agarrada a las herramientas que definen su competencia»*. **Es la advertencia más directa sobre lo que esta noche pudo hacer y no hizo** |

**Sin perturbación pertinente:** Heidegger, Wegner y la SIC de Simondon. Ninguno se abrió este día.

---

## §1 — El enunciado

> **«Una persona que no sabe qué hace recibe, en menos de diez palabras, qué está pasando y qué sigue.»**

Prueba: un modelo que solo recibe lo que el hook le inyecta, sin este plan, sin este archivo, sin esta
conversación.

**Criterio de muerte del enunciado:** si el modelo puede pasar diez minutos produciendo sin haber
dicho una sola vez qué sigue. Ese es el fallo del 2026-10-05, con nombre.

---

## §2 — Lo que RC3 arregla, y por qué es un salto y no una capa

RC3 no agrega capacidad. **Agrega el paso que nombra las que ya están.** §31, textual: *«Una pista
que gobierna continuamente no tiene paso que la nombre, así que el instrumento no la ve.»*

**Tres piezas, y solo tres:**
1. `recordatorio()` tiene una quinta ranura: **el *para qué***, leído del árbol de quien lo usa, emitido aunque no haya acuerdo **al abrir** (en turno calla por costo R40: el suelo ya está cargado), apagable con `nivel off`.
2. El *qué hacer* del coordinador deja de estar solo en `method.md` y **gana el paso que lo nombra.**
3. `SKILL.md` deja de decir que una operación ordinaria no es una operación.

**Lo que NO entra:** taxonomía nueva, una sexta ranura, Causal Trace, códigos comprimidos, Veritas,
sonda y deriva, `party grande`, vespiqueen.

---

## §3 — El benchmark, con su criterio de muerte ANTES de correr

### La pregunta

> **¿Una operación ordinaria —sin presión, sin efecto externo, sin nada que apriete— deja recibo, verificador distinto del ejecutor y siguiente paso?**

### El control, declarado

| Brazo | Qué recibe | Para qué |
|---|---|---|
| **A · enrutado** | El kit instalado y el enrutamiento que siempre carga | Lo que ya funciona |
| **B · enrutado + rito** | Lo mismo, y un turno que nombra el *para qué* y el siguiente paso | Lo que RC3 agrega |

**Atribución por componente:** el contraste **B−A** es de RC3 entero. No permite atribuir entre el *para qué* y el paso del rito por separado, y **eso se declara como límite del instrumento, no se disimula.**

### Los dos resultados incómodos, y la respuesta escrita ANTES de correr

**Caso 18 de LUS:** el sistema completo **llegó más veces a la meta y tardó más por corrida.**

| Si el benchmark da… | Entonces | Qué se publica |
|---|---|---|
| Más recibos y menos reconstructores | El salto ocurrió | **2.5 con el benchmark encima** |
| Más recibos **y más tiempo** | El salto ocurrió y cuesta | **2.5, y el costo en la nota de release con su cifra** |
| Lo mismo en ambos brazos | El rito no cambia nada | **No se publica. Se declara y se busca por qué** |
| Menos que el control | El kit estorba | **No se publica. Y el 2.5 sale sin él** |

### La frase que decide

> **No se publica 2.5 si una operación que se abre no deja recibo con verificador distinto del ejecutor.** Lo efímero de un paso no abre operación (sparse) y no entra en esta frase.

Sobre **la persona**, no sobre la carga del kit: *«si el modelo pasa diez minutos produciendo sin
decir qué sigue, no se publica».*

**Corolario declarable por adelantado — el Caso 11:** las cifras del kit pueden subir sin que el juez
vea nada. Si el benchmark solo midiera conteos, **no publicaría nada** y sería una medición.

---

## §4 — La ley del peso: qué quita el benchmark

| Qué entra | Qué quita |
|---|---|
| `bench/reloj-operacion-ordinaria.mjs` + suarnés | El benchmark viejo de 2.3.2, que mide la misma cosa con menos controles y cuyo protocolo ya no se puede comparar |
| La quinta ranura del *para qué* | Nada: **no pondera.** Es un puntero, y §31 lo excluye del cálculo |
| El paso que nombra `method.md` | Nada: es un puntero |

**Si al medir el techo el delta no es ≤ 0, el corte no entra.** Hoy el instrumento da 0 B.

---

## §5 — La cláusula que lo hace publicable

§31, textual: *«ante una maestra ausente, una capacidad desactivada o un árbol escrito contra una
versión anterior, el kit puede preguntar por un destino en lenguaje llano; no falla ni exige
migración conceptual inmediata.»* **El cuerpo viejo nunca se reporta como roto.** Quien ya usa
2.4.9 recibe la puerta y el reloj y no ve nada nuevo. Nadie recibe factura por el salto.

---

## §6 — Orden, y es el orden de §18

| # | Qué | Puerta |
|---|---|---|
| 1 | RC3: la quinta ranura, el paso del rito, el `SKILL.md` | rojo primero, `npm test` verde |
| 2 | Superreview simulada sobre RC3 | tres revisores + consolidador que reproduce cada hallazgo |
| 3 | **Benchmark: se corre** | las dos filas de la tabla, y el resultado se guarda con comando y commit |
| 4 | `security-review` real | **tú lo lanzas**, sobre lo congelado |
| 5 | **Congelar y publicar 2.5 con el benchmark encima** | tu palabra |
| 6 | 2.5.1 el sábado, con el segundo benchmark | si hay tokens |

**Lo que no se publica sin tu palabra:** el tag, el release, y cualquier cosa en redes. Las cuatro
piezas de comunicación siguen en `Diseñando`.

---

## Lo que este plan no promete

No promete que RC3 funcione. No promete que el benchmark distinga algo — si no distingue, se declara.
No promete que 2.5 esté listo: hoy es un enunciado con tres capas de arbitraje encima, y **lo único
que lo demuestra es que alguien lo use sin que nadie le diga.**
Y no promete nada sobre la vara que el benchmark no reemplaza: *«una persona que no sabe nada de
vibe coding pueda entrar, se emocione, sienta que sí podía, y quiera recomendarlo»*. Esa necesita
personas que no saben, y **no se puede simular.**

**Obligación de aftermath (Andrés, 2026-10-06):** los hooks hoy son de OpenCode. Al empezar a
coordinar desde OpenChamber cuando Claude Code o Codex estén sin tokens, el kit tiene que traer
los mismos hooks (o un adaptador equivalente) para OpenChamber. No se publica 2.5 sin declararlo
explícitamente en el plan de aftermath; se implementa antes del corte que reemplace a 2.5.