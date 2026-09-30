# Lore Plugin 2.4.9 — Vespi arrives, and a reminder that holds the agreement in place

> **Borrador de RC6 — todavía no lanzado.** No hay tag, no hay publicación y no hay
> instalación. La última versión publicada es [`2.4.8`](./RELEASE_2.4.8.md).

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

**Vespi has joined the kit, and it is the reason this version exists.** If you have been using
Lore Plugin, you keep every one of its seven skills and everything you have already distilled.
What is new is an eighth skill that answers one sentence you have probably typed before — *«esto me
está complicando»*, *«se está perdiendo lo que decidimos»*, *«sigamos mañana»* — and hands you back
what was agreed, without restarting from a summary. It is experimental, it says what it sees as
what it sees, and the decision stays yours.

Here is all of it, on your first morning. Open a session and, once, a short message tells you that
Vespi arrived, what it can do for you, and offers to fix your limits — how the skills speak to you,
and which models or model tiers they may never use. Say yes and it is written; say nothing and
nothing changes. From then on:

```text
› esto me está complicando demasiado
```

```text
  Según las notas, llevamos tres sesiones con la tienda, y el
  acuerdo decía encargos por mensaje. Supongo que la tienda
  se sumó en el camino.

  ¿La sumamos al acuerdo, o volvemos a lo acordado y la
  dejamos para después?
```

You choose. If a model tried to answer that for you, the operation would come back to you instead.

## The two things that reach you in a working host

**The per-turn reminder.** The agreement you approved is on disk, and a model that can read it will
act as if it had it — then a turn that made eighteen decisions can end leaving `FASES.md` saying
what it was already saying. Knowing is not remembering. Once a session is loaded, a pointer under
sixty tokens goes in front of the conversation on each turn: your two dials and the state of the
agreement, and nothing else — no body of criteria, which the host already loaded once. You choose
the level and you can switch it off; the default is the one that holds the agreement, because that
is the second of the four bets this kit makes.

**The statusline mark.** `[Lore Plugin]` appears in Claude Code's status line and OpenCode's bottom
TUI status area. It lives there and not in replies because replies are context and status areas are
not: the mark costs zero conversation tokens and interrupts nobody. The explicit RC6 installer wires
the mark; lifecycle hooks do not write host configuration. OpenCode preserves other `tui.json`
entries and the mark follows the existing `full` / `lite` / `off` setting.

## The two that do not reach you yet

**OpenCode.** The kit's hooks now speak OpenCode's own API, read from the installed binary rather
than from its documentation: `session_start` as a plugin body that runs once at load, `pre_tool_use`
as `tool.execute.before` with the denial thrown, `post_tool_use` as `tool.execute.after` plus the
system transform that gets the text to the model. The file translates OpenCode's vocabulary
(`write`/`edit` with `filePath`, `apply_patch` with `patchText`) into what the core already
understands; it does not copy another host's payload.

**This is code in this repository, not yet Andrés's installation.** The TUI mark rendered in an
isolated OpenCode 1.18.33 session in `full`, `lite`, and `off`; installation across his three hosts
is still pending. The installed RC5 build does not contain the reminder or OpenCode hooks. Still
open: whether a model on Andrés's hosts receives the per-turn pointer, and how far the reminder can
go before it becomes noise rather than support.

## What left in 2.4.9

Four things left the kit: **Lore encryption**, the **`lore-ecosistema/` copy** for teammates without
your folder tree, the **minimal local launcher** of `create-bot`, and the **Professor with its
Notebook** — the last of which was never a kit component but a working notebook living in one bot's
tree, discarded outright. Working with other people is now a **shared repository**, which keeps one
owner and one version where the copy could not.

A bot is unchanged by their absence. `canon/` and `lore/` are committed as plain Markdown, and a
private repository is what keeps them from travelling in the clear; a bot is a folder, and opening
it is the whole of what the launcher did. Nobody who used any of them is broken, and each is told
once, in plain language, what it did and what to use instead: an existing `canon.enc` is yours to
decrypt, an existing `lore-ecosistema/` is left untouched — never written, never pruned — and
**`transmute-lore` CRYSTALLIZE still reads it and still travels it**, so a bot built under the old
kit still crystallizes, for NotebookLM or any Markdown-only reader.

