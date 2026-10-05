import { availableParallelism, freemem, totalmem } from "node:os";
import { pathToFileURL } from "node:url";

const DELEGATE_FAILURES = [
  [/An active OpenCode Go subscription is required/i, "suscripcion-opencode-go", "comprueba la suscripción activa de OpenCode Go y vuelve a lanzar la tarea"],
  [/Upstream request failed/i, "proveedor-gratuito", "usa un proveedor disponible o espera y vuelve a intentar"],
  [/database is locked/i, "base-opencode-bloqueada", "cierra el proceso que mantiene bloqueada la base de OpenCode y vuelve a comprobar"],
  [/(?:permission requested[\s\S]{0,200}auto-rejecting|The user rejected permission)/i, "permiso-rechazado", "prepara permisos no interactivos para la ruta y vuelve a lanzar"],
  [/File not found/i, "adjunto-no-encontrado", "copia el adjunto a una ruta legible por el delegado y vuelve a lanzar"],
  [/(?:cannot write|access is denied|EPERM)[\s\S]{0,300}(?:existing|file|\.md|\.txt|\.js|\.json)|(?:cannot write|access is denied|EPERM)/i, "sandbox-escritura-codex", "crea un worktree o concede la carpeta con --add-dir y vuelve a lanzar"],
];

export function classifyDelegateOutput({ exitCode, text, expectedArtifacts = [], artifactsPresent = [] } = {}) {
  const safeText = typeof text === "string" ? text : "";
  const failure = DELEGATE_FAILURES.find(([pattern]) => pattern.test(safeText));
  if (failure) return { delivered: false, cause: failure[1], nextStep: failure[2] };
  const expected = Array.isArray(expectedArtifacts) ? expectedArtifacts.filter((item) => typeof item === "string") : [];
  const present = new Set(Array.isArray(artifactsPresent) ? artifactsPresent.filter((item) => typeof item === "string") : []);
  if (expected.length === 0 || expected.some((item) => !present.has(item))) {
    return { delivered: false, cause: "sin-entrega", nextStep: "comprueba el artefacto; no cuentes la salida 0 como entrega" };
  }
  return { delivered: true, cause: null, nextStep: "verifica el artefacto de forma independiente" };
}

// Sondeo optativo: ningún hook lo ejecuta en cada turno.
export function measureHost({ now = () => new Date(), free = freemem, total = totalmem, parallel = availableParallelism } = {}) {
  let at = null;
  try { at = now().toISOString(); } catch {}
  try {
    const freeBytes = free();
    const totalBytes = total();
    const parallelism = parallel();
    if (![freeBytes, totalBytes, parallelism].every(Number.isFinite) || freeBytes < 0 || totalBytes <= 0 || parallelism < 1) throw Error("invalid probe");
    return { measured: true, at, freeBytes, totalBytes, parallelism };
  } catch {
    return { measured: false, at, freeBytes: null, totalBytes: null, parallelism: null };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.stdout.write(`${JSON.stringify(measureHost())}\n`);
}
