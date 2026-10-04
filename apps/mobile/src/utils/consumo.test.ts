import assert from 'node:assert/strict';
import { test } from 'node:test';
import { calcularDesvio, esConsumoAtipico, parsearLectura, periodoActual } from './consumo';

test('consumo 41% sobre el promedio es atípico', () => {
  assert.equal(esConsumoAtipico(1141, 1000, 100), true);
});

test('consumo exactamente 40% sobre el promedio no es atípico', () => {
  assert.equal(esConsumoAtipico(1140, 1000, 100), false);
});

test('consumo por debajo del promedio no es atípico', () => {
  assert.equal(esConsumoAtipico(1010, 1000, 100), false);
});

test('sin promedio histórico no se puede determinar desvío', () => {
  assert.equal(calcularDesvio(1100, 1000, null), null);
  assert.equal(calcularDesvio(1100, 1000, 0), null);
  assert.equal(esConsumoAtipico(1100, 1000, null), false);
});

test('parsearLectura acepta coma y rechaza basura', () => {
  assert.equal(parsearLectura('1250,5'), 1250.5);
  assert.equal(parsearLectura('12.345'), null);
  assert.equal(parsearLectura('abc'), null);
  assert.equal(parsearLectura('-3'), null);
});

test('periodoActual tiene formato AAAAMM', () => {
  assert.equal(periodoActual(new Date(2026, 9, 4)), '202610');
});
