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
import { UsuarioActual } from '../auth/decorators/usuario-actual.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UsuarioAutenticado } from '../auth/jwt-payload.interface';
import {
  ActualizarUsuarioDto,
  CrearUsuarioDto,
  FiltroUsuariosDto,
  UsuarioDto,
} from './dto/usuario.dto';
import { RolUsuario } from './usuario.entity';
import { UsuariosService } from './usuarios.service';

@ApiTags('Usuarios')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente o inválido' })
@ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
@Controller('usuarios')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class UsuariosController {
  constructor(private readonly usuarios: UsuariosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar usuarios (administradores y operarios)' })
  @ApiResponse({ status: 200, type: [UsuarioDto] })
  listar(@Query() filtro: FiltroUsuariosDto): Promise<UsuarioDto[]> {
    return this.usuarios.listar(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un usuario' })
  @ApiResponse({ status: 200, type: UsuarioDto })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<UsuarioDto> {
    return this.usuarios.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un usuario' })
  @ApiResponse({ status: 201, type: UsuarioDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Email duplicado' })
  crear(@Body() dto: CrearUsuarioDto): Promise<UsuarioDto> {
    return this.usuarios.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un usuario: nombre, email, rol, contraseña o activación' })
  @ApiResponse({ status: 200, type: UsuarioDto })
  @ApiResponse({ status: 400, description: 'Intento de desactivarse o cambiarse el rol a uno mismo' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Email duplicado' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarUsuarioDto,
    @UsuarioActual() actual: UsuarioAutenticado,
  ): Promise<UsuarioDto> {
    return this.usuarios.actualizar(id, dto, actual);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Dar de baja un usuario', description: 'Baja lógica: ya no puede iniciar sesión.' })
  @ApiResponse({ status: 204, description: 'Usuario dado de baja' })
  @ApiResponse({ status: 400, description: 'No se puede dar de baja a uno mismo' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  darDeBaja(
    @Param('id', ParseUUIDPipe) id: string,
    @UsuarioActual() actual: UsuarioAutenticado,
  ): Promise<void> {
    return this.usuarios.darDeBaja(id, actual);
  }
}
