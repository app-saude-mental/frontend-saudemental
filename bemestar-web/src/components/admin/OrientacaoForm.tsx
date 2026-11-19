import { useState, type FormEvent } from "react";
import { useSalvarOrientacao } from "../../hooks/useAdmin";
import { getErrorMessage } from "../../services/apiError";
import type { Dica } from "../../types/dica";

interface Props {
  usuarioId: number;
  editando: Dica | null;
  onConcluir: () => void;
}

// Criar/editar orientação do enfermeiro. Use key={editando?.id ?? "nova"} para reiniciar o formulário.
export default function OrientacaoForm({ usuarioId, editando, onConcluir }: Props) {
  const salvar = useSalvarOrientacao(usuarioId);
  const [titulo, setTitulo] = useState(editando?.titulo ?? "");
  const [texto, setTexto] = useState(editando?.texto ?? "");
  const valido = titulo.trim().length > 0 && texto.trim().length > 0;

  function enviar(e: FormEvent) {
    e.preventDefault();
    if (!valido) return;
    salvar.mutate(
      { dados: { titulo: titulo.trim(), texto: texto.trim() }, dicaId: editando?.id },
      {
        onSuccess: () => {
          setTitulo("");
          setTexto("");
          onConcluir();
        },
      },
    );
  }

  return (
    <form className="adm-form" onSubmit={enviar}>
      <label className="adm-campo">
        <span>Título</span>
        <input value={titulo} maxLength={100} onChange={(e) => setTitulo(e.target.value)} required />
      </label>
      <label className="adm-campo">
        <span>Orientação</span>
        <textarea rows={3} value={texto} maxLength={1000} onChange={(e) => setTexto(e.target.value)} required />
      </label>
      {salvar.isError && (
        <p className="erro-api" role="alert">
          {getErrorMessage(salvar.error)}
        </p>
      )}
      <div className="adm-linha-acoes">
        {editando && (
          <button type="button" className="adm-acao" onClick={onConcluir} disabled={salvar.isPending}>
            Cancelar edição
          </button>
        )}
        <button type="submit" className="adm-acao primaria" disabled={!valido || salvar.isPending}>
          {salvar.isPending ? "Salvando..." : editando ? "Salvar orientação" : "Adicionar orientação"}
        </button>
      </div>
    </form>
  );
}
