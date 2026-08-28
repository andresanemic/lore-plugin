# Casos de estudio — Lore

> [← Volver al README](../README.md) · [English](./CASES_en.md)

---

Lore no se diseñó de antemano: cada decisión salió de aplicarlo a proyectos reales y mirar qué se rompía. Estas páginas cuentan esos usos; no enseñan a instalarlo.

**Lore** es el criterio —las reglas que ya pagaste con trabajo— que un agente de IA carga en la sesión siguiente, para no volver a explicar el proyecto cada mañana. Vive en archivos Markdown, dentro de una carpeta `lore/`.

Para seguir cada caso hace falta el mismo vocabulario que el kit usa cuando trabaja:

- **Destilar** es el paso deliberado que convierte una cicatriz vivida en una regla que restringe decisiones futuras. Nada entra solo.
- Un **umbral** es la puerta de ese paso: la máquina propone con el contenido a la vista, tú apruebas y recién se escribe.
- Un **área** es la carpeta madre de un oficio: posee el criterio compartido; los proyectos heredan de ella en vez de copiarlo.
- Un **bot** es una carpeta de trabajo que no guarda ese criterio para sí. **Enruta** cada tarea al cuerpo que corresponde: decide por el tipo de trabajo cuál Lore gobierna.
- Un **injerto** juzga criterio que llega de afuera contra la finalidad de tu proyecto: echa raíces o se rechaza, y lo que crece después te pertenece.
- **Cristalizar** es sacar una fotografía trazable en un solo Markdown, extraíble de vuelta a una carpeta, sin reemplazar el Lore vivo.

> **Estatus:** son casos, no demostraciones. Son pocos, y **dieciocho de las diecinueve evidencias vienen del mismo investigador**, así que restringen cómo usamos el kit sin pretender ley. El Caso 08 añade medición controlada sin borrar esa frontera. Los que miden el kit contra sí mismo: el 10, un día entero contra un Lore vivo; el 11, dos versiones propias cabeza a cabeza con juez a ciegas; el 13, bots vivos cristalizados y juzgados como fotografía; el 14, un ecosistema instalado subido sin reescribir lo ganado; el 18, 31 árboles en ocho áreas con dos modelos por rol; el 19, el sistema completo 2.3.2 frente a su ausencia en cuatro dominios de trabajo.
>
> **El Caso 12 no viene del investigador** y vale distinto por eso: alguien de afuera instaló el kit y lo usó una hora. Rompe la frontera de autoría de los otros dieciocho y abre otra, más chica y declarada dentro del caso.

<details>
<summary><b>Caso 01 — El Lore como forma operativa de un proyecto entero</b></summary>

<br>

Un proyecto real (*numerología*) se construyó con Lore desde el primer día sobre una práctica ya disciplinada. La arquitectura de seis piezas —identidad, principios, módulos temáticos, índice, estado y contrato que el agente lee al abrir la sesión— **aguantó el proyecto completo**. El criterio se acumuló, se consultó mientras se trabajaba y meses después seguía decidiendo.

</details>

<details>
<summary><b>Caso 02 — El criterio se recupera y se comparte</b></summary>

<br>

Cuatro proyectos de un área real (*desarrollo web*) pasaron al estándar con `transmute-lore`, la skill que opera un Lore existente. Dejó tres cosas que hoy son ley:

- **El criterio es recuperable** (`add`): un proyecto nacido sin Lore ya lo tenía disperso en comentarios, decisiones y cicatrices. No se inventa: **se rescata**.
- **El criterio es deduplicable** (`clean`): los módulos genéricos viven **una vez, en el Área**. Un `clean` borró 7 módulos redundantes (−866 líneas) sin perder nada: el criterio no desapareció, **cambió de dueño**.
- **La herencia es selectiva:** cada proyecto referencia **solo** los módulos del Área que su stack realmente usa.

**Frontera declarada:** los cuatro proyectos eran del mismo dominio. La transferibilidad *entre dominios* sigue siendo promesa, no evidencia.

</details>

<details>
<summary><b>Caso 03 — El criterio importado no se adopta: se arbitra</b></summary>

<br>

Este caso originó el injerto: nació `arbitrate`, pasó a `transplant` en la 2.1 y a `graft` en la 2.1.1: misma ley y mismas cuatro puertas. Tres áreas destilaron Lore desde skills de terceros —escritas por otra persona, bajo otra finalidad— y lo observado contradijo la intuición:

- **Lo valioso no fue el resumen sino el desacuerdo.** En dos áreas, el bloque denso del módulo era *«dónde la skill contradice nuestro estándar y pierde»* — **no existía ni en la skill ni en el Lore previo**: nació de la colisión.
- **La misma skill, arbitrada por finalidades opuestas, pierde en el mismo sitio por razones inversas.** *Copywriting* fue derrotada en marketing (*«copy aburrido y funcional le gana siempre»*) y en periodismo (*«no vendemos, informamos»*). No depende de la fuente: depende de **tu** finalidad.
- **Capacidad ≠ criterio.** Una skill que *ejecuta* no se destiló: se usa como dependencia.

