import { api } from "./api";
import type { Pagina } from "../types/diario";
import type { Medicamento, MedicamentoRequest } from "../types/medicamento";

// o tamanho da página (5) é definido pelo back
export async function listarMedicamentos(pagina: number): Promise<Pagina<Medicamento>> {
  const { data } = await api.get<Pagina<Medicamento>>("/medicamentos", { params: { pagina } });
  return data;
}

export async function criarMedicamento(dados: MedicamentoRequest): Promise<Medicamento> {
  const { data } = await api.post<Medicamento>("/medicamentos", dados);
  return data;
}

export async function atualizarMedicamento(
  id: number,
  dados: MedicamentoRequest,
): Promise<Medicamento> {
  const { data } = await api.put<Medicamento>(`/medicamentos/${id}`, dados);
  return data;
}

export async function excluirMedicamento(id: number): Promise<void> {
  await api.delete(`/medicamentos/${id}`);
}
