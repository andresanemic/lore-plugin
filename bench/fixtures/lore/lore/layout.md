# lore/layout.md — Layout / Posicionamiento / Efectos visuales

> Pistas históricas, NO fuente de verdad. Leads a validar, no recetas.
> ⚠ Validar contra código actual antes de actuar.

---

### [layout] `backgroundAttachment: fixed` para grillas continuas entre secciones

- Contexto: Sitio con grilla de fondo que debe parecer continua entre secciones distintas.
- Causa probable: `background-position` por defecto es relativo al bounding box del elemento. Cada sección tiene su propio origen → las líneas de la grilla no se alinean entre secciones.
- Pista: `backgroundAttachment: 'fixed'` hace que el origen sea el viewport — todas las secciones comparten el mismo sistema de coordenadas. Advertencia: no funciona dentro de elementos con `transform`, `filter` o `will-change` (crean stacking context y rompen el `fixed`). Si la grilla se desalinea en alguna sección, verificar si hay un ancestro con esas propiedades.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [layout] Efecto glow de cursor sin repaints costosos

- Contexto: Efecto spotlight / radial glow que sigue al cursor dentro de una sección.
- Causa probable: Implementación naive con `position:fixed` o actualizando `element.style.background` completo en cada `mousemove` genera repaints en toda la página.
- Pista: Dos capas absolutas con `pointer-events:none` — una para el glow suave de fondo y otra con `mask-image` radial. En `mousemove`, actualizar solo la `mask-image` y el `background` de esas capas — operaciones de compositor que la GPU maneja sin repaint. El glow que "se congela" al salir del elemento es efecto intencional (no limpiar en `mouseleave`).
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [layout] `line-height: 1` recorta letras en fuentes display

- Contexto: Heading o marquee con `lineHeight: 1` en fuentes display (Space Grotesk, Archivo, Lato...) dentro de un contenedor con `overflow: hidden`.
- Causa probable: El line-box a `lineHeight: 1` tiene exactamente el alto del `font-size`. Las fuentes display tienen ascenders/descenders que sobresalen del em-square y son cortados por `overflow:hidden`.
- Pista: Mínimo `lineHeight: 1.08`–`1.12` para fuentes display. Si el contenedor tiene `overflow:hidden` y no se puede cambiar, añadir `paddingBottom` al elemento de texto con `marginBottom` negativo equivalente para compensar sin afectar el layout. Revisar especialmente letras `g`, `j`, `p`, `y` en el estado final.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [layout] `overflow-hidden` en `<section>` recorta el `<h2>` encima del marquee

- Contexto: Sección con un heading encima de un marquee horizontal. Se añade `overflow:hidden` a la sección para contener el marquee.
- Causa probable: `overflow:hidden` en la `<section>` recorta todo el contenido visual que sobresale, incluyendo el ink overflow del `<h2>`.
- Pista: `overflow:hidden` debe estar solo en el `<div>` que contiene las filas del marquee, no en la `<section>` padre. El `<h2>` y otros elementos del bloque necesitan respirar fuera de ese clip. Si el `<h2>` se ve recortado, buscar qué ancestro tiene `overflow:hidden` y evaluar si puede moverse a un nivel inferior.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [layout] Gradiente dinámico en `mousemove` reescribe cadena larga cada frame

- Contexto: Efecto spotlight donde `element.style.background = 'radial-gradient(... at X% Y% ...)'` se actualiza en cada `mousemove`.
- Causa probable: Reescribir la cadena completa del gradiente ~60 veces por segundo es trabajo de parseado innecesario.
- Pista: Definir el gradiente una sola vez con `var(--sx, 50%) var(--sy, 50%)` en el estilo base y actualizar solo las variables CSS con `setProperty('--sx', ...)` en el handler. `setProperty` es operación de compositor — el gradiente ya parsado solo cambia sus coordenadas. Los valores por defecto `50%` evitan un flash antes del primer `mousemove`.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [layout] Warning React: conflicto entre shorthand `flex` y longhand `flexShrink`

- Contexto: Objeto `style` de React con `flex: isMobile ? 1 : undefined` y `flexShrink: 0` en el mismo elemento.
- Causa probable: `flex` es shorthand de `flexGrow` + `flexShrink` + `flexBasis`. React detecta el conflicto en re-renders y produce un warning. El comportamiento puede ser indefinido.
- Pista: Nunca combinar `flex` con ninguno de sus longhands en el mismo elemento. Elegir un enfoque: o el shorthand solo, o los tres longhands (`flexGrow`, `flexShrink`, `flexBasis`) explícitos. Buscar el warning "Updating a style property during rerender (flex) when a conflicting property is set" en la consola.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [layout] Overflow-x horizontal en móvil — el sitio se desplaza lateralmente

