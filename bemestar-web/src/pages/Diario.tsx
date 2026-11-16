import { useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import DiarioCard from "../components/DiarioCard";
import DiarioForm from "../components/DiarioForm";
import ModalExclusao from "../components/ModalExclusao";
import { useAuth } from "../contexts/useAuth";
import { useDiarios, useExcluirDiario } from "../hooks/useDiarios";
import { getErrorMessage } from "../services/apiError";
import type { Diario } from "../types/diario";
import "../styles/diario.css";

function saudacao() {
  const hora = new Date().getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function resumir(texto: string) {
  return texto.length > 90 ? `${texto.slice(0, 90).trimEnd()}…` : texto;
}

export default function DiarioPage() {
  const { usuario } = useAuth();
  const [pagina, setPagina] = useState(0);
  const [editando, setEditando] = useState<Diario | null>(null);
  const [alvoExclusao, setAlvoExclusao] = useState<Diario | null>(null);
  const { data, isPending, isError, error, isPlaceholderData, refetch } = useDiarios(pagina);
  const excluir = useExcluirDiario();

  const primeiroNome = usuario?.nome.trim().split(" ")[0] ?? "";

  function irParaTopo() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function iniciarEdicao(diario: Diario) {
    setEditando(diario);
    irParaTopo();
  }

  function mudarPagina(nova: number) {
    setPagina(nova);
    irParaTopo();
  }

  function confirmarExclusao() {
    if (!alvoExclusao) return;
    const diario = alvoExclusao;

    excluir.mutate(diario.id, {
      onSuccess: () => {
        if (editando?.id === diario.id) setEditando(null);
        // apagou o último item de uma página que não é a primeira: volta uma página
        if (data?.conteudo.length === 1 && pagina > 0) setPagina(pagina - 1);
      },
      onSettled: () => setAlvoExclusao(null), // fecha o modal dando certo ou errado
    });
  }

  return (
    <section className="diario">
      <header className="diario-topo">
        <h1>
          {saudacao()}, {primeiroNome}
        </h1>
        <p className="diario-sub">Respire fundo. Como você está se sentindo hoje?</p>
        <p className="diario-privado">
          <Lock size={15} aria-hidden="true" />
          Só você pode ler o que escreve aqui.
        </p>
      </header>

      {/* a key recria o formulário ao trocar entre "nova entrada" e "editar" */}
      <DiarioForm
        key={editando?.id ?? "novo"}
        editando={editando}
        onFinalizar={() => setEditando(null)}
      />

      {excluir.isError && (
        <p className="erro-api" role="alert">{getErrorMessage(excluir.error)}</p>
      )}

      {isPending && <p className="diario-vazio">Carregando suas entradas...</p>}

      {isError && (
        <div className="diario-vazio" role="alert">
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="btn-secundario" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}

      {data && data.conteudo.length === 0 && (
        <p className="diario-vazio">Nada por aqui ainda. Que tal escrever a primeira entrada?</p>
      )}

      {data && data.conteudo.length > 0 && (
        <>
          <ul className={`diario-lista ${isPlaceholderData ? "carregando" : ""}`}>
            {data.conteudo.map((diario) => (
              <DiarioCard
                key={diario.id}
                diario={diario}
                onEditar={iniciarEdicao}
                onExcluir={setAlvoExclusao}
                desabilitado={excluir.isPending}
              />
            ))}
          </ul>

          {data.totalPaginas > 1 && (
            <nav className="paginacao" aria-label="Paginação">
              <button type="button" disabled={pagina === 0} onClick={() => mudarPagina(pagina - 1)}>
                <ChevronLeft size={16} aria-hidden="true" /> Anterior
              </button>
              <span>
                Página {pagina + 1} de {data.totalPaginas}
              </span>
              <button
                type="button"
                disabled={pagina + 1 >= data.totalPaginas}
                onClick={() => mudarPagina(pagina + 1)}
              >
                Próxima <ChevronRight size={16} aria-hidden="true" />
              </button>
            </nav>
          )}
        </>
      )}

      <ModalExclusao
        aberto={alvoExclusao !== null}
        titulo="Excluir esta entrada?"
        mensagem="Essa ação não pode ser desfeita."
        rotuloConfirmar="Excluir"
        rotuloCarregando="Excluindo..."
        carregando={excluir.isPending}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setAlvoExclusao(null)}
      >
        {alvoExclusao && <p className="modal-trecho">“{resumir(alvoExclusao.texto)}”</p>}
      </ModalExclusao>
    </section>
  );
}