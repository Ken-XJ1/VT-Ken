import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas públicas
import Inicio from './pages/Inicio';
import Mapa from './pages/Mapa';
import Prediccion from './pages/Prediccion';
import Enfermedades from './pages/Enfermedades';
import Chatbot from './pages/Chatbot';

// Auth
import Login from './pages/auth/Login';
import Registro from './pages/auth/Registro';

// Ciudadano
import Dashboard from './pages/Dashboard';
import FormularioReporte from './pages/FormularioReporte';
import MisReportes from './pages/MisReportes';
import Mensajes from './pages/Mensajes';

// Admin
import AdminPanel from './pages/admin/AdminPanel';
import AdminReportes from './pages/admin/AdminReportes';
import AdminMensajes from './pages/admin/AdminMensajes';
import AdminUsuarios from './pages/admin/AdminUsuarios';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<Inicio />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/prediccion" element={<Prediccion />} />
          <Route path="/enfermedades" element={<Enfermedades />} />
          <Route path="/chatbot" element={<Chatbot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />

          {/* Ciudadano y admin */}
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['ciudadano', 'admin']}>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/reportar" element={
            <ProtectedRoute roles={['ciudadano', 'admin']}>
              <FormularioReporte />
            </ProtectedRoute>
          } />
          <Route path="/mis-reportes" element={
            <ProtectedRoute roles={['ciudadano']}>
              <MisReportes />
            </ProtectedRoute>
          } />
          <Route path="/mensajes" element={
            <ProtectedRoute roles={['ciudadano', 'admin']}>
              <Mensajes />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPanel />
            </ProtectedRoute>
          } />
          <Route path="/admin/reportes" element={
            <ProtectedRoute roles={['admin']}>
              <AdminReportes />
            </ProtectedRoute>
          } />
          <Route path="/admin/mensajes" element={
            <ProtectedRoute roles={['admin']}>
              <AdminMensajes />
            </ProtectedRoute>
          } />
          <Route path="/admin/usuarios" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsuarios />
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </div>
  );
}
