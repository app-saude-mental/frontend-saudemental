// Espelha DicaResponseDTO do back (GET /dicas devolve uma lista simples, sem paginação)
export interface Dica {
  id: number;
  titulo: string;
  texto: string;
  criadoEm: string;
}
