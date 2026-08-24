# Principios — Leyes invariantes de construcción (área `desarrollo-web`)

> El **cómo se construye siempre**, en todo sitio. No es el "qué somos" (eso es
> `identidad.md`) ni una pista puntual (eso son los módulos). Son leyes que no se
> renegocian por tarea.
> La base aplica a cualquier sitio. La **Variante SaaS** (al final) añade sus leyes
> de backend; solo aplica a una SaaS web (login + suscripción + área privada).

---

## Postura (recordatorio — el detalle lo cubren las skills)

Pensar antes de codear · simplicidad primero (YAGNI) · cambios quirúrgicos ·
ejecución verificable (TDD). No se re-explica aquí: lo enseñan `brainstorming`,
`writing-plans` y las skills de ejecución. Este bloque es solo el norte de conducta.

---

## Leyes de stack (Next App Router + TypeScript + Tailwind v4 + GSAP)

- **Tailwind sin config:** tokens en `@theme {}` dentro de `globals.css`. No hay `tailwind.config.ts`.
- **Valores dentro de la escala:** un valor fuera de escala (`duration-400`) no genera utilidad → cambio silencioso. Usar la escala o corchetes (`duration-[400ms]`).
- **GSAP + SSR:** centralizar en `lib/gsap.ts` con guard `if (typeof window !== 'undefined')`. Los plugins tocan `window`.
- **FOUC:** estado inicial como `style` inline **antes** de que GSAP corra. Usar `gsap.fromTo`, nunca `gsap.from`.
- **`100svh`** (no `100vh`) en secciones full-height, por iOS Safari.
- **`overflow-x: hidden`** en `html` **y** `body` para bloquear deriva lateral en móvil.
- **Pin en móvil:** desactivar `pin:true` con guard `isMobile`. Con fondo oscuro + pin, `anticipatePin:1`.
- **App Router:** `params` y `searchParams` son `Promise` → `await params` en rutas dinámicas.
- **`<br/>` en H2:** JSX condicional, nunca breakpoint Tailwind.
- **Hydration:** nada de `Date.now()`/aleatorio en el render inicial → estado `null` + `useEffect` cliente.

## Leyes de motion

- Motion **con propósito** (guiar, revelar, reforzar); jamás decorar por decorar.
- Respetar `prefers-reduced-motion` **siempre**.
- Reveal al entrar en viewport + microinteracción hover en todo elemento interactivo.
- **Solo `transform` y `opacity`.** Nunca animar `width`/`height`/`top`/`left` (reflow por frame).
  Corolario ya confirmado: barra de progreso con `scaleX`, no con `width`.
- **Tokens de tiempo, no números al azar.** Microinteracción 150-300ms; transición compleja ≤400ms;
  nada por encima de 500ms. El mismo par duración/easing se reutiliza en todo el sitio — el ritmo
  es parte de la marca.
- **Easing con dirección:** `ease-out` al entrar, `ease-in` al salir. Nunca `linear` en UI.
- **La salida es más rápida que la entrada** (~60-70% de su duración): así el sitio se siente ágil.
- **Stagger 30-50ms** por ítem en listas/grillas. Ni todo de golpe ni una procesión.
- **La animación no bloquea.** El input del usuario la interrumpe o la ignora; nunca la espera.
- **La animación no causa layout shift.** Si mueve la caja, está mal hecha.
- **`window.addEventListener('scroll')` está prohibido.** Corre en cada frame, sin batching, y
  mata el rendimiento en móvil. Se usa ScrollTrigger, `IntersectionObserver` o animaciones CSS
  con `animation-timeline`. Igual de prohibido: calcular progreso con `window.scrollY` en estado
  de React, o un `requestAnimationFrame` que toca estado de React.
- **Cada animación se justifica en una frase.** Jerarquía, narración, feedback o cambio de estado.
  Si la única respuesta es "queda bien", se borra. Motion disponible no es motion obligatorio.
- **Un solo marquee por página.** Dos o más se leen como relleno.

## Leyes de accesibilidad e interacción (piso no negociable)

> Esto no se "aplica con criterio": es el piso. Un sitio premium que falla aquí no es premium.

