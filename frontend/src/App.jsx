import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Mapa from './pages/Mapa';
import Prediccion from './pages/Prediccion';
import Enfermedades from './pages/Enfermedades';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/prediccion" element={<Prediccion />} />
          <Route path="/enfermedades" element={<Enfermedades />} />
        </Routes>
      </div>
    </div>
  );
}
