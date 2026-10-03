import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import { EstadoLote, LoteSincronizacion } from '../lotes/lote-sincronizacion.entity';
import { EstadoMedidor, Medidor } from '../medidores/medidor.entity';
import { RolUsuario } from '../usuarios/usuario.entity';
import { calcularDesvio } from './desvio';
import { LecturaEntranteDto, SincronizarLoteDto } from './dto/sincronizar-lote.dto';
import { Lectura } from './lectura.entity';

export interface LecturaProcesada {
  id: string;
  medidorId: string;
  periodo: string;
  valorLectura: number;
  promedioHistorico: number | null;
  desvioPorcentaje: number | null;
  esAtipico: boolean;
}

export interface LecturaRechazada {
  medidorId: string;
  periodo: string;
  motivo: string;
}

export interface ResumenLote {
  loteId: string;
  estado: EstadoLote;
  totalRecibidas: number;
  totalProcesadas: number;
  totalAtipicas: number;
  procesadas: LecturaProcesada[];
  alertasAtipicas: LecturaProcesada[];
  rechazadas: LecturaRechazada[];
}

@Injectable()
export class LecturasService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Lectura) private readonly lecturas: Repository<Lectura>,
  ) {}

  async sincronizarLote(dto: SincronizarLoteDto, usuario: UsuarioAutenticado): Promise<ResumenLote> {
    const operarioId = dto.operarioId ?? usuario.id;
    if (operarioId !== usuario.id && usuario.rol !== RolUsuario.ADMIN) {
      throw new BadRequestException('operarioId no coincide con el usuario autenticado');
    }

    return this.dataSource.transaction(async (manager) => {
      const lote = await manager.save(
        manager.create(LoteSincronizacion, { operarioId, estado: EstadoLote.PENDIENTE }),
      );

      const procesadas: LecturaProcesada[] = [];
      const rechazadas: LecturaRechazada[] = [];

      for (const entrante of dto.lecturas) {
        const medidor = await manager.findOne(Medidor, { where: { id: entrante.medidorId } });
        if (!medidor || medidor.estado !== EstadoMedidor.ACTIVO) {
          rechazadas.push({
            medidorId: entrante.medidorId,
            periodo: entrante.periodo,
            motivo: medidor ? 'Medidor inactivo' : 'Medidor inexistente',
          });
          continue;
        }
        procesadas.push(await this.registrarLectura(manager, lote.id, operarioId, entrante));
      }

      lote.estado = rechazadas.length > 0 ? EstadoLote.CON_INCONSISTENCIAS : EstadoLote.PROCESADO;
      await manager.save(lote);

      const alertasAtipicas = procesadas.filter((l) => l.esAtipico);
      return {
        loteId: lote.id,
        estado: lote.estado,
        totalRecibidas: dto.lecturas.length,
        totalProcesadas: procesadas.length,
        totalAtipicas: alertasAtipicas.length,
        procesadas,
        alertasAtipicas,
        rechazadas,
      };
    });
  }

  async adjuntarEvidencia(
    id: string,
    rutaRelativa: string,
    usuario: UsuarioAutenticado,
  ): Promise<{ id: string; fotografiaUrl: string }> {
    const lectura = await this.lecturas.findOne({ where: { id } });
    if (!lectura) {
      throw new NotFoundException('Lectura no encontrada');
    }
    if (usuario.rol !== RolUsuario.ADMIN && lectura.operarioId !== usuario.id) {
      throw new NotFoundException('Lectura no encontrada');
    }
    lectura.fotografiaUrl = rutaRelativa;
    await this.lecturas.save(lectura);
    return { id: lectura.id, fotografiaUrl: rutaRelativa };
  }

  private async registrarLectura(
    manager: EntityManager,
    loteId: string,
    operarioId: string,
    entrante: LecturaEntranteDto,
  ): Promise<LecturaProcesada> {
    const promedioHistorico = await this.promedioHistorico(manager, entrante.medidorId, entrante.periodo);
    const { desvioPorcentaje, esAtipico } = calcularDesvio(entrante.valorLectura, promedioHistorico);

    const lectura = await manager.save(
      manager.create(Lectura, {
        loteId,
        medidorId: entrante.medidorId,
        operarioId,
        valorLectura: entrante.valorLectura,
        periodo: entrante.periodo,
        fechaCaptura: entrante.fechaCaptura,
        promedioHistorico,
        desvioPorcentaje,
        esAtipico,
        fotografiaUrl: null,
        observaciones: entrante.observaciones ?? null,
      }),
    );

    return {
      id: lectura.id,
      medidorId: lectura.medidorId,
      periodo: lectura.periodo,
      valorLectura: entrante.valorLectura,
      promedioHistorico,
      desvioPorcentaje,
      esAtipico,
    };
  }

  /** Promedio de las lecturas previas (periodo anterior) del medidor; null si no hay historial. */
  private async promedioHistorico(
    manager: EntityManager,
    medidorId: string,
    periodo: string,
  ): Promise<number | null> {
    const fila = await manager
      .createQueryBuilder(Lectura, 'l')
      .select('AVG(l.valor_lectura)', 'promedio')
      .where('l.medidor_id = :medidorId', { medidorId })
      .andWhere('l.periodo < :periodo', { periodo })
      .getRawOne<{ promedio: string | null }>();
    return fila?.promedio == null ? null : Math.round(parseFloat(fila.promedio) * 100) / 100;
  }
}
