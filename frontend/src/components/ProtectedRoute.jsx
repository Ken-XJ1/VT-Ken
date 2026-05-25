import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Ruta protegida por autenticación y rol opcional.
 * @param {string[]} [roles] - Roles permitidos. Si se omite, cualquier usuario autenticado puede acceder.
 */
export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
