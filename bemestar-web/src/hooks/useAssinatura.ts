import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buscarContatoEnfermeiro,
  buscarMinhaSolicitacao,
  buscarPagamento,
  solicitarPlano,
} from "../services/assinaturaService";
import { CHAVE_USUARIO_ATUAL } from "./usePerfil";

const CHAVE_MINHA = ["assinatura", "minha"] as const;

export function usePagamento() {
  return useQuery({
    queryKey: ["assinatura", "pagamento"],
    queryFn: buscarPagamento,
    retry: false, // 503 = não configurado: não adianta repetir
    staleTime: 10 * 60_000,
  });
}

export function useContatoEnfermeiro() {
  return useQuery({
    queryKey: ["assinatura", "contato"],
    queryFn: buscarContatoEnfermeiro,
    staleTime: 30 * 60_000,
  });
}

export function useMinhaSolicitacao() {
  return useQuery({ queryKey: CHAVE_MINHA, queryFn: buscarMinhaSolicitacao });
}

export function useSolicitarPlano() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: solicitarPlano,
    onSettled: () => {
      // a pendência aparece no usuário atual (planos, perfil) e na própria solicitação
      queryClient.invalidateQueries({ queryKey: CHAVE_MINHA });
      queryClient.invalidateQueries({ queryKey: CHAVE_USUARIO_ATUAL });
    },
  });
}
