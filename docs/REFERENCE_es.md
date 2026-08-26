# Plugin Lore – Referencia

Este documento es la referencia técnica del **plugin Lore**, neutral al proveedor.
Define los conceptos centrales de Lore, los skills disponibles, los artefactos en Markdown y cómo encajan entre sí.

Para una guía práctica de “cómo usarlo en el día a día”, consulta [`USAGE_es.md`](./USAGE_es.md).  
Para una visión conceptual y la filosofía del proyecto, consulta el [`README.md`](../README.md).

---

## 1. Conceptos centrales

Lore se construye sobre un conjunto pequeño de conceptos:

- **Criterio** – Reglas y restricciones que deberían influir decisiones futuras.
- **Pistas Invariantes** – Pequeñas piezas de criterio destilado que siguen siendo útiles incluso cuando el contexto original desaparece.
- **Áreas** – Carpetas madre que poseen Lore compartido; los proyectos heredan su criterio.
- **Proyectos** – Bases de código individuales con su propio Lore, heredando de un Área.
- **Artefactos** – Archivos Markdown que estructuran y almacenan criterio y estado de proyecto.

La documentación tradicional almacena información.  
Lore almacena criterio que restringe lo que debería ocurrir después.

**Frontera de propósito:** Lore Plugin es el brazo técnico de LUS. El impacto de la memory card
profesional y la apuesta de Morin por un mundo mejor son hipótesis declarada y norte ético, no
resultados del benchmark. La productividad mide un efecto; no reemplaza el propósito.

---

## 2. Resumen de skills

El plugin Lore expone ocho skills principales a través de agentes de IA compatibles:

| Skill            | Propósito                                     | Frase disparadora típica                                   |
|------------------|-----------------------------------------------|------------------------------------------------------------|
| `use-lore`       | Punto de entrada, navegación y ayuda          | Se lee primero; se dispara al mencionar “lore” o al empezar una Área, un proyecto o un bot |
| `brainstorming-lore` | Diseñar cambios específicos de Lore sin apropiarse del brainstorming general | «haz brainstorming de este Lore», o la invoca una skill Lore dueña del artefacto |
| `create-area`    | Crear una nueva Área con Lore compartido      | «crea un área de trabajo para Frontend», «quiero empezar a trabajar en X con Lore» |
| `create-project` | Crear un proyecto que hereda de un Área       | «crea un proyecto de Sitio de marketing en el área Frontend» |
| `save-to-lore`   | Capturar criterio tras resolver un problema (**capture**) o arbitrar criterio importado de una skill/guía ajena (**graft**) | «guarda en lore», «destila esto en el lore» (capture) / «destila la skill X en el lore» (graft) |
| `transmute-lore` | Operar un Lore existente en ocho modos | add / clean / translate / upgrade / prune / **mycelium** / leave / crystallize |
| `create-bot`     | Construir un bot: un solo lugar donde abrir sesión y trabajar en varios proyectos a la vez, con su criterio ya cargado | «crea un bot para trabajar en X e Y» (nuevo) / «quiero un bot que federe el lore que ya existe en A y B» (federar) |
| `obsidian-lore`  | Capturar notas libres en el mismo árbol donde vive el Lore, y **minar** esa bandeja buscando lo que merece volverse criterio | «revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore», «mina la bandeja», «guarda esta nota en Obsidian» |

Cada skill opera sobre, o crea, artefactos Markdown específicos dentro de tu repositorio.

**Idioma:** los skills están escritos en inglés, pero el Lore que generan se escribe siempre en el
**idioma del usuario** — tanto el contenido como los nombres de los artefactos. `identidad.md`,
`principios.md`, `FASES.md`, `proyectos/` son las formas canónicas en español (y así aparecen en
este documento); en inglés, por ejemplo, serían `identity.md`, `principles.md`, `PHASES.md`,
`projects/`. Permanecen fijos en todos los idiomas: el nombre del contrato elegido (`CLAUDE.md` o
`AGENTS.md`), `lore/`, `index.md`,
`golden-paths.md`, la profundidad de las rutas relativas y los términos técnicos de uso general en
inglés (workflow, commit, stack, scaffold…). Dentro de un corpus existente mandan los nombres ya
establecidos. Un Lore en el idioma equivocado se estandariza con `transmute-lore` en modo
`translate`.

Estos skills **no son comandos de una CLI**: son *skills* del agente que se disparan por lenguaje natural según la frase que uses, no por flags o sintaxis de terminal. Las frases de la tabla son ejemplos de invocación real, tomadas de los disparadores documentados en cada `SKILL.md`.

---

## 3. Detalle de skills

### 3.1 `use-lore`

**Rol:** Punto de entrada a Lore.

**Responsabilidades:**

- Explicar la arquitectura de Lore para el proyecto o Área actual.
- Mostrar qué artefactos existen y cómo están estructurados.
- Dirigirte al skill adecuado según tu intención.
- Para **entregables complejos**, fijar dueño, Lore enrutado, precedente, capacidades verificadas, lotes revisables y entrega comprobada; sugerir `/model` para el tramo mecánico en vez de un subagente — un subagente relee todo el árbol de Lore primero. Enrutar cada medio a su skill dueña en vez de convertirse en una novena skill de producción.
- **Enrutar una petición de bot, nunca contestarla con un Área** (2.1.1). En una máquina sin nada de
  Lore, quien pide bots ya nombró el entregable: las Áreas son **pasos**, `create-bot` corre al
  final, y la cadena se dice completa con su costo — un `create-area` más un `transmute-lore` por
  cada fuente antes de que el bot pueda enrutar a algo.

**Interacciones típicas:**

- «Explícame la estructura de Lore de este repositorio.»
- «¿Qué artefactos existen para este proyecto?»
- «¿Qué skill debería usar para capturar una nueva pista invariante?»
- «Quiero crear un bot para X e Y.»
- «Construye este entregable complejo desde varias fuentes y entrégalo en el sistema destino.»

Usa `use-lore` siempre que no tengas claro dónde empezar.

---

### 3.2 `brainstorming-lore`

**Regla de canon provisional:** las preguntas sirven a la primera victoria; después solo existen para desbloquear decisiones o mejorar el artefacto, y deben admitir incertidumbre y corrección.

**Regla de continuidad reconocible:** el trabajo estructural mantiene un solo artefacto acumulado, avanza una decisión por vez y recapitula en hitos — la persona sigue reconociendo su intención y puede corregirla. `create-area`, `create-project`, `create-bot` y los modos estructurales de `transmute-lore` heredan la regla; el trabajo mecánico no.

**Regla de autonomía con retorno:** el trabajo autónomo puede acumularse; una recapitulación y una destilación aprobada lo resincronizan con el criterio común.

**Regla del esfuerzo fértil:** corrección, desacuerdo y revisión deben dejar movimiento reconocible en el artefacto o el criterio; el esfuerzo sin movimiento exige reparar el proceso.

**Rol:** Diseñar un artefacto Lore nuevo o materialmente distinto antes de que la skill dueña lo escriba.

**Límite de activación:**

- Peticiones directas de hacer brainstorming sobre el propio Lore.
- Invocación por una skill dueña de artefactos antes de su umbral.
- No hace falta para inspección de solo lectura, una edición mecánica aprobada o ejecutar un plan existente.

**Responsabilidades:**

