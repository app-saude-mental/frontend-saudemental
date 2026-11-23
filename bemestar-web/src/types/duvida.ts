// metadados de um arquivo anexado (o conteúdo é baixado à parte, com o token)
export interface Anexo {
  id: number;
  duvidaId: number;
  nome: string;
  tipo: string; // image/jpeg, image/png, image/webp ou application/pdf
  tamanho: number; // bytes
}

export interface Duvida {
  id: number;
  mensagem: string;
  criadoEm: string;
  atualizadoEm: string;
  // resposta do enfermeiro (null enquanto não respondida)
  resposta: string | null;
  respondidaEm: string | null;
  anexos: Anexo[];
}

export interface DuvidaRequest {
  mensagem: string;
}
