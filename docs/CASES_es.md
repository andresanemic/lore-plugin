# Casos de estudio — Lore

> [← Volver al README](../README.md) · [English](./CASES_en.md)

---

Lore no se diseñó en una pizarra: cada decisión de este kit salió de aplicarlo a proyectos reales y mirar qué se rompía. Estas páginas cuentan esos usos. No enseñan a instalarlo.

**Lore** es el criterio —las reglas que ya pagaste con trabajo— que un agente de IA carga en la sesión siguiente, para no volver a explicar el proyecto cada mañana. Vive en archivos Markdown, dentro de una carpeta `lore/`.

Para seguir cada caso hace falta el mismo vocabulario que el kit usa cuando trabaja:

- **Destilar** es el paso deliberado que convierte una cicatriz vivida en una regla que restringe decisiones futuras. Nada entra solo.
- Un **umbral** es la puerta de ese paso: la máquina propone con el contenido a la vista, tú apruebas, y recién entonces se escribe.
- Un **área** es la carpeta madre de un oficio: posee el criterio compartido; los proyectos heredan de ella en vez de copiarlo.
- Un **bot** es una carpeta de trabajo que no guarda ese criterio para sí. **Enruta** cada tarea al cuerpo que le corresponde: decide, por el tipo de trabajo, cuál Lore gobierna.
- Un **injerto** juzga criterio que llega de afuera contra la finalidad de tu proyecto: echa raíces o se rechaza, y lo que crece después te pertenece.
- **Cristalizar** es sacar una fotografía trazable en un solo Markdown, extraíble de vuelta a una carpeta, sin reemplazar el Lore vivo.

> **Estatus:** son casos, no demostraciones. Son pocos, y **dieciséis de las diecisiete evidencias vienen del mismo investigador**. Restringen cómo usamos el kit; no pretenden ser una ley. El Caso 08 añade medición controlada sin eliminar esa frontera, y los Casos 09, 10, 11, 13 y 14 son los que miden este kit contra sí mismo — el 10 usándolo un día entero contra un Lore vivo, el 11 corriendo dos de sus propias versiones cabeza a cabeza y juzgando la salida a ciegas, el 13 cristalizando bots vivos y juzgando la fotografía por si un tercero podría trabajar desde ella, el 14 subiendo un ecosistema ya instalado sin reescribir lo ganado.
>
> **El Caso 12 es el primero que no viene del investigador**, y por eso vale distinto: alguien de afuera instaló el kit y lo usó durante una hora. Rompe la frontera de autoría que los otros dieciséis comparten y abre una nueva, más chica y declarada dentro del caso.

<details>
<summary><b>Caso 01 — El Lore como forma operativa de un proyecto entero</b></summary>

<br>

Un proyecto real (*numerología*) se construyó con Lore desde el primer día, no como notas añadidas después, sobre una práctica de desarrollo ya disciplinada. La arquitectura de seis piezas —identidad, principios, módulos temáticos, índice, estado del proyecto y el contrato que el agente lee al abrir la sesión— **aguantó el proyecto completo**, no solo apuntes sueltos. El criterio se fue acumulando, se consultó mientras se trabajaba y, meses después, seguía decidiendo.

</details>

<details>
<summary><b>Caso 02 — El criterio se recupera y se comparte</b></summary>

<br>

Cuatro proyectos de un área real (*desarrollo web*) se llevaron al estándar con `transmute-lore`, la skill —el procedimiento escrito que el agente sigue— que opera un Lore ya existente. Dejó tres cosas que hoy son ley del kit:

- **El criterio es recuperable** (modo `add`): un proyecto que nació sin Lore ya tenía criterio disperso en comentarios, decisiones y cicatrices. No se inventa: **se rescata**.
- **El criterio es deduplicable** (modo `clean`): los módulos genéricos viven **una sola vez, en el Área**. En un proyecto, el `clean` borró 7 módulos redundantes (−866 líneas) sin perder nada: el criterio no desapareció, **cambió de dueño**.
- **La herencia es selectiva:** cada proyecto referencia **solo** los módulos del Área que su stack realmente usa.

**Frontera declarada:** los cuatro proyectos eran del mismo dominio. La transferibilidad *entre dominios* sigue siendo promesa, no evidencia.

</details>

<details>
<summary><b>Caso 03 — El criterio importado no se adopta: se arbitra</b></summary>

<br>

Este caso originó el modo que hoy se llama injerto. Nació como `arbitrate`, se renombró a `transplant` en la 2.1 y a `graft` en la 2.1.1: misma ley y mismas cuatro puertas. Tres áreas destilaron Lore a partir de skills de terceros —procedimientos escritos por otra persona, bajo otra finalidad— y lo observado contradijo la intuición:

- **Lo valioso no fue el resumen de la skill, fue el desacuerdo.** En dos áreas distintas, el bloque denso del módulo resultante era *«dónde la skill contradice nuestro estándar y pierde»*. Esa parte **no existía ni en la skill ni en el Lore previo**: nació de la colisión.
- **La misma skill, arbitrada por dos finalidades opuestas, pierde en el mismo sitio por razones inversas.** Las skills de *copywriting* fueron derrotadas en un área de marketing (*«copy aburrido y funcional le gana siempre»*) y en una de periodismo (*«no vendemos, informamos»*). El resultado no depende de la fuente: depende de **tu** finalidad.
- **Capacidad ≠ criterio.** Una skill que *ejecuta* no se destiló: se usa como dependencia.