- Contexto: Móvil con swipe lateral revelando un margen blanco o el layout apareciendo cortado.
- Causa probable: Algún elemento supera el ancho del viewport (margen negativo, grilla con `backgroundAttachment:fixed`, capas absolutas de glow) causando overflow-x implícito.
- Pista: `overflow-x:hidden` en `html` Y `body` bloquea cualquier overflow lateral a nivel raíz. Poner solo en `body` puede no ser suficiente. Verificar que el fix no oculta síntomas de un elemento genuinamente desbordado que debería corregirse en origen.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [layout] Navbar fijo y transparente sobre secciones de distinto tono — el contraste lo decide la sección, no un umbral de scroll

- Contexto: Header fijo, transparente (sin fondo sólido), que flota sobre secciones de fondos claros y oscuros alternados. Logo, texto y pill deben seguir legibles en todas.
- Causa probable: Atar el cambio de color a un umbral ciego de scroll (`scrollY > N`) cambia el contraste en un punto arbitrario que no coincide con el borde real entre secciones → texto claro sobre fondo claro (ilegible) o viceversa. Un color de texto fijo tampoco sirve: ningún color único es legible sobre fondos claros Y oscuros a la vez. Añadir un fondo sólido al scrollear "resuelve" el contraste pero mata la estética flotante.
- Pista: Que cada sección declare su tono (`data-nav="light|dark"`) y el navbar detecte en scroll/resize qué sección cruza su línea central (`getBoundingClientRect`) para adaptar SOLO el color de su contenido — sin añadir nunca fondo sólido. Patrón en `NavBar.tsx`. Regla de proyecto: toda sección nueva debe declarar `data-nav`.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [layout] `preserveAspectRatio="none"` aplasta el SVG con detalle (árboles) en móvil angosto — OK para curvas suaves, NO para formas reconocibles

- Contexto: SVG decorativo full-bleed (cordillera/bosque del Metrics) con `viewBox` ancho (`0 0 1440 320`) y `preserveAspectRatio="none"` para que llene el ancho. Síntoma: en móvil el fondo se ve "comprimido" — los árboles quedan como espigas finas y altas.
- Causa probable: `none` estira el SVG de forma no uniforme para encajar el contenedor. En un viewport angosto y alto, la escala X se aprieta mucho (≈0.26) y la Y se estira → las formas con proporción reconocible (árboles, íconos) se deforman. Las colinas (curvas suaves) toleran el estiramiento; el detalle figurativo no.
- Pista: usar `preserveAspectRatio="xMidYMax slice"` (escala uniforme, anclada abajo, recortando los lados) para que las formas conserven proporción. Hacerlo RESPONSIVE: `none` en desktop (donde el ancho enorme disimula el estiramiento) y `slice` en móvil — togglear el atributo con `matchMedia('(max-width: 767px)')` en un `useEffect` (el atributo SVG no se puede cambiar por media query CSS). Bajar también la altura de la franja en móvil ayuda a mostrar una porción más ancha del `slice`.
- Confianza: confirmado (esta sesión — Metrics/Ridge)
- ⚠ Validar contra código actual.

---

### [layout] El resaltado de selección de texto sale azul (UA) y rompe la paleta — definir `::selection` global con hex literal

- Contexto: Al seleccionar texto en el sitio, el fondo es el azul estándar del navegador, ajeno a la paleta cálida.
- Causa probable: sin una regla `::selection` de autor, el navegador usa su color de sistema. Además, usar `var(--color-*)` dentro de `::selection` es arriesgado: si la variable no resuelve en ese contexto, la declaración se invalida y vuelve al azul por defecto (síntoma: "no veo el cambio").
- Pista: definir `::selection` (y `::-moz-selection` como bloques SEPARADOS — un selector combinado inválido tumba toda la regla) en `globals.css` con valores HEX literales, no `var()`. Color de fondo de la paleta + texto legible sobre fondos claros y oscuros (en este proyecto: naranja `#fea94f` + texto `#1a1a1a`). Si tras editar `globals.css` "no se ve", sospechar caché de Turbopack → hard refresh / reiniciar dev.
- Confianza: confirmado (esta sesión — globals.css)
- ⚠ Validar contra código actual.