**Frontera declarada:** las tres áreas son del mismo usuario, con la misma herramienta. El mecanismo está observado, no probado a escala.

</details>

<details>
<summary><b>Caso 04 — El Lore no-software: la estructura sobrevive fuera del código</b></summary>

<br>

El primer caso que cruza de software a otra disciplina: periodismo y estrategia de contenido ya tenían Lore destilado de trabajo real, no andamiaje vacío —módulos nacidos de oficio, consultados por proyectos vivos—.

- **La arquitectura no es un rasgo del software**: el mismo esqueleto se reprodujo sin compilador ni test, con práctica disciplinada y finalidad explícita.
- **Existencia no es medición.** El caso muestra que el método *produce* criterio en otro dominio; no mide todavía que ese criterio *redujo el reaprendizaje*.

**Frontera declarada:** el criterio no *viajó* entre dominios — cada Lore nació fresco en su disciplina. Lo que se replica es el mecanismo.

</details>

<details>
<summary><b>Caso 05 — La memoria del caso no alimenta la destilación: la desplaza</b></summary>

<br>

El método volvió, seis semanas después, al proyecto donde había nacido en bruto. Encontró dos artefactos de preservación con suertes opuestas: un `lore/` de **Pistas** —restricciones chicas que siguen sirviendo cuando el contexto ya no está— que trabajaba, y un registro de incidentes que **no participó de una sola decisión**, ni siquiera cuando se rompió de nuevo el territorio que documentaba.

- **Preservar no es destilar, y el parecido es el problema.** Un registro satisface el impulso de preservar **sin producir criterio**. Cumplido el principio de «dejar registro», nadie destila. Minándolo antes de borrarlo aparecieron dos Pistas con seis semanas ahí sin destilarse.
- **«Indexado y obligatorio» no implica «consultado»**: estaba en la tabla del `CLAUDE.md` y era ley en `principios.md`, y aun así no se cargó. Accesible es necesario y no suficiente.
- **El filtro de admisión no mide la altitud.** Una Pista entró un día y al siguiente no impidió el segundo síntoma de su causa: escrita sobre la superficie vista, no sobre la causa.

**Este caso es la razón de que la función de notas de `save-to-lore` sea un barrido y no un botón:** recorre las notas buscando criterio; no convierte una nota suelta a pedido.

**Frontera declarada:** es software, mismo investigador y mismo interlocutor, y no hay contrafactual. Evidencia testimonial, no medida.

</details>

<details>
<summary><b>Caso 06 — La herencia entre Áreas hermanas: congelarla o enrutarla</b></summary>

<br>

Un proyecto necesitó criterio de cuatro Áreas y solo una era su madre. **La herencia de Lore es vertical: las Áreas hermanas no son madres de nadie.** Aparecieron dos salidas independientes: **congelar** —copiar una fotografía cuando la carpeta viaja sola— y **enrutar** —decidir por tarea quién gobierna—. Ese segundo camino es el que `create-bot` deja escrito.

- **Consumir no es heredar**: se hereda de la madre; el criterio de una hermana se **consume**. Eso decide hacia dónde sube un criterio que se generaliza: a su propia Área, nunca a la que solo lo lee.
- **Lo destilable de un conjunto es la frontera, no los criterios.** Dos Áreas hermanas tenían escrita, cada una, su mitad de la línea. Ninguna tenía la regla para decidir cuál gobierna una tarea concreta, porque cada cuerpo se escribe desde su propia finalidad y la divisoria solo se ve desde afuera.

**Frontera declarada:** las dos observaciones distan 48 horas, en el mismo ecosistema y con el mismo investigador. No son dos casos independientes.

</details>

<details>
<summary><b>Caso 07 — El mismo kit cuatro veces no produjo la misma forma</b></summary>

<br>

Se construyeron cuatro bots con `create-bot`, en el mismo ecosistema, y las cuatro fuentes ya tenían Lore propio y ordenado. La vara **se escribió antes de usar ninguno** —*una instrucción corta basta*, falsable así: *¿hubo que explicarle el proyecto al bot?*—. Tres se pusieron a trabajar y a ninguno hubo que explicárselo.

- **El método no produce una forma; produce formas ajustadas a la distancia.** El canon **crece cuando el ecosistema se aleja** y se vacía cuando está al lado: uno destila un corpus sellado que ningún puntero alcanza; otro quedó en un archivo, porque resumir lo que el enrutamiento alcanza habría dejado dos destilados del mismo original. Un cuarto **federa** un Área entera —apunta a su Lore en vez de copiarlo— y esa excepción quedó escrita como frontera antes de que el bot existiera.

**Frontera declarada:** un constructor, un ecosistema, una máquina, todas las fuentes con Lore. Se usaron tres de cuatro, y el que falta es justamente el único pensado para otras personas: el caso aún no dice nada cuando constructor y usuario difieren.

</details>

<details>
<summary><b>Caso 08 — Un Lore nacido con Claude vuelve a decidir con Codex</b></summary>

