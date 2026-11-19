import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ModalConfirmacao from "../../components/admin/ModalConfirmacao";
import Paginacao from "../../components/admin/Paginacao";
import { useAdminSolicitacoes, useAtenderSolicitacao, useRecusarSolicitacao } from "../../hooks/useAdmin";
import { getErrorMessage } from "../../services/apiError";
import type { AdminSolicitacao } from "../../types/admin";
import type { StatusSolicitacao, TipoSolicitacao } from "../../types/assinatura";
import { formatarDataHora } from "../../utils/data";

const FILTROS: { valor: StatusSolicitacao | ""; rotulo: string }[] = [
  { valor: "PENDENTE", rotulo: "Pendentes" },
  { valor: "ATENDIDA", rotulo: "Atendidas" },
  { valor: "RECUSADA", rotulo: "Recusadas" },
  { valor: "", rotulo: "Todas" },
];

const ROTULO_STATUS: Record<StatusSolicitacao, string> = {
  PENDENTE: "Pendente",
  ATENDIDA: "Atendida",
  RECUSADA: "Recusada",
};

const ROTULO_TIPO: Record<TipoSolicitacao, string> = {
  PIX_INFORMADO: "Informou PIX",
  CONTATO_ENFERMEIRO: "Quer falar com o enfermeiro",
  ARREPENDIMENTO: "Quer desistir (direito de arrependimento)",
};

type Acao = { tipo: "atender" | "recusar"; item: AdminSolicitacao };

export default function AdminSolicitacoes() {
  const [params, setParams] = useSearchParams();
  const bruto = params.get("status");
  const status: StatusSolicitacao | undefined =
    bruto === "ATENDIDA" || bruto === "RECUSADA" ? bruto : bruto === "TODAS" ? undefined : "PENDENTE";
  const pagina = Math.max(Number(params.get("pagina")) || 0, 0);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAdminSolicitacoes(status, pagina);

  const atender = useAtenderSolicitacao();
  const recusar = useRecusarSolicitacao();
  const [acao, setAcao] = useState<Acao | null>(null);
  const [abertura, setAbertura] = useState(0);

  function abrir(nova: Acao) {
    atender.reset();
    recusar.reset();
    setAbertura((n) => n + 1);
    setAcao(nova);
  }

  function confirmar({ plano, texto }: { plano?: "ASSINANTE" | "PACIENTE"; texto: string }) {
    if (!acao) return;
    const id = acao.item.solicitacao.id;
    const fechar = { onSuccess: () => setAcao(null) };
    if (acao.tipo === "atender") {
      atender.mutate({ id, plano: plano ?? acao.item.solicitacao.planoDesejado, observacao: texto || undefined }, fechar);
    } else {
      recusar.mutate({ id, motivo: texto }, fechar);
    }
  }

  const mutacao = acao?.tipo === "atender" ? atender : recusar;
  const desistencia = acao?.item.solicitacao.tipo === "ARREPENDIMENTO";

  return (
    <>
      <div className="adm-filtro-abas" role="group" aria-label="Filtrar solicitações">
        {FILTROS.map((f) => (
          <button
            key={f.rotulo}
            type="button"
            className={`adm-aba ${(status ?? "") === f.valor ? "ativa" : ""}`}
            aria-pressed={(status ?? "") === f.valor}
            onClick={() => setParams({ status: f.valor || "TODAS" })}
          >
            {f.rotulo}
          </button>
        ))}
      </div>

      {isPending && <p className="adm-estado" role="status">Carregando solicitações...</p>}
      {isError && (
        <div className="adm-estado" role="alert">
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="btn-secundario" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}
      {data && data.conteudo.length === 0 && <p className="adm-estado">Nenhuma solicitação aqui.</p>}

      {data && data.conteudo.length > 0 && (
        <>
          <ul className={`adm-lista adm-cartoes ${isPlaceholderData ? "carregando" : ""}`}>
            {data.conteudo.map((item) => {
              const s = item.solicitacao;
              return (
                <li key={s.id} className="adm-cartao">
                  <p>
                    <Link to={`/admin/usuarios/${item.usuario.id}`}>
                      <strong>{item.usuario.nome}</strong>
                    </Link>{" "}
                    <span className="adm-sub">{item.usuario.email}</span>
                  </p>
                  <p>
                    {ROTULO_TIPO[s.tipo]} ·{" "}
                    <strong>{s.planoDesejado === "PACIENTE" ? "Premium Paciente" : "Premium Assinante"}</strong> ·{" "}
                    {formatarDataHora(s.criadaEm)}
                  </p>
                  {s.mensagem && <p className="adm-mensagem">“{s.mensagem}”</p>}
                  <p className="adm-sub">
                    <span className={`adm-status ${s.status.toLowerCase()}`}>{ROTULO_STATUS[s.status]}</span>
                    {s.atendidaEm && ` em ${formatarDataHora(s.atendidaEm)}`}
                    {item.atendidaPorNome && ` por ${item.atendidaPorNome}`}
                    {s.motivoRecusa && ` · motivo: ${s.motivoRecusa}`}
                  </p>
                  {s.status === "PENDENTE" && (
                    <div className="adm-linha-acoes">
                      <button
                        type="button"
                        className={`adm-acao ${s.tipo === "ARREPENDIMENTO" ? "perigo" : "primaria"}`}
                        onClick={() => abrir({ tipo: "atender", item })}
                      >
                        {s.tipo === "ARREPENDIMENTO" ? "Devolvi o PIX: cancelar plano" : "Atender e ativar"}
                      </button>
                      <button type="button" className="adm-acao perigo" onClick={() => abrir({ tipo: "recusar", item })}>
                        Recusar
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <Paginacao
            pagina={data.pagina}
            totalPaginas={data.totalPaginas}
            onMudar={(p) => setParams({ status: status ?? "TODAS", pagina: String(p) })}
          />
        </>
      )}

      {acao && (
        <ModalConfirmacao
          key={abertura}
          aberto
          titulo={
            acao.tipo === "recusar"
              ? `Recusar — ${acao.item.usuario.nome}`
              : desistencia
                ? `Desistência — ${acao.item.usuario.nome}`
                : `Atender — ${acao.item.usuario.nome}`
          }
          descricao={
            acao.tipo === "recusar"
              ? "A solicitação é encerrada e o usuário verá o motivo."
              : desistencia
                ? "Devolva o valor pago pelo mesmo PIX e confirme: o plano é cancelado agora e a conta volta ao Gratuito."
                : "Confirme que o PIX caiu (ou que a consulta foi feita). O plano é ativado por 30 dias — ou somado ao vencimento atual."
          }
          rotuloConfirmar={acao.tipo === "recusar" ? "Recusar" : desistencia ? "Cancelar plano" : "Ativar plano"}
          perigo={acao.tipo === "recusar" || desistencia}
          pedirPlano={acao.tipo === "atender" && !desistencia}
          planoInicial={acao.item.solicitacao.planoDesejado}
          texto={
            acao.tipo === "atender"
              ? { rotulo: "Observação (opcional)", obrigatorio: false }
              : { rotulo: "Motivo", obrigatorio: true }
          }
          carregando={mutacao.isPending}
          erro={mutacao.isError ? getErrorMessage(mutacao.error) : null}
          onConfirmar={confirmar}
          onCancelar={() => setAcao(null)}
        />
      )}
    </>
  );
}
