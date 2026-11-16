import type { ReactNode } from "react";
import { Check, X } from "lucide-react";

interface ItemBeneficio {
  texto: string;
  incluso: boolean;
}

interface PlanoCardProps {
  nome: string;
  subtitulo: string;
  preco: number;
  icone: ReactNode;
  beneficios: ItemBeneficio[];
  atual: boolean;
  rotuloBotao: string;
  destaque?: boolean;
  desabilitado?: boolean;
  onEscolher?: () => void;
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
  onEscolher,
}: PlanoCardProps) {
  return (
    <article className={`plano-card ${destaque ? "destaque" : ""} ${atual ? "atual" : ""}`}>
      {destaque && <span className="plano-fita">Recomendado</span>}

      <div className="plano-cabecalho">
        <span className="plano-icone">{icone}</span>
        {atual && <span className="plano-selo">Seu plano</span>}
      </div>

      <h2 className="plano-nome">{nome}</h2>
      <p className="plano-desc">{subtitulo}</p>

      <p className="plano-preco">
        <span className="preco-moeda">R$</span>
        <span className="preco-valor">{preco}</span>
        <span className="preco-periodo">/mês</span>
      </p>

      <ul className="beneficios">
        {beneficios.map((b) => (
          <li key={b.texto} className={`beneficio ${b.incluso ? "" : "indisponivel"}`}>
            <span className="beneficio-marca" aria-hidden="true">
              {b.incluso ? <Check size={14} /> : <X size={14} />}
            </span>
            <span className="sr-only">{b.incluso ? "Incluso: " : "Não incluso: "}</span>
            <span className="beneficio-texto">{b.texto}</span>
          </li>
        ))}
      </ul>

      <button type="button" className="plano-botao" disabled={desabilitado} onClick={onEscolher}>
        {rotuloBotao}
      </button>
    </article>
  );
}