<br>

Un banco controlado preguntó si el criterio ganado con un modelo cambia decisiones futuras de otro. En el protocolo web congelado de 72 corridas, Codex sin Lore respetó **25/36 Pistas evaluadas (69,4%)** y con Lore **33/36 (91,7%)**: +22,3 puntos sin empeorar ninguna tarea. Las extensiones sintéticas de escritura y UPGRADE ampliaron el protocolo más allá del fixture web.

En los tres protocolos, Lore respetó **48/52 Pistas al primer intento frente a 29/52**; con corrección controlada, **52/52 metas frente a 39/52**, consumiendo menos intentos y tiempo observados. El banco publica transcripts crudos, graders deterministas, cortes bruto y auditado, regresiones y la frontera exacta de cada afirmación en [`bench/`](../bench/).

**Frontera declarada:** un modelo, un nivel de esfuerzo, una máquina, tareas sintéticas, y el mismo investigador construyó Lore, fixtures y graders. Mide cumplimiento de Pista por tarea, no correctitud integral, ahorro universal ni un instrumento validado de medición de skills (IME).

</details>

<details>
<summary><b>Caso 09 — La forma devuelta al caso del que salió</b></summary>

<br>

Dos capacidades se generalizaron desde **un solo caso** y se dieron por terminadas sin volver a aplicarse sobre él: el **bloque siempre-activo** —el trozo marcado del contrato que el agente carga primero y apunta a dónde vive el Lore— y la **constitución-puntero** —la plantilla que media entre kits, hecha de delegaciones y no de copias—. Devolverlas produjo **cinco defectos, ninguno detectable leyendo los archivos**.

El reparto es el hallazgo: **dos defectos los encontró la forma en el caso y tres el caso en la forma** —incluido el más caro, que la plantilla no dijera nada sobre quién puede escribir en el repositorio—. Generalizar pierde en las dos direcciones y ninguna se ve desde donde uno está parado: la forma sola parece completa respecto de sí misma.

La práctica es barata: **antes de publicar una generalización, superponerla sobre el caso del que salió y anotar las diferencias en ambas direcciones.** Forma → caso: defectos del caso. Caso → forma: lo que se iba a publicar.

**Frontera declarada:** un constructor, una máquina, un repositorio sin código, cero ciclos del segundo kit y el auto-sellado más fuerte de la serie —autor del kit, del caso y operador son la misma persona—. La vara se fijó tarde y cubre uno de los tres tramos; el caso lo declara, no lo disimula.

</details>

<details>
<summary><b>Caso 10 — El kit usado un día entero contra un Lore vivo, mientras se medía a sí mismo</b></summary>

<br>

El origen fue una nota de enojo: *«No me están gustando para nada los resultados de los copy… al final termino yo haciendo los copy a mano.»* Un área de community management con Lore completo, criterio destilado y método escrito, producía trabajo que su dueño desechaba. **El destilador saltándose su sistema era la única medición que importaba**, y estaba en rojo.

De ese día salieron `PRUNE`, el injerto y el umbral. Pero lo que el caso aporta no son las capacidades: es lo que se vio al usarlas.

- **El defecto no era criterio malo: era criterio correcto acumulado.** Escribir un post de cinco líneas cargaba ~797 líneas de criterio activo; ninguna Pista refutada, ninguna ley sobrante por separado, **cada una bien leída sola**. Se detecta contando artefacto contra contenido —~120 líneas de aparato alrededor de 5 de copy—, nunca leyendo archivos. Es la clase de hallazgo sin casilla en `Missing` / `Superseded` / `Earned`; por eso `PRUNE` trajo `Crowding`: criterio correcto que, junto, ahoga la tarea.
- **Podar bien un Lore así lo deja MÁS grande.** El corpus terminó 35 líneas arriba y el aparato del entregable bajó de ~120 a ninguna. Cuatro de seis hallazgos fueron `Crowding`, y repararlos es *agregar* una frontera, un destino o un techo. **Medido por tamaño de corpus, la reparación correcta se reporta como fracaso** —y el incentivo pasa a ser borrar criterio ganado—. La skill afirmaba lo contrario esa mañana y su primera corrida la desmintió.
- **El umbral protege a las skills y nada protege al editor de texto.** Ese día se escribieron 241 líneas de criterio nuevo en un Lore diagnosticado ocho horas antes por fronteras ausentes. Produjeron **una**. `save-to-lore` las exige si se lo invoca; `UPGRADE` las atrapa meses después; abrir el archivo y escribir no tiene puerta, y es el camino de casi todo. **El defecto sobrevivió al mejor caso posible** —el autor de la regla, el mismo día, la regla fresca—: es del mecanismo, no de la disciplina de nadie.
- **La omisión entre kits corre en ambas direcciones.** El Caso 09 mostró el ciclo corriendo sin consultar el criterio; acá el criterio corrió sin consultar el ciclo, y la versión ganó tres capacidades mientras su spec describía dos. Nada falló ni avisó, **porque un spec desactualizado se ve idéntico a uno vigente**.
- **Una herramienta no es neutral por ser útil.** Un revisor de terceros marca emoji y ráfagas de frases cortas como tics de máquina; la marca cuya voz se construye sobre esos recursos lo corrió en seco: la habría borrado teniendo razón en todo menos en ese corpus. El injerto cubría el criterio que llega como documento; el que llega como **herramienta que se invoca**, nadie lo cubría.

