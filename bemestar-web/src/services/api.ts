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

// Se o back responder 401 com sessão ativa, o token venceu ou é inválido
api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    if (axios.isAxiosError(erro) && erro.response?.status === 401 && lerSessao()) {
      limparSessao();
      window.location.href = "/login";
    }
    return Promise.reject(erro);
  },
);