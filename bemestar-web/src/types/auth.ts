
export type Plano = "GRATUITO" | "PREMIUM";
export type Perfil = "COMUM" | "ASSINANTE" | "ADMIN" | "PACIENTE";

export interface Usuario{
    id: number;
    nome: string;
    email: string;
    plano: Plano;
    perfil: Perfil;
    acessoLiberado: boolean;
}

export interface LoginRequest{
    email: string;
    senha: string;

}

export interface CadastroRequest {
  nome: string;
  email: string;
  senha: string;
  aceitouTermos: boolean;
}

export interface LoginResponse {
  token: string;
  tipo: string; // "Bearer"
  expiraEm: number; // segundos
  usuario: Usuario;
}

// Erros que o back devolve
export interface ErrorResponse {
  status: number;
  mesangem?: string; // typo atual do back
  mensagem?: string;
}

export interface ValidationErrorResponse {
  mensagem: string;
  campos: Record<string, string>;
}

export interface AtualizaPerfilRequest {
  nome: string;
  email: string;
}