---

### [layout] `object-position` con un solo valor porcentual — solo mueve en horizontal, no en vertical

- Contexto: Imagen con `object-fit: cover` dentro de un contenedor; se quiere ajustar el punto de enfoque verticalmente pasando un porcentaje al prop `objPos`.
- Causa probable: En CSS, `object-position` con un solo valor porcentual (ej. `"80%"`) se interpreta como posición HORIZONTAL; el eje vertical queda en `50%` (center) por defecto. Los keywords single (`top`, `center`, `bottom`) SÍ aplican en vertical. Los porcentajes solos NO.
- Pista: Usar siempre dos valores para control preciso: `"center 75%"` (horizontal center + vertical 75%) o `"50% 75%"`. Si al iterar porcentajes la imagen "no cambia visualmente", sospechar este bug antes de reiniciar el servidor.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [layout] `next/image` no recupera detalle de un raster pequeño — logo/asset borroso al mostrarlo a gran escala

- Contexto: Mostrar un asset de marca (logo `.webp`) a gran tamaño (footer, hero) con `next/image`. El archivo fuente es de baja resolución intrínseca (en este proyecto, los logos de `/public/logos` son 256×81 px).
- Causa probable: `next/image` sirve y, si hace falta, REDUCE el origen; no inventa detalle. Si el tamaño en pantalla (×DPR en retina) supera la resolución intrínseca, el navegador lo upscalea y se ve borroso. Subir `quality` no ayuda (el problema es resolución, no compresión).
- Pista: Validar la resolución intrínseca del asset antes de mostrarlo grande (`identify` / Pillow; el nombre de archivo no dice la resolución). Soluciones por orden de preferencia: (1) usar el SVG / vector original; (2) si no hay vector, generar una versión upscaleada con buen resampler (Lanczos) + leve unsharp y apuntar `next/image` a ESA (mejora frente al upscaling nativo del navegador, pero no es mágico); (3) limitar el tamaño máximo de display a ~resolución_intrínseca / DPR.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [layout] `next/image` con `fill + object-cover` recorta imágenes de proporción variable

- Contexto: Panel expandible (acordeón) o galería donde las imágenes tienen proporciones distintas (no todas 16:9).
- Causa: Usar `fill` dentro de un contenedor con `aspect-video` fuerza todas las imágenes a 16:9 y `object-cover` recorta lo que sobra. Las imágenes que no son exactamente 16:9 pierden contenido.
- Pista: Para mostrar imágenes completas sin recorte, usar `width={0} height={0}` con `sizes` y dejar que el navegador calcule la altura natural:
  ```tsx
  <Image
    src={src}
    alt={alt}
    width={0}
    height={0}
    sizes="(min-width: 768px) 55vw, 90vw"
    className="w-full rounded-xl"
    style={{ height: "auto" }}
  />
  ```
  No usar `fill`, no usar `aspect-video`, no usar `object-cover`. El contenedor NO necesita `position: relative` ni altura fija.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [layout] Tratamiento de color de una foto (calidez / "deslavado") — CSS ajustable, no procesado horneado; previsualizar con `sharp`

- Contexto: Integrar una foto con dominante de color que choca con la paleta (ej. escena de charla con mucho azul/morado) al tono cálido del sitio. Tentación de "arreglarla" re-encodeándola con `sharp` (`modulate`/`linear`/`sharpen`/`tint`).
- Causa probable: Hornear el ajuste en el archivo es lento de iterar (cada cambio = re-encode + bump `-vN` por la caché de `next/image`), irreversible, y fácil de pasarse (`.tint()` desatura todo a sepia). El cliente casi siempre pide "un pelín más/menos", y cada vuelta genera un asset nuevo.
- Pista:
  1. **Ajuste vía CSS, no vía píxel.** Calidez = capa overlay (`<span absolute inset-0>` con gradiente naranja en `mixBlendMode:"multiply"`, igual que las cards de Servicios). "Deslavado"/lavado = `filter: saturate(<1) brightness(>1) contrast(<1)` sobre el `<Image>` + velo cream `rgba(248,237,221,~0.1)` encima. Todo se afina cambiando números, sin tocar el asset. `multiply` **oscurece y satura** (suma intensidad); para deslavar se necesita lo contrario (desaturar + subir sombras).
  2. **Al archivo, solo recorte para peso.** Si la fuente es landscape y el contenedor es `object-cover` en otra proporción, recortar a la región visible: `cropW = H * (ratioContenedor)` centrado (ej. 4:5 → `cropW=H*0.8`). Bajó 828KB → 45KB sin cambiar lo que se ve. (Recuerda: de una fuente ya muy comprimida no se recupera nitidez — ver entrada de raster borroso arriba.)
  3. **Previsualizar sin navegador.** Como el proyecto no usa Playwright y la validación es humana, simular el stack CSS con `sharp` antes de codear: `sharp(base).modulate({saturation,brightness}).linear(a,b)` para el `filter`, y `.composite([{input: svgGradiente, blend:'multiply'|'screen'}, {input: svgCream, blend:'over'}])` para los overlays — **incluyendo las capas que el hero ya aplica** (ej. la terracota multiply compartida), si no el preview engaña. Escribir los candidatos al scratchpad y mirarlos. Clava el resultado en ~1 intento.
