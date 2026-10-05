export type TipoServicio = 'ENERGIA' | 'AGUA';

export const ETIQUETA_SERVICIO: Record<TipoServicio, string> = { ENERGIA: 'Luz', AGUA: 'Agua' };

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
  tipoServicio: TipoServicio;
  numeroCaja: string | null;
  localidadId: string | null;
  localidad: string | null;
  ruta: string | null;
  ordenSecuencia: number | null;
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
  tipoServicio: TipoServicio;
  numeroCaja: string | null;
  localidadId: string | null;
  ordenSecuencia: number | null;
  lecturaAnterior: number | null;
  promedioHistorico: number | null;
}

/** Medidor + socio, tal como se muestra en la ruta. */
export interface ItemRuta {
  idMedidor: string;
  numeroMedidor: string;
  tipoServicio: TipoServicio;
  numeroCaja: string | null;
  localidadId: string | null;
  localidadNombre: string | null;
  rutaNombre: string | null;
  ordenSecuencia: number | null;
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
  medidoresNuevosEnviados: number;
  medidoresNuevosFallidos: number;
}

/** Item de `GET /api/localidades`. */
export interface LocalidadApi {
  id: string;
  nombre: string;
}

export interface FiltroRuta {
  localidadId: string | null;
  tipoServicio: TipoServicio | null;
}

export interface MedidorNuevoPendiente {
  idLocal: number;
  numeroSerie: string;
  socioId: string | null;
  tipoServicio: TipoServicio;
  localidadId: string | null;
  numeroCaja: string | null;
  direccionReferencia: string | null;
  lecturaInicial: number | null;
  observaciones: string | null;
  fotoPathLocal: string;
  fechaCreacion: string;
  sincronizado: boolean;
  /** UUID de la solicitud en la API una vez creada (permite reintentar solo la foto). */
  idRemoto: string | null;
  fotoSubida: boolean;
  errorSync: string | null;
}

export type NuevoMedidorPendiente = Pick<
  MedidorNuevoPendiente,
  | 'numeroSerie'
  | 'socioId'
  | 'tipoServicio'
  | 'localidadId'
  | 'numeroCaja'
  | 'direccionReferencia'
  | 'lecturaInicial'
  | 'observaciones'
  | 'fotoPathLocal'
>;
