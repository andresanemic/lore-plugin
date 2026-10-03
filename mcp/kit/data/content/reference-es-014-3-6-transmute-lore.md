### 3.6 `transmute-lore`

**Rol:** Operar un cuerpo de Lore existente mediante ocho modos distintos.

**Frontera de entrada y portabilidad:** ADD puede crear Lore donde no existe desde carpetas, documentos, resúmenes de chat y notas, pero esas entradas siguen siendo fuentes hasta la destilación aprobada; CRYSTALLIZE crea una memory card derivada, trazable y extraíble que nunca reemplaza al Lore vivo.

**Entrada:**

- Nombre del proyecto (por ejemplo, `"Frontend heredado"`).
- Modo, inferido de la frase (no de un flag):
  - `add` – «transmuta el lore de {proyecto}», «este proyecto viejo no está en el formato nuevo» — crea artefactos de Lore que aún no existen.
  - `clean` – «limpia el lore de {proyecto}» — elimina módulos temáticos del proyecto que ya duplican los del Área.
  - `translate` – «estandariza el idioma del lore de {proyecto}», «traduce el lore de {proyecto} a {idioma}» — estandariza el idioma de todos los artefactos del Lore: contenido y nombres de archivo.
  - `upgrade` – «mejora el lore de {proyecto} con la versión nueva», «arbitra mi lore contra la versión nueva» — pone al día un Lore sano escrito contra una versión anterior de estos skills.
  - `prune` – «poda el lore de {proyecto}», «este lore se puso muy pesado» — quita **peso** a un Lore
    que se degradó acumulando cosas que por separado son correctas — el objetivo cuantitativo es una
    restricción de aceptación.
  - `micelio` – «corre el micelio», «¿está conectado el lore?» — recorrido de **solo lectura** que
    reporta qué Pistas ningún paso corre. No escribe nada y nunca poda. Tres disparadores: antes de
    una tarea compleja, tras instalar o actualizar el kit, y al salir de cualquier pasada que escribió
    Lore — una Pista nueva nace desconectada, así que la de salida nunca es la de entrada repetida.
    Los hallazgos bloquean lo que venía después hasta que se escriban o se declinen, y los declinados
    nunca se re-reportan.

  Seis resultados, en frase llana: hay un paso que la corre · nada la corre · nombra un lugar y no
  está escrita ahí · un paso solo dice «consultá» · es criterio fuera de `lore/` · el paso existe en
  un archivo que esta sesión no carga. Corre en silencio — nadie necesita el vocabulario para
  preguntar — los seis no se fusionan: los últimos cuatro se reparan distinto.
  - `leave` – «dejar el lore», «salir del lore sin perder criterio» — inventaría cada junta activa
    de ejecución, se detiene antes de cambiar un symlink o contrato compartido y retira solo las
    rutas automáticas aprobadas, conservando `lore/` y `enrutamiento.md` plano. Un pase interrumpido
    queda como `leave:partial`; `leave:` se escribe solo tras verificación estática y en sesión fresca
    y conserva el checklist aprobado para una reentrada posterior mediante UPGRADE.
  - `crystallize` – «cristaliza este Lore», «exporta este Lore a un solo Markdown», «extrae esta
    cristalización» — resuelve el enrutamiento vivo en una copia de lectura segura y trazable
    para un chat, proyecto de IA o notebook, marcada para desempaquetarse en una carpeta cuyo
    enrutamiento resuelve.

**Precondición de seguridad:** los modos que modifican artefactos fuente exigen un árbol de Git limpio antes de escribir. `crystallize` no escribe fuentes y puede diagnosticar un árbol sucio, pero igual exige vista previa explícita de la exportación y umbral.

**Proceso — modo `add` (conceptual):**

1. Inventariar las fuentes de criterio existentes: `CLAUDE.md`/`AGENTS.md` (suele ser el mayor
   depósito de criterio mezclado), `README.md`, un `lore/` viejo o incompleto, `incidents/`,
   comentarios de código con señales como "nunca", "siempre", "WARNING".
2. Separar **criterio** (restringe una decisión futura) de **ruido** (solo describe).
3. Proponer cómo mapear ese criterio a:
   - `identidad.md`, `principios.md`, `index.md`, módulos temáticos bajo `lore/`.
   - `FASES.md` y el contrato de instrucciones en la raíz.
4. Presentar el mapeo completo (contenido real, no solo una tabla de rutas) y **esperar aprobación
   explícita** antes de escribir nada (umbral).

**Proceso — modo `clean` (conceptual):**

1. Requiere que el proyecto tenga una **Área madre** (`{área}/proyectos/{slug}/`); si es standalone,
   `clean` no aplica y así se informa.
