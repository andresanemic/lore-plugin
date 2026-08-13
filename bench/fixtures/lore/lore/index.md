# lore/index.md — Índice de patrones del área `desarrollo-web`

Una línea por patrón. Formato: `sistema · síntoma · confianza · archivo`
Los proyectos del área heredan estos módulos por ruta relativa (`../../../lore/<archivo>`).

---

## Fundamentos

- Identidad — estándar de web premium + qué somos (incluye Variante SaaS) · [identidad.md](identidad.md)
- Principios — leyes invariantes de construcción (incluye Variante SaaS) · [principios.md](principios.md)
- Calidad — sitio que alterna superficies: el CTA primario y el focus ring son un **par** de tokens que invierte, no uno; el contraste se calcula, no se estima · confirmado · [principios.md](principios.md)
- Método — el muestrario de estilos se envía en **Fase 1**, antes de investigar: su selección filtra el benchmark y siembra el brandkit; Fase 2 valida, no re-elige · confirmado · [principios.md](principios.md)
- Método — **la Fase 2 se le enseña al cliente en web y su envoltorio es neutro**: los artefactos internos son la cocina; si el cliente aprueba un documento interno no aprobó la dirección, aprobó que confía en ti. La pared de la galería es blanca (skill `entrega-cliente`) · confirmado · [principios.md](principios.md)
- Método — **la respuesta del cliente vuelve como texto y se archiva en el repo**: veredicto copiable, sin backend. Una aprobación que no se puede citar no existe · confirmado · [principios.md](principios.md)
- Método — **`FASES.md` es estado y envejece contra el trabajo**: la Mini-Fase se relee contra los artefactos que dice tocar **antes** de ejecutarla, no después. Pide lo ya hecho y —la cara peligrosa— no pide lo que cambió. El ítem que cita una sección concreta (*«los tokens que el brandkit dejó pendientes (§6.3)»*) es un puntero a una versión que ya se movió: ábrela antes de trabajar. Versionar un derivado (brandkit v1→v2) incluye su checklist en el blast radius · confirmado · [principios.md](principios.md)
- Método — **el template no se prueba solo**: nadie ejecuta `_starter/` como proyecto, así que sus fallos aparecen en el primer proyecto que lo estrena, se arreglan **ahí**, y el template se bifurca. **Cerrar una Fase incluye preguntar qué de lo aprendido era del template.** Corolario: **un template no ejecuta sus propias puertas** — córrelas contra el scaffold (el del área fallaba su propio pre-flight en 4 sitios, `Inter` incluida, porque el comando que lo detecta tenía un `../` de más) · confirmado · [principios.md](principios.md)
- Método — **un fix que entra al `_starter` no se propaga solo a los proyectos vivos que lo necesitaban ayer**: el molde se arregla hacia adelante, no hacia atrás. En `numerologia` el paso «Releer» del ritual se escribió en el `_starter` tras romper 2.1.5 y 2.2, y el mismo patrón volvió a romper 2.3/2.4/2.5.2/2.6 esa misma tarde porque el `FASES.md` ya existía y nunca recibió el fix. Cerrar la sesión que escribe un fix de método incluye preguntar qué proyecto abierto lo necesita hoy · confirmado · [principios.md](principios.md)
- Método — **un documento contradicho no se reescribe: gana un apéndice fechado**. El método vuelve sobre sus pasos dos veces por proyecto y las dos son estructurales (la visión desautoriza al benchmark; el veredicto del cliente desautoriza a la visión). Reescribir el documento auditado desde su consecuencia hace **tautológica** la auditoría de 2.5. Tres niveles: fuente primaria (no se toca) · documento contra el que se audita (apéndice) · derivado que cita sus fuentes (reescritura con changelog). El apéndice conserva **quién decidió qué** · confirmado · [principios.md](principios.md)
- Accesibilidad — **piso no negociable**: focus visible siempre, target táctil ≥44×44px, nada depende del hover, el color nunca es el único significado, CLS = 0 · confirmado · [principios.md](principios.md)
- Motion — **tokens de tiempo, no números al azar**: 150-300ms micro, easing con dirección (out al entrar / in al salir), la salida más rápida que la entrada, stagger 30-50ms, solo `transform`/`opacity` · confirmado · [principios.md](principios.md)
- Identidad — **estética de IA por defecto** (Inter/Roboto, gradiente violeta sobre blanco, emoji como icono, tres cards centradas) = señal de que nadie decidió la dirección · confirmado · [identidad.md](identidad.md)
- Identidad — **una sola dirección estética, comprometida**; y la complejidad del código la sigue (maximalista pide efectos; refinado pide restricción) · confirmado · [identidad.md](identidad.md)
- Tiers — **la puerta dura**: estado de servidor (cuenta, pago, contenido protegido) = Tier 3 sin importar cuántas páginas tenga. `numerologia` es 1 ruta y es el tier más caro: el precio sale de la clase de riesgo, no del conteo de páginas · confirmado · [tiers.md](tiers.md)
- Tiers — **el tier limita el alcance, jamás el nivel**: un Tier 1 de $250 cumple el estándar entero. Barato = menos superficie, nunca peor oficio · confirmado · [tiers.md](tiers.md)
- Tiers — **el desborde se nombra cuando aparece, no cuando duele**: precio de lista en el momento del pedido + registro en `FASES.md`. Y lo que no es web (brochure, merch, isotipos) está fuera del tier · confirmado · [tiers.md](tiers.md)
- Identidad — **la paleta "premium" por defecto** (crema/beige + latón + espresso; nuestro Warm Atelier) es el reflejo automático de la IA: si no la eligió el cliente en el muestrario, la eligió el reflejo, y la marca se vuelve invisible · confirmado · [identidad.md](identidad.md)
- Identidad — **disciplina del serif**: "marca creativa = serif" es el reflejo más delator. El serif entra solo si el encargo lo nombra o se puede argumentar; énfasis dentro de un titular = cursiva/negrita de la misma familia, nunca mezclar familias · confirmado · [identidad.md](identidad.md)

