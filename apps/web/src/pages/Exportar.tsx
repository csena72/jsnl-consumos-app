import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import { ErrorBanner, Select } from '../components/ui';
import type { FiltroExportacion } from '../types';

const REPORTES: { valor: FiltroExportacion; etiqueta: string; descripcion: string }[] = [
  { valor: 'PROCESADAS', etiqueta: 'Procesadas correctamente', descripcion: 'Lecturas validadas, listas para facturar. Quedan fuera las rechazadas y las atípicas sin aprobar.' },
  { valor: 'ATIPICAS', etiqueta: 'Atípicas', descripcion: 'Solo las lecturas con desvío mayor al 40%, cualquiera sea su estado de revisión.' },
  { valor: 'TODAS', etiqueta: 'Todas', descripcion: 'Padrón completo de lecturas del período, sin excluir ninguna.' },
];

function periodoActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}`;
}

export function Exportar() {
  const [periodo, setPeriodo] = useState(periodoActual);
  const [filtro, setFiltro] = useState<FiltroExportacion>('PROCESADAS');
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setDescargando(true);
    setError(null);
    try {
      const blob = await api.exportarCsv(periodo, filtro);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lecturas-${filtro.toLowerCase()}-${periodo}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo exportar');
    } finally {
      setDescargando(false);
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Exportar para facturación</h1>
      <p className="text-sm text-slate-600">
        Descargá el reporte del período en CSV (compatible con Excel). Elegí qué lecturas incluir.
      </p>
      {error && <ErrorBanner mensaje={error} />}
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <label className="text-sm">
          Período (AAAAMM)
          <input
            required
            inputMode="numeric"
            pattern="\d{4}(0[1-9]|1[0-2])"
            title="Formato AAAAMM, por ejemplo 202610"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="mt-1 block w-36 rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Tipo de reporte
          <Select value={filtro} onChange={(e) => setFiltro(e.target.value as FiltroExportacion)} className="mt-1 w-64">
            {REPORTES.map((r) => <option key={r.valor} value={r.valor}>{r.etiqueta}</option>)}
          </Select>
        </label>
        <button
          type="submit"
          disabled={descargando}
          className="rounded bg-sky-700 px-4 py-2 font-medium text-white hover:bg-sky-800 disabled:opacity-60"
        >
          {descargando ? 'Generando…' : 'Descargar CSV'}
        </button>
      </form>
      <p className="text-xs text-slate-500">{REPORTES.find((r) => r.valor === filtro)?.descripcion}</p>
    </div>
  );
}