- Leer el criterio y los artefactos vigentes antes de preguntar.
- Preguntar una decisión que cambie el diseño a la vez y comparar solo caminos materialmente distintos.
- Presentar un diseño proporcional, conservar el umbral de la skill dueña y devolverle el control tras la aprobación.
- No escribir el artefacto final ni quitarle la propiedad a `create-area`, `create-project`, `create-bot`,
  `save-to-lore`, `transmute-lore` u `obsidian-lore`.

---

### 3.3 `create-area`

**Rol:** Inicializar una raíz de Lore compartida para un dominio (Área).

**Entrada:**

- Nombre del Área (por ejemplo, `"Desarrollo Frontend"`).

**Crea / actualiza:**

- Carpeta `lore/` a nivel Área, con:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos bajo `lore/`, según se necesiten.
- Un contrato a nivel Área —`CLAUDE.md` para Claude Code o `AGENTS.md` para Codex— y `FASES.md`
  (contrato y registro de proyectos).
- Una carpeta `proyectos/` vacía, donde nacerán los proyectos futuros.
- Una carpeta `_starter/` con las plantillas de proyecto ajustadas al dominio del Área
  (`CLAUDE.template.md` o `AGENTS.template.md`, `FASES.md` y, si aplica,
  `golden-paths.template.md`, más cualquier scaffold de código base); `create-project` las instancia por proyecto.
  El piso es estructural (2.1.5): always-on, `FASES` fuera, umbral, heredar por ruta — para un Área
  `bots`, la variante es `canon/` + enrutamiento.

**Responsabilidades:**

- Establecer un lugar donde viva el criterio compartido de un dominio.
- Proporcionar el esqueleto (`_starter/`) que los proyectos instancian.
- **Devolver el control a la skill que la llamó** (2.1.1). Un Área es tantas veces un **paso** como un destino. Cuando la llamó `create-bot`, el Área es `bots` —**una**, con todos los bots como proyectos— y su dominio son los bots del usuario, nunca el de alguno de ellos.

Usa `create-area` cuando quieras que varios proyectos compartan el mismo criterio fundamental.

---

### 3.4 `create-project`

**Rol:** Inicializar Lore específico de un proyecto que hereda de un Área.

**Entrada:**

- Nombre del proyecto (por ejemplo, `"Landing Lore"`).
- Nombre del Área (por ejemplo, `"Desarrollo Frontend"`).

**Crea / actualiza:**

- La carpeta del proyecto, siempre en `{área}/proyectos/{slug}/` — nunca directamente bajo el Área.
- Si el Área tiene una carpeta `_starter/`, instancia sus plantillas (y cualquier scaffold de
  código) en el proyecto en lugar de partir de cero.
- Artefactos a nivel proyecto:
  - `lore/identidad.md` y `lore/principios.md`, con **su propio** contenido primero y un puntero
    al estándar del Área después.
  - `lore/index.md`, que referencia los módulos temáticos del Área por ruta relativa
    (`../../../lore/<módulo>.md` — tres niveles, no dos).
  - `FASES.md` (raíz) para estado actual y hoja de ruta.
  - `CLAUDE.md` o `AGENTS.md` (raíz) como contrato único y referencias operativas; el proyecto
    hereda la elección de host del Área.
- Registra el nuevo proyecto en el `FASES.md` del Área.

**Responsabilidades:**

- Dar al proyecto un lugar donde almacenar **su propio** criterio y estado.
- Evitar duplicar módulos temáticos ya definidos a nivel Área (se referencian, no se copian).

Usa `create-project` siempre que arranques una nueva base de código dentro de un Área existente.

---

### 3.5 `save-to-lore`

**Captura contextual:** conserva candidatas hasta un hito real o una acumulación de pistas relacionadas. La vista muestra destino, redacción y por qué ahora; la aprobación cubre las escrituras y commits del lote mostrado, nunca el push.

**Rol:** Destilar la experiencia recién adquirida en criterio reutilizable.

**Dos modos, según la FUENTE del criterio:**

| Modo | Fuente | Operación |
|---|---|---|
| **CAPTURE** (por defecto) | fricción vivida (bug, colapso, rechazo del cliente) | Destila la cicatriz en una Pista Invariante. Todo lo descrito abajo se refiere a este modo. |
| **GRAFT** | criterio importado (una *skill*, una guía de estilo, un manual ajeno, **la constitución o documento de gobierno de otro kit**) | **Juzga** ese criterio contra la finalidad del proyecto. Solo entra lo que sobrevive. |

> *Por qué «injerto»:* echa raíces o es rechazado, y lo que crece después pertenece al huésped — la contraparte exacta de `transmute-lore` PRUNE: la poda quita lo que la planta creció sola, el injerto juzga lo que vino de afuera. Un Lore con uno y sin el otro se hincha o se osifica.
>
> *Renombrado en 2.1.1 (`arbitrate`, luego `transplant`): misma ley, mismas cuatro puertas — un trasplante mueve una planta sin cambiarla; este modo cambia lo que deja entrar.*

**Modo `GRAFT` — cuatro puertas:**

1. **¿Capacidad o criterio?** Una fuente que **ejecuta** (renderiza, hace *crawl*, compila) **no es
   Lore**: se documenta como dependencia y se detiene ahí. Solo se arbitra la que **juzga**.
2. **¿El proyecto tiene finalidad escrita?** Sin `identidad.md`, no hay vara: frente a una fuente con
   autoridad solo cabe obedecerla. Primero la identidad.
3. **Colisionar, no copiar.** Solo entra lo que restringe una decisión futura **aquí**. Donde fuente
   y estándar chocan, **gana el estándar**, y esa resolución suele ser la línea más valiosa: no
   existe en ninguno de los dos cuerpos.
4. **Umbral de salida — la sección de derrotas.** El módulo **debe** registrar dónde la fuente
   contradice el estándar y **pierde**. **Sin derrotas, no entra:** o no hubo arbitraje (fue copia),
   o la fuente traía capacidad, no criterio.

**Un documento de gobierno es el caso más difícil.** La constitución de un segundo kit es criterio escrito bajo la finalidad de otro, y su cláusula de supremacía es precisamente de las que **pierden**: un kit instalado esta semana no puede gobernar criterio pagado antes de que existiera. Esa derrota se **escribe**, nunca se omite — una omisión deja un hueco que la próxima regeneración de plantilla vuelve a llenar. Arbitrar es juzgar, no negociar.

**En calendario, `GRAFT` empieza leyendo lo que ya perdió.** Las secciones de derrotas que escribe **son** ese registro: se leen primero, y no se vuelve a arbitrar ni a reportar lo que ya está en ellas. **«Esta vez no entró nada» es un resultado válido y se escribe así** — una pasada que siempre encuentra algo dejó de mirar y empezó a justificarse.

**Una skill ajena que se *invoca* también trae criterio, y lo aplica sin preguntar.** El caso difícil es el criterio que llega como **herramienta que corre** — toda herramienta opinada trae un cuerpo de criterio que nadie arbitra porque parece capacidad. **Pasale tu Lore en la invocación:** casi todas dejan que una muestra provista les gane a sus valores por defecto; las que no, se mantienen lejos de lo que el Lore gobierna.

**Confianza en `GRAFT`:** lo adoptado *de* la fuente entra como `conjecture`; **el arbitraje mismo** —las derrotas, derivadas de una identidad ya validada— entra como `confirmed`. El módulo declara su procedencia: *"Destilado de `<fuente>`, arbitrado contra `<identidad.md>`."*

**Entrada:**

- Una descripción corta del problema, decisión o aprendizaje (por ejemplo, `"Bug de hidratación en landing de Next.js"`); o el nombre de la fuente a arbitrar (por ejemplo, `"destila la skill copywriting"`).

