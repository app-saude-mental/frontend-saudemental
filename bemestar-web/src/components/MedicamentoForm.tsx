import { useEffect, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicamentoSchema, type MedicamentoFormData } from "../schemas/medicamentoSchemas";
import { useSalvarMedicamento } from "../hooks/useMedicamentos";
import { getErrorMessage } from "../services/apiError";
import type { Medicamento } from "../types/medicamento";
import SeletorHorario from "./SeletorHorario";

interface Props {
  aberto: boolean;
  medicamento: Medicamento | null; // null = nova medicação
  onFechar: () => void;
}

const VAZIO: MedicamentoFormData = { nome: "", dosagem: "", horas: "" };

export default function MedicamentoForm({ aberto, medicamento, onFechar }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const { mutateAsync, isPending, error, reset: limparErroApi } = useSalvarMedicamento();
  const editando = medicamento !== null;

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MedicamentoFormData>({
    resolver: zodResolver(medicamentoSchema),
    defaultValues: VAZIO,
  });

  // sincroniza o estado do React com o <dialog> nativo
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (aberto && !dialog.open) {
      reset(
        medicamento
          ? { nome: medicamento.nome, dosagem: medicamento.dosagem, horas: medicamento.horas }
          : VAZIO,
      );
      limparErroApi();
      dialog.showModal();
    } else if (!aberto && dialog.open) {
      dialog.close();
    }
  }, [aberto, medicamento, reset, limparErroApi]);

  async function aoEnviar(dados: MedicamentoFormData) {
    try {
      await mutateAsync({ id: medicamento?.id, dados });
      onFechar();
    } catch {
      // a mensagem do back aparece abaixo, em `error`
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="med-modal"
      aria-labelledby="med-form-titulo"
      onClose={onFechar}
      onClick={(e) => {
        // clique no fundo escurecido fecha
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <form className="med-form" onSubmit={handleSubmit(aoEnviar)} noValidate>
        <h2 id="med-form-titulo">{editando ? "Editar medicação" : "Nova medicação"}</h2>

        <div className="med-campo">
          <label htmlFor="med-nome">Nome</label>
          <input
            id="med-nome"
            type="text"
            autoComplete="off"
            placeholder="Ex.: Losartana"
            aria-invalid={errors.nome ? true : undefined}
            {...register("nome")}
          />
          {errors.nome && (
            <p className="med-erro" role="alert">
              {errors.nome.message}
            </p>
          )}
        </div>

        <div className="med-campo">
          <label htmlFor="med-dosagem">Dosagem</label>
          <input
            id="med-dosagem"
            type="text"
            autoComplete="off"
            placeholder="Ex.: 1 comprimido de 50 mg"
            aria-invalid={errors.dosagem ? true : undefined}
            {...register("dosagem")}
          />
          {errors.dosagem && (
            <p className="med-erro" role="alert">
              {errors.dosagem.message}
            </p>
          )}
        </div>

        <div className="med-campo">
          <label id="med-horas-rotulo" htmlFor="med-horas">
            Horário
          </label>
          <Controller
            name="horas"
            control={control}
            render={({ field }) => (
              <SeletorHorario
                id="med-horas"
                value={field.value}
                onChange={field.onChange}
                invalido={!!errors.horas}
              />
            )}
          />
          {errors.horas && (
            <p className="med-erro" role="alert">
              {errors.horas.message}
            </p>
          )}
        </div>

        {error && (
          <p className="med-erro-api" role="alert">
            {getErrorMessage(error)}
          </p>
        )}

        <div className="med-acoes">
          <button type="button" className="btn-contorno" onClick={onFechar}>
            Cancelar
          </button>
          <button type="submit" className="btn-principal" disabled={isPending}>
            {isPending ? "Salvando..." : editando ? "Salvar alterações" : "Adicionar"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
