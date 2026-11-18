export const HUMORES_VALORES = ["EM_PAZ", "BEM", "FELIZ", "ESTRESSADO", "TRISTE", "ANSIOSO", "BRAVO"] as const;
export type Humor = (typeof HUMORES_VALORES)[number];

export interface Diario {
  id: number;
  humor: Humor | null; // entradas antigas (de antes do humor) vêm sem
  texto: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface DiarioRequest {
  humor: Humor;
  texto: string;
}

export interface Pagina<T> {
  conteudo: T[];
  pagina: number;
  tamanho: number;
  totalElementos: number;
  totalPaginas: number;
}