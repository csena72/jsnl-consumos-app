import type { Usuario } from '../types';
import { getDb } from './db';

export async function guardarSesion(usuario: Usuario): Promise<void> {
  const db = await getDb();
  await db.withTransactionAsync(async () => {
    await db.runAsync('DELETE FROM usuarios_session');
    await db.runAsync(
      'INSERT INTO usuarios_session (id, email, nombre, rol) VALUES (?, ?, ?, ?)',
      usuario.id,
      usuario.email,
      usuario.nombre,
      usuario.rol,
    );
  });
}

export async function obtenerSesion(): Promise<Usuario | null> {
  const db = await getDb();
  return db.getFirstAsync<Usuario>('SELECT id, email, nombre, rol FROM usuarios_session LIMIT 1');
}

export async function borrarSesion(): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM usuarios_session');
}
