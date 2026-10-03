import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Reclamo } from './reclamo.entity';
import { ReclamosController } from './reclamos.controller';
import { ReclamosService } from './reclamos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Reclamo]), AuthModule],
  controllers: [ReclamosController],
  providers: [ReclamosService],
  exports: [TypeOrmModule],
})
export class ReclamosModule {}
