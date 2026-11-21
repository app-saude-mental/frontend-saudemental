import { useEffect, useRef } from "react";
import { Check, X } from "lucide-react";
import { DETALHES_PLANO, type ChavePlano } from "../data/regrasPlano";

interface ModalPlanoProps {
  plano: ChavePlano | null; // null = fechado
  onFechar: () => void;
}

// Explicação de um plano (aberta pelo botão "i" do cartão). Mesmo padrão do ModalTermos:
// <dialog> nativo, fecha com Esc, com o botão e com clique no fundo.
export default function ModalPlano({ plano, onFechar }: ModalPlanoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (plano && !dialog.open) dialog.showModal();
    if (!plano && dialog.open) dialog.close();
  }, [plano]);

  const detalhe = plano ? DETALHES_PLANO[plano] : null;

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-plano"
      aria-labelledby="modal-plano-titulo"
      onClose={onFechar}
      onClick={(e) => {
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      {detalhe && (
        <div className="modal-corpo">
          <header className="modal-topo modal-plano-topo">
            <h2 id="modal-plano-titulo">{detalhe.titulo}</h2>
            <button type="button" className="app-icone-botao" onClick={onFechar} aria-label="Fechar">
              <X size={20} aria-hidden="true" />
            </button>
          </header>

          <div className="modal-texto">
            <p className="modal-plano-resumo">{detalhe.resumo}</p>
            <ul className="modal-plano-itens">
              {detalhe.itens.map((item) => (
                <li key={item}>
                  <Check size={16} aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="modal-plano-rodape">{detalhe.rodape}</p>
          </div>

          <footer className="modal-rodape">
            <button type="button" className="btn-principal" onClick={onFechar}>
              Entendi
            </button>
          </footer>
        </div>
      )}
    </dialog>
  );
}
