# Feature Specification: Lore Plugin 2.1 — contrato con spec-kit y Lore siempre activo

**Feature Branch**: `main` (sin rama: no hay `before_specify` hook instalado)

**Created**: 2026-08-14

**Status**: Draft

**Repositorio de destino**: `C:\Claude\plugins\proyectos\lore-plugin`

> **Principio III de la constitución.** Este bot es una lente, no un lugar donde aterriza una feature.
> Aquí se escribe el spec; la implementación ocurre en el repositorio de destino declarado arriba, cuyo
> criterio pertenece al área `plugins` (`plugins/lore/principios.md`). `/speckit-implement` no corre
> en este repositorio.

> **Desviación declarada de spec-kit.** Su unidad es *una feature por invocación*; la unidad de Lore es
> *una versión*. A y B son dos capacidades de una sola release y comparten superficie, gates y prueba,
> así que van en un spec. La regla se dobla a propósito y queda anotada — correrla mal y quejarse
> después no sería medición.

**Input**: Lore Plugin 2.1, dos capacidades. (A) Contrato de convivencia con GitHub spec-kit: frontera
de autoridad declarada, constitución-puntero que revoca la supremacía de spec-kit, y los tres
escenarios de entrada. (B) Lore siempre activo: bloque canónico delimitado e idempotente estampado por
las skills en el contrato `CLAUDE.md`/`AGENTS.md`, con techo de 25 líneas, más hook `SessionStart` de
Claude Code documentado como amplificador opcional y no como mecanismo.

## Clarifications

### Session 2026-08-14

- Q: ¿Quién estampa el bloque siempre-activo en el contrato, y con qué alcance sobre lo que ya existe? → A: Lo estampan las skills que ya escriben el contrato (`create-area`, `create-project`, `create-bot`), dentro del umbral que ya tienen; y `transmute-lore` en modo UPGRADE lo añade retroactivamente a los proyectos existentes.
- Q: ¿El bloque dice lo mismo en un área, un proyecto y un bot? → A: Tres variantes, con el mismo techo de 25 líneas. El bot apunta a su `canon/` y a la tabla de enrutamiento, nunca a los Lore federados uno por uno.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — El kit no se invoca, y nada lo denuncia (Priority: P1)

Alguien trabaja durante semanas en un proyecto gobernado por Lore. Resuelve fricciones reales, escribe
criterio a mano en `principios.md` porque «ya sabe lo que hay que escribir», y nunca invoca
`save-to-lore`. Lo que produce se lee bien, aterriza en el archivo correcto y pasa la revisión humana.
Lo que falta —la cabecera de procedencia, la marca de confianza, la sección de derrotas y, sobre todo,
el **modo**— no parece faltar, porque nunca llegó a escribirse.

Hoy la única defensa es una tabla dentro de `use-lore`, que solo se lee si alguien invoca la skill que
nadie invoca.

**Why this priority**: es la fricción diaria del kit y la que anula su valor acumulado. Un kit que
funciona perfecto cuando se usa, y que no se usa, vale cero. Todo lo demás en 2.1 es secundario frente
a esto.

**Independent Test**: se puede probar entera sin tocar la capacidad A. Se toma una tarea que hoy se
resuelve escribiendo criterio a mano, se corre en frío y con el bloque presente, mismo modelo y mismo
prompt, y se mide si la skill se invoca.

**Acceptance Scenarios**:

1. **Given** un proyecto con Lore y un contrato sin el bloque, **When** una skill de Lore estampa el
   bloque, **Then** el contrato contiene el bloque delimitado, el resto del archivo queda intacto byte
   a byte, y el bloque no supera 25 líneas.
2. **Given** un contrato que ya lleva el bloque, **When** se vuelve a estampar, **Then** sigue habiendo
   exactamente un bloque y su contenido queda actualizado, no duplicado.
3. **Given** una sesión abierta en un proyecto cuyo contrato lleva el bloque, **When** se pide una
   tarea que hoy se resuelve escribiendo criterio a mano, **Then** se invoca la skill que gobierna ese
   artefacto en vez de escribirlo directamente.
4. **Given** un host sin soporte de hooks, **When** se abre la sesión, **Then** el bloque sigue
   cargándose, porque el mecanismo es el contrato y no el hook.

---

### User Story 2 — Dos kits declaran ser la ley y ninguno se entera del otro (Priority: P2)

Alguien tiene un proyecto gobernado por Lore e instala spec-kit, o al revés. Los dos kits escriben en
canales disjuntos —spec-kit en `.specify/` y `.claude/skills/`; Lore en el contrato, `lore/` y
`FASES.md`— y no se pisan ningún archivo. La constitución de spec-kit llega vacía y con la cláusula
*«Constitution supersedes all other practices»*; `lore/principios.md` reclama lo mismo con contenido
pagado con fricción.

