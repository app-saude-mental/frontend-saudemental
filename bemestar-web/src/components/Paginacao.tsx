import { useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface PaginacaoProps {
  pagina: number; // começa em 0 (igual ao back)
  totalPaginas: number;
  onMudar: (pagina: number) => void;
  rotulo?: string; // nome acessível da navegação (ex.: "Páginas do diário")
  totalItens?: number; // mostra "12 registros" ao lado
  nomeItem?: [singular: string, plural: string];
  rolar?: boolean; // ao trocar de página, volta ao começo da lista (false dentro de painéis com rolagem própria)
}

type Item = number | "…";

// 1 … 4 5 6 … 12: sempre a primeira, a última e a vizinhança da atual
function itensDaPaginacao(atual: number, total: number): Item[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const itens: Item[] = [0];
  const inicio = Math.max(1, atual - 1);
  const fim = Math.min(total - 2, atual + 1);
  if (inicio > 1) itens.push("…");
  for (let i = inicio; i <= fim; i++) itens.push(i);
  if (fim < total - 2) itens.push("…");
  itens.push(total - 1);
  return itens;
}

// Paginação única do app (paciente e enfermeiro): números, setas e contagem.
export default function Paginacao({
  pagina,
  totalPaginas,
  onMudar,
  rotulo = "Paginação",
  totalItens,
  nomeItem = ["item", "itens"],
  rolar = true,
}: PaginacaoProps) {
  const navRef = useRef<HTMLElement>(null);
  if (totalPaginas <= 1) return null;

  // muda de página e, se o começo da lista ficou para trás, rola suavemente até ele
  function mudar(nova: number) {
    if (nova === pagina || nova < 0 || nova >= totalPaginas) return;
    onMudar(nova);
    if (!rolar) return;
    const ancora = navRef.current?.previousElementSibling ?? navRef.current?.parentElement;
    window.requestAnimationFrame(() => {
      if (!ancora) return;
      const topo = ancora.getBoundingClientRect().top;
      if (topo < 0) {
        const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: window.scrollY + topo - 96, behavior: semMovimento ? "auto" : "smooth" });
      }
    });
  }
  const primeira = pagina === 0;
  const ultima = pagina + 1 >= totalPaginas;

  return (
    <nav ref={navRef} className="paginacao-v2" aria-label={rotulo}>
      <button
        type="button"
        className="paginacao-seta"
        disabled={primeira}
        onClick={() => mudar(pagina - 1)}
        aria-label="Página anterior"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        <span className="paginacao-seta-texto">Anterior</span>
      </button>

      <ol className="paginacao-numeros">
        {itensDaPaginacao(pagina, totalPaginas).map((item, i) =>
          item === "…" ? (
            <li key={`r${i}`} className="paginacao-reticencias" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                className="paginacao-numero"
                aria-current={item === pagina ? "page" : undefined}
                aria-label={`Página ${item + 1}`}
                onClick={() => mudar(item)}
              >
                {item + 1}
              </button>
            </li>
          ),
        )}
      </ol>
      {/* no celular os números dão lugar a "3 de 12" */}
      <span className="paginacao-compacta" aria-hidden="true">
        {pagina + 1} de {totalPaginas}
      </span>

      <button
        type="button"
        className="paginacao-seta"
        disabled={ultima}
        onClick={() => mudar(pagina + 1)}
        aria-label="Próxima página"
      >
        <span className="paginacao-seta-texto">Próxima</span>
        <ArrowRight size={16} aria-hidden="true" />
      </button>

      {totalItens !== undefined && (
        <p className="paginacao-total">
          {totalItens} {totalItens === 1 ? nomeItem[0] : nomeItem[1]}
        </p>
      )}
    </nav>
  );
}
