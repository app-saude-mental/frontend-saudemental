import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, User } from "lucide-react";
import { perfilSchema, type PerfilFormData } from "../schemas/perfilSchemas";
import { useAtualizarPerfil } from "../hooks/usePerfil";
import { getErrorMessage } from "../services/apiError";
import type { Usuario } from "../types/auth";

export default function FormPerfil({ usuario }: { usuario: Usuario }) {
  const atualizar = useAtualizarPerfil();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [salvo, setSalvo] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PerfilFormData>({
    resolver: zodResolver(perfilSchema),
    defaultValues: { nome: usuario.nome, email: usuario.email },
  });

  async function onSubmit(dados: PerfilFormData) {
    setErroApi(null);
    setSalvo(false);
    try {
      const novo = await atualizar.mutateAsync(dados);
      // o que foi salvo vira o novo "ponto de partida": isDirty volta a false
      reset({ nome: novo.nome, email: novo.email });
      setSalvo(true);
    } catch (error) {
      setErroApi(getErrorMessage(error));
    }
  }

  return (
    <form className="perfil-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="perfil-campo">
        <label htmlFor="perfil-nome" className="perfil-label">Nome</label>
        <div className={`campo ${errors.nome ? "invalido" : ""}`}>
          <User size={18} aria-hidden="true" />
          <input id="perfil-nome" autoComplete="name" {...register("nome")} />
        </div>
        {errors.nome && <span className="erro-campo" role="alert">{errors.nome.message}</span>}
      </div>

      <div className="perfil-campo">
        <label htmlFor="perfil-email" className="perfil-label">E-mail</label>
        <div className={`campo ${errors.email ? "invalido" : ""}`}>
          <Mail size={18} aria-hidden="true" />
          <input id="perfil-email" type="email" autoComplete="email" {...register("email")} />
        </div>
        {errors.email && <span className="erro-campo" role="alert">{errors.email.message}</span>}
      </div>

      {erroApi && <p className="erro-api" role="alert">{erroApi}</p>}
      {salvo && !isDirty && (
        <p className="perfil-sucesso" role="status">Dados atualizados com sucesso.</p>
      )}

      <div className="perfil-acoes">
        <button type="submit" className="btn-principal" disabled={!isDirty || isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </button>
        {isDirty && !isSubmitting && (
          <button type="button" className="btn-secundario" onClick={() => reset()}>
            Desfazer
          </button>
        )}
      </div>
    </form>
  );
}