**Frontera declarada:** las tres áreas son del mismo usuario, con la misma herramienta. El mecanismo está observado, no probado a escala.

</details>

<details>
<summary><b>Caso 04 — El Lore no-software: la estructura sobrevive fuera del código</b></summary>

<br>

El primer caso que cruza de software a otra disciplina. Dos áreas ajenas al desarrollo —periodismo y estrategia de contenido— ya tenían Lore destilado de trabajo real, no andamiaje vacío: módulos temáticos nacidos de oficio, consultados por proyectos reales.

- **La arquitectura no es un rasgo del software.** El mismo esqueleto se reprodujo en oficios sin compilador ni test, solo con una práctica disciplinada y una finalidad explícita.
- **Existencia no es medición.** El caso muestra que el método *produce* criterio en otro dominio; no mide todavía que ese criterio *redujo el reaprendizaje*.

**Frontera declarada:** el criterio no *viajó* entre dominios — cada Lore nació fresco en su disciplina. Lo que se replica es el mecanismo.

</details>

<details>
<summary><b>Caso 05 — La memoria del caso no alimenta la destilación: la desplaza</b></summary>

<br>

El método volvió, seis semanas después, al proyecto donde había nacido en bruto. Encontró dos artefactos de preservación conviviendo con suertes opuestas. De un lado, un `lore/` de **Pistas** destiladas —restricciones pequeñas que siguen sirviendo cuando el contexto original ya no está— que seguía trabajando. Del otro, un registro de incidentes que **no participó de una sola decisión**, ni siquiera cuando volvió a romperse el mismo territorio técnico que ese registro documentaba.

- **Preservar no es destilar, y el parecido es el problema.** Un registro de casos satisface el impulso de preservar **sin producir criterio**. Cumplido el principio de «dejar registro», nadie destila. Al minar el registro antes de borrarlo aparecieron dos Pistas que llevaban seis semanas ahí sin destilarse.
- **«Indexado y obligatorio» no implica «consultado».** Estaba en la tabla de consulta del `CLAUDE.md` y era ley en `principios.md`, y aun así no se cargó. La accesibilidad es necesaria y no suficiente.
- **El filtro de admisión no mide la altitud de la Pista.** Una Pista entró un día y al siguiente no impidió el segundo síntoma de su misma causa: estaba escrita sobre la superficie que se vio, no sobre la causa.

**Este caso es la razón de que `obsidian-lore` sea un barrido y no un botón:** recorre las notas buscando criterio; no convierte una nota suelta a pedido.

**Frontera declarada:** es software, mismo investigador y mismo interlocutor, y no hay contrafactual. Evidencia testimonial, no medida.

</details>

<details>
<summary><b>Caso 06 — La herencia entre Áreas hermanas: congelarla o enrutarla</b></summary>

<br>

Un proyecto necesitó criterio de cuatro Áreas, de las cuales solo una era su madre. **El modelo de herencia de Lore es vertical, y las Áreas hermanas no son madres de nadie.** Aparecieron dos soluciones independientes: **congelar** —copiar una fotografía del criterio, cuando la carpeta tiene que viajar sola— y **enrutar** —decidir por tarea cuál cuerpo gobierna—. Este segundo camino es el que `create-bot` deja escrito en el bot.

- **Consumir no es heredar.** Se hereda del Área madre; el criterio de un Área hermana se **consume**. La distinción decide hacia dónde promueve un criterio que se generaliza: sube a su propia Área, nunca a la que solo lo lee.
- **Lo destilable de un conjunto de criterios es la frontera, no los criterios.** Dos Áreas hermanas tenían escrita, cada una, su mitad de la línea. Ninguna tenía la regla para decidir cuál gobierna una tarea concreta, porque cada cuerpo se escribe desde adentro de su propia finalidad y la divisoria solo se ve desde afuera de los dos.

**Frontera declarada:** las dos observaciones distan 48 horas, en el mismo ecosistema y con el mismo investigador. No son dos casos independientes.

</details>

<details>
<summary><b>Caso 07 — El mismo kit cuatro veces no produjo la misma forma</b></summary>

<br>

Se construyeron cuatro bots con `create-bot`, en el mismo ecosistema, y las cuatro fuentes ya tenían Lore propio y ordenado. La vara de aceptación **se escribió antes de usar ninguno** —*una instrucción corta basta*, en su forma falsable: *¿hubo que explicarle el proyecto al bot para obtener el resultado?*—. Tres de los cuatro se pusieron a trabajar, y a ninguno hubo que explicárselo.

- **El método no produce una forma; produce formas ajustadas a la distancia y a la estructura del ecosistema.** El canon **crece cuando el ecosistema se aleja** y se vacía cuando está al lado: un bot destila un corpus sellado que ningún puntero alcanza; otro quedó en un solo archivo, porque resumir lo que el enrutamiento ya alcanza habría dejado dos destilados del mismo original dentro del mismo bot. Un cuarto **federa** un Área entera —apunta a su Lore en vez de copiarlo— en lugar de un conjunto de proyectos, y esa excepción se dejó escrita como frontera de validez antes de que el bot existiera.

