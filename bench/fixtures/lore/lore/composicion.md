# lore/composicion.md — Composición de página y catálogo de *tells*

> **Qué es esto.** Las leyes de cómo se compone una página (hero, secciones, grillas, nav,
> listas, imágenes) y el catálogo de firmas que delatan una web generada por IA.
> No es CSS (eso es `layout.md`) ni motion (eso es `animation.md`): es **composición**.
>
> Destilado de las skills `design-taste-frontend`, `high-end-visual-design`, `gpt-taste`,
> `stitch-design-taste` (repo `Leonxlnx/taste-skill`), contrastado contra nuestro estándar.
> Donde una skill contradice nuestra `identidad.md`, **gana nuestro estándar** (ver §7).

---

## 1. Los tres candados (locks)

Tres decisiones se toman **una vez por sitio** y no se renegocian sección por sección.
Romper un candado a mitad de página es el error de composición más caro y el más frecuente.

- **Candado de color.** Un solo acento, y se usa igual en toda la página. Un sitio de grises
  cálidos no gana un CTA azul en la sección 7. Un sitio con acento rosa no tiene un badge
  turquesa en el footer. Elegido el acento, se audita cada componente antes de entregar.
  Máximo **un** acento; saturación por debajo del 80%.
- **Candado de forma.** Una sola escala de radios en toda la página. O todo agudo (radio 0),
  o todo suave (12-16px), o todo píldora en lo interactivo. Un sistema mixto se permite solo
  si la regla está escrita ("botones píldora, cards 16px, inputs 8px") y se cumple en todas partes.
  Botones redondos en un layout cuadrado es diseño roto.
- **Candado de tema.** Una página, un tema. Una sección clara en medio de un sitio oscuro hace
  sentir al usuario que cambió de web. **Excepción — y es la nuestra:** alternar superficies es
  lícito **como recurso deliberado y sistemático**, no como azar. Y si el sitio alterna, el CTA
  primario y el focus ring dejan de ser un token y pasan a ser un **par que invierte**
  (ley confirmada en `principios.md`). Alternancia sin sistema = bug; con sistema = composición.

## 2. Hero

- **El hero entra en el primer viewport.** Titular ≤ 2 líneas en desktop, subtexto ≤ 20 palabras
  (y ≤ 4 líneas), CTA visible sin scroll. Si no entra: baja la escala tipográfica o corta el copy.
- **Un titular de 4 líneas es un error de `font-size`, no de longitud del copy.** El reflejo de
  agrandar el titular y angostar el contenedor produce el muro de texto de 6 líneas: es la firma.
  Contenedor ancho + escala sensata (`clamp(3rem, 5vw, 5.5rem)`), y el titular fluye horizontal.
- **Máximo 4 elementos de texto en el hero**: titular, subtexto, CTAs (1 primario + máx. 1
  secundario), y como mucho un cuarto elemento breve. Fuera del hero: la tira de logos
  ("usado por"), el teaser de precio, la lista de features, la fila de avatares. Cada uno tiene
  su sección **debajo**.
- **Si no se puede decir la propuesta de valor en 20 palabras, el problema es la propuesta**,
  no la regla.

## 3. Secciones y grillas

- **Las tres cards iguales en fila están prohibidas.** Es el layout por defecto de cualquier IA.
  Alternativas: zigzag de 2 columnas, bento asimétrico (`2fr 1fr 1fr`), galería con scroll horizontal.
- **Cap de zigzag: máximo 2 seguidos.** El tercer "imagen-izquierda / texto-derecha" consecutivo
  es un fallo. Rompe el patrón con una sección full-width, una vertical, un bento o un marquee.
- **Ninguna familia de layout se repite.** Una landing de 8 secciones usa **al menos 4 familias
  distintas**. Si "Trabajos seleccionados" se ve igual que "Qué hacemos", una de las dos sobra.
- **Bento: N ítems → N celdas.** Cero celdas vacías, ni en el medio ni al final. Si queda un
  hueco, la grilla está mal planeada: se rediseña, no se pega un tile en blanco (`grid-flow-dense`
  ayuda, no salva). Y al menos 2-3 celdas necesitan variación visual real (imagen, gradiente,
  patrón, fondo tintado): un bento de 6 cards blancas con solo tipografía dentro es aburrido
  aunque el resto de la página sea buena.
- **Restricción de cards:** 3-5 cards intencionadas ganan a 8 desordenadas. Y la card se usa
  **solo cuando la elevación comunica jerarquía**; si no, agrupar con `border-t`, `divide-y` o
  espacio negativo.
