# lore/animation.md — GSAP / ScrollTrigger / CSS Animation

> Pistas históricas, NO fuente de verdad. Leads a validar, no recetas.
> ⚠ Validar contra código actual antes de actuar.

---

### [animation] Flash de elementos antes de que arranque GSAP (FOUC de animación)

- Contexto: Cualquier hero o componente con animación de entrada en GSAP + SSR (Next.js).
- Causa probable: React pinta el HTML antes de que JS corra. Si el CSS no oculta el elemento por defecto, el usuario ve el estado final por uno o dos frames antes de que GSAP lo lleve al estado inicial.
- Pista: Si el elemento empieza invisible o desplazado, asegurarse de que ese estado ya está en el markup (`style={{ opacity: 0 }}`, `style={{ transform: '...' }}`). GSAP debería confirmar ese estado con `fromTo`, nunca crearlo. Buscar usos de `gsap.from(...)` sobre elementos sin estado inicial en el HTML.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Marquee CSS reinicia con salto visible

- Contexto: Marquee infinito horizontal. Puede ocurrir con GSAP o CSS puro.
- Causa probable: Pocas copias del contenido o el porcentaje del keyframe no coincide con el número de copias. Con GSAP, la medición del DOM llega tarde → el elemento aparece en `x:0` un frame antes de saltar.
- Pista: Verificar número de copias (4 copias → keyframe a -25%; 2 copias → -50%). CSS puro es más confiable que GSAP para marquees porque no tiene la penalidad de la medición asíncrona del DOM. Si se usa GSAP, sospechar de `halfWidth` calculado tarde.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Barra de progreso con reflow en cada frame

- Contexto: Barra de progreso actualizada en `onUpdate` de ScrollTrigger (60fps).
- Causa probable: Implementación que cambia `width` en cada frame en vez de `transform`.
- Pista: `width` es propiedad de layout — recalcula geometría en cada frame. `scaleX` con `transformOrigin: 'left center'` es una operación de compositor puro. Buscar cualquier `element.style.width = ...` dentro de callbacks de 60fps.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Scroll horizontal pinned termina en posición incorrecta al redimensionar

- Contexto: Sección con `pin: true` + scroll horizontal animado (`gsap.to(track, { x: ... })`).
- Causa probable: El `end` y el valor de `x` se calculan una sola vez al montar. Al redimensionar, los valores quedan obsoletos.
- Pista: Convertir `x` y `end` en funciones `() => ...` para que se recalculen. Verificar que `invalidateOnRefresh: true` está activo en el ScrollTrigger. Sin esto el valor calculado en mount no responde a resize.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Columnas de scroll infinito vertical con salto en el loop

- Contexto: Columnas de cards que hacen scroll infinito vertical (similar al marquee horizontal pero vertical).
- Causa probable: Número de copias o porcentaje del keyframe incorrecto. Los fades con `linear-gradient` usan el color equivocado.
- Pista: 2 copias → keyframe a `-50%`. El fade superior/inferior debe coincidir exactamente con el color de fondo del contenedor. Si el color no es exacto, el fade se ve como un borde duro en la transición.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Jumping (salto) en timeline vertical scrubbed con GSAP pin

- Contexto: Timeline de N pasos donde cada paso se activa al hacer scroll dentro de una sección pinned.
- Causa probable: (A) `useState` para el paso activo → React re-renders mientras GSAP controla el pin → GSAP detecta cambio de geometría y recalcula spacer → salto. (B) Transición CSS en `maxHeight` o `height` durante `onUpdate` → reflow en cada frame → colisión con GSAP.
- Pista: Buscar `useState` para el índice de paso activo en componentes pinned. Sospechar de cualquier `transition: max-height ...` o `transition: height ...` dentro de un pin. El cambio de visibilidad de contenido debe ser instantáneo en `height`; solo `opacity` puede tener transición (compositor).
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Pasos intermedios se expanden brevemente al saltar a un paso no adyacente

- Contexto: Timeline de N pasos con click en dot para saltar pasos. El scroll programático cruza umbrales intermedios.
- Causa probable: `onUpdate` se dispara en cada frame del scroll programático y cruza los umbrales de pasos intermedios, activándolos. Un lock liberado por condición de umbral (`newStep >= target`) falla en scroll hacia atrás.
- Pista: El lock de click debe durar exactamente lo que dura el scroll programático. Buscar si el lock se libera por condición interna de `onUpdate` en lugar de en el callback `onComplete` del scroll. El lock liberado por condición puede fallar en dirección inversa.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Sección sube unos píxeles al activar el último paso de un timeline

- Contexto: Sección con `display:flex; align-items:center` o `translateY(-50%)` que contiene un timeline de pasos de altura variable.
- Causa probable: Cuando el contenido del paso activo crece, el método de centrado dinámico recalcula y reposiciona la sección. `align-items:center` redistribuye espacio libre; `translateY(-50%)` usa el alto propio del elemento que cambió.
- Pista: Sospechar de cualquier método de centrado que reaccione a cambios de altura del contenido. El síntoma es un desplazamiento vertical sutil pero visible al activar el último paso. Buscar `align-items:center` o `translateY(-50%)` en secciones con timeline de altura variable.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Transiciones CSS ausentes al hacer click en un punto del timeline

