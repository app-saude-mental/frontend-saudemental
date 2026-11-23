import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atualizarDuvida,
  criarDuvida,
  excluirDuvida,
  listarDuvidas,
} from "../services/duvidaService";
import { enviarAnexo, excluirAnexo } from "../services/anexoService";
import type { DuvidaRequest } from "../types/duvida";

const CHAVE = ["duvidas"] as const;

export function useDuvidas(pagina: number) {
  return useQuery({
    queryKey: [...CHAVE, pagina],
    queryFn: () => listarDuvidas(pagina),
    placeholderData: keepPreviousData, // mantém a página anterior na tela enquanto carrega a próxima
  });
}

export function useSalvarDuvida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id?: number; dados: DuvidaRequest }) =>
      id ? atualizarDuvida(id, dados) : criarDuvida(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirDuvida() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => excluirDuvida(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

// envia os arquivos um por vez (o back aceita um por requisição) e devolve os que falharam
export function useEnviarAnexos() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ duvidaId, arquivos }: { duvidaId: number; arquivos: File[] }) => {
      const falhas: { arquivo: File; erro: unknown }[] = [];
      for (const arquivo of arquivos) {
        try {
          await enviarAnexo(duvidaId, arquivo);
        } catch (erro) {
          falhas.push({ arquivo, erro });
        }
      }
      return falhas;
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirAnexo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ duvidaId, anexoId }: { duvidaId: number; anexoId: number }) => excluirAnexo(duvidaId, anexoId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
