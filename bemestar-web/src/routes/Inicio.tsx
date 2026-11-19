import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

// "/" leva o enfermeiro (ADMIN) ao painel e os demais aos planos
export default function Inicio() {
  const { ehAdmin } = useAuth();
  return <Navigate to={ehAdmin ? "/admin" : "/planos"} replace />;
}
