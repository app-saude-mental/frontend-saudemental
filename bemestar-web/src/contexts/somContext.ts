import { createContext } from "react";
import type { SomId } from "../data/sonsNatureza";

export type EstadoSom = "parado" | "tocando" | "pausado" | "concluido";

// Som do "Momento de paz" disponível no app inteiro: continua tocando enquanto a pessoa navega.
export interface SomContextData {
  suportado: boolean;
  erro: string | null;
  somId: SomId;
  estado: EstadoSom;
  iniciando: boolean;
  volume: number;
  duracaoMin: number | null; // null = sem limite
  restanteMs: number;
  ciclo: number; // muda a cada início/retomada (reinicia a animação de respiração em fase)
  somLiberado: (id: SomId) => boolean;
  alternar: () => Promise<void>; // começar / pausar / continuar
  parar: () => void;
  escolherSom: (id: SomId) => void;
  escolherDuracao: (minutos: number | null) => void;
  mudarVolume: (valor: number) => void;
}

export const SomContext = createContext<SomContextData | undefined>(undefined);