**Proceso (conceptual):**

1. Preguntar por contexto: qué ocurrió, qué se intentó, qué funcionó al final.
2. Extraer **Pistas Invariantes**:
   - Restricciones que deberían afectar decisiones futuras.
   - Reglas válidas más allá del incidente específico.
3. Decidir dónde guardarlas:
   - Módulos de proyecto bajo `lore/`.
   - `principios.md` a nivel Área para reglas generales.
   - Actualizaciones en `identidad.md` o el contrato si cambian identidad o colaboración.

**Umbral de Lore (disparo proactivo):** para que Claude proponga guardar algo sin que se lo pidas,
deben cumplirse las 4 condiciones a la vez: **restricción** (prohíbe un error futuro o exige un
estándar), **señal** (destilable a Contexto → Causa → Pista, sin logs crudos), **ejecutabilidad**
(una directriz inequívoca) y **genericidad** (le serviría a otro proyecto del Área). Cambios
cosméticos no cuentan.

**`destino:` y verificación de aterrizaje — 2.3.0.** Una Pista que exige un artefacto o un paso verificable declara **dónde se corre**: módulo y paso. Antes de cerrar el umbral se **grepea el término declarado en el archivo declarado** y se reporta `aterrizó` o `escrito, nunca ejercido`; en el segundo caso la pista queda en `conjecture` y **su promoción está bloqueada** hasta que el destino exista.

**La junta se escribe de los dos lados:** la Pista lleva su `destino:`; el paso lleva una línea que nombra la Pista. Los dos lados suelen vivir en árboles distintos, y una sesión carga solo su propio bloque always-on — con el puntero en una sola dirección, quien está parado en el paso ve un procedimiento sin obligación visible detrás, y una poda ahí lo quita como sobrante. Desde ese lado, lo es.

**Sistema de confianza:** cada pista se guarda como `conjecture` (por defecto) o `confirmed` (solo
si se validó realmente en la app en marcha). Nunca se infla a `confirmed` solo para forzar una
promoción.

**Ruteo y promoción:** el criterio se captura primero en el proyecto; solo lo **confirmado y
genérico** se propone para promoción al `lore/` del Área (nunca se escribe el Área en silencio).
En el `index.md` del proyecto, una línea ya promovida se marca con el glifo ` · ↑` — re-ejecutar el
skill sobre esa pista es un no-op seguro (idempotencia).

**Corregir un hecho no es capturar criterio.** El criterio vive en un solo lugar por diseño; un **hecho verificable** —una sede, una cifra, una fecha— se comporta al revés: está repetido en cada artefacto que lo citó y en el documento fuente que lo repartió. Corregirlo donde se notó deja todas las demás copias mal. **La unidad de trabajo es el conjunto de apariciones:** barrer el árbol antes de escribir, corregirlas todas en una pasada y, si el hecho está además en un corpus fuente que no se edita, marcarlo ahí también — tachado y fechado, nunca borrado.

**Invariantes:** el criterio nunca se inventa; todo proviene de experiencia real; el ruido descartado se informa, nunca se elimina en silencio; todo cambio pasa por un umbral antes de escribirse; nada hace commit automáticamente y nunca se hace `git push`; un ser humano siempre revisa el *diff* final. Una Pista que cita otra ley hereda su **frontera de validez** o dice por qué no, y enuncia su regla
  por la **condición**, no por la categoría en la que esa condición suele cumplirse.

Usa `save-to-lore` como mecanismo principal para alimentar tu Lore tras decisiones importantes.

---

### 3.6 `transmute-lore`

**Rol:** Operar un cuerpo de Lore existente mediante ocho modos distintos.

**Frontera de entrada y portabilidad:** ADD puede crear Lore donde no existe desde carpetas, documentos, resúmenes de chat y notas, pero esas entradas siguen siendo fuentes hasta la destilación aprobada; CRYSTALLIZE crea una memory card derivada, trazable y extraíble que nunca reemplaza al Lore vivo.

**Entrada:**

- Nombre del proyecto (por ejemplo, `"Frontend heredado"`).
- Modo, inferido de la frase (no de un flag):
  - `add` – «transmuta el lore de {proyecto}», «este proyecto viejo no está en el formato nuevo» — crea artefactos de Lore que aún no existen.
  - `clean` – «limpia el lore de {proyecto}» — elimina módulos temáticos del proyecto que ya duplican los del Área.
  - `translate` – «estandariza el idioma del lore de {proyecto}», «traduce el lore de {proyecto} a {idioma}» — estandariza el idioma de todos los artefactos del Lore: contenido y nombres de archivo.
  - `upgrade` – «mejora el lore de {proyecto} con la versión nueva», «arbitra mi lore contra la versión nueva» — pone al día un Lore sano escrito contra una versión anterior de estos skills.
  - `prune` – «poda el lore de {proyecto}», «este lore se puso muy pesado» — quita **peso** a un Lore
    que se degradó acumulando cosas que por separado son correctas.
  - `micelio` – «corre el micelio», «¿está conectado el lore?» — recorrido de **solo lectura** que
    reporta qué Pistas ningún paso corre. No escribe nada y nunca poda. Tres disparadores: antes de
    una tarea compleja, tras instalar o actualizar el kit, y al salir de cualquier pasada que escribió
    Lore — una Pista nueva nace desconectada, así que la de salida nunca es la de entrada repetida.
    Los hallazgos bloquean lo que venía después hasta que se escriban o se declinen, y los declinados
    nunca se re-reportan.

  Seis resultados, en frase llana: hay un paso que la corre · nada la corre · nombra un lugar y no
  está escrita ahí · un paso solo dice «consultá» · es criterio fuera de `lore/` · el paso existe en
  un archivo que esta sesión no carga. Corre en silencio — nadie necesita el vocabulario para
  preguntar — los seis no se fusionan: los últimos cuatro se reparan distinto.
  - `leave` – «dejar el lore», «salir del lore sin perder criterio» — quita el gobierno y conserva
    `lore/`. Deja la marca `leave:` en `FASES.md`, que es toda su reversibilidad: `UPGRADE` la lee
    para volver.
  - `crystallize` – «cristaliza este Lore», «exporta este Lore a un solo Markdown», «extrae esta
    cristalización» — resuelve el enrutamiento vivo en una copia de lectura segura y trazable
    para un chat, proyecto de IA o notebook, marcada para desempaquetarse en una carpeta cuyo
    enrutamiento resuelve.

**Precondición de seguridad:** los modos que modifican artefactos fuente exigen un árbol de Git limpio antes de escribir. `crystallize` no escribe fuentes y puede diagnosticar un árbol sucio, pero igual exige vista previa explícita de la exportación y umbral.

**Proceso — modo `add` (conceptual):**

1. Inventariar las fuentes de criterio existentes: `CLAUDE.md`/`AGENTS.md` (suele ser el mayor
   depósito de criterio mezclado), `README.md`, un `lore/` viejo o incompleto, `incidents/`,
   comentarios de código con señales como "nunca", "siempre", "WARNING".
2. Separar **criterio** (restringe una decisión futura) de **ruido** (solo describe).
3. Proponer cómo mapear ese criterio a:
   - `identidad.md`, `principios.md`, `index.md`, módulos temáticos bajo `lore/`.
   - `FASES.md` y el contrato de instrucciones en la raíz.
4. Presentar el mapeo completo (contenido real, no solo una tabla de rutas) y **esperar aprobación
   explícita** antes de escribir nada (umbral).

