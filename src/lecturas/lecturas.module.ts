import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { LoteSincronizacion } from '../lotes/lote-sincronizacion.entity';
import { Medidor } from '../medidores/medidor.entity';
import { LecturasController } from './lecturas.controller';
import { Lectura } from './lectura.entity';
import { LecturasService } from './lecturas.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lectura, Medidor, LoteSincronizacion]), AuthModule],
  controllers: [LecturasController],
  providers: [LecturasService],
  exports: [TypeOrmModule, LecturasService],
})
export class LecturasModule {}
