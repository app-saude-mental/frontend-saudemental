import type { ReactNode } from "react";
import Ilustracao, { type NomeIlustracao } from "./Ilustracao";

interface Props {
  ilustracao: NomeIlustracao;
  titulo: string;
  texto?: string;
  children?: ReactNode; // ação (botão/link)
}

// Lista vazia com acolhimento: ilustração + convite gentil, em vez de só "nada aqui".
export default function EstadoVazio({ ilustracao, titulo, texto, children }: Props) {
  return (
    <div className="estado-vazio">
      <Ilustracao nome={ilustracao} tamanho={112} />
      <h2>{titulo}</h2>
      {texto && <p>{texto}</p>}
      {children && <div className="estado-vazio-acao">{children}</div>}
    </div>
  );
}
