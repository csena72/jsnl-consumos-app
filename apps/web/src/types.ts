export type RolUsuario = 'ADMIN' | 'OPERARIO';
export type EstadoRevision = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
export type EstadoReclamo = 'PENDIENTE' | 'EN_REVISION' | 'RESUELTO';

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
  motivo: string;
  estado: EstadoReclamo;
  fechaIngreso: string;
  fotoEvidenciaUrl: string | null;
  socio: { numeroSocio: number; nombreCompleto: string };
  lectura: {
    id: string;
    periodo: string;
    valorLectura: number;
    fotografiaUrl: string | null;
  } | null;
}
