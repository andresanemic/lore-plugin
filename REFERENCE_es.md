# Plugin Lore – Referencia

Este documento es la referencia técnica del **plugin Lore**, neutral al proveedor.
Define los conceptos centrales de Lore, los skills disponibles, los artefactos en Markdown y cómo encajan entre sí.

Para una guía práctica de “cómo usarlo en el día a día”, consulta [`USAGE_es.md`](./USAGE_es.md).  
Para una visión conceptual y la filosofía del proyecto, consulta el [`README.md`](./README.md).

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

---

## 2. Resumen de skills

El plugin Lore expone ocho skills principales a través de agentes de IA compatibles:

| Skill            | Propósito                                     | Frase disparadora típica                                   |
|------------------|-----------------------------------------------|------------------------------------------------------------|
| `use-lore`       | Punto de entrada, navegación y ayuda          | Se lee primero; se dispara al mencionar “lore” o al empezar una Área/proyecto |
| `brainstorming-lore` | Diseñar cambios específicos de Lore sin apropiarse del brainstorming general | «haz brainstorming de este Lore», o la invoca una skill Lore dueña del artefacto |
| `create-area`    | Crear una nueva Área con Lore compartido      | «crea un área de trabajo para Frontend», «quiero empezar a trabajar en X con Lore» |
| `create-project` | Crear un proyecto que hereda de un Área       | «crea un proyecto de Sitio de marketing en el área Frontend» |
| `save-to-lore`   | Capturar criterio tras resolver un problema (**capture**) o arbitrar criterio importado de una skill/guía ajena (**arbitrate**) | «guarda en lore», «destila esto en el lore» (capture) / «destila la skill X en el lore» (arbitrate) |
| `transmute-lore` | Migrar proyectos existentes hacia Lore        | «transmuta el lore del Frontend heredado» (add) / «limpia el lore del Frontend heredado» (clean) / «estandariza el idioma del lore del Frontend heredado» (translate) |
| `create-bot`     | Construir un bot: un solo lugar donde abrir sesión y trabajar en varios proyectos a la vez, con su criterio ya cargado | «crea un bot para trabajar en X e Y» (nuevo) / «quiero un bot que federe el lore que ya existe en A y B» (federar) |
| `obsidian-lore`  | Capturar notas libres en el mismo árbol donde vive el Lore, y **minar** esa bandeja buscando lo que merece volverse criterio | «revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore», «mina la bandeja», «guarda esta nota en Obsidian» |

Cada skill opera sobre, o crea, artefactos Markdown específicos dentro de tu repositorio.

**Idioma:** los skills están escritos en inglés, pero el Lore que generan se escribe siempre en el
**idioma del usuario** — tanto el contenido como los nombres de los artefactos. `identidad.md`,
`principios.md`, `FASES.md`, `proyectos/` son las formas canónicas en español (y así aparecen en
este documento); en inglés, por ejemplo, serían `identity.md`, `principles.md`, `PHASES.md`,
`projects/`. Permanecen fijos en todos los idiomas: `CLAUDE.md`, `lore/`, `index.md`,
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

**Interacciones típicas:**

- «Explícame la estructura de Lore de este repositorio.»
- «¿Qué artefactos existen para este proyecto?»
- «¿Qué skill debería usar para capturar una nueva pista invariante?»

Usa `use-lore` siempre que no tengas claro dónde empezar.

---

### 3.2 `create-area`

**Rol:** Inicializar una raíz de Lore compartida para un dominio (Área).

**Entrada:**

- Nombre del Área (por ejemplo, `"Desarrollo Frontend"`).

**Crea / actualiza:**

- Carpeta `lore/` a nivel Área, con:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos bajo `lore/`, según se necesiten.
- `CLAUDE.md` y `FASES.md` a nivel Área (contrato y registro de proyectos).
- Una carpeta `proyectos/` vacía, donde nacerán los proyectos futuros.
- Una carpeta `_starter/` con las plantillas de proyecto ajustadas al dominio del Área
  (`CLAUDE.template.md`, `FASES.md` y, si aplica, `golden-paths.template.md`, más cualquier
  scaffold de código base). `create-project` instancia estas plantillas al crear cada proyecto.

