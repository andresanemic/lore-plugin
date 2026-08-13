# lore/scroll.md — Lenis / Scroll nativo

> Pistas históricas, NO fuente de verdad. Leads a validar, no recetas.
> ⚠ Validar contra código actual antes de actuar.

---

### [scroll] Lenis + ScrollTrigger desincronizados / salto al volver al tab

- Contexto: Cualquier proyecto con Lenis y GSAP ScrollTrigger activos simultáneamente.
- Causa probable: Lenis y GSAP corren sus propios `requestAnimationFrame` independientes. ScrollTrigger lee `window.scrollY` pero Lenis lo interpola en su propio tick — si los ticks no están sincronizados, ScrollTrigger lee valores obsoletos. El salto al volver al tab lo causa `gsap.ticker.lagSmoothing()` por defecto: GSAP "compensa" el tiempo transcurrido en segundo plano saltando hacia adelante.
- Pista: Verificar si Lenis está atado al ticker de GSAP (`gsap.ticker.add(...)`) y si `lagSmoothing(0)` está activo. Sin esto, cualquier scrub o animación ligada al scroll puede desincronizarse. Si el síntoma aparece solo al volver de una pestaña en segundo plano, sospechar del lagSmoothing.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [scroll] `lenis.scrollTo()` no disponible en componentes hijos

- Contexto: Componente profundo (dot, botón, link) que necesita llamar `lenis.scrollTo()` pero la instancia vive en el Provider raíz.
- Causa probable: Lenis instanciado en Provider sin exponer la instancia a hijos sin boilerplate.
- Pista: Buscar cómo se accede a la instancia de Lenis en componentes que no son el Provider. Si el acceso no está encapsulado en un Context o en una referencia global, el componente hijo puede no encontrar la instancia. Un fallback a `window.scrollTo` garantiza que si Lenis no está disponible (SSR, error), la navegación no se rompe.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [scroll] Scrollbar flash de ~15px al desbloquear scroll del body

- Contexto: Menú u overlay que bloquea el scroll con `document.body.style.overflow = 'hidden'` y lo restaura al cerrar.
- Causa probable: Restaurar con `overflow: 'auto'` fuerza un valor que puede no coincidir con el estado CSS original del body. El browser recalcula si necesita scrollbar, genera un layout shift horizontal de ~15px.
- Pista: Buscar `document.body.style.overflow = 'auto'` (o cualquier valor no vacío) en funciones de cierre. El string vacío `''` elimina el inline style y devuelve el control al CSS, sin el flash. Si el síntoma es un desplazamiento horizontal al cerrar un menú, este es el candidato.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [scroll] LenisProvider intercepta clicks de anchor que el componente ya manejó

- Contexto: Cualquier componente que registra su propio handler en links `href="#..."` y llama `e.preventDefault()`.
- Causa probable: `LenisProvider` registra un listener en `document` para todos los `a[href^="#"]`. `e.preventDefault()` en React previene el comportamiento nativo del browser pero no cancela los listeners en `document`. Resultado: el scroll de Lenis arranca en paralelo con cualquier lógica custom del componente.
- Pista: Buscar si `LenisProvider` tiene un guard `if (e.defaultPrevented) return` como primera línea del handler. Sin ese guard, cualquier componente que maneje sus propios links internos con `preventDefault` luchará contra el scroll de Lenis. El evento en React se procesa antes de llegar a `document`, por lo que el guard funciona correctamente.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [scroll] Guard `isFirstPath` en `useEffect([pathname])` — FPL con hash queda sin corrección si el guard no discrimina hash

