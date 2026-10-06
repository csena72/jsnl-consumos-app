import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { ArrayUnique, IsArray, IsBoolean, IsOptional, IsString, IsUUID, MaxLength, MinLength, ValidateIf } from 'class-validator';
import { aBooleano } from '../../common/paginacion';
import { RutaMedidorDto } from '../../lecturas/dto/resumen-lote.dto';
import { TipoServicio } from '../../medidores/medidor.entity';

export class CrearRutaDto {
  @ApiProperty({ example: 'Zona Norte' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  localidadId: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}

export class ActualizarRutaDto extends PartialType(OmitType(CrearRutaDto, ['localidadId'] as const)) {}

export class FiltroRutasDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  localidadId?: string;

  @ApiPropertyOptional({ description: 'Filtra por rutas activas / inactivas. Por defecto, todas' })
  @IsOptional()
  @Transform(aBooleano)
  @IsBoolean()
  activa?: boolean;
}

export class ReordenarRutaDto {
  @ApiProperty({
    type: [String],
    format: 'uuid',
    description:
      'Lista completa y ordenada de los medidores de la ruta (el primero es la posición 1). ' +
      'Los medidores nuevos se incorporan a la ruta y los ausentes se quitan de ella.',
  })
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  medidorIds: string[];
}

export class AsignarRutaDto {
  @ApiProperty({
    format: 'uuid',
    nullable: true,
    type: String,
    description: 'Operario responsable de la ruta; null la deja sin asignar',
  })
  @ValidateIf((o: AsignarRutaDto) => o.operarioId !== null)
  @IsUUID()
  operarioId: string | null;
}

class RefDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() nombre: string;
}

export class RutaDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() nombre: string;
  @ApiProperty() activa: boolean;
  @ApiProperty({ type: RefDto }) localidad: RefDto;
  @ApiProperty({ type: RefDto, nullable: true, description: 'Operario asignado' }) operario: RefDto | null;
  @ApiProperty() totalMedidores: number;
}

export class RutaMedidorOrdenadoDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() ordenSecuencia: number;
  @ApiProperty() numeroSerie: string;
  @ApiProperty({ enum: TipoServicio }) tipoServicio: TipoServicio;
  @ApiProperty({ nullable: true, type: String }) numeroCaja: string | null;
  @ApiProperty() numeroSocio: number;
  @ApiProperty() nombreCompleto: string;
  @ApiProperty() direccion: string;
}

export class RutaDetalleDto extends RutaDto {
  @ApiProperty({ type: [RutaMedidorOrdenadoDto], description: 'Ordenados por ordenSecuencia' })
  medidores: RutaMedidorOrdenadoDto[];
}

export class RutaAsignadaDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() nombre: string;
  @ApiProperty({ type: RefDto }) localidad: RefDto;
  @ApiProperty({
    type: [RutaMedidorDto],
    description: 'Medidores activos de la ruta con su historial, ordenados por ordenSecuencia ASC',
  })
  medidores: RutaMedidorDto[];
}
