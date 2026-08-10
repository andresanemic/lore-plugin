# Plugin Lore – Guía de Uso

Esta guía muestra cómo usar el plugin Lore en **Claude Code** en el trabajo diario:  
crear Áreas y proyectos, capturar criterio después de resolver problemas y mantener tu Lore limpio y útil.

> Lore es un kit ligero de Spec‑Driven Development (SDD) para Claude Code.  
> Te ayuda a preservar el **criterio** detrás de tus decisiones, para que tu IA nunca tenga que empezar desde cero.  
> La analogía más cercana: fine-tuning local de tus tareas, y el que entrena eres tú.

---

## 1. Visión general

Lore organiza la experiencia en **criterio** que sigue participando en decisiones futuras:

- Resuelves un problema con IA.
- En lugar de simplemente seguir adelante, capturas la *razón* detrás de la solución.
- Ese criterio se guarda en artefactos Markdown que Claude Code puede reutilizar en sesiones posteriores.

El plugin Lore agrupa un conjunto de **skills** que implementan este ciclo:

- `using-lore` – punto de entrada y navegación.
- `create-area` – Lore compartido para un grupo de proyectos.
- `create-project` – Lore a nivel proyecto que hereda de un Área.
- `save-to-lore` – captura criterio después de resolver un problema.
- `transmute-lore` – migra proyectos existentes hacia la arquitectura Lore.
- `create-bot` – empaqueta criterio como un *plugin* instalable que trabaja dentro de los repos.
- `obsidian-lore` – captura notas libres en el mismo árbol y **mina** esa bandeja buscando criterio.

> **El Lore habla tu idioma.** Aunque los skills están escritos en inglés, todo lo que generan —
> contenido **y nombres de artefactos** — se escribe en el idioma en el que trabajas. `identidad.md`,
> `principios.md`, `FASES.md` son las formas canónicas en español (las que usa esta guía); en inglés
> serían `identity.md`, `principles.md`, `PHASES.md`. Solo permanecen fijos `CLAUDE.md`, `lore/`,
> `index.md` y los términos técnicos de uso general en inglés (workflow, commit, stack…).

---

## 2. Requisitos previos

Antes de usar Lore:

- Tienes **Claude Code** instalado y funcionando.
- Puedes ejecutar comandos `/plugin` en tu entorno de Claude Code.

Instala el plugin Lore:

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

Una vez instalado, los skills de Lore quedan disponibles como comandos/prompts dentro de Claude Code.

---

## 3. Ciclo central: usar Lore en el día a día

El ciclo cotidiano de Lore es:

1. Trabajas con Claude Code para resolver un problema en tu proyecto.
2. Decides si la solución reveló **criterio** que debería afectar decisiones futuras.
3. Usas `save-to-lore` para capturar ese criterio en tu Lore en Markdown.
4. Permites que las sesiones futuras reutilicen ese criterio en lugar de empezar desde cero.

### Ejemplo: capturar un bug de hidratación

Tú y Claude depuran un problema de hidratación en Next.js.  
En lugar de solo corregirlo, quieres capturar la regla detrás de la solución.

En Claude Code podrías ejecutar:

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

En Claude Code:

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
  - `CLAUDE.md` en la raíz para contrato de colaboración y referencias operativas.
- Registra el proyecto en el `FASES.md` del Área, de modo que el criterio general se herede sin duplicarse.

### 4.3 Trabajar y capturar

Una vez que tu Área y proyecto existen:

1. Trabaja en el proyecto con Claude Code como siempre.
2. Cada vez que resuelves un problema que revela criterio reutilizable, llama a:

   ```text
   save-to-lore "Descripción corta del problema/decisión"
   ```

3. Revisa lo que Lore propone y edita los artefactos Markdown si lo ves necesario.

---

## 5. Skill por skill: cómo usarlos

### 5.1 `using-lore` – Punto de entrada y navegación

**Propósito:** ayudarte a entender el modelo de Lore y dirigirte al skill adecuado.

Uso típico:

```text
using-lore
```

Puedes pedir cosas como:

- «Explícame la arquitectura de Lore para este proyecto.»
- «Muéstrame los artefactos que existen ahora.»
- «Guíame al skill correcto para capturar una nueva pista invariante.»

`using-lore` es el lugar más seguro para empezar si no tienes claro qué skill usar a continuación.

---

### 5.2 `create-area` – Lore compartido para un dominio

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

