import { useState } from "react";
import "../styles/medicamentos.css";
import MedicamentoCard from "../components/MedicamentoCard";
import MedicamentoForm from "../components/MedicamentoForm";
import ConfirmarExclusaoMedicamento from "../components/ConfirmarExclusaoMedicamento";
import { useMedicamentos } from "../hooks/useMedicamentos";
import { getErrorMessage } from "../services/apiError";
import type { Medicamento } from "../types/medicamento";
import CabecalhoPagina from "../components/CabecalhoPagina";
import EstadoVazio from "../components/EstadoVazio";

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

  return (
    <section className="med-pagina">
      <CabecalhoPagina
        sobretitulo="Rotina de cuidado"
        titulo="Meus medicamentos"
        subtitulo="Anote o que você precisa tomar e a que horas, para não esquecer."
        ilustracao="capsula"
        acao={
          <button type="button" className="btn-principal med-novo" onClick={abrirNovo}>
            + Adicionar
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
          <ul className="med-lista" aria-busy={isFetching}>
            {data.conteudo.map((medicamento) => (
              <MedicamentoCard
                key={medicamento.id}
                medicamento={medicamento}
                onEditar={abrirEdicao}
                onExcluir={setExcluindo}
              />
            ))}
          </ul>
        </>
      )}

      {data && data.totalPaginas > 1 && (
        <nav className="med-paginacao" aria-label="Páginas de medicações">
          <button
            type="button"
            className="btn-contorno"
            onClick={() => setPagina(pagina - 1)}
            disabled={pagina === 0}
          >
            Anterior
          </button>
          <span>
            Página {data.pagina + 1} de {data.totalPaginas}
          </span>
          <button
            type="button"
            className="btn-contorno"
            onClick={() => setPagina(pagina + 1)}
            disabled={pagina + 1 >= data.totalPaginas}
          >
            Próxima
          </button>
        </nav>
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
