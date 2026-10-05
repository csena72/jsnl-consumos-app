import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Dashboard } from './pages/Dashboard';
import { Exportar } from './pages/Exportar';
import { Localidades } from './pages/Localidades';
import { Login } from './pages/Login';
import { Medidores } from './pages/Medidores';
import { MedidoresNuevos } from './pages/MedidoresNuevos';
import { Reclamos } from './pages/Reclamos';
import { Rutas } from './pages/Rutas';
import { Socios } from './pages/Socios';
import { Usuarios } from './pages/Usuarios';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="socios" element={<Socios />} />
          <Route path="medidores" element={<Medidores />} />
          <Route path="medidores-nuevos" element={<MedidoresNuevos />} />
          <Route path="localidades" element={<Localidades />} />
          <Route path="rutas" element={<Rutas />} />
          <Route path="reclamos" element={<Reclamos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="exportar" element={<Exportar />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
