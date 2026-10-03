import { DataSourceOptions } from 'typeorm';
import { LoteSincronizacion } from '../lotes/lote-sincronizacion.entity';
import { Lectura } from '../lecturas/lectura.entity';
import { Medidor } from '../medidores/medidor.entity';
import { Reclamo } from '../reclamos/reclamo.entity';
import { Socio } from '../socios/socio.entity';
import { Usuario } from '../usuarios/usuario.entity';

export const entities = [Usuario, Socio, Medidor, LoteSincronizacion, Lectura, Reclamo];

export function buildDataSourceOptions(env: NodeJS.ProcessEnv): DataSourceOptions {
  const url = env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL no está definida. Revisá tu archivo .env');
  }
  const isProduction = env.NODE_ENV === 'production';
  return {
    type: 'postgres',
    url,
    entities,
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: false,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
  };
}
