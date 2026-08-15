# Casos de estudio — Lore

> [← Volver al README](../README.md) · [English](./CASES_en.md)

---


Lore no se diseñó en una pizarra: cada decisión salió de aplicarlo a proyectos reales y mirar qué se rompía.

> **Estatus:** son casos, no demostraciones. n pequeño, y las diez evidencias vienen del mismo investigador. Restringen cómo usamos el kit; no pretenden ser una ley. El Caso 08 añade medición controlada sin eliminar esa frontera, y los Casos 09 y 10 son los que miden este kit contra sí mismo — el 10, usándolo un día entero contra un Lore vivo.

<details>
<summary><b>Caso 01 — El Lore como forma operativa de un proyecto entero</b></summary>

<br>

Un proyecto real (*numerología*) construido con Lore de principio a fin, sobre una práctica de desarrollo disciplinado. Mostró que la arquitectura de seis piezas **aguanta un proyecto completo**, no solo notas sueltas: el criterio se acumula, se consulta y sigue decidiendo meses después.

</details>

<details>
<summary><b>Caso 02 — El criterio se recupera y se comparte</b></summary>

<br>

Cuatro proyectos de un área real (*desarrollo web*) llevados al estándar con `transmute-lore`. Dejó tres cosas que hoy son ley del kit:

- **El criterio es recuperable** (modo `add`): un proyecto que nació sin Lore ya tenía criterio disperso en comentarios, decisiones y cicatrices. No se inventa: **se rescata**.
- **El criterio es deduplicable** (modo `clean`): los módulos genéricos viven **una sola vez, en el Área**. En un proyecto, el `clean` borró 7 módulos redundantes (−866 líneas) sin perder nada: el criterio no desapareció, **cambió de dueño**.
- **La herencia es selectiva:** cada proyecto referencia **solo** los módulos del Área que su stack realmente usa.

**Frontera declarada:** los cuatro proyectos eran del mismo dominio. La transferibilidad *entre dominios* sigue siendo promesa, no evidencia.

</details>

<details>
<summary><b>Caso 03 — El criterio importado no se adopta: se arbitra</b></summary>

<br>

El caso que originó el modo `arbitrate`. Tres áreas destilaron Lore a partir de *skills* de terceros, y lo observado contradijo la intuición:

- **Lo valioso no fue el resumen de la skill, fue el desacuerdo.** En dos áreas distintas, el bloque denso del módulo resultante era *«dónde la skill contradice nuestro estándar y pierde»*. Esa parte **no existía ni en la skill ni en el Lore previo**: nació de la colisión.
- **La misma skill, arbitrada por dos finalidades opuestas, pierde en el mismo sitio por razones inversas.** Las skills de *copywriting* fueron derrotadas en un área de marketing (*«copy aburrido y funcional le gana siempre»*) y en una de periodismo (*«no vendemos, informamos»*). El resultado no depende de la fuente: depende de **tu** finalidad.
- **Capacidad ≠ criterio.** Una skill que *ejecuta* no se destiló: se usa como dependencia.

**Frontera declarada:** las tres áreas son del mismo usuario, con la misma herramienta. El mecanismo está observado, no probado a escala.

</details>

<details>
<summary><b>Caso 04 — El Lore no-software: la estructura sobrevive fuera del código</b></summary>

<br>

El primer caso que cruza de software a otra disciplina. Dos áreas ajenas al desarrollo —periodismo y estrategia de contenido— ya tenían Lore destilado real, no andamiaje: módulos temáticos derivados de trabajo real, consultados por proyectos reales.

- **La arquitectura no es un rasgo del software.** El mismo esqueleto se reprodujo en oficios sin compilador ni test, solo con una práctica disciplinada y una finalidad explícita.
- **Existencia no es medición.** El caso muestra que el método *produce* criterio en otro dominio; no mide todavía que ese criterio *redujo el reaprendizaje*.

**Frontera declarada:** el criterio no *viajó* entre dominios — cada Lore nació fresco en su disciplina. Lo que se replica es el mecanismo.

</details>

<details>
<summary><b>Caso 05 — La memoria del caso no alimenta la destilación: la desplaza</b></summary>

<br>

El método volvió, seis semanas después, al proyecto donde había nacido en bruto. Encontró dos artefactos de preservación conviviendo con suertes opuestas: un `lore/` de Pistas destiladas, que seguía trabajando, y un registro de incidentes que **no participó de una sola decisión** — ni siquiera cuando volvió a romperse el mismo territorio técnico que ese registro documentaba.

- **Preservar no es destilar, y el parecido es el problema.** Un registro de casos satisface el impulso de preservar **sin producir criterio**. Cumplido el principio de «dejar registro», nadie destila. Al minar el registro antes de borrarlo aparecieron dos Pistas que llevaban seis semanas ahí sin destilarse.
- **«Indexado y obligatorio» no implica «consultado».** Estaba en la tabla de consulta del `CLAUDE.md` y era ley en `principios.md`, y aun así no se cargó. La accesibilidad es necesaria y no suficiente.
- **El filtro de admisión no mide la altitud de la Pista.** Una Pista entró un día y al siguiente no impidió el segundo síntoma de su misma causa: estaba escrita sobre la superficie que se vio, no sobre la causa.

