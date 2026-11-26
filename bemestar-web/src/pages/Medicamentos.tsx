import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Moon, Plus, Sun, Sunrise } from "lucide-react";
import "../styles/medicamentos.css";
import MedicamentoCard from "../components/MedicamentoCard";
import MedicamentoForm from "../components/MedicamentoForm";
import ConfirmarExclusaoMedicamento from "../components/ConfirmarExclusaoMedicamento";
import { useMedicamentos } from "../hooks/useMedicamentos";
import { getErrorMessage } from "../services/apiError";
import type { Medicamento } from "../types/medicamento";
import CabecalhoPagina from "../components/CabecalhoPagina";
import EstadoVazio from "../components/EstadoVazio";
import Paginacao from "../components/Paginacao";

interface Periodo {
  id: "manha" | "tarde" | "noite";
  rotulo: string;
  faixa: string;
  Icone: LucideIcon;
}

const PERIODOS: Periodo[] = [
  { id: "manha", rotulo: "Manhã", faixa: "até 11:59", Icone: Sunrise },
  { id: "tarde", rotulo: "Tarde", faixa: "12:00 às 17:59", Icone: Sun },
  { id: "noite", rotulo: "Noite", faixa: "a partir das 18:00", Icone: Moon },
];

function periodoDe(horas: string): Periodo["id"] {
  if (horas < "12:00") return "manha";
  if (horas < "18:00") return "tarde";
  return "noite";
}

function horaAgora() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function MedicamentosPage() {
  const [pagina, setPagina] = useState(0);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Medicamento | null>(null);
  const [excluindo, setExcluindo] = useState<Medicamento | null>(null);

  const { data, isPending, isError, error, refetch, isFetching } = useMedicamentos(pagina);

  function abrirNovo() {
    setEditando(null);
    setFormAberto(true);
  }

  function abrirEdicao(medicamento: Medicamento) {
    setEditando(medicamento);
    setFormAberto(true);
  }

  // se a única medicação da última página foi apagada, volta uma página
  function aoExcluir() {
    if (data && data.conteudo.length === 1 && pagina > 0) {
      setPagina(pagina - 1);
    }
  }

  // próximo horário de hoje (a lista vem em ordem de horário); se já passou de todos, o primeiro
  const lista = data?.conteudo ?? [];
  const agora = horaAgora();
  const proximoId = (lista.find((m) => m.horas >= agora) ?? lista[0])?.id;

  return (
    <section className="med-pagina">
      <CabecalhoPagina
        sobretitulo="Rotina de cuidado"
        titulo="Meus medicamentos"
        subtitulo="Anote o que você precisa tomar e a que horas, para não esquecer."
        ilustracao="capsula"
        acao={
          <button type="button" className="btn-principal med-novo" onClick={abrirNovo}>
            <Plus size={18} aria-hidden="true" /> Adicionar
          </button>
        }
      />

      {isPending && (
        <p className="med-aviso" role="status">
          Carregando suas medicações...
        </p>
      )}

      {isError && (
        <div className="med-aviso med-aviso-erro" role="alert">
          <p>{getErrorMessage(error)}</p>
          <button type="button" className="btn-secundario" onClick={() => refetch()}>
            Tentar de novo
          </button>
        </div>
      )}

      {data && data.conteudo.length === 0 && (
        <EstadoVazio
          ilustracao="capsula"
          titulo="Nenhum remédio por aqui"
          texto="Cadastre o que você toma e os horários. A tela Início mostra sempre o próximo."
        >
          <button type="button" className="btn-secundario" onClick={abrirNovo}>
            Adicionar o primeiro
          </button>
        </EstadoVazio>
      )}

      {data && data.conteudo.length > 0 && (
        <>
          <p className="med-contagem">
            {data.totalElementos} {data.totalElementos === 1 ? "medicação" : "medicações"}, em
            ordem de horário
          </p>
          <div className="med-periodos" aria-busy={isFetching}>
            {PERIODOS.map(({ id, rotulo, faixa, Icone }) => {
              const doPeriodo = lista.filter((m) => periodoDe(m.horas) === id);
              return (
                <section key={id} className={`med-periodo ${id}`} aria-labelledby={`med-periodo-${id}`}>
                  <h2 id={`med-periodo-${id}`} className="med-periodo-titulo">
                    <span className="med-periodo-icone" aria-hidden="true">
                      <Icone size={16} />
                    </span>
                    {rotulo}
                    <small>{faixa}</small>
                  </h2>
                  {doPeriodo.length === 0 && <p className="med-periodo-vazio">Nada neste período.</p>}
                  <ul className="med-lista">
                    {doPeriodo.map((medicamento) => (
                      <MedicamentoCard
                        key={medicamento.id}
                        medicamento={medicamento}
                        proximo={medicamento.id === proximoId}
                        onEditar={abrirEdicao}
                        onExcluir={setExcluindo}
                      />
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </>
      )}

      {data && (
        <Paginacao
          pagina={data.pagina}
          totalPaginas={data.totalPaginas}
          onMudar={setPagina}
          rotulo="Páginas de medicações"
          totalItens={data.totalElementos}
          nomeItem={["medicação", "medicações"]}
        />
      )}

      <MedicamentoForm
        aberto={formAberto}
        medicamento={editando}
        onFechar={() => setFormAberto(false)}
      />

      <ConfirmarExclusaoMedicamento
        medicamento={excluindo}
        onFechar={() => setExcluindo(null)}
        onExcluido={aoExcluir}
      />
    </section>
  );
}
