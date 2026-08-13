# lore/investigacion.md — El workflow de Fase 1 y sus plantillas

> **§0 es el orden** en que se produce la Fase 1 de cualquier proyecto del área. **§1–§3 son
> plantillas de formato**, no de contenido: la estructura, el orden y el tipo de información de
> los tres documentos que esa fase entrega (**brandkit**, **benchmark**, **wireframe**). Un
> proyecto nuevo sigue este workflow y parte de estas estructuras por defecto; el contenido lo
> aporta su investigación.
>
> Los documentos viven en `material-marca/01-investigacion/` (ver `_starter/`). La salida clave
> de la fase es `que-es-<cliente>.txt`, fuente de verdad de copy y datos.
>
> Destiladas de la Fase 1 de un SaaS de suscripción; **validadas una vez**. La estructura
> funciona; no es ley probada en varios proyectos.

---

## 0. El workflow de Fase 1 — Descubrimiento y definición inicial

Ocho pasos, en orden. El checklist ejecutable vive en `_starter/FASES.md`; aquí vive el criterio.

1. **Kickoff & brief** — nombre, cliente, de qué trata · objetivos, público, alcance · dominio y
   hosting (no bloquea: se necesita recién en el deploy).
2. **Entrevista inicial al cliente** — respuestas y material existente a
   `material-marca/01-investigacion/`.
3. **Muestrario de estilos** — enviar https://muestrario-estilos.vercel.app/. El cliente marca con
   la estrella hasta **5 paletas** y hasta **5 tipografías** que resuenen con su marca, y comparte
   la selección con *"Copiar mi selección"* (habitualmente por WhatsApp). **Transcribir la selección
   al repositorio** (§0.2) — archivar no es guardar el mensaje.
4. **Investigación de referencias** — buscar sitios afines en Awwwards **cruzando la selección del
   muestrario con el rubro del proyecto**.
5. **Benchmark** → `benchmark/benchmark-referencias.md` con los sitios del paso 4 (plantilla §2).
6. **Brandkit inicial** → `identidad-inicial/brandkit-inicial.md`, tomando las paletas y
   tipografías seleccionadas en el paso 3 como **input base** (plantilla §1).
7. **`que-es-<proyecto>.txt`** — qué es el proyecto. Fuente de verdad de copy y datos.
8. **Wireframe inicial** (plantilla §3) y **Golden Paths** → `golden-paths.md`.

Cerrados los ocho, se avanza a Fase 2.

### 0.1 El muestrario va antes de investigar, no después

El paso 3 es la bisagra del workflow y **tiene dos consumidores aguas abajo**: filtra la búsqueda
de referencias (paso 4) y siembra el brandkit (paso 6). Por eso ocurre antes que ambos.

Invertir el orden — investigar primero, mostrar el muestrario después — convierte la selección del
cliente en una ratificación de lo que el constructor ya eligió. **La Fase 2 valida y afina lo que
el muestrario ancló; no vuelve a elegir.** Un proyecto que llega a Fase 2 sin selección del cliente
está eligiendo por él. La ley completa vive en `principios.md` § *Leyes de método*.

### 0.2 La selección del muestrario se transcribe al repositorio antes de escribir el brandkit

Una captura en Miro, un PDF o un mensaje de WhatsApp **no son archivo**: son un lugar donde el
constructor no puede leer cuando escribe el brandkit. Si la selección no está en el repo en texto,
el brandkit se escribe a ciegas y la Fase 2 hereda el sesgo entero.

La selección vive en `material-marca/01-investigacion/seleccion-<cliente>/`, en dos `.md`:

- **`paletas-seleccionadas.md`** — cada paleta con **sus hex, su etiqueta de rubro y el token que
  produjo**, y con los swatches que **no** se adoptaron **y por qué**.
- **`tipografias-seleccionadas.md`** — cada par con su título, su cuerpo y su etiqueta.

Se transcribe además, **literal, la frase con que el cliente explicó su mezcla**: no es un gusto, es
una instrucción, y se lee palabra por palabra (*"el sorbet dawn **es cálido**"* trae la temperatura,
no el pastel).

**La etiqueta de rubro de cada paleta es un descarte declarado.** *Deep Azure → `fintech, seguros,
SaaS B2B`. Sorbet Dawn → `spa, bienestar femenino`. Mystic Arcana → `tarot, astrología`.* El cliente
elige la paleta **a pesar** de su rubro, no por él. La marca vive en el punto donde ninguna de las
paletas elegidas se reconoce a sí misma.

