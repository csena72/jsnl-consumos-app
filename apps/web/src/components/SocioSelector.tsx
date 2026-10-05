import { useState } from 'react';
import { api } from '../api';
import { Boton, Campo, Input, Select, mensajeError } from './ui';
import type { Socio } from '../types';

interface Props {
  etiqueta?: string;
  /** Socio elegido (o su id si ya viene preseleccionado). */
  valor: string;
  onCambiar: (socioId: string) => void;
  requerido?: boolean;
  /** Socio ya conocido, para mostrarlo sin buscar. */
  inicial?: { id: string; numeroSocio: number; nombreCompleto: string } | null;
}

/** Busca socios activos por DNI, N° o nombre y permite elegir uno. */
export function SocioSelector({ etiqueta = 'Socio', valor, onCambiar, requerido = false, inicial = null }: Props) {
  const [q, setQ] = useState('');
  const [resultados, setResultados] = useState<Socio[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  async function buscar() {
    setBuscando(true);
    setError(null);
    try {
      const pagina = await api.socios({ q: q.trim(), limit: 10 });
      setResultados(pagina.data);
      if (pagina.data.length === 0) setError('Sin resultados');
    } catch (e) {
      setError(mensajeError(e, 'No se pudo buscar'));
    } finally {
      setBuscando(false);
    }
  }

  const opciones = [
    ...(inicial && !resultados.some((s) => s.id === inicial.id) ? [inicial] : []),
    ...resultados,
  ];

  return (
    <div className="space-y-2">
      <Campo etiqueta={`${etiqueta} (buscar por DNI, N° o nombre)`}>
        <div className="flex gap-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                void buscar();
              }
            }}
          />
          <Boton variante="secundario" disabled={buscando} onClick={() => void buscar()}>Buscar</Boton>
        </div>
      </Campo>
      {error && <p className="text-xs text-slate-500">{error}</p>}
      <Select required={requerido} aria-label={etiqueta} value={valor} onChange={(e) => onCambiar(e.target.value)}>
        <option value="">Elegí un socio…</option>
        {opciones.map((s) => (
          <option key={s.id} value={s.id}>{s.numeroSocio} · {s.nombreCompleto}</option>
        ))}
      </Select>
    </div>
  );
}
