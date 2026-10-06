import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UPLOADS_DIR } from './common/uploads';
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
    // Fotos guardadas en disco: públicas en /uploads, fuera del prefijo /api.
    ServeStaticModule.forRoot({
      rootPath: UPLOADS_DIR,
      serveRoot: '/uploads',
      serveStaticOptions: { index: false, fallthrough: false, maxAge: '30d', immutable: true },
    }),
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
