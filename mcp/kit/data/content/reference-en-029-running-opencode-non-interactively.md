### Running OpenCode non-interactively

`opencode run` needs explicit permissions for unattended delegates. A permission request left in `ask` is auto-rejected and ends the whole run, so use `lore-plugin opencode-permissions --project <dir> --from-routing` to allow routed sibling trees while denying other paths; add `--write` to merge the proposal into that project's `opencode.json`. Or use `lore-plugin opencode-sandbox <dir>` to write a confined delegate profile and create its local `tmp` folder. Neither command changes global OpenCode configuration.

Three invocation details also matter: close stdin (`< /dev/null`, or `stdio: ['ignore', ...]`) or `opencode run` waits for EOF; put the prompt before `-f <file>` because `-f` consumes following positional arguments; and set `TEMP`, `TMP` and `TMPDIR` to `<dir>/tmp` so Node temporaries stay inside the work tree. The sandbox command prints those environment values and a recommended command line without launching OpenCode.

