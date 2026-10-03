import {
  BadRequestException,
  Body,
  Controller,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { SincronizarLoteDto } from './dto/sincronizar-lote.dto';
import { LecturasService, ResumenLote } from './lecturas.service';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');
const MIMES_PERMITIDOS = ['image/jpeg', 'image/png'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

@Controller('lecturas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RolUsuario.ADMIN, RolUsuario.OPERARIO)
export class LecturasController {
  constructor(private readonly lecturas: LecturasService) {}

  @Post('sincronizar-lote')
  sincronizarLote(
    @Body() dto: SincronizarLoteDto,
    @UsuarioActual() usuario: UsuarioAutenticado,
  ): Promise<ResumenLote> {
    return this.lecturas.sincronizarLote(dto, usuario);
  }

  @Post(':id/evidencia')
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
