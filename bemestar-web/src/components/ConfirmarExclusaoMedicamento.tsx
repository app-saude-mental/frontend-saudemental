import { useEffect, useRef } from "react";
import { useExcluirMedicamento } from "../hooks/useMedicamentos";
import { getErrorMessage } from "../services/apiError";
import type { Medicamento } from "../types/medicamento";

interface Props {
  medicamento: Medicamento | null; // null = modal fechado
  onFechar: () => void;
  onExcluido: () => void;
}

export default function ConfirmarExclusaoMedicamento({ medicamento, onFechar, onExcluido }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { mutateAsync, isPending, error, reset: limparErroApi } = useExcluirMedicamento();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (medicamento && !dialog.open) {
      limparErroApi();
      dialog.showModal();
    } else if (!medicamento && dialog.open) {
      dialog.close();
    }
  }, [medicamento, limparErroApi]);

  async function confirmar() {
    if (!medicamento) return;
    try {
      await mutateAsync(medicamento.id);
      onExcluido();
      onFechar();
    } catch {
      // a mensagem do back aparece abaixo, em `error`
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="med-modal"
      aria-labelledby="med-excluir-titulo"
      onClose={onFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="med-form">
        <h2 id="med-excluir-titulo">Excluir medicação?</h2>
        <p className="med-texto">
          Você vai excluir <strong>{medicamento?.nome}</strong> ({medicamento?.dosagem}) das{" "}
          {medicamento?.horas}. Essa ação não pode ser desfeita.
        </p>

        {error && (
          <p className="med-erro-api" role="alert">
            {getErrorMessage(error)}
          </p>
        )}

        <div className="med-acoes">
          <button type="button" className="btn-contorno" onClick={onFechar}>
            Cancelar
          </button>
          <button type="button" className="med-perigo" onClick={confirmar} disabled={isPending}>
            {isPending ? "Excluindo..." : "Excluir"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
