export interface Duvida {
  id: number;
  mensagem: string;
  criadoEm: string;
  atualizadoEm: string;
  // resposta do enfermeiro (null enquanto não respondida)
  resposta: string | null;
  respondidaEm: string | null;
}

export interface DuvidaRequest {
  mensagem: string;
}
