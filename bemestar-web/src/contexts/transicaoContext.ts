import { createContext } from "react";

export interface TransicaoContextData {
  comTransicao: (mensagem: string, acao: () => void | Promise<void>) => Promise<void>;
}

export const TransicaoContext = createContext<TransicaoContextData | undefined>(undefined);