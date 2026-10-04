import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { DataSource } from 'typeorm';
import { buildDataSourceOptions } from '../config/database.config';
import { Lectura } from '../lecturas/lectura.entity';
import { EstadoMedidor, Medidor, TipoServicio } from '../medidores/medidor.entity';
import { CategoriaSocio, Socio } from '../socios/socio.entity';
import { RolUsuario, Usuario } from '../usuarios/usuario.entity';

const PERIODOS_HISTORICOS = ['202607', '202608', '202609'];

const USUARIOS = [
  { email: 'admin@tacural.com', nombre: 'Administrador Tacural', rol: RolUsuario.ADMIN },
  { email: 'operario1@tacural.com', nombre: 'Operario Uno', rol: RolUsuario.OPERARIO },
  { email: 'operario2@tacural.com', nombre: 'Operario Dos', rol: RolUsuario.OPERARIO },
];

const SOCIOS = [
  { numeroSocio: 1001, nombreCompleto: 'María González', direccionTacural: 'San Martín 120', categoria: CategoriaSocio.RESIDENCIAL, base: 100 },
  { numeroSocio: 1002, nombreCompleto: 'Juan Pérez', direccionTacural: 'Belgrano 45', categoria: CategoriaSocio.RESIDENCIAL, base: 120 },
  { numeroSocio: 1003, nombreCompleto: 'Establecimiento La Esperanza', direccionTacural: 'Ruta 19 km 12', categoria: CategoriaSocio.RURAL, base: 300 },
  { numeroSocio: 1004, nombreCompleto: 'Almacén Don Carlos', direccionTacural: 'Mitre 300', categoria: CategoriaSocio.COMERCIAL, base: 250 },
  { numeroSocio: 1005, nombreCompleto: 'Lucía Fernández', direccionTacural: 'Sarmiento 77', categoria: CategoriaSocio.RESIDENCIAL, base: 90 },
];

async function seed(): Promise<void> {
  const ds = new DataSource(buildDataSourceOptions(process.env));
  await ds.initialize();

  const passwordEnv = process.env.SEED_PASSWORD;
  const password = passwordEnv ?? randomBytes(9).toString('base64url');
  const passwordHash = await bcrypt.hash(password, 10);

  await ds.transaction(async (m) => {
    const operarios: Usuario[] = [];
    let usuariosCreados = 0;
    for (const u of USUARIOS) {
      let usuario = await m.findOne(Usuario, { where: { email: u.email } });
      if (!usuario) {
        usuario = await m.save(m.create(Usuario, { ...u, passwordHash }));
        usuariosCreados++;
      }
      if (usuario.rol === RolUsuario.OPERARIO) operarios.push(usuario);
    }

    for (const [i, s] of SOCIOS.entries()) {
      const { base, ...datosSocio } = s;
      let socio = await m.findOne(Socio, { where: { numeroSocio: s.numeroSocio } });
      if (socio) continue;
      socio = await m.save(m.create(Socio, datosSocio));

      const medidor = await m.save(
        m.create(Medidor, {
          numeroSerie: `AGU-${s.numeroSocio}`,
          socioId: socio.id,
          tipoServicio: TipoServicio.AGUA,
          estado: EstadoMedidor.ACTIVO,
        }),
      );
      const operario = operarios[i % operarios.length];
      for (const [j, periodo] of PERIODOS_HISTORICOS.entries()) {
        await m.save(
          m.create(Lectura, {
            medidorId: medidor.id,
            operarioId: operario.id,
            valorLectura: base + (j - 1) * 5,
            periodo,
            fechaCaptura: new Date(`${periodo.slice(0, 4)}-${periodo.slice(4)}-15T12:00:00Z`),
            promedioHistorico: null,
            desvioPorcentaje: null,
            esAtipico: false,
            fotografiaUrl: null,
            observaciones: 'Lectura histórica (seed)',
          }),
        );
      }
    }
    console.log(`Seed completo. Usuarios nuevos: ${usuariosCreados}`);
  });

  if (!passwordEnv) {
    console.log(`Contraseña generada para los usuarios nuevos: ${password}`);
  }
  await ds.destroy();
}

seed().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
