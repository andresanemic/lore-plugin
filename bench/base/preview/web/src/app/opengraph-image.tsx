import { renderOgImage, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION } from "@/lib/seo";

// `force-static` prerenderiza la OG como imagen estática en el export.
export const dynamic = "force-static";

export const alt = DEFAULT_DESCRIPTION;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOgImage({ title: DEFAULT_TITLE });
}
