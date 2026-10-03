import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reclamo } from './reclamo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reclamo])],
  exports: [TypeOrmModule],
})
export class ReclamosModule {}
