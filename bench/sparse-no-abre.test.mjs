import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = readFileSync(join(REPO, "skills", "vespi", "SKILL.md"), "utf8");

// H5: sparse no es un cierre sin verificación: es no abrir operación.
// Si el texto permite cerrar sin verificar, contradice closeOperation y la frase de muerte.
test("sparse no abre operacion ni cierra sin verificar", () => {
  const sparse = SKILL.split("## Sparse operation")[1]?.split("## ")[0] ?? "";
  assert.match(sparse, /opens no operation|does not open|without opening/i, "sparse no dice que no abre operación");
  assert.match(sparse, /open a bounded operation/i, "sparse no manda lo que continúa a operación acotada");
});
