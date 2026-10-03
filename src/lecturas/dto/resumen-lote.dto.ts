import { ApiProperty } from '@nestjs/swagger';
import { EstadoLote } from '../../lotes/lote-sincronizacion.entity';

export class LecturaProcesadaDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty({ format: 'uuid' }) medidorId: string;
  @ApiProperty({ example: '202610' }) periodo: string;
  @ApiProperty() valorLectura: number;
  @ApiProperty({ nullable: true, type: Number }) promedioHistorico: number | null;
  @ApiProperty({ nullable: true, type: Number }) desvioPorcentaje: number | null;
  @ApiProperty() esAtipico: boolean;
}

export class LecturaRechazadaDto {
  @ApiProperty({ format: 'uuid' }) medidorId: string;
  @ApiProperty({ example: '202610' }) periodo: string;
  @ApiProperty({ example: 'Medidor inactivo' }) motivo: string;
}

export class ResumenLoteDto {
  @ApiProperty({ format: 'uuid' }) loteId: string;
  @ApiProperty({ enum: EstadoLote }) estado: EstadoLote;
  @ApiProperty() totalRecibidas: number;
  @ApiProperty() totalProcesadas: number;
  @ApiProperty() totalAtipicas: number;
  @ApiProperty({ type: [LecturaProcesadaDto] }) procesadas: LecturaProcesadaDto[];
  @ApiProperty({ type: [LecturaProcesadaDto] }) alertasAtipicas: LecturaProcesadaDto[];
  @ApiProperty({ type: [LecturaRechazadaDto] }) rechazadas: LecturaRechazadaDto[];
}
