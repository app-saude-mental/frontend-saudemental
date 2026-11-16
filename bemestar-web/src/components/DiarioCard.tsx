import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { buscarHumor } from "../data/humores";
import type { Diario } from "../types/diario";

const LIMITE_RESUMO = 280;

function formatarData(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "long", timeStyle: "short" });
}

interface DiarioCardProps {
  diario: Diario;
  onEditar: (diario: Diario) => void;
  onExcluir: (diario: Diario) => void;
  desabilitado: boolean;
}

export default function DiarioCard({ diario, onEditar, onExcluir, desabilitado }: DiarioCardProps) {
  const [aberto, setAberto] = useState(false);
  const longo = diario.texto.length > LIMITE_RESUMO;
  const editado = diario.atualizadoEm !== diario.criadoEm;
  const humor = buscarHumor(diario.humor);

  return (
    <li className="entrada" style={humor ? { borderLeftColor: humor.cor } : undefined}>
      <div className="entrada-topo">
        <div className="entrada-info">
          {humor && (
            <span className="humor-chip">
              <span className="humor-ponto" style={{ backgroundColor: humor.cor }} />
              {humor.rotulo}
            </span>
          )}
          <span className="entrada-data">
            {formatarData(diario.criadoEm)}
            {editado && <span className="editado"> · editado</span>}
          </span>
        </div>

        <div className="entrada-acoes">
          <button
            type="button"
            className="icone-botao"
            onClick={() => onEditar(diario)}
            disabled={desabilitado}
            aria-label="Editar entrada"
          >
            <Pencil size={17} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="icone-botao perigo"
            onClick={() => onExcluir(diario)}
            disabled={desabilitado}
            aria-label="Excluir entrada"
          >
            <Trash2 size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <p className={`entrada-texto ${longo && !aberto ? "recortado" : ""}`}>{diario.texto}</p>

      {longo && (
        <button type="button" className="ler-mais" onClick={() => setAberto(!aberto)}>
          {aberto ? "Mostrar menos" : "Ler mais"}
        </button>
      )}
    </li>
  );
}