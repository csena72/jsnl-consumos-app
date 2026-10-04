import { subirEvidencia, sincronizarLote, type LecturaPayload } from '../api/endpoints';
import {
  asignarLote,
  crearLote,
  listarFotosPendientes,
  listarPendientes,
  marcarFotoSubida,
  registrarResultadoLote,
  type ResultadoLecturaSync,
} from '../database/lecturasRepository';
import type { ResultadoSync } from '../types';

/** Máximo de lecturas por lote que acepta la API. */
const TAMANO_LOTE = 500;

let enCurso: Promise<ResultadoSync> | null = null;

/**
 * Envía las lecturas pendientes y sus fotos. Si ya hay una sincronización corriendo
 * devuelve esa misma promesa, para evitar lotes duplicados (botón manual + red recuperada).
 */
export function sincronizarAhora(): Promise<ResultadoSync> {
  if (!enCurso) {
    enCurso = ejecutar().finally(() => {
      enCurso = null;
    });
  }
  return enCurso;
}

async function ejecutar(): Promise<ResultadoSync> {
  const resultado: ResultadoSync = {
    lecturasEnviadas: 0,
    lecturasRechazadas: 0,
    fotosSubidas: 0,
    fotosFallidas: 0,
  };

  const pendientes = await listarPendientes();
  for (let i = 0; i < pendientes.length; i += TAMANO_LOTE) {
    const grupo = pendientes.slice(i, i + TAMANO_LOTE);
    const idLote = await crearLote();
    await asignarLote(
      idLote,
      grupo.map((l) => l.id),
    );

    const payload: LecturaPayload[] = grupo.map((l) => ({
      medidorId: l.idMedidor,
      valorLectura: l.lecturaActual,
      periodo: l.periodo,
      fechaCaptura: l.fechaLectura,
      ...(l.observaciones ? { observaciones: l.observaciones } : {}),
    }));

    const respuesta = await sincronizarLote(payload);

    const remotoPorClave = new Map(respuesta.procesadas.map((p) => [`${p.medidorId}|${p.periodo}`, p.id]));
    const motivoPorClave = new Map(respuesta.rechazadas.map((r) => [`${r.medidorId}|${r.periodo}`, r.motivo]));

    const resultados: ResultadoLecturaSync[] = grupo.map((l) => {
      const clave = `${l.idMedidor}|${l.periodo}`;
      return {
        id: l.id,
        idRemoto: remotoPorClave.get(clave) ?? null,
        error: motivoPorClave.get(clave) ?? null,
      };
    });
    await registrarResultadoLote(idLote, resultados);
    resultado.lecturasEnviadas += resultados.filter((r) => r.idRemoto).length;
    resultado.lecturasRechazadas += resultados.filter((r) => !r.idRemoto).length;
  }

  // Las fotos se suben aparte: si fallan quedan pendientes y se reintentan en la próxima sincronización.
  for (const lectura of await listarFotosPendientes()) {
    if (!lectura.idRemoto || !lectura.fotoPath) continue;
    try {
      await subirEvidencia(lectura.idRemoto, lectura.fotoPath);
      await marcarFotoSubida(lectura.id);
      resultado.fotosSubidas += 1;
    } catch {
      resultado.fotosFallidas += 1;
    }
  }

  return resultado;
}
