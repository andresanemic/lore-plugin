# Lore Plugin 2.4.7 — Claude without hook context, bodies checked on opening

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

Claude Code no longer receives context authored by Lore hooks. The 2.4.5 Stop adapter was visible, and 2.4.6 moved the same additionalContext delivery to UserPromptSubmit without removing the root cause: Claude could still surface and answer it. 2.4.7 removes the Claude context adapter and its dead test surface entirely. In repository tests, SessionStart produces no output, and Claude receives no automatic reminder to display, interpret, or answer.

Codex keeps the automatic SessionStart plus PostToolUse guard and the deferred per-session baseline introduced in 2.4.6. The baseline filename now derives from SHA-256 rather than SHA-1, closing CodeQL alert #4 without changing the session contract. The opening path of use-lore now runs the bundled mycelium bodies check against the governed root before relying on its criterion, and repeats it when a territory change resolves another root. A clean result stays below the conversation; a disconnected body produces only the concrete decision to connect it or declare it outside the universe, never an automatic edit.

This patch touches the two host adapters, use-lore, their executable regressions, and the live host documentation; the public seven-skill surface remains, with use-lore updated rather than a new skill added. Repository verification is 199/199, git diff --check is clean, and npm pack --dry-run excludes the removed Claude adapter. Claude Code CLI and App reception both passed locally without conversational hook output. No corpus change, no Lore schema migration, and no scientific claim.

# Lore Plugin 2.4.7 — Claude sin contexto de hook, cuerpos comprobados al abrir

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

Claude Code deja de recibir contexto escrito por hooks de Lore. El adaptador Stop de 2.4.5 era visible, y 2.4.6 movió la misma entrega de additionalContext a UserPromptSubmit sin retirar la causa raíz: Claude todavía podía mostrarla y responderle. 2.4.7 retira por completo el adaptador contextual de Claude y su superficie de pruebas muerta. En las pruebas del repositorio, SessionStart no produce salida y Claude no recibe ningún recordatorio automático que mostrar, interpretar o responder.

Codex conserva la guardia automática SessionStart más PostToolUse y la base diferida por sesión introducida en 2.4.6. El nombre de archivo de esa base ahora deriva de SHA-256 en vez de SHA-1, cerrando la alerta #4 de CodeQL sin cambiar el contrato de sesión. La apertura de use-lore ahora ejecuta la comprobación incluida mycelium bodies sobre la raíz gobernada antes de apoyarse en su criterio, y la repite cuando un cambio de territorio resuelve otra raíz. Un resultado limpio queda debajo de la conversación; un cuerpo desconectado produce solo la decisión concreta de conectarlo o declararlo fuera del universo, nunca una edición automática.

Este patch toca los dos adaptadores de host, use-lore, sus regresiones ejecutables y la documentación viva de hosts; se conserva la superficie pública de siete skills, con use-lore actualizado en vez de sumar una skill nueva. La verificación del repositorio es 199/199, git diff --check está limpio y npm pack --dry-run excluye el adaptador Claude retirado. La recepción en Claude Code CLI y App pasó localmente sin salida conversacional del hook. Sin cambio de corpus, sin migración del esquema Lore y sin afirmación científica.
