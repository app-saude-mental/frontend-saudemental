import axios from "axios";
import { api } from "./api";
import { accessPertoDeVencer, lerSessao, limparSessao, salvarSessao, sessaoDeResposta, type Sessao } from "./sessao";
import type { ErrorResponse, SessaoResponse } from "../types/auth";

/**
 * Renovação da sessão com refresh token.
 * - Single-flight: na mesma aba, várias requisições esperando renovação compartilham uma só chamada.
 * - Entre abas: Web Locks (ou, sem suporte, uma trava simples no localStorage). Dentro da trava a
 *   sessão é relida: se outra aba já renovou, usamos o par novo sem chamar o servidor.
 * - 409 do back (token girado há instantes por outra aba): relê a sessão e tenta uma vez.
 *
 * Retorna a sessão nova, ou null quando o refresh foi recusado (a sessão é limpa).
 * Erro de rede é repassado e a sessão é mantida.
 */

const NOME_TRAVA = "respire-refresh";
const CHAVE_TRAVA_LOCAL = "sessao-trava";
const VALIDADE_TRAVA_MS = 10_000;

let emAndamento: Promise<Sessao | null> | null = null;

export function renovarSessao(opcoes: { forcar?: boolean } = {}): Promise<Sessao | null> {
  if (!emAndamento) {
    emAndamento = comTrava(() => executar(opcoes.forcar ?? false)).finally(() => {
      emAndamento = null;
    });
  }
  return emAndamento;
}

async function executar(forcar: boolean): Promise<Sessao | null> {
  const antes = lerSessao();
  if (!antes) return null;
  if (!forcar && !accessPertoDeVencer(antes)) return antes; // outra aba já renovou

  try {
    return await pedirRenovacao(antes.refreshToken);
  } catch (erro) {
    const status = axios.isAxiosError(erro) ? erro.response?.status : undefined;
    const codigo = axios.isAxiosError<ErrorResponse>(erro) ? erro.response?.data?.codigo : undefined;

    if (status === 409 && codigo === "REFRESH_EM_ANDAMENTO") {
      await esperar(300);
      const atual = lerSessao();
      if (!atual) return null;
      if (atual.refreshToken !== antes.refreshToken) return atual; // a outra aba salvou o par novo
      return pedirRenovacao(atual.refreshToken);
    }
    if (status === 401 || status === 400) {
      limparSessao();
      return null;
    }
    throw erro;
  }
}

async function pedirRenovacao(refreshToken: string): Promise<Sessao> {
  const { data } = await api.post<SessaoResponse>("/auth/refresh", { refreshToken }, { semRenovacao: true });
  const nova = sessaoDeResposta(data);
  salvarSessao(nova);
  return nova;
}

// ---------- Trava entre abas ----------

function comTrava<T>(acao: () => Promise<T>): Promise<T> {
  if (typeof navigator !== "undefined" && navigator.locks?.request) {
    return navigator.locks.request(NOME_TRAVA, acao);
  }
  return comTravaLocal(acao);
}

interface TravaLocal {
  id: string;
  expira: number;
}

function lerTrava(): TravaLocal | null {
  try {
    const bruto = localStorage.getItem(CHAVE_TRAVA_LOCAL);
    return bruto ? (JSON.parse(bruto) as TravaLocal) : null;
  } catch {
    return null;
  }
}

// Melhor esforço: se não conseguir a trava em 10 s, segue assim mesmo
// (o back ainda protege com a tolerância de 409).
async function comTravaLocal<T>(acao: () => Promise<T>): Promise<T> {
  const id = Math.random().toString(36).slice(2);
  const limite = Date.now() + VALIDADE_TRAVA_MS;

  while (Date.now() < limite) {
    const trava = lerTrava();
    if (!trava || trava.expira < Date.now()) {
      localStorage.setItem(CHAVE_TRAVA_LOCAL, JSON.stringify({ id, expira: Date.now() + VALIDADE_TRAVA_MS }));
      await esperar(25);
      if (lerTrava()?.id === id) break;
    }
    await esperar(100);
  }

  try {
    return await acao();
  } finally {
    if (lerTrava()?.id === id) localStorage.removeItem(CHAVE_TRAVA_LOCAL);
  }
}

function esperar(ms: number) {
  return new Promise((resolver) => setTimeout(resolver, ms));
}
