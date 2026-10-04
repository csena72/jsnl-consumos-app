import type { ItemRuta, RutaMedidorApi } from '../types';
import { getDb } from './db';

/** Reemplaza la ruta local por la descargada. Las lecturas offline no se tocan. */
export async function reemplazarRuta(ruta: RutaMedidorApi[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM socios_local');
    await db.runAsync('DELETE FROM medidores_local');
    for (const m of ruta) {
      await db.runAsync(
        'INSERT INTO medidores_local (id, numeroMedidor, lecturaAnterior, promedioHistorico) VALUES (?, ?, ?, ?)',
        m.medidorId,
        m.numeroSerie,
        m.lecturaAnterior,
        m.promedioHistorico,
      );
      await db.runAsync(
        'INSERT INTO socios_local (id, numeroSocio, nombre, direccion, idMedidor) VALUES (?, ?, ?, ?, ?)',
        m.socioId,
        m.numeroSocio,
        m.nombreCompleto,
        m.direccion,
        m.medidorId,
      );
    }
  });
}

interface FilaRuta extends Omit<ItemRuta, 'leido'> {
  leido: number;
}

const SELECT_RUTA = `
  SELECT m.id AS idMedidor, m.numeroMedidor, m.lecturaAnterior, m.promedioHistorico,
         s.id AS idSocio, s.numeroSocio, s.nombre AS nombreSocio, s.direccion,
         EXISTS (SELECT 1 FROM lecturas_offline l WHERE l.idMedidor = m.id AND l.periodo = ?) AS leido
  FROM medidores_local m
  JOIN socios_local s ON s.idMedidor = m.id
`;

export async function listarRuta(periodo: string): Promise<ItemRuta[]> {
  const db = await getDb();
  const filas = await db.getAllAsync<FilaRuta>(`${SELECT_RUTA} ORDER BY s.numeroSocio, m.numeroMedidor`, periodo);
  return filas.map((f) => ({ ...f, leido: f.leido === 1 }));
}

export async function obtenerItemRuta(idMedidor: string, periodo: string): Promise<ItemRuta | null> {
  const db = await getDb();
  const fila = await db.getFirstAsync<FilaRuta>(`${SELECT_RUTA} WHERE m.id = ?`, periodo, idMedidor);
  return fila ? { ...fila, leido: fila.leido === 1 } : null;
}

/** Borra todos los datos locales (cierre de sesión). El llamador debe verificar antes que no queden lecturas pendientes. */
export async function limpiarDatosLocales(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM socios_local');
    await db.runAsync('DELETE FROM medidores_local');
    await db.runAsync('DELETE FROM lecturas_offline');
    await db.runAsync('DELETE FROM lotes_offline');
  });
}
