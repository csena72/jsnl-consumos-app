import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { traducirErrorDb } from '../common/db-errors';
import { ActualizarLocalidadDto, CrearLocalidadDto } from './dto/localidad.dto';
import { Localidad } from './localidad.entity';

@Injectable()
export class LocalidadesService {
  constructor(@InjectRepository(Localidad) private readonly localidades: Repository<Localidad>) {}

  listar(): Promise<Localidad[]> {
    return this.localidades.find({ order: { nombre: 'ASC' } });
  }

  async obtener(id: string): Promise<Localidad> {
    const localidad = await this.localidades.findOne({ where: { id } });
    if (!localidad) throw new NotFoundException('Localidad no encontrada');
    return localidad;
  }

  async crear(dto: CrearLocalidadDto): Promise<Localidad> {
    try {
      return await this.localidades.save(
        this.localidades.create({ ...dto, codigoPostal: dto.codigoPostal ?? null }),
      );
    } catch (e) {
      return traducirErrorDb(e, { unico: 'Ya existe una localidad con ese nombre' });
    }
  }

  async actualizar(id: string, dto: ActualizarLocalidadDto): Promise<Localidad> {
    const localidad = await this.obtener(id);
    Object.assign(localidad, dto);
    try {
      return await this.localidades.save(localidad);
    } catch (e) {
      return traducirErrorDb(e, { unico: 'Ya existe una localidad con ese nombre' });
    }
  }

  async eliminar(id: string): Promise<void> {
    const localidad = await this.obtener(id);
    try {
      await this.localidades.remove(localidad);
    } catch (e) {
      traducirErrorDb(e, {
        referencia: 'No se puede eliminar: hay socios, medidores o rutas asociados a esta localidad',
      });
    }
  }
}
