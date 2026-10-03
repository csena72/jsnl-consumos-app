import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Socio } from '../socios/socio.entity';

export enum TipoServicio {
  AGUA = 'AGUA',
  ENERGIA = 'ENERGIA',
}

export enum EstadoMedidor {
  ACTIVO = 'ACTIVO',
  INACTIVO = 'INACTIVO',
}

@Entity('medidores')
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
}
