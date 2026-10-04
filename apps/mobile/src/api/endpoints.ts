import { Platform } from 'react-native';
import type { LoginResponse, LoteProcesadoApi, RutaMedidorApi } from '../types';
import { api } from './client';

export interface LecturaPayload {
  medidorId: string;
  valorLectura: number;
  periodo: string;
  fechaCaptura: string;
  observaciones?: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>('/auth/login', { email, password });
  return data;
}

export async function descargarRuta(): Promise<RutaMedidorApi[]> {
  const { data } = await api.get<RutaMedidorApi[]>('/lecturas/ruta');
  return data;
}

export async function sincronizarLote(lecturas: LecturaPayload[]): Promise<LoteProcesadoApi> {
  const { data } = await api.post<LoteProcesadoApi>('/lecturas/sincronizar-lote', { lecturas });
  return data;
}

export async function subirEvidencia(idLecturaRemota: string, fotoUri: string): Promise<void> {
  const formData = new FormData();
  const nombre = `lectura-${idLecturaRemota}.jpg`;
  if (Platform.OS === 'web') {
    const blob = await (await fetch(fotoUri)).blob();
    formData.append('foto', blob, nombre);
  } else {
    // React Native acepta este objeto en lugar de un Blob para adjuntar archivos locales.
    formData.append('foto', { uri: fotoUri, name: nombre, type: 'image/jpeg' } as unknown as Blob);
  }
  await api.post(`/lecturas/${idLecturaRemota}/evidencia`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
}
