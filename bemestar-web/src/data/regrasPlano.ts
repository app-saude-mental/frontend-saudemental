/**
 * TODOS os textos das regras comerciais dos planos ficam aqui, para revisão fácil.
 *
 * Direito de arrependimento: art. 49 do Código de Defesa do Consumidor — 7 dias para
 * desistir de compra feita fora do estabelecimento (como pela internet), com devolução
 * do valor pago. O prazo é controlado pelo back (app.plano.arrependimento-dias).
 * Recomenda-se revisão jurídica antes de publicar.
 */

export const REGRAS_PLANO = {
  titulo: "Como funciona o plano Premium",
  itens: [
    "O plano é mensal: vale por 30 dias a partir da liberação pelo enfermeiro.",
    "Premium Assinante: R$ 30 por mês. Premium Paciente: valor combinado na consulta com o enfermeiro.",
    "O pagamento é feito por PIX, na chave mostrada no app. Depois, avise o enfermeiro pelo app ou pelo WhatsApp.",
    "O enfermeiro confere se o PIX caiu e libera o seu plano. A liberação não é imediata.",
    "Não pedimos dados bancários nem comprovante.",
    "A renovação também é manual: faça um novo PIX e avise; o enfermeiro libera mais 30 dias.",
    "Sem renovação, ao fim dos 30 dias sua conta volta automaticamente ao plano Gratuito. Seus registros continuam guardados.",
    "Direito de arrependimento: você pode desistir em até 7 dias depois da liberação (ou da renovação) e receber de volta o valor pago (art. 49 do Código de Defesa do Consumidor).",
    "Depois desse prazo, o plano segue até o vencimento, sem reembolso proporcional, e não renova sozinho.",
  ],
  paciente:
    "O Premium Paciente inclui o acompanhamento do enfermeiro. O valor é combinado na consulta com ele; depois é só pagar pelo PIX e avisar.",
  confirmacao: "Li e entendi como funciona o plano, inclusive o direito de arrependimento.",
} as const;

export const TEXTOS_ASSINATURA = {
  aguardando:
    "Recebemos seu aviso. O enfermeiro vai conferir o PIX e liberar o seu plano. Use \"Atualizar status\" para ver a liberação.",
} as const;

export const TEXTOS_ARREPENDIMENTO = {
  titulo: "Direito de arrependimento",
  explicacao: (ate: string) =>
    `Você pode desistir deste plano até ${ate} e receber de volta o valor pago. O enfermeiro devolve o PIX e encerra o plano.`,
  botao: "Desistir do plano",
  confirmarTitulo: "Desistir do plano?",
  confirmarDescricao:
    "Seu pedido vai para o enfermeiro. Ele devolve o valor pelo mesmo PIX e o plano volta ao Gratuito. Seus registros continuam guardados.",
  enviado: "Pedido de desistência enviado. O enfermeiro vai devolver o PIX e encerrar o plano.",
  pendente: "Seu pedido de desistência está com o enfermeiro.",
} as const;