**Responsabilidades:**

- Establecer un lugar donde viva el criterio compartido de un dominio.
- Proporcionar el esqueleto (`_starter/`) que los proyectos instancian.

Usa `create-area` cuando quieras que varios proyectos compartan el mismo criterio fundamental.

---

### 3.3 `create-project`

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
  - `CLAUDE.md` (raíz) para contrato de colaboración y referencias operativas.
- Registra el nuevo proyecto en el `FASES.md` del Área.

**Responsabilidades:**

- Dar al proyecto un lugar donde almacenar **su propio** criterio y estado.
- Evitar duplicar módulos temáticos ya definidos a nivel Área (se referencian, no se copian).

Usa `create-project` siempre que arranques una nueva base de código dentro de un Área existente.

---

### 3.4 `save-to-lore`

**Rol:** Destilar la experiencia recién adquirida en criterio reutilizable.

**Dos modos, según la FUENTE del criterio:**

| Modo | Fuente | Operación |
|---|---|---|
| **capture** (por defecto) | fricción vivida (bug, colapso, rechazo del cliente) | Destila la cicatriz en una Pista Invariante. Todo lo descrito abajo se refiere a este modo. |
| **arbitrate** | criterio importado (una *skill*, una guía de estilo, un manual ajeno) | **Juzga** ese criterio contra la finalidad del proyecto. Solo entra lo que sobrevive. |

**Modo `arbitrate` — cuatro puertas:**

1. **¿Capacidad o criterio?** Una fuente que **ejecuta** (renderiza, hace *crawl*, compila) **no es
   Lore**: se documenta como dependencia y se detiene ahí. Solo se arbitra la que **juzga**.
2. **¿El proyecto tiene finalidad escrita?** Sin `identidad.md`, no hay vara: frente a una fuente con
   autoridad solo cabe obedecerla. Primero la identidad.
3. **Colisionar, no copiar.** Solo entra lo que restringe una decisión futura **aquí**. Donde fuente
   y estándar chocan, **gana el estándar**, y esa resolución suele ser la línea más valiosa: no
   existe en ninguno de los dos cuerpos.
4. **HARD-GATE de salida — la sección de derrotas.** El módulo **debe** registrar dónde la fuente
   contradice el estándar y **pierde**. **Sin derrotas, no entra:** o no hubo arbitraje (fue copia),
   o la fuente traía capacidad, no criterio.

**Confianza en `arbitrate`:** lo adoptado *de* la fuente entra como `conjecture` (nadie lo ha pagado
aún con fricción real); **el arbitraje mismo** —las derrotas, derivadas de una identidad ya
validada— entra como `confirmed`. El módulo declara su procedencia: *"Destilado de `<fuente>`,
arbitrado contra `<identidad.md>`."*

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
   - Actualizaciones en `identidad.md` o `CLAUDE.md` si cambian identidad o colaboración.

**Umbral de Lore (disparo proactivo):** para que Claude proponga guardar algo sin que se lo pidas,
deben cumplirse las 4 condiciones a la vez: **restricción** (prohíbe un error futuro o exige un
estándar), **señal** (destilable a Contexto → Causa → Pista, sin logs crudos), **ejecutabilidad**
(una directriz inequívoca) y **genericidad** (le serviría a otro proyecto del Área). Cambios
cosméticos no cuentan.

**Sistema de confianza:** cada pista se guarda como `conjecture` (por defecto) o `confirmed` (solo
si se validó realmente en la app en marcha). Nunca se infla a `confirmed` solo para forzar una
promoción.

