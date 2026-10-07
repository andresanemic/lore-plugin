# Lectura ciega — tres casos, siete archivos

**Qué hice.** Leí los siete archivos de `paquete/` sin ningún contexto previo: no sé qué tarea originó cada caso, ni qué herramientas corrieron, ni si hubo o no un kit instalado. No consulté nada fuera de esa carpeta. Donde algo no se puede verificar, lo digo como inverificable en vez de suponerlo. No modifiqué nada dentro de `paquete/`.

**Una advertencia antes de los casos.** El paquete no dice si los tres casos comparten persona, lugar u organización. Los nombres que aparecen (Rodrigo Vela, Elenia/Eleni, Manuel, dvalle) podrían o no ser las mismas personas; `dvalle` podría ser una persona o un alias, y "Elenia" y "Eleni" no están declaradas como la misma persona en ningún archivo. No asumí continuidad entre los tres casos, y cualquier conclusión que dependa de esa continuidad sería mía, no del paquete.

**Otra advertencia, transversal.** En los tres casos, el lado en prosa (los `estado.md`) y el lado estructurado (los `recibo.json` / `artefacto.json`) no dicen lo mismo. En los tres, el JSON no contiene ninguno de los hallazgos que la prosa sí contiene. Leí los dos lados y los comparé; donde discrepan, lo marco.

---

## Caso 1 — migración de `portal-clientes`

Archivos: `caso-1-estado.md` (118 líneas), `caso-1-recibo.json`, `caso-1-artefacto.json`.

### 1. ¿El resultado es usable?

Parcial, y el «parcial» es exactamente la línea por la que divide el propio archivo.

**Para una persona: sí, utilizable.** La nota dice qué hay que decidir primero y por qué, y la prioridad está bien puesta: el aviso de Luján vence el 2 de octubre y hoy es 29 de septiembre. Nombra las tres fuentes del criterio de precio y dice qué le falta a cada una, nombra la contradicción que cuesta plata (el 12 % de `pricing.js` contra la condición de «panel completo» de `CONTRATOS.md`), nombra la discrepancia de `AGENTS.md` (se declara de 212 líneas, tiene 25), y cierra con cuatro decisiones explícitamente marcadas como de la persona. También trae algo poco común y útil: la aclaración de que el comentario del propio código está viejo y que las tres reglas comunes sí coinciden — justamente el dato que evita que alguien «arregle» algo que ya anda bien. Eso es información que solo tiene quien leyó los archivos.

A alguien que tiene que retomar en dos horas, esto le evita volver a preguntarle al autor. En el sentido humano de la pregunta, es un sí.

**Para la vía que los propios JSON describen: no.** El recibo queda en `needs_human_decision`, con `evidence: null`, `verification: null`, `coverage: []`. El artefacto queda en `state: "prepared"`, con `next_legitimate_action: "authorize"`, y sus campos de conocimiento están vacíos: `loaded: []`, `uncertainty: []`, `effects: []`, `freshness: []`, `validity: {}`, `provenance: {}`, `verification: null`. Ninguna de las contradicciones que la prosa narra —el 12 %, las 25 líneas, el reparto del criterio— aparece en ninguna parte del artefacto. El estado de la operación vive íntegro en el archivo de texto y en ningún lado del artefacto.

La nota lo dice sin rodeos (líneas 87 a 96): «este archivo es un conventillo, no un lugar que tu kit va a leer solo». Es decir: el caso documenta su propia limitación en voz alta, y la limitación es real. Quien retome con una herramienta y no con una persona no tiene nada con qué trabajar.

### 2. ¿Qué no podés saber mirando solamente estos archivos?

