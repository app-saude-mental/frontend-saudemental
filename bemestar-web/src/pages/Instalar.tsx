import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Compass,
  Download,
  EllipsisVertical,
  Globe,
  Lock,
  Maximize,
  MonitorDown,
  RefreshCw,
  Share,
  ShieldCheck,
  Smartphone,
  SquarePlus,
  Store,
} from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import { EVENTO_INSTALACAO, detectarPlataforma, estaInstalado, instalar, podeInstalar } from "../pwa/instalacao";
import "../styles/instalar.css";

type Aparelho = "android" | "iphone" | "computador";

const ABAS: { id: Aparelho; rotulo: string }[] = [
  { id: "android", rotulo: "Android" },
  { id: "iphone", rotulo: "iPhone" },
  { id: "computador", rotulo: "Computador" },
];

function aparelhoInicial(): Aparelho {
  const p = detectarPlataforma();
  if (p === "ios") return "iphone";
  if (p === "android") return "android";
  return "computador";
}

// ---------- Mini ilustrações (desenhadas em HTML/CSS, sem imagens) ----------

function BarraEndereco({ destaque }: { destaque?: "menu" | "instalar" }) {
  return (
    <div className="ilu-barra" aria-hidden="true">
      <span className="ilu-endereco">
        <Lock size={12} /> respire.app
      </span>
      {destaque === "instalar" && (
        <span className="ilu-alvo">
          <MonitorDown size={16} />
        </span>
      )}
      <span className={destaque === "menu" ? "ilu-alvo" : "ilu-icone"}>
        <EllipsisVertical size={16} />
      </span>
    </div>
  );
}

function Menu({ itens, destaque }: { itens: string[]; destaque: string }) {
  return (
    <ul className="ilu-menu" aria-hidden="true">
      {itens.map((item) => (
        <li key={item} className={item === destaque ? "ilu-menu-alvo" : ""}>
          {item === destaque && <SquarePlus size={14} />} {item}
        </li>
      ))}
    </ul>
  );
}

function Dialogo({ titulo, botao }: { titulo: string; botao: string }) {
  return (
    <div className="ilu-dialogo" aria-hidden="true">
      <span className="ilu-app">
        <img src="/icons/icon-192.png" alt="" width={28} height={28} />
        {titulo}
      </span>
      <span className="ilu-botoes">
        <span>Cancelar</span>
        <span className="ilu-alvo-texto">{botao}</span>
      </span>
    </div>
  );
}

function BarraSafari() {
  return (
    <div className="ilu-barra ilu-safari" aria-hidden="true">
      <span className="ilu-icone">‹</span>
      <span className="ilu-icone">›</span>
      <span className="ilu-alvo">
        <Share size={16} />
      </span>
      <span className="ilu-icone">⧉</span>
    </div>
  );
}

interface Passo {
  titulo: string;
  texto: ReactNode;
  ilustracao?: ReactNode;
}

const PASSOS: Record<Aparelho, Passo[]> = {
  android: [
    {
      titulo: "Abra o Respire no Chrome",
      texto: "Use o navegador Chrome, no mesmo endereço que você está vendo agora.",
      ilustracao: <BarraEndereco />,
    },
    {
      titulo: "Toque nos três pontinhos ⋮",
      texto: "Eles ficam no canto de cima, do lado direito do endereço.",
      ilustracao: <BarraEndereco destaque="menu" />,
    },
    {
      titulo: "Toque em “Instalar app”",
      texto: "Em alguns celulares o nome é “Adicionar à tela inicial”.",
      ilustracao: <Menu itens={["Nova guia", "Favoritos", "Instalar app", "Configurações"]} destaque="Instalar app" />,
    },
    {
      titulo: "Confirme em “Instalar”",
      texto: "Pronto! O ícone do Respire aparece na tela inicial do celular.",
      ilustracao: <Dialogo titulo="Instalar app?" botao="Instalar" />,
    },
  ],
  iphone: [
    {
      titulo: "Abra o Respire no Safari",
      texto: (
        <>
          O Safari é o navegador com o ícone de bússola <Compass size={14} aria-hidden="true" />. No iOS 16.4 ou mais novo,
          o Chrome e o Edge também funcionam.
        </>
      ),
    },
    {
      titulo: "Toque no botão Compartilhar",
      texto: "É o quadradinho com uma seta para cima. Fica na barra de baixo da tela (no iPad, em cima).",
      ilustracao: <BarraSafari />,
    },
    {
      titulo: "Toque em “Adicionar à Tela de Início”",
      texto: "Se não aparecer de primeira, role a lista para baixo.",
      ilustracao: (
        <Menu
          itens={["Copiar", "Adicionar aos Favoritos", "Adicionar à Tela de Início", "Imprimir"]}
          destaque="Adicionar à Tela de Início"
        />
      ),
    },
    {
      titulo: "Toque em “Adicionar”",
      texto: "O botão fica no canto de cima, à direita. O ícone do Respire aparece na tela inicial.",
      ilustracao: <Dialogo titulo="Respire" botao="Adicionar" />,
    },
  ],
  computador: [
    {
      titulo: "Abra o Respire no Chrome ou no Edge",
      texto: "Os dois navegadores permitem instalar. No Firefox e no Safari do Mac não aparece a opção.",
      ilustracao: <BarraEndereco />,
    },
    {
      titulo: "Clique no ícone de instalar",
      texto: "É um monitor com uma setinha, no fim da barra de endereço.",
      ilustracao: <BarraEndereco destaque="instalar" />,
    },
    {
      titulo: "Clique em “Instalar”",
      texto: "Se não achar o ícone: no Edge, menu … > Aplicativos > Instalar este site como aplicativo; no Chrome, menu ⋮ > Transmitir, salvar e compartilhar > Instalar página como app.",
      ilustracao: <Dialogo titulo="Instalar o Respire?" botao="Instalar" />,
    },
    {
      titulo: "Pronto!",
      texto: "O Respire abre numa janela própria e fica no menu Iniciar e na área de trabalho.",
    },
  ],
};