- Contexto: Click en dot/step del timeline activa un cambio instantáneo sin animación visible.
- Causa probable: El handler de click desactiva las CSS transitions antes de llamar a la función de activación (para evitar reflow durante scroll) y las re-habilita justo después — cuando el DOM ya está en el estado final y no hay nada que animar.
- Pista: Buscar el patrón "deshabilitar transitions → cambiar estado → setTimeout/RAF para re-habilitar". Si el lock de scroll (skipRef) ya bloquea `onUpdate`, ese patrón es innecesario y contraproducente.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Flash / línea blanca en el borde inferior de sección dark con pin rápido

- Contexto: Sección dark (`background: un color oscuro`) con `pin: true`, fondo del body claro (cream).
- Causa probable: (A) Durante scroll rápido, GSAP activa el pin con un frame de retraso → el spacer/fondo del body asoma un instante. (B) El `.gsap-pin-spacer` hereda el fondo del body, que es cream, no dark.
- Pista: Verificar `anticipatePin: 1` en el ScrollTrigger de secciones dark pinned. Verificar que el `.gsap-pin-spacer` tiene el color de fondo correcto asignado vía CSS (`:has(#id)`), no solo vía JS. El CSS es más seguro porque aplica antes del primer paint.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Reveal de texto tipo "cortina que sube" (clip + blur)

- Contexto: H2 o título cuyas líneas deben aparecer subiendo desde debajo mientras se despejan.
- Causa probable: N/A (patrón de diseño, no un bug).
- Pista: Patrón: `overflow:hidden` por línea + `span` interior con `translateY(108%)` inline + `gsap.fromTo` con `blur`. El `108%` (no `100%`) garantiza que los descenders queden completamente ocultos. El `paddingBottom + marginBottom` compensa el clip en fuentes con descenders. El `filter:blur` añade dramatismo en fuentes grandes.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Texto scramble / decode efecto terminal

- Contexto: Subtítulo o párrafo que aparece como ruido aleatorio y se "decodifica" letra a letra.
- Causa probable: N/A (patrón de diseño).
- Pista: `setInterval` con caracteres aleatorios que revela el texto real de izquierda a derecha. Los espacios y guiones deben preservarse (no reemplazarlos con CHARS o el texto "baila" lateralmente). Disparar con `IntersectionObserver`, no con ScrollTrigger — es one-shot y no necesita sincronización con el scroll.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] GSAP apila tweens sobre el mismo elemento — vibración o comportamiento indeterminado

- Contexto: Manejadores de eventos (scroll, mousemove, resize) que llaman `gsap.to` repetidamente sobre el mismo elemento antes de que termine el tween anterior.
- Causa probable: Por defecto GSAP no cancela tweens anteriores sobre el mismo elemento. Múltiples tweens sobre la misma propiedad se ejecutan en paralelo con resultado indeterminado.
- Pista: Buscar `gsap.to(element, {...})` dentro de manejadores de eventos de alta frecuencia sin `overwrite`. `overwrite:'auto'` cancela solo las propiedades en conflicto, no el tween completo. Navbars con animación de scroll son candidatos frecuentes.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Estado React cambia durante una animación GSAP y el DOM salta

- Contexto: Componente con menú o modal animado con GSAP donde `setState` se llama al inicio de la función de cierre.
- Causa probable: `setState` dispara re-render en el siguiente frame. Si el componente renderiza condicionalmente con `isOpen`, el DOM cambia bajo los pies de GSAP a mitad de animación.
- Pista: Buscar `setState(false)` o `setState(null)` al inicio de funciones de cierre que también contienen tweens GSAP. El estado debería actualizarse en `onComplete` del timeline, no antes. Como alternativa, mantener el elemento siempre montado y controlarlo solo con transforms.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Items de menú desaparecen en orden incorrecto al cerrar

- Contexto: Menú con N items que entran con stagger de arriba hacia abajo y deben salir de abajo hacia arriba.
- Causa probable: El stagger de salida usa la misma dirección que el de entrada (desde el primer elemento al último).
- Pista: `stagger: { from: 'end' }` invierte el orden. Verificar que el `amount` del stagger de salida es más corto que el de entrada (el cierre debe sentirse más decisivo).
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Race condition entre guard síncrono (ref) y guard async (React state) en botones animados

- Contexto: Componente con navegación por pasos. Botones que parecen habilitados pero no responden al primer clic.
- Causa probable: `busyRef` (ref síncrona, se resetea inmediatamente en `onComplete`) y estado React `fading` (async, se procesa 1–2 frames después en modo concurrente) usados simultáneamente como guards. Durante la ventana de 1–2 frames, `busyRef` ya acepta clics pero el botón sigue `disabled={fading}`.
- Pista: Buscar componentes donde un `disabled` en el JSX depende de un estado React que se resetea en el mismo `onComplete` que un ref. El ref siempre va a ser más rápido. Si el patrón es "ref para bloquear la función + estado para deshabilitar el botón", hay riesgo de carrera.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] ScrollTrigger `onUpdate` pre-llena estado visual que debería empezar vacío

