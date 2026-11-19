import type { SessaoResponse, Usuario } from "../types/auth";

export const CHAVE_SESSAO = "sessao";
// disparado na própria aba sempre que a sessão é salva ou removida
// (as outras abas recebem o evento nativo "storage")
export const EVENTO_SESSAO = "sessao-alterada";

// margem para renovar antes de o access token vencer
const MARGEM_RENOVACAO_MS = 60_000;

export interface Sessao {
  accessToken: string;
  expiraEmMs: number; // momento em que o access token vence
  refreshToken: string;
  usuario: Usuario;
}

function ehSessao(valor: unknown): valor is Sessao {
  if (!valor || typeof valor !== "object") return false;
  const s = valor as Record<string, unknown>;
  return (
    typeof s.accessToken === "string" &&
    typeof s.refreshToken === "string" &&
    typeof s.expiraEmMs === "number" &&
    typeof s.usuario === "object" &&
    s.usuario !== null
  );
}

// Não apaga a sessão quando o access vence: o refresh token ainda pode renová-la.
export function lerSessao(): Sessao | null {
  try {
    const bruto = localStorage.getItem(CHAVE_SESSAO);
    if (!bruto) return null;
    const dados: unknown = JSON.parse(bruto);
    if (!ehSessao(dados)) {
      // formato antigo (só "token") ou corrompido: pede um novo login
      localStorage.removeItem(CHAVE_SESSAO);
      return null;
    }
    return dados;
  } catch {
    return null;
  }
}

export function salvarSessao(sessao: Sessao) {
  localStorage.setItem(CHAVE_SESSAO, JSON.stringify(sessao));
  window.dispatchEvent(new Event(EVENTO_SESSAO));
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_SESSAO);
  window.dispatchEvent(new Event(EVENTO_SESSAO));
}

export function sessaoDeResposta(resposta: SessaoResponse): Sessao {
  return {
    accessToken: resposta.accessToken,
    refreshToken: resposta.refreshToken,
    expiraEmMs: Date.now() + resposta.expiraEm * 1000,
    usuario: resposta.usuario,
  };
}

export function accessPertoDeVencer(sessao: Sessao) {
  return Date.now() >= sessao.expiraEmMs - MARGEM_RENOVACAO_MS;
}
