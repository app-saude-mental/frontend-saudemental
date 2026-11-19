import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Copy, HeartHandshake, MessageCircle } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/useAuth";
import { REGRAS_PLANO, TEXTOS_ASSINATURA } from "../data/regrasPlano";
import { useContatoEnfermeiro, usePagamento, useSolicitarPlano } from "../hooks/useAssinatura";
import { getErrorMessage } from "../services/apiError";
import type { ErrorResponse, PlanoPremium } from "../types/auth";
import { formatarDataHora } from "../utils/data";
import { linkWhatsApp } from "../utils/whatsapp";
import "../styles/planos.css";

const NOMES: Record<PlanoPremium, string> = {
  ASSINANTE: "Premium Assinante",
  PACIENTE: "Premium Paciente",
};

const LIMITE_MENSAGEM = 500;

// Botão "Copiar" com confirmação acessível
function BotaoCopiar({ texto, rotulo }: { texto: string; rotulo: string }) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      setCopiado(false);
    }
  }

  return (
    <button type="button" className="btn-secundario guia-copiar" onClick={copiar}>
      {copiado ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      <span aria-live="polite">{copiado ? "Copiado!" : rotulo}</span>
    </button>
  );
}

// Dados do PIX fixo (chave e valor). Paciente: valor combinado na consulta.
function DadosPix({ plano }: { plano: PlanoPremium }) {
  const pagamento = usePagamento();
  const dados = pagamento.data?.planos.find((p) => p.plano === plano);

  if (pagamento.isPending) return <p role="status">Carregando os dados do PIX...</p>;

  if (pagamento.isError || !pagamento.data || !dados) {
    return (
      <div className="erro-api" role="alert">
        <p>Não foi possível carregar o PIX agora.</p>
        <button type="button" className="btn-secundario" onClick={() => pagamento.refetch()}>
          Tentar de novo
        </button>
      </div>
    );
  }

  return (
    <dl className="guia-pix">
      <div>
        <dt>Valor</dt>
        <dd className="guia-valor">
          {dados.valor
            ? `R$ ${dados.valor.replace(".", ",")} / ${pagamento.data.duracaoDias} dias`
            : "O valor combinado na consulta com o enfermeiro"}
        </dd>
      </div>
      <div>
        <dt>Chave PIX (e-mail)</dt>
        <dd className="guia-chave">
          <code>{pagamento.data.chavePix}</code>
          <BotaoCopiar texto={pagamento.data.chavePix} rotulo="Copiar chave" />
        </dd>
      </div>
      <p className="guia-nota">
        No app do seu banco, escolha <strong>Pix → Pagar com chave</strong>, cole a chave
        {dados.valor ? " e confira o valor." : " e digite o valor combinado na consulta."}
      </p>
    </dl>
  );
}

function LinkWhatsApp({ href, rotulo, desabilitado = false }: { href: string | null; rotulo: string; desabilitado?: boolean }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`guia-whatsapp ${desabilitado ? "desabilitado" : ""}`}
      aria-disabled={desabilitado}
      onClick={(e) => {
        if (desabilitado) e.preventDefault(); // as regras precisam ser aceitas antes
      }}
    >
      <MessageCircle size={18} aria-hidden="true" /> {rotulo}
    </a>
  );
}

