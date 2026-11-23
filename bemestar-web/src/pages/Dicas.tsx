import { ExternalLink, HeartHandshake, Headphones, Lightbulb } from "lucide-react";
import BloqueioPremium from "../components/BloqueioPremium";
import { useAuth } from "../contexts/useAuth";
import { DICAS_GERAIS } from "../data/dicasGerais";
import { PODCAST } from "../data/podcast";
import { useDicas } from "../hooks/useDicas";
import { getErrorMessage } from "../services/apiError";
import "../styles/dicas.css";

export default function DicasPage() {
  const { pode } = useAuth();
  const temOrientacoes = pode("ORIENTACOES");
  const { data, isPending, isError, error, refetch, isFetching } = useDicas(temOrientacoes);

  return (
    <section className="dicas">
      <header className="dicas-topo">
        <h1>Dicas para o seu bem-estar</h1>
        <p className="dicas-sub">
          <Lightbulb size={18} aria-hidden="true" />
          Pequenos cuidados para o seu dia.
        </p>
      </header>

      {/* ---------- Podcast (todos os planos) ---------- */}
      <section className="dicas-podcast" aria-labelledby="dicas-podcast-titulo">
        <span className="dicas-podcast-icone" aria-hidden="true">
          <Headphones size={26} />
        </span>
        <div className="dicas-podcast-texto">
          <h2 id="dicas-podcast-titulo">{PODCAST.titulo}</h2>
          <p>{PODCAST.descricao}</p>
        </div>
        <a className="btn-principal dicas-podcast-botao" href={PODCAST.url} target="_blank" rel="noopener noreferrer">
          Ouvir
          <ExternalLink size={16} aria-hidden="true" />
          <span className="sr-only"> (abre em outra aba)</span>
        </a>
      </section>

      {/* ---------- Todos os planos ---------- */}
      <section className="dicas-secao" aria-labelledby="dicas-gerais">
        <h2 id="dicas-gerais" className="dicas-secao-titulo">
          Dicas de saúde mental
        </h2>
        <ul className="dicas-lista">
          {DICAS_GERAIS.map((dica) => (
            <li key={dica.titulo} className="dicas-cartao">
              <h3>{dica.titulo}</h3>
              <p>{dica.texto}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- Só Premium Paciente ---------- */}
      <section className="dicas-secao" aria-labelledby="dicas-enfermeiro">
        <h2 id="dicas-enfermeiro" className="dicas-secao-titulo">
          <HeartHandshake size={20} aria-hidden="true" />
          Orientações do seu enfermeiro
        </h2>

        {!temOrientacoes && <BloqueioPremium recurso="ORIENTACOES" compacto />}

        {temOrientacoes && (
          <>
            <p className="dicas-secao-sub">Escolhidas pelo seu enfermeiro para você.</p>

            {isPending && (
              <p className="dicas-estado" role="status">
                Carregando suas orientações...
              </p>
            )}

            {isError && (
              <div className="dicas-estado" role="alert">
                <p>{getErrorMessage(error)}</p>
                <button type="button" className="btn-secundario" onClick={() => refetch()}>
                  Tentar de novo
                </button>
              </div>
            )}

            {data && data.length === 0 && (
              <p className="dicas-estado">Seu enfermeiro ainda não enviou orientações para você.</p>
            )}

            {data && data.length > 0 && (
              <ul className="dicas-lista" aria-busy={isFetching}>
                {data.map((dica) => (
                  <li key={dica.id} className="dicas-cartao enfermeiro">
                    <h3>{dica.titulo}</h3>
                    <p>{dica.texto}</p>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </section>
  );
}
