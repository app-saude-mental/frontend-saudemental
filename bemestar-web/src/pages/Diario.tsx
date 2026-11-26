import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Lock } from "lucide-react";
import DiarioCard from "../components/DiarioCard";
import DiarioForm from "../components/DiarioForm";
import ModalExclusao from "../components/ModalExclusao";
import { useDiarios, useExcluirDiario } from "../hooks/useDiarios";
import { getErrorMessage } from "../services/apiError";
import { HUMORES_VALORES, type Diario, type Humor } from "../types/diario";
import "../styles/diario.css";
import CabecalhoPagina from "../components/CabecalhoPagina";
import EstadoVazio from "../components/EstadoVazio";
import Paginacao from "../components/Paginacao";

function resumir(texto: string) {
  return texto.length > 90 ? `${texto.slice(0, 90).trimEnd()}…` : texto;
}

export default function DiarioPage() {
  const [pagina, setPagina] = useState(0);
  const [editando, setEditando] = useState<Diario | null>(null);
  const [alvoExclusao, setAlvoExclusao] = useState<Diario | null>(null);
  const { data, isPending, isError, error, isPlaceholderData, refetch } = useDiarios(pagina);
  const excluir = useExcluirDiario();

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
        titulo="Diário"
        subtitulo="Como você está se sentindo hoje?"
        ilustracao="caderno"
      >
        <p className="diario-privado">
          <Lock size={15} aria-hidden="true" />
          Só você pode ler o que escreve aqui. Nem o enfermeiro tem acesso.
        </p>
      </CabecalhoPagina>

      <div className="layout-dupla">
      <div className="coluna-principal">
      {/* a key recria o formulário ao trocar entre "nova entrada" e "editar" */}
      <DiarioForm
        key={editando?.id ?? `novo-${humorInicial ?? ""}`}
        editando={editando}
        humorInicial={humorInicial}
        onFinalizar={() => setEditando(null)}
      />
      </div>

      <section className="coluna-lateral" aria-labelledby="diario-entradas-titulo">
      <h2 id="diario-entradas-titulo" className="coluna-titulo">
        Suas entradas
        {data && data.totalElementos > 0 && <span className="coluna-contagem">{data.totalElementos}</span>}
      </h2>

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

          <Paginacao
            pagina={pagina}
            totalPaginas={data.totalPaginas}
            onMudar={mudarPagina}
            rotulo="Páginas do diário"
            totalItens={data.totalElementos}
            nomeItem={["entrada", "entradas"]}
          />
        </>
      )}

      </section>
      </div>

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