- Contexto: Provider de scroll (Lenis u otro) con `useEffect([pathname])` que usa `isFirstPath` para distinguir FPL de soft navigation. Si el FPL llega con hash (`/#seccion`), el guard `if (isFirstPath) return` lo trata idéntico a un FPL sin hash y aborta la corrección de posición.
- Causa probable: `isFirstPath` captura si es la primera ruta cargada, no si hay hash en la URL. El browser hace auto-scroll nativo al hash antes de que GSAP instale el pin-spacer; cuando el pin-spacer dobla la altura del documento, el viewport queda desplazado y el bloque de corrección nunca corre porque el efecto hizo return incondicionalmente.
- Pista: Si el síntoma es "navego a `/#seccion` y aterrizo en la sección equivocada en FPL (pero no en soft nav)", buscar un `if (isFirstPath) return` sin discriminar hash. La fix canónica es `if (isFirstPath && !window.location.hash) return` — deja pasar los FPL con hash al bloque de corrección (`setTimeout → ScrollTrigger.refresh() → lenis.scrollTo(hash)`). El timeout debe dar margen suficiente para que GSAP instale pin-spacers antes de llamar a `scrollTo`.
- Confianza: conjetura (INC-001 Etapa 3 — RC-8, primera aparición)
- ⚠ Validar contra código actual.

---

### [scroll] Contenido invisible + scroll en posición incorrecta al navegar entre páginas

- Contexto: SPA con Lenis y GSAP ScrollTrigger. Al navegar de una página a otra, la nueva página puede mostrar contenido en `opacity:0` (animaciones no disparadas) o arrancar mid-scroll.
- Causa probable: Lenis persiste entre rutas — al navegar, mantiene la posición de scroll del origen. `ScrollTrigger` del nuevo render desconoce las dimensiones reales del documento. El browser intenta restaurar la posición de scroll en navegación atrás, conflictuando con Lenis.
- Pista: Buscar si hay lógica que llame `lenis.scrollTo(0, { immediate: true })` y `ScrollTrigger.refresh()` en cada cambio de ruta. Sin ese reset, la nueva página puede heredar el estado de scroll de la anterior. También verificar `window.history.scrollRestoration = 'manual'` al inicializar Lenis.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [scroll] El botón Atrás no ejecuta NINGÚN `useEffect`: una corrección de scroll colgada de `useEffect([pathname])` es inerte

- Contexto: SPA (Next App Router) donde se quiere corregir la posición de scroll al volver atrás desde una página interna. El instinto es escribir la corrección en el `useEffect([pathname])` del provider de scroll.
- Causa probable: un Atrás entre dos entradas de historial puede resolverse **sin re-render de React**: la traza real mostró `popstate` sin `effect` posterior, sin remontaje del provider y sin `pageshow`. `usePathname()` no cambia a tiempo (o no cambia), así que el efecto nunca se dispara. El código es correcto y simplemente no corre.
- Pista: antes de escribir una corrección de scroll para el Atrás, **verificar que el efecto corre**: un `console.warn` al entrar. Si no aparece, ninguna versión de esa corrección funcionará jamás y se pueden quemar varias iteraciones "arreglando" código muerto. Lo que sí corre en ese momento: los listeners de `window` (`popstate`, `pageshow`, `hashchange`). Corolario de diseño: si un comportamiento de navegación **debe** ocurrir, colgarlo de un listener de `window`, no del ciclo de vida de React.
- Confianza: confirmado (blockchain-lab-uai INC-004, 2026-07-25)
- ⚠ Validar contra código actual.

---

### [scroll] `popstate` también dispara al clickear un ancla in-page — no sirve como detector de "atrás"

