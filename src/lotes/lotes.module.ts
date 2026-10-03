import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoteSincronizacion } from './lote-sincronizacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LoteSincronizacion])],
  exports: [TypeOrmModule],
})
export class LotesModule {}
