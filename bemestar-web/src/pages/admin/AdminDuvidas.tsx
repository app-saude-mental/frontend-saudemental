import { Link, useSearchParams } from "react-router-dom";
import AnexosLista from "../../components/AnexosLista";
import Paginacao from "../../components/admin/Paginacao";
import RespostaDuvidaForm from "../../components/admin/RespostaDuvidaForm";
import { useAdminDuvidas } from "../../hooks/useAdmin";
import { getErrorMessage } from "../../services/apiError";
import { formatarDataHora } from "../../utils/data";

const FILTROS = [
  { valor: "PENDENTE", rotulo: "Pendentes" },
  { valor: "RESPONDIDA", rotulo: "Respondidas" },
  { valor: "", rotulo: "Todas" },
] as const;

export default function AdminDuvidas() {
  const [params, setParams] = useSearchParams();
  const bruto = params.get("status");
  const status = bruto === "RESPONDIDA" ? "RESPONDIDA" : bruto === "" || bruto === "TODAS" ? undefined : "PENDENTE";
  const pagina = Math.max(Number(params.get("pagina")) || 0, 0);
  const { data, isPending, isError, error, refetch, isPlaceholderData } = useAdminDuvidas(status, pagina);

  return (
    <>
      <div className="adm-filtro-abas" role="group" aria-label="Filtrar dúvidas">
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

      {isPending && <p className="adm-estado" role="status">Carregando dúvidas...</p>}
      {isError && (
        <div className="adm-estado" role="alert">
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="btn-secundario" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}
      {data && data.conteudo.length === 0 && (
        <p className="adm-estado">{status === "PENDENTE" ? "Nenhuma dúvida aguardando resposta." : "Nenhuma dúvida aqui."}</p>
      )}

      {data && data.conteudo.length > 0 && (
        <>
          <ul className={`adm-lista adm-cartoes ${isPlaceholderData ? "carregando" : ""}`}>
            {data.conteudo.map((d) => (
              <li key={d.id} className="adm-cartao">
                <p className="adm-sub">
                  <Link to={`/admin/usuarios/${d.usuario.id}`}>{d.usuario.nome}</Link> · {formatarDataHora(d.criadoEm)}
                </p>
                <p className="adm-mensagem">{d.mensagem}</p>
                <AnexosLista anexos={d.anexos ?? []} comoAdmin />
                <RespostaDuvidaForm key={`${d.id}-${d.resposta ?? ""}`} duvidaId={d.id} respostaAtual={d.resposta} />
                {d.respondidaEm && (
                  <p className="adm-sub">
                    Respondida em {formatarDataHora(d.respondidaEm)}
                    {d.respondidaPorNome && ` por ${d.respondidaPorNome}`}
                  </p>
                )}
              </li>
            ))}
          </ul>
          <Paginacao
            pagina={data.pagina}
            totalPaginas={data.totalPaginas}
            onMudar={(p) => setParams({ status: status ?? "TODAS", pagina: String(p) })}
          />
        </>
      )}
    </>
  );
}
