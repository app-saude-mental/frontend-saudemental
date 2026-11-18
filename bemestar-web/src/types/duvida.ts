export interface Duvida {
  id: number;
  mensagem: string;
  criadoEm: string;
  atualizadoEm: string;
  // Resposta do enfermeiro. O back ainda não envia este campo (fica para o painel
  // do enfermeiro); quando existir, a tela já mostra o texto.
  resposta?: string | null;
}

export interface DuvidaRequest {
  mensagem: string;
}
