import axios, { AxiosError } from 'axios';
import { API_URL } from './config';
import { borrarItem, guardarItem, leerItem } from './tokenStorage';

const TOKEN_KEY = 'consumos_jwt';

export const guardarToken = (token: string): Promise<void> => guardarItem(TOKEN_KEY, token);
export const obtenerToken = (): Promise<string | null> => leerItem(TOKEN_KEY);
export const borrarToken = (): Promise<void> => borrarItem(TOKEN_KEY);

let onSesionExpirada: (() => void) | null = null;

/** Registra el callback a ejecutar cuando la API responde 401 a una petición autenticada. */
export function registrarSesionExpirada(callback: (() => void) | null): void {
  onSesionExpirada = callback;
}

export const api = axios.create({ baseURL: API_URL, timeout: 20_000 });

api.interceptors.request.use(async (config) => {
  const token = await obtenerToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (respuesta) => respuesta,
  (error: AxiosError) => {
    const eraAutenticada = Boolean(error.config?.headers?.get?.('Authorization'));
    if (error.response?.status === 401 && eraAutenticada) {
      onSesionExpirada?.();
    }
    return Promise.reject(error);
  },
);

/** Mensaje legible para mostrar al usuario a partir de un error de Axios. */
export function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor.';
    const mensaje = (error.response.data as { message?: string | string[] } | undefined)?.message;
    if (Array.isArray(mensaje)) return mensaje.join('\n');
    if (mensaje) return mensaje;
    return `Error del servidor (${error.response.status}).`;
  }
  return error instanceof Error ? error.message : 'Error inesperado.';
}
