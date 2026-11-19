import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

// Guarda de rota do painel: só ADMIN. É só interface — o back recusa /admin/** com 403.
export default function RequerAdmin() {
  const { ehAdmin } = useAuth();
  return ehAdmin ? <Outlet /> : <Navigate to="/" replace />;
}