**Ruteo y promoción:** el criterio se captura primero en el proyecto; solo lo **confirmado y
genérico** se propone para promoción al `lore/` del Área (nunca se escribe el Área en silencio).
En el `index.md` del proyecto, una línea ya promovida se marca con el glifo ` · ↑` — re-ejecutar el
skill sobre esa pista es un no-op seguro (idempotencia).

**Corregir un hecho no es capturar criterio.** El enrutamiento de arriba está hecho para criterio, que
vive en un solo lugar por diseño. Un **hecho verificable** —una sede, una cifra, una fecha— se
comporta al revés: está repetido en cada artefacto que lo citó y en el documento fuente que lo
repartió, así que corregirlo donde se notó el error deja la raíz intacta y todas las demás copias con
ella, y ninguna de las que sobreviven da ningún error. **La unidad de trabajo es el conjunto de
apariciones:** barrer el árbol antes de escribir, corregirlas todas en una pasada, y si el hecho está
además en un corpus fuente que no se edita, marcarlo ahí también — tachado y fechado, nunca borrado.

**Invariantes:**

- El criterio nunca se inventa.
- Todo proviene de experiencia real.
- El ruido descartado se informa; nunca se elimina en silencio.
- Todo cambio pasa por un HARD-GATE antes de escribirse.
- Nada hace commit automáticamente; nunca se hace `git push`.
- Un ser humano siempre revisa el *diff* final.
- Una Pista que cita otra ley hereda su **frontera de validez** o dice por qué no, y enuncia su regla
  por la **condición**, no por la categoría en la que esa condición suele cumplirse.

Usa `save-to-lore` como mecanismo principal para alimentar tu Lore tras decisiones importantes.

---

### 3.5 `transmute-lore`

**Rol:** Migrar proyectos existentes hacia la arquitectura Lore.

**Entrada:**

- Nombre del proyecto (por ejemplo, `"Frontend heredado"`).
- Modo, inferido de la frase (no de un flag):
  - `add` – «transmuta el lore de {proyecto}», «este proyecto viejo no está en el formato nuevo» — crea artefactos de Lore que aún no existen.
  - `clean` – «limpia el lore de {proyecto}» — elimina módulos temáticos del proyecto que ya duplican los del Área.
  - `translate` – «estandariza el idioma del lore de {proyecto}», «traduce el lore de {proyecto} a {idioma}» — estandariza el idioma de todos los artefactos del Lore: contenido y nombres de archivo.
  - `upgrade` – «mejora el lore de {proyecto} con la versión nueva», «arbitra mi lore contra la versión nueva» — pone al día un Lore sano escrito contra una versión anterior de estos skills.

**Precondición de seguridad (Fase 0, los cuatro modos):** el repositorio del proyecto debe tener el
árbol de git limpio. Si hay cambios sin commitear, el skill se detiene y pide hacer commit o
`stash` primero, para que la transmutación aterrice como un *diff* revisable.

**Proceso — modo `add` (conceptual):**

1. Inventariar las fuentes de criterio existentes: `CLAUDE.md`/`AGENTS.md` (suele ser el mayor
   depósito de criterio mezclado), `README.md`, un `lore/` viejo o incompleto, `incidents/`,
   comentarios de código con señales como "nunca", "siempre", "WARNING".
2. Separar **criterio** (restringe una decisión futura) de **ruido** (solo describe).
3. Proponer cómo mapear ese criterio a:
   - `identidad.md`, `principios.md`, `index.md`, módulos temáticos bajo `lore/`.
   - `FASES.md` y `CLAUDE.md` en la raíz.
4. Presentar el mapeo completo (contenido real, no solo una tabla de rutas) y **esperar aprobación
   explícita** antes de escribir nada (HARD-GATE).

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
2. Inventariar el idioma actual de cada artefacto del ámbito (`lore/*.md`, `FASES.md`, `CLAUDE.md`,
   `golden-paths.md` si existe), incluyendo los que estén mezclados.
