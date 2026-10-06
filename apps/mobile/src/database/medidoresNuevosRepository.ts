import type { MedidorNuevoPendiente, NuevoMedidorPendiente } from '../types';
import { getDb } from './db';

interface FilaNuevo extends Omit<MedidorNuevoPendiente, 'sincronizado' | 'fotoSubida'> {
  sincronizado: number;
  fotoSubida: number;
}

const SELECT = `
  SELECT id_local AS idLocal, numeroSerie, socioId, tipoServicio, localidadId, numeroCaja, direccionReferencia,
         lecturaInicial, observaciones, fotoPathLocal, fechaCreacion, sincronizado, idRemoto, fotoSubida, errorSync
  FROM medidores_nuevos_pendientes
`;

function aNuevo(f: FilaNuevo): MedidorNuevoPendiente {
  return { ...f, sincronizado: f.sincronizado === 1, fotoSubida: f.fotoSubida === 1 };
}

export async function crearMedidorNuevo(m: NuevoMedidorPendiente): Promise<number> {
  const db = await getDb();
  const r = await db.runAsync(
    `INSERT INTO medidores_nuevos_pendientes
       (numeroSerie, socioId, tipoServicio, localidadId, numeroCaja, direccionReferencia, lecturaInicial, observaciones, fotoPathLocal, fechaCreacion)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    m.numeroSerie,
    m.socioId,
    m.tipoServicio,
    m.localidadId,
    m.numeroCaja,
    m.direccionReferencia,
    m.lecturaInicial,
    m.observaciones,
    m.fotoPathLocal,
    new Date().toISOString(),
  );
  return r.lastInsertRowId;
}

/** Solicitudes que todavía requieren algún paso de red: crear la solicitud o subir su foto. */
export async function listarNuevosPorEnviar(): Promise<MedidorNuevoPendiente[]> {
  const db = await getDb();
  const filas = await db.getAllAsync<FilaNuevo>(
    `${SELECT} WHERE sincronizado = 0 OR fotoSubida = 0 ORDER BY fechaCreacion`,
  );
  return filas.map(aNuevo);
}

export async function listarNuevosRecientes(limite = 50): Promise<MedidorNuevoPendiente[]> {
  const db = await getDb();
  const filas = await db.getAllAsync<FilaNuevo>(`${SELECT} ORDER BY fechaCreacion DESC LIMIT ?`, limite);
  return filas.map(aNuevo);
}

export async function marcarNuevoSincronizado(idLocal: number, idRemoto: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE medidores_nuevos_pendientes SET sincronizado = 1, idRemoto = ?, errorSync = NULL WHERE id_local = ?',
    idRemoto,
    idLocal,
  );
}

export async function marcarNuevoFotoSubida(idLocal: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE medidores_nuevos_pendientes SET fotoSubida = 1 WHERE id_local = ?', idLocal);
}

/** Error definitivo (p. ej. 409 serie duplicada): se deja de reintentar y se informa al operario. */
export async function marcarNuevoRechazado(idLocal: number, motivo: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    'UPDATE medidores_nuevos_pendientes SET sincronizado = 1, fotoSubida = 1, errorSync = ? WHERE id_local = ?',
    motivo,
    idLocal,
  );
}
