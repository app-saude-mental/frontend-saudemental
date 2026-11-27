import { useState, type CSSProperties } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Check, Lock, Mail, User } from "lucide-react";
import { cadastroSchema, type CadastroFormData } from "../schemas/authSchemas";
import { cadastrar } from "../services/authService";
import { getErrorCode, getErrorMessage } from "../services/apiError";
import { useAuth } from "../contexts/useAuth";
import { useTransicao } from "../contexts/useTransicao";
import GoogleButton, { type AvisoEntrada } from "./GoogleButton";
import ModalTermos from "./ModalTermos";
import CampoAuth from "./CampoAuth";

// Força da senha só como orientação visual (a regra de verdade é o mínimo do schema e do back)
const NIVEIS = ["Muito curta", "Fraca", "Razoável", "Boa", "Forte"] as const;
function forcaDaSenha(senha: string): number {
  if (senha.length < 6) return 0;
  let pontos = 1;
  if (senha.length >= 10) pontos++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) pontos++;
  if (/\d/.test(senha) && /[^A-Za-z0-9]/.test(senha)) pontos++;
  return Math.min(pontos, 4);
}

export default function FormCadastro() {
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const { comTransicao } = useTransicao();
  const [erroApi, setErroApi] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  // veio redirecionado do login com Google ("você ainda não tem conta")
  const chegada = useLocation().state as AvisoEntrada | null;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: { aceitouTermos: false },
  });

  const senha = useWatch({ control, name: "senha" }) ?? "";
  const forca = forcaDaSenha(senha);

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
      await comTransicao("Criando o seu espaço…", () => navigate("/"), "Conta criada! Respire fundo.");
    } catch (error) {
      // e-mail já tem conta: leva para o login com o e-mail preenchido
      if (getErrorCode(error) === "EMAIL_JA_CADASTRADO") {
        navigate("/login", {
          state: { aviso: "Este e-mail já tem conta no Respire. É só entrar.", email: dados.email } satisfies AvisoEntrada,
        });
        return;
      }
      setErroApi(getErrorMessage(error));
    }
  }

  function aceitarPeloModal() {
    setValue("aceitouTermos", true, { shouldValidate: true });
    setModalAberto(false);
  }

  return (
    <>
      <form className="acesso-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <header className="acesso-form-topo">
          <h1>Crie sua conta</h1>
          <p>Leva menos de um minuto e é grátis.</p>
        </header>

        {chegada?.aviso && (
          <p className="acesso-aviso" role="status">
            {chegada.aviso}
          </p>
        )}

        <GoogleButton intencao="CRIAR" onErro={setErroApi} />
        <div className="acesso-divisor">
          <span>ou com seu e-mail</span>
        </div>

        <CampoAuth
          id="cad-nome"
          rotulo="Como podemos te chamar?"
          placeholder="Seu nome ou apelido"
          Icone={User}
          autoComplete="name"
          erro={errors.nome?.message}
          registro={register("nome")}
        />
        <CampoAuth
          id="cad-email"
          rotulo="E-mail"
          placeholder="voce@email.com"
          Icone={Mail}
          tipo="email"
          autoComplete="email"
          inputMode="email"
          erro={errors.email?.message}
          registro={register("email")}
        />
        <CampoAuth
          id="cad-senha"
          rotulo="Crie uma senha"
          dica={senha.length === 0 ? "Pelo menos 6 caracteres." : undefined}
          Icone={Lock}
          tipo="password"
          autoComplete="new-password"
          erro={errors.senha?.message}
          registro={register("senha")}
        />
        {senha.length > 0 && (
          <div className="acesso-forca" style={{ "--nivel": forca } as CSSProperties} aria-live="polite">
            <span className="acesso-forca-barras" aria-hidden="true">
              {[1, 2, 3, 4].map((n) => (
                <span key={n} className={n <= forca ? "cheia" : ""} />
              ))}
            </span>
            <span className="acesso-forca-texto">Senha: {NIVEIS[forca].toLowerCase()}</span>
          </div>
        )}
        <CampoAuth
          id="cad-confirmar"
          rotulo="Repita a senha"
          Icone={Lock}
          tipo="password"
          autoComplete="new-password"
          erro={errors.confirmarSenha?.message}
          registro={register("confirmarSenha")}
        />

        <div className={`acesso-termos ${errors.aceitouTermos ? "invalido" : ""}`}>
          <input id="aceitouTermos" type="checkbox" {...register("aceitouTermos")} />
          <span className="acesso-termos-caixa" aria-hidden="true">
            <Check size={14} strokeWidth={3} />
          </span>
          <span>
            <label htmlFor="aceitouTermos">Li e aceito os </label>
            <button type="button" className="acesso-link" onClick={() => setModalAberto(true)}>
              termos de uso e a política de privacidade (LGPD)
            </button>
          </span>
        </div>
        {errors.aceitouTermos && (
          <span className="acesso-campo-erro" role="alert">
            {errors.aceitouTermos.message}
          </span>
        )}

        {erroApi && (
          <p className="acesso-erro-api" role="alert">
            {erroApi}
          </p>
        )}

        <button type="submit" className="acesso-enviar" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="acesso-girando" aria-hidden="true" /> Criando sua conta…
            </>
          ) : (
            <>
              Criar minha conta <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>

        <p className="acesso-troca">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>

      <ModalTermos aberto={modalAberto} onFechar={() => setModalAberto(false)} onAceitar={aceitarPeloModal} />
    </>
  );
}
