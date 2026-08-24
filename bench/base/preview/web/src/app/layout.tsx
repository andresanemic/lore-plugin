import type { Metadata } from "next";
import "./globals.css";
import JsonLd from "@/components/seo/JsonLd";
import NavBar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import {
  DEFAULT_TITLE,
  DEFAULT_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  OG_LOCALE,
  organizationJsonLd,
  websiteJsonLd,
} from "@/lib/seo";

// Fase 2.3: aquí entran las dos familias reales (título + cuerpo) con next/font,
// enlazadas a --ff-titulo / --ff-cuerpo, y su `.variable` vuelve al <html> de abajo.
// Hasta entonces manda el fallback de sistema que globals.css ya declara: el scaffold
// NO elige fuente, porque la elige la dirección de diseño.
// Nada de Inter / Roboto / Open Sans: la puerta de pre-flight las rechaza.

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
    types: { "application/rss+xml": "/feed.xml" },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: OG_LOCALE,
    siteName: SITE_NAME,
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  // Verificar Search Console por registro DNS (sin meta tag). Ver Fase 4.1.
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    // TODO: ajustar `lang` si el cliente no es de Chile.
    // Fase 2.3: className={`${titulo.variable} ${cuerpo.variable}`}
    <html lang="es-CL">
      <body>
        <JsonLd data={organizationJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
