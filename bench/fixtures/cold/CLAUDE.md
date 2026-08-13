# CLAUDE.md — Desarrollo Web

> Fuente de verdad para Claude Code en esta área. Leer completo antes de cualquier tarea.
> **Desarrollo Web** — área de trabajo que agrupa proyectos web (sitios de marketing y webs SaaS)
> del mismo estándar premium.

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