3. Presentar el plan archivo por archivo — incluyendo los **renombrados** de artefactos
   localizables (p. ej. `identidad.md` ↔ `identity.md`, `FASES.md` ↔ `PHASES.md`) — y **esperar
   aprobación explícita** antes de escribir (HARD-GATE), indicando lo que NO se traduce ni se
   renombra: `CLAUDE.md`, `lore/`, `index.md`, `golden-paths.md`, bloques de código,
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

**Binarios: comparar antes de extraer, anotar después.** Un `.pdf`, `.docx` o `.xlsx` entre las
fuentes parece trabajo pendiente para siempre, porque un binario **ya transcrito** es indistinguible
de uno que no lo está: la transmutación escribe el `.md` con el nombre que le corresponde al contenido
y deja el binario donde estaba, con su extensión intacta. Por eso el modo `add` compara el texto del
binario contra el corpus existente antes de extraerlo —el solapamiento literal por tramos cuesta
segundos— y **anota la correspondencia binario → transcripción** en el destino cuando sí transcribe
uno. Los pendientes de extracción se redactan por **contenido, no por extensión**.

En los cuatro modos, `transmute-lore` **no hace commit del proyecto destino**: el *diff* queda para que
el usuario lo revise y decida.

Usa `transmute-lore` cuando ya tienes proyectos en marcha y quieres incorporarlos a Lore sin reconstruirlo todo desde cero.

---

### 3.6 `create-bot`

**Rol:** Construir un **bot** — un lugar donde abrir una sesión y trabajar en varios proyectos o
Áreas a la vez, con su criterio ya cargado, en vez de responder preguntas sobre ellos.

Un bot es hermano de `create-project`, no de `create-area`: vive en `{área}/proyectos/{slug}/`. Lo
distingue **una** propiedad: **enruta hacia afuera**, hacia Lore que pertenece a otros proyectos y
Áreas. Por defecto es una carpeta con su canon y su `CLAUDE.md` —abres la sesión ahí y el criterio ya
está cargado, sin instalar nada—. **Empaquetarlo como *plugin* instalable es opcional** y sirve para
una sola cosa: repartirlo a un equipo.

> **Por qué no puede ser un Área.** Un Área contiene proyectos y es dueña del criterio de su
> dominio. Un bot no es dueño de nada del criterio que enruta: lo toma prestado. Construirlo como
> Área crea una madre que acumula criterio que no pagó, y la consecuencia aparece rápido — cuando un
> criterio se generaliza, se promueve al bot en vez de al Área que se lo ganó.

**Entrada:**

- Ruta del Área destino, `slug` del bot (que es también el nombre de la skill) y su propósito.
- Documentos fuente de los que se destila el canon.
- Modo `federar`: qué cuerpos de Lore enruta y qué **tipo de tarea** gobierna cada uno.

**Modos:**

| Modo | Cuándo | Qué añade |
|---|---|---|
| `nuevo` | No hay Lore previo que reunir. | Nada; solo canon. |
| `federar` | El criterio ya existe, disuelto en varias Áreas. | `scripts/ecosistema.json`, `scripts/sync.js` y dos archivos **generados**: `lore/enrutamiento.md` (la tabla) y `.claude/settings.local.json` (el acceso a los árboles vivos). **No copia nada** salvo que se encienda la copia. |

> **Federar es apuntar, no copiar.** Cada fila del manifiesto es una **dirección**: la tabla dice qué
> Lore gobierna una tarea y el acceso generado deja que la sesión lo alcance **donde vive**. Ese
> criterio conserva un solo dueño y una sola versión — la misma regla DRY del resto del kit, donde un
> proyecto referencia los módulos de su Área en vez de duplicarlos.

**Un Área se federa como se abre:** `lore` **más** su `CLAUDE.md` y su `FASES.md`. Federar solo su
`lore/` es la asimetría a evitar, y es invisible desde adentro: las **leyes** del Área viven en el
Lore, pero la **secuencia de trabajo** —qué se lee primero, con qué skill cierra un entregable— vive
en su `CLAUDE.md`, y el **registro de qué existe y dónde** en su `FASES.md`, incluidos los proyectos
adoptados por ruta. Un bot que se lleva solo el Lore cita cada regla correctamente y trabaja distinto.