- **Focus visible, siempre.** Jamás `outline: none` sin reemplazo. El focus ring es un token
  del sistema (y en sitio que alterna superficies, un **par** — ver abajo), no un accidente del navegador.
- **Área táctil ≥ 44×44px** en todo elemento interactivo, con ≥ 8px de separación entre targets.
  El icono puede ser de 20px; su zona de toque, no.
- **Nada depende del hover.** El hover enriquece; nunca es el único camino a una acción.
- **El color nunca es el único portador de significado** (error, éxito, estado activo): siempre
  acompañado de icono, texto o forma.
- **Formularios**: label visible (nunca solo `placeholder`), error **debajo del campo** que lo causó,
  validación al `blur` (no en cada tecla), y el mensaje dice **causa + cómo arreglarlo** — no
  "Entrada inválida". Estado de carga en el submit; estado disabled visualmente inequívoco.
- **Un solo CTA primario por pantalla.** Lo demás es visualmente subordinado.
- **CLS = 0.** Toda imagen declara `width`/`height` o `aspect-ratio`; todo contenido async
  reserva su espacio. Fuentes con `font-display: swap`.
- **Iconos SVG de una sola familia por proyecto**, con grosor de trazo (`1.5` o `2`) y tamaños
  tokenizados. Preferir trazo fino y preciso (Phosphor, Tabler, Radix); Lucide solo si el proyecto
  ya depende de ella. **Nunca emoji como icono. Nunca dibujar paths de icono a mano**: si falta un
  glifo, se instala otra librería. No se mezclan dos familias en el mismo árbol.

## Leyes de calidad y SEO

- **SEO inline:** cada página/sección nace con metadata, JSON-LD y `alt` en imágenes. La checklist
  ejecutable (técnico, schema, sitemap/robots/feed, GEO, imágenes) es `seo.md`; la auditoría de
  cierre **consolida**, no descubre.
- Validar **contraste** texto/fondo en cada sección nueva.
- **Acento midtone ≠ texto.** Un color de acento de tono medio (p. ej. mocha `#A47864`)
  sirve como relleno/borde pero **falla WCAG como texto** (~3:1). Partirlo en roles:
  acento decorativo · variante *strong* oscurecida (texto-segura AA) · relleno de botón
  con contraste garantizado (texto fijo) en claro **y** oscuro. Un solo token de acento
  no cubre las tres. Confirmado (`muestrario-estilos`, rediseño Warm Atelier).
- **En un sitio que alterna superficies, el CTA primario es un par de tokens, no uno.**
  Si el sitio alterna secciones oscuras y claras por diseño, un único color de botón
  falla en una de las dos. El CTA **invierte con la superficie**: sobre oscuro, relleno
  de acento con texto oscuro; sobre claro, relleno del fondo profundo con texto claro.
  Lo mismo el **focus ring**. Y el contraste se **calcula**, no se estima a ojo: verificar
  cada par (default/hover/pressed, y cada fondo real donde el botón aparece) contra AA
  antes de escribir el token. Confirmado (Introspection Solutions: el CTA violeta huérfano
  se descartó y el dorado que iba a reemplazarlo daba 1.71:1 sobre parchment). El chequeo
  de CTA huérfano —el que atrapa esto en Fase 1— vive en `investigacion.md` §1.6.
- Sin **eyebrows** sobre títulos. Sin **mono** como cuerpo.
- **Los tres candados de un sitio** (un acento, una escala de radios, un tema) se deciden una vez
  y no se renegocian por sección. Detalle y catálogo de *tells* de composición: `composicion.md`.

## Leyes de operación

- Nunca hardcodear claves. Si falta una env var, lanzar **error descriptivo**.
- **`git push` solo cuando el usuario lo indique.** Commits locales, sí; push, no, salvo orden explícita.
- **No usar Playwright.** Validación visual/funcional siempre manual, por el usuario.
- **Imágenes:** copiar a `public/` con **nombre nuevo (bump `-vN`)** y actualizar todas las refs. Nunca reusar el nombre (caché de `next/image`).

## Leyes de método (arranque con el cliente)

