import axios from "axios";
import { lerSessao, limparSessao } from "./sessao";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080",
});

api.interceptors.request.use((config) => {
  const sessao = lerSessao();
  if (sessao) {
    config.headers.Authorization = `Bearer ${sessao.token}`;
  }
  return config;
});

// 401 fora das rotas de autenticação = token vencido ou inválido: limpa a sessão e volta ao login.
// (Em /auth/* o 401 significa "senha errada", e quem trata é o próprio formulário.)
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (axios.isAxiosError(erro) && erro.response?.status === 401) {
      const rotaDeAuth = erro.config?.url?.startsWith("/auth/") ?? false;
      if (!rotaDeAuth) {
        limparSessao();
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(erro);
  },
);