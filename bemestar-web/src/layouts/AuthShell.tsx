import { Link, useLocation } from "react-router-dom";
import { Download, ShieldCheck } from "lucide-react";
import FormLogin from "../components/FormLogin";
import FormCadastro from "../components/FormCadastro";
import Logo from "../components/Logo";
import PaisagemAcesso from "../components/PaisagemAcesso";
import AlturaSuave from "../components/AlturaSuave";
import TextoRevelado from "../components/TextoRevelado";
import "../styles/auth.css";
import "../styles/acesso.css";

const TEXTOS = {
  login: {
    titulo: "Respire. Você chegou a um lugar calmo.",
    sub: "Seu diário, seus hábitos e seus momentos de paz esperam por você.",
  },
  cadastro: {
    titulo: "Comece devagar. Este espaço é seu.",
    sub: "Um cantinho para cuidar da mente no seu ritmo, com um enfermeiro por perto.",
  },
} as const;

// Login e cadastro: paisagem ao amanhecer (noite no tema escuro) com o cartão por cima.
// Notebook: texto à esquerda, cartão à direita. Celular: céu no topo, cartão como "folha" embaixo.
export default function AuthShell() {
  const { pathname } = useLocation();
  const modo = pathname === "/cadastro" ? "cadastro" : "login";
  const texto = TEXTOS[modo];

  return (
    <div className="acesso" data-modo={modo}>
      <PaisagemAcesso />

      <header className="acesso-topo">
        <Logo tamanho={34} className="acesso-logo" />
        <p className="acesso-respire" aria-hidden="true">
          <span className="acesso-respire-ponto" />
          <span className="acesso-respire-texto">
            <span>inspire</span>
            <span>expire</span>
          </span>
        </p>
      </header>

      <section className="acesso-chamada" aria-live="polite">
        <h2 key={modo}>
          <TextoRevelado texto={texto.titulo} atraso={modo === "login" ? 350 : 0} />
        </h2>
        <p key={`${modo}-sub`} className="acesso-chamada-sub">
          {texto.sub}
        </p>
      </section>

      <main className="acesso-cartao">
        <nav className="acesso-abas" aria-label="Entrar ou criar conta">
          <Link to="/login" replace aria-current={modo === "login" ? "page" : undefined}>
            Entrar
          </Link>
          <Link to="/cadastro" replace aria-current={modo === "cadastro" ? "page" : undefined}>
            Criar conta
          </Link>
          <span className="acesso-abas-marca" aria-hidden="true" />
        </nav>

        {/* a altura acompanha a troca de formulário; a key reinicia a animação de entrada */}
        <AlturaSuave>
          <div key={modo} className={`acesso-form-area vindo-${modo}`}>
            {modo === "login" ? <FormLogin /> : <FormCadastro />}
          </div>
        </AlturaSuave>

        <footer className="acesso-rodape">
          <span>
            <ShieldCheck size={15} aria-hidden="true" /> Dados protegidos pela LGPD
          </span>
          <Link to="/instalar">
            <Download size={15} aria-hidden="true" /> Instalar o app
          </Link>
        </footer>
      </main>
    </div>
  );
}