- Contexto: Elemento visual (barra, fill, indicador) cuyo estado inicial en el JSX difiere del valor que `onUpdate` calculará con `progress = 0`.
- Causa probable: El primer frame de `onUpdate` sobreescribe el estado inicial del JSX (ej. `scaleY(1)`) con el valor correcto para `progress=0` (ej. `scaleY(0)`). El usuario ve el flash del estado inicial incorrecto.
- Pista: El markup debe siempre reflejar el estado real con `progress=0` (generalmente `0`/vacío/oculto). `onUpdate` es la única fuente de verdad para cualquier valor que controle. Buscar elementos con estado inicial en JSX que también son actualizados por `onUpdate`.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] GSAP sobreescribe `display:none` de elementos que deben estar ocultos

- Contexto: Elemento con `display:none` vía CSS (Tailwind `hidden`, media query) que también tiene una animación GSAP de entrada.
- Causa probable: Cuando GSAP anima un elemento con `display:none`, asigna `display` inline para ejecutar la animación. Ese valor inline tiene mayor especificidad que la clase CSS y el elemento queda visible.
- Pista: Buscar animaciones GSAP sobre elementos que son ocultados en ciertos viewports (navbars desktop, elementos solo-desktop). El síntoma es el elemento visible en móvil aunque tenga clase `hidden`. Doble protección: guard por viewport en el `useEffect` + `display:none !important` en CSS para el viewport específico.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] GSAP `pin:true` en móvil — flash blanco, colapso y layout roto

- Contexto: Sección con `pin:true` y `height:100vh` que se muestra en columna única en móvil.
- Causa probable: GSAP crea un `pin-spacer` del doble o triple de la altura de la sección, desorganizando el flujo. En móvil el contenido es una columna sin suficiente altura para justificar el pin.
- Pista: Verificar si el pin está condicionado al viewport (`if (!isMobile)`). Si no lo está y la sección es columna única en móvil, es el candidato. Requiere `dependencies: [isMobile], revertOnUpdate: true` en `useGSAP` para que se limpie al cambiar el viewport.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Scroll triggers que se disparan tarde — el elemento ya está completamente visible

- Contexto: Animaciones de entrada en componentes visibles en pantalla antes de que dispare el trigger. Más frecuente en móvil (viewport más corto).
- Causa probable: `start: 'top 65–75%'` está calibrado para viewports altos de desktop. En móvil, ese porcentaje se alcanza cuando el elemento ya lleva tiempo visible.
- Pista: Triggers entre `top 88%` y `top 95%` son seguros para ambos breakpoints — disparan en cuanto el borde superior del elemento asoma en pantalla. Valores menores a `top 70%` son sospechosos en componentes responsive. Buscar triggers con porcentajes bajos en componentes que también se usan en móvil.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [animation] Animación GSAP de entrada sin bifurcación por ruta causa FOUC en páginas no-target

- Contexto: Componente compartido (navbar, header) con una animación `gsap.fromTo` de entrada que solo se desea en una ruta específica (ej. landing), pero que se importa en cada `page.tsx` sin guard de pathname.
- Causa probable: La animación corre en TODAS las rutas. En páginas no-target, el elemento permanece invisible durante el delay+duration completo (puede ser ~1.4s) antes de llegar a `opacity:1`.
- Pista: Bifurcar en el `useEffect` con `usePathname()`. En la ruta target: `gsap.fromTo(...)` completo. En el resto: `gsap.set(el, { opacity: 1, ... })` inmediato. El fallback SSR (`pathname === null`) debe tratarse igual que la ruta target para evitar flash de re-hydration. Añadir `hasAnimated.current` ref para evitar re-animación en resize mobile→desktop.
- **Corolario (la aparición que la confirma):** bifurcar dentro del `useEffect` **no basta** — un `useEffect` corre *después* del paint, así que entre el HTML pintado con `opacity:0` y la corrección queda una ventana visible. **El estado inicial que depende de la ruta se decide en el JSX**, donde lo usan el SSR y el primer render cliente por igual: `opacity: (pathname === '/' || pathname === null) ? 0 : 1`. Sin hydration mismatch y sin ventana; el `gsap.set` del efecto queda redundante pero inofensivo. Agravante que lo hace visible a diario: un componente que vive **dentro de cada `page.tsx`** (en vez del root layout) **se remonta en cada navegación**, así que paga ese flash en cada cambio de ruta, no solo en la carga inicial.
- Confianza: confirmado (dos apariciones independientes en un mismo proyecto: FOUC del nav en páginas no-target y parpadeo del nav al navegar entre rutas)
- ⚠ Validar contra código actual.

---

### [animation] Elemento con reveal al scroll queda atrapado oculto por layout shift de fuentes web

- Contexto: Sección con reveal al scroll (`gsap.fromTo` + `scrollTrigger`) cuyo estado inicial oculta el elemento (`translateY(110%)` dentro de `overflow:hidden`, `opacity:0`). Síntoma: un elemento concreto (típicamente un titular display grande) nunca aparece y deja un hueco vacío, mientras que otros elementos de la misma sección con trigger más permisivo sí se revelan.
- Causa probable: ScrollTrigger calcula las posiciones de `start` al montar, ANTES de que carguen las fuentes (`next/font` la fuente de título/la fuente de cuerpo). Cuando la fuente carga, el layout se desplaza y el `start` calculado queda obsoleto, posicionado más abajo del lugar real del elemento. Al hacer scroll y pasar por el elemento, el trigger aún no se ha alcanzado → el `onEnter` no dispara y el elemento permanece en su estado "from" (oculto). Los titulares display grandes son los más afectados porque el cambio de métrica al cargar la fuente es mayor.
- Pista: Llamar `document.fonts.ready.then(() => ScrollTrigger.refresh())` dentro del `useGSAP` después de crear los triggers, para recalcular los `start` una vez asentadas las fuentes. Un `ScrollTrigger.refresh()` síncrono inmediato NO basta: corre antes de `fonts.ready`. Aplicar en TODA sección con scroll-reveal de este proyecto (usa `next/font`). Si un reveal "no aparece" pero otros de la misma sección sí, sospechar de esto antes que del trigger.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [animation] Selectores string GSAP en callbacks async (IO / eventos) no quedan scoped a `gsap.context`

