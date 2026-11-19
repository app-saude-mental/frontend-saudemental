import { useEffect, useRef, useState } from "react";
import type { PlanoPremium } from "../../types/auth";

interface CampoTexto {
  rotulo: string;
  obrigatorio: boolean;
  max?: number;
}

interface ModalConfirmacaoProps {
  aberto: boolean;
  titulo: string;
  descricao: string;
  rotuloConfirmar: string;
  perigo?: boolean;
  pedirPlano?: boolean;
  planoInicial?: PlanoPremium;
  texto?: CampoTexto;
  carregando?: boolean;
  erro?: string | null;
  onConfirmar: (dados: { plano?: PlanoPremium; texto: string }) => void;
  onCancelar: () => void;
}

/**
 * Confirmação das ações do painel (plano, solicitações). Usa <dialog> nativo, como ModalExclusao.
 * Quem usa deve trocar a "key" ao abrir para começar sempre com o formulário limpo.
 */
export default function ModalConfirmacao({
  aberto,
  titulo,
  descricao,
  rotuloConfirmar,
  perigo = false,
  pedirPlano = false,
  planoInicial = "ASSINANTE",
  texto,
  carregando = false,
  erro,
  onConfirmar,
  onCancelar,
}: ModalConfirmacaoProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [plano, setPlano] = useState<PlanoPremium>(planoInicial);
  const [valor, setValor] = useState("");
  const max = texto?.max ?? 500;
  const faltaTexto = !!texto?.obrigatorio && valor.trim().length === 0;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  function confirmar() {
    if (faltaTexto) return;
    onConfirmar({ plano: pedirPlano ? plano : undefined, texto: valor.trim() });
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal modal-pequeno"
      aria-labelledby="adm-modal-titulo"
      onCancel={(e) => {
        if (carregando) e.preventDefault();
      }}
      onClose={onCancelar}
      onClick={(e) => {
        if (e.target === e.currentTarget && !carregando) onCancelar();
      }}
    >
      <div className="adm-modal">
        <h2 id="adm-modal-titulo">{titulo}</h2>
        <p>{descricao}</p>

        {pedirPlano && (
          <fieldset className="adm-modal-planos">
            <legend>Plano</legend>
            {(["ASSINANTE", "PACIENTE"] as PlanoPremium[]).map((p) => (
              <label key={p} className="adm-radio">
                <input
                  type="radio"
                  name="adm-plano"
                  value={p}
                  checked={plano === p}
                  onChange={() => setPlano(p)}
                />
                {p === "ASSINANTE" ? "Premium Assinante" : "Premium Paciente"}
              </label>
            ))}
          </fieldset>
        )}

        {texto && (
          <label className="adm-campo">
            <span>
              {texto.rotulo}
              {texto.obrigatorio && " *"}
            </span>
            <textarea
              rows={3}
              maxLength={max}
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              aria-required={texto.obrigatorio}
            />
          </label>
        )}

        {erro && (
          <p className="erro-api" role="alert">
            {erro}
          </p>
        )}
      </div>

      <footer className="modal-rodape adm-modal-rodape">
        <button type="button" className="btn-secundario" onClick={onCancelar} disabled={carregando}>
          Voltar
        </button>
        <button
          type="button"
          className={perigo ? "btn-perigo" : "btn-principal adm-confirmar"}
          onClick={confirmar}
          disabled={carregando || faltaTexto}
        >
          {carregando ? "Salvando..." : rotuloConfirmar}
        </button>
      </footer>
    </dialog>
  );
}
