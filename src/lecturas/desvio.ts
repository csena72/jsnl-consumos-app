export const UMBRAL_DESVIO_ATIPICO = 40;
// La columna desvio_porcentaje es DECIMAL(5,2): el máximo representable es 999.99.
const DESVIO_MAXIMO = 999.99;

export interface ResultadoDesvio {
  desvioPorcentaje: number | null;
  esAtipico: boolean;
}

export function calcularDesvio(
  valorLectura: number,
  promedioHistorico: number | null,
): ResultadoDesvio {
  if (promedioHistorico === null || promedioHistorico === 0) {
    return { desvioPorcentaje: null, esAtipico: false };
  }
  const bruto = ((valorLectura - promedioHistorico) / promedioHistorico) * 100;
  const desvioPorcentaje = Math.round(Math.max(-DESVIO_MAXIMO, Math.min(DESVIO_MAXIMO, bruto)) * 100) / 100;
  return { desvioPorcentaje, esAtipico: Math.abs(bruto) > UMBRAL_DESVIO_ATIPICO };
}
