import { api } from "./api";
import type { Pagina } from "../types/diario";
import type { PlanoPremium } from "../types/auth";
import type { Dica } from "../types/dica";
import type { Duvida } from "../types/duvida";
import type { HabitosDia } from "../types/habito";
import type { Medicamento } from "../types/medicamento";
import type { StatusSolicitacao } from "../types/assinatura";
import type {
  AcaoPlano,
  AdminDuvida,
  AdminResumo,
  AdminSolicitacao,
  AdminUsuarioDetalhe,
  AdminUsuarioResumo,
  FiltroUsuarios,
  Notificacoes,
  OrientacaoRequest,
  PlanoEvento,
} from "../types/admin";

// Todas as rotas exigem ADMIN no back (403 para os demais).

export async function buscarResumo(): Promise<AdminResumo> {
  const { data } = await api.get<AdminResumo>("/admin/resumo");
  return data;
}

export async function buscarNotificacoes(): Promise<Notificacoes> {
  const { data } = await api.get<Notificacoes>("/admin/notificacoes");
  return data;
}

export async function listarUsuarios(filtro: FiltroUsuarios): Promise<Pagina<AdminUsuarioResumo>> {
  const { data } = await api.get<Pagina<AdminUsuarioResumo>>("/admin/usuarios", { params: filtro });
  return data;
}

export async function buscarUsuario(id: number): Promise<AdminUsuarioDetalhe> {
  const { data } = await api.get<AdminUsuarioDetalhe>(`/admin/usuarios/${id}`);
  return data;
}

// apaga a conta e todos os dados do usuário (não vale para ADMIN)
export async function excluirUsuario(id: number): Promise<void> {
  await api.delete(`/admin/usuarios/${id}`);
}

export async function executarAcaoPlano(
  id: number,
  acao: AcaoPlano,
  dados: { plano?: PlanoPremium; texto?: string },
): Promise<AdminUsuarioDetalhe> {
  const corpo =
    acao === "ativar"
      ? { plano: dados.plano, observacao: dados.texto || undefined }
      : acao === "cancelar"
        ? { motivo: dados.texto }
        : { observacao: dados.texto || undefined };
  const { data } = await api.post<AdminUsuarioDetalhe>(`/admin/usuarios/${id}/plano/${acao}`, corpo);
  return data;
}

export async function listarHistoricoPlano(id: number, pagina: number): Promise<Pagina<PlanoEvento>> {
  const { data } = await api.get<Pagina<PlanoEvento>>(`/admin/usuarios/${id}/historico-plano`, {
    params: { pagina },
  });
  return data;
}

export async function buscarHabitosSemana(id: number, ate: string): Promise<HabitosDia[]> {
  const { data } = await api.get<HabitosDia[]>(`/admin/usuarios/${id}/habitos/semana`, { params: { ate } });
  return data;
}

export async function listarMedicamentosDoUsuario(id: number, pagina: number): Promise<Pagina<Medicamento>> {
  const { data } = await api.get<Pagina<Medicamento>>(`/admin/usuarios/${id}/medicamentos`, {
    params: { pagina },
  });
  return data;
}

export async function listarDuvidasDoUsuario(id: number, pagina: number): Promise<Pagina<Duvida>> {
  const { data } = await api.get<Pagina<Duvida>>(`/admin/usuarios/${id}/duvidas`, { params: { pagina } });
  return data;
}

// ---------- Orientações ----------

export async function listarOrientacoes(id: number): Promise<Dica[]> {
  const { data } = await api.get<Dica[]>(`/admin/usuarios/${id}/dicas`);
  return data;
}

export async function salvarOrientacao(id: number, dados: OrientacaoRequest, dicaId?: number): Promise<Dica> {
  const { data } = dicaId
    ? await api.put<Dica>(`/admin/usuarios/${id}/dicas/${dicaId}`, dados)
    : await api.post<Dica>(`/admin/usuarios/${id}/dicas`, dados);
  return data;
}

export async function excluirOrientacao(id: number, dicaId: number): Promise<void> {
  await api.delete(`/admin/usuarios/${id}/dicas/${dicaId}`);
}

// ---------- Dúvidas ----------

export async function listarDuvidasAdmin(
  status: "PENDENTE" | "RESPONDIDA" | undefined,
  pagina: number,
  usuarioId?: number,
): Promise<Pagina<AdminDuvida>> {
  const { data } = await api.get<Pagina<AdminDuvida>>("/admin/duvidas", {
    params: { status, pagina, usuarioId },
  });
  return data;
}

export async function responderDuvida(id: number, resposta: string): Promise<AdminDuvida> {
  const { data } = await api.put<AdminDuvida>(`/admin/duvidas/${id}/resposta`, { resposta });
  return data;
}

// ---------- Solicitações ----------

export async function listarSolicitacoes(
  status: StatusSolicitacao | undefined,
  pagina: number,
): Promise<Pagina<AdminSolicitacao>> {
  const { data } = await api.get<Pagina<AdminSolicitacao>>("/admin/solicitacoes", { params: { status, pagina } });
  return data;
}

export async function atenderSolicitacao(id: number, plano: PlanoPremium, observacao?: string): Promise<AdminSolicitacao> {
  const { data } = await api.post<AdminSolicitacao>(`/admin/solicitacoes/${id}/atender`, { plano, observacao });
  return data;
}

export async function recusarSolicitacao(id: number, motivo: string): Promise<AdminSolicitacao> {
  const { data } = await api.post<AdminSolicitacao>(`/admin/solicitacoes/${id}/recusar`, { motivo });
  return data;
}
