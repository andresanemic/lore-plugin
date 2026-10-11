# La Party — Lore Plugin + Vespi como unidad coordinada

> Fecha: 2026-10-08. Implementación del punto 10 de la nota fundacional.

## Los roles

Los roles ya existen en `skills/vespi/method.md`. Son funciones, no modeles:

| Rol | Función | Cuándo actúa |
|---|---|---|
| **Coordenador** | Integra, verifica, reporta | Siempre |
| **Daimon** | Investiga y sintetiza | Cuando se necesita evidencia externa |
| **Advisor** | Crítica independiente | Cuando se va a cerrar un trabajo largo |
| **Worker** | Ejecuta tarea acotada | Cuando hay un tramo delimitado |
| **Verificador** | Verifica aparte del ejecutor | Siempre que hay un entregable |

## El arbitro

El arbitro no es un rol explícito. Es una función del coordinador:

1. **No molesta** al coordinador hasta que hay evidencia de que un sub-agente no hizo lo que hizo.
2. **Verifica por separado** — nunca confirma en el informe del sub-agente.
3. **Si la evidencia no coincide**, registra el bloqueo y propone arbitraje.

## Cómo interactúan

1. El **coordenador** define la tarea y la asigna a un rol.
2. El **worker** ejecuta y entrega un artefacto con recibo.
3. El **verificador** comprueba el artefacto contra las fuentes.
4. Si no coincide, el **coordinador** registra el bloqueo.
5. Si se repite 3 veces, el **coordinador** para y sugiere buscar en internet.

## La Party en 2.5.0

En 2.5.0, la Party está implementada parcialmente:
- El coordenador existe en `skills/vespi/SKILL.md`.
- Los roles existen en `skills/vespi/method.md`.
- El verificador existe como principio.
- Falta: el contador de fallos y el arbitro explícito.

En 2.5.2, la Party estará completa con el contador de fallos y el arbitro.
