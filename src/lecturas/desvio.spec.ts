import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { calcularDesvio } from './desvio';

describe('calcularDesvio', () => {
  it('marca atípica una lectura con desvío mayor a 40%', () => {
    assert.deepEqual(calcularDesvio(150, 100), { desvioPorcentaje: 50, esAtipico: true });
  });

  it('marca atípico un desvío negativo mayor a 40% en valor absoluto', () => {
    assert.deepEqual(calcularDesvio(50, 100), { desvioPorcentaje: -50, esAtipico: true });
  });

  it('no marca atípico exactamente 40%', () => {
    assert.deepEqual(calcularDesvio(140, 100), { desvioPorcentaje: 40, esAtipico: false });
  });

  it('no marca atípica una lectura dentro del rango', () => {
    assert.equal(calcularDesvio(105, 100).esAtipico, false);
  });

  it('sin historial no calcula desvío ni marca atípica', () => {
    assert.deepEqual(calcularDesvio(100, null), { desvioPorcentaje: null, esAtipico: false });
  });

  it('promedio cero no divide por cero', () => {
    assert.deepEqual(calcularDesvio(100, 0), { desvioPorcentaje: null, esAtipico: false });
  });

  it('limita el desvío al máximo de DECIMAL(5,2)', () => {
    assert.deepEqual(calcularDesvio(100000, 10), { desvioPorcentaje: 999.99, esAtipico: true });
  });
});
