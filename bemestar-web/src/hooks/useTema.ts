import { useState } from "react";

// Mesma chave lida pelo script do index.html (aplica o tema antes do primeiro desenho)
const CHAVE = "bemestar-tema";
const COR_BARRA = { claro: "#f8f2e9", escuro: "#15191b" } as const;

export type Tema = "claro" | "escuro";

function temaAtual(): Tema {
  return document.documentElement.dataset.tema === "escuro" ? "escuro" : "claro";
}

function aplicar(tema: Tema) {
  document.documentElement.dataset.tema = tema;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", COR_BARRA[tema]);
  try {
    localStorage.setItem(CHAVE, tema);
  } catch {
    // sem localStorage (modo privado): o tema vale só nesta visita
  }
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaAtual);

  function alternar() {
    const novo: Tema = tema === "escuro" ? "claro" : "escuro";
    aplicar(novo);
    setTema(novo);
  }

  return { tema, alternar };
}
