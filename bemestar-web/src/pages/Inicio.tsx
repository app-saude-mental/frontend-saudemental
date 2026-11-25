import type { CSSProperties } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Crown,
  Headphones,
  ListChecks,
  MessageCircle,
  Pause,
  Pill,
  Play,
  Wind,
} from "lucide-react";
import CabecalhoPagina from "../components/CabecalhoPagina";
import AjudaAgora from "../components/AjudaAgora";
import type { NomeIlustracao } from "../components/Ilustracao";
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

function periodoDoDia(hora: number): { saudacao: string; ilustracao: NomeIlustracao } {
  if (hora < 5) return { saudacao: "Boa noite", ilustracao: "lua" };
  if (hora < 12) return { saudacao: "Bom dia", ilustracao: "amanhecer" };
  if (hora < 18) return { saudacao: "Boa tarde", ilustracao: "sol" };
  return { saudacao: "Boa noite", ilustracao: "lua" };
}

// Tela inicial do paciente: acolhe, mostra o dia e leva ao próximo cuidado em um toque.
export default function InicioPage() {
  const navigate = useNavigate();
  const { usuario, pode } = useAuth();
  const som = useSom();
  const agora = new Date();
  const { saudacao, ilustracao } = periodoDoDia(agora.getHours());
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

  // próximo horário de hoje (a lista vem em ordem de horário); se já passou de todos, o primeiro de amanhã
  const horaAgora = `${String(agora.getHours()).padStart(2, "0")}:${String(agora.getMinutes()).padStart(2, "0")}`;
  const listaMed = medicamentos.data?.conteudo ?? [];
  const proximoMed = listaMed.find((m) => m.horas >= horaAgora) ?? listaMed[0] ?? null;
  const medAmanha = proximoMed !== null && proximoMed.horas < horaAgora;

  const somAtivo = som.estado === "tocando" || som.estado === "pausado";

  return (
    <section className="inicio">
      <CabecalhoPagina
        sobretitulo={dataExtenso}
        titulo={`${saudacao}${primeiroNome ? `, ${primeiroNome}` : ""}`}
        subtitulo={fraseDeHoje(agora)}
        ilustracao={ilustracao}
      />

      {/* ---------- Check-in de humor ---------- */}
      <section className="inicio-checkin" aria-labelledby="inicio-checkin-titulo">
        <h2 id="inicio-checkin-titulo">Como você está agora?</h2>
        <p>Toque no que mais combina para registrar no seu diário.</p>
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
      </section>

      {/* ---------- Atalhos de cuidado ---------- */}
      <div className="inicio-grade">
        <Link to="/habitos" className="inicio-cartao">
          <span className="inicio-cartao-topo">
            <ListChecks size={20} aria-hidden="true" /> Hábitos de hoje
          </span>
          <span className="inicio-anel" style={{ "--pct": pct } as CSSProperties} aria-hidden="true">
            <span>
              {feitos}/{total || "–"}
            </span>
          </span>
          <span className="inicio-cartao-texto">
            {habitos.isPending
              ? "Carregando…"
              : total > 0 && feitos === total
                ? "Todos os cuidados feitos. Orgulhe-se!"
                : feitos > 0
                  ? "Bom começo! Continue no seu ritmo."
                  : "Que tal marcar o primeiro cuidado do dia?"}
          </span>
          <span className="inicio-cartao-acao">
            Ver hábitos <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>

        <Link to="/respirar" className="inicio-cartao inicio-cartao-respirar">
          <span className="inicio-cartao-topo">
            <Wind size={20} aria-hidden="true" /> Respire 1 minuto
          </span>
          <span className="inicio-bolha" aria-hidden="true" />
          <span className="inicio-cartao-texto">Uma pausa guiada para desacelerar a mente e o corpo.</span>
          <span className="inicio-cartao-acao">
            Começar <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>

        <div className="inicio-cartao inicio-cartao-som">
          <span className="inicio-cartao-topo">
            <Headphones size={20} aria-hidden="true" /> Momento de paz
          </span>
          {somAtivo ? (
            <>
              <strong className="inicio-som-nome">{infoDoSom(som.somId).nome}</strong>
              <span className="inicio-cartao-texto">{som.estado === "tocando" ? "Tocando agora" : "Pausado"}</span>
              <button type="button" className="btn-principal inicio-som-botao" onClick={() => void som.alternar()}>
                {som.estado === "tocando" ? (
                  <>
                    <Pause size={16} aria-hidden="true" /> Pausar
                  </>
                ) : (
                  <>
                    <Play size={16} aria-hidden="true" /> Continuar
                  </>
                )}
              </button>
            </>
          ) : (
            <span className="inicio-cartao-texto">
              Sons da natureza, música para dormir, foco e ruído para abafar o ambiente.
            </span>
          )}
          <Link to="/meditacao" className="inicio-cartao-acao">
            {somAtivo ? "Abrir" : "Escolher som"} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>

        <Link to="/diario" className="inicio-cartao">
          <span className="inicio-cartao-topo">
            <BookOpen size={20} aria-hidden="true" /> Seu diário
          </span>
          {ultimo ? (
            <span className="inicio-cartao-texto">
              Último registro em {formatarData(ultimo.criadoEm)}
              {humorUltimo && (
                <span className="inicio-humor-selo" style={{ "--cor-humor": humorUltimo.cor } as CSSProperties}>
                  {humorUltimo.rotulo}
                </span>
              )}
            </span>
          ) : (
            <span className="inicio-cartao-texto">
              {diarios.isPending ? "Carregando…" : "Escrever ajuda a entender o que você sente. Comece quando quiser."}
            </span>
          )}
          <span className="inicio-cartao-acao">
            Escrever <ArrowRight size={16} aria-hidden="true" />
          </span>
        </Link>

        {temMedicamentos && (
          <Link to="/medicamentos" className="inicio-cartao">
            <span className="inicio-cartao-topo">
              <Pill size={20} aria-hidden="true" /> Próximo remédio
            </span>
            {proximoMed ? (
              <>
                <strong className="inicio-med-hora">
                  {proximoMed.horas}
                  {medAmanha && <small> amanhã</small>}
                </strong>
                <span className="inicio-cartao-texto">
                  {proximoMed.nome} · {proximoMed.dosagem}
                </span>
              </>
            ) : (
              <span className="inicio-cartao-texto">
                {medicamentos.isPending ? "Carregando…" : "Cadastre seus remédios para lembrar dos horários."}
              </span>
            )}
            <span className="inicio-cartao-acao">
              Ver lista <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        )}

        {temDuvidas && (
          <Link to="/duvidas" className="inicio-cartao">
            <span className="inicio-cartao-topo">
              <MessageCircle size={20} aria-hidden="true" /> Fale com o enfermeiro
            </span>
            <span className="inicio-cartao-texto">Envie uma dúvida, com foto ou documento se precisar.</span>
            <span className="inicio-cartao-acao">
              Enviar <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        )}

        {gratuito && (
          <Link to="/planos" className="inicio-cartao inicio-cartao-premium">
            <span className="inicio-cartao-topo">
              <Crown size={20} aria-hidden="true" /> Premium
            </span>
            <span className="inicio-cartao-texto">
              Todos os sons, organização dos remédios e contato direto com o enfermeiro.
            </span>
            <span className="inicio-cartao-acao">
              Ver planos <ArrowRight size={16} aria-hidden="true" />
            </span>
          </Link>
        )}
      </div>

      <AjudaAgora variante="cartao" className="inicio-ajuda" />
    </section>
  );
}
