import { useContext } from "react";
import { TransicaoContext } from "./transicaoContext";

export function useTransicao() {
  const contexto = useContext(TransicaoContext);
  if (!contexto) {
    throw new Error("useTransicao deve ser usado dentro de <TransicaoProvider>");
  }
  return contexto;
}