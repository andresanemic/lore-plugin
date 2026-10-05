// Normaliza escrituras estructuradas de OpenCode al vocabulario que entiende el guard.
// Separado del adaptador para probar la traducción sin confundirla con el permiso del host.
const HERRAMIENTAS = {
  write: { nombre: "Write", campo: "file_path", de: ["filePath", "path"] },
  edit: { nombre: "Edit", campo: "file_path", de: ["filePath", "path"] },
  apply_patch: { nombre: "apply_patch", campo: "command", de: ["patchText"] },
};

export function alVocabularioDelKit(tool, args) {
  const regla = HERRAMIENTAS[tool];
  if (!regla || !args || typeof args !== "object") return null;
  for (const campo of regla.de) {
    const valor = args[campo];
    if (typeof valor === "string" && valor !== "") {
      return { tool: regla.nombre, input: { [regla.campo]: valor } };
    }
  }
  return null;
}
