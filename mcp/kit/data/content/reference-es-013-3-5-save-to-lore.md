### 3.5 `save-to-lore`

**Captura contextual:** conserva candidatas hasta un hito real o una acumulación de pistas relacionadas. La vista muestra destino, redacción y por qué ahora; la aprobación cubre las escrituras y commits del lote mostrado, nunca el push.

**Rol:** Destilar la experiencia recién adquirida en criterio reutilizable.

**Dos modos, según la FUENTE del criterio:**

| Modo | Fuente | Operación |
|---|---|---|
| **CAPTURE** (por defecto) | fricción vivida (bug, colapso, rechazo del cliente) | Destila la cicatriz en una Pista Invariante. Todo lo descrito abajo se refiere a este modo. |
| **GRAFT** | criterio importado (una *skill*, una guía de estilo, un manual ajeno, **la constitución o documento de gobierno de otro kit**) | **Juzga** ese criterio contra la finalidad del proyecto. Solo entra lo que sobrevive. |

> *Por qué «injerto»:* echa raíces o es rechazado, y lo que crece después pertenece al huésped — la contraparte exacta de `transmute-lore` PRUNE: la poda quita lo que la planta creció sola, el injerto juzga lo que vino de afuera. Un Lore con uno y sin el otro se hincha o se osifica.
>
> *Renombrado en 2.1.1 (`arbitrate`, luego `transplant`): misma ley, mismas cuatro puertas — un trasplante mueve una planta sin cambiarla; este modo cambia lo que deja entrar.*

**Modo `GRAFT` — cuatro puertas:**

1. **¿Capacidad o criterio?** Una fuente que **ejecuta** (renderiza, hace *crawl*, compila) **no es
   Lore**: se documenta como dependencia y se detiene ahí. Solo se arbitra la que **juzga**.
2. **¿El proyecto tiene finalidad escrita?** Sin `identidad.md`, no hay vara: frente a una fuente con
   autoridad solo cabe obedecerla. Primero la identidad.
3. **Colisionar, no copiar.** Solo entra lo que restringe una decisión futura **aquí**. Donde fuente
   y estándar chocan, **gana el estándar**, y esa resolución suele ser la línea más valiosa: no
   existe en ninguno de los dos cuerpos.
4. **Umbral de salida — la sección de derrotas.** El módulo **debe** registrar dónde la fuente
   contradice el estándar y **pierde**. **Sin derrotas, no entra:** o no hubo arbitraje (fue copia),
   o la fuente traía capacidad, no criterio.

**Un documento de gobierno es el caso más difícil.** La constitución de un segundo kit es criterio escrito bajo la finalidad de otro, y su cláusula de supremacía es precisamente de las que **pierden**: un kit instalado esta semana no puede gobernar criterio pagado antes de que existiera. Esa derrota se **escribe**, nunca se omite — una omisión deja un hueco que la próxima regeneración de plantilla vuelve a llenar. Arbitrar es juzgar, no negociar.

**En calendario, `GRAFT` empieza leyendo lo que ya perdió.** Las secciones de derrotas que escribe **son** ese registro: se leen primero, y no se vuelve a arbitrar ni a reportar lo que ya está en ellas. **«Esta vez no entró nada» es un resultado válido y se escribe así** — una pasada que siempre encuentra algo dejó de mirar y empezó a justificarse.

**Una skill ajena que se *invoca* también trae criterio, y lo aplica sin preguntar.** El caso difícil es el criterio que llega como **herramienta que corre** — toda herramienta opinada trae un cuerpo de criterio que nadie arbitra porque parece capacidad. **Pasale tu Lore en la invocación:** casi todas dejan que una muestra provista les gane a sus valores por defecto; las que no, se mantienen lejos de lo que el Lore gobierna.

**Confianza en `GRAFT`:** lo adoptado *de* la fuente entra como `conjecture`; **el arbitraje mismo** —las derrotas, derivadas de una identidad ya validada— entra como `confirmed`. El módulo declara su procedencia: *"Destilado de `<fuente>`, arbitrado contra `<identidad.md>`."*

**Entrada:**

- Una descripción corta del problema, decisión o aprendizaje (por ejemplo, `"Bug de hidratación en landing de Next.js"`); o el nombre de la fuente a arbitrar (por ejemplo, `"destila la skill copywriting"`).

**Proceso (conceptual):**

1. Preguntar por contexto: qué ocurrió, qué se intentó, qué funcionó al final.
2. Extraer **Pistas Invariantes**:
   - Restricciones que deberían afectar decisiones futuras.
   - Reglas válidas más allá del incidente específico.
3. Decidir dónde guardarlas:
   - Módulos de proyecto bajo `lore/`.
   - `principios.md` a nivel Área para reglas generales.
   - Actualizaciones en `identidad.md` o el contrato si cambian identidad o colaboración.

**Umbral de Lore (disparo proactivo):** para que Claude proponga guardar algo sin que se lo pidas,
deben cumplirse las 4 condiciones a la vez: **restricción** (prohíbe un error futuro o exige un
estándar), **señal** (destilable a Contexto → Causa → Pista, sin logs crudos), **ejecutabilidad**
(una directriz inequívoca) y **genericidad** (le serviría a otro proyecto del Área). Cambios
cosméticos no cuentan.

**`destino:` y verificación de aterrizaje — 2.3.0.** Una Pista que exige un artefacto o un paso verificable declara **dónde se corre**: módulo y paso. Antes de cerrar el umbral se **grepea el término declarado en el archivo declarado** y se reporta `aterrizó` o `escrito, nunca ejercido`; en el segundo caso queda en `conjecture` con **promoción bloqueada** hasta que el destino exista.

