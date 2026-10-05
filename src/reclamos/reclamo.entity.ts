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
import { Socio } from '../socios/socio.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum EstadoReclamo {
  PENDIENTE = 'PENDIENTE',
  EN_PROCESO = 'EN_PROCESO',
  RESUELTO = 'RESUELTO',
}

export enum TipoReclamo {
  LECTURA_ERRONEA = 'LECTURA_ERRONEA',
  FACTURACION = 'FACTURACION',
  MEDIDOR_DANADO = 'MEDIDOR_DANADO',
  FALTA_SERVICIO = 'FALTA_SERVICIO',
  OTRO = 'OTRO',
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

  @Column({ name: 'tipo_reclamo', type: 'enum', enum: TipoReclamo, default: TipoReclamo.OTRO })
  tipoReclamo: TipoReclamo;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'enum', enum: EstadoReclamo, default: EstadoReclamo.PENDIENTE })
  estado: EstadoReclamo;

  @Column({ name: 'foto_url', type: 'varchar', nullable: true })
  fotoUrl: string | null;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion: Date;

  @OneToMany(() => ReclamoHistorial, (h) => h.reclamo)
  historial: ReclamoHistorial[];
}

@Entity('reclamos_historial')
export class ReclamoHistorial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'reclamo_id', type: 'uuid' })
  reclamoId: string;

  @ManyToOne(() => Reclamo, (r) => r.historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reclamo_id' })
  reclamo: Reclamo;

  @Column({ name: 'estado_anterior', type: 'enum', enum: EstadoReclamo, nullable: true })
  estadoAnterior: EstadoReclamo | null;

  @Column({ name: 'estado_nuevo', type: 'enum', enum: EstadoReclamo })
  estadoNuevo: EstadoReclamo;

  @Column({ type: 'text', nullable: true })
  comentario: string | null;

  @Column({ name: 'usuario_id', type: 'uuid', nullable: true })
  usuarioId: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null;

  @CreateDateColumn({ type: 'timestamp' })
  fecha: Date;
}
