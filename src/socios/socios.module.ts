import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Socio } from './socio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Socio])],
  exports: [TypeOrmModule],
})
export class SociosModule {}
