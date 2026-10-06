import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import { EstadoLote, LoteSincronizacion } from '../lotes/lote-sincronizacion.entity';
import { EstadoMedidor, Medidor } from '../medidores/medidor.entity';
import { Ruta } from '../rutas/ruta.entity';
import { RolUsuario } from '../usuarios/usuario.entity';
import { calcularDesvio } from './desvio';
import { RutaAsignadaDto } from '../rutas/dto/ruta.dto';
import {
  FiltroExportacion,
  LecturaAtipicaDto,
  LecturaRevisadaDto,
  ResumenDashboardDto,
} from './dto/lectura-admin.dto';
import {
  LecturaProcesadaDto,
  LecturaRechazadaDto,
  ResumenLoteDto,
  RutaMedidorDto,
} from './dto/resumen-lote.dto';
import { LecturaEntranteDto, SincronizarLoteDto } from './dto/sincronizar-lote.dto';
import { EstadoRevision, Lectura } from './lectura.entity';
import { aCsv } from './csv';

@Injectable()
export class LecturasService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Lectura) private readonly lecturas: Repository<Lectura>,
  ) {}

  async sincronizarLote(dto: SincronizarLoteDto, usuario: UsuarioAutenticado): Promise<ResumenLoteDto> {
    const operarioId = dto.operarioId ?? usuario.id;
    if (operarioId !== usuario.id && usuario.rol !== RolUsuario.ADMIN) {
      throw new BadRequestException('operarioId no coincide con el usuario autenticado');
    }

    return this.dataSource.transaction(async (manager) => {
      const lote = await manager.save(
        manager.create(LoteSincronizacion, { operarioId, estado: EstadoLote.PENDIENTE }),
      );

      const procesadas: LecturaProcesadaDto[] = [];
      const rechazadas: LecturaRechazadaDto[] = [];

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

  /**
   * Rutas activas asignadas al operario, cada una con sus medidores activos en orden de
   * caminata (ordenSecuencia ASC) y su historial de lecturas.
   */
  async rutasAsignadas(operarioId: string): Promise<RutaAsignadaDto[]> {
    const rutas = await this.dataSource.getRepository(Ruta).find({
      where: { operarioId, activa: true },
      relations: { localidad: true },
      order: { localidad: { nombre: 'ASC' }, nombre: 'ASC' },
    });
    const medidores = await this.medidoresConHistorial(rutas.map((r) => r.id));
    return rutas.map((r) => ({
      id: r.id,
      nombre: r.nombre,
      localidad: { id: r.localidad.id, nombre: r.localidad.nombre },
      medidores: medidores.filter((m) => m.rutaId === r.id).map(({ rutaId: _rutaId, ...m }) => m),
    }));
  }

  /** Versión plana de `rutasAsignadas` (GET /lecturas/ruta, compatible con apps anteriores). */
  async ruta(operarioId: string): Promise<RutaMedidorDto[]> {
    return (await this.rutasAsignadas(operarioId)).flatMap((r) => r.medidores);
  }

  private async medidoresConHistorial(
    rutaIds: string[],
  ): Promise<(RutaMedidorDto & { rutaId: string })[]> {
    if (rutaIds.length === 0) return [];
    const medidores = await this.dataSource.getRepository(Medidor).find({
      where: { estado: EstadoMedidor.ACTIVO, rutaId: In(rutaIds) },
      relations: { socio: true, localidad: true, ruta: true },
      order: { ordenSecuencia: 'ASC', numeroSerie: 'ASC' },
    });
    if (medidores.length === 0) return [];
    const historial = await this.lecturas
      .createQueryBuilder('l')
      .select(['l.medidorId', 'l.valorLectura'])
      .where('l.medidorId IN (:...ids)', { ids: medidores.map((m) => m.id) })
      .orderBy('l.periodo', 'ASC')
      .addOrderBy('l.fechaCaptura', 'ASC')
      .getMany();

    const valoresPorMedidor = new Map<string, number[]>();
    for (const { medidorId, valorLectura } of historial) {
      valoresPorMedidor.set(medidorId, [...(valoresPorMedidor.get(medidorId) ?? []), valorLectura]);
    }

    return medidores.map((m) => {
      const valores = valoresPorMedidor.get(m.id) ?? [];
      const consumos = valores.slice(1).map((v, i) => v - valores[i]);
      const promedio = consumos.length ? consumos.reduce((a, b) => a + b, 0) / consumos.length : null;
      return {
        rutaId: m.rutaId as string,
        medidorId: m.id,
        numeroSerie: m.numeroSerie,
        tipoServicio: m.tipoServicio,
        socioId: m.socioId,
        numeroSocio: m.socio.numeroSocio,
        nombreCompleto: m.socio.nombreCompleto,
        direccion: m.socio.direccionTacural,
        numeroCaja: m.numeroCaja,
        localidadId: m.localidadId ?? null,
        localidad: m.localidad?.nombre ?? null,
        ruta: m.ruta?.nombre ?? null,
        ordenSecuencia: m.ordenSecuencia,
        lecturaAnterior: valores.length ? valores[valores.length - 1] : null,
        promedioHistorico: promedio === null ? null : Math.round(promedio * 100) / 100,
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

  async resumen(periodo?: string): Promise<ResumenDashboardDto> {
    const filtroPeriodo = periodo ? { periodo } : {};
    const contarAtipicas = (estadoRevision?: EstadoRevision): Promise<number> =>
      this.lecturas.count({ where: { esAtipico: true, ...filtroPeriodo, ...(estadoRevision && { estadoRevision }) } });

    const [totalLotes, lotesConInconsistencias, totalLecturas, totalAtipicas, pend, aprob, rech] =
      await Promise.all([
        this.dataSource.getRepository(LoteSincronizacion).count(),
        this.dataSource
          .getRepository(LoteSincronizacion)
          .count({ where: { estado: EstadoLote.CON_INCONSISTENCIAS } }),
        this.lecturas.count({ where: filtroPeriodo }),
        contarAtipicas(),
        contarAtipicas(EstadoRevision.PENDIENTE),
        contarAtipicas(EstadoRevision.APROBADA),
        contarAtipicas(EstadoRevision.RECHAZADA),
      ]);
    return {
      totalLotes,
      lotesConInconsistencias,
      totalLecturas,
      totalAtipicas,
      atipicasPendientes: pend,
      atipicasAprobadas: aprob,
      atipicasRechazadas: rech,
    };
  }

  async listarAtipicas(estado?: EstadoRevision): Promise<LecturaAtipicaDto[]> {
    const lecturas = await this.lecturas.find({
      where: { esAtipico: true, ...(estado && { estadoRevision: estado }) },
      relations: { medidor: { socio: true }, operario: true },
      order: { fechaCaptura: 'DESC' },
    });
    return lecturas.map((l) => ({
      id: l.id,
      periodo: l.periodo,
      valorLectura: l.valorLectura,
      promedioHistorico: l.promedioHistorico,
      desvioPorcentaje: l.desvioPorcentaje,
      estadoRevision: l.estadoRevision,
      fechaCaptura: l.fechaCaptura,
      fotografiaUrl: l.fotografiaUrl,
      observaciones: l.observaciones,
      operarioNombre: l.operario.nombre,
      medidor: { numeroSerie: l.medidor.numeroSerie, tipoServicio: l.medidor.tipoServicio },
      socio: {
        numeroSocio: l.medidor.socio.numeroSocio,
        nombreCompleto: l.medidor.socio.nombreCompleto,
      },
    }));
  }

  aprobar(id: string, comentario?: string): Promise<LecturaRevisadaDto> {
    return this.revisar(id, EstadoRevision.APROBADA, comentario);
  }

  rechazar(id: string, comentario?: string): Promise<LecturaRevisadaDto> {
    return this.revisar(id, EstadoRevision.RECHAZADA, comentario);
  }

  /**
   * CSV del periodo según `filtro`:
   * - PROCESADAS (por defecto, el insumo de facturación): excluye rechazadas y atípicas sin aprobar.
   * - ATIPICAS: solo las lecturas con desvío > 40%, sea cual sea su estado de revisión.
   * - TODAS: el padrón completo de lecturas del periodo.
   */
  async exportarCsv(periodo: string, filtro: FiltroExportacion = FiltroExportacion.PROCESADAS): Promise<string> {
    const qb = this.lecturas
      .createQueryBuilder('l')
      .innerJoinAndSelect('l.medidor', 'm')
      .innerJoinAndSelect('m.socio', 's')
      .where('l.periodo = :periodo', { periodo });
    if (filtro === FiltroExportacion.ATIPICAS) {
      qb.andWhere('l.es_atipico = true');
    } else if (filtro === FiltroExportacion.PROCESADAS) {
      qb.andWhere('l.estado_revision <> :rechazada', { rechazada: EstadoRevision.RECHAZADA }).andWhere(
        '(l.es_atipico = false OR l.estado_revision = :aprobada)',
        { aprobada: EstadoRevision.APROBADA },
      );
    }
    const lecturas = await qb
      .orderBy('s.numero_socio', 'ASC')
      .addOrderBy('m.numero_serie', 'ASC')
      .getMany();

    return aCsv(
      [
        'periodo',
        'numero_socio',
        'nombre_socio',
        'categoria',
        'numero_serie',
        'tipo_servicio',
        'valor_lectura',
        'promedio_historico',
        'desvio_porcentaje',
        'atipica',
        'estado_revision',
        'fecha_captura',
        'observaciones',
      ],
      lecturas.map((l) => [
        l.periodo,
        l.medidor.socio.numeroSocio,
        l.medidor.socio.nombreCompleto,
        l.medidor.socio.categoria,
        l.medidor.numeroSerie,
        l.medidor.tipoServicio,
        l.valorLectura,
        l.promedioHistorico,
        l.desvioPorcentaje,
        l.esAtipico ? 'SI' : 'NO',
        l.estadoRevision,
        l.fechaCaptura.toISOString(),
        l.observaciones,
      ]),
    );
  }

  private async revisar(
    id: string,
    estado: EstadoRevision.APROBADA | EstadoRevision.RECHAZADA,
    comentario?: string,
  ): Promise<LecturaRevisadaDto> {
    const lectura = await this.lecturas.findOne({ where: { id } });
    if (!lectura) {
      throw new NotFoundException('Lectura no encontrada');
    }
    if (!lectura.esAtipico) {
      throw new BadRequestException('Solo las lecturas atípicas requieren revisión');
    }
    if (lectura.estadoRevision !== EstadoRevision.PENDIENTE) {
      throw new ConflictException(`La lectura ya fue ${lectura.estadoRevision.toLowerCase()}`);
    }
    lectura.estadoRevision = estado;
    if (comentario) {
      const nota = `[${estado}] ${comentario}`;
      lectura.observaciones = lectura.observaciones ? `${lectura.observaciones}\n${nota}` : nota;
    }
    await this.lecturas.save(lectura);
    return { id: lectura.id, estadoRevision: lectura.estadoRevision };
  }

  private async registrarLectura(
    manager: EntityManager,
    loteId: string,
    operarioId: string,
    entrante: LecturaEntranteDto,
  ): Promise<LecturaProcesadaDto> {
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
