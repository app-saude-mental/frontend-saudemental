import { useState } from "react";
import type { CSSProperties } from "react";
import type { LucideIcon } from "lucide-react";
import { Apple, Brain, Check, Dumbbell, Flower2, MessagesSquare, Palette, Sparkles } from "lucide-react";
import type { Habito } from "../types/habito";
import HabitosEvolucao from "../components/HabitosEvolucao";
import { useHabitosDoDia, useMarcarHabito } from "../hooks/useHabitos";
import { getErrorMessage } from "../services/apiError";
import { hojeISO } from "../utils/data";
import "../styles/habitos.css";
import CabecalhoPagina from "../components/CabecalhoPagina";

type Aba = "hoje" | "evolucao";

// cada hábito com seu ícone e sua cor (tokens de auth.css)
const VISUAL: Record<Habito, { Icone: LucideIcon; cor: string }> = {
  HOBBY: { Icone: Palette, cor: "var(--coral)" },
  MEDITACAO: { Icone: Flower2, cor: "var(--indigo)" },
  TERAPIA: { Icone: Brain, cor: "var(--lavanda)" },
  CONVERSA: { Icone: MessagesSquare, cor: "var(--ceu)" },
  ESPORTE: { Icone: Dumbbell, cor: "var(--salvia)" },
  ALIMENTACAO: { Icone: Apple, cor: "var(--ambar)" },
  GRATIDAO: { Icone: Sparkles, cor: "var(--lavanda)" },
};

export default function HabitosPage() {
  const [aba, setAba] = useState<Aba>("hoje");

  return (
    <section className="habitos">
      <CabecalhoPagina
        sobretitulo="Seu cuidado diário"
        titulo="Hábitos"
        subtitulo="Pequenos cuidados que fazem diferença. Marque o que fez hoje e acompanhe sua evolução."
        ilustracao="broto"
      />

      <div className="habitos-abas" role="tablist" aria-label="Hábitos">
        <button
          type="button"
          role="tab"
          id="aba-hoje"
          aria-selected={aba === "hoje"}
          aria-controls="painel-habitos"
          className="habitos-aba"
          onClick={() => setAba("hoje")}
        >
          Hoje
        </button>
        <button
          type="button"
          role="tab"
          id="aba-evolucao"
          aria-selected={aba === "evolucao"}
          aria-controls="painel-habitos"
          className="habitos-aba"
          onClick={() => setAba("evolucao")}
        >
          Evolução
        </button>
      </div>

      <div id="painel-habitos" role="tabpanel" aria-labelledby={aba === "hoje" ? "aba-hoje" : "aba-evolucao"}>
        {aba === "hoje" ? <HabitosHoje /> : <HabitosEvolucao />}
      </div>
    </section>
  );
}

function HabitosHoje() {
  const hoje = hojeISO();
  const { data, isPending, isError, error, refetch } = useHabitosDoDia(hoje);
  const marcar = useMarcarHabito(hoje);

  const percentual = data && data.total > 0 ? (data.concluidos / data.total) * 100 : 0;

  return (
    <>
      {isPending && <p className="habitos-aviso">Carregando seus hábitos...</p>}

      {isError && (
        <div className="habitos-aviso" role="alert">
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="btn-secundario" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}

      {data && (
        <>
          <div className="habitos-grade">
          <ul className="habitos-lista">
            {data.habitos.map(({ habito, texto, concluido }) => {
              const { Icone, cor } = VISUAL[habito] ?? { Icone: Sparkles, cor: "var(--salvia)" };
              return (
                <li key={habito}>
                  <label className={`habito ${concluido ? "feito" : ""}`} style={{ "--cor-habito": cor } as CSSProperties}>
                    <input
                      type="checkbox"
                      checked={concluido}
                      onChange={(e) => marcar.mutate({ habito, concluido: e.target.checked })}
                    />
                    <span className="habito-icone" aria-hidden="true">
                      <Icone size={20} />
                    </span>
                    <span className="habito-texto">{texto}</span>
                    <span className="habito-caixa" aria-hidden="true">
                      <Check size={15} strokeWidth={3} />
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>

          <aside className="habitos-progresso">
            <span
              className="habitos-anel"
              style={{ "--pct": percentual / 100 } as CSSProperties}
              aria-hidden="true"
            >
              <span>
                <strong>{data.concluidos}</strong>
                <small>de {data.total}</small>
              </span>
            </span>
            <p>
              Você cuidou de si em{" "}
              <strong>
                {data.concluidos} de {data.total}
              </strong>{" "}
              hábitos hoje.
            </p>
            <div
              className="barra"
              role="progressbar"
              aria-label="Hábitos concluídos hoje"
              aria-valuemin={0}
              aria-valuemax={data.total}
              aria-valuenow={data.concluidos}
            >
              <span style={{ width: `${percentual}%` }} />
            </div>
            {data.concluidos === data.total && (
              <p className="habitos-parabens">Todos os cuidados de hoje feitos. Orgulhe-se!</p>
            )}
          </aside>
          </div>

          {marcar.isError && (
            <p className="erro-api" role="alert">{getErrorMessage(marcar.error)}</p>
          )}
        </>
      )}
    </>
  );
}