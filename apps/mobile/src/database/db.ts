import * as SQLite from 'expo-sqlite';

const DB_NAME = 'consumos_local.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS usuarios_session (
    id TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    nombre TEXT NOT NULL,
    rol TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS medidores_local (
    id TEXT PRIMARY KEY NOT NULL,
    numeroMedidor TEXT NOT NULL,
    lecturaAnterior REAL,
    promedioHistorico REAL
  );

  CREATE TABLE IF NOT EXISTS socios_local (
    id TEXT PRIMARY KEY NOT NULL,
    numeroSocio INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    direccion TEXT NOT NULL,
    idMedidor TEXT NOT NULL REFERENCES medidores_local(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS lotes_offline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fechaCreacion TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estado IN ('PENDIENTE', 'ENVIADO'))
  );

  CREATE TABLE IF NOT EXISTS lecturas_offline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    idMedidor TEXT NOT NULL,
    periodo TEXT NOT NULL,
    lecturaActual REAL NOT NULL,
    esAtipico INTEGER NOT NULL DEFAULT 0,
    fotoPath TEXT,
    observaciones TEXT,
    estadoSync TEXT NOT NULL DEFAULT 'PENDIENTE' CHECK (estadoSync IN ('PENDIENTE', 'SINCRONIZADO')),
    fechaLectura TEXT NOT NULL,
    idLoteLocal INTEGER REFERENCES lotes_offline(id),
    idRemoto TEXT,
    fotoSubida INTEGER NOT NULL DEFAULT 0,
    errorSync TEXT,
    UNIQUE (idMedidor, periodo)
  );

  CREATE INDEX IF NOT EXISTS idx_lecturas_estado ON lecturas_offline(estadoSync);
`;

/** Abre (una sola vez) la base local y crea las tablas si no existen. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      await db.execAsync(SCHEMA);
      return db;
    })().catch((error: unknown) => {
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}
