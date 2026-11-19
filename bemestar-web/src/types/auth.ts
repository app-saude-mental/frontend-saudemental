export type Plano = "GRATUITO" | "PREMIUM";
export type Perfil = "COMUM" | "ASSINANTE" | "ADMIN" | "PACIENTE";

// Plano como a interface mostra (efetivo: suspenso/vencido = GRATUITO)
export type TipoPlano = "GRATUITO" | "ASSINANTE" | "PACIENTE" | "ADMIN";
export type PlanoPremium = "ASSINANTE" | "PACIENTE";
export type StatusPlano = "ATIVO" | "SUSPENSO" | "VENCIDO" | "CANCELADO";
export type Recurso =
  | "SONS_COMPLETOS"
  | "DIARIO"
  | "HABITOS"
  | "DICAS_GERAIS"
  | "MEDICAMENTOS"
  | "DUVIDAS"
  | "ORIENTACOES";

// Datas sem fuso, no horário de Brasília (como os demais campos de data da API)
export interface PlanoEfetivo {
  tipo: TipoPlano; // o que vale agora
  nome: string; // "Premium Paciente"
  contratado: TipoPlano | null; // assinatura atual, mesmo suspensa
  nomeContratado: string | null;
  status: StatusPlano | null; // null = nunca assinou
  iniciadoEm: string | null;
  venceEm: string | null;
  diasRestantes: number | null;
}

export interface SolicitacaoResumo {
  id: number;
  planoDesejado: PlanoPremium;
  tipo: "PIX_INFORMADO" | "CONTATO_ENFERMEIRO" | "ARREPENDIMENTO";
  criadaEm: string;
}

// Usuário atual (login, refresh e GET/PUT /usuarios/me)
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  plano: Plano;
  perfil: Perfil;
  acessoLiberado: boolean;
  planoEfetivo: PlanoEfetivo;
  recursos: Recurso[];
  solicitacaoPendente: SolicitacaoResumo | null;
  arrependimentoAte: string | null; // até quando pode desistir do plano (null = fora do prazo)
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
  aceitouTermos: boolean;
}

// Resposta de /auth/login, /auth/google e /auth/refresh
export interface SessaoResponse {
  accessToken: string;
  refreshToken: string;
  tipo: string; // "Bearer"
  expiraEm: number; // validade do accessToken, em segundos
  usuario: Usuario;
}

// Erros que o back devolve
export interface ErrorResponse {
  status: number;
  mensagem?: string;
  codigo?: string; // ex.: "RECURSO_BLOQUEADO", "REFRESH_EM_ANDAMENTO"
}

export interface ValidationErrorResponse {
  mensagem: string;
  campos: Record<string, string>;
}

export interface AtualizaPerfilRequest {
  nome: string;
  email: string;
}
