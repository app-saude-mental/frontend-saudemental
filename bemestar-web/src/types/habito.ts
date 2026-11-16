export type Habito = "HOBBY" | "MEDITACAO" | "TERAPIA" | "CONVERSA" | "ESPORTE" | "ALIMENTACAO" | "GRATIDAO"

export interface HabitoStatus {
  habito: Habito;
  texto: string;
  concluido: boolean;
}

// espelha o HabitosDiaResponseDTO do back
export interface HabitosDia {
  data: string; // "2026-11-16"
  habitos: HabitoStatus[];
  concluidos: number;
  total: number;
}