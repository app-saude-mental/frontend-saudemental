import { Check } from "lucide-react";
import { LogoMarca } from "./Logo";

// Marca do Respire com um anel girando (carregando) ou um sinal de concluído.
// Usada na cortina de entrada/saída e na espera da renovação da sessão.
export default function MarcaCarregando({ concluido = false }: { concluido?: boolean }) {
  return (
    <span className={`marca-carregando ${concluido ? "concluido" : ""}`} aria-hidden="true">
      <svg className="marca-anel" viewBox="0 0 100 100">
        <circle className="marca-anel-trilho" cx="50" cy="50" r="46" />
        <circle className="marca-anel-arco" cx="50" cy="50" r="46" />
      </svg>
      <span className="marca-icone">{concluido ? <Check size={34} strokeWidth={1.6} /> : <LogoMarca tamanho={64} />}</span>
    </span>
  );
}
