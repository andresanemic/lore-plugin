# lore/routing.md — Navigation / Routing (Next.js App Router)

> Pistas históricas, NO fuente de verdad. Leads a validar, no recetas.
> ⚠ Validar contra código actual antes de actuar.

---

### [routing] GSAP falla en SSR / build de Next.js — `window is not defined`

- Contexto: Cualquier proyecto Next.js con GSAP plugins (ScrollTrigger, SplitText, etc.).
- Causa probable: Los plugins de GSAP acceden a `window` en el momento del import. Next.js renderiza en el servidor donde `window` no existe.
- Pista: Centralizar todos los imports de GSAP en un único archivo (`lib/gsap.ts`). El registro de plugins debe estar dentro de un guard `if (typeof window !== 'undefined')`. Nunca importar `{ gsap } from 'gsap'` directamente en componentes — siempre desde el archivo centralizado donde el guard ya existe.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [routing] Hydration mismatch en componentes con estado dependiente del tiempo

- Contexto: Contadores regresivos, relojes, fechas calculadas, cualquier valor que dependa de `Date.now()`.
- Causa probable: El servidor renderiza el componente con un valor de tiempo que diverge inevitablemente del primer render del cliente. React detecta la diferencia y lanza error de hydration (o parpadeo silencioso).
- Pista: Estado inicial `null` en SSR + `useEffect` para asignar el valor real solo en cliente. Si el salto de altura al aparecer el componente es un problema, usar un skeleton con las mismas dimensiones. Aplica a cualquier valor que dependa de `Date`, `Math.random()`, `window`, `navigator` o `localStorage`.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [routing] Next.js 16 — `params` y `searchParams` son Promise (breaking change)

- Contexto: Páginas y layouts del App Router con rutas dinámicas (`[slug]`, `[id]`...).
- Causa probable: Next.js 16 cambió `params` de objeto síncrono a `Promise`. El código pre-v16 que accede `params.slug` directamente recibe `undefined` en runtime.
- Pista: Las firmas de las páginas deben ser `async` y hacer `const { slug } = await params`. El tipo es `Promise<{ slug: string }>`, no `{ slug: string }`. TypeScript debería detectar el uso incorrecto si los tipos están actualizados. Aplica también a `searchParams`.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [routing] Tailwind CSS v4 — setup incompatible con configuración de v3

- Contexto: Proyecto nuevo con `tailwindcss@^4` que sigue documentación o tutoriales de v3.
- Causa probable: Tailwind v4 eliminó `tailwind.config.ts` como método principal de configuración y cambió el sistema de imports en CSS. El import `@tailwind base/components/utilities` no existe en v4.
- Pista: v4 usa `@import 'tailwindcss'` en el CSS principal. Los colores y tokens custom van en `@theme {}` dentro del CSS, no en `tailwind.config.ts`. Los tokens de `@theme` generan clases de Tailwind directamente (`--color-accent` → `bg-accent`). Cualquier configuración de color en `tailwind.config.js/ts` es ignorada en v4.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [routing] OG image usa fuente fallback — Google Fonts no disponibles en build time

- Contexto: `opengraph-image.tsx` con `new ImageResponse(...)` y una fuente de Google Fonts cargada via `next/font/google`.
- Causa probable: Satori (motor interno de `next/og`) no puede hacer requests HTTP externos durante la generación estática. `next/font/google` tampoco está disponible en ese contexto.
- Pista: El archivo `.ttf` de la fuente debe estar en el proyecto (ej. `assets/`) y cargarse con `readFile(join(process.cwd(), 'assets/Font.ttf'))`. Pasar el buffer al array `fonts` de `ImageResponse`. El `name` en `fonts` debe coincidir exactamente con el `fontFamily` en el JSX.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [routing] Página de inicio hereda el template de título del layout padre

- Contexto: Layout con `title.template: '%s | Nombre del Sitio'`. La homepage necesita un título propio sin el sufijo.
- Causa probable: `title: 'texto'` en una página siempre pasa por el `%s` del template del layout. No hay forma de saltarse el template con el campo `title` normal.
- Pista: `title: { absolute: 'Título completo' }` ignora el template completamente. Usar en homepages, páginas de error, y cualquier página donde el nombre del sitio ya está incluido en el título o el formato del template no aplica.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [routing] `next/image`: reemplazar un asset de `public/` con el MISMO nombre sigue mostrando la versión vieja (caché)