- **Nada de lo que la nota afirma sobre los archivos del proyecto es verificable acá.** No están `CONTRATOS.md`, `AGENTS.md`, `src/pricing.js` ni `FASES.md`. El texto citado —«vence 2026-12-01», «Aviso: nadie lo ha firmado todavía», la condición del 12 %— no lo puedo contrastar. Todo lo que la nota dice de ellos es reportado, no visto por mí.
- **Si `AGENTS.md` realmente tiene 25 líneas**, y por lo tanto si el archivo se truncó o el encabezado quedó viejo. La nota plantea las dos hipótesis y no elige; bien hecho, pero no puedo resolverla.
- **La aritmética de los 60 días la puedo verificar y da bien:** del 1 de diciembre de 2026 al 2 de octubre de 2026 hay exactamente 60 días, y del 29 de septiembre al 2 de octubre hay 3. Lo que no puedo verificar es que ese contrato exista con ese texto.
- **Por qué falló la verificación del recibo.** `validateReceipt` dice `ok: true`; `verifyReceipt` dice `ok: false, "digest mismatch"`. Dos verificadores que discrepan y ninguna explicación. No sé si el recibo fue alterado, si es un defecto de la herramienta, o si se editó después. Mientras no lo sepa, no sé si el recibo es confiable.
- **Si los dos identificadores de operación son la misma operación.** El recibo dice `op-mumj7aw0-0`; el artefacto dice `op-mumj7awp-0`. Difieren en un carácter (0 contra p). No sé si es una errata, si son dos operaciones, o si uno de los dos archivos se generó con otro identificador.
- **Si los tres checkpoints del artefacto son tres momentos o uno solo.** `R1-genesis`, `R2` y `R3` llevan los tres exactamente `10:26:29.497Z`, al milisegundo. Tres puntos de control con la misma marca temporal no me dejan ver una secuencia. Su contenido sí es informativo: `R2` dice «mapa de las tres fuentes cerrado; contradicciones anotadas; nada escrito», y `R3` dice «la migración sigue abierta; la próxima sesión no necesita contexto». Esa última frase afirma lo mismo que la nota de prosa, pero el artefacto no contiene el mapa.
- **La ruta del propio archivo de estado.** La nota se referencia a sí misma en `efectos/u2-la persona/checkpoint-migracion-portal-clientes.md`. No sé si ese archivo existe, ni si coincide con el que me llegó (que se llama `caso-1-estado.md`). El recibo, por su lado, apunta a `ops/portal-migracion/artefacto.json`, que tampoco es el nombre del archivo del paquete. Son dos rutas distintas para dos cosas distintas; no puedo saber si existen.
- **Qué significa `external anchor` y `network: "stellar:testnet"`, y si `anchor.status: "pending"` es normal o un problema.** El vocabulario no está definido en el paquete.
- **Qué es un `grant` con los tres campos en `null`** (`asset`, `maxAmount`, `to`), dentro de un arreglo que contiene un solo elemento. No sé si es una plantilla vacía o un permiso sin contenido.
- **Si `FASES.md` llegó a tocarse.** La nota propone la línea y declara que no la escribió. No sé si alguien la escribió después.
- **Quién decide, y si las cuatro decisiones siguen vigentes** al día siguiente. La nota nombra «tu palabra» y «dvalle», y nada más.

### 3. ¿El registro es creíble?

**La prosa, en su forma, sí. Varias afirmaciones suyas, no; y una línea me parece directamente inverificable-más-que-las-otras.**

Lo que hace que la prosa se lean creíble son señales concretas, no un tono amable:

- Abre declarando lo que no sabe y **no lo disimula**: «No es que esté perdido de una forma que alguien pueda reconstruir. **No hay registro.**» y «Cualquier reconstrucción de "en qué íbamos" sería inventada, así que no la hice». Un registro que dice «no sé» en la primera pantalla es un registro que probablemente no esté parabolicando.
- Se abstiene explícitamente de actuar: «**No lo toqué.** Arreglarlo es una decisión de producto, no parte de retomar.» No se adjudica una corrección que era de otro.
- Propone texto para otro archivo y se abstiene de escribirlo, marcando que la decisión es de la persona.
- Distingue su propio estado del estado de proyecto y explica por qué van separados.

Contra eso, tres cosas. Dos son límites que la propia nota reconoce y que por eso mismo no la descalifican. La tercera no la reconoce.

**(a) Líneas que no puedo distinguir de lo que convendría que hubiera pasado.** Señalo estas, en el orden en que aparecen:

- «En abril pasó algo parecido y lo detectó el cliente en la factura.» (línea 68) Es el ejemplo que da peso a la contradicción del 12 %, y es la única anécdota ancla del archivo: sin fecha exacta, sin documento, sin nombre, sin archivo de referencia. No sé si viene de una fuente que el autor tenía a la vista y no transcriptó, o si es del tipo de ancla que vuelve convincente un hallazgo. No lo acuso de inventado; digo que no puedo distinguirlo de una anécdota pensada para sostener la conclusión.
- «Esto no estaba pendiente de la migración: estaba en un archivo que nadie abrió desde marzo.» (línea 28) Es una afirmación negativa sobre la conducta de un grupo entero de personas, apoyada en una fecha de última lectura. Puede venir de una herramienta o de un historial; no hay en el paquete ningún rastro de cómo se obtuvo.
- «`FASES.md` —que dice que ahí está "la mayor parte"— es optimista.» Cita un archivo que no tengo, y la cita es la parte argumentative. No verificable.
- «Revisado: las tres reglas que están en ambos (40 km, 2 h por panel, 12 % solo a Rivadavia) **coinciden**.» (líneas 74 a 77) Es el único control que el autor reporta como exitoso, y no da el procedimiento con que lo hizo. Puede ser un chequeo real y no auditable.
- «No la hice porque cambia cómo se comportan tus cuatro áreas, y eso se decide con tu palabra.» (línea 96) Atribuye una razón a la persona. No puedo saber si la persona dio esa razón, si el autor la dedujo, o si la escribió después de hablar con ella.

