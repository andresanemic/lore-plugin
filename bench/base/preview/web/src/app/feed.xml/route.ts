import {
  SITE_URL,
  SITE_NAME,
  DEFAULT_DESCRIPTION,
  IN_LANGUAGE,
  absoluteUrl,
} from "@/lib/seo";

// Feed RSS 2.0 del blog. `force-static` lo emite como `out/feed.xml` en el export
// (cPanel). Referenciado en <head> vía `alternates.types` (layout).
export const dynamic = "force-static";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  const self = absoluteUrl("/feed.xml");
  const lastBuild = new Date().toUTCString();

  // TODO Fase 3.F (Blog): mapear ARTICLES de lib/blog.ts a <item>…</item>.
  const items = "";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${esc(SITE_NAME)} · Blog</title>
    <link>${absoluteUrl("/blog/")}</link>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <description>${esc(DEFAULT_DESCRIPTION)}</description>
    <language>${IN_LANGUAGE}</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <generator>${SITE_URL}</generator>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
