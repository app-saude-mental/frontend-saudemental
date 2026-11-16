import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import { cadastroSchema, type CadastroFormData } from "../schemas/authSchemas";
import { cadastrar } from "../services/authService";
import { getErrorMessage } from "../services/apiError";
import { useAuth } from "../contexts/useAuth";
import GoogleButton from "./GoogleButton";
import ModalTermos from "./ModalTermos";
import { useTransicao } from "../contexts/useTransicao";


export default function FormCadastro() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { aceitouTermos: false },
  });

  const { comTransicao } = useTransicao();

 async function onSubmit(dados: CadastroFormData) {
  setErroApi(null);
  try {
    await cadastrar({
      nome: dados.nome,
      email: dados.email,
      senha: dados.senha,
      aceitouTermos: dados.aceitouTermos,
    });
    await entrar({ email: dados.email, senha: dados.senha });
    await comTransicao("Conta criada! Preparando seu espaço...", () => navigate("/"));
  } catch (error) {
    setErroApi(getErrorMessage(error));
  }
}

  function aceitarPeloModal() {
    setValue("aceitouTermos", true, { shouldValidate: true });
    setModalAberto(false);
  }

  return (
    <>
      <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <h1>Criar conta</h1>

<GoogleButton onErro={setErroApi} />        <div className="divisor">ou use seu e-mail</div>

        <div className={`campo ${errors.nome ? "invalido" : ""}`}>
          <User size={18} aria-hidden="true" />
          <input placeholder="Nome" aria-label="Nome" autoComplete="name" {...register("nome")} />
        </div>
        {errors.nome && <span className="erro-campo" role="alert">{errors.nome.message}</span>}

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
            autoComplete="new-password"
            {...register("senha")}
          />
        </div>
        {errors.senha && <span className="erro-campo" role="alert">{errors.senha.message}</span>}

        <div className={`campo ${errors.confirmarSenha ? "invalido" : ""}`}>
          <Lock size={18} aria-hidden="true" />
          <input
            type="password"
            placeholder="Confirmar senha"
            aria-label="Confirmar senha"
            autoComplete="new-password"
            {...register("confirmarSenha")}
          />
        </div>
        {errors.confirmarSenha && (
          <span className="erro-campo" role="alert">{errors.confirmarSenha.message}</span>
        )}

        <div className="termos">
          <input id="aceitouTermos" type="checkbox" {...register("aceitouTermos")} />
          <span>
            <label htmlFor="aceitouTermos">Li e aceito os </label>
            <button type="button" className="link-botao" onClick={() => setModalAberto(true)}>
              termos de uso e a política de privacidade (LGPD)
            </button>
          </span>
        </div>
        {errors.aceitouTermos && (
          <span className="erro-campo" role="alert">{errors.aceitouTermos.message}</span>
        )}

        {erroApi && <p className="erro-api" role="alert">{erroApi}</p>}

        <button type="submit" className="btn-principal" disabled={isSubmitting}>
          {isSubmitting ? "Criando..." : "Cadastrar"}
        </button>
      </form>

      <ModalTermos
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        onAceitar={aceitarPeloModal}
      />
    </>
  );
}