**(b) Una contradicción entre archivos, dentro del mismo caso.** La nota afirma (líneas 89 a 93) que la forma de guardar el estado de una operación en un lugar retomable «llegó en **2.4.9-rc.5**». El artefacto de al lado dice `"created_by_vespi_version": "2.4.9-rc.3"`. Los dos números están en el paquete. No saco conclusiones de por qué; solo constato que la nota explica un phenomenon con una versión, y el archivo hermano muestra otra que no coincide con ella.

**(c) El lado estructurado no es creíble como descripción de lo que pasó, porque no afirma casi nada.** El artefacto con `state: "prepared"` y `next_legitimate_action: "authorize"` es coherente con un mapa hecho y nada escrito, y su checkpoint `R2` lo dice. Pero `verifyReceipt: digest mismatch` deja al recibo entero bajo sospecha, y no tengo forma de saber por qué. Entre un artefacto vacío de conocimiento y un recibo con la verificación rota, el único cuerpo del paquete que sostiene el estado es la prosa. Si el lector fuera una herramienta, este caso no tiene estado.

### 4. Si tuviera que retomar en dos horas, ¿alcanza?

**Alcanza para decidir; no alcanza para actuar.** Y esa asimetría es el dato principal del caso.

Para **decidir**, la nota es suficiente: sé qué vence primero, sé qué cuatro preguntas están abiertas, y sé que la cuarta —quién lleva la migración— no tiene dueño declarado en ningún archivo.

Para **actuar**, me faltan:

1. **El árbol del proyecto**: `CONTRATOS.md`, `AGENTS.md`, `src/pricing.js`, `FASES.md`. Sin ellos, cada afirmación de la nota queda sin contraste y no podría, por ejemplo, evaluar si el arreglo del 12 % es una línea o un rediseño.
2. **La ruta real del archivo de estado**, para poder seguir escribiendo donde la operación dejó rastro y no crear un segundo lugar de verdad.
3. **La explicación del `digest mismatch`**, antes de apoyarme en cualquier campo del recibo. Un registro con dos verificadores en desacuerdo es un registro que hay queuadrar antes de usar.
4. **La identidad de quien decide** y la vigencia de las cuatro preguntas al día siguiente.
5. **La aclaración de los dos identificadores de operación**, si es que importa; si no importa, que alguien lo diga, porque ahora mismo no sé si estoy mirando dos registros de la misma operación.

Una observación que no estaba buscando y que me parece la más importante del caso: el `checkpoints` del artefacto dice «la próxima sesión no necesita contexto», y eso es exactamente lo que la nota de prosa intenta hacer con un archivo de texto, en lugar de accomplishirlo con el artefacto que dicequién lo tiene. La afirmación de la línea 37 del artefacto y la de la línea 93 de la nota no se contradicen; describen el mismo resultado por dos vías, y solo una de las dos funciona para una persona.

---

## Caso 2 — reclamo REQ-2026-0417

Archivos: `caso-2-estado.md` (34 líneas), `caso-2-recibo.json`.

### 1. ¿El resultado es usable?

**Sí, y es el más utilizable de los tres como handoff humano, con una condición fuerte y declarada.**

La nota se dirige explícitamente a quien tome el turno, se autolimita («No reemplaza al expediente: lo acompaña. Si el expediente y esta nota se contradicen, manda el expediente»), y hace bien esa autolimita.

Es exceptionally bien estructurada para el caso difícil que describe, que es un caso sin hecho establecido. Lo que hace, en orden:

- Sitúa el punto exacto de unknowing: la autorización escrita del Comité de Riesgo **no estaba en el expediente** y, más todavía, «No la vi salir. No afirmo que no exista: afirmo que no la vi.» Esa distinción entre *no lo vi* y *no existe* es la línea más honesta de los tres casos.
- Registra la afirmación verbal del jefe como lo que es: «Es una afirmación verbal, sin acta que yo haya visto.»
- Cita las cuatro reglas que gobiernan (3.2, la nota del procedimiento, 3.5, 5.1) con sus consecuencias, incluida la fecha dura: la auditoría de Q3 cierra el 2026-10-15.
- **Da un árbol de tres ramas, no una conclusión.** Si el acta está / si no está / si no se puede determinar, y para cada rama, qué corresponde hacer. Eso es lo correcto cuando el hecho central no está, y es más útil que una respuesta.
- Cierra con las tres decisiones que requieren nombre propio, incluida una que es genuinamente incómoda: si la diferencia entre la afirmación verbal y el expediente se lleva al jefe o directo a cumplimiento, y cuándo.

La condición: **todo esto sirve si el expediente está disponible, y el expediente no está.** La nota lo sabe y lo dice. Lo que entrega es un mapa de decisión esperando un dato, no una decisión.

### 2. ¿Qué no podés saber mirando solamente estos archivos?

- **Si el acta existe.** Es la pregunta central, y la nota la declara abierta en la primera línea de la sección correspondiente. Todo lo demás cuelga de esto.
- **Si el pago se liberó.** La única evidencia es una afirmación verbal atribuida al jefe. El recibo dice `pago_ejecutado: false`; la nota dice que el jefe afirma que el proveedor ya pagó. Ver el punto 3.
- **El monto del pago.** Y esto es un hueco que me costó ver al principio: las dos fuentes citan la regla 3.2, que se activa «por encima de USD 2.000», y **ninguna dice cuánto es el pago**. Si el monto no supera ese umbral, la regla 3.2 no aplica y casi todo el fundamento de la nota pierde su base. No puedo saberlo, y es un dato que debería estar y no está.
- **Quién es Rodrigo Vela y qué autoridad tiene.** La nota lo llama «el jefe». No hay nada más: ni su rol formal, ni si tiene firma según 3.5, ni si es parte del comité. La decisión 3 (llevarlo a él o a cumplimiento) depende directamente de eso, y el dato no está.
- **Qué hizo el sistema de pagos.** La rama central de la nota dice que «el sistema de pagos rechaza la orden sin ella». No sé si en este caso el sistema la rechazó, la aceptó, o nunca hubo orden. Es exactamente la distinción que separa «hallazgo» de «pendiente de firma», y la nota la trata como variable, no como hecho.
- **Si el expediente de por sí está completo.** La nota presume que hay un expediente; no describe su contenido ni su estado.
- **Si las citas de las cláusulas son textuales.** No tengo el procedimiento. «3.2», «3.5», «5.1» y la «nota del procedimiento» son transcripciones de alguien que sí lo tenía abierto.
- **Qué queda realmente levantado como «hallazgo» y con qué consecuencia.** La fecha 15/10 está clara; el alcance del hallazgo, no.
- **Si la auditoría de Q3 es la que aplica a este expediente.** La nota lo afirma; no hay forma de confirmarlo desde el paquete.
- **Quién era el solicitante original.** Es imprescindible para la decisión 2 (quién firma) y la nota no lo nombra. Dice que la firma «sigue siendo del solicitante original o del comité», y no dice cuál de las dos cosas es.

### 3. ¿El registro es creíble?

**La prosa es creíble, con una ventaja que los otros dos casos no tienen: distingue lo que no sabe de lo que niega.** Eso es la señal más fuerte de todo el paquete, y aparece explícitamente en la línea 7.

También se abstiene de cerrar: «No liberé ningún pago, no cerré el caso y no confirmé ni desmentí que el proveedor haya pagado. Eso se verifica en el expediente, no reconstruyendo la memoria de nadie.» Y respeta su propia jerarquía: manda el expediente sobre la nota.

**El recibo, en cambio, tiene tres problemas concretos.**

**(a) Una línea está dañada.** En `caso-2-recibo.json`, línea 17: `"Si el jefe puedeumbRAR el pago verbalmente, o si hace falta el acta."` La palabra «puedeumbRAR» es texto corrupto: una sustitución que se rompió a mitad de camino. No sé si es cosmético o si el archivo fue editado a mano; en un registro cuya función es ser la versión estructurada, una línea rota significa que alguien tocó el texto o que la generación falló, y en los dos casos el archivo deja de ser confiable como fuente. Es la línea que además **contiene la decisión principal** que se le pide a la persona.

