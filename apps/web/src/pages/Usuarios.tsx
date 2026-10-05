import { useState } from 'react';
import type { FormEvent } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { useCarga } from '../components/useCarga';
import { Badge, Boton, Campo, ErrorBanner, Input, Modal, Select, Tabla, mensajeError } from '../components/ui';
import type { RolUsuario, UsuarioAdmin } from '../types';

const cargar = () => api.usuarios();

export function Usuarios() {
  const { usuario: yo } = useAuth();
  const { datos, error, cargando, recargar } = useCarga(cargar);
  const [editando, setEditando] = useState<UsuarioAdmin | 'nuevo' | null>(null);
  const [accionError, setAccionError] = useState<string | null>(null);

  async function cambiarActivo(u: UsuarioAdmin) {
    if (u.activo && !window.confirm(`¿Dar de baja a ${u.nombre}? Ya no podrá iniciar sesión.`)) return;
    setAccionError(null);
    try {
      await (u.activo ? api.bajaUsuario(u.id) : api.editarUsuario(u.id, { activo: true }));
      recargar();
    } catch (e) {
      setAccionError(mensajeError(e, 'No se pudo actualizar el usuario'));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Usuarios</h1>
        <Boton onClick={() => setEditando('nuevo')}>Nuevo usuario</Boton>
      </div>
      {error && <ErrorBanner mensaje={error} />}
      {accionError && <ErrorBanner mensaje={accionError} />}
      {cargando && !datos && <p className="text-slate-400">Cargando…</p>}
      {datos && (
        <Tabla columnas={['Nombre', 'Email', 'Rol', 'Estado', '']}>
          {datos.map((u) => (
            <tr key={u.id}>
              <td className="px-3 py-2 font-medium">{u.nombre}</td>
              <td className="px-3 py-2">{u.email}</td>
              <td className="px-3 py-2"><Badge tono={u.rol === 'ADMIN' ? 'sky' : 'slate'}>{u.rol}</Badge></td>
              <td className="px-3 py-2"><Badge tono={u.activo ? 'green' : 'red'}>{u.activo ? 'Activo' : 'Baja'}</Badge></td>
              <td className="space-x-2 whitespace-nowrap px-3 py-2 text-right">
                <Boton variante="secundario" onClick={() => setEditando(u)}>Editar</Boton>
                {u.id !== yo?.id && (
                  <Boton variante={u.activo ? 'peligro' : 'secundario'} onClick={() => void cambiarActivo(u)}>
                    {u.activo ? 'Dar de baja' : 'Reactivar'}
                  </Boton>
                )}
              </td>
            </tr>
          ))}
        </Tabla>
      )}
      {editando && (
        <FormUsuario
          usuario={editando === 'nuevo' ? null : editando}
          esYo={editando !== 'nuevo' && editando.id === yo?.id}
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

function FormUsuario({
  usuario,
  esYo,
  onCerrar,
  onGuardado,
}: {
  usuario: UsuarioAdmin | null;
  esYo: boolean;
  onCerrar: () => void;
  onGuardado: () => void;
}) {
  const [nombre, setNombre] = useState(usuario?.nombre ?? '');
  const [email, setEmail] = useState(usuario?.email ?? '');
  const [rol, setRol] = useState<RolUsuario>(usuario?.rol ?? 'OPERARIO');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      if (usuario) {
        await api.editarUsuario(usuario.id, { nombre: nombre.trim(), email: email.trim(), rol, password: password || undefined });
      } else {
        await api.crearUsuario({ nombre: nombre.trim(), email: email.trim(), rol, password });
      }
      onGuardado();
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar el usuario'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={usuario ? 'Editar usuario' : 'Nuevo usuario'} onCerrar={onCerrar}>
      <form onSubmit={(e) => void guardar(e)} className="space-y-3">
        <Campo etiqueta="Nombre">
          <Input required minLength={2} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        <Campo etiqueta="Email">
          <Input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Campo>
        <Campo etiqueta="Rol">
          <Select value={rol} disabled={esYo} onChange={(e) => setRol(e.target.value as RolUsuario)}>
            <option value="OPERARIO">OPERARIO (app móvil)</option>
            <option value="ADMIN">ADMIN (consola web)</option>
          </Select>
        </Campo>
        <Campo etiqueta={usuario ? 'Nueva contraseña (vacío = no cambiar)' : 'Contraseña (mín. 8 caracteres)'}>
          <Input
            type="password"
            required={!usuario}
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
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
