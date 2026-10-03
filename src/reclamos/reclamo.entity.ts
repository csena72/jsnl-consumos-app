import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lectura } from '../lecturas/lectura.entity';
import { Socio } from '../socios/socio.entity';

export enum EstadoReclamo {
  PENDIENTE = 'PENDIENTE',
  EN_REVISION = 'EN_REVISION',
  RESUELTO = 'RESUELTO',
}

@Entity('reclamos')
export class Reclamo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'socio_id', type: 'uuid' })
  socioId: string;

  @ManyToOne(() => Socio, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'socio_id' })
  socio: Socio;

  @Column({ name: 'lectura_id', type: 'uuid', nullable: true })
  lecturaId: string | null;

  @ManyToOne(() => Lectura, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'lectura_id' })
  lectura: Lectura | null;

  @Column({ type: 'varchar' })
  motivo: string;

  @Column({ type: 'enum', enum: EstadoReclamo, default: EstadoReclamo.PENDIENTE })
  estado: EstadoReclamo;

  @Column({ name: 'foto_evidencia_url', type: 'varchar', nullable: true })
  fotoEvidenciaUrl: string | null;

  @CreateDateColumn({ name: 'fecha_ingreso', type: 'timestamp' })
  fechaIngreso: Date;
}
