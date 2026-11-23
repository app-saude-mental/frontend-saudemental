import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Headphones, Pause, Play, RotateCcw } from "lucide-react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import AjudaAgora from "../components/AjudaAgora";
import "../styles/respirar.css";

type TipoFase = "inspire" | "segure" | "expire" | "pausa";

interface Fase {
  tipo: TipoFase;
  segundos: number;
}

interface Tecnica {
  id: string;
  nome: string;
  resumo: string;
  indicacao: string;
  fases: Fase[];
}

// Técnicas simples e conhecidas; nenhuma prende o ar por muito tempo.
const TECNICAS: Tecnica[] = [
  {
    id: "coerente",
    nome: "Coerente",
    resumo: "Inspire 5 · Expire 5",
    indicacao: "Equilibra e acalma. Boa para qualquer momento do dia.",
    fases: [
      { tipo: "inspire", segundos: 5 },
      { tipo: "expire", segundos: 5 },
    ],
  },
  {
    id: "478",
    nome: "4-7-8",
    resumo: "Inspire 4 · Segure 7 · Expire 8",
    indicacao: "Ajuda a desacelerar a ansiedade e a pegar no sono.",
    fases: [
      { tipo: "inspire", segundos: 4 },
      { tipo: "segure", segundos: 7 },
      { tipo: "expire", segundos: 8 },
    ],
  },
  {
    id: "quadrada",
    nome: "Quadrada",
    resumo: "4 · 4 · 4 · 4",
    indicacao: "Traz foco e controle em momentos de tensão.",
    fases: [
      { tipo: "inspire", segundos: 4 },
      { tipo: "segure", segundos: 4 },
      { tipo: "expire", segundos: 4 },
      { tipo: "pausa", segundos: 4 },
    ],
  },
];

const DURACOES = [1, 3, 5]; // minutos

const TEXTO_FASE: Record<TipoFase, string> = {
  inspire: "Inspire",
  segure: "Segure",
  expire: "Expire",
  pausa: "Pausa",
};

// tamanho do círculo ao FIM de cada fase (a transição dura a fase inteira)
const ESCALA_FASE: Record<TipoFase, number> = { inspire: 1, segure: 1, expire: 0.55, pausa: 0.55 };

type Estado = "parado" | "rodando" | "pausado" | "fim";

