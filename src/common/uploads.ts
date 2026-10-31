import { BadRequestException } from '@nestjs/common';
import { ApiBodyOptions } from '@nestjs/swagger';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { memoryStorage } from 'multer';

export const UPLOADS_DIR = join(process.cwd(), 'uploads');
const MIMES_PERMITIDOS = ['image/jpeg', 'image/png'];
const TAMANO_MAXIMO_BYTES = 5 * 1024 * 1024;

/** Opciones de multer para fotos JPG/PNG de hasta 5 MB. El archivo llega en memoria: lo persiste guardarFoto. */
export const opcionesSubidaFoto: MulterOptions = {
  storage: memoryStorage(),
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

function cloudinaryConfigurado(env: NodeJS.ProcessEnv): boolean {
  return Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
}

/**
 * Persiste la foto y devuelve la URL a guardar en la base.
 * Con credenciales de Cloudinary sube la imagen y devuelve su URL https absoluta. Sin ellas (desarrollo local)
 * la guarda en ./uploads y devuelve la ruta /uploads/<archivo>. El disco de Render es efímero: allí hay que
 * configurar Cloudinary o las fotos se pierden en cada reinicio.
 */
export async function guardarFoto(foto: Express.Multer.File): Promise<string> {
  if (cloudinaryConfigurado(process.env)) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
    return new Promise<string>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: 'consumos', resource_type: 'image' }, (error, resultado) => {
          if (error || !resultado) {
            reject(error ?? new Error('Cloudinary no devolvió resultado'));
          } else {
            resolve(resultado.secure_url);
          }
        })
        .end(foto.buffer);
    });
  }
  mkdirSync(UPLOADS_DIR, { recursive: true });
  const nombre = `${randomUUID()}${foto.mimetype === 'image/png' ? '.png' : '.jpg'}`;
  await writeFile(join(UPLOADS_DIR, nombre), foto.buffer);
  return `/uploads/${nombre}`;
}
