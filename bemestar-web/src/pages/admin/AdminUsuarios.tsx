import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import AcoesPlano from "../../components/admin/AcoesPlano";
import Paginacao from "../../components/admin/Paginacao";
import { useAdminUsuarios } from "../../hooks/useAdmin";
import { getErrorMessage } from "../../services/apiError";
import type { FiltroUsuarios } from "../../types/admin";
import type { StatusPlano } from "../../types/auth";
import { ROTULO_STATUS, nomeDoPlano, textoVigencia } from "../../utils/plano";

const PLANOS = ["GRATUITO", "ASSINANTE", "PACIENTE"] as const;
const STATUS: StatusPlano[] = ["ATIVO", "SUSPENSO", "VENCIDO", "CANCELADO"];
const ROTULO_PLANO = { GRATUITO: "Gratuito", ASSINANTE: "Premium Assinante", PACIENTE: "Premium Paciente" };

// Filtros ficam na URL: os contadores da visão geral abrem a lista já filtrada
function lerFiltro(params: URLSearchParams): FiltroUsuarios {
  const plano = params.get("plano");
  const status = params.get("status");
  const dias = Number(params.get("vencendoEmDias"));
  const ordenar = params.get("ordenar");
  return {
    busca: params.get("busca") || undefined,
    plano: PLANOS.find((p) => p === plano),
    status: STATUS.find((s) => s === status),
    vencendoEmDias: dias > 0 ? dias : undefined,
    comSolicitacaoPendente: params.get("comSolicitacaoPendente") === "true" || undefined,
    comDuvidaPendente: params.get("comDuvidaPendente") === "true" || undefined,
    ordenar: ordenar === "email" || ordenar === "venceEm" || ordenar === "criadoEm" ? ordenar : "nome",
    direcao: params.get("direcao") === "desc" ? "desc" : "asc",
    pagina: Math.max(Number(params.get("pagina")) || 0, 0),
  };
}

export default function AdminUsuarios() {
  const [params, setParams] = useSearchParams();
  const filtro = lerFiltro(params);
  const [busca, setBusca] = useState(filtro.busca ?? "");
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAdminUsuarios(filtro);

  // altera um filtro e volta para a primeira página
  function definir(chave: string, valor: string | undefined) {
    const novos = new URLSearchParams(params);
    if (valor) novos.set(chave, valor);
    else novos.delete(chave);
    if (chave !== "pagina") novos.delete("pagina");
    setParams(novos);
  }

  function buscar(e: FormEvent) {
    e.preventDefault();
    definir("busca", busca.trim() || undefined);
  }

  return (
    <>
      <form className="adm-filtros" onSubmit={buscar} role="search">
        <label className="adm-campo adm-busca">
          <span>Buscar por nome ou e-mail</span>
          <span className="adm-busca-linha">
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} />
            <button type="submit" className="adm-acao primaria" aria-label="Buscar">
              <Search size={16} aria-hidden="true" />
            </button>
          </span>
        </label>

        <label className="adm-campo">
          <span>Plano</span>
          <select value={filtro.plano ?? ""} onChange={(e) => definir("plano", e.target.value || undefined)}>
            <option value="">Todos</option>
            {PLANOS.map((p) => (
              <option key={p} value={p}>
                {ROTULO_PLANO[p]}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-campo">
          <span>Situação</span>
          <select value={filtro.status ?? ""} onChange={(e) => definir("status", e.target.value || undefined)}>
            <option value="">Todas</option>
            {STATUS.map((s) => (
              <option key={s} value={s}>
                {ROTULO_STATUS[s]}
              </option>
            ))}
          </select>
        </label>

        <label className="adm-campo">
          <span>Vencendo em</span>
          <select
            value={filtro.vencendoEmDias ?? ""}
            onChange={(e) => definir("vencendoEmDias", e.target.value || undefined)}
          >
            <option value="">Qualquer data</option>
            <option value="3">3 dias</option>
            <option value="7">7 dias</option>
            <option value="15">15 dias</option>
          </select>
        </label>

        <label className="adm-campo">
          <span>Ordenar por</span>
          <select
            value={`${filtro.ordenar}-${filtro.direcao}`}
            onChange={(e) => {
              const [campo, direcao] = e.target.value.split("-");
              const novos = new URLSearchParams(params);
              novos.set("ordenar", campo);
              novos.set("direcao", direcao);
              novos.delete("pagina");
              setParams(novos);
            }}
          >
            <option value="nome-asc">Nome (A–Z)</option>
            <option value="venceEm-asc">Vencimento mais próximo</option>
            <option value="criadoEm-desc">Cadastro mais recente</option>
            <option value="email-asc">E-mail (A–Z)</option>
          </select>
        </label>

        <div className="adm-checks">
          <label className="adm-check">
            <input
              type="checkbox"
              checked={!!filtro.comSolicitacaoPendente}
              onChange={(e) => definir("comSolicitacaoPendente", e.target.checked ? "true" : undefined)}
            />
            Com solicitação pendente
          </label>
          <label className="adm-check">
            <input
              type="checkbox"
              checked={!!filtro.comDuvidaPendente}
              onChange={(e) => definir("comDuvidaPendente", e.target.checked ? "true" : undefined)}
            />
            Com dúvida pendente
          </label>
        </div>
      </form>

      {isPending && <p className="adm-estado" role="status">Carregando usuários...</p>}

      {isError && (
        <div className="adm-estado" role="alert">
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="btn-secundario" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}

      {data && data.conteudo.length === 0 && <p className="adm-estado">Nenhum usuário encontrado com esses filtros.</p>}

      {data && data.conteudo.length > 0 && (
        <>
          <p className="adm-total" role="status">
            {data.totalElementos} usuário(s)
          </p>
          <table className={`adm-tabela ${isPlaceholderData ? "carregando" : ""}`}>
            <thead>
              <tr>
                <th scope="col">Usuário</th>
                <th scope="col">Plano</th>
                <th scope="col">Pendências</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {data.conteudo.map((u) => {
                const vigencia = textoVigencia(u.planoEfetivo);
                return (
                  <tr key={u.id}>
                    <td data-rotulo="Usuário">
                      <strong>{u.nome}</strong>
                      <span className="adm-sub">{u.email}</span>
                    </td>
                    <td data-rotulo="Plano">
                      <span className="adm-selo">{nomeDoPlano(u.planoEfetivo)}</span>
                      {u.planoEfetivo.status && (
                        <span className={`adm-status ${u.planoEfetivo.status.toLowerCase()}`}>
                          {ROTULO_STATUS[u.planoEfetivo.status]}
                        </span>
                      )}
                      {vigencia && <span className="adm-sub">{vigencia}</span>}
                    </td>
                    <td data-rotulo="Pendências">
                      {u.solicitacaoPendente && <span className="adm-pendencia">Solicitação</span>}
                      {u.duvidasPendentes > 0 && (
                        <span className="adm-pendencia">
                          {u.duvidasPendentes} dúvida{u.duvidasPendentes > 1 ? "s" : ""}
                        </span>
                      )}
                      {!u.solicitacaoPendente && u.duvidasPendentes === 0 && <span className="adm-sub">—</span>}
                    </td>
                    <td data-rotulo="Ações">
                      <AcoesPlano usuario={u} compacto />
                      <Link to={`/admin/usuarios/${u.id}`} className="adm-acao link">
                        Ver detalhes
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Paginacao
            pagina={data.pagina}
            totalPaginas={data.totalPaginas}
            onMudar={(p) => definir("pagina", String(p))}
          />
        </>
      )}
    </>
  );
}
