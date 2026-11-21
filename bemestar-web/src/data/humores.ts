import type { Humor } from "../types/diario";

interface HumorInfo {
  valor: Humor;
  rotulo: string;
  cor: string;
  frase: string; // frase de acolhimento mostrada quando a pessoa escolhe este humor
}

export const HUMORES: HumorInfo[] = [
  {
    valor: "EM_PAZ",
    rotulo: "Em paz",
    cor: "#7fa596",
    frase:
      "Respire… que bom estar em paz. Guarde este momento com carinho: ele mostra que você sabe encontrar calma. Que tal registrar o que ajudou você a chegar aqui?",
  },
  {
    valor: "BEM",
    rotulo: "Bem",
    cor: "#a3b382",
    frase:
      "Respire… estar bem é um presente. Aproveite esse equilíbrio, agradeça por ele e lembre-se de que cuidar de si nos dias bons também fortalece os dias difíceis.",
  },
  {
    valor: "FELIZ",
    rotulo: "Feliz",
    cor: "#d8bd78",
    frase:
      "Respire… que alegria sentir isso! Permita-se aproveitar cada instante e, se quiser, compartilhe essa felicidade com alguém especial ou escreva o que a trouxe até você.",
  },
  {
    valor: "TRISTE",
    rotulo: "Triste",
    cor: "#8d98a3",
    frase:
      "Respire… estar triste é um sentimento comum, todos nós ficamos tristes em algum momento. Contudo, como todo sentimento, ele é passageiro… Que tal se permitir sentir isso, realizar uma meditação e descansar sua mente?",
  },
  {
    valor: "ANSIOSO",
    rotulo: "Ansioso",
    cor: "#a99ec0",
    frase:
      "Respire… a ansiedade aparece quando a mente corre mais rápido que o momento. Inspire devagar, solte o ar e volte sua atenção para o agora. Um passo de cada vez já é suficiente.",
  },
  {
    valor: "ESTRESSADO",
    rotulo: "Estressado",
    cor: "#cf9d7c",
    frase:
      "Respire… o estresse mostra que você tem carregado muito peso. Faça uma pausa, alongue o corpo, tome um copo de água e lembre-se de que nem tudo precisa ser resolvido agora.",
  },
  {
    valor: "BRAVO",
    rotulo: "Bravo",
    cor: "#c07f75",
    frase:
      "Respire… sentir raiva também faz parte de ser humano. Antes de agir, inspire fundo e conte até dez. Escrever sobre o que incomodou pode ajudar a acalmar a mente e organizar os pensamentos.",
  },
];

export function buscarHumor(valor: Humor | null) {
  return HUMORES.find((h) => h.valor === valor) ?? null;
}
