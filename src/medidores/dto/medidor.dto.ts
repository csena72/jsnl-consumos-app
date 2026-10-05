import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min, MinLength } from 'class-validator';
import { PaginacionQueryDto } from '../../common/paginacion';
import { EstadoMedidor, EstadoPrecinto, TipoServicio } from '../medidor.entity';

export class CrearMedidorDto {
  @ApiProperty({ example: 'AGU-1006' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  numeroSerie: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  socioId: string;

  @ApiProperty({ enum: TipoServicio })
  @IsEnum(TipoServicio)
  tipoServicio: TipoServicio;

  @ApiPropertyOptional({
    example: 'C-14',
    description: 'Caja física donde está instalado. Cada servicio tiene su propia numeración de cajas',
  })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  numeroCaja?: string;

  @ApiPropertyOptional({ enum: EstadoPrecinto, default: EstadoPrecinto.INTACTO })
  @IsOptional()
  @IsEnum(EstadoPrecinto)
  estadoPrecinto?: EstadoPrecinto;

  @ApiPropertyOptional({ format: 'uuid', description: 'Si se omite, hereda la localidad de la ruta' })
  @IsOptional()
  @IsUUID()
  localidadId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  rutaId?: string;

  @ApiPropertyOptional({ minimum: 1, description: 'Si se omite con rutaId, se agrega al final de la ruta' })
  @IsOptional()
  @IsInt()
  @Min(1)
  ordenSecuencia?: number;
}

export class ActualizarMedidorDto extends PartialType(OmitType(CrearMedidorDto, ['socioId'] as const)) {
  @ApiPropertyOptional({ format: 'uuid', description: 'Reasigna el medidor a otro socio' })
  @IsOptional()
  @IsUUID()
  socioId?: string;

  @ApiPropertyOptional({ enum: EstadoMedidor })
  @IsOptional()
  @IsEnum(EstadoMedidor)
  estado?: EstadoMedidor;
}

export class FiltroMedidoresDto extends PaginacionQueryDto {
  @ApiPropertyOptional({ enum: TipoServicio })
  @IsOptional()
  @IsEnum(TipoServicio)
  tipoServicio?: TipoServicio;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  socioId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  localidadId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  rutaId?: string;

  @ApiPropertyOptional({ enum: EstadoMedidor, description: 'Por defecto, solo activos' })
  @IsOptional()
  @IsEnum(EstadoMedidor)
  estado?: EstadoMedidor;

  @ApiPropertyOptional({ description: 'Busca por número de serie o de caja' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  q?: string;
}

class SocioMedidorDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() numeroSocio: number;
  @ApiProperty() nombreCompleto: string;
}

class RefDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() nombre: string;
}

export class MedidorDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() numeroSerie: string;
  @ApiProperty({ enum: TipoServicio }) tipoServicio: TipoServicio;
  @ApiProperty({ enum: EstadoMedidor }) estado: EstadoMedidor;
  @ApiProperty({ nullable: true, type: String }) numeroCaja: string | null;
  @ApiProperty({ enum: EstadoPrecinto }) estadoPrecinto: EstadoPrecinto;
  @ApiProperty({ nullable: true, type: Number }) ordenSecuencia: number | null;
  @ApiProperty({ type: SocioMedidorDto }) socio: SocioMedidorDto;
  @ApiProperty({ nullable: true, type: RefDto }) localidad: RefDto | null;
  @ApiProperty({ nullable: true, type: RefDto }) ruta: RefDto | null;
}

export class PaginaMedidoresDto {
  @ApiProperty({ type: [MedidorDto] }) data: MedidorDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
