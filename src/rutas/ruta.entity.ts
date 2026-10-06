import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { Localidad } from '../localidades/localidad.entity';
import { Medidor } from '../medidores/medidor.entity';
import { Usuario } from '../usuarios/usuario.entity';

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

  /** Operario (lecturista) responsable de la ruta; solo él la descarga en la app móvil. */
  @Index('IDX_rutas_operario')
  @Column({ name: 'operario_id', type: 'uuid', nullable: true })
  operarioId: string | null;

  @ManyToOne(() => Usuario, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'operario_id', foreignKeyConstraintName: 'FK_rutas_operario' })
  operario: Usuario | null;

  @OneToMany(() => Medidor, (medidor) => medidor.ruta)
  medidores: Medidor[];
}