---

## investigacion

- `investigacion` · **Workflow de Fase 1** (8 pasos): kickoff → entrevista → muestrario → referencias → benchmark → brandkit → `que-es-<cliente>.txt` → wireframe + Golden Paths · confirmado · [investigacion.md](investigacion.md)
- `investigacion` · La **selección del muestrario se transcribe al repo** (`seleccion-<cliente>/`: hex, etiqueta de rubro, token producido, swatches descartados con su porqué, y literal la frase de mezcla del cliente) **antes** de escribir el brandkit. Una captura en Miro, un PDF o un WhatsApp **no son archivo**: el brandkit se escribe a ciegas y la Fase 2 hereda el sesgo · confirmado · [investigacion.md](investigacion.md)
- `investigacion` · La **etiqueta de rubro** de una paleta del muestrario es un **descarte declarado** (*Deep Azure → SaaS B2B · Sorbet Dawn → spa · Mystic Arcana → tarot*): el cliente la elige **a pesar** de su rubro. La marca vive donde ninguna de las paletas elegidas se reconoce a sí misma · confirmado · [investigacion.md](investigacion.md)
- `investigacion` · **Cada decisión de dirección de diseño debe poder citar su fuente** (selección o entrevista). Una decisión que no puede citarse es del constructor, no del cliente — indefendible ante él aunque sea correcta · confirmado · [investigacion.md](investigacion.md)
- `investigacion` · Plantilla de **brandkit**: 6 secciones; la §6 de validación (tokens fantasma, contraste, CTA huérfano, regla de proporción) es la que atrapa los errores · confirmado · [investigacion.md](investigacion.md)
- `investigacion` · Plantilla de **benchmark**: tabla de 7 columnas + síntesis; cada referencia aporta una cosa distinta (sistema gráfico / esqueleto / interacción / composición), 4 bastan · confirmado · [investigacion.md](investigacion.md)
- `investigacion` · Plantilla de **wireframe**: átomo de 4 campos fijos (Layout · Contenido · CTAs · Jerarquía) en 3 documentos (landing+internas · dashboard · flujos) · confirmado · [investigacion.md](investigacion.md)
- `investigacion` · CTAs de dos velocidades: una acción gratuita de bajo compromiso + una de conversión, nunca en la misma jerarquía visual · confirmado · [investigacion.md](investigacion.md)
- `investigacion` · Una decisión de negocio pendiente no bloquea el diseño: documentar el flujo, marcar la casilla vacía en `FASES.md` y seguir · confirmado · [investigacion.md](investigacion.md)

---

## moodboard

