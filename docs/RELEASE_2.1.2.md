# Lore Plugin 2.1.2 — The last step is not a precondition

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

2.1.1 fixed the **path**: a request for a bot is routed, not answered with an Area. The **closes** an agent reads first — the summary table, the last paragraph of `create-bot`, the migration guide, and one paragraph inside `use-lore` — still said the opposite. They asked for Lore to exist before a bot could be created.

Nothing changes in how the kit is installed or used. `create-bot` already had `nuevo` and the chain from a raw folder. This patch makes the surfaces say that.

## What 2.1.2 changes

### The close stops requiring prior Lore

On 2.1.1 the body of `create-bot`, the README section and `use-lore` §0 already described building a bot from zero. The sentence that closed the section — and the README's "When" column — still required Lore worth gathering first.

That is the same class of defect as Case 12, one layer up: a law written in the body does not govern if the close contradicts it. The close is what gets quoted.

| Surface | What it said | What it says now |
|---|---|---|
| `use-lore` trigger table (`REFERENCE`) | Area or project | Area, project **or bot** |
| `create-bot` close (`USAGE`, `REFERENCE`, README table) | Use it once Lore already exists | From zero, or once there is Lore to federate |
| `MIGRATION` | Stopped at `transmute-lore` | Step 6 continues the chain to `create-bot` |
| `use-lore` "Order of a fresh setup" | The bot comes later, once Lore exists | The bot is the last step of the deliverable, not a precondition |

A test in `scripts/skill-consistency.test.mjs` fails if any of those live surfaces regresses.

### What this is not

Not a new capability. Not a rename. Not a change to how `create-area` or `create-bot` run. 2.2 remains reserved for Graphify.

---

<a name="español"></a>

# Lore Plugin 2.1.2 — El último paso no es una precondición

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

La 2.1.1 corrigió el **camino**: una petición de bot se enruta, no se contesta con un Área. Los **cierres** que un agente lee primero —la tabla de resumen, el último párrafo de `create-bot`, la guía de migración y un párrafo dentro de `use-lore`— seguían diciendo lo contrario. Pedían que el Lore existiera antes de poder crear un bot.

Nada cambia en cómo se instala ni cómo se usa el kit. `create-bot` ya tenía `nuevo` y la cadena desde una carpeta en bruto. Este parche hace que las superficies lo digan.

## Qué cambia en la 2.1.2

### El cierre deja de exigir Lore previo

En la 2.1.1 el cuerpo de `create-bot`, la sección del README y el §0 de `use-lore` ya describían construir un bot desde cero. La frase que cerraba la sección —y la columna «Cuándo» del README— seguían exigiendo Lore reunible primero.

Es la misma clase de defecto que el Caso 12, un piso más arriba: una ley escrita en el cuerpo no gobierna si el cierre la contradice. El cierre es lo que se cita.

| Superficie | Qué decía | Qué dice ahora |
|---|---|---|
| Tabla de disparador de `use-lore` (`REFERENCE`) | Área o proyecto | Área, proyecto **o bot** |
| Cierre de `create-bot` (`USAGE`, `REFERENCE`, tabla del README) | Úsalo cuando el Lore ya existe | Desde cero, o cuando ya hay Lore que federar |
| `MIGRATION` | Terminaba en `transmute-lore` | El paso 6 continúa la cadena hasta `create-bot` |
| `use-lore` «Order of a fresh setup» | El bot llega después, cuando el Lore existe | El bot es el último paso del entregable, no una precondición |

Una prueba en `scripts/skill-consistency.test.mjs` falla si alguna de esas superficies vivas regresa.

### Qué no es esto

No es una capacidad nueva. No es un renombre. No cambia cómo corren `create-area` ni `create-bot`. La 2.2 sigue reservada para Graphify.
