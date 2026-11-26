import { useEffect } from "react";

// Blocos que entram com "fade + subida" quando aparecem na tela, em sequência (escalonados).
// Fica num lugar só (AppLayout) para todas as telas ganharem o mesmo ritmo sem mexer em cada uma.
const SELETOR = [
  "[data-revelar]",
  ".cabecalho-sub",
  ".cabecalho-acao",
  ".inicio-hero-frase",
  ".inicio-checkin",
  ".bento > *",
  ".inicio-ajuda",
  ".diario-lista > *",
  ".diario-form > *",
  ".med-lista > *",
  ".duv-lista > *",
  ".duv-caixa",
  ".dicas-lista > *",
  ".dicas-podcast",
  ".habitos-lista > *",
  ".habitos-progresso",
  ".evolucao > *",
  ".paz-cartao",
  ".perfil-cartao",
  ".planos-grid > *",
  ".estado-vazio",
  ".adm-resumo > *",
  ".adm-cartao",
  ".adm-lista > li",
  ".paginacao-v2",
].join(",");

const ATRASO_MS = 70; // entre um bloco e o próximo do mesmo lote
const ATRASO_MAX_MS = 560;

export function useRevelarAoRolar(chave: string) {
  useEffect(() => {
    const raiz = document.querySelector(".pagina");
    if (!raiz) return;
    const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (semMovimento || typeof IntersectionObserver === "undefined") return;

    const observador = new IntersectionObserver(
      (entradas) => {
        // os que entram juntos aparecem em sequência, de cima para baixo
        const visiveis = entradas
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        visiveis.forEach((e, i) => {
          const el = e.target as HTMLElement;
          el.style.setProperty("--atraso-revelar", `${Math.min(i * ATRASO_MS, ATRASO_MAX_MS)}ms`);
          el.classList.add("revelado");
          observador.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -6% 0px", threshold: 0.08 },
    );

    function preparar() {
      raiz!.querySelectorAll<HTMLElement>(SELETOR).forEach((el) => {
        if (el.dataset.revelarPronto || el.closest("dialog")) return;
        el.dataset.revelarPronto = "1";
        el.classList.add("revelar");
        observador.observe(el);
      });
    }

    preparar();
    // listas chegam depois (dados da API, troca de página): prepara os novos itens também
    const mutacoes = new MutationObserver(() => preparar());
    mutacoes.observe(raiz, { childList: true, subtree: true });

    return () => {
      mutacoes.disconnect();
      observador.disconnect();
    };
  }, [chave]);
}
