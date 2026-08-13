import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function rows(path) {
  const [header, ...lines] = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const keys = header.split(",");
  return lines.map((line) => Object.fromEntries(line.split(",").map((value, index) => [keys[index], value])));
}

test("the public benchmark matches the audited 72-run Codex CSV", () => {
  const results = rows(new URL("./results/codex/results.csv", import.meta.url));
  const byArm = Object.groupBy(results, ({ arm }) => arm);

  assert.equal(results.length, 72);
  assert.equal(byArm.cold.filter(({ verdict }) => verdict === "pass").length, 25);
  assert.equal(byArm.lore.filter(({ verdict }) => verdict === "pass").length, 33);

  const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
  const method = readFileSync(new URL("./README.md", import.meta.url), "utf8");

  for (const document of [readme, method]) {
    assert.match(document, /25\/36 \(69[,.]4%\)/);
    assert.match(document, /33\/36 \(91[,.]7%\)/);
  }

  assert.doesNotMatch(readme, /37%|65%|118 s|85 s|4[,.]116|3[,.]119/);
});

test("Claude replication instructions preserve and verify the Codex baseline", () => {
  const method = readFileSync(new URL("./README.md", import.meta.url), "utf8");

  assert.match(method, /verificar el baseline Codex/i);
  assert.match(method, /25\/36.*33\/36/s);
  assert.match(method, /directorio específico del proveedor/i);
  assert.match(method, /no reemplazan.*Codex/s);
});