**El acceso se declara, no se infiere:** `"trabajo": true` va **solo en proyectos**. La carpeta de un
Área contiene todos sus proyectos, incluidos los que el alcance dejó fuera, y conceder cada `origen`
los abriría por la puerta de atrás. Un Área se consulta; en un proyecto se trabaja.

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
texto (extraer antes — `sync.js` solo mueve `.md`, `.txt` y `.json`, así que lo no extraído es
invisible y no avisa). El reporte de esa clasificación es parte del brainstorm.

**Registro con el usuario:** la skill pregunta tres cosas —nombre, para qué se va a usar, y dónde
están las carpetas útiles— **en lenguaje simple**. El vocabulario denso (canon, destilar, frontera de
validez, Pista Invariante) es del documento de la skill, no de la conversación.

**Crea / actualiza:**

- `CLAUDE.md` — **el bot**: configuración de primer uso, carga del canon, enrutamiento, ejecución y
  propuesta de destilación al cerrar. Se carga solo por abrir la sesión en esa carpeta.
- `canon/*.md` — el criterio que el bot **es**, con su origen y su frontera de validez declarados en
  cada módulo.
- `lore/`, `FASES.md`, `README.md`, `.gitignore`.
- Modo `federar`: `scripts/ecosistema.json`, `scripts/sync.js`, y los generados `lore/enrutamiento.md`
  y `.claude/settings.local.json` (local, nunca se versiona).
- **Solo si se empaqueta (§ opcional):** `.claude-plugin/plugin.json` y `marketplace.json`, el
  comportamiento se muda a `skills/{slug}/SKILL.md` con su `canon/` adentro, `scripts/validar.js`
  (puerta de empaquetado) y `LICENSE`.
- Registra el bot en el `FASES.md` del Área.

**Los tres cuerpos de criterio (invariante central):**

| Cuerpo | Qué es | Regla |
|---|---|---|
| `canon/` | criterio que el bot **es**; se carga antes de cada decisión | destilado (viaja dentro de la skill si se empaqueta) |
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

- Brainstorm del canon **antes** de crear nada (HARD-GATE).
- Destilar el canon **desde la fuente**, nunca desde otro destilado ni desde el conocimiento propio
  del modelo. Cada módulo nombra su origen y dónde deja de valer.
- Enrutar **por tipo de tarea, no por nombre de proyecto**; ante ambigüedad entre dos Lore, preguntar.
- Cerrar **toda** tarea con una propuesta de destilación, reportando lo descartado.
- Escribir los informes **negativos con su cobertura en la misma frase**: *«ninguna de las leyes que
  cargo se viola»*, nunca *«está bien»*. Un bot apunta a criterio ajeno, así que hereda su cobertura
  **y su silencio** — lo que nadie cicatrizó no está escrito, y su ausencia del corpus se ve igual
  que su ausencia del trabajo.
- Modo `federar`: un solo manifiesto genera la tabla, el acceso y la poda, para que no puedan
  desincronizarse; `enrutamiento.md` no se edita a mano y la sincronización va en una sola dirección.

**El primer uso es un brainstorming, no un formulario:**

El kit hace un brainstorming para construir cada artefacto que produce, así que el artefacto no
recibe a su primer usuario con cuatro campos que rellenar. Si hay una skill de brainstorming
instalada, el bot corre el primer uso a través de ella; si no, corre uno mínimo él mismo. Tres
movimientos:

1. **Muestra qué alcanza antes de preguntar nada** — cada cuerpo federado con si resuelve *en esta
   máquina*, qué destila el canon, qué queda fuera de alcance. Esa pantalla es también el
   pre-flight: un puntero roto aparece delante de quien puede arreglarlo.
