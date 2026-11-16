import { useState } from "react";
import ModalExclusao from "./ModalExclusao";
import { useAuth } from "../contexts/useAuth";
import { useTransicao } from "../contexts/useTransicao";
import { useExcluirConta } from "../hooks/usePerfil";
import { getErrorMessage } from "../services/apiError";
import type { Usuario } from "../types/auth";

export default function ExcluirConta({ usuario }: { usuario: Usuario }) {
  const excluir = useExcluirConta();
  const { sair } = useAuth();
  const { comTransicao } = useTransicao();
  const [aberto, setAberto] = useState(false);
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);

  const ehAdmin = usuario.perfil === "ADMIN";
  const confirmado = confirmacao.trim().toUpperCase() === "EXCLUIR";

  function abrir() {
    setConfirmacao("");
    setErro(null);
    setAberto(true);
  }

  async function confirmar() {
    setErro(null);
    try {
      await excluir.mutateAsync();
      setAberto(false);
      await comTransicao("Sua conta foi excluída. Cuide-se.", sair);
    } catch (error) {
      setErro(getErrorMessage(error));
    }
  }

  return (
    <>
      <h2>Excluir conta</h2>

      {ehAdmin ? (
        <p>Contas de administrador não podem ser excluídas por aqui.</p>
      ) : (
        <>
          <p>
            Ao excluir sua conta, seus dados e todo o seu diário são apagados de forma permanente.
            Essa ação não pode ser desfeita.
          </p>
          <button type="button" className="btn-excluir-conta" onClick={abrir}>
            Excluir minha conta
          </button>
        </>
      )}

      <ModalExclusao
        aberto={aberto}
        titulo="Excluir sua conta?"
        mensagem="Esta ação apaga sua conta e todo o seu diário para sempre."
        rotuloConfirmar="Excluir minha conta"
        rotuloCarregando="Excluindo..."
        carregando={excluir.isPending}
        confirmarDesabilitado={!confirmado}
        onConfirmar={confirmar}
        onCancelar={() => setAberto(false)}
      >
        <div className="modal-confirmacao">
          <label htmlFor="confirmar-exclusao">
            Para confirmar, digite <strong>EXCLUIR</strong>:
          </label>
          <input
            id="confirmar-exclusao"
            className="modal-input"
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            autoComplete="off"
          />
          {erro && <div className="erro-api" role="alert">{erro}</div>}
        </div>
      </ModalExclusao>
    </>
  );
}