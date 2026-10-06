import type {
  EstadoPendienteAlta,
  EstadoReclamo,
  FiltroExportacion,
  EstadoRevision,
  LecturaAtipica,
  Localidad,
  LoginResponse,
  Medidor,
  MedidorNuevo,
  Pagina,
  Reclamo,
  ReclamoDetalle,
  ResumenDashboard,
  Ruta,
  RutaDetalle,
  Socio,
  TipoReclamo,
  UsuarioAdmin,
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
  // Con FormData el navegador fija el Content-Type (con el boundary) por su cuenta.
  if (typeof init.body === 'string') headers.set('Content-Type', 'application/json');
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

const enviar = (method: 'POST' | 'PATCH' | 'PUT', body: unknown): RequestInit => ({
  method,
  body: JSON.stringify(body),
});
const patch = (body: unknown): RequestInit => enviar('PATCH', body);

async function vacio(path: string, init: RequestInit): Promise<void> {
  await request(path, init);
}

/** Arma un query string omitiendo los valores vacíos. */
export function query(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v));
  }
  const texto = q.toString();
  return texto ? `?${texto}` : '';
}

export type Cuerpo = Record<string, unknown>;

async function subirFoto(path: string, archivo: File): Promise<void> {
  const form = new FormData();
  form.append('foto', archivo);
  await request(path, { method: 'POST', body: form });
}

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
  reclamos: (filtros: { estado?: EstadoReclamo; tipoReclamo?: TipoReclamo } = {}) =>
    json<Reclamo[]>(`/reclamos${query(filtros)}`),
  reclamo: (id: string) => json<ReclamoDetalle>(`/reclamos/${id}`),
  crearReclamo: (datos: Cuerpo) => json<ReclamoDetalle>('/reclamos', enviar('POST', datos)),
  actualizarReclamo: (id: string, estado: EstadoReclamo, comentario?: string) =>
    json<ReclamoDetalle>(`/reclamos/${id}/estado`, patch({ estado, comentario: comentario || undefined })),
  subirFotoReclamo: (id: string, archivo: File) => subirFoto(`/reclamos/${id}/foto`, archivo),

  localidades: () => json<Localidad[]>('/localidades'),
  crearLocalidad: (datos: Cuerpo) => json<Localidad>('/localidades', enviar('POST', datos)),
  editarLocalidad: (id: string, datos: Cuerpo) => json<Localidad>(`/localidades/${id}`, patch(datos)),
  eliminarLocalidad: (id: string) => vacio(`/localidades/${id}`, { method: 'DELETE' }),

  socios: (f: { q?: string; localidadId?: string; activo?: boolean; page?: number; limit?: number }) =>
    json<Pagina<Socio>>(`/socios${query(f)}`),
  crearSocio: (datos: Cuerpo) => json<Socio>('/socios', enviar('POST', datos)),
  editarSocio: (id: string, datos: Cuerpo) => json<Socio>(`/socios/${id}`, patch(datos)),
  bajaSocio: (id: string) => vacio(`/socios/${id}`, { method: 'DELETE' }),
  reactivarSocio: (id: string) => json<Socio>(`/socios/${id}/reactivar`, patch({})),

  medidores: (f: {
    q?: string;
    tipoServicio?: string;
    localidadId?: string;
    rutaId?: string;
    socioId?: string;
    estado?: string;
    page?: number;
    limit?: number;
  }) => json<Pagina<Medidor>>(`/medidores${query(f)}`),
  crearMedidor: (datos: Cuerpo) => json<Medidor>('/medidores', enviar('POST', datos)),
  editarMedidor: (id: string, datos: Cuerpo) => json<Medidor>(`/medidores/${id}`, patch(datos)),
  bajaMedidor: (id: string) => vacio(`/medidores/${id}`, { method: 'DELETE' }),

  rutas: (localidadId?: string) => json<Ruta[]>(`/rutas${query({ localidadId })}`),
  ruta: (id: string) => json<RutaDetalle>(`/rutas/${id}`),
  crearRuta: (datos: Cuerpo) => json<RutaDetalle>('/rutas', enviar('POST', datos)),
  editarRuta: (id: string, datos: Cuerpo) => json<RutaDetalle>(`/rutas/${id}`, patch(datos)),
  eliminarRuta: (id: string) => vacio(`/rutas/${id}`, { method: 'DELETE' }),
  asignarRuta: (id: string, operarioId: string | null) =>
    json<RutaDetalle>(`/rutas/${id}/asignar`, patch({ operarioId })),
  ordenarRuta: (id: string, medidorIds: string[]) =>
    json<RutaDetalle>(`/rutas/${id}/orden`, enviar('PUT', { medidorIds })),

  usuarios: () => json<UsuarioAdmin[]>('/usuarios'),
  crearUsuario: (datos: Cuerpo) => json<UsuarioAdmin>('/usuarios', enviar('POST', datos)),
  editarUsuario: (id: string, datos: Cuerpo) => json<UsuarioAdmin>(`/usuarios/${id}`, patch(datos)),
  bajaUsuario: (id: string) => vacio(`/usuarios/${id}`, { method: 'DELETE' }),

  medidoresNuevos: (estado?: EstadoPendienteAlta) =>
    json<MedidorNuevo[]>(`/medidores-nuevos${query({ estado })}`),
  aprobarMedidorNuevo: (id: string, datos: Cuerpo) =>
    json<MedidorNuevo>(`/medidores-nuevos/${id}/aprobar`, enviar('POST', datos)),
  rechazarMedidorNuevo: (id: string, motivo: string) =>
    json<MedidorNuevo>(`/medidores-nuevos/${id}/rechazar`, enviar('POST', { motivo })),
  exportarCsv: async (periodo: string, filtro: FiltroExportacion): Promise<Blob> =>
    (await request(`/lecturas/exportar${query({ periodo, filtro })}`)).blob(),
};

/** Las fotos viven en /uploads (sin prefijo /api) y las sirve la propia API. */
export function urlFoto(ruta: string | null): string | null {
  return ruta ? `${API_URL}${ruta}` : null;
}
