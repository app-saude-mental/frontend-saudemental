import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import AppLayout from "../layouts/AppLayout";

// /instalar é pública: logado, abre dentro do app (com topo e menu); sem login, abre sozinha.
export default function LayoutInstalar() {
  const { autenticado } = useAuth();
  return autenticado ? <AppLayout /> : <Outlet />;
}