- Contexto: Se cambió una imagen servida con `<Image src="/equipo/persona-ejemplo.webp">` reemplazando el archivo en `public/` por uno nuevo del mismo nombre. En el navegador (y/o en el preview de Vercel) seguía viéndose la imagen antigua pese a hard-refresh, reinicio del dev server y borrado de `.next/cache/images`.
- Causa probable: `next/image` no sirve el archivo crudo: lo pasa por el optimizador, cuya URL es fija y se cachea (`/_next/image?url=%2Fequipo%2Fpersona-ejemplo.webp&w=...&q=...`). Esa URL NO cambia al reemplazar el archivo con el mismo nombre, así que el navegador —y la CDN de Vercel en prod— siguen entregando la respuesta vieja guardada bajo esa misma clave, con `Cache-Control` largo. Por eso ni el hard-refresh basta: la clave de caché es la misma. (El archivo en `public/` y los bytes que sirve el server ya eran los correctos; el problema era puramente de invalidación de caché por URL estable.)
- Pista: La solución a prueba de balas es **renombrar el archivo** (`persona-ejemplo.webp` → `persona-ejemplo-v2.webp`) y actualizar TODAS las referencias en código (aquí: `Equipo.tsx` del landing y `Nosotros.tsx`). Una URL que ningún caché ha visto no puede servir una versión vieja; un `F5` normal alcanza. Para diagnosticar antes de tocar nada: comparar `Get-FileHash` del archivo en `public/` vs el fuente, y descargar con `Invoke-WebRequest` tanto el crudo (`/equipo/...webp`) como el optimizado (`/_next/image?url=...`) para confirmar QUÉ bytes entrega realmente el server (si el server ya sirve lo nuevo, el problema es 100% caché de cliente/CDN, no código). Alternativa menos limpia: query-string en el `src`. Nota: en prod (Vercel) el cambio recién se ve tras `git push`/redeploy.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [routing] Tailwind v4: un valor fuera de la escala por defecto (`duration-400`) no genera utilidad → transición instantánea silenciosa

- Contexto: Clase de transición con un valor que parece válido (`duration-400`) pero que no está en la escala por defecto de Tailwind (duration: 75/100/150/200/300/500/700/1000).
- Causa probable: Tailwind no emite error ante una utilidad desconocida: simplemente no genera la clase. El elemento queda sin `transition-duration` y el efecto ocurre de golpe (0s), sin aviso. El build pasa igual.
- Pista: Usar un valor de la escala (`duration-300`, `duration-500`) o un valor arbitrario explícito (`duration-[400ms]`). Vale para cualquier utilidad de escala no continua (duration, delay, etc.): si algo "no anima" pero compila, sospechar de un valor fuera de escala antes que de la lógica.
- Confianza: confirmado
- ⚠ Validar contra código actual.

---

### [routing] Descargar imágenes de Unsplash: el endpoint `/download` da 403 y los IDs no se pueden adivinar — usar la URL pública `images.unsplash.com/photo-<id>`

- Contexto: conseguir una imagen de prueba/placeholder de Unsplash por línea de comandos (`curl`) para guardarla local en `public/` (ej. fondo del Hero, H6). Se necesita un `.webp` y una URL que el server entregue directo.
- Causa probable: dos callejones sin salida frecuentes. (1) **Inventar** una URL `https://images.unsplash.com/photo-1490598000245-3aa31d4d9efc?...` adivinando el ID → **404** (29 bytes de HTML): los IDs numéricos no son deducibles. (2) Usar el endpoint amistoso `https://unsplash.com/photos/<shortid>/download?...` → **403** (0 bytes): hoy exige referer/sesión, no sirve para `curl` pelado. Además el **short-id del slug** (lo que va al final de `unsplash.com/photos/...-xVgHduP61HY`) **NO es** el id numérico de la URL servible (`photo-1663431905837-09cf339461ce`).
- Pista: el camino que funciona (sin API key): (a) buscar la página de la foto — `WebSearch`/`WebFetch` sobre `unsplash.com/s/photos/<tema>` lista URLs `unsplash.com/photos/<slug>-<shortid>`; (b) `WebFetch` de la página de la foto pidiendo *"la URL que empieza con `https://images.unsplash.com/photo-` (og:image) verbatim"* → devuelve el id numérico real; (c) descargar de esa base **pública** con parámetros: `curl -L "https://images.unsplash.com/photo-<id>?fm=webp&w=2400&q=80&fit=crop" -o public/hero/...webp`. `fm=webp` entrega WebP directo (sin convertir con sharp/imagemagick); validar con `file` → `RIFF ... Web/P image`. Ojo: la descripción que da `WebFetch` del color/luz no siempre acierta (dijo "golden/orange" de una foto que en realidad era hora azul) — **inspeccionar la imagen** (bajar un preview chico y abrirlo/`Read`) antes de darla por buena. Y verificar la **región/lugar** real de la foto (un "la región" puede ser Puerto Natales = Magallanes, no la región). Para producción: la licencia importa — Unsplash/Pexels son libres; imágenes de Google suelen tener copyright.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [routing] Navegación circular prev/next se auto-referencia cuando hay un solo ítem

