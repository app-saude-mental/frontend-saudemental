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

/**
 * Explicação de cada plano (botão "i" no cartão da tela Planos).
 * Atenção ao texto do Paciente: o enfermeiro vê hábitos, medicamentos e dúvidas,
 * mas NUNCA o diário (regra de LGPD garantida no back por teste).
 */
export const DETALHES_PLANO = {
  gratuito: {
    titulo: "Plano Gratuito",
    resumo:
      "Este é o plano padrão de quem cria uma conta. Ele reúne o essencial para cuidar de você no dia a dia, com algumas atividades limitadas.",
    itens: [
      "Momento de paz com 6 sons: um de cada tipo (natureza, meditar, dormir, concentração e ruído sensorial).",
      "Diário de emoções e humor.",
      "Checklist diário de hábitos.",
      "Dicas gerais de saúde mental.",
    ],
    rodape: "Sem custo e sem prazo para acabar.",
  },
  assinante: {
    titulo: "Premium Assinante",
    resumo:
      "Para você que ainda não passou por uma consulta com o enfermeiro e quer ter acesso aos recursos premium.",
    itens: [
      "Tudo o que o plano Gratuito oferece.",
      "Todos os 22 sons liberados: natureza, meditação, sono, concentração e ruído sensorial.",
      "Organização dos seus medicamentos por horário do dia, para manter uma rotina em ordem.",
    ],
    rodape: "R$ 30 por mês, pago por PIX e liberado pelo enfermeiro.",
  },
  paciente: {
    titulo: "Premium Paciente",
    resumo:
      "Você adquire este plano depois de passar por uma consulta com o enfermeiro. Ele inclui tudo do app, e o diferencial é o contato direto com o enfermeiro.",
    itens: [
      "Tudo o que o Premium Assinante oferece.",
      "Dúvidas respondidas diretamente pelo enfermeiro.",
      "Um espaço de orientações de bem-estar, em que o enfermeiro acompanha você no dia a dia com base nos registros que ele pode ver: hábitos, medicamentos e dúvidas.",
    ],
    rodape:
      "O valor é combinado na consulta. Seu diário emocional continua visível só para você.",
  },
} as const;

export type ChavePlano = keyof typeof DETALHES_PLANO;
