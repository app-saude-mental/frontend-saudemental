import { Link, useLocation } from "react-router-dom";
import { Pause, Play, X } from "lucide-react";
import { useSom } from "../contexts/useSom";
import { infoDoSom } from "../data/sonsNatureza";
import "../styles/momento-paz.css";

function formatarTempo(ms: number) {
  const total = Math.ceil(ms / 1000);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// Barra fixa embaixo da tela enquanto um som do Momento de paz está tocando ou pausado.
// Some na própria tela Meditar (lá os controles já estão à vista).
export default function MiniPlayer() {
  const { pathname } = useLocation();
  const som = useSom();
  const ativo = som.estado === "tocando" || som.estado === "pausado";
  if (!ativo || pathname.startsWith("/meditacao")) return null;

  const tocando = som.estado === "tocando";
  const nome = infoDoSom(som.somId).nome;

  return (
    <aside className="mini-player" aria-label="Som tocando">
      <span className={`mini-player-onda ${tocando ? "ativa" : ""}`} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <Link to="/meditacao" className="mini-player-info" title="Abrir Momento de paz">
        <span className="mini-player-nome">{nome}</span>
        <span className="mini-player-tempo">
          {som.duracaoMin === null ? "Sem limite" : formatarTempo(som.restanteMs)}
          {!tocando && " · pausado"}
        </span>
      </Link>
      <button
        type="button"
        className="mini-player-botao principal"
        onClick={() => void som.alternar()}
        disabled={som.iniciando}
        aria-label={tocando ? `Pausar ${nome}` : `Continuar ${nome}`}
      >
        {tocando ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
      </button>
      <button type="button" className="mini-player-botao" onClick={som.parar} aria-label={`Parar ${nome}`}>
        <X size={18} aria-hidden="true" />
      </button>
    </aside>
  );
}