The write guard also changed what it decides on. It no longer works from a list of allowed paths: it
derives what belongs to the session and classifies every destination as own, foreign or unknown,
because an allowlist blocks work that is legitimately yours as soon as a real project grows a path
nobody listed. **Own** passes. **Foreign** is denied, naming the path, because it is another
owner's criterion and the change has to become a message. **Unknown** passes with a visible notice
and a written record. The kit moves to the **Apache 2.0** license with a `NOTICE`, in place of MIT,
so the authorship of the code and of the third-party material it carries is written where whoever
installs it will read it.

`save-to-lore` carries its safeguards as verifiable code instead of prose: every new clue must name
the evidence that earned it through a relative pointer that resolves to a real file — the
`evidencia:` line starts at column 0-3 with spaces, no `>`, no leading tab (4+ spaces is indented
code and never counts), outside fenced examples — gated per new clue with
`node skills/save-to-lore/scripts/save-to-lore.mjs --pista <pista.md> --seccion "<the new clue's heading>"`,
checked by a limited fence-aware scan, not a general Markdown parser. No note is ever deleted to make
room for criteria, and a learning that would travel beyond the area asks whether it belongs to
anyone or to this person before it moves — to the kit as a proposal, never auto-committed, or to the
root of the person's garden.

The README describes the guard and Vespi in both languages, and the eight skills this version
publishes — the seven that were there, plus the experimental `vespi` — keep their names.

## What was tested, and what was not

Two fields, not one. What ran, with its number, its scope and its cut — and what has not run at all.

| Claim | Result | Cut and scope |
|---|---|---|
| Kit suite, `npm test` | **522 tests, 521 pass, 0 fail, 1 skipped, 0 TODO** | RC6 working source on 2026-09-30, including both status mark installers. The previous jurisdiction TODOs now run as passing tests. This is not an installed or released build. |
| Vespi kernel at RC5, `node --test test/*.test.js` at `54c20c7` | **181/181**, exit 0 | The historical RC5 figure, reproduced in a clean detached checkout of that commit. It is no longer what `skills/vespi/core/kernel/SOURCE.md` vendors: that file now points at the RC6 commit `892bd91`. Dependency-free, so the figure does not need the demo. |
| Vespi kernel RC6 source, `node --test` at `892bd91` | **249/249**, 0 fail, 0 skipped, 0 TODO | The full upstream kernel suite, run and confirmed by the coordinator. These bytes are **already vendored in source** — `skills/vespi/core/kernel/SOURCE.md` points at `892bd91` — and **not installed**: the hosts still run RC5. An independent verifier is now required before a local receipt can advance continuity. |
| `NOTICE` of the kernel | **Corrected.** It said the commits are signed; `git log --format='%G?'` returns `N` for all 47, so there is no verifiable signature and none is claimed. | Authenticity of a receipt is not claimed from its SHA-256 either: the digest carries no key and proves integrity, not who wrote it. |
| Benchmark for this version | **Not run.** The published benchmark is [`2.3.2`](../bench/effect-2.3.2/) and measures that version, not this one. No number here describes RC6. | — |
| External review | **Pending.** An Anthropic superreview and a security review with Andrés have not run. No review is credited here without its run attached. | — |
| Installation | **RC5 on three hosts, copies compared by fingerprint.** It does not contain the reminder or the OpenCode hooks, and it is not evidence that a model receives either of them. | — |

## Where the rest lives

This note opens and closes; the depth is in the documentation, and it is not cut to fit.