**Proceso — modo `clean` (conceptual):**

1. Requiere que el proyecto tenga una **Área madre** (`{área}/proyectos/{slug}/`); si es standalone,
   `clean` no aplica y así se informa.
2. Comparar cada módulo temático del proyecto contra su contraparte en `{área}/lore/`: si toda pista
   del módulo del proyecto ya está en el Área, el módulo es redundante y se puede eliminar.
3. Cualquier pista que **no** esté en el Área se reporta (no se borra) para que el usuario decida.
4. **Nunca elimina** `identidad.md`, `principios.md` ni `index.md` — solo módulos temáticos
   redundantes. Reescribe `index.md` para que apunte a los módulos del Área.

**Proceso — modo `translate` (conceptual):**

1. Resolver el **idioma destino**: el que pidas; si no lo indicas, tu propio idioma.
2. Inventariar el idioma actual de cada artefacto del ámbito (`lore/*.md`, `FASES.md`, el contrato,
   `golden-paths.md` si existe), incluyendo los que estén mezclados.
3. Presentar el plan archivo por archivo — incluyendo los **renombrados** de artefactos
   localizables (p. ej. `identidad.md` ↔ `identity.md`, `FASES.md` ↔ `PHASES.md`) — y **esperar
   aprobación explícita** antes de escribir (umbral), indicando lo que NO se traduce ni se
   renombra: el nombre del contrato elegido, `lore/`, `index.md`, `golden-paths.md`, bloques de código,
   identificadores, mensajes de error citados, marcadores de confianza (`conjecture`/`confirmed`),
   el glifo ` · ↑`, términos técnicos de uso general en inglés y nombres propios. Renombrar
   `proyectos/` es opcional y se propone aparte (puede haber referencias externas a esa ruta).
4. Traducir **preservando el significado**: es una traducción, nunca una reescritura — ninguna
   pista se añade, se elimina ni se reinterpreta. Los renombrados se aplican con `git mv` y se
   reescribe todo enlace que toque un archivo renombrado, sin dejar enlaces rotos. Los matices
   ambiguos se reportan, no se adivinan.
5. Límite de ámbito: traducir un proyecto no toca el `lore/` de su Área (y viceversa); si el otro
   nivel está en un idioma distinto, se informa el desajuste. Excepción: la integridad de enlaces
   sí cruza el límite — al renombrar módulos de un Área se actualizan (o reportan) los enlaces de
   sus proyectos hacia esos archivos.

**Binarios: comparar antes de extraer, anotar después.** Un binario **ya transcrito** es indistinguible de uno pendiente, así que el modo `add` compara el texto del binario contra el corpus existente antes de extraerlo y **anota la correspondencia binario → transcripción** en el destino cuando sí transcribe uno. El `.md` se escribe con el nombre que le corresponde al contenido; el binario queda donde estaba, extensión intacta. Los pendientes de extracción se redactan por **contenido, no por extensión**.

**Proceso — modo `upgrade` (conceptual):**

1. **Establecer las dos versiones.** La instalada se lee del **registro de instalación del host**, nunca de un `plugin.json` encontrado en el árbol — y una sesión resuelve su versión de plugin al abrirse, así que el registro puede no describir lo que corre. El testigo que sobrevive es el path que la propia skill declara al cargarse, contrastado contra una palabra que solo exista en una versión. La versión del Lore se infiere de sus artefactos; decir con claridad cuándo eso es una estimación. Si la copia instalada está atrasada, **parar y avisar**.
2. **Arbitrar artefacto por artefacto**, clasificando cada hallazgo en exactamente cuatro tipos:

| Tipo | Qué significa | Qué produce |
|---|---|---|
| **Missing** | El kit ahora exige algo que ese artefacto nunca tuvo (una frontera de validez, un marcador de confianza, una sección de derrotas, un encabezado de procedencia). | Agregarlo, **preguntando** todo lo que no se derive del texto. Nunca fabricar una frontera. |
| **Superseded** | El kit ahora sabe que esa práctica está mal. | Proponer la corrección, citando qué regla la reemplaza. |
| **Earned** | Se aparta del estándar actual **porque este proyecto lo pagó**. | Dejarlo, y escribir por qué en `FASES.md` — una línea por excepción, nunca dentro del artefacto que defiende. |
| **Stale** | Coincide con el kit y ya no coincide con **el proyecto**: describe una práctica que cambió y nadie enmendó el texto. | Reportarlo con la evidencia que lo contradice y **preguntar**; la corrección la enuncia el usuario. |

3. **`index.md` se arbitra contra su propio formato de fila**, no solo contra sus enlaces. El fallo que hay que buscar es un campo del medio que se partió en dos sin que nadie lo note — unas filas diciendo *cuándo abrir esto*, otras cargando un marcador de confianza. Se esconde bien: **una lista malformada se ve tan bien formada como una completa**.
4. Una lista de hallazgos **sin ningún `Earned`** en un Lore con historia significa que el pase se está corriendo como formateador. **`Stale` es el que ninguna lectura encuentra:** se detecta contra el repositorio y nunca releyendo — un artefacto consistente consigo mismo y falso hacia afuera sobrevive toda revisión.
5. Presentar el umbral completo, escribir solo tras aprobación, y registrar la versión a la que se
   actualizó en `FASES.md` — no en el Lore. **No commitea.**
6. **Desde 2.1.4, un árbol se mapea antes de leerse** (gits, dónde vive `lore/`, qué contrato se carga). El índice largo se repara por cabecera, no por filas. En un `.md` vivo que manda, `HARD-GATE` se dice umbral. Falta `identidad.md`/`principios.md` es ADD. En una campaña el umbral es por clase, no por árbol. La bandeja se cuenta; no se mina salvo que restrinja esta pasada.

**Proceso — modo `prune` (conceptual):**

**La unidad que este modo cuenta es el entregable, no el Lore.** Un cuerpo de criterio no es demasiado grande en abstracto; es demasiado grande *para la cosa que tiene que producir*. Hay que pedir el artefacto que el proyecto realmente publica antes de leer un solo módulo — sin eso, `prune` no tiene denominador y se convierte en gusto.

1. **Medir antes de leer**, porque el defecto que este modo ataca es invisible leyendo los archivos de a uno: leyes en `principios.md` (área + proyecto), Pistas en los módulos temáticos, **Pistas sin frontera de validez** (una sin frontera aplica *siempre* — ese es el multiplicador), guardarraíles de la fase activa, y **aparato contra contenido en los últimos tres entregables** — ese último conteo encuentra lo que ningún pase por artefacto detectó nunca. También hay que inventariar si cada tipo de pieza publicada tiene un **techo de extensión declarado**: la pieza sin techo es la que se infla, y suele ser la más publicada.
2. **Clasificar, cuatro tipos:**

| Tipo | Qué significa | Qué produce |
|---|---|---|
| **Deadwood** | No restringe ninguna decisión futura — la decisión que moldeó ya no existe, o se adoptó de otro lado y nunca mordió. | **Sale**, después de escribir su residuo. |
| **Crowding** | Correcto, ganado y no refutable — y aun así su *suma* con los demás satura el entregable. | **No sale.** Recibe una frontera de validez, un destino para el artefacto que exige, o un techo. |
| **Rooted** | Estructural: hay una cicatriz real detrás y una decisión que todavía depende de él. | Intacto, y **no se re-examina en el próximo pase**. |
| **Unhealed** | Declarado aplicado y aplicado a medias — la corrección aterrizó en un lugar y no en sus hermanos. | **Se termina o se desmarca.** No puede quedar declarado-y-falso. |

