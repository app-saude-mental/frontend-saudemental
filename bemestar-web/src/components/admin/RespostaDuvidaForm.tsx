import { useState } from "react";
import { useResponderDuvida } from "../../hooks/useAdmin";
import { getErrorMessage } from "../../services/apiError";

const LIMITE = 2000;

interface Props {
  duvidaId: number;
  respostaAtual: string | null;
}

// Responder ou editar a resposta de uma dúvida
export default function RespostaDuvidaForm({ duvidaId, respostaAtual }: Props) {
  const responder = useResponderDuvida();
  const [editando, setEditando] = useState(respostaAtual === null);
  const [texto, setTexto] = useState(respostaAtual ?? "");
  const idCampo = `resposta-${duvidaId}`;

  if (!editando && respostaAtual) {
    return (
      <div className="adm-resposta">
        <p className="adm-resposta-texto">{respostaAtual}</p>
        <button type="button" className="adm-acao" onClick={() => setEditando(true)}>
          Editar resposta
        </button>
      </div>
    );
  }

  function salvar() {
    if (!texto.trim()) return;
    responder.mutate({ id: duvidaId, resposta: texto.trim() }, { onSuccess: () => setEditando(false) });
  }

  return (
    <div className="adm-resposta">
      <label htmlFor={idCampo} className="adm-rotulo">
        Resposta do enfermeiro
      </label>
      <textarea
        id={idCampo}
        rows={3}
        maxLength={LIMITE}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
      />
      {responder.isError && (
        <p className="erro-api" role="alert">
          {getErrorMessage(responder.error)}
        </p>
      )}
      <div className="adm-linha-acoes">
        {respostaAtual && (
          <button type="button" className="adm-acao" onClick={() => setEditando(false)} disabled={responder.isPending}>
            Cancelar
          </button>
        )}
        <button
          type="button"
          className="adm-acao primaria"
          onClick={salvar}
          disabled={responder.isPending || !texto.trim()}
        >
          {responder.isPending ? "Enviando..." : respostaAtual ? "Salvar resposta" : "Responder"}
        </button>
      </div>
    </div>
  );
}