**Frontera declarada:** un constructor, un ecosistema, una máquina, y todas las fuentes ya tenían Lore. Tres de cuatro se usaron, y el que falta es justamente el único pensado para otras personas — así que el caso todavía no dice nada sobre qué pasa cuando quien construye y quien usa son distintos.

</details>

<details>
<summary><b>Caso 08 — Un Lore nacido con Claude vuelve a decidir con Codex</b></summary>

<br>

Un banco de pruebas controlado preguntó si el criterio ganado trabajando con un modelo podía cambiar las decisiones futuras de otro. En el protocolo web congelado de 72 corridas, Codex sin Lore respetó **25/36 Pistas evaluadas (69,4%)** y Codex con Lore respetó **33/36 (91,7%)**: +22,3 puntos, sin empeorar ninguna tarea. Extensiones sintéticas de escritura y UPGRADE —el modo que sube un Lore ya instalado al estándar vigente— ampliaron el protocolo más allá de un solo fixture web.

En los tres protocolos, Lore respetó **48/52 Pistas al primer intento frente a 29/52**. Con una corrección controlada, alcanzó **52/52 metas frente a 39/52**, consumiendo menos intentos y menos tiempo observados. El banco publica transcripts crudos, graders deterministas, cortes bruto y auditado, regresiones y la frontera exacta de cada afirmación en [`bench/`](../bench/).

**Frontera declarada:** un modelo, un nivel de esfuerzo, una máquina, tareas sintéticas, y el mismo investigador construyó Lore, fixtures y graders. Mide cumplimiento de una Pista por tarea, no correctitud integral del entregable, ahorro universal ni un instrumento de medición de skills validado (IME).

</details>

<details>
<summary><b>Caso 09 — La forma devuelta al caso del que salió</b></summary>

<br>

Dos capacidades de esta versión se generalizaron desde **un solo caso** y se dieron por terminadas sin volver a aplicarse sobre él. Una es el **bloque siempre-activo**: el trozo marcado del contrato que el agente carga primero y que apunta a dónde vive el Lore. La otra es la **constitución-puntero**: la plantilla que media entre este kit y otro, hecha de delegaciones y no de copias. Devolverlas a ese caso produjo **cinco defectos, ninguno detectable leyendo los archivos**.

El reparto es el hallazgo, no el número: **dos defectos los encontró la forma en el caso y tres los encontró el caso en la forma** —incluido el más caro, que una plantilla que media entre dos kits no dijera nada sobre quién puede escribir en el repositorio—. Generalizar es una operación con pérdida en las dos direcciones, y ninguna de las dos se ve desde el lado en que uno está parado: leyendo solo la forma no se ve lo que le falta, porque está completa respecto de sí misma.

La práctica que deja es barata y mecánica: **antes de publicar una generalización, superponerla sobre el caso del que salió y anotar las diferencias en las dos direcciones.** Las que van forma → caso son defectos del caso; las que van caso → forma son las que se iban a publicar.

**Frontera declarada:** un constructor, una máquina, un repositorio sin código, cero ciclos completados del segundo kit y el auto-sellado más fuerte de la serie —el autor del kit, el del caso y el operador son la misma persona—. La vara se fijó tarde y cubre solo uno de los tres tramos, cosa que el caso declara en vez de disimular.

</details>

<details>
<summary><b>Caso 10 — El kit usado un día entero contra un Lore vivo, mientras se medía a sí mismo</b></summary>

<br>

El origen no fue una hipótesis: fue una nota de enojo. *«No me están gustando para nada los resultados de los copy… al final termino yo haciendo los copy a mano.»* Un área de community management con Lore completo, criterio destilado y método escrito, produciendo trabajo que su dueño desechaba. **El destilador saltándose su propio sistema es la única medición que importaba**, y estaba en rojo.

De ese día salieron `PRUNE`, el injerto y el umbral. Pero lo que el caso aporta no son las capacidades: es lo que se vio al usarlas.

- **El defecto no era criterio malo: era criterio correcto acumulado.** Escribir un post de cinco líneas cargaba ~797 líneas de criterio activo. Ninguna Pista estaba refutada, ninguna ley sobraba por separado, y **cada una se veía bien leída sola**. Se detecta contando artefacto contra contenido —~120 líneas de aparato alrededor de 5 de copy—, nunca leyendo archivos. Es la clase de hallazgo para la que `Missing` / `Superseded` / `Earned` —falta, superado, ganado— no tenía casilla, y por eso `PRUNE` trajo `Crowding`: criterio correcto que, junto, ahoga la tarea.
- **Podar bien un Lore así lo deja MÁS grande.** El corpus terminó 35 líneas por encima y el aparato del entregable bajó de ~120 a ninguna. Cuatro de seis hallazgos fueron `Crowding`, y reparar un `Crowding` es *agregar* una frontera, un destino o un techo. **Medido por tamaño de corpus, la reparación correcta se reporta como fracaso** — y el incentivo pasa a ser borrar criterio ganado. La skill afirmaba lo contrario esa misma mañana y su primera corrida la desmintió.
- **El umbral protege a las skills y nada protege al editor de texto.** Ese día se escribieron 241 líneas de criterio nuevo en un Lore que se había diagnosticado por fronteras ausentes ocho horas antes. Produjeron **una**. `save-to-lore` las exige si se lo invoca; `UPGRADE` las atrapa meses después; abrir el archivo y escribir no tiene ninguna puerta, y es el camino por donde pasa casi todo. **El defecto sobrevivió al mejor caso posible** —el autor de la regla, el mismo día, con la regla fresca—, así que es del mecanismo y no de la disciplina de nadie.
- **La omisión entre dos kits corre en las dos direcciones.** El Caso 09 mostró que el ciclo puede correr sin consultar el criterio. Acá pasó lo inverso: el criterio corrió sin consultar el ciclo, y la versión ganó tres capacidades mientras su spec seguía describiendo dos. Nada falló y nada avisó, **porque un spec desactualizado se ve idéntico a uno vigente**.
- **Una herramienta no es neutral por ser útil.** Un revisor de escritura de terceros marca los emoji y las ráfagas de frases cortas como tics de máquina. La marca cuya voz destilada se construye sobre esos dos recursos lo corrió en seco: la habría borrado teniendo razón en todo menos en ese corpus. El injerto cubría el criterio que llega como documento; el que llega como **herramienta que se invoca** no lo cubría nadie.

