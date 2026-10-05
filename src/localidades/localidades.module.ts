import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Localidad } from './localidad.entity';
import { LocalidadesController } from './localidades.controller';
import { LocalidadesService } from './localidades.service';

@Module({
  imports: [TypeOrmModule.forFeature([Localidad]), AuthModule],
  controllers: [LocalidadesController],
  providers: [LocalidadesService],
  exports: [TypeOrmModule],
})
export class LocalidadesModule {}
