# Benchmark — ¿el criterio guardado cambia lo que el agente escribe?

> [← Volver al README](../README.md)

Un README puede prometer que el criterio guardado evita repetir errores. Esto lo mide.

## La idea

Cada **Pista Invariante** del Lore ya está escrita como un aserto falsable. No dice *"tuvimos un
problema con las animaciones"*: dice *"el estado inicial va en el markup, GSAP lo confirma con
`fromTo`, nunca lo crea"*. Eso se puede violar o no violar, y se verifica con un regex.

**El Lore es la rúbrica.** No hace falta un modelo juez, ni una puntuación de similitud, ni una
opinión: la Pista que originó la tarea es la que la califica.

Esto no lo inventamos para el benchmark. El área de la que sale el corpus ya tenía
`tools/preflight.mjs`, una puerta que convierte siete de sus Pistas en regex y falla el build.
Cuatro de las doce tareas de acá reusan **esas mismas regex, literales**.

## El diseño

Dos brazos, idénticos salvo por una cosa:

El corte público de Codex se ejecutó con **`gpt-5.6-sol` y esfuerzo de razonamiento `medium`**. Cada
salida cruda registra ambos valores; no se infieren desde la configuración actual del harness.

| | `cold` | `lore` |
|---|---|---|
| `CLAUDE.md` | el mismo, **menos** el bloque que apunta al Lore | el mismo, con el bloque |
| `lore/` | ausente | los 18 módulos del área (109 Pistas, 2.971 líneas) |
| `package.json` | idéntico | idéntico |
| modelo, prompt, herramientas | idénticos | idénticos |

El scaffold es deliberadamente vacío: `CLAUDE.md` y `package.json`, nada más. Si el fixture trajera
código ya conforme, el brazo frío cumpliría por imitación y el experimento no mediría nada.

Cada tarea **tienta** la violación de la que nació su Pista. Ninguna nombra la solución: se le pide al
agente lo mismo que se le pediría un martes cualquiera, y se mira qué escribe.

## Las doce tareas

Están congeladas en [`tasks.json`](./tasks.json), con su Pista de origen, su prompt, sus regex y su
par de self-test. Salen de seis módulos distintos del área — `animation`, `routing`, `scroll`,
`principios`, `identidad`, `deploy` — para que el resultado no sea un artefacto de un solo tema.

## Cómo se califica

```
pass  = pegan TODAS las regex de compliance Y ninguna de violation
fail  = cualquier otra cosa
n/a   = la corrida falló o volvió vacía (se reporta aparte, nunca cuenta como pass)
```

Tres decisiones que importan:

- **Se juzga el código, no la prosa.** Si la respuesta trae bloques cercados, solo esos entran al
  grader. Sin esto, un brazo que explica *"nunca uses `Compress-Archive`"* reprobaría por nombrar la
  trampa que está evitando.
- **El grader se autoverifica.** `node run.mjs --selftest` corre las doce tareas contra un par de
  respuestas sintéticas —una que viola la Pista, otra que la respeta— y falla si el grader no las
  separa. Un grader que nunca reprueba no es un grader. El selftest corre solo antes de cada corrida.
- **Se audita que el brazo `lore` haya leído el lore.** Una corrida que pasa sin haber abierto un
  archivo de `lore/` es suerte, no mecanismo, y se reporta aparte.

## Resultado Codex auditado

El corte público vive en [`results/codex/results.csv`](./results/codex/results.csv): **72 corridas**,
36 por brazo. Codex frío respetó la Pista en **25/36 (69,4%)** y Codex + Lore en **33/36 (91,7%)**:
**+22,3 puntos porcentuales**. Lore mejoró 3 de 12 tareas, mantuvo 9 y no empeoró ninguna.

| Costo del corte web | Frío | Lore | Efecto |
|---|---:|---:|---:|
| Tiempo por intento | 42,83 s | 52,35 s | +22,2% |
| Intentos modelados por éxito (`1/p`) | 1,44 | **1,09** | **−24,2%** |
| Tiempo modelado hasta éxito (`tiempo/p`) | 61,68 s | **57,11 s** | **−7,4%** |
| Salida modelada hasta éxito (`salida/p`) | 2.077 | **2.050** | **−1,3%** |