- `moodboard` · **Workflow de Fase 2.1** (4 etapas): visión de diseñador (4-5 direcciones) → búsqueda + descarga por dirección → explicación → resumen de huecos. El moodboard **abre** la Fase 2: la dirección elegida es la que afina la paleta definitiva · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · La visión de diseñador **es** la Etapa 1; no hay una sub-fase posterior que la reescriba · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · Imágenes de moodboard: **nunca recomprimir, convertir ni redimensionar** — se juzga textura y grano. La regla de `public/` + bump `-vN` no aplica: no se sirven al navegador · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · Esa ley **protege el máster, no toda copia que salga de él**: la entrega web al cliente sirve **derivadas** (1600 px, JPEG q82), nunca los originales — 69,9 MB de tablero se sirven en 3,6 MB, y una entrega que no carga no se mira. Dos trampas de plataforma: en Windows **no hay ImageMagick** (el `convert` del `PATH` es el de FAT→NTFS) y **`npx -p sharp node …` no sirve** (npx no expone su instalación al proceso hijo) — `sharp` va en un caché del sistema, fuera de todo repo · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · Licencia libre (Unsplash/Pexels/Pixabay/Kaboompics/StockSnap) alcanza para el tablero interno; **pasar una imagen a producción es otra decisión** con su propia verificación · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · Link roto o sin descarga directa del original → saltarlo y buscar otro; nunca dejar el hueco. Sin API keys: WebSearch + WebFetch + `curl` · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · Las direcciones conceptuales se nombran con los tokens del brandkit inicial; si no, es el moodboard de otro proyecto · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · El `alt text` de los bancos de imágenes miente (3 de 8 en el primer moodboard real): es ciego a la clave tonal, la luz y la temperatura del color — mirar cada imagen antes de inventariarla y nombrar el archivo por lo que muestra; la mal etiquetada suele ir a otra carpeta, no a la basura · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · **El elemento central del sitio no puede faltar** (el número en numerología, el producto en una tienda): tiene que estar decidido en la visión y tener carpeta en el tablero. Es lo que el sesgo se salta —por ser el más cargado de cliché— y **lo que no se decide lo decide el default, que es el cliché** · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · **En producción, si ningún banco convence: se genera la imagen y el prompt lo escribe el constructor** — hiperrealista, con cámara/luz/materia/hex del brandkit/imperfección y los tells en negativo. Nunca generar a una persona real ni fabricar prueba (testimonios, resultados, documentos). Se mira antes de usarla y se guarda el prompt · conjecture · [moodboard.md](moodboard.md)
- `moodboard` · Un banco que devuelve **403 no está caído: filtra por User-Agent** (Kaboompics rechaza el UA de WebFetch; con `curl` + UA de navegador completo responde 200). La regla "saltar el link roto" es para una foto, no para un banco entero — descartar un banco es descartar su sesgo · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · **El cliente no sabe qué es un moodboard**: sin decírselo cree que está viendo el sitio (*¿dónde está mi logo? ¿esa foto va en la portada?*) y juzga la cosa equivocada. La entrega **abre explicándose** con una sección fija —qué es · las imágenes son referencias, no material del sitio · qué NO es— que es **del envoltorio, no del guion**, y no se reescribe por proyecto · confirmado · [moodboard.md](moodboard.md)
- `moodboard` · **El envoltorio y el layout de la entrega son ley del área**, y viven una sola vez en `_starter/entrega/index.html`: «Qué estás mirando» → la cita desnuda → los mundos (veredicto **por mundo**) → qué sigue → **sin pie de página**. Un envoltorio retocado por proyecto son dos que divergen, y el cliente acaba viendo el viejo · confirmado · [moodboard.md](moodboard.md)

---

## animation