| | |
|---|---|
| [`90_SECONDS_en.md`](./90_SECONDS_en.md) | The whole mechanism, short enough to read before deciding whether to install anything. |
| [`REFERENCE_en.md`](./REFERENCE_en.md) | **Why, how and what.** Getting started, day-to-day use, the exact spec for every skill, mode and artifact, and how to migrate an existing project. |
| [`Vespi section of the README`](../README.md#vespi) | What the kernel does today, in plain words, in both languages. |
| [`/andresanemic/vespi`](https://github.com/andresanemic/vespi) | The kernel on its own, with its own changelog and its own release notes. |
| [`SPEC_KIT_en.md`](./SPEC_KIT_en.md) | Lore alongside GitHub's spec-kit: who governs what. Optional. |
| [`bench/`](https://github.com/andresanemic/lore-plugin/tree/main/bench) | The benchmark instrument, its method, its declared limits and its raw results. |

No migration is required. Existing Lore, existing bots and existing federated routing keep working,
and no public skill was removed.

---

# Lore Plugin 2.4.9 — Llega Vespi, y un recordatorio que sostiene lo acordado

> **Borrador de RC6 — todavía no lanzado.** No hay tag, no hay publicación y no hay
> instalación. La última versión publicada es [`2.4.8`](./RELEASE_2.4.8.md).

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

**Vespi se sumó al kit, y esa es la razón de que exista esta versión.** Si vienes usando Lore
Plugin, conservas sus siete skills y todo lo que ya destilaste. Lo nuevo es una octava skill que
contesta una frase que probablemente ya escribiste — *«esto me está complicando»*, *«se está
perdiendo lo que decidimos»*, *«sigamos mañana»* — y te devuelve lo acordado, sin reiniciar desde
un resumen. Es experimental, dice lo que ve como lo que ve, y la decisión sigue siendo tuya.

Esto es todo, en tu primera mañana. Abre una sesión y, una sola vez, un mensaje corto te dice que
llegó Vespi, qué puede hacer por ti, y te ofrece fijar tus límites: cómo te hablan las skills y qué
modelos o niveles de modelo no se usarán nunca. Dices que sí y queda escrito; no dices nada y nada
cambia. Desde entonces:

```text
› esto me está complicando demasiado
```

```text
  Según las notas, llevamos tres sesiones con la tienda, y el
  acuerdo decía encargos por mensaje. Supongo que la tienda
  se sumó en el camino.

  ¿La sumamos al acuerdo, o volvemos a lo acordado y la
  dejamos para después?
```

Tú eliges. Y si un modelo hubiera respondido eso por ti, la operación te habría vuelto a ti.

## Las dos cosas que sí llegan a un host de trabajo

**El recordatorio por turno.** El acuerdo que aprobaste está en disco, y un modelo que lo puede leer
se comporta como si lo tuviera — y entonces un turno que tomó dieciocho decisiones puede terminar
dejando `FASES.md` diciendo lo que ya decía. Saber no es recordar. Una vez cargada la sesión, un
puntero de menos de sesenta tokens se pone delante de la conversación en cada turno: tus dos
perillas y el estado del acuerdo, y nada más — ningún cuerpo de criterio, que el host ya cargó una
vez. Tú eliges el nivel y lo puedes apagar; el defecto es el que sostiene el acuerdo, porque esa es
la segunda de las cuatro apuestas del kit.

**La marca en la línea de estado.** `[Lore Plugin]` aparece en la línea de estado de Claude Code y en
la franja inferior de la TUI de OpenCode. Vive ahí y no en las respuestas porque estas son contexto
y la franja no: la marca cuesta cero tokens de conversación y no interrumpe. El instalador explícito
de RC6 la conecta; ningún hook escribe la configuración del host. OpenCode conserva las demás
entradas de `tui.json`, y la marca sigue el nivel `full` / `lite` / `off`.

## Las dos que todavía no llegan

**OpenCode.** Los hooks del kit ahora hablan la API propia de OpenCode, leída del binario instalado
y no de su documentación: `session_start` como cuerpo de plugin que corre una vez al cargar,
`pre_tool_use` como `tool.execute.before` con el bloqueo lanzado, y `post_tool_use` como
`tool.execute.after` más la transformación de sistema que lleva el texto al modelo. El archivo
traduce el vocabulario de OpenCode (`write`/`edit` con `filePath`, `apply_patch` con `patchText`) a
lo que el núcleo ya entiende; no copia el payload de otro host.

**Esto es código en este repositorio, todavía no la instalación de Andrés.** La marca TUI se renderizó
en una sesión aislada de OpenCode 1.18.33 en niveles `full`, `lite` y `off`; aún falta instalarla en
sus tres hosts. La RC5 instalada no contiene el recordatorio ni los hooks de OpenCode. Sigue abierto
si un modelo en los hosts de Andrés recibe el puntero por turno y hasta dónde puede llegar el
recordatorio antes de volverse ruido en vez de apoyo.

## Lo que salió en 2.4.9

Cuatro cosas salieron del kit: **el cifrado del Lore**, la **copia `lore-ecosistema/`** para
compañeros sin tu árbol, el **launcher local mínimo** de `create-bot` y el **Professor con su
Cuaderno** — este último nunca fue componente del kit sino un cuaderno de trabajo que vivía en el
árbol de un bot, descartado por completo. Con otras personas se trabaja ahora en un **repositorio
compartido**, que deja un dueño y una versión donde la copia no podía.

La ausencia de las cuatro no cambia un bot. `canon/` y `lore/` se commitean como Markdown plano, y
lo que evita que viajen en claro es un repositorio privado; un bot es una carpeta, y abrirla es
todo lo que hacía el launcher. Nadie que usara alguna queda roto, y a cada uno se le dice una vez,
en llano, qué hacía y qué usar ahora: un `canon.enc` existente es tuyo para descifrar, una copia
`lore-ecosistema/` existente se deja intacta — nunca se escribe, nunca se poda— y
**`transmute-lore` CRYSTALLIZE la sigue leyendo y la sigue llevando**, así que un bot hecho con el
kit viejo sigue cristalizando, para NotebookLM o para cualquier lector que solo entienda Markdown.

La guardia de escritura también cambió en qué decide. Deja de trabajar con una lista de rutas
permitidas: deriva lo que le pertenece a la sesión y clasifica cada destino como propio, ajeno o
desconocido, porque una lista de permitidos termina bloqueando trabajo que sí es tuyo en cuanto un
proyecto real crece una ruta que nadie anotó. **Propio** pasa. **Ajeno** se bloquea nombrando la
ruta, porque es criterio de otro dueño y el cambio tiene que convertirse en un mensaje.
**Desconocido** pasa con un aviso visible y queda anotado. El kit pasa a la licencia **Apache 2.0**
con su `NOTICE`, en lugar de MIT, para que la autoría del código y del material de terceros que
viaja con él quede escrita donde quien lo instala la va a leer.

`save-to-lore` lleva ahora sus salvaguardas como código verificable en vez de prosa: cada Pista
nueva debe nombrar la evidencia que la ganó con un puntero relativo que resuelva a un archivo real
— la línea `evidencia:` empieza en la columna 0-3 con espacios, sin `>`, sin tabulador inicial (4+
espacios es código indentado y nunca cuenta), fuera de ejemplos cercados —, puerta por Pista nueva
con `node skills/save-to-lore/scripts/save-to-lore.mjs --pista <pista.md> --seccion "<encabezado de la Pista nueva">`,
comprobado por un rastreo limitado de cercas, no un parser general de Markdown. Ninguna nota se
borra jamás para hacer lugar al criterio, y un aprendizaje que viajaría más allá del área pregunta
si es de cualquiera o de esta persona antes de moverse — al kit como propuesta, nunca
auto-commiteado, o a la raíz del jardín de la persona.

El README describe la guardia y a Vespi en los dos idiomas, y las ocho skills que publica esta
versión —las siete que ya estaban, más la experimental `vespi`— conservan sus nombres.

## Qué se probó, y qué no

Dos campos, no uno. Lo que se corrió, con su cifra, su alcance y su corte — y lo que no se ha
corrido.

| Afirmación | Resultado | Corte y alcance |
|---|---|---|
| Suite del kit, `npm test` | **522 tests, 521 pass, 0 fail, 1 skip, 0 TODO** | Fuente de trabajo RC6 del 30/09/2026, incluidas ambas marcas de estado. Los TODO anteriores de jurisdicción ya corren como pruebas verdes. Aún no es un paquete instalado ni publicado. |
| Kernel de Vespi en RC5, `node --test test/*.test.js` en `54c20c7` | **181/181**, exit 0 | La cifra histórica de RC5, reproducida en un checkout limpio y detached de ese commit. Ya no es lo que vendoriza `skills/vespi/core/kernel/SOURCE.md`: ese archivo ahora apunta al commit RC6 `892bd91`. Sin dependencias, así que la cifra no necesita la demo. |
| Kernel de Vespi, fuente RC6, `node --test` en `892bd91` | **249/249**, 0 fallos, 0 skip, 0 TODO | La suite completa del kernel upstream, corrida y confirmada por el coordinador. Esos bytes ya están **vendorizados en la fuente** — `skills/vespi/core/kernel/SOURCE.md` apunta a `892bd91` — y **no están instalados**: los hosts siguen en RC5. La continuidad exige un verificador independiente antes de avanzar desde un recibo local. |
| `NOTICE` del kernel | **Corregido.** Decía que los commits están firmados; `git log --format='%G?'` devuelve `N` en los 47, así que no hay firma verificable y no se reclama ninguna. | La autenticidad de un recibo tampoco se reclama desde su SHA-256: el digest no lleva clave y prueba integridad, no quién lo escribió. |
| Benchmark de esta versión | **No corrido.** El benchmark publicado es el [`2.3.2`](../bench/effect-2.3.2/) y mide esa versión, no esta. Ninguna cifra de aquí describe la RC6. | — |
| Revisión externa | **Pendiente.** Una superreview de Anthropic y una revisión de seguridad con Andrés no se han corrido. Aquí no se acredita ninguna revisión sin su corrida adjunta. | — |
| Instalación | **RC5 en tres hosts, copias cotejadas por huella.** No contiene el recordatorio ni los hooks de OpenCode, y no es evidencia de que un modelo reciba alguno de los dos. | — |

## Dónde vive el resto

Esta nota abre y cierra; la profundidad está en la documentación, y no se recorta para que quepa.

| | |
|---|---|
| [`90_SECONDS_es.md`](./90_SECONDS_es.md) | El mecanismo completo, corto como para leerlo antes de decidir si instalas algo. |
| [`REFERENCE_es.md`](./REFERENCE_es.md) | **Porqué, cómo y qué.** Cómo empezar, uso cotidiano, la especificación exacta de cada skill, modo y artefacto, y cómo migrar un proyecto existente. |
| [`Sección Vespi del README`](../README.md#vespi) | Qué hace hoy el kernel, en llano, en los dos idiomas. |
| [`/andresanemic/vespi`](https://github.com/andresanemic/vespi) | El kernel por su cuenta, con su changelog y sus notas de versión. |
| [`SPEC_KIT_es.md`](./SPEC_KIT_es.md) | Lore junto a spec-kit de GitHub: quién gobierna qué. Opcional. |
| [`bench/`](https://github.com/andresanemic/lore-plugin/tree/main/bench) | El instrumento del benchmark, su método, sus fronteras declaradas y sus resultados crudos. |

No hace falta migración. Tu Lore, tus bots y tu enrutamiento federado siguen funcionando, y no se
quitó ninguna skill pública.

---

> **Lo que este borrador todavía no puede decir.** No es una RC6 congelada: la recepción del
> recordatorio por un modelo en un host real está abierta, la superreview de Anthropic y la
> revisión de seguridad no se han corrido, y el benchmark de esta versión no existe todavía.
> Estar en la instalación RC5 no acredita que una pieza nueva llegue sola a un host.
