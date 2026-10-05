/** @jsxImportSource @opentui/solid */

// Persistent, zero-token status mark for OpenCode's TUI. This adapter is separate
// from the server plugin in ../plugin/ and uses Lore's existing full/lite/off switch.
import { marca, nivel } from "../plugin/lore-turno.mjs";

const LoreStatus = () => {
  const label = marca(nivel());
  return label ? <text>{label}</text> : null;
};

export default {
  id: "lore-plugin.statusline",
  tui(api) {
    api.slots.register({ slots: { app_bottom: LoreStatus } });
  },
};
