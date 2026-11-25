import { useEffect, useRef, useState } from "react";
import { ExternalLink, HeartHandshake, Phone, X } from "lucide-react";
import Ilustracao from "./Ilustracao";

interface Props {
  variante?: "botao" | "link" | "cartao";
  className?: string;
}

// "Precisa de ajuda agora?": contatos de emergência sempre a um toque (boa prática em apps
// de saúde mental). Nada é enviado a lugar nenhum: são só links tel: e o site do CVV.
export default function AjudaAgora({ variante = "botao", className = "" }: Props) {
  const [aberto, setAberto] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  const gatilho =
    variante === "cartao" ? (
      <button type="button" className={`ajuda-cartao ${className}`} onClick={() => setAberto(true)}>
        <HeartHandshake size={22} aria-hidden="true" />
        <span>
          <strong>Precisa de ajuda agora?</strong>
          <span>Contatos de apoio emocional, 24 horas e gratuitos.</span>
        </span>
      </button>
    ) : (
      <button
        type="button"
        className={`${variante === "link" ? "ajuda-link" : "ajuda-botao"} ${className}`}
        onClick={() => setAberto(true)}
      >
        <HeartHandshake size={18} aria-hidden="true" />
        <span>Ajuda agora</span>
      </button>
    );

  return (
    <>
      {gatilho}
      <dialog
        ref={dialogRef}
        className="modal ajuda-modal"
        aria-labelledby="ajuda-titulo"
        onClose={() => setAberto(false)}
        onClick={(e) => {
          if (e.target === e.currentTarget) setAberto(false);
        }}
      >
        <div className="ajuda-corpo">
          <button type="button" className="app-icone-botao ajuda-fechar" onClick={() => setAberto(false)} aria-label="Fechar">
            <X size={20} aria-hidden="true" />
          </button>
          <Ilustracao nome="maos" tamanho={96} />
          <h2 id="ajuda-titulo">Você não está sozinho</h2>
          <p className="ajuda-intro">
            Se a dor estiver grande demais agora, fale com alguém. Ligar é gratuito, sigiloso e funciona 24 horas.
          </p>

          <a className="ajuda-contato principal" href="tel:188">
            <Phone size={20} aria-hidden="true" />
            <span>
              <strong>188 · CVV</strong>
              <span>Apoio emocional e prevenção do suicídio</span>
            </span>
          </a>
          <a className="ajuda-contato" href="tel:192">
            <Phone size={20} aria-hidden="true" />
            <span>
              <strong>192 · SAMU</strong>
              <span>Emergência médica</span>
            </span>
          </a>
          <a className="ajuda-contato" href="https://cvv.org.br/chat/" target="_blank" rel="noopener noreferrer">
            <ExternalLink size={20} aria-hidden="true" />
            <span>
              <strong>Chat do CVV</strong>
              <span>Se preferir escrever em vez de ligar</span>
            </span>
          </a>
        </div>
      </dialog>
    </>
  );
}
