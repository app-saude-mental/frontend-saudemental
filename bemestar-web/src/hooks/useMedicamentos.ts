import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  atualizarMedicamento,
  criarMedicamento,
  excluirMedicamento,
  listarMedicamentos,
} from "../services/medicamentoService";
import type { MedicamentoRequest } from "../types/medicamento";

const CHAVE = ["medicamentos"] as const;

export function useMedicamentos(pagina: number) {
  return useQuery({
    queryKey: [...CHAVE, pagina],
    queryFn: () => listarMedicamentos(pagina),
    placeholderData: keepPreviousData, // mantém a página anterior na tela enquanto carrega a próxima
  });
}

export function useSalvarMedicamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dados }: { id?: number; dados: MedicamentoRequest }) =>
      id ? atualizarMedicamento(id, dados) : criarMedicamento(dados),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}

export function useExcluirMedicamento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => excluirMedicamento(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CHAVE }),
  });
}
