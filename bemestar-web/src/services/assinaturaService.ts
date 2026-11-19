import { api } from "./api";
import type { PagamentoInfo, Solicitacao, SolicitacaoRequest } from "../types/assinatura";

export async function buscarPagamento(): Promise<PagamentoInfo> {
  const { data } = await api.get<PagamentoInfo>("/assinatura/pagamento");
  return data;
}

export async function solicitarPlano(dados: SolicitacaoRequest): Promise<Solicitacao> {
  const { data } = await api.post<Solicitacao>("/assinatura/solicitacoes", dados);
  return data;
}

// contato do enfermeiro (link do WhatsApp); null se não configurado (204)
export async function buscarContatoEnfermeiro(): Promise<string | null> {
  const resposta = await api.get<{ contatoEnfermeiro: string }>("/assinatura/contato");
  return resposta.status === 204 ? null : resposta.data.contatoEnfermeiro;
}

// a mais recente; null se nunca pediu (o back responde 204)
export async function buscarMinhaSolicitacao(): Promise<Solicitacao | null> {
  const resposta = await api.get<Solicitacao>("/assinatura/solicitacoes/minha");
  return resposta.status === 204 ? null : resposta.data;
}
