# Pre-registro — réplica del banco en opencode · modelo 0x Alpha Free Unlimited Max · Lore Plugin 2.3.1

> **Fecha de congelamiento:** 2026-08-26, antes de la primera corrida.
> **Estado:** preregistro vigente. Corrige y reemplaza como diseño al preregistro anulado del
> 14-ago (que sigue conservado por su recorrido de error). Nada de este archivo se edita después de
> la primera corrida; cualquier corrección de grader sigue la cadena P4 (abajo).
> **Origen del diseño:** caso de estudio 08 (`investigacion-cientifica`, Codex 72 corridas) — esta es
> la réplica con otro runtime y otro modelo que ese caso declara pendiente.

## El nombre declara el factor

**Brazo A «frío»:** fixture idéntico **sin `lore/`**.
**Brazo B «lore»:** el mismo fixture **con su cuerpo de criterio** estándar 2.3.1.
**Único factor distinto entre los brazos: la presencia del Lore.** Misma tarea, mismo contrato
(`CLAUDE.md`), mismo runtime, mismo modelo, misma sesión fresca por corrida. Si esa frase no se puede
escribir sin salvedades, el diseño está mal — hoy se puede escribir sin salvedades.

## Instrumento fijo

- **Runtime:** opencode. **Modelo:** `0x Alpha Free Unlimited Max` tal como lo invoca el operador —
  el identificador exacto y su configuración se registran en cada salida cruda; nunca se infieren.
- **Testigo de versión cargada:** el path que la skill declara al invocarse + capacidad que solo
  existe en 2.3.x (`MYCELIUM`) + conteo de skills = 8 + `git rev-parse HEAD` del repositorio. Anotados
  por corrida. El número de versión solo, no testifica.
- **Sesión fresca por corrida** — una sesión resuelve su versión al abrirse. Prohibido reusar sesión
  entre corridas o entre brazos.
- **Repositorio congelado durante toda la medición**: ni skills ni docs cambian entre la primera y la
  última corrida. Este preregistro ya está en disco antes de empezar.

## Tareas y varas (congeladas heredadas)

Se reusan **sin modificación** las familias congeladas del banco:

1. **Web — 12 tareas × 2 brazos × 3 repeticiones = 72 corridas.** Graders deterministas literales de
   `bench/` (los auditados del Caso 08, incluidas las tres ampliaciones post-auditoría ya integradas
   como regresiones). Cada grader comprueba la decisión que la Pista restringe, nada más.
2. **Escritura — 6 tareas sintéticas × 2 brazos × 2 repeticiones = 24 corridas** (3 community
   manager + 3 redacción de noticias), mismos graders deterministas.

**Métrica primaria:** Pistas respetadas al primer intento, por brazo, por tarea.
**Secundarias declaradas, nunca fusionadas (P1):** tiempo medio por intento, tokens entrada/salida,
tool calls, e intentos modelados hasta cumplimiento (`1/p`). `cost_usd` solo si el proveedor lo
reporta; si no, se declara ausente y no se infiere.

## Fase meta — corrección controlada (los «goals»)

Terminadas las 96 corridas, **solo los fallos** reciben un segundo intento con la respuesta anterior
más feedback explícito que nombra la Pista incumplida. Los éxitos no se repiten. Se reporta: metas
alcanzadas tras corrección, intentos consumidos por unidad, tiempo consumido por unidad. Un presupuesto
agotado sin éxito se reporta como presupuesto consumido, nunca como tiempo hasta éxito.

## Estados de carga (P2 — obligatorio por corrida del brazo lore)

Cada corrida del brazo B registra uno de tres estados, desde la evidencia del transcript:
**no cargó** (ningún archivo de `lore/` abierto) / **cargó y no obedeció** / **cargó y obedeció.**
El primario sigue siendo cumplimiento total del brazo: un sistema que no logra cargar su criterio
falló como sistema.

## Cadena de auditoría (P4)

Si un grader resulta estar roto: transcripts congelados primero, un caso de regresión nuevo que falle,
recalificar **ambos brazos** sobre los mismos raws, publicar **corte bruto y corte auditado**, y
declarar si la diferencia cambió. Sin esa cadena, no hay auditoría: hay edición retrospectiva.

## Dónde queda cada salida

Un JSON por corrida + el CSV reconstruido, en `bench/results/opencode-0x/`. La entrega narrativa de
cada brazo se escribe a archivo dentro de su carpeta **antes de cerrar la sesión** que la produjo.
Ninguna salida vive dentro de ningún `lore/`.

## Frontera de validez, escrita antes de correr

Un runtime, un modelo, un dominio real (web) y uno sintético (escritura), tareas congeladas por el
mismo investigador que construyó Lore, fixtures y graders — auto-sellado. No mide correctitud integral
del entregable, no promete ahorro monetario universal, no satisface el criterio longitudinal de H01.
Lo que sí puede hacer, si replica: mover la portabilidad de criterio de «observado con Codex» a
«replicada en un segundo runtime y modelo», que es exactamente la réplica que el Caso 08 dejó
pendiente. La decisión de qué cifra llega al README —y el ajuste de `benchmark-consistency.test.mjs`
para derivarla del CSV nuevo— ocurre **después** de correr, nunca antes.

## Checklist previo a la primera corrida (en orden)

1. Plugin reinstalado desde el árbol canónico y sesión reiniciada (trabajo-local §1).
2. `diff -r` caché↔repo limpio + testigos de versión anotados.
3. Fixtures web y escritura intactos contra su estado congelado (`git status` limpio en `bench/`).
4. Carpetas `bench/results/opencode-0x/{frio,lore}/` creadas y vacías.
5. Este archivo confirmado como leído por la sesión que va a correr — declarándolo en pantalla.
