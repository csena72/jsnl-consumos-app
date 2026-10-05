import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import { opcionesSubidaFoto, swaggerBodyFoto } from '../common/uploads';
import { RolUsuario } from '../usuarios/usuario.entity';
import {
  AprobarMedidorNuevoDto,
  FiltroMedidoresNuevosDto,
  MedidorNuevoDto,
  RechazarMedidorNuevoDto,
  ReportarMedidorNuevoDto,
} from './dto/medidor-nuevo.dto';
import { MedidoresNuevosService } from './medidores-nuevos.service';

@ApiTags('Medidores nuevos')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente o inválido' })
@ApiResponse({ status: 403, description: 'Rol sin permisos' })
@Controller('medidores-nuevos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class MedidoresNuevosController {
  constructor(private readonly nuevos: MedidoresNuevosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar solicitudes de alta de medidores hallados en campo' })
  @ApiResponse({ status: 200, type: [MedidorNuevoDto] })
  listar(@Query() filtro: FiltroMedidoresNuevosDto): Promise<MedidorNuevoDto[]> {
    return this.nuevos.listar(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una solicitud de alta' })
  @ApiResponse({ status: 200, type: MedidorNuevoDto })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<MedidorNuevoDto> {
    return this.nuevos.obtener(id);
  }

  @Post()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERARIO)
  @ApiOperation({
    summary: 'Reportar un medidor nuevo detectado en campo',
    description: 'Queda PENDIENTE hasta que un administrador lo audite y lo vincule a un socio.',
  })
  @ApiResponse({ status: 201, type: MedidorNuevoDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Localidad no encontrada' })
  @ApiResponse({ status: 409, description: 'El N° de serie ya está en el padrón o ya fue reportado' })
  reportar(
    @Body() dto: ReportarMedidorNuevoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<MedidorNuevoDto> {
    return this.nuevos.reportar(dto, usuario);
  }

  @Post(':id/foto')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERARIO)
  @ApiOperation({ summary: 'Adjuntar la fotografía del medidor hallado' })
  @ApiConsumes('multipart/form-data')
  @ApiBody(swaggerBodyFoto)
  @ApiResponse({ status: 201, description: 'Foto guardada' })
  @ApiResponse({ status: 400, description: 'Archivo ausente o formato no permitido' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @UseInterceptors(FileInterceptor('foto', opcionesSubidaFoto))
  subirFoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() foto: Express.Multer.File | undefined,
  ): Promise<{ id: string; fotoUrl: string }> {
    if (!foto) throw new BadRequestException('Falta el archivo en el campo "foto"');
    return this.nuevos.adjuntarFoto(id, `/uploads/${foto.filename}`);
  }

  @Post(':id/aprobar')
  @ApiOperation({
    summary: 'Aprobar la solicitud y convertirla en un medidor oficial del padrón',
    description: 'Crea el medidor vinculado al socio indicado y, opcionalmente, lo ubica en una ruta.',
  })
  @ApiResponse({ status: 201, type: MedidorNuevoDto })
  @ApiResponse({ status: 400, description: 'Socio dado de baja o ruta de otra localidad' })
  @ApiResponse({ status: 404, description: 'Solicitud, socio, localidad o ruta no encontrados' })
  @ApiResponse({ status: 409, description: 'Solicitud ya revisada, o caja/serie duplicada' })
  aprobar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AprobarMedidorNuevoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<MedidorNuevoDto> {
    return this.nuevos.aprobar(id, dto, usuario);
  }

  @Post(':id/rechazar')
  @ApiOperation({ summary: 'Rechazar la solicitud indicando el motivo' })
  @ApiResponse({ status: 201, type: MedidorNuevoDto })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  @ApiResponse({ status: 409, description: 'Solicitud ya revisada' })
  rechazar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RechazarMedidorNuevoDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<MedidorNuevoDto> {
    return this.nuevos.rechazar(id, dto.motivo, usuario);
  }
}
