# Resolución del conflicto SDO vs reparto

> Fecha: 2026-10-08. Decisión del coordinador con aprobación de Andrés.

## El conflicto

La skill `writing-skills` (de Superpowers) exige que el `description` de cada skill:
- Empiece con "Use when..."
- Describa SOLO condiciones de activación (cuándo usar).
- NUNCA resuma el proceso/workflow de la skill.

El test `bench/reparto-frases.test.mjs` verifica que cada "familia" de frases tiene una dueña que la nombra en su description, y que las frases de riesgo se resuelven por una tabla en el cuerpo de la skill.

Las descripciones de `use-lore`, `vespi` y `brainstorming-lore` violan la SDO porque contienen palabras clave que alimentan el contrato de reparto del kit.

## La decisión

**Excepción aceptada.** Las descripciones de `use-lore`, `vespi` y `brainstorming-lore` mantienen sus descripciones actuales porque el contrato de reparto del kit las necesita para funcionar.

## ¿Por qué?

1. **El reparto es el contrato de enrutamiento del kit.** Si las descripciones no nombran las familias, el host no sabe qué skill ofrecer para cada frase.
2. **La SDO es una vara de calidad, no una ley del kit.** `writing-skills` es una skill de documentación, no una skill operativa del kit.
3. **El defecto es latente, no activo.** Los tests de reparto pasan. Los tests de SDO no existen en el kit (son de `writing-skills`, que es externa).

## ¿Qué queda?

- Las descripciones de `stale-lore`, `transmute-lore`, `save-to-lore` y `create-bot` sí se alinearon a la SDO (porque no afectan el reparto).
- Las descripciones de `use-lore`, `vespi` y `brainstorming-lore` se mantienen como están (excepción documentada).
