import { useState, type CSSProperties } from "react";
import { Check, ChevronLeft, ChevronRight, Minus } from "lucide-react";
import { useHistoricoHabitos } from "../hooks/useHabitos";
import { getErrorMessage } from "../services/apiError";
import type { HabitosDia } from "../types/habito";
import { dataISO, hojeISO } from "../utils/data";

// Aba "Evolução" dos hábitos: o paciente vê os próprios registros por dia,
// a sequência de cuidado e quanto cada hábito apareceu no período.

const PERIODOS = [
  { dias: 7, rotulo: "7 dias" },
  { dias: 30, rotulo: "30 dias" },
] as const;

const SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

// "2026-11-23" → Date local (sem conversão de fuso)
function paraData(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d);
}

function somarDias(iso: string, dias: number) {
  const data = paraData(iso);
  data.setDate(data.getDate() + dias);
  return dataISO(data);
}

function rotuloCurto(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

// dias seguidos (do fim do período para trás) com pelo menos um hábito cumprido
function sequencia(dias: HabitosDia[]) {
  let total = 0;
  for (let i = dias.length - 1; i >= 0; i--) {
    if (dias[i].concluidos === 0) {
      // hoje ainda sem registro não quebra a sequência de ontem
      if (i === dias.length - 1 && dias[i].data === hojeISO()) continue;
      break;
    }
    total++;
  }
  return total;
}

export default function HabitosEvolucao() {
  const hoje = hojeISO();
  const [dias, setDias] = useState<number>(7);
  const [ate, setAte] = useState(hoje);
  const [diaAberto, setDiaAberto] = useState<string | null>(null);
  const { data, isPending, isError, error, refetch, isFetching } = useHistoricoHabitos(ate, dias);

  const noPresente = ate >= hoje;
  const inicio = somarDias(ate, -(dias - 1));

  function mudarPeriodo(novo: number) {
    setDias(novo);
    setAte(hoje);
    setDiaAberto(null);
  }

  function andar(sentido: -1 | 1) {
    const novo = somarDias(ate, sentido * dias);
    setAte(novo > hoje ? hoje : novo);
    setDiaAberto(null);
  }

  const totalPossivel = data?.reduce((s, d) => s + d.total, 0) ?? 0;
  const totalFeito = data?.reduce((s, d) => s + d.concluidos, 0) ?? 0;
  const media = totalPossivel > 0 ? Math.round((totalFeito / totalPossivel) * 100) : 0;
  const diasCompletos = data?.filter((d) => d.total > 0 && d.concluidos === d.total).length ?? 0;

  // quantos dias do período cada hábito foi cumprido
  const porHabito =
    data && data.length > 0
      ? data[0].habitos.map(({ habito, texto }) => ({
          habito,
          texto,
          feitos: data.filter((d) => d.habitos.some((h) => h.habito === habito && h.concluido)).length,
        }))
      : [];

  const dia = data?.find((d) => d.data === diaAberto) ?? null;

  return (
    <div className="evolucao" aria-busy={isFetching}>
      <div className="evolucao-controles">
        <div className="evolucao-periodos" role="group" aria-label="Período">
          {PERIODOS.map((p) => (
            <button
              key={p.dias}
              type="button"
              className="evolucao-periodo"
              aria-pressed={dias === p.dias}
              onClick={() => mudarPeriodo(p.dias)}
            >
              {p.rotulo}
            </button>
          ))}
        </div>

        <div className="evolucao-navegar">
          <button type="button" className="app-icone-botao" onClick={() => andar(-1)} aria-label="Período anterior">
            <ChevronLeft size={20} aria-hidden="true" />
          </button>
          <span className="evolucao-intervalo">
            {rotuloCurto(inicio)} – {rotuloCurto(ate)}
          </span>
          <button
            type="button"
            className="app-icone-botao"
            onClick={() => andar(1)}
            disabled={noPresente}
            aria-label="Próximo período"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>
        </div>
      </div>

      {isPending && <p className="habitos-aviso">Carregando sua evolução...</p>}

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
          <dl className="evolucao-resumo">
            <div>
              <dt>Cuidado no período</dt>
              <dd>{media}%</dd>
            </div>
            <div>
              <dt>Dias completos</dt>
              <dd>
                {diasCompletos}
                <small> de {data.length}</small>
              </dd>
            </div>
            <div>
              <dt>Sequência</dt>
              <dd>
                {sequencia(data)}
                <small> {sequencia(data) === 1 ? "dia" : "dias"}</small>
              </dd>
            </div>
          </dl>

          <section className="evolucao-cartao" aria-labelledby="evolucao-dias">
            <h2 id="evolucao-dias">Dia a dia</h2>
            <p className="evolucao-dica">Toque em um dia para ver o que você fez.</p>
            <ul className={`evolucao-grade ${dias > 7 ? "mes" : ""}`}>
              {data.map((d) => {
                const pct = d.total > 0 ? Math.round((d.concluidos / d.total) * 100) : 0;
                const semana = SEMANA[paraData(d.data).getDay()];
                return (
                  <li key={d.data}>
                    <button
                      type="button"
                      className={`evolucao-dia ${d.data === hoje ? "hoje" : ""} ${pct >= 60 ? "forte" : ""}`}
                      style={{ "--pct": `${pct}%` } as CSSProperties}
                      aria-pressed={diaAberto === d.data}
                      aria-label={`${semana}, ${rotuloCurto(d.data)}: ${d.concluidos} de ${d.total} hábitos`}
                      onClick={() => setDiaAberto(diaAberto === d.data ? null : d.data)}
                    >
                      <span className="evolucao-dia-semana">{semana}</span>
                      <span className="evolucao-dia-numero">{d.data.slice(8)}</span>
                      <span className="evolucao-dia-qtd">{d.concluidos}</span>
                    </button>
                  </li>
                );
              })}
            </ul>

            {dia && (
              <div className="evolucao-detalhe" aria-live="polite">
                <h3>
                  {dia.data === hoje ? "Hoje" : rotuloCurto(dia.data)} · {dia.concluidos} de {dia.total}
                </h3>
                <ul>
                  {dia.habitos.map((h) => (
                    <li key={h.habito} className={h.concluido ? "feito" : ""}>
                      {h.concluido ? <Check size={16} aria-hidden="true" /> : <Minus size={16} aria-hidden="true" />}
                      <span>{h.texto}</span>
                      <span className="sr-only">{h.concluido ? "(feito)" : "(não feito)"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section className="evolucao-cartao" aria-labelledby="evolucao-habitos">
            <h2 id="evolucao-habitos">Cada hábito</h2>
            <ul className="evolucao-habitos">
              {porHabito.map((h) => (
                <li key={h.habito}>
                  <div className="evolucao-habito-topo">
                    <span>{h.texto}</span>
                    <strong>
                      {h.feitos}/{data.length}
                    </strong>
                  </div>
                  <div
                    className="barra"
                    role="progressbar"
                    aria-label={h.texto}
                    aria-valuemin={0}
                    aria-valuemax={data.length}
                    aria-valuenow={h.feitos}
                  >
                    <span style={{ width: `${(h.feitos / data.length) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