3. **Una lista de poda sin ningún `Rooted` es un pase corrido como motosierra** — el espejo de la regla `Earned`: un modo que solo quita siempre encuentra algo que quitar.
4. Nada sale sin dejar su residuo escrito, y **lo que encoge es el entregable, no necesariamente el
   corpus**.

**Proceso — modo `crystallize` (conceptual):** resolver el **árbol enrutado entero** — contrato,
canon, identidad, principios y cada `lore/` que nombren `enrutamiento.md` o
`scripts/ecosistema.json`, incluido `lore-ecosistema/` cuando la fuente viva no está. Una
fotografía que solo *apunta* a criterio que no trae ha fallado el modo. El resto se clasifica
como privado, ruido (notas, scripts que no sean el manifiesto, lockfiles) o no enrutado; se
muestra el manifiesto; se espera aprobación; se escribe un solo archivo fuera de `lore/`. Cada
archivo va envuelto en `<!-- lore:extract path="..." owner="..." -->`; se extrae con
`skills/transmute-lore/scripts/crystallize.mjs` a una mini-raíz que espeja `raiz`. «Sin el
ecosistema» no es el default. El usuario no escribe el extractor.

`transmute-lore` **no hace commit del proyecto destino**. Los modos que cambian fuentes dejan un
*diff* revisable; `crystallize` verifica que los hashes o tamaños de las fuentes no cambiaron.

Usa `transmute-lore` cuando ya tienes proyectos en marcha y quieres incorporarlos a Lore sin reconstruirlo todo desde cero.

---

### 3.7 `create-bot`

**Nacimiento desde una idea:** la declaración inicial es canon provisional; la configuración ejecuta el ciclo hasta una primera victoria revisada. Toda interfaz mantiene canon, lógica y presentación aparte, pone decisiones antes que prompts y deriva el estado de Travesía del propósito.

**Rol:** Construir un **bot** — un lugar donde abrir una sesión y trabajar en varios proyectos o
Áreas a la vez, con su criterio ya cargado, en vez de responder preguntas sobre ellos.

Un bot es hermano de `create-project`, no de `create-area`: vive en `{área}/proyectos/{slug}/`. Lo
distingue **una** propiedad: **enruta hacia afuera**, hacia Lore que pertenece a otros proyectos y
Áreas. Por defecto es una carpeta con su canon y su contrato elegido por host —abres la sesión ahí y el criterio ya
está cargado, sin instalar nada—. **Empaquetarlo como *plugin* instalable es opcional** y sirve para
una sola cosa: repartirlo a un equipo.

> **Por qué no puede ser un Área.** Un Área es dueña del criterio de su dominio; un bot toma prestado lo que enruta. Construido como Área, se vuelve una madre que acumula criterio que no pagó — y cuando un criterio se generaliza, se promueve al bot en vez de al Área que se lo ganó.
>
> **La confusión inversa (2.1.1): un bot no administra bots.** El que existe para agregar bots o reordenar carpetas es el Área `bots` con forma de bot — ese trabajo no necesita canon ni tabla de enrutamiento. Si aparece uno así, lo que falta es el Área.

> **El estreno abre con el chequeo de acceso (2.1.1).** El bot se abre **como lo abrirá su usuario**,
> comprobando que la sesión alcanza las rutas del manifiesto — cada host lo concede a su manera
> (Claude: sesión en el bot más `.claude/settings.local.json`; Codex: proyecto en la carpeta **madre**
> del árbol federado; CLI: `--add-dir`). Un host apuntando a la carpeta equivocada falla como *«lee el
> Lore equivocado»*, síntoma que manda a depurar el criterio y nunca el acceso.

**Entrada:**

- Ruta del Área destino, `slug` del bot (también el nombre de la skill) y su propósito.
- Documentos fuente de los que se destila el canon.
- Modo `federar`: qué cuerpos de Lore enruta y qué **tipo de tarea** gobierna cada uno.

**Modos:**

| Modo | Cuándo | Qué añade |
|---|---|---|
| `nuevo` | No hay Lore previo que reunir. | Nada; solo canon. |
| `federar` | El criterio ya existe, disuelto en varias Áreas. | `scripts/ecosistema.json`, `scripts/sync.js` y dos archivos **generados**: `lore/enrutamiento.md` (la tabla) y `.claude/settings.local.json` (el acceso a los árboles vivos). **No copia nada** salvo que se encienda la copia. |

Si el bot ya existe, la skill ejecuta una **auditoría** en vez de cualquiera de los procedimientos de creación: contrasta el registro real de la institución, alcance, fuentes, enrutamiento y README, y después retoma sincronización y verificación.

> **Federar es apuntar, no copiar:** cada fila del manifiesto es una dirección al Lore que vive donde vive, y ese criterio conserva un solo dueño y una sola versión.

**Un Área se federa como se abre:** `lore` **más** su contrato elegido y su `FASES.md`. Las **leyes** del Área viven en el Lore; la **secuencia de trabajo** vive en su `CLAUDE.md` o `AGENTS.md`, y el **registro de qué existe y dónde** en su `FASES.md`, incluidos los proyectos adoptados por ruta. Un bot que se lleva solo el Lore cita cada regla correctamente y trabaja distinto.

**El acceso se declara por fuente, no se infiere de su categoría.** Si algún proyecto dentro de un Área queda fuera del alcance del bot —el caso normal— el acceso de trabajo queda apagado para no reabrir proyectos excluidos por la puerta trasera. Solo una federación deliberada del Área completa puede llevar `"trabajo": true`, con la razón junto a la fila del manifiesto.

**Cadena para fuentes sin Lore:**

El punto de partida habitual es material en bruto —carpetas de documentos, una base de datos, notas
sueltas—, no un conjunto ordenado de Lore. Eso no se federa: se encadena.

```text
carpeta en bruto → create-area → transmute-lore (add) → create-bot (federar)
```

> **El bot nunca destila hacia sí mismo.** Una fuente sin Lore recibe su Lore en el Área que le
> corresponde y se federa después. Absorberla directamente deja al bot como dueño de criterio que no
> pagó, y cuando la única copia vive ahí el Área ya no puede ser su fuente de verdad.

`create-bot` inspecciona las rutas y clasifica cada fuente: ya tiene Lore (se federa), tiene criterio
sin destilar (`transmute-lore` add primero), no tiene Área dueña (`create-area` primero), o no es
texto (extraer antes — `sync.js` mueve solo `.md`, `.txt` y `.json`, así que lo no extraído es
invisible y no avisa). El reporte va con el brainstorm.

**Registro con el usuario:** la skill pregunta tres cosas —nombre, para qué, dónde están las carpetas útiles— **en lenguaje simple**; el vocabulario denso es del documento de la skill, no de la conversación.

**Crea / actualiza:**

- `CLAUDE.md` o `AGENTS.md` — **el bot**: configuración de primer uso, carga del canon, enrutamiento, ejecución y propuesta de destilación al cerrar.
- `canon/*.md` — el criterio que el bot **es**, con origen y frontera de validez declarados por módulo.
- `lore/`, `FASES.md`, `.gitignore`.
- Modo `federar`: `scripts/ecosistema.json`, `scripts/sync.js`, y los generados `lore/enrutamiento.md` y `.claude/settings.local.json` (local, nunca se versiona).
- Un README solo si el usuario lo pide. Registra el bot en el `FASES.md` del Área.

