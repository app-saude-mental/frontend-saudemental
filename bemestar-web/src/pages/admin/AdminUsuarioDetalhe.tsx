import { useState } from "react";
import AnexosLista from "../../components/AnexosLista";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Minus } from "lucide-react";
import AcoesPlano from "../../components/admin/AcoesPlano";
import OrientacaoForm from "../../components/admin/OrientacaoForm";
import Paginacao from "../../components/admin/Paginacao";
import RespostaDuvidaForm from "../../components/admin/RespostaDuvidaForm";
import ModalExclusao from "../../components/ModalExclusao";
import {
  useAdminUsuario,
  useDuvidasDoUsuario,
  useExcluirOrientacao,
  useExcluirUsuario,
  useHabitosSemana,
  useHistoricoPlano,
  useMedicamentosDoUsuario,
  useOrientacoes,
} from "../../hooks/useAdmin";
import { getErrorMessage } from "../../services/apiError";
import type { AdminUsuarioDetalhe, TipoEventoPlano } from "../../types/admin";
import type { Dica } from "../../types/dica";
import { formatarData, formatarDataHora, hojeISO } from "../../utils/data";
import { ROTULO_STATUS, nomeDoPlano, textoVigencia } from "../../utils/plano";
import { usePaginaLocal } from "../../hooks/usePaginaLocal";

const ROTULO_EVENTO: Record<TipoEventoPlano, string> = {
  ATIVACAO: "Ativação",
  RENOVACAO: "Renovação",
  SUSPENSAO: "Suspensão",
  REATIVACAO: "Reativação",
  CANCELAMENTO: "Cancelamento",
  EXPIRACAO: "Expiração",
};

function Estado({ carregando, erro, aoTentar }: { carregando: boolean; erro: unknown; aoTentar: () => void }) {
  if (carregando) return <p className="adm-estado" role="status">Carregando...</p>;
  if (!erro) return null;
  return (
    <div className="adm-estado" role="alert">
      <p>{getErrorMessage(erro)}</p>
      <button type="button" className="btn-secundario" onClick={aoTentar}>
        Tentar de novo
      </button>
    </div>
  );
}

// ---------- Histórico do plano ----------
function Historico({ usuarioId }: { usuarioId: number }) {
  const [pagina, setPagina] = useState(0);
  const { data, isPending, error, refetch } = useHistoricoPlano(usuarioId, pagina);
  return (
    <section className="adm-cartao" aria-labelledby="adm-historico">
      <h2 id="adm-historico">Histórico do plano</h2>
      <Estado carregando={isPending} erro={error} aoTentar={refetch} />
      {data && data.conteudo.length === 0 && <p className="adm-vazio">Nenhuma mudança de plano registrada.</p>}
      {data && data.conteudo.length > 0 && (
        <ul className="adm-lista">
          {data.conteudo.map((e) => (
            <li key={e.id}>
              <strong>{ROTULO_EVENTO[e.tipo]}</strong> · {formatarDataHora(e.criadoEm)}
              <span className="adm-sub">
                {e.perfilAnterior ?? "—"} → {e.perfilNovo ?? "—"}
                {e.venceEmNovo && ` · vence em ${formatarData(e.venceEmNovo)}`}
                {` · ${e.adminNome ?? "automático"}`}
              </span>
              {e.observacao && <span className="adm-sub">“{e.observacao}”</span>}
            </li>
          ))}
        </ul>
      )}
      {data && <Paginacao pagina={data.pagina} totalPaginas={data.totalPaginas} onMudar={setPagina} rotulo="Histórico" />}
    </section>
  );
}