- **Muestrario de estilos como herramienta de dirección.** El **muestrario de estilos** —
  herramienta genérica y pública (repo `muestrario-estilos`, en vivo:
  https://muestrario-estilos.vercel.app/) — se envía al cliente en **Fase 1**, antes de investigar
  y antes de diseñar. El cliente explora las paletas y las parejas tipográficas, marca con la
  estrella hasta **5 paletas** y hasta **5 tipografías**, y comparte su selección con el botón
  *"Copiar mi selección"* (habitualmente por WhatsApp).

  Esa selección tiene **dos consumidores, ambos en Fase 1**:
  1. **Filtra la búsqueda de referencias** — el benchmark se busca cruzando el estilo elegido
     por el cliente con el rubro del proyecto, no por gusto del constructor.
  2. **Es el input base del brandkit inicial** — paleta y tipografías nacen de ahí.

  La dirección de diseño no arranca desde cero: la **Fase 2 valida y afina** lo que el muestrario
  ancló, no vuelve a elegir. Un proyecto que llega a Fase 2 sin selección del cliente está
  eligiendo por él. Ver el workflow completo en `investigacion.md` §0.

- **La selección del cliente se transcribe al repo antes de escribir el brandkit.** Vive en
  `material-marca/01-investigacion/seleccion-<cliente>/`, en `paletas-seleccionadas.md` y
  `tipografias-seleccionadas.md`: cada paleta con sus hex, su etiqueta de rubro y el token que
  produjo — **y los swatches que no se adoptaron, con su porqué**; cada par tipográfico con su
  título, su cuerpo y su etiqueta; y **literal, la frase con que el cliente explicó su mezcla**
  (es una instrucción, no un gusto). **Una captura en Miro, un PDF o un WhatsApp no son archivo:**
  si la selección no está en el repo en texto, el brandkit se escribe a ciegas y la Fase 2 hereda
  el sesgo. Detalle en `investigacion.md` §0.2.

- **La etiqueta de rubro de una paleta es un descarte declarado.** El cliente la elige **a pesar**
  de su rubro, no por él: la marca vive en el punto donde ninguna de las paletas elegidas se
  reconoce a sí misma.

- **Cada decisión de la dirección de diseño debe poder citar su fuente** — la selección del
  muestrario o la entrevista. **Una decisión que no puede citarse es del constructor, no del
  cliente**, y es indefendible ante él aunque sea correcta.

- **El elemento central del proyecto no puede quedar sin decidir.** Aquello que el sitio no puede
  evitar mostrar —el número en numerología, el producto en una tienda, la foto en un estudio— tiene
  que estar resuelto en la visión y tener carpeta en el moodboard. Es lo primero que el sesgo del
  constructor se salta, porque es lo más cargado de cliché y evitarlo por omisión se siente como buen
  gusto. **Lo que no se decide lo decide el default, y el default es el cliché.** Ver
  `investigacion.md` §0.3.

- **La Fase 2 se audita antes de enseñarse. Puerta dura, y va primero.** El agente **`auditor-diseno`**
  (modelo **Fable 5**, corre **inline**) entra como **director de diseño y UX/UI premium con criterio
  de jurado de Awwwards**, y juzga dos cosas: **hacia atrás**, que cada decisión de la Fase 2 sea
  coherente con los artefactos de la Fase 1 (entrevista, selección del muestrario, brandkit inicial,
  benchmark) y pueda **citar su fuente**; **hacia adelante**, que lo que hay sea un sitio *destacable*
  y no una plantilla premium bien pintada. Va **antes** del brandkit web por una razón simple: el
  brandkit web **es** la marca ante el cliente, y una aprobación sobre material que no resiste el
  examen no vale nada. Lo que levante se cierra, o se escribe por qué no.

- **La Fase 2 cierra con un mini-brandkit web aprobado por el cliente. Es la segunda puerta dura: sin
  él no se programa.** Un HTML sencillo y autocontenido, desplegado en Vercel, que enseña la marca
  **funcionando**: paleta con su regla de uso, escala tipográfica en vivo, los tres candados,
  botones y estados en sus dos superficies, una muestra de motion y la dirección del moodboard en
  imágenes. Un `.md` no es una marca: describe una intención, y el cliente aprueba lo que imagina, no
  lo que va a recibir. **La aprobación se pide explícita y se registra en el `FASES.md` del proyecto
  (fecha + qué se aprobó): eso es el contrato de diseño**, y es lo que sostiene un "esto ya lo
  aprobaste" en Fase 3. Checklist ejecutable: `_starter/FASES.md` §2.5.

- **La Fase 2 se le enseña al cliente en web, y su envoltorio es neutro.** Los artefactos de la Fase 2
  (visión, moodboard, explicación, brandkit) están escritos para el constructor: hablan de candados, de
  hex, de tokens muertos y de contrastes calculados. Son la cocina. **Si el cliente aprueba un documento
  interno, no aprobó la dirección: aprobó que confía en ti**, y una confianza no se puede citar tres
  meses después. Se le enseña en un sitio de una página, en su idioma. Y el envoltorio de esa página es
  **neutro** (papel/tinta, tipografía de sistema, ni un hex del proyecto): si la entrega va pintada con
  la paleta, el cliente no puede distinguir si le gusta el tablero o le gusta el marco, y en el
  mini-brandkit (2.6) el marco competiría con exactamente lo que se juzga. **La pared de la galería es
  blanca en las dos entregas: el envoltorio nunca adelanta, nunca compite y nunca pinta aquello que el
  cliente tiene que juzgar.** La herramienta es la skill del área `entrega-cliente`.

- **La respuesta del cliente vuelve como texto y se archiva en el repo.** La entrega trae su propio
  mecanismo de vuelta —un veredicto por bloque, copiable al portapapeles, sin backend ni formulario de
  terceros— y ese bloque se transcribe al repo. **Una aprobación que no se puede citar no existe**: es
  la misma ley que la selección del muestrario (`investigacion.md` §0.2), un escalón más abajo. Si el
  cliente responde suelto por WhatsApp, se transcribe igual: el archivo es obligatorio, el mecanismo
  solo lo hace fácil.

## Leyes de método (ejecución de fases)

- **`FASES.md` es estado, y el estado envejece contra el trabajo.** Una Mini-Fase se redacta cuando
  todavía no se ha hecho, y el trabajo de las fases anteriores la desactualiza **por los dos lados a
  la vez**: acaba **pidiendo lo que ya está hecho** y **no pidiendo lo que cambió**. La segunda mitad
  es la cara peligrosa, porque no se nota: un checklist que pide de más se descubre al abrir el
  archivo, uno que pide de menos se descubre en la auditoría.

  > **La ley: antes de ejecutar una Mini-Fase se relee su checklist contra los artefactos que dice
  > tocar, y se reescribe si mienten. Después de ejecutarla ya no sirve de nada** — el trabajo se
  > hizo contra la lista vieja.

  **El síntoma que lo delata, y es greppable:** el ítem cita un documento **por su número de
  sección** (*«cerrar los tokens que el brandkit dejó pendientes (§6.3)»*). **Esa cita es un puntero
  a una versión**, y el documento se versionó sin avisarle. Si un ítem de `FASES.md` cita una sección
  concreta, ábrela antes de trabajar: si el documento va por la v2, la sección que el ítem nombra
  puede no existir ya.

  **Dos casos, en dos fases consecutivas del mismo proyecto** (`numerologia`, Fase 2):
  - **2.1.5** pedía *«que la clienta elija una de las direcciones»* cuando la visión ya las había
    colapsado en **un sistema de cuatro mundos que van juntos**. No había una de cuatro que elegir, y
    la propia entrega se lo decía a la clienta con esas palabras. **El pendiente de `FASES.md` y el
    guion de la entrega se contradijeron durante dos días y nadie lo vio.**
  - **2.2** pedía cerrar seis pendientes que el brandkit **ya había cerrado** —su propia sección de
    validación decía *«no queda ningún abierto»*— y citaba una proporción que ese mismo documento
    había sustituido al versionarse. Mientras tanto **no pedía lo único que faltaba de verdad**:
    reconciliar el brandkit con la visión nueva, que lo contradecía en una ley entera.

  **Corolario, del segundo caso:** cuando un documento derivado se versiona (brandkit v1→v2, visión
  v4→v5), **el checklist que lo consume es parte del blast radius**. Se revisa en el mismo commit que
  la versión nueva, no dos fases después.

- **Un documento contradicho por evidencia posterior no se reescribe: gana un apéndice fechado.**
  El método **vuelve sobre sus pasos dos veces por proyecto, y las dos son estructurales**: la visión
  de diseñador (Fase 2) puede desautorizar al benchmark (Fase 1), porque nace después; y el veredicto
  del cliente (2.1.6) puede desautorizar a la visión, porque el cliente no la escribió. **No son
  imprevistos: son el método funcionando.** El reflejo —abrir el documento viejo y dejarlo diciendo
  la verdad de hoy— es el error.

  > **Por qué el reflejo está mal:** la auditoría de Fase 2 verifica **cada decisión contra sus
  > fuentes**. Si el documento auditado se reescribe **desde su propia consecuencia**, la auditoría
  > compara la visión contra un documento reescrito desde la visión. **Se vuelve tautológica: pasa
  > siempre y no detecta nada.** Y se pierde lo único que prueba de quién fue cada decisión — que es
  > la ley madre de `investigacion.md` §0.2, aquí en su forma verificable.

  **Los tres niveles, y la regla que los separa** *(la pregunta correcta no es «¿está desfasado?»
  sino «¿la auditoría mide con él o lo mide a él?»)*:

  | Nivel | Qué es | Qué se le hace |
  |---|---|---|
  | **Fuente primaria** | Lo que dijo el cliente: entrevista, selección del muestrario, veredicto | **No se toca jamás.** Se transcribe literal y se archiva |
  | **Documento contra el que se audita** | Visión de diseñador, benchmark, wireframe | **Apéndice fechado.** El original queda como registro de lo que se pensaba y por qué |
  | **Documento derivado, que cita sus fuentes** | Brandkit | **Reescritura con changelog.** Es lo auditado, no el patrón de medida |

  **El apéndice conserva la autoría, y ése es su trabajo real.** En el wireframe de `numerologia` la
  §7.5 (*«propuesta a validar con la clienta»*) se conservó entera y el reparto real entró como §7.6:
  hoy el documento dice **qué propuso el constructor y qué contestó ella**, que es exactamente lo que
  una reescritura habría borrado. Un documento reescrito no miente sobre el presente — **miente sobre
  quién decidió**.

  **Aplicado tres veces en `numerologia`, Fase 2, con el mismo argumento re-derivado desde cero cada
  vez** (de ahí esta ley): la visión v5 como apéndice de la v4 · el §«Veredicto de Fase 2» del
  benchmark · la §7.6 del wireframe.

- **El template no se prueba solo: el proyecto que lo estrena es su única prueba, y lo aprendido
  tiene que volver.** Un scaffold (`_starter/`) se escribe una vez y se copia muchas, y **nadie lo
  ejecuta jamás como proyecto**. Sus fallos no aparecen en él: aparecen en el primer proyecto que lo
  estrena, **se arreglan ahí**, y el template se queda con el fallo intacto, listo para copiarlo al
  siguiente.

  > **La ley: cerrar una Fase incluye preguntar qué de lo aprendido era del template**, y devolverlo
  > en el mismo movimiento. Si el arreglo se queda solo en el proyecto, el template no envejeció:
  > **se bifurcó** — y la próxima vez cuesta lo mismo otra vez, a alguien que no estaba.

  **Y el corolario, que es el hallazgo de verdad: un template no ejecuta sus propias puertas.** Se
  corren contra los proyectos, nunca contra el scaffold. **Córrelas contra el template.**

  **Lo que encontró la primera revisión real del `_starter` de esta área** —después de dos fases de
  `numerologia`, y ninguno de los cinco se había reportado nunca:
  - **2.1.5 pedía «elegir una de las direcciones».** El ítem se rompió en `numerologia`, se arregló
    en `numerologia`, y el template siguió con el bug.
  - **22 rutas al lore sin `../../`**, apuntando al lore local del proyecto, que no tiene módulos
    temáticos. `numerologia` las corrigió en su copia; el template no se enteró.
  - **El ritual imponía la paleta de otro proyecto** (*«regla cálida/energía sobre base fría»*): un
    valor de proyecto fosilizado dentro de un genérico.
  - **La puerta de pre-flight del template no podía correr:** un `../` de más, `MODULE_NOT_FOUND`.
  - **Y eso tapaba lo de abajo:** con el comando arreglado, **el scaffold falla su propio pre-flight
    en 4 sitios** — dos rayas prohibidas, **`Inter` importada en el `layout.tsx`** (la fuente
    AI-default que el Lore prohíbe y que el propio checklist promete que «la puerta rechaza») y
    **emoji como iconos** en el NavBar. **Todo proyecto nuevo nacía con las cuatro.**

  Los dos últimos son el mismo bug mirándose al espejo: **la puerta que detecta los fallos del
  scaffold estaba rota, y por eso el scaffold acumulaba justo los fallos que esa puerta detecta.** Un
  comando roto no es ruido: es un test que lleva meses sin correr y nadie lo sabe.

  **Corolario: un fix que entra al `_starter` no se propaga solo a los proyectos vivos que lo
  necesitaban ayer.** El template se prueba contra el primer proyecto que lo estrena — pero un
  proyecto en curso no es un `_starter` recién estampado, y un fix escrito en el molde no viaja
  hacia atrás. En `numerologia` el paso «Releer» (arriba) se escribió en `_starter/FASES.md` el
  2026-07-16 a las 13:36, después de que el mismo patrón rompiera **2.1.5** y **2.2**. Esa misma
  tarde, entre las 16:41 y las 17:26, el patrón volvió a romper **2.3, 2.4, 2.5.2 y 2.6** — en el
  `FASES.md` de `numerologia`, que nunca recibió el fix porque ya existía antes de que naciera.
  **Cerrar la sesión que escribe un fix de método incluye preguntar qué proyecto abierto lo
  necesita hoy, no solo qué proyecto nacerá mañana con él ya puesto.**

---
---

# Variante SaaS — Leyes invariantes de producto por suscripción

> Lo que **añade** el backend sobre las leyes base de arriba. Se lee después, no en su
> lugar. Solo aplica a una SaaS web (login + suscripción + área privada).

## Acceso

- **Verificación de acceso SIEMPRE en el servidor** (Server Components / API Routes). Nunca en el cliente.
- El frontend solo recibe un booleano `isPremium` **ya resuelto**. No decide acceso.
- Lógica de acceso **centralizada en `lib/access.ts`**; jamás duplicarla en componentes.
- El `PremiumGate` recibe el `accessLevel` como prop resuelta; no verifica por su cuenta.

## Supabase

- **RLS SIEMPRE activo** en toda tabla.
- **`lib/supabase/client.ts` solo en `'use client'`; `lib/supabase/server.ts` en Server Components y API Routes.** Nunca mezclar.
- Para decidir acceso en servidor usar **`getUser()`** (revalida con Auth server), no `getSession()`.
- Sesiones server-side con **`@supabase/ssr` vía cookies**, nunca `localStorage`.
- Refrescar sesión en `middleware.ts` (los Server Components no pueden escribir cookies).
- **`SUPABASE_SERVICE_ROLE_KEY` solo servidor.** Ignora RLS → nunca exponer al cliente, nunca `NEXT_PUBLIC_`.
- `profiles` no se crea solo: trigger sobre `auth.users` o insert tras signUp, o el gating por rol falla.

## Stripe

- **Nunca procesar pagos desde el cliente.** Toda la lógica en API Routes.
- **El webhook SIEMPRE verifica la firma** (`stripe.webhooks.constructEvent`) antes de tocar nada. Sin firma válida → 400 sin escribir en la base. Sin excepción.
- El webhook necesita el **body crudo** (`req.text()`), no `req.json()`, o la firma nunca cuadra.
- Estado de suscripción se sincroniza **solo vía webhook** (service_role), con **upsert idempotente** por `stripe_subscription_id` (eventos duplicados / fuera de orden).
- Mapear `customer` ↔ usuario con `client_reference_id` / `metadata.user_id` al crear el Checkout.
- **Cancelar ≠ perder acceso:** `isPremium` respeta `cancel_at_period_end` + `current_period_end`.
- Precios y claves desde env (`STRIPE_PRICE_*`); nunca hardcodear `price_xxx` (difiere test/live).
