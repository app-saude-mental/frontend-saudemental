import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Crown, HeartHandshake, RefreshCw, Sprout } from "lucide-react";
import PlanoCard from "../components/PlanoCard";
import DesistirPlano from "../components/DesistirPlano";
import ModalPlano from "../components/ModalPlano";
import { useAuth } from "../contexts/useAuth";
import { itensDoPlano } from "../data/beneficios";
import { REGRAS_PLANO, TEXTOS_ASSINATURA, type ChavePlano } from "../data/regrasPlano";
import { usePagamento } from "../hooks/useAssinatura";
import type { PlanoPremium, TipoPlano } from "../types/auth";
import { ROTULO_STATUS, nomeDoPlano, textoVigencia } from "../utils/plano";
import "../styles/planos.css";

function formatarValor(valor: string | null | undefined): string | null {
  return valor ? valor.replace(".", ",") : null;
}

export default function Planos() {
  const { usuario, atualizarStatus } = useAuth();
  const navigate = useNavigate();
  const pagamento = usePagamento();
  const [atualizando, setAtualizando] = useState(false);
  const [planoInfo, setPlanoInfo] = useState<ChavePlano | null>(null);

  if (!usuario) return null;

  const plano = usuario.planoEfetivo;
  const vigencia = textoVigencia(plano);
  const contratado: TipoPlano = plano.contratado ?? plano.tipo;
  const pendente = usuario.solicitacaoPendente;
  const ehAdmin = usuario.perfil === "ADMIN";

  const valor = (p: PlanoPremium) => formatarValor(pagamento.data?.planos.find((x) => x.plano === p)?.valor);

  function serPremium(p: PlanoPremium) {
    navigate(`/planos/premium?plano=${p}`);
  }

  // texto do botão de um cartão premium
  function rotulo(p: PlanoPremium): string {
    if (ehAdmin) return "Incluso no seu acesso";
    if (pendente) return "Aguardando o enfermeiro";
    if (plano.tipo === p) return "Renovar (+30 dias)";
    if (contratado === p && plano.status === "SUSPENSO") return "Plano suspenso";
    return p === "PACIENTE" ? "Falar com o enfermeiro" : "Ser premium";
  }

  async function aoAtualizar() {
    setAtualizando(true);
    try {
      await atualizarStatus();
    } finally {
      setAtualizando(false);
    }
  }

  return (
    <section>
      <header className="planos-topo">
        <h1 className="planos-ola">Planos</h1>
        <p className="planos-seu">
          Seu plano <span className="selo-plano">{nomeDoPlano(plano)}</span>
        </p>
        {(plano.status || vigencia) && (
          <p className="planos-vigencia">
            {plano.status && ROTULO_STATUS[plano.status]}
            {plano.status && vigencia && " · "}
            {vigencia}
          </p>
        )}
        <button type="button" className="btn-secundario planos-atualizar" onClick={aoAtualizar} disabled={atualizando}>
          <RefreshCw size={16} aria-hidden="true" />
          {atualizando ? "Atualizando…" : "Atualizar status"}
        </button>
      </header>

      {plano.status === "SUSPENSO" && (
        <p className="aviso alerta" role="status">
          Seu plano {plano.nomeContratado} está suspenso. Fale com o enfermeiro para reativá-lo.
        </p>
      )}
      {plano.status === "VENCIDO" && (
        <p className="aviso alerta" role="status">
          Seu plano venceu e sua conta voltou ao Gratuito. Seus registros continuam guardados.
        </p>
      )}
      {pendente && pendente.tipo !== "ARREPENDIMENTO" && (
        <p className="aviso" role="status">
          {TEXTOS_ASSINATURA.aguardando}
        </p>
      )}
      <div className="planos-desistir">
        <DesistirPlano />
      </div>

      <div className="planos-grid">
        <PlanoCard
          nome="Gratuito"
          subtitulo="O essencial para cuidar de você todos os dias."
          preco="0"
          icone={<Sprout size={22} />}
          beneficios={itensDoPlano("gratuito")}
          atual={plano.tipo === "GRATUITO" && !plano.contratado}
          rotuloBotao={plano.tipo === "GRATUITO" ? "Seu plano atual" : "Plano básico"}
          desabilitado
          onInfo={() => setPlanoInfo("gratuito")}
        />

        <PlanoCard
          nome="Premium Assinante"
          subtitulo="Todos os sons para meditar, dormir e focar, e a organização dos seus medicamentos."
          preco={valor("ASSINANTE") ?? "30"}
          icone={<Crown size={22} />}
          beneficios={itensDoPlano("assinante")}
          atual={contratado === "ASSINANTE"}
          selo={contratado === "ASSINANTE" && plano.status ? ROTULO_STATUS[plano.status] : undefined}
          rotuloBotao={rotulo("ASSINANTE")}
          desabilitado={ehAdmin || !!pendente || (contratado === "ASSINANTE" && plano.status === "SUSPENSO")}
          onEscolher={() => serPremium("ASSINANTE")}
          onInfo={() => setPlanoInfo("assinante")}
        />

        <PlanoCard
          nome="Premium Paciente"
          subtitulo="Tudo do app, com contato direto e orientações do enfermeiro."
          preco={valor("PACIENTE")}
          semPreco="Valor definido na consulta com o enfermeiro"
          destaque
          icone={<HeartHandshake size={22} />}
          beneficios={itensDoPlano("paciente")}
          atual={contratado === "PACIENTE"}
          selo={contratado === "PACIENTE" && plano.status ? ROTULO_STATUS[plano.status] : undefined}
          rotuloBotao={rotulo("PACIENTE")}
          desabilitado={ehAdmin || !!pendente || (contratado === "PACIENTE" && plano.status === "SUSPENSO")}
          onEscolher={() => serPremium("PACIENTE")}
          onInfo={() => setPlanoInfo("paciente")}
        />
      </div>

      {/* regras completas ficam à mão, mas recolhidas: a tela mostra primeiro os planos */}
      <details className="planos-regras">
        <summary>
          <h2>{REGRAS_PLANO.titulo}</h2>
          <ChevronDown size={18} aria-hidden="true" className="planos-regras-seta" />
        </summary>
        <ul>
          {REGRAS_PLANO.itens.map((regra) => (
            <li key={regra}>{regra}</li>
          ))}
        </ul>
      </details>

      <ModalPlano plano={planoInfo} onFechar={() => setPlanoInfo(null)} />
    </section>
  );
}
