import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { borrarToken, guardarToken, obtenerToken, registrarSesionExpirada } from '../api/client';
import { descargarLocalidades, descargarRuta, login as loginApi } from '../api/endpoints';
import { reemplazarRuta, limpiarDatosLocales } from '../database/rutaRepository';
import { borrarSesion, guardarSesion, obtenerSesion } from '../database/sessionRepository';
import { contarPendientes } from '../database/lecturasRepository';
import type { Usuario } from '../types';

interface AuthValue {
  cargando: boolean;
  usuario: Usuario | null;
  iniciarSesion: (email: string, password: string) => Promise<void>;
  actualizarRuta: () => Promise<number>;
  /** Cierra sesión. Devuelve false si hay lecturas sin sincronizar y no se forzó. */
  cerrarSesion: (forzar?: boolean) => Promise<boolean>;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Restaura la sesión local: permite abrir la app sin red.
  useEffect(() => {
    (async () => {
      try {
        const [sesion, token] = await Promise.all([obtenerSesion(), obtenerToken()]);
        setUsuario(sesion && token ? sesion : null);
      } finally {
        setCargando(false);
      }
    })();
  }, []);

  const iniciarSesion = useCallback(async (email: string, password: string) => {
    const { access_token, user } = await loginApi(email, password);
    await guardarToken(access_token);
    try {
      await reemplazarRuta(await descargarRuta(), await descargarLocalidades());
    } catch (error) {
      await borrarToken();
      throw error;
    }
    await guardarSesion(user);
    setUsuario(user);
  }, []);

  const actualizarRuta = useCallback(async () => {
    const [ruta, localidades] = await Promise.all([descargarRuta(), descargarLocalidades()]);
    await reemplazarRuta(ruta, localidades);
    return ruta.length;
  }, []);

  const cerrarSesion = useCallback(async (forzar = false) => {
    const { lecturasPendientes, fotosPendientes, nuevosPendientes } = await contarPendientes();
    if (!forzar && (lecturasPendientes > 0 || fotosPendientes > 0 || nuevosPendientes > 0)) return false;
    await borrarToken();
    await borrarSesion();
    await limpiarDatosLocales();
    setUsuario(null);
    return true;
  }, []);

  // Token vencido: se vuelve al login pero se conservan las lecturas sin enviar.
  useEffect(() => {
    registrarSesionExpirada(() => {
      void borrarToken();
      void borrarSesion();
      setUsuario(null);
    });
    return () => registrarSesionExpirada(null);
  }, []);

  const value = useMemo(
    () => ({ cargando, usuario, iniciarSesion, actualizarRuta, cerrarSesion }),
    [cargando, usuario, iniciarSesion, actualizarRuta, cerrarSesion],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
