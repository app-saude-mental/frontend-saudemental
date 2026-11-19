import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, CircleDollarSign, HeartHandshake, MessageCircleQuestion, Undo2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useNotificacoes } from "../../hooks/useAdmin";
import type { NotificacaoItem, TipoNotificacao } from "../../types/admin";
import "../../styles/notificacoes.css";

const CHAVE_VISTO = "respire-notificacoes-vistas";

const POR_TIPO: Record<TipoNotificacao, { Icone: LucideIcon; destino: string }> = {
  PIX_INFORMADO: { Icone: CircleDollarSign, destino: "/admin/solicitacoes?status=PENDENTE" },
  CONTATO_ENFERMEIRO: { Icone: HeartHandshake, destino: "/admin/solicitacoes?status=PENDENTE" },
  ARREPENDIMENTO: { Icone: Undo2, destino: "/admin/solicitacoes?status=PENDENTE" },
  DUVIDA: { Icone: MessageCircleQuestion, destino: "/admin/duvidas?status=PENDENTE" },
};

function lerVisto(): string {
  try {
    return localStorage.getItem(CHAVE_VISTO) ?? "";
  } catch {
    return "";
  }
}

// "há 5 min", calculado em relação à última atualização da consulta (sem relógio no render)
function haQuanto(iso: string, referencia: number): string {
  const minutos = Math.max(0, Math.round((referencia - new Date(iso).getTime()) / 60_000));
  if (minutos < 1) return "agora";
  if (minutos < 60) return `há ${minutos} min`;
  const horas = Math.round(minutos / 60);
  if (horas < 24) return `há ${horas} h`;
  const dias = Math.round(horas / 24);
  return dias === 1 ? "há 1 dia" : `há ${dias} dias`;
}

/**
 * Sininho do enfermeiro (só ADMIN): número de pendências que exigem ação dele,
 * como notificação de rede social. Abre um painel com as mais recentes.
 * Também mostra o número no título da aba e no ícone do app instalado (quando suportado).
 */
export default function SinoNotificacoes() {
  const { data, dataUpdatedAt } = useNotificacoes(true);
  const [aberto, setAberto] = useState(false);
  // visto: pendência mais recente já mostrada; base: o "visto" de quando o painel abriu (destaques)
  const [visto, setVisto] = useState(lerVisto);
  const [base, setBase] = useState(visto);
  const raizRef = useRef<HTMLDivElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);

  const total = data?.total ?? 0;
  const itens = data?.itens ?? [];
  const novos = itens.filter((i) => i.criadoEm > visto).length;

  // número no título da aba e no ícone do app instalado
  useEffect(() => {
    document.title = total > 0 ? `(${total > 99 ? "99+" : total}) Respire` : "Respire";
    const nav = navigator as Navigator & { setAppBadge?: (n: number) => Promise<void>; clearAppBadge?: () => Promise<void> };
    if (total > 0) nav.setAppBadge?.(total).catch(() => undefined);
    else nav.clearAppBadge?.().catch(() => undefined);
    return () => {
      document.title = "Respire";
    };
  }, [total]);

  // painel aberto: fecha com Esc e com clique fora
  useEffect(() => {
    if (!aberto) return;
    function aoClicar(e: MouseEvent) {
      if (raizRef.current && !raizRef.current.contains(e.target as Node)) setAberto(false);
    }
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAberto(false);
        botaoRef.current?.focus();
      }
    }
    document.addEventListener("mousedown", aoClicar);
    document.addEventListener("keydown", aoTeclar);
    return () => {
      document.removeEventListener("mousedown", aoClicar);
      document.removeEventListener("keydown", aoTeclar);
    };
  }, [aberto]);

  function alternar() {
    if (aberto) {
      setAberto(false);
      return;
    }
    setBase(visto); // destaca o que chegou desde a última abertura
    if (itens.length > 0) {
      const maisRecente = itens[0].criadoEm; // a partir de agora, isto já foi visto
      try {
        localStorage.setItem(CHAVE_VISTO, maisRecente);
      } catch {
        // sem localStorage: os destaques de "novo" valem só nesta visita
      }
      setVisto(maisRecente);
    }
    setAberto(true);
  }

  const rotulo = total === 0 ? "Notificações: nada pendente" : `Notificações: ${total} pendente${total > 1 ? "s" : ""}`;

  return (
    <div className="sino" ref={raizRef}>
      <button
        ref={botaoRef}
        type="button"
        className={`app-icone-botao sino-botao ${novos > 0 ? "tem-novos" : ""}`}
        onClick={alternar}
        aria-label={rotulo}
        title={rotulo}
        aria-expanded={aberto}
        aria-controls="sino-painel"
      >
        <Bell size={20} aria-hidden="true" />
        {total > 0 && (
          // key: a bolinha "pula" de novo sempre que o número muda
          <span key={total} className="sino-numero" aria-hidden="true">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {aberto && (
        <div id="sino-painel" className="sino-painel" role="region" aria-label="Pendências do enfermeiro">
          <header className="sino-cabecalho">
            <strong>Notificações</strong>
            {total > 0 && <span>{total} pendente{total > 1 ? "s" : ""}</span>}
          </header>

          {itens.length === 0 ? (
            <p className="sino-vazio">Tudo em dia. Nenhum paciente aguardando você.</p>
          ) : (
            <ul className="sino-lista">
              {itens.map((item: NotificacaoItem) => {
                const { Icone, destino } = POR_TIPO[item.tipo];
                const novo = item.criadoEm > base;
                return (
                  <li key={`${item.tipo}-${item.id}`}>
                    <Link to={destino} className={`sino-item ${novo ? "novo" : ""}`} onClick={() => setAberto(false)}>
                      <span className={`sino-icone tipo-${item.tipo.toLowerCase()}`} aria-hidden="true">
                        <Icone size={18} />
                      </span>
                      <span className="sino-texto">
                        <strong>{item.usuarioNome}</strong>
                        <span>{item.resumo}</span>
                        <small>
                          {haQuanto(item.criadoEm, dataUpdatedAt)}
                          {novo && " · novo"}
                        </small>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          <footer className="sino-rodape">
            <Link to="/admin/solicitacoes?status=PENDENTE" onClick={() => setAberto(false)}>
              Solicitações ({data?.solicitacoes ?? 0})
            </Link>
            <Link to="/admin/duvidas?status=PENDENTE" onClick={() => setAberto(false)}>
              Dúvidas ({data?.duvidas ?? 0})
            </Link>
          </footer>
        </div>
      )}
    </div>
  );
}
