import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atualizarMeuPerfil,
  buscarMeuPerfil,
  excluirMinhaConta,
} from "../services/perfilService";

const CHAVE = ["perfil"] as const;

export function usePerfil() {
  return useQuery({ queryKey: CHAVE, queryFn: buscarMeuPerfil });
}

export function useAtualizarPerfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: atualizarMeuPerfil,
    // o back já devolve o usuário atualizado: colocamos direto no cache, sem nova busca
    onSuccess: (usuario) => queryClient.setQueryData(CHAVE, usuario),
  });
}

export function useExcluirConta() {
  return useMutation({ mutationFn: excluirMinhaConta });
}