Como no se pisan, **nada falla**. El proyecto trabaja con dos cuerpos de criterio, cita correctamente
las reglas de uno u otro según qué skill se invoque, y produce resultados distintos según por dónde
haya entrado.

**Why this priority**: el daño es real pero silencioso y afecta solo a quien use ambos kits. Es menos
urgente que la P1, que afecta a todo el mundo.

**Independent Test**: se puede probar sin tocar la capacidad B, instalando spec-kit en un proyecto con
Lore y verificando que la constitución resultante enruta en vez de duplicar, y que declara el orden de
precedencia.

**Acceptance Scenarios**:

1. **Given** un proyecto con Lore y sin spec-kit, **When** se corre `specify init` y se aplica el
   contrato, **Then** la constitución no contiene ninguna copia del criterio de `lore/` y sí contiene
   el orden de precedencia y la revocación de la cláusula de supremacía.
2. **Given** un proyecto con spec-kit y sin Lore, **When** se corre el umbral de primer uso de
   `use-lore`, **Then** la constitución existente se trata como **criterio importado** y pasa por
   `save-to-lore` en modo TRANSPLANT, con su sección de derrotas — no se copia al `lore/`.
3. **Given** un proyecto que arranca los dos desde cero, **When** se sigue la documentación, **Then**
   Lore se construye primero y la constitución se escribe después, apuntando a él.
4. **Given** un ciclo de spec-kit terminado que dejó una cicatriz, **When** se cierra, **Then** la
   cicatriz sale por `save-to-lore` hacia el `lore/` que la posee y no se conserva dentro de `specs/`.

---

### User Story 3 — El amplificador opcional (Priority: P3)

Quien trabaje en Claude Code puede querer que el bloque llegue como turno propio y no como parte de un
contrato que el modelo puede hojear. Se le documenta un hook `SessionStart`, con su instalación
verificada, y se declara explícitamente que **nadie depende de él**.

**Why this priority**: mejora la fuerza del mecanismo en un solo host. Si se cae, la capacidad B sigue
funcionando entera.

**Independent Test**: instalar el hook en Claude Code y verificar que el bloque llega; desinstalarlo y
verificar que el bloque sigue llegando por el contrato.

**Acceptance Scenarios**:

1. **Given** Claude Code con el hook instalado, **When** se abre una sesión, **Then** el bloque se
   presenta como contexto de arranque.
2. **Given** cualquier otro host sin hook, **When** se abre una sesión, **Then** el comportamiento
   descrito en la User Story 1 se conserva sin degradación.

---

### Edge Cases

- **El contrato ya está hinchado.** Estampar un bloque en un `CLAUDE.md` de 400 líneas empeora
  exactamente lo que 2.1 quiere arreglar. El estampado debe reportar el tamaño del contrato y sugerir
  `transmute-lore` cuando el contrato exceda su propio estándar de punteros.
- **El usuario editó el bloque a mano.** Un re-estampado no puede borrar en silencio una edición
  humana: se detecta la divergencia, se reporta y se pide decisión.
- **Los marcadores delimitadores están rotos o duplicados** por una edición previa: el estampado se
  detiene y reporta, nunca adivina cuál es el bloque bueno.
- **El proyecto no tiene contrato** (`CLAUDE.md`/`AGENTS.md` ausente). No se crea uno solo para
  hospedar el bloque: falta la pieza que `use-lore` ya gobierna, y eso se reporta.
- **Registro asíncrono.** Un artefacto siempre-activo escrito en la sesión N puede tardar en estar
  disponible dentro de esa misma sesión. Nada puede depender de que surta efecto en el turno siguiente
  al que lo escribió. *(Observado el 2026-08-14 con las skills de spec-kit.)*
- **Dos hosts, un proyecto.** Un proyecto con `CLAUDE.md` leído también por Codex vía fallback recibe
  un solo bloque, en un solo contrato. Nunca dos.
- **La ruta de la constitución cambia** en una versión futura de spec-kit. La documentación cita
  `.specify/memory/constitution.md` verificado contra `specify-cli 0.16.5.dev0`, con la versión
  declarada al lado.

## Requirements *(mandatory)*

### Functional Requirements

**Capacidad B — Lore siempre activo**

- **FR-001**: `create-area`, `create-project` y `create-bot` MUST estampar en el contrato que ya
  escriben un bloque delimitado por marcadores estables y reconocibles, **dentro del umbral que ya
  tienen**. No se añade una puerta nueva ni una operación que haya que recordar invocar.
