import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Crown,
  Download,
  Headphones,
  LayoutDashboard,
  Lightbulb,
  ListChecks,
  LogOut,
  Menu,
  MessageCircle,
  Moon,
  Pill,
  Sun,
  User,
  X,
} from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import { useTransicao } from "../contexts/useTransicao";
import { useUsuarioAtual } from "../hooks/usePerfil";
import { useTema } from "../hooks/useTema";
import type { Recurso } from "../types/auth";
import { nomeDoPlano } from "../utils/plano";
import SinoNotificacoes from "../components/admin/SinoNotificacoes";
import CelebracaoPlano from "../components/CelebracaoPlano";
import DicaInstalar from "../components/DicaInstalar";
import Logo from "../components/Logo";
import "../styles/app.css";

interface ItemMenu {
  to: string;
  rotulo: string;
  Icone: LucideIcon;
  recurso?: Recurso; // só aparece se o plano incluir o recurso
  soGaveta?: boolean; // no topo já existe atalho (avatar/ícone): só aparece na gaveta
}

// Menu de quem usa o app
const LINKS_USUARIO: ItemMenu[] = [
  { to: "/planos", rotulo: "Planos", Icone: Crown },
  { to: "/diario", rotulo: "Diário", Icone: BookOpen },
  { to: "/habitos", rotulo: "Hábitos", Icone: ListChecks },
  { to: "/meditacao", rotulo: "Meditar", Icone: Headphones },
  { to: "/dicas", rotulo: "Dicas", Icone: Lightbulb },
  { to: "/medicamentos", rotulo: "Medicamentos", Icone: Pill, recurso: "MEDICAMENTOS" },
  { to: "/duvidas", rotulo: "Dúvidas", Icone: MessageCircle, recurso: "DUVIDAS" },
  { to: "/perfil", rotulo: "Perfil", Icone: User, soGaveta: true },
  { to: "/instalar", rotulo: "Instalar", Icone: Download, soGaveta: true },
];

// Menu do enfermeiro (ADMIN): só o que faz sentido para ele
const LINKS_ADMIN: ItemMenu[] = [
  { to: "/admin", rotulo: "Painel", Icone: LayoutDashboard },
  { to: "/planos", rotulo: "Planos", Icone: Crown },
  { to: "/perfil", rotulo: "Perfil", Icone: User, soGaveta: true },
  { to: "/instalar", rotulo: "Instalar", Icone: Download, soGaveta: true },
];

const classeLink = ({ isActive }: { isActive: boolean }) => `app-link ${isActive ? "ativo" : ""}`;

