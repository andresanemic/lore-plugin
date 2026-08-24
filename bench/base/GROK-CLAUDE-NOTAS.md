# Notas Grok + Claude Code para la poda — 2026-08-23

> Para integrar en la poda de skills 2.3 → 3.0. No es benchmark, es criterio de forma y de comunicación.

## Grok — por qué todavía no es 10

- **Complejidad acumulada:** 8 skills + 8 modos transmute-lore + MYCELIUM + PRUNE + LEAVE + segundo caso brainstorming + perfil profesional + cifrado + cristalización. Poderoso pero costo cognitivo real para nuevo usuario, aunque onboarding sea brainstorm.
- **Documentación densa:** USAGE, REFERENCE, CASES, specs por versión, release notes — alta calidad pero volumen alto. 90 segundos ayuda, pero inmersión exige tiempo.
- **Adopción/superficie:** nicho de autor, Claude Code + Codex excelentes, resto copia skills. Provider-neutral a propósito limita alcance inmediato — no es defecto, es decisión.
- **Dependencia de disciplina:** MYCELIUM/PRUNE detectan degradación, pero valor depende de destilar/aprobar. Kit no obliga hábito, solo lo hace visible.

## Claude Code — lectura honesta (no nota)

- Mercado resuelve **gestión de proceso** (Spec Kit 120k★, GSD 48k★ en 4 meses, BMAD etc: Constitution→Plan→Tasks→Implement, quality gates). Lore resuelve **gestión de criterio** — ningún pipeline pregunta si el conocimiento sigue vivo o si se arrastran reglas muertas. Evidencia: CLAUDE.md es advisory, se olvida a mitad de sesión cuando contexto se llena. MYCELIUM/PRUNE atacan justo eso: criterio “parece vivo” pero nadie lo corre.
- Estrellas ≠ rigor. Viralidad premia generalidad + npx mínimo + dolor masivo. Lore apuesta profundidad sobre problema poco articulado (preservar criterio ganado con fricción), con curva de entrada real. No compite en estrellas — decisión consciente de nicho.
- Lo que sí pesa: Spec Kit/GSD tienen miles de usuarios golpeando con casos límite que un autor solo no anticipa. Autoconsistencia de Lore es más sofisticada filosóficamente, pero “sofisticado” ≠ “probado en 4000 forks”. Validación por volumen es rigor que Grok no ponderó.

## Giro a 3.0 — docs simples, emocionales, sin perder calidad

**Diagnóstico:** docs actuales se leen como paper. Calidad alta no se negocia, pero hay que aflojar la forma para que más gente use el kit. 90s es puerta, el resto debe sentirse invitación, no tesis.

**Voz 3.0 (mitad sensible de #20):**
- “¿De verdad vas a dejar que se esfume lo que aprendiste usando IA?”
- “Tu Lore te puede acompañar por años — todo lo que aprendas seguirá vigente hasta que tú decidas.”
- Menos “Pista Invariante / Frontera de validez”, más escena y frase llana que cualquiera repita.

**Bump 3.0 (no 2.x):** con MYCELIUM podado a frase llana + benchmark base que muda de 12 tareas web a 6 artefactos complejos + docs reescritas en clave emocional + partición por modos, el cambio es de **posicionamiento y forma**, no de patch. #12 exige que la versión coincida en plugin.json, README/REFERENCE/USAGE, release y tag al publicar — se prepara como 3.0.0 local, sin tag ni push hasta aprobación.

## Qué integrar en la poda 3.0 (propuesta)

1. **KISS real, no solo vocabulario:** ya podamos MYCELIUM a frase llana. Siguiente poda con evidencia: **8 descriptions** resumen workflow donde writing-skills manda “Reference → Tables” — reescribir 8 líneas frontmatter para que agente lea skill, no description. Y **partir transmute-lore/create-bot por modos** (cada modo a `modes/<nombre>.md`): una tarea carga solo el modo que usa, no 11k palabras. Es la misma poda, un nivel arriba.

2. **Documentación emocional y simple:** reescribir README/USAGE/90s en 3.0 quitando densidad de paper, sumando ganchos emocionales arriba, manteniendo tablas de referencia como anexo. Medir: tiempo hasta primer entregable con usuario que no construyó el kit (cuando asciende #20 a confirmed). Criterio: si un lector no técnico no puede contar con sus palabras por qué Lore importa, el doc no pasó.

3. **Superficie:** no ampliar skills, declarar “Claude Code + Codex verificados, resto por copia manual con verificación por identidad (#22)”. Provider-neutral se mantiene, pero sin prometer instalación que no se verificó.

4. **Hábito:** MYCELIUM ya reporta pares pista→paso y bloquea PRUNE si hay Aislada. No añadir capa que “obligue” — añadir visibilidad en FASES.md del área (peso antes/después, como ya exige #24).

Frontera: poda sin defecto localizado = acción sin causa (error simétrico a reparación aditiva). Las dos de arriba tienen defecto localizado (descriptions que resumen workflow, y carga de 11k por tarea que usa 1 modo) — por eso entran después del benchmark base piloto, no antes.

> Benchmark base piloto 2026-08-23 (lore 3.0 borrador, muse-spark free, n=1): lore 4/6 vs cold 0/6. Detalle en bench/base/results/results.csv. n=1 suficiente para pasar a Claude Code — el -n3 quedó con n/a por rate-limit free y no se reintenta ahora.
