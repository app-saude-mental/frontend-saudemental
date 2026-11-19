import { useState } from "react";
import ModalConfirmacao from "./ModalConfirmacao";
import { useAcaoPlano } from "../../hooks/useAdmin";
import { getErrorMessage } from "../../services/apiError";
import type { Perfil, PlanoEfetivo, PlanoPremium } from "../../types/auth";
import type { AcaoPlano } from "../../types/admin";
import { formatarData } from "../../utils/data";

interface UsuarioAlvo {
  id: number;
  nome: string;
  perfil: Perfil;
  planoEfetivo: PlanoEfetivo;
  ultimoPlanoPremium?: PlanoPremium | null;
}

// Ações disponíveis conforme o plano efetivo (o back valida de novo e responde 409 se não couber)
function acoesDisponiveis(u: UsuarioAlvo): AcaoPlano[] {
  if (u.perfil === "ADMIN") return [];
  const p = u.planoEfetivo;
  const ativo = p.status === "ATIVO" && (p.tipo === "ASSINANTE" || p.tipo === "PACIENTE");
  const suspenso = p.status === "SUSPENSO" && p.contratado !== null;
  if (ativo) return ["ativar", "suspender", "cancelar"];
  if (suspenso) return ["reativar", "ativar", "cancelar"];
  return ["ativar"];
}

export default function AcoesPlano({ usuario, compacto = false }: { usuario: UsuarioAlvo; compacto?: boolean }) {
  const acao = useAcaoPlano();
  const [aberta, setAberta] = useState<AcaoPlano | null>(null);
  const [abertura, setAbertura] = useState(0); // troca a key do modal: formulário limpo a cada abertura

  const p = usuario.planoEfetivo;
  const vigente = (p.status === "ATIVO" || p.status === "SUSPENSO") && p.venceEm;
  const acoes = acoesDisponiveis(usuario);
  if (acoes.length === 0) return null;

  const planoInicial: PlanoPremium =
    usuario.ultimoPlanoPremium ?? (p.contratado === "PACIENTE" ? "PACIENTE" : "ASSINANTE");

  const config: Record<AcaoPlano, { rotulo: string; titulo: string; descricao: string; perigo?: boolean }> = {
    ativar: {
      rotulo: vigente ? "Reassinar" : "Ativar plano",
      titulo: vigente ? `Reassinar — ${usuario.nome}` : `Ativar plano — ${usuario.nome}`,
      descricao: vigente
        ? `Soma 30 dias ao vencimento atual (${formatarData(p.venceEm)}). Confirme que o pagamento foi recebido.`
        : "O plano vale por 30 dias a partir de agora. Confirme que o pagamento foi recebido.",
    },
    suspender: {
      rotulo: "Suspender",
      titulo: `Suspender — ${usuario.nome}`,
      descricao: "Os recursos premium ficam bloqueados na hora. A vigência continua contando e pode ser reativada.",
      perigo: true,
    },
    reativar: {
      rotulo: "Reativar",
      titulo: `Reativar — ${usuario.nome}`,
      descricao: `Libera de novo os recursos premium até ${formatarData(p.venceEm)}.`,
    },
    cancelar: {
      rotulo: "Cancelar plano",
      titulo: `Cancelar plano — ${usuario.nome}`,
      descricao: "Volta ao plano Gratuito agora e encerra a vigência. Use quando o pagamento não ocorrer.",
      perigo: true,
    },
  };

  function abrir(a: AcaoPlano) {
    acao.reset();
    setAbertura((n) => n + 1);
    setAberta(a);
  }

  function confirmar({ plano, texto }: { plano?: PlanoPremium; texto: string }) {
    if (!aberta) return;
    acao.mutate(
      { id: usuario.id, acao: aberta, plano, texto: texto || undefined },
      { onSuccess: () => setAberta(null) },
    );
  }

  return (
    <div className={`adm-acoes ${compacto ? "compacto" : ""}`}>
      {acoes.map((a) => (
        <button
          key={a}
          type="button"
          className={`adm-acao ${config[a].perigo ? "perigo" : ""}`}
          onClick={() => abrir(a)}
          aria-label={`${config[a].rotulo}: ${usuario.nome}`}
        >
          {config[a].rotulo}
        </button>
      ))}

      {aberta && (
        <ModalConfirmacao
          key={abertura}
          aberto
          titulo={config[aberta].titulo}
          descricao={config[aberta].descricao}
          rotuloConfirmar={config[aberta].rotulo}
          perigo={config[aberta].perigo}
          pedirPlano={aberta === "ativar"}
          planoInicial={planoInicial}
          texto={
            aberta === "cancelar"
              ? { rotulo: "Motivo", obrigatorio: true }
              : { rotulo: "Observação (opcional)", obrigatorio: false }
          }
          carregando={acao.isPending}
          erro={acao.isError ? getErrorMessage(acao.error) : null}
          onConfirmar={confirmar}
          onCancelar={() => setAberta(null)}
        />
      )}
    </div>
  );
}
