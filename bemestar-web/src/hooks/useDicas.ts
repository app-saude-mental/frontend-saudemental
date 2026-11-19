import { useQuery } from "@tanstack/react-query";
import { listarDicas } from "../services/dicaService";

// habilitado = o plano inclui ORIENTACOES (sem ele o back responde 403; nem chamamos)
export function useDicas(habilitado: boolean) {
  return useQuery({
    queryKey: ["dicas"],
    queryFn: listarDicas,
    enabled: habilitado,
  });
}
