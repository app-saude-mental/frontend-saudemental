import type { Duvida } from "../types/duvida";

interface Props {
  duvida: Duvida;
  onEditar: (duvida: Duvida) => void;
  onExcluir: (duvida: Duvida) => void;
}

function formatar(data: string): string {
  return new Date(data).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
}

export default function DuvidaCard({ duvida, onEditar, onExcluir }: Props) {
  const editada = duvida.atualizadoEm !== duvida.criadoEm;

  return (
    <li className="duv-item">
      <p className="duv-data">
        Enviada em {formatar(duvida.criadoEm)}
        {editada && " · editada"}
      </p>

      <p className="duv-mensagem">{duvida.mensagem}</p>

      <div className="duv-resposta">
        <h3>Resposta do enfermeiro</h3>
        {duvida.resposta ? (
          <p className="duv-resposta-texto">{duvida.resposta}</p>
        ) : (
          <p className="duv-pendente">O enfermeiro ainda não respondeu.</p>
        )}
      </div>

      <div className="duv-acoes-item">
        <button type="button" className="duv-acao" onClick={() => onEditar(duvida)}>
          Editar
        </button>
        <button type="button" className="duv-acao perigo" onClick={() => onExcluir(duvida)}>
          Excluir
        </button>
      </div>
    </li>
  );
}
