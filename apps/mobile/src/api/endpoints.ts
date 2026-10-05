import { Platform } from 'react-native';
import type { LocalidadApi, LoginResponse, LoteProcesadoApi, RutaMedidorApi, TipoServicio } from '../types';
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

export async function descargarLocalidades(): Promise<LocalidadApi[]> {
  const { data } = await api.get<LocalidadApi[]>('/localidades');
  return data;
}

async function subirFoto(ruta: string, fotoUri: string, nombre: string): Promise<void> {
  const formData = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(fotoUri)).blob();
    formData.append('foto', blob, nombre);
  } else {
    // React Native acepta este objeto en lugar de un Blob para adjuntar archivos locales.
    formData.append('foto', { uri: fotoUri, name: nombre, type: 'image/jpeg' } as unknown as Blob);
  }
  await api.post(ruta, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60_000,
  });
}

export function subirEvidencia(idLecturaRemota: string, fotoUri: string): Promise<void> {
  return subirFoto(`/lecturas/${idLecturaRemota}/evidencia`, fotoUri, `lectura-${idLecturaRemota}.jpg`);
}

export interface MedidorNuevoPayload {
  numeroSerie: string;
  tipoServicio: TipoServicio;
  numeroCaja?: string;
  localidadId?: string;
  direccionReferencia?: string;
  observaciones?: string;
}

/** Crea la solicitud de alta (`POST /api/medidores-nuevos`, queda PENDIENTE para el administrador). */
export async function reportarMedidorNuevo(payload: MedidorNuevoPayload): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>('/medidores-nuevos', payload);
  return data;
}

export function subirFotoMedidorNuevo(idSolicitud: string, fotoUri: string): Promise<void> {
  return subirFoto(`/medidores-nuevos/${idSolicitud}/foto`, fotoUri, `medidor-nuevo-${idSolicitud}.jpg`);
}
