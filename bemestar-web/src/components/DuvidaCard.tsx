import type { Duvida } from "../types/duvida";
import AnexosLista from "./AnexosLista";

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
    <li className={`duv-item ${duvida.resposta ? "respondida" : "pendente"}`}>
      <div className="duv-item-topo">
        <span className="duv-status">{duvida.resposta ? "Respondida" : "Aguardando resposta"}</span>
        <p className="duv-data">
          {formatar(duvida.criadoEm)}
          {editada && " · editada"}
        </p>
      </div>

      <p className="duv-mensagem">{duvida.mensagem}</p>
      <AnexosLista anexos={duvida.anexos ?? []} />

      <div className="duv-resposta">
        <h3>Resposta do enfermeiro</h3>
        {duvida.resposta ? (
          <>
            <p className="duv-resposta-texto">{duvida.resposta}</p>
            {duvida.respondidaEm && (
              <p className="duv-data">Respondida em {formatar(duvida.respondidaEm)}</p>
            )}
          </>
        ) : (
          <p className="duv-pendente">O enfermeiro ainda não respondeu.</p>
        )}
      </div>

      <div className="duv-acoes-item">
        {/* depois de respondida, a pergunta não muda (o back também recusa com 409) */}
        {!duvida.resposta && (
          <button type="button" className="duv-acao" onClick={() => onEditar(duvida)}>
            Editar
          </button>
        )}
        <button type="button" className="duv-acao perigo" onClick={() => onExcluir(duvida)}>
          Excluir
        </button>
      </div>
    </li>
  );
}
