import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/useAuth";
import {
  atualizarMeuPerfil,
  buscarMeuPerfil,
  excluirMinhaConta,
} from "../services/perfilService";

// Chave única do "usuário atual" (GET /usuarios/me)
export const CHAVE_USUARIO_ATUAL = ["usuario-atual"] as const;

/**
 * Usuário atual vindo do back: plano efetivo e recursos.
 * Rebusca ao abrir, ao voltar o foco para a janela e a cada 5 minutos,
 * e mantém a sessão (menu, guardas de rota) igual ao que o back devolveu.
 */
export function useUsuarioAtual() {
  const { atualizarUsuario, usuario } = useAuth();
  const consulta = useQuery({
    queryKey: CHAVE_USUARIO_ATUAL,
    queryFn: buscarMeuPerfil,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    // aguardando o enfermeiro: confere a cada 30 s para mostrar a liberação logo
    refetchInterval: usuario?.solicitacaoPendente ? 30_000 : 5 * 60_000,
  });

  useEffect(() => {
    if (consulta.data) atualizarUsuario(consulta.data);
  }, [consulta.data, atualizarUsuario]);

  return consulta;
}

export function usePerfil() {
  return useUsuarioAtual();
}

export function useAtualizarPerfil() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: atualizarMeuPerfil,
    // o back já devolve o usuário atualizado: colocamos direto no cache, sem nova busca
    onSuccess: (usuario) => queryClient.setQueryData(CHAVE_USUARIO_ATUAL, usuario),
  });
}

export function useExcluirConta() {
  return useMutation({ mutationFn: excluirMinhaConta });
}