- Gotcha de shell: en bash `VAR=val && node ...` NO exporta `VAR` al proceso hijo (queda como variable de shell, no de entorno) → los archivos salieron en el cwd en vez del scratchpad. Usar `export VAR=...` o `VAR=val node ...` (sin `&&`).
- Confianza: confirmado (tratamiento de color de un retrato vía CSS)
- ⚠ Validar contra código actual.

---

### [layout] Glow radial detrás de un sujeto transparente dibuja un "cuadrado" — el gradiente se recorta al rectángulo del contenedor

- Contexto: Imagen PNG/WebP con fondo transparente (silueta de un personaje, logo) sobre un fondo cálido, con un `<span absolute inset-0>` detrás que pinta un `radial-gradient` a modo de glow/halo para asentar la figura. Síntoma: se ve un rectángulo tenue (escalón de color) alrededor de la imagen, en desktop y móvil, aunque el asset es genuinamente transparente.
- Causa probable: el glow NO viene del archivo. El `span` ocupa el bounding box rectangular del contenedor (`inset-0`) y el `radial-gradient`, si su radio es grande y su última parada de color no llega a `transparent` ANTES del borde del box, sigue pintando color al tocar el borde → corte abrupto glow→fondo = un escalón rectangular visible. El radio del gradiente es elíptico/circular pero el clip es rectangular.
- Pista: antes de cazar el "cuadrado" en el archivo o en caché (`next/image`, Vercel raw, git), descartar primero las **capas de respaldo CSS** (glow radial, `box-shadow`, fondo de la card) recortadas al rect del contenedor — es la causa más rápida cuando el asset ya se confirmó transparente. Soluciones: (1) si la figura recortada basta, quitar el glow y dejar solo `drop-shadow` (sigue la silueta, no el rect); (2) si se quiere el glow, asegurar que el gradiente cierre en `transparent` bien dentro del box (parada `transparent` a ≤~60% del radio) y/o aplicar `mask-image` radial a la capa para que su propio borde también se desvanezca.
- Gotcha de método: un PNG transparente verificado en origen + commit + raw + `next/image` optimizado, todos transparentes, es señal de que el artefacto es CSS, no de imagen — no seguir re-descargando el asset.
- Variante de hover: el mismo escalón rectangular aparece en un "brillo" de hover (glow radial que aparece al pasar el cursor sobre una columna/card) — el usuario lo describió como "el brillo es un cuadrado, en su borde izquierdo es una línea recta". Misma causa, misma solución (cerrar en `transparent` dentro del box o `mask-image` radial).
- Confianza: confirmado (apareció DOS veces: hover de la sección Métricas, y página 404 — glow detrás del Rey el proyecto, commit `1dbb76b`)
- ⚠ Validar contra código actual.

---

### [layout] Esquinas redondeadas "parpadean" a cuadradas tras unos segundos de hover — `box-shadow` animado promueve/demota la capa GPU y pierde el clip de `border-radius`

