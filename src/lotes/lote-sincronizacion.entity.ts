import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Lectura } from '../lecturas/lectura.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum EstadoLote {
  PENDIENTE = 'PENDIENTE',
  PROCESADO = 'PROCESADO',
  CON_INCONSISTENCIAS = 'CON_INCONSISTENCIAS',
}

@Entity('lotes_sincronizacion')
export class LoteSincronizacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'operario_id', type: 'uuid' })
  operarioId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'operario_id' })
  operario: Usuario;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion: Date;

  @Column({ type: 'enum', enum: EstadoLote, default: EstadoLote.PENDIENTE })
  estado: EstadoLote;

  @OneToMany(() => Lectura, (lectura) => lectura.lote)
  lecturas: Lectura[];
}
