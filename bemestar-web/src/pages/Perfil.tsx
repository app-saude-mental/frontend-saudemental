import { useState } from "react";
import { Link } from "react-router-dom";
import { LogOut, RefreshCw } from "lucide-react";
import ExcluirConta from "../components/ExcluirConta";
import FormPerfil from "../components/FormPerfil";
import DesistirPlano from "../components/DesistirPlano";
import { useAuth } from "../contexts/useAuth";
import { usePerfil } from "../hooks/usePerfil";
import { getErrorMessage } from "../services/apiError";
import { ROTULO_STATUS, nomeDoPlano, textoVigencia } from "../utils/plano";
import "../styles/perfil.css";
import CabecalhoPagina from "../components/CabecalhoPagina";

export default function PerfilPage() {
  const { atualizarStatus, sairDeTodos } = useAuth();
  // usePerfil = usuário atual; o próprio hook mantém a sessão igual ao que o back devolveu
  const { data, isPending, isError, error, refetch } = usePerfil();
  const [aviso, setAviso] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  async function aoAtualizarStatus() {
    setOcupado(true);
    setAviso(null);
    try {
      await atualizarStatus();
      setAviso("Status do plano atualizado.");
    } catch (e) {
      setAviso(getErrorMessage(e));
    } finally {
      setOcupado(false);
    }
  }

  async function aoSairDeTodos() {
    if (!window.confirm("Encerrar a sessão em todos os dispositivos, inclusive neste?")) return;
    setOcupado(true);
    try {
      await sairDeTodos();
    } catch (e) {
      setAviso(getErrorMessage(e));
      setOcupado(false);
    }
  }

  const plano = data?.planoEfetivo;
  const vigencia = plano ? textoVigencia(plano) : null;
  const premiumAtivo = plano?.tipo === "ASSINANTE" || plano?.tipo === "PACIENTE";

  return (
    <section className="perfil">
      <CabecalhoPagina sobretitulo="Sua conta" titulo="Seu perfil" subtitulo="Gerencie seus dados, seu plano e sua conta." ilustracao="pessoa" />

      {isPending && <p className="perfil-aviso">Carregando seus dados...</p>}

      {isError && (
        <div className="perfil-aviso" role="alert">
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="btn-secundario" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}

      {data && plano && (
        <>
          <div className="perfil-cartao perfil-identidade">
            <span className="perfil-avatar" aria-hidden="true">
              {data.nome.trim().charAt(0).toUpperCase()}
            </span>
            <div className="perfil-info">
              <h2>{data.nome}</h2>
              <p>{data.email}</p>
              <div className="perfil-selos">
                <span className={`perfil-selo ${premiumAtivo || plano.tipo === "ADMIN" ? "premium" : ""}`}>
                  {nomeDoPlano(plano)}
                </span>
                {plano.status && plano.status !== "ATIVO" && (
                  <span className="perfil-selo alerta">{ROTULO_STATUS[plano.status]}</span>
                )}
              </div>
            </div>
          </div>

          <div className="perfil-cartao">
            <h2>Seu plano</h2>
            <p className="perfil-plano-linha">
              <strong>{nomeDoPlano(plano)}</strong>
              {plano.status && ` · ${ROTULO_STATUS[plano.status]}`}
              {vigencia && ` · ${vigencia}`}
            </p>
            {data.solicitacaoPendente && data.solicitacaoPendente.tipo !== "ARREPENDIMENTO" && (
              <p className="perfil-plano-linha">Você tem uma solicitação aguardando o enfermeiro.</p>
            )}
            <div className="perfil-acoes">
              <Link to="/planos" className="btn-secundario perfil-link">
                Ver planos
              </Link>
              <button type="button" className="btn-secundario perfil-botao" onClick={aoAtualizarStatus} disabled={ocupado}>
                <RefreshCw size={16} aria-hidden="true" />
                Atualizar status
              </button>
            </div>
            {aviso && (
              <p className="perfil-sucesso" role="status">
                {aviso}
              </p>
            )}
            <DesistirPlano />
          </div>

          <div className="perfil-cartao">
            <h2>Dados pessoais</h2>
            <FormPerfil key={data.id} usuario={data} />
          </div>

          <div className="perfil-cartao">
            <h2>Sessões</h2>
            <p className="perfil-plano-linha">
              Saia de todos os navegadores e celulares onde sua conta está aberta.
            </p>
            <button type="button" className="btn-secundario perfil-botao" onClick={aoSairDeTodos} disabled={ocupado}>
              <LogOut size={16} aria-hidden="true" />
              Sair de todos os dispositivos
            </button>
          </div>

          <div className="perfil-cartao perfil-perigo">
            <ExcluirConta usuario={data} />
          </div>
        </>
      )}
    </section>
  );
}
