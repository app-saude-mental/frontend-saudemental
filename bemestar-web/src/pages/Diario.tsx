import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import DiarioCard from "../components/DiarioCard";
import DiarioForm from "../components/DiarioForm";
import ModalExclusao from "../components/ModalExclusao";
import { useAuth } from "../contexts/useAuth";
import { useDiarios, useExcluirDiario } from "../hooks/useDiarios";
import { getErrorMessage } from "../services/apiError";
import { HUMORES_VALORES, type Diario, type Humor } from "../types/diario";
import "../styles/diario.css";
import CabecalhoPagina from "../components/CabecalhoPagina";
import EstadoVazio from "../components/EstadoVazio";

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
  // /diario?humor=TRISTE (check-in da tela Início) já abre com o humor marcado
  const [params] = useSearchParams();
  const humorUrl = params.get("humor");
  const humorInicial = HUMORES_VALORES.includes(humorUrl as Humor) ? (humorUrl as Humor) : null;

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
      <CabecalhoPagina
        sobretitulo="Seu diário"
        titulo={`${saudacao()}, ${primeiroNome}`}
        subtitulo="Respire fundo. Como você está se sentindo hoje?"
        ilustracao="caderno"
      >
        <p className="diario-privado">
          <Lock size={15} aria-hidden="true" />
          Só você pode ler o que escreve aqui. Nem o enfermeiro tem acesso.
        </p>
      </CabecalhoPagina>

      {/* a key recria o formulário ao trocar entre "nova entrada" e "editar" */}
      <DiarioForm
        key={editando?.id ?? `novo-${humorInicial ?? ""}`}
        editando={editando}
        humorInicial={humorInicial}
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
        <EstadoVazio
          ilustracao="caderno"
          titulo="Seu diário está esperando"
          texto="Escreva sem pressa e sem julgamento. Colocar em palavras ajuda a entender o que você sente."
        />
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