**Este caso es la razón de que `obsidian-lore` sea un barrido y no un botón.**

**Frontera declarada:** es software, mismo investigador y mismo interlocutor, y no hay contrafactual. Evidencia testimonial, no medida.

</details>

<details>
<summary><b>Caso 06 — La herencia entre Áreas hermanas: congelarla o enrutarla</b></summary>

<br>

Un proyecto necesitó criterio de cuatro Áreas, de las cuales solo una era su madre. **El modelo de herencia de Lore es vertical, y las Áreas hermanas no son madres de nadie.** Aparecieron dos soluciones independientes: **congelar** —copiar snapshots, cuando la carpeta tiene que viajar sola— y **enrutar** —decidir por tarea cuál cuerpo gobierna—. Este segundo camino es el que `create-bot` empaqueta.

- **Consumir no es heredar.** Se hereda del Área madre; el criterio de un Área hermana se **consume**. La distinción decide hacia dónde promueve un criterio que se generaliza: sube a su propia Área, nunca a la que solo lo lee.
- **Lo destilable de un conjunto de criterios es la frontera, no los criterios.** Dos Áreas hermanas tenían escrita, cada una, su mitad de la línea. Ninguna tenía la regla para decidir cuál gobierna una tarea concreta, porque cada cuerpo se escribe desde adentro de su propia finalidad y la divisoria solo se ve desde afuera de los dos.

**Frontera declarada:** las dos observaciones distan 48 horas, en el mismo ecosistema y con el mismo investigador. No son dos casos independientes.

</details>

<details>
<summary><b>Caso 07 — El mismo kit cuatro veces no produjo la misma forma</b></summary>

<br>

Cuatro bots construidos con `create-bot`, mismo ecosistema, las cuatro fuentes con Lore propio y ordenado. La vara de aceptación **se escribió antes de usar ninguno** —*una instrucción corta basta*, en su forma falsable: *¿hubo que explicarle el proyecto al bot para obtener el resultado?*—. Tres de los cuatro se pusieron a trabajar, y a ninguno hubo que explicárselo.

- **El método no produce una forma; produce formas ajustadas a la distancia y a la estructura del ecosistema.** El canon **crece cuando el ecosistema se aleja** y se vacía cuando está al lado: un bot destila un corpus sellado que ningún puntero alcanza, otro quedó en un solo archivo, porque resumir lo que el enrutamiento ya alcanza habría dejado dos destilados del mismo original dentro del mismo bot. Un cuarto federa un Área entera en vez de un conjunto de proyectos, y esa excepción se dejó escrita como frontera de validez antes de que el bot existiera.

**Frontera declarada:** un constructor, un ecosistema, una máquina, y todas las fuentes ya tenían Lore. Tres de cuatro se usaron, y el que falta es justamente el único pensado para otras personas — así que el caso todavía no dice nada sobre qué pasa cuando quien construye y quien usa son distintos.

</details>

<details>
<summary><b>Caso 08 — Un Lore nacido con Claude vuelve a decidir con Codex</b></summary>

<br>

Un benchmark controlado preguntó si el criterio ganado trabajando con un modelo podía cambiar las
decisiones futuras de otro. En el protocolo web congelado de 72 corridas, Codex frío respetó
**25/36 Pistas evaluadas (69,4%)** y Codex con Lore respetó **33/36 (91,7%)**: +22,3 puntos, sin
empeorar ninguna tarea. Extensiones sintéticas de escritura y UPGRADE ampliaron el protocolo más
allá de un solo fixture web.

En los tres protocolos, Lore respetó **48/52 Pistas al primer intento frente a 29/52**. Con una
corrección controlada, alcanzó **52/52 metas frente a 39/52**, consumiendo menos intentos y menos
tiempo observados. El benchmark publica transcripts crudos, graders deterministas, cortes bruto y
auditado, regresiones y la frontera exacta de cada afirmación en [`bench/`](../bench/).

**Frontera declarada:** un modelo, un nivel de esfuerzo, una máquina, tareas sintéticas y el mismo
investigador construyó Lore, fixtures y graders. Mide cumplimiento de una Pista por tarea, no
correctitud integral del entregable, ahorro universal ni un IME validado.

</details>

<details>
<summary><b>Caso 09 — La forma devuelta al caso del que salió</b></summary>

<br>

Dos capacidades de esta versión —el bloque siempre-activo y la constitución-puntero— se generalizaron
desde **un solo caso** y se dieron por terminadas sin volver a aplicarse sobre él. Devolverlas a ese
caso produjo **cinco defectos, ninguno detectable leyendo los archivos**.

El reparto es el hallazgo, no el número: **dos defectos los encontró la forma en el caso y tres los
encontró el caso en la forma** —incluido el más caro, que una plantilla que media entre dos kits no
dijera nada sobre quién puede escribir en el repositorio—. Generalizar es una operación con pérdida en
las dos direcciones, y ninguna de las dos se ve desde el lado en que uno está parado: leyendo solo la
forma no se ve lo que le falta, porque está completa respecto de sí misma.

