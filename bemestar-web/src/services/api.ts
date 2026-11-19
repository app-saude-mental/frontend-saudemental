import axios from "axios";
import { accessPertoDeVencer, lerSessao, limparSessao } from "./sessao";
import { renovarSessao } from "./renovacao";
import type { ErrorResponse } from "../types/auth";

declare module "axios" {
  interface AxiosRequestConfig {
    // chamadas de /auth/*: sem Authorization e sem tentativa de renovação
    semRenovacao?: boolean;
    // marca a requisição que já foi repetida após um refresh
    _tentouRenovar?: boolean;
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
});

// disparado quando o back recusa um recurso pelo plano (403 RECURSO_BLOQUEADO):
// o AuthProvider rebusca o usuário e a interface passa a mostrar o bloqueio
export const EVENTO_RECURSO_BLOQUEADO = "recurso-bloqueado";

// Antes de cada requisição: renova se o access token estiver para vencer.
api.interceptors.request.use(async (config) => {
  if (config.semRenovacao) return config;

  let sessao = lerSessao();
  if (sessao && accessPertoDeVencer(sessao)) {
    try {
      sessao = await renovarSessao();
    } catch {
      // falha de rede: segue com o token atual; se vier 401, a resposta trata
    }
  }
  if (sessao) {
    config.headers.Authorization = `Bearer ${sessao.accessToken}`;
  }
  return config;
});

// 401 em rota privada: tenta UM refresh e repete a requisição.
// Se o refresh for recusado, a sessão é limpa e o AuthProvider leva ao login.
// (Em /auth/* o 401 significa "senha errada" e quem trata é o formulário.)
api.interceptors.response.use(
  (resposta) => resposta,
  async (erro) => {
    if (
      axios.isAxiosError<ErrorResponse>(erro) &&
      erro.response?.status === 403 &&
      erro.response.data?.codigo === "RECURSO_BLOQUEADO"
    ) {
      window.dispatchEvent(new Event(EVENTO_RECURSO_BLOQUEADO));
      return Promise.reject(erro);
    }
    if (!axios.isAxiosError(erro) || erro.response?.status !== 401 || !erro.config) {
      return Promise.reject(erro);
    }
    const config = erro.config;
    if (config.semRenovacao) return Promise.reject(erro);
    if (config._tentouRenovar) {
      limparSessao();
      return Promise.reject(erro);
    }
    config._tentouRenovar = true;

    // se a requisição usou o token que ainda está salvo, ele é que foi recusado: força a renovação
    const atual = lerSessao();
    const forcar = !!atual && config.headers.Authorization === `Bearer ${atual.accessToken}`;

    let nova;
    try {
      nova = await renovarSessao({ forcar });
    } catch {
      return Promise.reject(erro); // rede: mantém a sessão
    }
    if (!nova) return Promise.reject(erro);

    config.headers.Authorization = `Bearer ${nova.accessToken}`;
    return api(config);
  },
);