**El hallazgo que ninguna de las cinco viñetas contiene, y es el más importante:** casi todos esos defectos los encontró **el dueño del proyecto, no el kit ni el agente**. El revisor que no estaba corriendo, los saltos de línea que la superficie de almacenamiento destruía, el ruido que se colaba de vuelta bajo cada entrega, la forma de estrofa de las publicaciones que sí habían rendido. El kit no tiene ningún mecanismo que hubiera atrapado eso, y llamarlo «supervisión humana» sería suavizarlo: **el instrumento pasó el día equivocándose y el humano fue el único detector.**

**Frontera declarada, y es la más ancha de la serie.** Un operador, una máquina, un área, un día. La medición terminal —*«ya no siento que los tengo que hacer a mano»*— llegó de una sesión **interactiva**, mientras los copies que originaron la queja salieron de una corrida automática sin nadie presente: **la variable más grande que cambió no es el Lore, es que había alguien mirando**, y separarlas exige una corrida desatendida que todavía no ocurrió. Añádase el auto-sellado del Caso 09, intacto: autor del kit, autor del caso y operador siguen siendo la misma persona.

</details>

<details>
<summary><b>Caso 11 — Los contadores decían una cosa y el juez decía la otra</b></summary>

<br>

Dos versiones de este kit estaban a punto de separarse por un número. La `v1.2.1` y la `2.1.0` corrieron **la misma tarea sobre el mismo corpus**, en sesiones de agente separadas, cada una contra un worktree congelado en el mismo commit. Después el dueño del corpus leyó cuatro pares del trabajo resultante **a ciegas** —mismo tema por par, orden sorteado con un tiro independiente, sin ninguna marca de quién escribió qué— y se le hizo una sola pregunta: *¿cuál firmarías como tuyo?*

**Eligió la 2.1 tres veces de cuatro.** Ninguna de sus cuatro razones nombra una capacidad del kit: hablan de escritura.

Y la versión vieja había ganado **todas las medidas mecánicas**:

| Medida | `v1.2.1` | `2.1.0` |
|---|---|---|
| Fronteras de validez declaradas | **23** | 20 |
| Marcas de confianza agregadas | **+22** | +1 |
| Líneas de criterio producidas | 1539 | 1571 |

- **Contar los artefactos del criterio cuenta actos de escritura.** Ocurren el día de la corrida. Lo que esos artefactos valen llega meses después, la primera vez que alguien abre la Pista y le cambia una decisión. Una corrida que puntúa bien declaró sus fronteras; no demostró que valiera la pena declararlas. Este es el contraejemplo que lo zanja, y con uno basta: **para romper la afirmación de que una medida sigue a la calidad, alcanza un caso donde apunte al perdedor.**
- **La única derrota no es una victoria de la versión vieja.** Eligió el copy viejo criticándolo en la misma frase, y lo que hundió al nuevo no fue su forma sino que no lo pudo seguir: *«me parece extraño decir que la tecnología murió en tuesday, siento que no entiendo realmente»*. Tres pares los ganó el copy con los saltos de línea y el cuarto el que no los tenía — no es inconsistencia. **La forma manda mientras el texto se entienda, y deja de mandar en cuanto no.**
- **El hallazgo más caro no pertenece a ninguna de las dos versiones.** Preguntado por la forma de entrega que realmente quería, respondió: *«opciones y 1 sugerencia para yo hacer el copy definitivo»*. Ningún brazo entregó eso, y **ninguno podría haberlo hecho**, porque ese criterio no estaba escrito en ningún `lore/`. Un test diseñado para separar dos versiones destapó un hueco que es de las dos. Es también la respuesta a *«¿qué habría cambiado una versión mejor?»* — nada.

**Qué cambió en el kit, que es para lo que el caso existe:** el invariante de `use-lore` recomendaba contar Pistas contra fronteras como el chequeo barato mientras no exista una puerta. Lo sigue recomendando. Ahora queda escrito como **chequeo de completitud, nunca de calidad** — porque este repositorio publica una cifra de banco, y la distinción no es académica.

