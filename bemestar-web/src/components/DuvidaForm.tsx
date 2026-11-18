import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { duvidaSchema, type DuvidaFormData } from "../schemas/duvidaSchemas";
import { useSalvarDuvida } from "../hooks/useDuvidas";
import { getErrorMessage } from "../services/apiError";
import type { Duvida } from "../types/duvida";

interface Props {
  editando: Duvida | null; // null = nova dúvida
  onConcluir: () => void; // sai do modo de edição
}

const LIMITE = 1000;

// A página usa `key` neste componente: ao trocar de dúvida em edição ele é recriado
// já com o texto certo, sem precisar sincronizar estado.
export default function DuvidaForm({ editando, onConcluir }: Props) {
  const { mutateAsync, isPending, error } = useSalvarDuvida();
  const [enviada, setEnviada] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<DuvidaFormData>({
    resolver: zodResolver(duvidaSchema),
    defaultValues: { mensagem: editando?.mensagem ?? "" },
  });

  const contador = (watch("mensagem") ?? "").length;

  async function aoEnviar(dados: DuvidaFormData) {
    setEnviada(false);
    try {
      await mutateAsync({ id: editando?.id, dados });
      if (editando) {
        onConcluir();
      } else {
        reset({ mensagem: "" });
        setEnviada(true);
      }
    } catch {
      // a mensagem do back aparece abaixo, em `error`
    }
  }

  return (
    <form className="duv-caixa" onSubmit={handleSubmit(aoEnviar)} noValidate>
      <label htmlFor="duv-mensagem" className="duv-rotulo">
        {editando ? "Editar dúvida" : "Sua dúvida para o enfermeiro"}
      </label>

      <textarea
        id="duv-mensagem"
        rows={4}
        placeholder="Escreva aqui, sem pressa."
        aria-invalid={errors.mensagem ? true : undefined}
        {...register("mensagem")}
      />

      <div className="duv-linha">
        <span className={contador > LIMITE ? "duv-contador excedido" : "duv-contador"}>
          {contador}/{LIMITE}
        </span>
      </div>

      {errors.mensagem && (
        <p className="duv-erro" role="alert">
          {errors.mensagem.message}
        </p>
      )}

      {error && (
        <p className="duv-erro-api" role="alert">
          {getErrorMessage(error)}
        </p>
      )}

      {enviada && (
        <p className="duv-ok" role="status">
          Dúvida enviada ao enfermeiro.
        </p>
      )}

      <p className="duv-aviso">
        Este espaço não é para emergências. Se precisar de ajuda agora, ligue 188 (CVV) ou 192
        (SAMU).
      </p>

      <div className="duv-acoes">
        {editando && (
          <button type="button" className="btn-contorno" onClick={onConcluir}>
            Cancelar edição
          </button>
        )}
        <button type="submit" className="btn-principal" disabled={isPending}>
          {isPending
            ? editando
              ? "Salvando..."
              : "Enviando..."
            : editando
              ? "Salvar alterações"
              : "Enviar dúvida"}
        </button>
      </div>
    </form>
  );
}
