import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { aCsv } from './csv';

describe('aCsv', () => {
  it('escapa comillas, comas y saltos de línea', () => {
    const csv = aCsv(['a', 'b'], [['dice "hola", chau', 'l1\nl2']]);
    assert.equal(csv, '﻿a,b\r\n"dice ""hola"", chau","l1\nl2"\r\n');
  });

  it('neutraliza fórmulas en texto pero no en números negativos', () => {
    const csv = aCsv(['x', 'y'], [['=CMD()', -5]]);
    assert.equal(csv, "﻿x,y\r\n'=CMD(),-5\r\n");
  });

  it('serializa null como celda vacía', () => {
    assert.equal(aCsv(['x', 'y'], [[null, 1]]), '﻿x,y\r\n,1\r\n');
  });
});
