import { Link } from "react-router-dom";
import { useAdminResumo } from "../../hooks/useAdmin";
import { getErrorMessage } from "../../services/apiError";

export default function AdminResumo() {
  const { data, isPending, isError, error, refetch } = useAdminResumo();

  if (isPending) return <p className="adm-estado" role="status">Carregando o resumo...</p>;

  if (isError) {
    return (
      <div className="adm-estado" role="alert">
        <p>{getErrorMessage(error)}</p>
        <button type="button" className="btn-secundario" onClick={() => refetch()}>
          Tentar de novo
        </button>
      </div>
    );
  }

  // cada contador leva à lista já filtrada
  const cartoes = [
    { rotulo: "Gratuito", valor: data.gratuitos, link: "/admin/usuarios?plano=GRATUITO" },
    { rotulo: "Premium Assinante", valor: data.assinantes, link: "/admin/usuarios?plano=ASSINANTE" },
    { rotulo: "Premium Paciente", valor: data.pacientes, link: "/admin/usuarios?plano=PACIENTE" },
    { rotulo: "Vencem em 7 dias", valor: data.vencendoEm7Dias, link: "/admin/usuarios?vencendoEmDias=7", alerta: true },
    { rotulo: "Vencidos", valor: data.vencidos, link: "/admin/usuarios?status=VENCIDO" },
    { rotulo: "Suspensos", valor: data.suspensos, link: "/admin/usuarios?status=SUSPENSO" },
    { rotulo: "Dúvidas pendentes", valor: data.duvidasPendentes, link: "/admin/duvidas?status=PENDENTE", alerta: true },
    {
      rotulo: "Solicitações pendentes",
      valor: data.solicitacoesPendentes,
      link: "/admin/solicitacoes?status=PENDENTE",
      alerta: true,
    },
  ];

  return (
    <>
      {data.premiumSemVigencia > 0 && (
        <p className="aviso alerta" role="status">
          {data.premiumSemVigencia} usuário(s) premium sem vigência registrada. Rode o backfill de planos
          (eles são tratados como Gratuito até lá).
        </p>
      )}
      <ul className="adm-resumo">
        {cartoes.map((c) => (
          <li key={c.rotulo}>
            <Link to={c.link} className={`adm-contador ${c.alerta && c.valor > 0 ? "alerta" : ""}`}>
              <span className="adm-contador-valor">{c.valor}</span>
              <span className="adm-contador-rotulo">{c.rotulo}</span>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
