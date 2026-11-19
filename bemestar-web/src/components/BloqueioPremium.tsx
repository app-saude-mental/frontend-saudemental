import { useState } from "react";
import { Link } from "react-router-dom";
import { Lock, RefreshCw } from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import { PLANO_DO_RECURSO } from "../utils/plano";
import type { Recurso } from "../types/auth";

interface BloqueioPremiumProps {
  recurso: Recurso;
  titulo?: string; // nome do recurso, ex.: "Medicamentos"
  compacto?: boolean; // dentro de uma página (ex.: seção de orientações)
}

// Cartão mostrado quando o plano não inclui o recurso. Esconder no front não é segurança:
// o back também recusa com 403.
export default function BloqueioPremium({ recurso, titulo, compacto = false }: BloqueioPremiumProps) {
  const { atualizarStatus } = useAuth();
  const [atualizando, setAtualizando] = useState(false);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const plano = PLANO_DO_RECURSO[recurso] ?? "Premium";

  async function aoAtualizar() {
    setAtualizando(true);
    setMensagem(null);
    try {
      await atualizarStatus();
      setMensagem("Status atualizado.");
    } catch {
      setMensagem("Não foi possível atualizar agora. Tente novamente.");
    } finally {
      setAtualizando(false);
    }
  }

  return (
    <section className={`bloqueio ${compacto ? "compacto" : ""}`} aria-labelledby={`bloqueio-${recurso}`}>
      <span className="bloqueio-icone" aria-hidden="true">
        <Lock size={22} />
      </span>
      <h2 id={`bloqueio-${recurso}`}>
        {titulo ? `${titulo}: ` : ""}disponível no {plano}
      </h2>
      <p>Conheça os planos para liberar este recurso. A liberação é feita pelo seu enfermeiro.</p>
      <div className="bloqueio-acoes">
        <Link to="/planos" className="bloqueio-link">
          Ver planos
        </Link>
        <button type="button" className="btn-secundario" onClick={aoAtualizar} disabled={atualizando}>
          <RefreshCw size={16} aria-hidden="true" />
          {atualizando ? "Atualizando…" : "Já assinei: atualizar status"}
        </button>
      </div>
      {mensagem && (
        <p className="bloqueio-mensagem" role="status">
          {mensagem}
        </p>
      )}
    </section>
  );
}
