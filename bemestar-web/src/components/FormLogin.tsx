import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { loginSchema, type LoginFormData } from "../schemas/authSchemas";
import { getErrorMessage } from "../services/apiError";
import { useAuth } from "../contexts/useAuth";
import GoogleButton from "./GoogleButton";
import { useTransicao } from "../contexts/useTransicao";

export default function FormLogin() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [erroApi, setErroApi] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const { comTransicao } = useTransicao();

async function onSubmit(dados: LoginFormData) {
  setErroApi(null);
  try {
    await entrar(dados);
    await comTransicao("Entrando no seu espaço...", () => navigate("/"));
  } catch (error) {
    setErroApi(getErrorMessage(error));
  }
}

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h1>Entrar</h1>

      <GoogleButton onErro={setErroApi} />
      <div className="divisor">ou entre com seu e-mail</div>
      <div className={`campo ${errors.email ? "invalido" : ""}`}>
        <Mail size={18} aria-hidden="true" />
        <input
          type="email"
          placeholder="E-mail"
          aria-label="E-mail"
          autoComplete="email"
          {...register("email")}
        />
      </div>
      {errors.email && <span className="erro-campo" role="alert">{errors.email.message}</span>}

      <div className={`campo ${errors.senha ? "invalido" : ""}`}>
        <Lock size={18} aria-hidden="true" />
        <input
          type="password"
          placeholder="Senha"
          aria-label="Senha"
          autoComplete="current-password"
          {...register("senha")}
        />
      </div>
      {errors.senha && <span className="erro-campo" role="alert">{errors.senha.message}</span>}

      {erroApi && <p className="erro-api" role="alert">{erroApi}</p>}

      <button type="submit" className="btn-principal" disabled={isSubmitting}>
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}