// "2026-11-26" + n dias, sem passar por fuso (data local)
function somarDias(iso: string, dias: number) {
  const [a, m, d] = iso.split("-").map(Number);
  const data = new Date(a, m - 1, d + dias);
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

// ---------- Hábitos: 7 dias até a data escolhida ----------
function Habitos({ usuarioId }: { usuarioId: number }) {
  const [ate, setAte] = useState(hojeISO());
  const { data, isPending, error, refetch } = useHabitosSemana(usuarioId, ate);
  return (
    <section className="adm-cartao" aria-labelledby="adm-habitos">
      <h2 id="adm-habitos">Hábitos</h2>
      {/* navegação por semana (7 dias até a data escolhida) */}
      <div className="adm-semana">
        <button
          type="button"
          className="paginacao-seta"
          onClick={() => setAte(somarDias(ate, -7))}
          aria-label="Semana anterior"
        >
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="paginacao-seta-texto">Semana anterior</span>
        </button>
        <label className="adm-campo adm-data">
          <span>7 dias até</span>
          <input type="date" value={ate} max={hojeISO()} onChange={(e) => e.target.value && setAte(e.target.value)} />
        </label>
        <button
          type="button"
          className="paginacao-seta"
          onClick={() => setAte(somarDias(ate, 7) > hojeISO() ? hojeISO() : somarDias(ate, 7))}
          disabled={ate >= hojeISO()}
          aria-label="Próxima semana"
        >
          <span className="paginacao-seta-texto">Próxima</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      <Estado carregando={isPending} erro={error} aoTentar={refetch} />
      {data && data.length > 0 && (
        <div className="adm-rolagem">
          <table className="adm-habitos">
            <caption className="sr-only">Hábitos marcados por dia</caption>
            <thead>
              <tr>
                <th scope="col">Hábito</th>
                {data.map((dia) => (
                  <th key={dia.data} scope="col">
                    {formatarData(dia.data).slice(0, 5)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data[0].habitos.map((h, i) => (
                <tr key={h.habito}>
                  <th scope="row">{h.texto}</th>
                  {data.map((dia) => (
                    <td key={dia.data}>
                      {dia.habitos[i]?.concluido ? (
                        <Check size={16} className="feito" aria-label="feito" />
                      ) : (
                        <Minus size={16} className="nao-feito" aria-label="não feito" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="adm-habitos-total">
                <th scope="row">Total</th>
                {data.map((dia) => (
                  <td key={dia.data}>
                    {dia.concluidos}/{dia.total}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

// ---------- Medicamentos (somente leitura) ----------
function Medicamentos({ usuarioId }: { usuarioId: number }) {
  const [pagina, setPagina] = useState(0);
  const { data, isPending, error, refetch } = useMedicamentosDoUsuario(usuarioId, pagina);
  return (
    <section className="adm-cartao" aria-labelledby="adm-medicamentos">
      <h2 id="adm-medicamentos">Medicamentos</h2>
      <Estado carregando={isPending} erro={error} aoTentar={refetch} />
      {data && data.conteudo.length === 0 && <p className="adm-vazio">Nenhum medicamento cadastrado.</p>}
      {data && data.conteudo.length > 0 && (
        <ul className="adm-lista">
          {data.conteudo.map((m) => (
            <li key={m.id}>
              <strong>{m.horas}</strong> · {m.nome} <span className="adm-sub">{m.dosagem}</span>
            </li>
          ))}
        </ul>
      )}
      {data && <Paginacao pagina={data.pagina} totalPaginas={data.totalPaginas} onMudar={setPagina} rotulo="Medicamentos" />}
    </section>
  );
}

// ---------- Dúvidas do usuário, com resposta ----------
function Duvidas({ usuarioId }: { usuarioId: number }) {
  const [pagina, setPagina] = useState(0);
  const { data, isPending, error, refetch } = useDuvidasDoUsuario(usuarioId, pagina);
  return (
    <section className="adm-cartao" aria-labelledby="adm-duvidas-usuario">
      <h2 id="adm-duvidas-usuario">Dúvidas</h2>
      <Estado carregando={isPending} erro={error} aoTentar={refetch} />
      {data && data.conteudo.length === 0 && <p className="adm-vazio">Nenhuma dúvida enviada.</p>}
      {data && data.conteudo.length > 0 && (
        <ul className="adm-lista">
          {data.conteudo.map((d) => (
            <li key={d.id}>
              <span className="adm-sub">{formatarDataHora(d.criadoEm)}</span>
              <p className="adm-mensagem">{d.mensagem}</p>
              <AnexosLista anexos={d.anexos ?? []} comoAdmin />
              <RespostaDuvidaForm key={`${d.id}-${d.resposta ?? ""}`} duvidaId={d.id} respostaAtual={d.resposta} />
            </li>
          ))}
        </ul>
      )}
      {data && <Paginacao pagina={data.pagina} totalPaginas={data.totalPaginas} onMudar={setPagina} rotulo="Dúvidas" />}
    </section>
  );
}

// ---------- Orientações do enfermeiro ----------
function Orientacoes({ usuario }: { usuario: AdminUsuarioDetalhe }) {
  const { data, isPending, error, refetch } = useOrientacoes(usuario.id);
  const excluir = useExcluirOrientacao(usuario.id);
  const [editando, setEditando] = useState<Dica | null>(null);
  const [alvo, setAlvo] = useState<Dica | null>(null);
  const ehPaciente = usuario.planoEfetivo.tipo === "PACIENTE";
  const paginas = usePaginaLocal(data, 5);

  return (
    <section className="adm-cartao" aria-labelledby="adm-orientacoes">
      <h2 id="adm-orientacoes">Orientações do enfermeiro</h2>
      {!ehPaciente && (
        <p className="aviso alerta adm-aviso">
          Este usuário não está no Premium Paciente: as orientações ficam guardadas e só aparecem para ele
          quando tiver o plano.
        </p>
      )}

      <OrientacaoForm
        key={editando?.id ?? "nova"}
        usuarioId={usuario.id}
        editando={editando}
        onConcluir={() => setEditando(null)}
      />

      <Estado carregando={isPending} erro={error} aoTentar={refetch} />
      {data && data.length === 0 && <p className="adm-vazio">Nenhuma orientação enviada.</p>}
      {data && data.length > 0 && (
        <ul className="adm-lista">
          {paginas.itens.map((d) => (
            <li key={d.id}>
              <strong>{d.titulo}</strong>
              <p className="adm-mensagem">{d.texto}</p>
              <div className="adm-linha-acoes">
                <button type="button" className="adm-acao" onClick={() => setEditando(d)}>
                  Editar
                </button>
                <button type="button" className="adm-acao perigo" onClick={() => setAlvo(d)}>
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Paginacao
        pagina={paginas.pagina}
        totalPaginas={paginas.totalPaginas}
        onMudar={paginas.setPagina}
        rotulo="Orientações"
        totalItens={paginas.total}
        nomeItem={["orientação", "orientações"]}
      />

      <ModalExclusao
        aberto={alvo !== null}
        titulo="Excluir esta orientação?"
        mensagem="Ela deixa de aparecer para o usuário. Essa ação não pode ser desfeita."
        rotuloConfirmar="Excluir"
        rotuloCarregando="Excluindo..."
        carregando={excluir.isPending}
        onConfirmar={() => {
          if (!alvo) return;
          excluir.mutate(alvo.id, {
            onSettled: () => {
              if (editando?.id === alvo.id) setEditando(null);
              setAlvo(null);
            },
          });
        }}
        onCancelar={() => setAlvo(null)}
      >
        {alvo && <p className="modal-trecho">“{alvo.titulo}”</p>}
      </ModalExclusao>
    </section>
  );
}

// ---------- Excluir a conta do usuário ----------
function ExcluirConta({ usuario }: { usuario: AdminUsuarioDetalhe }) {
  const navigate = useNavigate();
  const excluir = useExcluirUsuario();
  const [aberto, setAberto] = useState(false);
  const [ciente, setCiente] = useState(false);

  if (usuario.perfil === "ADMIN") return null; // administradores não são excluídos pelo painel

  return (
    <section className="adm-cartao adm-perigo" aria-labelledby="adm-excluir">
      <h2 id="adm-excluir">Excluir conta</h2>
      <p>
        Apaga a conta de {usuario.nome} e todos os dados dela: diário, hábitos, medicamentos, dúvidas, orientações,
        histórico de plano e solicitações. Não pode ser desfeito.
      </p>
      {excluir.isError && (
        <p className="erro-api" role="alert">
          {getErrorMessage(excluir.error)}
        </p>
      )}
      <button
        type="button"
        className="adm-acao perigo"
        onClick={() => {
          excluir.reset();
          setCiente(false);
          setAberto(true);
        }}
      >
        Excluir conta
      </button>

      <ModalExclusao
        aberto={aberto}
        titulo={`Excluir a conta de ${usuario.nome}?`}
        mensagem="Todos os dados desta pessoa serão apagados definitivamente."
        rotuloConfirmar="Excluir conta"
        rotuloCarregando="Excluindo..."
        carregando={excluir.isPending}
        confirmarDesabilitado={!ciente}
        onConfirmar={() =>
          excluir.mutate(usuario.id, {
            onSuccess: () => navigate("/admin/usuarios", { replace: true }),
            onSettled: () => setAberto(false),
          })
        }
        onCancelar={() => setAberto(false)}
      >
        <label className="adm-check adm-ciente">
          <input type="checkbox" checked={ciente} onChange={(e) => setCiente(e.target.checked)} />
          Entendo que esta ação não pode ser desfeita.
        </label>
      </ModalExclusao>
    </section>
  );
}

export default function AdminUsuarioDetalhe() {
  const { id } = useParams();
  const usuarioId = Number(id);
  const { data, isPending, error, refetch } = useAdminUsuario(usuarioId);

  return (
    <>
      <Link to="/admin/usuarios" className="adm-voltar">
        <ArrowLeft size={16} aria-hidden="true" /> Voltar à lista
      </Link>

      <Estado carregando={isPending} erro={error} aoTentar={refetch} />

      {data && (
        <div className="adm-detalhe">
          <section className="adm-cartao" aria-labelledby="adm-conta">
            <h2 id="adm-conta">{data.nome}</h2>
            <dl className="adm-dados">
              <div>
                <dt>E-mail</dt>
                <dd>{data.email}</dd>
              </div>
              <div>
                <dt>Cadastro</dt>
                <dd>{formatarData(data.criadoEm)}</dd>
              </div>
              <div>
                <dt>Plano</dt>
                <dd>
                  {nomeDoPlano(data.planoEfetivo)}
                  {data.planoEfetivo.status && ` · ${ROTULO_STATUS[data.planoEfetivo.status]}`}
                </dd>
              </div>
              <div>
                <dt>Vigência</dt>
                <dd>{textoVigencia(data.planoEfetivo) ?? "—"}</dd>
              </div>
              {data.solicitacaoPendente && (
                <div>
                  <dt>Solicitação</dt>
                  <dd>
                    Pediu {data.solicitacaoPendente.planoDesejado === "PACIENTE" ? "Premium Paciente" : "Premium Assinante"}{" "}
                    em {formatarDataHora(data.solicitacaoPendente.criadaEm)} ·{" "}
                    <Link to="/admin/solicitacoes?status=PENDENTE">ver solicitações</Link>
                  </dd>
                </div>
              )}
            </dl>
            <AcoesPlano usuario={data} />
          </section>

          <Historico usuarioId={usuarioId} />
          <Habitos usuarioId={usuarioId} />
          <Medicamentos usuarioId={usuarioId} />
          <Duvidas usuarioId={usuarioId} />
          <Orientacoes usuario={data} />
          <ExcluirConta usuario={data} />
        </div>
      )}
    </>
  );
}
