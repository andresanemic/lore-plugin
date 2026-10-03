### Tu primera Área y proyecto

Lore escala mediante **Áreas**: una carpeta madre que posee criterio compartido; los proyectos lo
heredan en lugar de duplicar reglas.

```text
crea un área de trabajo para "Frontend asistido por IA"
crea un proyecto "Sitio de marketing" en el área "Frontend asistido por IA"
```

- `create-area` inicializa `lore/identidad.md`, `lore/principios.md`, `lore/index.md`, los módulos
  temáticos que hagan falta, el contrato del Área y su `FASES.md`, más un `_starter/` con las
  plantillas que `create-project` instancia.
- `create-project` crea la carpeta en `{Área}/proyectos/{slug}/` —nunca directamente bajo el Área—,
  prepara `lore/` para módulos propios (los genéricos del Área solo se referencian por ruta
  relativa), `FASES.md` y el contrato, y registra el proyecto en el `FASES.md` del Área.

Después trabajas en el proyecto como siempre y llamas a `save-to-lore` cada vez que resuelves algo
que revela criterio reutilizable. **Si es tu primera vez, no necesitas saber ningún nombre:** escribe
*«quiero comenzar a usar Lore Plugin, ayúdame»* y el kit abre un brainstorming que termina creando tu
primer artefacto.

