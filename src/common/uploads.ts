import { BadRequestException } from '@nestjs/common';
import { ApiBodyOptions } from '@nestjs/swagger';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { diskStorage } from 'multer';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');
const MIMES_PERMITIDOS = ['image/jpeg', 'image/png'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

/** Opciones de multer para fotos JPG/PNG de hasta 5 MB guardadas en /uploads. */
export const opcionesSubidaFoto: MulterOptions = {
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
};

export const swaggerBodyFoto: ApiBodyOptions = {
  schema: {
    type: 'object',
    required: ['foto'],
    properties: { foto: { type: 'string', format: 'binary', description: 'JPG o PNG, máx. 5 MB' } },
  },
};