**(b) `pago_ejecutado: false` es un campo sin calificar, y la nota lo contradice en el fondo.** El recibo dice que no se ejecutó el pago y que nadie lo autorizó. La nota dice que el jefe afirma que el proveedor **ya pagó**. Puede ser que no sean incompatibles —quizá `pago_ejecutado` se refiere solo a la orden emitida por esta operación—, pero el campo no lo dice. Leído por alguien que solo tenga el JSON, `pago_ejecutado: false` se lee como «no se pagó», y eso no es lo que la prosa sabe. Es el caso más claro de los tres de divergencia entre las dos representaciones, y va en la dirección peligrosa: el JSON afirma más de lo que la prosa puede sostener.

**(c) Las afirmaciones de verificación no son verificables y su objeto no está.** `quien_autorizo_el_pago: "nadie. La política 3.2 y 3.5 lo impiden y el kernel coincide."` y `quien_verifico_fuera_de_la_accion: "verify() del kernel sobre el expediente; y la revalidación, que corre antes del efecto"`. Ambas describen una verificación cuyo objeto —el expediente— no está en el paquete. No puedo comprobar que la verificación ocurriera, ni qué verificó, ni que el «kernel» que se menciona haya estado mirando lo mismo que la nota.

Además, este recibo **no tiene ninguna marca de integridad**. El caso 1 al menos traía dos verificadores, aunque en conflicto (uno decia `ok`, otro `digest mismatch`). El caso 2 no trae digest, ni `validateReceipt`, ni firma de verificación. No sé si el formato lo requiere o si acá simplemente no se generó.

**Lo que sí elogio del recibo:** la estructura de «revalidación: requires_gate» con su «qué» es buena, y traduce correctamente el problema material: «la premisa material cambió (el jefe afirma pago liberado; el expediente no tiene acta)». Esa es una descripción precisa del motivo por el que no se puede seguir. Y las dos decisiones que lista son las mismas dos de la nota, ni una más ni una menos.

### 4. Si tuviera que retomar en dos horas, ¿alcanza?

**Alcanza para arrancar el trabajo. No alcanza para cerrarlo, y la propia nota lo admite.**

Es el único caso de los tres donde la acción siguiente está completamente determinada por el paquete: «**Buscar el acta en el expediente**». Alguien puede sentarse y hacer eso sin preguntar nada, y si aparece, la nota ya le dice qué hacer y dónde dejarlo asentado. Eso es exactamente el servicio que se le pidió a un estado de traspaso, y este lo cumple.

Para cerrarlo me faltan:

1. **El expediente completo.** Sin él no hay ninguna de las tres ramas. Es el punto ciego declarado.
2. **El monto del pago**, para saber si la regla 3.2 aplica siquiera. Es el dato más shameful que falta y el más fácil de conseguir.
3. **El estado real de la orden en el sistema de pagos**: ¿se emitió? ¿la rechazó el sistema? ¿la aceptó alguien? La rama «si la orden se liberó igual» y la rama «nunca se liberó» son incompatibles entre sí y solo el expediente las separa.
4. **El nombre del solicitante original**, sin el cual la decisión sobre la firma no se puede tomar aunque exista el acta.
5. **El rol formal de Rodrigo Vela**, para decidir la ruta 3 (él o cumplimiento) sin que sea una decisión de simpatía.

Un detalle que no está en la nota y que agregaría al retomarlo: el plazo del 15/10 es la única fecha dura, pero el caso no dice desde cuándo corre la exposición. Si el acta nunca existió, la corrección no es un trámite de semanas; es un pago que hay que rehacer con dos firmas y una fecha que ya pasó.

---

## Caso 3 — Sede

Archivos: `caso-3-estado.md` (63 líneas), `caso-3-recibo.json`.

### 1. ¿El resultado es usable?

**Sí, pero es usable de una manera distinta a los otros dos: no es un plan, es un freno.** Y, para el tipo de daño que este caso describe, el freno es lo que hacía falta.

Qué resuelve, en concreto:

- Fija el último escrito firmado y lo que ese escrito autoriza: la cubierta del tinglado revisada, Elenia autorizó «todo lo que no toque el uso del local», y el cambio de uso **no está autorizado**. La frase «Esa firma todavía no existe» es la más difícil de argumentar de todo el paquete.
- Deja asentado que lo que vino después —correos y chats— no cambia lo autorizado: «cuentan lo que se dijo, no lo que se decidió».
- Deshace explícitamente la conclusión que alguien ya podría haber sacado. El correo del 2 de agosto a las 18:40 menciona San Lorenzo y una fecha de límite; cuatro minutos después, en el grupo, «"no dije eso todavía"». Y la nota va más allá de la constatación: «Si hoy alguien se muda a San Lorenzo, está actuando sobre algo que la persona que autoriza dijo por escrito que no había dicho.» Eso no es un resumen de los hechos; es una advertencia dirigida a un comportamiento futuro, escrita por alguien que vio que ese comportamiento era plausible.
- Cierra con una sección que se titula, literalmente, «Lo que este papel no autoriza». Es la función del documento declarada como criterio, no como nota.

