import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Volume2 } from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import {
  DURACAO_PADRAO_MINUTOS,
  DURACOES_MINUTOS,
  SOM_INICIAL,
  SONS_GRATUITOS,
  SONS_NATUREZA,
  VOLUME_PADRAO,
  type SomId,
} from "../data/sonsNatureza";
import { MENSAGEM_SEM_SUPORTE, usePaisagemSonora } from "../hooks/usePaisagemSonora";
import { useTemporizador } from "../hooks/useTemporizador";
import "../styles/momento-paz.css";

type Estado = "parado" | "tocando" | "pausado" | "concluido";
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

export default function MomentoPazPage() {
  const navigate = useNavigate();
  const { pode } = useAuth();
  // Gratuito: só Chuva e Mar. Limite de interface (os sons são gerados no navegador).
  const todosLiberados = pode("SONS_COMPLETOS");
  const somLiberado = (id: SomId) => todosLiberados || SONS_GRATUITOS.includes(id);

  const [somEscolhido, setSomId] = useState<SomId>(SOM_INICIAL);
  // se o plano mudou e o som escolhido ficou bloqueado, volta ao som inicial
  const somId = somLiberado(somEscolhido) ? somEscolhido : SOM_INICIAL;
  const [duracaoMin, setDuracaoMin] = useState(DURACAO_PADRAO_MINUTOS);
  const [volume, setVolume] = useState(VOLUME_PADRAO);
  const [estado, setEstado] = useState<Estado>("parado");
  const [respiracao, setRespiracao] = useState<Respiracao>("inspire");
  const [ciclo, setCiclo] = useState(0); // muda a cada início/retomada: reinicia a animação em fase
  const [iniciando, setIniciando] = useState(false);
  const [anuncio, setAnuncio] = useState("");

  const audio = usePaisagemSonora(VOLUME_PADRAO);
  const { encerrar } = audio;

  const aoTerminar = useCallback(() => {
    encerrar();
    setEstado("concluido");
    setAnuncio(MENSAGEM_FIM);
  }, [encerrar]);

  const timer = useTemporizador(DURACAO_PADRAO_MINUTOS * MS_POR_MINUTO, aoTerminar);

  const tocando = estado === "tocando";
  const somAtual = SONS_NATUREZA.find((s) => s.id === somId) ?? SONS_NATUREZA[0];

  // alterna "Inspire…" / "Expire…" a cada 4 s enquanto toca
  useEffect(() => {
    if (!tocando) return;
    const id = window.setInterval(
      () => setRespiracao((r) => (r === "inspire" ? "expire" : "inspire")),
      MEIO_CICLO_RESPIRACAO_MS,
    );
    return () => window.clearInterval(id);
  }, [tocando, ciclo]);

  async function aoTocarEsfera() {
    if (iniciando) return;

    if (tocando) {
      audio.pausar();
      timer.pausar();
      setEstado("pausado");
      setAnuncio("Meditação pausada.");
      return;
    }

    const retomando = estado === "pausado";
    if (!retomando) timer.redefinir(duracaoMin * MS_POR_MINUTO);

    setIniciando(true);
    const ok = await audio.tocar(somId);
    setIniciando(false);
    if (!ok) return;

    timer.iniciar();
    setRespiracao("inspire");
    setCiclo((c) => c + 1);
    setEstado("tocando");
    setAnuncio(retomando ? "Meditação retomada." : "Meditação iniciada.");
  }

  function escolherSom(id: SomId) {
    if (!somLiberado(id)) {
      navigate("/planos");
      return;
    }
    if (id === somId) return;
    setSomId(id);
    if (tocando) audio.trocar(id);
    const nome = SONS_NATUREZA.find((s) => s.id === id)?.nome ?? "";
    setAnuncio(`Som escolhido: ${nome}.`);
  }

  function escolherDuracao(minutos: number) {
    if (tocando) return;
    setDuracaoMin(minutos);
    timer.redefinir(minutos * MS_POR_MINUTO);
    setEstado("parado");
    setAnuncio(`Duração: ${minutos} minutos.`);
  }

  function mudarVolume(valor: number) {
    setVolume(valor);
    audio.definirVolume(valor);
  }

  const rotuloEsfera = tocando
    ? "Pausar meditação"
    : estado === "pausado"
      ? "Continuar meditação"
      : "Começar meditação";

  const minutosRestantes = Math.ceil(timer.restanteMs / MS_POR_MINUTO);
  const anuncioMinutos = tocando
    ? `${minutosRestantes} ${minutosRestantes === 1 ? "minuto restante" : "minutos restantes"}.`
    : "";

  return (
    <section className="paz">
      <header className="paz-topo">
        <h1>Momento de paz</h1>
        <p className="paz-sub">Coloque o fone de ouvido e feche os olhos.</p>
      </header>

      {!audio.suportado && (
        <p className="erro-api" role="alert">
          {MENSAGEM_SEM_SUPORTE}
        </p>
      )}
      {audio.erro && audio.suportado && (
        <p className="erro-api" role="alert">
          {audio.erro}
        </p>
      )}

      <div className="paz-cartao paz-player">
        <button
          type="button"
          className="paz-esfera"
          onClick={aoTocarEsfera}
          disabled={!audio.suportado}
          aria-label={rotuloEsfera}
        >
          <span
            key={ciclo}
            className={`paz-esfera-forma ${tocando ? "respirando" : ""}`}
            aria-hidden="true"
          />
          <span className="paz-esfera-conteudo" aria-hidden="true">
            {tocando ? (
              <>
                <span className="paz-esfera-texto">
                  {respiracao === "inspire" ? "Inspire…" : "Expire…"}
                </span>
                <span className="paz-esfera-dica">toque para pausar</span>
              </>
            ) : (
              <span className="paz-esfera-texto">
                {estado === "pausado" ? "Continuar" : "Começar"}
              </span>
            )}
          </span>
        </button>

        <div className="paz-info">
          <p className="paz-som-nome">{somAtual.nome}</p>
          <p className="paz-tempo" role="timer">
            {formatarTempo(timer.restanteMs)} de meditação
          </p>
        </div>

        {estado === "concluido" && <p className="paz-mensagem">{MENSAGEM_FIM}</p>}

        <div className="paz-chips" role="group" aria-label="Natureza anti-estresse">
          {SONS_NATUREZA.map((som) =>
            somLiberado(som.id) ? (
              <button
                key={som.id}
                type="button"
                className="paz-chip"
                aria-pressed={som.id === somId}
                title={som.nome}
                onClick={() => escolherSom(som.id)}
              >
                {som.rotulo}
              </button>
            ) : (
              // bloqueado no Gratuito: leva à tela de planos
              <button
                key={som.id}
                type="button"
                className="paz-chip bloqueado"
                aria-label={`${som.nome} (disponível no Premium)`}
                title="Disponível no Premium"
                onClick={() => escolherSom(som.id)}
              >
                <Lock size={13} aria-hidden="true" />
                {som.rotulo}
              </button>
            ),
          )}
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
                key={minutos}
                type="button"
                className="paz-chip"
                aria-pressed={minutos === duracaoMin}
                disabled={tocando}
                onClick={() => escolherDuracao(minutos)}
              >
                {minutos} min
              </button>
            ))}
          </div>
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
            value={volume}
            aria-valuetext={`${volume}%`}
            onChange={(e) => mudarVolume(Number(e.target.value))}
          />
          <span className="paz-volume-valor" aria-hidden="true">
            {volume}%
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