- **Más de 5 ítems piden otro componente, no una lista más larga.** Un `<ul>` con una hairline
  bajo cada fila es la salida perezosa. Alternativas: grilla de cards, 2 columnas agrupadas,
  acordeón/tabs si son categorizables, píldoras con scroll-snap, marquee para lo que no necesita
  atención individual.
- **Ban de la cabecera partida:** "titular grande a la izquierda + párrafo explicativo pequeño
  flotando a la derecha" como encabezado de sección. Una sección tiene **un** mensaje. Si de
  verdad hacen falta titular y explicación, van apilados (titular arriba, cuerpo debajo, 65ch).
- **Un recurso decorativo pertenece a una sola sección.** Números fantasma gigantes, marcas de agua,
  texturas de fondo, tratamientos de imagen: el que se usa en dos sitios deja de ser el gesto de
  ninguno. Si una sección ya construyó su identidad sobre un recurso, la siguiente necesita el suyo
  (y el catálogo es amplio: signo geométrico, densificación de la grilla, superficie tintada,
  sangrado del propio contenido). Regla de auditoría: recorrer la página listando **un** recurso
  decorativo por sección; dos casillas iguales es un hallazgo, aunque cada una por separado se vea
  bien. Quien lo detecta primero suele ser el cliente, y lo dice como "esto ya lo vi antes".

## 4. Navegación

- **El nav entra en una sola línea en desktop.** Si a 1024px no entra: acorta etiquetas, quita
  ítems secundarios o pasa a menú. Un nav de dos líneas es diseño roto.
- **Altura del nav: 64-72px, tope 80px.** Nada de barras de agencia que se comen el 15% del viewport.

## 5. CTAs

- **Una intención, una etiqueta, en todo el sitio.** "Contactar" + "Hablemos" + "Escríbenos" +
  "Empecemos" son la misma intención: se elige **una** y se usa en nav, hero y footer. Dos CTAs
  con la misma intención en una página es un fallo.
- **El texto del CTA no envuelve a dos líneas en desktop.** Se arregla acortando la etiqueta
  (3 palabras máximo, idealmente 1-2) o ensanchando el botón. Nunca constriñendo con `max-width`.
- **Contraste del botón, verificado.** Texto blanco sobre botón blanco, botón fantasma sobre
  foto sin scrim ni borde: prohibido. Cada CTA se audita contra AA (ver la ley del **par** de
  tokens en `principios.md`).

## 6. Imágenes y activos

- **Una web de marketing es un producto visual.** Una página de puro texto no es minimalismo:
  es trabajo incompleto. Incluso una landing sobria necesita 2-3 imágenes reales (hero + apoyo).
- **El "screenshot falso" hecho con `<div>`s está prohibido.** Falsos dashboards, falsas listas
  de tareas, falsas terminales construidas con rectángulos y bordes: es el *tell* número uno.
  O hay captura real, o imagen generada, o preview real del componente, o no hay preview.
- **SVG decorativo dibujado a mano: no.** Iconos, de librería (ver `principios.md`). Ilustraciones
  y marcas hechas a mano solo si el encargo lo pide explícitamente o es un signo geométrico simple.
- **Un icono de librería es de tamaño interfaz, no de tamaño ilustración.** Ampliarlo a 300-500px
  para usarlo de marca de agua lo delata: las uniones y solapes calculados para un trazo de 1.5px se
  vuelven juntas visibles, y se lee como un boceto a lápiz. A esa escala va un signo construido con
  formas cerradas que no se tocan. → `layout.md`
- **Muro de logos = logos y nada más.** Sin etiquetas de categoría debajo de cada uno
  ("Stripe · pagos"). El logo *es* la credibilidad. Y va **debajo** del hero, nunca dentro.
- Sin **píldoras ni etiquetas superpuestas sobre las fotos**. O la imagen habla sola, o lleva
  un pie **debajo** de ella, fuera del marco.

## 7. Dónde estas skills contradicen nuestro estándar (y pierden)

- **Eyebrows.** `high-end-visual-design` los exige sobre cada H1/H2; `design-taste-frontend` los
  raciona. **Nuestra `identidad.md` los prohíbe de plano y esa ley se mantiene.** No se importa
  ninguna regla de eyebrows: no existen en nuestros sitios.
- **Cursor personalizado.** Las skills lo prohíben (accesibilidad y rendimiento). Nosotros lo
  tenemos como patrón confirmado (glow de cursor, `layout.md`), **guardado tras
  `matchMedia('(pointer: fine)')`**. Se mantiene, pero deja de ser un recurso por defecto: entra
  solo si la dirección de diseño lo pide.
- **Alternancia de superficies.** Ver el candado de tema (§1): las skills la prohíben como regla
  general; nosotros la permitimos **solo como sistema deliberado**, con el CTA como par de tokens.
