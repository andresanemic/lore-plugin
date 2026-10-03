### 3.8 Función de notas que carga `save-to-lore`

**Propósito:** capturar notas sueltas y minar la bandeja sin depender de una aplicación. La nota
siempre es material fuente; `save-to-lore` es dueña de cualquier criterio que sobreviva
clasificación, enrutamiento y umbral. El detalle operativo vive en `skills/save-to-lore/notas.md` y
se carga solo cuando la petición trata una carpeta de notas.

**Precondición:** la raíz de trabajo debe ser la **carpeta madre que contiene las Áreas**, no una carpeta al lado — la función verifica que al menos un hijo directo de la raíz tenga `lore/`, o se detiene y apunta a `create-area`. La ruta nunca se asume.

**La bandeja:** una carpeta nombrada en el idioma del usuario (`notas/`, `notes/` o `apuntes/`). El barrido es recursivo y extrae `.md`, `.txt` y `.docx`; las subcarpetas quedan a criterio de quien escribe.

**Recomendación permanente: la bandeja vive en un bot.** Es la configuración recomendada en la primera ejecución y cada vez que un barrido ocurre fuera de un bot. La razón es el enrutamiento: un bot enruta cada nota **contra `lore/enrutamiento.md`**, donde está escrita la finalidad de cada Área y proyecto federado, y los casos frontera se preguntan en vez de adivinarse. Fuera de un bot, el enrutamiento sale de una sola ruta y de la lectura del texto — una conjetura con la misma cara de certeza. ¿Sin bot y notas que tocan más de un Área? La función propone `create-bot`.

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

**Idempotencia y ciclo de vida:** al cerrar, cada nota minada recibe su `destilado:` con fecha y destino — incluidas las que no produjeron nada. Una nota con `destilado` no vacío se salta en los barridos siguientes. Las notas cerradas se mueven luego a `<bandeja>/archivadas/` (una bandeja que ya usa otra subcarpeta para esto conserva su nombre); un cuaderno vivo con `destilado:` vacío se queda donde está. La marca viaja con el archivo, así que la idempotencia se mantiene y el conteo de deuda no cambia. **La función nunca borra una nota:** mover no es borrar; se mina antes de borrar, y borrar lo decide el humano.

**Por qué un barrido y no un comando disponible.** Una nota satisface las ganas de preservar con el criterio inerte adentro — separar las notas del Lore no lo evitó: el registro siguió inerte seis semanas. Lo que lo evita es el barrido y su deuda visible, que `save-to-lore` también reporta al cerrar.

Usa `save-to-lore` cuando ya acumules notas y quieras que dejen de ser solo notas — no es un gestor de notas: las herramientas de lectura ya leen la bandeja.

---