**Frontera declarada, y siete confundidores publicados junto al resultado.** Un solo caso (`n=1`), un juez, una sesión, un corpus. Un corte de luz a mitad de corrida destruyó las decisiones de umbral del segundo brazo — la skill escribe el resultado, no las decisiones. Tres de los cuatro pares salieron con el brazo viejo en primera posición. Los pares los armó la misma persona que corrió el test. El pegado a mano corrompió tramos de los dos entregables, y un copy del lunes se perdió antes de entrar a ningún par. Los dos brazos corrieron contra árboles distintos en naturaleza: uno congelado en un tag, otro el repositorio vivo. Y el brazo viejo corrió primero, con el juez sin haber visto todavía ninguna salida.

</details>

<details>
<summary><b>Caso 12 — La primera instalación que no hizo el investigador</b></summary>

<br>

Alguien de afuera del proyecto —un químico, aquí «Nogal»— instaló el kit acompañado por videollamada. Una hora, transcrita completa, sobre material crudo sin ningún Lore previo, en Codex y no en Claude Code. Es el primer caso cuya evidencia no viene del autor.

**El fallo principal: pidió bots y salieron áreas**, una por bot, sin invocar `create-bot` en ningún momento y sin federar nada.

La regla *«un bot no es un área»* ya estaba escrita en **tres** artefactos: el README, `create-bot` y `use-lore`. Los tres se leen cuando alguien ya decidió consultar sobre bots. En el momento de la decisión, la skill que corría era `create-area` — la única que no lo decía, y que además cierra apuntando a `create-project`.

> **Una ley escrita fuera del camino de ejecución no gobierna.** La guardia va en la skill que corre, no en la que documenta. Escribirla en un cuarto sitio habría sido el mismo error una vez más.

**Los otros tres hallazgos, todos con la misma forma — el síntoma nombra algo distinto de la causa:**

| Lo que se vio | Lo que era |
|---|---|
| El bot *«leía el Lore equivocado»* | El proyecto del host apuntaba a la carpeta que traía por defecto y no al árbol federado. El síntoma manda a depurar el criterio; el problema era el acceso. |
| Apareció un *bot de arquitectura*, para agregar bots y reordenar carpetas | Es el área `bots` con forma de bot. Un bot no administra bots: ese trabajo es un `FASES.md` y un `lore/` de área. |
| La deuda de notas marcaba una nota sin minar | La había escrito el propio bot cuatro minutos antes, al cerrar la tarea. Deuda es lo que escribió el humano y nadie destiló. |

**Y el vocabulario se puso a prueba contra alguien calificado para juzgarlo.** El instalador validó *destilar*, *cristalizar* y *podar* contra su significado real en química, y **rechazó** *trasplantar* con argumento: mover una planta no la cambia, y este modo sí cambia lo que deja entrar. De ahí sale el renombre a `graft` de la 2.1.1. Ninguna revisión interna lo había detectado en dos versiones.

**Lo que salió bien, que es la otra mitad del caso.** Con una instrucción corta, sin explicarle la institución y sin nombrarle el criterio, el bot enrutó solo, citó las fuentes que usó, cerró proponiendo una destilación, se negó a guardar conocimiento propio por ser federado y dejó escrito el prompt de la sesión siguiente. El norte de `create-bot` —*una instrucción corta basta*— se cumplió en manos de un tercero, que es la única prueba que ese norte admite.

**Qué cambió en el kit:** la 2.1.1 entera. Las guardias de enrutamiento en `create-area`, `create-bot` y `use-lore`, el chequeo de acceso al estrenar un bot, la deuda de notas que distingue quién escribió qué, y el renombre del injerto. Cuatro pruebas nuevas fallan si alguna guardia desaparece.

**Frontera declarada.** Un solo caso (`n=1`), una sesión de una hora, **acompañada en vivo por el autor del kit** — así que el caso no dice nada sobre instalar el kit *sin ayuda*, que es justamente la pregunta que queda abierta. Un solo host, un solo modelo, un solo dominio. Y el seguimiento —si el uso mejora o empeora con las semanas— es otro caso, todavía sin escribir.

</details>

<details>
<summary><b>Caso 13 — Una cristalización que solo apunta no es una cristalización</b></summary>

<br>

El 2026-08-17 el kit cristalizó tres bots vivos. El dueño rechazó las tres. Los archivos *enrutaban* a criterio que no contenían: **Roble**, un bot de laboratorio, en 57 KB, rotulado «sin el ecosistema»; **Sauce**, un bot de oficio de área, en 47 KB, «sin el oficio del área». Un tercero se acercó y tampoco alcanzó. La vara era una fusión manual que el dueño ya había hecho (~1,1 MB): un solo Markdown desde el que un tercero pudiera trabajar.

El defecto no tenía señal de error. Cada fotografía estaba bien formada, el material privado quedó fuera y la tabla de enrutamiento era correcta. Era una **tabla de ausencias**. CRYSTALLIZE había mirado el árbol de origen y nunca el destino: la sesión de IA de un tercero, sin una raíz viva debajo.

Al día siguiente el modo se corrió otra vez, ahora con la mitad que faltaba: la fotografía **inlinea cada `lore/` enrutado**, y es **extraíble**. Se cristalizaron dos bots y se entregaron como carpeta de revisión — **Roble** otra vez (116 archivos, 935 KB) y **Laurel**, un bot de venture con dos cuerpos (54 archivos, 370 KB). Cada ruta viva de la tabla de enrutamiento extraída resolvió. El extractor viaja con la skill; el dueño no lo escribió.