Usa este skill cuando quieres que varios proyectos compartan un conjunto común de criterios.

---

### 5.3 `create-project` – Lore con alcance de proyecto

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
  - `CLAUDE.md` en la raíz para contrato de colaboración y referencias.
- Conecta el proyecto con el Lore del Área, de modo que el criterio compartido esté disponible sin duplicación.

Usa este skill siempre que inicies una nueva base de código dentro de un dominio que ya tiene un Área.

---

### 5.4 `save-to-lore` – Capturar criterio tras resolver un problema, o arbitrar criterio ajeno

**Propósito:** destilar criterio reutilizable. Tiene **dos modos**, según de dónde venga ese criterio:
**capture** (fricción vivida) y **arbitrate** (criterio importado de una skill o guía ajena).

#### Modo `capture` (por defecto) — la cicatriz

Ejemplos de prompts:

```text
save-to-lore "Bug de hidratación en landing de Next.js"
save-to-lore "Decisión: siempre preferir renderizado estático en páginas de marketing"
save-to-lore "Estándar: los mensajes de error deben ser humanistas y accionables"
```

#### Modo `arbitrate` — la skill ajena

Ejemplos de prompts:

```text
save-to-lore "destila la skill copywriting en el lore del área"
save-to-lore "arbitra esta guía de estilo contra nuestro estándar"
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
  - actualizaciones de `identidad.md` o `CLAUDE.md` si afectan identidad o colaboración.
- Respeta invariantes:
  - Nunca inventa criterio.
  - Informa el ruido descartado.
  - Requiere revisión humana antes de escribir nada; nunca hace `git push`.
  - Marca lo ya promovido al Área con el glifo ` · ↑` en el `index.md` del proyecto, para no repetir el trabajo.

Usa este skill como herramienta principal para alimentar tu Lore con el tiempo.

---

### 5.5 `transmute-lore` – Migrar proyectos existentes

**Propósito:** mover proyectos heredados hacia la arquitectura Lore.

No es un comando de CLI: el modo se infiere de la frase, no de un flag. Tiene cuatro modos:

- `add` – crea artefactos de Lore que aún no existen.
- `clean` – elimina módulos redundantes que ya duplican los del Área (requiere que el proyecto
  tenga una Área madre; si es standalone, este modo no aplica).
- `translate` – estandariza el idioma del Lore: traduce el contenido y renombra los artefactos
  localizables a un único idioma (el que pidas o, por defecto, el tuyo), reescribiendo los enlaces
  afectados y sin tocar estructura, código ni significado.
- `upgrade` – **(v1.2.1)** pone al día un Lore sano escrito contra una versión anterior de estos
  skills. No está roto: está en el estándar y en uso, y le faltan las puertas que el kit aprendió
  después. Arbitra lo que ya existe contra la versión instalada.

**Sobre `upgrade`, que es el modo que más fácil se malinterpreta.** No es un reescribir ni un pase
de estilo. Clasifica cada hallazgo en tres tipos, y ese etiquetado es lo que impide que degenere:

| Tipo | Qué significa |
|---|---|
| **Missing** | el kit ahora exige algo que ese artefacto nunca tuvo (una frontera de validez, un marcador de confianza, la sección de derrotas de un módulo importado) |
| **Superseded** | el kit ahora sabe que esa práctica está mal, y se cita qué regla la reemplaza |
| **Earned** | se aparta del estándar actual **porque este proyecto lo pagó con fricción real**: se deja como está y se anota por qué, para que el próximo upgrade no lo vuelva a marcar |

Lo ganado con experiencia le gana a cualquier mejora que el kit aprendió después. Una lista de
hallazgos sin ningún `Earned` en un Lore con historia es señal de que el pase se está corriendo como
formateador. Además: la confianza **nunca** sube por antigüedad —una conjetura que sobrevivió tres
versiones sigue siendo conjetura— y una frontera ausente se **pregunta**, no se infiere.

Ejemplos de prompts:

```text
transmuta el lore del "Frontend heredado"
limpia el lore del "Frontend heredado"
estandariza el idioma del lore del "Frontend heredado"
traduce el lore del "Frontend heredado" al español
mejora el lore del "Frontend heredado" con la versión nueva del plugin
arbitra mi lore contra la versión nueva
```

**Precondición:** el proyecto debe tener el árbol de git limpio antes de ejecutar cualquiera de los
cuatro modos; si hay cambios sin commitear, el skill se detiene y pide hacer commit o `stash`
primero.

Comportamiento esperado:

- Escanear la documentación y estructura existentes.
- Proponer cómo mapear archivos antiguos a:
  - `identidad.md`, `principios.md`, `index.md`, módulos temáticos.
  - `FASES.md` y `CLAUDE.md`.
- Esperar tu aprobación explícita antes de escribir nada (HARD-GATE).
- Garantizar que el resultado sea DRY:
  - Las reglas compartidas van al Área.
  - El proyecto conserva solo el criterio específico; `identidad.md` y `principios.md` nunca se
    eliminan en modo `clean`.

Usa este skill cuando ya tienes proyectos en marcha y quieres incorporarlos a Lore sin reescribirlo todo a mano.

---

### 5.6 `create-bot` – Empaquetar criterio como un lugar donde trabajar

**Propósito:** construir un **bot**: un solo lugar donde abrir una sesión y **trabajar en varios
proyectos o Áreas a la vez**, con su criterio ya cargado, en vez de responder preguntas sobre ellos.

Un bot vive en `{Área}/proyectos/{slug}/` como cualquier proyecto. Lo distingue una cosa: **enruta
hacia afuera**, hacia el Lore de otros proyectos y Áreas. Las Áreas y los proyectos son lugares; un
bot es una lente que llevas a ellos.

Por defecto **no se instala nada**: es una carpeta con su canon y su `CLAUDE.md`, y abrir la sesión
ahí es lo que carga el criterio. Empaquetarlo como *plugin* es opcional y sirve para repartirlo a un
equipo.

> **El test que decide si el bot está bien hecho:** *una instrucción corta basta.* Si tuviste que
> explicarle el proyecto al bot para obtener el resultado, faltaba criterio cargado.

Ejemplos de prompts:

```text
crea un bot para trabajar en HealthProof y Nodo Zero, en el área "bots"
quiero un bot que federe el lore que ya existe en founder y community-manager
```

Tiene **dos modos**, según de dónde salga el criterio:

- `nuevo` – desde 0. El canon nace de un brainstorm + los documentos fuente.
- `federar` – el criterio ya existe, disuelto en varias Áreas. Además del canon genera una tabla de
  enrutamiento (`lore/enrutamiento.md`) y el acceso a los árboles vivos
  (`.claude/settings.local.json`), para poder **trabajar** en esos proyectos y no solo leerlos.

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
- Al federar un Área se lleva `lore` **más** su `CLAUDE.md` y su `FASES.md`: el Lore trae las leyes,
  pero la secuencia de trabajo y el registro de qué existe viven en esos dos.
- Te pregunta si empaquetarlo como *plugin*, y si dices que sí **no lo da por terminado** hasta que
  `scripts/validar.js` pase: los errores de frontmatter que revisa no dan ningún mensaje de error —
  la skill se instala, aparece en el listado y nunca se dispara.

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

Opcionales y apagados por defecto: **la copia del ecosistema**, **empaquetarlo como plugin** y el
**cifrado** (*experimental*, ver [`ENCRYPTION.md`](./ENCRYPTION.md)). Un bot sin ninguno de los tres
está completo.

Usa este skill cuando ya tengas varios proyectos con Lore que valga la pena llevar a una sola sesión.
No sustituye construir ese Lore: lo federa.

---

### 5.7 `obsidian-lore` – Convertir notas sueltas en criterio

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

**La raíz nunca tiene bandeja.** Nadie abre una sesión ahí, y una nota escrita en la raíz no tiene
dueño ni tabla contra la cual enrutarse. Peor: un bot no alcanza la raíz, así que el barrido no la
lee, no falla y **reporta deuda cero**. Si una nota no pertenece a ningún proyecto, lo que falta es
el proyecto — `create-project`, no una bandeja huérfana.

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
- `CLAUDE.md` (raíz) – contrato de colaboración y referencias operativas.

Recomendaciones generales:

- Identidad y principios cambian poco; mantenlos breves e intencionales.
- Los módulos temáticos pueden crecer, pero cada uno debería enfocarse en un dominio específico.
- `FASES.md` debe reflejar la realidad; actualízalo cuando el proyecto cambie de fase.
- `CLAUDE.md` debe describir cómo trabajan tú y Claude juntos (prompts, rituales, restricciones).

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

Si quieres una visión más conceptual de por qué existe Lore y en qué se diferencia de la documentación tradicional, consulta el [`README.md`](./README.md).
