import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, BookOpen, Check, Crown, Headphones, MessageCircle, Pause, Pill, Play } from "lucide-react";
import AjudaAgora from "../components/AjudaAgora";
import { useAuth } from "../contexts/useAuth";
import { useSom } from "../contexts/useSom";
import { fraseDeHoje } from "../data/frases";
import { HUMORES, buscarHumor } from "../data/humores";
import { infoDoSom } from "../data/sonsNatureza";
import { useDiarios } from "../hooks/useDiarios";
import { useHabitosDoDia } from "../hooks/useHabitos";
import { useMedicamentos } from "../hooks/useMedicamentos";
import { formatarData, hojeISO } from "../utils/data";
import "../styles/inicio.css";
import TextoRevelado from "../components/TextoRevelado";

function saudacaoDoDia(hora: number) {
  if (hora < 5) return "Boa noite";
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

// barrinhas do "equalizador" do bloco de som (alturas fixas, em %)
const ALTURAS_ONDA = [38, 62, 45, 80, 56, 30, 70, 92, 60, 42, 76, 50, 34, 66, 88, 54, 40, 72, 58, 30, 64, 84, 48, 36];

function resumir(texto: string, max = 110) {
  return texto.length > max ? `${texto.slice(0, max).trimEnd()}…` : texto;
}

// Tela inicial do paciente: um painel de boas-vindas (com o check-in de humor)
// e, abaixo, o dia em blocos de tamanhos diferentes, do mais importante ao complementar.
export default function InicioPage() {
  const navigate = useNavigate();
  const { usuario, pode } = useAuth();
  const som = useSom();
  const agora = new Date();
  const primeiroNome = usuario?.nome.trim().split(" ")[0] ?? "";
  const dataExtenso = agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const temMedicamentos = pode("MEDICAMENTOS");
  const temDuvidas = pode("DUVIDAS");
  const gratuito = usuario?.planoEfetivo.tipo === "GRATUITO";

  const habitos = useHabitosDoDia(hojeISO());
  const diarios = useDiarios(0);
  const medicamentos = useMedicamentos(0, temMedicamentos);

  const ultimo = diarios.data?.conteudo[0] ?? null;
  const humorUltimo = buscarHumor(ultimo?.humor ?? null);

  const feitos = habitos.data?.concluidos ?? 0;
  const total = habitos.data?.total ?? 0;
  const pct = total > 0 ? feitos / total : 0;
  const pendentes = (habitos.data?.habitos ?? []).filter((h) => !h.concluido).slice(0, 3);

  // próximo horário de hoje (a lista vem em ordem de horário); se já passou de todos, o primeiro de amanhã
  const horaAgora = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
  const listaMed = medicamentos.data?.conteudo ?? [];
  const proximoMed = listaMed.find((m) => m.horas >= horaAgora) ?? listaMed[0] ?? null;
  const medAmanha = proximoMed !== null && proximoMed.horas < horaAgora;

  const tocando = som.estado === "tocando";
  const somAtivo = tocando || som.estado === "pausado";
  const nomeSom = infoDoSom(som.somId).nome;

  return (
    <section className="inicio">
      {/* ---------- Painel de boas-vindas ---------- */}
      <header className="inicio-hero">
        {/* "aura" que respira devagar: decorativa */}
        <span className="inicio-aura" aria-hidden="true">
          <span />
          <span />
        </span>
        <p className="inicio-hero-data">{dataExtenso}</p>
        <h1>
          <TextoRevelado texto={`${saudacaoDoDia(agora.getHours())}${primeiroNome ? `, ${primeiroNome}` : ""}`} />
        </h1>
        <p className="inicio-hero-frase">“{fraseDeHoje(agora)}”</p>

        <div className="inicio-checkin" role="group" aria-labelledby="inicio-checkin-titulo">
          <p id="inicio-checkin-titulo" className="inicio-checkin-titulo">
            Como você está agora?
          </p>
          <div className="inicio-humores">
            {HUMORES.map((h) => (
              <button
                key={h.valor}
                type="button"
                className="inicio-humor"
                style={{ "--cor-humor": h.cor } as CSSProperties}
                onClick={() => navigate(`/diario?humor=${h.valor}`)}
              >
                <span className="inicio-humor-bolinha" aria-hidden="true" />
                {h.rotulo}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ---------- O dia em blocos ---------- */}
      <div className="bento">
        {/* Hábitos: o bloco principal do dia */}
        <Link to="/habitos" className="bloco bloco-habitos">
          <span className="bloco-rotulo">Hábitos de hoje</span>
          <div className="habitos-resumo">
            <span className="inicio-anel" style={{ "--pct": pct } as CSSProperties} aria-hidden="true">
              <span>{Math.round(pct * 100)}%</span>
            </span>
            <div>
              <strong className="bloco-numero">
                {feitos}
                <small> de {total || "–"}</small>
              </strong>
              <span className="bloco-texto">
                {habitos.isPending
                  ? "Carregando…"
                  : total > 0 && feitos === total
                    ? "Todos os cuidados feitos. Orgulhe-se!"
                    : feitos > 0
                      ? "Bom começo. Continue no seu ritmo."
                      : "Que tal marcar o primeiro cuidado?"}
              </span>
            </div>
          </div>
          {pendentes.length > 0 && (
            <ul className="habitos-pendentes">
              {pendentes.map((h) => (
                <li key={h.habito}>
                  <span className="habito-marca" aria-hidden="true" />
                  {h.texto}
                </li>
              ))}
            </ul>
          )}
          {total > 0 && feitos === total && (
            <p className="habitos-completo">
              <Check size={16} aria-hidden="true" /> Dia completo
            </p>
          )}
          <span className="bloco-acao">
            Abrir hábitos <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>

        {/* Som: bloco escuro, imersivo, com play direto */}
        <div className={`bloco bloco-som ${tocando ? "tocando" : ""}`}>
          <span className="bloco-rotulo">
            <Headphones size={16} aria-hidden="true" /> Momento de paz
          </span>
          <div className="som-ondas" aria-hidden="true">
            {ALTURAS_ONDA.map((h, i) => (
              <span key={i} style={{ "--i": i, height: `${h}%` } as CSSProperties} />
            ))}
          </div>
          <div className="som-linha">
            <button
              type="button"
              className="som-play"
              onClick={() => void som.alternar()}
              disabled={!som.suportado || som.iniciando}
              aria-label={tocando ? `Pausar ${nomeSom}` : `Tocar ${nomeSom}`}
            >
              {tocando ? <Pause size={22} aria-hidden="true" /> : <Play size={22} aria-hidden="true" />}
            </button>
            <div>
              <strong className="som-nome">{nomeSom}</strong>
              <span className="som-estado">{tocando ? "Tocando agora" : somAtivo ? "Pausado" : "Toque para começar"}</span>
            </div>
          </div>
          <Link to="/meditacao" className="bloco-acao">
            Todos os sons <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        {/* Diário */}
        <Link to="/diario" className="bloco bloco-diario">
          <span className="bloco-rotulo">
            <BookOpen size={16} aria-hidden="true" /> Diário
          </span>
          {ultimo ? (
            <>
              <p className="diario-trecho">{resumir(ultimo.texto)}</p>
              <span className="bloco-texto diario-meta">
                {humorUltimo && (
                  <span className="inicio-humor-selo" style={{ "--cor-humor": humorUltimo.cor } as CSSProperties}>
                    {humorUltimo.rotulo}
                  </span>
                )}
                {formatarData(ultimo.criadoEm)}
              </span>
            </>
          ) : (
            <p className="bloco-texto">
              {diarios.isPending ? "Carregando…" : "Escrever ajuda a entender o que você sente. Comece quando quiser."}
            </p>
          )}
          <span className="bloco-acao">
            Escrever <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>

        {temMedicamentos && (
          <Link to="/medicamentos" className="bloco bloco-med">
            <span className="bloco-rotulo">
              <Pill size={16} aria-hidden="true" /> Próximo remédio
            </span>
            {proximoMed ? (
              <>
                <strong className="med-hora-grande">
                  {proximoMed.horas}
                  {medAmanha && <small> amanhã</small>}
                </strong>
                <span className="bloco-texto">
                  {proximoMed.nome} · {proximoMed.dosagem}
                </span>
              </>
            ) : (
              <p className="bloco-texto">
                {medicamentos.isPending ? "Carregando…" : "Cadastre seus remédios para lembrar dos horários."}
              </p>
            )}
            <span className="bloco-acao">
              Ver lista <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        )}

        {temDuvidas && (
          <Link to="/duvidas" className="bloco bloco-enfermeiro">
            <span className="bloco-rotulo">
              <MessageCircle size={16} aria-hidden="true" /> Seu enfermeiro
            </span>
            <p className="bloco-destaque">Tem alguma dúvida?</p>
            <span className="bloco-texto">Envie por aqui, com foto ou documento se precisar.</span>
            <span className="bloco-acao">
              Enviar dúvida <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </Link>
        )}

        {gratuito && (
          <Link to="/planos" className="bloco bloco-premium">
            <span className="bloco-rotulo">
              <Crown size={16} aria-hidden="true" /> Premium
            </span>
            <p className="bloco-destaque">Mais cuidado, no seu ritmo.</p>
            <span className="bloco-texto">Todos os sons, seus remédios organizados e contato direto com o enfermeiro.</span>
            <span className="bloco-acao">
              Conhecer os planos <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        )}
      </div>

      <AjudaAgora variante="cartao" className="inicio-ajuda" />
    </section>
  );
}
