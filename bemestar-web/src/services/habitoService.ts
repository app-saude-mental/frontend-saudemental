import { api } from "./api";
import type { Habito, HabitosDia } from "../types/habito";

export async function buscarHabitosDoDia(data: string): Promise<HabitosDia> {
  const { data: resposta } = await api.get<HabitosDia>("/habitos", { params: { data } });
  return resposta;
}

// Histórico do próprio usuário: "dias" dias terminando em "ate" (máx. 31), um item por dia
export async function buscarHistoricoHabitos(ate: string, dias: number): Promise<HabitosDia[]> {
  const { data: resposta } = await api.get<HabitosDia[]>("/habitos/historico", { params: { ate, dias } });
  return resposta;
}

export async function marcarHabito(
  habito: Habito,
  data: string,
  concluido: boolean,
): Promise<HabitosDia> {
  const { data: resposta } = await api.put<HabitosDia>(
    `/habitos/${habito}`,
    { concluido },
    { params: { data } },
  );
  return resposta;
}