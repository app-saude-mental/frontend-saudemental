import { api } from "./api";
import type { CadastroRequest, LoginRequest, SessaoResponse, Usuario } from "../types/auth";

// Rotas de /auth vão sem Authorization e sem renovação automática (semRenovacao).

export async function login(dados: LoginRequest): Promise<SessaoResponse> {
  const { data } = await api.post<SessaoResponse>("/auth/login", dados, { semRenovacao: true });
  return data;
}

export async function cadastrar(dados: CadastroRequest): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/auth/cadastro", dados, { semRenovacao: true });
  return data;
}

// intencao: de qual tela veio ("ENTRAR" não cria conta; "CRIAR" não entra numa conta existente)
export type IntencaoGoogle = "ENTRAR" | "CRIAR";

export async function loginComGoogle(idToken: string, intencao?: IntencaoGoogle): Promise<SessaoResponse> {
  const { data } = await api.post<SessaoResponse>("/auth/google", { idToken, intencao }, { semRenovacao: true });
  return data;
}

// Revoga a sessão no servidor (melhor esforço: o back responde 204 mesmo com token inválido)
export async function sairNoServidor(refreshToken: string): Promise<void> {
  await api.post("/auth/logout", { refreshToken }, { semRenovacao: true });
}

// Encerra a sessão em todos os dispositivos (precisa estar autenticado)
export async function sairDeTodosNoServidor(): Promise<void> {
  await api.post("/auth/logout-todos");
}
