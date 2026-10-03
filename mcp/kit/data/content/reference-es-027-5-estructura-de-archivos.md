## 5. Estructura de archivos

Una estructura típica de Lore, con Área y proyecto, se ve así:

```text
{área}/
  lore/
    identidad.md
    principios.md
    index.md
    <módulos-temáticos>.md
  _starter/                    → plantillas que create-project instancia
    CLAUDE.template.md o AGENTS.template.md
    FASES.md
    golden-paths.template.md   → solo si el dominio lo justifica
  FASES.md                     → registro de proyectos del Área
  CLAUDE.md o AGENTS.md        → contrato único del Área, elegido por host
  .lore-mycelium               → recibo v2 del estado aceptado de Lore: digest de contenido
                                 más bytes de los cuerpos de criterio cargados en cada tarea.
                                 Se escribe con `lore-plugin mycelium receipt` y se
                                 versiona: el mismo estado produce el mismo **digest** en
                                 cualquier máquina. La afirmación es sobre el digest y
                                 termina ahí — lo demás que lleve el recibo es estado local

  proyectos/
    {slug}/
      lore/
        identidad.md            → contenido propio + puntero al del Área
        principios.md           → contenido propio + puntero al del Área
        index.md                → apunta a los módulos del Área por ../../../lore/<módulo>.md
        <módulos propios>.md    → solo criterio específico de este proyecto
      FASES.md
      CLAUDE.md o AGENTS.md
```

Puntos clave de esta jerarquía:

- Los proyectos **siempre** viven en `{área}/proyectos/{slug}/`, nunca directamente bajo el Área.
- Los módulos temáticos genéricos **no se copian** al proyecto: viven una sola vez en `{área}/lore/`, y el `index.md` del proyecto los referencia por ruta relativa, que sube **tres** niveles, no dos.
- El criterio compartido vive en el Área. El criterio específico de proyecto vive en el proyecto.

---

