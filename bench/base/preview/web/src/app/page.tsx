import { SITE_NAME, DEFAULT_DESCRIPTION } from "@/lib/seo";

// Hero placeholder. TODO Fase 3.B/3.C: construir el Hero y las secciones reales
// (cada sección declara data-nav="light|dark" para el NavBar, y lleva su motion
// + SEO inline según FASES.md y la checklist SEO/GEO).
export default function Home() {
  return (
    <main>
      <section
        data-nav="light"
        className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center"
      >
        <h1
          className="text-5xl font-bold tracking-tight md:text-7xl"
          style={{ fontFamily: "var(--font-titulo)" }}
        >
          {SITE_NAME}
        </h1>
        <p className="mt-6 max-w-xl text-lg text-black/70">{DEFAULT_DESCRIPTION}</p>
      </section>
    </main>
  );
}
