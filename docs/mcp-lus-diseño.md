# MCP de LUS — Diseño

> Fecha: 2026-10-08. Primer corte del salto de clase.

## Qué hace

Expone el corpus de LUS (esencia, hipótesis, casos, corpus teórico) a los agentes que usan Lore Plugin y Vespi.

## Implementación

### 1. Conexión con el corpus (inyección de contexto)

Cuando una skill de Lore Plugin se activa, el agente lee:
- `esencia/esencia.md` (la esencia de LUS)
- `docs/hipotesi/abierta/` (hipótesis abiertas)
- `docs/casos-estudio/` (casos de estudio)

Esto se hace con un hook que inyecta el contexto en el prompt.

### 2. MCP de LUS

Un MCP (Model Context Protocol) que expone:
- `esencia`: la esencia de LUS (siempre disponible).
- `hipotesis`: hipótesis abiertas, rechazadas, refutadas.
- `casos`: casos de estudio.
- `corpus`: corpus teórico.
- `lore`: pistas y criterios destilados.

El MCP vive en `mcp-lus/` y se configura en `.mcp.json`.

### 3. Archivos

- `mcp-lus/SERVER.md` — definición del servidor MCP.
- `mcp-lus/tools/lee-esencia.mjs` — lee la esencia de LUS.
- `mcp-lus/tools/lee-hipotesis.mjs` — lee hipótesis.
- `mcp-lus/tools/lee-casos.mjs` — lee casos.
- `mcp-lus/tools/lee-corpus.mjs` — lee corpus teórico.
- `mcp-lus/tools/lee-lore.mjs` — lee pistas y criterios.
- `mcp-lus/tools/search.mjs` — busca en el corpus.