const PERGUNTAS: { pergunta: string; resposta: ReactNode }[] = [
  {
    pergunta: "É seguro?",
    resposta:
      "Sim. É o mesmo Respire que você usa no navegador, no mesmo endereço. O app instalado guarda só as telas; seus registros continuam protegidos no servidor e pedem login.",
  },
  {
    pergunta: "Ocupa espaço no celular? Precisa de loja?",
    resposta: "Quase nada (menos de 1 MB) e não precisa da Play Store nem da App Store.",
  },
  {
    pergunta: "Precisa de internet?",
    resposta: "Sim, para ver e salvar seus dados. Sem internet o app abre, mas avisa que não consegue carregar.",
  },
  {
    pergunta: "Como atualizar?",
    resposta: "Sozinho. Quando houver uma versão nova aparece o aviso “Nova versão disponível”: é só tocar em Atualizar.",
  },
  {
    pergunta: "A opção de instalar não aparece. E agora?",
    resposta: (
      <ul>
        <li>No iPhone, use o Safari.</li>
        <li>No Android, use o Chrome atualizado.</li>
        <li>Não funciona em aba anônima (privada).</li>
        <li>Se você já instalou, procure o ícone verde da folha na tela inicial.</li>
        <li>Tente recarregar a página e repetir os passos.</li>
      </ul>
    ),
  },
  {
    pergunta: "Como remover o app?",
    resposta: (
      <ul>
        <li>Android: segure o ícone e toque em Desinstalar.</li>
        <li>iPhone: segure o ícone e toque em Remover app.</li>
        <li>Computador: abra o Respire, clique no menu ⋯ da janela e em Desinstalar.</li>
      </ul>
    ),
  },
];

