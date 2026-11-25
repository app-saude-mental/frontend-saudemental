import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Headphones, Lock, Square, Volume2 } from "lucide-react";
import { useSom } from "../contexts/useSom";
import {
  CATEGORIAS,
  categoriaDoSom,
  DURACOES_MINUTOS,
  infoDoSom,
  type CategoriaId,
  type SomId,
} from "../data/sonsNatureza";
import { MENSAGEM_SEM_SUPORTE } from "../hooks/usePaisagemSonora";
import "../styles/momento-paz.css";
import CabecalhoPagina from "../components/CabecalhoPagina";

type Respiracao = "inspire" | "expire";

const MS_POR_MINUTO = 60_000;
const MEIO_CICLO_RESPIRACAO_MS = 4000; // ciclo completo de 8 s (igual à animação no CSS)
const MENSAGEM_FIM = "Meditação concluída. Respire…";

function formatarTempo(ms: number) {
  const total = Math.ceil(ms / 1000);
  const minutos = Math.floor(total / 60);
  const segundos = total % 60;
  return `${String(minutos).padStart(2, "0")}:${String(segundos).padStart(2, "0")}`;
}

// O som em si vive no SomProvider (main.tsx): ao sair desta tela ele continua
// tocando e o MiniPlayer do topo do app assume os controles.
export default function MomentoPazPage() {
  const navigate = useNavigate();
  const som = useSom();
  const { estado, somId, duracaoMin, ciclo } = som;
  const tocando = estado === "tocando";

  const [categoria, setCategoria] = useState<CategoriaId>(() => categoriaDoSom(somId));
  const [respiracao, setRespiracao] = useState<Respiracao>("inspire");
  const [anuncio, setAnuncio] = useState("");

  // alterna "Inspire…" / "Expire…" a cada 4 s enquanto toca
  useEffect(() => {
    if (!tocando) return;
    const id = window.setInterval(
      () => setRespiracao((r) => (r === "inspire" ? "expire" : "inspire")),
      MEIO_CICLO_RESPIRACAO_MS,
    );
    return () => window.clearInterval(id);
  }, [tocando, ciclo]);

  const somAtual = infoDoSom(somId);
  const categoriaAtual = CATEGORIAS.find((c) => c.id === categoria) ?? CATEGORIAS[0];

  async function aoTocarEsfera() {
    const antes = estado;
    if (antes !== "tocando") setRespiracao("inspire");
    await som.alternar();
    setAnuncio(antes === "tocando" ? "Som pausado." : antes === "pausado" ? "Som retomado." : "Som iniciado.");
  }

  function escolherSom(id: SomId) {
    if (!som.somLiberado(id)) {
      navigate("/planos");
      return;
    }
    som.escolherSom(id);
    setAnuncio(`Som escolhido: ${infoDoSom(id).nome}.`);
  }

  function escolherDuracao(minutos: number | null) {
    som.escolherDuracao(minutos);
    setAnuncio(minutos === null ? "Duração: sem limite." : `Duração: ${minutos} minutos.`);
  }

  function pararTudo() {
    som.parar();
    setAnuncio("Som encerrado.");
  }

  const rotuloEsfera = tocando ? "Pausar" : estado === "pausado" ? "Continuar" : "Começar";

  const minutosRestantes = Math.ceil(som.restanteMs / MS_POR_MINUTO);
  const anuncioMinutos =
    tocando && duracaoMin !== null
      ? `${minutosRestantes} ${minutosRestantes === 1 ? "minuto restante" : "minutos restantes"}.`
      : "";

  return (
    // a "atmosfera" (cores do player) acompanha a categoria do som atual
    <section className="paz" data-atmosfera={categoriaDoSom(somId)}>
      <CabecalhoPagina
        sobretitulo="Meditar"
        titulo="Momento de paz"
        subtitulo="Escolha um som, coloque o fone e respire. Ele continua tocando enquanto você usa o app."
        ilustracao="pessoa"
      />

      {!som.suportado && (
        <p className="erro-api" role="alert">
          {MENSAGEM_SEM_SUPORTE}
        </p>
      )}
      {som.erro && som.suportado && (
        <p className="erro-api" role="alert">
          {som.erro}
        </p>
      )}

      <div className="paz-cartao paz-player">
        <button
          type="button"
          className="paz-esfera"
          onClick={aoTocarEsfera}
          disabled={!som.suportado || som.iniciando}
          aria-label={`${rotuloEsfera}: ${somAtual.nome}`}
        >
          <span key={ciclo} className={`paz-esfera-forma ${tocando ? "respirando" : ""}`} aria-hidden="true" />
          <span className="paz-esfera-conteudo" aria-hidden="true">
            {tocando ? (
              <>
                <span className="paz-esfera-texto">{respiracao === "inspire" ? "Inspire…" : "Expire…"}</span>
                <span className="paz-esfera-dica">toque para pausar</span>
              </>
            ) : (
              <span className="paz-esfera-texto">{rotuloEsfera}</span>
            )}
          </span>
        </button>

        <div className="paz-info">
          <p className="paz-som-nome">{somAtual.nome}</p>
          <p className="paz-tempo" role="timer">
            {duracaoMin === null ? "Sem limite de tempo" : `${formatarTempo(som.restanteMs)} restantes`}
          </p>
          {somAtual.fone && (
            <p className="paz-fone">
              <Headphones size={15} aria-hidden="true" /> Funciona só com fone de ouvido
            </p>
          )}
        </div>

        {(tocando || estado === "pausado") && (
          <button type="button" className="paz-parar" onClick={pararTudo}>
            <Square size={14} aria-hidden="true" /> Parar
          </button>
        )}

        {estado === "concluido" && <p className="paz-mensagem">{MENSAGEM_FIM}</p>}
      </div>

      {/* ---------- Categorias ---------- */}
      <div className="paz-cartao paz-sons">
        <div className="paz-categorias" role="tablist" aria-label="Tipos de som">
          {CATEGORIAS.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              id={`paz-aba-${c.id}`}
              aria-selected={c.id === categoria}
              aria-controls="paz-painel-sons"
              className="paz-categoria"
              onClick={() => setCategoria(c.id)}
            >
              {c.rotulo}
            </button>
          ))}
        </div>

        <div id="paz-painel-sons" role="tabpanel" aria-labelledby={`paz-aba-${categoria}`}>
          <p className="paz-categoria-descricao">{categoriaAtual.descricao}</p>
          <div className="paz-chips" role="group" aria-label={categoriaAtual.rotulo}>
            {categoriaAtual.sons.map((s) =>
              som.somLiberado(s.id) ? (
                <button
                  key={s.id}
                  type="button"
                  className="paz-chip"
                  aria-pressed={s.id === somId}
                  title={s.nome}
                  onClick={() => escolherSom(s.id)}
                >
                  {s.rotulo}
                  {s.fone && <Headphones size={13} aria-label="(com fone)" />}
                </button>
              ) : (
                // bloqueado no Gratuito: leva à tela de planos
                <button
                  key={s.id}
                  type="button"
                  className="paz-chip bloqueado"
                  aria-label={`${s.nome} (disponível no Premium)`}
                  title="Disponível no Premium"
                  onClick={() => escolherSom(s.id)}
                >
                  <Lock size={13} aria-hidden="true" />
                  {s.rotulo}
                </button>
              ),
            )}
          </div>
        </div>
      </div>

      <div className="paz-cartao paz-ajustes">
        <div>
          <p className="paz-rotulo" id="paz-duracao-rotulo">
            Duração
          </p>
          <div className="paz-chips" role="group" aria-labelledby="paz-duracao-rotulo">
            {DURACOES_MINUTOS.map((minutos) => (
              <button
                key={minutos ?? "livre"}
                type="button"
                className="paz-chip"
                aria-pressed={minutos === duracaoMin}
                disabled={tocando}
                onClick={() => escolherDuracao(minutos)}
              >
                {minutos === null ? "Sem limite" : `${minutos} min`}
              </button>
            ))}
          </div>
          {tocando && <p className="paz-ajuda">Pause para mudar a duração.</p>}
        </div>

        <div className="paz-volume">
          <label htmlFor="paz-volume" className="paz-volume-rotulo">
            <Volume2 size={18} aria-hidden="true" />
            Volume
          </label>
          <input
            id="paz-volume"
            type="range"
            min={0}
            max={100}
            step={5}
            value={som.volume}
            aria-valuetext={`${som.volume}%`}
            onChange={(e) => som.mudarVolume(Number(e.target.value))}
          />
          <span className="paz-volume-valor" aria-hidden="true">
            {som.volume}%
          </span>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {anuncio}
      </p>
      <p className="sr-only" aria-live="polite">
        {anuncioMinutos}
      </p>
    </section>
  );
}