Lo que esto habilita: **cada decisión de la dirección de diseño puede citar su fuente** — la
selección o la entrevista. Una decisión que no puede citarse es del constructor, no del cliente.

### 0.3 El elemento central del sitio no puede faltar en la investigación ni en el moodboard

**Antes de cerrar la Etapa 1 del moodboard, nombrar el elemento central del proyecto y buscarlo en
la visión.** Si no aparece, la visión está incompleta — por muy coherente que se lea.

El elemento central es **aquello que el sitio no puede evitar mostrar**: lo que el visitante viene a
ver, lo que el producto produce, lo que da nombre al rubro. En un sitio de numerología, **el
número**. En una tienda, el producto. En un estudio de fotografía, la foto. En un SaaS, la pantalla
del producto.

Es exactamente lo que el sesgo del constructor deja fuera, y por una razón mecánica: **el elemento
central suele ser el más cargado de cliché** (el número místico dentro de un círculo con destellos),
y evitar el cliché por omisión se siente como buen gusto. No lo es. Lo que no se decide **lo decide
el default**, y el default *es* el cliché.

Un elemento central bien resuelto es, además, donde el sitio gana su tesis. Introspection Solutions
—que no predice— resolvió el número como **cota**: la cifra que mide, no la que adivina. Esa decisión
no salió del brandkit; salió de preguntarle a la visión por lo que se había saltado. Lo que produce,
en cascada: una carpeta propia en el moodboard, una ley tipográfica (cifras tabulares, alineación) y
un tell que evitar.

**El chequeo, en una línea:** *¿está el sustantivo del rubro en alguna carpeta del tablero?* Si la
respuesta es no, el moodboard no está terminado.

### 0.4 Los pendientes del cliente se registran, no se esperan

Lo que el cliente no ha decidido va a un bloque explícito de pendientes en el `FASES.md` del
proyecto, nombrando **de qué sub-fase es prerrequisito**. Si no es prerrequisito de ninguna, no
bloquea el avance a Fase 2 (ver §4.2).

---

## 1. Plantilla — Brandkit inicial

Seis secciones. Las cinco primeras son el sistema visual; la sexta es la que atrapa errores
y es la más valiosa: **un brandkit sin sección de validación se lleva sus huecos a Fase 2.**

### 1.1 Paleta de color (tokens)

Cinco sub-bloques, en este orden. Cada token con su hex **y una frase de para qué sirve** —
nunca una lista pelada de colores.

1. **Familia base** — el eje cromático dominante del proyecto (fondos principales y sus capas).
2. **Metales y neutros** — el registro de "lujo discreto": bordes, hairlines, divisores.
3. **Acentos emocionales contenidos** — colores que aparecen solo en momentos puntuales
   (testimonios, citas), nunca en la UI estructural.
4. **Texto y estados** — texto sobre fondo oscuro, sobre fondo claro, y colores de detalle.
5. **CTAs y bordes** — default / hover / pressed + bordes por tipo de superficie.

### 1.2 Tipografía

Fuente display con escala de títulos (+ alternativas justificadas) · fuente de cuerpo con
escala `body-lg` / `body-md` / `body-sm` · fuente de UI para labels, pills y navegación
secundaria. Cada estilo con tamaño, line-height y **dónde se usa**.

### 1.3 Componentes clave

Botón primario · botón secundario · pills/chips · cards · y **el módulo interactivo
distintivo del proyecto** (el widget que define el producto y suele vivir en el hero).
Cada uno con fondo, borde, radio, estados y ejemplos reales de texto.

### 1.4 Layouts base

Home (grid + lista ordenada de secciones, cada una con su fondo) · página de detalle o
servicios · blog.

### 1.5 Motion y microinteracciones

Principios primero (duraciones, easings), aplicaciones por componente después.

### 1.6 Validación y ajustes

**Cuatro chequeos fijos**, siempre:

1. **Tokens fantasma** — colores usados en los layouts que nunca se definieron en la paleta.
2. **Contraste de todo color usado como texto** — verificar 4.5:1 (WCAG AA) contra su fondo
   real. Un color pensado como fondo de chip suele fallar como texto de chip.
