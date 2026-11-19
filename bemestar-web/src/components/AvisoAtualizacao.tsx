import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { EVENTO_NOVA_VERSAO, aplicarNovaVersao, existeNovaVersao } from "../pwa/registrarSW";

// Faixa "Nova versão disponível" quando o service worker baixou uma atualização
export default function AvisoAtualizacao() {
  const [visivel, setVisivel] = useState(existeNovaVersao);
  const [atualizando, setAtualizando] = useState(false);

  useEffect(() => {
    const mostrar = () => setVisivel(true);
    window.addEventListener(EVENTO_NOVA_VERSAO, mostrar);
    return () => window.removeEventListener(EVENTO_NOVA_VERSAO, mostrar);
  }, []);

  if (!visivel) return null;

  return (
    <div className="aviso-versao" role="status">
      <span>Nova versão do Respire disponível.</span>
      <button
        type="button"
        onClick={() => {
          setAtualizando(true);
          aplicarNovaVersao();
        }}
        disabled={atualizando}
      >
        <RefreshCw size={15} aria-hidden="true" />
        {atualizando ? "Atualizando…" : "Atualizar"}
      </button>
      <button type="button" className="aviso-versao-fechar" onClick={() => setVisivel(false)} aria-label="Agora não">
        ×
      </button>
    </div>
  );
}
