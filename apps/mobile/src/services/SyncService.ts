import axios from 'axios';
import { mensajeDeError } from '../api/client';
import {
  reportarMedidorNuevo,
  sincronizarLote,
  subirEvidencia,
  subirFotoMedidorNuevo,
  type LecturaPayload,
  type MedidorNuevoPayload,
} from '../api/endpoints';
import {
  asignarLote,
  crearLote,
  listarFotosPendientes,
  listarPendientes,
  marcarFotoSubida,
  registrarResultadoLote,
  type ResultadoLecturaSync,
} from '../database/lecturasRepository';
import {
  listarNuevosPorEnviar,
  marcarNuevoFotoSubida,
  marcarNuevoRechazado,
  marcarNuevoSincronizado,
} from '../database/medidoresNuevosRepository';
import type { MedidorNuevoPendiente, ResultadoSync } from '../types';

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
    medidoresNuevosEnviados: 0,
    medidoresNuevosFallidos: 0,
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

  await sincronizarMedidoresNuevos(resultado);
  return resultado;
}

/** La API no tiene campos para socio ni lectura inicial: viajan en las observaciones para el administrador. */
function aPayload(m: MedidorNuevoPendiente): MedidorNuevoPayload {
  const notas = [
    m.socioId ? `Socio informado: ${m.socioId}` : null,
    m.lecturaInicial !== null ? `Lectura inicial: ${m.lecturaInicial}` : null,
    m.observaciones,
  ].filter((n): n is string => Boolean(n));
  return {
    numeroSerie: m.numeroSerie,
    tipoServicio: m.tipoServicio,
    ...(m.numeroCaja ? { numeroCaja: m.numeroCaja } : {}),
    ...(m.localidadId ? { localidadId: m.localidadId } : {}),
    ...(m.direccionReferencia ? { direccionReferencia: m.direccionReferencia } : {}),
    ...(notas.length ? { observaciones: notas.join('\n') } : {}),
  };
}

/** Un 4xx (salvo 401/408/429) es un rechazo definitivo de la API; todo lo demás se reintenta luego. */
function esRechazoDefinitivo(error: unknown): boolean {
  if (!axios.isAxiosError(error) || !error.response) return false;
  const { status } = error.response;
  return status >= 400 && status < 500 && status !== 401 && status !== 408 && status !== 429;
}

/** Paso 1: crea la solicitud (JSON). Paso 2: sube la foto con el id devuelto. Cada paso se reintenta por separado. */
async function sincronizarMedidoresNuevos(resultado: ResultadoSync): Promise<void> {
  for (const m of await listarNuevosPorEnviar()) {
    try {
      let idRemoto = m.idRemoto;
      if (!m.sincronizado || !idRemoto) {
        idRemoto = (await reportarMedidorNuevo(aPayload(m))).id;
        await marcarNuevoSincronizado(m.idLocal, idRemoto);
      }
      if (!m.fotoSubida) {
        await subirFotoMedidorNuevo(idRemoto, m.fotoPathLocal);
        await marcarNuevoFotoSubida(m.idLocal);
      }
      resultado.medidoresNuevosEnviados += 1;
    } catch (error) {
      if (esRechazoDefinitivo(error) && !m.sincronizado) {
        await marcarNuevoRechazado(m.idLocal, mensajeDeError(error));
      }
      resultado.medidoresNuevosFallidos += 1;
    }
  }
}
