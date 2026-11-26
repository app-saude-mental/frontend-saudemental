import { useState } from "react";

// Paginação no navegador, para listas que o back devolve inteiras (ex.: orientações).
export function usePaginaLocal<T>(lista: T[] | undefined, tamanho = 5) {
  const [paginaEscolhida, setPagina] = useState(0);
  const total = lista?.length ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(total / tamanho));
  // se a lista encolheu (item excluído), não fica numa página que não existe mais
  const pagina = Math.min(paginaEscolhida, totalPaginas - 1);
  const itens = lista?.slice(pagina * tamanho, pagina * tamanho + tamanho) ?? [];
  return { itens, pagina, totalPaginas, total, setPagina };
}
