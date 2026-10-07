# Implementación de los puntos alcanzables para 2.5.0

> Fecha: 2026-10-08. Basado en la nota fundacional del 2026-09-30.

## Punto 3: Detenerse tras 3-4 fallos y buscar en internet

**Archivo:** `skills/vespi/method.md` (ya existe parcialmente).

El método del coordinador ya dice: "Stop when the same normalized failure signature repeats three times in a row without a success between attempts."

Lo que falta: implementar el contador de fallos en el coordinador y la regla de buscar en internet.

**Implementación:**
1. Contador de fallos por operación.
2. Tras 3 fallos iguales, parar y sugerir buscar en internet.
3. Documentar cada intento en las observaciones de la operación.

## Punto 6: Conexión con el corpus de LUS

**Archivo:** nuevo `hooks/inyecta-lus.mjs`.

Cuando una skill de Lore Plugin se activa, inyectar la esencia de LUS en el contexto del agente.

**Implementación:**
1. Leer `esencia/esencia.md` del corpus de LUS.
2. Inyectarlo al inicio del prompt de cada skill.
3. El agente sabe que es un jardinero del Entre.

## Punto 7: MCP de LUS (versión mínima)

**Archivo:** nuevo `mcp-lus/SERVER.md`.

Exponer el corpus de LUS a través de un MCP.

**Implementación:**
1. Servidor MCP que expone: esencia, hipótesis, casos, corpus.
2. Configurado en `.mcp.json`.
3. Los agentes pueden consultar el corpus directamente.

## Punto 9: Arbitraje de las cartas

**Archivo:** `hooks/baraja-entry.mjs` (ya existe).

La carta es germen cuando cambia la situación, ruido cuando no.

**Implementación:**
1. Después de ofrecer una carta, verificar si la situación cambió.
2. Registrar el resultado en un recibo.
3. Si fue ruido, no ofrecer otra hasta que la situación cambie.

## Punto 10: La Party

**Archivo:** `docs/party.md`.

Los roles ya existen (coordenador, daimon, advisor, worker, verificador). Lo que falta es documentarlos como Party.

**Implementación:**
1. Documentar los roles y sus funciones.
2. Definir cómo interactúan (coordinador integra, verifica aparte).
3. El arbitro no molesta al coordinador hasta que demuestre que los sub-agentes hicieron lo que hicieron.
