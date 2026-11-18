import { api } from "./api";
import type { Pagina } from "../types/diario";
import type { Duvida, DuvidaRequest } from "../types/duvida";

// o tamanho da página (5) é definido pelo back
export async function listarDuvidas(pagina: number): Promise<Pagina<Duvida>> {
  const { data } = await api.get<Pagina<Duvida>>("/duvidas", { params: { pagina } });
  return data;
}

export async function criarDuvida(dados: DuvidaRequest): Promise<Duvida> {
  const { data } = await api.post<Duvida>("/duvidas", dados);
  return data;
}

export async function atualizarDuvida(id: number, dados: DuvidaRequest): Promise<Duvida> {
  const { data } = await api.put<Duvida>(`/duvidas/${id}`, dados);
  return data;
}

export async function excluirDuvida(id: number): Promise<void> {
  await api.delete(`/duvidas/${id}`);
}
