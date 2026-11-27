import { useEffect, useRef, useState, type PointerEvent as EventoPonteiro } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Download, Headphones, HeartHandshake, LockKeyhole, ShieldCheck } from "lucide-react";
import FormLogin from "../components/FormLogin";
import FormCadastro from "../components/FormCadastro";
import Logo from "../components/Logo";
import PaisagemAcesso from "../components/PaisagemAcesso";
import AlturaSuave from "../components/AlturaSuave";
import TextoRevelado from "../components/TextoRevelado";
import { useMidia } from "../hooks/useMidia";
import "../styles/auth.css";
import "../styles/acesso.css";

type Modo = "login" | "cadastro";

const TEXTOS: Record<Modo, { titulo: string; sub: string }> = {
  login: {
    titulo: "Respire. Você chegou a um lugar calmo.",
    sub: "Seu diário, seus hábitos e seus momentos de paz esperam por você.",
  },
  cadastro: {
    titulo: "Comece devagar. Este espaço é seu.",
    sub: "Um cantinho para cuidar da mente no seu ritmo, com um enfermeiro por perto.",
  },
};

const DURACAO_SAIDA_MS = 420; // tempo do "véu" do conteúdo que sai

// Login e cadastro: paisagem ao amanhecer (noite no tema escuro).
// Notebook: chamada à esquerda e cartão à direita, tudo cabendo na tela.
// Celular: a pessoa vê a paisagem inteira com dois botões; o formulário sobe como uma folha.
export default function AuthShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const modo: Modo = location.pathname === "/cadastro" ? "cadastro" : "login";
  const celular = useMidia("(max-width: 820px)");

  // troca com véu: o conteúdo anterior continua montado por um instante, saindo
  const [ativo, setAtivo] = useState<Modo>(modo);
  const [anterior, setAnterior] = useState<Modo | null>(null);
  if (modo !== ativo) {
    setAnterior(ativo);
    setAtivo(modo);
  }
  useEffect(() => {
    if (!anterior) return;
    const id = window.setTimeout(() => setAnterior(null), DURACAO_SAIDA_MS);
    return () => window.clearTimeout(id);
  }, [anterior]);

  // celular: folha fechada mostra a paisagem; abre ao escolher, ou se veio redirecionado com aviso
  const [folhaAberta, setFolhaAberta] = useState(() => location.state != null);
  const folhaVisivel = !celular || folhaAberta;
  const cartaoRef = useRef<HTMLElement>(null);
  const arraste = useRef<{ inicioY: number; dy: number } | null>(null);

  function abrir(m: Modo) {
    if (m !== modo) navigate(m === "login" ? "/login" : "/cadastro", { replace: true });
    setFolhaAberta(true);
  }

  // arrastar a alça para baixo fecha a folha
  function aoPressionar(e: EventoPonteiro<HTMLButtonElement>) {
    arraste.current = { inicioY: e.clientY, dy: 0 };
    e.currentTarget.setPointerCapture(e.pointerId);
    cartaoRef.current?.classList.add("arrastando");
  }
  function aoMover(e: EventoPonteiro<HTMLButtonElement>) {
    const a = arraste.current;
    const cartao = cartaoRef.current;
    if (!a || !cartao) return;
    a.dy = Math.max(0, e.clientY - a.inicioY);
    cartao.style.transform = `translateY(${a.dy}px)`;
  }
  function aoSoltar() {
    const a = arraste.current;
    const cartao = cartaoRef.current;
    arraste.current = null;
    if (!cartao) return;
    cartao.classList.remove("arrastando");
    cartao.style.removeProperty("transform");
    // um toque (sem arrastar) ou arrasto longo fecham
    if (!a || a.dy < 6 || a.dy > 90) setFolhaAberta(false);
  }

  const visiveis: Modo[] = anterior ? [anterior, ativo] : [ativo];
  const ordem: Modo[] = ["login", "cadastro"].filter((m): m is Modo => visiveis.includes(m as Modo));

  return (
    <div className="acesso" data-modo={modo} data-folha={folhaVisivel ? "aberta" : "fechada"}>
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
        {/* título e subtítulo trocam com o mesmo véu do formulário */}
        <div className="acesso-chamada-troca">
          {ordem.map((m) => (
            <div key={m} className={m === ativo ? "troca-entra" : "troca-sai"} aria-hidden={m !== ativo}>
              <h2>
                <TextoRevelado texto={TEXTOS[m].titulo} atraso={anterior ? 160 : 350} />
              </h2>
              <p className="acesso-chamada-sub">{TEXTOS[m].sub}</p>
            </div>
          ))}
        </div>
        <ul className="acesso-garantias">
          <li>
            <LockKeyhole size={15} aria-hidden="true" /> Seu diário é só seu
          </li>
          <li>
            <Headphones size={15} aria-hidden="true" /> Sons para acalmar e dormir
          </li>
          <li>
            <HeartHandshake size={15} aria-hidden="true" /> Um enfermeiro por perto
          </li>
        </ul>
      </section>

      {/* celular, folha fechada: escolhas sobre a paisagem */}
      <div className="acesso-escolha" inert={folhaVisivel}>
        <button type="button" className="acesso-escolha-principal" onClick={() => abrir("cadastro")}>
          Criar conta grátis <ArrowRight size={18} aria-hidden="true" />
        </button>
        <button type="button" className="acesso-escolha-secundaria" onClick={() => abrir("login")}>
          Já tenho conta
        </button>
        <Link to="/instalar" className="acesso-escolha-instalar">
          <Download size={14} aria-hidden="true" /> Instalar o app
        </Link>
      </div>

      {/* celular: tocar fora da folha também fecha */}
      {celular && folhaAberta && (
        <button type="button" className="acesso-fundo" aria-label="Fechar" tabIndex={-1} onClick={() => setFolhaAberta(false)} />
      )}

      <main ref={cartaoRef} className="acesso-cartao" inert={!folhaVisivel}>
        {celular && (
          <button
            type="button"
            className="acesso-alca"
            aria-label="Fechar e voltar para a paisagem"
            onPointerDown={aoPressionar}
            onPointerMove={aoMover}
            onPointerUp={aoSoltar}
            onPointerCancel={aoSoltar}
          >
            <span aria-hidden="true" />
          </button>
        )}

        <nav className="acesso-abas" aria-label="Entrar ou criar conta">
          <Link to="/login" replace aria-current={modo === "login" ? "page" : undefined}>
            Entrar
          </Link>
          <Link to="/cadastro" replace aria-current={modo === "cadastro" ? "page" : undefined}>
            Criar conta
          </Link>
          <span className="acesso-abas-marca" aria-hidden="true" />
        </nav>

        {/* faixa de luz que passa pelo cartão a cada troca */}
        {anterior && <span key={ativo} className="acesso-luz" aria-hidden="true" />}

        <AlturaSuave>
          <div className="acesso-troca-area">
            {ordem.map((m) => (
              <div
                key={m}
                className={`acesso-form-area ${m === ativo ? "troca-entra" : "troca-sai"}`}
                inert={m !== ativo}
                aria-hidden={m !== ativo}
              >
                {m === "login" ? <FormLogin /> : <FormCadastro />}
              </div>
            ))}
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