**El hallazgo que ninguna viñeta contiene, y el más importante:** casi todos esos defectos los encontró **el dueño, no el kit ni el agente**: el revisor que no corría, los saltos de línea que la superficie destruía, el ruido que volvía bajo cada entrega, la forma de estrofa de las publicaciones que sí habían rendido. El kit no tiene mecanismo que hubiera atrapado eso, y llamarlo «supervisión humana» sería suavizarlo: **el instrumento pasó el día equivocándose y el humano fue el único detector.**

**Frontera declarada, la más ancha de la serie.** Un operador, una máquina, un área, un día. La medición terminal —*«ya no siento que los tengo que hacer a mano»*— llegó de una sesión **interactiva**, mientras los copies de la queja salieron de una corrida automática sin nadie: **la variable más grande no es el Lore, es que había alguien mirando**, y separarlas exige una corrida desatendida que no ocurrió. Añádase el auto-sellado del Caso 09: kit, caso y operador siguen siendo la misma persona.

</details>

<details>
<summary><b>Caso 11 — Los contadores decían una cosa y el juez decía la otra</b></summary>

<br>

Dos versiones de este kit estaban a punto de separarse por un número: la `v1.2.1` y la `2.1.0` corrieron **la misma tarea sobre el mismo corpus**, en sesiones de agente separadas, cada una contra un worktree congelado en el mismo commit. Después el dueño del corpus leyó cuatro pares del trabajo resultante **a ciegas** —mismo tema por par, orden sorteado, sin marca de quién escribió qué— con una sola pregunta: *¿cuál firmarías como tuyo?*

**Eligió la 2.1 tres veces de cuatro.** Ninguna de sus cuatro razones nombra una capacidad del kit: hablan de escritura.

Y la versión vieja había ganado **todas las medidas mecánicas**:

| Medida | `v1.2.1` | `2.1.0` |
|---|---|---|
| Fronteras de validez declaradas | **23** | 20 |
| Marcas de confianza agregadas | **+22** | +1 |
| Líneas de criterio producidas | 1539 | 1571 |

- **Contar artefactos del criterio cuenta actos de escritura**: ocurren el día de la corrida, mientras lo que valen llega meses después, la primera vez que alguien abre la Pista y le cambia una decisión. Una corrida que puntúa bien declaró fronteras; no demostró que valiera la pena. Este es el contraejemplo que zanja: **para romper la afirmación de que una medida sigue a la calidad, alcanza un caso donde apunte al perdedor.**
- **La única derrota no es una victoria de la versión vieja.** Eligió el copy viejo criticándolo en la misma frase, y hundió al nuevo no su forma sino que no lo pudo seguir: *«me parece extraño decir que la tecnología murió en tuesday, siento que no entiendo realmente»*. Tres pares ganó el copy con saltos de línea y el cuarto el que no los tenía — no es inconsistencia. **La forma manda mientras el texto se entienda, y deja de mandar en cuanto no.**
- **El hallazgo más caro no pertenece a ninguna versión.** Preguntado por la entrega que quería, respondió: *«opciones y 1 sugerencia para yo hacer el copy definitivo»*. Ningún brazo lo entregó ni **podría haberlo hecho**: ese criterio no estaba escrito en ningún `lore/`. Un test para separar dos versiones destapó un hueco de las dos. Y responde *«¿qué habría cambiado una versión mejor?»* — nada.

**Qué cambió en el kit, para lo que existe el caso:** el invariante de `use-lore` recomendaba contar Pistas contra fronteras como chequeo barato mientras no haya puerta. Lo sigue recomendando, ahora escrito como **chequeo de completitud, nunca de calidad** —este repositorio publica cifra de banco, y la distinción no es académica.

**Frontera declarada, siete confundidores publicados junto al resultado.** Un caso (`n=1`), un juez, una sesión, un corpus. Un corte de luz a mitad de corrida destruyó las decisiones de umbral del segundo brazo —la skill escribe el resultado, no las decisiones—. Tres de cuatro pares salieron con el brazo viejo primero. Los pares los armó quien corrió el test. El pegado a mano corrompió tramos de ambos entregables, y un copy del lunes se perdió antes de ningún par. Los brazos corrieron contra árboles de distinta naturaleza: uno congelado en un tag, otro el repo vivo. Y el brazo viejo corrió primero, con el juez sin ver salida alguna.

</details>

<details>
<summary><b>Caso 12 — La primera instalación que no hizo el investigador</b></summary>

<br>

