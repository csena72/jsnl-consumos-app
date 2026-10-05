import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { Socio } from './socio.entity';
import { SociosController } from './socios.controller';
import { SociosService } from './socios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Socio]), AuthModule],
  controllers: [SociosController],
  providers: [SociosService],
  exports: [TypeOrmModule],
})
export class SociosModule {}
