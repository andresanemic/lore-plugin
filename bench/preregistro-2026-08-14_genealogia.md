# Pre-registro ANULADO — destilación de la genealogía afectiva hacia las skills

> **Fecha:** 2026-08-14. **Estado: anulado el mismo día en que se escribió.**
> Se conserva completo, con sus dos correcciones sucesivas visibles, porque el recorrido del error
> es el hallazgo. La conclusión está al final y contradice el título original.

## Qué se quería medir

Llevar el registro de `bot-lus-lore/lore/genealogia-afectiva.md` a la prosa de las skills, como
**registro de las reglas que ya existen y nunca como una regla nueva**, y verificar el efecto con un
tercer brazo `2.0.9 + genealogía` sobre las mismas tareas congeladas.

## Por qué la forma estaba obligada

La lectura de la genealogía contra el corpus de LUS dio cero teoría nueva: *Loving* es Buber —el
Yo-Tú existe porque los dos siguen siendo dos—, *Fire* es Simondon y Varela. El residuo destilable
es **formulación**, no ley.

Y Dreyfus, que el corpus cita como fundamento, autoriza y amenaza la operación en la misma frase:
autoriza porque el trasfondo tácito es la materia prima que LUS declara procesar; amenaza porque su
tesis es que lo tácito **no sobrevive a la formalización en reglas explícitas**.

De ahí la restricción de forma. Una regla nueva agrega superficie de cumplimiento: más ítems que
satisfacer, más ocasiones de aplicar el criterio donde no corresponde. Un cambio de registro
reescribe cómo hablan las reglas existentes sin agregar ninguna. **Esta parte sigue en pie** — no
depende del banco.

## Primera corrección — el banco está saturado

Techo de `compliance_hits` = 45 en la familia web; el brazo `lore` marca 41, con diez de doce tareas
en su techo y las tres corridas en `pass`. Las dos violaciones restantes están las dos en
`deploy-zip-windows`, justo la tarea donde el brazo `lore` empata al frío.

## Segunda corrección — son tres familias, y fallan por razones opuestas

| Familia | `_grade_scope` | ¿Ve la prosa? | Brazo `lore` |
|---|---|---|---|
| `bench/tasks.json` — web, 12 tareas | `code` | **No.** `codeOnly()` descarta lo no cercado | 41/45, 10 de 12 saturadas |
| `bench/writing` — editorial, 6 tareas | `full` | **Sí** | 44/44, 12/12 `pass` |
| `bench/upgrade` — 2 tareas | `full` | **Sí** | 40/40, 4/4 `pass` |

Una versión anterior de este documento afirmó que el instrumento era ciego a la prosa «ni con
infinitas corridas». Es falso: vale para la familia web y no para las otras dos. El error vino de
analizar `results/codex/` como si fuera el banco entero.

## Tercera corrección, y la que anula todo: **el banco no carga las skills**

`run.mjs:86-88` monta como `cwd` el directorio del fixture. Los fixtures contienen `CLAUDE.md`,
`package.json` y —en el brazo `lore`— una carpeta `lore/`. **Nada más.** `providers.mjs` no menciona
skills en ninguna línea.

> La variable independiente de este banco es **la presencia de criterio destilado en una carpeta**,
> no la versión de las skills que lo produjo. No hay camino causal entre editar un `SKILL.md` y
> mover una cifra de este CSV.

Consecuencias, en orden de importancia:

1. **La intervención es inmedible acá.** No puede mejorar el resultado ni empeorarlo. La prueba de
   no-regresión que este documento pre-registró era **vacuamente verdadera**: iba a pasar sin
   importar qué escribiéramos en las skills.
2. **El tercer brazo `2.0.9 + genealogía` no es construible** tal como está pedido. Un brazo que
   variara la versión de las skills tendría que **regenerar el `lore/` del fixture con cada versión**
   — y las regex de las tareas se derivaron de esas Pistas concretas, así que cambiar el contenido
   del fixture invalida la procedencia de las tareas. Es otro experimento, no un brazo más.
3. **La justificación original de la destilación no se sostiene.** La idea era destilar y después
   verificar con Codex sobre las mismas tareas. Sobre estas tareas no se verifica nada.

## Lo que queda en pie

- La derivación bibliográfica: registro y no regla. No necesitaba banco.
- Que el efecto buscado requiere un instrumento que **mide skills**, no carpetas. Es el IME, ya
  encolado, y ahora tiene una especificación mucho más concreta: su unidad de comparación es la
  versión de la skill, y su salida observable es la prosa que produce el agente, no el código.

## La inferencia prohibida

Correr el banco después de la destilación y reportar el resultado —cualquiera que sea— como
evidencia sobre la genealogía. No lo es, en ninguna dirección. Queda escrito acá para que en tres
meses no se pueda alegar que no se sabía.

## Cicatriz

**Contexto:** pre-registrar una predicción antes de una intervención, con la intención correcta de
hacerla falsable. **Causa raíz:** se verificó el *margen* del instrumento y su *alcance de
calificación* antes de escribir la predicción, pero no se verificó lo primero de todo — **si el
instrumento tiene siquiera un camino causal hacia la intervención**. Dos correcciones sucesivas
refinaron una predicción que nunca debió existir. **Pista:** antes de elegir métricas, comprobar qué
monta el runner como entorno; un banco mide lo que carga, no lo que el repositorio contiene.