- Contexto: Helper de navegación circular tipo `getProyectoNav(slug)` que devuelve `prev`/`next` con módulo (`(i-1+len)%len`, `(i+1)%len`) sobre una lista, y una sección "Siguiente / Más" que renderiza esos prev/next. Al reducir la lista a UN solo ítem (aquí: dejar un solo proyecto), `prev` y `next` pasan a ser el MISMO ítem apuntándose a sí mismo (card que enlaza a su propia página).
- Causa probable: con `len === 1`, `(i±1) % 1 === 0` → `prev === next === el propio ítem`. El helper no falla ni lanza error; devuelve self y la UI muestra "Más proyectos" con dos cards iguales que enlazan a la página actual.
- Pista: guard de render en la sección: `const hasMore = nav.prev.slug !== item.slug && nav.next.slug !== item.slug;` y envolver la sección en `{hasMore && (...)}`. Vuelve sola al agregar ítems. Ojo al empalme visual: si esa sección era la última antes del Footer, al ocultarla la sección previa pasa a ser la última y su gradiente/handoff de color puede necesitar ajuste (aquí: el riel sube de vuelta a `#f3ddbc`). Aplica a cualquier prev/next circular (proyectos, blog, galerías) que pueda quedar con un solo elemento.
- Confianza: confirmado 
- ⚠ Validar contra código actual.

---

### [deploy] Compress-Archive de PowerShell genera rutas con backslash — cPanel no crea las carpetas al descomprimir

- Contexto: Export estático de Next.js subido a cPanel/Apache (Namecheap). El .zip se generó con `Compress-Archive` de Windows PowerShell.
- Síntoma: el sitio cargaba el HTML pero sin estilos ni JS. El navegador mostraba texto plano con tipografía serif, sin layout ni colores. El HTML tenía el `<link rel="stylesheet">` correcto apuntando a `/_next/static/chunks/....css`, pero ese archivo daba 404 en producción.
- Causa: `Compress-Archive` usa backslash (`\`) como separador de ruta dentro del ZIP. La especificación ZIP estándar y Linux/cPanel esperan slash (`/`). Al descomprimir, cPanel interpreta `_next\static\chunks\archivo.css` como un archivo de nombre raro en la raíz, en vez de crear la jerarquía de carpetas `_next/static/chunks/`. Toda la carpeta `_next/` (CSS, JS, fuentes) queda inaccessible.
- Pista: generar el zip con `tar.exe` (disponible en Windows 10+). Ejemplo: `Push-Location "out" ; tar.exe -a -c -f "../sitio.zip" . ; Pop-Location`. La flag `-a` detecta .zip por extensión y escribe paths con slash. Verificar antes de subir con `[System.IO.Compression.ZipFile]::OpenRead(zip)` que ninguna entrada tenga backslash. Diagnóstico rápido en producción: abrir `https://dominio.com/_next/static/chunks/archivo.css` directamente en el browser — si da 404, las carpetas no quedaron donde deben.
- Confianza: confirmado (H8, primera subida a Namecheap, 2026-06-29)
- ⚠ Validar contra código actual.

---

### [routing] `scroll-behavior: smooth` en `<html>` exige `data-scroll-behavior="smooth"` o Next no puede desactivarlo al cambiar de ruta

- Contexto: proyecto Next (App Router) que usa `html { scroll-behavior: smooth }` en CSS para el suavizado de anchors, y navegación entre rutas.
- Causa probable: Next desactiva temporalmente el smooth durante una transición de ruta (`scroll-behavior: auto` + reflow forzado) para que el salto a la nueva página sea seco. Pero **solo lo hace si el `<html>` lleva `data-scroll-behavior="smooth"`**: sin el atributo detecta el smooth, emite un warning en dev y ejecuta el scroll sin desactivar nada. Resultado: al navegar, la nueva ruta **se desliza animadamente desde la posición de scroll anterior** en vez de aparecer arriba, y la vista se queda a medio camino mostrando el contenido equivocado. → `node_modules/next/dist/shared/lib/router/utils/disable-smooth-scroll.js`
- Pista: si el síntoma es "la URL cambia pero la vista se queda / se desliza al pie de la página anterior", revisar primero este atributo, antes de tocar el código de scroll propio. El warning de Next lo canta literalmente (*"Detected `scroll-behavior: smooth` on the `<html>` element…"*) y llega al **terminal del dev server**, no solo a la consola del browser (→ `testing.md`). Es un atributo en el `<html>` del root layout, no una prop de configuración.
- Confianza: confirmado (blockchain-lab-uai, Next 16.2.6, 2026-07-25)
- ⚠ Validar contra código actual.
