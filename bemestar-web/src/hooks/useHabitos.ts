import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { buscarHabitosDoDia, buscarHistoricoHabitos, marcarHabito } from "../services/habitoService";
import type { Habito, HabitosDia } from "../types/habito";

export function useHabitosDoDia(data: string) {
  return useQuery({
    queryKey: ["habitos", data],
    queryFn: () => buscarHabitosDoDia(data),
  });
}

export function useHistoricoHabitos(ate: string, dias: number) {
  return useQuery({
    queryKey: ["habitos", "historico", ate, dias],
    queryFn: () => buscarHistoricoHabitos(ate, dias),
    placeholderData: (anterior) => anterior, // troca de período sem "piscar" a tela
  });
}

export function useMarcarHabito(data: string) {
  const queryClient = useQueryClient();
  const chave = ["habitos", data];

  return useMutation({
    scope: { id: "habitos" }, // as marcações vão ao back uma por vez, em ordem
    mutationFn: ({ habito, concluido }: { habito: Habito; concluido: boolean }) =>
      marcarHabito(habito, data, concluido),

    // antes de chamar o back, já atualiza a tela
    onMutate: async ({ habito, concluido }) => {
      await queryClient.cancelQueries({ queryKey: chave });
      const anterior = queryClient.getQueryData<HabitosDia>(chave);

      if (anterior) {
        const habitos = anterior.habitos.map((h) =>
          h.habito === habito ? { ...h, concluido } : h,
        );
        queryClient.setQueryData<HabitosDia>(chave, {
          ...anterior,
          habitos,
          concluidos: habitos.filter((h) => h.concluido).length,
        });
      }
      return { anterior };
    },

    // se o back recusou, volta ao que era
    onError: (_erro, _variaveis, contexto) => {
      if (contexto?.anterior) queryClient.setQueryData(chave, contexto.anterior);
    },

    // no fim, confere com o que o back realmente tem
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: chave });
      queryClient.invalidateQueries({ queryKey: ["habitos", "historico"] }); // aba Evolução
    },
  });
}