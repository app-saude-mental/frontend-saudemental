import { api } from "./api";
import type { Habito, HabitosDia } from "../types/habito";

export async function buscarHabitosDoDia(data: string): Promise<HabitosDia> {
  const { data: resposta } = await api.get<HabitosDia>("/habitos", { params: { data } });
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