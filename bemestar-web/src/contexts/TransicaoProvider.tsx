import { useRef, useState, type ReactNode } from "react";
import { Leaf } from "lucide-react";
import { TransicaoContext } from "./transicaoContext";
import "../styles/transicao.css";

const FADE_MS = 400; // duração da cortina fechando/abrindo (igual ao transition do CSS)
const PAUSA_MS = 600; // tempo mostrando a mensagem depois que a ação acontece

const esperar = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export function TransicaoProvider({ children }: { children: ReactNode }) {
  const [mensagem, setMensagem] = useState("");
  const [visivel, setVisivel] = useState(false);
  const ocupado = useRef(false);

  async function comTransicao(texto: string, acao: () => void | Promise<void>) {
    // quem pediu menos animação no sistema recebe a troca direta, sem cortina
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      await acao();
      return;
    }
    if (ocupado.current) return; // evita duas transições ao mesmo tempo (clique duplo)
    ocupado.current = true;

    setMensagem(texto);
    setVisivel(true); // 1. a cortina fecha
    await esperar(FADE_MS);

    try {
      await acao(); // 2. a troca de tela acontece escondida atrás dela
      await esperar(PAUSA_MS);
    } finally {
      setVisivel(false); // 3. a cortina abre
      await esperar(FADE_MS);
      ocupado.current = false;
    }
  }

  return (
    <TransicaoContext.Provider value={{ comTransicao }}>
      {children}

      <div
        className={`transicao ${visivel ? "visivel" : ""}`}
        role="status"
        aria-live="polite"
        aria-hidden={!visivel}
      >
        <div className="transicao-conteudo">
          <span className="transicao-icone">
            <Leaf size={30} aria-hidden="true" />
          </span>
          <p>{mensagem}</p>
        </div>
      </div>
    </TransicaoContext.Provider>
  );
}