La práctica que deja es barata y mecánica: **antes de publicar una generalización, superponerla sobre
el caso del que salió y anotar las diferencias en las dos direcciones.** Las que van forma → caso son
defectos del caso; las que van caso → forma son las que se iban a publicar.

**Frontera declarada:** un constructor, una máquina, un repositorio sin código, cero ciclos completados
del segundo kit y el auto-sellado más fuerte de la serie —el autor del kit, el del caso y el operador
son la misma persona—. La vara se fijó tarde y cubre solo uno de los tres tramos, cosa que el caso
declara en vez de disimular.

</details>

<details>
<summary><b>Caso 10 — El kit usado un día entero contra un Lore vivo, mientras se medía a sí mismo</b></summary>

<br>

El origen no fue una hipótesis: fue una nota de enojo. *«No me están gustando para nada los resultados de los copy… al final termino yo haciendo los copy a mano.»* Un área de community management con Lore completo, criterio destilado y método escrito, produciendo trabajo que su dueño desechaba. **El destilador saltándose su propio sistema es la única medición que importaba**, y estaba en rojo.

De ese día salieron `PRUNE`, `TRANSPLANT` y el umbral. Pero lo que el caso aporta no son las capacidades: es lo que se vio al usarlas.

- **El defecto no era criterio malo: era criterio correcto acumulado.** Escribir un post de cinco líneas cargaba ~797 líneas de criterio activo. Ninguna Pista estaba refutada, ninguna ley sobraba por separado, y **cada una se veía bien leída sola**. Se detecta contando artefacto contra contenido —~120 líneas de aparato alrededor de 5 de copy—, nunca leyendo archivos. Es la clase de hallazgo para la que `Missing`/`Superseded`/`Earned` no tenía casilla, y por eso `PRUNE` trajo `Crowding`.
- **Podar bien un Lore así lo deja MÁS grande.** El corpus terminó 35 líneas por encima y el aparato del entregable bajó de ~120 a ninguna. Cuatro de seis hallazgos fueron `Crowding`, y reparar un `Crowding` es *agregar* una frontera, un destino o un techo. **Medido por tamaño de corpus, la reparación correcta se reporta como fracaso** — y el incentivo pasa a ser borrar criterio ganado. La skill afirmaba lo contrario esa misma mañana y su primera corrida la desmintió.
- **El umbral protege a las skills y nada protege al editor de texto.** Ese día se escribieron 241 líneas de criterio nuevo en un Lore que se había diagnosticado por fronteras ausentes ocho horas antes. Produjeron **una**. `save-to-lore` las exige si se lo invoca; `UPGRADE` las atrapa meses después; abrir el archivo y escribir no tiene ninguna puerta, y es el camino por donde pasa casi todo. **El defecto sobrevivió al mejor caso posible** —el autor de la regla, el mismo día, con la regla fresca—, así que es del mecanismo y no de la disciplina de nadie.
- **La omisión entre dos kits corre en las dos direcciones.** El Caso 09 mostró que el ciclo puede correr sin consultar el criterio. Acá pasó lo inverso: el criterio corrió sin consultar el ciclo, y la versión ganó tres capacidades mientras su spec seguía describiendo dos. Nada falló y nada avisó, **porque un spec desactualizado se ve idéntico a uno vigente**.
- **Una herramienta no es neutral por ser útil.** Un revisor de escritura de terceros marca los emoji y las ráfagas de frases cortas como tics de máquina. La marca cuya voz destilada se construye sobre esos dos recursos lo corrió en seco: la habría borrado teniendo razón en todo menos en ese corpus. `TRANSPLANT` cubría el criterio que llega como documento; el que llega como **herramienta que se invoca** no lo cubría nadie.

**El hallazgo que ninguna de las cinco viñetas contiene, y es el más importante:** casi todos esos defectos los encontró **el dueño del proyecto, no el kit ni el agente**. El revisor que no estaba corriendo, los saltos de línea que la superficie de almacenamiento destruía, el ruido que se colaba de vuelta bajo cada entrega, la forma de estrofa de las publicaciones que sí habían rendido. El kit no tiene ningún mecanismo que hubiera atrapado eso, y llamarlo «supervisión humana» sería suavizarlo: **el instrumento pasó el día equivocándose y el humano fue el único detector.**

**Frontera declarada, y es la más ancha de la serie.** Un operador, una máquina, un área, un día. La medición terminal —*«ya no siento que los tengo que hacer a mano»*— llegó de una sesión **interactiva**, mientras los copies que originaron la queja salieron de una corrida automática sin nadie presente: **la variable más grande que cambió no es el Lore, es que había alguien mirando**, y separarlas exige una corrida desatendida que todavía no ocurrió. Añádase el auto-sellado del Caso 09, intacto: autor del kit, autor del caso y operador siguen siendo la misma persona.

</details>
---

> Los casos que **refutan** algo son los que más sirven. La [discusión del repositorio](https://github.com/andresanemic/lore-plugin/discussions) es el lugar.
