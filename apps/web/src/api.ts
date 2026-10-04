import type {
  EstadoReclamo,
  EstadoRevision,
  LecturaAtipica,
  LoginResponse,
  Reclamo,
  ResumenDashboard,
} from './types';

export const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

const TOKEN_KEY = 'consumos.token';

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string): void => localStorage.setItem(TOKEN_KEY, token),
  clear: (): void => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

let onUnauthorized: () => void = () => undefined;
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler;
}

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const token = tokenStore.get();
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(`${API_URL}/api${path}`, { ...init, headers });
  if (res.ok) return res;

  const cuerpo: unknown = await res.json().catch(() => null);
  const mensaje =
    cuerpo && typeof cuerpo === 'object' && 'message' in cuerpo
      ? [(cuerpo as { message: string | string[] }).message].flat().join(', ')
      : `Error ${res.status}`;
  // Un 401 con sesión activa significa token vencido; en el login es "credenciales inválidas".
  if (res.status === 401 && token) onUnauthorized();
  throw new ApiError(mensaje, res.status);
}

async function json<T>(path: string, init?: RequestInit): Promise<T> {
  return (await request(path, init)).json() as Promise<T>;
}

const patch = (body: unknown): RequestInit => ({
  method: 'PATCH',
  body: JSON.stringify(body),
});

export const api = {
  login: (email: string, password: string) =>
    json<LoginResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  resumen: () => json<ResumenDashboard>('/lecturas/resumen'),
  atipicas: (estado?: EstadoRevision) =>
    json<LecturaAtipica[]>(`/lecturas/atipicas${estado ? `?estado=${estado}` : ''}`),
  revisarLectura: (id: string, accion: 'aprobar' | 'rechazar', comentario?: string) =>
    json<{ id: string; estadoRevision: EstadoRevision }>(
      `/lecturas/${id}/${accion}`,
      patch(comentario ? { comentario } : {}),
    ),
  reclamos: (estado?: EstadoReclamo) =>
    json<Reclamo[]>(`/reclamos${estado ? `?estado=${estado}` : ''}`),
  actualizarReclamo: (id: string, estado: EstadoReclamo) =>
    json<Reclamo>(`/reclamos/${id}/estado`, patch({ estado })),
  exportarCsv: async (periodo: string): Promise<Blob> =>
    (await request(`/lecturas/exportar?periodo=${encodeURIComponent(periodo)}`)).blob(),
};

/** Las fotos viven en /uploads (sin prefijo /api) y las sirve la propia API. */
export function urlFoto(ruta: string | null): string | null {
  return ruta ? `${API_URL}${ruta}` : null;
}
