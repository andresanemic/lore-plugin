# Arbitraje de la baraja de perturbaciones (corregido)

> Fecha: 2026-10-08. Corrección del arbitraje anterior, que fue hipócrita.

## El error del arbitraje anterior

Hice una lista de "cuándo usar" sin probar si funciona. Eso fue hipócrita: una lista de condiciones no es un arbitraje.

## ¿Cuándo una carta es germen?

Una carta es germen cuando, después de ofrecerla, la situación cambia: el agente toma una decisión diferente, abre un camino nuevo, o resuelve la tensión.

Una carta es ruido cuando, después de ofrecerla, la situación sigue igual: el agente la ignora, o la tensión persiste.

## Prueba de arbitraje

### Caso 1: La carta SÍ funciona (germen)

**Situación:** El agente está en un loop: dice "me perdí", "estoy en loop", "no sé qué hacer".

**Carta ofrecida:** *"No eres maestro, eres testigo. Habla desde el hospital."* (Séneca)

**Resultado esperado:** El agente deja de buscar la solución "correcta" y empieza a describir lo que ve. La tensión se resuelve.

**Verificación:** Después de ofrecer la carta, el agente dice "hasta aquí llegó nuestro acuerdo" o similar. La situación cambió.

### Caso 2: La carta NO funciona (ruido)

**Situación:** El agente está en una tarea mecánica: escribe un README, corrige un error de formato.

**Carta ofrecida:** *"Lo sólido se desvanece en el aire. ¿Qué estás destruyendo al construir?"* (Berman)

**Resultado esperado:** El agente ignora la carta y sigue con la tarea.

**Verificación:** La carta no cambia la situación.

## Regla de arbitrajo

**Ofrecer una carta es una operación con su propio recibo.** Después de ofrecerla, verificar:
1. ¿La situación cambió?
2. ¿El agente tomó una decisión diferente?
3. ¿La tensión se resolvió?

Si la respuesta es "sí" a las tres: la carta fue germen.
Si la respuesta es "no" a alguna: la carta fue ruido, y se registra como tal.

## Cuándo NO ofrecer una carta

1. **Dominio cerrado:** La tarea es mecánica y no hay tensión.
2. **Primer intento:** No hay suficiente información para perturbar.
3. **Tarea urgente:** La perturbación puede esperar.
4. **Ya se ofreció una carta y fue ruido:** No ofrecer otra hasta que la situación cambie.

## Punto de entrada corregido

`hooks/baraja-entry.mjs` ahora verifica si la carta fue germen o ruido, y registra el resultado.
