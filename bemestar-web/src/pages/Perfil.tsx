import { useEffect } from "react";
import ExcluirConta from "../components/ExcluirConta";
import FormPerfil from "../components/FormPerfil";
import { useAuth } from "../contexts/useAuth";
import { usePerfil } from "../hooks/usePerfil";
import { getErrorMessage } from "../services/apiError";
import type { Perfil } from "../types/auth";
import "../styles/perfil.css";

const ROTULO_PERFIL: Record<Perfil, string> = {
  COMUM: "Usuário",
  ASSINANTE: "Assinante",
  PACIENTE: "Paciente",
  ADMIN: "Administrador",
};

export default function PerfilPage() {
  const { atualizarUsuario } = useAuth();
  const { data, isPending, isError, error, refetch } = usePerfil();

  // mantém a sessão (navbar, planos) igual ao que o back devolveu
  useEffect(() => {
    if (data) atualizarUsuario(data);
  }, [data, atualizarUsuario]);

  return (
    <section className="perfil">
      <header className="perfil-topo">
        <h1>Seu perfil</h1>
        <p>Gerencie seus dados e sua conta.</p>
      </header>

      {isPending && <p className="perfil-aviso">Carregando seus dados...</p>}

      {isError && (
        <div className="perfil-aviso" role="alert">
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="btn-secundario" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="perfil-cartao perfil-identidade">
            <span className="perfil-avatar" aria-hidden="true">
              {data.nome.trim().charAt(0).toUpperCase()}
            </span>
            <div className="perfil-info">
              <h2>{data.nome}</h2>
              <p>{data.email}</p>
              <div className="perfil-selos">
                <span className={`perfil-selo ${data.plano === "PREMIUM" ? "premium" : ""}`}>
                  Plano {data.plano === "PREMIUM" ? "Premium" : "Gratuito"}
                </span>
                {data.perfil !== "COMUM" && (
                  <span className="perfil-selo">{ROTULO_PERFIL[data.perfil]}</span>
                )}
                {data.plano === "PREMIUM" && !data.acessoLiberado && (
                  <span className="perfil-selo alerta">Assinatura inativa</span>
                )}
              </div>
            </div>
          </div>

          <div className="perfil-cartao">
            <h2>Dados pessoais</h2>
            <FormPerfil key={data.id} usuario={data} />
          </div>

          <div className="perfil-cartao perfil-perigo">
            <ExcluirConta usuario={data} />
          </div>
        </>
      )}
    </section>
  );
}