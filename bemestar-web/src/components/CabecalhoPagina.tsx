import type { ReactNode } from "react";
import type { NomeIlustracao } from "./Ilustracao";
import TextoRevelado from "./TextoRevelado";

interface Props {
  titulo: ReactNode;
  subtitulo?: ReactNode;
  sobretitulo?: string; // texto pequeno acima do título (ex.: "Seu espaço")
  ilustracao?: NomeIlustracao; // mantido por compatibilidade; o cabeçalho novo não mostra ilustração
  acao?: ReactNode; // botão à direita (ex.: "+ Adicionar")
  children?: ReactNode; // conteúdo extra abaixo do subtítulo
}

// Cabeçalho padrão das telas do paciente: selo, título editorial e subtítulo, em todas as telas.
export default function CabecalhoPagina({ titulo, subtitulo, sobretitulo, acao, children }: Props) {
  return (
    <header className="cabecalho">
      <div className="cabecalho-texto">
        {sobretitulo && <p className="cabecalho-sobre">{sobretitulo}</p>}
        <h1>{typeof titulo === "string" ? <TextoRevelado texto={titulo} /> : titulo}</h1>
        {subtitulo && <p className="cabecalho-sub">{subtitulo}</p>}
        {children}
        {acao && <div className="cabecalho-acao">{acao}</div>}
      </div>
    </header>
  );
}
