export type CeldaCsv = string | number | null | undefined;

/** Neutraliza fórmulas (CSV injection) en celdas de texto que Excel interpretaría. */
function neutralizar(texto: string): string {
  return /^[=+\-@\t\r]/.test(texto) ? `'${texto}` : texto;
}

function escapar(celda: CeldaCsv): string {
  if (celda === null || celda === undefined) {
    return '';
  }
  const texto = typeof celda === 'number' ? String(celda) : neutralizar(celda);
  return /[",\r\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
}

export function aCsv(encabezados: string[], filas: CeldaCsv[][]): string {
  const lineas = [encabezados, ...filas].map((fila) => fila.map(escapar).join(','));
  // BOM para que Excel detecte UTF-8 (acentos y ñ).
  return `﻿${lineas.join('\r\n')}\r\n`;
}