// Pública: funciona com ou sem login. Em produção, instalar exige HTTPS.
export default function Instalar() {
  const { autenticado } = useAuth();
  const [aba, setAba] = useState<Aparelho>(aparelhoInicial);
  const [instalado, setInstalado] = useState(estaInstalado);
  const [disponivel, setDisponivel] = useState(podeInstalar);
  const [mensagem, setMensagem] = useState<string | null>(null);
  const abasRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const atualizar = () => {
      setDisponivel(podeInstalar());
      setInstalado(estaInstalado());
    };
    window.addEventListener(EVENTO_INSTALACAO, atualizar);
    return () => window.removeEventListener(EVENTO_INSTALACAO, atualizar);
  }, []);

  async function aoInstalar() {
    const aceitou = await instalar();
    setMensagem(aceitou ? "Pronto! O Respire foi instalado." : "Instalação cancelada. Você pode tentar de novo quando quiser.");
  }

  // setas do teclado trocam de aba (padrão de abas acessíveis)
  function aoTeclarAba(e: KeyboardEvent<HTMLButtonElement>, indice: number) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const proximo = (indice + (e.key === "ArrowRight" ? 1 : ABAS.length - 1)) % ABAS.length;
    setAba(ABAS[proximo].id);
    abasRef.current[proximo]?.focus();
  }

  return (
    <main className="instalar-pagina">
      <section className="instalar">
        <Link to={autenticado ? "/" : "/login"} className="instalar-voltar">
          <ArrowLeft size={16} aria-hidden="true" /> {autenticado ? "Voltar ao app" : "Voltar ao login"}
        </Link>

        <header className="instalar-topo">
          <img src="/icons/icon-192.png" alt="" className="instalar-icone" width={72} height={72} />
          <h1>Instale o Respire</h1>
          <p>Leva menos de 1 minuto e não precisa de loja de aplicativos.</p>
        </header>

        {instalado && (
          <p className="instalar-ok" role="status">
            <CheckCircle2 size={22} aria-hidden="true" /> O Respire já está instalado neste aparelho.
          </p>
        )}

        <section className="instalar-cartao" aria-labelledby="instalar-oque">
          <h2 id="instalar-oque">O que é “instalar”?</h2>
          <ul className="instalar-vantagens">
            <li>
              <Smartphone size={20} aria-hidden="true" /> Um ícone do Respire na tela inicial, como qualquer aplicativo.
            </li>
            <li>
              <Maximize size={20} aria-hidden="true" /> Abre em tela cheia, sem a barra do navegador.
            </li>
            <li>
              <Store size={20} aria-hidden="true" /> Sem Play Store, sem App Store e quase sem ocupar espaço.
            </li>
            <li>
              <RefreshCw size={20} aria-hidden="true" /> Atualiza sozinho.
            </li>
            <li>
              <ShieldCheck size={20} aria-hidden="true" /> Seus registros continuam protegidos e pedem login.
            </li>
          </ul>
        </section>

        {!instalado && disponivel && (
          <section className="instalar-cartao instalar-rapido">
            <h2>Seu aparelho instala com um toque</h2>
            <button type="button" className="btn-principal instalar-botao" onClick={aoInstalar}>
              <Download size={20} aria-hidden="true" /> Instalar agora
            </button>
            <p className="instalar-nota">Ou siga o passo a passo abaixo.</p>
          </section>
        )}

        {mensagem && (
          <p className="instalar-ok" role="status">
            {mensagem}
          </p>
        )}

        {!instalado && (
          <section className="instalar-cartao" aria-labelledby="instalar-passos">
            <h2 id="instalar-passos">Passo a passo</h2>
            <p className="instalar-nota instalar-nota-topo">
              <Globe size={15} aria-hidden="true" /> Escolha o seu aparelho:
            </p>

            <div className="instalar-abas" role="tablist" aria-label="Aparelho">
              {ABAS.map((a, i) => (
                <button
                  key={a.id}
                  ref={(el) => {
                    abasRef.current[i] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`aba-${a.id}`}
                  aria-selected={aba === a.id}
                  aria-controls={`painel-${a.id}`}
                  tabIndex={aba === a.id ? 0 : -1}
                  className={`instalar-aba ${aba === a.id ? "ativa" : ""}`}
                  onClick={() => setAba(a.id)}
                  onKeyDown={(e) => aoTeclarAba(e, i)}
                >
                  {a.rotulo}
                </button>
              ))}
            </div>

            <ol className="instalar-lista" id={`painel-${aba}`} role="tabpanel" aria-labelledby={`aba-${aba}`}>
              {PASSOS[aba].map((passo, i) => (
                <li key={passo.titulo} className="instalar-passo">
                  <span className="instalar-numero" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="instalar-passo-texto">
                    <h3>{passo.titulo}</h3>
                    <p>{passo.texto}</p>
                    {passo.ilustracao}
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="instalar-cartao" aria-labelledby="instalar-certo">
          <h2 id="instalar-certo">Como saber que deu certo</h2>
          <div className="instalar-certo">
            <img src="/icons/icon-192.png" alt="Ícone do Respire: folha branca em fundo verde" width={56} height={56} />
            <p>Procure este ícone verde com uma folha na tela inicial (ou no menu Iniciar). Toque nele para abrir o Respire.</p>
          </div>
        </section>

        <section className="instalar-cartao" aria-labelledby="instalar-duvidas">
          <h2 id="instalar-duvidas">Perguntas frequentes</h2>
          <div className="instalar-faq">
            {PERGUNTAS.map((p) => (
              <details key={p.pergunta}>
                <summary>{p.pergunta}</summary>
                <div className="instalar-resposta">{p.resposta}</div>
              </details>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}
