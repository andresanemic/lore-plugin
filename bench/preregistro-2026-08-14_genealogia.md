# Pre-registro — destilación de la genealogía afectiva hacia las skills

> **Fecha:** 2026-08-14. Escrito **antes** de tocar una sola skill.
> **Intervención:** llevar el registro de `bot-lus-lore/lore/genealogia-afectiva.md` a la prosa de
> las skills, como **registro de las reglas que ya existen y nunca como una regla nueva**.
> **Brazo previsto:** `2.0.9 + genealogía`. Nunca `2.1 completa` — si se mezcla con las
> capacidades A y B del spec 2.1, el banco deja de poder atribuir el efecto.

## Por qué la forma está obligada

La lectura de la genealogía contra el corpus de LUS dio cero teoría nueva: *Loving* es Buber
—el Yo-Tú existe porque los dos siguen siendo dos—, *Fire* es Simondon y Varela. El residuo
destilable es **formulación**, no ley.

Y Dreyfus, que el corpus cita como fundamento, autoriza y amenaza la operación en la misma frase:
autoriza porque el trasfondo tácito es la materia prima que LUS declara procesar; amenaza porque su
tesis es que lo tácito **no sobrevive a la formalización en reglas explícitas**.

De ahí la restricción de forma. Una regla nueva agrega superficie de cumplimiento: más ítems que
satisfacer, más ocasiones de aplicar el criterio donde no corresponde. Un cambio de registro
reescribe cómo hablan las reglas existentes sin agregar ninguna.

## Lo que este banco puede decir, y lo que no

Dos hechos del instrumento, verificados antes de escribir esto:

**1. Está saturado.** Techo de `compliance_hits` = 45; el brazo `lore` marca 41. Diez de doce
tareas están en su techo con las tres corridas en `pass`: no pueden mejorar, solo empeorar. Las dos
violaciones restantes están las dos en `deploy-zip-windows`, que es justamente la tarea donde el
brazo `lore` empata al frío (1/3 compliance, 2 violaciones, idéntico).

**2. Es ciego a la variable, por construcción.** `run.mjs` fija `GRADE_SCOPE = "code"` y `codeOnly()`
descarta todo lo que no esté dentro de bloques cercados antes de calificar. La decisión es correcta
y está bien fundada —evita que un brazo repruebe por *nombrar* la trampa que evita— pero implica que
**la prosa no entra al grader**. Un cambio de registro vive exactamente ahí.

No es un problema de tamaño de muestra. El instrumento no puede ver esta variable ni con infinitas
corridas.

## Predicción, en dos partes que no se mezclan

### Parte 1 — falsable hoy, y débil a propósito

> Tras la destilación, las **10 tareas saturadas siguen saturadas** (tres `pass`, compliance en su
> techo) y `violation_hits` del brazo con genealogía **no sube de 2**.

- **Refuta la destilación:** cualquier regresión en cualquiera de las 10, o una tercera violación.
- **No confirma nada.** Es la condición mínima de que el cambio no sea daño.
- `deploy-zip-windows` y `routing-gsap-ssr` quedan **fuera** de la predicción: tienen margen, pero
  sostener que un cambio de registro arregla un empaquetado en Windows sería una lotería.

### Parte 2 — declarada, no medida

> El efecto de registro requiere un instrumento que hoy no existe. Se deja escrito como pendiente
> del IME y **no se le atribuye al banco**.

## La inferencia prohibida

Correr el banco, ver 41/45 otra vez y reportarlo como que la sensibilidad funcionó. Eso sería el
techo del instrumento hablando, no el efecto. Queda escrito acá para que en tres meses no se pueda
alegar que no se sabía.

## Cómo se corre

El brazo se compara contra el corte guardado en `results/codex/`. Los crudos están en
`results/codex/raw`, así que `node run.mjs --regrade` permite recalificar sin volver a gastar.
Modelo y esfuerzo del corte público: `gpt-5.6-sol`, razonamiento `medium`, registrados en cada
salida cruda.
