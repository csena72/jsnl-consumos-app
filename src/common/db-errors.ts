import { ConflictException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';

function codigoPg(e: unknown): string | undefined {
  if (!(e instanceof QueryFailedError)) return undefined;
  return (e.driverError as { code?: string } | undefined)?.code;
}

/** Traduce violaciones de unicidad / clave foránea de PostgreSQL a 409; relanza cualquier otro error. */
export function traducirErrorDb(e: unknown, mensajes: { unico?: string; referencia?: string }): never {
  const codigo = codigoPg(e);
  if (codigo === '23505') throw new ConflictException(mensajes.unico ?? 'Ya existe un registro con esos datos');
  if (codigo === '23503') {
    throw new ConflictException(mensajes.referencia ?? 'El registro está referenciado por otros datos');
  }
  throw e;
}
