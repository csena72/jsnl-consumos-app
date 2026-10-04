import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReclamoDto } from './dto/reclamo.dto';
import { EstadoReclamo, Reclamo } from './reclamo.entity';

@Injectable()
export class ReclamosService {
  constructor(@InjectRepository(Reclamo) private readonly reclamos: Repository<Reclamo>) {}

  async listar(estado?: EstadoReclamo): Promise<ReclamoDto[]> {
    const reclamos = await this.reclamos.find({
      where: estado ? { estado } : {},
      relations: { socio: true, lectura: true },
      order: { fechaIngreso: 'DESC' },
    });
    return reclamos.map(aDto);
  }

  async actualizarEstado(id: string, estado: EstadoReclamo): Promise<ReclamoDto> {
    const reclamo = await this.reclamos.findOne({
      where: { id },
      relations: { socio: true, lectura: true },
    });
    if (!reclamo) {
      throw new NotFoundException('Reclamo no encontrado');
    }
    reclamo.estado = estado;
    await this.reclamos.save(reclamo);
    return aDto(reclamo);
  }
}

function aDto(r: Reclamo): ReclamoDto {
  return {
    id: r.id,
    motivo: r.motivo,
    estado: r.estado,
    fechaIngreso: r.fechaIngreso,
    fotoEvidenciaUrl: r.fotoEvidenciaUrl,
    socio: { numeroSocio: r.socio.numeroSocio, nombreCompleto: r.socio.nombreCompleto },
    lectura: r.lectura && {
      id: r.lectura.id,
      periodo: r.lectura.periodo,
      valorLectura: r.lectura.valorLectura,
      fotografiaUrl: r.lectura.fotografiaUrl,
    },
  };
}
