import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lectura } from './lectura.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lectura])],
  exports: [TypeOrmModule],
})
export class LecturasModule {}
