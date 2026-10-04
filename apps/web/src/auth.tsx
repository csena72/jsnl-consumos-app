import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from './api';
import type { Usuario } from './types';

interface AuthState {
  usuario: Usuario | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const USER_KEY = 'consumos.user';
const AuthContext = createContext<AuthState | null>(null);

function usuarioGuardado(): Usuario | null {
  if (!tokenStore.get()) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as Usuario) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(usuarioGuardado);

  const logout = useCallback(() => {
    tokenStore.clear();
    localStorage.removeItem(USER_KEY);
    setUsuario(null);
  }, []);

  useEffect(() => setUnauthorizedHandler(logout), [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { access_token, user } = await api.login(email, password);
    if (user.rol !== 'ADMIN') {
      throw new Error('Esta consola es solo para administradores');
    }
    tokenStore.set(access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUsuario(user);
  }, []);

  const value = useMemo(() => ({ usuario, login, logout }), [usuario, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
