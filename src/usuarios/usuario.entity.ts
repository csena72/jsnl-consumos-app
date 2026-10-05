import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum RolUsuario {
  ADMIN = 'ADMIN',
  OPERARIO = 'OPERARIO',
}

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar' })
  passwordHash: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'enum', enum: RolUsuario, default: RolUsuario.OPERARIO })
  rol: RolUsuario;

  @Column({ type: 'boolean', default: true })
  activo: boolean;
}
