# Lore Plugin 2.2 — The graft, and the handover that came back

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

Every line of this version came from **the first installation of the kit by someone who is not its author**: one hour over a video call, transcribed in full, on raw material with no prior Lore, in Codex rather than Claude Code. It is [Case 12](./CASES_en.md), and it is the first evidence in this repository that does not come from the same researcher.

Nothing changes in how the kit is installed or used.

## What 2.2 changes

### The transplant is now a graft

Reading the docs from outside for the first time, the installer — a chemist — validated *distill*, *crystallize* and *prune* against what those words actually mean in his field, and **rejected `transplant`** with an argument: moving a plant does not change the plant. It changes its location. And this mode does the opposite — it judges imported criteria against the purpose of the Entre it is entering, and only what survives gets in.

> **A graft is foreign tissue bound to a rootstock that is already alive: it takes or it is rejected, and what grows afterwards belongs to the host.**

`TRANSPLANT` becomes `GRAFT`, in the skills and in the documentation, in both languages. Same law, same four gates, same exit threshold — the module still has to say **where the source loses**. The metaphor was rewritten rather than substituted: it used to speak of *another soil*, which is a transplant's image, and now speaks of the rootstock, of taking, and of rejection.

`save-to-lore` still answers to the old name. A rename is the kit's problem, never the problem of someone who learned the word from a version that shipped.

*Two versions of internal review never caught this. One hour of an outsider reading the documentation did.*

### A request for bots stops coming back as areas

Asked to build bots on a machine with no Lore at all, the kit built **one area per bot** — `create-bot` never ran, nothing was federated.

The rule was already written in three places: the README, `create-bot` and `use-lore`. All three are read once you have decided to consult about bots. At the moment of the decision the skill actually running was `create-area`, the only one that did not say it, and the one that closes by pointing at `create-project`.

> **A law written outside the path of execution does not govern.** The guard belongs in the skill that runs, not in the one that documents.

| Skill | What changed |
|---|---|
| `create-area` | Returns to the skill that called it, in the same session, instead of closing on `create-project`. When `create-bot` called, the area is `bots` — **one** of them, holding every bot as a project, whose domain is the user's bots and never the domain of any one of them. |
| `create-bot` | Names that area when it delegates and declares that **it resumes** once the area exists. Rejects the inverse confusion — **a bot administers no bots**; one that exists to add or reorganize the others is the `bots` area wearing a bot's shape. Its premiere now opens by **opening the bot the way its user will**, confirming the session reaches the manifest's paths. |
| `use-lore` | Its first-use gate **routes** a request for a bot instead of answering it: the areas are steps, `create-bot` runs last, and the chain is named with its honest cost. |
| `obsidian-lore` | Note debt no longer counts, as the user's, a note the agent wrote itself minutes earlier. |

**The access check earns its own line**, because it failed disguised as something else: a host pointed at the folder it defaulted to, rather than the tree the bot federates, surfaces as the bot *«reading the wrong Lore»* — a symptom that sends whoever debugs it into the criteria and never into the access.

Three tests in `bench/skills-routing.test.mjs` fail if any of these guards is removed.

### The skills are in English on purpose, and now the docs say so

The installer opened a `SKILL.md` live, to show a colleague what the mode did, and could not read it. The English in a skill is the portable substrate that lets the kit run on other hosts — it was never the language of the kit, and the Lore it produces is written in the user's language, filenames included. The README now says that, and points at `REFERENCE_es.md` and `USAGE_es.md`, which document every mode in Spanish.

### Case 12 enters the case studies

With its declared boundary, which is narrow: `n=1`, one session of one hour, **accompanied live by the kit's author** — so it says nothing about installing the kit unaided, which is the question it leaves open. It also records what went right: with a short instruction, without the institution being explained, the bot routed on its own, cited its sources, closed by proposing a distillation and left the next session's prompt written down.

---

<a name="español"></a>

# Lore Plugin 2.2 — El injerto, y la entrega que vuelve

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

Todo lo de esta versión salió de **la primera instalación del kit hecha por alguien que no es su autor**: una hora por videollamada, transcrita completa, sobre material crudo sin ningún Lore previo, en Codex y no en Claude Code. Es el [Caso 12](./CASES_es.md), y es la primera evidencia de este repositorio que no viene del mismo investigador.

Nada cambia en cómo se instala ni cómo se usa el kit.

