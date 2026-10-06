export type RolUsuario = 'ADMIN' | 'OPERARIO';
export type EstadoRevision = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
export type EstadoReclamo = 'PENDIENTE' | 'EN_PROCESO' | 'RESUELTO';
export type TipoReclamo = 'LECTURA_ERRONEA' | 'FACTURACION' | 'MEDIDOR_DANADO' | 'FALTA_SERVICIO' | 'OTRO';
export type TipoServicio = 'ENERGIA' | 'AGUA';
export type EstadoMedidor = 'ACTIVO' | 'INACTIVO';
export type EstadoPrecinto = 'INTACTO' | 'VIOLADO' | 'SIN_PRECINTO';
export type CategoriaSocio = 'RESIDENCIAL' | 'RURAL' | 'COMERCIAL';
export type EstadoPendienteAlta = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

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

export interface ResumenDashboard {
  totalLotes: number;
  lotesConInconsistencias: number;
  totalLecturas: number;
  totalAtipicas: number;
  atipicasPendientes: number;
  atipicasAprobadas: number;
  atipicasRechazadas: number;
}

export interface LecturaAtipica {
  id: string;
  periodo: string;
  valorLectura: number;
  promedioHistorico: number | null;
  desvioPorcentaje: number | null;
  estadoRevision: EstadoRevision;
  fechaCaptura: string;
  fotografiaUrl: string | null;
  observaciones: string | null;
  operarioNombre: string;
  medidor: { numeroSerie: string; tipoServicio: string };
  socio: { numeroSocio: number; nombreCompleto: string };
}

export interface Reclamo {
  id: string;
  tipoReclamo: TipoReclamo;
  descripcion: string;
  estado: EstadoReclamo;
  fechaCreacion: string;
  fotoUrl: string | null;
  socio: { id: string; numeroSocio: number; nombreCompleto: string };
  lectura: {
    id: string;
    periodo: string;
    valorLectura: number;
    fotografiaUrl: string | null;
  } | null;
}

export interface HistorialReclamo {
  estadoAnterior: EstadoReclamo | null;
  estadoNuevo: EstadoReclamo;
  comentario: string | null;
  usuario: string | null;
  fecha: string;
}

export interface ReclamoDetalle extends Reclamo {
  historial: HistorialReclamo[];
}

export interface Pagina<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface Ref {
  id: string;
  nombre: string;
}

export interface Localidad extends Ref {
  provincia: string;
  codigoPostal: string | null;
}

export interface Socio {
  id: string;
  numeroSocio: number;
  nombreCompleto: string;
  dni: string | null;
  telefono: string | null;
  direccionTacural: string;
  categoria: CategoriaSocio;
  activo: boolean;
  localidad: Ref | null;
}

export interface Medidor {
  id: string;
  numeroSerie: string;
  tipoServicio: TipoServicio;
  estado: EstadoMedidor;
  numeroCaja: string | null;
  estadoPrecinto: EstadoPrecinto;
  ordenSecuencia: number | null;
  socio: { id: string; numeroSocio: number; nombreCompleto: string };
  localidad: Ref | null;
  ruta: Ref | null;
}

export interface Ruta {
  id: string;
  nombre: string;
  activa: boolean;
  localidad: Ref;
  operario: Ref | null;
  totalMedidores: number;
}

export interface RutaMedidor {
  id: string;
  ordenSecuencia: number;
  numeroSerie: string;
  tipoServicio: TipoServicio;
  numeroCaja: string | null;
  numeroSocio: number;
  nombreCompleto: string;
  direccion: string;
}

export interface RutaDetalle extends Ruta {
  medidores: RutaMedidor[];
}

export type FiltroExportacion = 'TODAS' | 'ATIPICAS' | 'PROCESADAS';

export interface UsuarioAdmin extends Usuario {
  activo: boolean;
}

export interface MedidorNuevo {
  id: string;
  numeroSerie: string;
  tipoServicio: TipoServicio;
  numeroCaja: string | null;
  estadoPrecinto: EstadoPrecinto;
  localidad: Ref | null;
  direccionReferencia: string | null;
  observaciones: string | null;
  fotoUrl: string | null;
  estado: EstadoPendienteAlta;
  reportadoPor: string;
  fechaCreacion: string;
  revisadoPor: string | null;
  fechaRevision: string | null;
  motivoRechazo: string | null;
  medidorId: string | null;
}
