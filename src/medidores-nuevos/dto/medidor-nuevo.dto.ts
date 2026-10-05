import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';
import { EstadoPrecinto, TipoServicio } from '../../medidores/medidor.entity';
import { EstadoPendienteAlta } from '../medidor-pendiente-alta.entity';

export class ReportarMedidorNuevoDto {
  @ApiProperty({ example: 'AGU-9999' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  numeroSerie: string;

  @ApiProperty({ enum: TipoServicio })
  @IsEnum(TipoServicio)
  tipoServicio: TipoServicio;

  @ApiPropertyOptional({ example: 'C-14' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  numeroCaja?: string;

  @ApiPropertyOptional({ enum: EstadoPrecinto, default: EstadoPrecinto.INTACTO })
  @IsOptional()
  @IsEnum(EstadoPrecinto)
  estadoPrecinto?: EstadoPrecinto;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  localidadId?: string;

  @ApiPropertyOptional({ example: 'Casa esquina, portón verde' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  direccionReferencia?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  observaciones?: string;
}

export class AprobarMedidorNuevoDto {
  @ApiProperty({ format: 'uuid', description: 'Socio al que se vincula el medidor' })
  @IsUUID()
  socioId: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Si se omite, usa la reportada en campo' })
  @IsOptional()
  @IsUUID()
  localidadId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  rutaId?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  ordenSecuencia?: number;

  @ApiPropertyOptional({ description: 'Si se omite, usa la reportada en campo' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  numeroCaja?: string;

  @ApiPropertyOptional({ enum: EstadoPrecinto, description: 'Si se omite, usa el reportado en campo' })
  @IsOptional()
  @IsEnum(EstadoPrecinto)
  estadoPrecinto?: EstadoPrecinto;
}

export class RechazarMedidorNuevoDto {
  @ApiProperty({ example: 'Medidor duplicado, ya figura en el padrón' })
  @IsString()
  @MinLength(3)
  @MaxLength(300)
  motivo: string;
}

export class FiltroMedidoresNuevosDto {
  @ApiPropertyOptional({ enum: EstadoPendienteAlta, description: 'Por defecto, todos' })
  @IsOptional()
  @IsEnum(EstadoPendienteAlta)
  estado?: EstadoPendienteAlta;
}

class RefDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() nombre: string;
}

export class MedidorNuevoDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() numeroSerie: string;
  @ApiProperty({ enum: TipoServicio }) tipoServicio: TipoServicio;
  @ApiProperty({ nullable: true, type: String }) numeroCaja: string | null;
  @ApiProperty({ enum: EstadoPrecinto }) estadoPrecinto: EstadoPrecinto;
  @ApiProperty({ nullable: true, type: RefDto }) localidad: RefDto | null;
  @ApiProperty({ nullable: true, type: String }) direccionReferencia: string | null;
  @ApiProperty({ nullable: true, type: String }) observaciones: string | null;
  @ApiProperty({ nullable: true, type: String, example: '/uploads/abc.jpg' }) fotoUrl: string | null;
  @ApiProperty({ enum: EstadoPendienteAlta }) estado: EstadoPendienteAlta;
  @ApiProperty({ description: 'Nombre del operario que lo halló' }) reportadoPor: string;
  @ApiProperty({ type: String, format: 'date-time' }) fechaCreacion: Date;
  @ApiProperty({ nullable: true, type: String }) revisadoPor: string | null;
  @ApiProperty({ nullable: true, type: String, format: 'date-time' }) fechaRevision: Date | null;
  @ApiProperty({ nullable: true, type: String }) motivoRechazo: string | null;
  @ApiProperty({ nullable: true, type: String, format: 'uuid', description: 'Medidor oficial creado al aprobar' })
  medidorId: string | null;
}
