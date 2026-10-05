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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../usuarios/usuario.entity';
import { ActualizarLocalidadDto, CrearLocalidadDto, LocalidadDto } from './dto/localidad.dto';
import { LocalidadesService } from './localidades.service';

@ApiTags('Localidades')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente o inválido' })
@ApiResponse({ status: 403, description: 'Rol sin permisos' })
@Controller('localidades')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class LocalidadesController {
  constructor(private readonly localidades: LocalidadesService) {}

  @Get()
  @Roles(RolUsuario.ADMIN, RolUsuario.OPERARIO)
  @ApiOperation({ summary: 'Listar pueblos y parajes, ordenados por nombre' })
  @ApiResponse({ status: 200, type: [LocalidadDto] })
  listar(): Promise<LocalidadDto[]> {
    return this.localidades.listar();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una localidad' })
  @ApiResponse({ status: 200, type: LocalidadDto })
  @ApiResponse({ status: 404, description: 'Localidad no encontrada' })
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<LocalidadDto> {
    return this.localidades.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear una localidad' })
  @ApiResponse({ status: 201, type: LocalidadDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado' })
  crear(@Body() dto: CrearLocalidadDto): Promise<LocalidadDto> {
    return this.localidades.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar una localidad' })
  @ApiResponse({ status: 200, type: LocalidadDto })
  @ApiResponse({ status: 404, description: 'Localidad no encontrada' })
  @ApiResponse({ status: 409, description: 'Nombre duplicado' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarLocalidadDto,
  ): Promise<LocalidadDto> {
    return this.localidades.actualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Eliminar una localidad sin socios, medidores ni rutas' })
  @ApiResponse({ status: 204, description: 'Eliminada' })
  @ApiResponse({ status: 404, description: 'Localidad no encontrada' })
  @ApiResponse({ status: 409, description: 'La localidad está en uso' })
  eliminar(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.localidades.eliminar(id);
  }
}
