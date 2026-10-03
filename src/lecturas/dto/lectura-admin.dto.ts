import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MaxLength } from 'class-validator';
import { TipoServicio } from '../../medidores/medidor.entity';
import { EstadoRevision } from '../lectura.entity';

const PERIODO_REGEX = /^\d{4}(0[1-9]|1[0-2])$/;

export class RevisionLecturaDto {
  @ApiPropertyOptional({ example: 'Verificado con la foto del medidor', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}

export class FiltroAtipicasDto {
  @ApiPropertyOptional({ enum: EstadoRevision, description: 'Por defecto, todas' })
  @IsOptional()
  @IsEnum(EstadoRevision)
  estado?: EstadoRevision;
}

export class PeriodoQueryDto {
  @ApiProperty({ example: '202610', description: 'Formato AAAAMM' })
  @Matches(PERIODO_REGEX, { message: 'periodo debe tener formato AAAAMM' })
  periodo: string;
}

export class ResumenQueryDto {
  @ApiPropertyOptional({ example: '202610', description: 'Formato AAAAMM. Por defecto, todos' })
  @IsOptional()
  @Matches(PERIODO_REGEX, { message: 'periodo debe tener formato AAAAMM' })
  periodo?: string;
}

export class ResumenDashboardDto {
  @ApiProperty() totalLotes: number;
  @ApiProperty() lotesConInconsistencias: number;
  @ApiProperty() totalLecturas: number;
  @ApiProperty() totalAtipicas: number;
  @ApiProperty() atipicasPendientes: number;
  @ApiProperty() atipicasAprobadas: number;
  @ApiProperty() atipicasRechazadas: number;
}

class MedidorResumenDto {
  @ApiProperty() numeroSerie: string;
  @ApiProperty({ enum: TipoServicio }) tipoServicio: TipoServicio;
}

class SocioResumenDto {
  @ApiProperty() numeroSocio: number;
  @ApiProperty() nombreCompleto: string;
}

export class LecturaAtipicaDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: '202610' }) periodo: string;
  @ApiProperty() valorLectura: number;
  @ApiProperty({ nullable: true, type: Number }) promedioHistorico: number | null;
  @ApiProperty({ nullable: true, type: Number }) desvioPorcentaje: number | null;
  @ApiProperty({ enum: EstadoRevision }) estadoRevision: EstadoRevision;
  @ApiProperty({ type: String, format: 'date-time' }) fechaCaptura: Date;
  @ApiProperty({ nullable: true, type: String, example: '/uploads/abc.jpg' })
  fotografiaUrl: string | null;
  @ApiProperty({ nullable: true, type: String }) observaciones: string | null;
  @ApiProperty() operarioNombre: string;
  @ApiProperty({ type: MedidorResumenDto }) medidor: MedidorResumenDto;
  @ApiProperty({ type: SocioResumenDto }) socio: SocioResumenDto;
}

export class LecturaRevisadaDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ enum: EstadoRevision }) estadoRevision: EstadoRevision;
}