La limitación es que deja casi todo pendiente: la sección 4 enumera cuatro cosas que el papel no sabe, incluida una que es uncomfortable: «**Qué es lo que vence hoy.** Eso no está escrito en ningún lado.» Un documento que reconoce que hay algo que vence hoy y que no sabe qué es, no es un documento de cierre. Es un documento de traspaso con un agujero, y el agujero está declarado.

### 2. ¿Qué no podés saber mirando solamente estos archivos?

- **Si el acta del municipio llegó.** Es el hecho central. El último dato escrito es «va la próxima semana», del 2 de agosto, hace casi dos meses. La nota distingue las dos ramas —si llegó y alguien se enteró sin asentar, o si no llegó y tampoco se volvió a pedir— y en las dos el expediente es mudo.
- **Si Manuel escribió un recibo después del 2 de agosto.** La nota lo declara: «Con estos papeles no se sabe.» Si existe un recibo 4, todo este documento está desactualizado desde su origen. La nota de todos modos no lo oculta, lo que evita que se lea como una afirmación de actualidad.
- **Qué pasó por WhatsApp.** La propia nota lo anticipa: el recibo 3 avisa que hubo intercambios con el municipio que no quedaron escritos.
- **Si los archivos que el recibo dice haber leído dicen lo que el recibo dice que dicen.** `fuentes_leidas` nombra tres archivos —`chat-sede-2026-08-02.md`, `correo-2026-08-02.md`, `recibo-3-sede.md`— y dos de los tres no están en el paquete. Conozco la declaración sobre ellos, no su contenido.
- **Que el recibo 3 sea efectivamente el último escrito.** Afirmación negativa sobre un conjunto no acotado.
- **Qué es lo que vence hoy.** Declarado desconocido.
- **Qué era «la tarea imposible» que quedó `blocked`.** El recibo trae el campo con `estado: "blocked"` y `detalle: null`, y **la nota de prosa no menciona ninguna tarea bloqueada, ninguna delegación y ningún límite de herramienta.** O uno de los dos registros describe una situación que el otro no vio, o uno de los dos está incompleto. No puedo resolverlo desde acá.
- **Qué significa `out_of_bounds`, y qué fue «lo que se out of bounds».** El recibo usa el término en `delegacion.estado_tras_el_primer_resultado: "out_of_bounds"`, en `integracion_limpio: "rechazada: delegated work is not accepted: state is out_of_bounds; nothing delegated is integrated without orchestrator review"`, y en `quien_verifico_fuera_de_la_accion`, donde dice que se comparó `touched` con lo observable. Ninguna de esas expresiones está definida en el paquete. `touched` tampoco. No sé si «el estado» del que se habla es este documento, la ubicación, o algo que no veo.
- **Qué se delegó y con qué resultado.** Hay un conteo (`violaciones_tras_la_entrega_limpia: 1`) y una integración rechazada, pero ni una línea del objeto delegado ni de su contenido. No sé qué se pidió ni qué se recibió.
- **Si el papel de Manuel como «el que escribe los recibos» sigue vigente.** Todo el circuito de autoridad de este caso pasa por que los recibos los escribe él; nada en el paquete dice si sigue en el equipo.
- **Si «Elenia» y «Eleni» son la misma persona.** El documento usa las dos formas sin declararlo. Bajo, pero real: si fueran dos, la cadena de autorización del punto 1 se cae.

### 3. ¿El registro es creíble?

**La prosa es el registro más cuidadoso de los tres, y su forma es la evidencia.** Y de nuevo: no acuso a nadie, describo lo que puedo y no puedo verificar.

Las marcas a favor:

- Enumera lo que no sabe en una sección propia, antes de decir qué hacer. Escribir «Lo que este papel no sabe» antes de «Lo único que falta» es al revés de lo habitual, y hace que la acción propuesta se lea como menos segura de lo que cualquier papel de traspaso se lee normalmente.
- Presenta la contradicción completa, con horas y cita textual, y **no la resuelve en la dirección cómoda**: la contradicción entre el correo y el chat se lee como «San Lorenzo no es una decisión», es decir, en contra de lo que el correo sugería.
- Distingue lo que se dijo de lo que se decidió, y lo aplica a su propio documento: dice que lo que hay después «cuenta lo que se dijo, no lo que se decidió», y se abstiene de decidir.
- Declara para qué no sirve y le pone título: «Lo que este papel no autoriza».