- Contexto: Reveal de una sección disparado por `IntersectionObserver` (o handler de evento) donde la función de animación usa selectores string (`gsap.fromTo("[data-reveal]", ...)`). Varias secciones comparten el mismo data-attribute (`data-reveal`, `data-fade` en Hero, About y CTA).
- Causa probable: `gsap.context(fn, ref)` solo aplica el scope a las llamadas GSAP ejecutadas SÍNCRONAMENTE durante `fn`. Si la animación corre más tarde, dentro del callback async del observer, los selectores string se resuelven contra TODO el documento, no contra `ref`. El tween abarca los elementos homónimos de otras secciones, con resultado indeterminado.
- Pista: Síntoma observado — el heading de la sección quedaba invisible (dejaba un hueco que parecía exceso de padding) mientras el resto de la sección sí aparecía. Solución: NO usar selectores string en callbacks async; resolver con `el.querySelectorAll(...)` scoped a la sección y pasar los NODOS reales a GSAP (alternativa: envolver la animación tardía en `ctx.add(fn)`). Nota honesta: en el incidente real, además de scopear, hubo que cambiar el reveal del heading de cortina (`overflow:hidden` + `translateY(108%)` + `yPercent`) a un fade-up por opacidad para que apareciera de forma fiable al dispararse tarde vía IO — la cortina+`yPercent` disparada tarde resultó frágil (causa exacta no confirmada).
- Confianza: confirmado (comportamiento de scope de gsap.context); el reveal por cortina tardío como frágil = conjetura. Fase C — CTA.
- ⚠ Validar contra código actual.

---

### [animation] Fallback por `setTimeout` de un reveal-IO revela la sección fuera de pantalla → animación perdida

- Contexto: Reveal por `IntersectionObserver` con una "red de seguridad" `setTimeout(() => reveal(), N)` para que el contenido nunca quede en blanco si el observer no dispara.
- Causa probable: El timeout revela a ciegas, sin comprobar si la sección está en viewport. Para secciones below-the-fold, si el usuario tarda más de N ms en bajar, el timeout dispara con la sección fuera de pantalla: la animación corre donde no se ve y, al llegar scrolleando, el contenido ya está completo y estático. Síntoma característico: el efecto de entrada se ve "a veces sí, a veces no" según cuánto tarde el usuario en bajar.
- Pista: Gatear el fallback por visibilidad real — dentro del timeout, comprobar `el.getBoundingClientRect()` (`r.top < window.innerHeight && r.bottom > 0`) antes de revelar; si está fuera de pantalla, no hacer nada y dejar que el IO lo maneje al scrollear. Aplica a cualquier reveal con red de seguridad por timeout (About, CTA).
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [animation] Parpadeo de cards sobre el pliegue en dev: el doble montaje de React StrictMode revierte y re-corre el reveal

- Contexto: Componente con reveal por IO cuyo `useEffect` usa `gsap.context(...)` + `ctx.revert()` en el cleanup. Síntoma: en `npm run dev`, los elementos que ya están en viewport AL MONTAR (cards above-the-fold, p.ej. la primera franja de `/blog`) hacen un flash/parpadeo breve al cargar. Las secciones below-the-fold (mismo componente reutilizado en la landing) y producción se ven bien — lo que despista el diagnóstico ("no es el hero, no son las franjas, son las cards").
- Causa probable: en dev, React StrictMode monta el componente DOS veces. Con `gsap.context`+`revert`, el primer montaje corre el reveal (o lo deja en su estado inicial `opacity:0`), el cleanup hace `revert()` devolviendo el DOM al estado pre-GSAP, y el segundo montaje vuelve a aplicar el estado inicial y re-anima → para un elemento que ya está en pantalla eso es un parpadeo visible. (Producción monta una sola vez → no ocurre, por eso "se ve bien desplegado".)
- Pista: en vez de `gsap.context`/`revert`, marcar cada nodo como ya revelado con un `data-attr` en el PROPIO DOM (`node.dataset.revealed = "1"`) y gatear el reveal con un guard que lo respete (`if (node.dataset.revealed) return`). El data-attr sobrevive al desmontaje/remontaje de StrictMode, así el segundo montaje ve los nodos ya revelados y los OMITE en vez de revertirlos. Pasar nodos reales a GSAP (no selectores string, ver entrada de scope arriba) y NO usar `revert`. Patrón vivo en `BlogBands.tsx` (`observeOnce` + `dataset.revealed`). Antes de cazar un flash "fantasma" en componentes compartidos, descartar que sea solo dev/StrictMode probando un build de producción.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [animation] Estado inicial `translateY(%)` inline en `style` → GSAP lo lee como px, no como `yPercent`; resetear con `yPercent`/`y:"0%"` NO lo limpia y el reveal queda oculto

