import { useEffect, useRef } from "react";

interface ModalTermosProps {
  aberto: boolean;
  onFechar: () => void;
  onAceitar: () => void;
}

export default function ModalTermos({ aberto, onFechar, onAceitar }: ModalTermosProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  // Sincroniza o estado "aberto" do React com o <dialog> do navegador
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (aberto && !dialog.open) dialog.showModal();
    if (!aberto && dialog.open) dialog.close();
  }, [aberto]);

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onClose={onFechar} // dispara também quando o usuário aperta ESC
      onClick={(e) => {
        // clique no fundo escurecido (o alvo é o próprio <dialog>) fecha o modal
        if (e.target === e.currentTarget) onFechar();
      }}
    >
      <div className="modal-corpo">
        <header className="modal-topo">
          <h2>Termos de uso e privacidade (LGPD)</h2>
        </header>

        <div className="modal-texto">
          <p className="modal-aviso">
            Resumo em linguagem simples de como tratamos seus dados, conforme a Lei Geral de
            Proteção de Dados (Lei nº 13.709/2018).
          </p>

          <h3>1. Quem é o responsável</h3>
          <p>
            [Nome do responsável/empresa] é o controlador dos seus dados. Contato para assuntos de
            privacidade: [e-mail de contato].
          </p>

          <h3>2. Quais dados coletamos</h3>
          <ul>
            <li>Dados de cadastro: nome e e-mail.</li>
            <li>Senha: guardada de forma criptografada, nunca em texto puro.</li>
            <li>
              Informações que você registrar no aplicativo, que podem incluir dados sobre seu
              bem-estar emocional e sua saúde. A LGPD classifica esses dados como{" "}
              <strong>dados pessoais sensíveis</strong>, que exigem cuidado extra.
            </li>
          </ul>

          <h3>3. Para que usamos</h3>
          <p>
            Para criar e manter sua conta, autenticar seu acesso, oferecer as funcionalidades do
            aplicativo e manter o serviço seguro. [Descreva outras finalidades, se houver.]
          </p>

          <h3>4. Seu consentimento</h3>
          <p>
            Ao marcar a caixa de aceite, você consente, de forma específica e destacada, com o
            tratamento dos dados descritos acima para as finalidades informadas. Você pode revogar
            esse consentimento a qualquer momento.
          </p>

          <h3>5. Compartilhamento</h3>
          <p>
            [Informe com quem os dados podem ser compartilhados, por exemplo provedores de
            hospedagem e infraestrutura, e em quais situações.]
          </p>

          <h3>6. Seus direitos</h3>
          <p>Você pode, a qualquer momento, solicitar:</p>
          <ul>
            <li>confirmação de que tratamos seus dados e acesso a eles;</li>
            <li>correção de dados incompletos ou desatualizados;</li>
            <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
            <li>portabilidade dos dados;</li>
            <li>informação sobre com quem compartilhamos seus dados;</li>
            <li>revogação do consentimento e eliminação da sua conta.</li>
          </ul>

          <h3>7. Segurança e guarda</h3>
          <p>
            Adotamos medidas técnicas para proteger seus dados. Eles ficam armazenados enquanto sua
            conta estiver ativa [ou informe outro prazo].
          </p>
        </div>

        <footer className="modal-rodape">
          <button type="button" className="btn-secundario" onClick={onFechar}>
            Fechar
          </button>
          <button type="button" className="btn-principal" onClick={onAceitar}>
            Li e aceito
          </button>
        </footer>
      </div>
    </dialog>
  );
}