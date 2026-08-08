<p align="center">
  <img src="https://i.imgur.com/6u3Cnkw.png" alt="Lore" width="100%">
</p>

<!-- Language selector (top of README.md) -->

<p align="right">
  <strong>Idioma / Language:</strong>
  <a href="#español">Español</a> |
  <a href="#english">English</a>
</p>

---

# Lore

[![License](https://img.shields.io/github/license/andresanemic/lore-plugin.svg)](./LICENSE)
[![Diseñado para Claude Code](https://img.shields.io/badge/diseñado%20para-Claude%20Code-4B8BF5.svg)](#instalación)
[![Spec-Driven Development](https://img.shields.io/badge/paradigma-SDD%20%7C%20Spec--Driven%20Development-6332F6.svg)](#qué-es-lore)
[![Colaboración Humano–IA](https://img.shields.io/badge/foco-colaboración%20humano%E2%80%93IA-10B981.svg)](#origen)
[![Estado](https://img.shields.io/badge/estado-investigación%20activa-F97316.svg)](#origen)

> **Un kit de desarrollo guiado por especificaciones para constructores humanistas.**  
> *Deja de reconstruir tu criterio cada vez que comienzas una nueva sesión con IA.*

---

## Índice

- [Motivación](#motivación)
- [Qué es Lore](#qué-es-lore)
- [Problema: experiencia efímera](#problema-experiencia-efímera)
- [Principio fundamental](#principio-fundamental)
- [Arquitectura de Lore](#arquitectura-de-lore)
  - [Los seis artefactos](#los-seis-artefactos)
  - [Herencia Área → Proyecto](#herencia-área--proyecto)
- [Flujo de trabajo](#flujo-de-trabajo)
- [Cifrado del Lore (experimental)](#cifrado-del-lore-experimental)
- [Idioma del Lore](#idioma-del-lore)
- [Instalación](#instalación)
- [Documentación adicional](#documentación-adicional)
- [Estructura del repositorio](#estructura-del-repositorio)
- [Invariantes compartidas](#invariantes-compartidas)
- [Lore vs README](#lore-vs-readme)
- [Por qué “Lore”](#por-qué-lore)
- [Origen](#origen)
- [Casos de estudio](#casos-de-estudio)

---

## Motivación

Todo proyecto desarrollado con inteligencia artificial acumula experiencia adquirida con esfuerzo:

- decisiones arquitectónicas;
- incidentes en producción;
- experimentos fallidos;
- estándares de desarrollo;
- y decenas de momentos de *«nunca volvamos a hacer esto»*.

La mayor parte de esa experiencia desaparece.

La siguiente sesión comienza con una comprensión incompleta del proyecto, obligándote a ti —y a tu IA— a redescubrir decisiones que ya habías pagado con tiempo y esfuerzo.

**Lore existe para evitar eso.**

No generando más documentación,  
sino preservando el **criterio** que debe seguir participando en las decisiones futuras.

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

---

## Qué es Lore

Lore es un kit ligero de **Spec-Driven Development (SDD)** para Claude Code.

Proporciona:

- una convención sencilla para organizar el criterio de un proyecto;
- seis *skills* que automatizan ese proceso;
- y un flujo continuo para destilar la experiencia en criterios reutilizables.

A diferencia de la documentación tradicional, Lore no intenta describirlo todo.

Solo conserva aquello que modifica el comportamiento futuro.

**Si una frase no restringe una decisión futura, no es Lore.**

---

## Problema: experiencia efímera

La documentación tradicional responde preguntas como:

> ¿Qué es esto?  
> ¿Cómo se instala?  
> ¿Qué API debo utilizar?

Lore responde una pregunta completamente distinta:

> **¿Qué aprendimos que nunca deberíamos tener que volver a aprender?**

Esa diferencia lo cambia todo:

- Un README almacena información.
- Lore preserva criterio.
- Ese criterio continúa participando en decisiones futuras.

---

## Principio fundamental

Todo problema resuelto contiene dos cosas:

- la solución;
- y la razón por la que esa solución existe.

La mayoría de la documentación conserva únicamente la primera.  
Lore conserva la segunda.

En lugar de registrar acontecimientos, Lore los destila en **Pistas Invariantes**: pequeñas restricciones que siguen siendo útiles mucho tiempo después de que el contexto original haya desaparecido.

Por ejemplo, en lugar de recordar:

> «Tuvimos un problema de hidratación en Next.js.»

Lore conserva:

> «Nunca utilices estado del cliente para controlar la opacidad inicial.»

El evento desaparece.  
El criterio permanece.

---

## Arquitectura de Lore

Lore organiza el criterio de cada proyecto en artefactos claramente separados y heredables.

### Los seis artefactos

Cada proyecto organiza su criterio utilizando exactamente seis artefactos:

| Artefacto          | Propósito                                          | Ubicación |
|--------------------|----------------------------------------------------|----------|
| `identidad.md`     | Identidad del proyecto y estándar mínimo de calidad | `lore/`  |
| `principios.md`    | Reglas permanentes de ingeniería y negocio          | `lore/`  |
| Módulos temáticos  | Experiencia destilada organizada por dominio        | `lore/`  |
| `index.md`         | Mapa de navegación del Lore                         | `lore/`  |
| `FASES.md`         | Estado actual y hoja de ruta del proyecto           | raíz     |
| `CLAUDE.md`        | Contrato de colaboración y referencias operativas   | raíz     |

> Los nombres mostrados son las formas canónicas en español; en tu idioma se localizan (p. ej. `identity.md`, `principles.md`, `PHASES.md` en inglés). `CLAUDE.md`, `lore/` e `index.md` no cambian nunca. Véase [Idioma del Lore](#idioma-del-lore).

Cada artefacto tiene una única responsabilidad.

Ninguno duplica a otro.

---

### Herencia Área → Proyecto

Lore escala mediante **Áreas**.

Un Área es una carpeta madre que posee su propio Lore.  
Los proyectos heredan ese criterio en lugar de copiarlo:

```text
Desarrollo/
│
├── lore/
│
├── Proyecto A/
│   └── lore/
│
├── Proyecto B/
│   └── lore/
│
└── Proyecto C/
    └── lore/
```

Los criterios generales existen una sola vez.

Cada proyecto conserva únicamente aquello que le pertenece.

Así el sistema permanece DRY sin perder la experiencia acumulada.

---

## Flujo de trabajo

Lore opera mediante seis *skills* para Claude Code.

### `using-lore`

Punto de entrada.

Explica el modelo de Lore y te guía hacia el *skill* adecuado.

---

### `create-area`

Crea una nueva Área con su propio Lore compartido.

---

### `create-project`

Crea un proyecto dentro de una Área.

Los proyectos heredan el criterio del Área en lugar de duplicarlo.

---

### `create-bot`

Te permite **trabajar desde un solo lugar sobre varias Áreas que forman parte de un mismo
proyecto**. A eso lo llamamos *federar*.

Piensa en un laboratorio de blockchain. Tiene su sitio web, lleva sus redes sociales, y sostiene
líneas de investigación científica y de transferencia tecnológica. Cada una de esas Áreas ya tiene
su propio Lore, creado antes con `create-area`. Un bot las enruta a todas hacia una misma carpeta:
abres la sesión ahí y puedes trabajar en cualquiera de ellas, y hacer que se comuniquen entre sí.

También sirve al revés, para las Áreas antes que para el proyecto: si tienes un Área con varios
proyectos —varios sitios web, por ejemplo— un bot te deja trabajar en uno mientras miras los
archivos de los otros. Copiar el footer de un sitio para pegarlo en otro deja de ser una
expedición. Ahí lo que se federa es el Lore de cada proyecto, no el de cada Área.

Y **también se pueden crear bots sin Lore destilado**, partiendo de documentos fuente.

Un bot no responde preguntas sobre los proyectos: **trabaja en ellos**.

> **Su norte, y el único test que importa:** *una instrucción corta basta.* Si hubo que explicarle
> el proyecto al bot para obtener el resultado, faltaba criterio cargado.

Un bot vive en `bots/proyectos/{slug}/`. Esa es su ruta estándar: `bots` es el Área que aloja los
bots, igual que `desarrollo-web` aloja sitios. Lo que lo distingue de cualquier otro proyecto es que
**enruta hacia afuera**, hacia Lore que pertenece a otros proyectos y Áreas.

| | Área | Proyecto | **Bot** |
|---|---|---|---|
| Contiene | proyectos | un trabajo | **una sesión de trabajo** |
| Su Lore gobierna | el método del dominio | ese trabajo | **cómo se comporta el agente** |
| Se abre para | ver el registro | avanzar eso | **trabajar en cualquiera de varios proyectos** |

Las Áreas y los proyectos son lugares; un bot es una lente que llevas a ellos. Y **no es un Área**,
precisamente porque no es dueño de nada del criterio que enruta: un Área que acumula criterio que no
pagó empieza a recibir promociones que pertenecen a otra parte.

**Dos modos**, según de dónde sale el criterio:

| Modo | Cuándo | Qué produce |
|---|---|---|
| **`nuevo`** | Desde 0. No hay Lore previo que reunir. | Canon nacido de un brainstorm + documentos fuente. |
| **`federar`** | El criterio ya existe, disuelto en varias Áreas. | Canon **más** una copia sincronizada y una tabla de enrutamiento sobre esos Lore. |

#### Cuando las carpetas todavía no tienen Lore

El punto de partida habitual no es un conjunto ordenado de Lore. Es material en bruto: carpetas de
documentos, una base de datos, un espacio de Notion, código sin destilar. Eso no se puede federar
todavía, y el arreglo es una cadena:

```text
carpeta en bruto (sin Lore)
   └─ create-area            → el Área que va a ser DUEÑA de ese criterio
        └─ transmute-lore (add)  → rescata el criterio que ya estaba disperso adentro
             └─ create-bot (federar) → el bot enruta hacia ese Lore
```

> **La ley: el bot nunca destila hacia sí mismo.** Una fuente sin Lore recibe su Lore **en el Área
> que le corresponde**, y recién después se federa. Dejar que el bot destile material en bruto lo
> convierte en dueño de criterio que no pagó — la falla exacta que la distinción Área/bot existe
> para evitar, y en la práctica es irreversible: cuando la única copia de ese criterio vive en el
> bot, el Área ya no puede ser su fuente de verdad.

`create-bot` inspecciona las rutas que le des y te dice cuáles ya tienen Lore, cuáles hay que
transmutar primero y cuáles hay que extraer a texto antes (una base de datos o una planilla no se
copian solas: la sincronización solo mueve `.md`, `.txt` y `.json`).

#### Los tres cuerpos que nunca se mezclan

Un bot sostiene tres cuerpos de criterio con **tres dueños distintos**. Fundirlos es el modo de
falla por defecto, y es silencioso: todo sigue funcionando, y la copia empieza a ganarle a su fuente.

| Cuerpo | Qué es | Regla |
|---|---|---|
| `canon/` | criterio que el bot **es** — cargado antes de cada decisión | destilado |
| `lore/` | criterio para **mantener** el bot | propio del proyecto |
| criterio **prestado** | el Lore de cada proyecto que el bot enruta | se alcanza **por puntero**, en su propia dirección; **nunca es autoritativo** |

El test que los separa: **¿sería descartable la fuente?** Destilar produce algo más chico que puede
*reemplazar* a su origen; copiar produce algo idéntico que **no puede**.

> **Federar es apuntar, no copiar.** Cada fila del manifiesto es una **dirección**: la tabla dice
> qué Lore gobierna la tarea, y el acceso generado deja que la sesión lo alcance donde vive. Ese
> criterio conserva un solo dueño y una sola versión — la misma regla DRY con la que funciona todo
> el kit. Un proyecto nuevo creado desde el bot nace en el Área que lo posee, heredando su Lore por
> ruta relativa, igual que con `create-project`. Nada se duplica dentro del bot.

Y como un bot **trabaja** en los proyectos y no solo los consulta, el mismo manifiesto genera
`.claude/settings.local.json`, que es lo que deja a la sesión alcanzar esos árboles. Las rutas se
escriben una sola vez. Ese acceso se **declara** por fuente y solo lo llevan los proyectos: la
carpeta de un Área contiene todos sus proyectos, incluidos los que quedaron fuera de alcance.

La copia (`lore-ecosistema/`) es **opcional y está apagada por defecto**, y responde a una sola
pregunta: *¿los que van a usar el bot tienen tus carpetas, o solo el bot?* Si las tienen, los
punteros resuelven y no hace falta copiar nada. Si no, esa copia es la única forma en que ese
criterio existe en su máquina — y aun así, cuando una ruta viva resuelve, **manda ella y la copia no
se abre**.

Y la ley que hace funcionar el enrutamiento:

> **Se enruta por tipo de tarea, no por nombre de proyecto.**

Una entidad puede tener varios cuerpos de criterio cuyos propios principios prohíben cruzarlos
—lo que hace contra cómo lo cuenta es el corte habitual—. Decir su nombre no alcanza para elegir.

#### Cuatro extras opcionales, apagados por defecto

Los cuatro se preguntan al configurar el bot la primera vez. Un bot sin ninguno está completo: son
sellos, no piezas.

- **La copia del ecosistema (`lore-ecosistema/`).** Por defecto el bot **apunta** al Lore de cada
  proyecto donde vive, sin duplicar nada. Encenderla solo tiene sentido si quien va a usar el bot
  **no** tiene tus carpetas: ahí el puntero no apunta a nada y la copia es lo único que hace existir
  ese criterio en su máquina.
- **Empaquetarlo como *plugin* compartible.** Por defecto **no se crea**. Un bot es una carpeta con
  su canon y su `CLAUDE.md`: abres la sesión ahí y el criterio ya está cargado, sin instalar nada.
  Envolverlo en una skill con su `.claude-plugin/` y su repositorio propio sirve para **una sola
  cosa**, repartirlo a un equipo, y si vas a trabajar tú solo es andamiaje que igual hay que
  mantener.
- **Cifrado del Lore** — *experimental*. Las cargas viajan cifradas y se descifran **una vez** al
  clonar; en reposo son Markdown plano. Ver [Cifrado del Lore](#cifrado-del-lore-experimental).
- **Operación remota por el MCP de Telegram** — el bot no depende de ningún canal: corre donde vive
  el repositorio y el teléfono es solo la terminal. Requiere lista de acceso explícita, y dejar una
  máquina encendida con una sesión abierta. Este plugin no lo empaqueta ni lo instala.

---

### `save-to-lore`

El flujo más importante.

Después de resolver un problema realmente valioso:

> «save to lore»

El *skill* extrae el criterio detrás de esa solución.

- Las lecciones específicas permanecen dentro del proyecto.
- Las lecciones genéricas pueden proponerse para ser promovidas al Área.
- Nada se promueve automáticamente.

Dispone de **dos modos**, que se eligen según **de dónde viene el criterio**:

| Modo | Fuente | Qué hace |
|---|---|---|
| **capture** (por defecto) | **fricción vivida**: un bug, un colapso, un cliente que rechaza | Destila la cicatriz en una Pista Invariante. |
| **arbitrate** | **criterio importado**: una *skill*, una guía de estilo, un manual ajeno | Juzga ese criterio contra la finalidad de **tu** proyecto. Solo entra lo que sobrevive. |

> **La ley del modo `arbitrate`: un criterio ajeno no se destila, se arbitra.**
>
> Una skill es criterio ya destilado **por otro, bajo otra finalidad**, y llega sin declarar dónde
> deja de valer. Copiarla al Lore produce **literatura redundante con la autoridad de una Pista
> Invariante**: criterio que nadie pagó con experiencia propia.
>
> Por eso el modo `arbitrate` tiene un HARD-GATE de salida: el módulo resultante **debe** registrar
> **dónde la fuente contradice tu estándar y pierde**. Sin esa sección, no entra — o no hubo
> arbitraje (fue una copia), o la fuente no traía criterio.
>
> **Lo que la fuente pierde vale más que lo que la fuente aporta:** el resumen ya existe, y mejor
> escrito, en la fuente. El desacuerdo no existe en ningún otro lado.

Dos avisos que el modo `arbitrate` te dará:

- **Capacidad ≠ criterio.** Una skill que **ejecuta** (renderiza video, hace un *crawl*, compila) se
  **usa** como dependencia: no es Lore. Solo se arbitra la que **juzga** (qué es buen copy, buen
  diseño, buen SEO).
- **Sin identidad no hay arbitraje.** Si tu `identidad.md` está vacío, no tienes vara con que medir:
  frente a una fuente con autoridad, lo único que puedes hacer es obedecerla. Primero la identidad,
  después la fuente.

---

### `transmute-lore`

Migra proyectos existentes hacia la arquitectura Lore.

Dispone de tres modos:

- **add** → crea el Lore faltante.
- **clean** → elimina módulos redundantes que ya pertenecen al Área.
- **translate** → estandariza el idioma de un Lore existente, traduciendo el contenido y renombrando los artefactos a un único idioma, sin alterar estructura ni significado.

---

## Cifrado del Lore (experimental)

`create-bot` puede sellar el criterio de un bot para que viaje cifrado. Es **opcional y está
apagado por defecto**: un bot sin cifrado está completo.

**La ley: se cifra en distribución, nunca en consulta.** Las cargas viajan cifradas y se descifran
**una vez** al clonar; en reposo local el criterio es Markdown plano. Cifrar en el punto donde el
agente consulta no prohíbe leer: **encarece** leer — y lo caro deja de consultarse. Eso es el
artefacto muriendo de costo de acceso.

AES-256-GCM con clave derivada por scrypt, solo con la stdlib de Node — sin dependencias. La
passphrase se pide por *stdin*, jamás como argumento ni pegada en el chat.

> ### Estado: experimental
>
> La plantilla pasa su *self-test* (round-trip, passphrase incorrecta, alteración detectada por GCM,
> sin fuga de texto plano), pero **no ha sido auditada**, no tiene rotación de claves, ni revocación,
> ni respuesta para una passphrase filtrada. Es un sello para un repositorio compartido entre
> personas que ya confían entre sí — no un control de seguridad entre un adversario y algo que
> importe.

Dos fronteras que se declaran siempre, y no se compensan con lenguaje que sugiera lo contrario:

- Protege el repositorio y el tránsito. **No protege contra quien tiene la passphrase**: una clave
  compartida defiende de una filtración, no de un integrante del equipo.
- **No cubre lo que una herramienta de IA hace con el texto** una vez cargado en su contexto.

### Crédito

La pregunta —*¿qué protege a un Lore que tiene que compartirse?*— la abrió **Mantra**, de
[LonelyAchemist](https://github.com/lonelyachemist-arch), una derivación de este kit que cifraba el
Lore **en reposo**.

La pregunta es suya y era buena: el corpus de Lore habla de patrimonio y transferibilidad, y no
decía nada de titularidad ni confidencialidad. **La respuesta acá está invertida**, por la razón de
arriba, y el código no es el suyo: su SDK no se usa. La idea es de Mantra; la decisión no.

---

## Idioma del Lore

**El Lore habla tu idioma.**

Los *skills* están escritos en inglés, pero el Lore que generan no: tanto el **contenido** como los **nombres de los artefactos** se escriben en el idioma en el que trabajas. `identidad.md`, `principios.md`, `FASES.md` son las formas canónicas en español; en inglés, por ejemplo, serían `identity.md`, `principles.md`, `PHASES.md`.

Lo que permanece fijo en todos los idiomas:

- `CLAUDE.md` (convención de Claude Code), `lore/` (el nombre del kit), `index.md` y `golden-paths.md`;
- la estructura y la profundidad de las rutas relativas;
- los términos técnicos de uso general en inglés (*workflow*, *commit*, *stack*, *scaffold*…).

Dentro de un Área o proyecto existente, mandan los nombres ya establecidos: nunca se mezclan esquemas. Si un Lore quedó en el idioma equivocado —o mezclado—, se estandariza con `transmute-lore` (modo **translate**), que traduce contenido y renombra artefactos a la vez.

---

## Instalación

### Claude Code

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

---

### Otras herramientas de IA

Lore es, en esencia, Markdown.

Cada *skill* está compuesto por:

- un encabezado YAML (*frontmatter*);
- instrucciones escritas en Markdown.

El empaquetado del plugin es específico de Claude Code.  
La arquitectura de Lore no lo es.

Puedes adaptar Lore copiando cualquier *skill* a la herramienta de IA que prefieras.

---

## Documentación adicional

Este README cubre la motivación y la arquitectura. Para el resto, hay tres documentos dedicados
(en español e inglés), en la raíz del repositorio:

| Documento | Para qué sirve |
|---|---|
| [`USAGE_es.md`](./USAGE_es.md) / [`USAGE_en.md`](./USAGE_en.md) | Guía práctica de uso día a día: instalación, ciclo de trabajo, y cada *skill* con ejemplos. |
| [`REFERENCE_es.md`](./REFERENCE_es.md) / [`REFERENCE_en.md`](./REFERENCE_en.md) | Referencia técnica: conceptos, especificación exacta de cada artefacto y cada *skill*. |
| [`MIGRATION_es.md`](./MIGRATION_es.md) / [`MIGRATION_en.md`](./MIGRATION_en.md) | Cómo migrar un proyecto existente hacia Lore con `transmute-lore`. |

---

## Estructura del repositorio

```text
lore-plugin/
  .claude-plugin/
    plugin.json
    marketplace.json

  skills/
    using-lore/
    create-area/
    create-project/
    create-bot/
      plantillas/        # validar.js · canon.js · sync.js · ecosistema.json
    save-to-lore/
    transmute-lore/

  README.md
  LICENSE
```

---

## Invariantes compartidas

Todos los *skills* siguen las mismas reglas:

- El Lore se escribe en el idioma del usuario.
- El criterio nunca se inventa.
- Todo proviene de experiencia real.
- El ruido descartado se informa; nunca se elimina silenciosamente.
- Todo cambio pasa por un HARD-GATE antes de escribirse.
- Nada realiza *commit* automáticamente.
- El ser humano siempre revisa el *diff* final.

---

## Lore vs README

Un README explica un proyecto.  
Lore modifica cómo se trabajará en el futuro.

| README                         | Lore                                |
|--------------------------------|-------------------------------------|
| Explica el proyecto            | Restringe decisiones futuras        |
| Almacena información           | Preserva criterio                   |
| Está escrito para humanos      | Es compartido entre humanos e IA    |
| Describe el pasado             | Da forma al futuro                  |

---

## ¿Por qué “Lore”?

En los videojuegos, el *lore* es aquello que da coherencia a un universo.

No son las mecánicas.

Es la historia acumulada.

Las reglas que siguen influyendo en todo lo que puede ocurrir después.

Lore aplica esa misma idea al desarrollo de software.

Transforma la experiencia en criterio compartido.

Los acontecimientos originales dejan de ser importantes.  
El criterio permanece.

---

## Origen

Lore nació como una destilación de **LUS (Lore User System)**, un programa de investigación que estudia cómo un ser humano y una IA acumulan criterio compartido a lo largo de una colaboración prolongada.

LUS estudia la relación.  
Lore es una implementación operativa surgida de esa investigación.

Su principio central puede resumirse en una sola idea:

> **La experiencia solo crea valor cuando puede volver a participar en una decisión futura.**

El objetivo de Lore es convertir esa idea en una práctica cotidiana para el desarrollo asistido por IA.

Entre las principales influencias del programa se encuentran:

- **Martin Buber** — *Yo y Tú*
- **Claude Shannon** y **Warren Weaver** — *The Mathematical Theory of Communication*
- **Gregory Bateson** — «Una diferencia que produce una diferencia»
- **Andy Clark** y **David Chalmers** — *The Extended Mind*

Puedes explorar la investigación detrás de Lore en el NotebookLM de LUS:

[NotebookLM de LUS](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450)

---

## Casos de estudio

Lore no se diseñó en una pizarra: cada decisión de este kit salió de aplicarlo a proyectos reales y
mirar qué se rompía. LUS documenta esas aplicaciones como **casos de estudio**. Estos son los cuatro
que hoy sostienen el diseño del plugin.

> **Estatus:** son casos, no demostraciones. n pequeño y las cuatro evidencias documentadas vienen
> del mismo investigador. Lo que aquí se afirma restringe cómo usamos el kit; no pretende ser una ley.

### Caso 01 — El Lore como forma operativa de un proyecto entero

Un proyecto real (*numerología*) construido con Lore de principio a fin, sobre una práctica de
desarrollo disciplinado (SDD). Mostró que la arquitectura de seis artefactos **aguanta un proyecto
completo**, no solo notas sueltas: el criterio se acumula, se consulta y sigue decidiendo meses
después.

### Caso 02 — La transmutación multiproyecto: el criterio se recupera y se comparte

Cuatro proyectos de un área real (*desarrollo web*) llevados al estándar con `transmute-lore`. Dejó
tres cosas que hoy son ley del kit:

- **El criterio es recuperable** (modo `add`): un proyecto que nació sin Lore ya tenía criterio
  disperso en comentarios, decisiones y cicatrices. No se inventa: **se rescata**.
- **El criterio es deduplicable** (modo `clean`): los módulos genéricos viven **una sola vez, en el
  Área**. En un proyecto, el `clean` borró 7 módulos redundantes (−866 líneas) sin perder nada: el
  criterio no desapareció, **cambió de dueño**.
- **La herencia es selectiva:** cada proyecto referencia **solo** los módulos del Área que su stack
  realmente usa. No es un volcado uniforme.

**Frontera declarada:** los cuatro proyectos eran del mismo dominio. La transferibilidad *entre
dominios* sigue siendo promesa, no evidencia.

### Caso 03 — El criterio importado no se adopta: se arbitra

El caso que originó el modo `arbitrate` de `save-to-lore`. Tres áreas destilaron Lore a partir de
*skills* de terceros, y lo observado contradijo la intuición:

- **Lo valioso no fue el resumen de la skill, fue el desacuerdo.** En dos áreas distintas, el bloque
  denso del módulo resultante era *"dónde la skill contradice nuestro estándar y pierde"*. Esa parte
  **no existía ni en la skill ni en el Lore previo**: nació de la colisión.
- **La misma skill, arbitrada por dos finalidades opuestas, pierde en el mismo sitio por razones
  inversas.** Las skills de *copywriting* fueron derrotadas en un área de marketing (*"copy aburrido
  y funcional le gana siempre"*) y en una de periodismo (*"no vendemos, informamos"*). El resultado
  no depende de la fuente: depende de **tu** finalidad.
- **Capacidad ≠ criterio.** En la tercera área, una skill que *ejecuta* (renderizado de video) no se
  destiló: se usa como dependencia. No había nada que arbitrar.

**Frontera declarada:** las tres áreas son del mismo usuario, con la misma herramienta. El mecanismo
está observado, no probado a escala.

### Caso 04 — El Lore no-software: la estructura sobrevive fuera del código

El primer caso que cruza de software a otra disciplina. Dos áreas ajenas al desarrollo —periodismo
(*redacción de noticias*) y estrategia de contenido (*community management*)— ya tenían Lore
destilado real, no andamiaje: módulos temáticos derivados de trabajo real (la anatomía de una nota
publicable, el cómo de una estrategia de marca), consultados por proyectos reales.

- **La arquitectura no es un rasgo del software.** El mismo esqueleto —identidad, principios, módulos
  temáticos destilados de trabajo real— se reprodujo en oficios sin compilador ni test, solo con una
  práctica disciplinada y una finalidad explícita.
- **Existencia no es medición.** El caso muestra que el método *produce* criterio en otro dominio; no
  mide todavía que ese criterio *redujo el reaprendizaje* entre sesiones.

**Frontera declarada:** el criterio no *viajó* de software a periodismo — cada Lore nació fresco en
su disciplina. Lo que se replica es el mecanismo, no un criterio concreto transportado entre dominios.

### Caso 05 — La memoria del caso no alimenta la destilación: la desplaza

El método volvió, seis semanas después, al proyecto donde había nacido en bruto. Encontró dos
artefactos de preservación conviviendo con suertes opuestas: un `lore/` de Pistas destiladas, que
seguía trabajando, y un registro de incidentes que **no participó de una sola decisión** — ni
siquiera cuando volvió a romperse el mismo territorio técnico que ese registro documentaba.

- **Preservar no es destilar, y el parecido es el problema.** Un registro de casos satisface el
  impulso de preservar **sin producir criterio**. Cumplido el principio de «dejar registro», nadie
  destila. El criterio destilable queda retenido adentro: al minar el registro antes de borrarlo
  aparecieron dos Pistas que llevaban seis semanas ahí sin destilarse.
- **«Indexado y obligatorio» no implica «consultado».** Estaba en la tabla de consulta del
  `CLAUDE.md` y era ley en `principios.md`, y aun así no se cargó. La accesibilidad es necesaria y
  no suficiente: lo que decide es si el artefacto responde la pregunta que se está haciendo.
- **El filtro de admisión no mide la altitud de la Pista.** Una Pista entró un día y al siguiente
  no impidió el segundo síntoma de su misma causa: estaba escrita sobre la superficie que se vio,
  no sobre la causa. El filtro pregunta *si* algo entra, nunca *a qué altura*.

**Frontera declarada:** es software, mismo investigador y mismo interlocutor, y no hay
contrafactual — nadie midió si con el registro cargado el diagnóstico habría sido más rápido. Es
evidencia testimonial, no medida.

### Caso 06 — La herencia entre Áreas hermanas: congelarla o enrutarla

Un proyecto necesitó criterio de cuatro Áreas, de las cuales solo una era su madre. **El modelo de
herencia de Lore es vertical, y las Áreas hermanas no son madres de nadie.** Ante eso aparecieron
dos soluciones independientes, con 48 horas de diferencia: **congelar** —copiar snapshots y
trabajar sobre ellos, cuando la carpeta tiene que viajar sola— y **enrutar** —decidir por tarea
cuál cuerpo gobierna, cuando el equipo no tiene el árbol local—. Este segundo camino es el que
`create-bot` empaqueta.

- **Consumir no es heredar.** Se hereda del Área madre; el criterio de un Área hermana se
  **consume**. La distinción decide algo real: hacia dónde promueve un criterio que se generaliza.
  Sube a su propia Área, nunca a la que solo lo lee.
- **Lo destilable de un conjunto de criterios es la frontera, no los criterios.** Dos Áreas
  hermanas tenían escrita, cada una, su mitad de la línea: *«eso no vive acá»*. Ninguna tenía la
  regla para decidir cuál gobierna una tarea concreta, porque cada cuerpo se escribe desde adentro
  de su propia finalidad y la divisoria solo se ve desde afuera de los dos. De ahí sale la ley de
  enrutamiento del bot.

**Frontera declarada:** las dos observaciones distan 48 horas, en el mismo ecosistema y con el
mismo investigador. No son dos casos independientes: son un episodio continuo mirado en dos
momentos. Y **no** se estableció que enrutar sea mejor que congelar — respondieron a restricciones
distintas y ninguna se midió contra la otra.

Aparte de los casos documentados: el repositorio ya acumula **400+ clonaciones** (316 personas
únicas, según la API de tráfico de GitHub). Es una señal de alcance, no una demostración — no hay
evidencia de qué hizo cada quien con su copia. No cuenta como caso; no sustituye la pregunta que los
casos sí responden.

<p align="center">
  <img src="https://i.imgur.com/6u3Cnkw.png" alt="Lore" width="100%">
</p>

---

# English

<p align="right">
  <strong>Language:</strong>
  <a href="#español">Español</a> |
  <a href="#english">English</a>
</p>

# Lore

[![License](https://img.shields.io/github/license/andresanemic/lore-plugin.svg)](./LICENSE)
[![Built for Claude Code](https://img.shields.io/badge/built%20for-Claude%20Code-4B8BF5.svg)](#installation)
[![Spec-Driven Development](https://img.shields.io/badge/paradigm-SDD%20%7C%20Spec--Driven%20Development-6332F6.svg)](#what-is-lore)
[![Human–AI Collaboration](https://img.shields.io/badge/focus-human%E2%80%93AI%20collaboration-10B981.svg)](#origin)
[![Status](https://img.shields.io/badge/status-active%20research-F97316.svg)](#origin)

> **A specification‑driven development kit for humanist builders.**  
> *Stop rebuilding your criteria every time you start a new session with AI.*

---

## Table of Contents

- [Motivation](#motivation-1)
- [What is Lore](#what-is-lore)
- [Problem: Ephemeral Experience](#problem-ephemeral-experience)
- [Core Principle](#core-principle)
- [Lore Architecture](#lore-architecture)
  - [The Six Artifacts](#the-six-artifacts)
  - [Area → Project Inheritance](#area--project-inheritance)
- [Workflow](#workflow)
- [Lore Encryption (experimental)](#lore-encryption-experimental)
- [Lore Language](#lore-language)
- [Installation](#installation)
- [Further Documentation](#further-documentation)
- [Repository Structure](#repository-structure)
- [Shared Invariants](#shared-invariants)
- [Lore vs README](#lore-vs-readme)
- [Why “Lore”](#why-lore)
- [Origin](#origin-1)
- [Case Studies](#case-studies)

---

## Motivation

Any project developed with artificial intelligence accumulates hard‑won experience:

- architectural decisions;
- production incidents;
- failed experiments;
- development standards;
- and dozens of “let’s never do that again” moments.

Most of that experience disappears.

The next session starts with an incomplete understanding of the project, forcing you —and your AI— to rediscover decisions you already paid for with time and effort.

**Lore exists to prevent that.**

Not by generating more documentation,  
but by preserving the **criteria** that must keep participating in future decisions.

> **Experience only creates value when it can participate in a future decision.**

---

## What is Lore

Lore is a lightweight **Spec‑Driven Development (SDD)** kit for Claude Code.

It provides:

- a simple convention for organizing a project’s criteria;
- six skills that automate that process;
- and a continuous flow to distill experience into reusable criteria.

Unlike traditional documentation, Lore does not try to describe everything.

It only preserves what changes future behavior.

**If a sentence does not constrain a future decision, it is not Lore.**

---

## Problem: Ephemeral Experience

Traditional documentation answers questions like:

> What is this?  
> How do I install it?  
> Which API should I use?

Lore answers a completely different question:

> **What did we learn that we should never have to learn again?**

That difference changes everything:

- A README stores information.
- Lore preserves criteria.
- Those criteria keep participating in future decisions.

---

## Core Principle

Every solved problem contains two things:

- the solution;  
- and the reason that solution exists.

Most documentation preserves only the first.  
Lore preserves the second.

Instead of recording events, Lore distills them into **Invariant Clues**: small constraints that remain useful long after the original context has disappeared.

For example, instead of remembering:

> “We had a hydration issue in Next.js.”

Lore keeps:

> “Never use client‑side state to control initial opacity.”

The event disappears.  
The criteria remain.

---

## Lore Architecture

Lore organizes each project’s criteria into clearly separated and inheritable artifacts.

### The Six Artifacts

Each project uses exactly six artifacts:

| Artifact           | Purpose                                          | Location |
|--------------------|--------------------------------------------------|----------|
| `identidad.md`     | Project identity and minimum quality standard    | `lore/`  |
| `principios.md`    | Permanent engineering and business rules         | `lore/`  |
| Thematic modules   | Distilled experience organized by domain         | `lore/`  |
| `index.md`         | Navigation map for Lore                          | `lore/`  |
| `FASES.md`         | Current state and project roadmap                | root     |
| `CLAUDE.md`        | Collaboration contract and operational references | root     |

> The names shown are the Spanish canonical forms; in your language they localize (e.g. `identity.md`, `principles.md`, `PHASES.md` in English). `CLAUDE.md`, `lore/`, and `index.md` never change. See [Lore Language](#lore-language).

Each artifact has a single responsibility.

None of them duplicates another.

---

### Area → Project Inheritance

Lore scales through **Areas**.

An Area is a parent folder that owns its own Lore.  
Projects inherit that criteria instead of copying it:

```text
Development/
│
├── lore/
│
├── Project A/
│   └── lore/
│
├── Project B/
│   └── lore/
│
└── Project C/
    └── lore/
```

General criteria exist only once.

Each project keeps only what belongs to it.

This keeps the system DRY without losing accumulated experience.

---

## Workflow

Lore operates through six skills for Claude Code.

### `using-lore`

Entry point.

Explains Lore’s model and guides you to the appropriate skill.

---

### `create-area`

Creates a new Area with its own shared Lore.

---

### `create-project`

Creates a project inside an Area.

Projects inherit the Area’s criteria instead of duplicating it.

---

### `create-bot`

Lets you **work from a single place across several Areas that belong to one project**. We call
that *federating*.

Think of a blockchain lab. It has a website, it runs its social media, and it sustains lines of
scientific research and technology transfer. Each of those Areas already has its own Lore, created
earlier with `create-area`. A bot routes all of them into one folder: you open the session there
and can work on any of them, and make them talk to each other.

It also works the other way round, for Areas before projects: if you have an Area with several
projects — several websites, say — a bot lets you work on one while reading the files of the
others. Copying a footer from one site into another stops being an expedition. What gets federated
there is each project's Lore, not each Area's.

And **bots can also be built with no distilled Lore at all**, starting from source documents.

A bot does not answer questions about the projects: **it works in them**.

> **Its north, and the only test that matters:** *a short instruction is enough.* If the project had
> to be explained to the bot to get the result, criteria were missing from the load.

A bot lives at `bots/proyectos/{slug}/`. That is its standard path: `bots` is the Area that hosts
bots, the same way a `web` Area hosts websites. What sets it apart from any other project is that
it **routes outward**, into Lore owned by other projects and Areas.

| | Area | Project | **Bot** |
|---|---|---|---|
| Holds | projects | one piece of work | **a work session** |
| Its Lore governs | the domain's method | that work | **how the agent behaves** |
| Opened to | see the registry | advance that work | **work on any of several projects** |

Areas and projects are places; a bot is a lens you carry into them. And it is **not** an Area,
precisely because it owns none of the criteria it routes to: an Area that accumulates criteria it
never paid for starts receiving promotions that belong somewhere else.

**Two modes**, by where the criteria comes from:

| Mode | When | What it produces |
|---|---|---|
| **`nuevo`** | From zero. No prior Lore to gather. | Canon born from a brainstorm + source documents. |
| **`federar`** | The criteria already exists, dissolved across several Areas. | Canon **plus** a synchronized copy and a routing table over those Lore bodies. |

#### When the folders have no Lore yet

The usual starting point is not a tidy set of Lore bodies. It is raw material: folders of documents,
a database, a Notion workspace, undistilled code. That cannot be federated yet, and the fix is a
chain:

```text
raw folder (no Lore)
   └─ create-area              → the Area that will OWN that criteria
        └─ transmute-lore (add)   → rescues the criteria already scattered inside it
             └─ create-bot (federar) → the bot routes to that Lore
```

> **The law: the bot never distills into itself.** A source with no Lore gets its Lore **in the Area
> it belongs to**, and only then is federated. Letting the bot distill raw material makes it the
> owner of criteria it never paid for — the precise failure the Area/bot distinction exists to
> prevent, and in practice it is irreversible: once the only copy of that criteria lives in the bot,
> the Area can no longer be its source of truth.

`create-bot` inspects the paths you give it and tells you which already have Lore, which need
transmuting first, and which need extracting to text beforehand (a database or a spreadsheet does
not copy itself: the sync only moves `.md`, `.txt` and `.json`).

#### The three bodies that never merge

A bot holds three bodies of criteria with **three different owners**. Merging them is the default
failure mode, and it is silent: everything still works, and the copy starts outranking its source.

| Body | What it is | Rule |
|---|---|---|
| `canon/` | criteria the bot **is** — loaded before every decision | distilled |
| `lore/` | criteria for **maintaining** the bot | the project's own |
| **borrowed** criteria | the Lore of every project the bot routes to | reached **by pointer**, at its own address; **never authoritative** |

The test that keeps them apart: **would the source be discardable?** Distilling produces something
smaller that can *replace* its origin; copying produces something identical that **cannot**.

> **Federating is pointing, not copying.** Each row of the manifest is an **address**: the table
> says which Lore governs the task, and the generated access lets the session reach it where it
> lives. That criteria keeps one owner and one version — the same DRY rule the whole kit runs on. A
> new project created from the bot is born in the Area that owns it, inheriting its Lore by relative
> path, exactly as with `create-project`. Nothing is duplicated inside the bot.

And since a bot **works in** the projects rather than merely consulting them, the same manifest
generates `.claude/settings.local.json`, which is what lets the session reach those trees. The paths
are written once. That access is **declared** per source and only projects carry it: an Area's folder
holds all of its projects, including the ones left out of scope.

The copy (`lore-ecosistema/`) is **optional and off by default**, and it answers a single question:
*do the people who will use this bot have your folders, or only the bot?* If they have them,
pointers resolve and nothing needs copying. If they do not, that copy is the only way that criteria
exists on their machine — and even then, when a live path resolves, **it wins and the copy is not
opened**.

And the law that makes routing work:

> **Route by type of task, not by name of project.**

One entity can own several bodies of criteria whose own principles forbid crossing them — what it
does versus how it tells it is the common split. Naming it does not select a Lore.

#### Four optional extras, off by default

All four are asked when the bot is configured for the first time. A bot with none of them is
complete: they are seals, not parts.

- **The ecosystem copy (`lore-ecosistema/`).** By default the bot **points** at each project's Lore
  where it lives, duplicating nothing. Turning it on only makes sense if whoever will use the bot
  does **not** have your folders: there the pointer resolves to nothing, and the copy is the only
  way that criteria exists on their machine.
- **Packaging it as a shareable plugin.** **Not created by default.** A bot is a folder with its
  canon and its `CLAUDE.md`: you open the session there and the criteria is already loaded, with
  nothing to install. Wrapping it in a skill with its own `.claude-plugin/` and repository serves
  **one purpose**, handing it to a team, and if you are working alone it is scaffolding you still
  have to maintain.
- **Lore encryption** — *experimental*. Payloads travel encrypted and are decrypted **once** on
  clone; at rest they are plain Markdown. See [Lore Encryption](#lore-encryption-experimental).
- **Remote operation over the Telegram MCP** — the bot depends on no channel: it runs where the
  repository lives, and the phone is only a terminal. Requires an explicit access list, and leaving
  a machine on with a session open. This plugin neither packages nor installs it.

---

### `save-to-lore`

The most important flow.

After solving a genuinely valuable problem:

> “save to lore”

The skill extracts the criteria behind that solution.

- Specific lessons stay inside the project.
- Generic lessons can be proposed for promotion to the Area.
- Nothing is promoted automatically.

It has **two modes**, chosen by **where the criteria comes from**:

| Mode | Source | What it does |
|---|---|---|
| **capture** (default) | **lived friction**: a bug, a collapse, a client rejection | Distills the scar into an Invariant Clue. |
| **arbitrate** | **imported criteria**: a skill, a style guide, a third-party playbook | Judges that criteria against **your** project's purpose. Only what survives gets in. |

> **The law of `arbitrate` mode: external criteria is not distilled — it is arbitrated.**
>
> A skill is criteria already distilled **by someone else, under someone else's purpose**, and it
> arrives without declaring where it stops being valid. Copying it into your Lore produces
> **redundant literature wearing the authority of an Invariant Clue**: criteria nobody paid for with
> real experience.
>
> That is why `arbitrate` has an exit HARD GATE: the resulting module **must** record **where the
> source contradicts your standard and loses**. No defeats section, no entry — either nothing was
> arbitrated (it was a copy), or the source carried no criteria at all.
>
> **What the source loses is worth more than what the source offers:** the summary already exists,
> better written, in the source. The disagreement exists nowhere else.

Two warnings `arbitrate` mode will give you:

- **Capacity ≠ criteria.** A skill that **executes** (renders video, crawls, compiles) is **used** as
  a dependency: it is not Lore. Only a skill that **judges** (what is good copy, good design, good
  SEO) gets arbitrated.
- **No identity, no arbitration.** If your `identidad.md` is empty, you have no yardstick: facing an
  authoritative source, all you can do is obey it. Identity first, source second.

---

### `transmute-lore`

Migrates existing projects into Lore’s architecture.

It has three modes:

- **add** → creates missing Lore artifacts.
- **clean** → removes redundant modules that already belong to the Area.
- **translate** → standardizes the language of an existing Lore, translating content and renaming artifacts into a single language, without altering structure or meaning.

---

## Lore Encryption (experimental)

`create-bot` can seal a bot's criteria so it travels encrypted. It is **optional and off by
default**: a bot without encryption is complete.

**The law: encrypt in distribution, never at consultation.** Payloads travel encrypted and are
decrypted **once** on clone; at rest the criteria is plain Markdown. Encrypting at the point where
the agent consults does not forbid reading — it makes reading **expensive**, and what is expensive
stops being consulted. That is the artifact dying of access cost.

AES-256-GCM with a scrypt-derived key, using only Node's stdlib — no dependencies. The passphrase is
read from *stdin*, never as an argument and never pasted into the chat.

> ### Status: experimental
>
> The template passes its self-test (round-trip, wrong passphrase, GCM tamper detection, no
> plaintext leak), but it has **not been audited**, has no key rotation, no revocation, and no answer
> for a leaked passphrase. It is a seal for a repository shared among people who already trust each
> other — not a security control between an adversary and something that matters.

Two boundaries that are always declared, and never papered over with language suggesting otherwise:

- It protects the repository and the transport. **It does not protect against someone holding the
  passphrase**: a shared key defends against a leak, not against a teammate.
- It does **not cover what an AI tool does with the text** once loaded into its context.

### Credit

The question — *what protects a Lore that has to be shared?* — was opened by **Mantra**, by
[LonelyAchemist](https://github.com/lonelyachemist-arch), a derivation of this kit that encrypted
the Lore **at rest**.

The question is theirs and it was a good one: Lore's corpus talks about patrimony and
transferability, and said nothing about ownership or confidentiality. **The answer here is
inverted**, for the reason above, and the code is not theirs: their SDK is not used. The idea is
Mantra's; the decision is not.

---

## Lore Language

**Lore speaks your language.**

The skills are written in English, but the Lore they generate is not: both the **content** and the **artifact filenames** are written in the language you work in. `identidad.md`, `principios.md`, `FASES.md` are the Spanish canonical forms; in English, for example, they become `identity.md`, `principles.md`, `PHASES.md`.

What stays fixed in every language:

- `CLAUDE.md` (a Claude Code convention), `lore/` (the kit’s own name), `index.md`, and `golden-paths.md`;
- structure and relative-path depth;
- English terms of general technical use (workflow, commit, stack, scaffold…).

Inside an existing Area or project, the established names win: naming schemes are never mixed. If a Lore ended up in the wrong language —or mixed— it is standardized with `transmute-lore` (**translate** mode), which translates content and renames artifacts together.

---

## Installation

### Claude Code

```bash
/plugin marketplace add andresanemic/lore-plugin
/plugin install lore@lore-plugin
```

---

### Other AI Tools

At its core, Lore is Markdown.

Each skill is made of:

- a YAML header (frontmatter);
- instructions written in Markdown.

The plugin packaging is specific to Claude Code.  
Lore’s architecture is not.

You can adapt Lore by copying any skill into the AI tool of your choice.

---

## Further Documentation

This README covers motivation and architecture. For everything else, there are three dedicated
documents (in Spanish and English), at the repository root:

| Document | What it's for |
|---|---|
| [`USAGE_en.md`](./USAGE_en.md) / [`USAGE_es.md`](./USAGE_es.md) | Practical day‑to‑day usage guide: installation, core loop, and each skill with examples. |
| [`REFERENCE_en.md`](./REFERENCE_en.md) / [`REFERENCE_es.md`](./REFERENCE_es.md) | Technical reference: core concepts, the exact spec for each artifact and each skill. |
| [`MIGRATION_en.md`](./MIGRATION_en.md) / [`MIGRATION_es.md`](./MIGRATION_es.md) | How to migrate an existing project into Lore using `transmute-lore`. |

---

## Repository Structure

```text
lore-plugin/
  .claude-plugin/
    plugin.json
    marketplace.json

  skills/
    using-lore/
    create-area/
    create-project/
    create-bot/
      plantillas/        # canon.js · sync.js · ecosistema.json
    save-to-lore/
    transmute-lore/

  README.md
  LICENSE
```

---

## Shared Invariants

All skills follow the same rules:

- Lore is written in the user's language.
- Criteria are never invented.
- Everything comes from real experience.
- Discarded noise is reported; it is never silently removed.
- Every change passes through a HARD GATE before being written.
- Nothing commits automatically.
- A human always reviews the final diff.

---

## Lore vs README

A README explains a project.  
Lore changes how future work will be done.

| README                          | Lore                                 |
|---------------------------------|--------------------------------------|
| Explains the project            | Constrains future decisions          |
| Stores information              | Preserves criteria                   |
| Written for humans              | Shared between humans and AI         |
| Describes the past              | Shapes the future                    |

---

## Why “Lore”

In video games, *lore* is what gives a universe coherence.

It is not the mechanics.

It is the accumulated story.

The rules that keep influencing everything that can happen afterwards.

Lore applies that same idea to software development.

It turns experience into shared criteria.

The original events stop being important.  
The criteria remain.

---

## Origin

Lore was born as a distillation of **LUS (Lore User System)**, a research program that studies how a human and an AI accumulate shared criteria over a long‑term collaboration.

LUS studies the relationship.  
Lore is an operational implementation that emerged from that research.

Its core principle can be summarized in a single idea:

> **Experience only creates value when it can participate in a future decision.**

Lore’s goal is to turn that idea into everyday practice for AI‑assisted development.

Some of the main influences behind the program are:

- **Martin Buber** — *I and Thou*
- **Claude Shannon** and **Warren Weaver** — *The Mathematical Theory of Communication*
- **Gregory Bateson** — “A difference that makes a difference”
- **Andy Clark** and **David Chalmers** — *The Extended Mind*

You can explore the research behind Lore in the LUS NotebookLM:

[NotebookLM for LUS](https://notebooklm.google.com/notebook/6191db3f-3f9b-4412-b792-86a081b79450)

---

## Case Studies

Lore was not designed on a whiteboard: every decision in this kit came from applying it to real
projects and watching what broke. LUS documents those applications as **case studies**. These are the
four that currently hold up the plugin's design.

> **Status:** these are cases, not proofs. Small n, and all four documented cases come from the same
> researcher. What they claim constrains how we use the kit; it does not pretend to be a law.

### Case 01 — Lore as the operational form of an entire project

A real project (*numerología*) built with Lore from start to finish, on top of a disciplined
development practice (SDD). It showed that the six-artifact architecture **holds up across a whole
project**, not just scattered notes: criteria accumulate, get consulted, and keep making decisions
months later.

### Case 02 — Multi-project transmutation: criteria can be recovered and shared

Four projects of a real area (*web development*) migrated to the standard with `transmute-lore`. It
left three things that are now law in this kit:

- **Criteria is recoverable** (`add` mode): a project born without Lore already had criteria scattered
  across comments, decisions, and scars. It is never invented: it is **rescued**.
- **Criteria is deduplicable** (`clean` mode): generic modules live **once, in the Area**. In one
  project, `clean` deleted 7 redundant modules (−866 lines) losing nothing: the criteria did not
  disappear, it **changed owner**.
- **Inheritance is selective:** each project references **only** the Area modules its stack actually
  uses. It is not a uniform dump.

**Declared boundary:** all four projects were in the same domain. Transferability *across* domains
remains a promise, not evidence.

### Case 03 — Imported criteria is not adopted: it is arbitrated

The case that produced `save-to-lore`'s `arbitrate` mode. Three areas distilled Lore from third-party
*skills*, and what we observed contradicted the intuition:

- **The value was not the summary of the skill — it was the disagreement.** In two different areas,
  the dense block of the resulting module was *"where the skill contradicts our standard and loses"*.
  That part **existed neither in the skill nor in the previous Lore**: it was born from the collision.
- **The same skill, arbitrated by two opposite purposes, loses in the same place for inverse
  reasons.** *Copywriting* skills were defeated in a marketing area (*"boring, functional copy always
  wins"*) and in a journalism area (*"we don't sell, we inform"*). The outcome does not depend on the
  source: it depends on **your** purpose.
- **Capacity ≠ criteria.** In the third area, a skill that *executes* (video rendering) was never
  distilled: it is used as a dependency. There was nothing to arbitrate.

**Declared boundary:** all three areas belong to the same user, using the same tool. The mechanism is
observed, not proven at scale.

### Case 04 — Lore without software: the structure survives outside code

The first case that crosses from software into another discipline. Two areas outside development —
journalism (*news writing*) and content strategy (*community management*) — already had real
distilled Lore, not scaffolding: thematic modules derived from real work (the anatomy of a
publishable article, the how-to of a brand strategy), consulted by real projects.

- **The architecture is not a software trait.** The same skeleton —identity, principles, thematic
  modules distilled from real work— reproduced itself in trades with no compiler or test, just a
  disciplined practice with an explicit purpose.
- **Existence is not measurement.** The case shows the method *produces* criteria in another domain;
  it does not yet measure that criteria *reduced re-learning* across sessions.

**Declared boundary:** criteria did not *travel* from software to journalism — each Lore was born
fresh in its own discipline. What replicates is the mechanism, not a concrete criterion transported
across domains.

### Case 05 — Case memory does not feed distillation: it displaces it

The method came back, six weeks later, to the project where it had been invented in raw form. It
found two preservation artifacts living side by side with opposite fates: a `lore/` of distilled
Clues that kept working, and an incident log that **took part in no decision at all** — not even
when the same technical territory that log documented broke again.

- **Preserving is not distilling, and the resemblance is the problem.** A case log satisfies the
  urge to preserve **without producing criteria**. Once the "leave a record" principle is met,
  nobody distills. The distillable criteria stays trapped inside: mining the log before deleting it
  surfaced two Clues that had sat there undistilled for six weeks.
- **"Indexed and mandatory" does not imply "consulted".** It was in the `CLAUDE.md` lookup table
  and it was law in `principios.md`, and still it never loaded. Accessibility is necessary and not
  sufficient: what decides is whether the artifact answers the question being asked.
- **The admission filter does not measure a Clue's altitude.** A Clue entered one day and the next
  failed to prevent the second symptom of its own root cause: it had been written about the surface
  that was seen, not the cause. The filter asks *whether* something enters, never *at what height*.

**Declared boundary:** this is software, same researcher and same interlocutor, and there is no
counterfactual — nobody measured whether the diagnosis would have been faster with the log loaded.
Testimonial evidence, not measurement.

### Case 06 — Inheritance between sibling Areas: freeze it or route it

A project needed criteria from four Areas, only one of which was its mother. **Lore's inheritance
model is vertical, and sibling Areas are nobody's mother.** Two independent solutions appeared 48
hours apart: **freezing** — copying snapshots and working on them, when the folder has to travel on
its own — and **routing** — deciding per task which body governs, when the team has no local tree.
The second is what `create-bot` packages.

- **Consuming is not inheriting.** You inherit from the mother Area; criteria from a sibling Area
  is **consumed**. The distinction decides something real: where a criterion promotes to once it
  generalizes. It rises to its own Area, never to the one that merely reads it.
- **What is distillable about a set of criteria is the border, not the criteria.** Two sibling
  Areas each had their half of the line written down: *"that does not live here"*. Neither had the
  rule for deciding which one governs a concrete task, because each body is written from inside its
  own purpose and the dividing line is only visible from outside both. That is where the bot's
  routing law comes from.

**Declared boundary:** the two observations are 48 hours apart, in the same ecosystem and with the
same researcher. They are not two independent cases: they are one continuous episode seen at two
moments. And it was **not** established that routing beats freezing — they answered different
constraints and neither was measured against the other.

Beyond the documented cases: the repository has already been cloned **400+ times** (316 unique
cloners, per GitHub's traffic API). That's a reach signal, not a demonstration — there's no evidence
of what anyone did with their copy. It doesn't count as a case; it doesn't answer the question the
cases do.
