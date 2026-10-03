import { RolUsuario } from '../usuarios/usuario.entity';

export interface JwtPayload {
  sub: string;
  email: string;
  rol: RolUsuario;
}

export interface UsuarioAutenticado {
  id: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
}
