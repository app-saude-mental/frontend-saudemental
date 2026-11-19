import { Link, useLocation } from "react-router-dom";
import { Download } from "lucide-react";
import Meditacao from "../components/Meditacao";
import FormLogin from "../components/FormLogin";
import FormCadastro from "../components/FormCadastro";
import "../styles/auth.css";

export default function AuthShell() {
  const { pathname } = useLocation();
  const modo = pathname === "/cadastro" ? "cadastro" : "login";

  return (
    <div className="auth-pagina">
      {/* data-modo é o "interruptor": o CSS reage a ele */}
      <div className="auth-cartao" data-modo={modo}>
        <aside className="auth-painel">
          <Meditacao />

          <div className="painel-textos">
            <div className={`painel-texto ${modo === "cadastro" ? "ativo" : ""}`}>
              <h2>Bem-vindo de volta!</h2>
              <p>Já tem conta? Entre para continuar sua jornada de bem-estar.</p>
              <Link to="/login" className="btn-contorno">
                Entrar
              </Link>
            </div>

            <div className={`painel-texto ${modo === "login" ? "ativo" : ""}`}>
              <h2>Olá, bem-vindo!</h2>
              <p>Ainda não tem conta? Crie a sua e comece agora.</p>
              <Link to="/cadastro" className="btn-contorno">
                Criar conta
              </Link>
            </div>
          </div>
        </aside>

        <section className={`form-area form-login ${modo === "login" ? "ativo" : ""}`}>
          <FormLogin />
        </section>

        <section className={`form-area form-cadastro ${modo === "cadastro" ? "ativo" : ""}`}>
          <FormCadastro />
        </section>
      </div>

      <Link to="/instalar" className="auth-instalar">
        <Download size={16} aria-hidden="true" /> Como instalar o app no celular ou computador
      </Link>
    </div>
  );
}