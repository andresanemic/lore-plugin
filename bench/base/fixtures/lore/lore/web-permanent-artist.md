# Permanent Artist — landing mínima (alpha 0.1)

> Vara mínima derivada de `bots/proyectos/bot-lus-lore/specs/004-permanent-artist-alpha/spec.md` y `desarrollo-web` premium.

Landing local-first sin backend: onboarding sin cuenta, meta rectora, proyecto con hoja de ruta, tablero Design Thinking 5 fases, radar oportunidades. Stack: Next.js App Router + Tailwind v4 + GSAP (últimas, sin pins). Tier: Landing.

## Vara web aplicable

- **Animación:** estado inicial en markup (`opacity:0` o `opacity-0`), confirmar con `gsap.fromTo`, nunca `gsap.from` (FOUC). Respetar `prefers-reduced-motion`.
- **Viewport:** nunca `h-screen` / `100vh`; usar `min-h-svh` / `min-h-dvh` / `100svh`.
- **Tipografía:** `next/font` sin Inter/Roboto/Arial/Helvetica; usar Fraunces, Instrument, etc.
- **Preflight:** antes de cerrar, `node tools/preflight.mjs` debe pasar (sin `gsap.from`, sin `h-screen`, sin `Inter`).

Entregable: `components/Hero.tsx` o `app/page.tsx` con hero animado + sección viewport, tipografía correcta.