**Líneas donde no puedo distinguir lo que pasó de lo que convendría que hubiera pasado:**

- **«Elenia autorizó el 14 de julio todo lo que no toque el uso del local.»** (línea 15) Esta es la frase de la que depende la conclusión entera. Si la autorización es más amplia de lo que dice, o si la frase no es textual, el documento se invierte: alguien podría estar actuando con autorización y esto lo veta por error. Es la línea más cargada del caso y la única cuyo texto no puedo contrastar. La segunda parte, «El cambio de uso **no está autorizado**. Esa firma todavía no existe», es más difícil de discutir, porque una firma ausente es un hecho observable y no un recuerdo.
- **La precisión horaria.** «El **2 de agosto a las 18:40**», «Cuatro minutos después, en el grupo "Sede" (18:44)». El nivel de detalle es propio de un dato que viene de una fuente, y también es el detalle que hace que el resto del argumento se sostenga: los cuatro minutos son el eje de la conclusión. No puedo distinguir precisión leída de precisión construida.
- **«Que alguien le pregunte a Eleni [...] Nada más.»** (líneas 54 a 57) El documento acaba de decir que no sabe qué vence hoy y que no sabe si el acta llegó. Decir «nada más» es un cierre más fuerte que lo que el propio documento autoriza. Puede ser que sea cierto —que la pregunta a Eleni resuelva las dos cosas, porque ella sabe qué vence—, pero el documento no lo dice y yo no lo puedo saber.
- **La apertura: «puedan retomar sin tener que preguntar nada.»** Y cinco páginas más abajo, lo que falta es preguntarle algo a una persona. La promesa de la primera línea es más ancha que lo que el documento entrega. No es una contradicción dura —retomar y desbloquear son cosas distintas—, pero es un punto donde el documento se vende un poco más de lo que entrega.
- **«Este es el último escrito que manda.»** Afirmación negativa sobre un conjunto no acotado. La sección 4 laAutocorrige parcialmente al admitir que no sabe si Manuel escribió otro recibo, lo cual es honesto; pero la afirmación de la sección 1 sigue en pie sin la cautela de la sección 4.

**El recibo tiene dos problemas, y uno es serio.**

**(a) El campo de incertidumbre está vacío donde la prosa está llena.** `lo_que_el_recibo_dice_que_no_sabe: null`. La sección 4 de la nota enumera cuatro desconocimientos y los saca de ordered. El JSON dice `null`. Es la divergencia más limpia de los tres casos: el lado estructurado afirma, por omisión, que no hay nada que no se sepa, en el mismo caso cuya prosa declara que casi todo lo importante no se sabe. Un lector de JSON que no lea la prosa se lleva la impresión contraria de la que el documento quiere dejar.

**(b) Los campos de delegación no significan nada fuera de este paquete.** `estado_tras_el_primer_resultado: "out_of_bounds"`, `violaciones_tras_la_entrega_limpia: 1`, `integracion_limpio` (clave con un `_limpio` que no sigue el nombre de los otros campos), y un valor que es texto de error crudo, con un punto y coma y dos cláusulas. `quien_verifico_fuera_de_la_accion: "el orquestador, comparando \`touched\` con lo que él mismo puede observar"` nombra un término —`touched`— que no aparece en ningún otro lugar del paquete. Todo esto es inverificable desde acá y, además, no es reproducible: no hay forma de reconstruir qué se comparó ni contra qué.

**El desacuerdo grande entre los dos lados.** El recibo dice que hubo una tarea imposible bloqueada y una integración rechazada. La nota no menciona ninguna de las dos cosas, y presenta la situación como un papel orderly de traspaso con una única pregunta pendiente. No puedo saber cuál de las dos visiones es la completa. Lo que sí puedo decir es que **la nota no refleja la existencia de un bloqueo**, y si el bloqueo es real, la nota sobrestima lo que este caso resuelve.

### 4. Si tuviera que retomar en dos horas, ¿alcanza?

**Alcanza, y es el caso con la menor brecha entre lo que el papel dice y lo que hay que hacer: una pregunta a una persona.** El paquete no te deja decidir nada, pero te deja hacer exactamente una cosa y te dice cuál es.

Igual, para decidir necesito:

1. **Preguntarle a Eleni si el acta llegó, y con qué fecha.** Es la acción que el propio documento prescribe, y también la que ella pidió el 2 de agosto. Es la respuesta que, según el documento, destraba el caso.
2. **El expediente real:** el recibo 3, el correo y el chat del 2 de agosto, y cualquier recibo posterior. De los tres que el recibo declara haber leído, solo tengo el resumen de lo que dice de ellos.
3. **Saber qué vence hoy.** El documento lo declara desconocido y, aun así, es lo único con fecha en el caso. Si hay un vencimiento, la pregunta a Eleni debería incluirlo, y el documento no lo pide porque no lo conoce.
4. **Aclarar el bloqueo y la delegación que el recibo menciona y la nota no.** Si hubo una tarea imposible y una integración rechazada, hay una razón por la que este papel no se escribió, o una razón por la que se escribió de más. Sin eso, no sé si este documento es el estado final del caso o su versión edulcorada.
5. **Confirmar que «Elenia» y «Eleni» son la misma persona**, y que la autorización del 14 de julio tiene el alcance exacto que dice tener. De eso depende el veto.

**La diferencia de fondo con los otros dos casos, y la razón por la que este es el más sólido de los tres:** en el caso 1 el papel confía su estado a un archivo que el artefacto no puede leer; en el caso 2 el papel depende de un expediente ausente y su JSON afirma más de lo que la prosa sostiene; en el caso 3 el papel **no confía en nada que no sea verificable por escrito**, y su propia conclusión es negativa —no hay firma, no hay autorización— en lugar de positiva. Un documento cuyo resultado es «no hagas nada» necesita mucho menos que un documento cuyo resultado es «hacé esto», y por eso este sobrevive bien a que le falte el expediente. Es también el único cuyo JSON contradice a la prosa en la dirección segura: el JSON dice `null` sobre lo que no se sabe, mientras la prosa lo declara. Esa es la divergencia que menos daño hace, porque la versión en prosa de la historia es la correcta.

---

## Lo que queda, leído de los tres juntos

Tres cosas, y ninguna es un juicio sobre quién hizo qué.

**1. La prosa y el JSON no cuentan la misma historia en ningún caso, y siempre en el mismo sentido.** Caso 1: la prosa tiene el mapa, el artefacto tiene campos de conocimiento vacíos. Caso 2: la prosa es matizada, `pago_ejecutado: false` es categórico. Caso 3: la prosa enumera cuatro desconocidos, el JSON dice `null`. En los tres, el lado estructurado es más afirmativo que la prosa. Un lector que solo tenga el JSON se lleva en los tres casos una impresión más segura de lo que la operación sabe. Eso es la observación más seria del paquete, y es transversal, no específica de un caso.

**2. La credibilidad de la prosa se apoya en marcas que sí puedo ver; la credibilidad de sus afirmaciones, no.** En los tres casos, la prosa registra lo que no sabe en lugar de disimularlo, se abstiene de actuar, y declara para qué no sirve. Eso es visible y es coherente en los tres. Lo que no puedo ver en ninguno es el contenido de los archivos que citan: contratos, procedimientos, recibos, código. Así que puedo evaluar **la honestidad de la forma** y no **la exactitud del contenido**. En el caso 1 hay una línea que además choca internamente con un archivo hermano (la versión 2.4.9-rc.5 frente a `created_by_vespi_version: 2.4.9-rc.3`), y en el caso 2 hay una línea de JSON visibly corrupta que contiene nada menos que la decisión principal. Dos señales, en dos casos, de que estos archivos no son solo incompletos sino que alguien los tocó o los generó mal.

**3. El marcador de integridad solo existe en un caso, y ahí está roto.** El caso 1 trae dos verificadores y discrepan entre ellos (`ok: true` contra `digest mismatch`). El caso 2 y el caso 3 no traen ninguno. La consecuencia es incómoda: el único caso donde se intentó verificar es el único donde la verificación falla, y los dos casos donde la prosa es más cuidadosa (2 y 3) son los que no se pueden verificar. No sé si eso es casualidad del paquete o el patrón de algo, y no lo voy a suponer. Lo que sí digo es que, para un lector que solo tenga estos archivos, **no hay forma de confiar en ninguno de los tres registros como registro de lo que pasó**, y que la razón de esa desconfianza es la ausencia de verificación, no una contradicción visible. Eso es lo que volvería a mirar primero.

**Lo que no puedo afirmar de ningún caso**, y no afirmo: qué los originó, qué los ejecutó, qué versión de quéSe usó, si hubo kit, si las citas son textuales, si los expedientes existen, y si las tres personas que se nombran en el caso 2 y el 3 y el nombre abreviado del caso 1 son las mismas. Eso está fuera de la carpeta que me indicaste y no lo busqué.
