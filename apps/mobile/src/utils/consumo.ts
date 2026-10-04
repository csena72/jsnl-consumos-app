export const UMBRAL_ATIPICO = 0.4;

export function calcularConsumo(lecturaActual: number, lecturaAnterior: number | null): number {
  return lecturaActual - (lecturaAnterior ?? 0);
}

/**
 * Desvío del consumo respecto del promedio histórico:
 * ((lecturaActual - lecturaAnterior) - promedio) / promedio.
 * Devuelve null si no hay un promedio válido contra el cual comparar.
 */
export function calcularDesvio(
  lecturaActual: number,
  lecturaAnterior: number | null,
  promedioHistorico: number | null,
): number | null {
  if (promedioHistorico === null || promedioHistorico <= 0) return null;
  return (calcularConsumo(lecturaActual, lecturaAnterior) - promedioHistorico) / promedioHistorico;
}

export function esConsumoAtipico(
  lecturaActual: number,
  lecturaAnterior: number | null,
  promedioHistorico: number | null,
): boolean {
  const desvio = calcularDesvio(lecturaActual, lecturaAnterior, promedioHistorico);
  return desvio !== null && desvio > UMBRAL_ATIPICO;
}

/** Acepta coma o punto decimal. Devuelve null si el texto no es un número válido. */
export function parsearLectura(texto: string): number | null {
  const limpio = texto.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(limpio)) return null;
  return Number(limpio);
}

export function periodoActual(fecha: Date = new Date()): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  return `${fecha.getFullYear()}${mes}`;
}