export default function SerPremium() {
  const { usuario } = useAuth();
  const [params, setParams] = useSearchParams();
  const plano: PlanoPremium = params.get("plano") === "PACIENTE" ? "PACIENTE" : "ASSINANTE";
  const contato = useContatoEnfermeiro();
  const solicitar = useSolicitarPlano();
  const [mensagem, setMensagem] = useState("");
  const [entendi, setEntendi] = useState(false);

  if (!usuario) return null;

  const pendente = usuario.solicitacaoPendente;
  const whatsappPagamento = linkWhatsApp(
    contato.data,
    `Olá! Fiz o PIX do plano ${NOMES[plano]} no Respire. E-mail da conta: ${usuario.email}`,
  );
  const whatsappConversa = linkWhatsApp(
    contato.data,
    `Olá! Quero conversar sobre o plano Premium Paciente do Respire. E-mail da conta: ${usuario.email}`,
  );
  const conflito =
    axios.isAxiosError<ErrorResponse>(solicitar.error) && solicitar.error.response?.status === 409;

  function escolher(p: PlanoPremium) {
    setParams({ plano: p }, { replace: true });
    solicitar.reset();
  }

  function enviar(tipo: "PIX_INFORMADO" | "CONTATO_ENFERMEIRO") {
    solicitar.mutate({ planoDesejado: plano, tipo, mensagem: mensagem.trim() || undefined });
  }

  const voltar = (
    <Link to="/planos" className="guia-voltar">
      <ArrowLeft size={16} aria-hidden="true" /> Voltar aos planos
    </Link>
  );

  // ---------- Já existe um pedido com o enfermeiro ----------
  if (pendente && pendente.tipo !== "ARREPENDIMENTO") {
    const conversa = pendente.tipo === "CONTATO_ENFERMEIRO";
    return (
      <section className="guia">
        {voltar}
        <header className="guia-topo">
          <h1>{conversa ? "Conversa pedida" : "Aguardando o enfermeiro"}</h1>
          <p>
            Pedido de {NOMES[pendente.planoDesejado]} enviado em {formatarDataHora(pendente.criadaEm)}.
          </p>
        </header>
        <div className="guia-cartao" role="status">
          <p>
            {conversa
              ? "O enfermeiro vai falar com você. Depois da consulta, pague o valor combinado no PIX abaixo e avise pelo WhatsApp: ele libera o seu plano."
              : TEXTOS_ASSINATURA.aguardando}
          </p>
        </div>
        {conversa && (
          <div className="guia-cartao">
            <h2>PIX para depois da consulta</h2>
            <DadosPix plano={pendente.planoDesejado} />
            <LinkWhatsApp href={whatsappPagamento} rotulo="Avisar pelo WhatsApp que paguei" />
          </div>
        )}
      </section>
    );
  }

  const paciente = plano === "PACIENTE";

  const passoAvisar = (numero: number) => (
    <li className="guia-cartao">
      <h2>{numero}. Avise o enfermeiro que pagou</h2>
      <p className="guia-nota-topo">
        Avise por aqui ou pelo WhatsApp. O enfermeiro confere se o PIX caiu e libera o seu plano.
      </p>
      <label htmlFor="guia-mensagem" className="guia-rotulo">
        Mensagem para o enfermeiro (opcional)
      </label>
      <textarea
        id="guia-mensagem"
        className="guia-mensagem"
        rows={3}
        maxLength={LIMITE_MENSAGEM}
        value={mensagem}
        onChange={(e) => setMensagem(e.target.value)}
        placeholder="Ex.: paguei hoje às 14h."
      />
      <p className="guia-contador">
        {mensagem.length}/{LIMITE_MENSAGEM}
      </p>

      <label className="guia-entendi">
        <input type="checkbox" checked={entendi} onChange={(e) => setEntendi(e.target.checked)} />
        {REGRAS_PLANO.confirmacao}
      </label>

      {solicitar.isError && (
        <p className="erro-api" role="alert">
          {conflito ? "Você já tem uma solicitação aguardando o enfermeiro." : getErrorMessage(solicitar.error)}
        </p>
      )}

      <button
        type="button"
        className="btn-principal guia-enviar"
        onClick={() => enviar("PIX_INFORMADO")}
        disabled={!entendi || solicitar.isPending}
      >
        {solicitar.isPending ? "Enviando..." : "Já fiz o PIX — avisar pelo app"}
      </button>
      <LinkWhatsApp href={whatsappPagamento} rotulo="Avisar pelo WhatsApp" desabilitado={!entendi} />
    </li>
  );

  return (
    <section className="guia">
      {voltar}

      <header className="guia-topo">
        <h1>Ser premium</h1>
        <p>Siga os passos. A liberação é feita pelo seu enfermeiro.</p>
      </header>

      <ol className="guia-passos">
        <li className="guia-cartao">
          <h2>1. Escolha o plano</h2>
          <div className="guia-opcoes" role="radiogroup" aria-label="Plano">
            {(["ASSINANTE", "PACIENTE"] as PlanoPremium[]).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={plano === p}
                className={`guia-opcao ${plano === p ? "ativa" : ""}`}
                onClick={() => escolher(p)}
              >
                {NOMES[p]}
                <span className="guia-opcao-preco">{p === "ASSINANTE" ? "R$ 30 / mês" : "Valor na consulta"}</span>
              </button>
            ))}
          </div>
          {paciente && <p className="guia-nota">{REGRAS_PLANO.paciente}</p>}
        </li>

        {paciente ? (
          <>
            <li className="guia-cartao">
              <h2>2. Converse com o enfermeiro</h2>
              <p className="guia-nota-topo">
                Na consulta ele entende o que você precisa e combina o valor do acompanhamento.
              </p>
              <div className="guia-enfermeiro">
                <button
                  type="button"
                  className="btn-principal guia-enviar"
                  onClick={() => enviar("CONTATO_ENFERMEIRO")}
                  disabled={solicitar.isPending}
                >
                  <HeartHandshake size={18} aria-hidden="true" /> Pedir conversa pelo app
                </button>
                <LinkWhatsApp href={whatsappConversa} rotulo="Conversar pelo WhatsApp" />
              </div>
            </li>
            <li className="guia-cartao">
              <h2>3. Depois da consulta, pague pelo PIX</h2>
              <DadosPix plano="PACIENTE" />
            </li>
            {passoAvisar(4)}
          </>
        ) : (
          <>
            <li className="guia-cartao">
              <h2>2. Pague pelo PIX</h2>
              <DadosPix plano="ASSINANTE" />
            </li>
            {passoAvisar(3)}
            <li className="guia-cartao guia-final">
              <h2>4. Aguarde a liberação</h2>
              <p>O enfermeiro confere o pagamento e libera seu plano por 30 dias.</p>
            </li>
          </>
        )}
      </ol>

      <section className="planos-regras" aria-labelledby="guia-regras">
        <h2 id="guia-regras">{REGRAS_PLANO.titulo}</h2>
        <ul>
          {REGRAS_PLANO.itens.map((regra) => (
            <li key={regra}>{regra}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
