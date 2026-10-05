import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { traducirErrorDb } from '../common/db-errors';
import { Localidad } from '../localidades/localidad.entity';
import { EstadoMedidor, Medidor } from '../medidores/medidor.entity';
import {
  ActualizarRutaDto,
  CrearRutaDto,
  FiltroRutasDto,
  ReordenarRutaDto,
  RutaDetalleDto,
  RutaDto,
} from './dto/ruta.dto';
import { Ruta } from './ruta.entity';

const MENSAJE_UNICO = 'Ya existe una ruta con ese nombre en la localidad';

@Injectable()
export class RutasService {
  constructor(@InjectRepository(Ruta) private readonly rutas: Repository<Ruta>) {}

  async listar(filtro: FiltroRutasDto): Promise<RutaDto[]> {
    const qb = this.rutas
      .createQueryBuilder('ruta')
      .innerJoinAndSelect('ruta.localidad', 'localidad')
      .orderBy('localidad.nombre', 'ASC')
      .addOrderBy('ruta.nombre', 'ASC');
    if (filtro.localidadId) qb.andWhere('ruta.localidadId = :l', { l: filtro.localidadId });
    if (filtro.activa !== undefined) qb.andWhere('ruta.activa = :a', { a: filtro.activa });
    const rutas = await qb.getMany();
    const conteos = await this.rutas.manager
      .createQueryBuilder(Medidor, 'm')
      .select('m.rutaId', 'rutaId')
      .addSelect('COUNT(*)', 'total')
      .where('m.rutaId IS NOT NULL')
      .groupBy('m.rutaId')
      .getRawMany<{ rutaId: string; total: string }>();
    const totales = new Map(conteos.map((c) => [c.rutaId, Number(c.total)]));
    return rutas.map((r) => aDto(r, totales.get(r.id) ?? 0));
  }

  async obtener(id: string): Promise<RutaDetalleDto> {
    const ruta = await this.buscar(id);
    const medidores = await this.rutas.manager.find(Medidor, {
      where: { rutaId: id },
      relations: { socio: true },
      order: { ordenSecuencia: 'ASC', numeroSerie: 'ASC' },
    });
    return {
      ...aDto(ruta, medidores.length),
      medidores: medidores.map((m, i) => ({
        id: m.id,
        ordenSecuencia: m.ordenSecuencia ?? i + 1,
        numeroSerie: m.numeroSerie,
        tipoServicio: m.tipoServicio,
        numeroCaja: m.numeroCaja,
        numeroSocio: m.socio.numeroSocio,
        nombreCompleto: m.socio.nombreCompleto,
        direccion: m.socio.direccionTacural,
      })),
    };
  }

  async crear(dto: CrearRutaDto): Promise<RutaDetalleDto> {
    if (!(await this.rutas.manager.exists(Localidad, { where: { id: dto.localidadId } }))) {
      throw new NotFoundException('Localidad no encontrada');
    }
    try {
      const ruta = await this.rutas.save(this.rutas.create(dto));
      return this.obtener(ruta.id);
    } catch (e) {
      return traducirErrorDb(e, { unico: MENSAJE_UNICO });
    }
  }

  async actualizar(id: string, dto: ActualizarRutaDto): Promise<RutaDetalleDto> {
    await this.buscar(id);
    try {
      await this.rutas.update({ id }, dto);
    } catch (e) {
      return traducirErrorDb(e, { unico: MENSAJE_UNICO });
    }
    return this.obtener(id);
  }

  /** Elimina la ruta; sus medidores quedan sin ruta (FK ON DELETE SET NULL) pero conservan su localidad. */
  async eliminar(id: string): Promise<void> {
    await this.buscar(id);
    await this.rutas.manager.update(Medidor, { rutaId: id }, { ordenSecuencia: null });
    await this.rutas.delete({ id });
  }

  /** Define la secuencia física de lectura: la posición en `medidorIds` pasa a ser `ordenSecuencia`. */
  async reordenar(id: string, dto: ReordenarRutaDto): Promise<RutaDetalleDto> {
    const ruta = await this.buscar(id);
    const medidores = dto.medidorIds.length
      ? await this.rutas.manager.find(Medidor, { where: { id: In(dto.medidorIds) } })
      : [];
    if (medidores.length !== dto.medidorIds.length) {
      throw new NotFoundException('Alguno de los medidores indicados no existe');
    }
    if (medidores.some((m) => m.estado !== EstadoMedidor.ACTIVO)) {
      throw new BadRequestException('No se pueden asignar medidores inactivos a una ruta');
    }
    if (medidores.some((m) => m.localidadId && m.localidadId !== ruta.localidadId)) {
      throw new BadRequestException('Hay medidores de otra localidad');
    }

    await this.rutas.manager.transaction(async (m) => {
      await m.update(Medidor, { rutaId: id }, { rutaId: null, ordenSecuencia: null });
      for (const [i, medidorId] of dto.medidorIds.entries()) {
        await m.update(
          Medidor,
          { id: medidorId },
          { rutaId: id, localidadId: ruta.localidadId, ordenSecuencia: i + 1 },
        );
      }
    });
    return this.obtener(id);
  }

  private async buscar(id: string): Promise<Ruta> {
    const ruta = await this.rutas.findOne({ where: { id }, relations: { localidad: true } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');
    return ruta;
  }
}

function aDto(r: Ruta, totalMedidores: number): RutaDto {
  return {
    id: r.id,
    nombre: r.nombre,
    activa: r.activa,
    localidad: { id: r.localidad.id, nombre: r.localidad.nombre },
    totalMedidores,
  };
}
