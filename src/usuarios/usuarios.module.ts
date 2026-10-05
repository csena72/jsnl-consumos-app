import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Usuario } from './usuario.entity';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario]), forwardRef(() => AuthModule)],
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [TypeOrmModule],
})
export class UsuariosModule {}
