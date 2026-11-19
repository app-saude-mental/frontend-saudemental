import { useRef, useState, type ReactNode } from "react";
import { TransicaoContext } from "./transicaoContext";
import MarcaCarregando from "../components/MarcaCarregando";
import "../styles/transicao.css";

const ENTRADA_MS = 350; // cortina fechando (igual ao CSS)
const SAIDA_MS = 450; // cortina abrindo (igual ao CSS)
const MINIMO_MS = 700; // tempo mínimo com a marca girando: evita um "piscar" quando a ação é instantânea
const FINAL_MS = 900; // tempo mostrando a mensagem final

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

type Fase = "oculta" | "carregando" | "concluida" | "saindo";

export function TransicaoProvider({ children }: { children: ReactNode }) {
  const [fase, setFase] = useState<Fase>("oculta");
  const [mensagem, setMensagem] = useState("");
  const ocupado = useRef(false);

  async function comTransicao(texto: string, acao: () => void | Promise<void>, textoFinal?: string) {
    // quem pediu menos animação no sistema recebe a troca direta, sem cortina
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await acao();
      return;
    }
    if (ocupado.current) return; // evita duas transições ao mesmo tempo (clique duplo)
    ocupado.current = true;

    setMensagem(texto);
    setFase("carregando"); // 1. a cortina fecha
    await esperar(ENTRADA_MS);

    try {
      const inicio = Date.now();
      await acao(); // 2. a troca acontece escondida atrás da cortina
      const resto = MINIMO_MS - (Date.now() - inicio);
      if (resto > 0) await esperar(resto);

      if (textoFinal) {
        setMensagem(textoFinal);
        setFase("concluida");
        await esperar(FINAL_MS);
      }
    } finally {
      setFase("saindo"); // 3. a cortina abre
      await esperar(SAIDA_MS);
      setFase("oculta");
      ocupado.current = false;
    }
  }

  const visivel = fase !== "oculta" && fase !== "saindo";

  return (
    <TransicaoContext.Provider value={{ comTransicao }}>
      {children}

      <div className={`transicao fase-${fase} ${visivel ? "visivel" : ""}`} aria-hidden={!visivel}>
        <div className="transicao-conteudo">
          <MarcaCarregando concluido={fase === "concluida"} />
          {/* key: a mensagem troca com animação */}
          <p key={mensagem} className="transicao-mensagem" role="status" aria-live="polite">
            {mensagem}
          </p>
          <span className="transicao-barra" aria-hidden="true" />
        </div>
      </div>
    </TransicaoContext.Provider>
  );
}
