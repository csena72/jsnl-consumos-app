import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Localidad } from '../localidades/localidad.entity';
import { Ruta } from '../rutas/ruta.entity';
import { Socio } from '../socios/socio.entity';

export enum TipoServicio {
  AGUA = 'AGUA',
  ENERGIA = 'ENERGIA',
}

export enum EstadoMedidor {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

export enum EstadoPrecinto {
  INTACTO = 'INTACTO',
  VIOLADO = 'VIOLADO',
  SIN_PRECINTO = 'SIN_PRECINTO',
}

/** Cada servicio (ENERGIA / AGUA) lleva su propia numeración de cajas: la unicidad es por servicio. */
@Entity('medidores')
@Unique(['tipoServicio', 'numeroCaja'])
export class Medidor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_serie', type: 'varchar', unique: true })
  numeroSerie: string;

  @Column({ name: 'socio_id', type: 'uuid' })
  socioId: string;

  @ManyToOne(() => Socio, (socio) => socio.medidores, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'socio_id' })
  socio: Socio;

  @Column({ name: 'tipo_servicio', type: 'enum', enum: TipoServicio })
  tipoServicio: TipoServicio;

  @Column({ type: 'enum', enum: EstadoMedidor, default: EstadoMedidor.ACTIVO })
  estado: EstadoMedidor;

  @Column({ name: 'numero_caja', type: 'varchar', nullable: true })
  numeroCaja: string | null;

  @Column({ name: 'estado_precinto', type: 'enum', enum: EstadoPrecinto, default: EstadoPrecinto.INTACTO })
  estadoPrecinto: EstadoPrecinto;

  @Column({ name: 'localidad_id', type: 'uuid', nullable: true })
  localidadId: string | null;

  @ManyToOne(() => Localidad, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'localidad_id' })
  localidad: Localidad | null;

  @Column({ name: 'ruta_id', type: 'uuid', nullable: true })
  rutaId: string | null;

  @ManyToOne(() => Ruta, (ruta) => ruta.medidores, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'ruta_id' })
  ruta: Ruta | null;

  /** Posición física en el recorrido de lectura de la ruta (1 = primero). */
  @Index()
  @Column({ name: 'orden_secuencia', type: 'int', nullable: true })
  ordenSecuencia: number | null;
}