Alguien de afuera del proyecto —un químico, aquí «Nogal»— instaló el kit acompañado por videollamada: una hora transcrita completa, sobre material crudo sin ningún Lore previo, en Codex y no en Claude Code. Primer caso cuya evidencia no viene del autor.

**El fallo principal: pidió bots y salieron áreas**, una por bot, sin invocar `create-bot` en ningún momento y sin federar nada.

La regla *«un bot no es un área»* estaba escrita en **tres** artefactos: README, `create-bot` y `use-lore`. Los tres se leen cuando alguien ya decidió consultar sobre bots; en el momento de la decisión corría `create-area`, la única que no lo decía, y cierra apuntando a `create-project`.

> **Una ley escrita fuera del camino de ejecución no gobierna.** La guardia va en la skill que corre, no en la que documenta. Escribirla en un cuarto sitio habría sido el mismo error una vez más.

**Los otros tres hallazgos, todos con la misma forma — el síntoma nombra algo distinto de la causa:**

| Lo que se vio | Lo que era |
|---|---|
| El bot *«leía el Lore equivocado»* | El host apuntaba a la carpeta por defecto y no al árbol federado: el síntoma manda a depurar criterio, el problema era acceso. |
| Apareció un *bot de arquitectura* para agregar bots y reordenar carpetas | El área `bots` con forma de bot. Un bot no administra bots: eso es un `FASES.md` y un `lore/` de área. |
| La deuda de notas marcaba una nota sin minar | La escribió el propio bot cuatro minutos antes, al cerrar la tarea: deuda es lo que escribió el humano y nadie destiló. |

**El vocabulario se puso a prueba contra alguien calificado.** Validó *destilar*, *cristalizar* y *podar* contra su significado real en química, y **rechazó** *trasplantar* con argumento: mover una planta no la cambia; este modo sí cambia lo que deja entrar. De ahí sale el renombre a `graft` de la 2.1.1; ninguna revisión interna lo detectó en dos versiones.

**Lo que salió bien, la otra mitad del caso.** Con una instrucción corta, sin explicar la institución ni nombrar el criterio, el bot enrutó solo, citó fuentes, cerró proponiendo una destilación, se negó a guardar conocimiento propio por federado y dejó escrito el prompt siguiente. El norte de `create-bot` —*una instrucción corta basta*— se cumplió en manos de un tercero, la única prueba que admite.

**Qué cambió en el kit:** toda la 2.1.1 —guardias de enrutamiento en `create-area`, `create-bot` y `use-lore`, chequeo de acceso al estrenar bot, deuda de notas que distingue quién escribió qué, renombre del injerto—. Cuatro pruebas nuevas fallan si desaparece una guardia.

**Frontera declarada.** Un caso (`n=1`), una hora **acompañada en vivo por el autor del kit**: nada dice sobre instalar *sin ayuda*, que es justo la pregunta abierta. Un host, un modelo, un dominio. El seguimiento semanal es otro caso, sin escribir.

</details>

<details>
<summary><b>Caso 13 — Una cristalización que solo apunta no es una cristalización</b></summary>

<br>

El 2026-08-17 el kit cristalizó tres bots vivos. El dueño rechazó las tres: los archivos *enrutaban* a criterio que no contenían. **Roble**, bot de laboratorio, 57 KB, «sin el ecosistema»; **Sauce**, bot de oficio de área, 47 KB, «sin el oficio del área». Un tercero tampoco alcanzó. La vara era una fusión manual ya hecha (~1,1 MB): un Markdown desde el que un tercero pudiera trabajar.

El defecto no tenía señal de error: fotografías bien formadas, material privado fuera, tabla de enrutamiento correcta. Era una **tabla de ausencias**: CRYSTALLIZE miró el árbol de origen y nunca el destino, la sesión de IA de un tercero sin raíz viva debajo.

Al día siguiente corrió de nuevo con la mitad que faltaba: la fotografía **inlinea cada `lore/` enrutado** y es **extraíble**. Dos bots como carpeta de revisión —**Roble** otra vez (116 archivos, 935 KB) y **Laurel**, bot de venture con dos cuerpos (54, 370 KB)—. Cada ruta viva extraída resolvió. El extractor viaja con la skill; el dueño no lo escribió.

El dueño juzgó el par **en los mismos términos que el rechazo**: *esto es lo que buscábamos con cristalizar*.

**Qué cambió en el kit:** la 2.1.3 entera. Vara de CRYSTALLIZE: que un tercero trabaje desde el archivo solo. `lore-ecosistema/` viaja; «sin el ecosistema» es falla del modo, no alcance. Cada archivo lleva `<!-- lore:extract path="..." owner="..." -->`. Extraer reconstruye una mini-raíz que espeja `raiz`, reescribe `ecosistema.json` y falla si falta puntero. Script: `skills/transmute-lore/scripts/crystallize.mjs`.

**Frontera declarada.** Mismo investigador, el mismo juez del Caso 11, dos bots, una máquina. El veredicto: la fotografía y el desempaque llegan a la vara del dueño —no que un extraño ya abriera la carpeta en su IA y trabajara como él—. Ese es el uso que el modo reclama y aún no es un caso.

