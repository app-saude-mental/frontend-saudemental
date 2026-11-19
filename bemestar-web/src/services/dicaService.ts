import { api } from "./api";
import type { Dica } from "../types/dica";

// o back devolve só as dicas do usuário do token, das mais recentes para as mais antigas
export async function listarDicas(): Promise<Dica[]> {
  const { data } = await api.get<Dica[]>("/dicas");
  return data;
}
