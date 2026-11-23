import type { Anexo } from "./duvida";
// Contratos do painel do enfermeiro (/admin/**). Nenhum tipo aqui contém diário.
import type { Perfil, PlanoEfetivo, PlanoPremium, SolicitacaoResumo, StatusPlano, TipoPlano } from "./auth";
import type { Solicitacao } from "./assinatura";

export interface AdminResumo {
  gratuitos: number;
  assinantes: number;
  pacientes: number;
  administradores: number;
  vencendoEm7Dias: number;
  vencidos: number;
  suspensos: number;
  duvidasPendentes: number;
  solicitacoesPendentes: number;
  premiumSemVigencia: number;
}

export interface UsuarioResumo {
  id: number;
  nome: string;
  email: string;
}

export interface AdminUsuarioResumo {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  planoEfetivo: PlanoEfetivo;
  solicitacaoPendente: boolean;
  duvidasPendentes: number;
}

export interface AdminUsuarioDetalhe {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
  criadoEm: string;
  planoEfetivo: PlanoEfetivo;
  ultimoPlanoPremium: PlanoPremium | null;
  solicitacaoPendente: SolicitacaoResumo | null;
}

export interface FiltroUsuarios {
  busca?: string;
  plano?: Exclude<TipoPlano, "ADMIN">;
  status?: StatusPlano;
  vencendoEmDias?: number;
  comSolicitacaoPendente?: boolean;
  comDuvidaPendente?: boolean;
  ordenar?: "nome" | "email" | "venceEm" | "criadoEm";
  direcao?: "asc" | "desc";
  pagina?: number;
}

export type TipoEventoPlano = "ATIVACAO" | "RENOVACAO" | "SUSPENSAO" | "REATIVACAO" | "CANCELAMENTO" | "EXPIRACAO";

export interface PlanoEvento {
  id: number;
  tipo: TipoEventoPlano;
  perfilAnterior: Perfil | null;
  perfilNovo: Perfil | null;
  statusAnterior: StatusPlano | null;
  statusNovo: StatusPlano | null;
  venceEmAnterior: string | null;
  venceEmNovo: string | null;
  adminNome: string | null;
  observacao: string | null;
  criadoEm: string;
}

export interface AdminDuvida {
  id: number;
  usuario: UsuarioResumo;
  mensagem: string;
  criadoEm: string;
  resposta: string | null;
  respondidaEm: string | null;
  respondidaPorNome: string | null;
  anexos: Anexo[];
}

export interface AdminSolicitacao {
  solicitacao: Solicitacao;
  usuario: UsuarioResumo;
  atendidaPorNome: string | null;
}

export type AcaoPlano = "ativar" | "suspender" | "reativar" | "cancelar";

export interface OrientacaoRequest {
  titulo: string;
  texto: string;
}

// ---------- Sininho do enfermeiro ----------
export type TipoNotificacao = "PIX_INFORMADO" | "CONTATO_ENFERMEIRO" | "ARREPENDIMENTO" | "DUVIDA";

export interface NotificacaoItem {
  tipo: TipoNotificacao;
  id: number;
  usuarioId: number;
  usuarioNome: string;
  resumo: string;
  criadoEm: string;
}

// total = pendências que exigem ação (some quando resolvidas)
export interface Notificacoes {
  total: number;
  solicitacoes: number;
  duvidas: number;
  itens: NotificacaoItem[];
}