- `animation` · HTML visible antes del estado inicial GSAP (FOUC) · confirmado · [animation.md](animation.md)
- `animation` · Marquee CSS con salto visual al reiniciar el loop · confirmado · [animation.md](animation.md)
- `animation` · Barra de progreso con `scaleX` en lugar de `width` — cero reflow · confirmado · [animation.md](animation.md)
- `animation` · Pin GSAP termina antes del último paso del timeline · confirmado · [animation.md](animation.md)
- `animation` · Columnas de scroll infinito verticales con `@keyframes` CSS · confirmado · [animation.md](animation.md)
- `animation` · Salto al inicio en pin scrubbed — señal de config errónea del ScrollTrigger · confirmado · [animation.md](animation.md)
- `animation` · `skipRef` + `onComplete` para bloquear clicks durante animación pinneada · confirmado · [animation.md](animation.md)
- `animation` · Offset vertical al salir del pin por falta de `anticipatePin: 1` · confirmado · [animation.md](animation.md)
- `animation` · Toggle de clase CSS vs GSAP para transiciones de opacidad simples · confirmado · [animation.md](animation.md)
- `animation` · Flash blanco al entrar en sección pinneada con fondo oscuro · confirmado · [animation.md](animation.md)
- `animation` · Clip + blur reveal para headings: `translateY(108%) → 0` + `blur(12px) → 0` · confirmado · [animation.md](animation.md)
- `animation` · Texto scramble / decodificación letra a letra con `setInterval` · confirmado · [animation.md](animation.md)
- `animation` · `overwrite: true` previene tweens apilados en clicks rápidos consecutivos · confirmado · [animation.md](animation.md)
- `animation` · `setState` durante tween GSAP provoca re-render con salto visual · confirmado · [animation.md](animation.md)
- `animation` · `stagger` nativo GSAP vs `delay` manual para secuencias de entrada · confirmado · [animation.md](animation.md)
- `animation` · `busyRef` + `queueRef` para encolar clics durante animación sin perderlos · confirmado · [animation.md](animation.md)
- `animation` · `gsap.fromTo` obligatorio cuando el estado inicial está en `style` inline · confirmado · [animation.md](animation.md)
- `animation` · GSAP sobreescribe `display:none` — necesita guard de viewport + CSS `!important` · confirmado · [animation.md](animation.md)
- `animation` · Pin GSAP en móvil debe desactivarse completamente con guard `isMobile` · confirmado · [animation.md](animation.md)
- `animation` · Triggers `top 88–95%` para que las animaciones disparen en cuanto el elemento asoma · confirmado · [animation.md](animation.md)
- `animation` · GSAP entrance sin bifurcación por ruta → FOUC ~1.4s en páginas no-target; **bifurcar en el `useEffect` no basta** (corre post-paint): el estado inicial que depende de la ruta se decide en el **JSX**, y un componente montado dentro de cada `page.tsx` paga el flash en cada navegación · confirmado · [animation.md](animation.md)
- `animation` · Selectores string GSAP en callbacks async (IO/eventos) no quedan scoped a `gsap.context` → colisión entre secciones con data-attrs compartidos · confirmado · [animation.md](animation.md)
- `animation` · Fallback `setTimeout` de reveal-IO revela la sección fuera de viewport → animación perdida; gatear por `getBoundingClientRect` · confirmado · [animation.md](animation.md)
- `animation` · Máscara palabra-por-palabra (`overflow:hidden` + `translateY(110%)`) recorta el titular al hacer wrap multilínea — usar rise+blur sin clip · confirmado · [animation.md](animation.md)
- `animation` · `translateY(%)` inline → GSAP lo lee como px; resetear con `yPercent`/`y:"0%"` no lo limpia (reveal oculto). Forzar `y:0` en fromTo + `clearProps` en reduced-motion · confirmado · [animation.md](animation.md)
- `animation` · Abrir `overflow` al final del reveal recorta descenders durante la animación (pop) — máscara alta (`pb`) + `margin` negativo en vez de togglear overflow · confirmado · [animation.md](animation.md)
- `animation` · "Sombra fantasma" antes del reveal: `blur()` en el estado inicial asoma por el borde de la máscara — añadir `opacity:0` inicial · confirmado · [animation.md](animation.md)
- `animation` · `next/image` lazy en acordeón/colapsable aparece de golpe (carga async desacoplada de la transición) — `opacity:0` inicial + fade en `onLoad` (Set por id), respeta reduced-motion · confirmado · [animation.md](animation.md)
- `animation` · Slider crossfade con caja que se redimensiona (fotos de orientación mixta): la foto saliente hace zoom/salto al cambiar la activa — dar a cada foto su propio marco por su proporción y cruzar solo por opacidad (no caja compartida) · confirmado · [animation.md](animation.md)
- `animation` · Parpadeo de cards sobre el pliegue solo en dev: doble montaje de StrictMode + `gsap.context`/`revert` re-corre el reveal — marcar nodos con `data-attr` (`dataset.revealed`) que sobrevive al remontaje, sin `revert` · confirmado · [animation.md](animation.md)
- `animation` · Lo que nace en un `.then()` nace FUERA del `gsap.context` de `useGSAP`: selectores sin acotar al scope y, en StrictMode, DOS timelines sobre los mismos nodos (el parpadeo). Resolver nodos con `querySelectorAll`, bandera de vida y cleanup propio · confirmado · [animation.md](animation.md)
- `animation` · `ScrollTrigger.getAll().kill()` como limpieza de un componente apaga los triggers de TODOS: `getAll()` es registro global. Cada uno se lleva lo suyo (`mq.revert()`, o `tl.scrollTrigger`). Si la limpieza nombra `getAll()`, toca algo que no es suyo · confirmado · [animation.md](animation.md)
- `animation` · **`background-attachment: fixed` en capas decorativas de sección** = repintado por frame de scroll + scroll fuera del compositor. Es invisible en revisión (una línea de estilo) y se multiplica por cada sección que monta el componente compartido · confirmado · [animation.md](animation.md)
- `animation` · **Escribir estilos directo en un handler de `mousemove` es escribir a 120 Hz**: batchear con un rAF con guarda de frame y hacer las lecturas de layout (`getBoundingClientRect`) dentro del callback, no en el handler · confirmado · [animation.md](animation.md)
- `animation` · **Portar un arreglo de performance a un sitio hermano**: el costo es del lenguaje visual, no del sitio. Grepear los cinco patrones en el destino ANTES de auditar — la pregunta es «¿monta este sitio las capas que causaron el costo?», no «¿es del mismo área?». "Ya cumple, no hay commit" es resultado completo · confirmado · [animation.md](animation.md)

## testing

