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
  ActualizarMedidorDto,
  CrearMedidorDto,
  FiltroMedidoresDto,
  MedidorDto,
  PaginaMedidoresDto,
} from './dto/medidor.dto';
import { MedidoresService } from './medidores.service';

@ApiTags('Medidores')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente o inválido' })
@ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
@Controller('medidores')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class MedidoresController {
  constructor(private readonly medidores: MedidoresService) {}

  @Get()
  @ApiOperation({ summary: 'Listar medidores con filtros por servicio (ENERGIA/AGUA), socio, localidad y ruta' })
  @ApiResponse({ status: 200, type: PaginaMedidoresDto })
  listar(@Query() filtro: FiltroMedidoresDto): Promise<PaginaMedidoresDto> {
    return this.medidores.listar(filtro);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un medidor' })
  @ApiResponse({ status: 200, type: MedidorDto })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  obtener(@Param('id', ParseUUIDPipe) id: string): Promise<MedidorDto> {
    return this.medidores.obtener(id);
  }

  @Post()
  @ApiOperation({ summary: 'Dar de alta un medidor para un socio' })
  @ApiResponse({ status: 201, type: MedidorDto })
  @ApiResponse({ status: 400, description: 'Datos inválidos o socio dado de baja' })
  @ApiResponse({ status: 404, description: 'Socio, localidad o ruta no encontrados' })
  @ApiResponse({ status: 409, description: 'N° de serie duplicado o caja ocupada para ese servicio' })
  crear(@Body() dto: CrearMedidorDto): Promise<MedidorDto> {
    return this.medidores.crear(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Editar un medidor (caja, precinto, ubicación, socio, estado)' })
  @ApiResponse({ status: 200, type: MedidorDto })
  @ApiResponse({ status: 404, description: 'Medidor, socio, localidad o ruta no encontrados' })
  @ApiResponse({ status: 409, description: 'N° de serie duplicado o caja ocupada para ese servicio' })
  actualizar(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarMedidorDto,
  ): Promise<MedidorDto> {
    return this.medidores.actualizar(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Dar de baja un medidor', description: 'Baja lógica: pasa a INACTIVO.' })
  @ApiResponse({ status: 204, description: 'Medidor dado de baja' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  darDeBaja(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.medidores.darDeBaja(id);
  }
}
