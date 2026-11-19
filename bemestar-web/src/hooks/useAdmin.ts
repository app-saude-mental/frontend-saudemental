import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as admin from "../services/adminService";
import type { PlanoPremium } from "../types/auth";
import type { StatusSolicitacao } from "../types/assinatura";
import type { AcaoPlano, FiltroUsuarios, OrientacaoRequest } from "../types/admin";

// Todas as chaves começam com "admin": cada ação invalida o painel inteiro (listas, contadores, detalhe).
const RAIZ = ["admin"] as const;

function useInvalidarPainel() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: RAIZ });
}

// Sininho: consulta a cada 30 s e ao voltar o foco. As ações do painel invalidam ["admin"],
// então o número também cai na hora quando algo é resolvido.
export function useNotificacoes(habilitado: boolean) {
  return useQuery({
    queryKey: [...RAIZ, "notificacoes"],
    queryFn: admin.buscarNotificacoes,
    enabled: habilitado,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminResumo() {
  return useQuery({ queryKey: [...RAIZ, "resumo"], queryFn: admin.buscarResumo });
}

export function useAdminUsuarios(filtro: FiltroUsuarios) {
  return useQuery({
    queryKey: [...RAIZ, "usuarios", filtro],
    queryFn: () => admin.listarUsuarios(filtro),
    placeholderData: keepPreviousData,
  });
}

export function useAdminUsuario(id: number) {
  return useQuery({ queryKey: [...RAIZ, "usuario", id], queryFn: () => admin.buscarUsuario(id) });
}

export function useHistoricoPlano(id: number, pagina: number) {
  return useQuery({
    queryKey: [...RAIZ, "historico", id, pagina],
    queryFn: () => admin.listarHistoricoPlano(id, pagina),
    placeholderData: keepPreviousData,
  });
}

export function useHabitosSemana(id: number, ate: string) {
  return useQuery({
    queryKey: [...RAIZ, "habitos", id, ate],
    queryFn: () => admin.buscarHabitosSemana(id, ate),
    placeholderData: keepPreviousData,
  });
}

export function useMedicamentosDoUsuario(id: number, pagina: number) {
  return useQuery({
    queryKey: [...RAIZ, "medicamentos", id, pagina],
    queryFn: () => admin.listarMedicamentosDoUsuario(id, pagina),
    placeholderData: keepPreviousData,
  });
}

export function useDuvidasDoUsuario(id: number, pagina: number) {
  return useQuery({
    queryKey: [...RAIZ, "duvidas-usuario", id, pagina],
    queryFn: () => admin.listarDuvidasDoUsuario(id, pagina),
    placeholderData: keepPreviousData,
  });
}

export function useOrientacoes(id: number) {
  return useQuery({ queryKey: [...RAIZ, "orientacoes", id], queryFn: () => admin.listarOrientacoes(id) });
}

export function useAdminDuvidas(status: "PENDENTE" | "RESPONDIDA" | undefined, pagina: number) {
  return useQuery({
    queryKey: [...RAIZ, "duvidas", status ?? "todas", pagina],
    queryFn: () => admin.listarDuvidasAdmin(status, pagina),
    placeholderData: keepPreviousData,
  });
}

export function useAdminSolicitacoes(status: StatusSolicitacao | undefined, pagina: number) {
  return useQuery({
    queryKey: [...RAIZ, "solicitacoes", status ?? "todas", pagina],
    queryFn: () => admin.listarSolicitacoes(status, pagina),
    placeholderData: keepPreviousData,
  });
}

// ---------- Ações ----------

export function useAcaoPlano() {
  const invalidar = useInvalidarPainel();
  return useMutation({
    mutationFn: (v: { id: number; acao: AcaoPlano; plano?: PlanoPremium; texto?: string }) =>
      admin.executarAcaoPlano(v.id, v.acao, { plano: v.plano, texto: v.texto }),
    onSuccess: invalidar,
  });
}

export function useExcluirUsuario() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => admin.excluirUsuario(id),
    // remove o detalhe do cache (não rebusca um usuário que não existe mais) e atualiza o resto
    onSuccess: (_, id) => {
      queryClient.removeQueries({ queryKey: [...RAIZ, "usuario", id] });
      return queryClient.invalidateQueries({ queryKey: RAIZ });
    },
  });
}

export function useSalvarOrientacao(usuarioId: number) {
  const invalidar = useInvalidarPainel();
  return useMutation({
    mutationFn: (v: { dados: OrientacaoRequest; dicaId?: number }) =>
      admin.salvarOrientacao(usuarioId, v.dados, v.dicaId),
    onSuccess: invalidar,
  });
}

export function useExcluirOrientacao(usuarioId: number) {
  const invalidar = useInvalidarPainel();
  return useMutation({
    mutationFn: (dicaId: number) => admin.excluirOrientacao(usuarioId, dicaId),
    onSuccess: invalidar,
  });
}

export function useResponderDuvida() {
  const invalidar = useInvalidarPainel();
  return useMutation({
    mutationFn: (v: { id: number; resposta: string }) => admin.responderDuvida(v.id, v.resposta),
    onSuccess: invalidar,
  });
}

export function useAtenderSolicitacao() {
  const invalidar = useInvalidarPainel();
  return useMutation({
    mutationFn: (v: { id: number; plano: PlanoPremium; observacao?: string }) =>
      admin.atenderSolicitacao(v.id, v.plano, v.observacao),
    onSuccess: invalidar,
  });
}

export function useRecusarSolicitacao() {
  const invalidar = useInvalidarPainel();
  return useMutation({
    mutationFn: (v: { id: number; motivo: string }) => admin.recusarSolicitacao(v.id, v.motivo),
    onSuccess: invalidar,
  });
}