- `testing` · **Puerta de pre-flight**: `node tools/preflight.mjs <ruta>` verifica mecánicamente las leyes greppables (raya, listener de scroll, `h-screen`, `gsap.from`, `outline` sin reemplazo, emoji, fuente de IA). Lo que exige criterio queda como checklist humana en `FASES.md`. Un Lore sin puerta se evapora en la tercera sesión larga · confirmado · [testing.md](testing.md)
- `testing` · El filtro de ruido **es** lo que hace usable la puerta: sin excluir comentarios, la regla de la raya daba 72 hallazgos en `enma` (la mayoría en `// comentarios`); excluyéndolos da 10, y las 10 son copy visible real · confirmado · [testing.md](testing.md)
- `testing` · **Un check greppable puede coincidir con su propio comentario**: si el código nombra lo prohibido para declarar por qué está ausente (`// WONK muerto, fuera del import`), el check dispara sobre su propia documentación — pasó 3 veces en `numerologia` con el mismo check. El caso negativo del `--selftest` tiene que incluir ese comentario, no solo código correcto · confirmado · [testing.md](testing.md)
- `testing` · MutationObserver + gap discriminator para testear `gsap.set` vs `gsap.fromTo` sin depender de timing · conjetura · [testing.md](testing.md)
- `testing` · Presencia de elementos en DOM: verificar en browser real, no por code-reading de imports — un Footer con `id="X"` puede existir en páginas que no incluyen el componente específico · confirmado · [testing.md](testing.md)
- `testing` · `waitUntil:'load'` no captura comportamiento pre-load (auto-scroll nativo, pin-spacer GSAP) — para observar estados transitorios usar `addInitScript` con polling de `scrollY` desde el primer render · conjetura · [testing.md](testing.md)
- `testing` · **El dev server de Next reenvía `console.warn`/`console.error` del browser al terminal** (no `console.log`): es el canal de diagnóstico del área sin Playwright — el usuario solo hace el flujo y dice "listo" · confirmado · [testing.md](testing.md)
- `testing` · **Ante un bug de navegación, instrumentar la secuencia entera** (`click` en capture + `popstate` + `hashchange` + `pageshow` + efecto de ruta + tick de `scrollY`) **antes** de proponer una fix: deducir el flujo es una hipótesis, y tres seguidas fallaron en un solo incidente · confirmado · [testing.md](testing.md)
- `testing` · **Un grep prueba ausencia de un patrón, nunca velocidad**: ni el pre-flight verde ni el build (que da bytes, no tiempo) autorizan a decir "carga rápido". Sin Playwright el número lo produce el humano con Lighthouse — mientras no exista, se dice "su velocidad percibida no está medida", sin que la pregunten · confirmado · [testing.md](testing.md)

## scroll

- `scroll` · Lenis + ScrollTrigger desincronizados — sync via GSAP ticker es obligatorio · confirmado · [scroll.md](scroll.md)
- `scroll` · `lenis.scrollTo` fuera del Provider — acceder via `useLenis()` hook · confirmado · [scroll.md](scroll.md)
- `scroll` · `100vh` desborda en iOS Safari — usar `100svh` en secciones full-height · confirmado · [scroll.md](scroll.md)
- `scroll` · LenisProvider intercepta anchors y lanza scroll en paralelo al handler del componente · confirmado · [scroll.md](scroll.md)
- `scroll` · Navegación SPA con Lenis — scroll position no se resetea entre páginas · confirmado · [scroll.md](scroll.md)
- `scroll` · Guard `isFirstPath` en `useEffect([pathname])` sin discriminar hash — FPL a `/#seccion` queda sin corrección de posición · conjetura · [scroll.md](scroll.md)
- `scroll` · **El botón Atrás no ejecuta NINGÚN `useEffect`**: la corrección colgada de `useEffect([pathname])` es código muerto — verificar que el efecto corre antes de escribirla; lo que sí corre son los listeners de `window` · confirmado · [scroll.md](scroll.md)
- `scroll` · `popstate` **también dispara al clickear un ancla in-page** (~1ms tras el click): no distingue el Atrás, y usarlo como detector rompe la navegación del navbar · confirmado · [scroll.md](scroll.md)
- `scroll` · **Escribir el hash en la URL envenena el Atrás** si hay pin-spacers de GSAP: el scroll al ancla corre antes de instalarlos, el documento es un viewport más corto y se aterriza en el footer. Salida barata: interceptar los clicks y hacer scroll **sin escribir el hash** (una sola entrada de historial) · confirmado · [scroll.md](scroll.md)
- `scroll` · `scrollRestoration = 'manual'` es una **ley de Lenis, no del sitio**: sobrevive a su retirada y anula el Back. Al quitar una librería de scroll, auditar qué defensas caducan con ella · confirmado · [scroll.md](scroll.md)
- `scroll` · `behavior: 'auto'` **hereda el `scroll-behavior: smooth` del CSS** (el salto seco deja de serlo): `'instant'` explícito para saltar; `scrollIntoView()` **sin argumentos** para heredar el CSS y respetar `prefers-reduced-motion` gratis · confirmado · [scroll.md](scroll.md)
- `scroll` · **No tener `scroll-behavior: smooth` no se lee como «falta una animación» sino como «el sitio va a saltos»**: llega reportado con vocabulario de rendimiento y manda a auditar pintura, donde no hay nada. Y el salto seco **esconde** la falta de `scroll-margin-top` (el ancla aterriza bajo el header fijo). Las dos reglas van juntas o ninguna sirve; preguntar **qué acto** produce la sensación antes de medir · confirmado · [scroll.md](scroll.md)

## layout

