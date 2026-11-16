import { api } from "./api";
import type { Diario, DiarioRequest, Pagina } from "../types/diario";

export async function listarDiarios(pagina: number, tamanho = 10): Promise<Pagina<Diario>> {
  const { data } = await api.get<Pagina<Diario>>("/diarios", { params: { pagina, tamanho } });
  return data;
}

export async function criarDiario(dados: DiarioRequest): Promise<Diario> {
  const { data } = await api.post<Diario>("/diarios", dados);
  return data;
}

export async function atualizarDiario(id: number, dados: DiarioRequest): Promise<Diario> {
  const { data } = await api.put<Diario>(`/diarios/${id}`, dados);
  return data;
}

export async function excluirDiario(id: number): Promise<void> {
  await api.delete(`/diarios/${id}`);
}