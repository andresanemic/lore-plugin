"use client";

// NavBar base — rediseñar visualmente por cliente (Fase 3.B), pero conservar:
//  (a) consciencia de tono via `data-nav` de la sección bajo el navbar
//      (lore/layout.md — contraste por data-nav, no por umbral de scroll),
//  (b) drawer móvil con `inert={!open}` (saca los links del árbol de accesibilidad
//      cuando está cerrado → corrige aria-hidden-focus; checklist SEO/GEO §6),
//  (c) logo legible sobre fondos variables (drop-shadow).
// Links placeholder — TODO Fase 1.5: ajustar a las páginas reales del wireframe.

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_NAME } from "@/lib/seo";

type Tone = "light" | "dark";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/nosotros", label: "Nosotros" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/blog", label: "Blog" },
];

export default function NavBar() {
  const [tone, setTone] = useState<Tone>("light");
  const [open, setOpen] = useState(false);

  // Detecta el tono declarado por la sección que cruza el borde superior.
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav]"),
    );
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const t = (e.target as HTMLElement).dataset.nav as Tone;
            if (t === "light" || t === "dark") setTone(t);
          }
        }
      },
      // La franja observada es la línea bajo el navbar.
      { rootMargin: "-64px 0px -100% 0px", threshold: 0 },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // El texto del navbar contrasta con el fondo de la sección:
  // sección "dark" → texto claro; sección "light" → texto oscuro.
  const fg = tone === "dark" ? "text-white" : "text-black";

  return (
    <header className={`fixed inset-x-0 top-0 z-50 ${fg}`}>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-lg font-bold tracking-tight drop-shadow-sm"
          style={{ fontFamily: "var(--font-titulo)" }}
        >
          {SITE_NAME}
        </Link>

        {/* Desktop */}
        <ul className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="text-sm transition-opacity hover:opacity-60">
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            {/* CTA — TODO Fase 2: canal de contacto real */}
            <Link
              href="/#contacto"
              className="rounded-full border border-current px-4 py-2 text-sm transition-opacity hover:opacity-60"
            >
              Hablemos
            </Link>
          </li>
        </ul>

        {/* Móvil: botón. Los iconos van inline y NO de librería a propósito: la familia
            se elige en Fase 2.4, y una hamburguesa y una X son los "signos geométricos
            simples" que composicion.md §6 exceptúa. Nunca emoji.
            min-h/w-11 = 44px, el piso táctil de principios.md. */}
        <button
          type="button"
          className="md:hidden inline-flex min-h-11 min-w-11 items-center justify-center"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </nav>

      {/* Móvil: drawer. `inert` cuando está cerrado saca sus links del árbol. */}
      <div
        inert={!open}
        className={`md:hidden ${open ? "block" : "hidden"} bg-black/90 text-white`}
      >
        <ul className="flex flex-col gap-4 px-6 py-6">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link href={l.href} onClick={() => setOpen(false)} className="text-lg">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
