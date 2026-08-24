'use client';
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Fraunces } from 'next/font/google';
const fraunces = Fraunces({ subsets: ['latin'], weight: ['600', '700'] });

export default function LoreHero() {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('[data-reveal]', { opacity: 1, y: 0 });
        return;
      }
      gsap.fromTo('[data-reveal]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12 });
    },
    { scope: ref }
  );
  return (
    <section ref={ref} className={`flex min-h-svh flex-col items-center justify-center px-6 py-24 text-center ${fraunces.className}`}>
      <p data-reveal style={{ opacity: 0 }} className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">
        Bench base lore 3.0
      </p>
      <h1 data-reveal style={{ opacity: 0 }} className="mt-4 text-4xl font-bold tracking-tight">
        Permanent Artist
      </h1>
      <p data-reveal style={{ opacity: 0 }} className="mt-3 max-w-md text-sm leading-6 text-zinc-600">
        Titulo y subtitulo con fade y subida. Estado inicial en markup y fromTo, min-h-svh, Fraunces, respeta reduced motion.
      </p>
      <span data-reveal style={{ opacity: 0 }} className="mt-6 rounded-full bg-zinc-900 px-5 py-2 text-xs font-medium text-white">
        Ver lore
      </span>
    </section>
  );
}
