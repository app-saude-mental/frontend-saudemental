import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "./authContext";
import { login, loginComGoogle, sairDeTodosNoServidor, sairNoServidor } from "../services/authService";
import { renovarSessao } from "../services/renovacao";
import { buscarMeuPerfil } from "../services/perfilService";
import { EVENTO_RECURSO_BLOQUEADO } from "../services/api";
import { CHAVE_USUARIO_ATUAL } from "../hooks/usePerfil";
import {
  CHAVE_SESSAO,
  EVENTO_SESSAO,
  accessPertoDeVencer,
  lerSessao,
  limparSessao,
  salvarSessao,
  sessaoDeResposta,
  type Sessao,
} from "../services/sessao";
import type { LoginRequest, SessaoResponse, Usuario } from "../types/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [sessao, setSessao] = useState<Sessao | null>(lerSessao);
  // abriu o app com o access vencido: renova antes de liberar as rotas privadas (sem piscar o login)
  const [inicializando, setInicializando] = useState(() => {
    const salva = lerSessao();
    return salva !== null && accessPertoDeVencer(salva);
  });

  // mantém o estado igual ao localStorage: renovações feitas pelo api.ts e ações de outras abas
  useEffect(() => {
    function sincronizar() {
      const atual = lerSessao();
      setSessao(atual);
      if (!atual) queryClient.clear(); // saiu (aqui ou em outra aba): não deixa dados na memória
    }
    function aoMudarStorage(evento: StorageEvent) {
      if (evento.key === null || evento.key === CHAVE_SESSAO) sincronizar();
    }
    window.addEventListener(EVENTO_SESSAO, sincronizar);
    window.addEventListener("storage", aoMudarStorage);
    return () => {
      window.removeEventListener(EVENTO_SESSAO, sincronizar);
      window.removeEventListener("storage", aoMudarStorage);
    };
  }, [queryClient]);

  useEffect(() => {
    if (!inicializando) return;
    let ativo = true;
    renovarSessao()
      .catch(() => null) // rede: mantém a sessão; a próxima requisição tenta de novo
      .finally(() => {
        if (ativo) setInicializando(false);
      });
    return () => {
      ativo = false;
    };
  }, [inicializando]);

  function iniciarSessao(resposta: SessaoResponse) {
    const nova = sessaoDeResposta(resposta);
    salvarSessao(nova);
    setSessao(nova);
  }

  async function entrar(dados: LoginRequest) {
    iniciarSessao(await login(dados));
  }

  async function entrarComGoogle(idToken: string, intencao?: "ENTRAR" | "CRIAR") {
    iniciarSessao(await loginComGoogle(idToken, intencao));
  }

  // troca só os dados do usuário, mantendo os tokens
  const atualizarUsuario = useCallback((usuario: Usuario) => {
    const atual = lerSessao();
    if (!atual) return;
    const nova: Sessao = { ...atual, usuario };
    salvarSessao(nova);
    setSessao(nova);
  }, []);

  function sair() {
    const atual = lerSessao();
    limparSessao();
    queryClient.clear(); // não deixa os dados de uma pessoa na memória para a próxima
    setSessao(null);
    // revoga no servidor sem travar a saída (o back responde 204 mesmo com token inválido)
    if (atual) sairNoServidor(atual.refreshToken).catch(() => undefined);
  }

  async function sairDeTodos() {
    await sairDeTodosNoServidor();
    sair();
  }

  const atualizarStatus = useCallback(async () => {
    await renovarSessao({ forcar: true }); // novo access token com o perfil atual
    const usuario = await buscarMeuPerfil();
    queryClient.setQueryData(CHAVE_USUARIO_ATUAL, usuario);
    atualizarUsuario(usuario);
  }, [queryClient, atualizarUsuario]);

  // o back recusou um recurso (403 RECURSO_BLOQUEADO): o plano mudou, atualiza a interface
  useEffect(() => {
    function aoBloquear() {
      atualizarStatus().catch(() => undefined);
    }
    window.addEventListener(EVENTO_RECURSO_BLOQUEADO, aoBloquear);
    return () => window.removeEventListener(EVENTO_RECURSO_BLOQUEADO, aoBloquear);
  }, [atualizarStatus]);

  const usuario = sessao?.usuario ?? null;
  const recursos = usuario?.recursos ?? [];

  return (
    <AuthContext.Provider
      value={{
        usuario,
        autenticado: sessao !== null,
        inicializando,
        entrar,
        entrarComGoogle,
        atualizarUsuario,
        sair,
        sairDeTodos,
        pode: (recurso) => recursos.includes(recurso),
        ehAdmin: usuario?.perfil === "ADMIN",
        atualizarStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