**Los tres cuerpos de criterio (invariante central):**

| Cuerpo | Qué es | Regla |
|---|---|---|
| `canon/` | criterio que el bot **es**; se carga antes de cada decisión | destilado; vive junto al contrato |
| `lore/` | criterio para **mantener** el bot | propio del proyecto |
| criterio **prestado** | el Lore de cada proyecto que el bot enruta | se alcanza **por puntero**, en su propia dirección; **nunca es autoritativo** |

El test que los separa: **¿sería descartable la fuente?** Destilar produce algo más chico que puede
reemplazar a su origen; copiar produce algo idéntico que no puede.

**La copia (`lore-ecosistema/`) es opcional y está apagada por defecto** (`"copia": true` en el
manifiesto). Responde a una sola pregunta: *¿los que van a usar el bot tienen tus carpetas, o solo el
bot?* Sin el árbol, el puntero no apunta a nada y la copia es lo único que hace existir ese criterio
en su máquina. Con la copia encendida, `sync.js` nunca resume —un resumen que vive junto al índice de
consulta compite con el original y gana por estar más cerca— y **la precedencia se comprueba por fila
al momento de leer**: si la fuente viva resuelve en esa máquina, se lee ahí y la copia no se abre.
Así la copia **se desactiva sola**, fila por fila, a medida que alguien va teniendo las carpetas.

**Responsabilidades:**

- Brainstorm del canon **antes** de crear nada (umbral), destilado **desde la fuente** — nunca desde otro destilado ni desde el conocimiento propio del modelo; cada módulo nombra su origen y dónde deja de valer.
- Enrutar **por tipo de tarea, no por nombre de proyecto**; ante ambigüedad entre dos Lore, preguntar.
- Cerrar **toda** tarea con una propuesta de destilación, reportando lo descartado.
- Escribir informes negativos con cobertura en la misma frase: *«ninguna de las leyes que cargo se viola»*, nunca *«está bien»* — lo que nadie cicatrizó no está escrito, y su ausencia del corpus se ve igual que su ausencia del trabajo.
- Modo `federar`: un solo manifiesto genera la tabla, el acceso y la poda; `enrutamiento.md` no se edita a mano y la sincronización va en una sola dirección.

**El primer uso es un brainstorming, no un formulario:**

El kit hace un brainstorming para construir cada artefacto que produce, así que el artefacto no
recibe a su primer usuario con cuatro campos que rellenar. Si hay una skill de brainstorming
instalada, el bot corre el primer uso a través de ella; si no, corre uno mínimo él mismo. Tres
movimientos:

1. **Muestra qué alcanza antes de preguntar nada** — cada cuerpo federado con si resuelve *en esta
   máquina*, qué destila el canon, qué queda fuera de alcance. Un puntero roto aparece delante de
   quien puede arreglarlo.
2. **Pregunta solo lo que cambia comportamiento**, de a una pregunta, y **nunca con opciones cerradas
   para un campo que decide una rama**: la pregunta se hace por su **condición** —*«¿tu trabajo cae en
   más de uno de estos?»*— y una respuesta que nombra dos cuerpos abre por los dos. Tono y apodo se
   infieren, corregibles en una frase.
3. **Cierra separando configuración de criterio.** La configuración va a `.{slug}.json`; el criterio se propone **al Lore de quien lo pagó con experiencia**, nunca se guarda en el bot.

**Configurar el primer uso no es el primer uso.** Ese gate se contesta igual con el canon vacío y las
rutas rotas, así que pasarla no prueba nada sobre si el bot funciona. El bot se reporta terminado después de un
**estreno**: una instrucción que no nombra el criterio, anotada **textual** en el `FASES.md` del
Área — una parafraseada ya no permite juzgar si era corta.

Opcional y apagado por defecto:

- **Cifrado** (*experimental*, ver [`ENCRYPTION.md`](./ENCRYPTION.md)): se cifra en distribución,
  nunca en consulta. Con cifrado el texto plano queda fuera de git; sin cifrado el criterio **debe**
  commitearse, o el repositorio viaja sin criterio. La passphrase se pide por *stdin* y nunca entra al chat.

Un bot sin él está completo. **Empaquetar es cristalizar**, no envolver el bot como plugin:
extraer la fotografía reconstruye la carpeta, incluido `lore-ecosistema/` — así viaja el trabajo
a quien no tiene tu árbol.

Usa `create-bot` cuando quieras una sola sesión que trabaje sobre varios proyectos — con o sin Lore previo: sin él, orquesta la cadena de arriba; con él, lo federa. Nunca sustituye construir ese Lore en el Área que lo posee.

---

### 3.8 `obsidian-lore`

**Propósito:** gobernar el solape entre una vault de Obsidian y el Lore cuando comparten árbol de
archivos, capturar notas y minar la bandeja. La nota siempre es material fuente; `save-to-lore` es
dueña de cualquier criterio que sobreviva clasificación, enrutamiento y umbral.

**Precondición:** la vault debe ser la **carpeta madre que contiene las Áreas**, no una carpeta al lado — la skill verifica que al menos un hijo directo de la raíz tenga `lore/`, o se detiene y apunta a `create-area`. La ruta nunca se asume.

**La bandeja:** una carpeta nombrada en el idioma del usuario (`notas/`). El barrido es recursivo sobre `**/*.md`; las subcarpetas quedan a criterio de quien escribe.

**Recomendación permanente: la bandeja vive en un bot.** Es la configuración para la que esta skill fue diseñada, recomendada en su primera ejecución y cada vez que un barrido ocurre fuera de un bot. La razón es el enrutamiento: un bot enruta cada nota **contra `lore/enrutamiento.md`**, donde está escrita la finalidad de cada Área y proyecto federado, y los casos frontera se preguntan en vez de adivinarse. Fuera de un bot, el enrutamiento sale de una sola ruta y de la lectura del texto — una conjetura con la misma cara de certeza. ¿Sin bot y notas que tocan más de un Área? La skill propone `create-bot`.

**Vive donde se abre la sesión**, y esto no es cosmético:

| Sesión abierta en | Su bandeja |
|---|---|
| Un **bot** ← *recomendado* | `<bot>/notas/` |
| Un proyecto o un Área | el `notas/` de esa carpeta |
| **La raíz nunca tiene bandeja, y es ley, no orden.** Una nota en la raíz no tiene dueño ni tabla contra la cual enrutarse, y el fallo es silencioso — el barrido no la lee, no falla y **reporta deuda cero**, dejando la nota intacta: justo el estado que la destilación existe para romper. Una nota que no pertenece a ningún proyecto significa que **falta el proyecto** (`create-project`), no que haga falta una bandeja huérfana.

**Y alguien sí trabaja en la raíz** — launchers que enrutan a todas las Áreas, specs que deciden una nueva, scripts que recorren el árbol entero. La raíz es **un lugar de trabajo sin Lore**: sin dueño, sin `FASES.md`, sin bandeja ni contrato que registre lo que pasó, así que **el trabajo mismo queda sin registrar** y no se escribe ninguna nota que un barrido pueda encontrar. Lo que falta está un nivel por encima: un **Área** (`create-area`). Hasta que exista, la nota va a la bandeja del Área que pidió el trabajo, nunca a la raíz.
**Frontmatter de una nota:**

```yaml
---
fecha: 2026-08-08
origen: bots/proyectos/mi-bot   # opcional — desde dónde se escribió; alimenta el enrutamiento
destilado:                      # vacío = sin minar
---
```