**La junta se escribe de los dos lados:** la Pista lleva su `destino:`; el paso lleva una línea que nombra la Pista. Los dos lados suelen vivir en árboles distintos, y una sesión carga solo su propio bloque always-on — con el puntero en una sola dirección, quien está parado en el paso ve un procedimiento sin obligación visible detrás, y una poda ahí lo quita como sobrante. Desde ese lado, lo es.

**Sistema de confianza:** cada pista se guarda como `conjecture` (por defecto) o `confirmed` (solo
si se validó realmente en la app en marcha). Nunca se infla a `confirmed` solo para forzar una
promoción.

**Ruteo y promoción:** el criterio se captura primero en el proyecto; solo lo **confirmado y
genérico** se propone para promoción al `lore/` del Área (nunca se escribe el Área en silencio).
En el `index.md` del proyecto, una línea ya promovida se marca con el glifo ` · ↑` — re-ejecutar el
skill sobre esa pista es un no-op seguro (idempotencia).

**Corregir un hecho no es capturar criterio.** El criterio vive en un solo lugar por diseño; un **hecho verificable** —una sede, una cifra, una fecha— se comporta al revés: está repetido en cada artefacto que lo citó y en el documento fuente que lo repartió. Corregirlo donde se notó deja todas las demás copias mal. **La unidad de trabajo es el conjunto de apariciones:** barrer el árbol antes de escribir, corregirlas todas en una pasada y, si el hecho está además en un corpus fuente que no se edita, marcarlo ahí también — tachado y fechado, nunca borrado.

**Invariantes:** el criterio nunca se inventa; todo proviene de experiencia real; el ruido descartado se informa, nunca se elimina en silencio; todo cambio pasa por un umbral antes de escribirse; nada hace commit automáticamente y nunca se hace `git push`; un ser humano siempre revisa el *diff* final. Una Pista que cita otra ley hereda su **frontera de validez** o dice por qué no, y enuncia su regla
  por la **condición**, no por la categoría en la que esa condición suele cumplirse.

**Función de notas sueltas (lectura condicional):** cuando la petición apunta a `notas/`, `notes/`
o `apuntes/`, `save-to-lore` carga `skills/save-to-lore/notas.md`. El procedimiento es neutral a la
aplicación: Obsidian es opcional. Barre la bandeja completa —aunque sea una sola carpeta—, extrae
`.md`, `.txt` y `.docx`, reporta deuda, clasifica en experiencia, estado, criterio importado o
información, enruta, propone el diff y espera aprobación. Al cerrar marca `destilado:` y mueve las
notas cerradas a `archivadas/`; nunca las borra. La nota sigue siendo fuente, no criterio.

Usa `save-to-lore` como mecanismo principal para alimentar tu Lore tras decisiones importantes.

**Salvaguardas verificables (núcleo ejecutable: `skills/save-to-lore/scripts/save-to-lore.mjs`):** cada Pista nueva trae una línea `evidencia: <ruta relativa>` que nombra el reporte, caso o nota que la ganó — la línea empieza en la columna 0-3 con espacios, sin `>`, sin tabulador inicial (4+ espacios es código indentado y nunca cuenta) y fuera de ejemplos cercados (```/~~~, incluso anidados en citas) —, y `verificaEvidencia` comprueba que la línea exista, que el puntero sea relativo (absolutas y URLs rechazadas; `..` a una carpeta hermana permitido, p. ej. `../notas/caso.md` desde `lore/`) y que resuelva a un archivo real — la puerta de la Pista nueva es su propia sección: `node skills/save-to-lore/scripts/save-to-lore.mjs --pista <pista.md> --seccion "<encabezado exacto de la Pista nueva>"` (`--seccion` exige el texto exacto del encabezado, solo caja y espacios exteriores se ignoran; `--lineas <A-B>` selecciona por intervalo de líneas — leído contra el archivo completo, así que un rango que empieza dentro de un ejemplo cercado falla por selección —, y un encabezado exacto duplicado falla por ambigüedad pidiendo `--lineas`), que sale distinto de cero si falta la evidencia de esa Pista — una Pista sin evidencia que resuelva no entra. El `--pista <pista.md>` sin selección revisa el archivo completo y sirve solo como diagnóstico, nunca como puerta de la Pista nueva. El comprobador es un rastreo limitado de cercas, no un parser general de Markdown. Migración: un `evidencia:` indentado 4+ espacios o con tabulador inicial antes contaba y ahora no — llevarlo a la columna 0; un rango `--lineas` que empezaba dentro de un ejemplo cercado antes pasaba con el puntero del ejemplo y ahora falla por selección. Las notas nunca se borran para hacer lugar al criterio: una nota sale de la bandeja solo con `destilado:` no vacío más archivo en `archivadas/`, y `autorizaBorrado` bloquea todo borrado — primero mientras la nota sigue sin arbitrar, después porque la nota arbitrada se archiva, nunca se borra. Un aprendizaje genérico que viajaría más allá del área pregunta una cosa explícita antes de moverse (`preguntaNivel` / `resuelveNivel`): lo que vale para cualquiera va al kit como PR o propuesta, nunca auto-commiteado al repositorio del kit; lo que vale para esta persona va a la raíz de su jardín, fuera del kit. Sin respuesta no hay movimiento: una respuesta ambigua o negada vuelve a preguntar en vez de asumir un destino.

---

