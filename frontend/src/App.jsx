import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';

// Páginas públicas
import Inicio from './pages/Inicio';
import Mapa from './pages/Mapa';
import Prediccion from './pages/Prediccion';
import Enfermedades from './pages/Enfermedades';
import Chatbot from './pages/Chatbot';

// Auth
import Login from './pages/auth/Login';
import Registro from './pages/auth/Registro';

// Perfil
import Perfil from './pages/Perfil';

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
import AdminAuditoria from './pages/admin/AdminAuditoria';

export default function App() {
  return (
    <Routes>
      {/* Todas las rutas usan MainLayout con sidebar global */}
      <Route element={<MainLayout />}>
        {/* Rutas públicas */}
        <Route path="/" element={<Inicio />} />
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/prediccion" element={<Prediccion />} />
        <Route path="/enfermedades" element={<Enfermedades />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas de ciudadano protegidas */}
        <Route element={<ProtectedRoute roles={['ciudadano', 'admin']} />}>
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/reportar" element={<FormularioReporte />} />
          <Route path="/mis-reportes" element={<MisReportes />} />
          <Route path="/mensajes" element={<Mensajes />} />
        </Route>

        {/* Rutas de admin protegidas */}
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/admin/reportes" element={<AdminReportes />} />
          <Route path="/admin/mensajes" element={<AdminMensajes />} />
          <Route path="/admin/usuarios" element={<AdminUsuarios />} />
          <Route path="/admin/auditoria" element={<AdminAuditoria />} />
        </Route>
      </Route>
    </Routes>
  );
}
