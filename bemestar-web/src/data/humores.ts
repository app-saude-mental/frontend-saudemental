import type { Humor } from "../types/diario";

export const HUMORES: { valor: Humor; rotulo: string; cor: string }[] = [
  { valor: "EM_PAZ", rotulo: "Em paz", cor: "#6fb5a0" },
  { valor: "BEM", rotulo: "Bem", cor: "#a9c46a" },
  { valor: "NEUTRO", rotulo: "Neutro", cor: "#d8b872" },
  { valor: "CANSADO", rotulo: "Cansado", cor: "#e39a6b" },
  { valor: "TRISTE", rotulo: "Triste", cor: "#8b98a8" },
];

export function buscarHumor(valor: Humor | null) {
  return HUMORES.find((h) => h.valor === valor) ?? null;
}