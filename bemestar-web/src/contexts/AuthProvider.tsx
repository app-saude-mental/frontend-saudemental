import { useCallback, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./authContext";
import { login, loginComGoogle } from "../services/authService";
import { lerSessao, salvarSessao, limparSessao, type Sessao } from "../services/sessao";
import type { LoginRequest, LoginResponse, Usuario } from "../types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao);

  function iniciarSessao(resposta: LoginResponse) {
    const nova: Sessao = {
      token: resposta.token,
      expiraEmMs: Date.now() + resposta.expiraEm * 1000,
      usuario: resposta.usuario,
    };
    salvarSessao(nova);
    setSessao(nova);
  }

  async function entrar(dados: LoginRequest) {
    iniciarSessao(await login(dados));
  }

  async function entrarComGoogle(idToken: string) {
    iniciarSessao(await loginComGoogle(idToken));
  }

  // troca só os dados do usuário, mantendo o token e a validade
  const atualizarUsuario = useCallback((usuario: Usuario) => {
    const atual = lerSessao();
    if (!atual) return;
    const nova: Sessao = { ...atual, usuario };
    salvarSessao(nova);
    setSessao(nova);
  }, []);

  function sair() {
    limparSessao();
    queryClient.clear(); // não deixa os dados de uma pessoa na memória para a próxima
    setSessao(null);
  }

  return (
    <AuthContext.Provider
      value={{
        usuario: sessao?.usuario ?? null,
        autenticado: sessao !== null,
        entrar,
        entrarComGoogle,
        atualizarUsuario,
        sair,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}