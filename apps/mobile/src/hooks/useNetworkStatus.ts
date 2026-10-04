import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';

export interface EstadoRed {
  conectado: boolean;
  tipo: string;
}

/** Conectividad a Internet en tiempo real (WiFi, datos móviles, etc.). */
export function useNetworkStatus(): EstadoRed {
  const [estado, setEstado] = useState<EstadoRed>({ conectado: false, tipo: 'unknown' });

  useEffect(() => {
    return NetInfo.addEventListener((s) => {
      setEstado({ conectado: s.isConnected === true && s.isInternetReachable !== false, tipo: s.type });
    });
  }, []);

  return estado;
}
