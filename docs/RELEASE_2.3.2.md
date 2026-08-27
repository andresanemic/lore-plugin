# Lore Plugin 2.3.2 — Silence when unaffected

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

The kit was offering an upgrade whenever the installed version was ahead of what a tree was written against. That is correct when the delta touches that tree; it is friction when it doesn't. 2.3.2 keeps the version check but adds a relevance gate: `use-lore` now collects the RELEASE notes between the local `## UPGRADE a X.Y.Z` and the installed kit, and intersects them with what that tree actually uses (`lore/index.md` + `lore/enrutamiento.md`, area/project/bot shape, and any open concern in `FASES.md` that names an affected module). If there is no intersection — e.g. a redaccion-noticias/Place To Be tree on 2.3.0 with kit 2.3.1–2.3.2 where the delta (save-to-lore provenance, use-lore session guard, obsidian-lore archive, this gate itself) touches none of `anatomia-nota`/`estilo-y-legibilidad`/`fuentes-y-transcripcion` — the session stays silent and does not block. `Kit is ahead so I must offer` without checking the delta is the rationalization this gate closes. When there is an intersection, the offer is made once before non-trivial work, as before. `scripts/barrido-lore.ps1` mirrors the distinction as `desactualizado` vs `desactualizado (no afecta)`, the latter leaving the triage queue and requiring no UPGRADE.

No Lore needs rewriting for this gate: it changes when the offer appears, not what the Lore must contain. Eight skills, no contract change.

**If you have Lore written with an earlier version**, update the plugin first — the cache is keyed by version — then continue. Trees whose delta is empty for them require no action; `barrido-lore.ps1` in triage will show `desactualizado (no afecta)` and stay out of the queue.

Full notes: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.2

---

<a id="español"></a>

# Lore Plugin 2.3.2 — silencio cuando no afecta

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

El kit ofrecía actualización siempre que la versión instalada iba por delante de la que registró el árbol. Eso es correcto cuando el delta toca a ese árbol; es fricción cuando no. 2.3.2 mantiene el chequeo de versión pero añade un filtro de relevancia: `use-lore` ahora reúne las notas de RELEASE entre el `## UPGRADE a X.Y.Z` local y el kit instalado, y las cruza con lo que ese árbol realmente usa (`lore/index.md` + `lore/enrutamiento.md`, forma área/proyecto/bot y cualquier pendiente abierto en `FASES.md` que nombre un módulo afectado). Si no hay intersección — ej. un árbol redaccion-noticias/Place To Be en 2.3.0 con kit 2.3.1–2.3.2 donde el delta (procedencia en save-to-lore, guardia de sesión en use-lore, archivado en obsidian-lore, este mismo gate) no toca `anatomia-nota`/`estilo-y-legibilidad`/`fuentes-y-transcripcion` — la sesión permanece en silencio y no bloquea. `El kit va por delante así que debo ofrecer` sin revisar el delta es la racionalización que este gate cierra. Cuando hay intersección, se ofrece `transmute-lore` en UPGRADE una vez antes del trabajo no-trivial, como antes. `scripts/barrido-lore.ps1` refleja la distinción como `desactualizado` vs `desactualizado (no afecta)`, este último fuera de la cola y sin requerir UPGRADE.

Este gate no exige reescribir Lore: cambia cuándo aparece la oferta, no qué debe contener el Lore. Ocho skills, sin cambio de contrato.

**Si tienes Lore escrito con una versión anterior**, actualiza primero el plugin — la caché se indexa por versión — y continúa. Los árboles cuyo delta no les afecta no requieren acción; `barrido-lore.ps1` en triage mostrará `desactualizado (no afecta)` y quedará fuera de la cola.

Notas completas: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.2
