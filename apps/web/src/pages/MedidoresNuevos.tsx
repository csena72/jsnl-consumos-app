import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { api, urlFoto } from '../api';
import { SocioSelector } from '../components/SocioSelector';
import { useCarga } from '../components/useCarga';
import {
  Badge,
  Boton,
  Campo,
  ETIQUETA_SERVICIO,
  ErrorBanner,
  Foto,
  Input,
  Modal,
  Select,
  fechaCorta,
  mensajeError,
  textoOpcional,
} from '../components/ui';
import type { EstadoPendienteAlta, EstadoPrecinto, MedidorNuevo } from '../types';

const ESTADOS: EstadoPendienteAlta[] = ['PENDIENTE', 'APROBADO', 'RECHAZADO'];
const TONO = { PENDIENTE: 'amber', APROBADO: 'green', RECHAZADO: 'red' } as const;
const PRECINTOS: EstadoPrecinto[] = ['INTACTO', 'VIOLADO', 'SIN_PRECINTO'];
const cargarLocalidades = () => api.localidades();

export function MedidoresNuevos() {
  const [estado, setEstado] = useState<EstadoPendienteAlta>('PENDIENTE');
  const [aprobando, setAprobando] = useState<MedidorNuevo | null>(null);
  const [rechazando, setRechazando] = useState<MedidorNuevo | null>(null);
  const cargar = useCallback(() => api.medidoresNuevos(estado), [estado]);
  const { datos, error, cargando, recargar } = useCarga(cargar);

  function terminado() {
    setAprobando(null);
    setRechazando(null);
    recargar();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Auditoría de medidores nuevos</h1>
      <p className="text-sm text-slate-600">
        Medidores hallados en campo por los operarios. Al aprobarlos se vinculan a un socio y pasan a formar parte del padrón.
      </p>

      <div className="flex gap-1" role="tablist" aria-label="Estado de la solicitud">
        {ESTADOS.map((e) => (
          <button
            key={e}
            role="tab"
            aria-selected={estado === e}
            onClick={() => setEstado(e)}
            className={`rounded px-3 py-1.5 text-sm ${estado === e ? 'bg-sky-100 font-medium text-sky-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {e.charAt(0) + e.slice(1).toLowerCase()}s
          </button>
        ))}
      </div>

      {error && <ErrorBanner mensaje={error} />}
      {cargando && !datos && <p className="text-slate-400">Cargando…</p>}
      {datos?.length === 0 && <p className="text-slate-400">No hay solicitudes en este estado.</p>}

      <ul className="space-y-3">
        {datos?.map((m) => (
          <li key={m.id} className="flex flex-wrap gap-4 rounded-lg border border-slate-200 bg-white p-4">
            <Foto src={urlFoto(m.fotoUrl)} alt={`Medidor ${m.numeroSerie}`} />
            <div className="min-w-0 flex-1 space-y-1 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{m.numeroSerie}</span>
                <Badge tono={m.tipoServicio === 'AGUA' ? 'sky' : 'amber'}>{ETIQUETA_SERVICIO[m.tipoServicio]}</Badge>
                <Badge tono={TONO[m.estado]}>{m.estado}</Badge>
                {m.estadoPrecinto !== 'INTACTO' && <Badge tono="red">Precinto {m.estadoPrecinto.replace('_', ' ').toLowerCase()}</Badge>}
              </div>
              <p className="text-slate-600">
                {m.localidad?.nombre ?? 'Sin localidad'}
                {m.numeroCaja && ` · caja ${m.numeroCaja}`}
                {m.direccionReferencia && ` · ${m.direccionReferencia}`}
              </p>
              {m.observaciones && <p className="break-words">{m.observaciones}</p>}
              <p className="text-xs text-slate-500">
                Reportado por {m.reportadoPor} el {fechaCorta(m.fechaCreacion)}
                {m.revisadoPor && m.fechaRevision && ` · revisado por ${m.revisadoPor} el ${fechaCorta(m.fechaRevision)}`}
              </p>
              {m.motivoRechazo && <p className="text-xs text-red-700">Motivo: {m.motivoRechazo}</p>}
            </div>
            {m.estado === 'PENDIENTE' && (
              <div className="flex items-start gap-2">
                <Boton onClick={() => setAprobando(m)}>Aprobar</Boton>
                <Boton variante="peligro" onClick={() => setRechazando(m)}>Rechazar</Boton>
              </div>
            )}
          </li>
        ))}
      </ul>

      {aprobando && <FormAprobar medidor={aprobando} onCerrar={() => setAprobando(null)} onListo={terminado} />}
      {rechazando && <FormRechazar medidor={rechazando} onCerrar={() => setRechazando(null)} onListo={terminado} />}
    </div>
  );
}

function FormAprobar({ medidor, onCerrar, onListo }: { medidor: MedidorNuevo; onCerrar: () => void; onListo: () => void }) {
  const [socioId, setSocioId] = useState('');
  const [localidadId, setLocalidadId] = useState(medidor.localidad?.id ?? '');
  const [rutaId, setRutaId] = useState('');
  const [numeroCaja, setCaja] = useState(medidor.numeroCaja ?? '');
  const [estadoPrecinto, setPrecinto] = useState<EstadoPrecinto>(medidor.estadoPrecinto);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const localidades = useCarga(cargarLocalidades);
  const cargarRutas = useCallback(() => api.rutas(localidadId || undefined), [localidadId]);
  const rutas = useCarga(cargarRutas);

  async function aprobar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await api.aprobarMedidorNuevo(medidor.id, {
        socioId,
        localidadId: localidadId || undefined,
        rutaId: rutaId || undefined,
        numeroCaja: textoOpcional(numeroCaja),
        estadoPrecinto,
      });
      onListo();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo aprobar la solicitud'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={`Aprobar medidor ${medidor.numeroSerie}`} onCerrar={onCerrar}>
      <form onSubmit={(e) => void aprobar(e)} className="space-y-3">
        <SocioSelector requerido etiqueta="Socio al que se vincula" valor={socioId} onCambiar={setSocioId} />
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Localidad">
            <Select
              value={localidadId}
              onChange={(e) => {
                setLocalidadId(e.target.value);
                setRutaId('');
              }}
            >
              <option value="">Sin asignar</option>
              {localidades.datos?.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </Select>
          </Campo>
          <Campo etiqueta="Ruta (al final del recorrido)">
            <Select value={rutaId} onChange={(e) => setRutaId(e.target.value)} disabled={!localidadId}>
              <option value="">Sin ruta</option>
              {rutas.datos?.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </Select>
          </Campo>
          <Campo etiqueta="N° de caja">
            <Input value={numeroCaja} onChange={(e) => setCaja(e.target.value)} />
          </Campo>
          <Campo etiqueta="Estado del precinto">
            <Select value={estadoPrecinto} onChange={(e) => setPrecinto(e.target.value as EstadoPrecinto)}>
              {PRECINTOS.map((p) => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
            </Select>
          </Campo>
        </div>
        {error && <ErrorBanner mensaje={error} />}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" disabled={guardando || !socioId}>Aprobar y crear medidor</Boton>
        </div>
      </form>
    </Modal>
  );
}

function FormRechazar({ medidor, onCerrar, onListo }: { medidor: MedidorNuevo; onCerrar: () => void; onListo: () => void }) {
  const [motivo, setMotivo] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function rechazar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await api.rechazarMedidorNuevo(medidor.id, motivo.trim());
      onListo();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo rechazar la solicitud'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={`Rechazar medidor ${medidor.numeroSerie}`} onCerrar={onCerrar}>
      <form onSubmit={(e) => void rechazar(e)} className="space-y-3">
        <Campo etiqueta="Motivo del rechazo">
          <Input required minLength={3} maxLength={300} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
        </Campo>
        {error && <ErrorBanner mensaje={error} />}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" variante="peligro" disabled={guardando}>Rechazar</Boton>
        </div>
      </form>
    </Modal>
  );
}
