import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import { Localidad } from '../localidades/localidad.entity';
import { Medidor } from '../medidores/medidor.entity';
import { MedidoresService } from '../medidores/medidores.service';
import {
  AprobarMedidorNuevoDto,
  FiltroMedidoresNuevosDto,
  MedidorNuevoDto,
  ReportarMedidorNuevoDto,
} from './dto/medidor-nuevo.dto';
import { EstadoPendienteAlta, MedidorPendienteAlta } from './medidor-pendiente-alta.entity';

@Injectable()
export class MedidoresNuevosService {
  constructor(
    @InjectRepository(MedidorPendienteAlta) private readonly pendientes: Repository<MedidorPendienteAlta>,
    private readonly medidores: MedidoresService,
  ) {}

  async listar(filtro: FiltroMedidoresNuevosDto): Promise<MedidorNuevoDto[]> {
    const pendientes = await this.pendientes.find({
      where: filtro.estado ? { estado: filtro.estado } : {},
      relations: RELACIONES,
      order: { fechaCreacion: 'DESC' },
    });
    return pendientes.map(aDto);
  }

  async obtener(id: string): Promise<MedidorNuevoDto> {
    return aDto(await this.buscar(id));
  }

  async reportar(dto: ReportarMedidorNuevoDto, usuario: UsuarioAutenticado): Promise<MedidorNuevoDto> {
    const m = this.pendientes.manager;
    if (await m.exists(Medidor, { where: { numeroSerie: dto.numeroSerie } })) {
      throw new ConflictException('Ese número de serie ya figura en el padrón de medidores');
    }
    const yaReportado = await this.pendientes.exists({
      where: { numeroSerie: dto.numeroSerie, estado: EstadoPendienteAlta.PENDIENTE },
    });
    if (yaReportado) throw new ConflictException('Ese medidor ya fue reportado y está pendiente de auditoría');
    if (dto.localidadId && !(await m.exists(Localidad, { where: { id: dto.localidadId } }))) {
      throw new NotFoundException('Localidad no encontrada');
    }

    const pendiente = await this.pendientes.save(
      this.pendientes.create({
        numeroSerie: dto.numeroSerie,
        tipoServicio: dto.tipoServicio,
        numeroCaja: dto.numeroCaja ?? null,
        estadoPrecinto: dto.estadoPrecinto,
        localidadId: dto.localidadId ?? null,
        direccionReferencia: dto.direccionReferencia ?? null,
        observaciones: dto.observaciones ?? null,
        reportadoPorId: usuario.id,
      }),
    );
    return this.obtener(pendiente.id);
  }

  async adjuntarFoto(id: string, rutaRelativa: string): Promise<{ id: string; fotoUrl: string }> {
    const { affected } = await this.pendientes.update({ id }, { fotoUrl: rutaRelativa });
    if (!affected) throw new NotFoundException('Solicitud no encontrada');
    return { id, fotoUrl: rutaRelativa };
  }

  /** Crea el medidor oficial en el padrón, vinculado al socio, y cierra la solicitud. */
  async aprobar(id: string, dto: AprobarMedidorNuevoDto, usuario: UsuarioAutenticado): Promise<MedidorNuevoDto> {
    await this.pendientes.manager.transaction(async (m) => {
      const pendiente = await m.findOne(MedidorPendienteAlta, { where: { id } });
      if (!pendiente) throw new NotFoundException('Solicitud no encontrada');
      asegurarPendiente(pendiente);

      const medidor = await this.medidores.crear(
        {
          numeroSerie: pendiente.numeroSerie,
          socioId: dto.socioId,
          tipoServicio: pendiente.tipoServicio,
          numeroCaja: dto.numeroCaja ?? pendiente.numeroCaja ?? undefined,
          estadoPrecinto: dto.estadoPrecinto ?? pendiente.estadoPrecinto,
          localidadId: dto.localidadId ?? pendiente.localidadId ?? undefined,
          rutaId: dto.rutaId,
          ordenSecuencia: dto.ordenSecuencia,
        },
        m,
      );
      await m.update(
        MedidorPendienteAlta,
        { id },
        {
          estado: EstadoPendienteAlta.APROBADO,
          medidorId: medidor.id,
          revisadoPorId: usuario.id,
          fechaRevision: new Date(),
        },
      );
    });
    return this.obtener(id);
  }

  async rechazar(id: string, motivo: string, usuario: UsuarioAutenticado): Promise<MedidorNuevoDto> {
    const pendiente = await this.buscar(id);
    asegurarPendiente(pendiente);
    await this.pendientes.update(
      { id },
      {
        estado: EstadoPendienteAlta.RECHAZADO,
        motivoRechazo: motivo,
        revisadoPorId: usuario.id,
        fechaRevision: new Date(),
      },
    );
    return this.obtener(id);
  }

  private async buscar(id: string): Promise<MedidorPendienteAlta> {
    const pendiente = await this.pendientes.findOne({ where: { id }, relations: RELACIONES });
    if (!pendiente) throw new NotFoundException('Solicitud no encontrada');
    return pendiente;
  }
}

const RELACIONES = { localidad: true, reportadoPor: true, revisadoPor: true } as const;

function asegurarPendiente(p: MedidorPendienteAlta): void {
  if (p.estado !== EstadoPendienteAlta.PENDIENTE) {
    throw new ConflictException(
      `La solicitud ya fue ${p.estado === EstadoPendienteAlta.APROBADO ? 'aprobada' : 'rechazada'}`,
    );
  }
}

function aDto(p: MedidorPendienteAlta): MedidorNuevoDto {
  return {
    id: p.id,
    numeroSerie: p.numeroSerie,
    tipoServicio: p.tipoServicio,
    numeroCaja: p.numeroCaja,
    estadoPrecinto: p.estadoPrecinto,
    localidad: p.localidad && { id: p.localidad.id, nombre: p.localidad.nombre },
    direccionReferencia: p.direccionReferencia,
    observaciones: p.observaciones,
    fotoUrl: p.fotoUrl,
    estado: p.estado,
    reportadoPor: p.reportadoPor.nombre,
    fechaCreacion: p.fechaCreacion,
    revisadoPor: p.revisadoPor?.nombre ?? null,
    fechaRevision: p.fechaRevision,
    motivoRechazo: p.motivoRechazo,
    medidorId: p.medidorId,
  };
}
