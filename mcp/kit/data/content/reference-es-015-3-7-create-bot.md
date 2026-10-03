### 3.7 `create-bot`

**Nacimiento desde una idea:** la declaración inicial es canon provisional; la configuración ejecuta el ciclo hasta una primera victoria revisada. Toda interfaz mantiene canon, lógica y presentación aparte, pone decisiones antes que prompts y deriva el estado de Travesía del propósito.

**Rol:** Construir un **bot** — un lugar donde abrir una sesión y trabajar en varios proyectos o
Áreas a la vez, con su criterio alcanzable y enrutado, y cargado bajo demanda, en vez de responder preguntas sobre ellos.

Un bot es hermano de `create-project`, no de `create-area`: vive en `{área}/proyectos/{slug}/`. Lo
distingue **una** propiedad: **enruta hacia afuera**, hacia Lore que pertenece a otros proyectos y
Áreas. Por defecto es una carpeta con su canon y su contrato elegido por host: abrir la sesión carga
el canon y la tabla de enrutamiento, mientras los cuerpos enrutados se leen cuando la tarea los
selecciona. No se instala nada. **Empaquetar significa CRYSTALLIZE**, no un plugin instalable.

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

**La copia `lore-ecosistema/` salió del kit en 2.4.9.** Duplicaba el criterio prestado de un bot para
que alguien que clonó el repositorio sin tu árbol igualmente tuviera criterio; **ahora el camino con
otras personas es un repositorio compartido**, que deja un dueño y una sola versión. Una carpeta
`lore-ecosistema/` que ya exista se deja intacta: `transmute-lore` CRYSTALLIZE la sigue leyendo
cuando falta la fuente viva, y la sigue llevando, así que no se pierde nada de lo ya construido.

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

Salió en 2.4.9, y qué usar en su lugar:

- **El cifrado** sellaba el criterio de un bot para que viajara cifrado — apagado por defecto, sin
  auditar, sin rotación de claves y sin respuesta para una passphrase que se filtra. **Ahora lo hace
  un repositorio privado**, y sin una passphrase que perder: `canon/` y `lore/` se commitean como
  Markdown plano y nunca salen del repositorio en claro. Un `canon.enc` que ya tengas es tuyo:
  descifralo una vez y commitea el Markdown.
- **La copia `lore-ecosistema/`** duplicaba el criterio prestado para un compañero sin tu árbol.
  **El camino con otras personas es un repositorio compartido.** Una carpeta que ya exista nunca se
  escribe, nunca se poda, y sigue viajando cuando cristalizas.
- **El launcher local** ofrecía un menú chico para abrir carpetas gobernadas por Lore en Claude Code
  CLI o Codex CLI. **Abrir la carpeta es todo**: un bot es una carpeta y su contrato carga al abrir
  una sesión ahí. Un launcher tuyo, fuera del kit, no se toca.

Un bot sin nada de eso está completo. **Empaquetar es cristalizar**, no envolver el bot como plugin:
extraer la fotografía reconstruye la carpeta, y así viaja el trabajo a quien no tiene tu árbol.

Usa `create-bot` cuando quieras una sola sesión que trabaje sobre varios proyectos — con o sin Lore previo: sin él, orquesta la cadena de arriba; con él, lo federa. Nunca sustituye construir ese Lore en el Área que lo posee.

