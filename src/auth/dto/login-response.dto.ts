import { ApiProperty } from '@nestjs/swagger';
import { RolUsuario } from '../../usuarios/usuario.entity';

export class UsuarioAutenticadoDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'admin@tacural.com' })
  email: string;

  @ApiProperty({ example: 'Administrador' })
  nombre: string;

  @ApiProperty({ enum: RolUsuario })
  rol: RolUsuario;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT para el header Authorization: Bearer' })
  access_token: string;

  @ApiProperty({ type: UsuarioAutenticadoDto })
  user: UsuarioAutenticadoDto;
}