- Contexto: Reveal por máscara cuyo estado inicial está en `style` inline como `transform: translateY(108%)` (el patrón clip+blur del Hero/About/CTA). El reveal anima `yPercent`. Síntoma: el titular NUNCA aparece (queda hueco) mientras los `data-fade` de la misma sección (que solo animan `opacity`) sí se ven — y pasa por igual en desktop, móvil y especialmente con `prefers-reduced-motion` activado.
- Causa probable: el navegador resuelve el `108%` del `transform` inline a PÍXELES en el `transform` computado. Cuando GSAP toca el elemento, parsea esa matriz y guarda el desplazamiento como `y` (px), no como `yPercent`. Por eso: (a) en la rama reduced-motion, `gsap.set({ y: "0%" })` o `{ yPercent: 0 }` no limpia el residual en px → sigue corrido fuera de la máscara; (b) en la animación, un `fromTo` que solo toca `yPercent` deja el `y` (px) intacto.
- Pista: forzar `y: 0` explícito en AMBOS lados del `fromTo` (`from` y `to`) para anular el residual en px. En la rama reduced-motion usar `gsap.set("[data-reveal]", { clearProps: "transform,filter", opacity: 1 })` (borra el transform inline por completo) en vez de setear `yPercent`/`y`. Si un reveal "no aparece" y tiene el estado inicial como `translateY(%)` inline, sospechar de esto antes que del trigger. Relacionado con `[layout] line-height:1 recorta…` y con el FOUC de animación.
- Confianza: confirmado (esta sesión — Hero, con reduced-motion activado en el cliente)
- ⚠ Validar contra código actual.

---

### [animation] Reveal por máscara que abre `overflow` al final recorta los descenders DURANTE la animación (efecto "pop")

- Contexto: Reveal clip+blur por línea (`overflow:hidden` + inner `translateY(108%)`) con interlineado apretado. Para que la cola de la `g`/`y` no quede recortada en reposo, un primer intento abre el `overflow` (`gsap.set({ overflow: "visible" })`) al terminar el timeline.
- Causa probable: mientras la máscara está `overflow:hidden`, recorta todo lo que sobresale por abajo del line-box — incluida la cola del glifo en su posición final. Abrir el overflow solo AL FINAL hace que el descender se vea cortado durante toda la animación y "salte" a completo al terminar (pop). Bajar el line-height para apretar agrava el recorte.
- Pista: no togglear `overflow`. Hacer la máscara lo bastante ALTA para que el descender quepa SIEMPRE dentro de ella (`paddingBottom` ~`0.2em`) y compensar el espaciado con `margin-bottom` negativo equivalente (`-mb-[0.18em]`) → el interlineado neto queda apretado igual, pero la cola nunca se recorta (ni durante ni después) y no hay pop. El margen negativo no causa colisión con la línea siguiente: el descender ocupa el hueco/leading que de todos modos quedaba libre. Relacionado con `[layout] line-height:1 recorta letras…` (mismo paddingBottom+marginBottom negativo).
- Confianza: confirmado (esta sesión — Hero)
- ⚠ Validar contra código actual.

---

### [animation] "Sombra fantasma" antes del reveal: `blur()` en el estado inicial asoma por el borde de la máscara

- Contexto: Reveal por máscara cuyo inner arranca con `transform: translateY(108%)` + `filter: blur(10px)` inline, pero SIN `opacity:0`. El reveal corre con un `delay` (p. ej. 0.35s). Síntoma: durante ese delay (antes de animar / mientras carga), se ve una mancha/sombra borrosa justo donde aparecerá el titular.
- Causa probable: el `translateY(108%)` deja el texto fuera del área visible de la máscara, pero el `blur(10px)` expande el bounding visual del glifo ~10px en todas direcciones → en texto chico (móvil) el borde superior desenfocado asoma dentro del área visible antes de que arranque la animación. Se lee como sombra fantasma.
- Pista: añadir `opacity: 0` al estado inicial inline del inner y animar `opacity 0→1` en el `fromTo` (la rama reduced-motion ya debe forzar `opacity:1`). Así, antes del reveal no se ve nada — ni el sangrado del blur. Regla general: cualquier estado inicial con `blur` dentro de una máscara debería llevar también `opacity:0`.
- Confianza: confirmado (esta sesión — Hero móvil)
- ⚠ Validar contra código actual.

---

### [animation] Reveal por máscara palabra-por-palabra (`overflow:hidden` + `translateY(110%)`) recorta el titular cuando hace wrap a varias líneas

