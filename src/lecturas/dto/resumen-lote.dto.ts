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

export class RutaMedidorDto {
  @ApiProperty({ format: 'uuid' }) medidorId: string;
  @ApiProperty() numeroSerie: string;
  @ApiProperty({ example: 'AGUA' }) tipoServicio: string;
  @ApiProperty({ format: 'uuid' }) socioId: string;
  @ApiProperty() numeroSocio: number;
  @ApiProperty() nombreCompleto: string;
  @ApiProperty() direccion: string;
  @ApiProperty({ nullable: true, type: String, description: 'Caja física del medidor' })
  numeroCaja: string | null;
  @ApiProperty({ nullable: true, type: String, format: 'uuid' }) localidadId: string | null;
  @ApiProperty({ nullable: true, type: String }) localidad: string | null;
  @ApiProperty({ nullable: true, type: String }) ruta: string | null;
  @ApiProperty({
    nullable: true,
    type: Number,
    description: 'Posición en el recorrido de la ruta; la lista llega ya ordenada por ruta y secuencia',
  })
  ordenSecuencia: number | null;
  @ApiProperty({ nullable: true, type: Number, description: 'Última lectura registrada' })
  lecturaAnterior: number | null;
  @ApiProperty({
    nullable: true,
    type: Number,
    description: 'Consumo promedio entre lecturas consecutivas; null si no hay historial suficiente',
  })
  promedioHistorico: number | null;
}
