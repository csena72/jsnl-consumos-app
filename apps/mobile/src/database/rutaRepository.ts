import type { FiltroRuta, ItemRuta, LocalidadApi, RutaMedidorApi } from '../types';
import { getDb } from './db';

/** Reemplaza la ruta local por la descargada. Las lecturas offline no se tocan. */
export async function reemplazarRuta(ruta: RutaMedidorApi[], localidades: LocalidadApi[] = []): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM socios_local');
    await db.runAsync('DELETE FROM medidores_local');
    // Si la descarga de localidades falló no se pisa el catálogo previo.
    if (localidades.length > 0) {
      await db.runAsync('DELETE FROM localidades_local');
      for (const l of localidades) {
        await db.runAsync('INSERT INTO localidades_local (id, nombre) VALUES (?, ?)', l.id, l.nombre);
      }
    }
    for (const m of ruta) {
      await db.runAsync(
        `INSERT INTO medidores_local
           (id, numeroMedidor, lecturaAnterior, promedioHistorico, tipoServicio, numeroCaja, localidadId, rutaNombre, ordenSecuencia)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        m.medidorId,
        m.numeroSerie,
        m.lecturaAnterior,
        m.promedioHistorico,
        m.tipoServicio,
        m.numeroCaja,
        m.localidadId,
        m.ruta,
        m.ordenSecuencia,
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
         m.tipoServicio, m.numeroCaja, m.localidadId, m.rutaNombre, m.ordenSecuencia,
         (SELECT nombre FROM localidades_local WHERE id = m.localidadId) AS localidadNombre,
         s.id AS idSocio, s.numeroSocio, s.nombre AS nombreSocio, s.direccion,
         EXISTS (SELECT 1 FROM lecturas_offline l WHERE l.idMedidor = m.id AND l.periodo = ?) AS leido
  FROM medidores_local m
  JOIN socios_local s ON s.idMedidor = m.id
`;

/** Recorrido en orden físico de caminata: los medidores sin secuencia van al final. */
export async function listarRuta(periodo: string, filtro: FiltroRuta): Promise<ItemRuta[]> {
  const db = await getDb();
  const filas = await db.getAllAsync<FilaRuta>(
    `${SELECT_RUTA}
     WHERE (? IS NULL OR m.localidadId = ?) AND (? IS NULL OR m.tipoServicio = ?)
     ORDER BY m.ordenSecuencia IS NULL, m.ordenSecuencia, s.numeroSocio, m.numeroMedidor`,
    periodo,
    filtro.localidadId,
    filtro.localidadId,
    filtro.tipoServicio,
    filtro.tipoServicio,
  );
  return filas.map((f) => ({ ...f, leido: f.leido === 1 }));
}

export async function obtenerItemRuta(idMedidor: string, periodo: string): Promise<ItemRuta | null> {
  const db = await getDb();
  const fila = await db.getFirstAsync<FilaRuta>(`${SELECT_RUTA} WHERE m.id = ?`, periodo, idMedidor);
  return fila ? { ...fila, leido: fila.leido === 1 } : null;
}

export async function listarLocalidades(): Promise<LocalidadApi[]> {
  const db = await getDb();
  return db.getAllAsync<LocalidadApi>('SELECT id, nombre FROM localidades_local ORDER BY nombre');
}

/** Borra todos los datos locales (cierre de sesión). El llamador debe verificar antes que no queden lecturas pendientes. */
export async function limpiarDatosLocales(): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM socios_local');
    await db.runAsync('DELETE FROM medidores_local');
    await db.runAsync('DELETE FROM lecturas_offline');
    await db.runAsync('DELETE FROM lotes_offline');
    await db.runAsync('DELETE FROM medidores_nuevos_pendientes');
    await db.runAsync('DELETE FROM localidades_local');
  });
}
