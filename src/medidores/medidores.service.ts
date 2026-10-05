import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { traducirErrorDb } from '../common/db-errors';
import { Localidad } from '../localidades/localidad.entity';
import { Ruta } from '../rutas/ruta.entity';
import { Socio } from '../socios/socio.entity';
import {
  ActualizarMedidorDto,
  CrearMedidorDto,
  FiltroMedidoresDto,
  MedidorDto,
  PaginaMedidoresDto,
} from './dto/medidor.dto';
import { EstadoMedidor, EstadoPrecinto, Medidor } from './medidor.entity';

const MENSAJES_DB = {
  unico: 'Ya existe un medidor con ese número de serie, o esa caja ya está ocupada para el servicio',
  referencia: 'El medidor tiene lecturas registradas y no puede eliminarse; dalo de baja',
};

@Injectable()
export class MedidoresService {
  constructor(@InjectRepository(Medidor) private readonly medidores: Repository<Medidor>) {}

  async listar(filtro: FiltroMedidoresDto): Promise<PaginaMedidoresDto> {
    const qb = this.medidores
      .createQueryBuilder('medidor')
      .leftJoinAndSelect('medidor.socio', 'socio')
      .leftJoinAndSelect('medidor.localidad', 'localidad')
      .leftJoinAndSelect('medidor.ruta', 'ruta')
      .where('medidor.estado = :estado', { estado: filtro.estado ?? EstadoMedidor.ACTIVO })
      .orderBy('socio.numeroSocio', 'ASC')
      .addOrderBy('medidor.numeroSerie', 'ASC')
      .skip((filtro.page - 1) * filtro.limit)
      .take(filtro.limit);
    if (filtro.tipoServicio) qb.andWhere('medidor.tipoServicio = :t', { t: filtro.tipoServicio });
    if (filtro.socioId) qb.andWhere('medidor.socioId = :s', { s: filtro.socioId });
    if (filtro.localidadId) qb.andWhere('medidor.localidadId = :l', { l: filtro.localidadId });
    if (filtro.rutaId) qb.andWhere('medidor.rutaId = :r', { r: filtro.rutaId });
    if (filtro.q) {
      qb.andWhere('(medidor.numeroSerie ILIKE :q OR medidor.numeroCaja ILIKE :q)', { q: `%${filtro.q}%` });
    }
    const [medidores, total] = await qb.getManyAndCount();
    return { data: medidores.map(aDto), total, page: filtro.page, limit: filtro.limit };
  }

  async obtener(id: string): Promise<MedidorDto> {
    return aDto(await this.buscar(id));
  }

  /** Crea un medidor; acepta un EntityManager para participar de una transacción externa. */
  async crear(dto: CrearMedidorDto, manager: EntityManager = this.medidores.manager): Promise<MedidorDto> {
    const socio = await manager.findOne(Socio, { where: { id: dto.socioId } });
    if (!socio) throw new NotFoundException('Socio no encontrado');
    if (!socio.activo) throw new BadRequestException('El socio está dado de baja');

    const { localidadId, rutaId, ordenSecuencia } = await this.resolverUbicacion(manager, dto);
    try {
      const medidor = await manager.save(
        manager.create(Medidor, {
          numeroSerie: dto.numeroSerie,
          socioId: dto.socioId,
          tipoServicio: dto.tipoServicio,
          numeroCaja: dto.numeroCaja ?? null,
          estadoPrecinto: dto.estadoPrecinto ?? EstadoPrecinto.INTACTO,
          localidadId,
          rutaId,
          ordenSecuencia,
        }),
      );
      return aDto(await this.buscar(medidor.id, manager));
    } catch (e) {
      return traducirErrorDb(e, MENSAJES_DB);
    }
  }

