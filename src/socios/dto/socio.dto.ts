import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { PaginacionQueryDto, aBooleano } from '../../common/paginacion';
import { CategoriaSocio } from '../socio.entity';

export class CrearSocioDto {
  @ApiProperty({ example: 1006, minimum: 1 })
  @IsInt()
  @Min(1)
  numeroSocio: number;

  @ApiProperty({ example: 'Ana Gómez' })
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  nombreCompleto: string;

  @ApiPropertyOptional({ example: '30123456', description: '7 u 8 dígitos, sin puntos' })
  @IsOptional()
  @Matches(/^\d{7,8}$/, { message: 'dni debe tener 7 u 8 dígitos' })
  dni?: string;

  @ApiPropertyOptional({ example: '3482 555123' })
  @IsOptional()
  @IsString()
  @MaxLength(30)
  telefono?: string;

  @ApiProperty({ example: 'Mitre 300' })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  direccionTacural: string;

  @ApiPropertyOptional({ enum: CategoriaSocio, default: CategoriaSocio.RESIDENCIAL })
  @IsOptional()
  @IsEnum(CategoriaSocio)
  categoria?: CategoriaSocio;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  localidadId?: string;
}

export class ActualizarSocioDto extends PartialType(CrearSocioDto) {}

export class FiltroSociosDto extends PaginacionQueryDto {
  @ApiPropertyOptional({ description: 'Busca por DNI, número de socio o nombre' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  localidadId?: string;

  @ApiPropertyOptional({ description: 'Por defecto, solo socios activos. Usar false para ver las bajas' })
  @IsOptional()
  @Transform(aBooleano)
  @IsBoolean()
  activo?: boolean;
}

class LocalidadResumenDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() nombre: string;
}

export class SocioDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() numeroSocio: number;
  @ApiProperty() nombreCompleto: string;
  @ApiProperty({ nullable: true, type: String }) dni: string | null;
  @ApiProperty({ nullable: true, type: String }) telefono: string | null;
  @ApiProperty() direccionTacural: string;
  @ApiProperty({ enum: CategoriaSocio }) categoria: CategoriaSocio;
  @ApiProperty() activo: boolean;
  @ApiProperty({ nullable: true, type: LocalidadResumenDto }) localidad: LocalidadResumenDto | null;
}

export class PaginaSociosDto {
  @ApiProperty({ type: [SocioDto] }) data: SocioDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
