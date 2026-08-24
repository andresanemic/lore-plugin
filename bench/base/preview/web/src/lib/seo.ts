import type { Metadata } from "next";

// ── Datos de marca ──────────────────────────────────────────────────────────
// {{huecos}} los rellena /nuevo-sitio. Los marcados "TODO Fase 2" se completan
// al cerrar la dirección de diseño / investigación.
export const SITE_URL = "https://{{DOMINIO}}";
export const SITE_NAME = "{{NOMBRE_SITIO}}";
export const LEGAL_NAME = "{{CLIENTE}}";
export const DEFAULT_TITLE = "{{NOMBRE_SITIO}} · {{DESCRIPCION}}";
export const DEFAULT_DESCRIPTION = "{{DESCRIPCION}}";

// Locale: por defecto Chile. Ajustar por cliente si corresponde.
export const OG_LOCALE = "es_CL";
export const IN_LANGUAGE = "es-CL";

// Contacto — TODO Fase 2 (definir canal real: WhatsApp / email / formulario).
export const CONTACT_EMAIL = "contacto@{{DOMINIO}}";
export const WHATSAPP_NUMBER = ""; // TODO Fase 2: ej. "569XXXXXXXX"
export const WHATSAPP_MESSAGE = `Hola {{NOMBRE_SITIO}}! Vengo desde su sitio web y me gustaría conversar.`;
export const WHATSAPP_URL = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`
  : "";

// Datos de organización — TODO Fase 1-2.
export const LOCALITY = ""; // TODO
export const REGION = ""; // TODO
export const COUNTRY = "CL"; // TODO si no es Chile
export const FOUNDERS: string[] = []; // TODO Fase 1
export const FOUNDING_DATE = ""; // TODO Fase 1
export const LOGO_PATH = "/logo.svg"; // TODO Fase 2: ruta del logo en public/

// OG por defecto del sitio (la imagen branded de `app/opengraph-image.tsx`).
// Se inyecta en las páginas índice porque Next NO cascada la OG raíz a los
// segmentos hijos (sin esto quedan sin og:image).
export const DEFAULT_OG_IMAGE = "/opengraph-image";

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}

// Forma canónica de un path: termina en "/" (salvo la raíz), para calzar con la
// URL que sirve cPanel con `trailingSlash`.
export function canonicalPath(path: string): string {
  return path === "/" ? "/" : path.replace(/\/?$/, "/");
}

// ── Metadata por página (consistencia OG/twitter/canonical) ─────────────────
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  type?: "website" | "article";
  /** Imagen OG. Por defecto la OG branded del sitio. Pasar `null` en rutas con
   *  su propio `opengraph-image.tsx` de segmento (detalle blog/proyecto). */
  ogImage?: string | null;
}): Metadata {
  const { title, description, path, type = "website" } = opts;
  const normalizedPath = canonicalPath(path);
  const url = absoluteUrl(normalizedPath);
  const ogPath = opts.ogImage === undefined ? DEFAULT_OG_IMAGE : opts.ogImage;
  const images = ogPath
    ? [{ url: absoluteUrl(ogPath), width: 1200, height: 630, alt: title }]
    : undefined;
  return {
    title,
    description,
    alternates: { canonical: normalizedPath },
    openGraph: {
      type,
      locale: OG_LOCALE,
      siteName: SITE_NAME,
      url,
      title,
      description,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}

// ── Builders JSON-LD (datos propios y controlados) ──────────────────────────
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    url: SITE_URL,
    logo: absoluteUrl(LOGO_PATH),
    email: CONTACT_EMAIL,
    ...(FOUNDING_DATE ? { foundingDate: FOUNDING_DATE } : {}),
    ...(FOUNDERS.length
      ? { founder: FOUNDERS.map((name) => ({ "@type": "Person", name })) }
      : {}),
    ...(REGION
      ? { areaServed: { "@type": "AdministrativeArea", name: REGION } }
      : {}),
    description: DEFAULT_DESCRIPTION,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: IN_LANGUAGE,
    publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
  };
}

// FAQPage — el contenido (texto plano) vive en lib/faq.ts (Fase 3.C, espejo del componente FAQ).
export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: IN_LANGUAGE,
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.question,
      acceptedAnswer: { "@type": "Answer", text: it.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// NOTA (Fase 3): los builders `articleJsonLd(article)` y `proyectoJsonLd(p)` se
// añaden aquí cuando se construyan `lib/blog.ts` (3.F) y `lib/proyectos.ts` (3.E),
// con sus tipos. Patrón: @type "Article", headline + datePublished + dateModified +
// author + publisher + mainEntityOfPage. (Ver checklist SEO/GEO §3.)