- Contexto: Card/tarjeta con `overflow-hidden` + `rounded-[…]` (las esquinas redondeadas recortan una imagen `fill` interior) que al hover anima una **sombra externa grande y difusa** vía `transition-shadow` + `hover:shadow-[0_28px_60px_…]`. Síntoma: al dejar el cursor encima **unos segundos**, las esquinas redondeadas se vuelven cuadradas un instante y vuelven a redondearse (flash). Aparecía de forma intermitente — parecía afectar a unas cards sí y a otras no, aunque el `className` es idéntico para todas (templado), porque es un repaint ocioso que no dispara igual cada vez (no es una diferencia real por card).
- Causa probable: el navegador **compone la imagen interior** (`next/image fill`) en su propia capa GPU cuando ésta se anima en hover (`transition-[filter]` blur en las cards, `transition-transform` zoom en el prev/next; la `box-shadow` difusa también forzaba capa). El padre tiene el `overflow-hidden + border-radius`, pero al rehacer el raster Chrome **deja de aplicar el recorte redondeado del padre a la capa compositada del hijo** → se ven las esquinas cuadradas un instante y luego se re-aplica el clip. (Timing delator inicial: con la sombra activa el flash llegaba *segundos después* del hover — demota de la capa ociosa, no la transición de 500ms.)
- Pista — DOS pasos (el primero NO basta solo):
  1. Quitar la **sombra externa de hover** (`hover:shadow-[…]`) — ayuda y suele ser lo deseado (sombra externa = peso visual no querido), pero **NO elimina el flash por sí sola** cuando la imagen interior sigue animándose (blur/zoom).
  2. **Promover el contenedor padre** (el que tiene `overflow-hidden + rounded`) a una capa GPU estable con `will-change: transform`, así su recorte `border-radius` se mantiene aunque el hijo se componga aparte. Usar `will-change: transform` **inline por `style`** (no por clase Tailwind ni `transform: translateZ(0)`): GSAP anima el `transform` del card en el reveal y lo deja en 2D al terminar (demota la capa), por lo que una clase/transform se pierde; `will-change` es una propiedad distinta que GSAP no toca y mantiene la promoción permanente.
- Mantener intactos `ring`/`focus-visible:ring` y el resto de efectos (zoom/blur de la imagen, flecha). NO confundir con el "glow radial dibuja un cuadrado" de arriba (esa es una capa CSS recortada al rect; esta es el clip del propio `border-radius` que se pierde en el repaint del hijo compositado).
- Aplicado en: cards de `/proyectos` (`Proyectos.tsx`) y `PrevNextCard` (`PrevNext.tsx`, usada en el prev/next del detalle de Proyectos y de los artículos de Blog) — se quitó `hover:shadow-[…]` **y** se añadió `style={{ willChange: "transform" }}` en ambas.
- Confianza: confirmado (esta sesión — cards `/proyectos` + prev/next de Proyectos/Blog)
- ⚠ Validar contra código actual.

---

### [layout] Un icono de librería no sobrevive a la escala display: a 20× se lee como un boceto a lápiz

- Contexto: se quiere una marca de agua / elemento decorativo grande en una card o sección, y el reflejo es tomar el icono que ya representa a ese contenido (Lucide, Heroicons, Feather) y subirlo de 24px a 300-500px bajando el `strokeWidth`. El resultado se ve "dibujado a mano", con trazos que parecen montarse unos sobre otros.
- Causa probable: un icono de interfaz está dibujado sobre una grilla de 24px con las uniones calculadas para un trazo de 1.5-2px. La forma es correcta a tamaño de interfaz, no a tamaño de ilustración. Al escalar, **todo escala con ella**: cada `stroke-linejoin`, cada terminación redondeada y cada solape interno (un cordón que cruza una tarjeta, las hélices de un dron) pasa de ser 1px invisible a una junta de varios píxeles perfectamente visible. Bajar el `strokeWidth` adelgaza la línea pero **no elimina las uniones**, que es lo que delata el origen. El diagnóstico del usuario suele ser estético ("es feo", "parece a lápiz") y la causa es geométrica.
- Pista: a escala display no se usa un icono de librería, se usa un **signo construido**: anillos concéntricos de una primitiva pura (círculo, hexágono, rombo), formas cerradas que **no se tocan entre sí**. Sin uniones no hay nada que delate la ampliación. Un generador de pocas líneas cubre las variantes (`polygon` con N lados y rotación inicial, o `circle`) y da un signo distinto por card manteniendo un solo sistema. El `strokeWidth` va en unidades del `viewBox` y se compensa a mano por tamaño, para que el grosor **real** sea parejo entre la pieza grande y las chicas. Corolario: los iconos de librería siguen siendo la ley a tamaño de interfaz (`composicion.md` §6); esto solo aplica cuando el icono deja de ser icono y pasa a ser ilustración.
- Confianza: confirmado (`blockchain-lab-uai`, marca de agua de las cards del bento de Proyectos, 2026-07-25)
- ⚠ Validar contra código actual.

