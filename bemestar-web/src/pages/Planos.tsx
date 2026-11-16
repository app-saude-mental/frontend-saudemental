import { useState } from "react";
import { Crown, Leaf } from "lucide-react";
import PlanoCard from "../components/PlanoCard";
import { useAuth } from "../contexts/useAuth";
import { BENEFICIOS } from "../data/beneficios";

export default function Planos() {
  const { usuario } = useAuth();
  const [aviso, setAviso] = useState<string | null>(null);

  if (!usuario) return null;

  const primeiroNome = usuario.nome.trim().split(" ")[0];
  const ehPremium = usuario.plano === "PREMIUM";
  // Premium sem acesso liberado = assinatura vencida (regra do seu back)
  const assinaturaInativa = ehPremium && !usuario.acessoLiberado;

  function escolherPremium() {
    setAviso("O pagamento ainda não está disponível. Em breve você poderá assinar por aqui.");
  }

  return (
    <section>
      <header className="planos-topo">
        <h1 className="planos-ola">Olá, {primeiroNome}</h1>
        <p className="planos-seu">
          Seu plano <span className="selo-plano">{ehPremium ? "Premium" : "Gratuito"}</span>
        </p>
        <p className="planos-sub">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Escolha o plano que cabe melhor
          na sua rotina.
        </p>
      </header>

      {assinaturaInativa && (
        <p className="aviso alerta" role="alert">
          Sua assinatura Premium está inativa. Renove para voltar a usar os benefícios.
        </p>
      )}
      {aviso && (
        <p className="aviso" role="status">
          {aviso}
        </p>
      )}

      <div className="planos-grid">
        <PlanoCard
          nome="Gratuito"
          subtitulo="Lorem ipsum dolor sit amet, consectetur."
          preco={0}
          icone={<Leaf size={24} />}
          beneficios={BENEFICIOS.map((b) => ({ texto: b.texto, incluso: b.gratuito }))}
          atual={!ehPremium}
          rotuloBotao={!ehPremium ? "Seu plano atual" : "Plano básico"}
          desabilitado
        />

        <PlanoCard
          nome="Premium"
          subtitulo="Sed ut perspiciatis unde omnis iste natus."
          preco={25}
          destaque
          icone={<Crown size={24} />}
          beneficios={BENEFICIOS.map((b) => ({ texto: b.texto, incluso: true }))}
          atual={ehPremium}
          rotuloBotao={
            !ehPremium ? "Quero ser Premium" : assinaturaInativa ? "Renovar assinatura" : "Seu plano atual"
          }
          desabilitado={ehPremium && !assinaturaInativa}
          onEscolher={escolherPremium}
        />
      </div>
    </section>
  );
}