- **FR-001b**: `transmute-lore` en modo UPGRADE MUST añadir el bloque a los contratos de proyectos que
  ya existen, de modo que el ecosistema instalado lo reciba por el camino de migración ya previsto y no
  solo los proyectos nuevos.
- **FR-002**: El estampado MUST ser idempotente: N ejecuciones producen exactamente un bloque, y el
  resto del archivo queda intacto byte a byte.
- **FR-003**: El bloque MUST NOT superar 25 líneas. Si el contenido no cabe, no era siempre-activo:
  era Lore, y el Lore ya tiene dónde vivir.
- **FR-004**: El bloque MUST contener exactamente **cuatro** cosas: qué Lore gobierna aquí, dónde vive,
  **dónde vive el estado** (`FASES.md`, una línea, solo la ruta), y la señal de invocar en vez de
  escribir a mano. Nada más.

  > **Enmienda declarada — 2026-08-16.** Este requisito decía **tres** cosas y no incluía el estado.
  > Se amplía a cuatro, y se declara acá en vez de reescribirse en silencio, por el mismo motivo por
  > el que se declaró el orden de C, D y E: un spec que cambia sin dejar cicatriz deja de servir para
  > saber qué era la versión.
  >
  > *Razón del cambio:* el criterio y el estado viven en archivos separados —esa ley no se toca—, pero
  > el almacenamiento separado nunca fue un argumento para la **entrega** separada. Un agente que
  > carga el criterio y no la fase sabe cómo hay que hacer el trabajo y no cuál toca, así que propone
  > bien y **fuera de orden**, y nada en su salida avisa del hueco. Hoy la fase llega por la prosa
  > escrita a mano del contrato, que es justo la mitad que el kit documenta como la que se queda
  > vieja: las skills re-estampan el bloque y no tocan el resto.
  >
  > *Por qué no viola FR-005:* es un **puntero, no contenido**. La ruta es estable y solo su destino
  > se agita. Nada de la fase, la hoja de ruta ni la tarea actual entra al bloque.
- **FR-004b**: El bloque MUST tener **tres variantes**, una por forma, todas bajo el mismo techo de 25
  líneas:
  - **Área** — apunta a su propio `lore/`, que es el criterio que posee.
  - **Proyecto** — apunta a su capa propia y a la del área madre.
  - **Bot** — apunta a `canon/` y a la **tabla de enrutamiento**, nunca a los Lore federados uno por
    uno. Un bot que federa muchas fuentes cabe porque delega en la tabla; eso es para lo que la tabla
    existe.

  Las tres apuntan además a su propio `FASES.md`, que es una línea y no escala con la cantidad de
  fuentes.
- **FR-005**: El bloque MUST NOT duplicar criterio: apunta a `lore/`, nunca lo reproduce.
- **FR-006**: El mecanismo MUST ser neutral al proveedor. El canal es el contrato, que Claude Code y
  Codex cargan por igual.
- **FR-007**: Ante una divergencia entre el bloque en disco y el canónico, el sistema MUST reportarla y
  pedir decisión, nunca sobrescribir en silencio.
- **FR-008**: El hook `SessionStart` de Claude Code MUST documentarse como opcional, con instalación
  verificada, y MUST NOT ser requisito de ninguna otra funcionalidad.

**Capacidad A — contrato con spec-kit**

- **FR-009**: La documentación MUST declarar el reparto de autoridad: spec-kit gobierna el ciclo
  efímero de un encargo; Lore gobierna el criterio que sobrevive al ciclo; ante conflicto manda Lore.
- **FR-010**: La constitución de spec-kit MUST quedar como frontera y puntero, y MUST revocar
  explícitamente la cláusula por defecto *«Constitution supersedes all other practices»*.
- **FR-011**: La constitución MUST declarar un orden de precedencia explícito entre los cuerpos de
  criterio del proyecto.
- **FR-012**: La documentación MUST cubrir los tres escenarios de entrada y decir qué corre primero en
  cada uno.
- **FR-013**: Una constitución preexistente MUST tratarse como criterio importado y pasar por
  `save-to-lore` TRANSPLANT con su sección de derrotas. MUST NOT copiarse al `lore/`.
- **FR-014**: La documentación MUST declarar que una cicatriz nacida en un ciclo de spec-kit sale por
  `save-to-lore` y no se conserva dentro de `specs/`.
- **FR-015**: Se MUST citar la ruta de la constitución con la versión de `specify-cli` contra la que se
  verificó.