---

### [layout] Capa de glow con `mask-image: none` como estado inicial — en móvil se ve entera y delata los cortes del patrón

- Contexto: El clásico "grilla que se ilumina bajo el cursor": una capa base tenue siempre visible y encima una segunda capa más contrastada (líneas de color, trama fina) que un `mousemove` recorta con una máscara radial. La capa de arriba se escribe con `maskImage: 'none'` y la máscara real solo aparece en el primer movimiento del cursor.
- Causa probable: `none` significa *sin recorte*, o sea **visible entera**. En un dispositivo táctil no hay `mousemove` que la recorte nunca, así que la capa decorativa queda encendida al 100% durante toda la visita. Y como este tipo de capas se monta **por sección** —el patrón arranca en el borde superior de cada una—, las filas cortadas en cada unión se vuelven evidentes: bandas más bajas que el resto, cuadrados que se leen como rectángulos. En desktop nadie lo ve porque el cursor se mueve en el primer segundo y deja la capa recortada a un círculo.
- Pista: el estado inicial es una máscara vacía (`linear-gradient(transparent, transparent)`, con su `WebkitMaskImage`), nunca `none`. Aparte, un tap en móvil emite un `mousemove` sintético: el handler abre con `if (!window.matchMedia('(pointer: fine)').matches) return`, o el glow se enciende en el punto tocado y se queda ahí. Si el patrón tiene que ser continuo entre secciones, el tamaño de celda no basta: hay que anclar `background-position` al documento (offset del elemento módulo la celda) o mover la grilla a una única capa de página.
- Confianza: confirmado (blockchain-lab-uai, jul-2026)
- ⚠ Validar contra código actual.

---

### [layout] `next/image` sin `sizes` sirve el viewport entero — y bajo un condicional de scroll, lo re-decodifica en cada cruce

- Contexto: un `<Image>` de `next/image` que se pinta pequeño y fijo —el logo de un navbar, un avatar, un icono de marca—, declarado con `width`/`height` intrínsecos del archivo original y una clase que lo reduce (`h-6 w-auto`). Se asume que usar `next/image` ya optimizó la imagen, porque esa es la ley del área. El agravante llega cuando ese `<Image>` vive bajo un condicional que depende del scroll: `{tone === "light" && <Image … />}`, el patrón del navbar que cambia de tono según la sección (ver la pista de `data-nav` más arriba en este mismo módulo).
- Causa probable: **sin `sizes`, Next asume que la imagen ocupa el ancho del viewport** y preselecciona `w=1920` (y `w=3840` en pantallas 2×). El elemento se pinta a 37×24 CSS px y el navegador decodifica **2,4 megapíxeles** para dibujarlo. Con `priority` encima, además reserva la ruta crítica para esos bytes. Nada de esto avisa: el build sale verde, la imagen se ve bien, y `next/image` está usado exactamente como la ley pide. El segundo golpe es el que no se busca — al montarse y desmontarse con el estado de scroll, esa decodificación **no ocurre una vez al cargar sino en cada cruce**, con la rueda girando; una landing que alterna claro/oscuro ocho veces paga cinco decodificaciones por bajada y otras cinco al subir.
- Pista: **todo `<Image>` que se pinte más chico que el viewport declara `sizes`**, y el valor es el ancho renderizado real, no una fracción de pantalla (`sizes="40px"` para un logo de 24 px de alto). Y si además vive bajo un condicional ligado al scroll, se audita como coste **de scroll, no de carga**: la pregunta no es *«¿cuánto pesa al abrir?»* sino *«¿cuántas veces se remonta mientras alguien baja?»*. Verificación barata y objetiva, sin abrir el navegador: `grep 'rel="preload" as="image"' .next/server/app/index.html` y mirar el `w=` que salió — si dice `w=1920` para un logo, falta `sizes`. Corolario: `priority` sin `sizes` es peor que no poner `priority`, porque prioriza precisamente los bytes que sobran.
- Confianza: confirmado (`numerologia`, NavBar, ago-2026 — medido antes/después: `w=1920` / 27 KB → `w=48` / 1 KB)
- Frontera de validez: aplica a imágenes de tamaño **fijo y conocido**. Una imagen que sí ocupa el ancho del viewport (un hero a sangre) no necesita `sizes` y el default es correcto; las que usan `fill` ya lo declaran por obligación del API.
- ⚠ Validar contra código actual.