**Las dos operaciones:**

| Operación | Qué hace |
|---|---|
| **Capturar** | Escribe un `.md` en la bandeja con ese frontmatter. Nunca dentro de `lore/`, y nunca toca `identidad.md`, `principios.md`, un módulo, `FASES.md` ni el contrato. |
| **Minar** | Barre la bandeja, reporta la deuda, clasifica, enruta, propone y espera aprobación. La escritura la ejecuta `save-to-lore`. **La deuda es lo que escribió el humano y nadie destiló** (2.1.1): una nota que el propio agente escribió en la sesión no se le cuenta al usuario sin decirlo. |

**Las cuatro cubetas.** El discriminador no es la calidad de la nota: es si registra una
**transformación** o solo un **hecho**.

| La nota registra | Qué es | Destino |
|---|---|---|
| Una fricción **resuelta** | experiencia | `save-to-lore` **capture** |
| Una **tarea**, un pendiente o una fricción **abierta** — *«hay que añadir X»* | estado | `FASES.md` |
| Criterio ajeno que **juzga** | criterio importado | `save-to-lore` **graft** (sin derrotas no entra) |
| Un resumen, una cita, un enlace, un apunte | información | fuente de `create-area` / `create-project` / `transmute-lore`, o **ruido informado** |

Existe un quinto destino, más raro: una nota que cambia **cómo se trabaja en conjunto** pertenece al contrato de instrucciones, no al Lore.

**Enrutamiento**, deteniéndose en el primero que resuelva: el `origen` de la nota → el `lore/enrutamiento.md` del bot → el proyecto o Área donde corre la sesión → **ambiguo, se pregunta**. La primera vez que se resuelve una ambigüedad, la **frontera** puede valer como Pista; el filtro de ruido también aplica ahí.

**Idempotencia y ciclo de vida:** al cerrar, cada nota minada recibe su `destilado:` con fecha y destino — incluidas las que no produjeron nada. Una nota con `destilado` no vacío se salta en los barridos siguientes. **La skill nunca borra una nota:** se mina antes de borrar; borrar lo decide el humano.

**Por qué un barrido y no un comando disponible.** Una nota satisface las ganas de preservar con el criterio inerte adentro — separar las notas del Lore no lo evitó: el registro siguió inerte seis semanas. Lo que lo evita es el barrido y su deuda visible, que `save-to-lore` también reporta al cerrar.

Usa `obsidian-lore` cuando ya acumules notas y quieras que dejen de ser solo notas — no es un gestor de notas: `Read` y `Grep` ya leen la vault.

---

## 4. Especificación de artefactos

Lore usa un conjunto fijo de artefactos Markdown para mantener el criterio estructurado.

### 4.1 `lore/identidad.md`

**Ámbito:** Área o proyecto.

**Propósito:**

- Definir la identidad del proyecto o Área.
- Capturar el estándar mínimo de calidad que debe cumplirse.

**Contenido típico:**

- Nombre y descripción.
- Intención central y audiencia.
- Barrera mínima de calidad (por ejemplo, «Nunca introducir regresiones visibles para el usuario en producción»).
- **`registro:`** — qué tan técnico quieres que el kit te hable: `tecnico`, `equilibrado` (default) o
  `llano`. Una línea. Ver abajo.

**La clave `registro:` (2.1.0).** Fija cuánto suelo rodea a una regla cuando el kit se explica —
`tecnico` conserva la especificación y baja la escena al mínimo, `llano` agranda la escena y explica
un término técnico la primera vez que aparece, `equilibrado` es mitad y mitad. **Nunca mueve las
reglas:** un umbral sigue siendo un umbral, un `MUST` sigue siendo un `MUST`, y una frontera de
validez no se omite nunca. Un calibrador capaz de apagar una puerta sería una forma de saltarse el kit
pidiéndoselo amablemente.

Se **infiere, no se pregunta**, y se declara en una línea con la corrección ofrecida en el mismo aliento. Es **preferencia declarada, no criterio**: no lleva marcador de confianza y nunca se promueve al área; si falta la línea, se asume `equilibrado`.

**Guías:**

- Mantén este archivo breve y estable.
- Solo actualízalo cuando la identidad o los estándares cambien de verdad.

---

### 4.2 `lore/principios.md`

**Ámbito:** Área (y, a veces, proyecto).

**Propósito:**

- Almacenar reglas permanentes de ingeniería y negocio.

**Contenido típico:**

- Principios arquitectónicos (por ejemplo, «Preferir renderizado estático en páginas de marketing»).
- Reglas de negocio que moldean decisiones técnicas.
- Restricciones que aplican a varios proyectos.

**Guías:**

- Prefiere principios claros y accionables frente a eslóganes abstractos.
- Mueve reglas muy específicas a módulos temáticos en lugar de saturar este archivo.

---

### 4.3 Módulos temáticos bajo `lore/`

**Ámbito:** Proyecto y Área.

**Propósito:**

- Agrupar experiencia destilada por dominio.

**Ejemplos:**

- `frontend-rendering.md`
- `error-handling.md`
- `data-modeling.md`
- `deployment-and-ops.md`

**Contenido típico:**

- Pistas Invariantes relacionadas con ese dominio.
- Fragmentos breves de contexto sólo cuando son necesarios para entender una regla.

**Guías:**

- Cada módulo debería enfocarse en un solo dominio o preocupación.
- Si un módulo crece demasiado, considera dividirlo.

---

### 4.4 `lore/index.md`

**Ámbito:** Área o proyecto.

**Propósito:**

- Actuar como mapa de navegación del Lore.

**Contenido típico:**

- Estructura de alto nivel:
  - enlaces a `identidad.md` y `principios.md`;
  - lista de módulos temáticos con descripciones cortas.
- Punteros a artefactos a nivel proyecto y Área.

**Guías:**

- Mantén este archivo actualizado al añadir o renombrar módulos.
- Haz que sea fácil para alguien nuevo saber dónde buscar un tema concreto.

---

### 4.5 `FASES.md`

**Ámbito:** Proyecto (nivel raíz).

**Propósito:**

- Describir el estado actual y la hoja de ruta del proyecto.

**Contenido típico:**

- Fase actual (por ejemplo, «Exploración», «MVP», «Escalado»).
- Objetivos y restricciones activas.
- Hitos próximos relevantes para criterio y decisiones.

**Guías:**

- Actualiza este archivo cuando el proyecto avance de fase.
- Usa descripciones concisas y basadas en hechos.

---

### 4.6 `CLAUDE.md` o `AGENTS.md`

**Ámbito:** Proyecto (nivel raíz).

**Propósito:**

- Definir el contrato de colaboración entre humanos y Claude (u otras herramientas de IA).
- Almacenar referencias operativas para trabajo asistido por IA.

**Contenido típico:**

- Cómo se espera usar Claude en el proyecto.
- Restricciones innegociables para las sugerencias de IA (por ejemplo, «Nunca saltarse la revisión de código»).
- Punteros a prompts, flujos de trabajo y mecanismos de seguridad.

**Guías:**

- Piensa en este archivo como el “acuerdo de trabajo” para la colaboración humano–IA.
- Mantén el contenido explícito y práctico.

**El bloque siempre-activo:**

El contrato es el único artefacto que los dos hosts cargan sin que nadie se lo pida, así que lleva el
canal siempre-activo del kit — su sección de punteros, delimitada por un par de marcadores:

