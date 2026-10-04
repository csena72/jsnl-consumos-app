import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RolUsuario } from '../../usuarios/usuario.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UsuarioAutenticado } from '../jwt-payload.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requeridos = this.reflector.getAllAndOverride<RolUsuario[] | undefined>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requeridos || requeridos.length === 0) {
      return true;
    }
    const { user } = context
      .switchToHttp()
      .getRequest<Request & { user?: UsuarioAutenticado }>();
    return !!user && requeridos.includes(user.rol);
  }
}
