import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Localidad } from '../localidades/localidad.entity';
import { EstadoPrecinto, Medidor, TipoServicio } from '../medidores/medidor.entity';
import { Usuario } from '../usuarios/usuario.entity';

export enum EstadoPendienteAlta {
  PENDIENTE = 'PENDIENTE',
  APROBADO = 'APROBADO',
  RECHAZADO = 'RECHAZADO',
}

/** Medidor hallado en campo por un operario, a la espera de auditoría y vinculación a un socio. */
@Entity('medidores_pendientes_alta')
export class MedidorPendienteAlta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_serie', type: 'varchar' })
  numeroSerie: string;

  @Column({ name: 'tipo_servicio', type: 'enum', enum: TipoServicio })
  tipoServicio: TipoServicio;

  @Column({ name: 'numero_caja', type: 'varchar', nullable: true })
  numeroCaja: string | null;

  @Column({ name: 'estado_precinto', type: 'enum', enum: EstadoPrecinto, default: EstadoPrecinto.INTACTO })
  estadoPrecinto: EstadoPrecinto;

  @Column({ name: 'localidad_id', type: 'uuid', nullable: true })
  localidadId: string | null;

  @ManyToOne(() => Localidad, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'localidad_id' })
  localidad: Localidad | null;

  @Column({ name: 'direccion_referencia', type: 'varchar', nullable: true })
  direccionReferencia: string | null;

  @Column({ type: 'text', nullable: true })
  observaciones: string | null;

  @Column({ name: 'foto_url', type: 'varchar', nullable: true })
  fotoUrl: string | null;

  @Column({ type: 'enum', enum: EstadoPendienteAlta, default: EstadoPendienteAlta.PENDIENTE })
  estado: EstadoPendienteAlta;

  @Column({ name: 'reportado_por_id', type: 'uuid' })
  reportadoPorId: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'reportado_por_id' })
  reportadoPor: Usuario;

  @CreateDateColumn({ name: 'fecha_creacion', type: 'timestamp' })
  fechaCreacion: Date;

  @Column({ name: 'revisado_por_id', type: 'uuid', nullable: true })
  revisadoPorId: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'revisado_por_id' })
  revisadoPor: Usuario | null;

  @Column({ name: 'fecha_revision', type: 'timestamp', nullable: true })
  fechaRevision: Date | null;

  @Column({ name: 'motivo_rechazo', type: 'varchar', nullable: true })
  motivoRechazo: string | null;

  @Column({ name: 'medidor_id', type: 'uuid', nullable: true })
  medidorId: string | null;

  @ManyToOne(() => Medidor, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'medidor_id' })
  medidor: Medidor | null;
}
