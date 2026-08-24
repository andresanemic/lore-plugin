"use client";

// Bloque CTA + Footer unificado — uno de los DOS showcases del sitio (junto al Hero):
// aquí va la coreografía de motion más completa (Fase 3.D). Esta es la base mínima:
// un reveal al entrar en viewport (IntersectionObserver) que respeta
// `prefers-reduced-motion`, y datos de contacto placeholder.
// TODO Fase 2: copy real, canal de contacto, paleta, motion premium.

import { useEffect, useRef } from "react";
import Link from "next/link";
import { SITE_NAME, CONTACT_EMAIL, WHATSAPP_URL } from "@/lib/seo";

export default function Footer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-reveal]"));

    if (reduced) {
      items.forEach((n) => (n.style.opacity = "1"));
      return;
    }
    // Estado inicial (también en JSX inline para evitar FOUC; ver lore/animation.md).
    items.forEach((n) => {
      n.style.opacity = "0";
      n.style.transform = "translateY(16px)";
      n.style.transition = "opacity .6s ease, transform .6s ease";
    });

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const n = e.target as HTMLElement;
          if (n.dataset.revealed) return; // sobrevive a StrictMode (lore/animation.md)
          n.dataset.revealed = "1";
          n.style.opacity = "1";
          n.style.transform = "translateY(0)";
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    items.forEach((n) => io.observe(n));
    return () => io.disconnect();
  }, []);

  const year = new Date().getFullYear();

  return (
    <footer
      id="contacto"
      data-nav="dark"
      ref={ref}
      className="bg-black text-white"
    >
      <div className="mx-auto max-w-6xl px-6 py-24">
        {/* CTA */}
        <h2
          data-reveal
          style={{ opacity: 0, fontFamily: "var(--font-titulo)" }}
          className="text-4xl font-bold tracking-tight md:text-6xl"
        >
          ¿Conversamos?{/* TODO Fase 2: copy de cierre */}
        </h2>
        <div data-reveal style={{ opacity: 0 }} className="mt-8 flex flex-wrap gap-4">
          {WHATSAPP_URL ? (
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-white px-6 py-3 text-black transition-opacity hover:opacity-80"
            >
              Escríbenos
            </a>
          ) : null}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="rounded-full border border-white px-6 py-3 transition-opacity hover:opacity-80"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        {/* Footer */}
        <div
          data-reveal
          style={{ opacity: 0 }}
          className="mt-24 flex flex-col justify-between gap-6 border-t border-white/20 pt-8 text-sm text-white/70 md:flex-row"
        >
          <span>
            © {year} {SITE_NAME}
          </span>
          <nav className="flex gap-6">
            <Link href="/nosotros" className="transition-opacity hover:opacity-100">
              Nosotros
            </Link>
            <Link href="/proyectos" className="transition-opacity hover:opacity-100">
              Proyectos
            </Link>
            <Link href="/blog" className="transition-opacity hover:opacity-100">
              Blog
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
