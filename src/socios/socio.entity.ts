import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @Column({ name: 'direccion_tacural', type: 'varchar' })
  direccionTacural: string;

  @Column({ type: 'enum', enum: CategoriaSocio, default: CategoriaSocio.RESIDENCIAL })
  categoria: CategoriaSocio;

  @OneToMany(() => Medidor, (medidor) => medidor.socio)
  medidores: Medidor[];
}
