import type { PlanoPremium } from "./auth";

// ARREPENDIMENTO: desistência em até 7 dias da contratação (CDC art. 49)
export type TipoSolicitacao = "PIX_INFORMADO" | "CONTATO_ENFERMEIRO" | "ARREPENDIMENTO";
export type StatusSolicitacao = "PENDENTE" | "ATENDIDA" | "RECUSADA";

// GET /assinatura/pagamento (dados vindos da configuração do servidor)
export interface PagamentoInfo {
  chavePix: string; // único meio de pagamento: chave PIX (sem copia e cola)
  planos: { plano: PlanoPremium; valor: string | null }[]; // valor: "30.00"; null = combinado na consulta
  contatoEnfermeiro: string | null;
  duracaoDias: number;
}

export interface Solicitacao {
  id: number;
  planoDesejado: PlanoPremium;
  tipo: TipoSolicitacao;
  status: StatusSolicitacao;
  mensagem: string | null;
  motivoRecusa: string | null;
  criadaEm: string;
  atendidaEm: string | null;
}

export interface SolicitacaoRequest {
  planoDesejado: PlanoPremium;
  tipo: TipoSolicitacao;
  mensagem?: string;
}
