# Lore Plugin 2.4.8 — Clearer checks, better routing, cleaner deliverables

> [README](https://github.com/andresanemic/lore-plugin#readme) · [Español](#español)

Lore Plugin 2.4.8 makes MYCELIUM reports easier to interpret without giving them guarantees they cannot support. MYCELIUM now says what it checked and what remained outside its review, so a clean result no longer looks like proof that every possible problem was ruled out. It also adds a check for federated bots: when a bot can route work to another area or project but its opening instructions do not load that tree's full context, Lore points to the missing setup; when the setup is complete, it stays silent.

`use-lore`, `brainstorming-lore`, and the `create-*` skills now separate their jobs more clearly. Requests to create a new area, project, or bot go directly to the matching creation skill, while plain-language requests to think through a Lore-governed design reach `brainstorming-lore`. `use-lore` can occasionally explain what kind of work comes next in ordinary language, and all seven skills now translate internal terminology before delivering a site, document, deck, or other external artifact.

No public function was removed. Lore Plugin 2.4.8 was tested on Claude Code, Codex, and OpenCode. Existing Lore needs no migration; only federated bots with incomplete loading instructions may be asked to update them.

# Lore Plugin 2.4.8 — Comprobaciones más claras, mejor enrutamiento y entregables limpios

> [README](https://github.com/andresanemic/lore-plugin/blob/main/README.md#español)

Lore Plugin 2.4.8 hace que los reportes de MYCELIUM sean más fáciles de interpretar sin atribuirles garantías que no pueden dar. MYCELIUM ahora dice qué comprobó y qué quedó fuera de su revisión, de modo que un resultado limpio ya no parece descartar cualquier problema posible. También agrega una comprobación para bots federados: si un bot puede enviar trabajo a otra área o proyecto, pero sus instrucciones de apertura no cargan el contexto completo de ese árbol, Lore señala qué configuración falta; si la carga está completa, permanece en silencio.

`use-lore`, `brainstorming-lore` y las skills `create-*` ahora separan mejor sus responsabilidades. Las peticiones para crear un área, proyecto o bot nuevo van directamente a la skill correspondiente, mientras las peticiones en lenguaje cotidiano para pensar un diseño gobernado por Lore llegan a `brainstorming-lore`. `use-lore` puede anticipar ocasionalmente qué tipo de trabajo viene en lenguaje común, y las siete skills traducen su terminología interna antes de entregar un sitio, documento, deck u otro artefacto externo.

No se eliminó ninguna función pública. Lore Plugin 2.4.8 fue probado en Claude Code, Codex y OpenCode. El Lore existente no necesita migración; solo los bots federados con instrucciones de carga incompletas podrían recibir una indicación para actualizarlas.
