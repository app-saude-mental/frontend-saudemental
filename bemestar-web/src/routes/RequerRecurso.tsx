import { Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import BloqueioPremium from "../components/BloqueioPremium";
import type { Recurso } from "../types/auth";

interface RequerRecursoProps {
  recurso: Recurso;
  titulo: string;
}

// Guarda de rota por plano: sem o recurso, mostra o cartão "disponível no Premium".
export default function RequerRecurso({ recurso, titulo }: RequerRecursoProps) {
  const { pode } = useAuth();
  return pode(recurso) ? <Outlet /> : <BloqueioPremium recurso={recurso} titulo={titulo} />;
}
