import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diarioSchema, type DiarioFormData } from "../schemas/diarioSchemas";
import { useSalvarDiario } from "../hooks/useDiarios";
import { getErrorMessage } from "../services/apiError";
import { HUMORES, buscarHumor } from "../data/humores";
import type { Diario } from "../types/diario";

const LIMITE_TEXTO = 5000;

interface DiarioFormProps {
  editando: Diario | null;
  onFinalizar: () => void;
}

export default function DiarioForm({ editando, onFinalizar }: DiarioFormProps) {
  const salvar = useSalvarDiario();
  const [erroApi, setErroApi] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DiarioFormData>({
    resolver: zodResolver(diarioSchema),
    defaultValues: { humor: editando?.humor ?? "BEM", texto: editando?.texto ?? "" },
  });

  const texto = useWatch({ control, name: "texto" }) ?? "";
  const humorSelecionado = buscarHumor(useWatch({ control, name: "humor" }) ?? null);

  async function onSubmit(dados: DiarioFormData) {
    setErroApi(null);
    try {
      await salvar.mutateAsync({ id: editando?.id, dados });
      reset({ humor: "BEM", texto: "" });
      onFinalizar();
    } catch (error) {
      setErroApi(getErrorMessage(error));
    }
  }

  return (
    <form
      className={`diario-form ${editando ? "editando" : ""}`}
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <fieldset className="humor-card">
        <legend className="sr-only">Como você está se sentindo</legend>
        <div className="humor-lista">
          {HUMORES.map((h) => (
            <label key={h.valor} className="humor-opcao">
              <input type="radio" value={h.valor} {...register("humor")} />
              <span className="humor-bolinha" style={{ backgroundColor: h.cor }} />
              <span className="humor-rotulo">{h.rotulo}</span>
            </label>
          ))}
        </div>
        {errors.humor && (
          <span className="erro-campo" role="alert">Selecione como você está se sentindo</span>
        )}
        <p className="humor-frase" aria-live="polite">
          {humorSelecionado?.frase}
        </p>
      </fieldset>

      <div className="texto-card">
        <label htmlFor="texto" className="texto-titulo">
          {editando ? "Editando sua entrada" : "Seu espaço para escrever"}
        </label>
        <textarea
          id="texto"
          className={`diario-textarea ${errors.texto ? "invalido" : ""}`}
          placeholder="Escreva aqui, sem pressa. Ninguém vai julgar."
          {...register("texto")}
        />
        {errors.texto && <span className="erro-campo" role="alert">{errors.texto.message}</span>}
        <div className="texto-rodape">
          <span className={`contador ${texto.length > LIMITE_TEXTO ? "estourou" : ""}`}>
            {texto.length}/{LIMITE_TEXTO}
          </span>
        </div>
      </div>

      {erroApi && <p className="erro-api" role="alert">{erroApi}</p>}

      <div className="diario-acoes">
        {editando && (
          <button type="button" className="btn-secundario" onClick={onFinalizar}>
            Cancelar
          </button>
        )}
        <button type="submit" className="btn-principal diario-salvar" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : editando ? "Salvar alterações" : "Salvar no meu diário"}
        </button>
      </div>
    </form>
  );
}