# Plugin Lore – Guía de Uso

Esta guía muestra cómo usar Lore con **Claude Code, Codex u otro agente de IA compatible con skills**
en el trabajo diario: crear Áreas y proyectos, capturar criterio después de resolver problemas y
mantener tu Lore limpio y útil.

> Lore es un kit ligero y neutral al proveedor de Spec‑Driven Development (SDD) para agentes de IA.
> Te ayuda a preservar el **criterio** detrás de tus decisiones, para que tu IA nunca tenga que empezar desde cero.  
> La analogía más cercana: fine-tuning local de tus tareas, y el que entrena eres tú.

Lore Plugin es el brazo técnico de LUS: empezar pronto una memory card profesional hace que el criterio ganado viaje entre modelos contigo. La productividad puede seguir; no es el propósito. El README conserva las fuentes y la frontera de evidencia.

---

## 1. Visión general

Lore organiza la experiencia en **criterio** que sigue participando en decisiones futuras:

- Resuelves un problema con IA.
- En lugar de simplemente seguir adelante, capturas la *razón* detrás de la solución.
- Ese criterio se guarda en artefactos Markdown que un agente de IA puede reutilizar en sesiones posteriores.

El plugin Lore agrupa un conjunto de **skills** que implementan este ciclo:

- `use-lore` – punto de entrada y navegación.
- `brainstorming-lore` – diseña cambios en artefactos Lore antes del gate de la skill dueña.
- `create-area` – Lore compartido para un grupo de proyectos.
- `create-project` – Lore a nivel proyecto que hereda de un Área.
- `save-to-lore` – captura criterio después de resolver un problema.
- `transmute-lore` – añade, limpia, traduce, actualiza o cristaliza un cuerpo de Lore existente.
- `create-bot` – un lugar para trabajar en varias Áreas o proyectos con su criterio cargado.
- `obsidian-lore` – captura notas libres en el mismo árbol y **mina** esa bandeja buscando criterio.

> **El Lore habla tu idioma.** Aunque los skills están escritos en inglés, todo lo que generan —
> contenido **y nombres de artefactos** — se escribe en el idioma en el que trabajas. `identidad.md`,
> `principios.md`, `FASES.md` son las formas canónicas en español (las que usa esta guía); en inglés
> serían `identity.md`, `principles.md`, `PHASES.md`. Solo permanecen fijos el nombre del contrato
> elegido (`CLAUDE.md` o `AGENTS.md`), `lore/`,
> `index.md` y los términos técnicos de uso general en inglés (workflow, commit, stack…).

---

## 2. Requisitos previos

Instala Lore por la ruta de tu agente. Para **Claude Code**:

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Para **Codex CLI**:

```bash
codex plugin marketplace add andresanemic/lore-plugin
codex plugin add lore@lore-plugin
```

Para **OpenCode**, copia las ocho carpetas de `skills/*` desde un clon local a
`~/.config/opencode/skills/` y abre una sesión nueva. OpenCode también acepta la misma estructura
en `.opencode/skills/` para una instalación local al proyecto.

Para **Cursor**, una instalación existente en `~/.codex/skills/` o `~/.agents/skills/` se descubre
automáticamente. Si no existe, copia las ocho carpetas en `~/.cursor/skills/` y reinicia Cursor.

Para **Google Antigravity**, copia las ocho carpetas en `~/.gemini/config/skills/` para todos los
proyectos, o en `.agents/skills/` dentro de uno, y reinicia Antigravity.

