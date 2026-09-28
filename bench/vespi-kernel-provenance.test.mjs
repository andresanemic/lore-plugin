// RC4 L2: la copia fija del kernel dentro de la skill vespi es verificable, no una afirmación.
// Cada archivo de core/kernel/ = 3 líneas de procedencia + los bytes exactos de la fuente, cuyo
// SHA-256 publica core/kernel/SOURCE.md.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const kernelDir = join(dirname(fileURLToPath(import.meta.url)), "..", "skills", "vespi", "core", "kernel");
const source = readFileSync(join(kernelDir, "SOURCE.md"), "utf8");
const rows = [...source.matchAll(/^\| `([a-z]+\.js)` \| `([0-9a-f]{64})` \| (\d+) \|$/gm)];

test("SOURCE.md lista los cuatro archivos del kernel 0.1.3 con su huella", () => {
  assert.deepEqual(rows.map((r) => r[1]).sort(), ["authority.js", "continuity.js", "operation.js", "receipt.js"]);
  assert.match(source, /commit `[0-9a-f]{7,}`/);
});

for (const [, name, digest, bytes] of rows) {
  test(`core/kernel/${name}: quitar el encabezado deja exactamente los bytes publicados`, () => {
    const file = readFileSync(join(kernelDir, name));
    let cut = 0;
    for (let i = 0; i < 3; i++) cut = file.indexOf(0x0a, cut) + 1;
    const body = file.subarray(cut);
    assert.equal(body.length, Number(bytes));
    assert.equal(createHash("sha256").update(body).digest("hex"), digest);
  });
}
