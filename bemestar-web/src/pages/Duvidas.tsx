import { useState } from "react";
import "../styles/duvidas.css";
import DuvidaForm from "../components/DuvidaForm";
import DuvidaCard from "../components/DuvidaCard";
import ConfirmarExclusaoDuvida from "../components/ConfirmarExclusaoDuvida";
import { useDuvidas } from "../hooks/useDuvidas";
import { getErrorMessage } from "../services/apiError";
import type { Duvida } from "../types/duvida";

export default function DuvidasPage() {
  const [pagina, setPagina] = useState(0);
  const [editando, setEditando] = useState<Duvida | null>(null);
  const [excluindo, setExcluindo] = useState<Duvida | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useDuvidas(pagina);

  function iniciarEdicao(duvida: Duvida) {
    setEditando(duvida);
    window.scrollTo({ top: 0, behavior: "smooth" }); // leva até a caixa de texto
  }

  function aoExcluir() {
    // se a dúvida apagada estava em edição, sai da edição
    if (editando && excluindo && editando.id === excluindo.id) {
      setEditando(null);
    }
    // se era a única da última página, volta uma página
    if (data && data.conteudo.length === 1 && pagina > 0) {
      setPagina(pagina - 1);
    }
  }

  return (
    <section className="duv-pagina">
      <header className="duv-topo">
        <h1>Tirar dúvidas</h1>
        <p className="duv-sub">
          Escreva sua dúvida para o enfermeiro. Ela fica guardada aqui, junto da resposta.
        </p>
      </header>

      <DuvidaForm
        key={editando?.id ?? "nova"}
        editando={editando}
        onConcluir={() => setEditando(null)}
      />

      <h2 className="duv-subtitulo">Minhas dúvidas</h2>

      {isPending && (
        <p className="duv-estado" role="status">
          Carregando suas dúvidas...
        </p>
      )}

      {isError && (
        <div className="duv-estado duv-estado-erro" role="alert">
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="btn-secundario" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}

      {data && data.conteudo.length === 0 && (
        <div className="duv-estado">
          <p>Você ainda não enviou nenhuma dúvida.</p>
        </div>
      )}

      {data && data.conteudo.length > 0 && (
        <ul className="duv-lista" aria-busy={isFetching}>
          {data.conteudo.map((duvida) => (
            <DuvidaCard
              key={duvida.id}
              duvida={duvida}
              onEditar={iniciarEdicao}
              onExcluir={setExcluindo}
            />
          ))}
        </ul>
      )}

      {data && data.totalPaginas > 1 && (
        <nav className="duv-paginacao" aria-label="Páginas de dúvidas">
          <button
            type="button"
            className="btn-contorno"
            onClick={() => setPagina(pagina - 1)}
            disabled={pagina === 0}
          >
            Anterior
          </button>
          <span>
            Página {data.pagina + 1} de {data.totalPaginas}
          </span>
          <button
            type="button"
            className="btn-contorno"
            onClick={() => setPagina(pagina + 1)}
            disabled={pagina + 1 >= data.totalPaginas}
          >
            Próxima
          </button>
        </nav>
      )}

      <ConfirmarExclusaoDuvida
        duvida={excluindo}
        onFechar={() => setExcluindo(null)}
        onExcluida={aoExcluir}
      />
    </section>
  );
}
