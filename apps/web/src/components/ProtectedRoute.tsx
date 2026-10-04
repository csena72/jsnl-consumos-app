import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';

export function ProtectedRoute() {
  const { usuario } = useAuth();
  const location = useLocation();
  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
