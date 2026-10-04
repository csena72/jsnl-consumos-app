import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, UsuarioAutenticado } from './jwt-payload.interface';

export interface LoginResponse {
  access_token: string;
  user: UsuarioAutenticado;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario) private readonly usuarios: Repository<Usuario>,
    private readonly jwt: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<LoginResponse> {
    const usuario = await this.usuarios.findOne({ where: { email: dto.email.toLowerCase() } });
    const passwordValida = usuario
      ? await bcrypt.compare(dto.password, usuario.passwordHash)
      : false;
    if (!usuario || !passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = { sub: usuario.id, email: usuario.email, rol: usuario.rol };
    return {
      access_token: await this.jwt.signAsync(payload),
      user: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol,
      },
    };
  }
}
