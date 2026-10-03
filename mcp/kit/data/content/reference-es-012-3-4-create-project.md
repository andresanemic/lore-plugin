### 3.4 `create-project`

**Rol:** Inicializar Lore específico de un proyecto que hereda de un Área.

**Entrada:**

- Nombre del proyecto (por ejemplo, `"Landing Lore"`).
- Nombre del Área (por ejemplo, `"Desarrollo Frontend"`).

**Crea / actualiza:**

- La carpeta del proyecto, siempre en `{área}/proyectos/{slug}/` — nunca directamente bajo el Área.
- Si el Área tiene una carpeta `_starter/`, instancia sus plantillas (y cualquier scaffold de
  código) en el proyecto en lugar de partir de cero.
- Artefactos a nivel proyecto:
  - `lore/identidad.md` y `lore/principios.md`, con **su propio** contenido primero y un puntero
    al estándar del Área después.
  - `lore/index.md`, que referencia los módulos temáticos del Área por ruta relativa
    (`../../../lore/<módulo>.md` — tres niveles, no dos).
  - `FASES.md` (raíz) para estado actual y hoja de ruta.
  - `CLAUDE.md` o `AGENTS.md` (raíz) como contrato único y referencias operativas; el proyecto
    hereda la elección de host del Área.
- Registra el nuevo proyecto en el `FASES.md` del Área.

**Responsabilidades:**

- Dar al proyecto un lugar donde almacenar **su propio** criterio y estado.
- Evitar duplicar módulos temáticos ya definidos a nivel Área (se referencian, no se copian).

Usa `create-project` siempre que arranques una nueva base de código dentro de un Área existente.

---