- Contexto: Titular display revelado palabra por palabra, envolviendo cada palabra en un `<span inline-block overflow-hidden>` con la palabra interior en `translateY(110%)` (cortina que sube). El H2 tiene `max-w` y hace wrap responsive a 2–3 líneas.
- Causa probable: La cortina por palabra con wrappers `inline-block` que fluyen y saltan de línea recorta el texto incluso en su posición final (`translateY(0)`): el alto/baseline del `inline-block` no contiene de forma fiable el glifo al hacer wrap, así que `overflow:hidden` lo deja invisible aunque la animación SÍ haya corrido. Síntoma característico: la(s) primera(s) línea(s) del titular no aparecen (queda un hueco) mientras otras palabras animadas SIN máscara (p. ej. un acento revelado letra-por-letra con fade) sí se ven — prueba de que el timeline corrió pero el clip oculta el contenido en reposo.
- Pista: La cortina por palabra solo es fiable en UNA línea o con saltos de línea conocidos (máscara POR LÍNEA, como en el Hero con array de líneas). Para titulares que hacen wrap responsive, usar un efecto SIN clip: `opacity + translateY + blur(→0)` palabra por palabra (rise+blur) — sigue siendo premium y distinto de un fade letra-por-letra. Relacionado con `layout` · `line-height:1` recorta ascenders/descenders con `overflow:hidden`, y con la nota de que la cortina+`yPercent` disparada tarde vía IO resultó frágil.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [animation] Slider crossfade con caja que se redimensiona: la foto SALIENTE "salta"/hace zoom al cambiar la activa (proporciones mixtas)

- Contexto: Carrusel de fotos de **orientación mixta** (16:9 y 9:16) con crossfade por opacidad y una caja que abraza la imagen activa (alto fijo, ancho según la proporción de la foto activa). Síntoma: al pasar de una foto a otra de distinta orientación, durante ~0.5s se ve la foto que SALE deformada — ampliada/zoom si la caja se ensancha (vertical→horizontal) o encogida/recolocada si se angosta (horizontal→vertical) — y luego se asienta la correcta. Pasa en AMBOS sentidos.
- Causa probable: ambas imágenes (saliente y entrante) comparten **una sola caja** cuyo `aspect-ratio` cambia de golpe al cambiar el índice activo. La imagen saliente, que sigue visible mientras se desvanece, se **re-encaja** a la nueva forma de la caja: con `object-cover` se amplía para cubrir (zoom), con `object-contain` se encoge para caber. El cambio de forma es instantáneo (el `aspect-ratio` no transiciona), así que el re-encaje se ve como flash. Cambiar `cover`↔`contain` solo mueve el artefacto de un sentido al otro, no lo elimina.
- Pista: NO usar una caja compartida que se redimensiona. Dar a **cada foto su propio marco** dimensionado a SU proporción real (medida en `onLoad` con `naturalWidth/naturalHeight`), absolutamente posicionado y centrado dentro de un "escenario" de alto fijo, y cruzarlas **solo por opacidad**. Así ninguna imagen se re-encaja al cambiar la activa: la que sale conserva su tamaño mientras se desvanece. El escenario (con `overflow-hidden`) mantiene además fija la posición de las flechas y recorta el sobrante de la foto saliente durante el cruce. Para posición de flechas responsive (fija al ancho máximo en desktop, abrazando la imagen en móvil) usar `aspect-ratio` por CSS var con prefijo de breakpoint: `[aspect-ratio:var(--cur)] md:[aspect-ratio:var(--max)]`. Patrón vivo en `components/sections/ImageSlider.tsx` (modo `fit="contain"`/hug). El modo `cover` (caja fija de proporción única, p. ej. 3:2) NO sufre esto porque todas sus fotos comparten la misma caja sin cambiarla.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [animation] `next/image` lazy dentro de contenedor colapsable (acordeón) aparece de golpe sin transición

- Contexto: Imagen `next/image` (loading lazy por defecto) dentro de un panel que se expande con `grid-template-rows: 0fr→1fr` (acordeón). La imagen solo se descarga al abrir el panel. Síntoma: la PRIMERA vez que se abre cada fila, la foto aparece de golpe ya decodificada, desacoplada de la animación del panel (rompe el tono premium, sobre todo en móvil). Reabrir la fila ya funciona bien (la imagen quedó en caché).
- Causa probable: la imagen lazy no carga hasta que el panel se abre; cuando termina de decodificar se pinta instantáneamente a `opacity:1`, sin sincronía con la transición del `grid-rows`. La animación del panel corre con el hueco vacío y la foto "pop-ea" al completarse la carga.
- Pista: arrancar la imagen en `opacity:0` (+ opcional `scale(1.02)`) y rastrear la carga real por id en un `Set` de estado; en `onLoad` marcar cargada y transicionar `opacity`/`transform`. Respetar `prefers-reduced-motion` (sin transición). Una vez cargada queda estable y al reabrir entra inmediata. No fiarse de que "la animación del panel ya disimula la carga": la carga lazy es asíncrona y no está sincronizada con la transición. Aplica a cualquier media lazy revelada por expand/colapso (acordeones, "leer más", tabs).
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [animation] `ease: "cubic-bezier(...)"` en GSAP no hace nada, y no avisa

- Contexto: Proyecto con GSAP + Tailwind. Se define una constante con la curva del sitio (`const EASE = "cubic-bezier(0.17, 1, 0.32, 1)"`) y se usa en los dos sitios: en las clases de Tailwind (`ease-[cubic-bezier(...)]`) y en los tweens (`ease: EASE`). En CSS funciona. En GSAP, no.
- Causa probable: `cubic-bezier()` es sintaxis de CSS. GSAP solo la entiende con el plugin **CustomEase** registrado. Sin él, `gsap.parseEase("cubic-bezier(...)")` devuelve `undefined` y el tween cae al ease por defecto (`power1.out`). **No lanza error ni warning visible**: la animación corre, se ve "bien", y simplemente no es la curva que el código dice que es. Registrar CustomEase tampoco basta: su `create()` espera un path SVG, no la sintaxis CSS.
- Pista: Comprobarlo cuesta una línea: `node -e "const {gsap}=require('gsap'); console.log(gsap.parseEase('cubic-bezier(0.17,1,0.32,1)'))"` → si imprime `undefined`, todos los tweens que usan esa constante están cayendo al default. La salida es separar las dos constantes: el bezier literal para las clases de CSS, y el ease **nativo** para los tweens. Equivalencias útiles: `cubic-bezier(0.17,1,0.32,1)` ≈ `power4.out` (en t=0.5, 0.9375 vs ~0.93) · `cubic-bezier(0.22,1,0.52,1)` ≈ `power3.out`.
- Confianza: confirmado (numerologia, Fase 3.C; el bug venía desde la 3.B sin que se notara)
- ⚠ Validar contra código actual.

