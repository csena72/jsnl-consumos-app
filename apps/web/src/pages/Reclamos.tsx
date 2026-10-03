import { useCallback, useState } from 'react';
import { api, urlFoto } from '../api';
import { useCarga } from '../components/useCarga';
import { Badge, ErrorBanner, Foto, fechaCorta } from '../components/ui';
import type { EstadoReclamo } from '../types';

const ESTADOS: EstadoReclamo[] = ['PENDIENTE', 'EN_REVISION', 'RESUELTO'];
const TONO = { PENDIENTE: 'amber', EN_REVISION: 'sky', RESUELTO: 'green' } as const;

export function Reclamos() {
  const [filtro, setFiltro] = useState<EstadoReclamo | ''>('');
  const [accionError, setAccionError] = useState<string | null>(null);
  const cargar = useCallback(() => api.reclamos(filtro || undefined), [filtro]);
  const { datos, error, cargando, recargar } = useCarga(cargar);

  async function cambiarEstado(id: string, estado: EstadoReclamo) {
    setAccionError(null);
    try {
      await api.actualizarReclamo(id, estado);
      recargar();
    } catch (e) {
      setAccionError(e instanceof Error ? e.message : 'No se pudo actualizar el reclamo');
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Reclamos</h1>
        <select
          aria-label="Filtrar por estado"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value as EstadoReclamo | '')}
          className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
        >
          <option value="">Todos</option>
          {ESTADOS.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {error && <ErrorBanner mensaje={error} />}
      {accionError && <ErrorBanner mensaje={accionError} />}
      {cargando && !datos && <p className="text-slate-400">Cargando…</p>}
      {datos?.length === 0 && <p className="text-slate-400">No hay reclamos.</p>}

      <ul className="space-y-3">
        {datos?.map((r) => (
          <li key={r.id} className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex gap-2">
              <div>
                <p className="mb-1 text-xs text-slate-500">Evidencia</p>
                <Foto src={urlFoto(r.fotoEvidenciaUrl)} alt="Evidencia del reclamo" />
              </div>
              {r.lectura && (
                <div>
                  <p className="mb-1 text-xs text-slate-500">Medidor</p>
                  <Foto src={urlFoto(r.lectura.fotografiaUrl)} alt="Fotografía del medidor" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{r.socio.nombreCompleto}</span>
                <span className="text-xs text-slate-500">N° {r.socio.numeroSocio} · {fechaCorta(r.fechaIngreso)}</span>
                <Badge tono={TONO[r.estado]}>{r.estado.replace('_', ' ')}</Badge>
              </div>
              <p className="mt-1 break-words text-sm">{r.motivo}</p>
              {r.lectura && (
                <p className="mt-1 text-xs text-slate-500">Lectura {r.lectura.periodo}: {r.lectura.valorLectura}</p>
              )}
            </div>
            <label className="self-start text-sm">
              <span className="sr-only">Estado</span>
              <select
                value={r.estado}
                onChange={(e) => void cambiarEstado(r.id, e.target.value as EstadoReclamo)}
                className="rounded border border-slate-300 bg-white px-2 py-1"
              >
                {ESTADOS.map((s) => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