</details>

<details>
<summary><b>Caso 14 — Un upgrade que no reescribe lo ganado</b></summary>

<br>

Un ecosistema ya instalado —varias áreas, sus proyectos y al final los bots— se subió a la 2.1.4 por árboles, no carpeta por carpeta. Nada se veía roto: faltaban el bloque siempre-activo, el vocabulario *umbral* donde mandaba `HARD-GATE` —nombre anterior, hasta la 2.0.9— y las distinciones aprendidas después de escribir esos Lore.

**Lo que el modo sabía no bastaba.** Nombraba falta, superado, ganado y estancado; no mapeaba tres carpetas (sesión, padre, cuerpo) antes de abrir un módulo. Un sitio vivo se trabaja en una carpeta sin `lore/` al lado y concluir «sin Lore» es el fallo: el mapa de git y de `lore/` pasó a ser primera fase.

**El umbral de campaña es por clase, no por árbol.** El primer árbol lo pagó con contenido a la vista; los siguientes aplicaron clases ya aceptadas. Un índice largo se reparó por cabecera, no reescribiendo filas; falta `identidad.md` o `principios.md` se reportó ADD, no se inventó. Notas contadas, no minadas.

**Una pista del kit no echa raíces si el dueño la contradice.** El test había dejado escrito que un `HARD-GATE` de oficio se deja; al subir el resto, el dueño mandó que los `.md` vivos dejaran de hablar así. La pista vieja queda `refuted`; la que manda: en lore, contrato y FASES vigentes, umbral. El registro fechado y el archivo ajeno se dejan.

**Qué cambió en el kit:** la 2.1.4. Procedimiento de UPGRADE (mapa primero, campaña por clase, índice por cabecera, ADD ante piezas faltantes, bandeja contada) y corte presente/fecha para el vocabulario. Las skills de escritura ya llevaban «un párrafo es un párrafo»; esto lo documenta, no lo reintroduce.

**Frontera declarada.** Mismo investigador, misma máquina, un ecosistema. El modo puede subir un árbol instalado sin dominar el diff con unwrap ni inventar criterio; no mide reaprendizaje. No es el caso científico de LUS —el programa formula la teoría; este kit es la implementación—. Los bots y el bot que escribió este caso subieron después de absorber; no son evidencia de aplicación a ciegas.

</details>

<details>
<summary><b>Caso 15 — Una vara fijada después del primer fracaso</b></summary>

<br>

A un bot de `create-bot` le pidieron el whitepaper de un laboratorio universitario, con feedback destilado: *el contenido está bien, pero se lee «hecho con IA»; le falta el toque humano; suma la bitácora de reuniones que venimos haciendo.* El bot corrió su ciclo —spec, reescrituras, humanizer, cristalización— y produjo un documento **coherente, verificado contra sus fuentes y aun así rechazado por el dueño**: por la voz, no por la estructura.

El feedback nombraba dos lecturas: *estructura mal* versus *falta lo humano*. El proceso llevó la primera al límite y produjo una forma institucional coherente, y no lo que el equipo quería. El detector que funcionó fue **externo**: el dueño leyendo. Nada interno podía atraparlo —lo que faltaba, la voz y la bitácora, no era defecto del borrador sino una ausencia que no podía nombrar—.

Es la hipótesis **H11** en forma canónica: un artefacto internamente consistente, falso hacia afuera, que sobrevive toda relectura de sí mismo. LUS registra el hecho como aparición de H11 —el contador no sube—; acá entra solo la mitad operativa.

**La solución fue una vara, y tarde.** El documento definitivo, a mano, pasó a estándar mínimo de esa clase de entregable: apertura que sitúa el trabajo desde la persona y el porqué, origen e historia reales, el estado declarado tal cual. El canon guarda esa vara y la regla —*comparar contra ella, nunca auto-certificar contra el borrador*—, lo que la 2.1.6 le enseña a `create-bot` a fijar **antes** del primer pedido.

**Qué cambió en el kit:** la 2.1.6. El brainstorm de canon pide la vara por clase de entregable; un tipo nuevo de módulo la guarda; la regla de ejecución completa «la coherencia no es un detector», ya en UPGRADE.

**Frontera declarada.** Mismo investigador, máquina, ecosistema y campaña que los Casos 09–14 —el auto-sellado más fuerte de la serie—. Aparición de una hipótesis ya abierta, no réplica: no sube el contador. Una sola clase de entregable —texto institucional con requisito de voz—; nada dice de documentos sin ella. La vara llegó tras el fracaso, consecuencia y no diseño previo.

</details>

<details>
<summary><b>Caso 16 — Una vara fijada sobre un ejemplar antes de escalar a lote</b></summary>

<br>

