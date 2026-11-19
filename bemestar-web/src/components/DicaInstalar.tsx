import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Smartphone, X } from "lucide-react";
import { detectarPlataforma, estaInstalado } from "../pwa/instalacao";

const CHAVE = "respire-dica-instalar";
const INTERVALO_MS = 14 * 24 * 60 * 60 * 1000; // volta a aparecer depois de 14 dias

// Mostrar? Só no celular, fora do app instalado e se não foi dispensada há pouco.
function deveMostrar(): boolean {
  const plataforma = detectarPlataforma();
  if (plataforma !== "android" && plataforma !== "ios") return false;
  if (estaInstalado()) return false;
  try {
    const dispensada = Number(localStorage.getItem(CHAVE) ?? 0);
    return Date.now() - dispensada > INTERVALO_MS;
  } catch {
    return true;
  }
}

// Faixa discreta convidando a instalar o app (PWA) no celular
export default function DicaInstalar() {
  const { pathname } = useLocation();
  const [visivel, setVisivel] = useState(deveMostrar);

  if (!visivel || pathname === "/instalar") return null;

  function dispensar() {
    try {
      localStorage.setItem(CHAVE, String(Date.now()));
    } catch {
      // sem localStorage: some só nesta visita
    }
    setVisivel(false);
  }

  return (
    <div className="dica-instalar" role="note">
      <Smartphone size={20} aria-hidden="true" />
      <p>
        Use o Respire como aplicativo no seu celular. <Link to="/instalar">Ver como instalar</Link>
      </p>
      <button type="button" className="app-icone-botao" onClick={dispensar} aria-label="Dispensar dica de instalação">
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
