# Lore Plugin 2.4.3 — MYCELIUM's second trigger names what it doesn't check

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

A one-paragraph clarification to `MYCELIUM` mode's second trigger, found while sweeping an entire personal ecosystem with the tool 2.4.2 just shipped.

`MYCELIUM`'s second trigger fires right after installing or updating the kit, and until now it only said the check is cheap and must report `0 of 0` honestly on a fresh machine. What it did not say: this pass answers a narrower question than "am I current". Run on its own, it only asks *does what's here fire?* — it says nothing about whether a tree's Lore still matches the kit's current schema. A `lore/` written against an older version can be fully connected and materially behind at the same time, because being wired to a step and being current are independent properties.

This was confirmed at real scale on 2026-08-30: a 43-tree sweep for connectivity alone, using the exact mechanism `2.4.2` shipped, found and fixed six trees — and none of it substituted for asking whether any of the 43 needed `UPGRADE`. That question was never run, and nothing in the kit would have told the person running the sweep that it was still open. `UPGRADE` already runs this same scan on both ends of its own procedure (Phase 1c, Phase 6); a standalone connectivity pass after an update is the lighter check, not a replacement for `UPGRADE` when a tree is old enough to need one.

No code changed. `skills/transmute-lore/modes/mycelium.md` gains this paragraph on trigger 2. `npm test`: 181/181, unaffected.

And this release note itself is the first one written after `2.4.2` shipped a structural guard against release notes that don't follow the kit's fixed form — checked before this file was published, not after.

No corpus change, no migration, nothing to reinstall beyond picking up the reworded mode on next sync.

# Lore Plugin 2.4.3 — El segundo disparador de MYCELIUM nombra lo que no comprueba

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

Una aclaración de un párrafo al segundo disparador del modo `MYCELIUM`, encontrada barriendo un ecosistema personal completo con la herramienta que `2.4.2` acababa de publicar.

El segundo disparador de `MYCELIUM` corre justo después de instalar o actualizar el kit, y hasta ahora solo decía que el chequeo es barato y debe reportar `0 de 0` con honestidad en una máquina nueva. Lo que no decía: este paso contesta una pregunta más estrecha que "¿estoy al día?". Corrido solo, únicamente pregunta *¿lo que hay acá dispara?* — no dice nada sobre si el Lore de ese árbol sigue el esquema vigente del kit. Un `lore/` escrito contra una versión anterior puede estar perfectamente conectado y materialmente atrasado al mismo tiempo, porque estar enchufado a un paso y estar al día son propiedades independientes.

Esto se confirmó a escala real el 2026-08-30: un barrido de 43 árboles buscando solo conectividad, con el mismo mecanismo que `2.4.2` publicó, encontró y reparó seis — y nada de eso reemplazó la pregunta de si alguno de los 43 necesitaba `UPGRADE`. Esa pregunta nunca se hizo, y nada en el kit le habría avisado a quien corrió el barrido que seguía abierta. `UPGRADE` ya corre este mismo barrido en las dos puntas de su propio procedimiento (Fase 1c, Fase 6); un pase de conectividad solo tras actualizar es el chequeo liviano, no un reemplazo de `UPGRADE` cuando un árbol ya es lo bastante viejo como para necesitarlo.

No cambió código. `skills/transmute-lore/modes/mycelium.md` gana este párrafo en el disparador 2. `npm test`: 181/181, sin efecto.

Y esta nota de versión es la primera que se escribe después de que `2.4.2` publicara una guardia estructural contra notas de release que no siguen la forma fija del kit — verificada antes de publicarse este archivo, no después.

Sin cambio de corpus, sin migración, nada que reinstalar más allá de tomar el modo reescrito en la próxima sincronización.
