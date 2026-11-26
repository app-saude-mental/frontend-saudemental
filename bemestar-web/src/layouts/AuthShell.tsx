import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Download, Headphones, HeartHandshake, LockKeyhole } from "lucide-react";
import FormLogin from "../components/FormLogin";
import FormCadastro from "../components/FormCadastro";
import Meditante3D from "../components/Meditante3D";
import Logo from "../components/Logo";
import "../styles/auth.css";
import "../styles/entrada.css";

const FRASES = [
  "Você não precisa dar conta de tudo hoje.",
  "Respirar fundo também é cuidar de si.",
  "Um passo de cada vez já é muito.",
  "Seus sentimentos merecem um lugar seguro.",
];

// Login e cadastro: cena que "respira" à esquerda, formulário à direita (no celular, empilhados).
export default function AuthShell() {
  const { pathname } = useLocation();
  const modo = pathname === "/cadastro" ? "cadastro" : "login";
  // meio-ciclo de respiração (4 s): par = inspire, ímpar = expire; a frase troca a cada ciclo completo
  const [passo, setPasso] = useState(0);
  const fase = passo % 2 === 0 ? "inspire" : "expire";
  const frase = Math.floor(passo / 2) % FRASES.length;
  // a cena 3D avisa se o aparelho tem WebGL; sem ele, fica o anel em CSS
  const [tem3D, setTem3D] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setPasso((n) => n + 1), 4000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`tela-entrada ${tem3D ? "com-3d" : ""}`} data-modo={modo}>
      {/* ---------- Cena ---------- */}
      <aside className="entrada-cena" aria-hidden="true">
        <span className="entrada-aura">
          <span />
          <span />
          <span />
        </span>
        <Logo tamanho={34} className="entrada-logo" />

        <div className="entrada-respiro">
          {/* pessoa meditando em 3D; sem WebGL fica o anel em CSS */}
          <Meditante3D modo={modo} onSuporte={setTem3D} className="entrada-meditante" />
          <span className={`entrada-anel ${fase}`} />
        </div>
        <p className={`entrada-fase ${fase}`}>
          <span className="entrada-fase-ponto" />
          {fase === "inspire" ? "Inspire…" : "Expire…"}
        </p>

        <div className="entrada-cena-texto">
          <p key={frase} className="entrada-frase">
            {FRASES[frase]}
          </p>
          <ul className="entrada-garantias">
            <li>
              <LockKeyhole size={16} /> Seu diário é só seu
            </li>
            <li>
              <Headphones size={16} /> Sons para acalmar e dormir
            </li>
            <li>
              <HeartHandshake size={16} /> Um enfermeiro por perto
            </li>
          </ul>
        </div>
      </aside>

      {/* ---------- Formulário ---------- */}
      <main className="entrada-lado">
        <Logo tamanho={30} className="entrada-logo-movel" />

        <nav className="entrada-seletor" aria-label="Entrar ou criar conta">
          <span className="entrada-seletor-pilula" aria-hidden="true" />
          <Link to="/login" aria-current={modo === "login" ? "page" : undefined}>
            Entrar
          </Link>
          <Link to="/cadastro" aria-current={modo === "cadastro" ? "page" : undefined}>
            Criar conta
          </Link>
        </nav>

        {/* a key reinicia a animação de entrada ao trocar entre login e cadastro */}
        <div key={modo} className="entrada-form-area">
          {modo === "login" ? <FormLogin /> : <FormCadastro />}
        </div>

        <footer className="entrada-rodape">
          <Link to="/instalar">
            <Download size={15} aria-hidden="true" /> Instalar o app
          </Link>
          <span aria-hidden="true">·</span>
          <span>Seus dados protegidos pela LGPD</span>
        </footer>
      </main>
    </div>
  );
}