  async actualizar(id: string, dto: ActualizarMedidorDto): Promise<MedidorDto> {
    const actual = await this.buscar(id);
    if (dto.socioId && dto.socioId !== actual.socioId) {
      const socio = await this.medidores.manager.findOne(Socio, { where: { id: dto.socioId } });
      if (!socio) throw new NotFoundException('Socio no encontrado');
      if (!socio.activo) throw new BadRequestException('El socio está dado de baja');
    }

    const cambios: Partial<Medidor> = {};
    const { rutaId, localidadId, ordenSecuencia, ...resto } = dto;
    Object.assign(cambios, resto);
    if (rutaId !== undefined || localidadId !== undefined || ordenSecuencia !== undefined) {
      const cambiaRuta = rutaId !== undefined && rutaId !== actual.rutaId;
      const ubicacion = await this.resolverUbicacion(this.medidores.manager, {
        rutaId: rutaId ?? actual.rutaId ?? undefined,
        // Al cambiar de ruta, la localidad se toma de la nueva ruta salvo que se indique otra.
        localidadId: localidadId ?? (cambiaRuta ? undefined : (actual.localidadId ?? undefined)),
        // Al cambiar de ruta sin indicar orden, queda al final de la nueva ruta.
        ordenSecuencia: ordenSecuencia ?? (cambiaRuta ? undefined : (actual.ordenSecuencia ?? undefined)),
      });
      Object.assign(cambios, ubicacion);
    }
    try {
      await this.medidores.update({ id }, cambios);
    } catch (e) {
      return traducirErrorDb(e, MENSAJES_DB);
    }
    return this.obtener(id);
  }

  /** Baja lógica: el medidor deja de aparecer en la ruta de lectura pero conserva su historial. */
  async darDeBaja(id: string): Promise<void> {
    await this.buscar(id);
    await this.medidores.update({ id }, { estado: EstadoMedidor.INACTIVO });
  }

  private async buscar(id: string, manager: EntityManager = this.medidores.manager): Promise<Medidor> {
    const medidor = await manager.findOne(Medidor, {
      where: { id },
      relations: { socio: true, localidad: true, ruta: true },
    });
    if (!medidor) throw new NotFoundException('Medidor no encontrado');
    return medidor;
  }

  /** Valida localidad/ruta y calcula la posición en la ruta (al final si no se indica). */
  private async resolverUbicacion(
    manager: EntityManager,
    dto: { localidadId?: string; rutaId?: string; ordenSecuencia?: number },
  ): Promise<{ localidadId: string | null; rutaId: string | null; ordenSecuencia: number | null }> {
    let localidadId = dto.localidadId ?? null;
    if (localidadId && !(await manager.exists(Localidad, { where: { id: localidadId } }))) {
      throw new NotFoundException('Localidad no encontrada');
    }
    if (!dto.rutaId) {
      return { localidadId, rutaId: null, ordenSecuencia: null };
    }
    const ruta = await manager.findOne(Ruta, { where: { id: dto.rutaId } });
    if (!ruta) throw new NotFoundException('Ruta no encontrada');
    if (localidadId && localidadId !== ruta.localidadId) {
      throw new BadRequestException('La ruta pertenece a otra localidad');
    }
    localidadId = ruta.localidadId;

    let ordenSecuencia = dto.ordenSecuencia;
    if (ordenSecuencia === undefined) {
      const { max } = (await manager
        .createQueryBuilder(Medidor, 'm')
        .select('MAX(m.ordenSecuencia)', 'max')
        .where('m.rutaId = :rutaId', { rutaId: ruta.id })
        .getRawOne<{ max: number | null }>()) ?? { max: null };
      ordenSecuencia = (max ?? 0) + 1;
    }
    return { localidadId, rutaId: ruta.id, ordenSecuencia };
  }
}

function aDto(m: Medidor): MedidorDto {
  return {
    id: m.id,
    numeroSerie: m.numeroSerie,
    tipoServicio: m.tipoServicio,
    estado: m.estado,
    numeroCaja: m.numeroCaja,
    estadoPrecinto: m.estadoPrecinto,
    ordenSecuencia: m.ordenSecuencia,
    socio: { id: m.socio.id, numeroSocio: m.socio.numeroSocio, nombreCompleto: m.socio.nombreCompleto },
    localidad: m.localidad && { id: m.localidad.id, nombre: m.localidad.nombre },
    ruta: m.ruta && { id: m.ruta.id, nombre: m.ruta.nombre },
  };
}
