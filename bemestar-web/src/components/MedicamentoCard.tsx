import type { Medicamento } from "../types/medicamento";

interface Props {
  medicamento: Medicamento;
  onEditar: (medicamento: Medicamento) => void;
  onExcluir: (medicamento: Medicamento) => void;
}

export default function MedicamentoCard({ medicamento, onEditar, onExcluir }: Props) {
  return (
    <li className="med-item">
      <time className="med-hora" dateTime={medicamento.horas}>
        {medicamento.horas}
      </time>

      <div className="med-info">
        <strong>{medicamento.nome}</strong>
        <span>{medicamento.dosagem}</span>
      </div>

      <div className="med-acoes-item">
        <button
          type="button"
          className="med-acao"
          onClick={() => onEditar(medicamento)}
          aria-label={`Editar ${medicamento.nome}`}
        >
          Editar
        </button>
        <button
          type="button"
          className="med-acao perigo"
          onClick={() => onExcluir(medicamento)}
          aria-label={`Excluir ${medicamento.nome}`}
        >
          Excluir
        </button>
      </div>
    </li>
  );
}