- **FR-016**: Ninguna de las dos capacidades MUST introducir una dependencia obligatoria de spec-kit.
  Lore sigue siendo comprensible, instalable y útil sin él.

**Transversales**

- **FR-017**: Cualquier cambio a una skill MUST pasar por arbitraje, umbral y prueba de
  comportamiento antes de publicarse.
- **FR-018**: Todo artefacto nuevo MUST escribirse en el idioma del Lore de destino; los nombres fijos
  (`lore/`, `index.md`, el nombre del contrato) no se traducen.

### Key Entities

- **Bloque siempre-activo**: fragmento delimitado, idempotente y con techo de 25 líneas, alojado en el
  contrato. Contiene punteros, nunca criterio.
- **Constitución-frontera**: `.specify/memory/constitution.md`. Su contenido legítimo es la línea
  divisoria entre dos cuerpos de criterio, no una copia de ninguno.
- **Ciclo de encargo**: `specs/<id>/` — efímero, se cierra. Su residuo destilable sale hacia `lore/`.
- **Cuerpo de criterio**: `lore/` + contrato + `FASES.md`. Persiste y restringe todos los ciclos
  futuros.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: En una tarea que hoy se resuelve escribiendo criterio a mano, la presencia del bloque
  hace que se invoque la skill que gobierna el artefacto. Se corre en frío y con bloque, mismo modelo
  y mismo prompt. ~~**Si no cambia nada, la capacidad B no entra en 2.1 y el descarte se reporta.**~~

  > **Enmienda del 2026-08-15 — SC-001 deja de ser puerta de release.** Auditado antes de publicar
  > 2.1: nunca se corrió y **no es corrible con el instrumento actual**. El banco monta como entorno
  > un fixture con `CLAUDE.md` y una carpeta `lore/`, **sin skills instaladas**, así que no hay nada
  > que el bloque pueda hacer invocar: el criterio no puede pasar ni fallar. Es la misma causa que
  > anuló el pre-registro de `bench/preregistro-2026-08-14_genealogia.md` el día que se escribió.
  >
  > No se disimula convirtiéndolo en otra cosa más barata. Se **reclasifica**: SC-001 pasa a ser un
  > **requisito de lo que el IME tiene que poder medir** — unidad de comparación *la presencia del
  > bloque en el contrato*, salida observable *si el agente invoca la skill o escribe a mano*, en un
  > repositorio con las skills realmente instaladas. Queda registrado en el `FASES.md` de LUS, que es
  > donde vive la puerta de la Fase VIII.
  >
  > **La capacidad B entra en 2.1 sin medición, y eso se declara en las release notes.** Lo que la
  > sostiene es SC-002 —que sí se cerró, con cinco tests en `scripts/always-on-block.test.mjs`— y su
  > derivación de diseño. Nada más. Publicar sin decirlo habría sido el modo de falla que este kit
  > existe para evitar.
- **SC-002**: Ejecutar el estampado tres veces seguidas deja exactamente un bloque, y el diff del
  contrato tras la segunda y la tercera ejecución está vacío.
- **SC-003**: Una persona que ya usa spec-kit puede añadir Lore, o al revés, siguiendo la
  documentación y sin preguntar cuál de los dos manda: el orden de precedencia está escrito.
- **SC-004**: Ningún contrato de los proyectos existentes crece más de 25 líneas al adoptar 2.1.
- **SC-005**: Desinstalar spec-kit por completo no rompe ninguna funcionalidad de Lore.

## Assumptions

- El repositorio de destino es `lore-plugin`; el criterio que lo gobierna vive en `plugins/lore/`, no
  en este bot. Este spec no autoriza escribir en ninguno de los dos: autoriza planificar.
- La ruta `.specify/memory/constitution.md` y los diez comandos `speckit-*` quedaron verificados contra
  `specify-cli 0.16.5.dev0` (commit `bf88c9f`) el 2026-08-14. Una versión distinta puede mover ambos.
- El techo de 25 líneas es una decisión de diseño, no una medición. Se revisa si el contenido mínimo
  del bloque no cupiera; el techo se declara antes para que el bloque no crezca por inercia.
- El benchmark con Claude Code que `LUS/FASES.md` §9 aún registra como agendado **está descartado**. No
  hay protocolo congelado que estos cambios puedan contaminar.
- La evidencia disponible es de una sola instalación, un constructor y cero ciclos completados. Este
  spec planifica sobre `conjecture`, no sobre resultado medido, y el SC-001 existe para poder fallar.
- El bloque `<!-- lore:always-on -->` es la forma propuesta de los marcadores. La forma exacta se fija
  en el plan, no aquí.
