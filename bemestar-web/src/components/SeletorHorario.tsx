// Horário em dois <select> (Hora e Minuto) no lugar do <input type="time">.
// O relógio nativo de alguns celulares não cabia na tela; os selects funcionam igual em todos.
// Valor sempre "HH:mm" (o que o back espera); "" enquanto nada foi escolhido.
interface Props {
  id: string;
  value: string;
  onChange: (valor: string) => void;
  invalido?: boolean;
}

const HORAS = Array.from({ length: 24 }, (_, h) => String(h).padStart(2, "0"));
const MINUTOS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));

export default function SeletorHorario({ id, value, onChange, invalido }: Props) {
  const [hora = "", minuto = ""] = value ? value.split(":") : [];
  // horário antigo com minuto "quebrado" (ex.: 08:07) continua aparecendo na lista
  const minutos = minuto && !MINUTOS.includes(minuto) ? [...MINUTOS, minuto].sort() : MINUTOS;

  function mudar(h: string, m: string) {
    // escolher só a hora já sugere ":00"; o formulário só fica válido com os dois
    onChange(h ? `${h}:${m || "00"}` : "");
  }

  return (
    <div className="seletor-horario" role="group" aria-labelledby={`${id}-rotulo`}>
      <select
        id={id}
        aria-label="Hora"
        value={hora}
        aria-invalid={invalido || undefined}
        onChange={(e) => mudar(e.target.value, minuto)}
      >
        <option value="" disabled>
          Hora
        </option>
        {HORAS.map((h) => (
          <option key={h} value={h}>
            {h}
          </option>
        ))}
      </select>
      <span aria-hidden="true">:</span>
      <select
        aria-label="Minuto"
        value={minuto}
        disabled={!hora}
        aria-invalid={invalido || undefined}
        onChange={(e) => mudar(hora, e.target.value)}
      >
        <option value="" disabled>
          Min
        </option>
        {minutos.map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>
    </div>
  );
}