- Contexto: se quiere distinguir "el usuario pulsó Atrás" de "el usuario clickeó un link", para tratar la vuelta a la landing de otra manera. `popstate` parece el evento obvio.
- Causa probable: un click en un enlace de sección (`<a href="#seccion">` / `<a href="/#seccion">`) empuja una entrada de historial y **emite `popstate` ~1ms después del click** (medido: `click href=/#proyectos` a 1944ms → `popstate` a 1945ms). El evento es idéntico al del Atrás: no trae discriminante.
- Pista: usar `popstate` como "esto es un atrás" hace que cualquier corrección aplicada ahí (limpiar el hash, forzar el top) **se ejecute también al navegar por el navbar**, y rompa la navegación a secciones — un fallo peor que el que se venía a arreglar. Si de verdad hace falta distinguirlos, las vías son la Navigation API (`navigation.addEventListener('navigate', e => e.navigationType === 'traverse')`, soporte reciente), `performance.getEntriesByType('navigation')[0].type === 'back_forward'` (solo full page load), o una heurística de "hubo un click en un `<a>` en los últimos ~300ms". Antes de todo eso, preguntarse si el problema se puede eliminar en origen (→ pista del hash en la URL).
- Confianza: confirmado (blockchain-lab-uai INC-004, 2026-07-25)
- ⚠ Validar contra código actual.

---

### [scroll] Escribir el hash en la URL al navegar por secciones envenena el Atrás cuando GSAP instala pin-spacers

- Contexto: landing con secciones ancladas y una sección pinneada con ScrollTrigger (`pin: true`), más páginas internas. El navbar usa `<a href="#seccion">`, así que la landing queda registrada en el historial como `/#seccion`.
- Causa probable: al volver atrás a `/#seccion`, el browser hace scroll al ancla **antes de que GSAP instale los pin-spacers**. Sin el spacer el documento es ~1 viewport más corto, así que esa posición cae mucho más abajo en términos relativos: se aterriza en el footer. Medido: se salía de la sección en `y=4419` y se volvía a `y=4007`, con un scroll animado de ~1s. Ningún `useEffect` corre para corregirlo (→ pista del Atrás).
- Pista: la salida barata no es detectar el Atrás ni pelear con el timing, es **no escribir el hash**: un interceptor único de clicks (`document.addEventListener('click')`) que haga `e.preventDefault()` + `target.scrollIntoView()` para `a[href^="#"]` (y `a[href^="/#"]` en la home). La landing ocupa entonces **una sola entrada de historial** (`/`, nunca `/#seccion`) y el Atrás vuelve limpio, sin scroll al ancla que pueda desfasarse. El interceptor debe: respetar `e.defaultPrevented` (los componentes con handler propio ganan), ignorar `ctrl/cmd/shift/alt+click` y botón no primario (abrir en pestaña nueva), y dejar pasar `href="#"`. Coste aceptado: la URL deja de reflejar la sección mientras se recorre la landing; los deep links externos a `/#seccion` siguen entrando bien (los atiende el bloque de hash del provider con su `ScrollTrigger.refresh()`).
- Confianza: confirmado (blockchain-lab-uai INC-004, 2026-07-25)
- ⚠ Validar contra código actual.

---

### [scroll] `scrollRestoration = 'manual'` es una ley de Lenis, no del sitio: al quitar Lenis hay que devolverlo a `'auto'`

- Contexto: proyecto que retira Lenis y pasa a scroll nativo. El provider heredado trae `window.history.scrollRestoration = 'manual'` de su etapa con Lenis.
- Causa probable: esa línea existe porque la restauración nativa del browser peleaba con el estado interpolado interno de Lenis. Sin Lenis no hay contra qué proteger, y lo único que hace es **anular el Back**: el browser deja de restaurar la posición y toda vuelta aterriza arriba. El síntoma se disfraza de "el back no funciona" y se busca en el código de la SPA, no en una línea de una etapa anterior.
- Pista: al retirar una librería de smooth scroll, auditar qué defensas del código existían **por ella** y caducan con ella (`scrollRestoration`, sync con el ticker de GSAP, listeners de anchors). Una defensa huérfana no es neutra: sigue apagando el comportamiento nativo que ahora sí queríamos. `gsap.ticker.lagSmoothing(0)` es la excepción: no era de Lenis y se queda.
- Confianza: confirmado (blockchain-lab-uai, 2026-07-25)
- ⚠ Validar contra código actual.

---

### [scroll] `behavior: 'auto'` hereda el `scroll-behavior: smooth` del CSS — el salto instantáneo deja de serlo

