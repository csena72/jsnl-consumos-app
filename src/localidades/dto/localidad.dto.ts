import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearLocalidadDto {
  @ApiProperty({ example: 'Tacural' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ example: 'Santa Fe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  provincia: string;

  @ApiPropertyOptional({ example: '2301' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  codigoPostal?: string;
}

export class ActualizarLocalidadDto extends PartialType(CrearLocalidadDto) {}

export class LocalidadDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() nombre: string;
  @ApiProperty() provincia: string;
  @ApiProperty({ nullable: true, type: String }) codigoPostal: string | null;
}
