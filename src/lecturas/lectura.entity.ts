import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { LoteSincronizacion } from '../lotes/lote-sincronizacion.entity';
import { Medidor } from '../medidores/medidor.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum EstadoRevision {
  PENDIENTE = 'PENDIENTE',
  APROBADA = 'APROBADA',
  RECHAZADA = 'RECHAZADA',
}

export const decimalTransformer = {
  to: (value: number | null | undefined): number | null | undefined => value,
  from: (value: string | null): number | null => (value === null ? null : parseFloat(value)),
};

@Entity('lecturas')
export class Lectura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lote_id', type: 'uuid', nullable: true })
  loteId: string | null;

  @ManyToOne(() => LoteSincronizacion, (lote) => lote.lecturas, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'lote_id' })
  lote: LoteSincronizacion | null;

  @Column({ name: 'medidor_id', type: 'uuid' })
  medidorId: string;

  @ManyToOne(() => Medidor, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'medidor_id' })
  medidor: Medidor;

  @Column({ name: 'operario_id', type: 'uuid' })
  operarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'operario_id' })
  operario: Usuario;

  @Column({
    name: 'valor_lectura',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  valorLectura: number;

  @Column({ type: 'varchar', length: 6 })
  periodo: string;

  @Column({ name: 'fecha_captura', type: 'timestamp' })
  fechaCaptura: Date;

  @Column({
    name: 'promedio_historico',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  promedioHistorico: number | null;

  @Column({
    name: 'desvio_porcentaje',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    transformer: decimalTransformer,
  })
  desvioPorcentaje: number | null;

  @Column({ name: 'es_atipico', type: 'boolean', default: false })
  esAtipico: boolean;

  /** Solo es relevante cuando esAtipico = true: decisión manual del administrador. */
  @Column({
    name: 'estado_revision',
    type: 'enum',
    enum: EstadoRevision,
    default: EstadoRevision.PENDIENTE,
  })
  estadoRevision: EstadoRevision;

  @Column({ name: 'fotografia_url', type: 'varchar', nullable: true })
  fotografiaUrl: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;
}
