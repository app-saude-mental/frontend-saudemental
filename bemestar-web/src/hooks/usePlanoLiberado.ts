import { useEffect, useState } from "react";
import type { PlanoEfetivo, Usuario } from "../types/auth";

// Último estado de plano que a pessoa já "viu" neste aparelho (por usuário)
interface PlanoVisto {
  tipo: string;
  status: string | null;
  venceEm: string | null;
}

export type EventoPlano = "liberado" | "renovado" | null;

const chave = (id: number) => `respire-plano-visto-${id}`;

function resumo(p: PlanoEfetivo): PlanoVisto {
  return { tipo: p.tipo, status: p.status, venceEm: p.venceEm };
}

function ler(id: number): PlanoVisto | null {
  try {
    const bruto = localStorage.getItem(chave(id));
    return bruto ? (JSON.parse(bruto) as PlanoVisto) : null;
  } catch {
    return null;
  }
}

function gravar(id: number, visto: PlanoVisto) {
  try {
    localStorage.setItem(chave(id), JSON.stringify(visto));
  } catch {
    // sem localStorage: a celebração pode aparecer de novo em outra visita
  }
}

/**
 * Detecta, ao voltar ao app, que o enfermeiro liberou (ou renovou) o plano premium.
 * No primeiro uso o estado atual vira a referência, sem celebrar.
 */
export function usePlanoLiberado(usuario: Usuario | null) {
  const id = usuario?.id ?? null;
  const plano = usuario?.planoEfetivo ?? null;
  const [visto, setVisto] = useState<PlanoVisto | null>(() => (id ? ler(id) : null) ?? (plano ? resumo(plano) : null));

  // grava a referência inicial (só escreve no localStorage, sem setState)
  useEffect(() => {
    if (id !== null && plano && !ler(id)) gravar(id, resumo(plano));
  }, [id, plano]);

  let evento: EventoPlano = null;
  const premiumAtivo = !!plano && (plano.tipo === "ASSINANTE" || plano.tipo === "PACIENTE") && plano.status === "ATIVO";
  if (premiumAtivo && plano && visto) {
    if (visto.tipo !== plano.tipo || visto.status !== "ATIVO") {
      evento = "liberado";
    } else if (plano.venceEm && visto.venceEm && plano.venceEm > visto.venceEm) {
      evento = "renovado";
    }
  }

  function confirmar() {
    if (id === null || !plano) return;
    const atual = resumo(plano);
    gravar(id, atual);
    setVisto(atual);
  }

  return { evento, plano, confirmar };
}