---

### [animation] Todo lo que nace dentro de un `.then()` nace FUERA del `gsap.context` de `useGSAP`

- Contexto: Reveal de titular que espera a que la fuente cargue antes de medir (`document.fonts.ready.then(() => { const tl = gsap.timeline({...}); tl.fromTo("[data-word]", ...) })`), todo dentro de `useGSAP(..., { scope: root })`. Se ve correcto y funciona a la primera. En dev, el texto ya visible vuelve a arrancar desde abajo: un parpadeo que no se explica leyendo el timeline.
- Causa probable: `gsap.context` solo registra lo que se crea de forma **síncrona** dentro de su función. Un timeline creado en el callback de una promesa se crea después de que la función ya retornó, así que el contexto ni lo conoce. De ahí salen dos consecuencias, y la segunda es la que se ve: (a) las cadenas de selección (`"[data-word]"`) **no quedan acotadas al scope** y seleccionan en todo el documento; (b) el contexto no lo limpia, así que en el doble montaje de StrictMode las **dos** promesas resuelven y crean **dos timelines** sobre los mismos nodos.
- Pista: cuando el tween dependa de algo asíncrono (fuentes, imágenes, medidas), el `useGSAP` tiene que hacer a mano lo que el contexto ya no puede hacer por él: resolver los nodos con `root.current.querySelectorAll(...)` en vez de cadenas, guardar el timeline en una variable del closure, y llevar una bandera de vida que el cleanup apague (`vivo = false`) para que el callback pendiente no cree nada después de desmontar. El cleanup mata lo suyo: `tl?.scrollTrigger?.kill(); tl?.kill()`. Vale para cualquier `await`/`.then()` dentro de `useGSAP`, no solo `document.fonts.ready`.
- Confianza: confirmado (numerologia, Fase 3.C — el mismo patrón estaba en Hero y CtaFinal)
- ⚠ Validar contra código actual.

---

### [animation] `ScrollTrigger.getAll().forEach(t => t.kill())` como limpieza de UN componente apaga los triggers de TODOS

- Contexto: Varias secciones con su propio `useGSAP` + ScrollTrigger, cada una cerrando con `return () => ScrollTrigger.getAll().forEach(t => t.kill())`. Parece una limpieza responsable y pasa cualquier revisión: el componente "se limpia al desmontar".
- Causa probable: `getAll()` es un registro **global** de la página, no del componente. Desmontar una sección mata también los triggers de sus hermanas, que siguen montadas y se quedan sin animación (o con su estado inicial inline congelado: invisibles). En producción con montaje único no se nota; aparece con Fast Refresh, con rutas que montan y desmontan secciones, o con cualquier render condicional.
- Pista: cada componente se lleva solo lo suyo. Si el tween nace dentro de un `gsap.matchMedia()`, `return () => mq.revert()` — revierte exactamente lo que nació ahí dentro, ScrollTrigger incluido. Si nace suelto y síncrono, `useGSAP` ya lo limpia y no hace falta cleanup. Si nace asíncrono (ver la entrada de arriba), guardar la referencia y matar `tl.scrollTrigger` + `tl`. Regla corta: **si la limpieza nombra `getAll()`, está tocando algo que no es suyo.**
- Confianza: confirmado (numerologia, Fase 3.C — estaba en dos secciones a la vez)
- ⚠ Validar contra código actual.

---

### [animation] `background-attachment: fixed` en capas de sección — el scroll de todo el sitio se siente pesado

- Contexto: Capas decorativas absolutas (grilla, textura, glow) dentro de cada sección, con el patrón anclado al viewport para que las líneas queden alineadas entre secciones. Típicamente en un componente compartido que se monta en cada sección de cada página.
- Causa probable: Anclar el fondo al viewport obliga al navegador a repintar esa capa en **cada frame de scroll** —el patrón se mueve respecto del elemento— y le saca el scroll del compositor. El costo se multiplica por sección: en `blockchain-lab-uai` eran 24 archivos montando dos capas de pantalla completa cada uno. El síntoma no apunta a ninguna página en particular: "todo el sitio se siente pesado", que es justo lo que hace que no se busque en una línea de estilo.
- Pista: `grep backgroundAttachment` / `background-attachment` antes de buscar en el JS. Quitarlo no rompe la alineación vertical (todas las secciones arrancan en x=0) y a alfas decorativos (≤0.03) la diferencia en las horizontales no se ve. Si el anclaje al viewport es innegociable, la capa tiene que ser `position: fixed` recortada por un ancestro con `contain: paint`, no un `background-attachment`.
- Confianza: confirmado (blockchain-lab-uai, jul-2026 — junto con el glow sin batchear)
- ⚠ Validar contra código actual.