- `layout` · `backgroundAttachment: fixed` alinea grillas continuas entre secciones · confirmado · [layout.md](layout.md)
- `layout` · Glow de cursor: dos capas absolutas + `mask-image` radial evitan repaints · confirmado · [layout.md](layout.md)
- `layout` · `line-height: 1` recorta ascenders/descenders en fuentes display con `overflow:hidden` · confirmado · [layout.md](layout.md)
- `layout` · `overflow:hidden` en `<section>` recorta el H2 por encima del marquee · confirmado · [layout.md](layout.md)
- `layout` · Gradiente dinámico: actualizar `setProperty('--sx')` en lugar de reescribir la cadena · confirmado · [layout.md](layout.md)
- `layout` · Shorthand `flex` + longhand `flexShrink` en el mismo elemento produce warning React · confirmado · [layout.md](layout.md)
- `layout` · `overflow-x: hidden` en `html` Y `body` para bloquear deriva lateral en móvil · confirmado · [layout.md](layout.md)
- `layout` · Navbar fijo transparente sobre secciones de distinto tono — contraste por `data-nav` de la sección, no por umbral de scroll · confirmado · [layout.md](layout.md)
- `layout` · `preserveAspectRatio="none"` aplasta SVG con detalle (árboles) en móvil angosto — `slice` responsive vía `matchMedia` (none en desktop) · confirmado · [layout.md](layout.md)
- `layout` · Selección de texto azul (UA) rompe la paleta — definir `::selection`/`::-moz-selection` global con HEX literal (no `var()`) · confirmado · [layout.md](layout.md)
- `layout` · `object-position` con un solo % — solo mueve horizontal; para vertical usar dos valores: `"center 75%"` · confirmado · [layout.md](layout.md)
- `layout` · `next/image` no recupera detalle de un raster pequeño → borroso a gran escala; validar resolución intrínseca (SVG / upscale Lanczos / limitar tamaño) · confirmado · [layout.md](layout.md)
- `layout` · Tratamiento de color de foto (calidez/deslavado): CSS ajustable (filter + overlay) no procesado horneado; recortar al `object-cover` para peso; previsualizar el stack con `sharp` (incl. overlays existentes) · confirmado · [layout.md](layout.md)
- `layout` · Glow radial detrás de un PNG transparente dibuja un "cuadrado": el gradiente se recorta al rect del contenedor y no cierra en `transparent` antes del borde — sospechar capas CSS, no el asset · confirmado · [layout.md](layout.md)
- `layout` · **`next/image` sin `sizes` sirve `w=1920`** aunque se pinte a 24px: usar `next/image` no basta, el ancho hay que declararlo. Y bajo un condicional de scroll (`{tone === "light" && …}`) la decodificación se repite en cada cruce → es coste **de scroll, no de carga**; `priority` sin `sizes` prioriza los bytes que sobran · confirmado · [layout.md](layout.md)

## responsive

- `responsive` · Cursor personalizado en táctil: guard con `window.matchMedia('(pointer: fine)')` · confirmado · [responsive.md](responsive.md)
- `responsive` · MONO uppercase con `letterSpacing >= 0.12em` desborda en móvil si tiene `<br/>` manual · confirmado · [responsive.md](responsive.md)
- `responsive` · `<br/>` manual en H2 genera salto de línea incorrecto en móvil — usar JSX condicional · confirmado · [responsive.md](responsive.md)
- `responsive` · `clamp()` solo no basta para padding en móvil — el mínimo de 96px es demasiado · confirmado · [responsive.md](responsive.md)
- `responsive` · Un hook `useIsMobile` SSR-safe hace que el server pinte **siempre** la variante desktop → lo exclusivo de desktop parpadea en móvil: el estado inicial va **invisible (`opacity:0`), no ausente**. Inicializar el hook leyendo `window` cambia el flash por un hydration mismatch · confirmado · [responsive.md](responsive.md)

## composicion

- `composicion` · **Los tres candados**: un acento (mismo en toda la página), una escala de radios, un tema. Se deciden una vez; romperlos por sección es el error de composición más caro · confirmado · [composicion.md](composicion.md)
- `composicion` · El **hero entra en el primer viewport**: titular ≤2 líneas, subtexto ≤20 palabras, CTA sin scroll. Un titular de 4 líneas es error de `font-size`, no de copy · confirmado · [composicion.md](composicion.md)
- `composicion` · Máximo **4 elementos de texto en el hero**; la tira de logos, el teaser de precio y la fila de avatares van **debajo**, nunca dentro · confirmado · [composicion.md](composicion.md)
- `composicion` · **Tres cards iguales en fila: prohibido.** Cap de zigzag en 2 consecutivos. Una landing de 8 secciones usa ≥4 familias de layout distintas · confirmado · [composicion.md](composicion.md)
- `composicion` · **Bento: N ítems → N celdas**, cero huecos; y 2-3 celdas con variación visual real (no 6 cards blancas de pura tipografía) · confirmado · [composicion.md](composicion.md)
- `composicion` · Más de 5 ítems piden **otro componente**, no una lista más larga (`<ul>` + hairline por fila es la salida perezosa) · confirmado · [composicion.md](composicion.md)
- `composicion` · **Una intención, una etiqueta de CTA** en todo el sitio ("Contactar" + "Hablemos" + "Escríbenos" = fallo). El texto del CTA no envuelve a 2 líneas · confirmado · [composicion.md](composicion.md)
- `composicion` · El **screenshot falso hecho con `<div>`s** (falso dashboard, falsa terminal) es el *tell* nº1. Captura real, imagen generada, o ningún preview · confirmado · [composicion.md](composicion.md)
- `composicion` · Nav en **una sola línea** en desktop, altura 64-72px (tope 80) · confirmado · [composicion.md](composicion.md)
- `composicion` · Dónde las skills de diseño **contradicen nuestro estándar y pierden**: eyebrows (nosotros los prohibimos de plano), cursor personalizado, alternancia de superficies · confirmado · [composicion.md](composicion.md)

