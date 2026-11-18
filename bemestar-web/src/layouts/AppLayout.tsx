import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import "../styles/app.css";
import { useTransicao } from "../contexts/useTransicao";
import { BookOpen, Crown, Leaf, ListChecks, LogOut, Pill, User } from "lucide-react";


const LINKS = [
  { to: "/planos", rotulo: "Planos", Icone: Crown },
  { to: "/diario", rotulo: "Diário", Icone: BookOpen },
  { to: "/habitos", rotulo: "Hábitos", Icone: ListChecks },
  { to: "/perfil", rotulo: "Perfil", Icone: User },
  { to: "/medicamentos", rotulo: "Medicamentos", Icone: Pill },
];

export default function AppLayout() {
  const { usuario, sair } = useAuth();
  const inicial = usuario?.nome.trim().charAt(0).toUpperCase() ?? "?";
  const { comTransicao } = useTransicao();

  function aoSair() {
  comTransicao("Até logo! Cuide-se.", sair);
}

  return (
    <div className="app-shell">
      <header className="app-topo">
        <div className="app-marca">
          <span className="app-marca-icone">
            <Leaf size={20} aria-hidden="true" />
          </span>
          <span>Respire</span>
        </div>

        <nav className="app-nav" aria-label="Principal">
          {LINKS.map(({ to, rotulo, Icone }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `app-link ${isActive ? "ativo" : ""}`}
            >
              <Icone size={18} aria-hidden="true" />
              <span>{rotulo}</span>
            </NavLink>
          ))}
        </nav>

        <div className="app-usuario">
          <span className="app-avatar" aria-hidden="true">
            {inicial}
          </span>
<button type="button" className="app-sair" onClick={aoSair} aria-label="Sair">            <LogOut size={18} aria-hidden="true" />
          </button>
        </div>
      </header>

      <main className="app-conteudo">
        <Outlet />
      </main>
    </div>
  );

  
}