Las últimas tres filas son una **normalización exploratoria**, no reparaciones observadas. La
extensión tarea → meta se conserva aparte: en 52 unidades por brazo y con una corrección máxima,
frío alcanzó 39/52 metas y Lore 52/52; Lore consumió 15,2% menos tiempo observado, 25,3% menos
intentos y 6,8% menos salida, con entrada 1,3% mayor y herramientas prácticamente iguales.

## Reproducirlo

```bash
node bench/run.mjs --selftest              # el grader detecta lo que dice detectar
node bench/run.mjs --task animation-fouc -n 3   # una sola tarea
node bench/run.mjs -n 3                    # la corrida completa: 12 x 2 x 3 = 72
node bench/run.mjs -n 3 --retry-na         # reintenta solo corridas fallidas o ausentes
node bench/run.mjs --regrade               # recalifica lo ya corrido, sin gastar
```

Cada corrida deja su transcript íntegro en un directorio por proveedor y una fila en su CSV. El
corte Codex vive en [`results/codex/raw/`](./results/codex/raw/) y
[`results/codex/results.csv`](./results/codex/results.csv). Los números públicos se recalculan desde
ese CSV mediante `benchmark-consistency.test.mjs`; no se transcriben desde memoria ni desde una
tabla de presentación.

Aislamiento: `--setting-sources project` (sin hooks, plugins ni skills del usuario),
`--strict-mcp-config` (sin MCP heredado), fixtures sin `.claude/`.

## Auditoría del instrumento y procedencia

El piloto corrigió dos errores antes de la corrida completa:

1. `opacity: 0` dentro de la configuración de GSAP contaba como estado inicial en el markup. No lo
   es: ese es exactamente el FOUC que la Pista prohíbe. Habría producido falsos **pass**.
2. El estado inicial puesto con clases de Tailwind (`opacity-0`) no contaba, y cumple la Pista igual
   —pinta antes de la hidratación, que es lo que se exige—. Habría producido falsos **fail**, en
   contra del brazo con lore.

Después de esos arreglos se congeló `tasks.json`, se borró el piloto y se corrieron las 72. Una
auditoría **post hoc**, sobre transcripts ya congelados, encontró además tres familias de falsos
negativos: `min-h-svh`/`min-h-dvh`, restaurar el `overflow` previo y `origin-left`. Cada variante se
añadió primero como regresión fallida; luego se amplió el grader y se recalificaron ambos brazos.
El corte bruto fue 17/36 frente a 25/36; el auditado, 25/36 frente a 33/36. La diferencia permaneció
en ocho aciertos. Se publican ambos porque corregir el instrumento no autoriza a borrar su historia.

## Regla para la réplica con Claude Code

Antes de gastar una corrida, **verificar el baseline Codex** ejecutando:

```bash
node --test bench/benchmark-consistency.test.mjs
node bench/run.mjs --provider codex --regrade
```

La recalificación debe conservar **25/36 (69,4%) frío y 33/36 (91,7%) Lore**. Solo entonces repetir
con Claude usando las mismas tareas, fixtures, grader, tres repeticiones y esfuerzo equivalente. Los
resultados de Claude viven en su propio directorio específico del proveedor; no reemplazan ni se
combinan con Codex. Si aparece otro defecto del grader: congelar transcripts, añadir primero una
regresión que falle, recalificar simétricamente ambos brazos y publicar corte bruto y auditado.

## Fronteras declaradas

Lo que este benchmark **no** demuestra:

- **Un investigador, un área, un stack.** El corpus es el Lore de un área de desarrollo web
  (Next.js + Tailwind + GSAP) de una sola persona. Nada acá dice qué pasa en otro dominio.
- **Las tareas las escribió quien escribió las Pistas.** Están congeladas y publicadas, que es lo
  máximo que se puede hacer al respecto, pero no es lo mismo que un corpus independiente.
- **Una sola respuesta, sin turnos de corrección.** Se mide qué escribe el agente de entrada, no si
  llegaría al mismo lugar después de que un humano lo corrija dos veces. La promesa de Lore —no
  volver a explicarse— vive justamente en esos turnos que acá no se miden.
- **No es SWE-bench.** No hay tests de nadie ejecutándose sobre un parche. Es un benchmark de
  criterio, y el criterio es de quien lo escribió.
- **El corpus no es ciego.** El modelo podría respetar una Pista por conocimiento general y no por
  haber leído el Lore. Por eso se audita la lectura, y por eso el brazo frío corre con el mismo
  modelo: lo que se compara es la misma cabeza con y sin el criterio a mano.
