import { useState } from "react";
import "../styles/duvidas.css";
import DuvidaForm from "../components/DuvidaForm";
import DuvidaCard from "../components/DuvidaCard";
import ConfirmarExclusaoDuvida from "../components/ConfirmarExclusaoDuvida";
import { useDuvidas } from "../hooks/useDuvidas";
import { getErrorMessage } from "../services/apiError";
import type { Duvida } from "../types/duvida";
import CabecalhoPagina from "../components/CabecalhoPagina";
import EstadoVazio from "../components/EstadoVazio";

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
      <CabecalhoPagina
        sobretitulo="Seu enfermeiro"
        titulo="Tirar dúvidas"
        subtitulo="Escreva sua dúvida para o enfermeiro. Ela fica guardada aqui, junto da resposta."
        ilustracao="conversa"
      />

      <div className="layout-dupla">
      <div className="coluna-principal">
      <DuvidaForm
        key={editando?.id ?? "nova"}
        editando={editando}
        onConcluir={() => setEditando(null)}
      />

      </div>

      <section className="coluna-lateral" aria-labelledby="duv-lista-titulo">
      <h2 id="duv-lista-titulo" className="duv-subtitulo coluna-titulo">
        Minhas dúvidas
        {data && data.totalElementos > 0 && <span className="coluna-contagem">{data.totalElementos}</span>}
      </h2>

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
        <EstadoVazio
          ilustracao="conversa"
          titulo="Nenhuma dúvida ainda"
          texto="Pergunte o que quiser sobre seu cuidado. Você pode anexar foto ou documento."
        />
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

      </section>
      </div>

      <ConfirmarExclusaoDuvida
        duvida={excluindo}
        onFechar={() => setExcluindo(null)}
        onExcluida={aoExcluir}
      />
    </section>
  );
}
