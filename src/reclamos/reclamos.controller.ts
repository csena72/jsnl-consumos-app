import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import { opcionesSubidaFoto, swaggerBodyFoto } from '../common/uploads';
import { RolUsuario } from '../usuarios/usuario.entity';
import {
  ActualizarEstadoReclamoDto,
  CrearReclamoDto,
  FiltroReclamosDto,
  ReclamoDetalleDto,
  ReclamoDto,
} from './dto/reclamo.dto';
import { ReclamosService } from './reclamos.service';

@ApiTags('Reclamos')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente o inválido' })
@ApiResponse({ status: 403, description: 'Rol sin permisos' })
@Controller('reclamos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class ReclamosController {
  constructor(private readonly reclamos: ReclamosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reclamos de socios, más recientes primero' })
  @ApiResponse({ status: 200, type: [ReclamoDto] })
  listar(@Query() filtro: FiltroReclamosDto): Promise<ReclamoDto[]> {
    return this.reclamos.listar(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un reclamo con su historial de estados' })
  @ApiResponse({ status: 200, type: ReclamoDetalleDto })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<ReclamoDetalleDto> {
    return this.reclamos.obtener(id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERARIO)
  @ApiOperation({ summary: 'Registrar un reclamo de un socio (queda PENDIENTE)' })
  @ApiResponse({ status: 201, type: ReclamoDetalleDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Socio o lectura no encontrados' })
  crear(
    @Body() dto: CrearReclamoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<ReclamoDetalleDto> {
    return this.reclamos.crear(dto, usuario);
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar el estado de un reclamo (PENDIENTE, EN_PROCESO, RESUELTO)' })
  @ApiResponse({ status: 200, type: ReclamoDetalleDto })
  @ApiResponse({ status: 400, description: 'El reclamo ya está en ese estado' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  actualizarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarEstadoReclamoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<ReclamoDetalleDto> {
    return this.reclamos.actualizarEstado(id, dto.estado, dto.comentario, usuario);
  }

  @Post(':id/foto')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERARIO)
  @ApiOperation({ summary: 'Adjuntar la fotografía del medidor/evidencia a un reclamo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(swaggerBodyFoto)
  @ApiResponse({ status: 201, description: 'Foto guardada' })
  @ApiResponse({ status: 400, description: 'Archivo ausente o formato no permitido' })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  @UseInterceptors(FileInterceptor('foto', opcionesSubidaFoto))
  subirFoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() foto: Express.Multer.File | undefined,
  ): Promise<{ id: string; fotoUrl: string }> {
    if (!foto) throw new BadRequestException('Falta el archivo en el campo "foto"');
    return this.reclamos.adjuntarFoto(id, `/uploads/${foto.filename}`);
  }
}