export default function AppLayout() {
  const { usuario, sair, pode, ehAdmin } = useAuth();
  const { comTransicao } = useTransicao();
  const { tema, alternar } = useTema();
  const [menuAberto, setMenuAberto] = useState(false);
  const botaoMenuRef = useRef<HTMLButtonElement>(null);
  const primeiroLinkRef = useRef<HTMLAnchorElement>(null);
  // mantém plano e recursos atualizados (ao abrir, ao focar a janela e periodicamente)
  useUsuarioAtual();

  const inicial = usuario?.nome.trim().charAt(0).toUpperCase() ?? "?";
  const links = ehAdmin ? LINKS_ADMIN : LINKS_USUARIO.filter((link) => !link.recurso || pode(link.recurso));

  function fecharMenu() {
    setMenuAberto(false);
    botaoMenuRef.current?.focus(); // devolve o foco para quem abriu
  }

  // gaveta aberta: trava a rolagem, foca o 1º link e fecha com Esc
  useEffect(() => {
    if (!menuAberto) return;
    document.body.classList.add("menu-aberto");
    primeiroLinkRef.current?.focus();
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMenuAberto(false);
        botaoMenuRef.current?.focus();
      }
    }
    window.addEventListener("keydown", aoTeclar);
    return () => {
      document.body.classList.remove("menu-aberto");
      window.removeEventListener("keydown", aoTeclar);
    };
  }, [menuAberto]);

  function aoSair() {
    setMenuAberto(false);
    comTransicao("Saindo com segurança…", sair, "Até logo! Cuide-se.");
  }

  const rotuloTema = tema === "escuro" ? "Usar tema claro" : "Usar tema escuro";

  return (
    <div className="app-shell">
      <header className="app-topo">
        <button
          ref={botaoMenuRef}
          type="button"
          className="app-icone-botao app-hamburguer"
          onClick={() => setMenuAberto(true)}
          aria-label="Abrir menu"
          aria-expanded={menuAberto}
          aria-controls="menu-lateral"
        >
          <Menu size={22} aria-hidden="true" />
        </button>

        <Link to="/" className="app-marca" aria-label="Respire — início">
          <Logo tamanho={30} />
        </Link>

        <nav className="app-nav" aria-label="Principal">
          {/* no topo, só texto (mais leve); os ícones ficam na gaveta */}
          {links
            .filter((link) => !link.soGaveta)
            .map(({ to, rotulo }) => (
              <NavLink key={to} to={to} className={classeLink}>
                {rotulo}
              </NavLink>
            ))}
        </nav>

        <div className="app-usuario">
          {ehAdmin && <SinoNotificacoes />}
          <NavLink
            to="/instalar"
            className={({ isActive }) => `app-icone-botao so-desktop ${isActive ? "ativo" : ""}`}
            aria-label="Instalar o app"
            title="Instalar o app"
          >
            <Download size={18} aria-hidden="true" />
          </NavLink>
          <button type="button" className="app-icone-botao" onClick={alternar} aria-label={rotuloTema} title={rotuloTema}>
            {tema === "escuro" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
          </button>
          <NavLink
            to="/perfil"
            className={({ isActive }) => `app-avatar ${isActive ? "ativo" : ""}`}
            aria-label="Seu perfil"
            title="Seu perfil"
          >
            {inicial}
          </NavLink>
          <button type="button" className="app-sair so-desktop" onClick={aoSair} aria-label="Sair" title="Sair">
            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      {/* ---------- Gaveta lateral (telas abaixo de 1024px) ---------- */}
      <div className={`menu-fundo ${menuAberto ? "aberto" : ""}`} onClick={fecharMenu} aria-hidden="true" />
      <nav
        id="menu-lateral"
        className={`menu-lateral ${menuAberto ? "aberto" : ""}`}
        aria-label="Menu"
        aria-hidden={!menuAberto}
        inert={!menuAberto}
      >
        <div className="menu-cabecalho">
          <span className="app-marca">
            <Logo tamanho={28} />
          </span>
          <button type="button" className="app-icone-botao" onClick={fecharMenu} aria-label="Fechar menu">
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {usuario && (
          <Link to="/perfil" className="menu-usuario" onClick={() => setMenuAberto(false)}>
            <span className="app-avatar" aria-hidden="true">
              {inicial}
            </span>
            <span>
              <strong>{usuario.nome}</strong>
              <span>{nomeDoPlano(usuario.planoEfetivo)}</span>
            </span>
          </Link>
        )}

        <ul className="menu-links">
          {links.map(({ to, rotulo, Icone }, i) => (
            <li key={to}>
              <NavLink
                to={to}
                ref={i === 0 ? primeiroLinkRef : undefined}
                className={classeLink}
                onClick={() => setMenuAberto(false)}
              >
                <Icone size={20} aria-hidden="true" />
                <span>{rotulo}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="menu-rodape">
          <button type="button" className="app-link" onClick={alternar}>
            {tema === "escuro" ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
            <span>{tema === "escuro" ? "Tema claro" : "Tema escuro"}</span>
          </button>
          <button type="button" className="app-link sair" onClick={aoSair}>
            <LogOut size={20} aria-hidden="true" />
            <span>Sair</span>
          </button>
        </div>
      </nav>

      <main className="app-conteudo">
        <DicaInstalar />
        <Outlet />
      </main>

      {/* plano liberado/renovado pelo enfermeiro: celebra uma vez ao voltar ao app */}
      {!ehAdmin && <CelebracaoPlano />}
    </div>
  );
}
