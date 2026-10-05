import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

const DB_NAME = 'consumos_local.db';

/**
 * La conexión se guarda en globalThis para sobrevivir al Fast Refresh: en web, si el módulo
 * se recarga y abre otra conexión, el archivo (OPFS) sigue tomado por la anterior y falla.
 */
const globalConDb = globalThis as typeof globalThis & {
  __consumosDb?: Promise<SQLite.SQLiteDatabase> | null;
};

const SCHEMA = `
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
    promedioHistorico REAL,
    tipoServicio TEXT NOT NULL DEFAULT 'ENERGIA' CHECK (tipoServicio IN ('ENERGIA', 'AGUA')),
    numeroCaja TEXT,
    localidadId TEXT,
    rutaNombre TEXT,
    ordenSecuencia INTEGER
  );

  CREATE TABLE IF NOT EXISTS localidades_local (
    id TEXT PRIMARY KEY NOT NULL,
    nombre TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS medidores_nuevos_pendientes (
    id_local INTEGER PRIMARY KEY AUTOINCREMENT,
    numeroSerie TEXT NOT NULL,
    socioId TEXT,
    tipoServicio TEXT NOT NULL CHECK (tipoServicio IN ('ENERGIA', 'AGUA')),
    localidadId TEXT,
    numeroCaja TEXT,
    direccionReferencia TEXT,
    lecturaInicial REAL,
    observaciones TEXT,
    fotoPathLocal TEXT NOT NULL,
    fechaCreacion TEXT NOT NULL,
    sincronizado INTEGER NOT NULL DEFAULT 0,
    idRemoto TEXT,
    fotoSubida INTEGER NOT NULL DEFAULT 0,
    errorSync TEXT
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

/** Columnas agregadas en el Sprint 6: las instalaciones previas tienen `medidores_local` sin ellas. */
const COLUMNAS_SPRINT_6: { nombre: string; definicion: string }[] = [
  { nombre: 'tipoServicio', definicion: "TEXT NOT NULL DEFAULT 'ENERGIA'" },
  { nombre: 'numeroCaja', definicion: 'TEXT' },
  { nombre: 'localidadId', definicion: 'TEXT' },
  { nombre: 'rutaNombre', definicion: 'TEXT' },
  { nombre: 'ordenSecuencia', definicion: 'INTEGER' },
];

async function migrar(db: SQLite.SQLiteDatabase): Promise<void> {
  const columnas = await db.getAllAsync<{ name: string }>('PRAGMA table_info(medidores_local)');
  const existentes = new Set(columnas.map((c) => c.name));
  for (const c of COLUMNAS_SPRINT_6) {
    if (!existentes.has(c.nombre)) {
      await db.execAsync(`ALTER TABLE medidores_local ADD COLUMN ${c.nombre} ${c.definicion}`);
    }
  }
}

/** Abre (una sola vez) la base local y crea las tablas si no existen. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!globalConDb.__consumosDb) {
    globalConDb.__consumosDb = (async () => {
      const db = await SQLite.openDatabaseAsync(DB_NAME);
      // WAL no es compatible con el almacenamiento OPFS de web.
      if (Platform.OS !== 'web') {
        await db.execAsync('PRAGMA journal_mode = WAL;');
      }
      // Primero se migra lo existente y luego se crean las tablas nuevas.
      await db.execAsync(SCHEMA);
      await migrar(db);
      return db;
    })().catch((error: unknown) => {
      globalConDb.__consumosDb = null;
      throw error;
    });
  }
  return globalConDb.__consumosDb;
}
