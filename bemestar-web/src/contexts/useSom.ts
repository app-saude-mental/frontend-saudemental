import { useContext } from "react";
import { SomContext } from "./somContext";

export function useSom() {
  const contexto = useContext(SomContext);
  if (!contexto) {
    throw new Error("useSom deve ser usado dentro de <SomProvider>");
  }
  return contexto;
}
