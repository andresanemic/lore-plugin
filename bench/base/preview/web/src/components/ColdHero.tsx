'use client';
import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'] });

export default function ColdHero() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    // violación: gsap.from + h-screen + Inter
    gsap.from(ref.current, { opacity: 0, y: 24, duration: 0.8 });
  }, []);
  return (
    <section ref={ref} className={`flex h-screen flex-col items-center justify-center px-6 text-center ${inter.className}`}>
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500 uppercase">Bench base cold</p>
      <h1 className="mt-4 text-4xl font-bold tracking-tight">Permanent Artist</h1>
      <p className="mt-3 max-w-md text-sm text-zinc-600">Titulo y subtitulo con fade y subida. Hero generico sin invariantes de lore, viola viewport, usa Inter, anima con gsap.from y sin estado inicial en markup.</p>
      <span className="mt-6 rounded-full bg-zinc-900 px-5 py-2 text-xs font-medium text-white">Ver cold</span>
    </section>
  );
}
