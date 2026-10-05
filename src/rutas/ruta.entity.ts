import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Localidad } from '../localidades/localidad.entity';
import { Medidor } from '../medidores/medidor.entity';

@Entity('rutas')
@Unique(['localidadId', 'nombre'])
export class Ruta {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ name: 'localidad_id', type: 'uuid' })
  localidadId: string;

  @ManyToOne(() => Localidad, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'localidad_id' })
  localidad: Localidad;

  @Column({ type: 'boolean', default: true })
  activa: boolean;

  @OneToMany(() => Medidor, (medidor) => medidor.ruta)
  medidores: Medidor[];
}
