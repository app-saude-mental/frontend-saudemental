import { useEffect } from "react";
import { Check } from "lucide-react";
import MarcaCarregando from "./MarcaCarregando";
import { useAuth } from "../contexts/useAuth";
import { BENEFICIOS } from "../data/beneficios";
import { usePlanoLiberado } from "../hooks/usePlanoLiberado";
import { formatarData } from "../utils/data";
import "../styles/celebracao.css";

const QUANTIDADE_CONFETES = 26;
// posições e tempos fixos por índice (sem aleatório no render)
const CONFETES = Array.from({ length: QUANTIDADE_CONFETES }, (_, i) => ({
  esquerda: (i * 37) % 100,
  atraso: ((i * 13) % 20) / 10,
  duracao: 3.2 + ((i * 7) % 15) / 10,
  giro: (i * 47) % 360,
  tipo: i % 3, // folha, confete verde, confete dourado
}));

/**
 * Celebração ao voltar ao app depois que o enfermeiro liberou ou renovou o plano.
 * Aparece uma vez por liberação (controle em usePlanoLiberado).
 */
export default function CelebracaoPlano() {
  const { usuario } = useAuth();
  const { evento, plano, confirmar } = usePlanoLiberado(usuario);

  useEffect(() => {
    if (!evento) return;
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") confirmar();
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  });

  if (!evento || !plano) return null;

  const chave = plano.tipo === "PACIENTE" ? "paciente" : "assinante";
  // o que o plano tem a mais que o Gratuito
  const ganhos = BENEFICIOS.filter((b) => b[chave] !== false && b[chave] !== b.gratuito).map((b) =>
    typeof b[chave] === "string" ? `${b.texto}: ${b[chave]}` : b.texto,
  );

  return (
    <div className="celebracao" role="dialog" aria-modal="true" aria-labelledby="celebracao-titulo">
      <div className="celebracao-confetes" aria-hidden="true">
        {CONFETES.map((c, i) => (
          <span
            key={i}
            className={`confete tipo-${c.tipo}`}
            style={{
              left: `${c.esquerda}%`,
              animationDelay: `${c.atraso}s`,
              animationDuration: `${c.duracao}s`,
              rotate: `${c.giro}deg`,
            }}
          />
        ))}
      </div>

      <div className="celebracao-cartao">
        <MarcaCarregando concluido />
        <h2 id="celebracao-titulo">
          {evento === "renovado" ? "Plano renovado!" : `Seu plano ${plano.nome} foi liberado!`}
        </h2>
        {plano.venceEm && <p className="celebracao-validade">Válido até {formatarData(plano.venceEm)}</p>}

        {evento === "liberado" && ganhos.length > 0 && (
          <ul className="celebracao-ganhos">
            {ganhos.map((g) => (
              <li key={g}>
                <Check size={16} aria-hidden="true" /> {g}
              </li>
            ))}
          </ul>
        )}

        <button type="button" className="btn-principal celebracao-botao" onClick={confirmar} autoFocus>
          Começar
        </button>
      </div>
    </div>
  );
}