2. **Pregunta solo lo que cambia comportamiento**, de a una pregunta, y **nunca con opciones cerradas
   para un campo que decide una rama**. Una lista cerrada no tiene default para la respuesta que
   nombra dos de sus ítems, así que la pregunta se hace por su **condición** —*«¿tu trabajo cae en
   más de uno de estos?»*— y una respuesta que nombra dos cuerpos de criterio abre por los dos. El
   tono y el apodo no se preguntan: se infieren y se corrigen en una frase.
3. **Cierra separando configuración de criterio.** La configuración va a `.{slug}.json`; lo que
   resultó ser criterio se propone **al Lore de quien lo pagó con experiencia**, nunca se guarda en
   el bot.

**Configurar el primer uso no es el primer uso.** Ese gate se contesta igual con el canon vacío y las
rutas rotas, así que pasarla no prueba nada sobre si el bot funciona. El bot se reporta terminado después de un
**estreno**: una instrucción que no nombra el criterio, anotada **textual** en el `FASES.md` del
Área — una parafraseada ya no permite juzgar si era corta.

**Opcionales, apagados por defecto:**

- **La copia del ecosistema** (`lore-ecosistema/`): solo si quien va a usar el bot **no** tiene el
  árbol de carpetas. Apagarla son **dos pasos** —`"copia": false` y borrar la carpeta—; hacer solo el
  primero deja una foto congelada que el bot sigue leyendo, y `sync.js` avisa en vez de borrarla.
- **Empaquetarlo como *plugin* compartible**: solo si **otras personas** van a instalarlo. Para una
  sola persona, abrir la carpeta basta, y el empaquetado cobra mantención para siempre.
- **Cifrado** (*experimental*, ver [`ENCRYPTION.md`](./ENCRYPTION.md)): se cifra en distribución,
  nunca en consulta. El `.gitignore` depende de la decisión — con cifrado se excluye el texto plano;
  sin cifrado el criterio **debe** commitearse, o el repositorio viaja sin criterio y el bot no le
  sirve al equipo. La passphrase se pide por *stdin* y **nunca entra al chat**.

Un bot sin ninguno de los tres está completo.

Usa `create-bot` cuando ya tengas varios proyectos con Lore que valga la pena llevar a una sola
sesión de trabajo. No sustituye construir ese Lore: lo federa.

---

### 3.7 `obsidian-lore`

**Propósito:** gobernar el solape entre una vault de Obsidian y el Lore cuando comparten árbol de
archivos, y convertir notas sueltas en criterio a través de `save-to-lore`.

**Precondición:** la vault debe ser la **carpeta madre que contiene las Áreas**, no una carpeta al
lado. La skill verifica que al menos un hijo directo de la raíz tenga `lore/`; si no, se detiene y
apunta a `create-area`. La ruta nunca se asume: es la del árbol de cada usuario.

**La bandeja:** una carpeta nombrada en el idioma del usuario (`notas/` en español). El barrido es
recursivo sobre `**/*.md`, así que las subcarpetas quedan a criterio de quien escribe; la skill no
impone ninguna.

**Recomendación permanente: la bandeja vive en un bot.** No es una opción entre varias, es la
configuración para la que esta skill fue diseñada, y la skill la recomienda en su primera ejecución
y cada vez que un barrido ocurre fuera de un bot. La razón es el enrutamiento: un bot lleva
`lore/enrutamiento.md`, donde está escrita la finalidad de cada Área y proyecto que federa, así que
una nota se enruta **contra esa tabla** y los casos frontera se preguntan en vez de adivinarse. Fuera
de un bot, el enrutamiento sale de una sola ruta y de la lectura del texto: una conjetura con la
misma cara de certeza. Si el usuario no tiene bot y sus notas tocan más de un Área, la skill propone
`create-bot`.

**Vive donde se abre la sesión**, y esto no es cosmético:

| Sesión abierta en | Su bandeja |
|---|---|
| Un **bot** ← *recomendado* | `<bot>/notas/` |
| Un proyecto o un Área | el `notas/` de esa carpeta |
| **La raíz de la vault** | **ninguna. La raíz nunca tiene bandeja** |

