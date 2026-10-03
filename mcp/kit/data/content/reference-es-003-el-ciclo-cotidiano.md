### El ciclo cotidiano

1. Trabajas con tu agente de IA para resolver un problema en tu proyecto.
2. Decides si la solución reveló **criterio** que debería afectar decisiones futuras.
3. Usas `save-to-lore` para capturar ese criterio en tu Lore en Markdown.
4. Las sesiones futuras reutilizan ese criterio en lugar de empezar desde cero.

**Ejemplo — capturar un bug de hidratación.** Tú y Claude depuran un problema de hidratación en
Next.js. En lugar de solo corregirlo:

```text
save-to-lore "Problema de hidratación con opacidad inicial en Next.js"
```

Lore te ayuda a extraer la **Pista Invariante** (p. ej. «el estado inicial va en el markup; la
librería lo confirma con `fromTo`, nunca lo crea»), a decidir si pertenece a un módulo del proyecto o
a `principios.md` del Área, y a actualizar los artefactos Markdown correspondientes — siempre tras tu
aprobación en el umbral.

