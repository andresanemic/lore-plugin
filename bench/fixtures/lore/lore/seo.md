# lore/seo.md — SEO / GEO

> **Fuente única del área.** Fusión de las rúbricas de `claude-seo`
> (technical/schema/sitemap/geo/images) con los hallazgos reales de **Lighthouse** y **Goodie AI**
> en un proyecto ya desplegado. Los proyectos la heredan por ruta relativa (`../../lore/seo.md`);
> el `_starter` no lleva copia (una sola fuente, sin deriva).
>
> **Método:** Claude lee esta checklist y la ejecuta él mismo **editando el código**. NO es el modo
> nativo de `claude-seo`: nada de crawl en vivo, Playwright ni APIs externas.
> **SEO inline:** se aplica DURANTE cada sección/página. La Mini-Fase de auditoría solo
> **consolida** (una pasada, no tres).

---

## Ley 1 — La auditoría llega desfasada; el disco no miente

Los reportes (PDF de Lighthouse/PageSpeed, audit de Goodie) llegan **DESFASADOS** del preview
pre-deploy. **Verificar SIEMPRE el estado/tamaño real en disco** (PIL para imágenes:
`from PIL import Image; Image.open(p).size`) **antes** de re-encodear o "arreglar" algo. Optimizar
contra un reporte viejo es trabajar dos veces y romper lo que ya estaba bien.

## Ley 2 — De Lighthouse se aplica todo menos el contraste

De Lighthouse se aplican TODOS los hallazgos **excepto el de contraste de color** ("los colores de
fondo y de primer plano no tienen contraste adecuado"): choca con la dirección de diseño y la
dirección gana. El resto de Accesibilidad **sí** se aplica, entero.

> Ojo: esto **no** afama a estimar contraste a ojo. El par CTA/focus se calcula contra AA
> (`principios.md`). Lo que se descarta es la queja de Lighthouse sobre superficies decorativas.

## Ley 3 — Los headers dependen del hosting

Los `.htaccess`/headers **solo aplican en Apache** (cPanel), no en Vercel. El score real sube al
**re-escanear post-deploy**, no antes. Dejar el pendiente anotado en `FASES.md` (Fase 4).

---

## 1. Por sección / página (inline, en cada Mini-Fase)

- [ ] `metadata` propia (title, description) vía `pageMetadata()` de `lib/seo.ts`.
- [ ] `og:image` presente (Next **NO** cascada la OG raíz a segmentos hijos → inyectarla en
      `pageMetadata()`; los detalles `[slug]` usan su OG dinámica).
- [ ] Imágenes con `alt` **descriptivo** (no vacío, no "imagen").
- [ ] Imágenes responsive y livianas (ver §6); LCP cuidado en el Hero.
- [ ] Un solo `<h1>` por página; jerarquía `h2/h3` coherente.
- [ ] Links externos con `rel="noopener noreferrer"` + aviso de pestaña nueva (`sr-only`).

## 2. Técnico

- [ ] `<html lang>` correcto (ej. `es-CL`), alineado con OG locale y JSON-LD.
- [ ] `metadataBase` + `canonical` por página.
- [ ] `title.template` en el layout; `title.absolute` en la home.
- [ ] `npm run typecheck` + `npm run build` verdes antes de cerrar.
- [ ] Headers de seguridad en `public/.htaccess` (X-Frame-Options, COOP, nosniff, Referrer-Policy).
      **NO** CSP/Trusted Types (rompen los scripts/estilos inline del export estático).
- [ ] `browserslist` moderno en `package.json` (evita polyfills heredados).

## 3. Schema / JSON-LD (`components/seo/JsonLd.tsx` + builders en `lib/seo.ts`)

- [ ] `Organization` + `WebSite` en el sitio (layout).
- [ ] `Article` en artículos de blog y en detalles de proyecto (headline + `datePublished` +
      `dateModified`).
- [ ] `BreadcrumbList` en internas + detalles.
- [ ] `FAQPage` en la home si hay FAQ (`lib/faq.ts` = espejo en texto plano del componente FAQ;
      mantener en sync).
- [ ] Byline visible "Por <equipo> · Actualizado <fecha>" en detalles (señal de frescura; **fecha
      real, no inventada** — ver `copy.md`, precisión fingida).

## 4. Sitemap / robots / feed

- [ ] `sitemap.ts` dinámico (se actualiza solo desde los datos).
- [ ] `public/robots.txt` **estático** (la API de robots de Next no emite directivas custom): allow
      general + allow explícito a bots de IA (GPTBot, ClaudeBot, PerplexityBot, Google-Extended…) +
      `Content-Signal` + `Sitemap:`.
- [ ] `feed.xml` (RSS, route `force-static`) + `<link rel="alternate" type="application/rss+xml">`
      en `<head>`.

## 5. GEO / IA

- [ ] `public/llms.txt` (guía GEO/AEO: rutas y datos reales del sitio).
- [ ] `public/llms-full.txt` (artículos y proyectos a texto completo) referenciado desde `llms.txt`.
- [ ] meta `robots`/`googlebot` con `max-snippet:-1, max-image-preview:large`.
- [ ] Link headers (sitemap + feed) en `.htaccess` (requiere `mod_headers`).
- [ ] **Omitir a propósito** (no aplica a sitio corporativo estático sin API/agente): Agent Discovery
      (MCP card, A2A, OpenAPI, WebMCP), OAuth/OIDC/status API. *(Reabrir solo si el cliente expone
      login o APIs — es decir, en un Tier 3.)*

## 6. Imágenes

- [ ] Formato WebP; dimensiones razonables (no servir 2000px para mostrar 400px).
- [ ] Re-encode versionado (`-vN`) — **nunca** reusar nombre (caché de `next/image`, ver
      `routing.md`).
- [ ] `next/image` con `unoptimized:true` en export estático (no hace srcset; usar `<picture>` +
      variante `-m` cuando un peso móvil lo justifique).
- [ ] `inert={!menuOpen}` en el drawer del NavBar (saca los links del árbol de accesibilidad cuando
      está cerrado → corrige `aria-hidden-focus`).

## 7. Auditoría de consolidación (una sola pasada)

- [ ] Recorrer §1–§6 página por página y confirmar.
- [ ] Verificar `out/` tras `build`: existen `sitemap.xml`, `feed.xml`, `robots.txt`, `llms.txt`, OG
      por ruta.
- [ ] Golden Paths 200/404.
- [ ] Dejar anotado el pendiente de **re-escanear post-deploy** en `FASES.md`.
