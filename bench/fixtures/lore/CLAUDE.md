# CLAUDE.md — Desarrollo Web

> Fuente de verdad para Claude Code en esta área. Leer completo antes de cualquier tarea.
> **Desarrollo Web** — área de trabajo que agrupa proyectos web (sitios de marketing y webs SaaS)
> del mismo estándar premium.

## El Lore — dónde vive el criterio del área

La memoria destilada del área vive en **`lore/`**. Antes de decidir nada sobre método u oficio:

- `lore/index.md` — mapa: tema · cuándo consultarlo · archivo
- `lore/identidad.md` — el estándar web premium + qué somos y qué NO (incluye la **variante SaaS**)
- `lore/principios.md` — leyes invariantes de construcción (incluye la **variante SaaS**: acceso,
  Supabase, Stripe)
- `lore/tiers.md` — **el eje de dificultad**: Landing / Sitio / SaaS.
- Módulos temáticos: `animation.md`, `composicion.md`, `layout.md`, `routing.md`, `scroll.md`,
  `responsive.md`, `copy.md`, `testing.md` · backend SaaS: `supabase.md`, `stripe.md`

## Cómo se trabaja acá

1. Leer este archivo antes de cualquier tarea.
2. Todo entregable se juzga contra el estándar premium del área.

## Stack (web)

Next.js (App Router) + TypeScript · Tailwind v4 (`@theme`, sin config) · GSAP — últimas versiones,
sin pins. SSR + API Routes en Vercel. Para webs SaaS: Supabase (auth + Postgres + storage) y Stripe
(suscripciones, webhooks, portal).

## Reglas base

- Nada de Playwright. Validación visual/funcional manual, por el usuario.
- `git push` solo cuando el usuario lo diga.
- Nada de env hardcodeado; error descriptivo si falta. Chequeos de acceso siempre server-side; RLS
  siempre activo; el webhook de Stripe siempre verifica la firma.