**La raíz nunca tiene bandeja, y es ley, no orden.** Una nota escrita en la raíz no tiene dueño ni
tabla contra la cual enrutarse, y el fallo es silencioso — una sesión solo alcanza la carpeta donde se
abrió más las rutas de su `.claude/settings.local.json`, que nunca incluye la raíz, así que el barrido
no la lee, no falla y **reporta deuda cero**. La nota queda intacta, que es justo el estado que la
destilación existe para romper. Una nota que no pertenece a ningún proyecto significa que **falta el
proyecto** (`create-project`), no que haga falta una bandeja huérfana.

**Y el motivo no es que nadie trabaje en la raíz — alguien sí trabaja.** Todo lo que tiene que estar
por encima de todas las Áreas vive ahí: un launcher que enruta a todas, una spec que decide un Área
nueva, un script que recorre el árbol entero. La raíz es **un lugar de trabajo sin Lore** — sin dueño,
sin `FASES.md`, sin bandeja y sin ningún `CLAUDE.md` que cargue las reglas que habrían hecho registrar
lo que pasó. Así que el silencio va un paso más allá del párrafo anterior: **el trabajo mismo queda sin
registrar**, y no se escribe ninguna nota que un barrido pueda encontrar. Cuando es ese el caso, lo que
falta está un nivel por encima del proyecto: un **Área** (`create-area`). Hasta que exista, la nota va
a la bandeja del Área que pidió el trabajo, nunca a la raíz.

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
| **Capturar** | Escribe un `.md` en la bandeja con ese frontmatter. Nunca dentro de `lore/`, y nunca toca `identidad.md`, `principios.md`, un módulo, `FASES.md` ni `CLAUDE.md`. |
| **Minar** | Barre la bandeja, reporta la deuda, clasifica, enruta, propone y espera aprobación. La escritura la ejecuta `save-to-lore`. |

**Las cuatro cubetas.** El discriminador no es la calidad de la nota: es si registra una
**transformación** o solo un **hecho**.

| La nota registra | Qué es | Destino |
|---|---|---|
| Una fricción **resuelta** | experiencia | `save-to-lore` **capture** |
| Una **tarea**, un pendiente o una fricción **abierta** — *«hay que añadir X»* | estado | `FASES.md` |
| Criterio ajeno que **juzga** | criterio importado | `save-to-lore` **arbitrate** (sin derrotas no entra) |
| Un resumen, una cita, un enlace, un apunte | información | fuente de `create-area` / `create-project` / `transmute-lore`, o **ruido informado** |

Existe un quinto destino, más raro: una nota que cambia **cómo se trabaja en conjunto** (qué se lee
primero, con qué cierra un entregable) pertenece a `CLAUDE.md`, no al Lore.

**Enrutamiento**, en orden, deteniéndose en el primero que resuelva: el `origen` de la nota → si la
sesión corre en un bot, su `lore/enrutamiento.md` → el proyecto o Área donde corre la sesión →
**ambiguo entre dos cuerpos, se pregunta**. La primera vez que se resuelve una ambigüedad, la
**frontera** puede valer como Pista; el filtro de ruido también aplica ahí.

**Idempotencia y ciclo de vida:** al cerrar, cada nota minada recibe su `destilado:` con fecha y
destino — incluidas las que no produjeron nada (`nada` es un resultado legítimo). Una nota con
`destilado` no vacío se salta en los barridos siguientes. **La skill nunca borra una nota:** se mina
antes de borrar, y borrar lo decide el humano.

**Por qué un barrido y no un comando disponible.** Una nota satisface las ganas de preservar sin
producir criterio: existiendo el registro, la destilación no ocurre y el criterio queda inerte
adentro. Separar las notas del Lore no lo evita — ya se hizo, y el registro siguió inerte seis
semanas. Lo que lo evita es el barrido y su deuda visible, que `save-to-lore` también reporta al
cerrar.

