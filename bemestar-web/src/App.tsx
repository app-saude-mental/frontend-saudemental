import { Navigate, Route, Routes } from "react-router-dom";
import AuthShell from "./layouts/AuthShell";
import AppLayout from "./layouts/AppLayout";
import Planos from "./pages/Planos";
import DiarioPage from "./pages/Diario";
import PerfilPage from "./pages/Perfil";
import ProtectedRoute from "./routes/ProtectedRoute";
import HabitosPage from "./pages/Habitos";
import MedicamentosPage from "./pages/Medicamentos";


export default function App() {
  return (
    <Routes>
      <Route element={<AuthShell />}>
        <Route path="/login" />
        <Route path="/cadastro" />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/planos" replace />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/diario" element={<DiarioPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/habitos" element={<HabitosPage />} />
          <Route path="/medicamentos" element={<MedicamentosPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
