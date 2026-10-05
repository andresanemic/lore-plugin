## 2. Resumen de skills

El plugin Lore expone ocho skills principales a través de agentes de IA compatibles:

| Skill            | Propósito                                     | Frase disparadora típica                                   |
|------------------|-----------------------------------------------|------------------------------------------------------------|
| `use-lore`       | Punto de entrada, navegación y ayuda          | Se lee primero; se dispara al mencionar “lore” o al empezar una Área, un proyecto o un bot |
| `brainstorming-lore` | Diseñar cambios específicos de Lore sin apropiarse del brainstorming general | «haz brainstorming de este Lore», o la invoca una skill Lore dueña del artefacto |
| `create-area`    | Crear una nueva Área con Lore compartido      | «crea un área de trabajo para Frontend», «quiero empezar a trabajar en X con Lore» |
| `create-project` | Crear un proyecto que hereda de un Área       | «crea un proyecto de Sitio de marketing en el área Frontend» |
| `save-to-lore`   | Capturar criterio (**capture**), arbitrar criterio importado (**graft**) o minar condicionalmente una bandeja de notas sueltas | «guarda en lore», «destila la skill X en el lore», «revisa mis notas y guarda lo que corresponda» |
| `transmute-lore` | Operar un Lore existente en ocho modos | add / clean / translate / upgrade / prune / **mycelium** / leave / crystallize |
| `create-bot`     | Construir un bot: un solo lugar donde abrir sesión y trabajar en varios proyectos a la vez, con su criterio alcanzable y enrutado | «crea un bot para trabajar en X e Y» (nuevo) / «quiero un bot que federe el lore que ya existe en A y B» (federar) |
| `vespi`         | Correr una operación viva acotada bajo autoridad, con checkpoint durable (experimental) | No la invoca una frase de la persona: la toma el coordinador, en rol, cuando la operación está bajo presión |

Cada skill opera sobre, o crea, artefactos Markdown específicos dentro de tu repositorio.

**Idioma:** los skills están escritos en inglés, pero el Lore que generan se escribe siempre en el
**idioma del usuario** — tanto el contenido como los nombres de los artefactos. `identidad.md`,
`principios.md`, `FASES.md`, `proyectos/` son las formas canónicas en español (y así aparecen en
este documento); en inglés, por ejemplo, serían `identity.md`, `principles.md`, `PHASES.md`,
`projects/`. Permanecen fijos en todos los idiomas: el nombre del contrato elegido (`CLAUDE.md` o
`AGENTS.md`), `lore/`, `index.md`,
`golden-paths.md`, la profundidad de las rutas relativas y los términos técnicos de uso general en
inglés (workflow, commit, stack, scaffold…). Dentro de un corpus existente mandan los nombres ya
establecidos. Un Lore en el idioma equivocado se estandariza con `transmute-lore` en modo
`translate`.

Estos skills **no son comandos de una CLI**: son *skills* del agente que se disparan por lenguaje natural según la frase que uses, no por flags o sintaxis de terminal. Las frases de la tabla son ejemplos de invocación real, tomadas de los disparadores documentados en cada `SKILL.md`.

---

