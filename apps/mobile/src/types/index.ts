export type RolUsuario = 'ADMIN' | 'OPERARIO';

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
}

export interface LoginResponse {
  access_token: string;
  user: Usuario;
}

/** Item de `GET /api/lecturas/ruta`. */
export interface RutaMedidorApi {
  medidorId: string;
  numeroSerie: string;
  tipoServicio: string;
  socioId: string;
  numeroSocio: number;
  nombreCompleto: string;
  direccion: string;
  lecturaAnterior: number | null;
  promedioHistorico: number | null;
}

export interface SocioLocal {
  id: string;
  numeroSocio: number;
  nombre: string;
  direccion: string;
  idMedidor: string;
}

export interface MedidorLocal {
  id: string;
  numeroMedidor: string;
  lecturaAnterior: number | null;
  promedioHistorico: number | null;
}

/** Medidor + socio, tal como se muestra en la ruta. */
export interface ItemRuta {
  idMedidor: string;
  numeroMedidor: string;
  lecturaAnterior: number | null;
  promedioHistorico: number | null;
  idSocio: string;
  numeroSocio: number;
  nombreSocio: string;
  direccion: string;
  /** Verdadero si ya tiene una lectura cargada en el periodo actual. */
  leido: boolean;
}

export type EstadoSync = 'PENDIENTE' | 'SINCRONIZADO';
export type EstadoLote = 'PENDIENTE' | 'ENVIADO';

export interface LecturaOffline {
  id: number;
  idMedidor: string;
  periodo: string;
  lecturaActual: number;
  esAtipico: boolean;
  fotoPath: string | null;
  observaciones: string | null;
  estadoSync: EstadoSync;
  fechaLectura: string;
  idLoteLocal: number | null;
  /** UUID asignado por la API tras sincronizar; necesario para subir la evidencia. */
  idRemoto: string | null;
  fotoSubida: boolean;
  /** Motivo si la API rechazó la lectura. */
  errorSync: string | null;
}

export interface NuevaLectura {
  idMedidor: string;
  periodo: string;
  lecturaActual: number;
  esAtipico: boolean;
  fotoPath: string | null;
  observaciones: string | null;
}

export interface LoteProcesadoApi {
  loteId: string;
  totalRecibidas: number;
  totalProcesadas: number;
  totalAtipicas: number;
  procesadas: { id: string; medidorId: string; periodo: string }[];
  rechazadas: { medidorId: string; periodo: string; motivo: string }[];
}

export interface ResultadoSync {
  lecturasEnviadas: number;
  lecturasRechazadas: number;
  fotosSubidas: number;
  fotosFallidas: number;
}