---

### [animation] Escribir estilos dentro del handler de `mousemove` — repintados a 120 Hz que se descartan solos

- Contexto: Efectos que siguen al cursor (glow radial, máscara que revela, spotlight) escritos como `element.style.background = ...` directo en el manejador de `mousemove`.
- Causa probable: El `mousemove` llega hasta 120 veces por segundo, muy por encima de los frames que el navegador va a pintar. Cada evento invalida la pintura de la capa —a menudo del tamaño de la sección— y casi todo ese trabajo se descarta en el mismo frame. Si además el handler lee `getBoundingClientRect()` y después escribe, mezcla lectura y escritura de layout en el mismo tick.
- Pista: el handler solo anota la posición (`cursor.current = {x, y}`) y agenda **un** `requestAnimationFrame` con guarda (`if (!frame.current) frame.current = requestAnimationFrame(pintar)`); el rAF se resetea a 0 al entrar y ahí adentro va todo: la lectura del rect y las escrituras. Cleanup con `cancelAnimationFrame` al desmontar. Mismo patrón para `scroll` y `resize`.
- Confianza: confirmado (blockchain-lab-uai, jul-2026)
- ⚠ Validar contra código actual.

---

### [animation] `dependencies: [isMobile]` en `useGSAP` — el reveal se ejecuta dos veces en móvil y las cards parpadean

- Contexto: Componentes con reveal por scroll que además bifurcan el layout con un hook tipo `useIsMobile()` (estado que arranca en `false` y se corrige en un layout effect, para no romper la hidratación). El hook termina copiado a la lista de dependencias del `useGSAP`, se use o no dentro del callback.
- Causa probable: En móvil ese estado cambia `false → true` un render después de montar, y el cambio vuelve a ejecutar el bloque entero. Cada `gsap.fromTo` nuevo tiene `immediateRender`, así que reaplica su estado inicial (`opacity: 0`) sobre un elemento que ya estaba revelado: la card se apaga y se vuelve a animar. Con `revertOnUpdate: true` el parpadeo es el mismo, y sin él quedan además ScrollTriggers duplicados. Se ve como una "recarga" rápida de las secciones justo después de cargar, solo en móvil.
- Pista: `grep "dependencies: \[isMobile\]"`. La dependencia casi nunca se usa dentro del callback: si el callback no lee el breakpoint, se borra. Si lo lee, leer el viewport ahí adentro (`const mobile = window.innerWidth < 768`) en vez del estado — el callback corre en un layout effect, el ancho ya es real. Como el bloque deja de re-ejecutarse, las medidas del primer render (layout desktop) quedan pegadas: un `ScrollTrigger.refresh()` en el primer `requestAnimationFrame` tras montar (una vez, en el provider) las recalcula sin recrear las tweens.
- Confianza: confirmado (blockchain-lab-uai, jul-2026 — 20 componentes)
- ⚠ Validar contra código actual.

---

### [animation] Portar un arreglo de performance a un sitio hermano — el costo es del lenguaje visual, no del sitio

- Contexto: Un sitio del área queda notoriamente más ligero tras una sesión de performance, y se pide "aplicarle ese mismo estándar" a otro. Los dos comparten área, stack y Lore, así que la tarea parece un trasplante de commit.
- Causa probable: Las dos entradas de arriba —y las cuatro restantes de esa sesión: `backdrop-filter` en el velo del modal, `preload: false` en las fuentes, el plugin GSAP registrado sin uso— **no son costos del sitio, son costos de un lenguaje visual concreto.** La capa de patrón anclada al viewport y el `mousemove` que pinta existen porque el lenguaje es retícula técnica con glow que sigue al cursor; un sitio cuya dirección de diseño es papel editorial con gradientes estáticos nunca monta esas capas y por lo tanto **no tiene ese peso que quitar**. Compartir área y stack no predice nada: lo que predice es la dirección de diseño. El riesgo real no es dejar el sitio lento, es el inverso — auditar contra una lista que no aplica, no encontrar nada, y fabricar un cambio para tener entregable.
- Pista: antes de leer una sola línea de animación, **grepear los patrones en el sitio destino**: `backgroundAttachment|backdrop-filter|mousemove|preload:\s*false|registerPlugin`. Cinco greps deciden si la tarea existe. La pregunta que enruta no es *«¿es del mismo área?»* sino **«¿monta este sitio las capas que causaron el costo allá?»** — enunciarla por la categoría (mismo área, mismo stack, mismo Lore) es justo lo que la hace fallar. Y **"ya cumple, no hay commit" es un resultado legítimo y completo** de una tarea de portabilidad: se reporta foco por foco con su evidencia, no se rellena.
- Confianza: confirmado (numerologia auditada contra blockchain-lab-uai, ago-2026 — los cinco focos ya cumplidos, sin herencia: numerologia es un día anterior al commit perf del lab)
- Frontera de validez: aplica a arreglos cuyo costo nace de una **decisión de dirección de diseño** (capas decorativas, efectos de cursor, velos, retículas). Los arreglos de **carga** —fuentes, bundle, peso de imágenes— sí viajan entre sitios sin importar el lenguaje: ahí la lista se aplica completa y sin preguntar.
- ⚠ Validar contra código actual.
