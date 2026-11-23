import { useEffect, useState } from "react";
import { FileText, ImageIcon, X } from "lucide-react";
import { baixarAnexo, formatarTamanho, urlDoAnexo } from "../services/anexoService";
import type { Anexo } from "../types/duvida";

interface Props {
  anexos: Anexo[];
  comoAdmin?: boolean; // o enfermeiro baixa pela rota /admin
  onRemover?: (anexo: Anexo) => void; // só no formulário de edição
  removendo?: number | null;
}

// Lista de anexos de uma dúvida: miniatura para imagens, ícone para PDF.
// Tocar abre o arquivo numa nova aba (baixado com o token, como URL local temporária).
export default function AnexosLista({ anexos, comoAdmin = false, onRemover, removendo }: Props) {
  if (anexos.length === 0) return null;
  return (
    <ul className="anexos" aria-label="Anexos">
      {anexos.map((a) => (
        <li key={a.id} className="anexo">
          <AbrirAnexo anexo={a} comoAdmin={comoAdmin} />
          {onRemover && (
            <button
              type="button"
              className="anexo-remover"
              onClick={() => onRemover(a)}
              disabled={removendo === a.id}
              aria-label={`Remover ${a.nome}`}
            >
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

function AbrirAnexo({ anexo, comoAdmin }: { anexo: Anexo; comoAdmin: boolean }) {
  const ehImagem = anexo.tipo.startsWith("image/");
  const endereco = urlDoAnexo(anexo, comoAdmin);
  const [miniatura, setMiniatura] = useState<string | null>(null);
  const [erro, setErro] = useState(false);

  // imagens: baixa uma vez para mostrar a miniatura; a URL local é liberada ao sair da tela
  useEffect(() => {
    if (!ehImagem) return;
    let url: string | null = null;
    let ativo = true;
    baixarAnexo(endereco)
      .then((blob) => {
        if (!ativo) return;
        url = URL.createObjectURL(blob);
        setMiniatura(url);
      })
      .catch(() => ativo && setErro(true));
    return () => {
      ativo = false;
      if (url) URL.revokeObjectURL(url);
    };
  }, [endereco, ehImagem]);

  async function abrir() {
    if (miniatura) {
      window.open(miniatura, "_blank", "noopener");
      return;
    }
    // abre a aba já no clique (senão o navegador bloqueia como pop-up) e preenche depois
    const aba = window.open("", "_blank");
    try {
      const blob = await baixarAnexo(endereco);
      const url = URL.createObjectURL(blob);
      if (aba) aba.location.href = url;
      else window.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      aba?.close();
      setErro(true);
    }
  }

  return (
    <button type="button" className="anexo-abrir" onClick={abrir} title={`Abrir ${anexo.nome}`}>
      {miniatura ? (
        <img src={miniatura} alt="" className="anexo-miniatura" />
      ) : (
        <span className="anexo-icone" aria-hidden="true">
          {ehImagem ? <ImageIcon size={20} /> : <FileText size={20} />}
        </span>
      )}
      <span className="anexo-texto">
        <span className="anexo-nome">{anexo.nome}</span>
        <span className="anexo-tamanho">{erro ? "Não foi possível abrir" : formatarTamanho(anexo.tamanho)}</span>
      </span>
    </button>
  );
}
