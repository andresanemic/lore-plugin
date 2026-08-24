import type { Metadata } from "next";
import Link from "next/link";

// En el export estático sale como `404.html`. En cPanel, configurarla como
// ErrorDocument (Fase 4). TODO Fase 3.G: rediseñar acorde a la marca.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function NotFound() {
  return (
    <main
      data-nav="light"
      className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center"
    >
      <p className="text-sm uppercase tracking-widest text-black/50">Error 404</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-6xl">
        Página no encontrada
      </h1>
      <Link
        href="/"
        className="mt-8 rounded-full border border-black px-6 py-3 transition-opacity hover:opacity-60"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