Para un clon local, ambas CLI u otro agente compatible con skills, usa la
[instalación directa del README](../README.md#instalación-directa-desde-el-repositorio).

Después de instalarlo, invoca Lore con lenguaje natural. `use-lore` es el primer prompt más seguro.

---

## 3. Ciclo central: usar Lore en el día a día

El ciclo cotidiano de Lore es:

1. Trabajas con tu agente de IA para resolver un problema en tu proyecto.
2. Decides si la solución reveló **criterio** que debería afectar decisiones futuras.
3. Usas `save-to-lore` para capturar ese criterio en tu Lore en Markdown.
4. Permites que las sesiones futuras reutilicen ese criterio en lugar de empezar desde cero.

### Ejemplo: capturar un bug de hidratación

Tú y Claude depuran un problema de hidratación en Next.js.  
En lugar de solo corregirlo, quieres capturar la regla detrás de la solución.

Podrías pedir:

```text
save-to-lore "Problema de hidratación con opacidad inicial en Next.js"
```

Lore te ayudará a:

- Extraer las **Pistas Invariantes** (por ejemplo: «Nunca utilices estado del cliente para controlar la opacidad inicial»).
- Decidir si esto pertenece a módulos a nivel proyecto o a principios a nivel Área.
- Actualizar los artefactos Markdown apropiados (`principios.md`, algún módulo temático, etc.).

---

## 4. Primeros pasos: tu primera Área y proyecto

Lore escala mediante **Áreas**.  
Un Área es una carpeta madre que posee criterio compartido; los proyectos lo heredan en lugar de duplicar reglas.

### 4.1 Crear un Área

Piensa en un Área como un dominio tipo «Frontend», «Backend» o «Experimentos de producto».

Pídele a tu agente:

```text
create-area "Desarrollo Frontend"
```

Lore:

- Crea una carpeta para el Área.
- Inicializa artefactos a nivel Área:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos dentro de `lore/`, según se necesiten.

### 4.2 Crear un proyecto dentro de un Área

Ahora quieres que un proyecto concreto herede ese Lore de Área.

```text
crea un proyecto "Landing Lore" en el área "Desarrollo Frontend"
```

Lore:

- Crea la carpeta del proyecto **siempre dentro de** `{Área}/proyectos/{slug}/` — nunca directamente bajo el Área.
- Si el Área tiene una carpeta `_starter/`, instancia sus plantillas en el nuevo proyecto.
- Configura los artefactos a nivel proyecto:
  - `lore/identidad.md` y `lore/principios.md`, con contenido propio primero y un puntero al Área después.
  - `lore/index.md`, que referencia los módulos temáticos del Área por ruta relativa (`../../../lore/<módulo>.md`).
  - `FASES.md` en la raíz para estado y hoja de ruta.
  - el contrato elegido en la raíz para colaboración y referencias operativas.
- Registra el proyecto en el `FASES.md` del Área, de modo que el criterio general se herede sin duplicarse.

### 4.3 Trabajar y capturar

Una vez que tu Área y proyecto existen:

1. Trabaja en el proyecto con tu agente de IA como siempre.
2. Cada vez que resuelves un problema que revela criterio reutilizable, llama a:

   ```text
   save-to-lore "Descripción corta del problema/decisión"
   ```

3. Revisa lo que Lore propone y edita los artefactos Markdown si lo ves necesario.

---

## 5. Skill por skill: cómo usarlos

### 5.1 `use-lore` – Punto de entrada y navegación

**Propósito:** ayudarte a entender el modelo de Lore y dirigirte al skill adecuado.

Uso típico:

```text
use-lore
```

Puedes pedir cosas como:

- «Explícame la arquitectura de Lore para este proyecto.»
- «Muéstrame los artefactos que existen ahora.»
- «Guíame al skill correcto para capturar una nueva pista invariante.»
- «Construye este entregable complejo desde varias fuentes y entrégalo en el sistema destino.»

`use-lore` es el lugar más seguro para empezar si no tienes claro qué skill usar a continuación.

**Y si es tu primera vez, no necesitas saber ningún nombre.** Escribe algo como *«quiero comenzar a
usar Lore Plugin, ayúdame»*: eso abre un **brainstorming, no un menú de comandos**. Primero mira tu
árbol y te muestra qué hay, después pregunta de a una cosa por vez siguiendo tus respuestas, y
**termina creando tu primer artefacto** — nunca con una lista de ocho skills ni con una
recomendación. El kit brainstormea para construir todo lo que hace; sería incoherente que su propia
puerta de entrada fuera un menú.
Para **entregables complejos** fija el proyecto dueño, el Lore enrutado, un precedente aprobado y las capacidades que tus herramientas realmente tienen, y avanza después en lotes revisables con revisión humana y entrega comprobada — sugiriendo `/model` en un nivel más barato para el tramo mecánico, porque un subagente relee todo el árbol de Lore y quema justo los tokens que este movimiento ahorra. La skill de dominio sigue siendo dueña de cada medio y herramienta.

---

### 5.2 `brainstorming-lore` – Diseñar cambios de Lore antes de escribir

**Propósito:** explorar un artefacto Lore nuevo o materialmente distinto sin quitarle la propiedad a la skill que lo va a escribir. Normalmente la invocan `create-area`, `create-project` o `create-bot` antes de su umbral; también puedes invocarla directamente:

```text
haz brainstorming de este Lore antes de reestructurarlo
```

Primero lee el criterio vigente, pregunta de a una decisión que cambie el diseño, compara solo los caminos que importan y entrega el diseño a la skill dueña. Con canon provisional pregunta solo lo que necesita una primera victoria. Cada respuesta aprobada entra en un artefacto acumulado que recapitula en hitos — el piso es la **continuidad reconocible**: seguís viendo tu intención y podés corregir el rumbo sin recomenzar. Los avances autónomos se resincronizan con destilación aprobada; el esfuerzo es fértil mientras la corrección deja movimiento reconocible; si deja de dejarlo, frená y repará el proceso. Una auditoría de solo lectura, una edición mecánica pequeña o un plan ya aprobado no la necesitan.

**Segundo caso (2.3.0):** además de los artefactos que Lore posee, entra cuando un `lore/` enrutado **gobierna cómo se produce un entregable** — un lote de posts, un informe — y el diseño consiste en decidir cómo correr criterio ya escrito. El predicado se responde antes de invocar nada; si el Lore solo aportaría color de fondo, no entra, y el traspaso va a la fase que gobierna, nunca a un planificador tercero.

---

### 5.3 `create-area` – Lore compartido para un dominio

**Propósito:** crear una raíz de Lore compartida para un dominio (Área).

Ejemplo de prompt:

```text
create-area "Frontend asistido por IA"
```

Lore:

- Crea una carpeta para el Área.
- Inicializa artefactos a nivel Área:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos bajo `lore/`.
- Opcionalmente explica para qué sirve cada artefacto y cómo extenderlo.

El `_starter/` que escribe lleva el **piso estructural** (2.1.5): always-on de cuatro cosas, `FASES` fuera de `lore/`, umbral en presente, heredar por ruta. Si el Área es `bots`, la variante es `canon/` + tabla de enrutamiento, no `identidad` en el bloque. El oficio de esa Área se destila en el brainstorm; no se clona de otra.

Usa este skill cuando quieres que varios proyectos compartan un conjunto común de criterios.

---

### 5.4 `create-project` – Lore con alcance de proyecto

**Propósito:** crear un proyecto que hereda Lore desde un Área.

Ejemplo de prompt:

```text
crea un proyecto "Sitio de marketing" en el área "Frontend asistido por IA"
```

Lore:

- Crea la carpeta del proyecto en `{Área}/proyectos/{slug}/` — nunca directamente bajo el Área.
- Prepara:
  - `lore/` para módulos específicos del proyecto (los módulos genéricos del Área solo se referencian, nunca se copian).
  - `FASES.md` en la raíz para estado y hoja de ruta.
  - un contrato en la raíz: `CLAUDE.md` cuando el Área usa Claude Code o `AGENTS.md` cuando usa
    Codex. El proyecto hereda la elección del Área.
- Conecta el proyecto con el Lore del Área, de modo que el criterio compartido esté disponible sin duplicación.

Usa este skill siempre que inicies una nueva base de código dentro de un dominio que ya tiene un Área.

---

### 5.5 `save-to-lore` – Capturar criterio tras resolver un problema, o injertar criterio ajeno

Mantén candidatas mientras continúa la sesión. Sugiere captura en un hito contextual o cuando se acumulen pistas relacionadas; muestra destino, redacción y por qué ahora, y deja que una vista aprobada cubra las escrituras y commits correspondientes.

**Propósito:** destilar criterio reutilizable. Tiene **dos modos**, según de dónde venga ese criterio:
**capture** (fricción vivida) y **graft** (criterio importado de una skill, una guía ajena o el
documento de gobierno de otro kit).

> *Renombrado en 2.1.1 (`arbitrate`, luego `transplant`). Misma ley, mismas cuatro puertas: un injerto es tejido ajeno unido a un patrón vivo — echa raíces o es rechazado, y lo que crece después es del huésped.*

#### Modo `capture` (por defecto) — la cicatriz

Ejemplos de prompts:

```text
save-to-lore "Bug de hidratación en landing de Next.js"
save-to-lore "Decisión: siempre preferir renderizado estático en páginas de marketing"
save-to-lore "Estándar: los mensajes de error deben ser humanistas y accionables"
```

#### Modo `graft` — la skill ajena

Ejemplos de prompts:

```text
save-to-lore "destila la skill copywriting en el lore del área"
save-to-lore "injerta esta guía de estilo contra nuestro estándar"
```

Una skill es criterio **ya destilado por otro, bajo otra finalidad**, y llega sin decir dónde deja de
valer. Copiarla al Lore produce literatura redundante con la autoridad de una Pista Invariante.
**Por eso no se destila: se arbitra.**

Lore hará tres cosas que conviene esperar:

- **Te preguntará si la fuente trae capacidad o criterio.** Una skill que *ejecuta* (renderiza video,
  hace un *crawl*) **no es Lore**: se usa como dependencia. Solo se arbitra la que *juzga* (qué es
  buen copy, buen diseño, buen SEO).
- **Se negará a arbitrar si tu `identidad.md` está vacío.** Sin estándar propio no hay vara: lo único
  que podrías hacer frente a una fuente con autoridad es obedecerla. Primero la identidad.
- **Exigirá una sección de derrotas.** El módulo resultante debe registrar **dónde la fuente
  contradice tu estándar y pierde**. Sin esa sección no entra nada — o fue una copia, o la fuente no
  traía criterio.

> **Lo que la fuente pierde vale más que lo que la fuente aporta.** El resumen ya existe, y mejor
> escrito, en la fuente. El desacuerdo no existe en ningún otro lado, y es lo único que restringirá
> una decisión futura tuya.

Tres casos que conviene conocer antes de correrlo:

- **Un documento de gobierno es el caso más difícil.** La constitución de otro kit es criterio escrito bajo su finalidad, y su cláusula de supremacía es exactamente de las que **pierden**: un kit instalado esta semana no puede gobernar criterio que pagaste antes de que existiera. Esa derrota se **escribe**, no se omite — una omisión deja un hueco que la próxima regeneración de plantilla vuelve a llenar.
- **En calendario, empieza leyendo lo que ya perdió** y no lo vuelve a arbitrar. **«Esta vez no entró nada» es un resultado válido** y se escribe así — una pasada recurrente que siempre encuentra algo dejó de mirar y empezó a justificarse.
- **Una herramienta que *invocas* también trae criterio.** Pasale tu Lore en la invocación: casi todas aceptan que una muestra provista les gane a sus valores por defecto, y las que no la tienen son capacidad — se mantienen lejos de lo que tu Lore gobierna. **Una herramienta no es neutral por ser útil.**

No hace falta pedirlo siempre de forma explícita: si acabas de resolver una fricción que cumple un
**umbral de 4 condiciones** (restringe una decisión futura, es destilable a Contexto→Causa→Pista,
es accionable, y le serviría a otro proyecto del Área), Lore puede proponer guardarla por su
cuenta. Los cambios cosméticos nunca cuentan.

Lore normalmente:

- Te pide contexto sobre lo que ocurrió.
- Extrae **Pistas Invariantes** (criterio que restringe decisiones futuras) y las guarda como
  `conjecture` por defecto, o `confirmed` solo si ya se validaron en la app en marcha.
- Sugiere dónde guardarlas:
  - módulos del proyecto bajo `lore/`;
  - `principios.md` del Área si son reglas generales y están confirmadas;
  - actualizaciones de `identidad.md` o del contrato si afectan identidad o colaboración.
- Respeta invariantes:
  - Nunca inventa criterio.
  - Informa el ruido descartado.
  - Requiere revisión humana antes de escribir nada; nunca hace `git push`.
  - Marca lo ya promovido al Área con el glifo ` · ↑` en el `index.md` del proyecto, para no repetir el trabajo.

Usa este skill como herramienta principal para alimentar tu Lore con el tiempo.

---

### 5.6 `transmute-lore` – Operar un cuerpo de criterio existente

**Propósito:** operar un cuerpo de Lore existente: migrarlo, quitar duplicación, estandarizar su idioma, actualizar su estándar o exportar una copia segura de lectura.

Puedes empezar sin Lore. **ADD** trata carpetas del proyecto, documentos, resúmenes exportados de
chats y notas sueltas como fuentes, y propone el criterio y canon disperso en ellas.
**CRYSTALLIZE** convierte el resultado aprobado en una memory card Markdown trazable y extraíble,
portable entre modelos o compartible en los términos de su dueño, sin reemplazar el Lore vivo.

No es un comando de CLI: el modo se infiere de la frase, no de un flag. Tiene ocho modos:

- `add` – crea artefactos de Lore que aún no existen.
- `clean` – elimina módulos redundantes que ya duplican los del Área (requiere que el proyecto
  tenga una Área madre; si es standalone, este modo no aplica).
- `translate` – estandariza el idioma del Lore: traduce el contenido y renombra los artefactos
  localizables a un único idioma (el que pidas o, por defecto, el tuyo), reescribiendo los enlaces
  afectados y sin tocar estructura, código ni significado.
- `upgrade` – **(v1.2.1; campaña 2.1.4)** pone al día un Lore sano escrito contra una versión anterior de estos
  skills. No está roto: está en el estándar y en uso, y le faltan las puertas que el kit aprendió
  después. Arbitra lo que ya existe contra la versión instalada. Sobre un árbol o un ecosistema: primero el mapa (gits, dónde vive `lore/`, qué contrato se carga), después el grep; no reescribe un índice largo; en un `.md` vivo que manda, `HARD-GATE` pasa a umbral.
- `prune` – **(2.1.0)** quita **peso** a un Lore que se degradó acumulando cosas que por separado son
  correctas — el objetivo cuantitativo es una restricción de aceptación, no una sugerencia. No es lo
  mismo que `clean`: `clean` quita *duplicados*, `prune` quita criterio que no
  está duplicado, no está mal y no está superado, y cuyo único defecto es seguir ahí. Es el único
  modo sustractivo, y **la unidad que cuenta es el entregable, no el Lore** — te va a preguntar qué
  publica tu proyecto antes de leer un solo módulo. Desde **2.3.0** corre antes un **barrido MYCELIUM**,
  de solo lectura: el criterio que ningún paso corre se parece exactamente a lo que sobra, y quitarlo es
  el único corte que este modo no puede deshacer. **Y vuelve a correr al cerrar**, porque una poda
  cambia juntas y no solo volumen: puede haberse llevado el paso que corría una Pista que dejó viva.
- `micelio` – **(2.3.0)** ¿puede el Lore disparar de verdad? Recorrido de solo lectura que reporta qué
  Pistas quedaron **sin micorriza**: ningún paso de ningún procedimiento las corre, así que no pueden
  dispararse. Reporta pares —Pista ⇢ la junta que falta— y una **tasa, nunca un puntaje**: un
  porcentaje invita a subirlo borrando lo desconectado (`H14`). Tres disparadores: antes de una tarea
  compleja, justo después de instalar o actualizar el kit, y automáticamente al salir de cualquier
  pasada que **escribió criterio y tocó enrutamiento** — una pasada que escribe fabrica exactamente el
  defecto que esto detecta, así que la pasada de salida nunca es la de entrada repetida, y nunca vuelve
  a reportar lo que ya declinaste. Desde el 2026-08-22 el barrido también recorre carpetas de fuente
  (`docs/`, `notas/`) buscando lenguaje imperativo: criterio que aterrizó ahí no puede ni clasificarse,
  y su reparo son dos movimientos — adentro de `lore/` primero, y recién ahí colgarle un paso. Ojo con
  `Junta a otro árbol`: la junta existe pero nombra un artefacto que esta sesión no carga — el reparo es
  nombrar el paso donde el trabajo de verdad corre, no escribir la Pista otra vez. Corre en silencio:
  una pasada limpia no dice nada.
- `leave` – **(2.3.0)** deja el Lore sin perder el proyecto — quita el gobierno (`<!-- lore:always-on -->`) pero conserva `lore/` y el enrutamiento como `enrutamiento.md` plano, dejando `FASES.md` con marca `leave:` para que `UPGRADE` pueda volver. El proyecto sigue buildeable sin el kit (H13).
- `crystallize` – exporta el Lore vivo y enrutado como un solo Markdown seguro y trazable para un
  chat, proyecto de IA o notebook. La fotografía es derivada, puede quedar obsoleta, nunca
  reemplaza la fuente, y se puede **extraer** de vuelta a una carpeta cuyo enrutamiento resuelve.

**Sobre `upgrade`, que es el modo que más fácil se malinterpreta.** No es un reescribir ni un pase
de estilo. Clasifica cada hallazgo en cuatro tipos, y ese etiquetado es lo que impide que degenere:

| Tipo | Qué significa |
|---|---|
| **Missing** | el kit ahora exige algo que ese artefacto nunca tuvo (una frontera de validez, un marcador de confianza, la sección de derrotas de un módulo importado) |
| **Superseded** | el kit ahora sabe que esa práctica está mal, y se cita qué regla la reemplaza |
| **Earned** | se aparta del estándar actual **porque este proyecto lo pagó con fricción real**: se deja como está y se anota por qué **en `FASES.md`** —una línea por excepción, nunca dentro del artefacto que defiende— para que el próximo upgrade no lo vuelva a marcar |
| **Stale** | coincide con el kit y ya no coincide con **el proyecto**: describe una práctica que cambió y nadie enmendó el texto. Se detecta contra el repositorio, nunca releyendo, y la corrección la enuncia el usuario |

Lo ganado con experiencia le gana a cualquier mejora que el kit aprendió después. Una lista de
hallazgos sin ningún `Earned` en un Lore con historia es señal de que el pase se está corriendo como
formateador. Además: la confianza **nunca** sube por antigüedad —una conjetura que sobrevivió tres
versiones sigue siendo conjetura— y una frontera ausente se **pregunta**, no se infiere.

**Desde 2.1.4, el upgrade de un árbol no se lee entero:** se nombra primero dónde está cada git y cada `lore/`; se deja registro fechado; un índice largo recibe cabecera de formato sin reescribir fila por fila; falta `identidad.md` es ADD, no este modo; en campaña el umbral es por clase — el primer árbol la muestra, los siguientes la aplican.

**`Stale` es el que ninguna lectura encuentra**, y por eso se detecta contra el repositorio y nunca releyendo: el texto viejo se lee perfectamente coherente, y eso es justamente lo que impide notarlo.

**Sobre `prune`, el único modo sustractivo.** Clasifica cada hallazgo en cuatro tipos propios, y
cuenta antes de leer — porque el defecto que existe para atacar es invisible leyendo los archivos de
a uno, ya que cada ley por separado está bien:

| Tipo | Qué significa |
|---|---|
| **Deadwood** | no restringe ninguna decisión futura: la decisión que alguna vez moldeó ya no existe, o se adoptó de otro lado y nunca mordió |
| **Crowding** | correcto, ganado y no refutable, y aun así su *suma* con los demás satura el entregable. **No** sale: recibe una frontera de validez, un destino o un techo |
| **Rooted** | estructural — hay una cicatriz real detrás y una decisión que todavía depende de él. Intacto, y no se vuelve a examinar en el próximo pase |
| **Unhealed** | declarado aplicado y aplicado a medias: la corrección aterrizó en un lugar y no en sus hermanos. Se termina o se desmarca |

Una lista de poda **sin ningún `Rooted`** es un pase corrido como motosierra — el espejo de `Earned`,
y existe por la misma razón: un modo que solo quita siempre va a encontrar algo que quitar. Nada sale
sin dejar su residuo escrito, y lo que encoge es el entregable, no necesariamente el corpus.

Ejemplos de prompts:

```text
transmuta el lore del "Frontend heredado"
limpia el lore del "Frontend heredado"
estandariza el idioma del lore del "Frontend heredado"
traduce el lore del "Frontend heredado" al español
mejora el lore del "Frontend heredado" con la versión nueva del plugin
arbitra mi lore contra la versión nueva
cristaliza este lore en un solo Markdown para un proyecto de ChatGPT
```

**Precondición:** los modos que modifican artefactos fuente exigen un árbol de Git limpio antes de
escribir. `crystallize` no modifica el árbol fuente: inventaría las fuentes enrutadas, excluye por
defecto material privado o incierto, muestra la vista previa completa y el destino, y espera en su
propio umbral. Sobrescribir una fotografía existente requiere una aprobación separada.

Comportamiento esperado:

- Escanear la documentación y estructura existentes.
- Proponer cómo mapear archivos antiguos a:
  - `identidad.md`, `principios.md`, `index.md`, módulos temáticos.
  - `FASES.md` y el contrato de instrucciones.
- Esperar tu aprobación explícita antes de escribir nada (umbral).
- Garantizar que el resultado sea DRY:
  - Las reglas compartidas van al Área.
  - El proyecto conserva solo el criterio específico; `identidad.md` y `principios.md` nunca se
    eliminan en modo `clean`.

Usa este skill cuando ya tienes proyectos en marcha y quieres incorporarlos a Lore sin reescribirlo todo a mano.

En `crystallize`, la fotografía tiene que servir **sola**: cada `lore/` enrutado (el del bot, el
de las áreas, `lore-ecosistema/` cuando es lo que hay en la máquina) va **íntegro** adentro. Un
archivo que enruta a cuerpos que no contiene no es una cristalización. Cada archivo lleva un
marcador `<!-- lore:extract path="..." owner="..." -->`. Se extrae con el script que viaja con
la skill (`skills/transmute-lore/scripts/crystallize.mjs` — `pack` / `extract`); no se le pide
al usuario que escriba el extractor. El desempaque es una mini-raíz que espeja la `raiz` de
origen, con `ecosistema.json` reescrito para que `enrutamiento.md` resuelva. Regenera desde el
árbol vivo cuando quede obsoleta; nunca edites la exportación como si fuera Lore autoritativo.

---

### 5.7 `create-bot` – Trabajar en varias Áreas o proyectos

En `nuevo`, la declaración inicial es canon provisional. La configuración es el primer artefacto complejo y cierra solo tras una primera victoria revisada. Una interfaz debe ser un laboratorio local honesto que separe canon, lógica y presentación, ponga decisiones antes que prompts y haga que la Travesía siga al propósito.

**Propósito:** construir un **bot**: un solo lugar donde abrir una sesión y **trabajar en varios
proyectos o Áreas a la vez**, con su criterio ya cargado, en vez de responder preguntas sobre ellos.

Un bot vive en `{Área}/proyectos/{slug}/` como cualquier proyecto. Lo distingue una cosa: **enruta
hacia afuera**, hacia el Lore de otros proyectos y Áreas. Las Áreas y los proyectos son lugares; un
bot es una lente que llevas a ellos.

Por defecto **no se instala nada**: es una carpeta con su canon y el único contrato elegido por su
Área. Abrir la sesión ahí carga el criterio en ese host.
Empaquetarlo como *plugin* es opcional y sirve para repartirlo a un
equipo.

> **El test que decide si el bot está bien hecho:** *una instrucción corta basta.* Si tuviste que
> explicarle el proyecto al bot para obtener el resultado, faltaba criterio cargado.

> **El bot es el último paso, no el primero (2.1.1).** Si tus fuentes todavía no tienen Lore, la cadena
> es `create-area` → `transmute-lore add` → `create-bot`, una vez por fuente, y no hay atajo: un bot
> no destila hacia sí mismo. Y el Área que aloja bots es **una sola**, `bots`, con todos ellos dentro
> como proyectos — no un Área por bot, y ningún bot dedicado a administrar a los otros.
>
> **Antes de darlo por terminado, ábrelo como lo va a abrir su usuario** y comprueba que la sesión
> alcanza las rutas del manifiesto. Un host apuntando a la carpeta equivocada no se queja: parece que
> el bot lee el Lore equivocado.

Ejemplos de prompts:

```text
crea un bot para trabajar en HealthProof y Nodo Zero, en el área "bots"
quiero un bot que federe el lore que ya existe en founder y community-manager
```

Tiene **dos modos de creación**, según de dónde salga el criterio:

- `nuevo` – desde 0. El canon nace de un brainstorm + los documentos fuente.
- `federar` – el criterio ya existe, disuelto en varias Áreas. Además del canon genera una tabla de
  enrutamiento (`lore/enrutamiento.md`) y el acceso a los árboles vivos
  (`.claude/settings.local.json`), para poder **trabajar** en esos proyectos y no solo leerlos.

Si el bot ya existe, la misma skill ejecuta una **auditoría** en vez de reconstruirlo. Contrasta el
registro real de la institución, alcance, fuentes, enrutamiento y README; después
retoma el flujo normal de sincronización y verificación.

> **Federar es apuntar, no copiar.** Cada fila es una dirección al Lore donde vive, así que ese
> criterio conserva un solo dueño y una sola versión — igual que un proyecto referencia los módulos
> de su Área en vez de duplicarlos. Un proyecto nuevo creado desde el bot nace en el Área que lo
> posee, heredando su Lore por ruta relativa. Copiarlo a `lore-ecosistema/` es **opcional**, y solo
> hace falta si quien va a usar el bot **no tiene tus carpetas**: ahí el puntero no apunta a nada.

Al empezar te va a preguntar tres cosas, en este orden: **cómo se llama el bot**, **para qué lo vas
a usar**, y **dónde están las carpetas con la información que le sirve**. Después inspecciona esas
rutas él mismo y te reporta qué encontró; no te pide que clasifiques tus propias carpetas.

**Si las carpetas todavía no tienen Lore** —el caso normal— no se federan: se encadena
`create-area` → `transmute-lore (add)` → `create-bot (federar)`. El bot **nunca destila hacia sí
mismo**; el criterio nace en el Área que le corresponde y después se enruta. `create-bot` inspecciona
tus rutas y te dice cuál necesita qué.

Qué esperar mientras corre:

- Te propone el diseño y **espera tu aprobación** antes de escribir nada.
- Mantiene separados los tres cuerpos de criterio: lo que el bot siempre sabe, lo que mantiene al
  bot, y lo que toma prestado de otros proyectos (esto último nunca manda sobre su fuente).
- En modo `federar`, la tabla de enrutamiento y el acceso local se generan solos desde el manifiesto;
  no los edites a mano. Las rutas se escriben **una vez**, ahí.
- Al federar un Área se lleva `lore` **más** su contrato elegido y su `FASES.md`: el Lore trae las leyes,
  pero la secuencia de trabajo y el registro de qué existe viven en esos dos.
- No envuelve el bot como *plugin*. Empaquetar es cristalizar: extraer reconstruye
  `lore-ecosistema/`.

**La primera vez que abres el bot corre un brainstorming, no un formulario.** Arranca mostrando qué
alcanza: cada cuerpo de criterio que federa, si ese puntero resuelve en tu máquina, y qué queda fuera
de alcance. Después pregunta solo lo que cambia cómo se comporta, de a una pregunta — y si tu
respuesta nombra más de un cuerpo de criterio, abre por todos en vez de quedarse con el más parecido.
Si tienes una skill de brainstorming instalada, corre esa conversación a través de ella.

> **Contestar eso no es lo mismo que usarlo.** El gate se contesta igual con el canon vacío y las
> rutas rotas, así que no prueba nada. El bot cuenta como estrenado cuando **una instrucción corta
> que no nombra el criterio produce un entregable real** — esa instrucción es la evidencia, y se
> anota tal cual.

Tres cosas que vas a usar todos los días:

- **Se enruta por tipo de tarea, no por nombre de proyecto.** Decir *«trabajemos en X»* no alcanza si
  X tiene criterio de producto y de comunicación por separado; el bot pregunta cuál.
- **Toda tarea cierra proponiendo qué criterio guardar y dónde.** No espera a que se lo pidas.
- **Un informe negativo viene con su cobertura al lado.** El bot dice *«ninguna de las leyes que
  cargo se viola»*, nunca *«está bien»* — solo puede responder por las cicatrices que alguien ya
  pagó, y lo que nadie cicatrizó no está escrito en ninguna parte.

Un extra es opcional y está apagado por defecto: el **cifrado** (*experimental*, ver
[`ENCRYPTION.md`](./ENCRYPTION.md)). Un bot sin él está completo. **Empaquetar es cristalizar:**
extraer la fotografía reconstruye la carpeta, incluido `lore-ecosistema/`. Así viaja el trabajo
a quien no tiene tu árbol. No envuelvas el bot como plugin.

Usa este skill cuando quieras una sola sesión que trabaje sobre varios proyectos — también desde
cero. Si las fuentes aún no tienen Lore, el skill orquesta la cadena (`create-area` → `transmute-lore`
add → `create-bot`); no exige que el Lore exista de antemano. Cuando ya está, lo federa. El bot nunca
sustituye construir ese Lore en el Área que lo posee.

---

### 5.8 `obsidian-lore` – Capturar y minar notas sin tratarlas como criterio

**Para qué sirve:** si ya escribes notas en Obsidian, ya tienes la materia prima. Este skill gobierna
el solape entre la vault y el Lore cuando comparten árbol de archivos.

**Cómo se prepara:** apunta la vault a la **carpeta madre de tus Áreas** (*Open folder as vault*).
El mismo árbol pasa a ser tu espacio de trabajo y tu vault, sin configurar nada más.

**Trabaja tus notas desde un bot. De forma permanente, no como una alternativa.**

Es la configuración para la que esta skill fue diseñada, y la razón es el enrutamiento. Un bot lleva
`lore/enrutamiento.md`, con la finalidad de cada Área y proyecto que federa escrita ahí. Una nota
barrida desde un bot se enruta **contra esa tabla**, y los casos frontera se preguntan. Una nota
barrida desde una carpeta suelta se enruta con una sola ruta y la lectura del texto: una conjetura
con la misma cara de certeza. Si todavía no tienes bot y tus notas tocan más de un Área, la skill te
va a proponer `create-bot`, y conviene hacerle caso.

**La bandeja vive donde abres la sesión:**

| Sesión abierta en | Su bandeja |
|---|---|
| Un **bot** ← *recomendado* | `<bot>/notas/` |
| Un proyecto o un Área | el `notas/` de esa carpeta |
| **La raíz de la vault** | **ninguna. La raíz nunca tiene bandeja** |

**La raíz nunca tiene bandeja.** Una nota escrita en la raíz no tiene dueño ni tabla contra la cual
enrutarse. Peor: un bot no alcanza la raíz, así que el barrido no la lee, no falla y **reporta deuda
cero**. Si una nota no pertenece a ningún proyecto, lo que falta es el proyecto — `create-project`,
no una bandeja huérfana.

**La raíz es un lugar de trabajo sin Lore, no un lugar donde nadie trabaja.** Todo lo que tiene que
estar por encima de todas las áreas termina ahí: un launcher que enruta a todas, una spec que decide
un área nueva. Lo que la raíz no tiene es dueño, `FASES.md`, bandeja ni contrato que cargue
las reglas — así que el trabajo hecho ahí queda sin registrar y no llega ni a ser una nota que barrer.
Si eso pasó, lo que falta es un **área** — `create-area`, y mientras tanto la nota va a la bandeja del
área que pidió el trabajo.

**Cómo se usa, en dos frases:**

```text
guarda esta nota en Obsidian
revisa mis notas de Obsidian y checa si algo se puede guardar en mi lore
```

La primera escribe un `.md` en la bandeja, nunca dentro de `lore/`. La segunda barre, clasifica,
enruta y **espera tu aprobación** antes de escribir nada.

**Qué hace con cada nota:**

| La nota registra | Adónde va |
|---|---|
| Una fricción que resolviste | Pista Invariante, vía `save-to-lore` |
| Una **tarea** o un problema abierto — *«hay que añadir X»* | `FASES.md`. Es estado, no criterio |
| Criterio ajeno que recogiste | Arbitraje contra tu estándar |
| Un resumen, un link, un apunte de reunión | Ruido, y te lo informa |

Al cerrar, cada nota minada recibe su marca `destilado:` con fecha y destino — **incluidas las que
no produjeron nada**. Esa marca hace el barrido idempotente y hace visible la deuda: cuántas notas
llevan cuánto tiempo sin minar. `save-to-lore` la reporta también al terminar.

**Dos cosas que no hace:** no borra notas (se mina antes de borrar, y borrar lo decides tú) y no
gestiona la vault — `Read` y `Grep` ya la leen.

> **Una nota es fuente, nunca criterio.** Responde *«qué pasó»*; el Lore responde *«qué cambió por
> eso»*. Nada cruza sin destilación explícita.

**Si la bandeja queda dentro de un repositorio**, decide si viaja o va al `.gitignore`. Para un bot
que se entrega a un equipo, lo habitual es que no viaje: son notas sin minar.

---

## 6. Trabajar con los artefactos

Lore utiliza un conjunto fijo de artefactos para mantener el criterio organizado:

- `lore/identidad.md` – identidad del proyecto y estándar mínimo de calidad.
- `lore/principios.md` – reglas permanentes de ingeniería y negocio.
- Módulos temáticos en `lore/` – experiencia destilada agrupada por dominio.
- `lore/index.md` – mapa de navegación del Lore en ese proyecto o Área.
- `FASES.md` (raíz) – estado actual y hoja de ruta del proyecto.
- `CLAUDE.md` **o** `AGENTS.md` (raíz) – el único contrato de colaboración y sus referencias
  operativas, elegido según el host principal. Su sección de punteros va entre marcadores
  `<!-- lore:always-on -->`: ese es el canal siempre-activo del kit, con techo de 25 líneas,
  estampado de forma idempotente por las skills que escriben el contrato y agregado a los contratos
  antiguos por `transmute-lore` UPGRADE. Edita dentro con libertad — el kit reporta la divergencia y
  espera, nunca te sobrescribe. Los marcadores en sí son literales y no se traducen.

Recomendaciones generales:

- Identidad y principios cambian poco; mantenlos breves e intencionales.
- Los módulos temáticos pueden crecer, pero cada uno debería enfocarse en un dominio específico.
- `FASES.md` debe reflejar la realidad; actualízalo cuando el proyecto cambie de fase.
- El contrato debe describir cómo trabajan las personas y el host principal (prompts, rituales,
  restricciones).

---

## 7. Buenas prácticas

Para que tu Lore se mantenga útil:

- Captura solo **criterio**: si no restringe una decisión futura, no lo añadas.
- Prefiere módulos pequeños y enfocados en lugar de documentos narrativos largos.
- Revisa periódicamente tu Lore para fusionar reglas solapadas y eliminar las obsoletas.
- Usa Áreas para todo lo que debería ser compartido; mantén el Lore del proyecto ligero.
- Mantén todo el Lore en un único idioma; si quedó mezclado o en el idioma equivocado, usa
  `transmute-lore` en modo `translate`.
- Revisa siempre el diff que Lore propone antes de confirmar cambios.

Si quieres una visión más conceptual de por qué existe Lore y en qué se diferencia de la documentación tradicional, consulta el [`README.md`](../README.md).
