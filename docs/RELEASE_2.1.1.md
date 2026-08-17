# Lore Plugin 2.1.1 — The handover that came back

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

A patch release. **No new capabilities, no change to how the kit is installed or used** — 2.1.1 fixes one routing failure and the two that came with it, all three found the same way: someone who is not the author installed the kit and used it for an hour.

## What it fixes

**A request for bots produced areas.** Asked to build bots on a machine with no Lore at all, the kit built one **area per bot**, without ever invoking `create-bot` and without federating anything.

The rule it broke was already written in three places — `README.md`, `create-bot` (*«why it must not be an area»*) and `use-lore` (*«the third shape»*). All three are read once you have decided to consult about bots. At the moment of the decision the skill actually running was `create-area`, which was the only one that did not say it, and which closes by pointing at `create-project`.

> **A law written outside the path of execution does not govern.** The guard belongs in the skill that runs, not in the one that documents.

So the handover now returns:

| Skill | What changed |
|---|---|
| `create-area` | Knows it is often a **step**, not a destination: when another skill sent it, it returns to that skill in the same session instead of closing on `create-project`. When `create-bot` sent it, the area is `bots` — **one** of them, holding every bot as a project, whose domain is the user's bots and never the domain of any one of them. |
| `create-bot` | Names that area when it delegates and declares that **it resumes** once the area exists. Adds the inverse confusion: **a bot administers no bots** — one that exists to add or reorganize the others is the `bots` area wearing a bot's shape. Its premiere now opens by **opening the bot the way its user will**, confirming the session reaches the manifest's paths. |
| `use-lore` | Its first-use gate **routes** a request for a bot instead of answering it. The areas are steps, `create-bot` runs last, and the chain is named out loud with its honest cost. |

**And the access check earns its own line**, because it failed as something else: a host pointed at the folder it defaulted to, rather than at the tree the bot federates, surfaces as the bot *«reading the wrong Lore»* — a symptom that sends whoever debugs it into the criteria and never into the access.

Three tests in `bench/skills-routing.test.mjs` fail if any of these guards is removed.

## Where it came from

The first installation of this kit by **someone other than its author**, accompanied over a video call, on raw material with no prior Lore, in Codex rather than Claude Code. Every case study published so far carries the declared boundary that its evidence comes from the same researcher; this one does not.

The case stays open — the study is not written until it closes, and what it teaches after today ships in its own version.

---

<a name="español"></a>

# Lore Plugin 2.1.1 — La entrega que vuelve

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

Una versión de parche. **Ninguna capacidad nueva, nada cambia en cómo se instala ni cómo se usa el kit** — la 2.1.1 corrige un fallo de enrutamiento y los dos que venían con él, los tres encontrados igual: alguien que no es el autor instaló el kit y lo usó durante una hora.

## Qué corrige

**Se pidieron bots y salieron áreas.** Al pedirle bots en una máquina sin nada de Lore, el kit construyó **un área por bot**, sin invocar `create-bot` en ningún momento y sin federar nada.

La regla que se rompió ya estaba escrita en tres sitios — `README.md`, `create-bot` (*«por qué no debe ser un área»*) y `use-lore` (*«la tercera forma»*). Los tres se leen cuando ya decidiste consultar sobre bots. En el momento de la decisión, la skill que corría era `create-area`: la única que no lo decía, y la que además cierra apuntando a `create-project`.

> **Una ley escrita fuera del camino de ejecución no gobierna.** La guardia va en la skill que corre, no en la que documenta.

Así que la entrega ahora vuelve:

| Skill | Qué cambió |
|---|---|
| `create-area` | Sabe que muchas veces es un **paso** y no un destino: si la mandó otra skill, vuelve a esa skill en la misma sesión en vez de cerrar en `create-project`. Si la mandó `create-bot`, el área es `bots` — **una**, que aloja todos los bots como proyectos, y cuyo dominio son los bots del usuario y nunca el de ninguno de ellos. |
| `create-bot` | Nombra esa área al delegar y declara que **se reanuda** cuando el área existe. Suma la confusión inversa: **un bot no administra bots** — el que existe para agregar o reordenar a los otros es el área `bots` con forma de bot. Y su estreno ahora abre **abriendo el bot como lo abrirá su usuario**, comprobando que la sesión alcanza las rutas del manifiesto. |
| `use-lore` | Su puerta de primer uso **enruta** una petición de bot en vez de contestarla. Las áreas son pasos, `create-bot` corre al final, y la cadena se nombra en voz alta con su costo honesto. |

**Y el chequeo de acceso se gana su propia línea**, porque falló disfrazado: un host apuntando a la carpeta que trae por defecto, en vez de al árbol que el bot federa, aparece como que el bot *«lee el Lore equivocado»* — un síntoma que manda a depurar el criterio y nunca el acceso.

Tres pruebas en `bench/skills-routing.test.mjs` fallan si alguna de estas guardias desaparece.

## De dónde salió

La primera instalación de este kit hecha por **alguien que no es su autor**, acompañada por videollamada, sobre material crudo sin ningún Lore previo, en Codex y no en Claude Code. Todos los casos publicados hasta hoy llevan declarada la frontera de que su evidencia viene del mismo investigador; este no.

El caso sigue abierto — el estudio no se escribe hasta que cierre, y lo que enseñe de hoy en adelante sale en su propia versión.
