### Ejecutar OpenCode sin interacción

`opencode run` necesita permisos explícitos para los delegados desatendidos. Una solicitud de permiso en `ask` se rechaza automáticamente y termina toda la ejecución; usa `lore-plugin opencode-permissions --project <dir> --from-routing` para permitir los árboles hermanos enrutados y denegar las demás rutas. Añade `--write` para fusionar la propuesta en el `opencode.json` de ese proyecto. También puedes usar `lore-plugin opencode-sandbox <dir>` para escribir un perfil confinado y crear su carpeta local `tmp`. Ningún comando cambia la configuración global de OpenCode.

También importan tres detalles de invocación: cierra stdin (`< /dev/null` o `stdio: ['ignore', ...]`) o `opencode run` esperará EOF; coloca el mensaje antes de `-f <archivo>`, porque `-f` consume los argumentos posicionales que siguen; y fija `TEMP`, `TMP` y `TMPDIR` en `<dir>/tmp` para que los temporales de Node queden dentro del árbol de trabajo. El comando sandbox imprime esas variables y una línea recomendada sin lanzar OpenCode.

