import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolUsuario } from '../../usuarios/usuario.entity';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

class SoloAdmin {
  @Roles(RolUsuario.ADMIN)
  metodo(): void {}

  sinRoles(): void {}
}

function contexto(rol: RolUsuario | undefined, handler: () => void): ExecutionContext {
  return {
    getHandler: () => handler,
    getClass: () => SoloAdmin,
    switchToHttp: () => ({ getRequest: () => ({ user: rol ? { rol } : undefined }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  const guard = new RolesGuard(new Reflector());
  const proto = SoloAdmin.prototype;

  it('permite al rol requerido', () => {
    assert.equal(guard.canActivate(contexto(RolUsuario.ADMIN, proto.metodo)), true);
  });

  it('rechaza a un rol no permitido', () => {
    assert.equal(guard.canActivate(contexto(RolUsuario.OPERARIO, proto.metodo)), false);
  });

  it('rechaza si no hay usuario', () => {
    assert.equal(guard.canActivate(contexto(undefined, proto.metodo)), false);
  });

  it('permite si el handler no declara roles', () => {
    assert.equal(guard.canActivate(contexto(RolUsuario.OPERARIO, proto.sinRoles)), true);
  });
});
