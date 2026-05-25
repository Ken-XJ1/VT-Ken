import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

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
    <Routes>
      {/* Rutas públicas con Navbar */}
      <Route path="/" element={<><Navbar /><Inicio /></>} />
      <Route path="/mapa" element={<><Navbar /><Mapa /></>} />
      <Route path="/prediccion" element={<><Navbar /><Prediccion /></>} />
      <Route path="/enfermedades" element={<><Navbar /><Enfermedades /></>} />
      <Route path="/chatbot" element={<><Navbar /><Chatbot /></>} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Registro />} />

      {/* Rutas de ciudadano con UserLayout */}
      <Route element={
        <ProtectedRoute roles={['ciudadano', 'admin']}>
          <UserLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reportar" element={<FormularioReporte />} />
        <Route path="/mis-reportes" element={<MisReportes />} />
        <Route path="/mensajes" element={<Mensajes />} />
      </Route>

      {/* Rutas de admin con AdminLayout */}
      <Route element={
        <ProtectedRoute roles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/reportes" element={<AdminReportes />} />
        <Route path="/admin/mensajes" element={<AdminMensajes />} />
        <Route path="/admin/usuarios" element={<AdminUsuarios />} />
      </Route>
    </Routes>
  );
}
