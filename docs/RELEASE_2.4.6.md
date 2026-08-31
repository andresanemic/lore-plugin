# Lore Plugin 2.4.6 — Silent MYCELIUM guard on Claude Code

Bug fix. The 2.4.5 in-place attempt put the Claude Code check on the `Stop` event with `hookSpecificOutput.additionalContext`, expecting a silent injection. Claude Code surfaces that field on `Stop` as a visible `<system-reminder>` on every turn — the opposite of silent. 2.4.6 corrects it:

- **Event moved to `UserPromptSubmit`**, where `additionalContext` is injected into context without a visible block. Codex is unchanged (it already uses `PostToolUse`).
- **Deferred arming.** Neither host evaluates on session entry now. `SessionStart` records a silent per-session baseline (content digest + `alwaysOnBytes`); the guard checks only once the Lore departs from that baseline — i.e. once this session has actually touched Lore. A receipt left stale by an earlier session stays silent until the first in-session edit. First load is a snapshot write and nothing else.
- **The intervention text is now marked as a hook-to-agent message**: the agent acts on it silently and does not report back to the user that it checked, registered, or that "everything is connected." Only a material-expansion approval still surfaces, because that needs a human decision.

Same two guarantees as 2.4.5 (a Lore change cannot close against an older receipt; ≥8 KiB growth in always-loaded criterion needs authority) — only the Claude Code delivery changed. `hooks/hooks.json` now declares `UserPromptSubmit` instead of `Stop`. `npm test` covers the deferred arming, the event, and the wording. Install by tag reconstructs exactly this.

---

# Lore Plugin 2.4.6 — Guardia MYCELIUM silenciosa en Claude Code

Corrección de bug. El intento in-place de 2.4.5 puso el chequeo de Claude Code en el evento `Stop` con `hookSpecificOutput.additionalContext`, esperando una inyección silenciosa. Claude Code muestra ese campo en `Stop` como un `<system-reminder>` visible, en cada turno — lo contrario de silencioso. 2.4.6 lo corrige:

- **Evento movido a `UserPromptSubmit`**, donde `additionalContext` se inyecta al contexto sin bloque visible. Codex no cambia (ya usa `PostToolUse`).
- **Armado diferido.** Ningún host evalúa en el arranque de la sesión. `SessionStart` registra una base de sesión en silencio (digest de contenido + `alwaysOnBytes`); el guard solo comprueba cuando el Lore se aparta de esa base — o sea cuando esta sesión tocó el Lore de verdad. Un recibo que quedó desfasado de una sesión anterior sigue en silencio hasta la primera edición in-session. La primera carga escribe un snapshot y nada más.
- **El texto de la intervención ahora se declara mensaje del hook al agente**: el agente actúa en silencio y no le informa al usuario que revisó, registró, ni que "quedó todo conectado". Solo sube al usuario la aprobación por expansión material, porque esa necesita decisión humana.

Las mismas dos garantías que 2.4.5 (un cambio de Lore no cierra contra un recibo viejo; un crecimiento ≥8 KiB en el criterio siempre cargado necesita autoridad) — solo cambió la entrega en Claude Code. `hooks/hooks.json` ahora declara `UserPromptSubmit` en vez de `Stop`. `npm test` cubre el armado diferido, el evento y la redacción. Instalar por tag reconstruye exactamente esto.
