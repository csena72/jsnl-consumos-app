import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Reclamo, ReclamoHistorial } from './reclamo.entity';
import { ReclamosController } from './reclamos.controller';
import { ReclamosService } from './reclamos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reclamo, ReclamoHistorial]), AuthModule],
  controllers: [ReclamosController],
  providers: [ReclamosService],
  exports: [TypeOrmModule],
})
export class ReclamosModule {}
