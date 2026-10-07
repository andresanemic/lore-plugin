# Arbitraje de la baraja de perturbaciones

> Fecha: 2026-10-08. Decisión del coordinador.

## Las 45 cartas

La baraja tiene 45 cartas de 13 fuentes. Son germenes que fuerzan la transducción (Simondon), no ruido.

| Fuente | Cartas | Cuándo usar |
|---|---|---|
| Eno | 18 | Estancamiento creativo, bloqueo de decisión |
| Schmidt | 10 | Análisis sistémico, pregunta correcta |
| Simondon | 4 | Transducción, germen, resonancia interna |
| Séneca | 1 | Honestidad, límite, testigo |
| Berman | 2 | Construcción que destruye |
| Camus | 1 | Absurdo, frontera, lo que no se pudo decidir |
| Debord | 2 | Espectáculo vs vida |
| Chéjov | 2 | Chejov's gun, eliminar lo superfluo |
| Althusser | 1 | Interpelación, sujeto |
| Dialéctica | 1 | Negación, superación |
| Picantes | 1 | Operación común vs protagonismo |
| Gamificación | 1 | Reglas sin premio |
| Deporte | 1 | Marcador vs juego |

## Cuándo tirar una carta

**No se tira al azar.** Se tira cuando:

1. **Estancamiento detectado:** el mismo error se repite 3 veces o más.
2. **Loop identificado:** el agente dice "me perdí", "estoy en loop", "no sé qué hacer".
3. **Cierre de un trabajo largo:** para abrir la siguiente pregunta.
4. **Dominio metaestable:** hay tensión sin resolver, pero el dominio no está cerrado.

**No se tira cuando:**

1. **Dominio cerrado:** la tarea es mecánica y no hay tensión.
2. **Primer intento:** no hay suficiente información para perturbar.
3. **Tarea urgente:** la perturbación puede esperar.

## Cómo se tira

1. Detectar estancamiento (palabras clave: "loop", "stuck", "atascado", etc.).
2. Seleccionar fuente según el tipo de estancamiento.
3. Tirar una carta de esa fuente (con semilla si se quiere determinismo).
4. Ofrecerla como sugerencia, no como requisito.

## Punto de entrada

`hooks/baraja-entry.mjs` ofrece:
- `detectarEstancamiento(texto)` → boolean
- `ofrecerCarta({ semilla, fuente })` → carta
- `inyectarCartaEnPrompt({ historial, maxIntentos })` → mensaje para el prompt o null
