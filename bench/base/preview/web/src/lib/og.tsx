import { ImageResponse } from "next/og";
import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

// Colores OG — TODO Fase 2: alinear con la paleta de marca.
const BG = "#ffffff";
const INK = "#171717";
const ACCENT = "#171717";

// Fuente para la OG. next/font/google NO está disponible en Satori (build):
// se carga el .ttf por HTTP desde Fontsource. Si la red falla, se omite y
// ImageResponse usa la fuente default (el build NO se cae). lore/routing.md.
async function loadFont(
  weight: "400" | "700",
): Promise<{ name: string; data: ArrayBuffer; weight: 400 | 700; style: "normal" } | null> {
  try {
    const url = `https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-${weight}-normal.ttf`;
    const res = await fetch(url);
    if (!res.ok) return null;
    return {
      name: "OGFont",
      data: await res.arrayBuffer(),
      weight: weight === "700" ? 700 : 400,
      style: "normal",
    };
  } catch {
    return null;
  }
}

export async function renderOgImage(opts: { title: string; kicker?: string }) {
  const { title, kicker = SITE_NAME } = opts;
  const fonts = (await Promise.all([loadFont("700"), loadFont("400")])).filter(
    (f): f is NonNullable<typeof f> => f !== null,
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BG,
          padding: "72px 80px",
          fontFamily: "OGFont, sans-serif",
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 18, height: 56, background: ACCENT, borderRadius: 4 }} />
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: 1 }}>
            {SITE_NAME}
          </span>
          <span
            style={{
              fontSize: 22,
              fontWeight: 400,
              color: ACCENT,
              textTransform: "uppercase",
              letterSpacing: 2,
              marginLeft: 8,
            }}
          >
            {kicker}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", fontSize: 26, fontWeight: 400, color: ACCENT }}>
          {DEFAULT_DESCRIPTION}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: fonts.length ? fonts : undefined },
  );
}
