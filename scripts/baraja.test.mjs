import test from 'node:test';
import assert from 'node:assert/strict';
import { tirarCarta, tirarMultiples, listarFuentes, cargarBaraja } from './baraja.mjs';

test('cargarBaraja devuelve las cartas', () => {
  const baraja = cargarBaraja();
  assert.ok(Array.isArray(baraja.cartas));
  assert.ok(baraja.cartas.length > 0);
});

test('tirarCarta devuelve una carta válida', () => {
  const carta = tirarCarta();
  assert.ok(carta);
  assert.ok(typeof carta.texto === 'string');
  assert.ok(carta.texto.length > 0);
  assert.ok(typeof carta.fuente === 'string');
});

test('tirarCarta con filtro por fuente solo devuelve cartas de esa fuente', () => {
  const carta = tirarCarta({ fuente: 'Eno' });
  assert.equal(carta.fuente, 'Eno');
});

test('tirarCarta con semilla es determinista', () => {
  const a = tirarCarta({ semilla: 5 });
  const b = tirarCarta({ semilla: 5 });
  assert.equal(a.id, b.id);
});

test('tirarMultiples devuelve la cantidad solicitada sin duplicados', () => {
  const cartas = tirarMultiples(3);
  assert.equal(cartas.length, 3);
  const ids = new Set(cartas.map((c) => c.id));
  assert.equal(ids.size, 3);
});

test('tirarMultiples no excede el total de cartas', () => {
  const baraja = cargarBaraja();
  const cartas = tirarMultiples(baraja.cartas.length + 10);
  assert.ok(cartas.length <= baraja.cartas.length);
});

test('listarFuentes devuelve las fuentes únicas', () => {
  const fuentes = listarFuentes();
  assert.ok(Array.isArray(fuentes));
  assert.ok(fuentes.includes('Eno'));
  assert.ok(fuentes.length >= 3);
});
