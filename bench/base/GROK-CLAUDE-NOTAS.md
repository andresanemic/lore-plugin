# Notas Grok + Claude Code para la poda — 2026-08-23

> Para integrar en la poda de skills 2.3.x. No es benchmark, es criterio de forma.

## Grok — por qué todavía no es 10

- **Complejidad acumulada:** 8 skills + 8 modos transmute-lore + MYCELIUM + PRUNE + LEAVE + segundo caso brainstorming + perfil profesional + cifrado + cristalización. Poderoso pero costo cognitivo real para nuevo usuario, aunque onboarding sea brainstorm.
- **Documentación densa:** USAGE, REFERENCE, CASES, specs por versión, release notes — alta calidad pero volumen alto. 90 segundos ayuda, pero inmersión exige tiempo.
- **Adopción/superficie:** nicho de autor, Claude Code + Codex excelentes, resto copia skills. Provider-neutral a propósito limita alcance inmediato — no es defecto, es decisión.
- **Dependencia de disciplina:** MYCELIUM/PRUNE detectan degradación, pero valor depende de destilar/aprobar. Kit no obliga hábito, solo lo hace visible.

## Claude Code — lectura honesta (no nota)

- Mercado resuelve **gestión de proceso** (Spec Kit 120k★, GSD 48k★ en 4 meses, BMAD etc: Constitution→Plan→Tasks→Implement, quality gates). Lore resuelve **gestión de criterio** — ningún pipeline pregunta si el conocimiento sigue vivo o si se arrastran reglas muertas. Evidencia: CLAUDE.md es advisory, se olvida a mitad de sesión cuando contexto se llena. MYCELIUM/PRUNE atacan justo eso: criterio “parece vivo” pero nadie lo corre.
- Estrellas ≠ rigor. Viralidad premia generalidad + npx mínimo + dolor masivo. Lore apuesta profundidad sobre problema poco articulado (preservar criterio ganado con fricción), con curva de entrada real. No compite en estrellas — decisión consciente de nicho.
- Lo que sí pesa: Spec Kit/GSD tienen miles de usuarios golpeando con casos límite que un autor solo no anticipa. Autoconsistencia de Lore es más sofisticada filosóficamente, pero “sofisticado” ≠ “probado en 4000 forks”. Validación por volumen es rigor que Grok no ponderó.

## Qué integrar en la poda (propuesta)

1. **KISS real, no solo vocabulario:** ya podamos MYCELIUM a frase llana. Siguiente poda con evidencia: **8 descriptions** resumen workflow donde writing-skills manda “Reference → Tables” — reescribir 8 líneas frontmatter para que agente lea skill, no description. Y **partir transmute-lore/create-bot por modos** (cada modo a `modes/<nombre>.md`): una tarea carga solo el modo que usa, no 11k palabras. Es la misma poda, un nivel arriba.

2. **Documentación:** no quitar calidad, quitar costo de entrada. Mantener 90s como puerta, mover peso a referencia. Medir: tiempo hasta primer entregable con usuario que no construyó el kit (cuando asciende #20 a confirmed).

3. **Superficie:** no ampliar skills, declarar “Claude Code + Codex verificados, resto por copia manual con verificación por identidad (#22)”. Provider-neutral se mantiene, pero sin prometer instalación que no se verificó.

4. **Hábito:** MYCELIUM ya reporta pares pista→paso y bloquea PRUNE si hay Aislada. No añadir capa que “obligue” — añadir visibilidad en FASES.md del área (peso antes/después, como ya exige #24).

Frontera: poda sin defecto localizado = acción sin causa (error simétrico a reparación aditiva). Las dos de arriba tienen defecto localizado (descriptions que resumen workflow, y carga de 11k por tarea que usa 1 modo) — por eso entran después del benchmark base 2.3.0, no antes.
