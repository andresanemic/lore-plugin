### 3.3 `create-area`

**Rol:** Inicializar una raíz de Lore compartida para un dominio (Área).

**Entrada:**

- Nombre del Área (por ejemplo, `"Desarrollo Frontend"`).

**Crea / actualiza:**

- Carpeta `lore/` a nivel Área, con:
  - `lore/identidad.md`
  - `lore/principios.md`
  - `lore/index.md`
  - módulos temáticos bajo `lore/`, según se necesiten.
- Un contrato a nivel Área —`CLAUDE.md` para Claude Code o `AGENTS.md` para Codex— y `FASES.md`
  (contrato y registro de proyectos).
- Una carpeta `proyectos/` vacía, donde nacerán los proyectos futuros.
- Una carpeta `_starter/` con las plantillas de proyecto ajustadas al dominio del Área
  (`CLAUDE.template.md` o `AGENTS.template.md`, `FASES.md` y, si aplica,
  `golden-paths.template.md`, más cualquier scaffold de código base); `create-project` las instancia por proyecto.
  El piso es estructural (2.1.5): always-on, `FASES` fuera, umbral, heredar por ruta — para un Área
  `bots`, la variante es `canon/` + enrutamiento.

**Responsabilidades:**

- Establecer un lugar donde viva el criterio compartido de un dominio.
- Proporcionar el esqueleto (`_starter/`) que los proyectos instancian.
- **Devolver el control a la skill que la llamó** (2.1.1). Un Área es tantas veces un **paso** como un destino. Cuando la llamó `create-bot`, el Área es `bots` —**una**, con todos los bots como proyectos— y su dominio son los bots del usuario, nunca el de alguno de ellos.

Usa `create-area` cuando quieras que varios proyectos compartan el mismo criterio fundamental.

---

