import { Navigate, Route, Routes } from "react-router-dom";
import AuthShell from "./layouts/AuthShell";
import AppLayout from "./layouts/AppLayout";
import Planos from "./pages/Planos";
import SerPremium from "./pages/SerPremium";
import DiarioPage from "./pages/Diario";
import PerfilPage from "./pages/Perfil";
import ProtectedRoute from "./routes/ProtectedRoute";
import RequerRecurso from "./routes/RequerRecurso";
import HabitosPage from "./pages/Habitos";
import MedicamentosPage from "./pages/Medicamentos";
import DuvidasPage from "./pages/Duvidas";
import MomentoPazPage from "./pages/MomentoPaz";
import DicasPage from "./pages/Dicas";
import RequerAdmin from "./routes/RequerAdmin";
import Inicio from "./routes/Inicio";
import Instalar from "./pages/Instalar";
import LayoutInstalar from "./routes/LayoutInstalar";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminResumo from "./pages/admin/AdminResumo";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminUsuarioDetalhe from "./pages/admin/AdminUsuarioDetalhe";
import AdminDuvidas from "./pages/admin/AdminDuvidas";
import AdminSolicitacoes from "./pages/admin/AdminSolicitacoes";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthShell />}>
        <Route path="/login" />
        <Route path="/cadastro" />
      </Route>

      {/* pública: instalar o app (PWA) com ou sem login */}
      <Route path="/instalar" element={<LayoutInstalar />}>
        <Route index element={<Instalar />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Inicio />} />
          <Route path="/planos" element={<Planos />} />
          <Route path="/planos/premium" element={<SerPremium />} />
          <Route path="/diario" element={<DiarioPage />} />
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/habitos" element={<HabitosPage />} />
          <Route path="/meditacao" element={<MomentoPazPage />} />
          <Route path="/dicas" element={<DicasPage />} />

          {/* Premium Assinante e Paciente (o back também recusa com 403) */}
          <Route element={<RequerRecurso recurso="MEDICAMENTOS" titulo="Medicamentos" />}>
            <Route path="/medicamentos" element={<MedicamentosPage />} />
          </Route>
          {/* Só Premium Paciente */}
          <Route element={<RequerRecurso recurso="DUVIDAS" titulo="Dúvidas com o enfermeiro" />}>
            <Route path="/duvidas" element={<DuvidasPage />} />
          </Route>

          {/* Painel do enfermeiro (o back exige ADMIN em /admin/**) */}
          <Route element={<RequerAdmin />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminResumo />} />
              <Route path="usuarios" element={<AdminUsuarios />} />
              <Route path="usuarios/:id" element={<AdminUsuarioDetalhe />} />
              <Route path="duvidas" element={<AdminDuvidas />} />
              <Route path="solicitacoes" element={<AdminSolicitacoes />} />
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
