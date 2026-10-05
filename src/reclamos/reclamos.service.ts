import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import { Lectura } from '../lecturas/lectura.entity';
import { Socio } from '../socios/socio.entity';
import {
  CrearReclamoDto,
  FiltroReclamosDto,
  ReclamoDetalleDto,
  ReclamoDto,
} from './dto/reclamo.dto';
import { EstadoReclamo, Reclamo, ReclamoHistorial } from './reclamo.entity';

@Injectable()
export class ReclamosService {
  constructor(@InjectRepository(Reclamo) private readonly reclamos: Repository<Reclamo>) {}

  async listar(filtro: FiltroReclamosDto): Promise<ReclamoDto[]> {
    const reclamos = await this.reclamos.find({
      where: {
        ...(filtro.estado && { estado: filtro.estado }),
        ...(filtro.tipoReclamo && { tipoReclamo: filtro.tipoReclamo }),
        ...(filtro.socioId && { socioId: filtro.socioId }),
      },
      relations: { socio: true, lectura: true },
      order: { fechaCreacion: 'DESC' },
    });
    return reclamos.map(aDto);
  }

  async obtener(id: string): Promise<ReclamoDetalleDto> {
    const reclamo = await this.reclamos.findOne({
      where: { id },
      relations: { socio: true, lectura: true, historial: { usuario: true } },
      order: { historial: { fecha: 'ASC' } },
    });
    if (!reclamo) throw new NotFoundException('Reclamo no encontrado');
    return {
      ...aDto(reclamo),
      historial: reclamo.historial.map((h) => ({
        estadoAnterior: h.estadoAnterior,
        estadoNuevo: h.estadoNuevo,
        comentario: h.comentario,
        usuario: h.usuario?.nombre ?? null,
        fecha: h.fecha,
      })),
    };
  }

  async crear(dto: CrearReclamoDto, usuario: UsuarioAutenticado): Promise<ReclamoDetalleDto> {
    const id = await this.reclamos.manager.transaction(async (m) => {
      if (!(await m.exists(Socio, { where: { id: dto.socioId } }))) {
        throw new NotFoundException('Socio no encontrado');
      }
      if (dto.lecturaId && !(await m.exists(Lectura, { where: { id: dto.lecturaId } }))) {
        throw new NotFoundException('Lectura no encontrada');
      }
      const reclamo = await m.save(
        m.create(Reclamo, {
          socioId: dto.socioId,
          tipoReclamo: dto.tipoReclamo,
          descripcion: dto.descripcion,
          lecturaId: dto.lecturaId ?? null,
        }),
      );
      await registrarHistorial(m, reclamo.id, null, EstadoReclamo.PENDIENTE, 'Reclamo creado', usuario.id);
      return reclamo.id;
    });
    return this.obtener(id);
  }

  async actualizarEstado(
    id: string,
    estado: EstadoReclamo,
    comentario: string | undefined,
    usuario: UsuarioAutenticado,
  ): Promise<ReclamoDetalleDto> {
    await this.reclamos.manager.transaction(async (m) => {
      const reclamo = await m.findOne(Reclamo, { where: { id } });
      if (!reclamo) throw new NotFoundException('Reclamo no encontrado');
      if (reclamo.estado === estado) {
        throw new BadRequestException(`El reclamo ya está en estado ${estado}`);
      }
      const anterior = reclamo.estado;
      await m.update(Reclamo, { id }, { estado });
      await registrarHistorial(m, id, anterior, estado, comentario ?? null, usuario.id);
    });
    return this.obtener(id);
  }

  async adjuntarFoto(id: string, rutaRelativa: string): Promise<{ id: string; fotoUrl: string }> {
    const { affected } = await this.reclamos.update({ id }, { fotoUrl: rutaRelativa });
    if (!affected) throw new NotFoundException('Reclamo no encontrado');
    return { id, fotoUrl: rutaRelativa };
  }
}

function registrarHistorial(
  m: EntityManager,
  reclamoId: string,
  anterior: EstadoReclamo | null,
  nuevo: EstadoReclamo,
  comentario: string | null,
  usuarioId: string,
): Promise<ReclamoHistorial> {
  return m.save(
    m.create(ReclamoHistorial, {
      reclamoId,
      estadoAnterior: anterior,
      estadoNuevo: nuevo,
      comentario,
      usuarioId,
    }),
  );
}

function aDto(r: Reclamo): ReclamoDto {
  return {
    id: r.id,
    tipoReclamo: r.tipoReclamo,
    descripcion: r.descripcion,
    estado: r.estado,
    fechaCreacion: r.fechaCreacion,
    fotoUrl: r.fotoUrl,
    socio: { id: r.socio.id, numeroSocio: r.socio.numeroSocio, nombreCompleto: r.socio.nombreCompleto },
    lectura: r.lectura && {
      id: r.lectura.id,
      periodo: r.lectura.periodo,
      valorLectura: r.lectura.valorLectura,
      fotografiaUrl: r.lectura.fotografiaUrl,
    },
  };
}
