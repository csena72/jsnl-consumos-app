import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import { SocioSelector } from '../components/SocioSelector';
import { useCarga } from '../components/useCarga';
import {
  Badge,
  Boton,
  Campo,
  ETIQUETA_SERVICIO,
  ErrorBanner,
  Input,
  Modal,
  Paginador,
  Select,
  Tabla,
  mensajeError,
  textoOpcional,
} from '../components/ui';
import type { EstadoPrecinto, Localidad, Medidor, TipoServicio } from '../types';

const LIMITE = 15;
const PRECINTOS: EstadoPrecinto[] = ['INTACTO', 'VIOLADO', 'SIN_PRECINTO'];
const cargarLocalidades = () => api.localidades();

export function Medidores() {
  const [tipo, setTipo] = useState<TipoServicio | ''>('');
  const [localidadId, setLocalidadId] = useState('');
  const [q, setQ] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [bajas, setBajas] = useState(false);
  const [page, setPage] = useState(1);
  const [editando, setEditando] = useState<Medidor | 'nuevo' | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  const localidades = useCarga(cargarLocalidades);
  const cargar = useCallback(
    () =>
      api.medidores({
        tipoServicio: tipo,
        localidadId,
        q: busqueda,
        estado: bajas ? 'INACTIVO' : 'ACTIVO',
        page,
        limit: LIMITE,
      }),
    [tipo, localidadId, busqueda, bajas, page],
  );
  const { datos, error, cargando, recargar } = useCarga(cargar);

  async function cambiarEstado(m: Medidor) {
    const baja = m.estado === 'ACTIVO';
    if (baja && !window.confirm(`¿Dar de baja el medidor ${m.numeroSerie}?`)) return;
    setAccionError(null);
    try {
      await (baja ? api.bajaMedidor(m.id) : api.editarMedidor(m.id, { estado: 'ACTIVO' }));
      recargar();
    } catch (e) {
      setAccionError(mensajeError(e, 'No se pudo actualizar el medidor'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Medidores</h1>
        <Boton onClick={() => setEditando('nuevo')}>Nuevo medidor</Boton>
      </div>

      <div className="flex gap-1" role="tablist" aria-label="Tipo de servicio">
        {([['', 'Todos'], ['ENERGIA', 'Energía'], ['AGUA', 'Agua']] as const).map(([valor, etiqueta]) => (
          <button
            key={valor}
            role="tab"
            aria-selected={tipo === valor}
            onClick={() => {
              setPage(1);
              setTipo(valor);
            }}
            className={`rounded px-3 py-1.5 text-sm ${tipo === valor ? 'bg-sky-100 font-medium text-sky-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            {etiqueta}
          </button>
        ))}
      </div>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setBusqueda(q.trim());
        }}
      >
        <div className="w-56">
          <Campo etiqueta="N° de serie o de caja">
            <Input value={q} onChange={(e) => setQ(e.target.value)} />
          </Campo>
        </div>
        <div className="w-48">
          <Campo etiqueta="Localidad">
            <Select
              value={localidadId}
              onChange={(e) => {
                setPage(1);
                setLocalidadId(e.target.value);
              }}
            >
              <option value="">Todas</option>
              {localidades.datos?.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </Select>
          </Campo>
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm">
          <input
            type="checkbox"
            checked={bajas}
            onChange={(e) => {
              setPage(1);
              setBajas(e.target.checked);
            }}
          />
          Ver bajas
        </label>
        <Boton type="submit" variante="secundario">Buscar</Boton>
      </form>

      {error && <ErrorBanner mensaje={error} />}
      {accionError && <ErrorBanner mensaje={accionError} />}
      {cargando && !datos && <p className="text-slate-400">Cargando…</p>}
      {datos && (
        <>
          <Tabla columnas={['Serie', 'Servicio', 'Caja', 'Precinto', 'Socio', 'Localidad / Ruta', '']}>
            {datos.data.map((m) => (
              <tr key={m.id}>
                <td className="px-3 py-2 font-medium">{m.numeroSerie}</td>
                <td className="px-3 py-2">
                  <Badge tono={m.tipoServicio === 'AGUA' ? 'sky' : 'amber'}>{ETIQUETA_SERVICIO[m.tipoServicio]}</Badge>
                </td>
                <td className="px-3 py-2">{m.numeroCaja ?? '—'}</td>
                <td className="px-3 py-2">
                  <Badge tono={m.estadoPrecinto === 'INTACTO' ? 'green' : 'red'}>{m.estadoPrecinto.replace('_', ' ')}</Badge>
                </td>
                <td className="px-3 py-2">{m.socio.numeroSocio} · {m.socio.nombreCompleto}</td>
                <td className="px-3 py-2">
                  {m.localidad?.nombre ?? '—'}
                  {m.ruta && <span className="text-slate-500"> / {m.ruta.nombre} #{m.ordenSecuencia}</span>}
                </td>
                <td className="space-x-2 whitespace-nowrap px-3 py-2 text-right">
                  <Boton variante="secundario" onClick={() => setEditando(m)}>Editar</Boton>
                  <Boton variante={bajas ? 'secundario' : 'peligro'} onClick={() => void cambiarEstado(m)}>
                    {bajas ? 'Reactivar' : 'Dar de baja'}
                  </Boton>
                </td>
              </tr>
            ))}
          </Tabla>
          {datos.data.length === 0 && <p className="text-slate-400">No hay medidores para ese filtro.</p>}
          <Paginador page={datos.page} limit={datos.limit} total={datos.total} onCambiar={setPage} />
        </>
      )}

      {editando && (
        <FormMedidor
          medidor={editando === 'nuevo' ? null : editando}
          localidades={localidades.datos ?? []}
          onCerrar={() => setEditando(null)}
          onGuardado={() => {
            setEditando(null);
            recargar();
          }}
        />
      )}
    </div>
  );
}

function FormMedidor({
  medidor,
  localidades,
  onCerrar,
  onGuardado,
}: {
  medidor: Medidor | null;
  localidades: Localidad[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [numeroSerie, setSerie] = useState(medidor?.numeroSerie ?? '');
  const [tipoServicio, setTipo] = useState<TipoServicio>(medidor?.tipoServicio ?? 'AGUA');
  const [socioId, setSocioId] = useState(medidor?.socio.id ?? '');
  const [numeroCaja, setCaja] = useState(medidor?.numeroCaja ?? '');
  const [estadoPrecinto, setPrecinto] = useState<EstadoPrecinto>(medidor?.estadoPrecinto ?? 'INTACTO');
  const [localidadId, setLocalidadId] = useState(medidor?.localidad?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const datos = {
      numeroSerie: numeroSerie.trim(),
      tipoServicio,
      socioId,
      numeroCaja: textoOpcional(numeroCaja),
      estadoPrecinto,
      localidadId: localidadId || undefined,
    };
    try {
      await (medidor ? api.editarMedidor(medidor.id, datos) : api.crearMedidor(datos));
      onGuardado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el medidor'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={medidor ? 'Editar medidor' : 'Nuevo medidor'} onCerrar={onCerrar}>
      <form onSubmit={(e) => void guardar(e)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="N° de serie">
            <Input required value={numeroSerie} onChange={(e) => setSerie(e.target.value)} />
          </Campo>
          <Campo etiqueta="Servicio">
            <Select value={tipoServicio} onChange={(e) => setTipo(e.target.value as TipoServicio)}>
              <option value="AGUA">Agua</option>
              <option value="ENERGIA">Energía</option>
            </Select>
          </Campo>
        </div>
        <SocioSelector requerido valor={socioId} onCambiar={setSocioId} inicial={medidor?.socio} />
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta={`N° de caja (${ETIQUETA_SERVICIO[tipoServicio]})`}>
            <Input value={numeroCaja} onChange={(e) => setCaja(e.target.value)} />
          </Campo>
          <Campo etiqueta="Estado del precinto">
            <Select value={estadoPrecinto} onChange={(e) => setPrecinto(e.target.value as EstadoPrecinto)}>
              {PRECINTOS.map((p) => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
            </Select>
          </Campo>
        </div>
        <Campo etiqueta="Localidad">
          <Select value={localidadId} onChange={(e) => setLocalidadId(e.target.value)}>
            <option value="">Sin asignar</option>
            {localidades.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
          </Select>
        </Campo>
        {error && <ErrorBanner mensaje={error} />}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" disabled={guardando}>Guardar</Boton>
        </div>
      </form>
    </Modal>
  );
}
