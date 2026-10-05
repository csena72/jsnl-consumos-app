import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Medidor } from './medidor.entity';
import { MedidoresController } from './medidores.controller';
import { MedidoresService } from './medidores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Medidor]), AuthModule],
  controllers: [MedidoresController],
  providers: [MedidoresService],
  exports: [TypeOrmModule, MedidoresService],
})
export class MedidoresModule {}
