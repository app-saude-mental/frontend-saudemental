import { useEffect, useRef, type ReactNode } from "react";
import { Trash2 } from "lucide-react";

interface ModalExclusaoProps {
  aberto: boolean;
  titulo: string;
  mensagem: string;
  rotuloConfirmar: string;
  rotuloCarregando?: string;
  carregando?: boolean;
  onConfirmar: () => void;
  onCancelar: () => void;
  children?: ReactNode;
  confirmarDesabilitado?: boolean;
}

export default function ModalExclusao({
  aberto,
  titulo,
  mensagem,
  rotuloConfirmar,
  rotuloCarregando = "Aguarde...",
  carregando = false,
  onConfirmar,
  onCancelar,
  children,
  confirmarDesabilitado = false,
}: ModalExclusaoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // sincroniza o estado "aberto" do React com o <dialog> do navegador
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-pequeno"
      aria-labelledby="modal-exclusao-titulo"
      // ESC não fecha enquanto a exclusão está acontecendo
      onCancel={(e) => {
        if (carregando) e.preventDefault();
      }}
      onClose={onCancelar}
      onClick={(e) => {
        // clique no fundo escurecido fecha (o alvo é o próprio <dialog>)
        if (e.target === e.currentTarget && !carregando) onCancelar();
      }}
    >
      <div className="modal-exclusao">
        <span className="modal-exclusao-icone">
          <Trash2 size={22} aria-hidden="true" />
        </span>
        <h2 id="modal-exclusao-titulo">{titulo}</h2>
        <p>{mensagem}</p>
        {children}
      </div>

      <footer className="modal-rodape modal-exclusao-rodape">
        <button type="button" className="btn-secundario" onClick={onCancelar} disabled={carregando}>
          Cancelar
        </button>
        <button
  type="button"
  className="btn-perigo"
  onClick={onConfirmar}
  disabled={carregando || confirmarDesabilitado}
>
          {carregando ? rotuloCarregando : rotuloConfirmar}
        </button>
      </footer>
    </dialog>
  );
}