El gemelo de producto del Caso 15, al revés: una campaña de outreach en frío con criterio escrito —formato, asunto, firma— pasó a un revisor externo **antes** de producir el lote, no tras el primer fracaso. El criterio previo era coherente —había sobrevivido su ciclo, y cada pieza posterior se verificaba contra él—. El revisor (otro modelo, no lectura interna) reescribió **un ejemplar** y lo devolvió como vara: asunto que nombra institución y tópico, sin links ni material al primer toque, un problema en lenguaje de negocio, oferta antes del CTA. Con ese ejemplar como referencia, el lote se reescribió y verificó en la tabla del CRM —tablas y correos viven en Notion, la forma de entrega del módulo—.

El Caso 15 aplicado como **diseño previo**: la vara se fija sobre un ejemplar juzgado por un lector externo **antes** de escalar, no tras un fracaso. El detector acá es el revisor externo sobre el primer ejemplar, fuera del ciclo que produjo el borrador. Misma **H11** —consistente hacia adentro, falsa hacia afuera— en forma preventiva: la coherencia interna no detecta la falsedad externa, y la vara no se valida releyendo el lote sino por reseña externa de un ejemplar.

**Qué cambió en el kit:** la 2.2.0. `create-bot` §3 pide fijar la vara sobre un ejemplar revisado por un lector externo antes de escalar lotes; §6 extiende la regla: cada pieza se compara contra el ejemplar revisado, nunca contra sí misma.

**Frontera declarada.** Mismo investigador, máquina, ecosistema y campaña que el Caso 15 —el auto-sellado más fuerte de la serie—. Aparición de H11, no réplica: no sube el contador. Una sola clase —correo en frío juzgado por lector externo—; nada de entregables sin lector externo ni de revisores que también escriben criterio. El revisor fue otro modelo, no el mercado: vara en `conjecture` hasta que un ciclo de envío la confirme.

</details>

<details>
<summary><b>Caso 17 — Jazmín, primera prueba de `create-bot` desde una idea mínima</b></summary>

<br>

El punto de partida fue una sola declaración humana, no un Lore previo: **Jazmín** es un IDE artístico local-first para una artista digital independiente que también gestiona su carrera; el producto no sería un chatbot. La configuración se convirtió en el primer artefacto complejo, y la primera victoria revisada fue una postulación real a una convocatoria de financiamiento para artistas: el bot debía extraer requisitos, evaluar encaje y redactar campos sin inventar datos ni enviar sin aprobación.

El resultado más amplio no fue otra función del bot. El caso estabilizó el Entre como una **forma sana, rápida y simple de trabajar**: una decisión por vez, dos o tres alternativas con trade-offs y recapitulaciones donde la intención original seguía siendo reconocible dentro del artefacto acumulado. La reflexión posterior añadió el esfuerzo fértil: un Entre disfrutable no es uno que siempre complace; la corrección, el desacuerdo y la revisión dejan movimiento reconocible en el artefacto o el criterio. El patrón no pertenece solo a `create-bot`; gobierna operaciones estructurales capaces de crear o transformar bots, proyectos, áreas, cristalizaciones y otros artefactos complejos.

La sesión afinó además el ritmo de esa estabilidad: **deriva tolerada → retorno → destilación → resincronización**. El contacto no tiene que ser constante y trabajar por separado no constituye un colapso; varias pistas pueden acumularse. El hito contextual llama a las partes de vuelta al mismo artefacto, y `save-to-lore` devuelve al criterio compartido solo aquello que modificó decisiones futuras.

**Qué cambió en el kit:** la 2.2.0 trata la declaración humana como canon provisional, la configuración como primer artefacto complejo y una primera victoria revisada como evento de estabilización. La 2.2.1 añade el esfuerzo fértil sin confundirlo con acuerdo o agradabilidad. `brainstorming-lore` pregunta solo lo que avanza esa victoria y mantiene un artefacto acumulado con continuidad reconocible; `create-bot` exige además prototipo operacional honesto, decisiones antes que prompts y Travesía derivada del propósito; `save-to-lore` captura en hitos contextuales o por acumulación, con un único umbral visible por lote. Los detalles de producto del caso quedan fuera de las leyes genéricas de las skills.

**Frontera declarada.** Un investigador, una sesión acompañada, un dominio de producto y un prototipo local. Es evidencia cualitativa situada, no una ley general de producto ni prueba de que la postulación gane, la carrera se sostenga o el sistema funcione para otras artistas. LUS v1.21 registra esfuerzo fértil y continuidad como H13, abierta con `n=1` situado; no existe todavía un segundo Entre, cambio del corpus ni efecto general demostrado.

</details>

<details>
<summary><b>Caso 18 — Dos modelos, un mismo umbral: subir 31 árboles sin perder al árbitro</b></summary>

<br>

Ocho áreas, 31 árboles con Lore vivo, todos atrasados frente al mismo `UPGRADE`. Leer cada uno a mano no escala, así que el trabajo se dividió por rol y no por área: Claude Code — Opus para diseño y arbitraje — leyó cada diagnóstico, aprobó cada árbol antes de que se escribiera algo y respondió las preguntas que solo un humano puede responder; un modelo barato, `muse-spark-1.2-contributor` corrido vía `opencode`, ejecutó el `diagnose` y el `apply` mecánico sobre cada árbol sin margen para inventar criterio nuevo.

