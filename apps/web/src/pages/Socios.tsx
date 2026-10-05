import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import { useCarga } from '../components/useCarga';
import {
  Badge,
  Boton,
  Campo,
  ErrorBanner,
  Input,
  Modal,
  Paginador,
  Select,
  Tabla,
  mensajeError,
  textoOpcional,
} from '../components/ui';
import type { CategoriaSocio, Localidad, Socio } from '../types';

const LIMITE = 15;
const CATEGORIAS: CategoriaSocio[] = ['RESIDENCIAL', 'RURAL', 'COMERCIAL'];
const cargarLocalidades = () => api.localidades();

export function Socios() {
  const [q, setQ] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [localidadId, setLocalidadId] = useState('');
  const [bajas, setBajas] = useState(false);
  const [page, setPage] = useState(1);
  const [editando, setEditando] = useState<Socio | 'nuevo' | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  const localidades = useCarga(cargarLocalidades);
  const cargar = useCallback(
    () => api.socios({ q: busqueda, localidadId, activo: !bajas, page, limit: LIMITE }),
    [busqueda, localidadId, bajas, page],
  );
  const { datos, error, cargando, recargar } = useCarga(cargar);

  async function cambiarBaja(s: Socio) {
    const accion = s.activo ? 'dar de baja' : 'reactivar';
    if (!window.confirm(`¿Querés ${accion} a ${s.nombreCompleto}?`)) return;
    setAccionError(null);
    try {
      await (s.activo ? api.bajaSocio(s.id) : api.reactivarSocio(s.id));
      recargar();
    } catch (e) {
      setAccionError(mensajeError(e, `No se pudo ${accion}`));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Socios</h1>
        <Boton onClick={() => setEditando('nuevo')}>Nuevo socio</Boton>
      </div>

      <form
        className="flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setBusqueda(q.trim());
        }}
      >
        <div className="w-64">
          <Campo etiqueta="Buscar por DNI, N° de socio o nombre">
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ej: 30123456" />
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
          <Tabla columnas={['N°', 'Nombre', 'DNI', 'Dirección', 'Localidad', 'Categoría', '']}>
            {datos.data.map((s) => (
              <tr key={s.id}>
                <td className="px-3 py-2">{s.numeroSocio}</td>
                <td className="px-3 py-2 font-medium">
                  {s.nombreCompleto} {!s.activo && <Badge tono="slate">Baja</Badge>}
                </td>
                <td className="px-3 py-2">{s.dni ?? '—'}</td>
                <td className="px-3 py-2">{s.direccionTacural}</td>
                <td className="px-3 py-2">{s.localidad?.nombre ?? '—'}</td>
                <td className="px-3 py-2">{s.categoria}</td>
                <td className="space-x-2 whitespace-nowrap px-3 py-2 text-right">
                  <Boton variante="secundario" onClick={() => setEditando(s)}>Editar</Boton>
                  <Boton variante={s.activo ? 'peligro' : 'secundario'} onClick={() => void cambiarBaja(s)}>
                    {s.activo ? 'Dar de baja' : 'Reactivar'}
                  </Boton>
                </td>
              </tr>
            ))}
          </Tabla>
          {datos.data.length === 0 && <p className="text-slate-400">No hay socios para ese filtro.</p>}
          <Paginador page={datos.page} limit={datos.limit} total={datos.total} onCambiar={setPage} />
        </>
      )}

      {editando && (
        <FormSocio
          socio={editando === 'nuevo' ? null : editando}
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

function FormSocio({
  socio,
  localidades,
  onCerrar,
  onGuardado,
}: {
  socio: Socio | null;
  localidades: Localidad[];
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [numeroSocio, setNumeroSocio] = useState(socio ? String(socio.numeroSocio) : '');
  const [nombreCompleto, setNombre] = useState(socio?.nombreCompleto ?? '');
  const [dni, setDni] = useState(socio?.dni ?? '');
  const [telefono, setTelefono] = useState(socio?.telefono ?? '');
  const [direccionTacural, setDireccion] = useState(socio?.direccionTacural ?? '');
  const [categoria, setCategoria] = useState<CategoriaSocio>(socio?.categoria ?? 'RESIDENCIAL');
  const [localidadId, setLocalidadId] = useState(socio?.localidad?.id ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const datos = {
      numeroSocio: Number(numeroSocio),
      nombreCompleto: nombreCompleto.trim(),
      dni: textoOpcional(dni),
      telefono: textoOpcional(telefono),
      direccionTacural: direccionTacural.trim(),
      categoria,
      localidadId: localidadId || undefined,
    };
    try {
      await (socio ? api.editarSocio(socio.id, datos) : api.crearSocio(datos));
      onGuardado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el socio'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={socio ? 'Editar socio' : 'Nuevo socio'} onCerrar={onCerrar}>
      <form onSubmit={(e) => void guardar(e)} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="N° de socio">
            <Input required type="number" min={1} value={numeroSocio} onChange={(e) => setNumeroSocio(e.target.value)} />
          </Campo>
          <Campo etiqueta="DNI">
            <Input pattern="\d{7,8}" title="7 u 8 dígitos, sin puntos" value={dni} onChange={(e) => setDni(e.target.value)} />
          </Campo>
        </div>
        <Campo etiqueta="Nombre completo">
          <Input required minLength={2} value={nombreCompleto} onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        <Campo etiqueta="Dirección">
          <Input required minLength={2} value={direccionTacural} onChange={(e) => setDireccion(e.target.value)} />
        </Campo>
        <div className="grid grid-cols-2 gap-3">
          <Campo etiqueta="Teléfono">
            <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </Campo>
          <Campo etiqueta="Categoría">
            <Select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaSocio)}>
              {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
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
