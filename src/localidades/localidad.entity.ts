import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('localidades')
export class Localidad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  nombre: string;

  @Column({ type: 'varchar' })
  provincia: string;

  @Column({ name: 'codigo_postal', type: 'varchar', nullable: true })
  codigoPostal: string | null;
}
