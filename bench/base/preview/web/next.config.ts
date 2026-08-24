import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ── Hosting: elegir según el cliente (Fase 3.I) ─────────────────────────────
  // (A) Export estático para cPanel/Namecheap (.zip manual). Genera `out/`.
  //     `trailingSlash` deja carpeta/index.html → Apache lo sirve nativo.
  //     `unoptimized` es obligatorio para next/image y las OG de next/og en export.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // (B) Para Vercel: comentar las 3 líneas de arriba (Vercel optimiza imágenes).

  // Oculta el indicador de Dev Tools (Next sigue mostrando errores).
  devIndicators: false,
};

export default nextConfig;
