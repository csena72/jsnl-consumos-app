import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import { ErrorBanner } from '../components/ui';

function periodoActual(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}${String(hoy.getMonth() + 1).padStart(2, '0')}`;
}

export function Exportar() {
  const [periodo, setPeriodo] = useState(periodoActual);
  const [error, setError] = useState<string | null>(null);
  const [descargando, setDescargando] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setDescargando(true);
    setError(null);
    try {
      const blob = await api.exportarCsv(periodo);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lecturas-${periodo}.csv`;
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
        Descarga el consolidado del período en CSV (compatible con Excel). Quedan fuera las lecturas
        rechazadas y las atípicas que todavía no fueron aprobadas.
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
        <button
          type="submit"
          disabled={descargando}
          className="rounded bg-sky-700 px-4 py-2 font-medium text-white hover:bg-sky-800 disabled:opacity-60"
        >
          {descargando ? 'Generando…' : 'Descargar CSV'}
        </button>
      </form>
    </div>
  );
}
