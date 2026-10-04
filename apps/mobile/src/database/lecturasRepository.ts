import type { EstadoLote, LecturaOffline, NuevaLectura } from '../types';
import { getDb } from './db';

interface FilaLectura extends Omit<LecturaOffline, 'esAtipico' | 'fotoSubida'> {
  esAtipico: number;
  fotoSubida: number;
}

function aLectura(f: FilaLectura): LecturaOffline {
  return { ...f, esAtipico: f.esAtipico === 1, fotoSubida: f.fotoSubida === 1 };
}

export async function crearLectura(l: NuevaLectura): Promise<number> {
  const db = await getDb();
  const r = await db.runAsync(
    `INSERT INTO lecturas_offline (idMedidor, periodo, lecturaActual, esAtipico, fotoPath, observaciones, fechaLectura)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    l.idMedidor,
    l.periodo,
    l.lecturaActual,
    l.esAtipico ? 1 : 0,
    l.fotoPath,
    l.observaciones,
    new Date().toISOString(),
  );
  return r.lastInsertRowId;
}

export async function listarPendientes(): Promise<LecturaOffline[]> {
  const db = await getDb();
  const filas = await db.getAllAsync<FilaLectura>(
    "SELECT * FROM lecturas_offline WHERE estadoSync = 'PENDIENTE' ORDER BY fechaLectura",
  );
  return filas.map(aLectura);
}

/** Lecturas ya aceptadas por la API cuya foto todavía no se subió. */
export async function listarFotosPendientes(): Promise<LecturaOffline[]> {
  const db = await getDb();
  const filas = await db.getAllAsync<FilaLectura>(
    `SELECT * FROM lecturas_offline
     WHERE estadoSync = 'SINCRONIZADO' AND idRemoto IS NOT NULL AND fotoPath IS NOT NULL AND fotoSubida = 0`,
  );
  return filas.map(aLectura);
}

export async function listarRecientes(limite = 50): Promise<LecturaOffline[]> {
  const db = await getDb();
  const filas = await db.getAllAsync<FilaLectura>(
    'SELECT * FROM lecturas_offline ORDER BY fechaLectura DESC LIMIT ?',
    limite,
  );
  return filas.map(aLectura);
}

export interface ContadoresSync {
  lecturasPendientes: number;
  fotosPendientes: number;
  lotesPendientes: number;
  lecturasConError: number;
}

export async function contarPendientes(): Promise<ContadoresSync> {
  const db = await getDb();
  const fila = await db.getFirstAsync<ContadoresSync>(`
    SELECT
      (SELECT COUNT(*) FROM lecturas_offline WHERE estadoSync = 'PENDIENTE') AS lecturasPendientes,
      (SELECT COUNT(*) FROM lecturas_offline
        WHERE estadoSync = 'SINCRONIZADO' AND idRemoto IS NOT NULL AND fotoPath IS NOT NULL AND fotoSubida = 0) AS fotosPendientes,
      (SELECT COUNT(*) FROM lotes_offline WHERE estado = 'PENDIENTE') AS lotesPendientes,
      (SELECT COUNT(*) FROM lecturas_offline WHERE errorSync IS NOT NULL) AS lecturasConError
  `);
  return fila ?? { lecturasPendientes: 0, fotosPendientes: 0, lotesPendientes: 0, lecturasConError: 0 };
}

export async function crearLote(): Promise<number> {
  const db = await getDb();
  const r = await db.runAsync('INSERT INTO lotes_offline (fechaCreacion) VALUES (?)', new Date().toISOString());
  return r.lastInsertRowId;
}

export async function asignarLote(idLote: number, idsLectura: number[]): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const id of idsLectura) {
      await db.runAsync('UPDATE lecturas_offline SET idLoteLocal = ? WHERE id = ?', idLote, id);
    }
  });
}

export interface ResultadoLecturaSync {
  id: number;
  idRemoto: string | null;
  error: string | null;
}

/** Marca el lote como enviado y actualiza cada lectura con lo que respondió la API. */
export async function registrarResultadoLote(
  idLote: number,
  resultados: ResultadoLecturaSync[],
): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    for (const r of resultados) {
      await db.runAsync(
        "UPDATE lecturas_offline SET estadoSync = 'SINCRONIZADO', idRemoto = ?, errorSync = ? WHERE id = ?",
        r.idRemoto,
        r.error,
        r.id,
      );
    }
    const estado: EstadoLote = 'ENVIADO';
    await db.runAsync('UPDATE lotes_offline SET estado = ? WHERE id = ?', estado, idLote);
  });
}

export async function marcarFotoSubida(idLectura: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE lecturas_offline SET fotoSubida = 1 WHERE id = ?', idLectura);
}