## Qué cambia en la 2.2

### El trasplante ahora es un injerto

Leyendo la documentación desde afuera por primera vez, el instalador —un químico— validó *destilar*, *cristalizar* y *podar* contra lo que esas palabras significan en su campo, y **rechazó `transplant`** con un argumento: mover una planta no cambia la planta. Cambia su ubicación. Y este modo hace lo contrario — juzga criterio importado contra la finalidad del Entre al que entra, y solo entra lo que sobrevive.

> **Un injerto es tejido ajeno unido a un patrón que ya está vivo: prende o es rechazado, y lo que crece después pertenece al huésped.**

`TRANSPLANT` pasa a `GRAFT`, en las skills y en la documentación, en los dos idiomas. Misma ley, mismas cuatro puertas, mismo umbral de salida — el módulo sigue teniendo que decir **dónde pierde la fuente**. La metáfora se reescribió en vez de sustituirse: hablaba de *otro suelo*, que es la imagen del trasplante, y ahora habla del patrón, del prendimiento y del rechazo.

`save-to-lore` sigue respondiendo al nombre viejo. Un renombre es problema del kit, nunca de quien aprendió la palabra en una versión publicada.

*Dos versiones de revisión interna no lo detectaron. Una hora de alguien de afuera leyendo la documentación, sí.*

### Pedir bots deja de devolver áreas

Al pedirle bots en una máquina sin nada de Lore, el kit construyó **un área por bot** — `create-bot` no llegó a correr y no se federó nada.

La regla ya estaba escrita en tres sitios: el README, `create-bot` y `use-lore`. Los tres se leen cuando alguien ya decidió consultar sobre bots. En el momento de la decisión corría `create-area`, la única que no lo decía, y la que cierra apuntando a `create-project`.

> **Una ley escrita fuera del camino de ejecución no gobierna.** La guardia va en la skill que corre, no en la que documenta.

| Skill | Qué cambió |
|---|---|
| `create-area` | Vuelve a la skill que la llamó, en la misma sesión, en vez de cerrar en `create-project`. Si la llamó `create-bot`, el área es `bots` — **una**, que aloja todos los bots como proyectos, y cuyo dominio son los bots del usuario y nunca el de ninguno de ellos. |
| `create-bot` | Nombra esa área al delegar y declara que **se reanuda** cuando el área existe. Rechaza la confusión inversa — **un bot no administra bots**; el que existe para agregar o reordenar a los otros es el área `bots` con forma de bot. Y su estreno abre **abriendo el bot como lo abrirá su usuario**, comprobando que la sesión alcanza las rutas del manifiesto. |
| `use-lore` | Su puerta de primer uso **enruta** una petición de bot en vez de contestarla: las áreas son pasos, `create-bot` corre al final, y la cadena se nombra con su costo honesto. |
| `obsidian-lore` | La deuda de notas deja de contarle al usuario, como suya, una nota que el propio agente escribió minutos antes. |

**El chequeo de acceso se gana su propia línea**, porque falló disfrazado: un host apuntando a la carpeta que trae por defecto, en vez de al árbol que el bot federa, aparece como que el bot *«lee el Lore equivocado»* — un síntoma que manda a depurar el criterio y nunca el acceso.

Tres pruebas en `bench/skills-routing.test.mjs` fallan si alguna de estas guardias desaparece.

### Las skills están en inglés a propósito, y ahora la documentación lo dice

El instalador abrió un `SKILL.md` en vivo, para mostrarle a alguien qué hacía el modo, y no pudo leerlo. El inglés de una skill es el sustrato portable que permite que el kit funcione en otros hosts — nunca fue el idioma del kit, y el Lore que produce se escribe en el idioma del usuario, nombres de archivo incluidos. El README ahora lo dice, y apunta a `REFERENCE_es.md` y `USAGE_es.md`, que documentan cada modo en español.

### El Caso 12 entra a los casos de estudio

Con su frontera declarada, que es estrecha: `n=1`, una sesión de una hora, **acompañada en vivo por el autor del kit** — así que no dice nada sobre instalar el kit sin ayuda, que es la pregunta que deja abierta. Registra también lo que salió bien: con una instrucción corta, sin explicarle la institución, el bot enrutó solo, citó sus fuentes, cerró proponiendo una destilación y dejó escrito el prompt de la sesión siguiente.
