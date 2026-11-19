import { createContext } from "react";

export interface TransicaoContextData {
  /**
   * Cobre a tela com a cortina, executa a ação por trás dela e reabre.
   * mensagem: mostrada enquanto a ação acontece ("Saindo com segurança…").
   * mensagemFinal (opcional): mostrada por um instante depois que a ação termina ("Até logo!").
   */
  comTransicao: (mensagem: string, acao: () => void | Promise<void>, mensagemFinal?: string) => Promise<void>;
}

export const TransicaoContext = createContext<TransicaoContextData | undefined>(undefined);
