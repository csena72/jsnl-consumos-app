import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { api, urlFoto } from '../api';
import { SocioSelector } from '../components/SocioSelector';
import { useCarga } from '../components/useCarga';
import {
  Badge,
  Boton,
  Campo,
  ErrorBanner,
  Foto,
  Input,
  Modal,
  Select,
  fechaCorta,
  mensajeError,
} from '../components/ui';
import type { EstadoReclamo, Reclamo, TipoReclamo } from '../types';

const ESTADOS: EstadoReclamo[] = ['PENDIENTE', 'EN_PROCESO', 'RESUELTO'];
const TONO = { PENDIENTE: 'amber', EN_PROCESO: 'sky', RESUELTO: 'green' } as const;
const TIPOS: Record<TipoReclamo, string> = {
  LECTURA_ERRONEA: 'Lectura errónea',
  FACTURACION: 'Facturación',
  MEDIDOR_DANADO: 'Medidor dañado',
  FALTA_SERVICIO: 'Falta de servicio',
  OTRO: 'Otro',
};
const etiquetaEstado = (e: EstadoReclamo): string => e.replace('_', ' ');

export function Reclamos() {
  const [estado, setEstado] = useState<EstadoReclamo | ''>('');
  const [tipo, setTipo] = useState<TipoReclamo | ''>('');
  const [creando, setCreando] = useState(false);
  const [cambiando, setCambiando] = useState<Reclamo | null>(null);
  const [abierto, setAbierto] = useState<string | null>(null);
  const cargar = useCallback(
    () => api.reclamos({ estado: estado || undefined, tipoReclamo: tipo || undefined }),
    [estado, tipo],
  );
  const { datos, error, cargando, recargar } = useCarga(cargar);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Reclamos</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filtrar por estado"
            value={estado}
            onChange={(e) => setEstado(e.target.value as EstadoReclamo | '')}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((s) => <option key={s} value={s}>{etiquetaEstado(s)}</option>)}
          </select>
          <select
            aria-label="Filtrar por tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value as TipoReclamo | '')}
            className="rounded border border-slate-300 bg-white px-2 py-1 text-sm"
          >
            <option value="">Todos los tipos</option>
            {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <Boton onClick={() => setCreando(true)}>Nuevo reclamo</Boton>
        </div>
      </div>

      {error && <ErrorBanner mensaje={error} />}
      {cargando && !datos && <p className="text-slate-400">Cargando…</p>}
      {datos?.length === 0 && <p className="text-slate-400">No hay reclamos.</p>}

      <ul className="space-y-3">
        {datos?.map((r) => (
          <li key={r.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <div>
                  <p className="mb-1 text-xs text-slate-500">Foto del reclamo</p>
                  <Foto src={urlFoto(r.fotoUrl)} alt="Fotografía del medidor enviada con el reclamo" />
                </div>
                {r.lectura && (
                  <div>
                    <p className="mb-1 text-xs text-slate-500">Foto de la lectura</p>
                    <Foto src={urlFoto(r.lectura.fotografiaUrl)} alt="Fotografía de la lectura" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium">{r.socio.nombreCompleto}</span>
                  <span className="text-xs text-slate-500">N° {r.socio.numeroSocio} · {fechaCorta(r.fechaCreacion)}</span>
                  <Badge tono={TONO[r.estado]}>{etiquetaEstado(r.estado)}</Badge>
                  <Badge tono="slate">{TIPOS[r.tipoReclamo]}</Badge>
                </div>
                <p className="mt-1 break-words text-sm">{r.descripcion}</p>
                {r.lectura && (
                  <p className="mt-1 text-xs text-slate-500">Lectura {r.lectura.periodo}: {r.lectura.valorLectura}</p>
                )}
              </div>
              <div className="flex items-start gap-2">
                <Boton variante="secundario" onClick={() => setAbierto(abierto === r.id ? null : r.id)}>
                  {abierto === r.id ? 'Ocultar historial' : 'Historial'}
                </Boton>
                <Boton onClick={() => setCambiando(r)}>Cambiar estado</Boton>
              </div>
            </div>
            {abierto === r.id && <Historial reclamoId={r.id} />}
          </li>
        ))}
      </ul>

      {creando && (
        <FormReclamo
          onCerrar={() => setCreando(false)}
          onCreado={() => {
            setCreando(false);
            recargar();
          }}
        />
      )}
      {cambiando && (
        <FormEstado
          reclamo={cambiando}
          onCerrar={() => setCambiando(null)}
          onListo={() => {
            setCambiando(null);
            recargar();
          }}
        />
      )}
    </div>
  );
}

function Historial({ reclamoId }: { reclamoId: string }) {
  const cargar = useCallback(() => api.reclamo(reclamoId), [reclamoId]);
  const { datos, error, cargando } = useCarga(cargar);
  return (
    <div className="mt-3 border-t border-slate-100 pt-3 text-sm">
      {error && <ErrorBanner mensaje={error} />}
      {cargando && !datos && <p className="text-slate-400">Cargando…</p>}
      <ol className="space-y-1">
        {datos?.historial.map((h, i) => (
          <li key={i} className="text-slate-700">
            <span className="text-xs text-slate-500">{fechaCorta(h.fecha)}</span>{' '}
            {h.estadoAnterior ? `${etiquetaEstado(h.estadoAnterior)} → ` : ''}
            <strong>{etiquetaEstado(h.estadoNuevo)}</strong>
            {h.usuario && <span className="text-slate-500"> · {h.usuario}</span>}
            {h.comentario && <span> — {h.comentario}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FormEstado({ reclamo, onCerrar, onListo }: { reclamo: Reclamo; onCerrar: () => void; onListo: () => void }) {
  const [estado, setEstado] = useState<EstadoReclamo>(reclamo.estado);
  const [comentario, setComentario] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await api.actualizarReclamo(reclamo.id, estado, comentario.trim());
      onListo();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo actualizar el reclamo'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Cambiar estado del reclamo" onCerrar={onCerrar}>
      <form onSubmit={(e) => void guardar(e)} className="space-y-3">
        <Campo etiqueta="Nuevo estado">
          <Select value={estado} onChange={(e) => setEstado(e.target.value as EstadoReclamo)}>
            {ESTADOS.map((s) => <option key={s} value={s}>{etiquetaEstado(s)}</option>)}
          </Select>
        </Campo>
        <Campo etiqueta="Comentario (queda en el historial)">
          <Input maxLength={500} value={comentario} onChange={(e) => setComentario(e.target.value)} />
        </Campo>
        {error && <ErrorBanner mensaje={error} />}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" disabled={guardando || estado === reclamo.estado}>Guardar</Boton>
        </div>
      </form>
    </Modal>
  );
}

function FormReclamo({ onCerrar, onCreado }: { onCerrar: () => void; onCreado: () => void }) {
  const [socioId, setSocioId] = useState('');
  const [tipoReclamo, setTipo] = useState<TipoReclamo>('LECTURA_ERRONEA');
  const [descripcion, setDescripcion] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const creado = await api.crearReclamo({ socioId, tipoReclamo, descripcion: descripcion.trim() });
      if (foto) {
        try {
          await api.subirFotoReclamo(creado.id, foto);
        } catch (err) {
          // El reclamo ya existe: se avisa y se cierra para no duplicarlo al reintentar.
          window.alert(`El reclamo se creó, pero la foto no se pudo subir: ${mensajeError(err, 'error desconocido')}`);
        }
      }
      onCreado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo crear el reclamo'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo="Nuevo reclamo" onCerrar={onCerrar}>
      <form onSubmit={(e) => void guardar(e)} className="space-y-3">
        <SocioSelector requerido valor={socioId} onCambiar={setSocioId} />
        <Campo etiqueta="Tipo de reclamo">
          <Select value={tipoReclamo} onChange={(e) => setTipo(e.target.value as TipoReclamo)}>
            {Object.entries(TIPOS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </Select>
        </Campo>
        <Campo etiqueta="Descripción">
          <textarea
            required
            minLength={3}
            maxLength={2000}
            rows={3}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          />
        </Campo>
        <Campo etiqueta="Fotografía del medidor (opcional, JPG/PNG)">
          <input
            type="file"
            accept="image/jpeg,image/png"
            onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
        </Campo>
        {error && <ErrorBanner mensaje={error} />}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" disabled={guardando || !socioId}>Crear reclamo</Boton>
        </div>
      </form>
    </Modal>
  );
}
