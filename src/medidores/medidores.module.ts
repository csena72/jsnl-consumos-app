import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Medidor } from './medidor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Medidor])],
  exports: [TypeOrmModule],
})
export class MedidoresModule {}
