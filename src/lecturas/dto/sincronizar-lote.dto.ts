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
  @IsUUID()
  medidorId: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  valorLectura: number;

  @Matches(/^\d{4}(0[1-9]|1[0-2])$/, { message: 'periodo debe tener formato AAAAMM' })
  periodo: string;

  @Type(() => Date)
  @IsDate()
  fechaCaptura: Date;

  @IsOptional()
  @IsString()
  observaciones?: string;
}

export class SincronizarLoteDto {
  @IsOptional()
  @IsUUID()
  operarioId?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @ValidateNested({ each: true })
  @Type(() => LecturaEntranteDto)
  lecturas: LecturaEntranteDto[];
}
