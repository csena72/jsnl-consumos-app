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
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../usuarios/usuario.entity';
import {
  ActualizarSocioDto,
  CrearSocioDto,
  FiltroSociosDto,
  PaginaSociosDto,
  SocioDto,
} from './dto/socio.dto';
import { SociosService } from './socios.service';

@ApiTags('Socios')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente o inválido' })
@ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
@Controller('socios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class SociosController {
  constructor(private readonly socios: SociosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar socios con paginado, búsqueda (DNI / N° socio / nombre) y filtro por localidad' })
  @ApiResponse({ status: 200, type: PaginaSociosDto })
  listar(@Query() filtro: FiltroSociosDto): Promise<PaginaSociosDto> {
    return this.socios.listar(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un socio' })
  @ApiResponse({ status: 200, type: SocioDto })
  @ApiResponse({ status: 404, description: 'Socio no encontrado' })
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<SocioDto> {
    return this.socios.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Dar de alta un socio' })
  @ApiResponse({ status: 201, type: SocioDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 404, description: 'Localidad no encontrada' })
  @ApiResponse({ status: 409, description: 'N° de socio o DNI duplicado' })
  crear(@Body() dto: CrearSocioDto): Promise<SocioDto> {
    return this.socios.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar los datos de un socio' })
  @ApiResponse({ status: 200, type: SocioDto })
  @ApiResponse({ status: 404, description: 'Socio o localidad no encontrados' })
  @ApiResponse({ status: 409, description: 'N° de socio o DNI duplicado' })
  actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() dto: ActualizarSocioDto): Promise<SocioDto> {
    return this.socios.actualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({
    summary: 'Dar de baja un socio',
    description: 'Baja lógica: el socio y sus medidores quedan inactivos; se conserva el historial.',
  })
  @ApiResponse({ status: 204, description: 'Socio dado de baja' })
  @ApiResponse({ status: 404, description: 'Socio no encontrado' })
  darDeBaja(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.socios.darDeBaja(id);
  }

  @Patch(':id/reactivar')
  @ApiOperation({ summary: 'Reactivar un socio dado de baja (sus medidores se reactivan a mano)' })
  @ApiResponse({ status: 200, type: SocioDto })
  @ApiResponse({ status: 404, description: 'Socio no encontrado' })
  @ApiResponse({ status: 409, description: 'El socio ya está activo' })
  reactivar(@Param('id', ParseUUIDPipe) id: string): Promise<SocioDto> {
    return this.socios.reactivar(id);
  }
}
