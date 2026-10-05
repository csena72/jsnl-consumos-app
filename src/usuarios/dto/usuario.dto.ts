import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { aBooleano } from '../../common/paginacion';
import { RolUsuario } from '../usuario.entity';

export class CrearUsuarioDto {
  @ApiProperty({ example: 'operario3@tacural.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Operario Tres' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre: string;

  @ApiProperty({ minLength: 8, description: 'Se guarda hasheada con bcrypt' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password: string;

  @ApiProperty({ enum: RolUsuario })
  @IsEnum(RolUsuario)
  rol: RolUsuario;
}

export class ActualizarUsuarioDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  nombre?: string;

  @ApiPropertyOptional({ minLength: 8, description: 'Nueva contraseña; si se omite no cambia' })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password?: string;

  @ApiPropertyOptional({ enum: RolUsuario })
  @IsOptional()
  @IsEnum(RolUsuario)
  rol?: RolUsuario;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

export class FiltroUsuariosDto {
  @ApiPropertyOptional({ description: 'Por defecto, todos (activos e inactivos)' })
  @IsOptional()
  @Transform(aBooleano)
  @IsBoolean()
  activo?: boolean;
}

export class UsuarioDto {
  @ApiProperty({ format: 'uuid' }) id: string;
  @ApiProperty() email: string;
  @ApiProperty() nombre: string;
  @ApiProperty({ enum: RolUsuario }) rol: RolUsuario;
  @ApiProperty() activo: boolean;
}
