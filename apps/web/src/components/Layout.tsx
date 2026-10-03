import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../auth';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/reclamos', label: 'Reclamos', end: false },
  { to: '/exportar', label: 'Exportar', end: false },
];

export function Layout() {
  const { usuario, logout } = useAuth();
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <span className="font-semibold text-sky-700">Consumos · Tacural</span>
          <nav className="flex gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `rounded px-3 py-1.5 text-sm ${isActive ? 'bg-sky-100 font-medium text-sky-800' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-600">
            <span>{usuario?.nombre}</span>
            <button onClick={logout} className="rounded border border-slate-300 px-3 py-1 hover:bg-slate-100">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