El dueño juzgó el par **en los mismos términos que el rechazo**: *esto es lo que buscábamos con cristalizar*.

**Qué cambió en el kit:** la 2.1.3 entera. La vara de CRYSTALLIZE es que un tercero pueda trabajar desde el archivo solo. `lore-ecosistema/` viaja. «Sin el ecosistema» es falla del modo, no un alcance. Cada archivo lleva `<!-- lore:extract path="..." owner="..." -->`. Extraer reconstruye una mini-raíz que espeja `raiz`, reescribe `ecosistema.json` y falla si falta un puntero. El script es `skills/transmute-lore/scripts/crystallize.mjs`.

**Frontera declarada.** El mismo investigador, el mismo juez que el Caso 11, dos bots, una máquina. El veredicto es que la fotografía y el desempaque llegan a la vara del dueño — no que un extraño ya abrió la carpeta en su IA favorita y trabajó como si fuera él. Ese es el uso que el modo ahora reclama, y todavía no es un caso.

</details>

<details>
<summary><b>Caso 14 — Un upgrade que no reescribe lo ganado</b></summary>

<br>

Un ecosistema ya instalado —varias áreas, sus proyectos y al final los bots— se subió a la 2.1.4 por árboles, no carpeta por carpeta. Nada se veía roto. Faltaban el bloque siempre-activo, el vocabulario *umbral* donde aún mandaba `HARD-GATE` —el nombre anterior del umbral, hasta la 2.0.9—, y las distinciones que el kit había aprendido después de escribir esos Lore.

**Lo que el modo ya sabía no bastaba.** UPGRADE sabía nombrar falta, superado, ganado y estancado. No sabía mapear tres carpetas distintas (sesión, padre, cuerpo) antes de abrir un módulo. Un sitio vivo se trabaja en una carpeta que no trae `lore/` al lado; concluir «sin Lore» es el fallo. El mapa de git y de `lore/` pasó a ser la primera fase.

**El umbral de una campaña es por clase, no por árbol.** El primer árbol pagó el umbral con el contenido a la vista. Los siguientes aplicaron las clases ya aceptadas. Un índice largo se reparó por la cabecera, no reescribiendo filas. Falta `identidad.md` o `principios.md` se reportó como ADD, no se inventó. Las notas se contaron; no se minaron.

**Una pista del propio kit no echa raíces si el dueño la contradice.** El test había dejado escrito que un `HARD-GATE` de oficio se deja. Al subir el resto, el dueño mandó que los `.md` vivos dejen de hablar así. La pista vieja queda `refuted`. La que manda: en lore, contrato y FASES que mandan hoy, se dice umbral. El registro fechado y el archivo de otra skill se dejan.

**Qué cambió en el kit:** la 2.1.4. El procedimiento de UPGRADE (mapa primero, campaña por clase, índice por cabecera, ADD cuando faltan las piezas, bandeja contada) y el corte presente/fecha para el vocabulario. Las skills de escritura ya llevaban «un párrafo es un párrafo»; esta versión lo documenta, no lo reintroduce.

**Frontera declarada.** Mismo investigador, misma máquina, un solo ecosistema. El caso muestra que el modo puede subir un árbol instalado sin dominar el diff con unwrap ni inventar criterio. No mide reaprendizaje. No es el caso científico de LUS —el programa que formula la teoría; este kit es la implementación técnica—. Los bots y el bot que escribió este caso se subieron después de absorber; no son la evidencia de que el procedimiento se aplicó a ciegas.

</details>

<details>
<summary><b>Caso 15 — Una vara fijada después del primer fracaso</b></summary>

<br>

A un bot construido con `create-bot` se le pidió un manifiesto institucional —el whitepaper de un laboratorio universitario—. El pedido llegó con un feedback ya destilado: *el contenido está bien, pero se lee «hecho con IA»; le falta el toque humano; suma el trabajo que hemos venido haciendo, a modo de bitácora, con las reuniones.* El bot corrió su ciclo entero —spec, reescrituras, una pasada de humanizer, cristalización— y produjo un documento **internamente coherente, verificado contra sus propias fuentes y aun así rechazado por el dueño**. El rechazo fue por la voz, no por la estructura.

El feedback nombraba dos lecturas posibles: *la estructura está mal* versus *falta lo humano*. El proceso llevó la primera al límite y produjo una forma institucional —coherente, y no lo que el equipo quería—. El detector que funcionó fue **externo**: el dueño leyendo. Nada dentro del borrador podía atraparlo, porque lo que al borrador le faltaba —la voz, la bitácora, las personas— no era un defecto suyo. Era una ausencia que el borrador no podía nombrar.

Esta es la hipótesis **H11** del programa científico en su forma canónica: un artefacto internamente consistente, falso hacia afuera, que sobrevive toda relectura de sí mismo. LUS, el programa de investigación que este kit implementa, registra el mismo hecho como uno de sus casos —una aparición de H11; el contador no sube—. Acá entra solo la mitad operativa.

