import { api } from "./api";
import type { AtualizaPerfilRequest, Usuario } from "../types/auth";

export async function buscarMeuPerfil(): Promise<Usuario> {
  const { data } = await api.get<Usuario>("/usuarios/me");
  return data;
}

export async function atualizarMeuPerfil(dados: AtualizaPerfilRequest): Promise<Usuario> {
  const { data } = await api.put<Usuario>("/usuarios/me", dados);
  return data;
}

export async function excluirMinhaConta(): Promise<void> {
  await api.delete("/usuarios/me");
}