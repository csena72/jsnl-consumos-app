import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { LecturasModule } from './lecturas/lecturas.module';
import { LotesModule } from './lotes/lotes.module';
import { MedidoresModule } from './medidores/medidores.module';
import { ReclamosModule } from './reclamos/reclamos.module';
import { SociosModule } from './socios/socios.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildDataSourceOptions(process.env)),
    UsuariosModule,
    AuthModule,
    SociosModule,
    MedidoresModule,
    LotesModule,
    LecturasModule,
    ReclamosModule,
  ],
})
export class AppModule {}
