import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { traducirErrorDb } from '../common/db-errors';
import { EstadoMedidor, Medidor } from '../medidores/medidor.entity';
import { Localidad } from '../localidades/localidad.entity';
import { ActualizarSocioDto, CrearSocioDto, FiltroSociosDto, PaginaSociosDto, SocioDto } from './dto/socio.dto';
import { Socio } from './socio.entity';

const MENSAJE_UNICO = 'Ya existe un socio con ese número de socio o DNI';

@Injectable()
export class SociosService {
  constructor(@InjectRepository(Socio) private readonly socios: Repository<Socio>) {}

  async listar(filtro: FiltroSociosDto): Promise<PaginaSociosDto> {
    const qb = this.socios
      .createQueryBuilder('socio')
      .leftJoinAndSelect('socio.localidad', 'localidad')
      .where('socio.activo = :activo', { activo: filtro.activo ?? true })
      .orderBy('socio.numeroSocio', 'ASC')
      .skip((filtro.page - 1) * filtro.limit)
      .take(filtro.limit);
    if (filtro.localidadId) {
      qb.andWhere('socio.localidadId = :localidadId', { localidadId: filtro.localidadId });
    }
    const q = filtro.q?.trim();
    if (q) {
      qb.andWhere(
        '(socio.dni ILIKE :q OR CAST(socio.numeroSocio AS text) ILIKE :q OR socio.nombreCompleto ILIKE :q)',
        { q: `%${q}%` },
      );
    }
    const [socios, total] = await qb.getManyAndCount();
    return { data: socios.map(aDto), total, page: filtro.page, limit: filtro.limit };
  }

  async obtener(id: string): Promise<SocioDto> {
    return aDto(await this.buscar(id));
  }

  async crear(dto: CrearSocioDto): Promise<SocioDto> {
    await this.validarLocalidad(dto.localidadId);
    try {
      const socio = await this.socios.save(
        this.socios.create({
          ...dto,
          dni: dto.dni ?? null,
          telefono: dto.telefono ?? null,
          localidadId: dto.localidadId ?? null,
        }),
      );
      return this.obtener(socio.id);
    } catch (e) {
      return traducirErrorDb(e, { unico: MENSAJE_UNICO });
    }
  }

  async actualizar(id: string, dto: ActualizarSocioDto): Promise<SocioDto> {
    await this.buscar(id);
    await this.validarLocalidad(dto.localidadId);
    try {
      await this.socios.update({ id }, dto);
      return this.obtener(id);
    } catch (e) {
      return traducirErrorDb(e, { unico: MENSAJE_UNICO });
    }
  }

  /** Baja lógica: conserva el historial de lecturas y reclamos. Desactiva también sus medidores. */
  async darDeBaja(id: string): Promise<void> {
    const socio = await this.buscar(id);
    await this.socios.manager.transaction(async (m) => {
      await m.update(Socio, { id: socio.id }, { activo: false });
      await m.update(Medidor, { socioId: socio.id }, { estado: EstadoMedidor.INACTIVO });
    });
  }

  async reactivar(id: string): Promise<SocioDto> {
    const socio = await this.buscar(id);
    if (socio.activo) throw new ConflictException('El socio ya está activo');
    await this.socios.update({ id }, { activo: true });
    return this.obtener(id);
  }

  private async buscar(id: string): Promise<Socio> {
    const socio = await this.socios.findOne({ where: { id }, relations: { localidad: true } });
    if (!socio) throw new NotFoundException('Socio no encontrado');
    return socio;
  }

  private async validarLocalidad(localidadId: string | undefined): Promise<void> {
    if (localidadId && !(await this.socios.manager.exists(Localidad, { where: { id: localidadId } }))) {
      throw new NotFoundException('Localidad no encontrada');
    }
  }
}

function aDto(s: Socio): SocioDto {
  return {
    id: s.id,
    numeroSocio: s.numeroSocio,
    nombreCompleto: s.nombreCompleto,
    dni: s.dni,
    telefono: s.telefono,
    direccionTacural: s.direccionTacural,
    categoria: s.categoria,
    activo: s.activo,
    localidad: s.localidad && { id: s.localidad.id, nombre: s.localidad.nombre },
  };
}
