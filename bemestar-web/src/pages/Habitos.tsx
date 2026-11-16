import { Check } from "lucide-react";
import { useHabitosDoDia, useMarcarHabito } from "../hooks/useHabitos";
import { getErrorMessage } from "../services/apiError";
import { hojeISO } from "../utils/data";
import "../styles/habitos.css";

export default function HabitosPage() {
  const hoje = hojeISO();
  const { data, isPending, isError, error, refetch } = useHabitosDoDia(hoje);
  const marcar = useMarcarHabito(hoje);

  const percentual = data && data.total > 0 ? (data.concluidos / data.total) * 100 : 0;

  return (
    <section className="habitos">
      <header className="habitos-topo">
        <h1>Hábitos de hoje</h1>
        <p>Pequenos cuidados que fazem diferença.</p>
      </header>

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
          <ul className="habitos-lista">
            {data.habitos.map(({ habito, texto, concluido }) => (
              <li key={habito}>
                <label className={`habito ${concluido ? "feito" : ""}`}>
                  <input
                    type="checkbox"
                    checked={concluido}
                    onChange={(e) => marcar.mutate({ habito, concluido: e.target.checked })}
                  />
                  <span className="habito-caixa" aria-hidden="true">
                    <Check size={16} strokeWidth={3} />
                  </span>
                  <span className="habito-texto">{texto}</span>
                </label>
              </li>
            ))}
          </ul>

          {marcar.isError && (
            <p className="erro-api" role="alert">{getErrorMessage(marcar.error)}</p>
          )}

          <div className="habitos-progresso">
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
          </div>
        </>
      )}
    </section>
  );
}