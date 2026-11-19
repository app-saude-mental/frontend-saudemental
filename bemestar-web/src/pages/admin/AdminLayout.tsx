import { NavLink, Outlet } from "react-router-dom";
import { useNotificacoes } from "../../hooks/useAdmin";
import "../../styles/admin.css";

const ABAS = [
  { to: "/admin", rotulo: "Visão geral", fim: true, contador: null },
  { to: "/admin/usuarios", rotulo: "Usuários", fim: false, contador: null },
  { to: "/admin/duvidas", rotulo: "Dúvidas", fim: false, contador: "duvidas" },
  { to: "/admin/solicitacoes", rotulo: "Solicitações", fim: false, contador: "solicitacoes" },
] as const;

// Painel do enfermeiro: sub-rotas com URL própria (voltar e link direto funcionam).
// No celular a barra de abas rola na horizontal.
export default function AdminLayout() {
  // mesma consulta do sininho (cache compartilhado): pendências por aba
  const { data } = useNotificacoes(true);

  return (
    <section className="adm">
      <header className="adm-topo">
        <h1>Painel do enfermeiro</h1>
        <p>Planos, acompanhamento e respostas. O diário dos usuários não aparece aqui.</p>
      </header>

      <nav className="adm-abas" aria-label="Seções do painel">
        {ABAS.map((aba) => (
          <NavLink
            key={aba.to}
            to={aba.to}
            end={aba.fim}
            className={({ isActive }) => `adm-aba ${isActive ? "ativa" : ""}`}
          >
            {aba.rotulo}
            {aba.contador && (data?.[aba.contador] ?? 0) > 0 && (
              <span className="adm-aba-contador" aria-label={`${data?.[aba.contador]} pendentes`}>
                {data?.[aba.contador]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <Outlet />
    </section>
  );
}
