import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import { useCarga } from '../components/useCarga';
import { Boton, Campo, ErrorBanner, Input, Modal, Tabla, mensajeError, textoOpcional } from '../components/ui';
import type { Localidad } from '../types';

const cargar = () => api.localidades();

export function Localidades() {
  const { datos, error, cargando, recargar } = useCarga(cargar);
  const [editando, setEditando] = useState<Localidad | 'nueva' | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  async function eliminar(l: Localidad) {
    if (!window.confirm(`¿Eliminar la localidad ${l.nombre}?`)) return;
    setAccionError(null);
    try {
      await api.eliminarLocalidad(l.id);
      recargar();
    } catch (e) {
      setAccionError(mensajeError(e, 'No se pudo eliminar la localidad'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Localidades</h1>
        <Boton onClick={() => setEditando('nueva')}>Nueva localidad</Boton>
      </div>
      {error && <ErrorBanner mensaje={error} />}
      {accionError && <ErrorBanner mensaje={accionError} />}
      {cargando && !datos && <p className="text-slate-400">Cargando…</p>}
      {datos && (
        <Tabla columnas={['Nombre', 'Provincia', 'C. postal', '']}>
          {datos.map((l) => (
            <tr key={l.id}>
              <td className="px-3 py-2 font-medium">{l.nombre}</td>
              <td className="px-3 py-2">{l.provincia}</td>
              <td className="px-3 py-2">{l.codigoPostal ?? '—'}</td>
              <td className="space-x-2 px-3 py-2 text-right">
                <Boton variante="secundario" onClick={() => setEditando(l)}>Editar</Boton>
                <Boton variante="peligro" onClick={() => void eliminar(l)}>Eliminar</Boton>
              </td>
            </tr>
          ))}
        </Tabla>
      )}
      {editando && (
        <FormLocalidad
          localidad={editando === 'nueva' ? null : editando}
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

function FormLocalidad({
  localidad,
  onCerrar,
  onGuardado,
}: {
  localidad: Localidad | null;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [nombre, setNombre] = useState(localidad?.nombre ?? '');
  const [provincia, setProvincia] = useState(localidad?.provincia ?? 'Santa Fe');
  const [codigoPostal, setCodigoPostal] = useState(localidad?.codigoPostal ?? '');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const datos = { nombre: nombre.trim(), provincia: provincia.trim(), codigoPostal: textoOpcional(codigoPostal) };
    try {
      await (localidad ? api.editarLocalidad(localidad.id, datos) : api.crearLocalidad(datos));
      onGuardado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={localidad ? 'Editar localidad' : 'Nueva localidad'} onCerrar={onCerrar}>
      <form onSubmit={(e) => void guardar(e)} className="space-y-3">
        <Campo etiqueta="Nombre del pueblo o paraje">
          <Input required minLength={2} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        <Campo etiqueta="Provincia">
          <Input required minLength={2} value={provincia} onChange={(e) => setProvincia(e.target.value)} />
        </Campo>
        <Campo etiqueta="Código postal">
          <Input value={codigoPostal} onChange={(e) => setCodigoPostal(e.target.value)} />
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
