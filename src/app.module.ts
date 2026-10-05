import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { buildDataSourceOptions } from './config/database.config';
import { AuthModule } from './auth/auth.module';
import { LecturasModule } from './lecturas/lecturas.module';
import { LotesModule } from './lotes/lotes.module';
import { LocalidadesModule } from './localidades/localidades.module';
import { MedidoresModule } from './medidores/medidores.module';
import { MedidoresNuevosModule } from './medidores-nuevos/medidores-nuevos.module';
import { ReclamosModule } from './reclamos/reclamos.module';
import { RutasModule } from './rutas/rutas.module';
import { SociosModule } from './socios/socios.module';
import { UsuariosModule } from './usuarios/usuarios.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildDataSourceOptions(process.env)),
    UsuariosModule,
    AuthModule,
    SociosModule,
    LocalidadesModule,
    RutasModule,
    MedidoresModule,
    MedidoresNuevosModule,
    LotesModule,
    LecturasModule,
    ReclamosModule,
  ],
})
export class AppModule {}
