import { availableParallelism, freemem, totalmem } from "node:os";
import { pathToFileURL } from "node:url";

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
