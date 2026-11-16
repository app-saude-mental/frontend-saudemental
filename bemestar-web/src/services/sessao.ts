import type { Usuario } from "../types/auth";

const CHAVE = "sessao";

export interface Sessao {
  token: string;
  expiraEmMs: number; // momento exato em que o token vence
  usuario: Usuario;
}

export function lerSessao(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE);
    if (!bruto) return null;

    const sessao = JSON.parse(bruto) as Sessao;
    if (Date.now() >= sessao.expiraEmMs) {
      localStorage.removeItem(CHAVE);
      return null;
    }
    return sessao;
  } catch {
    return null; // JSON corrompido: trata como sem sessão
  }
}

export function salvarSessao(sessao: Sessao) {
  localStorage.setItem(CHAVE, JSON.stringify(sessao));
}

export function limparSessao() {
  localStorage.removeItem(CHAVE);
}