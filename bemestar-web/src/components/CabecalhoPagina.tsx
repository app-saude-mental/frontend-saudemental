import type { ReactNode } from "react";
import Ilustracao, { type NomeIlustracao } from "./Ilustracao";

interface Props {
  titulo: ReactNode;
  subtitulo?: ReactNode;
  sobretitulo?: string; // texto pequeno acima do título (ex.: "Seu espaço")
  ilustracao?: NomeIlustracao;
  acao?: ReactNode; // botão à direita (ex.: "+ Adicionar")
  children?: ReactNode; // conteúdo extra abaixo do subtítulo
}

// Cabeçalho padrão das telas do paciente: mesma hierarquia, respiro e ilustração em todas.
export default function CabecalhoPagina({ titulo, subtitulo, sobretitulo, ilustracao, acao, children }: Props) {
  return (
    <header className="cabecalho">
      <div className="cabecalho-texto">
        {sobretitulo && <p className="cabecalho-sobre">{sobretitulo}</p>}
        <h1>{titulo}</h1>
        {subtitulo && <p className="cabecalho-sub">{subtitulo}</p>}
        {children}
        {acao && <div className="cabecalho-acao">{acao}</div>}
      </div>
      {ilustracao && <Ilustracao nome={ilustracao} tamanho={128} className="cabecalho-ilustracao" />}
    </header>
  );
}