- Contexto: sitio con `html { scroll-behavior: smooth }` en CSS y algún scroll programático que debe ser **instantáneo** (saltar bajo un overlay, resetear al top al cambiar de ruta).
- Causa probable: en `scrollTo`/`scrollIntoView`, `behavior: 'auto'` no significa "instantáneo" sino "usa el valor computado del CSS" — que aquí es `smooth`. El salto que se creía inmediato pasa a ser una animación visible, y bajo un overlay de transición se ve como si la página se moviera sola.
- Pista: `behavior: 'instant'` explícito donde se quiere salto seco; `behavior: 'smooth'` donde se quiere animación. Y una tercera opción útil: **`scrollIntoView()` sin argumentos** hereda el CSS, lo que hace que `@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto } }` apague la animación **gratis** — preferible a pasar `'smooth'` explícito, que ignora la preferencia de accesibilidad y obliga a comprobar `matchMedia` a mano en cada llamada.
- Confianza: confirmado (blockchain-lab-uai, 2026-07-25)
- ⚠ Validar contra código actual.

---

### [scroll] La ausencia de `scroll-behavior: smooth` no se lee como «falta una animación» sino como «el sitio va a saltos» — y esconde la falta de `scroll-margin-top`

- Contexto: sitio con navbar fijo cuyos enlaces son anclas a secciones de la misma página (`/#metodo`, `/#precios`). No hay ninguna librería de scroll y nadie declaró `scroll-behavior`. El usuario reporta que «navegando se siente peor» que otro sitio del área, y como el reporte llega junto a la palabra *scroll*, se audita rendimiento: pintura, listeners, peso. No aparece nada, porque no hay nada.
- Causa probable: el default del navegador para un ancla es un **salto instantáneo**, y un salto instantáneo no comunica distancia. Quien lo usa no percibe «una transición ausente» —percibe que el sitio cambió de sitio sin él, que es indistinguible de un fallo. Por eso el reporte llega con vocabulario de rendimiento y manda a auditar el lugar equivocado: **es un defecto de continuidad disfrazado de defecto de velocidad**. Y encima tapa un segundo defecto: sin `scroll-margin-top`, el ancla aterriza **debajo** del header fijo y el titular de la sección a la que fuiste queda oculto. Con el salto seco eso es invisible —apareces ya mal colocado y no hay con qué comparar—; solo se ve cuando el scroll es suave y puedes mirar dónde frena.
- Pista: si el nav tiene anclas, **las dos reglas van juntas o ninguna sirve**: `html { scroll-behavior: smooth }` (nativo, sin librería) más `scroll-margin-top` en los destinos, con el alto real del header fijo más aire. El suavizado se **apaga** con `@media (prefers-reduced-motion: reduce)`, nunca se acorta. Y arreglar solo el primero destapa el segundo, así que se comprueban en el mismo pase. Corolario de diagnóstico, más caro de aprender que la regla: cuando alguien dice que un sitio «va lento», preguntar **qué acto** produce la sensación antes de medir nada — *«al hacer scroll»* y *«cuando voy navegando por el menú»* mandan a dos sitios distintos del código, y solo el segundo apunta acá.
- Confianza: confirmado (`numerologia` contra `blockchain-lab-uai`, ago-2026)
- Frontera de validez: aplica a navegación **in-page por anclas**. Un sitio cuyo nav va a rutas distintas no tiene este defecto — ahí el salto es correcto y lo que hay que cuidar es lo contrario, que el smooth no se filtre al cambio de ruta.
- Hereda su compañera obligatoria de [routing.md](routing.md): activar `scroll-behavior: smooth` **exige** `data-scroll-behavior="smooth"` en el `<html>`, o Next no puede desactivarlo al cambiar de ruta y la página nueva se desliza desde la posición anterior. Esa pista tiene su propia frontera y esta no la anula: son la misma decisión mirada desde los dos lados, y activar una sin la otra cambia un defecto por otro.
- ⚠ Validar contra código actual.