3. **Coherencia del CTA con el sistema** — si el color del CTA no pertenece a ninguna familia
   de la paleta, es un huérfano importado de otra referencia. Sospechar y proponer reemplazo.
4. **Regla de proporción** — declarar en porcentajes cuánto ocupa cada eje cromático, para que
   ninguno domine. Es la respuesta operativa cuando el cliente pide "un punto intermedio entre
   A, B y C": la mezcla no se logra subiendo el acento, sino calibrando las superficies.

**Checklist de tokens que casi siempre faltan:** estados semánticos (error / success / warning) ·
focus ring visible sobre fondo claro y oscuro · borde para superficies oscuras (el borde suele
diseñarse solo para las claras) · escala tipográfica intermedia (h3/h4) · cifras tabulares para
fechas, precios y datos · escalas de spacing, radios y z-index · tratamiento de imagen (cómo se
integran las fotos sin romper la atmósfera).

Cerrar con **decisiones registradas**: lo que se resolvió y no se vuelve a discutir.

---

## 2. Plantilla — Benchmark de referencias

**Regla de selección:** cada referencia debe aportar **una cosa distinta**. Típicamente una da
el sistema gráfico, otra el esqueleto de página, otra el lenguaje de interacción y otra el nivel
de composición. Si dos aportan lo mismo, sobra una. **Cuatro referencias bastan.**

### 2.1 Tabla resumen

Siete columnas fijas:

| Sitio | Link | Objetivo principal | Colores / atmósfera | Tipografía percibida | Qué destaca | **Qué aplicar a este proyecto** |

La última columna es la que convierte la tabla en decisión y no en catálogo. Si está vacía o es
genérica, la referencia no sirve.

### 2.2 Notas adicionales

Un párrafo por referencia: qué la hace relevante para *este* proyecto.

### 2.3 Síntesis

Tres bloques:

1. **Qué aporta cada referencia, en una línea** — nombra su rol único.
2. **Patrones de estructura** — orden de secciones, navegación, tipos de CTA que se repiten
   en las referencias y se adoptan.
3. **Patrones visuales** — paletas, tipografías y componentes que pasan a ser base del proyecto.

---

## 3. Plantilla — Wireframes

Son **tres documentos** con un mismo átomo.

### El átomo

Cada sección se describe con **cuatro campos fijos, y nada más**:

- **Layout** — columnas, anchos, spacing.
- **Contenido** — qué va dentro.
- **CTAs** — qué acciones ofrece.
- **Jerarquía** — qué domina visualmente (`A > B > C`).

### 3.1 Landing + páginas internas

Secciones numeradas con el átomo. Al final, una **revisión**: problemas detectados → estructura
v2 con el orden definitivo de secciones → ajustes de páginas internas (qué separar, qué falta,
qué sobra).

### 3.2 Área privada / dashboard (si el proyecto la tiene)

Navegación interna → **un bloque por nivel de acceso** → páginas de detalle → cuenta → modales.
Al final: corrección de nomenclatura de niveles, **empty state** del usuario nuevo, recortes
post-MVP explícitos, y la tabla **`funcionalidad → nivel de acceso`**.

### 3.3 Flujos de usuario

Flujos felices numerados · **tabla de caminos tristes** (situación → qué pasa en el sistema →
qué ve el usuario) · **tabla de jerarquía de acceso por ruta**. De aquí derivan los Golden Paths.

---

## 4. Dos reglas de método (emergen al hacer estos documentos)

### 4.1 Sistema de CTAs de dos velocidades

Todo el sitio se resuelve con dos acciones: una **gratuita, de bajo compromiso** (engancha) y una
**de conversión** (el objetivo de negocio). **Nunca compiten en la misma jerarquía visual.** Un
wireframe donde conviven "Comenzar", "Probar ahora", "Comenzar gratis" y "Agendar demo" no tiene
sistema de CTAs: tiene cuatro sinónimos.

### 4.2 Una decisión de negocio pendiente no bloquea el diseño

Cuando el cliente no ha decidido algo (qué es gratis y qué es de pago, el dominio, los precios):
documentar el flujo completo, marcar explícitamente **qué casilla queda por llenar** y seguir. Los
flujos rara vez cambian con esa decisión — solo cambia qué elemento cae en qué columna. Registrar
el pendiente en `FASES.md`, no en la cabeza.
