### 4.5 `FASES.md`

**Ámbito:** Proyecto (nivel raíz).

**Propósito:**

- Describir el estado actual y la hoja de ruta del proyecto.

**Contenido típico:**

- Fase actual (por ejemplo, «Exploración», «MVP», «Escalado»).
- Objetivos y restricciones activas.
- Hitos próximos relevantes para criterio y decisiones.

**Guías:**

- Actualiza este archivo cuando el proyecto avance de fase.
- Usa descripciones concisas y basadas en hechos.
- Agrega una frase «Not yours:» que nombre la skill vecina responsable del trabajo fuera del límite de esta skill.

**Estado de proyecto vs estado de operación.** `FASES.md` es dueño del estado del proyecto: fase, hoja de ruta, registro, trabajo abierto. Una operación viva bajo presión guarda su estado como un bloque en la sección `## Operaciones` de ese mismo `FASES.md` (ver `vespi`): finalidad, autoridad, efectos, tareas, verificación, checkpoints. Hay un único checkpoint y no se copia en otro lado: un segundo archivo para la misma operación serían dos gobernantes que divergen en silencio.

**El trabajo abierto es explícito.** Un pendiente lleva dueño, impacto y fecha, en una línea:

```markdown
- OPEN | dueño: ana | NON_BLOCKING | 2026-09-24 | formato de exportación de resultados
```

El impacto es `BLOCKING` (se resuelve antes de la próxima frontera), `NON_BLOCKING` (acompaña) o `DEFERRED` (se observa, no se trabaja). Un pendiente sin dueño ni impacto no es trabajo registrado — es un deseo. Las fechas vencidas no se auto-extienden: se re-fechan o se cierran.

**Resistencia a lo desfasado.** Las entradas fechadas son historia inmutable: verdadera sin gobernar. La prosa viva se corrige en su lugar. Cuando la prosa viva contradice una entrada fechada, la corrección cae siempre sobre la prosa viva — la línea superada se tacha con su fecha. Una entrada fechada jamás se edita, ni siquiera cuando la historia misma estaba mal: una NUEVA entrada fechada registra la corrección, y la línea vieja queda tachada a su lado. Nunca se borra historia, nunca se dejan ambas vigentes como si ambas gobernaran.

**Los cierres son cuatro cosas distintas.** Cierre de sesión (esta conversación termina; el estado reanudable apunta hacia adelante) ≠ cierre de corrida (esta ejecución termina; los recibos quedan) ≠ operación cerrada (sus condiciones se cumplen según su propio estado) ≠ cierre de fase (`FASES.md` avanza). Di cuál cerró. Una sesión cerrada jamás cierra su operación en silencio.

**Orientación de sesión fresca.** Abre en este orden: contrato, `FASES.md`, tabla de enrutamiento, y luego los punteros de estado que `FASES.md` nombra. No reconstruyas de memoria lo que un puntero ya resuelve.

**Escaneo de higiene de solo lectura:** `lore-plugin hygiene [ruta]` (o `--json`) informa directorios `.tmp-*`, archivos o carpetas con nombre de campaña sueltos en la raíz de un Área, `canon/` y `lore/` juntos sin dueño declarado salvo el layout estándar de bot, Markdown en carpetas sueltas de cristalización/pista/lesson, copias `_rc-backup-*` y hooks que ninguna prueba de `bench/` nombra. Informa cobertura y omisiones; excluye `.git` y `node_modules`, no sigue enlaces (los declara como no cubiertos) y revisa solo los patrones definidos. Propone revisar y no modifica ni borra archivos; no poda por tamaño.

**Muro por fallos repetidos:** `lore-plugin operation observe --root <dir> --id <op> --task <tarea> --json '{"text":"...","signature":"..."}'` registra una observación y su firma de fallo. La firma debe ser texto y se limita a 500 caracteres; una firma rechazada no se persiste. Tras tres fallos normalizados iguales seguidos sin éxito, `operation status` incluye `wall`, `instruction: "stop_and_search"` y los intentos. La CLI no busca: usa las herramientas del host, registra la búsqueda en el recibo y señala los hallazgos que contradigan el Lore o el acuerdo para proponer arbitraje.

**Pausar y reanudar.** `lore-plugin operation pause --json '{"note":"..."}'` deja el checkpoint durable en pausa y escribe la nota junto a él. `operation resume` no reconstruye la operación desde la conversación: devuelve el veredicto del kernel sobre el bloque guardado en `FASES.md` y, si la operación estaba pausada y el veredicto lo permite, la devuelve a `running` en la misma llamada. Reanudar sin estado guardado no inventa nada: el veredicto lo dice y el estado no cambia. El `timeoutMs` de una tarea es el tope de seguridad que ya existía y no se toca: la calibración vive al lado y no lo recalcula.

**Estimaciones y calibración.** `operation plan` acepta dos campos opcionales por tarea. `estimateMs` es un entero positivo, el tiempo que se espera que tome. `kind` es una de cuatro palabras, `review`, `build`, `fix` o `write`, y describe el tipo de trabajo; sin `kind` no hay nada que decir del tipo. Ninguno de los dos es obligatorio y ninguno cambia el encargo: sin ellos la tarea se cumple igual.

`operation status` agrega `calibrationLines`, una línea por tarea sin medición propia, y cada línea es una de dos formas. La primera dice `sin referencia`. La segunda dice `referencia inicial (no medida en tu máquina)`, con el orden de magnitud típico, el rango superior, de cuántos trabajos viene y de qué sesión fechada: sale de `skills/vespi/core/calibration-seed.json`, que es orientación fechada de una sesión de trabajo observada entre el 2026-10-04 y el 2026-10-05, no una promesa ni un tope de tu máquina. Cuando ya existen al menos tres muestras válidas para una clave exacta (`rol|host=modelo`), `status` agrega además el bloque `calibration` con `samples`, `medianRatio`, `p80Ratio` y `basis`, y un bloque `suggestions` que declara cada proporción como sugerencia y no como regla. Las tareas ya medidas salen de `calibrationLines`, y con menos de tres muestras por clave el estado devuelve `calibrationNote` en lugar de las proporciones. Una semilla ausente o corrupta no rompe el estado: sale `sin referencia`.

---