export default function RespirarPage() {
  const [tecnicaId, setTecnicaId] = useState(TECNICAS[0].id);
  const [minutos, setMinutos] = useState(1);
  const [estado, setEstado] = useState<Estado>("parado");
  const [faseIndice, setFaseIndice] = useState(0);
  const [restanteFase, setRestanteFase] = useState(0);
  const [restanteTotal, setRestanteTotal] = useState(60);
  const [ciclos, setCiclos] = useState(0);
  // fim previsto da fase e da sessão (relógio real: tolera abas em segundo plano)
  const relogio = useRef({ fase: 0, fimFase: 0, fimTotal: 0, restanteFaseMs: 0, restanteTotalMs: 0 });

  const tecnica = TECNICAS.find((t) => t.id === tecnicaId) ?? TECNICAS[0];
  const fase = tecnica.fases[faseIndice];
  const rodando = estado === "rodando";

  useEffect(() => {
    if (!rodando) return;
    const r = relogio.current;
    const id = window.setInterval(() => {
      const agora = performance.now();
      const total = r.fimTotal - agora;
      if (total <= 0) {
        setEstado("fim");
        setRestanteTotal(0);
        return;
      }
      setRestanteTotal(Math.ceil(total / 1000));
      const resta = r.fimFase - agora;
      if (resta <= 0) {
        // próxima fase (o índice vive no ref; o estado só reflete na tela)
        const prox = (r.fase + 1) % tecnica.fases.length;
        r.fase = prox;
        r.fimFase = agora + tecnica.fases[prox].segundos * 1000;
        if (prox === 0) setCiclos((c) => c + 1);
        setFaseIndice(prox);
        setRestanteFase(tecnica.fases[prox].segundos);
      } else {
        setRestanteFase(Math.ceil(resta / 1000));
      }
    }, 200);
    return () => window.clearInterval(id);
  }, [rodando, tecnica]);

  function comecar() {
    const agora = performance.now();
    const r = relogio.current;
    if (estado === "pausado") {
      r.fimFase = agora + r.restanteFaseMs;
      r.fimTotal = agora + r.restanteTotalMs;
    } else {
      r.fase = 0;
      r.fimFase = agora + tecnica.fases[0].segundos * 1000;
      r.fimTotal = agora + minutos * 60_000;
      setFaseIndice(0);
      setRestanteFase(tecnica.fases[0].segundos);
      setRestanteTotal(minutos * 60);
      setCiclos(0);
    }
    setEstado("rodando");
  }

  function pausar() {
    const agora = performance.now();
    const r = relogio.current;
    r.restanteFaseMs = Math.max(0, r.fimFase - agora);
    r.restanteTotalMs = Math.max(0, r.fimTotal - agora);
    setEstado("pausado");
  }

  function reiniciar() {
    setEstado("parado");
    setFaseIndice(0);
    setRestanteTotal(minutos * 60);
  }

  function escolherTecnica(id: string) {
    if (rodando) return;
    setTecnicaId(id);
    setEstado("parado");
    setFaseIndice(0);
  }

  function escolherMinutos(m: number) {
    if (rodando) return;
    setMinutos(m);
    setEstado("parado");
    setRestanteTotal(m * 60);
  }

  const ativo = estado === "rodando" || estado === "pausado";
  const escala = ativo ? ESCALA_FASE[fase.tipo] : 0.7;
  const estiloCirculo = {
    "--escala": escala,
    "--duracao": rodando ? `${fase.segundos}s` : "0.8s",
  } as CSSProperties;

  const mm = String(Math.floor(restanteTotal / 60)).padStart(2, "0");
  const ss = String(restanteTotal % 60).padStart(2, "0");

  return (
    <section className="respirar">
      <CabecalhoPagina
        sobretitulo="Respiração guiada"
        titulo="Respire comigo"
        subtitulo="Siga o círculo: ele cresce quando você inspira e diminui quando você solta o ar."
        ilustracao="ondas"
      />

      <div className={`respirar-palco ${estado}`}>
        <div className="respirar-circulo-area">
          <span className="respirar-anel" aria-hidden="true" />
          <span className="respirar-circulo" style={estiloCirculo} aria-hidden="true" />
          <div className="respirar-texto" aria-live="polite">
            {estado === "fim" ? (
              <>
                <strong>Muito bem</strong>
                <span>Perceba como você está agora.</span>
              </>
            ) : ativo ? (
              <>
                <strong>{TEXTO_FASE[fase.tipo]}</strong>
                <span className="respirar-contagem">{restanteFase}</span>
              </>
            ) : (
              <>
                <strong>Pronto?</strong>
                <span>{tecnica.resumo}</span>
              </>
            )}
          </div>
        </div>

        <p className="respirar-tempo" role="timer">
          {estado === "fim"
            ? `${ciclos} ${ciclos === 1 ? "ciclo completo" : "ciclos completos"}`
            : `${mm}:${ss}${ativo ? ` · ${ciclos} ${ciclos === 1 ? "ciclo" : "ciclos"}` : ""}`}
        </p>

        <div className="respirar-controles">
          {rodando ? (
            <button type="button" className="btn-principal respirar-botao" onClick={pausar}>
              <Pause size={18} aria-hidden="true" /> Pausar
            </button>
          ) : (
            <button type="button" className="btn-principal respirar-botao" onClick={estado === "fim" ? reiniciar : comecar}>
              {estado === "fim" ? (
                <>
                  <RotateCcw size={18} aria-hidden="true" /> De novo
                </>
              ) : (
                <>
                  <Play size={18} aria-hidden="true" /> {estado === "pausado" ? "Continuar" : "Começar"}
                </>
              )}
            </button>
          )}
          {estado === "pausado" && (
            <button type="button" className="btn-contorno respirar-botao" onClick={reiniciar}>
              Recomeçar
            </button>
          )}
        </div>
      </div>

      <div className="respirar-opcoes">
        <fieldset className="respirar-grupo" disabled={rodando}>
          <legend>Técnica</legend>
          <div className="respirar-tecnicas">
            {TECNICAS.map((t) => (
              <label key={t.id} className={`respirar-tecnica ${t.id === tecnicaId ? "ativa" : ""}`}>
                <input
                  type="radio"
                  name="tecnica"
                  value={t.id}
                  checked={t.id === tecnicaId}
                  onChange={() => escolherTecnica(t.id)}
                />
                <strong>{t.nome}</strong>
                <span className="respirar-tecnica-ritmo">{t.resumo}</span>
                <span className="respirar-tecnica-uso">{t.indicacao}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="respirar-grupo" disabled={rodando}>
          <legend>Duração</legend>
          <div className="paz-chips respirar-duracoes">
            {DURACOES.map((m) => (
              <button
                key={m}
                type="button"
                className="paz-chip"
                aria-pressed={m === minutos}
                onClick={() => escolherMinutos(m)}
              >
                {m} min
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="respirar-rodape">
        <Link to="/meditacao" className="respirar-link">
          <Headphones size={18} aria-hidden="true" /> Quer um som de fundo? Abra o Momento de paz
        </Link>
        <AjudaAgora variante="link" />
      </div>
    </section>
  );
}
