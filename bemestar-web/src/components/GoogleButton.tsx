import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useTransicao } from "../contexts/useTransicao";
import { getErrorCode, getErrorMessage } from "../services/apiError";
import type { IntencaoGoogle } from "../services/authService";

interface GoogleButtonProps {
  intencao: IntencaoGoogle; // tela de onde a pessoa clicou
  onErro: (mensagem: string) => void;
}

// Estado que a tela de login/cadastro lê para mostrar o aviso ao chegar
export interface AvisoEntrada {
  aviso: string;
  email?: string;
}

export default function GoogleButton({ intencao, onErro }: GoogleButtonProps) {
  const navigate = useNavigate();
  const { entrarComGoogle } = useAuth();
  const { comTransicao } = useTransicao();
  const criando = intencao === "CRIAR";

  async function aoSucesso(resposta: CredentialResponse) {
    if (!resposta.credential) {
      onErro("Não foi possível obter as credenciais do Google.");
      return;
    }
    try {
      await entrarComGoogle(resposta.credential, intencao);
      await comTransicao(
        criando ? "Criando o seu espaço…" : "Preparando o seu espaço…",
        () => navigate("/"),
        criando ? "Conta criada! Respire fundo." : "Bem-vindo de volta!",
      );
    } catch (error) {
      const codigo = getErrorCode(error);
      // tela errada: leva para a certa, explicando o porquê
      if (codigo === "CONTA_JA_EXISTE") {
        navigate("/login", { state: { aviso: "Você já tem conta no Respire. Entre com o Google aqui." } satisfies AvisoEntrada });
        return;
      }
      if (codigo === "CONTA_NAO_ENCONTRADA") {
        navigate("/cadastro", {
          state: { aviso: "Você ainda não tem conta. Crie a sua aqui, é rapidinho." } satisfies AvisoEntrada,
        });
        return;
      }
      onErro(getErrorMessage(error));
    }
  }

  return (
    <div className="google-wrap">
      <GoogleLogin
        onSuccess={aoSucesso}
        onError={() => onErro("Falha ao entrar com o Google. Tente novamente.")}
        text={criando ? "signup_with" : "signin_with"}
        shape="pill"
        theme="outline"
        size="large"
        width={320}
      />
      {criando && (
        <small className="google-aviso">
          Ao continuar, você aceita os termos de uso e a privacidade.
        </small>
      )}
    </div>
  );
}