**La solución fue una vara, y llegó tarde.** El documento definitivo, escrito a mano, pasó a ser el estándar mínimo para esa clase de entregable: una apertura que sitúa el trabajo desde la persona y el porqué, un origen y una historia reales, el estado declarado tal cual es. El canon del bot ahora guarda esa vara y la regla —*comparar contra ella, nunca auto-certificar contra el borrador*— que es lo que la 2.1.6 le enseña a `create-bot` a fijar **antes** del primer pedido.

**Qué cambió en el kit:** la 2.1.6. El brainstorm de canon de `create-bot` pide, por clase de entregable, su vara; un tipo nuevo de módulo de canon la guarda; y la regla de ejecución completa la enseñanza «la coherencia no es un detector» que ya está en UPGRADE.

**Frontera declarada.** Mismo investigador, misma máquina, mismo ecosistema y misma campaña que los Casos 09–14 —el auto-sellado más fuerte de la serie—. El caso es una aparición de una hipótesis ya abierta, no una réplica: no sube el contador. Trata de una sola clase de entregable —texto institucional con requisito de voz— y no dice nada de documentos sin ese requisito. La vara se fijó después del fracaso, como consecuencia, no como diseño previo.

</details>

<details>
<summary><b>Caso 16 — Una vara fijada sobre un ejemplar antes de escalar a lote</b></summary>

<br>

El gemelo de producto del Caso 15, al revés y en escala: una campaña de outreach en frío con un criterio ya escrito —formato, asunto, firma— pasó a manos de un revisor externo **antes** de producir el lote, no después del primer fracaso. El criterio previo del módulo era internamente coherente: había sobrevivido a su propio ciclo —spec, reescrituras, humanizer— y cada pieza que lo seguía se verificaba contra él. El revisor externo (otro modelo, no una lectura interna) reescribió **un solo ejemplar** y lo devolvió como vara: asunto concreto que nombra la institución y el tópico, sin links ni material en el primer toque, un solo problema en lenguaje de negocio, la oferta antes del CTA. Con ese ejemplar revisado como referencia, el lote entero se reescribió y se verificó en la tabla del CRM — las tablas y los correos viven en Notion, que es la forma de entrega del módulo.

Esta es la forma del Caso 15 aplicada como **diseño previo**: la vara se fija sobre un ejemplar juzgado por un lector externo **antes** de escalar a lote, no como consecuencia de un fracaso. El detector que funcionó en el Caso 15 era el dueño leyendo; acá el detector es el revisor externo sobre el primer ejemplar, y el revisor está fuera del ciclo que produjo el borrador. Es una aparición de la misma hipótesis **H11** —criterio internamente consistente y falso hacia afuera— en su forma preventiva: la coherencia interna no detecta la falsedad hacia afuera, y por eso la vara no se valida releyendo el lote, se fija por reseña externa de un ejemplar.

**Qué cambió en el kit:** la 2.1.7. `create-bot` §3 pide, para una clase de entregable que se produce **en lotes**, fijar la vara sobre un ejemplar revisado por un lector externo antes de escalar; y §6 extiende la regla de ejecución —cada pieza del lote se compara contra el ejemplar revisado, nunca contra sí misma—.

**Frontera declarada.** Mismo investigador, misma máquina, mismo ecosistema y misma campaña que el Caso 15 —el auto-sellado más fuerte de la serie—. El caso es una aparición de H11, no una réplica: no sube el contador. Trata de una sola clase de entregable —correo en frío juzgado por un lector externo— y no dice nada de entregables sin lector externo ni de lo que pasa cuando el revisor también escribe el criterio. El revisor fue otro modelo, no el mercado: la vara quedó en `conjecture` hasta que un ciclo de envío la confirme.

</details>

<details>
<summary><b>Caso 17 — Permanent Artist, primera prueba de `create-bot` desde una idea mínima</b></summary>

<br>

El punto de partida fue una sola declaración humana, no un Lore previo: construir **Permanent Artist**, un IDE artístico local-first para una artista digital independiente que también gestiona su carrera. El producto no sería un chatbot. Su superficie operacional fue «Hoy en tu carrera»; el onboarding comenzó por un proyecto real y una meta rectora por temporada; la spec personal sostuvo meta, vara, límites, temporada y hoja de ruta; y la Travesía mostró la distancia entre estado y meta.

El primer artefacto complejo fue un proyecto demostrativo editable: una artista chilena preparando una exposición y colección digital, con hoja de ruta, prioridades, presupuesto, financiamiento y obra ancla. Su primera aplicación real fue la postulación de Permanent Artist a Artizen LATAM temporada 7. El bot debía extraer requisitos, evaluar encaje, mapear evidencias, redactar campos, presupuesto y anexos, sin inventar datos ni enviar sin aprobación. Las oportunidades se filtraron por territorio y disciplina; toda salida externa quedó explícita, mínima y auditable.

El norte ético quedó formulado con Morin: contribuir a un mundo mejor ayudando a sostener y financiar expresiones culturales y artísticas. Artizen fue una vía concreta para esa apuesta, no el propósito total del bot ni evidencia de que el impacto ya hubiera ocurrido.

