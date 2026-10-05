import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import { traducirErrorDb } from '../common/db-errors';
import {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  FiltroUsuariosDto,
  UsuarioDto,
} from './dto/usuario.dto';
import { Usuario } from './usuario.entity';

const BCRYPT_ROUNDS = 10;
const MENSAJE_UNICO = 'Ya existe un usuario con ese email';

@Injectable()
export class UsuariosService {
  constructor(@InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>) {}

  async listar(filtro: FiltroUsuariosDto): Promise<UsuarioDto[]> {
    const usuarios = await this.usuarios.find({
      where: filtro.activo === undefined ? {} : { activo: filtro.activo },
      order: { nombre: 'ASC' },
    });
    return usuarios.map(aDto);
  }

  async obtener(id: string): Promise<UsuarioDto> {
    return aDto(await this.buscar(id));
  }

  async crear(dto: CrearUsuarioDto): Promise<UsuarioDto> {
    try {
      const usuario = await this.usuarios.save(
        this.usuarios.create({
          email: dto.email.toLowerCase(),
          nombre: dto.nombre,
          rol: dto.rol,
          passwordHash: await bcrypt.hash(dto.password, BCRYPT_ROUNDS),
        }),
      );
      return aDto(usuario);
    } catch (e) {
      return traducirErrorDb(e, { unico: MENSAJE_UNICO });
    }
  }

  async actualizar(id: string, dto: ActualizarUsuarioDto, actual: UsuarioAutenticado): Promise<UsuarioDto> {
    const usuario = await this.buscar(id);
    if (id === actual.id && (dto.activo === false || (dto.rol && dto.rol !== usuario.rol))) {
      throw new BadRequestException('No podés desactivarte ni cambiar tu propio rol');
    }
    const { password, email, ...resto } = dto;
    Object.assign(usuario, resto);
    if (email) usuario.email = email.toLowerCase();
    if (password) usuario.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    try {
      await this.usuarios.save(usuario);
    } catch (e) {
      return traducirErrorDb(e, { unico: MENSAJE_UNICO });
    }
    return this.obtener(id);
  }

  /** Baja lógica: el usuario ya no puede iniciar sesión pero se conservan sus lecturas y lotes. */
  async darDeBaja(id: string, actual: UsuarioAutenticado): Promise<void> {
    if (id === actual.id) throw new BadRequestException('No podés darte de baja a vos mismo');
    await this.buscar(id);
    await this.usuarios.update({ id }, { activo: false });
  }

  private async buscar(id: string): Promise<Usuario> {
    const usuario = await this.usuarios.findOne({ where: { id } });
    if (!usuario) throw new NotFoundException('Usuario no encontrado');
    return usuario;
  }
}

function aDto(u: Usuario): UsuarioDto {
  return { id: u.id, email: u.email, nombre: u.nombre, rol: u.rol, activo: u.activo };
}
