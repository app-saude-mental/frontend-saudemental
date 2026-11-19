// "Dicas de saúde mental": conteúdo fixo, disponível em todos os planos.
// Textos gerais de autocuidado, sem orientação clínica individual.
// Revisar com o enfermeiro responsável antes de publicar ou ao alterar.

export interface DicaGeral {
  titulo: string;
  texto: string;
}

export const DICAS_GERAIS: DicaGeral[] = [
  {
    titulo: "Respiração 4-6",
    texto: "Inspire pelo nariz contando até 4 e solte o ar devagar contando até 6. Repita cinco vezes.",
  },
  {
    titulo: "Sono tranquilo",
    texto: "Reduza o uso de telas 30 minutos antes de dormir e tente manter horários parecidos todos os dias.",
  },
  {
    titulo: "Fale sobre o que sente",
    texto: "Compartilhar alivia. Você não precisa carregar tudo sozinho: procure alguém de confiança.",
  },
  {
    titulo: "Pausas gentis",
    texto: "A cada hora, levante, alongue o corpo e olhe pela janela por um minuto.",
  },
  {
    titulo: "Movimente-se",
    texto: "Uma caminhada curta já ajuda a aliviar a tensão. Escolha uma atividade de que você goste.",
  },
  {
    titulo: "Peça ajuda quando precisar",
    texto: "Se a angústia estiver forte, procure um profissional de saúde. Em crise, ligue 188 (CVV) — gratuito, 24 horas.",
  },
];