## copy

- `copy` · Redundancia de palabras de marca — pérdida de potencia por repetición; usar alternativas específicas (el lugar, la región, el contexto, el rubro) y reservar la palabra de marca para usos con carga conceptual · confirmado · [copy.md](copy.md)
- `copy` · **La raya (`—`) está prohibida: cero, sin excepciones.** Ni en titulares, botones, cuerpo, citas, `alt` ni nav. Rangos con guion. Un solo `—` visible es fallo de entrega · confirmado · [copy.md](copy.md)
- `copy` · Catálogo de *tells* de copy: verbos de relleno, nombres/cifras genéricos, precisión fingida, etiquetas poéticas, señales de scroll, numeración de secciones, tiras de ciudad/hora/clima · confirmado · [copy.md](copy.md)
- `copy` · **Auto-auditoría antes de entregar**: releer cada string visible; copy aburrido y funcional le gana siempre a copy "ingenioso" generado · confirmado · [copy.md](copy.md)
- `copy` · **La voz se deriva, no se inventa**: se rellena leyendo lo que el cliente ya escribió (entrevista, redes, web vieja) y cada decisión de voz cita su fuente, como en diseño · confirmado · [copy.md](copy.md)
- `copy` · Leyes positivas: test del "¿y qué?" (característica sin consecuencia se corta), claim sin prueba se suaviza o se borra (**nunca** se fabrica la prueba), una idea por sección · confirmado · [copy.md](copy.md)
- `copy` · Dónde las skills de copy (`copywriting`/`copy-editing`) **contradicen nuestro estándar y pierden**: la especificidad numérica (si el dato no está en `que-es-<cliente>.txt` se **acorta la frase**, no se inventa la cifra), los CTAs de catálogo, el "heightened emotion" · confirmado · [copy.md](copy.md)
- `copy` · **El borrador declarado**: al cliente que no contesta por escrito se le enseña la página con una propuesta puesta. Tres condiciones a la vez: contenido inventado en UN archivo, cada hipótesis anota de qué frase suya salió, y una nota visible que dice que es propuesta. Sin las tres se fosiliza en doctrina · confirmado · [copy.md](copy.md)
- `copy` · **El dato local en producto internacional**: un aviso de emergencia no lleva el número de un solo país si el alcance declarado es mundial (`servicios de tu localidad`), y un aviso de no sustitución nombra a quién no sustituye (`profesionales cualificados`) · confirmado · [copy.md](copy.md)
- `copy` · **El material de Fase 1 deja de mandar en el dato que el cliente corrige**: un dato de marca no es criterio, vive en todas sus apariciones. Barrer el árbol antes de corregir, un solo dueño en código, y nota fechada en el `que-es` en vez de reescribirlo · confirmado · [copy.md](copy.md)

## seo

- `seo` · **El criterio SEO/GEO vive en el lore del área** (`seo.md`), no dentro del scaffold de un proyecto: la checklist nació en `_starter/web/docs/seo/` y ahí solo la heredaba quien se estampaba del starter — un proyecto **adoptado** (registrado en `FASES.md` sin nacer del `_starter`) no veía nada. Fuente única, sin copia en el starter · confirmado · [seo.md](seo.md)
- `seo` · **SEO inline, auditoría de una pasada**: cada sección/página nace con `metadata`, JSON-LD y `alt` descriptivo; la Mini-Fase de auditoría **consolida**, no descubre · confirmado · [seo.md](seo.md)
- `seo` · **La auditoría llega desfasada; el disco no miente**: Lighthouse/Goodie reportan sobre el preview viejo — verificar tamaño/estado real en disco **antes** de re-encodear o "arreglar" · confirmado · [seo.md](seo.md)
- `seo` · De Lighthouse se aplica **todo menos el hallazgo de contraste de color** (choca con la dirección de diseño y la dirección gana); el resto de Accesibilidad sí, entero · confirmado · [seo.md](seo.md)
- `seo` · Los `.htaccess`/headers **solo aplican en Apache** (cPanel), no en Vercel: el score real sube al **re-escanear post-deploy** · confirmado · [seo.md](seo.md)
- `seo` · Next **no cascada la OG raíz** a los segmentos hijos → inyectar `og:image` en `pageMetadata()`; y `robots.txt` va **estático** en `public/` (la API de robots de Next no emite directivas custom, como el allow a bots de IA) · confirmado · [seo.md](seo.md)
- `seo` · GEO: `llms.txt` + `llms-full.txt` + allow explícito a GPTBot/ClaudeBot/PerplexityBot. Agent Discovery (MCP card, A2A, OpenAPI) se **omite a propósito** salvo Tier 3 con login o API · confirmado · [seo.md](seo.md)

## routing

