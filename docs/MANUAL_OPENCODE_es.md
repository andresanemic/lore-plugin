# Manual de Lore Plugin y Vespi desde OpenCode

Este manual describe Lore Plugin 2.4.9 y el kernel Vespi 0.1.4, publicados el 2026-10-05. Sigue las instrucciones de instalación de esa versión; este manual no usa instrucciones de Ollama ni de modelos locales.

## Qué vas a lograr

Vas a abrir un proyecto con OpenCode, hacer que Lore Plugin cargue el criterio y estado existentes, y usar Vespi cuando una operación necesite autoridad, recibos o continuidad entre sesiones. El mismo método se puede usar en Claude Code y Codex.

## Instalar OpenCode

Instala OpenCode siguiendo su [documentación oficial](https://opencode.ai/docs/). Los pasos dependen de tu sistema; este manual no presupone un instalador ni un comando que no esté documentado aquí. Al terminar, confirma que puedes iniciar OpenCode y abrir un directorio de proyecto.

## Instalar Lore Plugin

Con Lore Plugin 2.4.9 instalado, ejecuta desde una terminal:

```sh
lore-plugin install --target opencode
```

Si trabajas desde un clon del repositorio, el comando equivalente documentado es:

```sh
node scripts/lore-plugin.mjs install --target opencode
```

El instalador de OpenCode coloca las skills en `~/.config/opencode/skills/`, además de los componentes de hooks, plugin TUI y CLI local. Después reinicia OpenCode. Para confirmar que quedó, revisa que `~/.config/opencode/skills/` contenga las skills de Lore; el instalador también informa si verificó los componentes copiados. No edites `opencode.jsonc` para que se detecten los plugins locales.

## Tu primera sesión

Abre en OpenCode el directorio del proyecto en el que quieras trabajar. Si es la primera vez que tienes Lore, escribe: «quiero comenzar a usar Lore Plugin, ayúdame». El kit revisa primero la forma del árbol, te pregunta de una cosa por vez y trabaja hacia un primer artefacto; no termina con una lista de recomendaciones.

Si el proyecto ya tiene un contrato, una tabla de enrutamiento, `lore/` o `FASES.md`, la sesión resuelve qué territorio gobierna y carga el criterio pertinente antes de continuar. El Lore guarda criterio que limita decisiones futuras. `FASES.md` guarda el estado y el plan del proyecto, fuera de `lore/`; no es una copia del Lore. La revisión de carga comprueba los enlaces que va a usar, y si falta uno te presenta la decisión concreta en vez de repararlo por su cuenta.

OpenCode dispone las skills instaladas para que el agente las invoque según la tarea. Si ya sabes qué quieres hacer, dilo en lenguaje normal. Si todavía no hay una forma de trabajo, pide ayuda para empezar; no necesitas recordar el nombre de una skill.

## Trabajar con Vespi

Vespi es experimental y se usa cuando hay una operación acotada que debe continuar entre sesiones, cuando sus efectos requieren autoridad o cuando reanudar sin revisar los cambios fingiría que nada ocurrió. El coordinador declara el objetivo, el dueño, el efecto y la autoridad; comprueba la autoridad antes de actuar, ejecuta el paso, verifica por separado y deja un recibo que distingue lo observado de lo no verificado.

La compuerta humana se usa cuando falta una decisión que solo la persona puede dar. El agente puede preparar el contexto y pedir aprobación; no puede inventar esa aprobación ni ampliarla por su cuenta. Un permiso de OpenCode decide además qué acciones y rutas permite el host. La regla de permisos nativos para escrituras estructuradas ajenas usa `external_directory` y `edit`; `ask` pregunta, `allow` permite y `deny` bloquea. Para una sola operación, la documentación recomienda escoger `once` en el host.

El estado de una operación viva se guarda como un bloque bajo `## Operaciones` en el `FASES.md` del proyecto. Al cerrar la sesión, deja explícito si la operación sigue abierta, está esperando una decisión o quedó cerrada. Mañana abre el mismo proyecto, vuelve a leer su contrato y `FASES.md`, y pide continuar la operación pendiente. El coordinador lee el recibo y revalida autoridad y premisas antes de seguir; el recibo por sí solo no constituye autorización.

No hace falta iniciar Vespi para cada tarea: el trabajo ordinario sigue el criterio del proyecto. Las frases «esto me está complicando», «se está perdiendo lo que decidimos» y «sigamos mañana» son señales para el coordinador, que elige la ruta; una frase no ejecuta directamente Vespi.

## Guardar criterio aprendido

Cuando una fricción real se resuelva y quieras que cambie futuras decisiones, di «guarda esto en Lore» o pide guardar el aprendizaje. `save-to-lore` propone una Pista con contexto, causa, criterio y evidencia, y espera tu aprobación antes de escribir. Revisa el diff. Una tarea pendiente o una idea sin resolver va en el estado de `FASES.md`, no se convierte en criterio. Vespi tampoco escribe Lore: solo `save-to-lore` arbitra ese camino.

## Claude Code y Codex

Desde un clon del repositorio, usa el mismo instalador y cambia el destino:

```sh
node scripts/lore-plugin.mjs install --target claude
node scripts/lore-plugin.mjs install --target codex
```

Con la CLI `lore-plugin` de la versión instalada, las formas son `lore-plugin install --target claude` y `lore-plugin install --target codex`. Reinicia el host después de instalar y revisa el resultado que informa el instalador. Los hooks, permisos y límites de escritura dependen de cada host; Lore Plugin no los reemplaza.

## Problemas frecuentes

Si OpenCode no encuentra las skills, confirma que están en `~/.config/opencode/skills/` y reinicia el host. El instalador global mantiene entradas de `tui.json` y deja `tui.jsonc` intacto.

Un `opencode run` sin interacción rechaza automáticamente una solicitud que quedó en `ask` y termina la ejecución. Para preparar acceso a árboles hermanos enrutados, ejecuta `lore-plugin opencode-permissions --project <dir> --from-routing`; añade `--write` para fusionar la propuesta en el `opencode.json` de ese proyecto. Para un perfil confinado, ejecuta `lore-plugin opencode-sandbox <dir>`. Ninguno de esos comandos cambia la configuración global. El manual técnico explica el cierre de stdin, el orden de `-f` y las variables `TEMP`, `TMP` y `TMPDIR`.

Para revisar posibles residuos y omisiones del árbol sin modificarlo, ejecuta:

```sh
lore-plugin hygiene <ruta-del-proyecto>
```

El comando es de solo lectura, informa su cobertura y propone revisar hallazgos; no borra ni poda archivos. También puedes pedir `--json` para salida JSON.

Si un delegado quedó bloqueado por permisos, registra ese motivo como bloqueo; no lo presentes como trabajo fallido. Una tarea que requiere escribir en otro árbol sigue sujeta a la decisión del host.

## Qué no hace

Lore Plugin no garantiza que el resultado sea correcto, no escribe criterio sin aprobación, no convierte automáticamente notas en Lore ni sustituye tu juicio. Vespi no es un agente permanente, un scheduler ni un motor universal de persistencia. Un recibo describe evidencia y estado; no prueba por sí mismo quién autorizó, no otorga autoridad y no garantiza un efecto externo.

## Superpowers

[Superpowers](https://github.com/obra/superpowers) es una colección de skills de la comunidad. Puedes explorarla como complemento; no es un requisito de Lore Plugin ni está instalada automáticamente por este manual.
