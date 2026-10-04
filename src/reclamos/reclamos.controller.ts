import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RolUsuario } from '../usuarios/usuario.entity';
import { ActualizarEstadoReclamoDto, ReclamoDto } from './dto/reclamo.dto';
import { EstadoReclamo } from './reclamo.entity';
import { ReclamosService } from './reclamos.service';

@ApiTags('Reclamos')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Token ausente o inválido' })
@ApiResponse({ status: 403, description: 'Requiere rol ADMIN' })
@Controller('reclamos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN)
export class ReclamosController {
  constructor(private readonly reclamos: ReclamosService) {}

  @Get()
  @ApiOperation({ summary: 'Listar reclamos de socios, más recientes primero' })
  @ApiQuery({ name: 'estado', enum: EstadoReclamo, required: false })
  @ApiResponse({ status: 200, type: [ReclamoDto] })
  @ApiResponse({ status: 400, description: 'Estado inválido' })
  listar(@Query('estado') estado?: string): Promise<ReclamoDto[]> {
    return this.reclamos.listar(parseEstado(estado));
  }

  @Patch(':id/estado')
  @ApiOperation({ summary: 'Cambiar el estado de un reclamo' })
  @ApiResponse({ status: 200, type: ReclamoDto })
  @ApiResponse({ status: 404, description: 'Reclamo no encontrado' })
  actualizarEstado(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ActualizarEstadoReclamoDto,
  ): Promise<ReclamoDto> {
    return this.reclamos.actualizarEstado(id, dto.estado);
  }
}

function parseEstado(valor: string | undefined): EstadoReclamo | undefined {
  if (valor === undefined) {
    return undefined;
  }
  if (!Object.values(EstadoReclamo).includes(valor as EstadoReclamo)) {
    throw new BadRequestException(`estado debe ser uno de: ${Object.values(EstadoReclamo).join(', ')}`);
  }
  return valor as EstadoReclamo;
}