- `routing` · GSAP plugins acceden a `window` — centralizar en `lib/gsap.ts` con guard SSR · confirmado · [routing.md](routing.md)
- `routing` · Hydration mismatch con `Date.now()` — estado inicial `null` + `useEffect` solo en cliente · confirmado · [routing.md](routing.md)
- `routing` · Next.js 16: `params` y `searchParams` son `Promise` — hacer `await params` · confirmado · [routing.md](routing.md)
- `routing` · Tailwind v4: sin `tailwind.config.ts` — tokens en `@theme {}` dentro del CSS · confirmado · [routing.md](routing.md)
- `routing` · OG image: Google Fonts no disponibles en build — cargar `.ttf` local con `readFile` · confirmado · [routing.md](routing.md)
- `routing` · `title.absolute` para que la homepage ignore el template de título del layout · confirmado · [routing.md](routing.md)
- `routing` · Tailwind v4: valor fuera de escala (`duration-400`) no genera utilidad → transición instantánea silenciosa; usar escala o `duration-[400ms]` · confirmado · [routing.md](routing.md)
- `routing` · `next/image`: reemplazar asset de `public/` con el mismo nombre sigue mostrando la versión vieja (URL del optimizador estable y cacheada) → renombrar el archivo + actualizar refs · confirmado · [routing.md](routing.md)
- `routing` · Descargar de Unsplash: `/photos/<id>/download` da 403 y los IDs no se adivinan (404) — sacar el id numérico del og:image vía WebFetch y bajar de `images.unsplash.com/photo-<id>?fm=webp&w=...`; inspeccionar la imagen y su región antes de aprobar · confirmado · [routing.md](routing.md)
- `routing` · Nav circular prev/next se auto-referencia con un solo ítem (`(i±1)%1===0`) → guard `hasMore` (prev.slug≠self) y cuidar el handoff de color de la sección que pasa a ser la última · confirmado · [routing.md](routing.md)
- `routing` · `scroll-behavior: smooth` en `<html>` exige **`data-scroll-behavior="smooth"`** o Next no puede desactivarlo al cambiar de ruta: la nueva página se desliza desde la posición anterior en vez de aparecer arriba · confirmado · [routing.md](routing.md)

## deploy

- `deploy` · **«Conectado a Vercel» son dos vínculos distintos y ninguno implica al otro**: el `.vercel/project.json` local (enlace de CLI, despliega desde el disco de quien lo corrió) y la integración Git (vive en el panel y escucha un remoto). Un sitio del área se enlaza **por Git, nunca por CLI** — si no, el proyecto queda desplegado y sin forma de volver a desplegarlo. Al montarla: **Root Directory** = la carpeta de la app (distinta en cada sitio) · confirmado · [deploy.md](deploy.md)
- `deploy` · **Cambiar un ajuste de build en el panel de Vercel no reconstruye nada**: producción sigue sirviendo el artefacto anterior (preset «Other» → sitio en blanco) hasta que un commit dispare un build. El panel muestra el ajuste correcto y la URL el resultado viejo → se busca el error en el código. Forzar *Redeploy*; la lista de deployments manda, no los settings · confirmado · [deploy.md](deploy.md)

---

## Variante SaaS — patrones de sitios con backend

Las **leyes** de backend (acceso, Supabase, Stripe) viven en la **Variante SaaS** de
`principios.md` e `identidad.md`. Las **pistas puntuales** de dominios backend viven en
sus módulos temáticos (abajo), promovidos desde `numerologia` (Introspection Solutions).

## supabase

- `supabase` · Client (`createBrowserClient`) vs Server (`createServerClient`) — nunca mezclar entre `'use client'` y Server Components/API Routes · conjetura · [supabase.md](supabase.md)
- `supabase` · Usar `getUser()` (revalida con Auth server), no `getSession()`, para decisiones de acceso en servidor · conjetura · [supabase.md](supabase.md)
- `supabase` · Refrescar sesión en `middleware.ts` — Server Components no pueden escribir cookies · conjetura · [supabase.md](supabase.md)
- `supabase` · RLS activo siempre; `service_role` ignora RLS → solo servidor (webhook), nunca `NEXT_PUBLIC_` · conjetura · [supabase.md](supabase.md)
- `supabase` · `profiles` no se crea solo: trigger sobre `auth.users` o insert tras signUp, o el gating por rol falla · conjetura · [supabase.md](supabase.md)

## stripe

- `stripe` · Webhook necesita el body crudo (`req.text()`), no `req.json()`, o la firma nunca cuadra · conjetura · [stripe.md](stripe.md)
- `stripe` · Verificar firma siempre; sin firma válida → 400 sin tocar la base (Golden Path) · conjetura · [stripe.md](stripe.md)
- `stripe` · Mapear `customer`↔usuario con `client_reference_id`/`metadata.user_id` al crear el Checkout · conjetura · [stripe.md](stripe.md)
- `stripe` · Eventos duplicados/fuera de orden → upsert idempotente por `stripe_subscription_id` · conjetura · [stripe.md](stripe.md)
- `stripe` · Cancelar ≠ perder acceso: `isPremium` respeta `cancel_at_period_end` + `current_period_end` · conjetura · [stripe.md](stripe.md)
- `stripe` · Precios y claves desde env (`STRIPE_PRICE_*`); nunca hardcodear `price_xxx` (difiere test/live) · conjetura · [stripe.md](stripe.md)
