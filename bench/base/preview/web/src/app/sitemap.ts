import type { MetadataRoute } from "next";
import { absoluteUrl, canonicalPath } from "@/lib/seo";

// `force-static` emite sitemap.xml como archivo en el export (cPanel).
export const dynamic = "force-static";

const loc = (path: string) => absoluteUrl(canonicalPath(path));

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // TODO Fase 3: añadir rutas a medida que se crean (/nosotros, /proyectos,
  // /blog y los [slug] dinámicos, mapeando desde lib/blog.ts y lib/proyectos.ts).
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: loc("/"), lastModified: now, changeFrequency: "monthly", priority: 1 },
  ];

  return staticRoutes;
}
