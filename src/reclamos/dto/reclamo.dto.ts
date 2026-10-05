import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { EstadoReclamo, TipoReclamo } from '../reclamo.entity';

export class CrearReclamoDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  socioId: string;

  @ApiProperty({ enum: TipoReclamo })
  @IsEnum(TipoReclamo)
  tipoReclamo: TipoReclamo;

  @ApiProperty({ example: 'El medidor marca un consumo que no corresponde' })
  @IsString()
  @MinLength(3)
  @MaxLength(2000)
  descripcion: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Lectura discutida, si aplica' })
  @IsOptional()
  @IsUUID()
  lecturaId?: string;
}

export class ActualizarEstadoReclamoDto {
  @ApiProperty({ enum: EstadoReclamo })
  @IsEnum(EstadoReclamo)
  estado: EstadoReclamo;

  @ApiPropertyOptional({ example: 'Se verificó el medidor en domicilio', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  comentario?: string;
}

export class FiltroReclamosDto {
  @ApiPropertyOptional({ enum: EstadoReclamo })
  @IsOptional()
  @IsEnum(EstadoReclamo)
  estado?: EstadoReclamo;

  @ApiPropertyOptional({ enum: TipoReclamo })
  @IsOptional()
  @IsEnum(TipoReclamo)
  tipoReclamo?: TipoReclamo;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  socioId?: string;
}

class SocioReclamoDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() numeroSocio: number;
  @ApiProperty() nombreCompleto: string;
}

class LecturaReclamoDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ example: '202610' }) periodo: string;
  @ApiProperty() valorLectura: number;
  @ApiProperty({ nullable: true, type: String }) fotografiaUrl: string | null;
}

export class HistorialReclamoDto {
  @ApiProperty({ nullable: true, enum: EstadoReclamo }) estadoAnterior: EstadoReclamo | null;
  @ApiProperty({ enum: EstadoReclamo }) estadoNuevo: EstadoReclamo;
  @ApiProperty({ nullable: true, type: String }) comentario: string | null;
  @ApiProperty({ nullable: true, type: String, description: 'Nombre del usuario que hizo el cambio' })
  usuario: string | null;
  @ApiProperty({ type: String, format: 'date-time' }) fecha: Date;
}

export class ReclamoDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ enum: TipoReclamo }) tipoReclamo: TipoReclamo;
  @ApiProperty() descripcion: string;
  @ApiProperty({ enum: EstadoReclamo }) estado: EstadoReclamo;
  @ApiProperty({ type: String, format: 'date-time' }) fechaCreacion: Date;
  @ApiProperty({ nullable: true, type: String, example: '/uploads/abc.jpg' }) fotoUrl: string | null;
  @ApiProperty({ type: SocioReclamoDto }) socio: SocioReclamoDto;
  @ApiProperty({ nullable: true, type: LecturaReclamoDto }) lectura: LecturaReclamoDto | null;
}

export class ReclamoDetalleDto extends ReclamoDto {
  @ApiProperty({ type: [HistorialReclamoDto], description: 'Cambios de estado, más antiguos primero' })
  historial: HistorialReclamoDto[];
}
