import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { loginSchema, type LoginFormData } from "../schemas/authSchemas";
import { getErrorMessage } from "../services/apiError";
import { useAuth } from "../contexts/useAuth";
import { useTransicao } from "../contexts/useTransicao";
import GoogleButton, { type AvisoEntrada } from "./GoogleButton";
import CampoAuth from "./CampoAuth";

export default function FormLogin() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const { comTransicao } = useTransicao();
  const [erroApi, setErroApi] = useState<string | null>(null);
  // veio redirecionado do cadastro ("você já tem conta")
  const chegada = useLocation().state as AvisoEntrada | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: chegada?.email ?? "", senha: "" },
  });

  async function onSubmit(dados: LoginFormData) {
    setErroApi(null);
    try {
      await entrar(dados);
      await comTransicao("Preparando o seu espaço…", () => navigate("/"), "Bem-vindo de volta!");
    } catch (error) {
      setErroApi(getErrorMessage(error));
    }
  }

  return (
    <form className="entrada-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <header className="entrada-form-topo">
        <h1>Que bom te ver de novo</h1>
        <p>Entre para continuar cuidando de você.</p>
      </header>

      {chegada?.aviso && (
        <p className="entrada-aviso" role="status">
          {chegada.aviso}
        </p>
      )}

      <GoogleButton intencao="ENTRAR" onErro={setErroApi} />
      <div className="entrada-divisor">
        <span>ou com seu e-mail</span>
      </div>

      <CampoAuth
        id="login-email"
        rotulo="E-mail"
        Icone={Mail}
        tipo="email"
        autoComplete="email"
        inputMode="email"
        erro={errors.email?.message}
        registro={register("email")}
      />
      <CampoAuth
        id="login-senha"
        rotulo="Senha"
        Icone={Lock}
        tipo="password"
        autoComplete="current-password"
        erro={errors.senha?.message}
        registro={register("senha")}
      />

      {erroApi && (
        <p className="entrada-erro-api" role="alert">
          {erroApi}
        </p>
      )}

      <button type="submit" className="entrada-enviar" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <span className="entrada-girando" aria-hidden="true" /> Entrando…
          </>
        ) : (
          <>
            Entrar <ArrowRight size={18} aria-hidden="true" />
          </>
        )}
      </button>

      <p className="entrada-troca">
        Ainda não tem conta? <Link to="/cadastro">Crie a sua, é grátis</Link>
      </p>
    </form>
  );
}
