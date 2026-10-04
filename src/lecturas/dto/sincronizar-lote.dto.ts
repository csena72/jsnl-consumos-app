import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

export class LecturaEntranteDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  medidorId: string;

  @ApiProperty({ example: 1250.5, minimum: 0, description: 'Hasta 2 decimales' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorLectura: number;

  @ApiProperty({ example: '202610', description: 'Formato AAAAMM' })
  @Matches(/^\d{4}(0[1-9]|1[0-2])$/, { message: 'periodo debe tener formato AAAAMM' })
  periodo: string;

  @ApiProperty({ type: String, format: 'date-time', example: '2026-10-03T10:15:00Z' })
  @Type(() => Date)
  @IsDate()
  fechaCaptura: Date;

  @ApiPropertyOptional({ example: 'Medidor limpio' })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class SincronizarLoteDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Por defecto, el usuario autenticado. Solo un ADMIN puede indicar otro operario.',
  })
  @IsOptional()
  @IsUUID()
  operarioId?: string;

  @ApiProperty({ type: [LecturaEntranteDto], minItems: 1, maxItems: 500 })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => LecturaEntranteDto)
  lecturas: LecturaEntranteDto[];
}
