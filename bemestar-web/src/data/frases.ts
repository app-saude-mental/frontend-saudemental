// Frase do dia na tela Início: acolhimento curto, sem promessa clínica.
// Muda uma vez por dia (mesma frase o dia inteiro, para todos).
export const FRASES_DO_DIA: string[] = [
  "Você não precisa dar conta de tudo hoje. Um passo de cada vez já é muito.",
  "Respirar fundo também é uma forma de cuidar de si.",
  "Seus sentimentos são válidos, mesmo os que ainda não têm nome.",
  "Descansar não é perder tempo. É recuperar forças.",
  "Pequenos cuidados, repetidos com carinho, mudam dias inteiros.",
  "Tudo bem não estar bem. Pedir ajuda é um ato de coragem.",
  "Hoje, seja gentil com você do jeito que seria com alguém que ama.",
  "O que você sente agora é passageiro. Você já atravessou dias difíceis antes.",
  "Progresso não precisa ser grande para ser real.",
  "Beba um copo de água, olhe pela janela, respire. Recomeçar cabe em um minuto.",
  "Você é mais do que os seus pensamentos mais duros.",
  "Dizer não para o que pesa é dizer sim para você.",
  "A calma não é ausência de tempestade, é saber onde se abrigar.",
  "Celebre o que deu certo hoje, por menor que pareça.",
  "Seu ritmo é o certo para você. Não é corrida.",
  "Cuidar da mente é tão importante quanto cuidar do corpo.",
  "Às vezes, o mais produtivo que você pode fazer é descansar.",
  "Escrever o que sente ajuda a organizar o que pesa por dentro.",
  "Você merece a mesma paciência que oferece aos outros.",
  "Um dia ruim não define uma vida. Amanhã é outra página.",
  "Perceba três coisas boas ao seu redor agora. Elas também são verdade.",
  "Seu valor não depende da sua produtividade.",
  "Sentir é humano. Acolher o que sente é cuidado.",
  "Volte para a respiração sempre que se perder. Ela sempre está aí.",
  "Você não está sozinho, mesmo quando parece.",
  "Pausas também fazem parte do caminho.",
  "O que você planta hoje em cuidado, colhe amanhã em calma.",
  "Seja paciente com o seu processo. Flores não abrem de uma vez.",
  "Agradeça ao seu corpo: ele está com você em cada momento.",
  "Hoje basta fazer o possível. E o possível já é suficiente.",
];

// índice estável por dia do ano
export function fraseDeHoje(data = new Date()): string {
  const inicio = new Date(data.getFullYear(), 0, 0);
  const dia = Math.floor((data.getTime() - inicio.getTime()) / 86_400_000);
  return FRASES_DO_DIA[dia % FRASES_DO_DIA.length];
}
