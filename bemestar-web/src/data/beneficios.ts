export interface Beneficio {
  texto: string;
  gratuito: boolean; // true = também faz parte do plano gratuito
}

export const BENEFICIOS: Beneficio[] = [
  { texto: "Lorem ipsum dolor sit amet", gratuito: true },
  { texto: "Consectetur adipiscing elit", gratuito: true },
  { texto: "Sed do eiusmod tempor incididunt", gratuito: true },
  { texto: "Ut labore et dolore magna aliqua", gratuito: false },
  { texto: "Ut enim ad minim veniam", gratuito: false },
  { texto: "Quis nostrud exercitation ullamco", gratuito: false },
];