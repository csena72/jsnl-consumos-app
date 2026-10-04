import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { mensajeDeError } from '../api/client';
import { contarPendientes, type ContadoresSync } from '../database/lecturasRepository';
import { useNetworkStatus, type EstadoRed } from '../hooks/useNetworkStatus';
import { sincronizarAhora } from '../services/SyncService';
import type { ResultadoSync } from '../types';
import { useAuth } from './AuthContext';

interface SyncValue {
  red: EstadoRed;
  contadores: ContadoresSync;
  sincronizando: boolean;
  ultimoResultado: ResultadoSync | null;
  ultimoError: string | null;
  refrescarContadores: () => Promise<void>;
  sincronizar: () => Promise<void>;
}

const VACIO: ContadoresSync = { lecturasPendientes: 0, fotosPendientes: 0, lotesPendientes: 0, lecturasConError: 0 };

const SyncContext = createContext<SyncValue | null>(null);

export function SyncProvider({ children }: { children: ReactNode }) {
  const { usuario } = useAuth();
  const red = useNetworkStatus();
  const [contadores, setContadores] = useState<ContadoresSync>(VACIO);
  const [sincronizando, setSincronizando] = useState(false);
  const [ultimoResultado, setUltimoResultado] = useState<ResultadoSync | null>(null);
  const [ultimoError, setUltimoError] = useState<string | null>(null);

  const refrescarContadores = useCallback(async () => {
    setContadores(await contarPendientes());
  }, []);

  const sincronizar = useCallback(async () => {
    setSincronizando(true);
    setUltimoError(null);
    try {
      setUltimoResultado(await sincronizarAhora());
    } catch (error) {
      setUltimoError(mensajeDeError(error));
    } finally {
      setSincronizando(false);
      await refrescarContadores();
    }
  }, [refrescarContadores]);

  // Sincronización diferida: al recuperar la red se envía lo pendiente.
  const estabaConectado = useRef(false);
  useEffect(() => {
    const recuperoRed = red.conectado && !estabaConectado.current;
    estabaConectado.current = red.conectado;
    if (!usuario) return;
    void refrescarContadores().then(() => {
      if (recuperoRed) void sincronizar();
    });
  }, [red.conectado, usuario, refrescarContadores, sincronizar]);

  const value = useMemo(
    () => ({ red, contadores, sincronizando, ultimoResultado, ultimoError, refrescarContadores, sincronizar }),
    [red, contadores, sincronizando, ultimoResultado, ultimoError, refrescarContadores, sincronizar],
  );
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function useSync(): SyncValue {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error('useSync debe usarse dentro de <SyncProvider>');
  return ctx;
}
