import test from "node:test";
import assert from "node:assert/strict";
import { tirarCarta, tirarMultiples, listarFuentes, cargarBaraja } from "../skills/vespi/core/card-deck.mjs";

const FUENTE = "baraja-entre";
const ACORDADAS = 48;

test("la baraja acordada entra como fuente propia del kit", () => {
  assert.ok(listarFuentes().includes(FUENTE), "la fuente baraja-entre no esta en el mazo");
});

test("la baraja acordada trae sus 48 cartas", () => {
  const acordadas = cargarBaraja().cartas.filter((c) => c.fuente === FUENTE);
  assert.equal(acordadas.length, ACORDADAS);
});

test("cada carta acordada declara su familia del acuerdo", () => {
  const acordadas = cargarBaraja().cartas.filter((c) => c.fuente === FUENTE);
  const familias = new Set(acordadas.map((c) => c.familia));
  assert.equal(familias.size, 4, "se esperan las cuatro familias de la decision 4");
  for (const c of acordadas) {
    assert.match(c.familia, /^[1-4] /, `familia mal formada en ${c.id}`);
  }
});

test("ninguna carta acordada nombra su fuente (decision 2)", () => {
  const acordadas = cargarBaraja().cartas.filter((c) => c.fuente === FUENTE);
  for (const c of acordadas) {
    assert.doesNotMatch(c.texto, /genealogia|decisiones|acuerdo|casos|derivas|\.md/i, `la carta ${c.id} nombra su fuente`);
    assert.ok(c.texto.trim().length > 0, `la carta ${c.id} esta vacia`);
  }
});

test("tirarCarta con la fuente acordada devuelve carta de esa fuente", () => {
  const carta = tirarCarta({ fuente: FUENTE });
  assert.equal(carta.fuente, FUENTE);
  assert.ok(carta.texto.length > 0);
  assert.equal(carta.total, cargarBaraja().total);
});

test("la semilla hace determinista la tirada dentro de la fuente", () => {
  const a = tirarCarta({ semilla: 7, fuente: FUENTE });
  const b = tirarCarta({ semilla: 7, fuente: FUENTE });
  assert.equal(a.id, b.id);
});

test("tirarMultiples con la fuente no repite cartas", () => {
  const varias = tirarMultiples(6, { fuente: FUENTE });
  assert.equal(varias.length, 6);
  assert.equal(new Set(varias.map((c) => c.id)).size, 6);
  assert.ok(varias.every((c) => c.fuente === FUENTE));
});

test("el resto del mazo sigue intacto: las fuentes previas no cambian", () => {
  const fuentes = listarFuentes();
  for (const previa of ["Eno", "Schmidt", "Simondon", "Camus", "Los Picantes"]) {
    assert.ok(fuentes.includes(previa), `desaparecio la fuente previa ${previa}`);
  }
  assert.equal(cargarBaraja().total, 45 + ACORDADAS);
});
