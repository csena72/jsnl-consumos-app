import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ParseUUIDPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { diskStorage } from 'multer';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import { RolUsuario } from '../usuarios/usuario.entity';
import {
  FiltroAtipicasDto,
  LecturaAtipicaDto,
  LecturaRevisadaDto,
  PeriodoQueryDto,
  ResumenDashboardDto,
  ResumenQueryDto,
  RevisionLecturaDto,
} from './dto/lectura-admin.dto';
import { ResumenLoteDto } from './dto/resumen-lote.dto';
import { SincronizarLoteDto } from './dto/sincronizar-lote.dto';
import { LecturasService } from './lecturas.service';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');
const MIMES_PERMITIDOS = ['image/jpeg', 'image/png'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

@ApiTags('Lecturas')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente o inválido' })
@ApiResponse({ status: 403, description: 'Rol sin permisos' })
@Controller('lecturas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN, RolUsuario.OPERARIO)
export class LecturasController {
  constructor(private readonly lecturas: LecturasService) {}

  @Post('sincronizar-lote')
  @ApiOperation({
    summary: 'Sincronizar un lote de lecturas capturadas offline',
    description: 'Calcula el desvío contra el promedio histórico y marca como atípicas las > 40%.',
  })
  @ApiResponse({ status: 201, type: ResumenLoteDto })
  @ApiResponse({ status: 400, description: 'Payload inválido' })
  sincronizarLote(
    @Body() dto: SincronizarLoteDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<ResumenLoteDto> {
    return this.lecturas.sincronizarLote(dto, usuario);
  }

  @Get('resumen')
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Métricas del dashboard: lotes y lecturas atípicas' })
  @ApiResponse({ status: 200, type: ResumenDashboardDto })
  resumen(@Query() query: ResumenQueryDto): Promise<ResumenDashboardDto> {
    return this.lecturas.resumen(query.periodo);
  }

  @Get('atipicas')
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Listar lecturas atípicas (> 40% de desvío)' })
  @ApiResponse({ status: 200, type: [LecturaAtipicaDto] })
  listarAtipicas(@Query() query: FiltroAtipicasDto): Promise<LecturaAtipicaDto[]> {
    return this.lecturas.listarAtipicas(query.estado);
  }

  @Get('exportar')
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({
    summary: 'Exportar el consolidado de un periodo en CSV para facturación',
    description: 'Excluye lecturas rechazadas y atípicas sin aprobar.',
  })
  @ApiProduces('text/csv')
  @ApiResponse({ status: 200, description: 'Archivo CSV (UTF-8 con BOM)' })
  async exportar(
    @Query() query: PeriodoQueryDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<string> {
    const csv = await this.lecturas.exportarCsv(query.periodo);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="lecturas-${query.periodo}.csv"`);
    return csv;
  }

  @Patch(':id/aprobar')
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Aprobar manualmente una lectura atípica' })
  @ApiResponse({ status: 200, type: LecturaRevisadaDto })
  @ApiResponse({ status: 400, description: 'La lectura no es atípica' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @ApiResponse({ status: 409, description: 'La lectura ya fue revisada' })
  aprobar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevisionLecturaDto,
  ): Promise<LecturaRevisadaDto> {
    return this.lecturas.aprobar(id, dto.comentario);
  }

  @Patch(':id/rechazar')
  @Roles(RolUsuario.ADMIN)
  @ApiOperation({ summary: 'Rechazar una lectura atípica (queda fuera de la facturación)' })
  @ApiResponse({ status: 200, type: LecturaRevisadaDto })
  @ApiResponse({ status: 400, description: 'La lectura no es atípica' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @ApiResponse({ status: 409, description: 'La lectura ya fue revisada' })
  rechazar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RevisionLecturaDto,
  ): Promise<LecturaRevisadaDto> {
    return this.lecturas.rechazar(id, dto.comentario);
  }

  @Post(':id/evidencia')
  @ApiOperation({ summary: 'Adjuntar la fotografía del medidor a una lectura' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['foto'],
      properties: { foto: { type: 'string', format: 'binary', description: 'JPG o PNG, máx. 5 MB' } },
    },
  })
  @ApiResponse({ status: 201, description: 'Evidencia guardada' })
  @ApiResponse({ status: 400, description: 'Archivo ausente o formato no permitido' })
  @ApiResponse({ status: 404, description: 'Lectura no encontrada' })
  @UseInterceptors(
    FileInterceptor('foto', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          mkdirSync(UPLOADS_DIR, { recursive: true });
          cb(null, UPLOADS_DIR);
        },
        filename: (_req, file, cb) => {
          const ext = file.mimetype === 'image/png' ? '.png' : '.jpg';
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: TAMANO_MAXIMO_BYTES },
      fileFilter: (_req, file, cb) => {
        if (MIMES_PERMITIDOS.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Solo se aceptan imágenes JPG o PNG'), false);
        }
      },
    }),
  )
  subirEvidencia(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() foto: Express.Multer.File | undefined,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<{ id: string; fotografiaUrl: string }> {
    if (!foto) {
      throw new BadRequestException('Falta el archivo en el campo "foto"');
    }
    return this.lecturas.adjuntarEvidencia(id, `/uploads/${foto.filename}`, usuario);
  }
}
