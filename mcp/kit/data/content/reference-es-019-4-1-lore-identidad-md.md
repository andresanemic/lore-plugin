### 4.1 `lore/identidad.md`

**Ámbito:** Área o proyecto.

**Propósito:**

- Definir la identidad del proyecto o Área.
- Capturar el estándar mínimo de calidad que debe cumplirse.

**Contenido típico:**

- Nombre y descripción.
- Intención central y audiencia.
- Barrera mínima de calidad (por ejemplo, «Nunca introducir regresiones visibles para el usuario en producción»).
- **`registro:`** — qué tan técnico quieres que el kit te hable: `tecnico`, `equilibrado` (default) o
  `llano`. Una línea. Ver abajo.

**La clave `registro:` (2.1.0).** Fija cuánto suelo rodea a una regla cuando el kit se explica —
`tecnico` conserva la especificación y baja la escena al mínimo, `llano` agranda la escena y explica
un término técnico la primera vez que aparece, `equilibrado` es mitad y mitad. **Nunca mueve las
reglas:** un umbral sigue siendo un umbral, un `MUST` sigue siendo un `MUST`, y una frontera de
validez no se omite nunca. Un calibrador capaz de apagar una puerta sería una forma de saltarse el kit
pidiéndoselo amablemente.

Se **infiere, no se pregunta**, y se declara en una línea con la corrección ofrecida en el mismo aliento. Es **preferencia declarada, no criterio**: no lleva marcador de confianza y nunca se promueve al área; si falta la línea, se asume `equilibrado`.

**Guías:**

- Mantén este archivo breve y estable.
- Solo actualízalo cuando la identidad o los estándares cambien de verdad.

---

