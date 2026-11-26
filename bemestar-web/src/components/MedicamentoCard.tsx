import { Pencil, Pill, Trash2 } from "lucide-react";
import type { Medicamento } from "../types/medicamento";

interface Props {
  medicamento: Medicamento;
  proximo?: boolean; // o próximo horário do dia ganha destaque
  onEditar: (medicamento: Medicamento) => void;
  onExcluir: (medicamento: Medicamento) => void;
}

export default function MedicamentoCard({ medicamento, proximo = false, onEditar, onExcluir }: Props) {
  return (
    <li className={`med-item ${proximo ? "proximo" : ""}`}>
      <div className="med-item-topo">
        <time className="med-hora" dateTime={medicamento.horas}>
          {medicamento.horas}
        </time>
        {proximo && <span className="med-selo-proximo">Próximo</span>}
      </div>

      <div className="med-info">
        <span className="med-icone" aria-hidden="true">
          <Pill size={16} />
        </span>
        <div>
          <strong>{medicamento.nome}</strong>
          <span>{medicamento.dosagem}</span>
        </div>
      </div>

      <div className="med-acoes-item">
        <button
          type="button"
          className="med-acao"
          onClick={() => onEditar(medicamento)}
          aria-label={`Editar ${medicamento.nome}`}
          title="Editar"
        >
          <Pencil size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="med-acao perigo"
          onClick={() => onExcluir(medicamento)}
          aria-label={`Excluir ${medicamento.nome}`}
          title="Excluir"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
    </li>
  );
}
