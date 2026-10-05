import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Localidad } from '../localidades/localidad.entity';
import { Medidor } from '../medidores/medidor.entity';

export enum CategoriaSocio {
  RESIDENCIAL = 'RESIDENCIAL',
  RURAL = 'RURAL',
  COMERCIAL = 'COMERCIAL',
}

@Entity('socios')
export class Socio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'numero_socio', type: 'int', unique: true })
  numeroSocio: number;

  @Column({ name: 'nombre_completo', type: 'varchar' })
  nombreCompleto: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  dni: string | null;

  @Column({ type: 'varchar', nullable: true })
  telefono: string | null;

  @Column({ name: 'direccion_tacural', type: 'varchar' })
  direccionTacural: string;

  @Column({ type: 'enum', enum: CategoriaSocio, default: CategoriaSocio.RESIDENCIAL })
  categoria: CategoriaSocio;

  @Column({ name: 'localidad_id', type: 'uuid', nullable: true })
  localidadId: string | null;

  @ManyToOne(() => Localidad, { nullable: true, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'localidad_id' })
  localidad: Localidad | null;

  @Column({ type: 'boolean', default: true })
  activo: boolean;

  @OneToMany(() => Medidor, (medidor) => medidor.socio)
  medidores: Medidor[];
}
