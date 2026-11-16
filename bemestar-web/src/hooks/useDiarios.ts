import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atualizarDiario,
  criarDiario,
  excluirDiario,
  listarDiarios,
} from "../services/diarioService";
import type { DiarioRequest } from "../types/diario";

const CHAVE = ["diarios"] as const;

export function useDiarios(pagina: number) {
  return useQuery({
    queryKey: [...CHAVE, pagina],
    queryFn: () => listarDiarios(pagina),
    placeholderData: keepPreviousData, // mantém a página anterior na tela enquanto carrega a próxima
  });
}

export function useSalvarDiario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id?: number; dados: DiarioRequest }) =>
      id ? atualizarDiario(id, dados) : criarDiario(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirDiario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => excluirDiario(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}