La captura local de Artizen mostró ventas de artefactos a **USD 10** y muchas portadas GIF; la explicación de la propia plataforma define un Artifact como un coleccionable digital único ligado al proyecto que condensa su esencia —boceto, fotografía, animación en loop, fragmento de código u otra forma adecuada—. Se vende como edición abierta durante la temporada: las compras apoyan al creador y desbloquean match funding y premios; luego la edición cierra y su cantidad queda fija. No entrega participación en el proyecto ni propiedad sobre su IP. Para Permanent Artist, el primer Artifact será la identidad coleccionable de la propuesta —cercana a una foto de perfil del proyecto, pero capaz de portar su mundo y su promesa—, con GIF como formato adecuado y no como requisito universal. La primera demo pública será una sola landing bilingüe español/inglés con dashboard navegable y demos honestas, alojada en GitHub y conectada a Vercel; el servidor dedicado queda como etapa posterior de despliegue.

El prototipo hizo visible la frontera de producto. Proyectos, estados, fuentes, decisiones y artefactos vivieron en el objeto transformado; el chat no se volvió interfaz. Las notas entraron mediante `obsidian-lore` como fuente, minería y aprobación antes del criterio. Arweave apareció solo en hitos contextuales con vista previa y confirmación de permanencia, privacidad y costo. El piso local-first fue software libre, sin cuenta, telemetría ni backend propio para contenido; la IA degradó entre conexión oficial cuando exista, API key propia, modelos locales o gratuitos verificados, créditos patrocinados y modo sin IA, sin confundir suscripción ChatGPT con acceso API.

Las decisiones de producto conservaron su situación: la gamificación con propósito nunca puntuó el valor artístico; el desafío semanal fue opt-in, pseudónimo y liviano; la baraja original y libre usó una interacción comprometida y accesible con Fisher–Yates, inspirada —no copiada— en Astrala y con reduced motion. Brian Eno y Peter Schmidt quedaron como antecedente metodológico; no se incluyeron Estrategias Oblicuas ni se buscó licencia. Bauhaus fue una preferencia de skin futura, no identidad universal. El HTML interactivo fue laboratorio y demo, con `/certificados` de blockchain-lab-uai como precedente y no plantilla.

Seis propuestas ya publicadas en Artizen fijaron la vara mínima de postulación: responder con claridad qué se construye, qué impacto busca, qué progreso verificable existe y por qué el creador puede ejecutarlo; acompañar la promesa con una demostración real; y sostener una identidad visual coherente. El Artifact funciona como obra autónoma, sin texto, logotipo ni overlays explicativos. Popularidad, comentarios y recaudación no se aceptaron como sustitutos de calidad. La candidatura acordó un deck de ocho diapositivas, versiones espejo en inglés y español, una prueba guiada con tres a cinco artistas o gestores y uso transparente de fondos: 70% desarrollo y operación, 30% créditos de IA.

El resultado más amplio no fue otra función del bot. El caso estabilizó el Entre como una **forma sana, rápida y simple de trabajar**: una decisión por vez, dos o tres alternativas con trade-offs y recapitulaciones donde la intención original seguía siendo reconocible dentro del artefacto acumulado. El patrón no pertenece solo a `create-bot`; gobierna operaciones estructurales capaces de crear o transformar bots, proyectos, áreas, cristalizaciones y otros artefactos complejos. No convierte una corrección mecánica ni una captura puntual en una entrevista.

La sesión afinó además el ritmo de esa estabilidad: **deriva tolerada → retorno → destilación → resincronización**. El contacto no tiene que ser constante y trabajar por separado no constituye un colapso; varias pistas pueden acumularse. El hito contextual llama a las partes de vuelta al mismo artefacto, y `save-to-lore` devuelve al criterio compartido solo aquello que modificó decisiones futuras. La formulación afectiva nació de *Running Back to You* de The Juan Maclean, pero la canción no prueba el mecanismo ni vuelve el amor romántico un requisito de colaboración.

**Qué cambió en el kit:** la 2.1.7 ahora trata la declaración humana como canon provisional, la configuración como primer artefacto complejo y una primera victoria revisada como evento de estabilización. `brainstorming-lore` pregunta solo lo que avanza esa victoria y mantiene un artefacto acumulado con continuidad reconocible; `create-area`, `create-project`, `create-bot` y `transmute-lore` heredan ese contrato en sus umbrales estructurales. `create-bot` exige además prototipo operacional honesto, decisiones antes que prompts y Travesía derivada del propósito; `save-to-lore` captura en hitos contextuales o por acumulación, con un único umbral visible por lote.

El mismo caso reveló otra capa de la memory card: el contexto profesional se conoce trabajando, no se extrae en el onboarding. La primera configuración ofrece el módulo de forma neutral; cuando se activa, el área posee el perfil visible y proyectos y bots lo alcanzan por puntero sin copiar una biografía. Cuando se desactiva, no se crea nada. Solo entran pistas revisadas y con fuente.

**Frontera declarada.** Un investigador, una sesión acompañada, un dominio de producto y un prototipo local. Es evidencia cualitativa situada, no una ley general de producto ni prueba de que la postulación gane, la carrera se sostenga o el sistema funcione para otras artistas. Queda abierta la pregunta de si la continuidad reconocible constituye un hallazgo científico sobre el Entre: debe ponerse a prueba desde LUS antes de abrir hipótesis, subir conteos o modificar el corpus científico.

</details>

> Los casos que **refutan** algo son los que más sirven. La [discusión del repositorio](https://github.com/andresanemic/lore-plugin/discussions) es el lugar.
