import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta principal: Muestra el Login */}
        <Route path="/" element={<Login />} />

        {/* Ruta de registro */}
        <Route path="/register" element={<Register />} />

        {/* Ruta protegida */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Si escriben una ruta que no existe, los regresa al inicio */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;