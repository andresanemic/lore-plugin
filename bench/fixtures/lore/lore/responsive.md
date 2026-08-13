# lore/responsive.md — Responsive / Móvil

> Pistas históricas, NO fuente de verdad. Leads a validar, no recetas.
> ⚠ Validar contra código actual antes de actuar.

---

### [responsive] Cursor custom visible en táctil o posición errática

- Contexto: Cursor personalizado (dot que sigue al mouse) implementado con `mousemove`. En tablets/móviles flota en `0,0` o se mueve erráticamente.
- Causa probable: El cursor DOM existe independientemente del tipo de dispositivo. Los eventos de mouse en táctil son sintéticos e impredecibles. En iOS puede quedar visible sin que nadie toque.
- Pista: `window.matchMedia('(pointer: fine)').matches` distingue mouse/trackpad (fine) de táctil (coarse). Si no es `fine`, no montar el cursor. En CSS: ocultar el cursor nativo solo en `@media (pointer: fine)`. `pointer: fine` es más preciso que `navigator.maxTouchPoints` en laptops táctiles con trackpad.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [responsive] Texto MONO uppercase con `letter-spacing` elevado desborda en móvil

- Contexto: Párrafo o subtítulo en fuente monoespaciada uppercase con `letterSpacing` >= `0.12em` y un `<br/>` manual que define la longitud de la primera línea.
- Causa probable: MONO uppercase ya es más ancho que fuentes proporcionales. El letter-spacing acumula espacio extra en cada carácter. El `<br/>` manual fija una longitud de línea diseñada para desktop que en el viewport angosto de móvil supera el espacio disponible. `overflow:hidden` en algún ancestro clipea el desborde.
- Pista: Eliminar `<br/>` manuales en textos MONO uppercase con letter-spacing elevado. Reducir `letterSpacing` si la versión desktop queda demasiado apretada sin el salto manual. Añadir `wordBreak: 'break-word'` como safety net. El browser hace mejor word-wrap automático que un `<br/>` fijo.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [responsive] `<br/>` manual en H2 genera salto de línea incorrecto en móvil

- Contexto: H2 con `<br/>` manuales para controlar el layout en desktop. En móvil, el punto de quiebre natural difiere del impuesto por el `<br/>`, dejando palabras sueltas o líneas muy cortas.
- Causa probable: Los `<br/>` son fijos — no responden al viewport. Lo que queda bien partido en un H2 de `clamp(44px, 6.5vw, 88px)` en 1440px de ancho puede quedar desbalanceado en 390px.
- Pista: JSX condicional por `isMobile`: sin `<br/>` en móvil (el browser hace wrap automático), con `<br/>` en desktop. Revisar sistemáticamente todos los H2/H3 con saltos manuales al auditar la versión móvil — es un patrón que se repite en múltiples secciones.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [responsive] Padding uniforme `clamp()` genera demasiado espacio entre secciones en móvil

- Contexto: Secciones que usan `padding: clamp(96px, 14vh, 136px) ...` sin diferenciación por breakpoint.
- Causa probable: El mínimo del `clamp` (96px) representa ~25% de la altura del viewport en móvil. En columna única el contenido es mucho más corto que en grid desktop. La combinación produce secciones que parecen medio vacías.
- Pista: `clamp()` solo no es suficiente para adaptar el espaciado a móvil — el mínimo sigue siendo grande para pantallas pequeñas. Buscar secciones que no tienen ningún condicional `isMobile` en su padding. El valor estándar para móvil en este proyecto es `48px 24px`.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [responsive] Un hook `useIsMobile` SSR-safe hace que el server pinte SIEMPRE la variante desktop: lo exclusivo de desktop parpadea en móvil

- Contexto: elemento que solo existe en desktop (botón scroll-down, pill de nav, columna lateral) montado condicionalmente con `{!isMobile && …}`, donde `isMobile` viene de un hook con `useState(false)` para ser SSR-safe.
- Causa probable: el server no tiene `window`, así que renderiza con `isMobile = false` — es decir, **con** el elemento. El browser pinta ese HTML y solo después React hidrata, el `useLayoutEffect` corrige a `true` y lo desmonta. Entre el primer paint y la hidratación hay una ventana en la que el elemento es visible en móvil. El hook no está mal: "SSR-safe" significa exactamente "el server asume desktop".
- Pista: el estado inicial de lo exclusivo de desktop debe ser **invisible, no ausente** — `opacity: 0` inline en el wrapper del JSX. En móvil se desmonta antes de que el usuario lo vea; en desktop el `fromTo` de GSAP lo lleva a `opacity: 1` al inicializar. **El callejón que no hay que volver a recorrer:** inicializar el hook con `() => typeof window !== 'undefined' ? window.innerWidth < bp : false` sí elimina el flash, pero el server sigue renderizando `false` y el cliente el ancho real → **hydration mismatch**. Cambia un bug visible por un error de React: no es una salida, es un intercambio.
- Confianza: confirmado (`blockchain-lab-uai`, botón scroll-down del hero)
- ⚠ Validar contra código actual.

---

### [responsive] Panel de altura fija dimensionado contra su contenido más largo: el resto queda con aire, y agrandar el texto a ojo mete scroll en las pantallas bajas

- Contexto: un panel/modal/ficha de medida fija (`min(92svh, 860px)`) que muestra N contenidos de largo desigual. Se dimensionó contra el más largo para que ninguno necesite scroll, así que a los cortos les sobra espacio abajo. Cuando se pide "aprovechar ese aire y agrandar el texto", subir el `font-size` a un valor fijo mayor arregla la pantalla donde se probó y **rompe la más baja**.
- Causa probable: el panel no mide siempre lo mismo. En una pantalla alta llega a su tope en px (860) y al contenido más largo le sobran ~120px; en un portátil bajo el `svh` manda y el panel se queda en ~730px, donde ese mismo contenido ya iba al límite. El aire que se ve **no es del diseño, es de la pantalla**: probar el cambio en un solo monitor no dice nada del otro.
- Pista: atar la tipografía a la altura del panel con `clamp(<valor de hoy>, <n>svh, <techo>)`. El **mínimo es el valor actual** (en la pantalla baja no cambia nada: cero regresión, no hay que re-verificar) y el **máximo lo fija el contenido más largo** cuando el panel llega a su tope. Todas las instancias comparten tamaño en una misma pantalla y el techo lo pone siempre el peor caso. Llevar a `svh` también el `padding` del cuerpo y los `gap`, para que cedan altura donde falta y mantengan el aire donde sobra; y bajar el `line-height` un par de centésimas, porque a mayor cuerpo hace falta menos aire relativo y eso devuelve parte de la altura que suma el tamaño. Medir antes de elegir el techo: contar caracteres de los campos del peor caso, no estimarlo a ojo.
- Confianza: confirmado (`blockchain-lab-uai`, ficha del muestrario: 16 proyectos, techo puesto por "Trazabilidad de capacitaciones" con 311 caracteres de propuesta y 419 en hechos, 2026-07-25)
- ⚠ Validar contra código actual.
