import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginacaoProps {
  pagina: number;
  totalPaginas: number;
  onMudar: (pagina: number) => void;
  rotulo?: string;
}

export default function Paginacao({ pagina, totalPaginas, onMudar, rotulo = "Paginação" }: PaginacaoProps) {
  if (totalPaginas <= 1) return null;
  return (
    <nav className="adm-paginacao" aria-label={rotulo}>
      <button type="button" disabled={pagina === 0} onClick={() => onMudar(pagina - 1)}>
        <ChevronLeft size={16} aria-hidden="true" /> Anterior
      </button>
      <span>
        Página {pagina + 1} de {totalPaginas}
      </span>
      <button type="button" disabled={pagina + 1 >= totalPaginas} onClick={() => onMudar(pagina + 1)}>
        Próxima <ChevronRight size={16} aria-hidden="true" />
      </button>
    </nav>
  );
}