Usa `obsidian-lore` cuando ya acumules notas y quieras que dejen de ser solo notas. No es un gestor
de notas: `Read` y `Grep` ya leen la vault.

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

### 4.6 `CLAUDE.md`

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

---

### 4.7 `golden-paths.md` (opcional)

**Ámbito:** Proyecto o Área (nivel raíz).

**Propósito:**

- Documentar las rutas/flujos críticos que deben verificarse manualmente (por ejemplo, rutas web
  clave en un Área de frontend).

No es uno de los seis artefactos obligatorios: `create-area` y `create-project` solo lo generan
cuando el dominio lo justifica (por ejemplo, un Área web con rutas críticas). Si el dominio no lo
necesita, simplemente no existe.

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
    CLAUDE.template.md
    FASES.md
    golden-paths.template.md   → solo si el dominio lo justifica
  FASES.md                     → registro de proyectos del Área
  CLAUDE.md                    → contrato del Área

  proyectos/
    {slug}/
      lore/
        identidad.md            → contenido propio + puntero al del Área
        principios.md           → contenido propio + puntero al del Área
        index.md                → apunta a los módulos del Área por ../../../lore/<módulo>.md
        <módulos propios>.md    → solo criterio específico de este proyecto
      FASES.md
      CLAUDE.md
```

Puntos clave de esta jerarquía:

- Los proyectos **siempre** viven en `{área}/proyectos/{slug}/`, nunca directamente bajo el Área.
- Los módulos temáticos genéricos **no se copian** al proyecto: viven una sola vez en
  `{área}/lore/`, y el `index.md` del proyecto los referencia por ruta relativa. Esa ruta sube
  **tres** niveles (`lore/` → `{slug}/` → `proyectos/` → `{área}/`), no dos.
- El criterio compartido vive en el Área. El criterio específico de proyecto vive en el proyecto.

---

## 6. Invariantes operativas

El comportamiento de Lore está gobernado por un conjunto de invariantes compartidas:

- **El Lore se escribe en el idioma del usuario** – contenido y nombres de artefactos; solo `CLAUDE.md`, `lore/`, `index.md`, `golden-paths.md` y los términos técnicos de uso general en inglés permanecen fijos.
- **El criterio nunca se inventa** – todas las reglas provienen de experiencia real.
- **Todo proviene de trabajo real** – experimentos, incidentes, decisiones.
- **El ruido descartado se informa** – nada se elimina en silencio.
- **Todo cambio pasa por un HARD-GATE** – el criterio debe revisarse antes de escribirse.
- **Nada hace commit automáticamente** – la revisión humana es obligatoria.
- **Un humano revisa siempre el diff final** – la IA asiste, pero no modifica Lore en secreto.

Estas invariantes distinguen a Lore de herramientas genéricas de notas o logs:  
el objetivo es mantener un cuerpo de criterio confiable, curado por humanos, del que la IA pueda depender.

---

## 7. Relación con README y otros docs

La documentación de Lore suele dividirse así:

- `README.md` – historia, motivación, visión de arquitectura, instalación y comparación de alto nivel con documentación tradicional.
- `USAGE_en.md` / `USAGE_es.md` – guías prácticas de uso y flujos de trabajo.
- `REFERENCE_en.md` / `REFERENCE_es.md` – esta referencia técnica del modelo.
- `MIGRATION_en.md` / `MIGRATION_es.md` – estrategias y ejemplos de migración para proyectos heredados.
- `ENCRYPTION.md` – el cifrado opcional y experimental del criterio de un bot (inglés y español).

Todos estos archivos viven en la raíz del repositorio (no hay una carpeta `docs/`).

Separar referencia de uso y narrativa facilita:

- Consultar el comportamiento exacto de un skill o la semántica de un artefacto.
- Mantener el README enfocado y legible.
- Evolucionar patrones de uso sin romper el modelo subyacente.
