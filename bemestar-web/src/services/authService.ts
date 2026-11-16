import { api } from "./api";
import type { CadastroRequest, LoginRequest, LoginResponse, Usuario } from "../types/auth";

export async function login(dados: LoginRequest): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/login", dados);
  return data;
}

export async function cadastrar(dados: CadastroRequest): Promise<Usuario> {
  const { data } = await api.post<Usuario>("/auth/cadastro", dados);
  return data;
}

export async function loginComGoogle(idToken: string): Promise<LoginResponse> {
  const { data } = await api.post<LoginResponse>("/auth/google", { idToken });
  return data;
}