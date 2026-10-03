import { useCallback, useEffect, useState } from 'react';

interface Carga<T> {
  datos: T | null;
  error: string | null;
  cargando: boolean;
  recargar: () => void;
}

/** Ejecuta `fn` al montar y cada vez que cambia; ignora respuestas de ejecuciones obsoletas. */
export function useCarga<T>(fn: () => Promise<T>): Carga<T> {
  const [datos, setDatos] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    setCargando(true);
    fn()
      .then((d) => {
        if (!vigente) return;
        setDatos(d);
        setError(null);
      })
      .catch((e: unknown) => vigente && setError(e instanceof Error ? e.message : 'Error inesperado'))
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, [fn, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { datos, error, cargando, recargar };
}
