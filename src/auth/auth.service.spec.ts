import assert from 'node:assert/strict';
import { before, describe, it } from 'node:test';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { RolUsuario, Usuario } from '../usuarios/usuario.entity';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let encontrado: Usuario | null = null;
  let emailBuscado: string | undefined;
  const repo = {
    findOne: async (opts: { where: { email: string } }): Promise<Usuario | null> => {
      emailBuscado = opts.where.email;
      return encontrado;
    },
  } as unknown as Repository<Usuario>;
  const jwt = { signAsync: async (): Promise<string> => 'token.jwt' } as unknown as JwtService;
  const service = new AuthService(repo, jwt);

  let usuario: Usuario;
  before(async () => {
    usuario = {
      id: 'u1',
      email: 'operario@tacural.com',
      nombre: 'Op',
      rol: RolUsuario.OPERARIO,
      passwordHash: await bcrypt.hash('clave-correcta', 4),
      activo: true,
    };
  });

  it('devuelve token y usuario sin passwordHash con credenciales válidas', async () => {
    encontrado = usuario;
    const res = await service.login({ email: 'Operario@Tacural.com', password: 'clave-correcta' });
    assert.equal(res.access_token, 'token.jwt');
    assert.deepEqual(res.user, {
      id: 'u1',
      email: usuario.email,
      nombre: 'Op',
      rol: RolUsuario.OPERARIO,
    });
    assert.equal(emailBuscado, 'operario@tacural.com');
  });

  it('rechaza una contraseña incorrecta', async () => {
    encontrado = usuario;
    await assert.rejects(service.login({ email: usuario.email, password: 'mala' }), UnauthorizedException);
  });

  it('rechaza un usuario dado de baja aunque la contraseña sea correcta', async () => {
    encontrado = { ...usuario, activo: false };
    await assert.rejects(
      service.login({ email: usuario.email, password: 'clave-correcta' }),
      UnauthorizedException,
    );
  });

  it('rechaza un usuario inexistente', async () => {
    encontrado = null;
    await assert.rejects(service.login({ email: 'no@existe.com', password: 'x' }), UnauthorizedException);
  });
});
