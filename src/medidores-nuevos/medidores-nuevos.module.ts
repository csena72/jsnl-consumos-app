import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { MedidoresModule } from '../medidores/medidores.module';
import { MedidorPendienteAlta } from './medidor-pendiente-alta.entity';
import { MedidoresNuevosController } from './medidores-nuevos.controller';
import { MedidoresNuevosService } from './medidores-nuevos.service';

@Module({
  imports: [TypeOrmModule.forFeature([MedidorPendienteAlta]), AuthModule, MedidoresModule],
  controllers: [MedidoresNuevosController],
  providers: [MedidoresNuevosService],
})
export class MedidoresNuevosModule {}