```markdown
<!-- lore:always-on -->
…qué Lore gobierna acá · dónde vive · dónde vive el estado · cuándo invocar en vez de escribir a mano…
<!-- /lore:always-on -->
```

- **Los marcadores son literales.** Sin variantes de espaciado, sin atributos, sin número de versión;
  se localizan por coincidencia de línea completa tras recortar espacios, y **nunca se traducen** —
  traducirlos rompe la idempotencia del estampado sin producir ningún error.
- **Techo: 25 líneas, marcadores incluidos.** Es un límite duro. Si una variante no cabe, el
  contenido se mueve al `lore/`; el techo no se mueve.
- **Exactamente cuatro cosas:** qué Lore gobierna acá, dónde vive, **dónde vive el estado**
  (`FASES.md`, una línea, solo la ruta), y la señal de invocar en vez de escribir criterio a mano.
  Apunta al `lore/` y nunca reproduce una Pista. El criterio y el estado siguen en archivos separados
  —esa ley no se mueve—, pero la sesión que los recibe no puede leer dos veces, y un agente que tiene
  el criterio y no la fase propone bien y **fuera de orden**. La entrada de estado es un **puntero, no
  contenido**: la ruta es estable, lo que se agita es su destino.
- **Tres variantes.** Área → su propio `lore/`. Proyecto → su capa más la del área madre. Bot →
  `canon/` más la tabla de enrutamiento, nunca los Lore federados uno por uno. Las tres apuntan a su
  propio `FASES.md`, que es una línea y no escala con la cantidad de fuentes.
- **Quién estampa:** `create-area`, `create-project` y `create-bot`, dentro del umbral que ya
  tienen; `transmute-lore` UPGRADE para contratos anteriores al bloque.
- **Idempotencia:** sin marcadores → insertar tras el primer H1. Un par bien formado con contenido
  idéntico → **no-op, no se escribe nada**. Un par bien formado con contenido distinto → **reportar
  la divergencia y esperar**. Marcadores duplicados o rotos → **detener y reportar**; nunca adivinar.
  Salvo el bloque, el archivo no cambia.
- **Colisión con prosa preexistente.** Un contrato anterior al bloque suele nombrar ya las mismas rutas en una sección de carga, y estamparlo deja dos copias de los mismos punteros. El bloque es el que las skills reestampan, así que la copia que se desactualiza es la escrita a mano: los punteros quedan solo dentro del bloque y esa sección se reduce a lo que el bloque no lleva — reportado en el mismo umbral, nunca en silencio.

---

### 4.7 `golden-paths.md` (opcional)

**Ámbito:** Proyecto o Área (nivel raíz).

**Propósito:**

- Documentar las rutas/flujos críticos que deben verificarse manualmente (por ejemplo, rutas web
  clave en un Área de frontend).

No forma parte del núcleo de seis piezas: `create-area` y `create-project` solo lo generan
cuando el dominio lo justifica (por ejemplo, un Área web con rutas críticas). Si el dominio no lo
necesita, simplemente no existe.

### 4.8 `assets/constitucion-puntero.md` — la constitución-puntero (2.1.0)

**Alcance:** viaja **con el kit**, no se genera dentro de tu repositorio. Es una plantilla que se copia.

**Propósito:** que un repositorio gobernado por **spec-kit** conviva con Lore sin que ninguno de los
dos cuerpos de criterio absorba al otro en silencio. La constitución de spec-kit tiene autoridad sobre
el *ciclo* (spec → plan → tasks → implement); el Lore la tiene sobre el *criterio* que restringe cómo
se construye todo eso. La plantilla deja esa frontera escrita en vez de dejarla a quien redacte el
próximo documento.

**Por qué es puntero y no copia.** Una constitución que repite las reglas del Lore se vuelve una segunda fuente que deriva en silencio — los dos documentos siguen leyéndose bien por separado. La plantilla apunta a `lore/` para todo lo que el Lore posee, y declara por escrito que ahí no gobierna.

**Su regla propia, que es la que más se saltea:** una cláusula del tipo *«este documento reemplaza
cualquier otra práctica»* se **revoca por escrito, con su razón** — nunca se borra sin más. Una
omisión deja un hueco que la próxima regeneración de plantilla vuelve a llenar. Arbitrar un documento
de gobierno es `save-to-lore` **graft**, y es el caso más difícil que ese modo tiene.

Ver [`SPEC_KIT_es.md`](./SPEC_KIT_es.md) para la instalación y los tres escenarios de entrada.

---

## 5. Estructura de archivos

Una estructura típica de Lore, con Área y proyecto, se ve así:

```text
{área}/
  lore/
    identidad.md
    principios.md
    index.md
    <módulos-temáticos>.md
  _starter/                    → plantillas que create-project instancia
    CLAUDE.template.md o AGENTS.template.md
    FASES.md
    golden-paths.template.md   → solo si el dominio lo justifica
  FASES.md                     → registro de proyectos del Área
  CLAUDE.md o AGENTS.md        → contrato único del Área, elegido por host

  proyectos/
    {slug}/
      lore/
        identidad.md            → contenido propio + puntero al del Área
        principios.md           → contenido propio + puntero al del Área
        index.md                → apunta a los módulos del Área por ../../../lore/<módulo>.md
        <módulos propios>.md    → solo criterio específico de este proyecto
      FASES.md
      CLAUDE.md o AGENTS.md
```

Puntos clave de esta jerarquía:

- Los proyectos **siempre** viven en `{área}/proyectos/{slug}/`, nunca directamente bajo el Área.
- Los módulos temáticos genéricos **no se copian** al proyecto: viven una sola vez en `{área}/lore/`, y el `index.md` del proyecto los referencia por ruta relativa, que sube **tres** niveles, no dos.
- El criterio compartido vive en el Área. El criterio específico de proyecto vive en el proyecto.

---

## 6. Invariantes operativas

El comportamiento de Lore está gobernado por un conjunto de invariantes compartidas:

- **El Lore se escribe en el idioma del usuario** – contenido y nombres de artefactos; solo el
  nombre del contrato elegido, `lore/`, `index.md`, `golden-paths.md` y los términos técnicos de uso general en inglés permanecen fijos.
- **El criterio nunca se inventa** – todas las reglas provienen de experiencia real.
- **Todo proviene de trabajo real** – experimentos, incidentes, decisiones.
- **El ruido descartado se informa** – nada se elimina en silencio.
- **Todo cambio pasa por un umbral** – el criterio debe revisarse antes de escribirse.
- **Nada hace commit automáticamente** – la revisión humana es obligatoria.
- **Un humano revisa siempre el diff final** – la IA asiste, pero no modifica Lore en secreto.

Estas invariantes distinguen a Lore de herramientas genéricas de notas o logs:  
el objetivo es mantener un cuerpo de criterio confiable, curado por humanos, del que la IA pueda depender.

---

## 7. Relación con README y otros docs

La documentación se reparte por oficio: [`README.md`](../README.md) lleva historia, motivación y arquitectura; [`USAGE_es.md`](./USAGE_es.md) / [`USAGE_en.md`](./USAGE_en.md), flujos prácticos; esta referencia, el modelo técnico; [`MIGRATION_es.md`](./MIGRATION_es.md) / [`MIGRATION_en.md`](./MIGRATION_en.md), estrategias de migración; [`ENCRYPTION.md`](./ENCRYPTION.md), el cifrado opcional del criterio de un bot. Todos viven bajo `docs/`. Separar referencia de uso y narrativa hace las consultas precisas y deja que los patrones de uso evolucionen sin tocar el modelo.