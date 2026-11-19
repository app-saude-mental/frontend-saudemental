import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import MarcaCarregando from "../components/MarcaCarregando";
import "../styles/transicao.css";

export default function ProtectedRoute() {
  const { autenticado, inicializando } = useAuth();

  // renovando a sessão salva: mostra a marca girando em vez de mandar para o login
  if (inicializando) {
    return (
      <div className="carregando-sessao" role="status">
        <MarcaCarregando />
        <span>Abrindo o seu espaço…</span>
      </div>
    );
  }
  return autenticado ? <Outlet /> : <Navigate to="/login" replace />;
}
