import { useEffect, useRef } from "react";
import { useExcluirDuvida } from "../hooks/useDuvidas";
import { getErrorMessage } from "../services/apiError";
import type { Duvida } from "../types/duvida";

interface Props {
  duvida: Duvida | null; // null = modal fechado
  onFechar: () => void;
  onExcluida: () => void;
}

export default function ConfirmarExclusaoDuvida({ duvida, onFechar, onExcluida }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { mutateAsync, isPending, error, reset: limparErroApi } = useExcluirDuvida();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (duvida && !dialog.open) {
      limparErroApi();
      dialog.showModal();
    } else if (!duvida && dialog.open) {
      dialog.close();
    }
  }, [duvida, limparErroApi]);

  async function confirmar() {
    if (!duvida) return;
    try {
      await mutateAsync(duvida.id);
      onExcluida();
      onFechar();
    } catch {
      // a mensagem do back aparece abaixo, em `error`
    }
  }

  const trecho =
    duvida && duvida.mensagem.length > 120 ? `${duvida.mensagem.slice(0, 120)}...` : duvida?.mensagem;

  return (
    <dialog
      ref={dialogRef}
      className="duv-modal"
      aria-labelledby="duv-excluir-titulo"
      onClose={onFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="duv-modal-corpo">
        <h2 id="duv-excluir-titulo">Excluir esta dúvida?</h2>
        <p className="duv-modal-texto">“{trecho}”</p>
        <p className="duv-modal-texto">Essa ação não pode ser desfeita.</p>

        {error && (
          <p className="duv-erro-api" role="alert">
            {getErrorMessage(error)}
          </p>
        )}

        <div className="duv-acoes">
          <button type="button" className="btn-contorno" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="duv-perigo" onClick={confirmar} disabled={isPending}>
            {isPending ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
