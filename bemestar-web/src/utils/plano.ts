import type { PlanoEfetivo, Recurso, StatusPlano } from "../types/auth";
import { formatarData } from "./data";

export const ROTULO_STATUS: Record<StatusPlano, string> = {
  ATIVO: "Ativo",
  SUSPENSO: "Suspenso",
  VENCIDO: "Vencido",
  CANCELADO: "Cancelado",
};

// Plano que libera cada recurso restrito (para o cartão de bloqueio)
export const PLANO_DO_RECURSO: Partial<Record<Recurso, string>> = {
  MEDICAMENTOS: "Premium",
  DUVIDAS: "Premium Paciente",
  ORIENTACOES: "Premium Paciente",
  SONS_COMPLETOS: "Premium",
};

// "vence em 18/12/2026, faltam 30 dias" / "vence hoje"
export function textoVigencia(plano: PlanoEfetivo): string | null {
  if (!plano.venceEm || plano.diasRestantes === null) return null;
  const data = formatarData(plano.venceEm);
  if (plano.diasRestantes <= 0) return `vence hoje (${data})`;
  if (plano.diasRestantes === 1) return `vence em ${data}, falta 1 dia`;
  return `vence em ${data}, faltam ${plano.diasRestantes} dias`;
}

// Nome a exibir: o contratado (mesmo suspenso) ou o efetivo
export function nomeDoPlano(plano: PlanoEfetivo): string {
  return plano.nomeContratado ?? plano.nome;
}
