# Notas Grok + Claude Code para la poda — 2026-08-23

> Para integrar en la poda de skills, dentro de `2.3.0` — el bump a `3.0` se planteó y se descartó
> (2026-08-24, Andrés: *"2.3, no 2.4, perdón"* tras la corrección previa de 2.4→2.3; el volumen de
> trabajo no es lo mismo que una ruptura de contrato público, y nada de lo hecho rompe algo).
> No es benchmark, es criterio de forma y de comunicación.

## Grok — por qué todavía no es 10

- **Complejidad acumulada:** 8 skills + 8 modos transmute-lore + MYCELIUM + PRUNE + LEAVE + segundo caso brainstorming + perfil profesional + cifrado + cristalización. Poderoso pero costo cognitivo real para nuevo usuario, aunque onboarding sea brainstorm.
- **Documentación densa:** USAGE, REFERENCE, CASES, specs por versión, release notes — alta calidad pero volumen alto. 90 segundos ayuda, pero inmersión exige tiempo.
- **Adopción/superficie:** nicho de autor, Claude Code + Codex excelentes, resto copia skills. Provider-neutral a propósito limita alcance inmediato — no es defecto, es decisión.
- **Dependencia de disciplina:** MYCELIUM/PRUNE detectan degradación, pero valor depende de destilar/aprobar. Kit no obliga hábito, solo lo hace visible.

## Claude Code — lectura honesta (no nota)

- Mercado resuelve **gestión de proceso** (Spec Kit 120k★, GSD 48k★ en 4 meses, BMAD etc: Constitution→Plan→Tasks→Implement, quality gates). Lore resuelve **gestión de criterio** — ningún pipeline pregunta si el conocimiento sigue vivo o si se arrastran reglas muertas. Evidencia: CLAUDE.md es advisory, se olvida a mitad de sesión cuando contexto se llena. MYCELIUM/PRUNE atacan justo eso: criterio “parece vivo” pero nadie lo corre.
- Estrellas ≠ rigor. Viralidad premia generalidad + npx mínimo + dolor masivo. Lore apuesta profundidad sobre problema poco articulado (preservar criterio ganado con fricción), con curva de entrada real. No compite en estrellas — decisión consciente de nicho.
- Lo que sí pesa: Spec Kit/GSD tienen miles de usuarios golpeando con casos límite que un autor solo no anticipa. Autoconsistencia de Lore es más sofisticada filosóficamente, pero “sofisticado” ≠ “probado en 4000 forks”. Validación por volumen es rigor que Grok no ponderó.

## Docs más simples y cálidas, dentro de 2.3.0

**Diagnóstico:** docs actuales se leen como paper. Calidad alta no se negocia, pero hay que aflojar la forma para que más gente use el kit. 90s es puerta, el resto debe sentirse invitación, no tesis. Andrés lo reforzó el 2026-08-24: la primera Entre entre un usuario nuevo y el kit **arranca leyendo la documentación** — si no se entiende o se siente muy compleja, esa Entre nunca llega a nacer.

**Voz confirmada (mitad sensible de #20; calibrada y aprobada 2026-08-24):**
- “¿De verdad vas a dejar que se esfume lo que aprendiste usando IA?” → descartada, muy marquetera.
- Punto medio aprobado: *"Cada sesión arranca en blanco. Todo lo que le enseñaste al agente ayer
  —cada corrección, cada ida y vuelta— se borra, a menos que quede escrito en algo que vuelva a
  leer. Tu Lore es donde eso sí permanece."* Reconoce el esfuerzo invertido y cierra con
  reafirmación en vez de dejar solo la pérdida flotando; nunca se dirige al lector con una pregunta.
- Menos “Pista Invariante / Frontera de validez”, más escena y frase llana que cualquiera repita.

## Qué integrar en la poda de docs (propuesta)

1. ~~**KISS real, no solo vocabulario**~~ — **hecho, 2026-08-24.** MYCELIUM ya podado a frase llana
   (`1f6a3d7`). Las 6 descriptions que resumían workflow, reescritas a "cuándo usar" (`22ab396`).
   `transmute-lore` partido en dispatcher + `modes/<nombre>.md`, 11.4k→2.3k palabras (`57f67de`);
   `create-bot` **no** se partió — sus dos modos son ramas de un procedimiento lineal compartido, no
   secciones independientes, y partirlo hubiera duplicado contenido en vez de ahorrarlo.

2. **Documentación emocional y simple:** reescribir README/USAGE/90s quitando densidad de paper, sumando ganchos emocionales arriba (voz confirmada más arriba), manteniendo tablas de referencia como anexo. Medir: tiempo hasta primer entregable con usuario que no construyó el kit (cuando asciende #20 a confirmed). Criterio: si un lector no técnico no puede contar con sus palabras por qué Lore importa, el doc no pasó. **Pendiente — siguiente pase, después del barrido del ecosistema.**

3. ~~**Superficie**~~ — **hecho, 2026-08-24 (`b1d5ed4`).** README distingue instalación verificada (Claude Code/Codex, vía gestor de plugins) de copia manual sin verificación (OpenCode/Cursor/Antigravity, #22), en los dos idiomas.

4. **Hábito:** MYCELIUM ya reporta pares pista→paso y bloquea PRUNE si hay una desconectada. No añadir capa que “obligue” — añadir visibilidad en FASES.md del área (peso antes/después, como ya exige #24). **Sin cambios — ya cumplido por diseño.**

5. **Comprimir también en cantidad de archivos, no solo en palabras — permiso de Andrés, 2026-08-24.**
   Analizar si `USAGE`/`REFERENCE`/lo que venga de spec-kit necesitan seguir separados, o si
   parte de esa separación es la misma clase de aparato que `PRUNE` ya sabe contar contra
   contenido. **No decidido, no ejecutado — se analiza recién al empezar la fase de pase de voz y
   poda de docs**, junto con el punto 2. No confundir con el split de skills del punto 1 (ese fue
   contenido de una skill movido a archivos que se cargan bajo demanda, no documentación pública
   podada en cantidad).

Frontera: poda sin defecto localizado = acción sin causa (error simétrico a reparación aditiva). El punto 5 todavía no tiene su defecto localizado — por eso queda en análisis, no en ejecución, hasta la fase de docs.

> Benchmark base piloto 2026-08-23 (lore 2.3.0 borrador, muse-spark free, n=1): lore 4/6 vs cold 0/6, contando solo el trial 1 — la corrida completa da lore 6/8, cold 0/8, con 20 de 36 corridas en n/a por rate-limit free. El brazo cold no es falsable en 5 de las 6 tareas (revisión de Claude Code, 2026-08-23/24). Detalle en bench/base/results/results.csv. Resultado registrado en plugins/FASES.md; la poda de MYCELIUM no vuelve a benchmark (ver esa entrada para el porqué).
