# Lore Plugin 2.3.0 — MYCELIUM, LEAVE, and a README that finally shrank

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

The key of this release is a new eighth mode, `MYCELIUM`: read-only, it reports which Invariant Clues **no step of any procedure runs** — a clue can be true, well-written and correctly filed, and still never fire if nothing invokes it. It runs on three triggers, the third on the way out of any pass that just wrote Lore, because a new clue is born disconnected by default. Alongside it, `LEAVE` lets a project step away from Lore governance without losing `lore/`, reversible through `UPGRADE`.

This release also carries a real instance of the failure MYCELIUM exists to catch: a README asked to shrink toward 10k words once grew instead, back in this kit's own genealogy. This time it dropped from ~13.4k to ~11k, gained a "Who is this for?" section, and wove five cultural references into the visible body instead of hiding them in a collapsed bibliography — the same instrument, run with more care. The eight skills stay unchanged in count; four defects in how they connect to each other were found and fixed along the way.

**If you have Lore written with an earlier version**, update the plugin first — the cache is keyed by version, so a publish without a bump is never received — then run `MYCELIUM` on it before anything else:

```text
corre el micelio
run MYCELIUM
```

Full notes: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.0

---

<a id="español"></a>

# Lore Plugin 2.3.0 — MYCELIUM, LEAVE, y un README que por fin encogió

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

La clave de este release es un octavo modo nuevo, `MYCELIUM`: de solo lectura, reporta qué Pistas Invariantes **ningún paso de ningún procedimiento corre** — una pista puede ser verdadera, estar bien escrita y archivada en el lugar correcto, y aun así nunca dispararse si nada la invoca. Corre con tres disparadores, el tercero al salir de cualquier pasada que acaba de escribir Lore, porque una pista nueva nace desconectada por defecto. Junto a él, `LEAVE` permite que un proyecto se aparte del gobierno de Lore sin perder `lore/`, reversible vía `UPGRADE`.

Este release también trae una instancia real del fallo que `MYCELIUM` existe para atrapar: un README al que se le pidió encoger hacia 10k palabras, en la propia genealogía de este kit, alguna vez creció en cambio. Esta vez bajó de ~13,4k a ~11k, ganó una sección "¿Para quién es esto?" y tejió cinco referencias culturales en el cuerpo visible en vez de esconderlas en una bibliografía colapsada — el mismo instrumento, corrido con más cuidado. Las ocho skills se mantienen sin cambios en cantidad; se encontraron y corrigieron cuatro defectos en cómo se conectan entre sí.

**Si tienes Lore escrito con una versión anterior**, actualiza primero el plugin — la caché se indexa por versión, así que una publicación sin bump nunca llega — y después corre `MYCELIUM` sobre él antes que cualquier otra cosa:

```text
corre el micelio
run MYCELIUM
```

Notas completas: https://github.com/andresanemic/lore-plugin/releases/tag/v2.3.0
