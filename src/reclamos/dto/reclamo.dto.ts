import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { EstadoReclamo } from '../reclamo.entity';

export class ActualizarEstadoReclamoDto {
  @ApiProperty({ enum: EstadoReclamo })
  @IsEnum(EstadoReclamo)
  estado: EstadoReclamo;
}

class SocioReclamoDto {
  @ApiProperty() numeroSocio: number;
  @ApiProperty() nombreCompleto: string;
}

class LecturaReclamoDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: '202610' }) periodo: string;
  @ApiProperty() valorLectura: number;
  @ApiProperty({ nullable: true, type: String }) fotografiaUrl: string | null;
}

export class ReclamoDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() motivo: string;
  @ApiProperty({ enum: EstadoReclamo }) estado: EstadoReclamo;
  @ApiProperty({ type: String, format: 'date-time' }) fechaIngreso: Date;
  @ApiProperty({ nullable: true, type: String, example: '/uploads/abc.jpg' })
  fotoEvidenciaUrl: string | null;
  @ApiProperty({ type: SocioReclamoDto }) socio: SocioReclamoDto;
  @ApiProperty({ nullable: true, type: LecturaReclamoDto }) lectura: LecturaReclamoDto | null;
}