2. Comparar cada módulo temático del proyecto contra su contraparte en `{área}/lore/`: si toda pista
   del módulo del proyecto ya está en el Área, el módulo es redundante y se puede eliminar.
3. Cualquier pista que **no** esté en el Área se reporta (no se borra) para que el usuario decida.
4. **Nunca elimina** `identidad.md`, `principios.md` ni `index.md` — solo módulos temáticos
   redundantes. Reescribe `index.md` para que apunte a los módulos del Área.

**Proceso — modo `translate` (conceptual):**

1. Resolver el **idioma destino**: el que pidas; si no lo indicas, tu propio idioma.
2. Inventariar el idioma actual de cada artefacto del ámbito (`lore/*.md`, `FASES.md`, el contrato,
   `golden-paths.md` si existe), incluyendo los que estén mezclados.
3. Presentar el plan archivo por archivo — incluyendo los **renombrados** de artefactos
   localizables (p. ej. `identidad.md` ↔ `identity.md`, `FASES.md` ↔ `PHASES.md`) — y **esperar
   aprobación explícita** antes de escribir (umbral), indicando lo que NO se traduce ni se
   renombra: el nombre del contrato elegido, `lore/`, `index.md`, `golden-paths.md`, bloques de código,
   identificadores, mensajes de error citados, marcadores de confianza (`conjecture`/`confirmed`),
   el glifo ` · ↑`, términos técnicos de uso general en inglés y nombres propios. Renombrar
   `proyectos/` es opcional y se propone aparte (puede haber referencias externas a esa ruta).
4. Traducir **preservando el significado**: es una traducción, nunca una reescritura — ninguna
   pista se añade, se elimina ni se reinterpreta. Los renombrados se aplican con `git mv` y se
   reescribe todo enlace que toque un archivo renombrado, sin dejar enlaces rotos. Los matices
   ambiguos se reportan, no se adivinan.
5. Límite de ámbito: traducir un proyecto no toca el `lore/` de su Área (y viceversa); si el otro
   nivel está en un idioma distinto, se informa el desajuste. Excepción: la integridad de enlaces
   sí cruza el límite — al renombrar módulos de un Área se actualizan (o reportan) los enlaces de
   sus proyectos hacia esos archivos.

**Binarios: comparar antes de extraer, anotar después.** Un binario **ya transcrito** es indistinguible de uno pendiente, así que el modo `add` compara el texto del binario contra el corpus existente antes de extraerlo y **anota la correspondencia binario → transcripción** en el destino cuando sí transcribe uno. El `.md` se escribe con el nombre que le corresponde al contenido; el binario queda donde estaba, extensión intacta. Los pendientes de extracción se redactan por **contenido, no por extensión**.

**Proceso — modo `upgrade` (conceptual):**

1. **Establecer las dos versiones.** La instalada se lee del **registro de instalación del host**, nunca de un `plugin.json` encontrado en el árbol — y una sesión resuelve su versión de plugin al abrirse, así que el registro puede no describir lo que corre. El testigo que sobrevive es el path que la propia skill declara al cargarse, contrastado contra una palabra que solo exista en una versión. La versión del Lore se infiere de sus artefactos; decir con claridad cuándo eso es una estimación. Si la copia instalada está atrasada, **parar y avisar**.
2. **Arbitrar artefacto por artefacto**, clasificando cada hallazgo en exactamente cuatro tipos:

| Tipo | Qué significa | Qué produce |
|---|---|---|
| **Missing** | El kit ahora exige algo que ese artefacto nunca tuvo (una frontera de validez, un marcador de confianza, una sección de derrotas, un encabezado de procedencia). | Agregarlo, **preguntando** todo lo que no se derive del texto. Nunca fabricar una frontera. |
| **Superseded** | El kit ahora sabe que esa práctica está mal. | Proponer la corrección, citando qué regla la reemplaza. |
| **Earned** | Se aparta del estándar actual **porque este proyecto lo pagó**. | Dejarlo, y escribir por qué en `FASES.md` — una línea por excepción, nunca dentro del artefacto que defiende. |
| **Stale** | Coincide con el kit y ya no coincide con **el proyecto**: describe una práctica que cambió y nadie enmendó el texto. | Reportarlo con la evidencia que lo contradice y **preguntar**; la corrección la enuncia el usuario. |

