import { useState } from "react";
import { MessageCircle, Undo2 } from "lucide-react";
import ModalConfirmacao from "./admin/ModalConfirmacao";
import { useAuth } from "../contexts/useAuth";
import { TEXTOS_ARREPENDIMENTO } from "../data/regrasPlano";
import { useContatoEnfermeiro, useSolicitarPlano } from "../hooks/useAssinatura";
import { getErrorMessage } from "../services/apiError";
import { formatarDataHora } from "../utils/data";
import { linkWhatsApp } from "../utils/whatsapp";

/**
 * Direito de arrependimento (CDC art. 49): aparece só dentro do prazo informado pelo back.
 * O pedido não cancela sozinho: o enfermeiro devolve o PIX e encerra o plano.
 */
export default function DesistirPlano() {
  const { usuario } = useAuth();
  const solicitar = useSolicitarPlano();
  const contato = useContatoEnfermeiro();
  const [aberto, setAberto] = useState(false);
  const [abertura, setAbertura] = useState(0);

  if (!usuario) return null;

  const pendente = usuario.solicitacaoPendente;
  if (pendente?.tipo === "ARREPENDIMENTO") {
    return (
      <p className="desistir-aviso" role="status">
        {TEXTOS_ARREPENDIMENTO.pendente}
      </p>
    );
  }
  if (!usuario.arrependimentoAte) return null;

  const plano = usuario.planoEfetivo.contratado === "PACIENTE" ? "PACIENTE" : "ASSINANTE";
  const ate = formatarDataHora(usuario.arrependimentoAte);
  const whatsapp = linkWhatsApp(
    contato.data,
    `Olá! Quero desistir do meu plano no Respire (direito de arrependimento). E-mail da conta: ${usuario.email}`,
  );

  function abrir() {
    solicitar.reset();
    setAbertura((n) => n + 1);
    setAberto(true);
  }

  return (
    <section className="desistir" aria-labelledby="desistir-titulo">
      <h3 id="desistir-titulo">{TEXTOS_ARREPENDIMENTO.titulo}</h3>
      <p>{TEXTOS_ARREPENDIMENTO.explicacao(ate)}</p>

      {solicitar.isSuccess ? (
        <p className="desistir-aviso" role="status">
          {TEXTOS_ARREPENDIMENTO.enviado}
        </p>
      ) : (
        <div className="desistir-acoes">
          <button type="button" className="btn-secundario desistir-botao" onClick={abrir} disabled={!!pendente}>
            <Undo2 size={16} aria-hidden="true" />
            {TEXTOS_ARREPENDIMENTO.botao}
          </button>
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="desistir-whatsapp">
              <MessageCircle size={16} aria-hidden="true" /> Pedir pelo WhatsApp
            </a>
          )}
        </div>
      )}
      {pendente && !solicitar.isSuccess && (
        <p className="desistir-nota">Você já tem outra solicitação com o enfermeiro; aguarde a resposta dela.</p>
      )}

      {aberto && (
        <ModalConfirmacao
          key={abertura}
          aberto
          titulo={TEXTOS_ARREPENDIMENTO.confirmarTitulo}
          descricao={TEXTOS_ARREPENDIMENTO.confirmarDescricao}
          rotuloConfirmar="Confirmar desistência"
          perigo
          texto={{ rotulo: "Mensagem para o enfermeiro (opcional)", obrigatorio: false }}
          carregando={solicitar.isPending}
          erro={solicitar.isError ? getErrorMessage(solicitar.error) : null}
          onConfirmar={({ texto }) =>
            solicitar.mutate(
              { planoDesejado: plano, tipo: "ARREPENDIMENTO", mensagem: texto || undefined },
              { onSuccess: () => setAberto(false) },
            )
          }
          onCancelar={() => setAberto(false)}
        />
      )}
    </section>
  );
}
