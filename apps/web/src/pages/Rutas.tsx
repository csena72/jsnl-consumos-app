import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import { useCarga } from '../components/useCarga';
import {
  Badge,
  Boton,
  Campo,
  ETIQUETA_SERVICIO,
  ErrorBanner,
  Input,
  Modal,
  Select,
  mensajeError,
} from '../components/ui';
import type { Localidad, Medidor, Ruta, RutaDetalle, RutaMedidor } from '../types';

type Item = Pick<RutaMedidor, 'id' | 'numeroSerie' | 'tipoServicio' | 'numeroCaja' | 'numeroSocio' | 'nombreCompleto'>;
const cargarLocalidades = () => api.localidades();

const aItem = (m: Medidor): Item => ({
  id: m.id,
  numeroSerie: m.numeroSerie,
  tipoServicio: m.tipoServicio,
  numeroCaja: m.numeroCaja,
  numeroSocio: m.socio.numeroSocio,
  nombreCompleto: m.socio.nombreCompleto,
});

export function Rutas() {
  const [localidadId, setLocalidadId] = useState('');
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [formRuta, setFormRuta] = useState<Ruta | 'nueva' | null>(null);

  const localidades = useCarga(cargarLocalidades);
  const cargar = useCallback(() => api.rutas(localidadId || undefined), [localidadId]);
  const rutas = useCarga(cargar);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Rutas de lectura</h1>
        <Boton onClick={() => setFormRuta('nueva')}>Nueva ruta</Boton>
      </div>
      <div className="grid gap-4 md:grid-cols-[18rem_1fr]">
        <aside className="space-y-3">
          <Campo etiqueta="Pueblo / paraje">
            <Select value={localidadId} onChange={(e) => setLocalidadId(e.target.value)}>
              <option value="">Todos</option>
              {localidades.datos?.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </Select>
          </Campo>
          {rutas.error && <ErrorBanner mensaje={rutas.error} />}
          <ul className="space-y-1">
            {rutas.datos?.map((r) => (
              <li key={r.id}>
                <button
                  onClick={() => setSeleccionada(r.id)}
                  className={`w-full rounded border px-3 py-2 text-left text-sm ${seleccionada === r.id ? 'border-sky-400 bg-sky-50' : 'border-slate-200 bg-white hover:bg-slate-50'}`}
                >
                  <span className="font-medium">{r.nombre}</span>{' '}
                  {!r.activa && <Badge tono="slate">Inactiva</Badge>}
                  <span className="block text-xs text-slate-500">
                    {r.localidad.nombre} · {r.totalMedidores} medidor{r.totalMedidores === 1 ? '' : 'es'}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {rutas.datos?.length === 0 && <p className="text-sm text-slate-400">No hay rutas.</p>}
        </aside>

        <section>
          {seleccionada ? (
            <EditorRuta
              key={seleccionada}
              rutaId={seleccionada}
              onEditar={(r) => setFormRuta(r)}
              onCambio={rutas.recargar}
              onEliminada={() => {
                setSeleccionada(null);
                rutas.recargar();
              }}
            />
          ) : (
            <p className="text-slate-400">Elegí una ruta para armar el recorrido de lectura.</p>
          )}
        </section>
      </div>

      {formRuta && (
        <FormRuta
          ruta={formRuta === 'nueva' ? null : formRuta}
          localidades={localidades.datos ?? []}
          localidadInicial={localidadId}
          onCerrar={() => setFormRuta(null)}
          onGuardada={(id) => {
            setFormRuta(null);
            setSeleccionada(id);
            rutas.recargar();
          }}
        />
      )}
    </div>
  );
}

function EditorRuta({
  rutaId,
  onEditar,
  onCambio,
  onEliminada,
}: {
  rutaId: string;
  onEditar: (r: Ruta) => void;
  onCambio: () => void;
  onEliminada: () => void;
}) {
  const cargar = useCallback(() => api.ruta(rutaId), [rutaId]);
  const { datos: ruta, error, recargar } = useCarga(cargar);
  const [items, setItems] = useState<Item[]>([]);
  const [original, setOriginal] = useState<string[]>([]);
  const [accionError, setAccionError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!ruta) return;
    setItems(ruta.medidores);
    setOriginal(ruta.medidores.map((m) => m.id));
  }, [ruta]);

  const modificado = items.map((i) => i.id).join() !== original.join();

  function mover(indice: number, delta: -1 | 1) {
    const destino = indice + delta;
    setItems((actual) => {
      const copia = [...actual];
      const [movido] = copia.splice(indice, 1);
      if (!movido) return actual;
      copia.splice(destino, 0, movido);
      return copia;
    });
  }

  async function guardarOrden() {
    setGuardando(true);
    setAccionError(null);
    try {
      await api.ordenarRuta(rutaId, items.map((i) => i.id));
      recargar();
      onCambio();
    } catch (e) {
      setAccionError(mensajeError(e, 'No se pudo guardar el orden'));
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(r: RutaDetalle) {
    if (!window.confirm(`¿Eliminar la ruta ${r.nombre}? Sus medidores quedan sin ruta.`)) return;
    try {
      await api.eliminarRuta(r.id);
      onEliminada();
    } catch (e) {
      setAccionError(mensajeError(e, 'No se pudo eliminar la ruta'));
    }
  }

  if (error) return <ErrorBanner mensaje={error} />;
  if (!ruta) return <p className="text-slate-400">Cargando…</p>;

  return (
    <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">{ruta.nombre}</h2>
          <p className="text-sm text-slate-500">{ruta.localidad.nombre}</p>
        </div>
        <div className="space-x-2">
          <Boton variante="secundario" onClick={() => onEditar(ruta)}>Renombrar</Boton>
          <Boton variante="peligro" onClick={() => void eliminar(ruta)}>Eliminar</Boton>
        </div>
      </div>

      {accionError && <ErrorBanner mensaje={accionError} />}

      <ol className="space-y-1">
        {items.map((m, i) => (
          <li key={m.id} className="flex items-center gap-2 rounded border border-slate-200 px-2 py-1.5 text-sm">
            <span className="w-6 text-right font-mono text-slate-400">{i + 1}</span>
            <Badge tono={m.tipoServicio === 'AGUA' ? 'sky' : 'amber'}>{ETIQUETA_SERVICIO[m.tipoServicio]}</Badge>
            <span className="min-w-0 flex-1 truncate">
              <span className="font-medium">{m.numeroSerie}</span>
              {m.numeroCaja && <span className="text-slate-500"> · caja {m.numeroCaja}</span>}
              <span className="text-slate-500"> · {m.numeroSocio} {m.nombreCompleto}</span>
            </span>
            <Boton variante="secundario" aria-label="Subir" disabled={i === 0} onClick={() => mover(i, -1)}>↑</Boton>
            <Boton variante="secundario" aria-label="Bajar" disabled={i === items.length - 1} onClick={() => mover(i, 1)}>↓</Boton>
            <Boton variante="peligro" aria-label="Quitar de la ruta" onClick={() => setItems(items.filter((x) => x.id !== m.id))}>✕</Boton>
          </li>
        ))}
      </ol>
      {items.length === 0 && <p className="text-sm text-slate-400">La ruta no tiene medidores.</p>}

      <div className="flex items-center gap-2">
        <Boton disabled={!modificado || guardando} onClick={() => void guardarOrden()}>Guardar orden</Boton>
        {modificado && (
          <Boton variante="secundario" onClick={() => setItems(ruta.medidores)}>Descartar cambios</Boton>
        )}
      </div>

      <AgregarMedidor
        localidadId={ruta.localidad.id}
        excluidos={items.map((i) => i.id)}
        onAgregar={(m) => setItems((actual) => [...actual, aItem(m)])}
      />
    </div>
  );
}

function AgregarMedidor({
  localidadId,
  excluidos,
  onAgregar,
}: {
  localidadId: string;
  excluidos: string[];
  onAgregar: (m: Medidor) => void;
}) {
  const [q, setQ] = useState('');
  const [candidatos, setCandidatos] = useState<Medidor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function buscar() {
    setError(null);
    try {
      const pagina = await api.medidores({ localidadId, q: q.trim(), estado: 'ACTIVO', limit: 30 });
      setCandidatos(pagina.data.filter((m) => !m.ruta));
    } catch (e) {
      setError(mensajeError(e, 'No se pudo buscar'));
    }
  }

  const visibles = candidatos?.filter((m) => !excluidos.includes(m.id));

  return (
    <div className="space-y-2 border-t border-slate-200 pt-3">
      <p className="text-sm font-medium">Agregar medidores sin ruta de esta localidad</p>
      <div className="flex gap-2">
        <Input placeholder="N° de serie o caja" value={q} onChange={(e) => setQ(e.target.value)} />
        <Boton variante="secundario" onClick={() => void buscar()}>Buscar</Boton>
      </div>
      {error && <ErrorBanner mensaje={error} />}
      {visibles?.length === 0 && <p className="text-sm text-slate-400">No hay medidores disponibles.</p>}
      <ul className="space-y-1">
        {visibles?.map((m) => (
          <li key={m.id} className="flex items-center gap-2 text-sm">
            <span className="flex-1">
              {m.numeroSerie} · {ETIQUETA_SERVICIO[m.tipoServicio]} · {m.socio.nombreCompleto}
            </span>
            <Boton variante="secundario" onClick={() => onAgregar(m)}>Agregar</Boton>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FormRuta({
  ruta,
  localidades,
  localidadInicial,
  onCerrar,
  onGuardada,
}: {
  ruta: Ruta | null;
  localidades: Localidad[];
  localidadInicial: string;
  onCerrar: () => void;
  onGuardada: (id: string) => void;
}) {
  const [nombre, setNombre] = useState(ruta?.nombre ?? '');
  const [localidadId, setLocalidadId] = useState(ruta?.localidad.id ?? localidadInicial);
  const [activa, setActiva] = useState(ruta?.activa ?? true);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      const guardada = ruta
        ? await api.editarRuta(ruta.id, { nombre: nombre.trim(), activa })
        : await api.crearRuta({ nombre: nombre.trim(), localidadId, activa });
      onGuardada(guardada.id);
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar la ruta'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={ruta ? 'Editar ruta' : 'Nueva ruta'} onCerrar={onCerrar}>
      <form onSubmit={(e) => void guardar(e)} className="space-y-3">
        <Campo etiqueta="Nombre de la ruta">
          <Input required minLength={2} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        {!ruta && (
          <Campo etiqueta="Pueblo / paraje">
            <Select required value={localidadId} onChange={(e) => setLocalidadId(e.target.value)}>
              <option value="">Elegí una localidad…</option>
              {localidades.map((l) => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </Select>
          </Campo>
        )}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={activa} onChange={(e) => setActiva(e.target.checked)} />
          Ruta activa
        </label>
        {error && <ErrorBanner mensaje={error} />}
        <div className="flex justify-end gap-2">
          <Boton variante="secundario" onClick={onCerrar}>Cancelar</Boton>
          <Boton type="submit" disabled={guardando}>Guardar</Boton>
        </div>
      </form>
    </Modal>
  );
}
