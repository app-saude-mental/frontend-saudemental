import type { ReactNode } from "react";
import { Check, Info, X } from "lucide-react";

interface ItemBeneficio {
  texto: string;
  incluso: boolean;
  detalhe?: string; // ex.: "2 sons"
}

interface PlanoCardProps {
  nome: string;
  subtitulo: string;
  preco: string | null; // "29,90"; null = valor indisponível
  icone: ReactNode;
  beneficios: ItemBeneficio[];
  atual: boolean;
  rotuloBotao: string;
  destaque?: boolean;
  desabilitado?: boolean;
  selo?: string; // situação do plano atual, ex.: "Suspenso"
  semPreco?: string; // texto no lugar do preço quando preco = null
  onEscolher?: () => void;
  onInfo?: () => void; // abre a explicação do plano (botão "i")
}

export default function PlanoCard({
  nome,
  subtitulo,
  preco,
  icone,
  beneficios,
  atual,
  rotuloBotao,
  destaque = false,
  desabilitado = false,
  selo,
  semPreco = "Valor com o enfermeiro",
  onEscolher,
  onInfo,
}: PlanoCardProps) {
  return (
    <article className={`plano-card ${destaque ? "destaque" : ""} ${atual ? "atual" : ""}`}>
      {destaque && <span className="plano-fita">Acompanhamento</span>}

      <div className="plano-cabecalho">
        <span className="plano-icone">{icone}</span>
        <div className="plano-cabecalho-acoes">
          {atual && <span className="plano-selo">{selo ?? "Seu plano"}</span>}
          {onInfo && (
            <button
              type="button"
              className="plano-info"
              onClick={onInfo}
              aria-label={`Saiba mais sobre o plano ${nome}`}
              title="Saiba mais sobre este plano"
            >
              <Info size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      <h2 className="plano-nome">{nome}</h2>
      <p className="plano-desc">{subtitulo}</p>

      <p className="plano-preco">
        {preco === null ? (
          <span className="preco-indisponivel">{semPreco}</span>
        ) : (
          <>
            <span className="preco-moeda">R$</span>
            <span className="preco-valor">{preco}</span>
            <span className="preco-periodo">/mês</span>
          </>
        )}
      </p>

      <ul className="beneficios">
        {beneficios.map((b) => (
          <li key={b.texto} className={`beneficio ${b.incluso ? "" : "indisponivel"}`}>
            <span className="beneficio-marca" aria-hidden="true">
              {b.incluso ? <Check size={14} /> : <X size={14} />}
            </span>
            <span className="sr-only">{b.incluso ? "Incluso: " : "Não incluso: "}</span>
            <span className="beneficio-texto">
              {b.texto}
              {b.detalhe && <strong className="beneficio-detalhe"> — {b.detalhe}</strong>}
            </span>
          </li>
        ))}
      </ul>

      <button type="button" className="plano-botao" disabled={desabilitado} onClick={onEscolher}>
        {rotuloBotao}
      </button>
    </article>
  );
}