El primer defecto real no estaba en ningún módulo de Lore — estaba en el script que orquestaba el barrido. Dos bugs solo aparecieron corriendo contra árboles reales: un error de orden de argumentos que dejaba que una bandera se comiera el prompt completo, y un regex de detección de versión que tomaba la cabecera equivocada en un archivo narrado. Ninguno se veía leyendo el script; los dos se corrigieron y verificaron antes de seguir el barrido. El segundo hallazgo fue el disparador 3 de `MYCELIUM`, corrido después de cada escritura, que sacó a la luz Pistas desconectadas reales — criterio bien escrito, bien archivado, y aun así inerte porque nada lo invocaba — en árboles sin nada en común entre sí: un corpus de investigación, la propia meta-herramienta que orquestaba el barrido, un área sin control de versiones. Ninguna se podó sin aprobación explícita. Dentro de la misma pasada, dos arbitrajes `GRAFT` devolvieron "nada entró": una lectura externa sobre la madurez del programa de investigación se enrutó a la continuidad privada y no al README público, y el estilo de escritura personal de un colaborador no aportó nada porque el README ya llevaba su dispositivo. Los dos quedan registrados como resultado válido, no como pasos saltados.

**Qué cambió en el kit:** ninguna lógica de ninguna skill. Lo que cambió es la vara vigente para esta forma de trabajo: un modelo caro que arbitra cada árbol antes de que se escriba, uno barato que ejecuta el tramo mecánico sin margen para inventar criterio, y cada commit revisado contra el diff real y no contra el informe que el modelo barato escribió sobre su propio trabajo. `use-lore` ahora nombra este patrón directamente — sugiere `/model` para el tramo mecánico de un lote en vez de un subagente, porque un subagente relee todo el árbol de Lore antes de poder empezar.

**Frontera declarada.** Un investigador, una sesión orquestadora, un árbitro con veto sobre cada árbol antes de que se escribiera. No prueba qué pasa si el ejecutor barato escribe sin ese árbitro presente, y los 31 árboles comparten un mismo diseño de aprobación — no son 31 réplicas independientes. LUS registra el mismo evento como Caso 16, evidencia abierta para sus propias hipótesis sobre criterio desconectado y corrección mutua; el contador ahí no sube por la misma razón que no sube acá — mismo investigador, misma sesión.

</details>

<details>
<summary><b>Caso 19 — El sistema completo llega más veces a la meta, pero tarda más por corrida</b></summary>

<br>

El benchmark emparejado comparó el **tratamiento completo** —Lore Plugin 2.3.2 más Lore de proyecto enrutado— con la misma tarea, dossier factual y modelo de ejecución sin ninguno de los dos. Cubrió dirección de landing, redacción de noticias, community management y CRM founder: **16 primeras pasadas**, seguidas solo donde hizo falta por **10 reparaciones controladas**. GPT-5.6 Sol medium diseñó el protocolo congelado y adjudicó ocho criterios binarios por salida mediante paquetes sin marca de brazo; GPT-5.6 Terra medium ejecutó todas las corridas aisladas.

Al primer intento, el brazo frío cumplió **53/64 criterios (82,8 %)** y el brazo Lore **59/64 (92,2 %)**: **+9,4 puntos porcentuales**. Los entregables completos de primera pasada se duplicaron (**2/8 → 4/8**). En un máximo de dos intentos, frío alcanzó **6/8 metas** y Lore **8/8**, con dos fallos residuales en frío y ninguno con Lore.

El resultado no sostiene una afirmación de rapidez de reloj. Las metas frías exitosas promediaron **64,0 segundos**, con dos observaciones censuradas tras agotar el límite; Lore promedió **110,6 segundos** en ocho éxitos. «Más rápido a la meta» significa acá menos ciclos de revisión y ninguna falla residual, no menos segundos. El input informado también fue materialmente mayor con Lore y gran parte estaba cacheado; ninguno de los totales mide costo monetario.

**Qué cambió en el producto:** el benchmark público ahora reporta por separado cumplimiento al primer intento, entregables completos y metas dentro de dos intentos, con juicios ciegos y salidas crudas auditables en [`bench/effect-2.3.2`](../bench/effect-2.3.2/). No cambió ningún contrato de skill, versión del paquete ni release.

**Frontera declarada.** El tratamiento agrupa plugin y Lore, así que no permite aislar ninguno de los componentes. Cuatro dossiers sintéticos, dos ensayos emparejados, una familia de modelos y un juez del mismo ecosistema de investigación no establecen un efecto universal ni reducción longitudinal del reaprendizaje. El registro científico documenta el mismo evento como **Caso 18 de LUS**; este registro de producto lo llama **Caso 19 de Lore Plugin** porque cada repositorio avanza su propia secuencia. El ordinal no es un identificador compartido.

</details>

> Los casos que **refutan** algo son los que más sirven. La [discusión del repositorio](https://github.com/andresanemic/lore-plugin/discussions) es el lugar.
