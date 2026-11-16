import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { useTransicao } from "../contexts/useTransicao";
import { getErrorMessage } from "../services/apiError";

interface GoogleButtonProps {
  onErro: (mensagem: string) => void;
}

export default function GoogleButton({ onErro }: GoogleButtonProps) {
  const navigate = useNavigate();
  const { entrarComGoogle } = useAuth();
  const { comTransicao } = useTransicao();

  async function aoSucesso(resposta: CredentialResponse) {
    if (!resposta.credential) {
      onErro("Não foi possível obter as credenciais do Google.");
      return;
    }
    try {
      await entrarComGoogle(resposta.credential);
      await comTransicao("Entrando no seu espaço...", () => navigate("/"));
    } catch (error) {
      onErro(getErrorMessage(error));
    }
  }

  return (
    <div className="google-wrap">
      <GoogleLogin
        onSuccess={aoSucesso}
        onError={() => onErro("Falha ao entrar com o Google. Tente novamente.")}
        text="continue_with"
        shape="pill"
        theme="outline"
        size="large"
        width={300}
      />
      <small className="google-aviso">
        Ao continuar, você concorda com os termos de uso e a política de privacidade.
      </small>
    </div>
  );
}