3. **`index.md` se arbitra contra su propio formato de fila**, no solo contra sus enlaces. El fallo que hay que buscar es un campo del medio que se partió en dos sin que nadie lo note — unas filas diciendo *cuándo abrir esto*, otras cargando un marcador de confianza. Se esconde bien: **una lista malformada se ve tan bien formada como una completa**.
4. Una lista de hallazgos **sin ningún `Earned`** en un Lore con historia significa que el pase se está corriendo como formateador. **`Stale` es el que ninguna lectura encuentra:** se detecta contra el repositorio y nunca releyendo — un artefacto consistente consigo mismo y falso hacia afuera sobrevive toda revisión.
5. Presentar el umbral completo, escribir solo tras aprobación, y registrar la versión a la que se
   actualizó en `FASES.md` — no en el Lore. **No commitea.**
6. **Desde 2.1.4, un árbol se mapea antes de leerse** (gits, dónde vive `lore/`, qué contrato se carga). El índice largo se repara por cabecera, no por filas. En un `.md` vivo que manda, `HARD-GATE` se dice umbral. Falta `identidad.md`/`principios.md` es ADD. En una campaña el umbral es por clase, no por árbol. La bandeja se cuenta; no se mina salvo que restrinja esta pasada.

**Proceso — modo `prune` (conceptual):**

**La unidad que este modo cuenta es el entregable, no el Lore.** Un cuerpo de criterio no es demasiado grande en abstracto; es demasiado grande *para la cosa que tiene que producir*. Hay que pedir el artefacto que el proyecto realmente publica antes de leer un solo módulo — sin eso, `prune` no tiene denominador y se convierte en gusto.

1. **Medir antes de leer**, porque el defecto que este modo ataca es invisible leyendo los archivos de a uno: leyes en `principios.md` (área + proyecto), Pistas en los módulos temáticos, **Pistas sin frontera de validez** (una sin frontera aplica *siempre* — ese es el multiplicador), guardarraíles de la fase activa, y **aparato contra contenido en los últimos tres entregables** — ese último conteo encuentra lo que ningún pase por artefacto detectó nunca. También hay que inventariar si cada tipo de pieza publicada tiene un **techo de extensión declarado**: la pieza sin techo es la que se infla, y suele ser la más publicada.
2. **Clasificar, cuatro tipos:**

| Tipo | Qué significa | Qué produce |
|---|---|---|
| **Deadwood** | No restringe ninguna decisión futura — la decisión que moldeó ya no existe, o se adoptó de otro lado y nunca mordió. | **Sale**, después de escribir su residuo. |
| **Crowding** | Correcto, ganado y no refutable — y aun así su *suma* con los demás satura el entregable. | **No sale.** Recibe una frontera de validez, un destino para el artefacto que exige, o un techo. |
| **Rooted** | Estructural: hay una cicatriz real detrás y una decisión que todavía depende de él. | Intacto, y **no se re-examina en el próximo pase**. |
| **Unhealed** | Declarado aplicado y aplicado a medias — la corrección aterrizó en un lugar y no en sus hermanos. | **Se termina o se desmarca.** No puede quedar declarado-y-falso. |

3. **Una lista de poda sin ningún `Rooted` es un pase corrido como motosierra** — el espejo de la regla `Earned`: un modo que solo quita siempre encuentra algo que quitar.
4. Nada sale sin dejar su residuo escrito, y **lo que encoge es el entregable, no necesariamente el
   corpus**.

**Proceso — modo `crystallize` (conceptual):** resolver el **árbol enrutado entero** — contrato,
canon, identidad, principios y cada `lore/` que nombren `enrutamiento.md` o
`scripts/ecosistema.json`, incluida una copia `lore-ecosistema/` que haya dejado una versión anterior
cuando la fuente viva no está — se lee, nunca se crea. Una
fotografía que solo *apunta* a criterio que no trae ha fallado el modo. El resto se clasifica
como privado, ruido (notas, scripts que no sean el manifiesto, lockfiles) o no enrutado; se
muestra el manifiesto; se espera aprobación; se escribe un solo archivo fuera de `lore/`. Cada
archivo va envuelto en `<!-- lore:extract path="..." owner="..." -->`; se extrae con
`skills/transmute-lore/scripts/crystallize.mjs` a una mini-raíz que espeja `raiz`. «Sin el
ecosistema» no es el default. El material privado se excluye por defecto: se omiten nombres de
archivo sensibles y los marcadores de secreto reconocidos en texto enrutado abortan la pasada. El
usuario no escribe el extractor.

`transmute-lore` **no hace commit del proyecto destino**. Los modos que cambian fuentes dejan un
*diff* revisable; `crystallize` verifica que los hashes o tamaños de las fuentes no cambiaron.

Usa `transmute-lore` cuando ya tienes proyectos en marcha y quieres incorporarlos a Lore sin reconstruirlo todo desde cero.

---

