import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Ruta } from './ruta.entity';
import { RutasController } from './rutas.controller';
import { RutasService } from './rutas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Ruta]), AuthModule],
  controllers: [RutasController],
  providers: [RutasService],
  exports: [TypeOrmModule],
})
export class RutasModule {}
