import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atualizarDuvida,
  criarDuvida,
  excluirDuvida,
  listarDuvidas,
} from "../services/duvidaService";
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
