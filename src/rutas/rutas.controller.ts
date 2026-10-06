import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import { LecturasService } from '../lecturas/lecturas.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../usuarios/usuario.entity';
import {
  ActualizarRutaDto,
  AsignarRutaDto,
  CrearRutaDto,
  FiltroRutasDto,
  ReordenarRutaDto,
  RutaAsignadaDto,
  RutaDetalleDto,
  RutaDto,
} from './dto/ruta.dto';
import { RutasService } from './rutas.service';

@ApiTags('Rutas')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente o inválido' })
@ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
@Controller('rutas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class RutasController {
  constructor(
    private readonly rutas: RutasService,
    private readonly lecturas: LecturasService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar rutas por localidad, con su cantidad de medidores' })
  @ApiResponse({ status: 200, type: [RutaDto] })
  listar(@Query() filtro: FiltroRutasDto): Promise<RutaDto[]> {
    return this.rutas.listar(filtro);
  }

  @Get('asignada')
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERARIO)
  @ApiOperation({
    summary: 'Rutas asignadas al usuario del token, para trabajar offline',
    description:
      'Devuelve únicamente las rutas activas cuyo operario es el usuario autenticado, con sus medidores ' +
      'activos ordenados por ordenSecuencia ASC e incluyendo lectura anterior y promedio histórico.',
  })
  @ApiResponse({ status: 200, type: [RutaAsignadaDto] })
  asignada(@UsuarioActual() usuario: UsuarioAutenticado): Promise<RutaAsignadaDto[]> {
    return this.lecturas.rutasAsignadas(usuario.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una ruta con sus medidores en orden de lectura' })
  @ApiResponse({ status: 200, type: RutaDetalleDto })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<RutaDetalleDto> {
    return this.rutas.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una ruta dentro de una localidad' })
  @ApiResponse({ status: 201, type: RutaDetalleDto })
  @ApiResponse({ status: 404, description: 'Localidad no encontrada' })
  @ApiResponse({ status: 409, description: 'Nombre de ruta duplicado en la localidad' })
  crear(@Body() dto: CrearRutaDto): Promise<RutaDetalleDto> {
    return this.rutas.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar nombre o estado de una ruta' })
  @ApiResponse({ status: 200, type: RutaDetalleDto })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  @ApiResponse({ status: 409, description: 'Nombre de ruta duplicado en la localidad' })
  actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarRutaDto): Promise<RutaDetalleDto> {
    return this.rutas.actualizar(id, dto);
  }

  @Patch(':id/asignar')
  @ApiOperation({ summary: 'Asignar la ruta a un operario (o desasignarla con operarioId null)' })
  @ApiResponse({ status: 200, type: RutaDetalleDto })
  @ApiResponse({ status: 400, description: 'El usuario no es un operario activo' })
  @ApiResponse({ status: 404, description: 'Ruta u operario no encontrados' })
  asignar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AsignarRutaDto): Promise<RutaDetalleDto> {
    return this.rutas.asignar(id, dto);
  }

  @Put(':id/orden')
  @ApiOperation({
    summary: 'Definir la secuencia física de lectura de la ruta',
    description: 'Reemplaza el conjunto y el orden de medidores de la ruta (ordenSecuencia = posición + 1).',
  })
  @ApiResponse({ status: 200, type: RutaDetalleDto })
  @ApiResponse({ status: 400, description: 'Medidores inactivos o de otra localidad' })
  @ApiResponse({ status: 404, description: 'Ruta o medidor no encontrados' })
  reordenar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ReordenarRutaDto): Promise<RutaDetalleDto> {
    return this.rutas.reordenar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una ruta (sus medidores quedan sin ruta)' })
  @ApiResponse({ status: 204, description: 'Ruta eliminada' })
  @ApiResponse({ status: 404, description: 'Ruta no encontrada' })
  eliminar(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.rutas.eliminar(id);
  }
}
