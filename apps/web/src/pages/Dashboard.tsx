import { useCallback, useState } from 'react';
import { api, urlFoto } from '../api';
import { useCarga } from '../components/useCarga';
import { Badge, ErrorBanner, Foto, fechaCorta } from '../components/ui';
import type { EstadoRevision, LecturaAtipica } from '../types';

const TONO_ESTADO = { PENDIENTE: 'amber', APROBADA: 'green', RECHAZADA: 'red' } as const;

function Metrica({ titulo, valor, alerta = false }: { titulo: string; valor: number; alerta?: boolean }) {
  return (
    <div className={`rounded-lg border p-4 ${alerta ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>
      <p className="text-sm text-slate-500">{titulo}</p>
      <p className={`mt-1 text-3xl font-semibold ${alerta ? 'text-amber-700' : ''}`}>{valor}</p>
    </div>
  );
}

export function Dashboard() {
  const [filtro, setFiltro] = useState<EstadoRevision>('PENDIENTE');
  const [accionError, setAccionError] = useState<string | null>(null);
  const [procesando, setProcesando] = useState<string | null>(null);

  const cargarResumen = useCallback(() => api.resumen(), []);
  const cargarAtipicas = useCallback(() => api.atipicas(filtro), [filtro]);
  const resumen = useCarga(cargarResumen);
  const atipicas = useCarga(cargarAtipicas);

  async function revisar(l: LecturaAtipica, accion: 'aprobar' | 'rechazar') {
    const verbo = accion === 'aprobar' ? 'aprobar' : 'rechazar';
    if (!window.confirm(`¿Confirmás ${verbo} la lectura de ${l.socio.nombreCompleto} (${l.valorLectura})?`)) return;
    setProcesando(l.id);
    setAccionError(null);
    try {
      await api.revisarLectura(l.id, accion);
      atipicas.recargar();
      resumen.recargar();
    } catch (e) {
      setAccionError(e instanceof Error ? e.message : 'No se pudo actualizar la lectura');
    } finally {
      setProcesando(null);
    }
  }

  const r = resumen.datos;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {resumen.error && <ErrorBanner mensaje={resumen.error} />}
      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Metrica titulo="Lotes procesados" valor={r?.totalLotes ?? 0} />
        <Metrica titulo="Lecturas recibidas" valor={r?.totalLecturas ?? 0} />
        <Metrica titulo="Atípicas (> 40%)" valor={r?.totalAtipicas ?? 0} />
        <Metrica titulo="Atípicas pendientes" valor={r?.atipicasPendientes ?? 0} alerta={(r?.atipicasPendientes ?? 0) > 0} />
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Lecturas atípicas</h2>
          <select
            aria-label="Filtrar por estado"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value as EstadoRevision)}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="PENDIENTE">Pendientes</option>
            <option value="APROBADA">Aprobadas</option>
            <option value="RECHAZADA">Rechazadas</option>
          </select>
        </div>

        {accionError && <ErrorBanner mensaje={accionError} />}
        {atipicas.error && <ErrorBanner mensaje={atipicas.error} />}

        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-3 py-2">Socio</th>
                <th className="px-3 py-2">Medidor</th>
                <th className="px-3 py-2">Período</th>
                <th className="px-3 py-2 text-right">Lectura</th>
                <th className="px-3 py-2 text-right">Promedio</th>
                <th className="px-3 py-2 text-right">Desvío</th>
                <th className="px-3 py-2">Foto</th>
                <th className="px-3 py-2">Estado</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {atipicas.cargando && !atipicas.datos && (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-slate-400">Cargando…</td></tr>
              )}
              {atipicas.datos?.length === 0 && (
                <tr><td colSpan={9} className="px-3 py-6 text-center text-slate-400">No hay lecturas en este estado</td></tr>
              )}
              {atipicas.datos?.map((l) => (
                <tr key={l.id} className="border-t border-slate-100 align-middle">
                  <td className="px-3 py-2">
                    <div className="font-medium">{l.socio.nombreCompleto}</div>
                    <div className="text-xs text-slate-500">N° {l.socio.numeroSocio} · {l.operarioNombre} · {fechaCorta(l.fechaCaptura)}</div>
                  </td>
                  <td className="px-3 py-2">{l.medidor.numeroSerie}</td>
                  <td className="px-3 py-2">{l.periodo}</td>
                  <td className="px-3 py-2 text-right">{l.valorLectura}</td>
                  <td className="px-3 py-2 text-right">{l.promedioHistorico ?? '—'}</td>
                  <td className="px-3 py-2 text-right font-medium text-amber-700">
                    {l.desvioPorcentaje === null ? '—' : `${l.desvioPorcentaje > 0 ? '+' : ''}${l.desvioPorcentaje}%`}
                  </td>
                  <td className="px-3 py-2"><Foto src={urlFoto(l.fotografiaUrl)} alt={`Medidor ${l.medidor.numeroSerie}`} /></td>
                  <td className="px-3 py-2"><Badge tono={TONO_ESTADO[l.estadoRevision]}>{l.estadoRevision}</Badge></td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    {l.estadoRevision === 'PENDIENTE' && (
                      <>
                        <button
                          disabled={procesando === l.id}
                          onClick={() => void revisar(l, 'aprobar')}
                          className="mr-2 rounded bg-green-600 px-2 py-1 text-white hover:bg-green-700 disabled:opacity-50"
                        >
                          Aprobar
                        </button>
                        <button
                          disabled={procesando === l.id}
                          onClick={() => void revisar(l, 'rechazar')}
                          className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Rechazar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
